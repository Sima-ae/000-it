import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cleanSourceSummary } from "@/lib/auto-news/generate";
import {
  ensureNewsCoverImage,
  featuredCoverUrl,
} from "@/lib/auto-news/cover-image";
import {
  buildNewsTranslationsFromEnglish,
  isNewsDescriptionStub,
  looksLikeEnglishNewsCopy,
  newsCopyLooksComplete,
  nlFromTranslations,
  parseNewsTranslations,
  type NewsTranslationsMap,
} from "@/lib/news-i18n";
import {
  removeLocalNewsCover,
  type NewsDeletedReason,
} from "@/lib/news-retention";

export type NewsPost = {
  id: string;
  title: string;
  titleNl: string | null;
  excerpt: string;
  excerptNl: string | null;
  date: string;
  coverImage?: string | null;
  description: string;
  descriptionNl: string | null;
  translations: NewsTranslationsMap;
  author: string;
  projectUrl?: string | null;
  industry?: string | null;
  tags: string[];
  createdById?: string | null;
  published?: boolean;
  deletedAt?: string | null;
  deletedReason?: NewsDeletedReason | string | null;
  retentionExempt?: boolean;
};

const localeCopySchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  description: z.string(),
});

const newsSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1),
  titleNl: z.string().nullable().optional(),
  excerpt: z.string().min(1),
  excerptNl: z.string().nullable().optional(),
  date: z.string().min(1),
  coverImage: z.string().nullable().optional(),
  description: z.string().min(1),
  descriptionNl: z.string().nullable().optional(),
  translations: z.record(z.string(), localeCopySchema).optional(),
  author: z.string().min(1),
  projectUrl: z.string().nullable().optional(),
  industry: z.string().optional(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().optional(),
  /** When true (default on create), auto-fill missing locale translations from English. */
  autoTranslate: z.boolean().optional(),
});

export const newsUpsertSchema = newsSchema;

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return [];
}

function mapNews(row: {
  id: string;
  title: string;
  titleNl: string | null;
  excerpt: string;
  excerptNl: string | null;
  date: string;
  coverImage: string | null;
  description: string;
  descriptionNl: string | null;
  translations?: unknown;
  author: string;
  projectUrl: string | null;
  industry: string | null;
  tags: unknown;
  createdById: string | null;
  published: boolean;
  deletedAt?: Date | null;
  deletedReason?: string | null;
  retentionExempt?: boolean;
}): NewsPost {
  const translations = parseNewsTranslations(row.translations);
  // Mirror legacy *Nl into translations.nl when missing (never invent EN as "nl").
  if (!translations.nl && (row.titleNl || row.excerptNl || row.descriptionNl)) {
    translations.nl = {
      title: row.titleNl || row.title,
      excerpt: row.excerptNl || row.excerpt,
      description: row.descriptionNl || "",
    };
  } else if (translations.nl && row.descriptionNl?.trim()) {
    // Prefer dedicated descriptionNl over a stale EN echo in translations.nl
    const mapDesc = translations.nl.description?.trim() || "";
    const colDesc = row.descriptionNl.trim();
    const enDesc = row.description.trim();
    if (
      colDesc &&
      colDesc.localeCompare(enDesc, undefined, { sensitivity: "accent" }) !== 0 &&
      (mapDesc.localeCompare(enDesc, undefined, { sensitivity: "accent" }) === 0 ||
        !mapDesc)
    ) {
      translations.nl = { ...translations.nl, description: colDesc };
    }
  }

  return {
    id: row.id,
    title: row.title,
    titleNl: row.titleNl,
    excerpt: cleanSourceSummary(row.excerpt),
    excerptNl: row.excerptNl ? cleanSourceSummary(row.excerptNl) : row.excerptNl,
    date: row.date,
    coverImage: featuredCoverUrl(row.id, row.coverImage),
    description: cleanSourceSummary(row.description),
    descriptionNl: row.descriptionNl
      ? cleanSourceSummary(row.descriptionNl)
      : row.descriptionNl,
    translations,
    author: row.author,
    projectUrl: row.projectUrl,
    industry: row.industry || "",
    tags: asStringArray(row.tags),
    createdById: row.createdById,
    published: row.published,
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    deletedReason: row.deletedReason ?? null,
    retentionExempt: row.retentionExempt ?? false,
  };
}

/**
 * Resolve canonical EN (+ translations) to the active locale.
 * Dutch (`nl`) is the site default and prefers dedicated *Nl columns.
 * Never prefer a translation that is still an English echo when a real *Nl body exists.
 */
export function localizeNewsPost(post: NewsPost, locale: string): NewsPost {
  const en = {
    title: post.title,
    excerpt: cleanSourceSummary(post.excerpt),
    description: cleanSourceSummary(post.description),
  };

  if (locale === "en") {
    return { ...post, ...en };
  }

  const sameAsEn = (value: string, enValue: string) =>
    value.trim().localeCompare(enValue.trim(), undefined, {
      sensitivity: "accent",
    }) === 0;

  const usable = (value: string, fallback: string) => {
    if (!value) return false;
    if (sameAsEn(value, fallback)) return false;
    if (looksLikeEnglishNewsCopy(value, locale)) return false;
    // Prefer full EN over leftover "check original source" stubs.
    if (isNewsDescriptionStub(value) && fallback.length > 80) return false;
    return true;
  };

  const pickField = (
    primary: string | null | undefined,
    secondary: string | null | undefined,
    fallback: string,
  ) => {
    const a = primary?.trim() || "";
    const b = secondary?.trim() || "";
    if (usable(a, fallback)) return a;
    if (usable(b, fallback)) return b;
    if ((isNewsDescriptionStub(a) || isNewsDescriptionStub(b)) && fallback) {
      return fallback;
    }
    return a || b || fallback;
  };

  // NL first: titleNl/excerptNl/descriptionNl are the curated/default columns.
  if (locale === "nl") {
    const fromMap = post.translations?.nl;
    return {
      ...post,
      title: pickField(post.titleNl, fromMap?.title, en.title),
      excerpt: cleanSourceSummary(
        pickField(post.excerptNl, fromMap?.excerpt, en.excerpt),
      ),
      description: cleanSourceSummary(
        pickField(post.descriptionNl, fromMap?.description, en.description),
      ),
    };
  }

  const fromMap = post.translations?.[locale];
  if (fromMap?.title?.trim()) {
    const title = fromMap.title.trim();
    const excerpt = pickField(fromMap.excerpt, null, en.excerpt);
    const description = pickField(fromMap.description, null, en.description);
    return {
      ...post,
      title,
      excerpt: cleanSourceSummary(excerpt),
      description: cleanSourceSummary(description),
    };
  }

  // Unknown / incomplete locale → English fallback
  return { ...post, ...en };
}

/**
 * Tags shown on public article pages.
 * Hides internal auto-news markers and feed ids like "techcrunch-ai".
 * Keeps source brand names (e.g. TechCrunch) and topic tags (AI, Google, …).
 */
export function publicNewsTags(tags: string[] | null | undefined): string[] {
  return (tags || [])
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((tag) => {
      const lower = tag.toLowerCase();
      if (lower === "auto-news") return false;
      // Feed source ids: techcrunch-ai, google-ai, theverge-ai, arxiv-ai, …
      if (/^[a-z0-9]+(?:-[a-z0-9]+)*-ai$/i.test(tag)) return false;
      return true;
    });
}

export const NEWS_PAGE_SIZE = 21;

const notTrashed = { deletedAt: null } as const;

export async function listNewsPosts(opts?: {
  all?: boolean;
  locale?: string;
  trashed?: boolean;
}) {
  const where = opts?.trashed
    ? { deletedAt: { not: null } }
    : opts?.all
      ? notTrashed
      : { published: true, ...notTrashed };
  const rows = await prisma.newsPost.findMany({
    where,
    orderBy: opts?.trashed
      ? [{ deletedAt: "desc" }, { date: "desc" }]
      : [{ date: "desc" }, { createdAt: "desc" }],
  });
  const mapped = rows.map(mapNews);
  if (!opts?.locale) return mapped;
  return mapped.map((post) => localizeNewsPost(post, opts.locale!));
}

export async function listNewsPostsPage(opts: {
  locale?: string;
  page?: number;
  pageSize?: number;
  all?: boolean;
}) {
  const pageSize = Math.max(1, opts.pageSize ?? NEWS_PAGE_SIZE);
  const page = Math.max(1, opts.page ?? 1);
  const where = opts.all
    ? notTrashed
    : { published: true, ...notTrashed };

  const [total, rows] = await Promise.all([
    prisma.newsPost.count({ where }),
    prisma.newsPost.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  // If requested page is past the end, refetch the last page.
  const pageRows =
    safePage === page
      ? rows
      : await prisma.newsPost.findMany({
          where,
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
          skip: (safePage - 1) * pageSize,
          take: pageSize,
        });

  let items = pageRows.map(mapNews);
  if (opts.locale) {
    items = items.map((post) => localizeNewsPost(post, opts.locale!));
  }

  return {
    items,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export async function getNewsPost(
  id: string,
  locale?: string,
  opts?: { includeTrashed?: boolean },
) {
  const row = await prisma.newsPost.findUnique({ where: { id } });
  if (!row) return null;
  if (row.deletedAt && !opts?.includeTrashed) return null;
  const mapped = mapNews(row);
  return locale ? localizeNewsPost(mapped, locale) : mapped;
}

export async function getPublishedNewsPost(id: string, locale?: string) {
  const row = await prisma.newsPost.findFirst({
    where: { id, published: true, ...notTrashed },
  });
  if (!row) return null;
  const mapped = mapNews(row);
  return locale ? localizeNewsPost(mapped, locale) : mapped;
}

export async function listPublishedNewsIds() {
  return prisma.newsPost.findMany({
    where: { published: true, ...notTrashed },
    select: { id: true, date: true, updatedAt: true },
    orderBy: [{ date: "desc" }, { updatedAt: "desc" }],
  });
}

async function ensureTranslationsForPost(input: {
  title: string;
  excerpt: string;
  description: string;
  titleNl?: string | null;
  excerptNl?: string | null;
  descriptionNl?: string | null;
  translations?: NewsTranslationsMap;
  autoTranslate?: boolean;
}): Promise<{
  translations: NewsTranslationsMap;
  titleNl: string | null;
  excerptNl: string | null;
  descriptionNl: string | null;
}> {
  const en = {
    title: input.title,
    excerpt: input.excerpt,
    description: input.description,
  };

  let translations: NewsTranslationsMap = {
    ...(input.translations || {}),
  };

  if (input.titleNl || input.excerptNl || input.descriptionNl) {
    translations.nl = {
      title: input.titleNl?.trim() || translations.nl?.title || en.title,
      excerpt: input.excerptNl?.trim() || translations.nl?.excerpt || en.excerpt,
      description:
        input.descriptionNl?.trim() || translations.nl?.description || en.description,
    };
  }

  const shouldTranslate = input.autoTranslate !== false;
  if (shouldTranslate) {
    translations = await buildNewsTranslationsFromEnglish(en, {
      existing: translations,
      delayMs: 300,
      locales: ["nl"],
    });
  }

  const nl = nlFromTranslations(translations, en);
  return {
    translations,
    titleNl: nl.title,
    excerptNl: nl.excerpt,
    descriptionNl: nl.description,
  };
}

export async function createNewsPost(
  data: z.infer<typeof newsUpsertSchema> & { id: string; createdById?: string | null },
) {
  const en = {
    title: data.title,
    excerpt: data.excerpt,
    description: data.description,
  };

  // Always secure Dutch first (site default), then insert so publish is not blocked.
  let translations = parseNewsTranslations(data.translations);
  if (data.titleNl || data.excerptNl || data.descriptionNl) {
    translations.nl = {
      title: data.titleNl?.trim() || translations.nl?.title || "",
      excerpt: data.excerptNl?.trim() || translations.nl?.excerpt || "",
      description:
        data.descriptionNl?.trim() || translations.nl?.description || "",
    };
  }

  if (!newsCopyLooksComplete(translations.nl, en, "nl")) {
    translations = await buildNewsTranslationsFromEnglish(en, {
      existing: translations,
      locales: ["nl"],
      delayMs: 200,
    });
  }

  // Never persist English echoes into dedicated NL columns.
  const nlRaw = translations.nl;
  const titleNl =
    nlRaw?.title?.trim() &&
    nlRaw.title.localeCompare(en.title, undefined, { sensitivity: "accent" }) !== 0 &&
    !looksLikeEnglishNewsCopy(nlRaw.title, "nl")
      ? nlRaw.title.trim()
      : null;
  const excerptNl =
    nlRaw?.excerpt?.trim() &&
    nlRaw.excerpt.localeCompare(en.excerpt, undefined, { sensitivity: "accent" }) !== 0 &&
    !looksLikeEnglishNewsCopy(nlRaw.excerpt, "nl")
      ? nlRaw.excerpt.trim()
      : null;
  const descriptionNl =
    nlRaw?.description?.trim() &&
    !isNewsDescriptionStub(nlRaw.description) &&
    nlRaw.description.localeCompare(en.description, undefined, {
      sensitivity: "accent",
    }) !== 0 &&
    !looksLikeEnglishNewsCopy(nlRaw.description, "nl")
      ? nlRaw.description.trim()
      : null;
  if (!newsCopyLooksComplete(translations.nl, en, "nl")) {
    delete translations.nl;
  }

  const coverInput = {
    id: data.id,
    title: data.title,
    industry: data.industry,
    excerpt: data.excerpt,
  };
  let coverImage = data.coverImage?.trim() || "";
  if (!coverImage) {
    coverImage = await ensureNewsCoverImage(coverInput, { download: false });
    void ensureNewsCoverImage(coverInput, {
      force: true,
      download: true,
      retries: 4,
      delayMs: 1500,
    })
      .then(async (url) => {
        if (!url || url === coverImage) return;
        await prisma.newsPost.update({
          where: { id: data.id },
          data: { coverImage: url },
        });
      })
      .catch((error) =>
        console.warn(
          "[news] cover upgrade failed",
          data.id,
          error instanceof Error ? error.message : error,
        ),
      );
  }

  const row = await prisma.newsPost.create({
    data: {
      id: data.id,
      title: data.title,
      titleNl,
      excerpt: data.excerpt,
      excerptNl,
      date: data.date,
      coverImage,
      description: data.description,
      descriptionNl,
      translations,
      author: data.author,
      projectUrl: data.projectUrl || null,
      industry: data.industry || null,
      tags: data.tags ?? [],
      published: data.published ?? true,
      createdById: data.createdById || null,
    },
  });

  // Expand to all other languages after insert (best-effort, resumed by cron).
  if (data.autoTranslate !== false) {
    void completeNewsTranslations(row.id).catch((error) =>
      console.warn(
        "[news] multi-locale fill after create failed",
        row.id,
        error instanceof Error ? error.message : error,
      ),
    );
  }

  return mapNews(row);
}

/** Fill every missing locale for a news post from the English source. */
export async function completeNewsTranslations(
  id: string,
  opts?: { force?: boolean; deadlineMs?: number },
) {
  const row = await prisma.newsPost.findUnique({ where: { id } });
  if (!row || row.deletedAt) return null;

  const en = {
    title: row.title,
    excerpt: row.excerpt,
    description: row.description,
  };
  const existing = parseNewsTranslations(row.translations);
  // Prefer curated NL columns when the JSON map is stale/English.
  if (row.titleNl || row.excerptNl || row.descriptionNl) {
    const colNl = {
      title: row.titleNl?.trim() || existing.nl?.title || "",
      excerpt: row.excerptNl?.trim() || existing.nl?.excerpt || "",
      description: row.descriptionNl?.trim() || existing.nl?.description || "",
    };
    if (
      !newsCopyLooksComplete(existing.nl, en, "nl") ||
      newsCopyLooksComplete(colNl, en, "nl")
    ) {
      existing.nl = colNl;
    }
  }
  const preserveNl = newsCopyLooksComplete(existing.nl, en, "nl");
  const full = await buildNewsTranslationsFromEnglish(en, {
    existing,
    delayMs: 300,
    force: opts?.force,
    deadlineMs: opts?.deadlineMs,
    preserveLocales: preserveNl ? ["nl"] : [],
  });
  const nlFull = nlFromTranslations(full, en);
  // Only write NL columns when they are real Dutch — avoid re-poisoning with EN.
  const nlOk = newsCopyLooksComplete(full.nl, en, "nl");
  const updated = await prisma.newsPost.update({
    where: { id },
    data: {
      translations: full,
      ...(nlOk
        ? {
            titleNl: nlFull.title,
            excerptNl: nlFull.excerpt,
            descriptionNl: nlFull.description,
          }
        : {}),
    },
  });
  return mapNews(updated);
}

export async function updateNewsPost(
  id: string,
  data: Partial<z.infer<typeof newsUpsertSchema>> & { createdById?: string | null },
) {
  const existing = await prisma.newsPost.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) throw new Error("News post not found");

  const title = data.title ?? existing.title;
  const excerpt = data.excerpt ?? existing.excerpt;
  const description = data.description ?? existing.description;
  const industry = data.industry !== undefined ? data.industry : existing.industry;
  let coverImage =
    data.coverImage !== undefined ? data.coverImage : existing.coverImage;
  if (!coverImage?.trim()) {
    coverImage = await ensureNewsCoverImage(
      { id, title, excerpt, industry },
      { download: false },
    );
  }

  const i18n = await ensureTranslationsForPost({
    title,
    excerpt,
    description,
    titleNl: data.titleNl !== undefined ? data.titleNl : existing.titleNl,
    excerptNl: data.excerptNl !== undefined ? data.excerptNl : existing.excerptNl,
    descriptionNl:
      data.descriptionNl !== undefined ? data.descriptionNl : existing.descriptionNl,
    translations:
      (data.translations as NewsTranslationsMap | undefined) ||
      parseNewsTranslations(existing.translations),
    // Edits re-translate every locale when explicitly requested.
    autoTranslate: data.autoTranslate === true,
  });

  const row = await prisma.newsPost.update({
    where: { id },
    data: {
      title: data.title,
      titleNl: i18n.titleNl,
      excerpt: data.excerpt,
      excerptNl: i18n.excerptNl,
      date: data.date,
      coverImage,
      description: data.description,
      descriptionNl: i18n.descriptionNl,
      translations: i18n.translations,
      author: data.author,
      projectUrl: data.projectUrl,
      industry: data.industry,
      tags: data.tags,
      published: data.published,
      createdById: data.createdById === undefined ? undefined : data.createdById,
    },
  });

  if (data.autoTranslate === true) {
    void completeNewsTranslations(id, { force: true }).catch((error) =>
      console.warn(
        "[news] multi-locale fill after update failed",
        id,
        error instanceof Error ? error.message : error,
      ),
    );
  }

  return mapNews(row);
}

export async function trashNewsPost(id: string, reason: NewsDeletedReason = "manual") {
  const row = await prisma.newsPost.findUnique({ where: { id } });
  if (!row) return null;
  if (row.deletedAt) return mapNews(row);
  const updated = await prisma.newsPost.update({
    where: { id },
    data: { deletedAt: new Date(), deletedReason: reason },
  });
  return mapNews(updated);
}

export async function restoreNewsPost(id: string) {
  const row = await prisma.newsPost.findUnique({ where: { id } });
  if (!row?.deletedAt) return null;
  const updated = await prisma.newsPost.update({
    where: { id },
    data: {
      deletedAt: null,
      deletedReason: null,
      retentionExempt: true,
    },
  });
  return mapNews(updated);
}

export async function permanentlyDeleteNewsPost(id: string) {
  const row = await prisma.newsPost.findUnique({ where: { id } });
  if (!row?.deletedAt) return false;
  await prisma.newsPost.delete({ where: { id } });
  await removeLocalNewsCover(id, row.coverImage);
  return true;
}

/** @deprecated use trashNewsPost — hard delete is only from the trash bin */
export async function deleteNewsPost(id: string) {
  await trashNewsPost(id, "manual");
}

export function slugifyNewsId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

/** @deprecated use listNewsPosts — kept sync shim removed; callers must be async */
export async function readNewsPosts(): Promise<NewsPost[]> {
  return listNewsPosts({ all: true });
}

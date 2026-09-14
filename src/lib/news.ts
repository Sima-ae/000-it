import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cleanSourceSummary } from "@/lib/auto-news/generate";
import {
  buildNewsTranslationsFromEnglish,
  nlFromTranslations,
  parseNewsTranslations,
  type NewsTranslationsMap,
} from "@/lib/news-i18n";

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
}): NewsPost {
  const translations = parseNewsTranslations(row.translations);
  // Mirror legacy *Nl into translations.nl when missing.
  if (!translations.nl && (row.titleNl || row.excerptNl || row.descriptionNl)) {
    translations.nl = {
      title: row.titleNl || row.title,
      excerpt: row.excerptNl || row.excerpt,
      description: row.descriptionNl || row.description,
    };
  }

  return {
    id: row.id,
    title: row.title,
    titleNl: row.titleNl,
    excerpt: cleanSourceSummary(row.excerpt),
    excerptNl: row.excerptNl ? cleanSourceSummary(row.excerptNl) : row.excerptNl,
    date: row.date,
    coverImage: row.coverImage,
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
  };
}

/**
 * Resolve canonical EN (+ translations) to the active locale.
 * Dutch (`nl`) is the site default and uses *Nl / translations.nl.
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

  const fromMap = post.translations?.[locale];
  if (fromMap?.title?.trim()) {
    return {
      ...post,
      title: fromMap.title.trim(),
      excerpt: cleanSourceSummary(fromMap.excerpt?.trim() || en.excerpt),
      description: cleanSourceSummary(fromMap.description?.trim() || en.description),
    };
  }

  if (locale === "nl") {
    return {
      ...post,
      title: post.titleNl?.trim() || en.title,
      excerpt: cleanSourceSummary(post.excerptNl?.trim() || en.excerpt),
      description: cleanSourceSummary(post.descriptionNl?.trim() || en.description),
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

export async function listNewsPosts(opts?: { all?: boolean; locale?: string }) {
  const rows = await prisma.newsPost.findMany({
    where: opts?.all ? undefined : { published: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
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
  const where = opts.all ? undefined : { published: true };

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

export async function getNewsPost(id: string, locale?: string) {
  const row = await prisma.newsPost.findUnique({ where: { id } });
  if (!row) return null;
  const mapped = mapNews(row);
  return locale ? localizeNewsPost(mapped, locale) : mapped;
}

export async function getPublishedNewsPost(id: string, locale?: string) {
  const row = await prisma.newsPost.findFirst({
    where: { id, published: true },
  });
  if (!row) return null;
  const mapped = mapNews(row);
  return locale ? localizeNewsPost(mapped, locale) : mapped;
}

export async function listPublishedNewsIds() {
  return prisma.newsPost.findMany({
    where: { published: true },
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
      title: data.titleNl?.trim() || translations.nl?.title || en.title,
      excerpt: data.excerptNl?.trim() || translations.nl?.excerpt || en.excerpt,
      description:
        data.descriptionNl?.trim() || translations.nl?.description || en.description,
    };
  }

  if (!translations.nl?.title?.trim()) {
    translations = await buildNewsTranslationsFromEnglish(en, {
      existing: translations,
      locales: ["nl"],
      delayMs: 200,
    });
  }

  const nl = nlFromTranslations(translations, en);

  const row = await prisma.newsPost.create({
    data: {
      id: data.id,
      title: data.title,
      titleNl: nl.title,
      excerpt: data.excerpt,
      excerptNl: nl.excerpt,
      date: data.date,
      coverImage: data.coverImage || null,
      description: data.description,
      descriptionNl: nl.description,
      translations,
      author: data.author,
      projectUrl: data.projectUrl || null,
      industry: data.industry || null,
      tags: data.tags ?? [],
      published: data.published ?? true,
      createdById: data.createdById || null,
    },
  });

  // Expand to all other languages after insert (best-effort).
  if (data.autoTranslate !== false) {
    try {
      const full = await buildNewsTranslationsFromEnglish(en, {
        existing: translations,
        delayMs: 300,
      });
      const nlFull = nlFromTranslations(full, en);
      const updated = await prisma.newsPost.update({
        where: { id: row.id },
        data: {
          translations: full,
          titleNl: nlFull.title,
          excerptNl: nlFull.excerpt,
          descriptionNl: nlFull.description,
        },
      });
      return mapNews(updated);
    } catch (error) {
      console.warn(
        "[news] multi-locale fill after create failed",
        row.id,
        error instanceof Error ? error.message : error,
      );
    }
  }

  return mapNews(row);
}

export async function updateNewsPost(
  id: string,
  data: Partial<z.infer<typeof newsUpsertSchema>> & { createdById?: string | null },
) {
  const existing = await prisma.newsPost.findUnique({ where: { id } });
  if (!existing) throw new Error("News post not found");

  const title = data.title ?? existing.title;
  const excerpt = data.excerpt ?? existing.excerpt;
  const description = data.description ?? existing.description;

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
    // Edits only re-translate when explicitly requested (avoids slow/429 saves).
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
      coverImage: data.coverImage,
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
  return mapNews(row);
}

export async function deleteNewsPost(id: string) {
  await prisma.newsPost.delete({ where: { id } });
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

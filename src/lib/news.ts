import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cleanSourceSummary } from "@/lib/auto-news/generate";

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
  author: string;
  projectUrl?: string | null;
  industry?: string | null;
  tags: string[];
  createdById?: string | null;
  published?: boolean;
};

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
  author: z.string().min(1),
  projectUrl: z.string().nullable().optional(),
  industry: z.string().optional(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().optional(),
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
  author: string;
  projectUrl: string | null;
  industry: string | null;
  tags: unknown;
  createdById: string | null;
  published: boolean;
}): NewsPost {
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
    author: row.author,
    projectUrl: row.projectUrl,
    industry: row.industry || "",
    tags: asStringArray(row.tags),
    createdById: row.createdById,
    published: row.published,
  };
}

/** Resolve EN canonical fields to the active locale for public pages. */
export function localizeNewsPost(post: NewsPost, locale: string): NewsPost {
  if (locale !== "nl") {
    return {
      ...post,
      excerpt: cleanSourceSummary(post.excerpt),
      description: cleanSourceSummary(post.description),
    };
  }
  return {
    ...post,
    title: post.titleNl?.trim() || post.title,
    excerpt: cleanSourceSummary(post.excerptNl?.trim() || post.excerpt),
    description: cleanSourceSummary(post.descriptionNl?.trim() || post.description),
  };
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

export async function createNewsPost(
  data: z.infer<typeof newsUpsertSchema> & { id: string; createdById?: string | null },
) {
  const row = await prisma.newsPost.create({
    data: {
      id: data.id,
      title: data.title,
      titleNl: data.titleNl || null,
      excerpt: data.excerpt,
      excerptNl: data.excerptNl || null,
      date: data.date,
      coverImage: data.coverImage || null,
      description: data.description,
      descriptionNl: data.descriptionNl || null,
      author: data.author,
      projectUrl: data.projectUrl || null,
      industry: data.industry || null,
      tags: data.tags ?? [],
      published: data.published ?? true,
      createdById: data.createdById || null,
    },
  });
  return mapNews(row);
}

export async function updateNewsPost(
  id: string,
  data: Partial<z.infer<typeof newsUpsertSchema>> & { createdById?: string | null },
) {
  const row = await prisma.newsPost.update({
    where: { id },
    data: {
      title: data.title,
      titleNl: data.titleNl,
      excerpt: data.excerpt,
      excerptNl: data.excerptNl,
      date: data.date,
      coverImage: data.coverImage,
      description: data.description,
      descriptionNl: data.descriptionNl,
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

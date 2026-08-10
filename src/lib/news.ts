import { z } from "zod";
import { prisma } from "@/lib/prisma";

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
    excerpt: row.excerpt,
    excerptNl: row.excerptNl,
    date: row.date,
    coverImage: row.coverImage,
    description: row.description,
    descriptionNl: row.descriptionNl,
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
  if (locale !== "nl") return post;
  return {
    ...post,
    title: post.titleNl?.trim() || post.title,
    excerpt: post.excerptNl?.trim() || post.excerpt,
    description: post.descriptionNl?.trim() || post.description,
  };
}

export async function listNewsPosts(opts?: { all?: boolean; locale?: string }) {
  const rows = await prisma.newsPost.findMany({
    where: opts?.all ? undefined : { published: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  const mapped = rows.map(mapNews);
  if (!opts?.locale) return mapped;
  return mapped.map((post) => localizeNewsPost(post, opts.locale!));
}

export async function getNewsPost(id: string, locale?: string) {
  const row = await prisma.newsPost.findUnique({ where: { id } });
  if (!row) return null;
  const mapped = mapNews(row);
  return locale ? localizeNewsPost(mapped, locale) : mapped;
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

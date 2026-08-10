import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type NewsPost = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  coverImage?: string | null;
  description: string;
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
  excerpt: z.string().min(1),
  date: z.string().min(1),
  coverImage: z.string().nullable().optional(),
  description: z.string().min(1),
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
  excerpt: string;
  date: string;
  coverImage: string | null;
  description: string;
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
    excerpt: row.excerpt,
    date: row.date,
    coverImage: row.coverImage,
    description: row.description,
    author: row.author,
    projectUrl: row.projectUrl,
    industry: row.industry || "",
    tags: asStringArray(row.tags),
    createdById: row.createdById,
    published: row.published,
  };
}

export async function listNewsPosts(opts?: { all?: boolean }) {
  const rows = await prisma.newsPost.findMany({
    where: opts?.all ? undefined : { published: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(mapNews);
}

export async function getNewsPost(id: string) {
  const row = await prisma.newsPost.findUnique({ where: { id } });
  return row ? mapNews(row) : null;
}

export async function createNewsPost(
  data: z.infer<typeof newsUpsertSchema> & { id: string; createdById?: string | null },
) {
  const row = await prisma.newsPost.create({
    data: {
      id: data.id,
      title: data.title,
      excerpt: data.excerpt,
      date: data.date,
      coverImage: data.coverImage || null,
      description: data.description,
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
      excerpt: data.excerpt,
      date: data.date,
      coverImage: data.coverImage,
      description: data.description,
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

import { z } from "zod";

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function asStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(String).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export const portfolioUpsertSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2).optional(),
  summary: z.string().min(10),
  description: z.string().optional(),
  coverImage: z.string().optional().nullable(),
  gallery: z.array(z.string()).optional(),
  projectUrl: z.string().url().optional().or(z.literal("")).nullable(),
  repoUrl: z.string().url().optional().or(z.literal("")).nullable(),
  clientName: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  year: z.coerce.number().int().min(1990).max(2100).optional().nullable(),
  tags: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

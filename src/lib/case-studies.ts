import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type CaseStudy = {
  id: string;
  title: string;
  industry: string;
  metric: string;
  summary: string;
  description: string;
  clientName: string;
  projectUrl: string;
  coverImage: string;
  gallery: string[];
  year: number;
  tags: string[];
  technologies: string[];
  createdById?: string | null;
  published?: boolean;
};

export const caseStudyUpsertSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1),
  industry: z.string().min(1),
  metric: z.string().min(1),
  summary: z.string().min(1),
  description: z.string().min(1),
  clientName: z.string().min(1),
  projectUrl: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  gallery: z.array(z.string()).default([]),
  year: z.number().int().optional().nullable(),
  tags: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  published: z.boolean().optional(),
});

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return [];
}

function mapCase(row: {
  id: string;
  title: string;
  industry: string;
  metric: string;
  summary: string;
  description: string;
  clientName: string;
  projectUrl: string | null;
  coverImage: string | null;
  gallery: unknown;
  year: number | null;
  tags: unknown;
  technologies: unknown;
  createdById: string | null;
  published: boolean;
}): CaseStudy {
  return {
    id: row.id,
    title: row.title,
    industry: row.industry,
    metric: row.metric,
    summary: row.summary,
    description: row.description,
    clientName: row.clientName,
    projectUrl: row.projectUrl || "",
    coverImage: row.coverImage || "",
    gallery: asStringArray(row.gallery),
    year: row.year ?? new Date().getFullYear(),
    tags: asStringArray(row.tags),
    technologies: asStringArray(row.technologies),
    createdById: row.createdById,
    published: row.published,
  };
}

export async function listCaseStudies(opts?: { all?: boolean }) {
  const rows = await prisma.caseStudy.findMany({
    where: opts?.all ? undefined : { published: true },
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(mapCase);
}

export async function getCaseStudy(id: string) {
  const row = await prisma.caseStudy.findUnique({ where: { id } });
  return row ? mapCase(row) : null;
}

export async function createCaseStudy(
  data: z.infer<typeof caseStudyUpsertSchema> & { id: string; createdById?: string | null },
) {
  const row = await prisma.caseStudy.create({
    data: {
      id: data.id,
      title: data.title,
      industry: data.industry,
      metric: data.metric,
      summary: data.summary,
      description: data.description,
      clientName: data.clientName,
      projectUrl: data.projectUrl || null,
      coverImage: data.coverImage || null,
      gallery: data.gallery ?? [],
      year: data.year ?? new Date().getFullYear(),
      tags: data.tags ?? [],
      technologies: data.technologies ?? [],
      published: data.published ?? true,
      createdById: data.createdById || null,
    },
  });
  return mapCase(row);
}

export async function updateCaseStudy(
  id: string,
  data: Partial<z.infer<typeof caseStudyUpsertSchema>> & { createdById?: string | null },
) {
  const row = await prisma.caseStudy.update({
    where: { id },
    data: {
      title: data.title,
      industry: data.industry,
      metric: data.metric,
      summary: data.summary,
      description: data.description,
      clientName: data.clientName,
      projectUrl: data.projectUrl,
      coverImage: data.coverImage,
      gallery: data.gallery,
      year: data.year,
      tags: data.tags,
      technologies: data.technologies,
      published: data.published,
      createdById: data.createdById === undefined ? undefined : data.createdById,
    },
  });
  return mapCase(row);
}

export async function deleteCaseStudy(id: string) {
  await prisma.caseStudy.delete({ where: { id } });
}

export function slugifyCaseId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export function parseCsvList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return String(value || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function readCaseStudies(): Promise<CaseStudy[]> {
  return listCaseStudies({ all: true });
}

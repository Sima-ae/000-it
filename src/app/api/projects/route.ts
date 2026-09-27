import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import type { ProjectType } from "@prisma/client";
import { isStaffRole, ownScope } from "@/lib/roles";

const PROJECT_TYPES = [
  "WEBSITE",
  "SEO",
  "ADS",
  "AI_INTEGRATION",
  "CONTENT",
  "SOCIAL_MEDIA",
  "BRANDING",
  "FULL_GROWTH",
] as const;

const createSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(10000).optional().nullable(),
  notes: z.string().max(20000).optional().nullable(),
  type: z.enum(PROJECT_TYPES),
  status: z
    .enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"])
    .optional(),
  budget: z.number().min(0).max(10_000_000).optional().nullable(),
  progress: z.number().min(0).max(100).optional(),
  coverImage: z.string().max(500).optional().nullable(),
  gallery: z.array(z.string().max(500)).max(24).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  const where = ownScope(session.user.role, session.user.id);

  const projects = await prisma.project.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { tasks: true, clients: true, crmNotes: true } },
      clients: { select: { id: true, name: true, company: true }, take: 3 },
    },
  });
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;
  if (!isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      notes: parsed.data.notes || null,
      type: parsed.data.type as ProjectType,
      status: parsed.data.status ?? "ACTIVE",
      budget: parsed.data.budget ?? null,
      progress: parsed.data.progress ?? 0,
      coverImage: parsed.data.coverImage || null,
      gallery: parsed.data.gallery ?? [],
      startDate: parsed.data.startDate
        ? new Date(parsed.data.startDate)
        : new Date(),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      userId: session.user.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: "PROJECT_CREATED",
      description: `Project created: ${project.name}`,
      projectId: project.id,
      userId: session.user.id,
    },
  });

  return NextResponse.json(project, { status: 201 });
}

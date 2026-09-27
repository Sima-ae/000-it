import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { canDelete, canEditAny, canEditResource, isStaffRole } from "@/lib/roles";

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

const updateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(10000).optional().nullable(),
  notes: z.string().max(20000).optional().nullable(),
  type: z.enum(PROJECT_TYPES).optional(),
  status: z
    .enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"])
    .optional(),
  progress: z.number().min(0).max(100).optional(),
  budget: z.number().min(0).max(10_000_000).optional().nullable(),
  coverImage: z.string().max(500).optional().nullable(),
  gallery: z.array(z.string().max(500)).max(24).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

const projectInclude = {
  tasks: { orderBy: { createdAt: "desc" as const } },
  clients: {
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      status: true,
    },
  },
  aiAgents: {
    select: { id: true, name: true, type: true, status: true },
  },
  activities: { orderBy: { createdAt: "desc" as const }, take: 30 },
  crmNotes: {
    orderBy: { createdAt: "desc" as const },
    take: 40,
    include: { user: { select: { id: true, name: true } } },
  },
  user: { select: { id: true, name: true, email: true } },
};

async function findAccessibleProject(id: string, role: string, userId: string) {
  if (canEditAny(role)) {
    return prisma.project.findUnique({
      where: { id },
      include: projectInclude,
    });
  }
  return prisma.project.findFirst({
    where: { id, userId },
    include: projectInclude,
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireUser();
  if (error) return error;
  const { id } = await params;
  const project = await findAccessibleProject(
    id,
    session.user.role,
    session.user.id,
  );
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...project,
    canEdit: canEditResource(session.user.role, project.userId, session.user.id),
    canDelete: canDelete(session.user.role),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireUser();
  if (error) return error;
  if (!isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const existing = canEditAny(session.user.role)
    ? await prisma.project.findUnique({ where: { id } })
    : await prisma.project.findFirst({ where: { id, userId: session.user.id } });

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canEditResource(session.user.role, existing.userId, session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  const project = await prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description === undefined ? undefined : data.description,
      notes: data.notes === undefined ? undefined : data.notes,
      type: data.type,
      status: data.status,
      progress: data.progress,
      budget: data.budget === undefined ? undefined : data.budget,
      coverImage:
        data.coverImage === undefined ? undefined : data.coverImage || null,
      gallery: data.gallery === undefined ? undefined : data.gallery,
      startDate:
        data.startDate === undefined
          ? undefined
          : data.startDate
            ? new Date(data.startDate)
            : undefined,
      endDate:
        data.endDate === undefined
          ? undefined
          : data.endDate
            ? new Date(data.endDate)
            : null,
    },
  });

  await prisma.activity.create({
    data: {
      type: "PROJECT_UPDATED",
      description: `Project updated: ${project.name}`,
      projectId: project.id,
      userId: session.user.id,
    },
  });

  return NextResponse.json(project);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireUser();
  if (error) return error;
  if (!canDelete(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

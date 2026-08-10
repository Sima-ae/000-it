import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { canDelete, canEditAny } from "@/lib/roles";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z
    .enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"])
    .optional(),
  progress: z.number().min(0).max(100).optional(),
  budget: z.number().optional(),
});

async function findAccessibleProject(id: string, role: string, userId: string) {
  if (canEditAny(role)) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        tasks: { orderBy: { createdAt: "desc" } },
        clients: true,
        aiAgents: true,
        activities: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });
  }
  return prisma.project.findFirst({
    where: { id, userId },
    include: {
      tasks: { orderBy: { createdAt: "desc" } },
      clients: true,
      aiAgents: true,
      activities: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireUser();
  if (error) return error;
  const { id } = await params;
  const project = await findAccessibleProject(id, session.user.role, session.user.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireUser();
  if (error) return error;
  const { id } = await params;

  const existing = canEditAny(session.user.role)
    ? await prisma.project.findUnique({ where: { id } })
    : await prisma.project.findFirst({ where: { id, userId: session.user.id } });

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const project = await prisma.project.update({
    where: { id },
    data: parsed.data,
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

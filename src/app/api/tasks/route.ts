import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { canDelete, canEditAny, isStaffRole, ownScope } from "@/lib/roles";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string().min(1),
  status: z.enum(["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional().nullable(),
});

const patchSchema = createSchema.partial().extend({
  id: z.string().min(1),
});

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  const tasks = await prisma.task.findMany({
    where: { project: ownScope(session.user.role, session.user.id) },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      project: { select: { id: true, name: true, userId: true } },
    },
    take: 200,
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;
  if (!isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const project = canEditAny(session.user.role)
    ? await prisma.project.findUnique({ where: { id: parsed.data.projectId } })
    : await prisma.project.findFirst({
        where: { id: parsed.data.projectId, userId: session.user.id },
      });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      projectId: parsed.data.projectId,
      status: parsed.data.status ?? "PENDING",
      priority: parsed.data.priority ?? "MEDIUM",
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
    include: { project: { select: { id: true, name: true } } },
  });
  return NextResponse.json(task, { status: 201 });
}

export async function PATCH(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;
  if (!isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.task.findFirst({
    where: {
      id: parsed.data.id,
      project: canEditAny(session.user.role)
        ? undefined
        : { userId: session.user.id },
    },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const task = await prisma.task.update({
    where: { id: existing.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate:
        parsed.data.dueDate === undefined
          ? undefined
          : parsed.data.dueDate
            ? new Date(parsed.data.dueDate)
            : null,
    },
    include: { project: { select: { id: true, name: true } } },
  });
  return NextResponse.json(task);
}

export async function DELETE(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;
  if (!canDelete(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

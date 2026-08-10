import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";

const createSchema = z.object({
  title: z.string().min(1).max(200),
});

const updateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  done: z.boolean().optional(),
});

export async function GET() {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const todos = await prisma.staffTodo.findMany({
    where: { userId: authResult.session.user.id },
    orderBy: [{ done: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(todos);
}

export async function POST(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const count = await prisma.staffTodo.count({
    where: { userId: authResult.session.user.id },
  });

  const todo = await prisma.staffTodo.create({
    data: {
      title: parsed.data.title,
      userId: authResult.session.user.id,
      sortOrder: count,
    },
  });
  return NextResponse.json(todo, { status: 201 });
}

export async function PATCH(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.staffTodo.findFirst({
    where: { id: parsed.data.id, userId: authResult.session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const todo = await prisma.staffTodo.update({
    where: { id: existing.id },
    data: {
      title: parsed.data.title,
      done: parsed.data.done,
    },
  });
  return NextResponse.json(todo);
}

export async function DELETE(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.staffTodo.findFirst({
    where: { id, userId: authResult.session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.staffTodo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

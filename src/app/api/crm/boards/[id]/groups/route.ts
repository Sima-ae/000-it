import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { userCanEditBoard } from "@/lib/crm/ops-boards";

type Ctx = { params: Promise<{ id: string }> };

const createSchema = z.object({
  name: z.string().min(1).max(200),
  color: z.string().max(32).optional().nullable(),
});

export async function POST(request: Request, ctx: Ctx) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const { id: boardId } = await ctx.params;

  if (!(await userCanEditBoard(boardId, auth.session.user.id, auth.session.user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const max = await prisma.opsGroup.aggregate({
    where: { boardId },
    _max: { sortOrder: true },
  });

  const group = await prisma.opsGroup.create({
    data: {
      boardId,
      name: parsed.data.name,
      color: parsed.data.color || null,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
  return NextResponse.json(group, { status: 201 });
}

const patchSchema = z.object({
  groupId: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  color: z.string().max(32).optional().nullable(),
  collapsed: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const { id: boardId } = await ctx.params;

  if (!(await userCanEditBoard(boardId, auth.session.user.id, auth.session.user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const group = await prisma.opsGroup.update({
    where: { id: parsed.data.groupId },
    data: {
      name: parsed.data.name,
      color: parsed.data.color === undefined ? undefined : parsed.data.color,
      collapsed: parsed.data.collapsed,
      sortOrder: parsed.data.sortOrder,
    },
  });
  return NextResponse.json(group);
}

export async function DELETE(request: Request, ctx: Ctx) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const { id: boardId } = await ctx.params;
  const groupId = new URL(request.url).searchParams.get("groupId");
  if (!groupId) return NextResponse.json({ error: "Missing groupId" }, { status: 400 });

  if (!(await userCanEditBoard(boardId, auth.session.user.id, auth.session.user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.opsGroup.delete({ where: { id: groupId } });
  return NextResponse.json({ ok: true });
}

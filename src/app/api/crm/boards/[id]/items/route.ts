import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { userCanEditBoard } from "@/lib/crm/ops-boards";

type Ctx = { params: Promise<{ id: string }> };

const createSchema = z.object({
  groupId: z.string().min(1),
  name: z.string().min(1).max(500),
  clientId: z.string().optional().nullable(),
  contactLeadId: z.string().optional().nullable(),
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

  const max = await prisma.opsItem.aggregate({
    where: { groupId: parsed.data.groupId },
    _max: { sortOrder: true },
  });

  const item = await prisma.opsItem.create({
    data: {
      boardId,
      groupId: parsed.data.groupId,
      name: parsed.data.name,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
      createdById: auth.session.user.id,
      clientId: parsed.data.clientId || null,
      contactLeadId: parsed.data.contactLeadId || null,
    },
    include: { cells: true, subitems: true },
  });
  return NextResponse.json(item, { status: 201 });
}

const patchSchema = z.object({
  itemId: z.string().min(1),
  name: z.string().min(1).max(500).optional(),
  groupId: z.string().optional(),
  sortOrder: z.number().int().optional(),
  clientId: z.string().optional().nullable(),
  contactLeadId: z.string().optional().nullable(),
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

  const item = await prisma.opsItem.update({
    where: { id: parsed.data.itemId },
    data: {
      name: parsed.data.name,
      groupId: parsed.data.groupId,
      sortOrder: parsed.data.sortOrder,
      clientId: parsed.data.clientId === undefined ? undefined : parsed.data.clientId,
      contactLeadId: parsed.data.contactLeadId === undefined ? undefined : parsed.data.contactLeadId,
    },
    include: { cells: true },
  });
  return NextResponse.json(item);
}

export async function DELETE(request: Request, ctx: Ctx) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const { id: boardId } = await ctx.params;
  const itemId = new URL(request.url).searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ error: "Missing itemId" }, { status: 400 });

  if (!(await userCanEditBoard(boardId, auth.session.user.id, auth.session.user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.opsItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}

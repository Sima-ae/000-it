import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { userCanEditBoard } from "@/lib/crm/ops-boards";

type Ctx = { params: Promise<{ id: string }> };

const createSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(["TABLE", "KANBAN", "CALENDAR", "TIMELINE"]),
  config: z.any().optional(),
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

  const max = await prisma.opsBoardView.aggregate({ where: { boardId }, _max: { sortOrder: true } });
  const view = await prisma.opsBoardView.create({
    data: {
      boardId,
      name: parsed.data.name,
      type: parsed.data.type,
      config: parsed.data.config,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
  return NextResponse.json(view, { status: 201 });
}

const patchSchema = z.object({
  viewId: z.string().min(1),
  name: z.string().min(1).max(120).optional(),
  config: z.any().optional(),
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

  const view = await prisma.opsBoardView.update({
    where: { id: parsed.data.viewId },
    data: { name: parsed.data.name, config: parsed.data.config },
  });
  return NextResponse.json(view);
}

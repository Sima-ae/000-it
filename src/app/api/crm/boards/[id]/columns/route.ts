import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { userCanEditBoard } from "@/lib/crm/ops-boards";
import type { OpsColumnType } from "@prisma/client";

type Ctx = { params: Promise<{ id: string }> };

const columnTypes = [
  "STATUS", "PEOPLE", "DATE", "TIMELINE", "NUMBER", "TEXT", "LONG_TEXT",
  "DROPDOWN", "CHECKBOX", "TAGS", "LINK", "EMAIL", "PHONE", "FILE",
  "RATING", "WEBSITE", "ACTIVITY_TYPE",
] as const satisfies readonly OpsColumnType[];

const createSchema = z.object({
  title: z.string().min(1).max(120),
  type: z.enum(columnTypes),
  settings: z.any().optional(),
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

  const max = await prisma.opsColumn.aggregate({ where: { boardId }, _max: { sortOrder: true } });
  const column = await prisma.opsColumn.create({
    data: {
      boardId,
      title: parsed.data.title,
      type: parsed.data.type,
      settings: parsed.data.settings,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
  return NextResponse.json(column, { status: 201 });
}

const patchSchema = z.object({
  columnId: z.string().min(1),
  title: z.string().min(1).max(120).optional(),
  settings: z.any().optional(),
  sortOrder: z.number().int().optional(),
  width: z.number().int().optional().nullable(),
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

  const column = await prisma.opsColumn.update({
    where: { id: parsed.data.columnId },
    data: {
      title: parsed.data.title,
      settings: parsed.data.settings,
      sortOrder: parsed.data.sortOrder,
      width: parsed.data.width === undefined ? undefined : parsed.data.width,
    },
  });
  return NextResponse.json(column);
}

export async function DELETE(request: Request, ctx: Ctx) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const { id: boardId } = await ctx.params;
  const columnId = new URL(request.url).searchParams.get("columnId");
  if (!columnId) return NextResponse.json({ error: "Missing columnId" }, { status: 400 });

  if (!(await userCanEditBoard(boardId, auth.session.user.id, auth.session.user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.opsColumn.delete({ where: { id: columnId } });
  return NextResponse.json({ ok: true });
}

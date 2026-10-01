import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import {
  BOARD_TEMPLATES,
  boardListWhere,
  createBoardFromTemplate,
  ensureDefaultWorkspace,
  userCanAccessBoard,
  userCanEditBoard,
} from "@/lib/crm/ops-boards";
import { canOverseeWorkOps } from "@/lib/crm/work-ops";

export async function GET(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  const boards = await prisma.opsBoard.findMany({
    where: {
      ...boardListWhere(auth.session.user.id, auth.session.user.role),
      ...(workspaceId ? { workspaceId } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      workspace: { select: { id: true, name: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      _count: { select: { items: true, groups: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ boards, templates: BOARD_TEMPLATES.map((t) => ({ key: t.key, name: t.name, description: t.description })) });
}

const createSchema = z.object({
  workspaceId: z.string().optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  templateKey: z.string().optional(),
  website: z.enum(["TRIPLEZERO", "EXTRAHOSTING"]).optional().nullable(),
});

export async function POST(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  let workspaceId = parsed.data.workspaceId;
  if (!workspaceId) {
    const ws = await ensureDefaultWorkspace(userId);
    workspaceId = ws.id;
  }

  if (parsed.data.templateKey) {
    const board = await createBoardFromTemplate({
      workspaceId,
      templateKey: parsed.data.templateKey,
      createdById: userId,
      name: parsed.data.name,
      website: parsed.data.website,
    });
    const full = await prisma.opsBoard.findUnique({
      where: { id: board.id },
      include: {
        groups: { orderBy: { sortOrder: "asc" }, include: { items: { orderBy: { sortOrder: "asc" }, include: { cells: true } } } },
        columns: { orderBy: { sortOrder: "asc" } },
        views: { orderBy: { sortOrder: "asc" } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });
    return NextResponse.json(full, { status: 201 });
  }

  const board = await prisma.opsBoard.create({
    data: {
      workspaceId,
      name: parsed.data.name || "New board",
      description: parsed.data.description || null,
      website: parsed.data.website ?? null,
      createdById: userId,
      members: { create: { userId, role: "OWNER" } },
      groups: { create: [{ name: "Group 1", sortOrder: 0, color: "#579bfc" }] },
      columns: {
        create: [
          { title: "Status", type: "STATUS", sortOrder: 0, settings: { labels: [{ id: "todo", label: "To do", color: "#c4c4c4" }, { id: "working", label: "Working on it", color: "#fdab3d" }, { id: "done", label: "Done", color: "#00c875" }] } },
          { title: "Person", type: "PEOPLE", sortOrder: 1 },
          { title: "Date", type: "DATE", sortOrder: 2 },
        ],
      },
      views: {
        create: [
          { name: "Table", type: "TABLE", sortOrder: 0 },
          { name: "Kanban", type: "KANBAN", sortOrder: 1 },
          { name: "Calendar", type: "CALENDAR", sortOrder: 2 },
          { name: "Timeline", type: "TIMELINE", sortOrder: 3 },
        ],
      },
    },
    include: {
      groups: true,
      columns: { orderBy: { sortOrder: "asc" } },
      views: { orderBy: { sortOrder: "asc" } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  return NextResponse.json(board, { status: 201 });
}

const patchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  website: z.enum(["TRIPLEZERO", "EXTRAHOSTING"]).optional().nullable(),
});

export async function PATCH(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const canEdit = await userCanEditBoard(parsed.data.id, auth.session.user.id, auth.session.user.role);
  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const board = await prisma.opsBoard.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description === undefined ? undefined : parsed.data.description,
      website: parsed.data.website === undefined ? undefined : parsed.data.website,
    },
  });
  return NextResponse.json(board);
}

export async function DELETE(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const access = await userCanAccessBoard(id, auth.session.user.id, auth.session.user.role);
  if (!access.ok || (access.memberRole !== "OWNER" && !canOverseeWorkOps(auth.session.user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.opsBoard.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

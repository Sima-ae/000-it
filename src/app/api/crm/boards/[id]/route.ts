import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { userCanAccessBoard, userCanEditBoard } from "@/lib/crm/ops-boards";
import { canOverseeWorkOps } from "@/lib/crm/work-ops";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const { id } = await ctx.params;

  const access = await userCanAccessBoard(id, auth.session.user.id, auth.session.user.role);
  if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const board = await prisma.opsBoard.findUnique({
    where: { id },
    include: {
      workspace: { select: { id: true, name: true } },
      columns: { orderBy: { sortOrder: "asc" } },
      groups: {
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            include: {
              cells: true,
              subitems: { orderBy: { sortOrder: "asc" } },
              updates: {
                orderBy: { createdAt: "desc" },
                take: 20,
                include: { user: { select: { id: true, name: true, email: true } } },
              },
              createdBy: { select: { id: true, name: true, email: true } },
              client: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
      views: { orderBy: { sortOrder: "asc" } },
      members: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      },
      automations: { orderBy: { createdAt: "desc" } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const staff = await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN", "MANAGER"] } },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ board, staff, canEdit: await userCanEditBoard(id, auth.session.user.id, auth.session.user.role) });
}

const memberSchema = z.object({
  action: z.literal("addMember"),
  userId: z.string().min(1),
  role: z.enum(["OWNER", "EDITOR", "VIEWER"]).default("EDITOR"),
});

const removeMemberSchema = z.object({
  action: z.literal("removeMember"),
  userId: z.string().min(1),
});

export async function POST(request: Request, ctx: Ctx) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const { id } = await ctx.params;
  const body = await request.json();

  const canEdit = await userCanEditBoard(id, auth.session.user.id, auth.session.user.role);
  if (!canEdit && !canOverseeWorkOps(auth.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (body.action === "addMember") {
    const parsed = memberSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const member = await prisma.opsBoardMember.upsert({
      where: { boardId_userId: { boardId: id, userId: parsed.data.userId } },
      create: { boardId: id, userId: parsed.data.userId, role: parsed.data.role },
      update: { role: parsed.data.role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(member);
  }

  if (body.action === "removeMember") {
    const parsed = removeMemberSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    await prisma.opsBoardMember.deleteMany({
      where: { boardId: id, userId: parsed.data.userId },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "duplicate") {
    const source = await prisma.opsBoard.findUnique({
      where: { id },
      include: {
        columns: { orderBy: { sortOrder: "asc" } },
        groups: {
          orderBy: { sortOrder: "asc" },
          include: { items: { orderBy: { sortOrder: "asc" }, include: { cells: true } } },
        },
        views: true,
      },
    });
    if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const board = await prisma.$transaction(async (tx) => {
      const created = await tx.opsBoard.create({
        data: {
          workspaceId: source.workspaceId,
          name: `${source.name} (copy)`,
          description: source.description,
          website: source.website,
          templateKey: source.templateKey,
          createdById: auth.session.user.id,
          members: { create: { userId: auth.session.user.id, role: "OWNER" } },
          views: {
            create: source.views.map((v) => ({
              name: v.name,
              type: v.type,
              config: v.config ?? undefined,
              sortOrder: v.sortOrder,
            })),
          },
        },
      });

      const colMap = new Map<string, string>();
      for (const col of source.columns) {
        const c = await tx.opsColumn.create({
          data: {
            boardId: created.id,
            title: col.title,
            type: col.type,
            settings: col.settings ?? undefined,
            sortOrder: col.sortOrder,
            width: col.width,
          },
        });
        colMap.set(col.id, c.id);
      }

      for (const group of source.groups) {
        const g = await tx.opsGroup.create({
          data: {
            boardId: created.id,
            name: group.name,
            color: group.color,
            sortOrder: group.sortOrder,
            collapsed: group.collapsed,
          },
        });
        for (const item of group.items) {
          const it = await tx.opsItem.create({
            data: {
              boardId: created.id,
              groupId: g.id,
              name: item.name,
              sortOrder: item.sortOrder,
              createdById: auth.session.user.id,
            },
          });
          for (const cell of item.cells) {
            const newColId = colMap.get(cell.columnId);
            if (!newColId) continue;
            await tx.opsCell.create({
              data: { itemId: it.id, columnId: newColId, value: cell.value ?? undefined },
            });
          }
        }
      }
      return created;
    });

    return NextResponse.json(board, { status: 201 });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

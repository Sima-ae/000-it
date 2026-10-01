import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { notifyUser, userCanAccessBoard, userCanEditBoard } from "@/lib/crm/ops-boards";

type Ctx = { params: Promise<{ id: string }> };

async function getItemBoardId(itemId: string) {
  const item = await prisma.opsItem.findUnique({
    where: { id: itemId },
    select: { boardId: true, name: true },
  });
  return item;
}

export async function GET(_request: Request, ctx: Ctx) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const { id: itemId } = await ctx.params;
  const item = await prisma.opsItem.findUnique({
    where: { id: itemId },
    include: {
      cells: true,
      subitems: { orderBy: { sortOrder: "asc" } },
      updates: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      board: { select: { id: true, name: true } },
      group: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      client: { select: { id: true, name: true, email: true } },
      workLogs: { orderBy: { date: "desc" }, take: 10 },
      workSessions: { orderBy: { clockInAt: "desc" }, take: 5 },
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const access = await userCanAccessBoard(item.boardId, auth.session.user.id, auth.session.user.role);
  if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ item });
}

const cellSchema = z.object({
  action: z.literal("upsertCell"),
  columnId: z.string().min(1),
  value: z.any(),
});

const updateSchema = z.object({
  action: z.literal("addUpdate"),
  body: z.string().min(1).max(10000),
});

const subitemSchema = z.object({
  action: z.literal("addSubitem"),
  name: z.string().min(1).max(500),
});

const patchSubitemSchema = z.object({
  action: z.literal("patchSubitem"),
  subitemId: z.string().min(1),
  name: z.string().min(1).max(500).optional(),
  status: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeIds: z.array(z.string()).optional(),
});

export async function POST(request: Request, ctx: Ctx) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const { id: itemId } = await ctx.params;
  const itemMeta = await getItemBoardId(itemId);
  if (!itemMeta) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!(await userCanEditBoard(itemMeta.boardId, auth.session.user.id, auth.session.user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  if (body.action === "upsertCell") {
    const parsed = cellSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const column = await prisma.opsColumn.findUnique({ where: { id: parsed.data.columnId } });
    const cell = await prisma.opsCell.upsert({
      where: { itemId_columnId: { itemId, columnId: parsed.data.columnId } },
      create: { itemId, columnId: parsed.data.columnId, value: parsed.data.value },
      update: { value: parsed.data.value },
    });

    // Notify people assigned via PEOPLE column
    if (column?.type === "PEOPLE") {
      const ids = Array.isArray(parsed.data.value?.userIds)
        ? (parsed.data.value.userIds as string[])
        : Array.isArray(parsed.data.value)
          ? (parsed.data.value as string[])
          : [];
      for (const uid of ids) {
        if (uid === auth.session.user.id) continue;
        await notifyUser({
          userId: uid,
          type: "item_assigned",
          title: `Assigned to: ${itemMeta.name}`,
          href: `/crm/boards/${itemMeta.boardId}?item=${itemId}`,
          payload: { itemId, boardId: itemMeta.boardId },
        });
      }

      // Run board automations for status changes
    }

    if (column?.type === "STATUS") {
      const automations = await prisma.opsAutomation.findMany({
        where: { boardId: itemMeta.boardId, enabled: true },
      });
      for (const auto of automations) {
        const trigger = auto.trigger as { type?: string; statusId?: string };
        const actions = auto.actions as { type?: string; notifyUserIds?: string[]; title?: string }[];
        const statusId =
          typeof parsed.data.value === "object" && parsed.data.value
            ? (parsed.data.value as { id?: string }).id
            : String(parsed.data.value || "");
        if (trigger?.type === "status_changed" && (!trigger.statusId || trigger.statusId === statusId)) {
          for (const action of actions || []) {
            if (action.type === "notify" && action.notifyUserIds?.length) {
              for (const uid of action.notifyUserIds) {
                await notifyUser({
                  userId: uid,
                  type: "automation",
                  title: action.title || `Status updated: ${itemMeta.name}`,
                  href: `/crm/boards/${itemMeta.boardId}?item=${itemId}`,
                });
              }
            }
          }
        }
      }
    }

    return NextResponse.json(cell);
  }

  if (body.action === "addUpdate") {
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const update = await prisma.opsItemUpdate.create({
      data: { itemId, userId: auth.session.user.id, body: parsed.data.body },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(update, { status: 201 });
  }

  if (body.action === "addSubitem") {
    const parsed = subitemSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const max = await prisma.opsSubitem.aggregate({ where: { itemId }, _max: { sortOrder: true } });
    const sub = await prisma.opsSubitem.create({
      data: {
        itemId,
        name: parsed.data.name,
        sortOrder: (max._max.sortOrder ?? -1) + 1,
      },
    });
    return NextResponse.json(sub, { status: 201 });
  }

  if (body.action === "patchSubitem") {
    const parsed = patchSubitemSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const sub = await prisma.opsSubitem.update({
      where: { id: parsed.data.subitemId },
      data: {
        name: parsed.data.name,
        status: parsed.data.status === undefined ? undefined : parsed.data.status,
        dueDate:
          parsed.data.dueDate === undefined
            ? undefined
            : parsed.data.dueDate
              ? new Date(parsed.data.dueDate)
              : null,
        assigneeIds: parsed.data.assigneeIds,
      },
    });
    return NextResponse.json(sub);
  }

  if (body.action === "deleteSubitem") {
    const subitemId = String(body.subitemId || "");
    if (!subitemId) return NextResponse.json({ error: "Missing subitemId" }, { status: 400 });
    await prisma.opsSubitem.delete({ where: { id: subitemId } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

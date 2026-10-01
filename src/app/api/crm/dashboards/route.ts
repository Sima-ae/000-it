import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { canOverseeWorkOps } from "@/lib/crm/work-ops";
import { boardListWhere } from "@/lib/crm/ops-boards";

export async function GET() {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const dashboards = await prisma.opsDashboard.findMany({
    where: canOverseeWorkOps(auth.session.user.role)
      ? {}
      : { createdById: auth.session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      widgets: { orderBy: { sortOrder: "asc" } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  const boards = await prisma.opsBoard.findMany({
    where: boardListWhere(auth.session.user.id, auth.session.user.role),
    select: {
      id: true,
      name: true,
      _count: { select: { items: true } },
      columns: { where: { type: "STATUS" }, select: { id: true, settings: true } },
      items: { select: { id: true, cells: true } },
    },
  });

  const boardStats = boards.map((b) => {
    const statusCol = b.columns[0];
    const counts: Record<string, number> = {};
    if (statusCol) {
      for (const item of b.items) {
        const cell = item.cells.find((c) => c.columnId === statusCol.id);
        const id =
          cell && typeof cell.value === "object" && cell.value
            ? String((cell.value as { id?: string }).id || "unset")
            : "unset";
        counts[id] = (counts[id] || 0) + 1;
      }
    }
    return {
      id: b.id,
      name: b.name,
      itemCount: b._count.items,
      statusCounts: counts,
      statusSettings: statusCol?.settings,
    };
  });

  return NextResponse.json({ dashboards, boardStats });
}

const createSchema = z.object({
  name: z.string().min(1).max(200),
  widgets: z
    .array(
      z.object({
        title: z.string().min(1),
        type: z.enum(["COUNT", "CHART", "BATTERY", "LIST"]),
        config: z.any().optional(),
      }),
    )
    .optional(),
});

export async function POST(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const dashboard = await prisma.opsDashboard.create({
    data: {
      name: parsed.data.name,
      createdById: auth.session.user.id,
      widgets: parsed.data.widgets?.length
        ? {
            create: parsed.data.widgets.map((w, i) => ({
              title: w.title,
              type: w.type,
              config: w.config,
              sortOrder: i,
            })),
          }
        : {
            create: [
              { title: "Open items", type: "COUNT", sortOrder: 0, config: { metric: "items" } },
              { title: "Board status", type: "CHART", sortOrder: 1, config: { metric: "status" } },
              { title: "Progress", type: "BATTERY", sortOrder: 2, config: { metric: "done_ratio" } },
            ],
          },
    },
    include: { widgets: true },
  });
  return NextResponse.json(dashboard, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.opsDashboard.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.createdById !== auth.session.user.id && !canOverseeWorkOps(auth.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.opsDashboard.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { boardListWhere } from "@/lib/crm/ops-boards";

export async function GET() {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  const boards = await prisma.opsBoard.findMany({
    where: boardListWhere(userId, auth.session.user.role),
    select: {
      id: true,
      name: true,
      columns: { where: { type: "PEOPLE" }, select: { id: true } },
      groups: {
        select: {
          id: true,
          name: true,
          items: {
            select: {
              id: true,
              name: true,
              updatedAt: true,
              cells: true,
              group: { select: { id: true, name: true } },
              board: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  const items = [];
  for (const board of boards) {
    const peopleColIds = new Set(board.columns.map((c) => c.id));
    for (const group of board.groups) {
      for (const item of group.items) {
        const assigned = item.cells.some((cell) => {
          if (!peopleColIds.has(cell.columnId)) return false;
          const v = cell.value as { userIds?: string[] } | string[] | null;
          if (!v) return false;
          if (Array.isArray(v)) return v.includes(userId);
          return Array.isArray(v.userIds) && v.userIds.includes(userId);
        });
        if (assigned || item.cells.length === 0) {
          // only include if assigned; skip unassigned
        }
        if (assigned) {
          items.push({
            id: item.id,
            name: item.name,
            updatedAt: item.updatedAt,
            boardId: board.id,
            boardName: board.name,
            groupName: group.name,
            cells: item.cells,
          });
        }
      }
    }
  }

  items.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  return NextResponse.json({ items });
}

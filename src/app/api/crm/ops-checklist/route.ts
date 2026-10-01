import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { getWorkOpsClock, weekStartMonday } from "@/lib/crm/work-ops";

export async function GET(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const period = new URL(request.url).searchParams.get("period") || undefined;
  const weekStart =
    new URL(request.url).searchParams.get("weekStart") ||
    weekStartMonday(getWorkOpsClock().isoDate);

  const items = await prisma.opsChecklistItem.findMany({
    where: period ? { period: period as never } : undefined,
    orderBy: [{ period: "asc" }, { dayKey: "asc" }, { sortOrder: "asc" }],
  });

  const completions = await prisma.opsChecklistCompletion.findMany({
    where: {
      userId: auth.session.user.id,
      OR: [{ weekStart }, { weekStart: null }],
    },
  });

  const completedIds = new Set(
    completions
      .filter((c) => c.weekStart === weekStart || c.weekStart === null)
      .map((c) => c.itemId),
  );

  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      completed: completedIds.has(item.id),
    })),
    weekStart,
  });
}

const toggleSchema = z.object({
  itemId: z.string().min(1),
  completed: z.boolean(),
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

export async function POST(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const parsed = toggleSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const weekStart =
    parsed.data.weekStart ?? weekStartMonday(getWorkOpsClock().isoDate);

  if (parsed.data.completed) {
    await prisma.opsChecklistCompletion.upsert({
      where: {
        itemId_userId_weekStart: {
          itemId: parsed.data.itemId,
          userId: auth.session.user.id,
          weekStart,
        },
      },
      create: {
        itemId: parsed.data.itemId,
        userId: auth.session.user.id,
        weekStart,
      },
      update: { completedAt: new Date() },
    });
  } else {
    await prisma.opsChecklistCompletion.deleteMany({
      where: {
        itemId: parsed.data.itemId,
        userId: auth.session.user.id,
        weekStart,
      },
    });
  }

  return NextResponse.json({ ok: true });
}

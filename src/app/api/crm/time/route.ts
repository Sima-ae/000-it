import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import {
  canOverseeWorkOps,
  getWorkOpsClock,
  sessionMinutes,
  workOpsUserFilter,
} from "@/lib/crm/work-ops";

export async function GET(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const userId = workOpsUserFilter(
    auth.session.user.role,
    auth.session.user.id,
    searchParams.get("userId"),
  );
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const sessions = await prisma.workSession.findMany({
    where: {
      userId,
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    orderBy: { clockInAt: "desc" },
    take: 100,
    include: { item: { select: { id: true, name: true, boardId: true } } },
  });

  const open = sessions.find((s) => !s.clockOutAt) || null;
  const today = getWorkOpsClock().isoDate;
  const todaySessions = sessions.filter((s) => s.date === today);
  const todayMinutes = todaySessions.reduce(
    (sum, s) => sum + sessionMinutes(s.clockInAt, s.clockOutAt, s.breakMinutes),
    0,
  );

  let staff: { id: string; name: string | null; email: string }[] = [];
  if (canOverseeWorkOps(auth.session.user.role)) {
    staff = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN", "MANAGER"] } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  }

  return NextResponse.json({
    sessions,
    open,
    today,
    todayMinutes,
    staff,
    viewedUserId: userId,
  });
}

export async function POST(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;
  const body = await request.json().catch(() => ({}));
  const action = String(body.action || "clockIn");

  if (action === "clockIn") {
    const existing = await prisma.workSession.findFirst({
      where: { userId, clockOutAt: null },
    });
    if (existing) {
      return NextResponse.json({ error: "Already clocked in", session: existing }, { status: 409 });
    }
    const clock = getWorkOpsClock();
    const session = await prisma.workSession.create({
      data: {
        userId,
        clockInAt: new Date(),
        date: clock.isoDate,
        breakMinutes: typeof body.breakMinutes === "number" ? body.breakMinutes : 75,
        note: body.note ? String(body.note) : null,
        itemId: body.itemId ? String(body.itemId) : null,
      },
    });
    return NextResponse.json(session, { status: 201 });
  }

  if (action === "clockOut") {
    const open = await prisma.workSession.findFirst({
      where: { userId, clockOutAt: null },
      orderBy: { clockInAt: "desc" },
    });
    if (!open) return NextResponse.json({ error: "Not clocked in" }, { status: 400 });
    const session = await prisma.workSession.update({
      where: { id: open.id },
      data: {
        clockOutAt: new Date(),
        note: body.note !== undefined ? String(body.note || "") || null : undefined,
        breakMinutes:
          typeof body.breakMinutes === "number" ? body.breakMinutes : undefined,
      },
    });
    return NextResponse.json(session);
  }

  if (action === "forceClockOut" && canOverseeWorkOps(auth.session.user.role)) {
    const targetUserId = String(body.userId || "");
    const sessionId = body.sessionId ? String(body.sessionId) : null;
    const open = sessionId
      ? await prisma.workSession.findUnique({ where: { id: sessionId } })
      : await prisma.workSession.findFirst({
          where: { userId: targetUserId, clockOutAt: null },
        });
    if (!open || open.clockOutAt) {
      return NextResponse.json({ error: "No open session" }, { status: 400 });
    }
    const session = await prisma.workSession.update({
      where: { id: open.id },
      data: { clockOutAt: new Date() },
    });
    return NextResponse.json(session);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

const patchSchema = z.object({
  id: z.string().min(1),
  breakMinutes: z.number().int().min(0).max(480).optional(),
  note: z.string().max(5000).optional().nullable(),
  clockOutAt: z.string().datetime().optional().nullable(),
});

export async function PATCH(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const existing = await prisma.workSession.findUnique({ where: { id: parsed.data.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    existing.userId !== auth.session.user.id &&
    !canOverseeWorkOps(auth.session.user.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await prisma.workSession.update({
    where: { id: parsed.data.id },
    data: {
      breakMinutes: parsed.data.breakMinutes,
      note: parsed.data.note === undefined ? undefined : parsed.data.note,
      clockOutAt:
        parsed.data.clockOutAt === undefined
          ? undefined
          : parsed.data.clockOutAt
            ? new Date(parsed.data.clockOutAt)
            : null,
    },
  });
  return NextResponse.json(session);
}

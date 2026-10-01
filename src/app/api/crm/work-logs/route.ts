import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import {
  WORK_ACTIVITY_TYPES,
  WORK_LOG_STATUSES,
  WORK_WEBSITES,
  canOverseeWorkOps,
  getWorkOpsClock,
  workOpsUserFilter,
} from "@/lib/crm/work-ops";

export async function GET(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const userIdParam = searchParams.get("userId");
  const scopeAll = canOverseeWorkOps(auth.session.user.role) && searchParams.get("all") === "1";
  const userId = scopeAll
    ? undefined
    : workOpsUserFilter(auth.session.user.role, auth.session.user.id, userIdParam);

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const website = searchParams.get("website");
  const activityType = searchParams.get("activityType");
  const status = searchParams.get("status");
  const followUpsDue = searchParams.get("followUpsDue") === "1";

  const logs = await prisma.workLog.findMany({
    where: {
      ...(userId ? { userId } : canOverseeWorkOps(auth.session.user.role) ? {} : { userId: auth.session.user.id }),
      ...(from || to
        ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
        : {}),
      ...(website ? { website: website as "TRIPLEZERO" | "EXTRAHOSTING" } : {}),
      ...(activityType ? { activityType: activityType as never } : {}),
      ...(status ? { status: status as never } : {}),
      ...(followUpsDue
        ? { nextFollowUp: { lte: new Date() }, status: { in: ["SENT", "FOLLOW_UP", "IN_PROGRESS"] } }
        : {}),
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 300,
    include: {
      user: { select: { id: true, name: true, email: true } },
      item: { select: { id: true, name: true, boardId: true } },
      client: { select: { id: true, name: true, email: true } },
    },
  });

  let staff: { id: string; name: string | null; email: string }[] = [];
  if (canOverseeWorkOps(auth.session.user.role)) {
    staff = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN", "MANAGER"] } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  }

  return NextResponse.json({
    logs,
    staff,
    meta: {
      websites: WORK_WEBSITES,
      activityTypes: WORK_ACTIVITY_TYPES,
      statuses: WORK_LOG_STATUSES,
      today: getWorkOpsClock().isoDate,
    },
  });
}

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  website: z.enum(["TRIPLEZERO", "EXTRAHOSTING"]),
  activityType: z.enum([
    "GUEST_POST_PITCH", "DIRECTORY_SUBMISSION", "SOCIAL_POST", "SOCIAL_ENGAGEMENT",
    "OUTREACH_EMAIL", "FOLLOW_UP", "CONTENT_WRITING", "DESIGN", "DEV_FIX",
    "COMMUNITY", "PROSPECT_RESEARCH", "TEMPLATE", "PLANNING", "OTHER",
  ]),
  contact: z.string().max(500).optional().nullable(),
  status: z.enum(["SENT", "FOLLOW_UP", "WON", "LOST", "IN_PROGRESS", "DONE"]).optional(),
  notes: z.string().max(10000).optional().nullable(),
  nextFollowUp: z.string().datetime().optional().nullable(),
  minutesSpent: z.number().int().min(0).max(24 * 60).optional().nullable(),
  itemId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  contactLeadId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const log = await prisma.workLog.create({
    data: {
      userId: auth.session.user.id,
      date: parsed.data.date || getWorkOpsClock().isoDate,
      website: parsed.data.website,
      activityType: parsed.data.activityType,
      contact: parsed.data.contact || null,
      status: parsed.data.status || "IN_PROGRESS",
      notes: parsed.data.notes || null,
      nextFollowUp: parsed.data.nextFollowUp ? new Date(parsed.data.nextFollowUp) : null,
      minutesSpent: parsed.data.minutesSpent ?? null,
      itemId: parsed.data.itemId || null,
      clientId: parsed.data.clientId || null,
      contactLeadId: parsed.data.contactLeadId || null,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      item: { select: { id: true, name: true, boardId: true } },
    },
  });
  return NextResponse.json(log, { status: 201 });
}

const patchSchema = createSchema.partial().extend({ id: z.string().min(1) });

export async function PATCH(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const existing = await prisma.workLog.findUnique({ where: { id: parsed.data.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== auth.session.user.id && !canOverseeWorkOps(auth.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, nextFollowUp, ...rest } = parsed.data;
  const log = await prisma.workLog.update({
    where: { id },
    data: {
      ...rest,
      nextFollowUp:
        nextFollowUp === undefined
          ? undefined
          : nextFollowUp
            ? new Date(nextFollowUp)
            : null,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      item: { select: { id: true, name: true, boardId: true } },
    },
  });
  return NextResponse.json(log);
}

export async function DELETE(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.workLog.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== auth.session.user.id && !canOverseeWorkOps(auth.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.workLog.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

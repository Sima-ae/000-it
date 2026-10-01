import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import {
  WORK_OPS_KPI_TARGETS,
  canOverseeWorkOps,
  getWorkOpsClock,
  monthKey,
  sessionMinutes,
  weekStartMonday,
  workOpsUserFilter,
} from "@/lib/crm/work-ops";

export async function GET(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "weekly";
  const userId = workOpsUserFilter(
    auth.session.user.role,
    auth.session.user.id,
    searchParams.get("userId"),
  );
  const today = getWorkOpsClock().isoDate;
  const weekStart = weekStartMonday(today);
  const month = monthKey(today);

  let from = today;
  let to = today;
  if (period === "weekly") {
    from = weekStart;
    const end = new Date(`${weekStart}T12:00:00Z`);
    end.setUTCDate(end.getUTCDate() + 6);
    to = end.toISOString().slice(0, 10);
  } else if (period === "monthly") {
    from = `${month}-01`;
    const [y, m] = month.split("-").map(Number);
    const last = new Date(Date.UTC(y, m, 0));
    to = last.toISOString().slice(0, 10);
  }

  const [sessions, logs] = await Promise.all([
    prisma.workSession.findMany({
      where: { userId, date: { gte: from, lte: to } },
      orderBy: { date: "asc" },
    }),
    prisma.workLog.findMany({
      where: { userId, date: { gte: from, lte: to } },
    }),
  ]);

  const totalMinutes = sessions.reduce(
    (sum, s) => sum + sessionMinutes(s.clockInAt, s.clockOutAt, s.breakMinutes),
    0,
  );

  const byActivity: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byWebsite: Record<string, number> = {};
  for (const log of logs) {
    byActivity[log.activityType] = (byActivity[log.activityType] || 0) + 1;
    byStatus[log.status] = (byStatus[log.status] || 0) + 1;
    byWebsite[log.website] = (byWebsite[log.website] || 0) + 1;
  }

  const outreach = byActivity.OUTREACH_EMAIL || 0;
  const pitches = byActivity.GUEST_POST_PITCH || 0;
  const directories = byActivity.DIRECTORY_SUBMISSION || 0;
  const socialPosts = byActivity.SOCIAL_POST || 0;
  const socialEng = byActivity.SOCIAL_ENGAGEMENT || 0;
  const devFixes = byActivity.DEV_FIX || 0;
  const won = byStatus.WON || 0;

  const kpis = {
    hoursWorked: Math.round((totalMinutes / 60) * 10) / 10,
    logCount: logs.length,
    outreachEmails: outreach,
    guestPitches: pitches,
    directories,
    socialPosts,
    socialEngagements: socialEng,
    devTasks: devFixes,
    wonLinks: won,
    targets: WORK_OPS_KPI_TARGETS,
  };

  let staff: { id: string; name: string | null; email: string }[] = [];
  if (canOverseeWorkOps(auth.session.user.role)) {
    staff = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN", "MANAGER"] } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  }

  return NextResponse.json({
    period,
    from,
    to,
    userId,
    sessions,
    byActivity,
    byStatus,
    byWebsite,
    kpis,
    staff,
  });
}

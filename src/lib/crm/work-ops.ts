import { isAdminRole } from "@/lib/roles";
import type { Role, WorkActivityType, WorkLogStatus, WorkWebsite } from "@prisma/client";

export const WORK_OPS_TZ = "Europe/Amsterdam";

export type AmsterdamDay = {
  isoDate: string;
  weekday: string;
  hour: number;
  minute: number;
};

export function getWorkOpsClock(now = new Date()): AmsterdamDay {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: WORK_OPS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value || "";

  return {
    isoDate: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: get("weekday"),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

/** Monday of the Amsterdam week containing `isoDate` (YYYY-MM-DD). */
export function weekStartMonday(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const dow = utc.getUTCDay(); // 0 Sun … 6 Sat
  const offset = dow === 0 ? -6 : 1 - dow;
  utc.setUTCDate(utc.getUTCDate() + offset);
  return utc.toISOString().slice(0, 10);
}

export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function sessionMinutes(
  clockInAt: Date,
  clockOutAt: Date | null | undefined,
  breakMinutes = 75,
  now = new Date(),
): number {
  const end = clockOutAt ?? now;
  const raw = Math.max(0, Math.round((end.getTime() - clockInAt.getTime()) / 60000));
  return Math.max(0, raw - Math.max(0, breakMinutes));
}

export const WORK_OPS_KPI_TARGETS = {
  outreachEmailsPerWeek: { min: 50, max: 75 },
  guestPostsPitchedPerWeek: 5,
  guestPostsPublishedPerMonth: { min: 2, max: 4 },
  directorySubmissionsPerMonth: 10,
  backlinksPerMonth: { min: 4, max: 6 },
  socialPostsPerPlatformPerWeek: 5,
  socialEngagementsPerWeek: 50,
  devTasksPerWeek: { min: 5, max: 10 },
} as const;

export const WORK_WEBSITES: WorkWebsite[] = ["TRIPLEZERO", "EXTRAHOSTING"];

export const WORK_ACTIVITY_TYPES: WorkActivityType[] = [
  "GUEST_POST_PITCH",
  "DIRECTORY_SUBMISSION",
  "SOCIAL_POST",
  "SOCIAL_ENGAGEMENT",
  "OUTREACH_EMAIL",
  "FOLLOW_UP",
  "CONTENT_WRITING",
  "DESIGN",
  "DEV_FIX",
  "COMMUNITY",
  "PROSPECT_RESEARCH",
  "TEMPLATE",
  "PLANNING",
  "OTHER",
];

export const WORK_LOG_STATUSES: WorkLogStatus[] = [
  "SENT",
  "FOLLOW_UP",
  "WON",
  "LOST",
  "IN_PROGRESS",
  "DONE",
];

export function canOverseeWorkOps(role?: Role | string | null): boolean {
  return isAdminRole(role);
}

export function workOpsUserFilter(
  role: Role | string | null | undefined,
  sessionUserId: string,
  requestedUserId?: string | null,
): string {
  if (canOverseeWorkOps(role) && requestedUserId) return requestedUserId;
  if (canOverseeWorkOps(role) && !requestedUserId) return sessionUserId;
  return sessionUserId;
}

import { AUTO_NEWS_TIMEZONE } from "@/lib/auto-news/config";

export type AmsterdamClock = {
  isoDate: string;
  weekday: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun" | string;
  hour: number;
  minute: number;
};

export function getAmsterdamClock(now = new Date()): AmsterdamClock {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: AUTO_NEWS_TIMEZONE,
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

/** Daily window: 00:00–01:59 Europe/Amsterdam (covers CET/CEST GitHub cron drift). */
export function isAutoNewsScheduleWindow(now = new Date()): boolean {
  const clock = getAmsterdamClock(now);
  return clock.hour === 0 || clock.hour === 1;
}

export function slugifyAutoNewsId(title: string, date: string, index: number) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
  return `auto-${date}-${index + 1}-${base || "post"}`.slice(0, 80);
}

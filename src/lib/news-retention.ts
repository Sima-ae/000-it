import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import { getAmsterdamClock } from "@/lib/auto-news/schedule";
import { localNewsCoverPath } from "@/lib/auto-news/cover-image";

/** Public news stays live for at most one year, then moves to the trash. */
export const NEWS_RETENTION_DAYS = 365;

export type NewsDeletedReason = "expired" | "manual";

export function addIsoDays(isoDate: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  const dt = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function newsRetentionCutoffDate(now = new Date()): string {
  return addIsoDays(getAmsterdamClock(now).isoDate, -NEWS_RETENTION_DAYS);
}

export async function expireNewsPastRetention(now = new Date()): Promise<{
  ok: true;
  cutoff: string;
  moved: number;
  ids: string[];
}> {
  const cutoff = newsRetentionCutoffDate(now);
  const stale = await prisma.newsPost.findMany({
    where: {
      deletedAt: null,
      retentionExempt: false,
      date: { lte: cutoff },
    },
    select: { id: true },
  });
  if (!stale.length) {
    return { ok: true, cutoff, moved: 0, ids: [] };
  }

  const ids = stale.map((row) => row.id);
  const deletedAt = now;
  await prisma.newsPost.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { deletedAt, deletedReason: "expired" },
  });
  return { ok: true, cutoff, moved: ids.length, ids };
}

export async function removeLocalNewsCover(id: string, coverImage?: string | null) {
  const candidates = new Set<string>();
  if (coverImage?.startsWith("/uploads/")) candidates.add(coverImage);
  candidates.add(localNewsCoverPath(id));
  for (const rel of candidates) {
    const abs = join(process.cwd(), "public", rel.replace(/^\//, ""));
    await unlink(abs).catch(() => undefined);
  }
}

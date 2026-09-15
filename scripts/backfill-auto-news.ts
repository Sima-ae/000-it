/**
 * Fill calendar gaps in auto-news (one run per missing Amsterdam date).
 *
 * Usage:
 *   npm run news:backfill -- --from=2026-08-23 --to=2026-09-14 --limit=3
 *   npm run news:backfill -- --from=2026-08-23 --to=2026-09-14 --dry-run
 */
import { prisma } from "../src/lib/prisma";
import { runAutoNewsPublish } from "../src/lib/auto-news/run";

function argValue(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

function eachDate(from: string, to: string): string[] {
  const out: string[] = [];
  const start = Date.parse(`${from}T12:00:00Z`);
  const end = Date.parse(`${to}T12:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
    throw new Error(`Invalid range ${from} → ${to}`);
  }
  for (let t = start; t <= end; t += 86_400_000) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

async function main() {
  const from = argValue("from") || "2026-08-23";
  const to = argValue("to") || "2026-09-14";
  const limit = Number(argValue("limit") || "3") || 3;
  const dryRun = process.argv.includes("--dry-run");
  const dates = eachDate(from, to);

  const missing: string[] = [];
  for (const date of dates) {
    const count = await prisma.newsPost.count({
      where: { id: { startsWith: `auto-${date}-` } },
    });
    if (count < limit) missing.push(date);
  }

  console.log(
    JSON.stringify(
      {
        from,
        to,
        limit,
        missingDays: missing.length,
        missing,
        dryRun,
      },
      null,
      2,
    ),
  );

  if (dryRun) {
    await prisma.$disconnect();
    return;
  }

  const summary: Array<{
    date: string;
    ok: boolean;
    published: number;
    skipped?: boolean;
    reason?: string;
    errors: number;
  }> = [];

  for (const date of missing) {
    console.log(`\n=== backfill ${date} ===`);
    const result = await runAutoNewsPublish({
      force: true,
      date,
      limit,
    });
    summary.push({
      date,
      ok: result.ok,
      published: result.published.length,
      skipped: result.skipped,
      reason: result.reason,
      errors: result.errors.length,
    });
    console.log(
      JSON.stringify(
        {
          date: result.date,
          ok: result.ok,
          skipped: result.skipped,
          reason: result.reason,
          published: result.published.map((p) => p.id),
          errors: result.errors.slice(0, 5),
        },
        null,
        2,
      ),
    );
    // Gentle pause between days to reduce translate / Pollinations rate limits
    await new Promise((r) => setTimeout(r, 2500));
  }

  console.log("\n=== summary ===");
  console.log(JSON.stringify(summary, null, 2));
  await prisma.$disconnect();
  if (summary.some((s) => !s.ok && !s.skipped)) process.exit(1);
}

main().catch(async (error) => {
  console.error(error);
  try {
    await prisma.$disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});

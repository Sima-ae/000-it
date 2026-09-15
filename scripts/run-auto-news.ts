/**
 * Manual / local runner for auto-news.
 * Examples:
 *   npm run news:auto -- --force
 *   npm run news:auto -- --force --limit=2
 *   npm run news:auto -- --force --date=2026-09-01 --limit=3
 *   npm run news:auto -- --force --ignore-daily-cap --limit=1
 */
import { runAutoNewsPublish } from "../src/lib/auto-news/run";

function argValue(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const force = args.has("--force");
  const ignoreDailyCap = args.has("--ignore-daily-cap");
  const limitArg = argValue("limit");
  const dateArg = argValue("date");
  const limit = limitArg ? Number(limitArg) : 3;

  const result = await runAutoNewsPublish({
    force,
    ignoreDailyCap,
    date: dateArg,
    limit: Number.isFinite(limit) ? limit : 3,
  });

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok && !result.skipped) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * Manual / local runner for auto-news.
 * Examples:
 *   npm run news:auto -- --force
 *   npm run news:auto -- --force --limit=2
 */
import { runAutoNewsPublish } from "../src/lib/auto-news/run";

async function main() {
  const args = new Set(process.argv.slice(2));
  const force = args.has("--force");
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : 3;

  const result = await runAutoNewsPublish({
    force,
    limit: Number.isFinite(limit) ? limit : 3,
  });

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok && !result.skipped) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

#!/usr/bin/env tsx
/**
 * Fill missing translations for news, kennisbank, pages, catalog, SEO and UI.
 *
 * Usage:
 *   npm run content:translate
 *   npm run content:translate -- --kinds=news,kennisbank,slugs
 *   npm run content:translate -- --deadline=600000
 */
import { runContentTranslationBackfill } from "../src/lib/content-i18n-backfill";

function argValue(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

async function main() {
  const kindsRaw = argValue("kinds") || "";
  const kinds = kindsRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is "news" | "kennisbank" | "pages" | "ui" | "slugs" =>
      s === "news" ||
      s === "kennisbank" ||
      s === "pages" ||
      s === "ui" ||
      s === "slugs",
    );
  const deadlineMs = Math.max(
    30_000,
    Number(argValue("deadline") || "700000") || 700_000,
  );

  const result = await runContentTranslationBackfill({
    deadlineMs,
    kinds: kinds.length ? kinds : undefined,
  });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

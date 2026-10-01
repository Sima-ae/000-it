#!/usr/bin/env tsx
/**
 * Generate prisma/kennisbank/articles/{slug}.json for every catalog article (NL+EN).
 *
 * Usage:
 *   npx tsx prisma/kennisbank/generate-articles.ts
 *   npx tsx prisma/kennisbank/generate-articles.ts --only=wat-is-installatron
 *   npx tsx prisma/kennisbank/generate-articles.ts --force
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { writeArticle, type CatalogArticle } from "./write-article";
import { ARTICLES_DIR, validateArticleFile } from "./load-article";

type Catalog = {
  articles: CatalogArticle[];
};

function argValue(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

function argFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

function main() {
  const catalogPath = join(__dirname, "catalog.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as Catalog;
  const force = argFlag("force");
  const only = argValue("only");
  const onlySet = only
    ? new Set(only.split(",").map((s) => s.trim()).filter(Boolean))
    : null;

  mkdirSync(ARTICLES_DIR, { recursive: true });

  let written = 0;
  let skipped = 0;
  let failed = 0;

  for (const article of catalog.articles) {
    if (onlySet && !onlySet.has(article.slug)) continue;
    const outPath = join(ARTICLES_DIR, `${article.slug}.json`);
    if (!force && existsSync(outPath)) {
      skipped += 1;
      continue;
    }

    const file = writeArticle(article);
    const errors = validateArticleFile(file);
    if (errors.length) {
      console.error(`[fail] ${article.slug}: ${errors.join("; ")}`);
      failed += 1;
      continue;
    }

    writeFileSync(outPath, `${JSON.stringify(file, null, 2)}\n`, "utf8");
    written += 1;
  }

  console.log(
    `[generate-articles] written=${written} skipped=${skipped} failed=${failed} dir=${ARTICLES_DIR}`,
  );
  if (failed) process.exit(1);
}

main();

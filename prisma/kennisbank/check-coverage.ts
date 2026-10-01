#!/usr/bin/env tsx
/**
 * Coverage check: every catalog slug must have a valid NL+EN article JSON
 * without filler phrases.
 *
 * Usage: npx tsx prisma/kennisbank/check-coverage.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  listArticleSlugsOnDisk,
  loadArticleFile,
  validateArticleFile,
} from "./load-article";

type Catalog = {
  articles: { slug: string; title: string; topic: string }[];
};

function main() {
  const catalog = JSON.parse(
    readFileSync(join(__dirname, "catalog.json"), "utf8"),
  ) as Catalog;
  const onDisk = new Set(listArticleSlugsOnDisk());
  const catalogSlugs = new Set(catalog.articles.map((a) => a.slug));

  const missing: string[] = [];
  const invalid: { slug: string; errors: string[] }[] = [];

  for (const a of catalog.articles) {
    if (!onDisk.has(a.slug)) {
      missing.push(a.slug);
      continue;
    }
    const file = loadArticleFile(a.slug);
    if (!file) {
      invalid.push({ slug: a.slug, errors: ["unreadable or incomplete JSON"] });
      continue;
    }
    const errors = validateArticleFile(file);
    if (file.nl.title.trim() !== a.title.trim()) {
      errors.push(`NL title mismatch (catalog: ${a.title})`);
    }
    if (errors.length) invalid.push({ slug: a.slug, errors });
  }

  const orphans = [...onDisk].filter((s) => !catalogSlugs.has(s));

  console.log(
    `[check-coverage] catalog=${catalog.articles.length} onDisk=${onDisk.size} missing=${missing.length} invalid=${invalid.length} orphans=${orphans.length}`,
  );

  if (missing.length) {
    console.error("Missing files (first 30):");
    for (const s of missing.slice(0, 30)) console.error(`  - ${s}`);
  }
  if (invalid.length) {
    console.error("Invalid files (first 20):");
    for (const row of invalid.slice(0, 20)) {
      console.error(`  - ${row.slug}: ${row.errors.join("; ")}`);
    }
  }
  if (orphans.length) {
    console.warn("Orphan JSON files not in catalog (first 10):");
    for (const s of orphans.slice(0, 10)) console.warn(`  - ${s}`);
  }

  if (missing.length || invalid.length) process.exit(1);
  console.log("[check-coverage] OK");
}

main();

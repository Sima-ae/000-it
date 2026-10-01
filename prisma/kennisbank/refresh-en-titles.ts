#!/usr/bin/env tsx
/**
 * Refresh English titles (and seoTitle) on all article JSON files from the NL title,
 * without rewriting bodies.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ARTICLES_DIR } from "./load-article";
import { englishTitleFromDutch } from "./write-article";
import type { KennisbankArticleFile } from "./article-schema";
import { CURATED_ARTICLES } from "./curated-articles";

function main() {
  const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".json"));
  let updated = 0;
  for (const fileName of files) {
    const path = join(ARTICLES_DIR, fileName);
    const raw = JSON.parse(readFileSync(path, "utf8")) as KennisbankArticleFile;
    if (CURATED_ARTICLES[raw.slug]) continue; // keep curated EN titles
    const enTitle = englishTitleFromDutch(raw.nl.title, raw.slug);
    raw.en.title = enTitle;
    raw.en.seoTitle = `${enTitle} | TripleZero iT`;
    writeFileSync(path, `${JSON.stringify(raw, null, 2)}\n`);
    updated += 1;
  }
  console.log(`[refresh-en-titles] updated=${updated}`);
}

main();

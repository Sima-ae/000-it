#!/usr/bin/env tsx
/**
 * Full professional rebuild of all kennisbank articles (NL+EN).
 * Prefer curated → specific playbooks → unique long-form per niche.
 * Thin hand-crafted builders are no longer allowed to override long-form guides.
 *
 * Usage: npx tsx prisma/kennisbank/rebuild-all-professional.ts
 */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ARTICLES_DIR, validateArticleFile } from "./load-article";
import { writeArticle, type CatalogArticle } from "./write-article";
import { CURATED_ARTICLES } from "./curated-articles";
import { matchPlaybook } from "./professional-playbooks";
import type { KennisbankArticleFile } from "./article-schema";

type Catalog = { articles: CatalogArticle[] };

function plainLen(html: string): number {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length;
}

function main() {
  const catalog = JSON.parse(
    readFileSync(join(__dirname, "catalog.json"), "utf8"),
  ) as Catalog;
  mkdirSync(ARTICLES_DIR, { recursive: true });

  let written = 0;
  let curated = 0;
  let playbookKept = 0;
  let longform = 0;
  let failed = 0;
  let thin = 0;

  for (const article of catalog.articles) {
    let file: KennisbankArticleFile = writeArticle(article);

    if (CURATED_ARTICLES[article.slug]) {
      curated += 1;
    } else if (matchPlaybook(article)) {
      playbookKept += 1;
    } else {
      longform += 1;
    }

    if (plainLen(file.nl.bodyHtml) < 900) thin += 1;

    const errors = validateArticleFile(file);
    if (errors.length) {
      file = writeArticle(article);
      const retry = validateArticleFile(file);
      if (retry.length) {
        console.error(`[fail] ${article.slug}: ${retry.join("; ")}`);
        failed += 1;
      }
    }

    writeFileSync(
      join(ARTICLES_DIR, `${article.slug}.json`),
      `${JSON.stringify(file, null, 2)}\n`,
    );
    written += 1;
    if (written % 300 === 0) {
      console.log(`[rebuild-all] ${written}/${catalog.articles.length}`);
    }
  }

  console.log(
    `[rebuild-all-professional] written=${written} curated=${curated} playbooks=${playbookKept} longform=${longform} thin(<900)=${thin} failed=${failed}`,
  );
  if (failed) process.exit(1);
}

main();

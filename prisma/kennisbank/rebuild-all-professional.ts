#!/usr/bin/env tsx
/**
 * Rebuild all kennisbank articles (NL+EN).
 * curated → playbooks → hand-crafted topic builders (real steps) → procedural fallback.
 *
 * Usage: npx tsx prisma/kennisbank/rebuild-all-professional.ts
 */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildHandCraftedTopicHtml, buildExcerpt } from "./build-body";
import { ARTICLES_DIR, validateArticleFile } from "./load-article";
import {
  writeArticle,
  withDutchBuilderBody,
  type CatalogArticle,
} from "./write-article";
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
  let withHandNl = 0;
  let procedural = 0;
  let failed = 0;

  for (const article of catalog.articles) {
    let file: KennisbankArticleFile = writeArticle(article);
    const hasPlaybook = Boolean(matchPlaybook(article));

    if (CURATED_ARTICLES[article.slug]) {
      curated += 1;
    } else if (hasPlaybook) {
      playbookKept += 1;
    } else {
      // Prefer real hand-crafted NL topic builders over procedural fallback.
      const hand = buildHandCraftedTopicHtml(article.title, article.topic);
      if (hand && plainLen(hand) >= 280) {
        const excerpt = buildExcerpt(article.title, "nl", article.topic);
        const merged = withDutchBuilderBody(file, hand, excerpt);
        if (!validateArticleFile(merged).length) {
          file = merged;
          withHandNl += 1;
        } else {
          procedural += 1;
        }
      } else {
        procedural += 1;
      }
    }

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
    `[rebuild-all-professional] written=${written} curated=${curated} playbooks=${playbookKept} handNl=${withHandNl} procedural=${procedural} failed=${failed}`,
  );
  if (failed) process.exit(1);
}

main();

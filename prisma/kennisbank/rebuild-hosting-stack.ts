#!/usr/bin/env tsx
/**
 * Rebuild hosting-stack article JSON (domains, hosting, email, WordPress,
 * security, support, CRM, shop) using hand-crafted NL bodies when available.
 *
 * Usage: npx tsx prisma/kennisbank/rebuild-hosting-stack.ts
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

type Catalog = { articles: CatalogArticle[] };

function inHostingStack(cats: string[]): boolean {
  const roots = [
    "domeinnamen",
    "hosting",
    "e-mail",
    "wordpress",
    "beveiliging",
    "support",
    "crm-klantenpanel",
    "shop-en-pakketten",
    "ssl-certificaten",
    "webmail",
    "php-en-scripts",
    "dns-records",
  ];
  return cats.some(
    (c) => roots.includes(c) || roots.some((r) => c.startsWith(`${r}-`)),
  );
}

function main() {
  const catalog = JSON.parse(
    readFileSync(join(__dirname, "catalog.json"), "utf8"),
  ) as Catalog;
  mkdirSync(ARTICLES_DIR, { recursive: true });

  let written = 0;
  let withHand = 0;

  for (const article of catalog.articles) {
    if (CURATED_ARTICLES[article.slug]) continue;
    if (!inHostingStack(article.categories)) continue;
    // DirectAdmin already rebuilt with its own script
    if (
      article.categories.some(
        (c) => c === "directadmin" || c.startsWith("directadmin-"),
      )
    ) {
      continue;
    }

    let file = writeArticle(article);
    const hand = buildHandCraftedTopicHtml(article.title, article.topic);
    if (hand) {
      const excerpt = buildExcerpt(article.title, "nl", article.topic);
      file = withDutchBuilderBody(file, hand, excerpt);
      withHand += 1;
    }

    const errors = validateArticleFile(file);
    if (errors.length) {
      console.error(`[fail] ${article.slug}: ${errors.join("; ")}`);
      file = writeArticle(article);
    }

    writeFileSync(
      join(ARTICLES_DIR, `${article.slug}.json`),
      `${JSON.stringify(file, null, 2)}\n`,
    );
    written += 1;
  }

  console.log(
    `[rebuild-hosting-stack] written=${written} nlHandCrafted=${withHand}`,
  );
}

main();

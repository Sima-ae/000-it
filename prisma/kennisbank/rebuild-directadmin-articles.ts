#!/usr/bin/env tsx
/**
 * Rebuild DirectAdmin article JSON:
 * - NL from real DirectAdmin how-to bodies (concrete menu paths)
 * - EN from the bilingual writer (full professional English guide)
 * - Installatron family stays hand-curated
 *
 * Usage: npx tsx prisma/kennisbank/rebuild-directadmin-articles.ts
 */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  directadminExcerptsNl,
  directadminTopicBuilders,
} from "./directadmin-bodies";
import { CURATED_ARTICLES } from "./curated-articles";
import { ARTICLES_DIR, validateArticleFile } from "./load-article";
import { writeArticle, type CatalogArticle } from "./write-article";
import type { KennisbankArticleFile } from "./article-schema";

type Catalog = { articles: CatalogArticle[] };

function main() {
  const catalog = JSON.parse(
    readFileSync(join(__dirname, "catalog.json"), "utf8"),
  ) as Catalog;
  mkdirSync(ARTICLES_DIR, { recursive: true });

  let written = 0;
  let curated = 0;
  let fromBuilder = 0;

  for (const article of catalog.articles) {
    const isDa = article.categories.some(
      (c) => c === "directadmin" || c.startsWith("directadmin-"),
    );
    if (!isDa) continue;

    if (CURATED_ARTICLES[article.slug]) {
      const c = CURATED_ARTICLES[article.slug];
      const file: KennisbankArticleFile = {
        ...c,
        nl: {
          ...c.nl,
          title: article.title,
          seoTitle: c.nl.seoTitle || `${article.title} | TripleZero iT`,
          seoDescription: c.nl.seoDescription || c.nl.excerpt,
        },
        en: {
          ...c.en,
          seoTitle: c.en.seoTitle || `${c.en.title} | TripleZero iT`,
          seoDescription: c.en.seoDescription || c.en.excerpt,
        },
      };
      writeFileSync(
        join(ARTICLES_DIR, `${article.slug}.json`),
        `${JSON.stringify(file, null, 2)}\n`,
      );
      curated += 1;
      written += 1;
      continue;
    }

    const generated = writeArticle(article);
    const hasBuilder = Object.hasOwn(
      directadminTopicBuilders,
      article.topic,
    );
    const bodyNl = hasBuilder
      ? directadminTopicBuilders[article.topic]({
          title: article.title,
          topic: article.topic,
        })
      : generated.nl.bodyHtml;
    const excerptNl =
      directadminExcerptsNl[article.topic] || generated.nl.excerpt;

    const file: KennisbankArticleFile = {
      slug: article.slug,
      topic: article.topic,
      nl: {
        title: article.title,
        excerpt: excerptNl,
        bodyHtml: bodyNl,
        seoTitle: `${article.title} | TripleZero iT`,
        seoDescription: excerptNl,
      },
      en: generated.en,
    };

    const errors = validateArticleFile(file);
    if (errors.length) {
      console.error(`[fail] ${article.slug}: ${errors.join("; ")}`);
      writeFileSync(
        join(ARTICLES_DIR, `${article.slug}.json`),
        `${JSON.stringify(generated, null, 2)}\n`,
      );
    } else {
      writeFileSync(
        join(ARTICLES_DIR, `${article.slug}.json`),
        `${JSON.stringify(file, null, 2)}\n`,
      );
      if (hasBuilder) fromBuilder += 1;
    }
    written += 1;
  }

  console.log(
    `[rebuild-directadmin] written=${written} curated=${curated} nlFromBuilder=${fromBuilder}`,
  );
}

main();

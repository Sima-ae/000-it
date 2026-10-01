#!/usr/bin/env tsx
/** Force-improve EN for slugs listed in .cache/kb-en-improve.json (shared EN clusters). */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { ARTICLES_DIR, validateArticleFile } from "./load-article";
import { isTemplateFillerHtml } from "./article-schema";
import type { KennisbankArticleFile } from "./article-schema";
import { buildHandwrittenUniqueGuide } from "./handwritten-unique-guide";
import { englishTitleFromDutch } from "./write-article";

type Catalog = {
  articles: { slug: string; title: string; categories: string[]; topic: string }[];
};

function main() {
  const catalog = JSON.parse(
    readFileSync(join(__dirname, "catalog.json"), "utf8"),
  ) as Catalog;
  const { improveSlugs } = JSON.parse(
    readFileSync(join(process.cwd(), ".cache/kb-en-improve.json"), "utf8"),
  ) as { improveSlugs: string[] };
  const set = new Set(improveSlugs);

  let improved = 0;
  let failed = 0;

  for (const article of catalog.articles) {
    if (!set.has(article.slug)) continue;
    const path = join(ARTICLES_DIR, `${article.slug}.json`);
    const file = JSON.parse(readFileSync(path, "utf8")) as KennisbankArticleFile;
    const enTitle = englishTitleFromDutch(article.title, article.slug);
    const guide = buildHandwrittenUniqueGuide(
      {
        slug: article.slug,
        title: article.title,
        topic: article.topic,
        categories: article.categories,
      },
      enTitle,
    );
    const next: KennisbankArticleFile = {
      ...file,
      en: {
        ...file.en,
        title: enTitle,
        excerpt: guide.excerptEn,
        bodyHtml: guide.bodyEn,
        seoTitle: `${enTitle} | TripleZero iT`,
        seoDescription: guide.excerptEn,
      },
    };
    const errors = validateArticleFile(next);
    if (errors.length || isTemplateFillerHtml(next.en.bodyHtml)) {
      console.error(`[fail] ${article.slug}: ${errors.join("; ") || "filler"}`);
      failed += 1;
      continue;
    }
    writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
    improved += 1;
  }

  const eg = new Map<string, number>();
  for (const a of catalog.articles) {
    const en =
      (JSON.parse(readFileSync(join(ARTICLES_DIR, `${a.slug}.json`), "utf8")) as KennisbankArticleFile)
        .en.bodyHtml || "";
    const h = createHash("sha1")
      .update(en.replace(/“[^”]+”/g, "TITLE"))
      .digest("hex")
      .slice(0, 16);
    eg.set(h, (eg.get(h) || 0) + 1);
  }
  const shared = [...eg.values()].filter((c) => c >= 4).length;
  console.log(
    `[improve-en-shared] improved=${improved} failed=${failed} enUnique=${eg.size} enClustersGe4=${shared}`,
  );
  if (failed) process.exit(1);
}

main();

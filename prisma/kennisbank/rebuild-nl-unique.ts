#!/usr/bin/env tsx
/**
 * Phase 1: rewrite only NL articles classified as shared/wrong/thin.
 * KEEP slugs are left untouched. Composer also writes matching EN for rewrite set
 * (aligned with new NL); KEEP EN is improved in Phase 2.
 *
 * Usage: npx tsx prisma/kennisbank/rebuild-nl-unique.ts
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
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

type Classify = {
  keepSlugs: string[];
  rewriteSlugs: string[];
};

function plainLen(html: string): number {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length;
}

function normHash(html: string): string {
  // Only neutralize quoted titles — keep object words so per-title bodies stay distinct.
  const n = html.replace(/“[^”]+”/g, "TITLE").replace(/&ldquo;.*?&rdquo;/g, "TITLE");
  return createHash("sha1").update(n).digest("hex").slice(0, 16);
}

function main() {
  const catalog = JSON.parse(
    readFileSync(join(__dirname, "catalog.json"), "utf8"),
  ) as Catalog;
  const classifyPath = join(process.cwd(), ".cache/kb-nl-classify.json");
  if (!existsSync(classifyPath)) {
    console.error("Missing .cache/kb-nl-classify.json — run classify first");
    process.exit(1);
  }
  const classify = JSON.parse(readFileSync(classifyPath, "utf8")) as Classify;
  const rewrite = new Set(classify.rewriteSlugs);
  const keep = new Set(classify.keepSlugs);

  let rewritten = 0;
  let kept = 0;
  let failed = 0;
  const hashes = new Map<string, string[]>();

  for (const article of catalog.articles) {
    const path = join(ARTICLES_DIR, `${article.slug}.json`);
    const existing = JSON.parse(readFileSync(path, "utf8")) as KennisbankArticleFile;

    if (keep.has(article.slug) && !rewrite.has(article.slug)) {
      kept += 1;
      const h = normHash(existing.nl.bodyHtml);
      if (!hashes.has(h)) hashes.set(h, []);
      hashes.get(h)!.push(article.slug);
      continue;
    }

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

    if (isTemplateFillerHtml(guide.bodyNl) || plainLen(guide.bodyNl) < 280) {
      console.error(`[fail-quality] ${article.slug}`);
      failed += 1;
      continue;
    }

    const next: KennisbankArticleFile = {
      ...existing,
      slug: article.slug,
      topic: article.topic,
      nl: {
        ...existing.nl,
        title: article.title,
        excerpt: guide.excerptNl,
        bodyHtml: guide.bodyNl,
        seoTitle: `${article.title} | TripleZero iT`,
        seoDescription: guide.excerptNl,
      },
      en: {
        ...existing.en,
        title: enTitle,
        excerpt: guide.excerptEn,
        bodyHtml: guide.bodyEn,
        seoTitle: `${enTitle} | TripleZero iT`,
        seoDescription: guide.excerptEn,
      },
    };

    const errors = validateArticleFile(next);
    if (errors.length) {
      console.error(`[fail] ${article.slug}: ${errors.join("; ")}`);
      failed += 1;
      continue;
    }

    writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
    rewritten += 1;
    const h = normHash(next.nl.bodyHtml);
    if (!hashes.has(h)) hashes.set(h, []);
    hashes.get(h)!.push(article.slug);

    if (rewritten % 200 === 0) {
      console.log(`[rebuild-nl-unique] rewritten=${rewritten}`);
    }
  }

  const shared = [...hashes.entries()]
    .filter(([, s]) => s.length >= 4)
    .sort((a, b) => b[1].length - a[1].length);

  console.log(
    `[rebuild-nl-unique] kept=${kept} rewritten=${rewritten} failed=${failed} uniqueShapes=${hashes.size} sharedClusters>=4=${shared.length}`,
  );
  if (shared.length) {
    console.log(
      "largest remaining clusters",
      shared.slice(0, 10).map(([, s]) => `${s.length}:${s[0]}`),
    );
  }
  if (failed) process.exit(1);
}

main();

#!/usr/bin/env tsx
/**
 * Phase 2: improve EN using final NL as source of truth.
 * - KEEP articles with weak/mismatched EN → regenerate EN from unique composer (NL untouched)
 * - REWRITE articles already received matching EN in Phase 1
 *
 * Usage: npx tsx prisma/kennisbank/improve-en-from-nl.ts
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ARTICLES_DIR, validateArticleFile } from "./load-article";
import { isTemplateFillerHtml } from "./article-schema";
import type { KennisbankArticleFile } from "./article-schema";
import { buildHandwrittenUniqueGuide } from "./handwritten-unique-guide";
import { englishTitleFromDutch } from "./write-article";

type Catalog = {
  articles: { slug: string; title: string; categories: string[]; topic: string }[];
};

function plain(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function enNeedsImprove(nlHtml: string, enHtml: string): boolean {
  const enP = plain(enHtml || "");
  const nlP = plain(nlHtml || "");
  if (!enHtml || enP.length < 200) return true;
  if (isTemplateFillerHtml(enHtml)) return true;
  if (enHtml === nlHtml) return true;
  if (enP.length < nlP.length * 0.45) return true;
  // Heavy Dutch leftovers in EN body
  if (
    /\b(hoe |wat is |voorbereiding|stappenplan|klantenpanel|domeinnaam|wachtwoord|instellingen)\b/i.test(
      enP,
    ) &&
    !/\b(preparation|steps|password|settings|client panel)\b/i.test(enP)
  ) {
    return true;
  }
  return false;
}

function main() {
  const catalog = JSON.parse(
    readFileSync(join(__dirname, "catalog.json"), "utf8"),
  ) as Catalog;
  const classifyPath = join(process.cwd(), ".cache/kb-nl-classify.json");
  const classify = existsSync(classifyPath)
    ? (JSON.parse(readFileSync(classifyPath, "utf8")) as {
        keepSlugs: string[];
        rewriteSlugs: string[];
      })
    : { keepSlugs: [], rewriteSlugs: [] };

  // Prefer improving KEEP (rewrite already got fresh EN). Also catch any rewrite EN that drifted.
  let improved = 0;
  let skipped = 0;
  let failed = 0;

  for (const article of catalog.articles) {
    const path = join(ARTICLES_DIR, `${article.slug}.json`);
    const file = JSON.parse(readFileSync(path, "utf8")) as KennisbankArticleFile;

    if (!enNeedsImprove(file.nl.bodyHtml, file.en?.bodyHtml || "")) {
      skipped += 1;
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

    // Keep NL as-is (source of truth). Only replace EN.
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

    if (isTemplateFillerHtml(next.en.bodyHtml) || plain(next.en.bodyHtml).length < 200) {
      console.error(`[fail-en] ${article.slug}`);
      failed += 1;
      continue;
    }

    const errors = validateArticleFile(next);
    if (errors.length) {
      console.error(`[fail] ${article.slug}: ${errors.join("; ")}`);
      failed += 1;
      continue;
    }

    writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
    improved += 1;
  }

  console.log(
    `[improve-en-from-nl] improved=${improved} skipped=${skipped} failed=${failed} keepSet=${classify.keepSlugs.length}`,
  );
  if (failed) process.exit(1);
}

main();

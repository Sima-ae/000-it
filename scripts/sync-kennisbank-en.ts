#!/usr/bin/env tsx
/** Sync EN translations only from articles/*.json (faster than full sync). */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "../src/lib/prisma";
import { ARTICLES_DIR } from "../prisma/kennisbank/load-article";
import type { KennisbankArticleFile } from "../prisma/kennisbank/article-schema";

async function main() {
  const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".json"));
  let n = 0;
  for (const f of files) {
    const raw = JSON.parse(
      readFileSync(join(ARTICLES_DIR, f), "utf8"),
    ) as KennisbankArticleFile;
    const row = await prisma.kennisbankArticle.findUnique({
      where: { slug: raw.slug },
      select: { id: true },
    });
    if (!row) continue;
    await prisma.kennisbankArticleTranslation.upsert({
      where: { articleId_locale: { articleId: row.id, locale: "en" } },
      create: {
        articleId: row.id,
        locale: "en",
        title: raw.en.title,
        excerpt: raw.en.excerpt,
        bodyHtml: raw.en.bodyHtml,
        seoTitle: raw.en.seoTitle || null,
        seoDescription: raw.en.seoDescription || null,
      },
      update: {
        title: raw.en.title,
        excerpt: raw.en.excerpt,
        bodyHtml: raw.en.bodyHtml,
        seoTitle: raw.en.seoTitle || null,
        seoDescription: raw.en.seoDescription || null,
      },
    });
    n += 1;
    if (n % 200 === 0) console.log(`[sync-en] ${n}/${files.length}`);
  }
  console.log(`[sync-en] done ${n}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

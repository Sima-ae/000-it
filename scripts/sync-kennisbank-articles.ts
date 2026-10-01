#!/usr/bin/env tsx
/**
 * Fast sync: write NL+EN from articles/*.json into the DB and purge other locales.
 * Does not touch categories.
 *
 * Usage: npx tsx --env-file=.env scripts/sync-kennisbank-articles.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "../src/lib/prisma";
import { loadArticleFile } from "../prisma/kennisbank/load-article";
import { writeArticle } from "../prisma/kennisbank/write-article";

type Catalog = {
  articles: { slug: string; title: string; categories: string[]; topic: string }[];
};

async function main() {
  const catalog = JSON.parse(
    readFileSync(join(__dirname, "../prisma/kennisbank/catalog.json"), "utf8"),
  ) as Catalog;

  let updated = 0;
  let missing = 0;
  let created = 0;

  for (let i = 0; i < catalog.articles.length; i += 1) {
    const article = catalog.articles[i];
    const onDisk = loadArticleFile(article.slug);
    const file =
      onDisk ||
      writeArticle({
        slug: article.slug,
        title: article.title,
        categories: article.categories,
        topic: article.topic,
      });
    if (!onDisk) missing += 1;

    let row = await prisma.kennisbankArticle.findUnique({
      where: { slug: article.slug },
      select: { id: true },
    });
    if (!row) {
      row = await prisma.kennisbankArticle.create({
        data: { slug: article.slug, published: true },
        select: { id: true },
      });
      created += 1;
    }

    const nlPayload = {
      title: file.nl.title || article.title,
      excerpt: file.nl.excerpt,
      bodyHtml: file.nl.bodyHtml,
      seoTitle: file.nl.seoTitle || `${article.title} | TripleZero iT`,
      seoDescription: file.nl.seoDescription || file.nl.excerpt,
    };
    const enPayload = {
      title: file.en.title,
      excerpt: file.en.excerpt,
      bodyHtml: file.en.bodyHtml,
      seoTitle: file.en.seoTitle || `${file.en.title} | TripleZero iT`,
      seoDescription: file.en.seoDescription || file.en.excerpt,
    };

    await prisma.kennisbankArticleTranslation.upsert({
      where: { articleId_locale: { articleId: row.id, locale: "nl" } },
      create: { articleId: row.id, locale: "nl", ...nlPayload },
      update: nlPayload,
    });
    await prisma.kennisbankArticleTranslation.upsert({
      where: { articleId_locale: { articleId: row.id, locale: "en" } },
      create: { articleId: row.id, locale: "en", ...enPayload },
      update: enPayload,
    });
    await prisma.kennisbankArticleTranslation.deleteMany({
      where: { articleId: row.id, locale: { notIn: ["nl", "en"] } },
    });

    updated += 1;
    if ((i + 1) % 100 === 0 || i === catalog.articles.length - 1) {
      console.log(`[sync] ${i + 1}/${catalog.articles.length}`);
    }
  }

  console.log(
    `[sync-kennisbank-articles] updated=${updated} createdArticles=${created} missingJsonFallback=${missing}`,
  );
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

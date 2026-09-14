#!/usr/bin/env tsx
/**
 * Backfill Kennisbank category + article translations for ALL enabled languages.
 *
 * IMPORTANT: Run `npm run kennisbank:repair` first so English titles/bodies are
 * real NL→EN translations (not the broken slug-glossary mix). This script then
 * translates from clean EN into every other locale. Curated Dutch is never overwritten.
 *
 * Usage:
 *   npm run kennisbank:translate
 *   npm run kennisbank:translate -- --categories-only
 *   npm run kennisbank:translate -- --articles-only --limit=20
 *   npm run kennisbank:translate -- --locale=el,tr,ar
 *   npm run kennisbank:translate -- --force
 */
import { prisma } from "../src/lib/prisma";
import { enabledLanguages } from "../src/i18n/languages";
import {
  fillArticleTranslations,
  fillCategoryTranslations,
  pickKennisbankSourceLocale,
} from "../src/lib/kennisbank-i18n";

function argFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

function argValue(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

async function main() {
  const force = argFlag("force");
  const categoriesOnly = argFlag("categories-only");
  const articlesOnly = argFlag("articles-only");
  const limit = Math.max(1, Number(argValue("limit") || "9999") || 9999);
  const localeArg = argValue("locale");
  const allCodes = enabledLanguages().map((l) => l.code);
  const onlyLocales = localeArg
    ? localeArg
        .split(",")
        .map((s) => s.trim())
        .filter((c) => allCodes.includes(c))
    : null;

  console.log(
    `[kennisbank:translate] force=${force} categoriesOnly=${categoriesOnly} articlesOnly=${articlesOnly} limit=${limit}`,
  );
  if (onlyLocales) console.log(`[kennisbank:translate] locales=${onlyLocales.join(",")}`);

  if (!articlesOnly) {
    const categories = await prisma.kennisbankCategory.findMany({
      include: { translations: true },
      orderBy: { sortKey: "asc" },
    });

    console.log(`[categories] ${categories.length}`);
    for (const cat of categories) {
      const sourceLocale = pickKennisbankSourceLocale(
        cat.translations.map((t) => t.locale),
      );
      const sourceRow = cat.translations.find((t) => t.locale === sourceLocale);
      if (!sourceRow) {
        console.warn(`[skip category] ${cat.slug} — no source translation`);
        continue;
      }

      const targets = (onlyLocales || allCodes).filter((l) => l !== sourceLocale);
      const { written, skipped } = await fillCategoryTranslations({
        categoryId: cat.id,
        source: { name: sourceRow.name, description: sourceRow.description },
        sourceLocale,
        locales: targets,
        force,
        delayMs: 260,
      });
      console.log(
        `[cat] ${cat.slug} src=${sourceLocale} wrote=${written.length} skipped=${skipped.length}`,
      );
    }
  }

  if (!categoriesOnly) {
    const articles = await prisma.kennisbankArticle.findMany({
      include: { translations: true },
      orderBy: { createdAt: "asc" },
      take: limit,
    });

    console.log(`[articles] ${articles.length}`);
    let i = 0;
    for (const article of articles) {
      i += 1;
      const sourceLocale = pickKennisbankSourceLocale(
        article.translations.map((t) => t.locale),
      );
      const sourceRow = article.translations.find((t) => t.locale === sourceLocale);
      if (!sourceRow) {
        console.warn(`[skip article] ${article.slug} — no source translation`);
        continue;
      }

      const targets = (onlyLocales || allCodes).filter((l) => l !== sourceLocale);
      const { written, skipped } = await fillArticleTranslations({
        articleId: article.id,
        source: {
          title: sourceRow.title,
          excerpt: sourceRow.excerpt,
          bodyHtml: sourceRow.bodyHtml,
          seoTitle: sourceRow.seoTitle,
          seoDescription: sourceRow.seoDescription,
        },
        sourceLocale,
        locales: targets,
        force,
        delayMs: 320,
      });
      console.log(
        `[art ${i}/${articles.length}] ${article.slug} src=${sourceLocale} wrote=${written.length} skipped=${skipped.length}`,
      );
    }
  }

  console.log("[kennisbank:translate] done");
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});

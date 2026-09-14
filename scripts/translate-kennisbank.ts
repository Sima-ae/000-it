#!/usr/bin/env tsx
/**
 * Backfill Kennisbank category + article translations for ALL enabled languages.
 *
 * Skips locales that already look correctly translated (not Dutch leftover,
 * not a copy of EN/NL). Pass --force to rebuild everything.
 *
 * IMPORTANT: Run `npm run kennisbank:repair` first so English titles/bodies are
 * real NL→EN translations (not the broken slug-glossary mix). This script then
 * translates from clean EN into every other locale. Curated Dutch is never overwritten.
 *
 * Usage:
 *   npm run kennisbank:translate
 *   npm run kennisbank:translate -- --categories-only
 *   npm run kennisbank:translate -- --articles-only --limit=20
 *   npm run kennisbank:translate -- --articles-only --offset=40 --limit=40
 *   npm run kennisbank:translate -- --locale=el,tr,ar
 *   npm run kennisbank:translate -- --force
 */
import { prisma } from "../src/lib/prisma";
import { enabledLanguages } from "../src/i18n/languages";
import {
  fillArticleTranslations,
  fillCategoryTranslations,
  localesNeedingArticleFill,
  localesNeedingCategoryFill,
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
  const offset = Math.max(0, Number(argValue("offset") || "0") || 0);
  const localeArg = argValue("locale");
  const allCodes = enabledLanguages().map((l) => l.code);
  const onlyLocales = localeArg
    ? localeArg
        .split(",")
        .map((s) => s.trim())
        .filter((c) => allCodes.includes(c))
    : null;

  console.log(
    `[kennisbank:translate] force=${force} categoriesOnly=${categoriesOnly} articlesOnly=${articlesOnly} offset=${offset} limit=${limit}`,
  );
  if (onlyLocales) console.log(`[kennisbank:translate] locales=${onlyLocales.join(",")}`);

  let catWrote = 0;
  let catSkipped = 0;
  let artWrote = 0;
  let artSkipped = 0;

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

      const source = { name: sourceRow.name, description: sourceRow.description };
      const nlName = cat.translations.find((t) => t.locale === "nl")?.name;
      const candidateTargets = (onlyLocales || allCodes).filter((l) => l !== sourceLocale);
      const targets = force
        ? candidateTargets.filter((l) => l !== "nl" || sourceLocale === "nl")
        : localesNeedingCategoryFill({
            translations: cat.translations,
            source,
            sourceLocale,
            targets: candidateTargets,
            nlName,
          });

      if (!targets.length) {
        catSkipped += 1;
        console.log(`[cat] ${cat.slug} skipped (already translated)`);
        continue;
      }

      const { written, skipped, failed } = await fillCategoryTranslations({
        categoryId: cat.id,
        source,
        sourceLocale,
        locales: targets,
        force,
        delayMs: 260,
        existing: cat.translations,
        nlName,
      });
      catWrote += written.length;
      catSkipped += skipped.length;
      console.log(
        `[cat] ${cat.slug} src=${sourceLocale} wrote=${written.length} skipped=${skipped.length} failed=${failed.length}${
          written.length ? ` +${written.join(",")}` : ""
        }`,
      );
    }
  }

  if (!categoriesOnly) {
    const articles = await prisma.kennisbankArticle.findMany({
      include: { translations: true },
      orderBy: { createdAt: "asc" },
      skip: offset,
      take: limit,
    });

    console.log(`[articles] ${articles.length} (offset=${offset})`);
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

      const source = {
        title: sourceRow.title,
        excerpt: sourceRow.excerpt,
        bodyHtml: sourceRow.bodyHtml,
        seoTitle: sourceRow.seoTitle,
        seoDescription: sourceRow.seoDescription,
      };
      const nlTitle = article.translations.find((t) => t.locale === "nl")?.title;
      const candidateTargets = (onlyLocales || allCodes).filter((l) => l !== sourceLocale);
      const targets = force
        ? candidateTargets.filter((l) => l !== "nl" || sourceLocale === "nl")
        : localesNeedingArticleFill({
            translations: article.translations,
            source,
            sourceLocale,
            targets: candidateTargets,
            nlTitle,
          });

      if (!targets.length) {
        artSkipped += 1;
        console.log(
          `[art ${i}/${articles.length}] ${article.slug} skipped (already translated)`,
        );
        continue;
      }

      const { written, skipped, failed } = await fillArticleTranslations({
        articleId: article.id,
        source,
        sourceLocale,
        locales: targets,
        force,
        delayMs: 320,
        existing: article.translations,
        nlTitle,
      });
      artWrote += written.length;
      artSkipped += skipped.length;
      console.log(
        `[art ${i}/${articles.length}] ${article.slug} src=${sourceLocale} need=${targets.length} wrote=${written.length} skipped=${skipped.length} failed=${failed.length}${
          written.length ? ` +${written.join(",")}` : ""
        }`,
      );
    }
  }

  console.log(
    `[kennisbank:translate] done catWrote=${catWrote} catSkipped=${catSkipped} artWrote=${artWrote} artSkipped=${artSkipped}`,
  );
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});

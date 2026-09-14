#!/usr/bin/env tsx
/**
 * Repair corrupted Kennisbank EN (and optionally all other locales).
 *
 * Root cause: seed used englishTitleFromSlug() — a word-by-word slug glossary
 * that left Dutch tokens in "English" titles (e.g. "How meet I or … werk resultaat").
 * Other locales were then machine-translated FROM that broken EN.
 *
 * This script:
 *   1. Re-syncs NL title/excerpt/body from catalog.json (source of truth)
 *   2. Rebuilds EN via proper NL→EN machine translation (title + excerpt + body)
 *   3. Optionally force-rebuilds every other locale from the new EN (--all)
 *
 * Usage (on server, after deploy):
 *   npx --yes tsx --env-file=.env scripts/repair-kennisbank.ts
 *   npx --yes tsx --env-file=.env scripts/repair-kennisbank.ts --limit=20
 *   npx --yes tsx --env-file=.env scripts/repair-kennisbank.ts --all --delay=800
 *   npx --yes tsx --env-file=.env scripts/repair-kennisbank.ts --en-only
 *   npx --yes tsx --env-file=.env scripts/repair-kennisbank.ts --nl-only
 *   npx --yes tsx --env-file=.env scripts/repair-kennisbank.ts --purge-other
 *     → delete broken non-NL rows so UI falls back to clean Dutch immediately
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "../src/lib/prisma";
import { enabledLanguages } from "../src/i18n/languages";
import { buildArticleHtml, buildExcerpt } from "../prisma/kennisbank/build-body";
import { englishTitleFromSlug } from "../prisma/kennisbank/i18n";
import { fillArticleTranslations } from "../src/lib/kennisbank-i18n";
import { translateHtml, translateText } from "../src/lib/google-translate";

type Catalog = {
  categories: [string, string, string][];
  articles: { slug: string; title: string; categories: string[]; topic: string }[];
};

function argFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

function argValue(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isGenericEnglishBody(html: string) {
  return (
    /knowledge-base article explains/i.test(html) ||
    /Professional TripleZero iT Hosting guide:/i.test(html)
  );
}

function needsEnglishRepair(
  enTitle: string | undefined,
  nlTitle: string,
  slug: string,
  enBody: string | undefined,
): boolean {
  if (!enTitle?.trim() || !enBody?.trim()) return true;
  const glossary = englishTitleFromSlug(slug, nlTitle);
  if (enTitle.trim() === glossary.trim()) return true;
  if (isGenericEnglishBody(enBody)) return true;
  // Residual Dutch tokens left by the glossary mixer
  const dutchResidue =
    /\b(betekenen|verbeter|resultaat|oplevert|vindbaarheid|volledig|traject|verschil|bereid|bestel|optimalisatie|passen|lage|meet|werk|antwoordengines|veelgemaakte|fouten|schaden|lokale|google)\b/i;
  if (dutchResidue.test(enTitle) && enTitle.trim() !== nlTitle.trim()) {
    return true;
  }
  return false;
}

async function main() {
  const force = argFlag("force");
  const nlOnly = argFlag("nl-only");
  const enOnly = argFlag("en-only");
  const allLocales = argFlag("all");
  const purgeOther = argFlag("purge-other");
  const limit = Math.max(1, Number(argValue("limit") || "9999") || 9999);
  const delayMs = Math.max(200, Number(argValue("delay") || "700") || 700);
  const offset = Math.max(0, Number(argValue("offset") || "0") || 0);

  const catalogPath = join(__dirname, "../prisma/kennisbank/catalog.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as Catalog;
  const bySlug = new Map(catalog.articles.map((a) => [a.slug, a]));

  const articles = await prisma.kennisbankArticle.findMany({
    include: { translations: true },
    orderBy: { createdAt: "asc" },
    skip: offset,
    take: limit,
  });

  console.log(
    `[repair-kennisbank] articles=${articles.length} offset=${offset} force=${force} nlOnly=${nlOnly} enOnly=${enOnly} all=${allLocales} delayMs=${delayMs}`,
  );

  let nlFixed = 0;
  let enFixed = 0;
  let enSkipped = 0;
  let localesFixed = 0;

  for (let i = 0; i < articles.length; i += 1) {
    const article = articles[i];
    const cat = bySlug.get(article.slug);
    if (!cat) {
      console.warn(`[skip] ${article.slug} — not in catalog.json`);
      continue;
    }

    const existingNl = article.translations.find((t) => t.locale === "nl");
    const existingEn = article.translations.find((t) => t.locale === "en");

    // 1) Restore curated Dutch from catalog
    const bodyNl = buildArticleHtml(cat.title, cat.topic, "nl");
    const excerptNl = buildExcerpt(cat.title, "nl");
    const nlPayload = {
      title: cat.title,
      excerpt: excerptNl,
      bodyHtml: bodyNl,
      seoTitle: `${cat.title} | TripleZero iT Hosting`,
      seoDescription: excerptNl,
    };

    const nlNeedsWrite =
      force ||
      !existingNl ||
      existingNl.title.trim() !== cat.title.trim() ||
      !existingNl.bodyHtml?.trim();

    if (nlNeedsWrite) {
      await prisma.kennisbankArticleTranslation.upsert({
        where: {
          articleId_locale: { articleId: article.id, locale: "nl" },
        },
        create: { articleId: article.id, locale: "nl", ...nlPayload },
        update: nlPayload,
      });
      nlFixed += 1;
    }

    // Drop broken non-NL rows so list/detail immediately show clean Dutch
    // (locale → nl → en fallback) instead of MT-from-glossary garbage.
    if (purgeOther) {
      const deleted = await prisma.kennisbankArticleTranslation.deleteMany({
        where: {
          articleId: article.id,
          locale: { not: "nl" },
        },
      });
      if (deleted.count) {
        console.log(
          `[purge] ${article.slug} removed ${deleted.count} non-NL locale(s)`,
        );
      }
    }

    if (nlOnly) {
      console.log(`[nl] ${i + 1}/${articles.length} ${article.slug}`);
      continue;
    }

    if (purgeOther && !enOnly && !allLocales && !force) {
      // After purge + NL restore, stop unless caller asked to rebuild EN/all.
      continue;
    }

    // 2) Rebuild English from Dutch via real MT
    const repairEn =
      force ||
      needsEnglishRepair(
        existingEn?.title,
        cat.title,
        article.slug,
        existingEn?.bodyHtml,
      );

    let enSource = existingEn
      ? {
          title: existingEn.title,
          excerpt: existingEn.excerpt,
          bodyHtml: existingEn.bodyHtml,
          seoTitle: existingEn.seoTitle,
          seoDescription: existingEn.seoDescription,
        }
      : null;

    if (repairEn) {
      try {
        const title =
          (await translateText(nlPayload.title, "en", "nl")) || nlPayload.title;
        await sleep(150);
        const excerpt =
          (await translateText(nlPayload.excerpt, "en", "nl")) ||
          buildExcerpt(title, "en");
        await sleep(150);
        const bodyHtml =
          (await translateHtml(nlPayload.bodyHtml, "en", "nl")) ||
          buildArticleHtml(title, cat.topic, "en");
        await sleep(150);
        const seoTitle =
          (await translateText(nlPayload.seoTitle, "en", "nl")) ||
          `${title} | TripleZero iT Hosting`;
        await sleep(100);
        const seoDescription =
          (await translateText(nlPayload.seoDescription, "en", "nl")) || excerpt;

        enSource = { title, excerpt, bodyHtml, seoTitle, seoDescription };
        await prisma.kennisbankArticleTranslation.upsert({
          where: {
            articleId_locale: { articleId: article.id, locale: "en" },
          },
          create: { articleId: article.id, locale: "en", ...enSource },
          update: enSource,
        });
        enFixed += 1;
        console.log(
          `[en] ${i + 1}/${articles.length} ${article.slug} → ${title.slice(0, 70)}`,
        );
        await sleep(delayMs);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`[en-fail] ${article.slug}: ${msg}`);
        if (msg.includes("rate-limited")) await sleep(30_000);
        continue;
      }
    } else {
      enSkipped += 1;
      console.log(`[en-skip] ${i + 1}/${articles.length} ${article.slug}`);
    }

    if (enOnly || !enSource) continue;

    // 3) Rebuild all other locales from clean EN
    if (allLocales || force) {
      const targets = enabledLanguages()
        .map((l) => l.code)
        .filter((c) => c !== "en" && c !== "nl");
      const { written } = await fillArticleTranslations({
        articleId: article.id,
        source: enSource,
        sourceLocale: "en",
        locales: targets,
        force: true,
        delayMs,
      });
      localesFixed += written.length;
      console.log(
        `[i18n] ${article.slug} wrote=${written.length}/${targets.length}`,
      );
    }
  }

  console.log(
    `[repair-kennisbank] done nlFixed=${nlFixed} enFixed=${enFixed} enSkipped=${enSkipped} localeWrites=${localesFixed}`,
  );
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});

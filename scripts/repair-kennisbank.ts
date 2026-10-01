#!/usr/bin/env tsx
/**
 * Sync kennisbank NL+EN from prisma/kennisbank/articles/{slug}.json
 * and purge other article locales (UI falls back to nl → en).
 *
 * Usage:
 *   npm run kennisbank:repair -- --nl-en
 *   npm run kennisbank:repair -- --nl-en --limit=50
 *   npm run kennisbank:repair -- --purge-other
 *   npm run kennisbank:repair -- --nl-en --force
 *
 * Legacy MT flags (--en-only / --all) remain available but prefer --nl-en
 * after the curated article JSON rewrite.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "../src/lib/prisma";
import { enabledLanguages } from "../src/i18n/languages";
import { loadArticleFile } from "../prisma/kennisbank/load-article";
import { writeArticle } from "../prisma/kennisbank/write-article";
import {
  fillArticleTranslations,
  localesNeedingArticleFill,
} from "../src/lib/kennisbank-i18n";
import {
  isAcceptableTranslation,
  translateHtml,
  translateText,
} from "../src/lib/google-translate";
import { isGoodArticleTranslation } from "../src/lib/kennisbank-i18n";

type Catalog = {
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

async function main() {
  const force = argFlag("force");
  const nlEn = argFlag("nl-en") || (!argFlag("en-only") && !argFlag("all") && !argFlag("nl-only") && !argFlag("purge-other"));
  const nlOnly = argFlag("nl-only");
  const enOnly = argFlag("en-only");
  const allLocales = argFlag("all");
  const purgeOther = argFlag("purge-other") || nlEn;
  const limit = Math.max(1, Number(argValue("limit") || "9999") || 9999);
  const defaultDelay = enOnly || allLocales ? "2500" : "100";
  const delayMs = Math.max(50, Number(argValue("delay") || defaultDelay) || Number(defaultDelay));
  const fieldDelayMs = Math.max(
    50,
    Number(argValue("field-delay") || (enOnly ? "600" : "50")) || 50,
  );
  const offset = Math.max(0, Number(argValue("offset") || "0") || 0);
  const maxRetries = Math.max(1, Number(argValue("retries") || "4") || 4);
  const slugsFile = argValue("slugs-file");

  const catalogPath = join(__dirname, "../prisma/kennisbank/catalog.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as Catalog;
  const bySlug = new Map(catalog.articles.map((a) => [a.slug, a]));

  let slugFilter: Set<string> | null = null;
  if (slugsFile) {
    const raw = JSON.parse(readFileSync(slugsFile, "utf8")) as
      | { slug: string }[]
      | string[];
    const list = Array.isArray(raw)
      ? raw.map((row) => (typeof row === "string" ? row : row.slug)).filter(Boolean)
      : [];
    slugFilter = new Set(list);
  }

  const articles = slugFilter
    ? await prisma.kennisbankArticle.findMany({
        where: { slug: { in: [...slugFilter] } },
        include: { translations: true },
        orderBy: { createdAt: "asc" },
      })
    : await prisma.kennisbankArticle.findMany({
        skip: offset,
        take: limit,
        include: { translations: true },
        orderBy: { createdAt: "asc" },
      });

  const scoped = slugFilter
    ? articles.slice(offset, offset + limit)
    : articles;

  console.log(
    `[repair-kennisbank] articles=${scoped.length} offset=${offset} force=${force} nlEn=${nlEn} nlOnly=${nlOnly} enOnly=${enOnly} all=${allLocales} purgeOther=${purgeOther}`,
  );

  let nlFixed = 0;
  let enFixed = 0;
  let purged = 0;
  let localesFixed = 0;
  let localesSkipped = 0;
  let missing = 0;

  for (let i = 0; i < scoped.length; i += 1) {
    const article = scoped[i];
    const cat = bySlug.get(article.slug);
    if (!cat) {
      console.warn(`[skip] ${article.slug} — not in catalog.json`);
      continue;
    }

    const file =
      loadArticleFile(article.slug) ||
      writeArticle({
        slug: cat.slug,
        title: cat.title,
        categories: cat.categories,
        topic: cat.topic,
      });
    if (!loadArticleFile(article.slug)) missing += 1;

    const nlPayload = {
      title: file.nl.title || cat.title,
      excerpt: file.nl.excerpt,
      bodyHtml: file.nl.bodyHtml,
      seoTitle: file.nl.seoTitle || `${cat.title} | TripleZero iT`,
      seoDescription: file.nl.seoDescription || file.nl.excerpt,
    };
    const enPayload = {
      title: file.en.title,
      excerpt: file.en.excerpt,
      bodyHtml: file.en.bodyHtml,
      seoTitle: file.en.seoTitle || `${file.en.title} | TripleZero iT`,
      seoDescription: file.en.seoDescription || file.en.excerpt,
    };

    if (nlEn || nlOnly || force) {
      await prisma.kennisbankArticleTranslation.upsert({
        where: {
          articleId_locale: { articleId: article.id, locale: "nl" },
        },
        create: { articleId: article.id, locale: "nl", ...nlPayload },
        update: nlPayload,
      });
      nlFixed += 1;
    }

    if (nlEn || (!nlOnly && !enOnly && !allLocales) || force) {
      if (!enOnly || nlEn) {
        await prisma.kennisbankArticleTranslation.upsert({
          where: {
            articleId_locale: { articleId: article.id, locale: "en" },
          },
          create: { articleId: article.id, locale: "en", ...enPayload },
          update: enPayload,
        });
        enFixed += 1;
      }
    }

    if (purgeOther) {
      const deleted = await prisma.kennisbankArticleTranslation.deleteMany({
        where: {
          articleId: article.id,
          locale: { notIn: ["nl", "en"] },
        },
      });
      purged += deleted.count;
    }

    if (nlOnly || (nlEn && !allLocales)) {
      if ((i + 1) % 50 === 0 || i === scoped.length - 1) {
        console.log(`[nl-en] ${i + 1}/${scoped.length} ${article.slug}`);
      }
      continue;
    }

    // Legacy path: rebuild EN via MT when explicitly requested
    if (enOnly && !nlEn) {
      let ok = false;
      for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
        try {
          const title =
            (await translateText(nlPayload.title, "en", "nl")) || nlPayload.title;
          await sleep(fieldDelayMs);
          const excerpt =
            (await translateText(nlPayload.excerpt, "en", "nl")) ||
            enPayload.excerpt;
          await sleep(fieldDelayMs);
          const bodyHtml =
            (await translateHtml(nlPayload.bodyHtml, "en", "nl")) ||
            enPayload.bodyHtml;
          const seoTitle = `${title} | TripleZero iT`;
          const seoDescription = excerpt;
          const enSource = { title, excerpt, bodyHtml, seoTitle, seoDescription };
          const good =
            isGoodArticleTranslation({
              locale: "en",
              title,
              excerpt,
              bodyHtml,
              source: {
                title: nlPayload.title,
                excerpt: nlPayload.excerpt,
                bodyHtml: nlPayload.bodyHtml,
                seoTitle: null,
                seoDescription: null,
              },
              sourceLocale: "nl",
              nlTitle: nlPayload.title,
            }) &&
            isAcceptableTranslation(nlPayload.title, title, "nl", "en");
          if (!good && !force) {
            throw new Error("MT English failed quality checks");
          }
          await prisma.kennisbankArticleTranslation.upsert({
            where: {
              articleId_locale: { articleId: article.id, locale: "en" },
            },
            create: { articleId: article.id, locale: "en", ...enSource },
            update: enSource,
          });
          enFixed += 1;
          ok = true;
          console.log(`[en-mt] ${article.slug} → ${title.slice(0, 70)}`);
          await sleep(delayMs);
          break;
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          if (attempt >= maxRetries) {
            console.error(`[en-fail] ${article.slug}: ${msg.slice(0, 160)}`);
          } else {
            await sleep(5_000 * attempt);
          }
        }
      }
      if (!ok) continue;
    }

    if (allLocales) {
      const enRow = await prisma.kennisbankArticleTranslation.findUnique({
        where: {
          articleId_locale: { articleId: article.id, locale: "en" },
        },
      });
      if (!enRow) continue;
      const enSource = {
        title: enRow.title,
        excerpt: enRow.excerpt,
        bodyHtml: enRow.bodyHtml,
        seoTitle: enRow.seoTitle,
        seoDescription: enRow.seoDescription,
      };
      const targets = enabledLanguages()
        .map((l) => l.code)
        .filter((c) => c !== "en" && c !== "nl");
      const need = force
        ? targets
        : localesNeedingArticleFill({
            translations: article.translations,
            source: enSource,
            sourceLocale: "en",
            targets,
            nlTitle: nlPayload.title,
          });
      if (!need.length) {
        localesSkipped += targets.length;
      } else {
        const { written, skipped } = await fillArticleTranslations({
          articleId: article.id,
          source: enSource,
          sourceLocale: "en",
          locales: need,
          force,
          delayMs,
          existing: article.translations,
          nlTitle: nlPayload.title,
        });
        localesFixed += written.length;
        localesSkipped += skipped.length;
      }
    }
  }

  console.log(
    `[repair-kennisbank] done nlFixed=${nlFixed} enFixed=${enFixed} purgedOtherRows=${purged} missingJsonFallback=${missing} localeWrites=${localesFixed} localeSkipped=${localesSkipped}`,
  );
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});

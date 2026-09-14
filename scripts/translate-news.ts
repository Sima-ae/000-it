#!/usr/bin/env tsx
/**
 * Backfill Dutch + all-locale translations for existing news posts.
 *
 * Usage:
 *   npm run news:translate
 *   npm run news:translate -- --limit=20
 *   npm run news:translate -- --force
 *   npm run news:translate -- --nl-only
 */
import { prisma } from "../src/lib/prisma";
import {
  buildNewsTranslationsFromEnglish,
  nlFromTranslations,
  parseNewsTranslations,
} from "../src/lib/news-i18n";
import { newsTargetLocales, translateText } from "../src/lib/google-translate";

function argFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

function argValue(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

async function main() {
  const force = argFlag("force");
  const nlOnly = argFlag("nl-only");
  const limit = Math.max(1, Number(argValue("limit") || "500") || 500);
  const targets = newsTargetLocales();

  const posts = await prisma.newsPost.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  console.log(`[translate-news] ${posts.length} posts (force=${force}, nlOnly=${nlOnly})`);
  console.log(`[translate-news] target locales: ${targets.length}`);

  let updated = 0;
  let skipped = 0;

  for (const post of posts) {
    const existing = parseNewsTranslations(post.translations);
    const needsNl =
      force ||
      !post.titleNl?.trim() ||
      !post.excerptNl?.trim() ||
      !post.descriptionNl?.trim() ||
      post.titleNl === post.title;

    const missingLocales = targets.filter((locale) => {
      if (locale === "nl") return needsNl;
      if (nlOnly) return false;
      const copy = existing[locale];
      return (
        force ||
        !copy?.title?.trim() ||
        !copy.excerpt?.trim() ||
        !copy.description?.trim() ||
        copy.title === post.title
      );
    });

    if (!missingLocales.length && !needsNl) {
      skipped += 1;
      continue;
    }

    if (!missingLocales.length && needsNl) {
      missingLocales.push("nl");
    }

    const en = {
      title: post.title,
      excerpt: post.excerpt,
      description: post.description,
    };

    try {
      let translations = { ...existing };

      if (needsNl || missingLocales.includes("nl")) {
        const titleNl = await translateText(en.title, "nl", "en");
        const excerptNl = await translateText(en.excerpt, "nl", "en");
        const descriptionNl = await translateText(en.description, "nl", "en");
        translations.nl = {
          title: titleNl || en.title,
          excerpt: excerptNl || en.excerpt,
          description: descriptionNl || en.description,
        };
      }

      if (!nlOnly) {
        const others = missingLocales.filter((l) => l !== "nl");
        if (others.length) {
          translations = await buildNewsTranslationsFromEnglish(en, {
            existing: translations,
            locales: others,
            delayMs: 350,
          });
        }
      }

      const nl = nlFromTranslations(translations, en);
      await prisma.newsPost.update({
        where: { id: post.id },
        data: {
          titleNl: nl.title,
          excerptNl: nl.excerpt,
          descriptionNl: nl.description,
          translations,
        },
      });
      updated += 1;
      console.log(
        `[ok] ${post.id} (+${missingLocales.length} locales) ${post.title.slice(0, 60)}`,
      );
    } catch (error) {
      console.error(
        `[fail] ${post.id}`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log(`[translate-news] done updated=${updated} skipped=${skipped}`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});

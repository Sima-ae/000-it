/**
 * Idempotent seed for TripleZero iT Hosting Kennisbank.
 * Seeds NL (primary) + EN article bodies, and category translations for major locales.
 * Usage: npm run db:seed:kennisbank
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildArticleHtml, buildExcerpt } from "./kennisbank/build-body";
import {
  CATEGORY_I18N,
  categoryCopy,
  englishTitleFromSlug,
} from "./kennisbank/i18n";

const prisma = new PrismaClient();

type Catalog = {
  categories: [string, string, string][];
  articles: { slug: string; title: string; categories: string[]; topic: string }[];
};

/** Locales that receive dedicated category name/description rows. */
const CATEGORY_LOCALES = [
  "en",
  "de",
  "fr",
  "es",
  "pt",
  "it",
] as const;

async function main() {
  const catalogPath = join(__dirname, "kennisbank", "catalog.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as Catalog;
  const categoryIdBySlug = new Map<string, string>();

  for (const [slug, name, description] of catalog.categories) {
    let cat = await prisma.kennisbankCategory.findUnique({ where: { slug } });
    if (!cat) {
      cat = await prisma.kennisbankCategory.create({
        data: { slug, sortKey: name, published: true },
      });
    } else {
      cat = await prisma.kennisbankCategory.update({
        where: { id: cat.id },
        data: { sortKey: name, published: true },
      });
    }

    await prisma.kennisbankCategoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: cat.id, locale: "nl" } },
      create: { categoryId: cat.id, locale: "nl", name, description },
      update: { name, description },
    });

    for (const locale of CATEGORY_LOCALES) {
      const copy = categoryCopy(slug, locale, { name, description });
      // Prefer explicit map; fall back to English map for missing locale rows
      const mapped = CATEGORY_I18N[slug]?.[locale] || CATEGORY_I18N[slug]?.en;
      const finalCopy = mapped || copy;
      await prisma.kennisbankCategoryTranslation.upsert({
        where: { categoryId_locale: { categoryId: cat.id, locale } },
        create: {
          categoryId: cat.id,
          locale,
          name: finalCopy.name,
          description: finalCopy.description,
        },
        update: {
          name: finalCopy.name,
          description: finalCopy.description,
        },
      });
    }

    categoryIdBySlug.set(slug, cat.id);
  }

  let created = 0;
  let updated = 0;

  for (const article of catalog.articles) {
    const titleEn = englishTitleFromSlug(article.slug, article.title);
    const bodyNl = buildArticleHtml(article.title, article.topic, "nl");
    const excerptNl = buildExcerpt(article.title, "nl");
    const bodyEn = buildArticleHtml(titleEn, article.topic, "en");
    const excerptEn = buildExcerpt(titleEn, "en");
    const categoryIds = article.categories
      .map((s) => categoryIdBySlug.get(s))
      .filter(Boolean) as string[];

    const existing = await prisma.kennisbankArticle.findUnique({
      where: { slug: article.slug },
    });

    const translationPayload = (
      locale: "nl" | "en",
      title: string,
      excerpt: string,
      bodyHtml: string,
    ) => ({
      locale,
      title,
      excerpt,
      bodyHtml,
      seoTitle: `${title} | TripleZero iT Hosting`,
      seoDescription: excerpt,
    });

    if (!existing) {
      await prisma.kennisbankArticle.create({
        data: {
          slug: article.slug,
          published: true,
          translations: {
            create: [
              translationPayload("nl", article.title, excerptNl, bodyNl),
              translationPayload("en", titleEn, excerptEn, bodyEn),
            ],
          },
          categories: {
            create: categoryIds.map((categoryId) => ({ categoryId })),
          },
        },
      });
      created += 1;
    } else {
      await prisma.kennisbankArticle.update({
        where: { id: existing.id },
        data: {
          published: true,
          categories: {
            deleteMany: {},
            create: categoryIds.map((categoryId) => ({ categoryId })),
          },
        },
      });
      for (const [locale, title, excerpt, bodyHtml] of [
        ["nl", article.title, excerptNl, bodyNl],
        ["en", titleEn, excerptEn, bodyEn],
      ] as const) {
        const payload = translationPayload(locale, title, excerpt, bodyHtml);
        await prisma.kennisbankArticleTranslation.upsert({
          where: {
            articleId_locale: { articleId: existing.id, locale },
          },
          create: { articleId: existing.id, ...payload },
          update: {
            title: payload.title,
            excerpt: payload.excerpt,
            bodyHtml: payload.bodyHtml,
            seoTitle: payload.seoTitle,
            seoDescription: payload.seoDescription,
          },
        });
      }
      updated += 1;
    }
  }

  console.log(
    `[kennisbank] categories=${catalog.categories.length} articles created=${created} updated=${updated} total=${catalog.articles.length} locales=nl+en (+category i18n)`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

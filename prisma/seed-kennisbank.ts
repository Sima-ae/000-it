/**
 * Idempotent seed for TripleZero iT Kennisbank.
 * Seeds curated Dutch (primary) from catalog.json.
 * English + all other locales: run `npm run kennisbank:repair` then
 * `npm run kennisbank:repair -- --all` (or kennisbank:translate after EN is clean).
 *
 * Usage: npm run db:seed:kennisbank
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildArticleHtml, buildExcerpt } from "./kennisbank/build-body";
import { CATEGORY_I18N, categoryCopy } from "./kennisbank/i18n";

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
    const bodyNl = buildArticleHtml(article.title, article.topic, "nl");
    const excerptNl = buildExcerpt(article.title, "nl");
    const categoryIds = article.categories
      .map((s) => categoryIdBySlug.get(s))
      .filter(Boolean) as string[];

    const existing = await prisma.kennisbankArticle.findUnique({
      where: { slug: article.slug },
      include: { translations: { select: { locale: true } } },
    });

    const nlPayload = {
      locale: "nl" as const,
      title: article.title,
      excerpt: excerptNl,
      bodyHtml: bodyNl,
      seoTitle: `${article.title} | TripleZero iT`,
      seoDescription: excerptNl,
    };

    if (!existing) {
      await prisma.kennisbankArticle.create({
        data: {
          slug: article.slug,
          published: true,
          translations: {
            create: [nlPayload],
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
      await prisma.kennisbankArticleTranslation.upsert({
        where: {
          articleId_locale: { articleId: existing.id, locale: "nl" },
        },
        create: { articleId: existing.id, ...nlPayload },
        update: {
          title: nlPayload.title,
          excerpt: nlPayload.excerpt,
          bodyHtml: nlPayload.bodyHtml,
          seoTitle: nlPayload.seoTitle,
          seoDescription: nlPayload.seoDescription,
        },
      });

      // Drop broken glossary EN so UI falls back to clean Dutch until repair runs.
      const hasEn = existing.translations.some((t) => t.locale === "en");
      if (hasEn) {
        // Leave EN in place — repair script rewrites it. Seed must not
        // re-introduce englishTitleFromSlug garbage.
      }

      updated += 1;
    }
  }

  console.log(
    `[kennisbank] categories=${catalog.categories.length} articles created=${created} updated=${updated} total=${catalog.articles.length} (NL only — run kennisbank:repair for EN + other locales)`,
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

/**
 * Idempotent seed for TripleZero iT Kennisbank.
 * Seeds curated Dutch + English from prisma/kennisbank/articles/{slug}.json.
 * Other article locales are removed so UI falls back to NL/EN until a later translation step.
 *
 * Generate articles first:
 *   npm run kennisbank:generate
 *   npm run kennisbank:check
 *   npm run db:seed:kennisbank
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CATEGORY_I18N,
  OVERIGE_I18N,
  categoryCopy,
  isOverigeCategorySlug,
} from "./kennisbank/i18n";
import { loadArticleFile } from "./kennisbank/load-article";
import { writeArticle } from "./kennisbank/write-article";

const prisma = new PrismaClient();

type CatalogCategory = [string, string, string] | [string, string, string, string];

type Catalog = {
  categories: CatalogCategory[];
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

  for (const row of catalog.categories) {
    const [slug, name, description] = row;
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

    if (isOverigeCategorySlug(slug)) {
      await prisma.entitySlug.upsert({
        where: {
          entityType_entityKey_locale: {
            entityType: "kb_category",
            entityKey: slug,
            locale: "nl",
          },
        },
        create: {
          entityType: "kb_category",
          entityKey: slug,
          locale: "nl",
          slug,
        },
        update: {},
      });
    }

    const localesToWrite = isOverigeCategorySlug(slug)
      ? Object.keys(OVERIGE_I18N)
      : [...CATEGORY_LOCALES];
    for (const locale of localesToWrite) {
      const copy = categoryCopy(slug, locale, { name, description });
      const mapped = CATEGORY_I18N[slug]?.[locale] || CATEGORY_I18N[slug]?.en;
      const finalCopy = isOverigeCategorySlug(slug) ? copy : mapped || copy;
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
      if (isOverigeCategorySlug(slug)) {
        await prisma.entitySlug.upsert({
          where: {
            entityType_entityKey_locale: {
              entityType: "kb_category",
              entityKey: slug,
              locale,
            },
          },
          create: {
            entityType: "kb_category",
            entityKey: slug,
            locale,
            slug,
          },
          update: {},
        });
      }
    }

    categoryIdBySlug.set(slug, cat.id);
  }

  for (const row of catalog.categories) {
    const slug = row[0];
    const parentSlug = row[3];
    const id = categoryIdBySlug.get(slug);
    if (!id) continue;
    const parentId = parentSlug ? categoryIdBySlug.get(parentSlug) || null : null;
    await prisma.kennisbankCategory.update({
      where: { id },
      data: { parentId: parentId && parentId !== id ? parentId : null },
    });
  }

  let created = 0;
  let updated = 0;
  let missingFiles = 0;

  for (const article of catalog.articles) {
    const onDisk = loadArticleFile(article.slug);
    const file =
      onDisk ||
      writeArticle({
        slug: article.slug,
        title: article.title,
        categories: article.categories,
        topic: article.topic,
      });
    if (!onDisk) missingFiles += 1;

    const categoryIds = article.categories
      .map((s) => categoryIdBySlug.get(s))
      .filter(Boolean) as string[];

    const existing = await prisma.kennisbankArticle.findUnique({
      where: { slug: article.slug },
      include: { translations: { select: { locale: true } } },
    });

    const nlPayload = {
      locale: "nl" as const,
      title: file.nl.title || article.title,
      excerpt: file.nl.excerpt,
      bodyHtml: file.nl.bodyHtml,
      seoTitle: file.nl.seoTitle || `${article.title} | TripleZero iT`,
      seoDescription: file.nl.seoDescription || file.nl.excerpt,
    };

    const enPayload = {
      locale: "en" as const,
      title: file.en.title,
      excerpt: file.en.excerpt,
      bodyHtml: file.en.bodyHtml,
      seoTitle: file.en.seoTitle || `${file.en.title} | TripleZero iT`,
      seoDescription: file.en.seoDescription || file.en.excerpt,
    };

    if (!existing) {
      await prisma.kennisbankArticle.create({
        data: {
          slug: article.slug,
          published: true,
          translations: {
            create: [nlPayload, enPayload],
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
      await prisma.kennisbankArticleTranslation.upsert({
        where: {
          articleId_locale: { articleId: existing.id, locale: "en" },
        },
        create: { articleId: existing.id, ...enPayload },
        update: {
          title: enPayload.title,
          excerpt: enPayload.excerpt,
          bodyHtml: enPayload.bodyHtml,
          seoTitle: enPayload.seoTitle,
          seoDescription: enPayload.seoDescription,
        },
      });
      // Drop stale machine-translated locales until the later translation step.
      await prisma.kennisbankArticleTranslation.deleteMany({
        where: {
          articleId: existing.id,
          locale: { notIn: ["nl", "en"] },
        },
      });
      updated += 1;
    }
  }

  console.log(
    `[kennisbank] categories=${catalog.categories.length} articles created=${created} updated=${updated} total=${catalog.articles.length} missingJsonFallback=${missingFiles} (NL+EN from articles/*.json)`,
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

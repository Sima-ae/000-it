import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugifyKennisbank } from "@/lib/kennisbank-slug";
import {
  fillArticleTranslations,
  fillCategoryTranslations,
} from "@/lib/kennisbank-i18n";
import { translateHtml, translateText } from "@/lib/google-translate";

export { slugifyKennisbank } from "@/lib/kennisbank-slug";

export const KENNISBANK_FALLBACK_LOCALE = "nl";
export const KENNISBANK_SECONDARY_FALLBACK_LOCALE = "en";

export type KennisbankCategoryView = {
  id: string;
  slug: string;
  sortKey: string;
  published: boolean;
  name: string;
  description: string | null;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
};

export type KennisbankArticleListItem = {
  id: string;
  slug: string;
  published: boolean;
  title: string;
  excerpt: string;
  categorySlugs: string[];
  categoryNames: string[];
  createdAt: string;
  updatedAt: string;
};

export type KennisbankArticleView = KennisbankArticleListItem & {
  bodyHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
  createdById: string | null;
};

export const categoryUpsertSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1).max(120),
  sortKey: z.string().min(1).max(120).optional(),
  published: z.boolean().optional(),
  name: z.string().min(1).max(160),
  description: z.string().max(2000).nullable().optional(),
  locale: z.string().min(2).max(10).default("nl"),
});

export const articleUpsertSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1).max(180),
  published: z.boolean().optional(),
  locale: z.string().min(2).max(10).default("nl"),
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(2000),
  bodyHtml: z.string().min(1),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  categoryIds: z.array(z.string()).default([]),
});

function pickTranslation<T extends { locale: string }>(
  translations: T[],
  locale: string,
): T | undefined {
  // Prefer curated Dutch over English when the requested locale is missing —
  // EN was historically seeded via a broken slug glossary (mixed NL/EN titles).
  return (
    translations.find((t) => t.locale === locale) ||
    translations.find((t) => t.locale === KENNISBANK_FALLBACK_LOCALE) ||
    translations.find(
      (t) => t.locale === KENNISBANK_SECONDARY_FALLBACK_LOCALE,
    ) ||
    translations[0]
  );
}

function localeCompareFor(locale: string, a: string, b: string) {
  try {
    return a.localeCompare(b, locale, { sensitivity: "base" });
  } catch {
    return a.localeCompare(b, "en", { sensitivity: "base" });
  }
}

export async function listCategories(opts?: {
  locale?: string;
  all?: boolean;
}): Promise<KennisbankCategoryView[]> {
  const locale = opts?.locale || KENNISBANK_FALLBACK_LOCALE;
  const rows = await prisma.kennisbankCategory.findMany({
    where: opts?.all ? undefined : { published: true },
    include: {
      translations: true,
      _count: {
        select: {
          articles: opts?.all
            ? true
            : { where: { article: { published: true } } },
        },
      },
    },
  });

  return rows
    .map((row) => {
      const tr = pickTranslation(row.translations, locale);
      return {
        id: row.id,
        slug: row.slug,
        sortKey: row.sortKey,
        published: row.published,
        name: tr?.name || row.sortKey,
        description: tr?.description ?? null,
        articleCount: row._count.articles,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      };
    })
    .sort((a, b) => localeCompareFor(locale, a.name, b.name));
}

export async function getCategoryBySlug(
  slug: string,
  opts?: { locale?: string; all?: boolean },
): Promise<KennisbankCategoryView | null> {
  const locale = opts?.locale || KENNISBANK_FALLBACK_LOCALE;
  const row = await prisma.kennisbankCategory.findUnique({
    where: { slug },
    include: {
      translations: true,
      _count: {
        select: {
          articles: opts?.all
            ? true
            : { where: { article: { published: true } } },
        },
      },
    },
  });
  if (!row) return null;
  if (!opts?.all && !row.published) return null;
  const tr = pickTranslation(row.translations, locale);
  return {
    id: row.id,
    slug: row.slug,
    sortKey: row.sortKey,
    published: row.published,
    name: tr?.name || row.sortKey,
    description: tr?.description ?? null,
    articleCount: row._count.articles,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createCategory(input: z.infer<typeof categoryUpsertSchema>) {
  const slug = slugifyKennisbank(input.slug);
  const sortKey = input.sortKey?.trim() || input.name.trim();
  const locale = input.locale || "nl";
  const name = input.name.trim();
  const description = input.description?.trim() || null;

  const row = await prisma.kennisbankCategory.create({
    data: {
      slug,
      sortKey,
      published: input.published ?? true,
      translations: {
        create: {
          locale,
          name,
          description,
        },
      },
    },
    include: { translations: true, _count: { select: { articles: true } } },
  });

  // Propagate to English (source for other langs) + all enabled locales.
  void propagateCategoryLocales(row.id, locale, { name, description }).catch(
    (error) => console.warn("[kennisbank] category i18n", error),
  );

  const tr = pickTranslation(row.translations, locale);
  return {
    id: row.id,
    slug: row.slug,
    sortKey: row.sortKey,
    published: row.published,
    name: tr?.name || row.sortKey,
    description: tr?.description ?? null,
    articleCount: row._count.articles,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  } satisfies KennisbankCategoryView;
}

export async function updateCategory(
  id: string,
  input: z.infer<typeof categoryUpsertSchema>,
) {
  const locale = input.locale || "nl";
  const slug = slugifyKennisbank(input.slug);
  const sortKey = input.sortKey?.trim() || input.name.trim();
  const name = input.name.trim();
  const description = input.description?.trim() || null;

  await prisma.kennisbankCategory.update({
    where: { id },
    data: {
      slug,
      sortKey,
      published: input.published ?? true,
    },
  });

  await prisma.kennisbankCategoryTranslation.upsert({
    where: { categoryId_locale: { categoryId: id, locale } },
    create: {
      categoryId: id,
      locale,
      name,
      description,
    },
    update: {
      name,
      description,
    },
  });

  void propagateCategoryLocales(id, locale, { name, description }).catch((error) =>
    console.warn("[kennisbank] category i18n", error),
  );

  const view = await getCategoryBySlug(slug, { locale, all: true });
  if (!view) throw new Error("Category not found after update");
  return view;
}

async function propagateCategoryLocales(
  categoryId: string,
  sourceLocale: string,
  source: { name: string; description: string | null },
) {
  // Ensure English exists as MT source when editors write Dutch.
  let enName = source.name;
  let enDescription = source.description;
  if (sourceLocale !== "en") {
    enName = (await translateText(source.name, "en", sourceLocale)) || source.name;
    enDescription = source.description
      ? (await translateText(source.description, "en", sourceLocale)) ||
        source.description
      : null;
    await prisma.kennisbankCategoryTranslation.upsert({
      where: { categoryId_locale: { categoryId, locale: "en" } },
      create: {
        categoryId,
        locale: "en",
        name: enName,
        description: enDescription,
      },
      update: { name: enName, description: enDescription },
    });
  }

  await fillCategoryTranslations({
    categoryId,
    source: { name: enName, description: enDescription },
    sourceLocale: "en",
    force: true,
    delayMs: 220,
  });
}

export async function deleteCategory(id: string) {
  await prisma.kennisbankCategory.delete({ where: { id } });
}

function mapArticleListItem(
  row: {
    id: string;
    slug: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
    translations: {
      locale: string;
      title: string;
      excerpt: string;
    }[];
    categories: {
      category: {
        slug: string;
        sortKey: string;
        translations: { locale: string; name: string }[];
      };
    }[];
  },
  locale: string,
): KennisbankArticleListItem {
  const tr = pickTranslation(row.translations, locale);
  const cats = row.categories
    .map((link) => {
      const cTr = pickTranslation(link.category.translations, locale);
      return {
        slug: link.category.slug,
        name: cTr?.name || link.category.sortKey,
      };
    })
    .sort((a, b) => localeCompareFor(locale, a.name, b.name));

  return {
    id: row.id,
    slug: row.slug,
    published: row.published,
    title: tr?.title || row.slug,
    excerpt: tr?.excerpt || "",
    categorySlugs: cats.map((c) => c.slug),
    categoryNames: cats.map((c) => c.name),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const articleInclude = {
  translations: true,
  categories: {
    include: {
      category: { include: { translations: true } },
    },
  },
} as const;

export async function listArticles(opts?: {
  locale?: string;
  all?: boolean;
  categorySlug?: string;
  search?: string;
}): Promise<KennisbankArticleListItem[]> {
  const locale = opts?.locale || KENNISBANK_FALLBACK_LOCALE;
  const search = opts?.search?.trim();

  const rows = await prisma.kennisbankArticle.findMany({
    where: {
      ...(opts?.all ? {} : { published: true }),
      ...(opts?.categorySlug
        ? { categories: { some: { category: { slug: opts.categorySlug } } } }
        : {}),
      ...(search
        ? {
            translations: {
              some: {
                OR: [
                  { title: { contains: search } },
                  { excerpt: { contains: search } },
                  { bodyHtml: { contains: search } },
                ],
              },
            },
          }
        : {}),
    },
    include: articleInclude,
  });

  return rows
    .map((row) => mapArticleListItem(row, locale))
    .sort((a, b) => localeCompareFor(locale, a.title, b.title));
}

export async function getArticleBySlug(
  slug: string,
  opts?: { locale?: string; all?: boolean },
): Promise<KennisbankArticleView | null> {
  const locale = opts?.locale || KENNISBANK_FALLBACK_LOCALE;
  const full = await prisma.kennisbankArticle.findUnique({
    where: { slug },
    include: articleInclude,
  });
  if (!full) return null;
  if (!opts?.all && !full.published) return null;

  const tr = pickTranslation(full.translations, locale);
  const base = mapArticleListItem(full, locale);
  return {
    ...base,
    bodyHtml: tr?.bodyHtml || "",
    seoTitle: tr?.seoTitle ?? null,
    seoDescription: tr?.seoDescription ?? null,
    createdById: full.createdById,
  };
}

export async function getArticleById(
  id: string,
  opts?: { locale?: string },
): Promise<KennisbankArticleView | null> {
  const locale = opts?.locale || KENNISBANK_FALLBACK_LOCALE;
  const full = await prisma.kennisbankArticle.findUnique({
    where: { id },
    include: articleInclude,
  });
  if (!full) return null;
  const tr = pickTranslation(full.translations, locale);
  const base = mapArticleListItem(full, locale);
  return {
    ...base,
    bodyHtml: tr?.bodyHtml || "",
    seoTitle: tr?.seoTitle ?? null,
    seoDescription: tr?.seoDescription ?? null,
    createdById: full.createdById,
  };
}

export async function createArticle(
  input: z.infer<typeof articleUpsertSchema> & { createdById?: string | null },
) {
  const locale = input.locale || "nl";
  const slug = slugifyKennisbank(input.slug);
  const source = {
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    bodyHtml: input.bodyHtml,
    seoTitle: input.seoTitle?.trim() || null,
    seoDescription: input.seoDescription?.trim() || null,
  };

  const row = await prisma.kennisbankArticle.create({
    data: {
      slug,
      published: input.published ?? true,
      createdById: input.createdById || null,
      translations: {
        create: {
          locale,
          ...source,
        },
      },
      categories: {
        create: input.categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
  });

  void propagateArticleLocales(row.id, locale, source).catch((error) =>
    console.warn("[kennisbank] article i18n", error),
  );

  return getArticleById(row.id, { locale });
}

export async function updateArticle(
  id: string,
  input: z.infer<typeof articleUpsertSchema>,
) {
  const locale = input.locale || "nl";
  const slug = slugifyKennisbank(input.slug);
  const source = {
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    bodyHtml: input.bodyHtml,
    seoTitle: input.seoTitle?.trim() || null,
    seoDescription: input.seoDescription?.trim() || null,
  };

  await prisma.kennisbankArticle.update({
    where: { id },
    data: {
      slug,
      published: input.published ?? true,
      categories: {
        deleteMany: {},
        create: input.categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
  });

  await prisma.kennisbankArticleTranslation.upsert({
    where: { articleId_locale: { articleId: id, locale } },
    create: {
      articleId: id,
      locale,
      ...source,
    },
    update: source,
  });

  void propagateArticleLocales(id, locale, source).catch((error) =>
    console.warn("[kennisbank] article i18n", error),
  );

  return getArticleById(id, { locale });
}

async function propagateArticleLocales(
  articleId: string,
  sourceLocale: string,
  source: {
    title: string;
    excerpt: string;
    bodyHtml: string;
    seoTitle: string | null;
    seoDescription: string | null;
  },
) {
  let en = { ...source };
  if (sourceLocale !== "en") {
    en = {
      title: (await translateText(source.title, "en", sourceLocale)) || source.title,
      excerpt:
        (await translateText(source.excerpt, "en", sourceLocale)) || source.excerpt,
      bodyHtml:
        (await translateHtml(source.bodyHtml, "en", sourceLocale)) || source.bodyHtml,
      seoTitle: source.seoTitle
        ? (await translateText(source.seoTitle, "en", sourceLocale)) || source.seoTitle
        : null,
      seoDescription: source.seoDescription
        ? (await translateText(source.seoDescription, "en", sourceLocale)) ||
          source.seoDescription
        : null,
    };
    await prisma.kennisbankArticleTranslation.upsert({
      where: { articleId_locale: { articleId, locale: "en" } },
      create: { articleId, locale: "en", ...en },
      update: en,
    });
  }

  await fillArticleTranslations({
    articleId,
    source: en,
    sourceLocale: "en",
    // Never force-overwrite curated NL from admin EN propagation.
    force: true,
    delayMs: 280,
    locales: undefined, // fillArticleTranslations skips nl when source is en
  });
}

export async function deleteArticle(id: string) {
  await prisma.kennisbankArticle.delete({ where: { id } });
}

export async function listPublishedArticlePaths(): Promise<
  { categorySlug: string; articleSlug: string; updatedAt: Date }[]
> {
  const rows = await prisma.kennisbankArticleCategory.findMany({
    where: {
      article: { published: true },
      category: { published: true },
    },
    include: {
      article: { select: { slug: true, updatedAt: true } },
      category: { select: { slug: true } },
    },
  });

  return rows.map((r) => ({
    categorySlug: r.category.slug,
    articleSlug: r.article.slug,
    updatedAt: r.article.updatedAt,
  }));
}

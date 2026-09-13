import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugifyKennisbank } from "@/lib/kennisbank-slug";

export { slugifyKennisbank } from "@/lib/kennisbank-slug";

export const KENNISBANK_FALLBACK_LOCALE = "nl";

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
  return (
    translations.find((t) => t.locale === locale) ||
    translations.find((t) => t.locale === KENNISBANK_FALLBACK_LOCALE) ||
    translations[0]
  );
}

function localeCompareNl(a: string, b: string) {
  return a.localeCompare(b, "nl", { sensitivity: "base" });
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
    .sort((a, b) => localeCompareNl(a.name, b.name));
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

  const row = await prisma.kennisbankCategory.create({
    data: {
      slug,
      sortKey,
      published: input.published ?? true,
      translations: {
        create: {
          locale,
          name: input.name.trim(),
          description: input.description?.trim() || null,
        },
      },
    },
    include: { translations: true, _count: { select: { articles: true } } },
  });

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
      name: input.name.trim(),
      description: input.description?.trim() || null,
    },
    update: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
    },
  });

  const view = await getCategoryBySlug(slug, { locale, all: true });
  if (!view) throw new Error("Category not found after update");
  return view;
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
    .sort((a, b) => localeCompareNl(a.name, b.name));

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
    .sort((a, b) => localeCompareNl(a.title, b.title));
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

  const row = await prisma.kennisbankArticle.create({
    data: {
      slug,
      published: input.published ?? true,
      createdById: input.createdById || null,
      translations: {
        create: {
          locale,
          title: input.title.trim(),
          excerpt: input.excerpt.trim(),
          bodyHtml: input.bodyHtml,
          seoTitle: input.seoTitle?.trim() || null,
          seoDescription: input.seoDescription?.trim() || null,
        },
      },
      categories: {
        create: input.categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
  });

  return getArticleById(row.id, { locale });
}

export async function updateArticle(
  id: string,
  input: z.infer<typeof articleUpsertSchema>,
) {
  const locale = input.locale || "nl";
  const slug = slugifyKennisbank(input.slug);

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
      title: input.title.trim(),
      excerpt: input.excerpt.trim(),
      bodyHtml: input.bodyHtml,
      seoTitle: input.seoTitle?.trim() || null,
      seoDescription: input.seoDescription?.trim() || null,
    },
    update: {
      title: input.title.trim(),
      excerpt: input.excerpt.trim(),
      bodyHtml: input.bodyHtml,
      seoTitle: input.seoTitle?.trim() || null,
      seoDescription: input.seoDescription?.trim() || null,
    },
  });

  return getArticleById(id, { locale });
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

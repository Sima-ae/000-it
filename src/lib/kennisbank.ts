import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugifyKennisbank } from "@/lib/kennisbank-slug";
import {
  fillArticleTranslations,
  fillCategoryTranslations,
} from "@/lib/kennisbank-i18n";
import {
  isAcceptableTranslation,
  translateHtml,
  translateText,
} from "@/lib/google-translate";
import { ensureEntitySlugFromTitle } from "@/lib/entity-slugs";
import { brandify } from "@/lib/brandify";
import { stripKennisbankExcerptPrefix } from "@/lib/kennisbank-excerpt";

export { slugifyKennisbank } from "@/lib/kennisbank-slug";
export { stripKennisbankExcerptPrefix };

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
  parentId: string | null;
  parentSlug: string | null;
  parentName: string | null;
  children: KennisbankCategoryView[];
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
  parentId: z.string().min(1).max(40).nullable().optional(),
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
      parent: { include: { translations: true } },
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

  const mapped = rows.map((row) => {
    const tr = pickTranslation(row.translations, locale);
    const parentTr = row.parent
      ? pickTranslation(row.parent.translations, locale)
      : undefined;
    return {
      id: row.id,
      slug: row.slug,
      sortKey: row.sortKey,
      published: row.published,
      name: brandify(tr?.name || row.sortKey),
      description: tr?.description != null ? brandify(tr.description) : null,
      articleCount: row._count.articles,
      parentId: row.parentId,
      parentSlug: row.parent?.slug || null,
      parentName: parentTr
        ? brandify(parentTr.name)
        : row.parent
          ? brandify(row.parent.sortKey)
          : null,
      children: [] as KennisbankCategoryView[],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    } satisfies KennisbankCategoryView;
  });

  const byId = new Map(mapped.map((c) => [c.id, c]));
  for (const cat of mapped) {
    if (!cat.parentId) continue;
    const parent = byId.get(cat.parentId);
    if (parent) parent.children.push(cat);
  }
  for (const cat of mapped) {
    cat.children.sort((a, b) => {
      const aOverige = a.slug.endsWith("-overige") ? 1 : 0;
      const bOverige = b.slug.endsWith("-overige") ? 1 : 0;
      if (aOverige !== bOverige) return aOverige - bOverige;
      return localeCompareFor(locale, a.name, b.name);
    });
  }

  const links = await prisma.kennisbankArticleCategory.findMany({
    where: opts?.all ? undefined : { article: { published: true } },
    select: { articleId: true, categoryId: true },
  });
  const articlesByCat = new Map<string, Set<string>>();
  for (const link of links) {
    const set = articlesByCat.get(link.categoryId) || new Set<string>();
    set.add(link.articleId);
    articlesByCat.set(link.categoryId, set);
  }
  const uniqueInTree = (id: string, seenCats: Set<string>): Set<string> => {
    if (seenCats.has(id)) return new Set();
    seenCats.add(id);
    const ids = new Set(articlesByCat.get(id) || []);
    const node = byId.get(id);
    if (!node) return ids;
    for (const child of node.children) {
      for (const articleId of uniqueInTree(child.id, seenCats)) ids.add(articleId);
    }
    return ids;
  };
  for (const cat of mapped) {
    cat.articleCount = uniqueInTree(cat.id, new Set()).size;
  }

  return mapped.sort((a, b) => localeCompareFor(locale, a.name, b.name));
}

export function topLevelCategories(categories: KennisbankCategoryView[]) {
  return categories.filter((c) => !c.parentId);
}

export async function getCategoryBySlug(
  slug: string,
  opts?: { locale?: string; all?: boolean },
): Promise<KennisbankCategoryView | null> {
  const locale = opts?.locale || KENNISBANK_FALLBACK_LOCALE;
  const all = await listCategories({ locale, all: opts?.all });
  return all.find((c) => c.slug === slug) || null;
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
      parentId: input.parentId || null,
      translations: {
        create: {
          locale,
          name,
          description,
        },
      },
    },
  });

  // Propagate to English (source for other langs) + all enabled locales.
  void propagateCategoryLocales(row.id, locale, { name, description }).catch(
    (error) => console.warn("[kennisbank] category i18n", error),
  );

  void ensureEntitySlugFromTitle({
    entityType: "kb_category",
    entityKey: slug,
    locale,
    title: name,
  }).catch((error) => console.warn("[kennisbank] category slug", error));

  const view = await getCategoryBySlug(slug, { locale, all: true });
  if (!view) throw new Error("Category not found after create");
  return view;
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

  const parentId =
    input.parentId === undefined
      ? undefined
      : input.parentId && input.parentId !== id
        ? input.parentId
        : null;

  await prisma.kennisbankCategory.update({
    where: { id },
    data: {
      slug,
      sortKey,
      published: input.published ?? true,
      ...(parentId !== undefined ? { parentId } : {}),
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

async function translatePlainToEnglish(text: string, fromLocale: string) {
  const out = await translateText(text, "en", fromLocale);
  if (!isAcceptableTranslation(text, out, fromLocale, "en")) {
    throw new Error("en quality");
  }
  return out;
}

async function withRetries<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastErr = error;
      await new Promise((r) => setTimeout(r, 800 * 2 ** i));
    }
  }
  throw lastErr || new Error("retries exhausted");
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
    enName = await withRetries(() => translatePlainToEnglish(source.name, sourceLocale));
    enDescription = source.description
      ? await withRetries(() =>
          translatePlainToEnglish(source.description!, sourceLocale),
        )
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
    preserveLocales: sourceLocale === "nl" ? ["nl"] : [],
  });

  await syncCategoryEntitySlugs(categoryId);
}

async function syncCategoryEntitySlugs(categoryId: string) {
  const cat = await prisma.kennisbankCategory.findUnique({
    where: { id: categoryId },
    select: {
      slug: true,
      translations: { select: { locale: true, name: true } },
    },
  });
  if (!cat) return;
  for (const tr of cat.translations) {
    if (!tr.name?.trim()) continue;
    await ensureEntitySlugFromTitle({
      entityType: "kb_category",
      entityKey: cat.slug,
      locale: tr.locale,
      title: tr.name,
    });
  }
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
        name: brandify(cTr?.name || link.category.sortKey),
      };
    })
    .sort((a, b) => localeCompareFor(locale, a.name, b.name));

  return {
    id: row.id,
    slug: row.slug,
    published: row.published,
    title: brandify(tr?.title || row.slug),
    excerpt: brandify(stripKennisbankExcerptPrefix(tr?.excerpt || "")),
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

  let categoryFilter: { categories?: { some: { categoryId?: { in: string[] }; category?: { slug: string } } } } = {};
  if (opts?.categorySlug) {
    const tree = await listCategories({ locale, all: opts?.all });
    const node = tree.find((c) => c.slug === opts.categorySlug);
    const ids = new Set<string>();
    const walk = (cat: KennisbankCategoryView | undefined) => {
      if (!cat) return;
      ids.add(cat.id);
      cat.children.forEach(walk);
    };
    walk(node);
    if (ids.size) {
      categoryFilter = { categories: { some: { categoryId: { in: [...ids] } } } };
    } else {
      categoryFilter = {
        categories: { some: { category: { slug: opts.categorySlug } } },
      };
    }
  }

  const rows = await prisma.kennisbankArticle.findMany({
    where: {
      ...(opts?.all ? {} : { published: true }),
      ...categoryFilter,
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
    bodyHtml: brandify(tr?.bodyHtml || ""),
    seoTitle: tr?.seoTitle ? brandify(tr.seoTitle) : null,
    seoDescription: tr?.seoDescription
      ? brandify(stripKennisbankExcerptPrefix(tr.seoDescription))
      : null,
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
    bodyHtml: brandify(tr?.bodyHtml || ""),
    seoTitle: tr?.seoTitle ? brandify(tr.seoTitle) : null,
    seoDescription: tr?.seoDescription
      ? brandify(stripKennisbankExcerptPrefix(tr.seoDescription))
      : null,
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

  void ensureEntitySlugFromTitle({
    entityType: "kb_article",
    entityKey: slug,
    locale,
    title: source.title,
  }).catch((error) => console.warn("[kennisbank] article slug", error));

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
    en = await withRetries(async () => {
      const title = await translatePlainToEnglish(source.title, sourceLocale);
      const excerpt = await translatePlainToEnglish(source.excerpt, sourceLocale);
      const bodyHtml = await translateHtml(source.bodyHtml, "en", sourceLocale);
      if (!isAcceptableTranslation(source.bodyHtml, bodyHtml, sourceLocale, "en")) {
        throw new Error("en body quality");
      }
      const seoTitle = source.seoTitle
        ? await translatePlainToEnglish(source.seoTitle, sourceLocale)
        : null;
      const seoDescription = source.seoDescription
        ? await translatePlainToEnglish(source.seoDescription, sourceLocale)
        : null;
      return { title, excerpt, bodyHtml, seoTitle, seoDescription };
    });
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
    force: true,
    delayMs: 280,
    preserveLocales: sourceLocale === "nl" ? ["nl"] : ["nl"],
  });

  await syncArticleEntitySlugs(articleId);
}

async function syncArticleEntitySlugs(articleId: string) {
  const article = await prisma.kennisbankArticle.findUnique({
    where: { id: articleId },
    select: {
      slug: true,
      translations: { select: { locale: true, title: true } },
    },
  });
  if (!article) return;
  for (const tr of article.translations) {
    if (!tr.title?.trim()) continue;
    await ensureEntitySlugFromTitle({
      entityType: "kb_article",
      entityKey: article.slug,
      locale: tr.locale,
      title: tr.title,
    });
  }
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

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import { enabledLanguages } from "@/i18n/languages";
import {
  isAcceptableTranslation,
  translateText,
} from "@/lib/google-translate";
import {
  fillArticleTranslations,
  fillCategoryTranslations,
  pickKennisbankSourceLocale,
} from "@/lib/kennisbank-i18n";
import {
  missingNewsLocales,
  parseNewsTranslations,
} from "@/lib/news-i18n";
import { completeNewsTranslations } from "@/lib/news";
import {
  findLocalizedHash,
  hashSource,
  upsertLocalizedCopy,
  type LocalizedKind,
} from "@/lib/localized-copy";
import { staticPageSeo } from "@/content/seo/pages";
import { serviceCatalog, serviceGroups } from "@/content/fixweb/catalog";
import { pageI18n, type PageBlock, type PageI18n } from "@/content/fixweb/page-i18n";
import { productI18n, type ProductI18n } from "@/content/fixweb/product-i18n";
import {
  getCustomServiceSource,
  listCustomServiceSlugs,
} from "@/content/services/custom";
import { catalogServiceTitle, setCatalogLocaleOverlay } from "@/content/fixweb/catalog-title";
import { seoCities } from "@/content/seo/cities";
import { listShopProducts } from "@/lib/shop/catalog";
import { getProductI18n } from "@/content/fixweb/product-i18n";
import { ensureEntitySlugFromTitle } from "@/lib/entity-slugs";
import {
  hydrateLocalizedCopy,
  getLocalizedCopySync,
  getCatalogOverlaySync,
} from "@/lib/localized-copy";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type TranslateContentResult = {
  ok: boolean;
  written: number;
  skipped: number;
  failed: number;
  remaining: number;
  details: string[];
};

type BackfillKind = "news" | "kennisbank" | "pages" | "ui" | "slugs";

type BackfillOptions = {
  deadlineMs?: number;
  kinds?: BackfillKind[];
};

function allCodes() {
  return enabledLanguages().map((l) => l.code);
}

function mtLocales() {
  return allCodes().filter((code) => code !== "en" && code !== "nl");
}

function pastDeadline(deadline: number) {
  return Date.now() > deadline;
}

async function translateOrThrow(text: string, locale: string, from = "en") {
  const out = await translateText(text, locale, from);
  if (!isAcceptableTranslation(text, out, from, locale)) {
    throw new Error(`quality ${from}→${locale}`);
  }
  return out;
}

async function translateBlocks(
  blocks: PageBlock[],
  locale: string,
): Promise<PageBlock[]> {
  const out: PageBlock[] = [];
  for (const block of blocks) {
    if (block.type === "list") {
      const items: string[] = [];
      for (const item of block.items) {
        items.push(await translateOrThrow(item, locale));
        await sleep(80);
      }
      out.push({ type: "list", items });
    } else {
      out.push({
        type: block.type,
        text: await translateOrThrow(block.text, locale),
      });
      await sleep(80);
    }
  }
  return out;
}

async function writeIfStale(opts: {
  kind: LocalizedKind;
  itemKey: string;
  locale: string;
  source: unknown;
  payload: unknown;
}) {
  const sourceHash = hashSource(opts.source);
  await upsertLocalizedCopy({
    kind: opts.kind,
    itemKey: opts.itemKey,
    locale: opts.locale,
    payload: opts.payload,
    sourceHash,
  });
}

async function needsWrite(
  kind: LocalizedKind,
  itemKey: string,
  locale: string,
  source: unknown,
) {
  const current = await findLocalizedHash(kind, itemKey, locale);
  return current !== hashSource(source);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function flattenStrings(
  value: unknown,
  prefix = "",
): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof value === "string") {
    if (prefix) out[prefix] = value;
    return out;
  }
  if (!isPlainObject(value)) return out;
  for (const [key, nested] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    Object.assign(out, flattenStrings(nested, path));
  }
  return out;
}

function setPath(target: Record<string, unknown>, path: string, value: string) {
  const parts = path.split(".");
  let cur: Record<string, unknown> = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!isPlainObject(cur[part])) cur[part] = {};
    cur = cur[part] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

function skipUiString(value: string) {
  const t = value.trim();
  if (!t) return true;
  if (/^https?:\/\//i.test(t) || t.startsWith("/") || t.includes("@")) return true;
  if (t.length <= 1) return true;
  return false;
}

async function fillNews(deadline: number, result: TranslateContentResult) {
  const posts = await prisma.newsPost.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 80,
  });
  for (const post of posts) {
    if (pastDeadline(deadline)) break;
    const en = {
      title: post.title,
      excerpt: post.excerpt,
      description: post.description,
    };
    const existing = parseNewsTranslations(post.translations);
    const missing = missingNewsLocales(en, existing);
    if (!missing.length) {
      result.skipped += 1;
      continue;
    }
    try {
      await completeNewsTranslations(post.id, {
        deadlineMs: Math.max(deadline - Date.now(), 5_000),
      });
      result.written += 1;
      result.details.push(`news ${post.id} filled`);
    } catch (error) {
      result.failed += 1;
      result.details.push(
        `news ${post.id}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

async function fillKennisbank(deadline: number, result: TranslateContentResult) {
  const categories = await prisma.kennisbankCategory.findMany({
    include: { translations: true },
  });
  for (const cat of categories) {
    if (pastDeadline(deadline)) break;
    const sourceLocale = pickKennisbankSourceLocale(cat.translations.map((t) => t.locale));
    const sourceRow = cat.translations.find((t) => t.locale === sourceLocale);
    if (!sourceRow) continue;
    const have = new Set(cat.translations.map((t) => t.locale));
    const missing = allCodes().filter((l) => l !== sourceLocale && !have.has(l));
    const stale = cat.translations.filter(
      (t) =>
        t.locale !== sourceLocale &&
        t.locale !== "nl" &&
        t.name.trim() === sourceRow.name.trim(),
    );
    if (!missing.length && !stale.length) {
      result.skipped += 1;
      continue;
    }
    const { written, failed } = await fillCategoryTranslations({
      categoryId: cat.id,
      source: { name: sourceRow.name, description: sourceRow.description },
      sourceLocale,
      force: stale.length > 0,
      delayMs: 220,
      deadlineMs: Math.max(deadline - Date.now(), 4_000),
    });
    result.written += written.length;
    result.failed += failed.length;
    if (written.length) result.details.push(`category ${cat.slug} +${written.length}`);
    // Refresh translations for slug sync
    const refreshed = await prisma.kennisbankCategory.findUnique({
      where: { id: cat.id },
      select: {
        slug: true,
        translations: { select: { locale: true, name: true } },
      },
    });
    if (refreshed) {
      for (const tr of refreshed.translations) {
        if (!tr.name?.trim()) continue;
        await ensureSlug(result, "kb_category", refreshed.slug, tr.locale, tr.name);
      }
    }
  }

  const articles = await prisma.kennisbankArticle.findMany({
    include: { translations: true },
    orderBy: { updatedAt: "desc" },
    take: 60,
  });
  for (const article of articles) {
    if (pastDeadline(deadline)) break;
    const sourceLocale = pickKennisbankSourceLocale(
      article.translations.map((t) => t.locale),
    );
    const sourceRow = article.translations.find((t) => t.locale === sourceLocale);
    if (!sourceRow) continue;
    const have = new Set(article.translations.map((t) => t.locale));
    const missing = allCodes().filter((l) => l !== sourceLocale && !have.has(l));
    const stale = article.translations.filter(
      (t) =>
        t.locale !== sourceLocale &&
        t.locale !== "nl" &&
        t.title.trim() === sourceRow.title.trim(),
    );
    if (!missing.length && !stale.length) {
      result.skipped += 1;
      continue;
    }
    const { written, failed } = await fillArticleTranslations({
      articleId: article.id,
      source: {
        title: sourceRow.title,
        excerpt: sourceRow.excerpt,
        bodyHtml: sourceRow.bodyHtml,
        seoTitle: sourceRow.seoTitle,
        seoDescription: sourceRow.seoDescription,
      },
      sourceLocale,
      force: stale.length > 0,
      delayMs: 260,
      deadlineMs: Math.max(deadline - Date.now(), 8_000),
    });
    result.written += written.length;
    result.failed += failed.length;
    if (written.length) result.details.push(`article ${article.slug} +${written.length}`);
    const refreshed = await prisma.kennisbankArticle.findUnique({
      where: { id: article.id },
      select: {
        slug: true,
        translations: { select: { locale: true, title: true } },
      },
    });
    if (refreshed) {
      for (const tr of refreshed.translations) {
        if (!tr.title?.trim()) continue;
        await ensureSlug(result, "kb_article", refreshed.slug, tr.locale, tr.title);
      }
    }
  }
}

async function fillStaticPages(deadline: number, result: TranslateContentResult) {
  const locales = mtLocales();

  for (const page of staticPageSeo) {
    if (pastDeadline(deadline)) return;
    const source = {
      title: page.title.en,
      description: page.description.en,
      keywords: page.keywords.en,
    };
    for (const locale of locales) {
      if (pastDeadline(deadline)) return;
      if (!(await needsWrite("seo", page.path, locale, source))) {
        result.skipped += 1;
        continue;
      }
      try {
        const title = await translateOrThrow(source.title, locale);
        await sleep(80);
        const description = await translateOrThrow(source.description, locale);
        const keywords: string[] = [];
        for (const kw of source.keywords) {
          keywords.push(await translateOrThrow(kw, locale));
          await sleep(40);
        }
        await writeIfStale({
          kind: "seo",
          itemKey: page.path,
          locale,
          source,
          payload: { title, description, keywords },
        });
        result.written += 1;
      } catch (error) {
        result.failed += 1;
        result.details.push(
          `seo ${page.path} ${locale}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      await sleep(120);
    }
  }

  for (const item of serviceCatalog) {
    if (pastDeadline(deadline)) return;
    const source = { title: item.title };
    for (const locale of locales) {
      if (pastDeadline(deadline)) return;
      if (!(await needsWrite("catalog_service", item.slug, locale, source))) {
        result.skipped += 1;
        continue;
      }
      try {
        const title = await translateOrThrow(item.title, locale);
        await writeIfStale({
          kind: "catalog_service",
          itemKey: item.slug,
          locale,
          source,
          payload: { title },
        });
        await ensureEntitySlugFromTitle({
          entityType: "service",
          entityKey: item.slug,
          locale,
          title,
        });
        result.written += 1;
      } catch (error) {
        result.failed += 1;
        result.details.push(
          `catalog ${item.slug} ${locale}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      await sleep(80);
    }
  }

  for (const group of serviceGroups) {
    if (pastDeadline(deadline)) return;
    const source = { title: group.title };
    for (const locale of locales) {
      if (pastDeadline(deadline)) return;
      if (!(await needsWrite("catalog_group", group.id, locale, source))) {
        result.skipped += 1;
        continue;
      }
      try {
        const title = await translateOrThrow(group.title, locale);
        await writeIfStale({
          kind: "catalog_group",
          itemKey: group.id,
          locale,
          source,
          payload: { title },
        });
        result.written += 1;
      } catch (error) {
        result.failed += 1;
        result.details.push(
          `group ${group.id} ${locale}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      await sleep(80);
    }
  }

  for (const [slug, pack] of Object.entries(pageI18n)) {
    if (pastDeadline(deadline)) return;
    const source: PageI18n = pack.en;
    for (const locale of locales) {
      if (pastDeadline(deadline)) return;
      if (!(await needsWrite("page", slug, locale, source))) {
        result.skipped += 1;
        continue;
      }
      try {
        const title = await translateOrThrow(source.title, locale);
        await sleep(80);
        const subtitle = await translateOrThrow(source.subtitle, locale);
        const blocks = await translateBlocks(source.blocks, locale);
        await writeIfStale({
          kind: "page",
          itemKey: slug,
          locale,
          source,
          payload: { title, subtitle, blocks } satisfies PageI18n,
        });
        result.written += 1;
      } catch (error) {
        result.failed += 1;
        result.details.push(
          `page ${slug} ${locale}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      await sleep(150);
    }
  }

  for (const [slug, pack] of Object.entries(productI18n)) {
    if (pastDeadline(deadline)) return;
    const source: ProductI18n = pack.en;
    for (const locale of locales) {
      if (pastDeadline(deadline)) return;
      if (!(await needsWrite("product", slug, locale, source))) {
        result.skipped += 1;
        continue;
      }
      try {
        const name = source.name
          ? await translateOrThrow(source.name, locale)
          : undefined;
        await sleep(60);
        const shortDescription = await translateOrThrow(
          source.shortDescription,
          locale,
        );
        const description = source.description
          ? await translateOrThrow(source.description, locale)
          : undefined;
        await writeIfStale({
          kind: "product",
          itemKey: slug,
          locale,
          source,
          payload: { name, shortDescription, description } satisfies ProductI18n,
        });
        result.written += 1;
      } catch (error) {
        result.failed += 1;
        result.details.push(
          `product ${slug} ${locale}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      await sleep(120);
    }
  }

  for (const slug of listCustomServiceSlugs()) {
    if (pastDeadline(deadline)) return;
    const sourcePack = getCustomServiceSource(slug);
    if (!sourcePack) continue;
    const source = sourcePack.en;
    for (const locale of locales) {
      if (pastDeadline(deadline)) return;
      if (!(await needsWrite("custom_service", slug, locale, source))) {
        result.skipped += 1;
        continue;
      }
      try {
        const title = await translateOrThrow(source.title, locale);
        await sleep(80);
        const subtitle = await translateOrThrow(source.subtitle, locale);
        const blocks = await translateBlocks(source.blocks, locale);
        await writeIfStale({
          kind: "custom_service",
          itemKey: slug,
          locale,
          source,
          payload: { title, subtitle, blocks },
        });
        result.written += 1;
      } catch (error) {
        result.failed += 1;
        result.details.push(
          `custom ${slug} ${locale}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      await sleep(150);
    }
  }
}

async function fillUiMessages(deadline: number, result: TranslateContentResult) {
  const enPath = join(process.cwd(), "messages/en.json");
  const en = JSON.parse(readFileSync(enPath, "utf8")) as Record<string, unknown>;
  const flatEn = flattenStrings(en);

  for (const locale of mtLocales()) {
    if (pastDeadline(deadline)) return;
    const localePath = join(process.cwd(), `messages/${locale}.json`);
    let existing: Record<string, unknown> = {};
    try {
      existing = JSON.parse(readFileSync(localePath, "utf8")) as Record<string, unknown>;
    } catch {
      existing = {};
    }
    const stored = await prisma.localizedCopy.findUnique({
      where: {
        kind_itemKey_locale: { kind: "ui", itemKey: "_messages", locale },
      },
    });
    const overlay: Record<string, unknown> = isPlainObject(stored?.payload)
      ? { ...(stored!.payload as Record<string, unknown>) }
      : {};
    const flatExisting = {
      ...flattenStrings(existing),
      ...flattenStrings(overlay),
    };
    let wrote = 0;

    for (const [path, enValue] of Object.entries(flatEn)) {
      if (pastDeadline(deadline)) break;
      if (skipUiString(enValue)) continue;
      const have = flatExisting[path];
      if (
        have &&
        have.trim() &&
        isAcceptableTranslation(enValue, have, "en", locale)
      ) {
        continue;
      }
      try {
        const translated = await translateOrThrow(enValue, locale);
        setPath(overlay, path, translated);
        wrote += 1;
        await sleep(50);
      } catch {
        result.failed += 1;
      }
    }

    if (wrote > 0) {
      await upsertLocalizedCopy({
        kind: "ui",
        itemKey: "_messages",
        locale,
        payload: overlay,
        sourceHash: hashSource(flatEn),
      });
      result.written += wrote;
      result.details.push(`ui ${locale} +${wrote}`);
    } else {
      result.skipped += 1;
    }
  }
}

async function ensureSlug(
  result: TranslateContentResult,
  entityType:
    | "service"
    | "kb_category"
    | "kb_article"
    | "city"
    | "portfolio"
    | "shop",
  entityKey: string,
  locale: string,
  title: string,
) {
  try {
    const before = await prisma.entitySlug.findUnique({
      where: {
        entityType_entityKey_locale: { entityType, entityKey, locale },
      },
      select: { slug: true },
    });
    const row = await ensureEntitySlugFromTitle({
      entityType,
      entityKey,
      locale,
      title,
    });
    if (!before) {
      result.written += 1;
      result.details.push(`slug ${entityType}/${locale}/${entityKey}→${row.slug}`);
    } else {
      result.skipped += 1;
    }
  } catch (error) {
    result.failed += 1;
    result.details.push(
      `slug ${entityType}/${locale}/${entityKey}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

/**
 * Build per-locale public URL slugs from translated titles (services, KB, cities, …).
 */
async function fillEntitySlugs(deadline: number, result: TranslateContentResult) {
  const locales = allCodes();

  // Services
  for (const item of serviceCatalog) {
    if (pastDeadline(deadline)) return;
    for (const locale of locales) {
      if (pastDeadline(deadline)) return;
      await hydrateLocalizedCopy(locale);
      setCatalogLocaleOverlay(locale, getCatalogOverlaySync(locale));
      const title =
        locale === "nl"
          ? item.titleNl || item.title
          : catalogServiceTitle(item.slug, locale, item.title);
      await ensureSlug(result, "service", item.slug, locale, title);
    }
  }

  // Cities — translate English name when needed
  for (const city of seoCities) {
    if (pastDeadline(deadline)) return;
    for (const locale of locales) {
      if (pastDeadline(deadline)) return;
      let title =
        locale === "nl" ? city.nameNl : locale === "en" ? city.nameEn : city.nameEn;
      if (locale !== "nl" && locale !== "en") {
        const existing = await prisma.entitySlug.findUnique({
          where: {
            entityType_entityKey_locale: {
              entityType: "city",
              entityKey: city.slug,
              locale,
            },
          },
          select: { id: true },
        });
        if (existing) {
          result.skipped += 1;
          continue;
        }
        try {
          title = await translateOrThrow(city.nameEn, locale);
          await sleep(60);
        } catch {
          result.failed += 1;
          continue;
        }
      }
      await ensureSlug(result, "city", city.slug, locale, title);
    }
  }

  // Shop products
  for (const product of listShopProducts()) {
    if (pastDeadline(deadline)) return;
    for (const locale of locales) {
      if (pastDeadline(deadline)) return;
      await hydrateLocalizedCopy(locale);
      const pack = getProductI18n(product.slug, locale);
      const overlay = getLocalizedCopySync<{ name?: string }>(
        "product",
        product.slug,
        locale,
      );
      const title =
        overlay?.name ||
        pack?.name ||
        (locale === "nl" ? product.name.nl : product.name.en) ||
        product.slug;
      await ensureSlug(result, "shop", product.slug, locale, title);
    }
  }

  // Portfolio
  const projects = await prisma.portfolioProject.findMany({
    where: { published: true },
    select: { slug: true, title: true },
  });
  for (const project of projects) {
    if (pastDeadline(deadline)) return;
    for (const locale of locales) {
      if (pastDeadline(deadline)) return;
      let title = project.title;
      if (locale !== "nl" && locale !== "en") {
        const existing = await prisma.entitySlug.findUnique({
          where: {
            entityType_entityKey_locale: {
              entityType: "portfolio",
              entityKey: project.slug,
              locale,
            },
          },
          select: { id: true },
        });
        if (existing) {
          result.skipped += 1;
          continue;
        }
        try {
          title = await translateOrThrow(project.title, locale);
          await sleep(60);
        } catch {
          result.failed += 1;
          continue;
        }
      }
      await ensureSlug(result, "portfolio", project.slug, locale, title);
    }
  }

  // Kennisbank categories + articles (from existing translations)
  const categories = await prisma.kennisbankCategory.findMany({
    select: {
      slug: true,
      translations: { select: { locale: true, name: true } },
    },
  });
  for (const cat of categories) {
    if (pastDeadline(deadline)) return;
    for (const tr of cat.translations) {
      if (!tr.name?.trim()) continue;
      await ensureSlug(result, "kb_category", cat.slug, tr.locale, tr.name);
    }
  }

  const articles = await prisma.kennisbankArticle.findMany({
    select: {
      slug: true,
      translations: { select: { locale: true, title: true } },
    },
  });
  for (const article of articles) {
    if (pastDeadline(deadline)) return;
    for (const tr of article.translations) {
      if (!tr.title?.trim()) continue;
      await ensureSlug(result, "kb_article", article.slug, tr.locale, tr.title);
    }
  }
}

export async function runContentTranslationBackfill(
  options: BackfillOptions = {},
): Promise<TranslateContentResult> {
  const deadline = Date.now() + (options.deadlineMs ?? 420_000);
  const kinds = new Set(
    options.kinds || ["news", "kennisbank", "pages", "ui", "slugs"],
  );
  const result: TranslateContentResult = {
    ok: true,
    written: 0,
    skipped: 0,
    failed: 0,
    remaining: 0,
    details: [],
  };

  if (kinds.has("news")) await fillNews(deadline, result);
  if (kinds.has("kennisbank")) await fillKennisbank(deadline, result);
  if (kinds.has("pages")) await fillStaticPages(deadline, result);
  if (kinds.has("ui")) await fillUiMessages(deadline, result);
  if (kinds.has("slugs")) await fillEntitySlugs(deadline, result);

  result.remaining = pastDeadline(deadline) ? 1 : 0;
  result.ok = result.failed === 0 || result.written > 0 || result.skipped > 0;
  return result;
}

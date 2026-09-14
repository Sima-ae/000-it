import { prisma } from "@/lib/prisma";
import {
  contentTargetLocales,
  isAcceptableTranslation,
  translateHtml,
  translateText,
} from "@/lib/google-translate";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Dutch leftover that means a non-NL row is still the catalog original. */
const DUTCH_LEFTOVER_RE =
  /\b(hoe kan ik|hoe koppel ik|hoe stel ik|hoe meet ik|wat zijn|wat is een|wat betekenen|waarom is|welke |in dit artikel|stapsgewijze|aandachtspunten|professionele handleiding|kennisbank\b|domeinnamen|klantenpanel|oplevert|vindbaarheid|verbeter ik|mailboxen|bandbreedte|doorverwijzingen|klantvriendelijke)\b/i;

function stripHtmlLite(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function hasDutchLeftover(text: string | null | undefined) {
  return DUTCH_LEFTOVER_RE.test(stripHtmlLite(text || ""));
}

function sameText(a: string, b: string) {
  return a.trim().localeCompare(b.trim(), undefined, { sensitivity: "accent" }) === 0;
}

export type CategorySource = {
  name: string;
  description: string | null;
};

export type ArticleSource = {
  title: string;
  excerpt: string;
  bodyHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type FillResult = {
  written: string[];
  skipped: string[];
  failed: string[];
};

/**
 * Prefer English as machine-translate source (stable quality).
 * Fall back to Dutch when EN is missing.
 */
export function pickKennisbankSourceLocale(
  locales: string[],
): "en" | "nl" | string {
  if (locales.includes("en")) return "en";
  if (locales.includes("nl")) return "nl";
  return locales[0] || "en";
}

function shouldPreserveLocale(locale: string, sourceLocale: string, extra: string[] = []) {
  if (extra.includes(locale)) return true;
  // Curated Dutch is never overwritten from an English pivot.
  if (locale === "nl" && sourceLocale !== "nl") return true;
  return false;
}

export type ExistingCategoryTranslation = {
  locale: string;
  name: string;
  description: string | null;
};

export type ExistingArticleTranslation = {
  locale: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
};

/**
 * True when a stored row is a real translation for `locale` — skip MT.
 * False for missing, source-language copies, and leftover Dutch.
 */
export function isGoodCategoryTranslation(opts: {
  locale: string;
  name: string;
  description?: string | null;
  sourceName: string;
  sourceDescription?: string | null;
  sourceLocale: string;
  nlName?: string;
}): boolean {
  const { locale, name, sourceName, sourceLocale } = opts;
  if (!name?.trim()) return false;
  if (locale === sourceLocale || locale === "nl") return true;
  if (opts.nlName && sameText(name, opts.nlName) && name.trim().length > 12) {
    return false;
  }
  if (hasDutchLeftover(name) || hasDutchLeftover(opts.description)) return false;
  if (!isAcceptableTranslation(sourceName, name, sourceLocale, locale)) return false;
  const desc = (opts.description || "").trim();
  const srcDesc = (opts.sourceDescription || "").trim();
  if (srcDesc && desc) {
    if (sameText(desc, srcDesc) && srcDesc.length > 24) return false;
    if (!isAcceptableTranslation(srcDesc, desc, sourceLocale, locale)) return false;
  }
  return true;
}

export function isGoodArticleTranslation(opts: {
  locale: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  source: ArticleSource;
  sourceLocale: string;
  nlTitle?: string;
}): boolean {
  const { locale, title, excerpt, bodyHtml, source, sourceLocale } = opts;
  if (!title?.trim() || !excerpt?.trim() || !bodyHtml?.trim()) return false;
  if (locale === sourceLocale || locale === "nl") return true;
  if (opts.nlTitle && sameText(title, opts.nlTitle) && title.trim().length > 12) {
    return false;
  }
  if (hasDutchLeftover(title) || hasDutchLeftover(excerpt) || hasDutchLeftover(bodyHtml)) {
    return false;
  }
  if (/in dit artikel/i.test(bodyHtml)) return false;
  if (/knowledge-base article explains/i.test(bodyHtml)) return false;
  if (
    locale !== "en" &&
    /Professional TripleZero iT Hosting guide:/i.test(bodyHtml)
  ) {
    return false;
  }
  if (!isAcceptableTranslation(source.title, title, sourceLocale, locale)) {
    return false;
  }
  if (sameText(title, source.title) && source.title.trim().length > 18) return false;
  if (sameText(excerpt, source.excerpt) && source.excerpt.trim().length > 24) {
    return false;
  }
  return true;
}

export function localesNeedingCategoryFill(opts: {
  translations: ExistingCategoryTranslation[];
  source: CategorySource;
  sourceLocale: string;
  targets: string[];
  nlName?: string;
}): string[] {
  const byLocale = new Map(opts.translations.map((t) => [t.locale, t]));
  return opts.targets.filter((locale) => {
    if (locale === opts.sourceLocale) return false;
    if (shouldPreserveLocale(locale, opts.sourceLocale)) return false;
    const row = byLocale.get(locale);
    if (!row) return true;
    return !isGoodCategoryTranslation({
      locale,
      name: row.name,
      description: row.description,
      sourceName: opts.source.name,
      sourceDescription: opts.source.description,
      sourceLocale: opts.sourceLocale,
      nlName: opts.nlName,
    });
  });
}

export function localesNeedingArticleFill(opts: {
  translations: ExistingArticleTranslation[];
  source: ArticleSource;
  sourceLocale: string;
  targets: string[];
  nlTitle?: string;
}): string[] {
  const byLocale = new Map(opts.translations.map((t) => [t.locale, t]));
  return opts.targets.filter((locale) => {
    if (locale === opts.sourceLocale) return false;
    if (shouldPreserveLocale(locale, opts.sourceLocale)) return false;
    const row = byLocale.get(locale);
    if (!row) return true;
    return !isGoodArticleTranslation({
      locale,
      title: row.title,
      excerpt: row.excerpt,
      bodyHtml: row.bodyHtml,
      source: opts.source,
      sourceLocale: opts.sourceLocale,
      nlTitle: opts.nlTitle,
    });
  });
}

async function translateField(
  value: string,
  locale: string,
  sourceLocale: string,
  html = false,
): Promise<string> {
  const out = html
    ? await translateHtml(value, locale, sourceLocale)
    : await translateText(value, locale, sourceLocale);
  if (!isAcceptableTranslation(value, out, sourceLocale, locale)) {
    throw new Error(`quality ${sourceLocale}→${locale}`);
  }
  return out;
}

async function withLocaleRetries<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastErr = error;
      const msg = error instanceof Error ? error.message : String(error);
      const wait = msg.includes("rate") || msg.includes("429")
        ? Math.max(8_000 * (i + 1), 12_000)
        : 700 * 2 ** i;
      await sleep(wait);
    }
  }
  throw lastErr || new Error("retries exhausted");
}

export async function fillCategoryTranslations(opts: {
  categoryId: string;
  source: CategorySource;
  sourceLocale?: string;
  locales?: string[];
  force?: boolean;
  delayMs?: number;
  preserveLocales?: string[];
  deadlineMs?: number;
  existing?: ExistingCategoryTranslation[];
  nlName?: string;
}): Promise<FillResult> {
  const sourceLocale = opts.sourceLocale || "en";
  const targets = (opts.locales || contentTargetLocales(sourceLocale)).filter(
    (l) => l !== sourceLocale && !shouldPreserveLocale(l, sourceLocale, opts.preserveLocales),
  );
  const delayMs = opts.delayMs ?? 280;
  const deadline = opts.deadlineMs ? Date.now() + opts.deadlineMs : Number.POSITIVE_INFINITY;
  const written: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  const existingRows =
    opts.existing ||
    (await prisma.kennisbankCategoryTranslation.findMany({
      where: { categoryId: opts.categoryId },
      select: { locale: true, name: true, description: true },
    }));
  const byLocale = new Map(existingRows.map((t) => [t.locale, t]));
  const nlName =
    opts.nlName || existingRows.find((t) => t.locale === "nl")?.name;

  const ordered = [
    ...targets.filter((l) => l === "nl"),
    ...targets.filter((l) => l !== "nl"),
  ];

  for (const locale of ordered) {
    if (Date.now() > deadline) {
      failed.push(locale);
      continue;
    }

    if (!opts.force) {
      const existing = byLocale.get(locale);
      if (
        existing &&
        isGoodCategoryTranslation({
          locale,
          name: existing.name,
          description: existing.description,
          sourceName: opts.source.name,
          sourceDescription: opts.source.description,
          sourceLocale,
          nlName,
        })
      ) {
        skipped.push(locale);
        continue;
      }
    }

    try {
      await withLocaleRetries(async () => {
        const name = await translateField(opts.source.name, locale, sourceLocale);
        await sleep(120);
        const description = opts.source.description
          ? await translateField(opts.source.description, locale, sourceLocale)
          : null;

        await prisma.kennisbankCategoryTranslation.upsert({
          where: {
            categoryId_locale: { categoryId: opts.categoryId, locale },
          },
          create: {
            categoryId: opts.categoryId,
            locale,
            name,
            description,
          },
          update: {
            name,
            description,
          },
        });
      });
      written.push(locale);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(
        `[kennisbank-i18n] category ${opts.categoryId} → ${locale}:`,
        msg,
      );
      failed.push(locale);
      if (msg.includes("rate") || msg.includes("429")) {
        await sleep(Math.max(delayMs * 8, 20_000));
      }
    }
    await sleep(delayMs);
  }

  return { written, skipped, failed };
}

export async function fillArticleTranslations(opts: {
  articleId: string;
  source: ArticleSource;
  sourceLocale?: string;
  locales?: string[];
  force?: boolean;
  delayMs?: number;
  preserveLocales?: string[];
  deadlineMs?: number;
  existing?: ExistingArticleTranslation[];
  nlTitle?: string;
}): Promise<FillResult> {
  const sourceLocale = opts.sourceLocale || "en";
  const targets = (opts.locales || contentTargetLocales(sourceLocale)).filter(
    (l) => l !== sourceLocale && !shouldPreserveLocale(l, sourceLocale, opts.preserveLocales),
  );
  const delayMs = opts.delayMs ?? 350;
  const deadline = opts.deadlineMs ? Date.now() + opts.deadlineMs : Number.POSITIVE_INFINITY;
  const written: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  const existingRows =
    opts.existing ||
    (await prisma.kennisbankArticleTranslation.findMany({
      where: { articleId: opts.articleId },
      select: { locale: true, title: true, excerpt: true, bodyHtml: true },
    }));
  const byLocale = new Map(existingRows.map((t) => [t.locale, t]));
  const nlTitle =
    opts.nlTitle || existingRows.find((t) => t.locale === "nl")?.title;

  const ordered = [
    ...targets.filter((l) => l === "nl"),
    ...targets.filter((l) => l !== "nl"),
  ];

  for (const locale of ordered) {
    if (Date.now() > deadline) {
      failed.push(locale);
      continue;
    }

    if (!opts.force) {
      const existing = byLocale.get(locale);
      if (
        existing &&
        isGoodArticleTranslation({
          locale,
          title: existing.title,
          excerpt: existing.excerpt,
          bodyHtml: existing.bodyHtml,
          source: opts.source,
          sourceLocale,
          nlTitle,
        })
      ) {
        skipped.push(locale);
        continue;
      }
    }

    try {
      await withLocaleRetries(async () => {
        const title = await translateField(opts.source.title, locale, sourceLocale);
        await sleep(120);
        const excerpt = await translateField(opts.source.excerpt, locale, sourceLocale);
        await sleep(120);
        const bodyHtml = await translateField(
          opts.source.bodyHtml,
          locale,
          sourceLocale,
          true,
        );
        await sleep(120);
        const seoTitle = opts.source.seoTitle
          ? await translateField(opts.source.seoTitle, locale, sourceLocale)
          : `${title} | TripleZero iT Hosting`;
        await sleep(80);
        const seoDescription = opts.source.seoDescription
          ? await translateField(opts.source.seoDescription, locale, sourceLocale)
          : excerpt;

        await prisma.kennisbankArticleTranslation.upsert({
          where: {
            articleId_locale: { articleId: opts.articleId, locale },
          },
          create: {
            articleId: opts.articleId,
            locale,
            title,
            excerpt,
            bodyHtml,
            seoTitle: seoTitle || null,
            seoDescription: seoDescription || null,
          },
          update: {
            title,
            excerpt,
            bodyHtml,
            seoTitle: seoTitle || null,
            seoDescription: seoDescription || null,
          },
        });
      });
      written.push(locale);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[kennisbank-i18n] article ${opts.articleId} → ${locale}:`, msg);
      failed.push(locale);
      if (msg.includes("rate") || msg.includes("429")) {
        await sleep(Math.max(delayMs * 8, 20_000));
      }
    }
    await sleep(delayMs);
  }

  return { written, skipped, failed };
}

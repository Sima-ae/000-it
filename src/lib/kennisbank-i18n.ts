import { prisma } from "@/lib/prisma";
import {
  contentTargetLocales,
  isAcceptableTranslation,
  translateHtml,
  translateText,
} from "@/lib/google-translate";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
      const existing = await prisma.kennisbankCategoryTranslation.findUnique({
        where: {
          categoryId_locale: { categoryId: opts.categoryId, locale },
        },
      });
      if (existing?.name?.trim()) {
        const identicalToSource =
          existing.name.trim() === opts.source.name.trim() &&
          (existing.description || "").trim() ===
            (opts.source.description || "").trim();
        const looksTranslated = isAcceptableTranslation(
          opts.source.name,
          existing.name,
          sourceLocale,
          locale,
        );
        if (!identicalToSource && looksTranslated) {
          skipped.push(locale);
          continue;
        }
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
      const existing = await prisma.kennisbankArticleTranslation.findUnique({
        where: {
          articleId_locale: { articleId: opts.articleId, locale },
        },
      });
      if (existing?.title?.trim() && existing.bodyHtml?.trim()) {
        const identicalToSource =
          existing.title.trim() === opts.source.title.trim() &&
          existing.excerpt.trim() === opts.source.excerpt.trim();
        const looksTranslated = isAcceptableTranslation(
          opts.source.title,
          existing.title,
          sourceLocale,
          locale,
        );
        if (!identicalToSource && looksTranslated) {
          skipped.push(locale);
          continue;
        }
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

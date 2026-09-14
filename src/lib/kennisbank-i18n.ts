import { prisma } from "@/lib/prisma";
import {
  contentTargetLocales,
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

export async function fillCategoryTranslations(opts: {
  categoryId: string;
  source: CategorySource;
  sourceLocale?: string;
  locales?: string[];
  force?: boolean;
  delayMs?: number;
}): Promise<{ written: string[]; skipped: string[] }> {
  const sourceLocale = opts.sourceLocale || "en";
  const targets = (opts.locales || contentTargetLocales(sourceLocale)).filter(
    (l) => l !== sourceLocale,
  );
  const delayMs = opts.delayMs ?? 280;
  const written: string[] = [];
  const skipped: string[] = [];

  // Always ensure Dutch exists when source is EN (site default).
  const ordered = [
    ...targets.filter((l) => l === "nl"),
    ...targets.filter((l) => l !== "nl"),
  ];

  for (const locale of ordered) {
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
        // Already localized (differs from EN source) → skip
        if (!identicalToSource) {
          skipped.push(locale);
          continue;
        }
      }
    }

    try {
      const name = await translateText(opts.source.name, locale, sourceLocale);
      await sleep(120);
      const description = opts.source.description
        ? await translateText(opts.source.description, locale, sourceLocale)
        : null;

      await prisma.kennisbankCategoryTranslation.upsert({
        where: {
          categoryId_locale: { categoryId: opts.categoryId, locale },
        },
        create: {
          categoryId: opts.categoryId,
          locale,
          name: name || opts.source.name,
          description: description || opts.source.description,
        },
        update: {
          name: name || opts.source.name,
          description: description || opts.source.description,
        },
      });
      written.push(locale);
    } catch (error) {
      console.warn(
        `[kennisbank-i18n] category ${opts.categoryId} → ${locale}:`,
        error instanceof Error ? error.message : error,
      );
    }
    await sleep(delayMs);
  }

  return { written, skipped };
}

export async function fillArticleTranslations(opts: {
  articleId: string;
  source: ArticleSource;
  sourceLocale?: string;
  locales?: string[];
  force?: boolean;
  delayMs?: number;
}): Promise<{ written: string[]; skipped: string[] }> {
  const sourceLocale = opts.sourceLocale || "en";
  const targets = (opts.locales || contentTargetLocales(sourceLocale)).filter(
    (l) => l !== sourceLocale,
  );
  const delayMs = opts.delayMs ?? 350;
  const written: string[] = [];
  const skipped: string[] = [];

  const ordered = [
    ...targets.filter((l) => l === "nl"),
    ...targets.filter((l) => l !== "nl"),
  ];

  for (const locale of ordered) {
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
        if (!identicalToSource) {
          skipped.push(locale);
          continue;
        }
      }
    }

    try {
      const title = await translateText(opts.source.title, locale, sourceLocale);
      await sleep(120);
      const excerpt = await translateText(
        opts.source.excerpt,
        locale,
        sourceLocale,
      );
      await sleep(120);
      const bodyHtml = await translateHtml(
        opts.source.bodyHtml,
        locale,
        sourceLocale,
      );
      await sleep(120);
      const seoTitle = opts.source.seoTitle
        ? await translateText(opts.source.seoTitle, locale, sourceLocale)
        : `${title || opts.source.title} | TripleZero iT Hosting`;
      await sleep(80);
      const seoDescription = opts.source.seoDescription
        ? await translateText(opts.source.seoDescription, locale, sourceLocale)
        : excerpt || opts.source.excerpt;

      await prisma.kennisbankArticleTranslation.upsert({
        where: {
          articleId_locale: { articleId: opts.articleId, locale },
        },
        create: {
          articleId: opts.articleId,
          locale,
          title: title || opts.source.title,
          excerpt: excerpt || opts.source.excerpt,
          bodyHtml: bodyHtml || opts.source.bodyHtml,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
        },
        update: {
          title: title || opts.source.title,
          excerpt: excerpt || opts.source.excerpt,
          bodyHtml: bodyHtml || opts.source.bodyHtml,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
        },
      });
      written.push(locale);
    } catch (error) {
      console.warn(
        `[kennisbank-i18n] article ${opts.articleId} → ${locale}:`,
        error instanceof Error ? error.message : error,
      );
    }
    await sleep(delayMs);
  }

  return { written, skipped };
}

import {
  isAcceptableTranslation,
  newsTargetLocales,
  translateText,
} from "@/lib/google-translate";

export type NewsLocaleCopy = {
  title: string;
  excerpt: string;
  description: string;
};

/** locale → copy (never includes `en`; English lives in canonical columns). */
export type NewsTranslationsMap = Record<string, NewsLocaleCopy>;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function asCopy(value: unknown): NewsLocaleCopy | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const title = typeof v.title === "string" ? v.title : "";
  const excerpt = typeof v.excerpt === "string" ? v.excerpt : "";
  const description = typeof v.description === "string" ? v.description : "";
  if (!title && !excerpt && !description) return null;
  return { title, excerpt, description };
}

export function parseNewsTranslations(raw: unknown): NewsTranslationsMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: NewsTranslationsMap = {};
  for (const [locale, value] of Object.entries(raw as Record<string, unknown>)) {
    const copy = asCopy(value);
    if (copy) out[locale] = copy;
  }
  return out;
}

export function newsCopyLooksComplete(
  copy: NewsLocaleCopy | undefined,
  en: NewsLocaleCopy,
  locale: string,
): boolean {
  if (!copy?.title?.trim() || !copy.excerpt?.trim() || !copy.description?.trim()) {
    return false;
  }
  return (
    isAcceptableTranslation(en.title, copy.title, "en", locale) &&
    isAcceptableTranslation(en.excerpt, copy.excerpt, "en", locale) &&
    isAcceptableTranslation(en.description, copy.description, "en", locale)
  );
}

export function missingNewsLocales(
  en: NewsLocaleCopy,
  translations: NewsTranslationsMap,
  locales = newsTargetLocales(),
): string[] {
  return locales.filter((locale) => !newsCopyLooksComplete(translations[locale], en, locale));
}

async function translateNewsCopy(
  en: NewsLocaleCopy,
  locale: string,
): Promise<NewsLocaleCopy> {
  const title = await translateText(en.title, locale, "en");
  await sleep(120);
  const excerpt = await translateText(en.excerpt, locale, "en");
  await sleep(120);
  const description = await translateText(en.description, locale, "en");
  const copy = { title, excerpt, description };
  if (!newsCopyLooksComplete(copy, en, locale)) {
    throw new Error(`quality en→${locale}`);
  }
  return copy;
}

/**
 * Translate EN source into every non-English site locale.
 * Always includes Dutch (`nl`). Skips locales that already look translated.
 * Does not store English stubs — failed locales stay missing so a later run can resume.
 */
export async function buildNewsTranslationsFromEnglish(
  en: NewsLocaleCopy,
  opts?: {
    locales?: string[];
    existing?: NewsTranslationsMap;
    delayMs?: number;
    force?: boolean;
    deadlineMs?: number;
    preserveLocales?: string[];
  },
): Promise<NewsTranslationsMap> {
  const locales = opts?.locales ?? newsTargetLocales();
  const existing = opts?.existing ?? {};
  const delayMs = opts?.delayMs ?? 280;
  const preserve = new Set(opts?.preserveLocales || []);
  const deadline = opts?.deadlineMs ? Date.now() + opts.deadlineMs : Number.POSITIVE_INFINITY;
  const out: NewsTranslationsMap = { ...existing };

  const ordered = [
    ...locales.filter((l) => l === "nl"),
    ...locales.filter((l) => l !== "nl"),
  ];

  for (const locale of ordered) {
    if (Date.now() > deadline) break;
    if (preserve.has(locale) && newsCopyLooksComplete(out[locale], en, locale)) {
      continue;
    }
    if (!opts?.force && newsCopyLooksComplete(out[locale], en, locale)) continue;

    let lastErr: unknown;
    let written = false;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        out[locale] = await translateNewsCopy(en, locale);
        written = true;
        break;
      } catch (error) {
        lastErr = error;
        const msg = error instanceof Error ? error.message : String(error);
        const wait =
          msg.includes("rate") || msg.includes("429")
            ? Math.max(delayMs * 8, 16_000)
            : 700 * 2 ** attempt;
        await sleep(wait);
      }
    }

    if (!written) {
      const msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
      console.warn(`[news-i18n] translate ${locale} failed:`, msg);
      delete out[locale];
    }
    await sleep(delayMs);
  }

  return out;
}

export function nlFromTranslations(
  translations: NewsTranslationsMap,
  en: NewsLocaleCopy,
): NewsLocaleCopy {
  const nl = translations.nl;
  return {
    title: nl?.title?.trim() || en.title,
    excerpt: nl?.excerpt?.trim() || en.excerpt,
    description: nl?.description?.trim() || en.description,
  };
}

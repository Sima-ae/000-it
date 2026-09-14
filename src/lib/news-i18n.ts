import { translateText, newsTargetLocales } from "@/lib/google-translate";

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

/**
 * Translate EN source into every non-English site locale.
 * Always includes Dutch (`nl`). Rate-limits between locales to avoid 429s.
 */
export async function buildNewsTranslationsFromEnglish(
  en: NewsLocaleCopy,
  opts?: { locales?: string[]; existing?: NewsTranslationsMap; delayMs?: number },
): Promise<NewsTranslationsMap> {
  const locales = opts?.locales ?? newsTargetLocales();
  const existing = opts?.existing ?? {};
  const delayMs = opts?.delayMs ?? 280;
  const out: NewsTranslationsMap = { ...existing };

  // Prefer Dutch first — site default language.
  const ordered = [
    ...locales.filter((l) => l === "nl"),
    ...locales.filter((l) => l !== "nl"),
  ];

  for (const locale of ordered) {
    const prev = out[locale];
    if (
      prev?.title?.trim() &&
      prev.excerpt?.trim() &&
      prev.description?.trim() &&
      prev.title !== en.title
    ) {
      continue;
    }

    try {
      // Sequential field translates — fewer 429s than Promise.all
      const title = (await translateText(en.title, locale, "en")) || en.title;
      await sleep(120);
      const excerpt = (await translateText(en.excerpt, locale, "en")) || en.excerpt;
      await sleep(120);
      const description =
        (await translateText(en.description, locale, "en")) || en.description;
      out[locale] = { title, excerpt, description };
      await sleep(delayMs);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[news-i18n] translate ${locale} failed:`, msg);
      // Do not store English stubs — keeps the locale "missing" so reruns resume.
      if (msg.includes("rate-limited")) {
        await sleep(Math.max(delayMs * 8, 20_000));
      } else {
        await sleep(delayMs * 2);
      }
    }
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

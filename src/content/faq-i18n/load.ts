import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export type FaqPackItem = { id: string; question: string; answer: string };
export type FaqPackCategory = {
  id: string;
  title: string;
  items: FaqPackItem[];
};
export type FaqPack = {
  title: string;
  subtitle: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  categories: FaqPackCategory[];
};

const cache = new Map<string, FaqPack>();

function readPack(locale: string): FaqPack | null {
  if (cache.has(locale)) return cache.get(locale)!;
  const path = join(process.cwd(), "src/content/faq-i18n", `${locale}.json`);
  if (!existsSync(path)) return null;
  try {
    const pack = JSON.parse(readFileSync(path, "utf8")) as FaqPack;
    if (!pack?.categories?.length) return null;
    cache.set(locale, pack);
    return pack;
  } catch (error) {
    console.error(`[faq-i18n] failed to load ${locale}`, error);
    return null;
  }
}

/** Load FAQ pack for locale: exact → en → nl. */
export function loadFaqPack(locale: string): FaqPack | null {
  return readPack(locale) || readPack("en") || readPack("nl");
}

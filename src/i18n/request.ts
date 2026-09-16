import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import {
  getUiMessageOverlaySync,
  hydrateLocalizedCopy,
} from "@/lib/localized-copy";
import { canonicalizeNewsPageOf } from "@/lib/news-pagination";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepMergeMessages(
  base: Record<string, unknown>,
  overlay: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    if (isPlainObject(value) && isPlainObject(out[key])) {
      out[key] = deepMergeMessages(out[key] as Record<string, unknown>, value);
    } else if (value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

function sanitizePaginationCopy(messages: Record<string, unknown>) {
  const news = messages.news;
  if (isPlainObject(news) && typeof news.pageOf === "string") {
    news.pageOf = canonicalizeNewsPageOf(news.pageOf);
  }
  return messages;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const fileMessages = (await import(`../../messages/${locale}.json`)).default as Record<
    string,
    unknown
  >;

  if (locale === "nl" || locale === "en") {
    return { locale, messages: sanitizePaginationCopy(fileMessages) };
  }

  await hydrateLocalizedCopy(locale);
  const overlay = getUiMessageOverlaySync(locale);
  return {
    locale,
    messages: sanitizePaginationCopy(deepMergeMessages(fileMessages, overlay)),
  };
});

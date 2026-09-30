import { getRequestConfig } from "next-intl/server";
import { readRequestSiteBrand } from "@/lib/brand/install-public-name";
import { applyExtraHostingMessages } from "@/lib/brand/extra-hosting-messages";
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

/** Google Translate sometimes wraps words in `<g id="…">`, which next-intl rejects. */
function stripMtGTags(value: string) {
  let out = value;
  if (out.includes("<g") || out.includes("</g")) {
    out = out.replace(/<\/?g\b[^>]*>/gi, "");
  }
  out = out
    .replace(/&#10;/gi, "\n")
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&#(\d+);/g, (_, n) => {
      const code = Number(n);
      if (code === 10) return "\n";
      if (code === 39) return "'";
      try {
        return String.fromCodePoint(code);
      } catch {
        return " ";
      }
    })
    .replace(/\[[^\]]*(?:ترجمة|Translation|Übersetz|Traduction|Traducción)[^\]]*:\s*([^\]]+)\]/gi, "$1")
    .replace(/\[[^\]]*(?:ترجمة|Translation|Übersetz|Traduction|Traducción)[^\]]*\]/gi, "");
  return out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
}

function stripMtGTagsInMessages(messages: Record<string, unknown>) {
  for (const [key, value] of Object.entries(messages)) {
    if (typeof value === "string") {
      const next = stripMtGTags(value);
      if (next !== value) messages[key] = next;
    } else if (isPlainObject(value)) {
      stripMtGTagsInMessages(value);
    }
  }
  return messages;
}

function sanitizeMessages(messages: Record<string, unknown>) {
  stripMtGTagsInMessages(messages);
  const news = messages.news;
  if (isPlainObject(news) && typeof news.pageOf === "string") {
    news.pageOf = canonicalizeNewsPageOf(news.pageOf);
  }
  return messages;
}

function forExtraHosting<T>(messages: T, locale: string): T {
  if (readRequestSiteBrand() !== "extrahosting") return messages;
  let next = applyExtraHostingMessages(messages, locale);
  if (locale === "nl") {
    next = replaceDutchAmpersands(next);
  }
  return next;
}

function replaceDutchAmpersands<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(/\s*&\s*/g, " en ") as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceDutchAmpersands(item)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = replaceDutchAmpersands(item);
    }
    return out as T;
  }
  return value;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    if (readRequestSiteBrand() === "extrahosting") {
      const host = (
        (globalThis as { __siteExtraHostingHost?: () => string }).__siteExtraHostingHost?.() ||
        ""
      ).toLowerCase();
      locale =
        host === "extrahosting.nl" || host.endsWith(".extrahosting.nl") ? "nl" : "en";
    } else {
      locale = routing.defaultLocale;
    }
  }

  const fileMessages = (await import(`../../messages/${locale}.json`)).default as Record<
    string,
    unknown
  >;

  if (locale === "nl" || locale === "en") {
    return {
      locale,
      messages: forExtraHosting(sanitizeMessages(fileMessages), locale),
    };
  }

  await hydrateLocalizedCopy(locale);
  const overlay = getUiMessageOverlaySync(locale);
  return {
    locale,
    messages: forExtraHosting(
      sanitizeMessages(deepMergeMessages(fileMessages, overlay)),
      locale,
    ),
  };
});

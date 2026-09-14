/**
 * Lightweight Google Translate helper (unofficial gtx endpoint).
 * Used for news / FAQ-style machine translation. Includes retries for 429.
 */

import { enabledLanguages } from "@/i18n/languages";

/** Map site locale → Google Translate `tl` code */
export const GOOGLE_TRANSLATE_TL: Record<string, string> = {
  nl: "nl",
  en: "en",
  fr: "fr",
  de: "de",
  es: "es",
  pt: "pt",
  it: "it",
  el: "el",
  pl: "pl",
  cs: "cs",
  sk: "sk",
  hu: "hu",
  ro: "ro",
  bg: "bg",
  hr: "hr",
  sr: "sr",
  bs: "bs",
  cnr: "sr", // Montenegrin → Serbian closest
  sq: "sq",
  mk: "mk",
  lt: "lt",
  da: "da",
  sv: "sv",
  no: "no",
  fi: "fi",
  uk: "uk",
  ru: "ru",
  tr: "tr",
  he: "iw",
  ar: "ar",
  ka: "ka",
  hy: "hy",
  az: "az",
  zh: "zh-CN",
  ja: "ja",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

async function translateChunk(
  text: string,
  from: string,
  to: string,
  attempt = 0,
): Promise<string> {
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(from)}` +
    `&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "TripleZeroIT-Translate/1.0" },
    signal: AbortSignal.timeout(45_000),
  });

  if (res.status === 429 || res.status === 503) {
    if (attempt >= 6) {
      throw new Error(`Translate rate-limited (${res.status}) after retries`);
    }
    const wait = 1200 * Math.pow(2, attempt) + Math.floor(Math.random() * 500);
    await sleep(wait);
    return translateChunk(text, from, to, attempt + 1);
  }

  if (!res.ok) {
    throw new Error(`Translate failed (${res.status})`);
  }

  const data = (await res.json()) as unknown;
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error("Unexpected translate payload");
  }
  return data[0]
    .map((row: unknown) => (Array.isArray(row) ? String(row[0] || "") : ""))
    .join("")
    .trim();
}

/**
 * Translate plain text from `fromLocale` (site code) to `toLocale` (site code).
 * Chunks long bodies to stay under URL limits.
 */
export async function translateText(
  text: string,
  toLocale: string,
  fromLocale = "en",
): Promise<string> {
  const input = text?.trim() ? text : "";
  if (!input) return "";
  if (toLocale === fromLocale) return input;

  const from = GOOGLE_TRANSLATE_TL[fromLocale] || fromLocale;
  const to = GOOGLE_TRANSLATE_TL[toLocale] || toLocale;
  if (from === to) return input;

  const chunks: string[] = [];
  if (input.length <= 850) {
    chunks.push(input);
  } else {
    const paras = input.split(/\n\n+/);
    let buf = "";
    for (const para of paras) {
      if (`${buf}\n\n${para}`.length > 850 && buf) {
        chunks.push(buf);
        buf = para;
      } else {
        buf = buf ? `${buf}\n\n${para}` : para;
      }
    }
    if (buf) chunks.push(buf);
  }

  const out: string[] = [];
  for (let i = 0; i < chunks.length; i += 1) {
    if (i > 0) await sleep(180);
    out.push(await translateChunk(chunks[i], from, to));
  }
  return cleanText(out.join("\n\n"));
}

/** Locales that need machine translation (every enabled language except English source). */
export function newsTargetLocales(): string[] {
  return enabledLanguages()
    .map((l) => l.code)
    .filter((code) => code !== "en");
}

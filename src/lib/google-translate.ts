/**
 * Multi-provider free machine translation.
 * Order: Google gtx → Lingva → MyMemory → LibreTranslate.
 * Used for news / kennisbank / page MT. In-memory cache for the process.
 */

import { enabledLanguages } from "@/i18n/languages";

/** Map site locale → MT target codes (Google / MyMemory style). */
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
  cnr: "sr",
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
  he: "he",
  ar: "ar",
  ka: "ka",
  hy: "hy",
  az: "az",
  zh: "zh-CN",
  ja: "ja",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Google Translate wraps some phrases in `<g id="…">` tags. Those are not content. */
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
  return out;
}

function cleanText(value: string) {
  return stripMtGTags(value).replace(/\s+/g, " ").trim();
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function isBad(out: string | null | undefined) {
  if (!out || typeof out !== "string") return true;
  if (
    /MYMEMORY WARNING|INVALID SOURCE|QUERY LENGTH|PLEASE SELECT|RATE LIMIT|Too Many Requests|^<!DOCTYPE|^<html/i.test(
      out,
    )
  ) {
    return true;
  }
  if (/amnesty international|منظمة العفو|amnisti[aá]|amnestie international/i.test(out)) {
    return true;
  }
  return false;
}

/** Brand / product terms that must never be rewritten by MT. Longest first. */
const PROTECTED_TERMS = [
  "TripleZero iT Hosting",
  "TripleZero iT",
  "000-it.com",
  "Core Web Vitals",
  "google-translate-api-x",
  "WooCommerce",
  "WordPress",
  "Next.js",
  "ChatGPT",
  "OpenAI",
  "Anthropic",
  "Microsoft",
  "Copilot",
  "Gemini",
  "Claude",
  "AEO",
  "GEO",
  "SEO",
  "SSL",
  "VPS",
  "DNS",
  "API",
  "FAQ",
  "AI",
];

function protectTerms(text: string): { text: string; tokens: string[] } {
  let out = text;
  const tokens: string[] = [];
  for (let i = 0; i < PROTECTED_TERMS.length; i += 1) {
    const term = PROTECTED_TERMS[i];
    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    if (!re.test(out)) continue;
    const token = `⟦T${tokens.length}⟧`;
    tokens.push(term);
    out = out.replace(re, token);
  }
  return { text: out, tokens };
}

function restoreTerms(text: string, tokens: string[]) {
  let out = text;
  for (let i = 0; i < tokens.length; i += 1) {
    const token = `⟦T${i}⟧`;
    const alt = new RegExp(
      `\\[\\[?T?\\s*${i}\\s*\\]?\\]|⟦\\s*T?\\s*${i}\\s*⟧|TZTERM${i}|T${i}`,
      "gi",
    );
    out = out.split(token).join(tokens[i]);
    out = out.replace(alt, tokens[i]);
  }
  return out;
}

/** Protect ICU / template placeholders `{name}` so MT does not rewrite them. */
function protectPlaceholders(text: string): { text: string; tokens: string[] } {
  const tokens: string[] = [];
  const out = text.replace(/\{[^{}]+\}/g, (match) => {
    const token = `⟦P${tokens.length}⟧`;
    tokens.push(match);
    return token;
  });
  return { text: out, tokens };
}

function restorePlaceholders(text: string, tokens: string[]) {
  let out = text;
  for (let i = 0; i < tokens.length; i += 1) {
    out = out.split(`⟦P${i}⟧`).join(tokens[i]);
  }
  return out;
}

const SCRIPT_RE: Record<string, RegExp> = {
  ar: /[\u0600-\u06FF]/,
  he: /[\u0590-\u05FF]/,
  zh: /[\u4E00-\u9FFF]/,
  ja: /[\u3040-\u30FF\u4E00-\u9FFF]/,
  ka: /[\u10A0-\u10FF]/,
  hy: /[\u0530-\u058F]/,
  el: /[\u0370-\u03FF]/,
  ru: /[\u0400-\u04FF]/,
  uk: /[\u0400-\u04FF]/,
  bg: /[\u0400-\u04FF]/,
  mk: /[\u0400-\u04FF]/,
};

function needsTargetScript(locale: string) {
  return Boolean(SCRIPT_RE[locale]);
}

function hasTargetScript(text: string, locale: string) {
  const re = SCRIPT_RE[locale];
  return re ? re.test(text) : true;
}

function looksLikeAcronymBlob(text: string) {
  const plain = stripHtml(text);
  if (plain.length > 28) return false;
  return /^[\w\s&/+\-.:·|]+$/u.test(plain);
}

/**
 * True when MT output is usable for `toLocale`.
 * Rejects provider errors, source-language echoes, and missing target scripts.
 */
export function isAcceptableTranslation(
  source: string,
  output: string | null | undefined,
  fromLocale: string,
  toLocale: string,
): boolean {
  if (!output || isBad(output)) return false;
  if (fromLocale === toLocale) return true;

  const src = stripHtml(source);
  const out = stripHtml(output);
  if (!out) return false;
  if (src.length <= 1) return true;
  if (looksLikeAcronymBlob(src) && looksLikeAcronymBlob(out)) return true;

  const same = src.localeCompare(out, undefined, { sensitivity: "accent" }) === 0;
  const fromCode = GOOGLE_TRANSLATE_TL[fromLocale] || fromLocale;
  const toCode = GOOGLE_TRANSLATE_TL[toLocale] || toLocale;
  if (same && fromCode !== toCode && src.length > 18) return false;

  if (needsTargetScript(toLocale) && src.length > 24 && !hasTargetScript(out, toLocale)) {
    return false;
  }

  return true;
}

const memoryCache = new Map<string, string>();

/** Per-provider cooldown until timestamp (ms). Skip hot providers after 429/HTML. */
const providerCooldownUntil = new Map<string, number>();

function isRateLimitError(err: unknown) {
  const msg = String(err);
  return /429|503|rate|quota|limit|DOCTYPE|not valid JSON|Unexpected token/i.test(msg);
}

function coolProvider(name: string, ms: number) {
  const until = Date.now() + ms;
  const prev = providerCooldownUntil.get(name) || 0;
  if (until > prev) providerCooldownUntil.set(name, until);
}

function providerReady(name: string) {
  const until = providerCooldownUntil.get(name) || 0;
  return Date.now() >= until;
}

async function readJsonResponse(res: Response, provider: string): Promise<unknown> {
  const raw = await res.text();
  const trimmed = raw.trim();
  if (
    !trimmed ||
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<html") ||
    trimmed.startsWith("<HTML")
  ) {
    coolProvider(provider, 90_000);
    throw new Error(`${provider} rate-limited (html)`);
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    coolProvider(provider, 60_000);
    throw new Error(`${provider} not valid JSON`);
  }
}

async function viaMyMemory(text: string, from: string, to: string): Promise<string> {
  const email = process.env.MYMEMORY_EMAIL || "info@000-it.com";
  const q = text.slice(0, 450);
  const url =
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}` +
    `&langpair=${encodeURIComponent(`${from}|${to}`)}` +
    `&de=${encodeURIComponent(email)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (res.status === 429 || res.status === 503) {
    coolProvider("mymemory", 6 * 60 * 60 * 1000);
    throw new Error(`mymemory ${res.status}`);
  }
  if (!res.ok) throw new Error(`mymemory ${res.status}`);
  const data = (await readJsonResponse(res, "mymemory")) as {
    responseData?: { translatedText?: string };
  };
  const out = data?.responseData?.translatedText;
  if (isBad(out)) throw new Error("mymemory bad");
  if (text.length <= 450) return out!;

  let result = out!;
  for (let i = 450; i < text.length; i += 450) {
    await sleep(500);
    const chunk = text.slice(i, i + 450);
    const u =
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}` +
      `&langpair=${encodeURIComponent(`${from}|${to}`)}` +
      `&de=${encodeURIComponent(email)}`;
    const r = await fetch(u, { signal: AbortSignal.timeout(20_000) });
    if (r.status === 429 || r.status === 503) {
      coolProvider("mymemory", 6 * 60 * 60 * 1000);
      throw new Error(`mymemory ${r.status}`);
    }
    const d = (await readJsonResponse(r, "mymemory")) as {
      responseData?: { translatedText?: string };
    };
    const t = d?.responseData?.translatedText;
    result += isBad(t) ? chunk : t!;
  }
  return result;
}

async function viaGoogleGtx(text: string, from: string, to: string): Promise<string> {
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(from)}` +
    `&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text.slice(0, 4500))}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "TripleZeroIT-Translate/1.0" },
    signal: AbortSignal.timeout(45_000),
  });
  if (res.status === 429 || res.status === 503) {
    coolProvider("gtx", 120_000);
    throw new Error(`gtx ${res.status}`);
  }
  if (!res.ok) throw new Error(`gtx ${res.status}`);
  const data = await readJsonResponse(res, "gtx");
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error("gtx payload");
  }
  const out = data[0]
    .map((row: unknown) => (Array.isArray(row) ? String(row[0] || "") : ""))
    .join("")
    .trim();
  if (isBad(out)) throw new Error("gtx bad");
  return out;
}

const LINGVA_HOSTS = [
  "https://lingva.lunar.icu",
  "https://translate.igna.wtf",
  "https://lingva.ml",
];

async function viaLingva(text: string, from: string, to: string): Promise<string> {
  const tl = to === "zh-CN" ? "zh" : to === "iw" ? "he" : to;
  let lastErr: unknown;
  for (const host of LINGVA_HOSTS) {
    try {
      const url = `${host}/api/v1/${from}/${tl}/${encodeURIComponent(text.slice(0, 500))}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`${host} ${res.status}`);
      const data = (await res.json()) as { translation?: string };
      const out = data.translation;
      if (isBad(out) || out === text.slice(0, 500)) throw new Error(`${host} echo`);
      return out!;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("lingva failed");
}

const LIBRE_HOSTS = [
  "https://translate.fedilab.app",
  "https://libretranslate.de",
];

async function viaLibre(text: string, from: string, to: string): Promise<string> {
  const target = to === "zh-CN" ? "zh" : to === "iw" ? "he" : to;
  let lastErr: unknown;
  for (const host of LIBRE_HOSTS) {
    try {
      const res = await fetch(`${host}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source: from,
          target,
          format: "text",
        }),
        signal: AbortSignal.timeout(20_000),
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(`${host} ${res.status}`);
      const data = JSON.parse(raw) as { translatedText?: string; translation?: string };
      const out = data.translatedText || data.translation;
      if (isBad(out)) throw new Error(`${host} bad`);
      return out!;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("libre failed");
}

async function viaGoogleAndroid(text: string, from: string, to: string): Promise<string> {
  const url =
    `https://translate.google.com/translate_a/single?client=at&dt=t&dt=rm&dj=1` +
    `&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}` +
    `&q=${encodeURIComponent(text.slice(0, 4500))}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "AndroidTranslate/5.3.0.RC02.130475354-53000263 5.1 phone TRANSLATE_OPM5_TEST_1",
    },
    signal: AbortSignal.timeout(45_000),
  });
  if (res.status === 429 || res.status === 503) {
    coolProvider("g-at", 120_000);
    throw new Error(`g-at ${res.status}`);
  }
  if (!res.ok) throw new Error(`g-at ${res.status}`);
  const data = (await readJsonResponse(res, "g-at")) as {
    sentences?: Array<{ trans?: string }>;
  };
  const out = Array.isArray(data?.sentences)
    ? data.sentences.map((s) => s.trans || "").join("").trim()
    : "";
  if (isBad(out)) throw new Error("g-at bad");
  return out;
}

function parseGoogleSingle(data: unknown): string {
  if (data && typeof data === "object" && Array.isArray((data as { sentences?: unknown }).sentences)) {
    return ((data as { sentences: Array<{ trans?: string }> }).sentences || [])
      .map((s) => s.trans || "")
      .join("")
      .trim();
  }
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return (data[0] as unknown[])
      .map((row) => (Array.isArray(row) ? String(row[0] || "") : ""))
      .join("")
      .trim();
  }
  return "";
}

async function viaGoogleDict(text: string, from: string, to: string): Promise<string> {
  const url =
    `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex` +
    `&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}&dt=t` +
    `&q=${encodeURIComponent(text.slice(0, 4500))}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(45_000),
  });
  if (res.status === 429 || res.status === 503) {
    coolProvider("g-dict", 120_000);
    throw new Error(`g-dict ${res.status}`);
  }
  if (!res.ok) throw new Error(`g-dict ${res.status}`);
  const out = parseGoogleSingle(await readJsonResponse(res, "g-dict"));
  if (isBad(out)) throw new Error("g-dict bad");
  return out;
}

async function viaGoogleClients5(text: string, from: string, to: string): Promise<string> {
  const url =
    `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&dt=t` +
    `&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}` +
    `&q=${encodeURIComponent(text.slice(0, 4500))}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(45_000),
  });
  if (res.status === 429 || res.status === 503) {
    coolProvider("g-c5", 120_000);
    throw new Error(`g-c5 ${res.status}`);
  }
  if (!res.ok) throw new Error(`g-c5 ${res.status}`);
  const data = await readJsonResponse(res, "g-c5");
  let out = "";
  if (Array.isArray(data) && typeof data[0] === "string") out = data[0];
  else if (
    Array.isArray(data) &&
    Array.isArray(data[0]) &&
    typeof (data[0] as unknown[])[0] === "string"
  ) {
    out = (data as string[][]).map((row) => row[0]).join("");
  } else {
    out = parseGoogleSingle(data);
  }
  if (isBad(out)) throw new Error("g-c5 bad");
  return out.trim();
}

async function translateChunk(
  text: string,
  from: string,
  to: string,
  fromLocale: string,
  toLocale: string,
): Promise<string> {
  const providers: Array<[string, () => Promise<string>]> = [
    ["g-dict", () => viaGoogleDict(text, from, to)],
    ["g-c5", () => viaGoogleClients5(text, from, to)],
    ["g-at", () => viaGoogleAndroid(text, from, to)],
    ["gtx", () => viaGoogleGtx(text, from, to)],
    ["lingva", () => viaLingva(text, from, to)],
    ["mymemory", () => viaMyMemory(text, from, to)],
    ["libre", () => viaLibre(text, from, to)],
  ];

  let lastErr: unknown;
  let limited = 0;
  for (const [name, fn] of providers) {
    if (!providerReady(name)) {
      limited += 1;
      continue;
    }
    try {
      const out = await fn();
      if (!isBad(out) && isAcceptableTranslation(text, out, fromLocale, toLocale)) {
        return out;
      }
      lastErr = new Error(`${name} quality`);
    } catch (e) {
      lastErr = e;
      if (isRateLimitError(e)) {
        limited += 1;
        coolProvider(name, name.startsWith("g") ? 120_000 : 45_000);
        console.warn(`[translate] ${name} limited (${from}→${to}); trying next provider`);
        await sleep(1_500);
      }
    }
  }
  if (limited > 0) {
    throw new Error(`rate-limited (${from}→${to})`);
  }
  throw lastErr || new Error("All translation providers failed");
}

async function translateChunkWithRetry(
  text: string,
  from: string,
  to: string,
  fromLocale: string,
  toLocale: string,
): Promise<string> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await translateChunk(text, from, to, fromLocale, toLocale);
    } catch (e) {
      lastErr = e;
      const limited = isRateLimitError(e);
      const wait = limited
        ? Math.min(180_000, 20_000 * (attempt + 1))
        : 900 * 2 ** attempt;
      console.warn(
        `[translate] retry ${attempt + 1}/5 after ${Math.round(wait / 1000)}s (${String(e).slice(0, 100)})`,
      );
      await sleep(wait);
    }
  }
  throw lastErr || new Error("translate retry exhausted");
}

/**
 * Translate plain text from `fromLocale` (site code) to `toLocale` (site code).
 * Chunks long bodies to stay under URL limits. Failover across free providers.
 * Throws when every provider fails — callers must not store the source as a fake translation.
 */
export async function translateText(
  text: string,
  toLocale: string,
  fromLocale = "en",
  opts?: { collapseWhitespace?: boolean },
): Promise<string> {
  const collapse = opts?.collapseWhitespace !== false;
  const input = collapse ? (text?.trim() ? text : "") : text || "";
  if (!input.trim()) return collapse ? "" : input;
  if (toLocale === fromLocale) return input;

  const from = GOOGLE_TRANSLATE_TL[fromLocale] || fromLocale;
  const to = GOOGLE_TRANSLATE_TL[toLocale] || toLocale;
  if (from === to) return input;

  const brands = protectTerms(input);
  const placeholders = protectPlaceholders(brands.text);
  const protectedInput = placeholders.text;

  const cacheKey = `${from}|${to}|${protectedInput}`;
  const cached = memoryCache.get(cacheKey);
  if (cached != null) {
    return restoreTerms(restorePlaceholders(cached, placeholders.tokens), brands.tokens);
  }

  const chunks: string[] = [];
  if (protectedInput.length <= 850) {
    chunks.push(protectedInput);
  } else if (!collapse) {
    const parts = protectedInput.split(/(?<=<\/(?:p|h[1-6]|li|aside|div|ul|ol)>)/i);
    let buf = "";
    for (const part of parts) {
      if (`${buf}${part}`.length > 850 && buf) {
        chunks.push(buf);
        buf = part;
      } else {
        buf += part;
      }
    }
    if (buf) chunks.push(buf);
  } else {
    const paras = protectedInput.split(/\n\n+/);
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
    if (i > 0) await sleep(450);
    out.push(await translateChunkWithRetry(chunks[i], from, to, fromLocale, toLocale));
  }
  const joined = !collapse ? stripMtGTags(out.join("")) : cleanText(out.join("\n\n"));
  const restored = restoreTerms(restorePlaceholders(joined, placeholders.tokens), brands.tokens);

  if (!isAcceptableTranslation(input, restored, fromLocale, toLocale)) {
    throw new Error(`quality ${fromLocale}→${toLocale}`);
  }

  memoryCache.set(cacheKey, joined);
  return restored;
}

/**
 * Translate HTML knowledge-base bodies while keeping tags as intact as possible.
 */
export async function translateHtml(
  html: string,
  toLocale: string,
  fromLocale = "en",
): Promise<string> {
  if (!html?.trim()) return html || "";
  if (toLocale === fromLocale) return html;
  return translateText(html, toLocale, fromLocale, { collapseWhitespace: false });
}

/** Locales that need machine translation (every enabled language except English source). */
export function newsTargetLocales(): string[] {
  return enabledLanguages()
    .map((l) => l.code)
    .filter((code) => code !== "en");
}

/** All enabled locales except the given source (default English). */
export function contentTargetLocales(sourceLocale = "en"): string[] {
  return enabledLanguages()
    .map((l) => l.code)
    .filter((code) => code !== sourceLocale);
}

export function allEnabledLocales(): string[] {
  return enabledLanguages().map((l) => l.code);
}

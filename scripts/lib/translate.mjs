/**
 * Free multi-provider translation with disk cache + failover.
 * Order: Google dict → clients5 → Android(at) → gtx → Simply → Mozhi → Lingva → MyMemory → Libre → google-npm
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CACHE_DIR = join(process.cwd(), ".cache/mt");
mkdirSync(CACHE_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Global throttle between live (non-cache) provider attempts */
const MIN_GAP_MS = Number(process.env.MT_MIN_GAP_MS || 450);
let lastLiveAt = 0;

async function throttleLive() {
  const wait = MIN_GAP_MS - (Date.now() - lastLiveAt);
  if (wait > 0) await sleep(wait);
  lastLiveAt = Date.now();
}

/** Skip a provider for a while after 429/quota failures */
const providerCooldownUntil = new Map();
function providerReady(name) {
  const until = providerCooldownUntil.get(name) || 0;
  return Date.now() >= until;
}
function coolProvider(name, ms) {
  const until = Date.now() + ms;
  const prev = providerCooldownUntil.get(name) || 0;
  if (until > prev) providerCooldownUntil.set(name, until);
}

/** Map our locale codes → provider language codes */
export const LOCALE_TO_MT = {
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

export const ALL_TARGET_LOCALES = Object.keys(LOCALE_TO_MT).filter((l) => l !== "en");

function cacheKey(text, from, to) {
  return createHash("sha1").update(`${from}|${to}|${text}`).digest("hex");
}

function readCache(key) {
  const p = join(CACHE_DIR, `${key}.txt`);
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
}

function writeCache(key, value) {
  writeFileSync(join(CACHE_DIR, `${key}.txt`), value, "utf8");
}

/** Google Translate markup / MT artifacts that must never ship in UI copy. */
export function stripMtArtifacts(value) {
  if (!value || typeof value !== "string") return value;
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
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
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

function isBad(out) {
  if (!out || typeof out !== "string") return true;
  const trimmed = out.trim();
  if (
    /MYMEMORY WARNING|INVALID SOURCE|QUERY LENGTH|PLEASE SELECT|RATE LIMIT|Too Many Requests/i.test(
      trimmed,
    )
  ) {
    return true;
  }
  // Only treat English error payloads as bad — do NOT match translated words like "errores"
  if (/^(Error|ERROR)([:\s]|$)/.test(trimmed)) return true;
  if (/^<!DOCTYPE|^<html/i.test(trimmed)) return true;
  // Google often mistranslates the acronym "AI" as Amnesty International.
  if (/amnesty international|منظمة العفو|amnisti[aá]|amnestie international/i.test(trimmed)) {
    return true;
  }
  return false;
}

function parseGoogleSingle(data) {
  if (Array.isArray(data?.sentences)) {
    return data.sentences.map((s) => s.trans || "").join("");
  }
  if (Array.isArray(data?.[0])) {
    return data[0].map((x) => (Array.isArray(x) ? x[0] : "") || "").join("");
  }
  return null;
}

function parseClients5(data) {
  if (typeof data === "string") return data;
  if (!Array.isArray(data)) return null;
  if (typeof data[0] === "string") return data[0];
  if (Array.isArray(data[0]) && typeof data[0][0] === "string") {
    if (data.every((row) => Array.isArray(row) && typeof row[0] === "string")) {
      return data.map((row) => row[0]).join("");
    }
  }
  return parseGoogleSingle(data);
}

async function viaMyMemory(text, from, to) {
  const email = process.env.MYMEMORY_EMAIL || "info@000-it.com";
  const q = text.slice(0, 450);
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${encodeURIComponent(`${from}|${to}`)}&de=${encodeURIComponent(email)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`mymemory HTTP ${res.status}`);
  const data = await res.json();
  let out = data?.responseData?.translatedText;
  if (isBad(out)) {
    if (/MYMEMORY WARNING|AVAILABLE FREE TRANSLATIONS/i.test(String(out))) {
      coolProvider("mymemory", 6 * 60 * 60 * 1000);
    }
    throw new Error(`mymemory bad: ${String(out).slice(0, 80)}`);
  }
  if (text.length <= 450) return out;
  let result = out;
  for (let i = 450; i < text.length; i += 450) {
    await sleep(120);
    const chunk = text.slice(i, i + 450);
    const u = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${encodeURIComponent(`${from}|${to}`)}&de=${encodeURIComponent(email)}`;
    const r = await fetch(u, { signal: AbortSignal.timeout(15000) });
    const d = await r.json();
    const t = d?.responseData?.translatedText;
    if (isBad(t)) result += chunk;
    else result += t;
  }
  return result;
}

const LIBRE_HOSTS = [
  "https://libretranslate.de",
  "https://translate.fedilab.app",
  "https://translate.argosopentech.com",
  "https://lt.vern.cc",
];

async function viaLibre(text, from, to) {
  let lastErr;
  for (const host of LIBRE_HOSTS) {
    try {
      const res = await fetch(`${host}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source: from,
          target: to === "zh-CN" ? "zh" : to,
          format: "text",
        }),
        signal: AbortSignal.timeout(20000),
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(`${host} ${res.status}`);
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`${host} non-json`);
      }
      const out = data.translatedText || data.translation;
      if (isBad(out)) throw new Error(`${host} bad`);
      return out;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("libre failed");
}

async function viaGoogleUnofficial(text, from, to) {
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(from)}` +
    `&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text.slice(0, 4500))}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(20000),
  });
  if (res.status === 429 || res.status === 503) {
    coolProvider("gtx", 120_000);
    throw new Error(`gtx ${res.status}`);
  }
  if (!res.ok) throw new Error(`gtx HTTP ${res.status}`);
  const data = await res.json();
  const out = parseGoogleSingle(data);
  if (isBad(out)) throw new Error("gtx bad");
  return out;
}

/** Chrome Dictionary extension client — separate quota from gtx/at. */
async function viaGoogleDict(text, from, to) {
  const url =
    `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex` +
    `&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}&dt=t` +
    `&q=${encodeURIComponent(text.slice(0, 4500))}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(25000),
  });
  if (res.status === 429 || res.status === 503) {
    coolProvider("g-dict", 90_000);
    throw new Error(`g-dict ${res.status}`);
  }
  if (!res.ok) throw new Error(`g-dict HTTP ${res.status}`);
  const data = await res.json();
  const out = parseGoogleSingle(data);
  if (isBad(out)) throw new Error("g-dict bad");
  return out;
}

/** Google clients5 translate_a/t — Chrome-dict family endpoint. */
async function viaGoogleClients5(text, from, to) {
  const url =
    `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&dt=t` +
    `&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}` +
    `&q=${encodeURIComponent(text.slice(0, 4500))}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(25000),
  });
  if (res.status === 429 || res.status === 503) {
    coolProvider("g-c5", 90_000);
    throw new Error(`g-c5 ${res.status}`);
  }
  if (!res.ok) throw new Error(`g-c5 HTTP ${res.status}`);
  const data = await res.json();
  const out = parseClients5(data);
  if (isBad(out)) throw new Error("g-c5 bad");
  return out;
}

/** Google Translate Android client endpoint. */
async function viaGoogleAndroid(text, from, to) {
  const url =
    `https://translate.google.com/translate_a/single?client=at&dt=t&dt=rm&dj=1` +
    `&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}` +
    `&q=${encodeURIComponent(text.slice(0, 4500))}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "AndroidTranslate/5.3.0.RC02.130475354-53000263 5.1 phone TRANSLATE_OPM5_TEST_1",
    },
    signal: AbortSignal.timeout(25000),
  });
  if (res.status === 429 || res.status === 503) {
    coolProvider("g-at", 90_000);
    throw new Error(`g-at HTTP ${res.status}`);
  }
  if (!res.ok) throw new Error(`g-at HTTP ${res.status}`);
  const data = await res.json();
  const out = parseGoogleSingle(data);
  if (isBad(out)) throw new Error("g-at bad");
  return out;
}

async function viaGoogleNpm(text, from, to) {
  const translate = (await import("google-translate-api-x")).default;
  const res = await translate(text, { from, to, forceBatch: false });
  const out = typeof res.text === "string" ? res.text : null;
  if (isBad(out)) throw new Error("google-npm bad");
  return out;
}

const LINGVA_HOSTS = [
  "https://lingva.lunar.icu",
  "https://lingva.opnxng.com",
  "https://translate.plausibility.cloud",
  "https://lingva.garudalinux.org",
  "https://translate.projectsegfau.lt",
  "https://translate.dr460nf1r3.org",
  "https://lingva.ml",
  "https://translate.igna.wtf",
];

async function viaLingva(text, from, to) {
  const tl = to === "zh-CN" ? "zh" : to;
  let lastErr;
  for (const host of LINGVA_HOSTS) {
    try {
      const chunkSize = 450;
      if (text.length <= chunkSize) {
        const url = `${host}/api/v1/${from}/${tl}/${encodeURIComponent(text)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error(`${host} ${res.status}`);
        const data = await res.json();
        const out = data.translation;
        if (isBad(out) || out === text) throw new Error(`${host} echo/bad`);
        return out;
      }
      let result = "";
      for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.slice(i, i + chunkSize);
        const url = `${host}/api/v1/${from}/${tl}/${encodeURIComponent(chunk)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error(`${host} ${res.status}`);
        const data = await res.json();
        const out = data.translation;
        if (isBad(out) || out === chunk) throw new Error(`${host} echo/bad`);
        result += out;
        if (i + chunkSize < text.length) await sleep(100);
      }
      return result;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("lingva failed");
}

const SIMPLY_HOSTS = [
  "https://simplytranslate.org",
  "https://st.tokhmi.xyz",
  "https://translate.bus-hit.me",
  "https://simplytranslate.pussthecat.org",
];

async function viaSimply(text, from, to) {
  const tl = to === "zh-CN" ? "zh-CN" : to;
  let lastErr;
  for (const host of SIMPLY_HOSTS) {
    for (const engine of ["google", "libre"]) {
      try {
        const url =
          `${host}/api/translate/?engine=${engine}` +
          `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(tl)}` +
          `&text=${encodeURIComponent(text.slice(0, 4500))}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
        if (!res.ok) throw new Error(`${host} ${engine} ${res.status}`);
        const data = await res.json();
        const out = data.translated_text || data.translatedText;
        if (isBad(out) || !out.trim()) throw new Error(`${host} empty/bad`);
        return out;
      } catch (e) {
        lastErr = e;
      }
    }
  }
  throw lastErr || new Error("simply failed");
}

const MOZHI_HOSTS = [
  "https://mozhi.aryak.me",
  "https://nyc1.mz.ggtyler.dev",
  "https://translate.bus-hit.me",
];

async function viaMozhi(text, from, to) {
  const tl = to === "zh-CN" ? "zh" : to;
  let lastErr;
  for (const host of MOZHI_HOSTS) {
    for (const engine of ["google", "libre", "reverso", "duckduckgo"]) {
      try {
        const url =
          `${host}/api/translate?engine=${engine}` +
          `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(tl)}` +
          `&text=${encodeURIComponent(text.slice(0, 4500))}`;
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0" },
          signal: AbortSignal.timeout(20000),
        });
        if (!res.ok) throw new Error(`${host} ${engine} ${res.status}`);
        const data = await res.json();
        const out =
          data["translated-text"] ||
          data.translated_text ||
          data.translatedText ||
          data.translation;
        if (isBad(out) || !String(out).trim() || out === text) {
          throw new Error(`${host} ${engine} echo/bad`);
        }
        return out;
      } catch (e) {
        lastErr = e;
      }
    }
  }
  throw lastErr || new Error("mozhi failed");
}

/**
 * Translate text from `fromLocale` to `toLocale` (our site locale codes).
 */
export async function translateText(text, toLocale, fromLocale = "en") {
  if (!text?.trim()) return text;
  if (toLocale === fromLocale) return text;

  const from = LOCALE_TO_MT[fromLocale] || fromLocale;
  const to = LOCALE_TO_MT[toLocale] || toLocale;
  if (!to || to === from) return text;

  const key = cacheKey(text, from, to);
  const cached = readCache(key);
  if (cached != null && !(cached === text && from !== to)) {
    const cleaned = stripMtArtifacts(cached);
    if (!isBad(cleaned)) return cleaned;
  }

  const providers = [
    ["g-dict", () => viaGoogleDict(text, from, to)],
    ["g-c5", () => viaGoogleClients5(text, from, to)],
    ["g-at", () => viaGoogleAndroid(text, from, to)],
    ["gtx", () => viaGoogleUnofficial(text, from, to)],
    ["simply", () => viaSimply(text, from, to)],
    ["mozhi", () => viaMozhi(text, from, to)],
    ["lingva", () => viaLingva(text, from, to)],
    ["mymemory", () => viaMyMemory(text, from, to)],
    ["libre", () => viaLibre(text, from, to)],
    ["google-npm", () => viaGoogleNpm(text, from, to)],
  ];

  let lastErr;
  for (const [name, fn] of providers) {
    if (!providerReady(name)) continue;
    try {
      await throttleLive();
      const out = stripMtArtifacts(await fn());
      if (!isBad(out)) {
        if (!(out === text && from !== to)) writeCache(key, out);
        if (process.env.MT_DEBUG) {
          console.log(`[mt] ${from}→${toLocale} via ${name} (${text.length}c)`);
        }
        return out;
      }
    } catch (e) {
      lastErr = e;
      if (process.env.MT_DEBUG) {
        console.log(`[mt] ${name} fail:`, String(e).slice(0, 100));
      }
      if (/429|rate|quota|limit|Too Many/i.test(String(e))) {
        coolProvider(name, Number(process.env.MT_429_MS || 90_000));
        await sleep(Number(process.env.MT_429_PAUSE_MS || 800));
      } else {
        await sleep(120);
      }
    }
  }

  console.warn(`[mt] all providers failed for →${toLocale}:`, String(lastErr).slice(0, 120));
  // Back off before the next string so we don't stampede a shared IP quota
  await sleep(Number(process.env.MT_FAIL_PAUSE_MS || 2500));
  return text;
}

export async function translateManyConcurrent(
  strings,
  toLocale,
  fromLocale = "en",
  {
    concurrency = Number(process.env.MT_CONCURRENCY || 1),
    delayMs = Number(process.env.MT_DELAY_MS || 450),
  } = {},
) {
  const out = new Array(strings.length);
  let next = 0;
  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (true) {
      const i = next++;
      if (i >= strings.length) return;
      out[i] = await translateText(strings[i], toLocale, fromLocale);
      await sleep(delayMs);
    }
  });
  await Promise.all(workers);
  return out;
}

export async function translateMany(strings, toLocale, fromLocale = "en", { delayMs = 500 } = {}) {
  const out = [];
  for (const s of strings) {
    out.push(await translateText(s, toLocale, fromLocale));
    await sleep(delayMs);
  }
  return out;
}

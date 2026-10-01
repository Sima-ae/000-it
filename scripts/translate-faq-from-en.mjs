/**
 * Translate FAQ hosting categories from hand-authored EN → all other locales.
 * - Rebuilds pack structure from EN (adds domeinen / email-dns, updates webhosting)
 * - Reuses existing locale translations for unchanged categories/items by id
 * - Protects markdown links during MT
 * - Does NOT overwrite nl.json or en.json
 *
 * Usage: node scripts/translate-faq-from-en.mjs [locale...]
 * Env: MT_CONCURRENCY=4 MT_DELAY_MS=80
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { translateManyConcurrent, stripMtArtifacts } from "./lib/translate.mjs";

const DIR = join(process.cwd(), "src/content/faq-i18n");
const EN = JSON.parse(readFileSync(join(DIR, "en.json"), "utf8"));

const FORCE_TRANSLATE_CATS = new Set(["domeinen", "webhosting", "email-dns"]);

const TO = {
  de: "de",
  fr: "fr",
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
  zh: "zh",
  ja: "ja",
  bn: "bn",
  hi: "hi",
  mr: "mr",
  pa: "pa",
  ps: "ps",
  te: "te",
  ur: "ur",
};

const DEFAULT_TARGETS = Object.keys(TO);
const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 4);
const DELAY = Number(process.env.MT_DELAY_MS || 80);

const MD_LINK_RE = /\[([^\]]+)\]\((\/[^)\s]+|https?:\/\/[^)\s]+)\)/g;

function protect(text) {
  const ph = [];
  const out = String(text || "").replace(MD_LINK_RE, (m) => {
    const token = `⟦L${ph.length}⟧`;
    ph.push(m);
    return token;
  });
  return { out, ph };
}

function restore(text, ph) {
  let out = String(text || "");
  ph.forEach((p, i) => {
    for (const v of [`⟦L${i}⟧`, `[[L${i}]]`, `[L${i}]`, `【L${i}】`, `«L${i}»`]) {
      out = out.split(v).join(p);
    }
  });
  return out;
}

function indexPack(pack) {
  /** @type {Map<string, {title:string, items:Map<string,{question:string,answer:string}>}>} */
  const byCat = new Map();
  for (const c of pack.categories || []) {
    const items = new Map();
    for (const i of c.items || []) items.set(i.id, i);
    byCat.set(c.id, { title: c.title, items });
  }
  return {
    title: pack.title,
    subtitle: pack.subtitle,
    ctaTitle: pack.ctaTitle,
    ctaText: pack.ctaText,
    ctaButton: pack.ctaButton,
    byCat,
  };
}

function itemCount(pack) {
  return pack.categories.reduce((s, c) => s + c.items.length, 0);
}

function countLinks(pack) {
  let n = 0;
  for (const c of pack.categories) {
    for (const i of c.items) {
      const m = String(i.answer).match(MD_LINK_RE);
      if (m) n += m.length;
    }
  }
  return n;
}

async function translateStrings(strings, locale) {
  if (!strings.length) return [];
  const protectedList = strings.map((s) => protect(s));
  const vals = await translateManyConcurrent(
    protectedList.map((p) => p.out),
    locale,
    "en",
    { concurrency: CONCURRENCY, delayMs: DELAY },
  );
  return vals.map((v, i) =>
    stripMtArtifacts(restore(v || strings[i], protectedList[i].ph)),
  );
}

async function buildLocalePack(locale) {
  const path = join(DIR, `${locale}.json`);
  const prev = existsSync(path)
    ? indexPack(JSON.parse(readFileSync(path, "utf8")))
    : null;

  const out = structuredClone(EN);

  // Collect strings that need MT (meta if missing + force cats + missing reused items)
  /** @type {{path: string, text: string}[]} */
  const jobs = [];

  const push = (pathKey, text, reuse) => {
    if (reuse) return;
    jobs.push({ path: pathKey, text });
  };

  push("title", EN.title, Boolean(prev?.title));
  push("subtitle", EN.subtitle, Boolean(prev?.subtitle));
  push("ctaTitle", EN.ctaTitle, Boolean(prev?.ctaTitle));
  push("ctaText", EN.ctaText, Boolean(prev?.ctaText));
  push("ctaButton", EN.ctaButton, Boolean(prev?.ctaButton));

  if (prev?.title) out.title = prev.title;
  if (prev?.subtitle) out.subtitle = prev.subtitle;
  if (prev?.ctaTitle) out.ctaTitle = prev.ctaTitle;
  if (prev?.ctaText) out.ctaText = prev.ctaText;
  if (prev?.ctaButton) out.ctaButton = prev.ctaButton;

  for (let ci = 0; ci < out.categories.length; ci++) {
    const cat = out.categories[ci];
    const src = EN.categories[ci];
    const prevCat = prev?.byCat.get(src.id);
    const force = FORCE_TRANSLATE_CATS.has(src.id);

    if (!force && prevCat?.title) {
      cat.title = prevCat.title;
    } else {
      push(`c:${ci}:title`, src.title, false);
    }

    for (let ii = 0; ii < cat.items.length; ii++) {
      const item = cat.items[ii];
      const s = src.items[ii];
      const prevItem = prevCat?.items.get(s.id);
      if (!force && prevItem?.question && prevItem?.answer) {
        item.question = prevItem.question;
        item.answer = prevItem.answer;
      } else {
        push(`c:${ci}:i:${ii}:q`, s.question, false);
        push(`c:${ci}:i:${ii}:a`, s.answer, false);
      }
    }
  }

  console.log(`[${locale}] translating ${jobs.length} strings…`);
  const translated = await translateStrings(
    jobs.map((j) => j.text),
    locale,
  );
  const byPath = new Map(jobs.map((j, i) => [j.path, translated[i]]));

  if (byPath.has("title")) out.title = byPath.get("title");
  if (byPath.has("subtitle")) out.subtitle = byPath.get("subtitle");
  if (byPath.has("ctaTitle")) out.ctaTitle = byPath.get("ctaTitle");
  if (byPath.has("ctaText")) out.ctaText = byPath.get("ctaText");
  if (byPath.has("ctaButton")) out.ctaButton = byPath.get("ctaButton");

  for (let ci = 0; ci < out.categories.length; ci++) {
    const cat = out.categories[ci];
    const tKey = `c:${ci}:title`;
    if (byPath.has(tKey)) cat.title = byPath.get(tKey);
    for (let ii = 0; ii < cat.items.length; ii++) {
      const item = cat.items[ii];
      const qKey = `c:${ci}:i:${ii}:q`;
      const aKey = `c:${ci}:i:${ii}:a`;
      if (byPath.has(qKey)) item.question = byPath.get(qKey);
      if (byPath.has(aKey)) item.answer = byPath.get(aKey);
    }
  }

  return out;
}

mkdirSync(DIR, { recursive: true });

const requested = process.argv.slice(2).filter((x) => x !== "--");
const targets = (requested.length ? requested : DEFAULT_TARGETS).filter(
  (l) => l !== "en" && l !== "nl" && TO[l],
);

console.log("EN items=", itemCount(EN), "links=", countLinks(EN));
console.log(
  `targets=${targets.length} concurrency=${CONCURRENCY} delay=${DELAY}`,
);
console.log(targets.join(", "));

for (const locale of targets) {
  console.log(`\n=== ${locale} ===`);
  const pack = await buildLocalePack(locale);
  writeFileSync(join(DIR, `${locale}.json`), `${JSON.stringify(pack, null, 2)}\n`);
  console.log(
    `wrote ${locale} items=${itemCount(pack)} links=${countLinks(pack)} cats=${pack.categories.map((c) => c.id).join(",")}`,
  );
}

console.log("\nDone.");

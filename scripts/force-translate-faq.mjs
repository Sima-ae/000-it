/**
 * Fast force-translate FAQ packs from en.json using batched Google Translate.
 * Usage: node scripts/force-translate-faq.mjs [locale...]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import translate from "google-translate-api-x";

const DIR = join(process.cwd(), "src/content/faq-i18n");
const EN = JSON.parse(readFileSync(join(DIR, "en.json"), "utf8"));

const TARGETS = [
  "de", "fr", "es", "pt", "it", "el", "pl", "cs", "sk", "hu", "ro", "bg", "hr", "sr", "bs",
  "cnr", "sq", "mk", "lt", "da", "sv", "no", "fi", "uk", "ru", "tr", "he", "ar", "ka", "hy", "az", "zh", "ja",
];

const TO = {
  de: "de", fr: "fr", es: "es", pt: "pt", it: "it", el: "el", pl: "pl",
  cs: "cs", sk: "sk", hu: "hu", ro: "ro", bg: "bg", hr: "hr", sr: "sr",
  bs: "bs", cnr: "sr", sq: "sq", mk: "mk", lt: "lt", da: "da", sv: "sv",
  no: "no", fi: "fi", uk: "uk", ru: "ru", tr: "tr", he: "iw", ar: "ar",
  ka: "ka", hy: "hy", az: "az", zh: "zh-CN", ja: "ja",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BATCH = 35;

function fixBrand(s) {
  return String(s)
    .replace(/Triplezero It/gi, "TripleZero iT")
    .replace(/Triplezero IT/gi, "TripleZero iT")
    .replace(/Triple Zero iT/gi, "TripleZero iT");
}

async function trBatch(texts, to, attempt = 1) {
  try {
    const res = await translate(texts, { from: "en", to, forceBatch: true });
    if (!Array.isArray(res) || res.length !== texts.length) {
      throw new Error(`batch size mismatch ${res?.length} vs ${texts.length}`);
    }
    return res.map((r, i) => fixBrand(typeof r?.text === "string" ? r.text : texts[i]));
  } catch (e) {
    if (attempt < 5) {
      console.warn(`retry batch (${attempt}) ${to}:`, String(e).slice(0, 80));
      await sleep(700 * attempt);
      return trBatch(texts, to, attempt + 1);
    }
    // Fallback: one-by-one
    const out = [];
    for (const t of texts) {
      try {
        const r = await translate(t, { from: "en", to, forceBatch: false });
        out.push(fixBrand(typeof r.text === "string" ? r.text : t));
      } catch {
        out.push(t);
      }
      await sleep(80);
    }
    return out;
  }
}

function collectStrings(pack) {
  const paths = [];
  const texts = [];
  const push = (path, text) => {
    paths.push(path);
    texts.push(text);
  };
  push(["title"], pack.title);
  push(["subtitle"], pack.subtitle);
  push(["ctaTitle"], pack.ctaTitle);
  push(["ctaText"], pack.ctaText);
  push(["ctaButton"], pack.ctaButton);
  pack.categories.forEach((cat, ci) => {
    push(["categories", ci, "title"], cat.title);
    cat.items.forEach((item, ii) => {
      push(["categories", ci, "items", ii, "question"], item.question);
      push(["categories", ci, "items", ii, "answer"], item.answer);
    });
  });
  return { paths, texts };
}

function setPath(obj, path, value) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
  cur[path[path.length - 1]] = value;
}

async function translatePack(locale) {
  const to = TO[locale];
  if (!to) throw new Error(`No target for ${locale}`);
  const out = structuredClone(EN);
  const { paths, texts } = collectStrings(EN);
  const translated = [];

  for (let i = 0; i < texts.length; i += BATCH) {
    const chunk = texts.slice(i, i + BATCH);
    const part = await trBatch(chunk, to);
    translated.push(...part);
    console.log(`[${locale}] ${Math.min(i + BATCH, texts.length)}/${texts.length}`);
    await sleep(250);
  }

  paths.forEach((path, i) => setPath(out, path, translated[i]));
  return out;
}

function itemCount(pack) {
  return pack.categories.reduce((s, c) => s + c.items.length, 0);
}

mkdirSync(DIR, { recursive: true });
const requested = process.argv.slice(2);
const targets = requested.length ? requested : TARGETS;
console.log("force targets:", targets.join(", "));
console.log("strings per locale:", collectStrings(EN).texts.length);

for (const locale of targets) {
  console.log(`\n=== ${locale} ===`);
  const pack = await translatePack(locale);
  writeFileSync(join(DIR, `${locale}.json`), `${JSON.stringify(pack, null, 2)}\n`);
  console.log(`wrote ${locale} items=${itemCount(pack)} subtitle=${pack.subtitle}`);
}

console.log("\nDone.");

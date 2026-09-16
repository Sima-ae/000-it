/**
 * Sync FAQ i18n from improved Dutch source:
 * 1) NL → EN (preserve EN category/item ids)
 * 2) EN → all other locales (force overwrite)
 * 3) Keep nl.json as canonical Dutch
 *
 * Usage: node scripts/sync-faq-i18n-from-nl.mjs [locale...]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import translate from "google-translate-api-x";

const DIR = join(process.cwd(), "src/content/faq-i18n");
const NL = JSON.parse(readFileSync(join(DIR, "nl.json"), "utf8"));
const EN_TEMPLATE = JSON.parse(readFileSync(join(DIR, "en.json"), "utf8"));

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

async function tr(text, from, to) {
  if (!text?.trim()) return text;
  try {
    const res = await translate(text, { from, to, forceBatch: false });
    return typeof res.text === "string" ? res.text : text;
  } catch (e) {
    console.warn("translate fail:", String(e).slice(0, 100));
    return text;
  }
}

function assertAligned(a, b, label) {
  if (a.categories.length !== b.categories.length) {
    throw new Error(`${label}: category count mismatch`);
  }
  for (let i = 0; i < a.categories.length; i++) {
    if (a.categories[i].items.length !== b.categories[i].items.length) {
      throw new Error(
        `${label}: item count mismatch at ${a.categories[i].id} vs ${b.categories[i].id}`,
      );
    }
  }
}

async function buildEnglishFromNl() {
  assertAligned(NL, EN_TEMPLATE, "nl/en");
  const out = structuredClone(EN_TEMPLATE);

  // Canonical English shell matching the updated Dutch meaning.
  out.title = "Frequently asked questions";
  out.subtitle =
    "In-depth questions and answers — from AI and SEO to design, marketing, support and hosting.";
  out.ctaTitle = "Still need help?";
  out.ctaText =
    "Can't find your question? Contact us — we'll get back to you as soon as possible.";
  out.ctaButton = "Contact us";

  for (let ci = 0; ci < out.categories.length; ci++) {
    const srcCat = NL.categories[ci];
    const dstCat = out.categories[ci];
    // Keep EN category titles for shared ids; translate Dutch titles for uniqueness.
    dstCat.title = await tr(srcCat.title, "nl", "en");
    await sleep(80);
    for (let ii = 0; ii < dstCat.items.length; ii++) {
      const src = srcCat.items[ii];
      const dst = dstCat.items[ii];
      dst.question = await tr(src.question, "nl", "en");
      await sleep(60);
      dst.answer = await tr(src.answer, "nl", "en");
      await sleep(60);
    }
    console.log(`[en] ${dstCat.id} (${ci + 1}/${out.categories.length})`);
  }

  // Brand / product terms that should stay stable in English.
  const fixes = [
    [/Triplezero It/gi, "TripleZero iT"],
    [/Triplezero IT/gi, "TripleZero iT"],
    [/WordPress support/g, "WordPress support"],
    [/e-commerce/g, "ecommerce"],
  ];
  const walk = (obj) => {
    if (typeof obj === "string") {
      let s = obj;
      for (const [re, to] of fixes) s = s.replace(re, to);
      return s;
    }
    if (Array.isArray(obj)) return obj.map(walk);
    if (obj && typeof obj === "object") {
      for (const k of Object.keys(obj)) obj[k] = walk(obj[k]);
    }
    return obj;
  };
  return walk(out);
}

async function translatePack(en, locale) {
  const to = TO[locale];
  if (!to) throw new Error(`No target code for ${locale}`);
  const out = structuredClone(en);
  out.title = await tr(en.title, "en", to);
  await sleep(100);
  out.subtitle = await tr(en.subtitle, "en", to);
  await sleep(100);
  out.ctaTitle = await tr(en.ctaTitle, "en", to);
  await sleep(100);
  out.ctaText = await tr(en.ctaText, "en", to);
  await sleep(100);
  out.ctaButton = await tr(en.ctaButton, "en", to);
  await sleep(100);

  for (let ci = 0; ci < out.categories.length; ci++) {
    const cat = out.categories[ci];
    const src = en.categories[ci];
    cat.title = await tr(src.title, "en", to);
    await sleep(80);
    for (let ii = 0; ii < cat.items.length; ii++) {
      const item = cat.items[ii];
      const s = src.items[ii];
      item.question = await tr(s.question, "en", to);
      await sleep(55);
      item.answer = await tr(s.answer, "en", to);
      await sleep(55);
    }
    console.log(`[${locale}] ${cat.id} (${ci + 1}/${out.categories.length})`);
  }
  return out;
}

function itemCount(pack) {
  return pack.categories.reduce((s, c) => s + c.items.length, 0);
}

mkdirSync(DIR, { recursive: true });

console.log("=== Building EN from NL ===");
const EN = await buildEnglishFromNl();
writeFileSync(join(DIR, "en.json"), `${JSON.stringify(EN, null, 2)}\n`);
console.log(`wrote en items=${itemCount(EN)}`);

const requested = process.argv.slice(2);
const targets = requested.length ? requested : TARGETS;
console.log("\nforce targets:", targets.join(", "));

for (const locale of targets) {
  console.log(`\n=== ${locale} ===`);
  const pack = await translatePack(EN, locale);
  writeFileSync(join(DIR, `${locale}.json`), `${JSON.stringify(pack, null, 2)}\n`);
  console.log(`wrote ${locale} items=${itemCount(pack)}`);
}

console.log("\nDone.");

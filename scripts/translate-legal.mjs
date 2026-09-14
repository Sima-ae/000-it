/**
 * Translate privacy + terms legal bodies for all locales into combined packs.
 * Faster: concurrent string pool (default 10). Incremental skip for done locales.
 * One job - do not run in parallel with other MT scripts.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ALL_TARGET_LOCALES,
  translateText,
  translateManyConcurrent,
} from "./lib/translate.mjs";

const DIR = "src/content/legal";
const privacyPath = join(DIR, "privacy-i18n.json");
const termsPath = join(DIR, "terms-i18n.json");
const metaPath = join(DIR, "meta-i18n.json");
const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 10);

function collectUnique(sections) {
  const uniq = new Set();
  for (const s of sections) {
    if (s.heading?.trim()) uniq.add(s.heading.trim());
    for (const p of s.paragraphs || []) if (p.trim()) uniq.add(p.trim());
    for (const b of s.bullets || []) if (b.trim()) uniq.add(b.trim());
  }
  return [...uniq];
}

function applyMap(sections, map) {
  return sections.map((s) => ({
    heading: s.heading ? map.get(s.heading) || s.heading : "",
    paragraphs: (s.paragraphs || []).map((p) => map.get(p) || p),
    bullets: (s.bullets || []).map((b) => map.get(b) || b),
  }));
}

const privacyPack = JSON.parse(readFileSync(privacyPath, "utf8"));
const termsPack = JSON.parse(readFileSync(termsPath, "utf8"));
const metaPack = JSON.parse(readFileSync(metaPath, "utf8"));

const privacyEn = privacyPack.en;
const termsEn = termsPack.en;
const expectedPrivacy = privacyEn.length;
const expectedTerms = termsEn.length;
const META_EN = metaPack.en;

const unique = collectUnique([...privacyEn, ...termsEn]);
console.log(
  "unique strings",
  unique.length,
  "privacy",
  expectedPrivacy,
  "terms",
  expectedTerms,
  "concurrency",
  CONCURRENCY,
);

function writeAll() {
  writeFileSync(privacyPath, `${JSON.stringify(privacyPack, null, 2)}\n`);
  writeFileSync(termsPath, `${JSON.stringify(termsPack, null, 2)}\n`);
  writeFileSync(metaPath, `${JSON.stringify(metaPack, null, 2)}\n`);
}

const locales = ALL_TARGET_LOCALES.filter((l) => l !== "nl");

for (const locale of locales) {
  const privacyDone =
    Array.isArray(privacyPack[locale]) && privacyPack[locale].length === expectedPrivacy;
  const termsDone =
    Array.isArray(termsPack[locale]) && termsPack[locale].length === expectedTerms;
  const metaDone = Boolean(metaPack[locale]?.privacyTitle);

  if (privacyDone && termsDone && metaDone) {
    console.log(`\n=== legal ${locale} (cached) ===`);
    continue;
  }

  console.log(`\n=== legal ${locale} ===`);
  const t0 = Date.now();

  const translated = await translateManyConcurrent(unique, locale, "en", {
    concurrency: CONCURRENCY,
  });
  const map = new Map(unique.map((text, i) => [text, translated[i]]));
  const failed = translated.filter((t, i) => t === unique[i]).length;
  console.log(
    `strings done in ${((Date.now() - t0) / 1000).toFixed(1)}s` +
      (failed ? ` (${failed} left EN)` : ""),
  );

  if (!privacyDone) privacyPack[locale] = applyMap(privacyEn, map);
  if (!termsDone) termsPack[locale] = applyMap(termsEn, map);

  if (!metaDone) {
    const metaKeys = Object.keys(META_EN);
    const metaVals = await translateManyConcurrent(
      metaKeys.map((k) => META_EN[k]),
      locale,
      "en",
      { concurrency: Math.min(CONCURRENCY, 6) },
    );
    const m = {};
    metaKeys.forEach((k, i) => {
      m[k] = metaVals[i];
    });
    metaPack[locale] = m;
  }

  writeAll();
  console.log(`saved ${locale}`);
}

writeAll();
console.log("\ndone legal privacy+terms");

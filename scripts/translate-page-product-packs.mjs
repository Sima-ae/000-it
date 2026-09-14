/**
 * Build page-i18n + product-i18n packs for all locales from EN sources.
 * Writes src/content/fixweb/page-i18n-pack.json and product-i18n-pack.json
 * Run: npx tsx scripts/translate-page-product-packs.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ALL_TARGET_LOCALES, translateManyConcurrent } from "./lib/translate.mjs";
import { pageI18n } from "../src/content/fixweb/page-i18n.ts";
import { productI18n } from "../src/content/fixweb/product-i18n.ts";

const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 5);

const pagePath = join("src/content/fixweb/page-i18n-pack.json");
const productPath = join("src/content/fixweb/product-i18n-pack.json");

const pagePack = existsSync(pagePath) ? JSON.parse(readFileSync(pagePath, "utf8")) : {};
const productPack = existsSync(productPath)
  ? JSON.parse(readFileSync(productPath, "utf8"))
  : {};

pagePack.en = pagePack.en || {};
pagePack.nl = pagePack.nl || {};
productPack.en = productPack.en || {};
productPack.nl = productPack.nl || {};

for (const [slug, entry] of Object.entries(pageI18n)) {
  pagePack.en[slug] = entry.en;
  pagePack.nl[slug] = entry.nl;
}
for (const [slug, entry] of Object.entries(productI18n)) {
  productPack.en[slug] = entry.en;
  productPack.nl[slug] = entry.nl;
}

function collectStrings(obj, out = new Set()) {
  if (!obj) return out;
  if (typeof obj === "string") {
    if (obj.trim()) out.add(obj);
    return out;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) collectStrings(item, out);
    return out;
  }
  if (typeof obj === "object") {
    for (const v of Object.values(obj)) collectStrings(v, out);
  }
  return out;
}

function applyMap(obj, map) {
  if (typeof obj === "string") return map.get(obj) || obj;
  if (Array.isArray(obj)) return obj.map((x) => applyMap(x, map));
  if (obj && typeof obj === "object") {
    const next = {};
    for (const [k, v] of Object.entries(obj)) next[k] = applyMap(v, map);
    return next;
  }
  return obj;
}

function writeAll() {
  writeFileSync(pagePath, `${JSON.stringify(pagePack, null, 2)}\n`);
  writeFileSync(productPath, `${JSON.stringify(productPack, null, 2)}\n`);
}

const slugs = Object.keys(pageI18n);
const productSlugs = Object.keys(productI18n);
console.log("pages", slugs.length, "products", productSlugs.length);

const locales = ALL_TARGET_LOCALES.filter((l) => l !== "nl");

for (const locale of locales) {
  pagePack[locale] = pagePack[locale] || {};
  productPack[locale] = productPack[locale] || {};

  const needPages = slugs.filter((s) => !pagePack[locale][s]?.title);
  const needProducts = productSlugs.filter(
    (s) => !productPack[locale][s]?.shortDescription && !productPack[locale][s]?.title,
  );

  if (!needPages.length && !needProducts.length) {
    console.log(`\n=== packs ${locale} (cached) ===`);
    continue;
  }

  console.log(`\n=== packs ${locale} pages=${needPages.length} products=${needProducts.length} ===`);

  const uniq = new Set();
  for (const slug of needPages) collectStrings(pageI18n[slug].en, uniq);
  for (const slug of needProducts) collectStrings(productI18n[slug].en, uniq);
  const list = [...uniq];
  console.log("unique strings", list.length);

  const translated = await translateManyConcurrent(list, locale, "en", {
    concurrency: CONCURRENCY,
  });
  const map = new Map(list.map((t, i) => [t, translated[i]]));
  const failed = translated.filter((t, i) => t === list[i]).length;
  console.log(`done (${failed} left EN)`);

  for (const slug of needPages) {
    pagePack[locale][slug] = applyMap(pageI18n[slug].en, map);
  }
  for (const slug of needProducts) {
    productPack[locale][slug] = applyMap(productI18n[slug].en, map);
  }
  writeAll();
  console.log(`saved ${locale}`);
}

writeAll();
console.log("done page/product packs");

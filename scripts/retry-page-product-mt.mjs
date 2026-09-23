/**
 * Retry EN-echo strings in page/product packs (safe merge — never wipe prior translations).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { translateManyConcurrent } from "./lib/translate.mjs";

const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 3);
const pagePath = join("src/content/fixweb/page-i18n-pack.json");
const productPath = join("src/content/fixweb/product-i18n-pack.json");
const pagePack = JSON.parse(readFileSync(pagePath, "utf8"));
const productPack = JSON.parse(readFileSync(productPath, "utf8"));
const LOCALES = (process.env.MT_LOCALES || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function collectEchoes(enObj, curObj, need = new Set()) {
  if (typeof enObj === "string") {
    if (enObj.trim() && (!curObj || curObj === enObj)) need.add(enObj);
    return need;
  }
  if (Array.isArray(enObj)) {
    enObj.forEach((x, i) =>
      collectEchoes(x, Array.isArray(curObj) ? curObj[i] : undefined, need),
    );
    return need;
  }
  if (enObj && typeof enObj === "object") {
    for (const k of Object.keys(enObj)) {
      collectEchoes(enObj[k], curObj?.[k], need);
    }
  }
  return need;
}

function mergePreferTranslated(enObj, prevObj, map, keyHint = "") {
  if (typeof enObj === "string") {
    if (keyHint === "type") return enObj;
    if (map.has(enObj) && map.get(enObj) !== enObj) return map.get(enObj);
    if (prevObj && prevObj !== enObj) return prevObj;
    return enObj;
  }
  if (Array.isArray(enObj)) {
    return enObj.map((x, i) =>
      mergePreferTranslated(x, Array.isArray(prevObj) ? prevObj[i] : undefined, map, keyHint),
    );
  }
  if (enObj && typeof enObj === "object") {
    const next = {};
    for (const k of Object.keys(enObj)) {
      next[k] = mergePreferTranslated(enObj[k], prevObj?.[k], map, k);
    }
    return next;
  }
  return enObj;
}

const locales =
  LOCALES.length > 0
    ? LOCALES
    : Object.keys(pagePack).filter((l) => l !== "en" && l !== "nl");

for (const locale of locales) {
  const need = new Set();
  for (const slug of Object.keys(pagePack.en || {})) {
    collectEchoes(pagePack.en[slug], pagePack[locale]?.[slug], need);
  }
  for (const slug of Object.keys(productPack.en || {})) {
    collectEchoes(productPack.en[slug], productPack[locale]?.[slug], need);
  }
  const list = [...need].filter((t) => {
    // skip brand-like short tokens that legitimately stay English
    return !/^(WordPress|WooCommerce|AI|AEO|GEO|SEO|TripleZero iT|Pro Support|Premium Support)$/i.test(
      t.trim(),
    );
  });
  console.log(`\n=== retry packs ${locale} echoes=${list.length} ===`);
  if (!list.length) continue;

  const prevPage = { ...(pagePack[locale] || {}) };
  const prevProd = { ...(productPack[locale] || {}) };

  const out = await translateManyConcurrent(list, locale, "en", {
    concurrency: CONCURRENCY,
  });
  const map = new Map();
  list.forEach((t, i) => {
    if (out[i] && out[i] !== t) map.set(t, out[i]);
  });
  console.log(`translated ${map.size}/${list.length}`);

  pagePack[locale] = pagePack[locale] || {};
  productPack[locale] = productPack[locale] || {};
  for (const slug of Object.keys(pagePack.en || {})) {
    pagePack[locale][slug] = mergePreferTranslated(
      pagePack.en[slug],
      prevPage[slug],
      map,
    );
  }
  for (const slug of Object.keys(productPack.en || {})) {
    productPack[locale][slug] = mergePreferTranslated(
      productPack.en[slug],
      prevProd[slug],
      map,
    );
  }

  writeFileSync(pagePath, `${JSON.stringify(pagePack, null, 2)}\n`);
  writeFileSync(productPath, `${JSON.stringify(productPack, null, 2)}\n`);
  console.log(`saved ${locale}`);
}

console.log("done pack retry");

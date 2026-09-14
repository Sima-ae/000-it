/**
 * Slow leftover-only MT pass for page/product packs + legal loanword paragraphs.
 * Defaults: concurrency 1–2, long gaps, cooldown between locales.
 *
 *   MT_CONCURRENCY=1 MT_DELAY_MS=500 MT_MIN_GAP_MS=600 MT_429_MS=4000 \
 *   npx tsx scripts/slow-finish-leftovers.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { translateManyConcurrent, ALL_TARGET_LOCALES } from "./lib/translate.mjs";

const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 1);
const DELAY = Number(process.env.MT_DELAY_MS || 500);
const LOCALE_COOLDOWN_MS = Number(process.env.MT_LOCALE_COOLDOWN_MS || 4000);
const PASSES = Number(process.env.MT_PASSES || 2);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const BRAND_OK = new Set(
  [
    "WordPress",
    "WooCommerce",
    "AI",
    "AEO",
    "GEO",
    "SEO",
    "TripleZero iT",
    "Basic Support",
    "Premium Support",
    "Standard Support",
    "Plan highlights",
    "VPS Hosting",
    "VPS Hosting Basic",
    "VPS Hosting Plus",
    "VPS Hosting Business",
    "Shared Hosting Plus",
    "WordPress Hosting Basic",
    "WordPress Hosting Plus",
    "WordPress Hosting Pro",
    "WordPress Support",
    "Social Media Management",
    "Community Management",
    "24/7 support",
    "Fix website errors",
    "Fix Bugs and Errors",
  ].map((s) => s.toLowerCase()),
);

function isBrandOk(text) {
  const t = text.trim();
  if (BRAND_OK.has(t.toLowerCase())) return true;
  if (/^(VPS|WordPress|Shared)\s+Hosting(\s+\w+)?$/i.test(t)) return true;
  return false;
}

function collectEchoes(enObj, curObj, need = new Set()) {
  if (typeof enObj === "string") {
    const t = enObj.trim();
    if (!t || isBrandOk(t)) return need;
    if (!curObj || curObj === enObj) need.add(enObj);
    return need;
  }
  if (Array.isArray(enObj)) {
    enObj.forEach((x, i) =>
      collectEchoes(x, Array.isArray(curObj) ? curObj[i] : undefined, need),
    );
    return need;
  }
  if (enObj && typeof enObj === "object") {
    for (const k of Object.keys(enObj)) collectEchoes(enObj[k], curObj?.[k], need);
  }
  return need;
}

function mergePreferTranslated(enObj, prevObj, map) {
  if (typeof enObj === "string") {
    if (map.has(enObj) && map.get(enObj) !== enObj) return map.get(enObj);
    if (prevObj && prevObj !== enObj) return prevObj;
    return enObj;
  }
  if (Array.isArray(enObj)) {
    return enObj.map((x, i) =>
      mergePreferTranslated(x, Array.isArray(prevObj) ? prevObj[i] : undefined, map),
    );
  }
  if (enObj && typeof enObj === "object") {
    const next = {};
    for (const k of Object.keys(enObj)) {
      next[k] = mergePreferTranslated(enObj[k], prevObj?.[k], map);
    }
    return next;
  }
  return enObj;
}

function collectLegalEchoes(sectionsEn, sectionsCur) {
  const need = new Set();
  for (let i = 0; i < (sectionsEn || []).length; i++) {
    const a = sectionsEn[i];
    const b = sectionsCur?.[i] || { heading: "", paragraphs: [], bullets: [] };
    // Skip short loanword headings that legitimately stay EN
    const skipHeading =
      /^(Cookies|Newsletter|Force majeure|Privacy|Download|\d+\.\s*(Cookies|Newsletter|Force majeure|Privacy|Download))$/i.test(
        (a.heading || "").trim(),
      );
    if (a.heading && !skipHeading && (!b.heading || b.heading === a.heading)) {
      need.add(a.heading);
    }
    (a.paragraphs || []).forEach((p, j) => {
      if (p.length > 40 && (!b.paragraphs?.[j] || b.paragraphs[j] === p)) need.add(p);
    });
    (a.bullets || []).forEach((x, j) => {
      if (x.length > 40 && (!b.bullets?.[j] || b.bullets[j] === x)) need.add(x);
    });
  }
  return [...need];
}

function applyLegalMap(sectionsEn, sectionsCur, map) {
  return sectionsEn.map((s, i) => {
    const cur = sectionsCur?.[i] || { heading: "", paragraphs: [], bullets: [] };
    return {
      heading: s.heading
        ? map.get(s.heading) || (cur.heading !== s.heading ? cur.heading : s.heading)
        : "",
      paragraphs: (s.paragraphs || []).map((p, j) => {
        const prev = cur.paragraphs?.[j];
        return map.get(p) || (prev && prev !== p ? prev : p);
      }),
      bullets: (s.bullets || []).map((x, j) => {
        const prev = cur.bullets?.[j];
        return map.get(x) || (prev && prev !== x ? prev : x);
      }),
    };
  });
}

const pagePath = join("src/content/fixweb/page-i18n-pack.json");
const productPath = join("src/content/fixweb/product-i18n-pack.json");
const privacyPath = join("src/content/legal/privacy-i18n.json");
const termsPath = join("src/content/legal/terms-i18n.json");

const pagePack = JSON.parse(readFileSync(pagePath, "utf8"));
const productPack = JSON.parse(readFileSync(productPath, "utf8"));
const privacyPack = JSON.parse(readFileSync(privacyPath, "utf8"));
const termsPack = JSON.parse(readFileSync(termsPath, "utf8"));

const only = (process.env.MT_LOCALES || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const locales = (
  only.length
    ? only
    : ALL_TARGET_LOCALES.filter((l) => l !== "nl")
).filter((l) => pagePack[l] || productPack[l] || privacyPack[l]);

console.log(
  "slow finish locales",
  locales.join(","),
  "concurrency",
  CONCURRENCY,
  "delay",
  DELAY,
);

async function translateUnique(list, locale) {
  if (!list.length) return new Map();
  const map = new Map();
  for (let pass = 1; pass <= PASSES; pass++) {
    const pending = list.filter((t) => !map.has(t) || map.get(t) === t);
    if (!pending.length) break;
    console.log(`  pass ${pass}: ${pending.length}`);
    const out = await translateManyConcurrent(pending, locale, "en", {
      concurrency: CONCURRENCY,
      delayMs: DELAY,
    });
    let gained = 0;
    pending.forEach((t, i) => {
      if (out[i] && out[i] !== t) {
        map.set(t, out[i]);
        gained++;
      }
    });
    console.log(`  gained ${gained}`);
    if (gained === 0 && pass < PASSES) {
      console.log("  cooldown 12s…");
      await sleep(12_000);
    } else if (pass < PASSES && gained < pending.length) {
      await sleep(LOCALE_COOLDOWN_MS);
    }
  }
  return map;
}

for (const locale of locales) {
  console.log(`\n======== ${locale} ========`);

  // packs
  const need = new Set();
  for (const slug of Object.keys(pagePack.en || {})) {
    collectEchoes(pagePack.en[slug], pagePack[locale]?.[slug], need);
  }
  for (const slug of Object.keys(productPack.en || {})) {
    collectEchoes(productPack.en[slug], productPack[locale]?.[slug], need);
  }
  const legalNeed = [
    ...collectLegalEchoes(privacyPack.en, privacyPack[locale]),
    ...collectLegalEchoes(termsPack.en, termsPack[locale]),
  ];
  const unique = [...new Set([...need, ...legalNeed])];
  console.log(`echoes pack=${need.size} legal=${legalNeed.length} unique=${unique.length}`);

  if (!unique.length) {
    console.log("clean");
    continue;
  }

  const map = await translateUnique(unique, locale);

  const prevPage = { ...(pagePack[locale] || {}) };
  const prevProd = { ...(productPack[locale] || {}) };
  pagePack[locale] = pagePack[locale] || {};
  productPack[locale] = productPack[locale] || {};
  for (const slug of Object.keys(pagePack.en || {})) {
    pagePack[locale][slug] = mergePreferTranslated(pagePack.en[slug], prevPage[slug], map);
  }
  for (const slug of Object.keys(productPack.en || {})) {
    productPack[locale][slug] = mergePreferTranslated(
      productPack.en[slug],
      prevProd[slug],
      map,
    );
  }

  if (privacyPack.en) {
    privacyPack[locale] = applyLegalMap(privacyPack.en, privacyPack[locale], map);
  }
  if (termsPack.en) {
    termsPack[locale] = applyLegalMap(termsPack.en, termsPack[locale], map);
  }

  writeFileSync(pagePath, `${JSON.stringify(pagePack, null, 2)}\n`);
  writeFileSync(productPath, `${JSON.stringify(productPack, null, 2)}\n`);
  writeFileSync(privacyPath, `${JSON.stringify(privacyPack, null, 2)}\n`);
  writeFileSync(termsPath, `${JSON.stringify(termsPack, null, 2)}\n`);
  console.log(`saved ${locale} (map ${map.size})`);
  await sleep(LOCALE_COOLDOWN_MS);
}

console.log("\ndone slow finish leftovers");

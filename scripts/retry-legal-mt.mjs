/**
 * Retry legal locales that mostly stayed English (rate-limit fallout).
 * Lower concurrency. Only retranslates EN-echo strings.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { translateManyConcurrent } from "./lib/translate.mjs";

const DIR = "src/content/legal";
const privacyPath = join(DIR, "privacy-i18n.json");
const termsPath = join(DIR, "terms-i18n.json");
const metaPath = join(DIR, "meta-i18n.json");
const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 3);
const LOCALES = (process.env.MT_LOCALES || "hy,az,zh,ja").split(",").map((s) => s.trim());

const privacyPack = JSON.parse(readFileSync(privacyPath, "utf8"));
const termsPack = JSON.parse(readFileSync(termsPath, "utf8"));
const metaPack = JSON.parse(readFileSync(metaPath, "utf8"));
const privacyEn = privacyPack.en;
const termsEn = termsPack.en;
const META_EN = metaPack.en;

function collectEchoes(sectionsEn, sectionsCur) {
  const need = new Set();
  for (let i = 0; i < sectionsEn.length; i++) {
    const a = sectionsEn[i];
    const b = sectionsCur?.[i] || { heading: "", paragraphs: [], bullets: [] };
    if (a.heading && (!b.heading || b.heading === a.heading)) need.add(a.heading);
    (a.paragraphs || []).forEach((p, j) => {
      if (!b.paragraphs?.[j] || b.paragraphs[j] === p) need.add(p);
    });
    (a.bullets || []).forEach((x, j) => {
      if (!b.bullets?.[j] || b.bullets[j] === x) need.add(x);
    });
  }
  return [...need];
}

function applyMap(sectionsEn, sectionsCur, map) {
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

function writeAll() {
  writeFileSync(privacyPath, `${JSON.stringify(privacyPack, null, 2)}\n`);
  writeFileSync(termsPath, `${JSON.stringify(termsPack, null, 2)}\n`);
  writeFileSync(metaPath, `${JSON.stringify(metaPack, null, 2)}\n`);
}

console.log("retry locales", LOCALES.join(","), "concurrency", CONCURRENCY);

for (const locale of LOCALES) {
  console.log(`\n=== retry legal ${locale} ===`);
  const echoes = [
    ...collectEchoes(privacyEn, privacyPack[locale]),
    ...collectEchoes(termsEn, termsPack[locale]),
  ];
  const unique = [...new Set(echoes)];
  console.log("echo strings", unique.length);
  if (!unique.length) {
    console.log("nothing to retry");
    continue;
  }

  // two passes if needed — first pass may still fail on rate limits
  let map = new Map();
  for (let pass = 1; pass <= 2; pass++) {
    const pending = unique.filter((t) => !map.has(t) || map.get(t) === t);
    if (!pending.length) break;
    console.log(`pass ${pass}: ${pending.length}`);
    const out = await translateManyConcurrent(pending, locale, "en", {
      concurrency: CONCURRENCY,
    });
    pending.forEach((t, i) => {
      if (out[i] && out[i] !== t) map.set(t, out[i]);
    });
    const still = pending.filter((t) => !map.has(t) || map.get(t) === t).length;
    console.log(`still EN ${still}`);
    if (still && pass === 1) {
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  privacyPack[locale] = applyMap(privacyEn, privacyPack[locale], map);
  termsPack[locale] = applyMap(termsEn, termsPack[locale], map);

  // meta
  if (META_EN) {
    const m = { ...(metaPack[locale] || {}) };
    const keys = Object.keys(META_EN).filter((k) => !m[k] || m[k] === META_EN[k]);
    if (keys.length) {
      const vals = await translateManyConcurrent(
        keys.map((k) => META_EN[k]),
        locale,
        "en",
        { concurrency: Math.min(CONCURRENCY, 3) },
      );
      keys.forEach((k, i) => {
        if (vals[i] && vals[i] !== META_EN[k]) m[k] = vals[i];
      });
      metaPack[locale] = m;
    }
  }

  writeAll();
  console.log(`saved ${locale}`);
}

console.log("\ndone legal retry");

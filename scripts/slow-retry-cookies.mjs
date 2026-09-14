/**
 * Slow cookie-policy leftover retry (prose only).
 *   MT_CONCURRENCY=1 MT_DELAY_MS=600 npx tsx scripts/slow-retry-cookies.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { translateManyConcurrent } from "./lib/translate.mjs";

const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 1);
const DELAY = Number(process.env.MT_DELAY_MS || 600);
const COOLDOWN = Number(process.env.MT_LOCALE_COOLDOWN_MS || 5000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const outPath = join("src/content/legal/cookies-i18n.json");
const pack = JSON.parse(readFileSync(outPath, "utf8"));
const enSections = pack.en;

function shouldTranslate(text) {
  const t = text.trim();
  if (!t || t.length <= 12) return false;
  if (/^[A-Za-z0-9_.:*-]{1,64}$/.test(t) && !/\s/.test(t)) return false;
  if (/^DataTables_/i.test(t) || /\/crm\/|index\.php/i.test(t)) return false;
  if (/^\d+\.\s*Cookies$/i.test(t)) return false;
  if (
    /^(Google Maps|Sourcebuster JS|WordPress|Cloudflare|session|persistent|e_document\/global)$/i.test(
      t,
    )
  ) {
    return false;
  }
  return true;
}

function collectEchoes(sectionsEn, sectionsCur) {
  const need = new Set();
  for (let i = 0; i < sectionsEn.length; i++) {
    const a = sectionsEn[i];
    const b = sectionsCur?.[i] || { heading: "", paragraphs: [], bullets: [] };
    if (a.heading && shouldTranslate(a.heading) && (!b.heading || b.heading === a.heading)) {
      need.add(a.heading);
    }
    (a.paragraphs || []).forEach((p, j) => {
      if (shouldTranslate(p) && (!b.paragraphs?.[j] || b.paragraphs[j] === p)) need.add(p);
    });
    (a.bullets || []).forEach((x, j) => {
      if (shouldTranslate(x) && (!b.bullets?.[j] || b.bullets[j] === x)) need.add(x);
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

const only = (process.env.MT_LOCALES || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const locales = (
  only.length ? only : Object.keys(pack).filter((l) => l !== "en")
).filter((l) => pack[l]);

console.log("slow cookies locales", locales.join(","));

for (const locale of locales) {
  const echoes = collectEchoes(enSections, pack[locale]);
  console.log(`\n=== cookies ${locale} echoes=${echoes.length} ===`);
  if (!echoes.length) continue;

  let map = new Map();
  for (let pass = 1; pass <= 2; pass++) {
    const pending = echoes.filter((t) => !map.has(t) || map.get(t) === t);
    if (!pending.length) break;
    console.log(`pass ${pass}: ${pending.length}`);
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
    console.log(`gained ${gained}`);
    if (gained < pending.length && pass === 1) await sleep(10_000);
  }

  pack[locale] = applyMap(enSections, pack[locale], map);
  writeFileSync(outPath, `${JSON.stringify(pack, null, 2)}\n`);
  const still = collectEchoes(enSections, pack[locale]).length;
  console.log(`saved ${locale} still=${still}`);
  await sleep(COOLDOWN);
}

console.log("done slow cookies");

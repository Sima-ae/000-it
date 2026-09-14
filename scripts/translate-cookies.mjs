/**
 * Translate cookie-policy sections into src/content/legal/cookies-i18n.json
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ALL_TARGET_LOCALES, translateManyConcurrent } from "./lib/translate.mjs";

const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 4);
const imported = JSON.parse(
  readFileSync("src/content/fixweb/imported-pages.json", "utf8"),
);
const enSections = imported.pages["cookie-policy"]?.sections || [];
const outPath = join("src/content/legal/cookies-i18n.json");
const pack = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : {};

pack.en = enSections;

// Seed NL from translate-nl if missing — use EN as start; NL backfill via MT from EN
if (!pack.nl) {
  console.log("seeding nl from MT…");
  // Will fill in locale loop with locale=nl from EN — skip; use translate-nl later if needed
  pack.nl = pack.nl || null;
}

function shouldTranslate(text) {
  const t = text.trim();
  if (!t) return false;
  // technical cookie names / ids
  if (/^[A-Za-z0-9_.:*-]{1,64}$/.test(t) && !/\s/.test(t)) return false;
  // pure numbers / durations like 1y often stay
  if (/^\d+([ymhd]| minutes?| hours?| days?| years?| months?)?$/i.test(t)) return false;
  if (/^(session|persistent|httponly|secure)$/i.test(t)) return false;
  if (/^DataTables_/i.test(t) || /\/crm\/|index\.php/i.test(t)) return false;
  if (/^\d+\.\s*Cookies$/i.test(t)) return false;
  if (
    /^(Google Maps|Sourcebuster JS|WordPress|Cloudflare|Stripe|PayPal|Hotjar|Facebook|LinkedIn|Twitter|YouTube|Vimeo|HubSpot|Mailchimp)$/i.test(
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

const locales = ["nl", ...ALL_TARGET_LOCALES.filter((l) => l !== "nl")];

for (const locale of locales) {
  const cur = pack[locale];
  const echoes = collectEchoes(enSections, cur);
  // Skip tiny technical cookie names that are identical by design? Still try all.
  console.log(`\n=== cookies ${locale} echoes=${echoes.length} ===`);
  if (!echoes.length) {
    console.log("cached");
    continue;
  }

  let map = new Map();
  // Process in chunks of 200 to checkpoint
  for (let i = 0; i < echoes.length; i += 200) {
    const batch = echoes.slice(i, i + 200);
    console.log(`batch ${i}-${i + batch.length}`);
    const out = await translateManyConcurrent(batch, locale, "en", {
      concurrency: CONCURRENCY,
    });
    batch.forEach((t, j) => {
      if (out[j] && out[j] !== t) map.set(t, out[j]);
    });
    pack[locale] = applyMap(enSections, pack[locale], map);
    writeFileSync(outPath, `${JSON.stringify(pack, null, 2)}\n`);
  }
  const still = collectEchoes(enSections, pack[locale]).length;
  console.log(`saved ${locale} stillEN=${still}`);
}

console.log("done cookies");

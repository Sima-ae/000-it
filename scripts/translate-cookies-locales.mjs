/**
 * Translate cookies-i18n.json for selected locales.
 *   MT_LOCALES=bn,hi,mr,ps,pa,te,ur MT_CONCURRENCY=2 npx tsx scripts/translate-cookies-locales.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { translateManyConcurrent } from "./lib/translate.mjs";

const LOCALES = (process.env.MT_LOCALES || "bn,hi,mr,ps,pa,te,ur")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 2);
const DELAY = Number(process.env.MT_DELAY_MS || 300);

const imported = JSON.parse(
  readFileSync("src/content/fixweb/imported-pages.json", "utf8"),
);
const enSections = imported.pages["cookie-policy"]?.sections || [];
const outPath = "src/content/legal/cookies-i18n.json";
const pack = existsSync(outPath)
  ? JSON.parse(readFileSync(outPath, "utf8"))
  : {};
pack.en = enSections;

function shouldTranslate(text) {
  const t = text.trim();
  if (!t) return false;
  if (/^[A-Za-z0-9_.:*-]{1,64}$/.test(t) && !/\s/.test(t)) return false;
  if (/^\d+([ymhd]| minutes?| hours?| days?| years?| months?)?$/i.test(t))
    return false;
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
    const b = sectionsCur?.[i] || {
      heading: "",
      paragraphs: [],
      bullets: [],
    };
    if (
      a.heading &&
      shouldTranslate(a.heading) &&
      (!b.heading || b.heading === a.heading)
    ) {
      need.add(a.heading);
    }
    (a.paragraphs || []).forEach((p, j) => {
      if (shouldTranslate(p) && (!b.paragraphs?.[j] || b.paragraphs[j] === p)) {
        need.add(p);
      }
    });
    (a.bullets || []).forEach((x, j) => {
      if (shouldTranslate(x) && (!b.bullets?.[j] || b.bullets[j] === x)) {
        need.add(x);
      }
    });
  }
  return [...need];
}

function applyMap(sectionsEn, sectionsCur, map) {
  return sectionsEn.map((s, i) => {
    const cur = sectionsCur?.[i] || {
      heading: "",
      paragraphs: [],
      bullets: [],
    };
    return {
      heading: s.heading
        ? map.get(s.heading) ||
          (cur.heading !== s.heading ? cur.heading : s.heading)
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

for (const locale of LOCALES) {
  const echoes = collectEchoes(enSections, pack[locale]);
  console.log(`cookies ${locale} echoes=${echoes.length}`);
  if (!echoes.length) continue;
  const map = new Map();
  for (let i = 0; i < echoes.length; i += 40) {
    const batch = echoes.slice(i, i + 40);
    const out = await translateManyConcurrent(batch, locale, "en", {
      concurrency: CONCURRENCY,
      delayMs: DELAY,
    });
    batch.forEach((t, j) => {
      if (out[j] && out[j] !== t) map.set(t, out[j]);
    });
    pack[locale] = applyMap(enSections, pack[locale], map);
    writeFileSync(outPath, `${JSON.stringify(pack, null, 2)}\n`);
    console.log(
      `  ${locale} checkpoint ${Math.min(i + 40, echoes.length)}/${echoes.length}`,
    );
  }
  console.log(
    `saved ${locale} still=${collectEchoes(enSections, pack[locale]).length}`,
  );
}

console.log("done cookies selected locales");

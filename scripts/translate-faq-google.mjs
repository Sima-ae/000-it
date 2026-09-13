/**
 * Fast FAQ translation using google-translate-api-x.
 * Usage: node scripts/translate-faq-google.mjs [locale...]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import translate from "google-translate-api-x";

const DIR = join(process.cwd(), "src/content/faq-i18n");
const EN = JSON.parse(readFileSync(join(DIR, "en.json"), "utf8"));

const TARGETS = [
  "de","fr","es","pt","it","el","pl","cs","sk","hu","ro","bg","hr","sr","bs",
  "cnr","sq","mk","lt","da","sv","no","fi","uk","ru","tr","he","ar","ka","hy","az","zh","ja",
];

/** google-translate-api-x language codes */
const TO = {
  de: "de", fr: "fr", es: "es", pt: "pt", it: "it", el: "el", pl: "pl",
  cs: "cs", sk: "sk", hu: "hu", ro: "ro", bg: "bg", hr: "hr", sr: "sr",
  bs: "bs", cnr: "sr", sq: "sq", mk: "mk", lt: "lt", da: "da", sv: "sv",
  no: "no", fi: "fi", uk: "uk", ru: "ru", tr: "tr", he: "iw", ar: "ar",
  ka: "ka", hy: "hy", az: "az", zh: "zh-CN", ja: "ja",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tr(text, to) {
  if (!text?.trim()) return text;
  try {
    const res = await translate(text, { from: "en", to, forceBatch: false });
    return typeof res.text === "string" ? res.text : text;
  } catch (e) {
    console.warn("translate fail, keeping EN:", String(e).slice(0, 80));
    return text;
  }
}

async function translatePack(locale) {
  const to = TO[locale];
  const out = structuredClone(EN);
  out.title = await tr(EN.title, to);
  await sleep(120);
  out.subtitle = await tr(EN.subtitle, to);
  await sleep(120);
  out.ctaTitle = await tr(EN.ctaTitle, to);
  await sleep(120);
  out.ctaText = await tr(EN.ctaText, to);
  await sleep(120);
  out.ctaButton = await tr(EN.ctaButton, to);
  await sleep(120);

  for (let ci = 0; ci < out.categories.length; ci++) {
    const cat = out.categories[ci];
    const src = EN.categories[ci];
    cat.title = await tr(src.title, to);
    await sleep(100);
    for (let ii = 0; ii < cat.items.length; ii++) {
      const item = cat.items[ii];
      const s = src.items[ii];
      item.question = await tr(s.question, to);
      await sleep(80);
      item.answer = await tr(s.answer, to);
      await sleep(80);
    }
    console.log(`[${locale}] ${cat.id} (${ci + 1}/${out.categories.length})`);
  }
  return out;
}

function itemCount(pack) {
  return pack.categories.reduce((s, c) => s + c.items.length, 0);
}

const requested = process.argv.slice(2);
const targets = (requested.length ? requested : TARGETS).filter((loc) => {
  const path = join(DIR, `${loc}.json`);
  if (!requested.length && existsSync(path)) {
    try {
      const p = JSON.parse(readFileSync(path, "utf8"));
      if (itemCount(p) >= 130) {
        // Heuristic: if first question still equals EN, regenerate
        const enQ = EN.categories[0].items[0].question;
        const q = p.categories?.[0]?.items?.[0]?.question;
        if (q && q !== enQ) {
          console.log(`skip ${loc}`);
          return false;
        }
      }
    } catch {
      /* regen */
    }
  }
  return true;
});

mkdirSync(DIR, { recursive: true });
console.log("targets", targets.join(", "));

for (const locale of targets) {
  console.log(`\n=== ${locale} ===`);
  const pack = await translatePack(locale);
  writeFileSync(join(DIR, `${locale}.json`), `${JSON.stringify(pack, null, 2)}\n`);
  console.log(`wrote ${locale} items=${itemCount(pack)}`);
}

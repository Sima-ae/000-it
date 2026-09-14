/**
 * Retry catalog summary EN echoes.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { translateManyConcurrent } from "./lib/translate.mjs";

const path = "src/content/fixweb/catalog-i18n.json";
const pack = JSON.parse(readFileSync(path, "utf8"));
const en = pack.summaries?.en || {};
const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 1);
const DELAY = Number(process.env.MT_DELAY_MS || 600);

const only = (process.env.MT_LOCALES || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const locales = Object.keys(pack.summaries || {}).filter(
  (l) => l !== "en" && l !== "nl" && (!only.length || only.includes(l)),
);

for (const locale of locales) {
  pack.summaries[locale] = pack.summaries[locale] || {};
  const missing = Object.keys(en).filter(
    (s) => !pack.summaries[locale][s] || pack.summaries[locale][s] === en[s],
  );
  console.log(`summaries ${locale}: ${missing.length}`);
  if (!missing.length) continue;
  const vals = await translateManyConcurrent(
    missing.map((s) => en[s]),
    locale,
    "en",
    { concurrency: CONCURRENCY, delayMs: DELAY },
  );
  let gained = 0;
  missing.forEach((s, i) => {
    if (vals[i] && vals[i] !== en[s]) {
      pack.summaries[locale][s] = vals[i];
      gained++;
    }
  });
  writeFileSync(path, `${JSON.stringify(pack, null, 2)}\n`);
  console.log(`saved ${locale} gained ${gained}`);
}
console.log("done summary retry");

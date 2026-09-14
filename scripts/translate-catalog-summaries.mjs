/**
 * Translate catalog service summaries for all locales into catalog-i18n.json.summaries
 */
import { readFileSync, writeFileSync } from "node:fs";
import { ALL_TARGET_LOCALES, translateManyConcurrent } from "./lib/translate.mjs";
import { serviceCatalog } from "../src/content/fixweb/catalog.ts";

const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 6);
const path = "src/content/fixweb/catalog-i18n.json";
const pack = JSON.parse(readFileSync(path, "utf8"));
pack.summaries = pack.summaries || {};
pack.labels = pack.labels || {};
pack.labels.en = { ...(pack.labels.en || {}), perMonth: "/ month" };
pack.labels.nl = { ...(pack.labels.nl || {}), perMonth: "/ maand" };

const en = {};
const nl = {};
for (const item of serviceCatalog) {
  if (item.summary) en[item.slug] = item.summary;
  if (item.summaryNl) nl[item.slug] = item.summaryNl;
}
pack.summaries.en = en;
pack.summaries.nl = nl;

const slugs = Object.keys(en);
const labelKeys = Object.keys(pack.labels.en);
const locales = ALL_TARGET_LOCALES.filter((l) => l !== "nl");

for (const locale of locales) {
  pack.summaries[locale] = pack.summaries[locale] || {};
  pack.labels[locale] = pack.labels[locale] || {};
  const missing = slugs.filter(
    (s) => !pack.summaries[locale][s] || pack.summaries[locale][s] === en[s],
  );
  const missingLabels = labelKeys.filter(
    (k) => !pack.labels[locale][k] || pack.labels[locale][k] === pack.labels.en[k],
  );
  if (!missing.length && !missingLabels.length) {
    console.log(`summaries ${locale} (cached)`);
    continue;
  }
  console.log(`summaries ${locale} (${missing.length}+${missingLabels.length} labels)`);
  if (missing.length) {
    const vals = await translateManyConcurrent(
      missing.map((s) => en[s]),
      locale,
      "en",
      { concurrency: CONCURRENCY },
    );
    missing.forEach((s, i) => {
      if (vals[i] && vals[i] !== en[s]) pack.summaries[locale][s] = vals[i];
    });
  }
  if (missingLabels.length) {
    const vals = await translateManyConcurrent(
      missingLabels.map((k) => pack.labels.en[k]),
      locale,
      "en",
      { concurrency: Math.min(CONCURRENCY, 3) },
    );
    missingLabels.forEach((k, i) => {
      if (vals[i] && vals[i] !== pack.labels.en[k]) pack.labels[locale][k] = vals[i];
    });
  }
  writeFileSync(path, `${JSON.stringify(pack, null, 2)}\n`);
  console.log(`saved ${locale}`);
}

writeFileSync(path, `${JSON.stringify(pack, null, 2)}\n`);
console.log("done catalog summaries");

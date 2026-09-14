/**
 * Translate service catalog titles for all locales.
 * Writes incrementally after each locale so progress survives interrupts.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ALL_TARGET_LOCALES, translateText } from "./lib/translate.mjs";

const OUT = join("src/content/fixweb/catalog-i18n.json");

// Extract catalog entries by parsing the TS file lightly via regex
const src = readFileSync("src/content/fixweb/catalog.ts", "utf8");
const items = [];
const re = /slug:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]*)"[\s\S]*?titleNl:\s*"([^"]*)"/g;
let m;
while ((m = re.exec(src))) {
  items.push({ slug: m[1], en: m[2], nl: m[3] });
}
console.log("catalog items", items.length);

const groupBlock = src.split("serviceGroups")[1] || "";
const groups2 = [];
const gre2 = /id:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]*)"[\s\S]*?titleNl:\s*"([^"]*)"/g;
while ((m = gre2.exec(groupBlock))) {
  groups2.push({ id: m[1], en: m[2], nl: m[3] });
}
console.log("groups", groups2.length);

const locales = ["en", "nl", ...ALL_TARGET_LOCALES.filter((l) => l !== "nl")];
const out = existsSync(OUT)
  ? JSON.parse(readFileSync(OUT, "utf8"))
  : { services: {}, groups: {} };
out.services ||= {};
out.groups ||= {};

function writeOut() {
  writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
}

for (const locale of locales) {
  const done =
    out.services[locale] &&
    Object.keys(out.services[locale]).length >= items.length &&
    out.groups[locale] &&
    Object.keys(out.groups[locale]).length >= groups2.length;
  if (done) {
    console.log(`\n=== catalog ${locale} (cached) ===`);
    continue;
  }
  console.log(`\n=== catalog ${locale} ===`);
  out.services[locale] = out.services[locale] || {};
  out.groups[locale] = out.groups[locale] || {};
  for (const item of items) {
    if (out.services[locale][item.slug]) continue;
    out.services[locale][item.slug] =
      locale === "en"
        ? item.en
        : locale === "nl"
          ? item.nl
          : await translateText(item.en, locale, "en");
  }
  for (const g of groups2) {
    if (out.groups[locale][g.id]) continue;
    out.groups[locale][g.id] =
      locale === "en" ? g.en : locale === "nl" ? g.nl : await translateText(g.en, locale, "en");
  }
  writeOut();
  console.log(`wrote ${locale}`);
}

writeOut();
console.log("wrote catalog-i18n.json");

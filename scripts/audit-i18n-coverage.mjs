/**
 * Audit translation coverage across messages + content packs.
 * Run: node scripts/audit-i18n-coverage.mjs
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const locales = readdirSync("messages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .sort();

function leaves(obj, prefix = "", out = []) {
  if (obj == null) return out;
  if (typeof obj !== "object" || Array.isArray(obj)) {
    out.push([prefix, obj]);
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    leaves(v, prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}

const en = JSON.parse(readFileSync("messages/en.json", "utf8"));
const enLeaves = leaves(en);
console.log("locales", locales.length);
console.log("en leaf keys", enLeaves.length);

for (const loc of locales.filter((l) => l !== "en")) {
  const m = JSON.parse(readFileSync(join("messages", `${loc}.json`), "utf8"));
  const map = new Map(leaves(m));
  const missing = [];
  const echoed = [];
  for (const [k, v] of enLeaves) {
    if (typeof v !== "string") continue;
    if (!map.has(k)) missing.push(k);
    else if (map.get(k) === v && loc !== "en" && v.length > 2) {
      // allow intentional same strings
      if (
        /^(FAQ|Portfolio|TripleZero|WordPress|AI|AEO|GEO|SEO|Enterprise|Business|Support|Chatbots|Workflows|Webdesign|Webhosting|E-commerce|Marketing|Social Media|Printing|Graphic Design|Grafisch Design|Digital Design|Digital design)$/i.test(
          v.trim(),
        )
      ) {
        continue;
      }
      echoed.push(k);
    }
  }
  if (missing.length || echoed.length > 15) {
    console.log(
      `messages ${loc}: missing=${missing.length} enEcho~=${echoed.length}`,
      missing.slice(0, 5).join(", "),
      echoed.slice(0, 5).join(", "),
    );
  }
}

function packLocales(path, kind) {
  if (!existsSync(path)) {
    console.log(`${kind}: MISSING FILE`);
    return;
  }
  const pack = JSON.parse(readFileSync(path, "utf8"));
  const have = Object.keys(pack).sort();
  const missingLoc = locales.filter((l) => !have.includes(l));
  console.log(`${kind}: locales ${have.length}/${locales.length}`, missingLoc.length ? `missing ${missingLoc.join(",")}` : "ok");
}

packLocales("src/content/fixweb/page-i18n-pack.json", "page-pack");
packLocales("src/content/fixweb/product-i18n-pack.json", "product-pack");
packLocales("src/content/legal/privacy-i18n.json", "privacy");
packLocales("src/content/legal/terms-i18n.json", "terms");
packLocales("src/content/legal/cookies-i18n.json", "cookies");
packLocales("src/content/legal/meta-i18n.json", "legal-meta");

const cat = JSON.parse(readFileSync("src/content/fixweb/catalog-i18n.json", "utf8"));
console.log(
  "catalog titles locales",
  Object.keys(cat.services || {}).length,
  "summaries",
  Object.keys(cat.summaries || {}).length,
);

console.log("done audit");

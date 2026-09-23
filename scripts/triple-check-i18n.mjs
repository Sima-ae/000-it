/**
 * Triple-check translation coverage. Prints actionable leftovers only.
 *   node scripts/triple-check-i18n.mjs
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const locales = readdirSync("messages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .sort();

const INTENTIONAL = /^(FAQ|Portfolio|TripleZero|TripleZero iT|WordPress|WooCommerce|AI|AEO|GEO|SEO|Enterprise|Business|Support|Chatbots|Workflows|Webdesign|Webhosting|E-commerce|Marketing|Social Media|Printing|Graphic Design|Grafisch Design|Digital Design|Digital design|Contact|Account|Home|Login|CRM|Extra Growth|Custom|Newsletter|Cookies|Force majeure|Privacy|Download|Name|Basic Support|Premium Support|Standard Support|Plan highlights|VPS Hosting.*|Shared Hosting.*|WordPress Hosting.*|WordPress Support|Social Media Management|Community Management|24\/7 support|Fix website errors|Fix Bugs and Errors)$/i;

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

function collectEchoes(enObj, curObj, need = new Set(), skipBrand = true) {
  if (typeof enObj === "string") {
    const t = enObj.trim();
    if (!t) return need;
    if (skipBrand && INTENTIONAL.test(t)) return need;
    if (!curObj || curObj === enObj) need.add(t.slice(0, 120));
    return need;
  }
  if (Array.isArray(enObj)) {
    enObj.forEach((x, i) =>
      collectEchoes(x, Array.isArray(curObj) ? curObj[i] : undefined, need, skipBrand),
    );
    return need;
  }
  if (enObj && typeof enObj === "object") {
    for (const k of Object.keys(enObj)) {
      collectEchoes(enObj[k], curObj?.[k], need, skipBrand);
    }
  }
  return need;
}

console.log("=== locales", locales.length, "===\n");

// messages: only report missing keys (not EN echoes — many intentional)
const en = JSON.parse(readFileSync("messages/en.json", "utf8"));
const enLeaves = leaves(en).filter(([, v]) => typeof v === "string");
let msgMissing = 0;
for (const loc of locales.filter((l) => l !== "en")) {
  const m = JSON.parse(readFileSync(join("messages", `${loc}.json`), "utf8"));
  const map = new Map(leaves(m));
  const missing = enLeaves.filter(([k]) => !map.has(k)).map(([k]) => k);
  if (missing.length) {
    msgMissing += missing.length;
    console.log(`messages ${loc} MISSING ${missing.length}:`, missing.slice(0, 8).join(", "));
  }
}
if (!msgMissing) console.log("messages: all locales have full key set ✓");

function checkPack(path, label) {
  if (!existsSync(path)) {
    console.log(`${label}: MISSING FILE`);
    return;
  }
  const pack = JSON.parse(readFileSync(path, "utf8"));
  const have = Object.keys(pack);
  const missLoc = locales.filter((l) => !have.includes(l));
  if (missLoc.length) console.log(`${label}: missing locales`, missLoc.join(","));
  else console.log(`${label}: 35 locales ✓`);

  const enRoot = pack.en;
  if (!enRoot) return;
  let total = 0;
  for (const loc of Object.keys(pack).filter((l) => l !== "en" && l !== "nl")) {
    const need = new Set();
    if (Array.isArray(enRoot)) {
      collectEchoes(enRoot, pack[loc], need);
    } else {
      for (const key of Object.keys(enRoot)) {
        collectEchoes(enRoot[key], pack[loc]?.[key], need);
      }
    }
    if (need.size) {
      total += need.size;
      console.log(
        `  ${label} ${loc}: ${need.size} EN leftovers —`,
        [...need].slice(0, 2).join(" | "),
      );
    }
  }
  if (!total) console.log(`  ${label}: no meaningful EN leftovers ✓`);
}

checkPack("src/content/fixweb/page-i18n-pack.json", "page-pack");
checkPack("src/content/fixweb/product-i18n-pack.json", "product-pack");
checkPack("src/content/legal/privacy-i18n.json", "privacy");
checkPack("src/content/legal/terms-i18n.json", "terms");
checkPack("src/content/legal/meta-i18n.json", "legal-meta");
checkPack("src/content/appointment-i18n.json", "appointment");

const cat = JSON.parse(readFileSync("src/content/fixweb/catalog-i18n.json", "utf8"));
console.log(
  "catalog titles",
  Object.keys(cat.services || {}).length,
  "summaries",
  Object.keys(cat.summaries || {}).length,
);

// cookies: only prose leftovers
if (existsSync("src/content/legal/cookies-i18n.json")) {
  const c = JSON.parse(readFileSync("src/content/legal/cookies-i18n.json", "utf8"));
  function shouldTranslate(text) {
    const t = (text || "").trim();
    if (!t) return false;
    if (/^[A-Za-z0-9_.:*-]{1,64}$/.test(t) && !/\s/.test(t)) return false;
    if (/^DataTables_/i.test(t) || /\/crm\/|index\.php/i.test(t)) return false;
    if (/^\d+\.\s*Cookies$/i.test(t)) return false;
    if (
      /^(Google Maps|Sourcebuster JS|WordPress|Cloudflare|session|persistent|e_document\/global|Google Fonts API|Google Maps API|5\.4 Social media)$/i.test(
        t,
      )
    )
      return false;
    return t.length > 12;
  }
  function cookieEchoes(en, cur) {
    const need = new Set();
    for (let i = 0; i < (en || []).length; i++) {
      const a = en[i];
      const b = cur?.[i] || {};
      if (a.heading && shouldTranslate(a.heading) && (!b.heading || b.heading === a.heading))
        need.add(a.heading);
      (a.paragraphs || []).forEach((p, j) => {
        if (shouldTranslate(p) && (!b.paragraphs?.[j] || b.paragraphs[j] === p)) need.add(p);
      });
    }
    return need.size;
  }
  let cookieTotal = 0;
  for (const loc of Object.keys(c).filter((l) => l !== "en")) {
    const n = cookieEchoes(c.en, c[loc]);
    if (n) {
      cookieTotal += n;
      console.log(`cookies ${loc}: ${n} prose leftovers`);
    }
  }
  if (!cookieTotal) console.log("cookies: prose complete ✓ (tech IDs may stay EN)");
  else console.log("cookies: total prose leftovers", cookieTotal);
}

console.log("\nNote: kennisbank article bodies live in DB and need a separate backfill when DB is up.");
console.log("done triple-check");

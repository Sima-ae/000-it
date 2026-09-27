/**
 * Placeholder-safe fill for remaining EN-echo UI strings.
 * Protects {placeholders} before MT and restores them after.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { translateText, stripMtArtifacts } from "./lib/translate.mjs";

const KEEP =
  /^(FAQ|Portfolio|TripleZero( iT)?|WordPress|WooCommerce|AI|AEO|GEO|SEO|CRM|DNS|DNSSEC|URL|PDF|Pro|Double|Premium|Enterprise|Business|Support|Online|Offline|Home|Login|Dashboard|Hosting|VPS|SSL|ID|OK|API|Cases|Contact|Account|Name|Type|Status|Plan|Product|Service|Portal|System|Start|Pause|Idle|Admin|Manager|Website|Ads|Branding|Checkout|Generator|Filters|Project|Open|Edit|Save|Tickets|Leads|Tasks|Newsletter|Cookies|Privacy|Download|Custom|Live chat|WHOIS|iDEAL|webshop|In \{category\}|AI, AEO, GEO & SEO in \{name\}|1 website|2 websites|3-5 websites|Stripe · iDEAL \/ card|tag1, tag2, tag3|Key tag|Digest type|Key-tag|Digest-type|Bulk sync)$/i;

function isKeep(v) {
  const t = String(v || "").trim();
  if (!t || t.length <= 2) return true;
  if (KEEP.test(t)) return true;
  if (/^\{[a-zA-Z0-9_]+\}$/.test(t)) return true;
  if (/@|Burlington|Marasi|Business Bay|United Arab|000-it\.com|57P7/.test(t)) return true;
  if (!/\s/.test(t) && t.length < 14) return true;
  return false;
}

function protect(text) {
  const ph = [];
  const out = text.replace(/\{[a-zA-Z0-9_]+\}/g, (m) => {
    const token = `[[PH${ph.length}]]`;
    ph.push(m);
    return token;
  });
  return { out, ph };
}

function restore(text, ph) {
  let out = text;
  ph.forEach((p, i) => {
    out = out.split(`[[PH${i}]]`).join(p);
    // MT sometimes alters brackets
    out = out.split(`[PH${i}]`).join(p);
    out = out.split(`【PH${i}】`).join(p);
  });
  return out;
}

function leaves(obj, prefix = "", out = []) {
  if (obj == null) return out;
  if (typeof obj === "string") {
    out.push([prefix, obj]);
    return out;
  }
  if (typeof obj !== "object" || Array.isArray(obj)) return out;
  for (const [k, v] of Object.entries(obj)) {
    leaves(v, prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}

function getPath(obj, path) {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}
function setPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== "object") cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

const en = JSON.parse(readFileSync("messages/en.json", "utf8"));
const enLeaves = leaves(en).filter(([, v]) => typeof v === "string");
const locales = readdirSync("messages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .filter((l) => l !== "en");

let gained = 0;
for (const locale of locales) {
  const p = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(p, "utf8"));
  const todo = enLeaves.filter(([path, val]) => {
    if (isKeep(val)) return false;
    return getPath(data, path) === val;
  });
  if (!todo.length) continue;
  console.log(`=== ${locale}: ${todo.length} ===`);
  for (const [path, src] of todo) {
    const { out: protectedSrc, ph } = protect(src);
    let next = stripMtArtifacts(await translateText(protectedSrc, locale, "en"));
    next = restore(next, ph);
    if (!next || next === src) continue;
    const srcPh = src.match(/\{[a-zA-Z0-9_]+\}/g) || [];
    const nextPh = next.match(/\{[a-zA-Z0-9_]+\}/g) || [];
    if (srcPh.join() !== nextPh.join()) {
      // force-restore by replacing mangled tokens near original order
      if (srcPh.length && next.includes("[[PH")) continue;
      if (srcPh.length !== nextPh.length) continue;
    }
    setPath(data, path, next);
    gained += 1;
    process.stdout.write(".");
  }
  writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
  console.log("");
}
console.log(`done gained=${gained}`);

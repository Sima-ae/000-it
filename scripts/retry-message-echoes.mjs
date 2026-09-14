/**
 * Find + retranslate message keys still equal to EN (excluding brands/cognates).
 *   MT_CONCURRENCY=1 MT_DELAY_MS=600 npx tsx scripts/retry-message-echoes.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { translateManyConcurrent } from "./lib/translate.mjs";

const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 1);
const DELAY = Number(process.env.MT_DELAY_MS || 600);

const BRAND_OK =
  /^(FAQ|Portfolio|TripleZero iT( Hosting)?|WordPress|WooCommerce|AI|AEO|GEO|SEO|Enterprise|Business|Support|Chatbots|Workflows|Webdesign|Webhosting|E-commerce|Marketing|Social Media|Printing|Digital Design|Digital design|Contact|Account|Home|Login|CRM|Extra Growth|Custom|Score|Name|Collaboration|Newsletter|Cookies|Force majeure|Privacy|Download|Fix Bugs and Errors)$/i;

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

function setPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = cur[parts[i]] || {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

const en = JSON.parse(readFileSync("messages/en.json", "utf8"));
const enLeaves = leaves(en).filter(([, v]) => typeof v === "string");

const only = (process.env.MT_LOCALES || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const locales = readdirSync("messages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .filter((l) => l !== "en" && l !== "nl")
  .filter((l) => !only.length || only.includes(l));

for (const locale of locales) {
  const p = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(p, "utf8"));
  const echoes = [];
  for (const [k, v] of enLeaves) {
    const cur = getPath(data, k);
    if (typeof cur !== "string") continue;
    if (cur !== v) continue;
    if (BRAND_OK.test(v.trim())) continue;
    // Keep brand-containing short labels that are meant to stay English-ish
    if (/^TripleZero/i.test(v.trim()) && v.length < 40) continue;
    if (v.includes("TripleZero iT") && v.length < 50 && !/[.!?…]/.test(v)) continue;
    echoes.push(k);
  }
  console.log(`\n=== messages ${locale} echoes=${echoes.length} ===`);
  if (!echoes.length) continue;

  const vals = await translateManyConcurrent(
    echoes.map((k) => getPath(en, k)),
    locale,
    "en",
    { concurrency: CONCURRENCY, delayMs: DELAY },
  );
  let gained = 0;
  echoes.forEach((k, i) => {
    const src = getPath(en, k);
    if (vals[i] && vals[i] !== src) {
      setPath(data, k, vals[i]);
      gained++;
    }
  });
  writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`saved ${locale} gained ${gained}/${echoes.length}`);
}

console.log("\ndone message echo retry");

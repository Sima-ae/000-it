/**
 * Fill remaining English-echo strings across ALL message namespaces.
 * Skips brand/tech tokens that should stay English.
 *
 *   MT_CONCURRENCY=8 MT_DELAY_MS=150 node scripts/translate-remaining-echoes.mjs
 *   MT_LOCALES=nl,de,fr node scripts/translate-remaining-echoes.mjs
 *   MT_NAMESPACES=ordersAdmin,domainsPage node scripts/translate-remaining-echoes.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  translateManyConcurrent,
  stripMtArtifacts,
} from "./lib/translate.mjs";

const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 8);
const DELAY = Number(process.env.MT_DELAY_MS || 150);

const KEEP_AS_IS =
  /^(FAQ|Portfolio|TripleZero( iT)?( Hosting)?|WordPress|WooCommerce|AI|AEO|GEO|SEO|CRM|DNS|DNSSEC|URL|PDF|Pro|Double|Premium|Enterprise|Business|Support|Online|Offline|Home|Login|Dashboard|Hosting|VPS|SSL|ID|OK|API|SMTP|HTTP|HTTPS|NS|TTL|MX|TXT|CNAME|A|AAAA|SRV|CAA|DS|Agent 000|info@000-it\.com|24\/7|Shop|Webmail|Info|Cases|Contact|Account|Name|Type|Status|Plan|Product|Service|Portal|System|Start|Pause|Idle|Admin|Manager|Website|Ads|Branding|Checkout|Generator|Filters|Project|Open|Edit|Save|Full growth|Super admin|webshop|Servers online|AEO, GEO & SEO|Integration|Analytics|Tickets|Leads|Tasks|Newsletter|Cookies|Privacy|Download|Custom|Chatbots|Workflows|Webdesign|Webhosting|E-commerce|Marketing|Social Media|Printing|Graphic Design|Grafisch Design|Digital Design|Digital design|Extra Growth|Force majeure|Pro Support|Premium Support|Double Support|Plan highlights|Live chat|Key tag|Digest type|Bulk sync|Stripe · iDEAL \/ card|tag1, tag2, tag3|WHOIS|iDEAL)$/i;

function isKeep(value) {
  const v = String(value || "").trim();
  if (!v) return true;
  if (v.length <= 2) return true;
  if (KEEP_AS_IS.test(v)) return true;
  if (/^\{[a-zA-Z0-9_]+\}$/.test(v)) return true;
  // Addresses / emails / codes
  if (/@|Burlington|Marasi|Business Bay|United Arab|000-it\.com|57P7/.test(v))
    return true;
  // Pure short loanwords without spaces
  if (!/\s/.test(v) && v.length < 14) return true;
  return false;
}

function isBadLocal(out) {
  return /amnesty international|منظمة العفو|amnisti[aá]|amnestie international/i.test(
    out,
  );
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

function getPath(obj, path) {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}

function collectLeaves(obj, prefix = "", out = []) {
  if (obj == null) return out;
  if (typeof obj === "string") {
    out.push([prefix, obj]);
    return out;
  }
  if (typeof obj !== "object" || Array.isArray(obj)) return out;
  for (const [k, v] of Object.entries(obj)) {
    collectLeaves(v, prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}

const en = JSON.parse(readFileSync("messages/en.json", "utf8"));
const enLeaves = collectLeaves(en).filter(([, v]) => typeof v === "string");

const onlyLocales = (process.env.MT_LOCALES || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const onlyNs = (process.env.MT_NAMESPACES || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const locales = readdirSync("messages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .filter((l) => l !== "en")
  .filter((l) => !onlyLocales.length || onlyLocales.includes(l));

let totalGained = 0;
let totalTodo = 0;

for (const locale of locales) {
  const p = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(p, "utf8"));

  const paths = [];
  const srcs = [];

  for (const [path, enVal] of enLeaves) {
    if (onlyNs.length && !onlyNs.some((ns) => path === ns || path.startsWith(`${ns}.`))) {
      continue;
    }
    if (isKeep(enVal)) continue;
    const cur = getPath(data, path);
    if (cur === undefined) {
      setPath(data, path, enVal);
    }
    const value = getPath(data, path);
    if (typeof value !== "string") continue;
    if (value === enVal) {
      paths.push(path);
      srcs.push(enVal);
    }
  }

  totalTodo += paths.length;
  console.log(`\n=== ${locale}: translate=${paths.length} ===`);

  if (!paths.length) {
    writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
    continue;
  }

  const vals = await translateManyConcurrent(srcs, locale, "en", {
    concurrency: CONCURRENCY,
    delayMs: DELAY,
  });

  let gained = 0;
  paths.forEach((path, i) => {
    const src = srcs[i];
    let next = stripMtArtifacts(vals[i] || "");
    if (!next || next === src) return;
    if (isBadLocal(next)) return;
    const srcPh = src.match(/\{[a-zA-Z0-9_]+\}/g) || [];
    const nextPh = next.match(/\{[a-zA-Z0-9_]+\}/g) || [];
    if (srcPh.length && srcPh.join() !== nextPh.join()) return;
    setPath(data, path, next);
    gained += 1;
  });

  console.log(`  gained ${gained}/${paths.length}`);
  totalGained += gained;
  writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
}

console.log(`\ndone. todo=${totalTodo} translated=${totalGained}`);

/**
 * Translate client-dashboard namespaces (dashboard, crm, myDomains) for all locales.
 * Only rewrites strings that still exactly match English (echoes).
 *
 *   MT_CONCURRENCY=6 MT_DELAY_MS=200 node scripts/translate-client-dashboard.mjs
 *   MT_LOCALES=de,fr node scripts/translate-client-dashboard.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  translateManyConcurrent,
  stripMtArtifacts,
} from "./lib/translate.mjs";

const NAMESPACES = ["dashboard", "crm", "myDomains"];
const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 6);
const DELAY = Number(process.env.MT_DELAY_MS || 200);

/** Strings that are fine to leave in English across locales */
const KEEP_AS_IS =
  /^(FAQ|Portfolio|TripleZero iT( Hosting)?|WordPress|WooCommerce|AI|AEO|GEO|SEO|CRM|DNS|DNSSEC|URL|PDF|Pro|Double|Premium|Enterprise|Business|Support|Online|Home|Login|Dashboard|Hosting|VPS|SSL|ID|OK|API|SMTP|HTTP|HTTPS|NS|TTL|MX|TXT|CNAME|A|AAAA|SRV|CAA|DS|Agent 000|info@000-it\.com|24\/7)$/i;

function isKeep(value) {
  const v = String(value || "").trim();
  if (!v) return true;
  if (v.length <= 2) return true;
  if (KEEP_AS_IS.test(v)) return true;
  if (/^\{[a-zA-Z0-9_]+\}$/.test(v)) return true;
  return false;
}

function isBadLocal(out) {
  return /amnesty international|منظمة العفو|amnisti[aá]|amnestie international/i.test(
    out,
  );
}

const en = JSON.parse(readFileSync("messages/en.json", "utf8"));

const only = (process.env.MT_LOCALES || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const locales = readdirSync("messages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .filter((l) => l !== "en")
  .filter((l) => !only.length || only.includes(l));

let totalGained = 0;
let totalTodo = 0;

for (const locale of locales) {
  const p = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(p, "utf8"));

  const paths = [];
  const srcs = [];

  for (const ns of NAMESPACES) {
    const enNs = en[ns];
    if (!enNs || typeof enNs !== "object") continue;
    if (!data[ns] || typeof data[ns] !== "object") data[ns] = {};

    for (const [key, enVal] of Object.entries(enNs)) {
      if (typeof enVal !== "string") continue;
      if (isKeep(enVal)) continue;

      const cur = data[ns][key];
      // Fill missing from English first
      if (cur === undefined) {
        data[ns][key] = enVal;
      }
      const value = data[ns][key];
      if (typeof value !== "string") continue;
      if (value === enVal) {
        paths.push(`${ns}.${key}`);
        srcs.push(enVal);
      }
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
    const [ns, key] = path.split(".");
    const src = srcs[i];
    let next = stripMtArtifacts(vals[i] || "");
    if (!next || next === src) return;
    if (isBadLocal(next)) return;
    // Preserve ICU placeholders
    const srcPh = src.match(/\{[a-zA-Z0-9_]+\}/g) || [];
    const nextPh = next.match(/\{[a-zA-Z0-9_]+\}/g) || [];
    if (srcPh.length && srcPh.join() !== nextPh.join()) {
      // keep original if placeholders mangled
      return;
    }
    data[ns][key] = next;
    gained += 1;
  });

  console.log(`  gained ${gained}/${paths.length}`);
  totalGained += gained;
  writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
}

console.log(`\ndone. todo=${totalTodo} translated=${totalGained}`);

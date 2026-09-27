/**
 * Second pass: translate remaining English echoes in client-dashboard namespaces,
 * with ICU placeholder protection.
 *
 *   MT_CONCURRENCY=8 MT_DELAY_MS=150 node scripts/translate-client-dashboard-pass2.mjs
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
const KEEP =
  /^(FAQ|Portfolio|TripleZero iT|WordPress|AI|AEO|GEO|SEO|CRM|DNS|DNSSEC|URL|PDF|Pro|Hosting|Dashboard|Status|Privacy|Domain|Generator|Email|Open|Type|Name|Tickets|Messages|Leads|Inbox|OK|API|NS|TTL|MX|TXT|CNAME|Super admin|Client|Admin|Manager|Incident)$/i;

function protect(s) {
  const ph = [];
  const out = s.replace(/\{[a-zA-Z0-9_]+\}/g, (m) => {
    ph.push(m);
    return `[[${ph.length - 1}]]`;
  });
  return { out, ph };
}

function restore(s, ph) {
  return s.replace(/\[\[(\d+)\]\]/g, (_, i) => ph[Number(i)] ?? "");
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

let total = 0;
for (const locale of locales) {
  const p = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(p, "utf8"));
  const paths = [];
  const srcs = [];
  const phs = [];
  for (const ns of NAMESPACES) {
    if (!data[ns]) data[ns] = {};
    for (const [key, enVal] of Object.entries(en[ns] || {})) {
      if (typeof enVal !== "string") continue;
      if (KEEP.test(enVal.trim()) || enVal.length <= 2) continue;
      if (data[ns][key] !== enVal) continue;
      const { out, ph } = protect(enVal);
      paths.push([ns, key]);
      srcs.push(out);
      phs.push(ph);
    }
  }
  console.log(`\n=== ${locale}: ${paths.length} ===`);
  if (!paths.length) continue;
  const vals = await translateManyConcurrent(srcs, locale, "en", {
    concurrency: CONCURRENCY,
    delayMs: DELAY,
  });
  let gained = 0;
  paths.forEach(([ns, key], i) => {
    let next = stripMtArtifacts(vals[i] || "");
    next = restore(next, phs[i]);
    const src = restore(srcs[i], phs[i]);
    if (!next || next === src) return;
    if (/amnesty international|منظمة العفو/i.test(next)) return;
    data[ns][key] = next;
    gained += 1;
  });
  console.log(`  gained ${gained}/${paths.length}`);
  total += gained;
  writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
}
console.log(`\ndone pass2 translated=${total}`);

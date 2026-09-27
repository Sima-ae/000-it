/**
 * Sync new manager/client status keys + fill ordersAdmin EN echoes.
 *   node scripts/sync-manager-client-i18n.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  translateManyConcurrent,
  stripMtArtifacts,
} from "./lib/translate.mjs";

const PREFIXES = [
  ["crm", "clientStatus_"],
  ["crm", "leadStatus_"],
  ["crm", "taskStatus_"],
  ["crm", "paymentTermsDefault"],
  ["crm", "vatLabel"],
  ["dashboard", "projectStatus_"],
  ["dashboard", "orderType_"],
  ["myDomains", "status_"],
];

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
  });
  return out;
}

const KEEP =
  /^(FAQ|CRM|DNS|DNSSEC|URL|PDF|SEO|AI|OK|ID|API|Pro|Premium|Agent 000|Lead|Status|Type|Name|Email|Dashboard|Hosting|Shop|Tickets|Leads|Tasks)$/i;

const en = JSON.parse(readFileSync("messages/en.json", "utf8"));
const locales = readdirSync("messages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .filter((l) => l !== "en" && l !== "nl");

let gained = 0;
for (const locale of locales) {
  const p = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(p, "utf8"));
  const paths = [];
  const srcs = [];

  for (const [ns, prefix] of PREFIXES) {
    if (!data[ns]) data[ns] = {};
    const enNs = en[ns] || {};
    for (const [key, val] of Object.entries(enNs)) {
      if (typeof val !== "string") continue;
      if (!(key === prefix || key.startsWith(prefix))) continue;
      if (!data[ns][key] || data[ns][key] === val) {
        paths.push(`${ns}.${key}`);
        srcs.push(val);
      }
    }
  }

  // ordersAdmin echoes (manager all-orders)
  const oa = en.ordersAdmin || {};
  if (!data.ordersAdmin) data.ordersAdmin = {};
  for (const [key, val] of Object.entries(oa)) {
    if (typeof val !== "string") continue;
    if (KEEP.test(val.trim())) continue;
    if (data.ordersAdmin[key] === val) {
      paths.push(`ordersAdmin.${key}`);
      srcs.push(val);
    }
  }

  // liveChat priority echoes
  const lc = en.liveChat || {};
  if (!data.liveChat) data.liveChat = {};
  for (const [key, val] of Object.entries(lc)) {
    if (typeof val !== "string") continue;
    if (!key.toLowerCase().includes("priority")) continue;
    if (data.liveChat[key] === val) {
      paths.push(`liveChat.${key}`);
      srcs.push(val);
    }
  }

  console.log(`=== ${locale}: ${paths.length} ===`);
  if (!paths.length) {
    writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
    continue;
  }

  const protectedSrcs = srcs.map((s) => protect(s));
  const vals = await translateManyConcurrent(
    protectedSrcs.map((x) => x.out),
    locale,
    "en",
    { concurrency: 8, delayMs: 100 },
  );

  paths.forEach((path, i) => {
    const [ns, key] = path.split(".");
    let next = stripMtArtifacts(vals[i] || "");
    next = restore(next, protectedSrcs[i].ph);
    const src = srcs[i];
    if (!next || next === src) {
      // still copy key so structure exists (better than missing)
      if (data[ns][key] === undefined) data[ns][key] = src;
      return;
    }
    const srcPh = (src.match(/\{[a-zA-Z0-9_]+\}/g) || []).join();
    const nextPh = (next.match(/\{[a-zA-Z0-9_]+\}/g) || []).join();
    if (srcPh !== nextPh) {
      if (data[ns][key] === undefined) data[ns][key] = src;
      return;
    }
    data[ns][key] = next;
    gained += 1;
  });

  writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
}
console.log("done gained", gained);

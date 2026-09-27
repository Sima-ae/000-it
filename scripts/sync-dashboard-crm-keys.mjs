/**
 * Sync new CRM dashboard keys + fill remaining ICU echoes in dashboard/crm/ordersAdmin.
 *   node scripts/sync-dashboard-crm-keys.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  translateManyConcurrent,
  stripMtArtifacts,
} from "./lib/translate.mjs";

const NEW_KEYS = [
  "loading",
  "lead",
  "staff",
  "actionFailed",
  "fieldName",
  "fieldEmail",
  "fieldCompany",
  "fieldPhone",
  "fieldIndustry",
  "fieldWebsite",
  "fieldStatus",
];

const ICU_NS = ["dashboard", "crm", "ordersAdmin", "myDomains", "liveChat"];

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
    out = out.split(`[PH${i}]`).join(p);
  });
  return out;
}

const en = JSON.parse(readFileSync("messages/en.json", "utf8"));
const locales = readdirSync("messages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .filter((l) => l !== "en" && l !== "nl");

let gained = 0;
for (const locale of locales) {
  const p = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(p, "utf8"));
  if (!data.crm) data.crm = {};

  const paths = [];
  const srcs = [];

  for (const key of NEW_KEYS) {
    const enVal = en.crm[key];
    if (typeof enVal !== "string") continue;
    if (!data.crm[key] || data.crm[key] === enVal) {
      paths.push(`crm.${key}`);
      srcs.push(enVal);
    }
  }

  for (const ns of ICU_NS) {
    const enNs = en[ns];
    if (!enNs || typeof enNs !== "object") continue;
    if (!data[ns]) data[ns] = {};
    for (const [key, enVal] of Object.entries(enNs)) {
      if (typeof enVal !== "string") continue;
      if (!/\{[a-zA-Z0-9_]+\}/.test(enVal)) continue;
      if (data[ns][key] === enVal) {
        paths.push(`${ns}.${key}`);
        srcs.push(enVal);
      }
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
    { concurrency: 6, delayMs: 120 },
  );

  paths.forEach((path, i) => {
    const [ns, key] = path.split(".");
    let next = stripMtArtifacts(vals[i] || "");
    next = restore(next, protectedSrcs[i].ph);
    const src = srcs[i];
    if (!next || next === src) return;
    const srcPh = (src.match(/\{[a-zA-Z0-9_]+\}/g) || []).join();
    const nextPh = (next.match(/\{[a-zA-Z0-9_]+\}/g) || []).join();
    if (srcPh !== nextPh) return;
    data[ns][key] = next;
    gained += 1;
  });

  writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
}
console.log("done gained", gained);

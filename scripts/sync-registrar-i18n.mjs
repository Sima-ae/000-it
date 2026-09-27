/**
 * Sync + MT only the new registrar / Ready-To-Go keys across all locales.
 * Faster than full finish-ui-messages (avoids retranslating entire EN-echo trees).
 *
 *   npx tsx scripts/sync-registrar-i18n.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { translateManyConcurrent, stripMtArtifacts } from "./lib/translate.mjs";

const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 4);
const DELAY = Number(process.env.MT_DELAY_MS || 150);

const PREFIXES = [
  "myDomains.",
  "domainsPage.transfer",
  "domainsPage.ctaMyDomains",
  "domainsPage.dnsBody",
  "pricing.hostingIncludedInPlan",
  "pricing.plansServiceNote",
  "dashboard.myDomains",
];

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
    if (!cur[parts[i]] || typeof cur[parts[i]] !== "object") cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function matches(path) {
  return PREFIXES.some(
    (p) => path === p.replace(/\.$/, "") || path.startsWith(p),
  );
}

const en = JSON.parse(readFileSync("messages/en.json", "utf8"));
const enLeaves = leaves(en).filter(([, v]) => typeof v === "string");
const targetLeaves = enLeaves.filter(([k]) => matches(k));
console.log("target keys", targetLeaves.length);

const locales = readdirSync("messages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .filter((l) => l !== "en" && l !== "nl");

for (const locale of locales) {
  const p = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(p, "utf8"));

  // Structural: all missing EN keys
  let structural = 0;
  for (const [k, v] of enLeaves) {
    if (getPath(data, k) === undefined) {
      setPath(data, k, v);
      structural += 1;
    }
  }

  const toTranslate = [];
  for (const [k, v] of targetLeaves) {
    const cur = getPath(data, k);
    if (typeof cur !== "string") continue;
    if (cur === v) toTranslate.push(k);
  }

  console.log(`\n=== ${locale}: +${structural} missing, MT ${toTranslate.length} ===`);

  if (toTranslate.length) {
    const srcs = toTranslate.map((k) => getPath(en, k));
    const vals = await translateManyConcurrent(srcs, locale, "en", {
      concurrency: CONCURRENCY,
      delayMs: DELAY,
    });
    let gained = 0;
    toTranslate.forEach((k, i) => {
      const next = stripMtArtifacts(vals[i] || "");
      if (!next || next === srcs[i]) return;
      setPath(data, k, next);
      gained += 1;
    });
    console.log(`  gained ${gained}/${toTranslate.length}`);
  }

  writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
}

console.log("\ndone sync-registrar-i18n");

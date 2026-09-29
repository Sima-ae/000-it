/**
 * Fill homepage/UI gaps for bn, hi, mr, ps, pa, te, ur:
 * - catalog groupSummaries (service card descriptions)
 * - pricing.features.* arrays
 * - pricing plan names (starter/growth/enterprise/custom)
 * - remaining English string echoes in messages/*.json (including forced plan names)
 *
 *   MT_CONCURRENCY=2 MT_DELAY_MS=300 npx tsx scripts/translate-south-asian-gaps.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  translateManyConcurrent,
  stripMtArtifacts,
} from "./lib/translate.mjs";

const LOCALES = (process.env.MT_LOCALES || "bn,hi,mr,ps,pa,te,ur")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 2);
const DELAY = Number(process.env.MT_DELAY_MS || 300);

const KEEP_AS_IS =
  /^(FAQ|Portfolio|TripleZero( iT)?( Hosting)?|WordPress|WooCommerce|AI|AEO|GEO|SEO|CRM|DNS|DNSSEC|URL|PDF|Pro|Double|Premium|Support|Online|Offline|Home|Login|Dashboard|Hosting|VPS|SSL|ID|OK|API|SMTP|HTTP|HTTPS|NS|TTL|MX|TXT|CNAME|A|AAAA|SRV|CAA|DS|Agent 000|info@000-it\.com|24\/7|Shop|Webmail|Info|Cases|Contact|Account|Name|Type|Status|Plan|Product|Service|Portal|System|Start|Pause|Idle|Admin|Manager|Website|Ads|Branding|Checkout|Generator|Filters|Project|Open|Edit|Save|Full growth|Super admin|webshop|Servers online|AEO, GEO & SEO|Integration|Analytics|Tickets|Leads|Tasks|Newsletter|Cookies|Privacy|Download|Chatbots|Workflows|Webdesign|Webhosting|E-commerce|Marketing|Social Media|Printing|Graphic Design|Grafisch Design|Digital Design|Digital design|Force majeure|Pro Support|Premium Support|Double Support|Plan highlights|Live chat|Key tag|Digest type|Bulk sync|Stripe · iDEAL \/ card|tag1, tag2, tag3|WHOIS|iDEAL)$/i;

function isKeep(value) {
  const v = String(value || "").trim();
  if (!v) return true;
  if (v.length <= 2) return true;
  if (KEEP_AS_IS.test(v)) return true;
  if (/^\{[a-zA-Z0-9_]+\}$/.test(v)) return true;
  if (/@|Burlington|Marasi|Business Bay|United Arab|000-it\.com|57P7/.test(v))
    return true;
  if (!/\s/.test(v) && v.length < 14) return true;
  return false;
}

function isBadLocal(out) {
  return /amnesty international|منظمة العفو|amnisti[aá]|amnestie international/i.test(
    out,
  );
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

function collectStringLeaves(obj, prefix = "", out = []) {
  if (obj == null) return out;
  if (typeof obj === "string") {
    out.push([prefix, obj]);
    return out;
  }
  if (Array.isArray(obj)) return out;
  if (typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj)) {
    collectStringLeaves(v, prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}

async function translateBatch(texts, locale) {
  if (!texts.length) return [];
  return translateManyConcurrent(texts, locale, "en", {
    concurrency: CONCURRENCY,
    delayMs: DELAY,
  });
}

async function fillGroupSummaries(locales) {
  const catalogPath = "src/content/fixweb/catalog-i18n.json";
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  const en = catalog.groupSummaries?.en;
  if (!en) throw new Error("missing groupSummaries.en");
  const keys = Object.keys(en);
  catalog.groupSummaries = catalog.groupSummaries || {};

  for (const locale of locales) {
    const existing = catalog.groupSummaries[locale] || {};
    const missing = keys.filter(
      (k) => !existing[k] || existing[k] === en[k],
    );
    console.log(`groupSummaries ${locale}: need ${missing.length}/${keys.length}`);
    const next = { ...existing };
    if (missing.length) {
      const vals = await translateBatch(
        missing.map((k) => en[k]),
        locale,
      );
      missing.forEach((k, i) => {
        const out = stripMtArtifacts(vals[i] || "");
        if (out && out !== en[k] && !isBadLocal(out)) next[k] = out;
      });
    }
    for (const k of keys) if (!next[k]) next[k] = en[k];
    catalog.groupSummaries[locale] = next;
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
  }
  console.log("groupSummaries done");
}

async function fillPricingAndEchoes(locales) {
  const en = JSON.parse(readFileSync("messages/en.json", "utf8"));
  const enLeaves = collectStringLeaves(en);
  const planKeys = [
    "pricing.starter",
    "pricing.growth",
    "pricing.enterprise",
    "pricing.custom",
  ];
  const featurePlans = ["starter", "growth", "enterprise"];

  for (const locale of locales) {
    const path = join("messages", `${locale}.json`);
    const data = JSON.parse(readFileSync(path, "utf8"));
    let gained = 0;

    // Plan names — force translate even if KEEP would skip brand tokens.
    {
      const todo = planKeys.filter((k) => {
        const src = getPath(en, k);
        const cur = getPath(data, k);
        return typeof src === "string" && (cur == null || cur === src);
      });
      if (todo.length) {
        const srcs = todo.map((k) => getPath(en, k));
        const vals = await translateBatch(srcs, locale);
        todo.forEach((k, i) => {
          const out = stripMtArtifacts(vals[i] || "");
          if (out && out !== srcs[i] && !isBadLocal(out)) {
            setPath(data, k, out);
            gained += 1;
          }
        });
      }
    }

    // Feature arrays
    for (const plan of featurePlans) {
      const srcArr = getPath(en, `pricing.features.${plan}`);
      const curArr = getPath(data, `pricing.features.${plan}`);
      if (!Array.isArray(srcArr)) continue;
      const next = Array.isArray(curArr) ? [...curArr] : [...srcArr];
      const needIdx = [];
      srcArr.forEach((src, i) => {
        if (typeof src !== "string") return;
        if (!next[i] || next[i] === src) needIdx.push(i);
      });
      if (!needIdx.length) continue;
      const vals = await translateBatch(
        needIdx.map((i) => srcArr[i]),
        locale,
      );
      needIdx.forEach((i, j) => {
        const out = stripMtArtifacts(vals[j] || "");
        if (out && out !== srcArr[i] && !isBadLocal(out)) {
          next[i] = out;
          gained += 1;
        }
      });
      setPath(data, `pricing.features.${plan}`, next);
    }

    // Remaining string echoes (skip short brand tokens)
    const todo = [];
    for (const [k, src] of enLeaves) {
      if (planKeys.includes(k)) continue;
      if (isKeep(src)) continue;
      const cur = getPath(data, k);
      if (typeof cur !== "string") continue;
      if (cur === src && src.length > 2) todo.push(k);
    }
    if (todo.length) {
      console.log(`  ${locale} string echoes: ${todo.length}`);
      const srcs = todo.map((k) => getPath(en, k));
      const vals = await translateBatch(srcs, locale);
      todo.forEach((k, i) => {
        const out = stripMtArtifacts(vals[i] || "");
        if (!out || out === srcs[i] || isBadLocal(out)) return;
        setPath(data, k, out);
        gained += 1;
      });
    }

    writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
    console.log(`${locale}: gained ${gained}`);
  }
}

await fillGroupSummaries(LOCALES);
await fillPricingAndEchoes(LOCALES);
console.log("done");

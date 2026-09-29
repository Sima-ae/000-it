/**
 * Full-app translation gap fill for ALL locales:
 * - pricing.features.* arrays
 * - pricing starter/growth/enterprise/custom when still English
 * - remaining multi-word English echoes in messages/*.json (ICU-safe)
 * - broken ICU placeholder repair
 *
 *   MT_CONCURRENCY=2 MT_DELAY_MS=280 npx tsx scripts/translate-all-app-gaps.mjs
 *   MT_LOCALES=de,fr,da npx tsx scripts/translate-all-app-gaps.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  translateManyConcurrent,
  stripMtArtifacts,
} from "./lib/translate.mjs";

const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 2);
const DELAY = Number(process.env.MT_DELAY_MS || 280);

const KEEP =
  /^(FAQ|Portfolio|TripleZero( iT)?( Hosting)?|WordPress|WooCommerce|AI|AEO|GEO|SEO|CRM|DNS|DNSSEC|URL|PDF|Pro|Double|Premium|Enterprise|Business|Support|Online|Offline|Home|Login|Dashboard|Hosting|VPS|SSL|ID|OK|API|SMTP|HTTP|HTTPS|NS|TTL|MX|TXT|CNAME|A|AAAA|SRV|CAA|DS|Agent 000|info@000-it\.com|24\/7|Shop|Webmail|Info|Cases|Contact|Account|Name|Type|Status|Plan|Product|Service|Portal|System|Start|Pause|Idle|Admin|Manager|Website|Ads|Branding|Checkout|Generator|Filters|Project|Open|Edit|Save|Full growth|Super admin|webshop|Servers online|AEO, GEO & SEO|Integration|Analytics|Tickets|Leads|Tasks|Newsletter|Cookies|Privacy|Download|Custom|Chatbots|Workflows|Webdesign|Webhosting|E-commerce|Marketing|Social Media|Printing|Graphic Design|Grafisch Design|Digital Design|Digital design|Extra Growth|Force majeure|Pro Support|Premium Support|Double Support|Plan highlights|Live chat|Key tag|Digest type|Bulk sync|Stripe · iDEAL \/ card|tag1, tag2, tag3|WHOIS|iDEAL|Score|Shared Hosting|WordPress Hosting|VPS Hosting|Premium support|24\/7 monitoring|AEO, GEO & SEO basic|AEO, GEO & SEO plus|AEO, GEO & SEO pro)$/i;

const FORCE_PLAN_KEYS = [
  "pricing.starter",
  "pricing.growth",
  "pricing.enterprise",
  "pricing.custom",
];

const FORCE_UI_KEYS = [
  "nav.home",
  "nav.contact",
  "nav.portfolio",
  "nav.webmail",
  "nav.shop",
  "nav.cases",
  "nav.login",
  "nav.dashboard",
  "nav.info",
  "nav.statuspage",
  "faq.title",
  "footer.socialMedia",
  "hero.score",
  "shop.name",
  "shop.vat",
  "contact.name",
  "about.pillarDesignTitle",
  "services.jump.custom",
  "services.jump.social",
  "digitalDesign.title",
];

function isKeep(value) {
  const v = String(value || "").trim();
  if (!v) return true;
  if (v.length <= 2) return true;
  if (KEEP.test(v)) return true;
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
  const m = path.match(/^(.*)\[(\d+)\]$/);
  if (m) {
    const arr = m[1].split(".").reduce((o, k) => o?.[k], obj);
    return Array.isArray(arr) ? arr[Number(m[2])] : undefined;
  }
  return path.split(".").reduce((o, k) => o?.[k], obj);
}

function setPath(obj, path, value) {
  const m = path.match(/^(.*)\[(\d+)\]$/);
  if (m) {
    const parts = m[1].split(".");
    let cur = obj;
    for (const p of parts.slice(0, -1)) {
      if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
      cur = cur[p];
    }
    const last = parts.at(-1);
    if (!Array.isArray(cur[last])) cur[last] = [];
    cur[last][Number(m[2])] = value;
    return;
  }
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== "object") cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts.at(-1)] = value;
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

function protect(text) {
  const ph = [];
  const out = String(text).replace(/\{[^{}]+\}/g, (m) => {
    const token = `[[PH${ph.length}]]`;
    ph.push(m);
    return token;
  });
  return { out, ph };
}

function restore(text, ph) {
  let out = String(text || "");
  ph.forEach((p, i) => {
    out = out.split(`[[PH${i}]]`).join(p);
    out = out.split(`[PH${i}]`).join(p);
    out = out.split(`【PH${i}】`).join(p);
  });
  return out;
}

function enPlaceholders(s) {
  return [...String(s).matchAll(/\{([^{}]+)\}/g)].map((m) => m[1]);
}

async function translateBatch(texts, locale) {
  if (!texts.length) return [];
  return translateManyConcurrent(texts, locale, "en", {
    concurrency: CONCURRENCY,
    delayMs: DELAY,
  });
}

const en = JSON.parse(readFileSync("messages/en.json", "utf8"));
const enLeaves = collectStringLeaves(en);
const only = (process.env.MT_LOCALES || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const locales = readdirSync("messages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .filter((l) => l !== "en")
  .filter((l) => !only.length || only.includes(l))
  .sort();

let totalGained = 0;

for (const locale of locales) {
  const path = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(path, "utf8"));
  let gained = 0;

  // 1) Forced UI + plan names
  {
    const forceKeys = [...FORCE_PLAN_KEYS, ...FORCE_UI_KEYS];
    const todo = forceKeys.filter((k) => {
      const src = getPath(en, k);
      const cur = getPath(data, k);
      return typeof src === "string" && (cur == null || cur === src);
    });
    if (todo.length) {
      const srcs = todo.map((k) => getPath(en, k));
      const protectedSrcs = srcs.map((s) => protect(s));
      const vals = await translateBatch(
        protectedSrcs.map((x) => x.out),
        locale,
      );
      todo.forEach((k, i) => {
        let out = stripMtArtifacts(restore(vals[i] || "", protectedSrcs[i].ph));
        if (!out || out === srcs[i] || isBadLocal(out)) return;
        setPath(data, k, out);
        gained += 1;
      });
    }
  }

  // 2) Pricing feature arrays
  for (const plan of ["starter", "growth", "enterprise"]) {
    const srcArr = getPath(en, `pricing.features.${plan}`);
    const curArr = getPath(data, `pricing.features.${plan}`);
    if (!Array.isArray(srcArr)) continue;
    const next = Array.isArray(curArr) ? [...curArr] : [...srcArr];
    const needIdx = [];
    srcArr.forEach((src, i) => {
      if (typeof src !== "string") return;
      if (KEEP.test(src.trim())) return; // keep tech lines as-is
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

  // 3) Remaining string echoes (ICU-safe)
  const todo = [];
  for (const [k, src] of enLeaves) {
    if (FORCE_PLAN_KEYS.includes(k) || FORCE_UI_KEYS.includes(k)) continue;
    if (isKeep(src)) continue;
    if (src.length < 8 || !/\s/.test(src)) continue;
    const cur = getPath(data, k);
    if (typeof cur !== "string") continue;
    if (cur === src) todo.push(k);
  }
  if (todo.length) {
    console.log(`  ${locale} echoes ${todo.length}`);
    const chunk = 40;
    for (let offset = 0; offset < todo.length; offset += chunk) {
      const slice = todo.slice(offset, offset + chunk);
      const srcs = slice.map((k) => getPath(en, k));
      const protectedSrcs = srcs.map((s) => protect(s));
      const vals = await translateBatch(
        protectedSrcs.map((x) => x.out),
        locale,
      );
      slice.forEach((k, i) => {
        let out = stripMtArtifacts(restore(vals[i] || "", protectedSrcs[i].ph));
        if (!out || out === srcs[i] || isBadLocal(out)) return;
        // Ensure placeholder names match English
        const enPh = enPlaceholders(srcs[i]);
        const outPh = enPlaceholders(out);
        if (enPh.length) {
          if (outPh.length === enPh.length) {
            let idx = 0;
            out = out.replace(/\{[^{}]+\}/g, () => `{${enPh[idx++]}}`);
          } else if (outPh.some((p) => !enPh.includes(p))) {
            return; // skip unsafe
          }
        }
        setPath(data, k, out);
        gained += 1;
      });
      writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
    }
  }

  // 4) Repair any remaining broken ICU vs English
  let icuFixed = 0;
  for (const [k, enVal] of enLeaves) {
    if (typeof enVal !== "string") continue;
    const enPh = enPlaceholders(enVal);
    if (!enPh.length) continue;
    const cur = getPath(data, k);
    if (typeof cur !== "string") continue;
    const curPh = enPlaceholders(cur);
    const enSet = new Set(enPh);
    if (!curPh.some((p) => !enSet.has(p)) && curPh.length === enPh.length) {
      continue;
    }
    if (curPh.length === enPh.length) {
      let i = 0;
      const next = cur.replace(/\{[^{}]+\}/g, () => `{${enPh[i++]}}`);
      if (next !== cur) {
        setPath(data, k, next);
        icuFixed += 1;
      }
    }
  }

  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`${locale}: gained ${gained}, icuFixed ${icuFixed}`);
  totalGained += gained;
}

console.log(`done. totalGained=${totalGained}`);

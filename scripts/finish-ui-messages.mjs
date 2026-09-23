/**
 * Sanitize + complete UI message translations for all locales.
 *
 * - Strip Google Translate `<g>` tags / &#10; / bracketed MT artifacts
 * - Fill missing keys from en.json
 * - Keep tech acronyms (AI/AEO/GEO/SEO) as acronyms
 * - Retranslate English leftovers (exact echoes + known English UI blocks)
 *
 *   MT_CONCURRENCY=2 MT_DELAY_MS=350 npx tsx scripts/finish-ui-messages.mjs
 *   MT_LOCALES=ar,de npx tsx scripts/finish-ui-messages.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { translateManyConcurrent, stripMtArtifacts } from "./lib/translate.mjs";

const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 2);
const DELAY = Number(process.env.MT_DELAY_MS || 350);

const KEEP_AS_IS =
  /^(FAQ|Portfolio|TripleZero iT( Hosting)?|WordPress|WooCommerce|AI|AEO|GEO|SEO|Enterprise|Business|Support|Chatbots|Workflows|Webdesign|Webhosting|E-commerce|Marketing|Social Media|Printing|Graphic Design|Grafisch Design|Digital Design|Digital design|Contact|Account|Home|Login|CRM|Extra Growth|Custom|Score|Name|Collaboration|Newsletter|Cookies|Force majeure|Privacy|Download|Fix Bugs and Errors|Webmail|Dashboard|Agent 000|Pro|Double|Premium|Online|URL|Generator|Super admin|Product|Shared Hosting|WordPress Hosting|VPS Hosting|info@000-it\.com|24\/7|Business Bay, Al Abraj St\.)$/i;

const FORCE_PREFIXES = [
  "agent000.",
  "wordpressSupport.",
  "liveChat.teaser",
  "liveChat.emptyChat",
  "faqPage.browse",
  "faqPage.matched",
];

const ACRONYM_KEYS = new Set([
  "services.jump.ai",
  "services.jump.aeo",
  "services.jump.geo",
  "services.jump.seo",
]);

const ENGLISHISH =
  /\b(Need help|Open the chat|Ask Agent|thinking|Mute voice|Unmute|Book appointment|live chat|knowledge base|Browse all|Matched FAQ|Order Now|No credit card|All-in-One|Daily backups|monitoring & support|Speed optimization|Malware removal|Fix website|Save up to|Virtual FAQ|Sorry —|Please try|Helpful links|Pick the best)\b/i;

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

function sanitizeTree(node) {
  if (typeof node === "string") return stripMtArtifacts(node);
  if (Array.isArray(node)) return node.map(sanitizeTree);
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) node[k] = sanitizeTree(v);
  }
  return node;
}

function needsForce(path, value, enValue) {
  if (typeof value !== "string" || typeof enValue !== "string") return false;
  if (KEEP_AS_IS.test(enValue.trim())) return false;
  if (ACRONYM_KEYS.has(path)) return false;
  if (path.endsWith(".name") && /^(Pro|Double|Premium|Agent 000)$/i.test(value)) return false;
  if (FORCE_PREFIXES.some((p) => path.startsWith(p))) {
    if (value === enValue) return true;
    if (ENGLISHISH.test(value)) return true;
  }
  return false;
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
  .filter((l) => l !== "en")
  .filter((l) => !only.length || only.includes(l));

let totalGained = 0;
let totalFixed = 0;

for (const locale of locales) {
  const p = join("messages", `${locale}.json`);
  const data = sanitizeTree(JSON.parse(readFileSync(p, "utf8")));
  let structural = 0;

  // Fill missing keys from English (will translate next).
  for (const [k, v] of enLeaves) {
    if (getPath(data, k) === undefined) {
      setPath(data, k, v);
      structural += 1;
    }
  }

  // Keep tech acronyms as acronyms (avoid Amnesty International etc.).
  for (const k of ACRONYM_KEYS) {
    const enVal = getPath(en, k);
    if (typeof enVal === "string" && KEEP_AS_IS.test(enVal.trim())) {
      if (getPath(data, k) !== enVal) {
        setPath(data, k, enVal);
        structural += 1;
      }
    }
  }

  const todo = [];
  for (const [k, v] of enLeaves) {
    const cur = getPath(data, k);
    if (typeof cur !== "string") continue;
    if (KEEP_AS_IS.test(v.trim())) continue;
    if (ACRONYM_KEYS.has(k)) continue;
    if (/^TripleZero/i.test(v.trim()) && v.length < 40) continue;
    if (v.includes("@") && v.includes(".")) continue; // emails
    if (/^\d/.test(v) && v.length < 8) continue; // 24/7-like
    if (cur === v && v.length > 2) {
      todo.push(k);
      continue;
    }
    if (needsForce(k, cur, v)) todo.push(k);
  }

  // Unique paths
  const paths = [...new Set(todo)];
  console.log(
    `\n=== ${locale}: sanitize/structure+${structural} translate=${paths.length} ===`,
  );

  if (paths.length) {
    const srcs = paths.map((k) => getPath(en, k));
    const vals = await translateManyConcurrent(srcs, locale, "en", {
      concurrency: CONCURRENCY,
      delayMs: DELAY,
    });
    let gained = 0;
    paths.forEach((k, i) => {
      const src = srcs[i];
      let next = stripMtArtifacts(vals[i] || "");
      if (!next || next === src) return;
      if (isBadLocal(next)) return;
      setPath(data, k, next);
      gained += 1;
    });
    console.log(`  gained ${gained}/${paths.length}`);
    totalGained += gained;
  }

  writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
  totalFixed += structural;
}

function isBadLocal(out) {
  return /amnesty international|منظمة العفو|amnisti[aá]|amnestie international/i.test(out);
}

console.log(`\ndone. structuralFixes=${totalFixed} translated=${totalGained}`);

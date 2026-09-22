/**
 * Force-sync hero.* (and optional key list) from messages/en.json into every locale.
 * NL is left alone (source of truth for Dutch).
 *
 *   MT_CONCURRENCY=2 MT_DELAY_MS=500 node scripts/sync-hero-i18n.mjs
 *   MT_LOCALES=de,fr node scripts/sync-hero-i18n.mjs
 *   MT_KEYS=hero.title,hero.subtitle node scripts/sync-hero-i18n.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { translateManyConcurrent } from "./lib/translate.mjs";

const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 2);
const DELAY = Number(process.env.MT_DELAY_MS || 500);

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

const keyFilter = (process.env.MT_KEYS || "hero.")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const keys = enLeaves
  .map(([k]) => k)
  .filter((k) =>
    keyFilter.some((f) => (f.endsWith(".") ? k.startsWith(f) : k === f || k.startsWith(`${f}.`))),
  );

const only = (process.env.MT_LOCALES || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const locales = readdirSync("messages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .filter((l) => l !== "en" && l !== "nl")
  .filter((l) => !only.length || only.includes(l))
  .sort();

const SKIP_RE =
  /^(Agent 000|TripleZero iT|Score|AEO|GEO|SEO|AI|FAQ|Portfolio|WordPress)$/i;

console.log(`keys=${keys.length} locales=${locales.length}`);
console.log(keys.join("\n"));

const sources = keys.map((k) => getPath(en, k));

for (const locale of locales) {
  const p = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(p, "utf8"));
  console.log(`\n=== ${locale} ===`);
  const vals = await translateManyConcurrent(sources, locale, "en", {
    concurrency: CONCURRENCY,
    delayMs: DELAY,
  });
  let updated = 0;
  keys.forEach((k, i) => {
    const src = sources[i];
    let next = vals[i];
    if (!next || typeof next !== "string") next = src;
    if (SKIP_RE.test(String(src).trim())) next = src;
    // Preserve brand tokens
    if (src.includes("Agent 000") && !next.includes("Agent 000")) {
      next = next.replace(/Agent\s*0{1,3}/gi, "Agent 000");
      if (!next.includes("Agent 000")) next = `${next} — Agent 000`;
    }
    if (src.includes("TripleZero iT") && !next.includes("TripleZero iT")) {
      next = next.replace(/TripleZero(\s*iT)?/gi, "TripleZero iT");
    }
    if (getPath(data, k) !== next) {
      setPath(data, k, next);
      updated++;
    }
  });
  writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`saved ${locale} updated=${updated}/${keys.length}`);
}

console.log("\ndone hero sync");

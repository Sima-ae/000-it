/**
 * Restore markdown links in FAQ locale packs from the EN source by item id.
 * If a translated answer is missing an EN href, append the EN markdown link.
 * Also strips leftover protect tokens.
 *
 * Usage: node scripts/repair-faq-markdown-links.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "src/content/faq-i18n");
const EN = JSON.parse(readFileSync(join(DIR, "en.json"), "utf8"));
const MD_LINK_RE = /\[([^\]]+)\]\((\/[^)\s]+|https?:\/\/[^)\s]+)\)/g;

function linksOf(text) {
  const out = [];
  MD_LINK_RE.lastIndex = 0;
  let m;
  while ((m = MD_LINK_RE.exec(String(text || ""))) !== null) {
    out.push({ label: m[1], href: m[2], raw: m[0] });
  }
  return out;
}

function stripJunk(text) {
  return String(text || "")
    .replace(/⟦L\d+⟧/g, "")
    .replace(/\[\[L\d+\]\]/g, "")
    .replace(/【L\d+】/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([·.])/g, " $1")
    .trim();
}

function enIndex() {
  /** @type {Map<string, {question:string,answer:string}>} */
  const map = new Map();
  for (const c of EN.categories) {
    for (const i of c.items) map.set(`${c.id}::${i.id}`, i);
  }
  return map;
}

const byKey = enIndex();
const files = readdirSync(DIR).filter(
  (f) => f.endsWith(".json") && f !== "en.json" && f !== "nl.json",
);

let fixedFiles = 0;
let fixedItems = 0;

for (const file of files) {
  const path = join(DIR, file);
  const pack = JSON.parse(readFileSync(path, "utf8"));
  let changed = false;

  for (const cat of pack.categories) {
    for (const item of cat.items) {
      const enItem = byKey.get(`${cat.id}::${item.id}`);
      if (!enItem) continue;
      const enLinks = linksOf(enItem.answer);
      if (!enLinks.length) {
        const cleaned = stripJunk(item.answer);
        if (cleaned !== item.answer) {
          item.answer = cleaned;
          changed = true;
        }
        continue;
      }

      let answer = stripJunk(item.answer);
      const have = new Set(linksOf(answer).map((l) => l.href));
      const missing = enLinks.filter((l) => !have.has(l.href));
      if (missing.length) {
        // Remove trailing "Meer lezen"/"Read more" fragments without links
        answer = answer
          .replace(/\s*(Meer lezen|Read more|Weiterlesen|Lire la suite)\s*[:：]?\s*$/i, "")
          .trim();
        const suffix = missing.map((l) => l.raw).join(" · ");
        answer = `${answer}${answer.endsWith(".") || answer.endsWith("。") ? "" : "."} ${suffix}`;
        item.answer = answer;
        changed = true;
        fixedItems += 1;
      } else if (answer !== item.answer) {
        item.answer = answer;
        changed = true;
      }
    }
  }

  if (changed) {
    writeFileSync(path, `${JSON.stringify(pack, null, 2)}\n`);
    fixedFiles += 1;
  }
}

function countLinks(pack) {
  let n = 0;
  for (const c of pack.categories) {
    for (const i of c.items) {
      const m = String(i.answer).match(MD_LINK_RE);
      if (m) n += m.length;
    }
  }
  return n;
}

console.log(`Repaired items=${fixedItems} files=${fixedFiles}`);
console.log("EN links=", countLinks(EN));
for (const file of ["de.json", "fr.json", "cnr.json", "ja.json", "ar.json", "bn.json"]) {
  const p = join(DIR, file);
  try {
    const pack = JSON.parse(readFileSync(p, "utf8"));
    console.log(file, "links=", countLinks(pack), "cats=", pack.categories.map((c) => c.id).join(","));
  } catch {
    console.log(file, "missing");
  }
}

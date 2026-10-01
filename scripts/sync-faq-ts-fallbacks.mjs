/**
 * Sync faq.ts nl/en fallbacks from faq-i18n JSON packs.
 * Keeps getFaqContent types + hostingOnly filter; replaces inline nl/en bodies.
 *
 * Usage: node scripts/sync-faq-ts-fallbacks.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const nl = JSON.parse(readFileSync(join(root, "src/content/faq-i18n/nl.json"), "utf8"));
const en = JSON.parse(readFileSync(join(root, "src/content/faq-i18n/en.json"), "utf8"));
const faqPath = join(root, "src/content/faq.ts");
const src = readFileSync(faqPath, "utf8");

function esc(s) {
  return JSON.stringify(s);
}

function emitPack(varName, pack) {
  const lines = [];
  lines.push(`const ${varName}: FaqContent = {`);
  lines.push(`  title: ${esc(pack.title)},`);
  lines.push(`  subtitle: ${esc(pack.subtitle)},`);
  lines.push(`  ctaTitle: ${esc(pack.ctaTitle)},`);
  lines.push(`  ctaText: ${esc(pack.ctaText)},`);
  lines.push(`  ctaButton: ${esc(pack.ctaButton)},`);
  lines.push(`  categories: [`);
  for (const cat of pack.categories) {
    lines.push(`    {`);
    lines.push(`      id: ${esc(cat.id)},`);
    lines.push(`      title: ${esc(cat.title)},`);
    lines.push(`      items: [`);
    for (const item of cat.items) {
      lines.push(
        `        q(${esc(item.id)}, ${esc(item.question)}, ${esc(item.answer)}),`,
      );
    }
    lines.push(`      ],`);
    lines.push(`    },`);
  }
  lines.push(`  ],`);
  lines.push(`};`);
  return lines.join("\n");
}

const start = src.indexOf("const nl: FaqContent = {");
const mid = src.indexOf("\nconst en: FaqContent = {");
const end = src.indexOf("\nexport function getFaqContent");
if (start < 0 || mid < 0 || end < 0) {
  throw new Error("Could not locate nl/en FaqContent blocks in faq.ts");
}

const head = src.slice(0, start);
const tail = src.slice(end);
const next =
  head +
  emitPack("nl", nl) +
  "\n\n" +
  emitPack("en", en) +
  "\n" +
  tail;

writeFileSync(faqPath, next);
const n = nl.categories.reduce((s, c) => s + c.items.length, 0);
const e = en.categories.reduce((s, c) => s + c.items.length, 0);
console.log(`synced faq.ts fallbacks nl=${n} en=${e}`);

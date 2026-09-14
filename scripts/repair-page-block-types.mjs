/**
 * Repair page-i18n packs where MT translated structural block.type values.
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = "src/content/fixweb/page-i18n-pack.json";
const pack = JSON.parse(readFileSync(path, "utf8"));

function normalizeType(type, block) {
  if (Array.isArray(block?.items)) return "list";
  if (typeof type !== "string") {
    return typeof block?.text === "string" ? "paragraph" : type;
  }
  const t = type.toLowerCase().normalize("NFKD");

  if (
    t === "list" ||
    t.startsWith("list") ||
    ["seznam", "zoznam", "popis", "siyahi", "siyahı"].some((x) => t.includes(x))
  ) {
    return "list";
  }

  // heading-like
  if (
    t === "heading" ||
    t.includes("heading") ||
    t.includes("titel") ||
    t.includes("title") ||
    t.includes("header") ||
    t.includes("rubrik") ||
    t.includes("rubrica") ||
    t.includes("naslov") ||
    t.includes("nadpis") ||
    t.includes("naglowek") ||
    t.includes("nagłówek") ||
    t.includes("overskrift") ||
    t.includes("otsikko") ||
    t.includes("baslik") ||
    t.includes("başlık") ||
    t.includes("başliq") ||
    t.includes("antrašt") ||
    t.includes("encabez") ||
    t.includes("cabeçalho") ||
    t.includes("cabecalho") ||
    t.includes("intestazione") ||
    t.includes("überschrift") ||
    t.includes("uberschrift") ||
    t.includes("titre") ||
    t.includes("título") ||
    t.includes("titulo") ||
    t.includes("заглав") ||
    t.includes("наслов") ||
    t.includes("επικεφαλ") ||
    t.includes("عنوان") ||
    t.includes("כותרת") ||
    t.includes("כּוֹתֶרֶת") ||
    t.includes("სათაური") ||
    t.includes("վերնագիր") ||
    t.includes("見出し") ||
    t.includes("标题") ||
    t.includes("cím") ||
    t.includes("cim") ||
    t.includes("drejtim") ||
    t === "záhlaví" ||
    t === "zahalvi"
  ) {
    return "heading";
  }

  if (
    t === "paragraph" ||
    t.includes("paragraph") ||
    t.includes("paragraf") ||
    t.includes("paragrafo") ||
    t.includes("parágrafo") ||
    t.includes("paragrafo") ||
    t.includes("absatz") ||
    t.includes("afsnit") ||
    t.includes("avsnitt") ||
    t.includes("stycke") ||
    t.includes("odstavec") ||
    t.includes("odsek") ||
    t.includes("bekezd") ||
    t.includes("pastraip") ||
    t.includes("ustęp") ||
    t.includes("kohta") ||
    t.includes("абзац") ||
    t.includes("параграф") ||
    t.includes("пункт") ||
    t.includes("став") ||
    t.includes("παράγραφ") ||
    t.includes("סָעִיף") ||
    t.includes("فقرة") ||
    t.includes("აბზაცი") ||
    t.includes("պարբերություն") ||
    t.includes("paraqraf") ||
    t.includes("段落")
  ) {
    return "paragraph";
  }

  // Fallback: text-only blocks are paragraphs
  if (typeof block?.text === "string") return "paragraph";
  return type;
}

let total = 0;
const remaining = new Set();
for (const locale of Object.keys(pack)) {
  if (locale === "en" || locale === "nl") continue;
  for (const slug of Object.keys(pack[locale] || {})) {
    const entry = pack[locale][slug];
    if (!Array.isArray(entry?.blocks)) continue;
    let fixed = 0;
    entry.blocks = entry.blocks.map((b) => {
      if (!b || typeof b !== "object") return b;
      const nextType = normalizeType(b.type, b);
      if (nextType !== b.type) fixed++;
      if (!["heading", "paragraph", "list"].includes(nextType)) {
        remaining.add(`${locale}:${nextType}`);
      }
      return { ...b, type: nextType };
    });
    if (fixed) {
      total += fixed;
      console.log(`${locale}/${slug}: fixed ${fixed}`);
    }
  }
}

writeFileSync(path, `${JSON.stringify(pack, null, 2)}\n`);
console.log(`done, fixed ${total}`);
if (remaining.size) console.log("still unknown", [...remaining].slice(0, 30));
else console.log("all types normalized");

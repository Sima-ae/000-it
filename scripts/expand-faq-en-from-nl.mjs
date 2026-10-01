/**
 * Build en.json from expanded nl.json using scripts/lib/translate.mjs.
 * Protects markdown links [label](href) during MT.
 *
 * Usage: node scripts/expand-faq-en-from-nl.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { translateText } from "./lib/translate.mjs";

const DIR = join(process.cwd(), "src/content/faq-i18n");
const NL = JSON.parse(readFileSync(join(DIR, "nl.json"), "utf8"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CAT_ID = {
  algemeen: "general",
  adverteren: "advertising",
};

function mapItemId(nlCatId, nlItemId) {
  if (nlCatId === "algemeen" && nlItemId.startsWith("alg-")) {
    return nlItemId.replace(/^alg-/, "gen-");
  }
  return nlItemId;
}

function protectLinks(text) {
  const links = [];
  const protectedText = text.replace(
    /\[([^\]]+)\]\((\/[^)\s]+|https?:\/\/[^)\s]+)\)/g,
    (_, label, href) => {
      const i = links.length;
      links.push({ label, href });
      return `⟦L${i}⟧${label}⟦/L${i}⟧`;
    },
  );
  return { protectedText, links };
}

function restoreLinks(text, links) {
  let out = text;
  for (let i = 0; i < links.length; i++) {
    const re = new RegExp(`⟦\\s*L\\s*${i}\\s*⟧([\\s\\S]*?)⟦\\s*/\\s*L\\s*${i}\\s*⟧`, "gi");
    out = out.replace(re, (_, label) => {
      const clean = String(label).replace(/\s+/g, " ").trim() || links[i].label;
      return `[${clean}](${links[i].href})`;
    });
    out = out.replace(new RegExp(`⟦\\s*L\\s*${i}\\s*⟧`, "gi"), `[${links[i].label}](${links[i].href})`);
    out = out.replace(new RegExp(`⟦\\s*/\\s*L\\s*${i}\\s*⟧`, "gi"), "");
  }
  for (const link of links) {
    if (!out.includes(`](${link.href})`)) {
      out = `${out.trim()} [${link.label}](${link.href})`;
    }
  }
  return out
    .replace(/Triplezero It/gi, "TripleZero iT")
    .replace(/Triplezero IT/gi, "TripleZero iT")
    .replace(/Triple Zero iT/gi, "TripleZero iT");
}

async function tr(text) {
  if (!text?.trim()) return text;
  const { protectedText, links } = protectLinks(text);
  try {
    const translated = await translateText(protectedText, "en", "nl");
    return restoreLinks(translated || protectedText, links);
  } catch (e) {
    console.warn("translate fail:", String(e).slice(0, 140));
    return text;
  }
}

const titleMap = {
  general: "General",
  ai: "AI",
  "aeo-geo-seo": "AEO, GEO and SEO",
  advertising: "Advertising",
  design: "Design",
  marketing: "Marketing",
  "social-media": "Social Media",
  "account-portaal": "Account and portal",
  "shop-bestellen": "Shop and ordering",
  support: "Support",
  webdesign: "Web design",
  webhosting: "Web hosting and domains",
};

async function buildEn() {
  const out = {
    title: "Frequently asked questions",
    subtitle:
      "Questions and answers — from AI, AEO, GEO and SEO to design, domains, hosting, account, shop, marketing and support. With links to the knowledge base.",
    ctaTitle: "Still need help?",
    ctaText:
      "Can't find your question? Contact us — we'll get back to you as soon as possible.",
    ctaButton: "Contact us",
    categories: [],
  };

  for (const srcCat of NL.categories) {
    const enCatId = CAT_ID[srcCat.id] || srcCat.id;
    const title = titleMap[enCatId] || (await tr(srcCat.title));
    const items = [];
    for (const src of srcCat.items) {
      const id = mapItemId(srcCat.id, src.id);
      const question = await tr(src.question);
      await sleep(40);
      const answer = await tr(src.answer);
      await sleep(40);
      items.push({ id, question, answer });
      process.stdout.write(".");
    }
    out.categories.push({ id: enCatId, title, items });
    console.log(`\n[en] ${enCatId} (${items.length})`);
    // Checkpoint after each category
    writeFileSync(join(DIR, "en.json"), `${JSON.stringify(out, null, 2)}\n`);
  }

  return out;
}

const EN = await buildEn();
const total = EN.categories.reduce((s, c) => s + c.items.length, 0);
console.log(`\nwrote en.json total=${total}`);

/**
 * Translate wordpress-maintenance-updates custom service body + catalog summary
 * for all MT locales after the Business/Business pro/Enterprise rewrite.
 *
 *   node --env-file=.env scripts/translate-maintenance-updates-i18n.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { ALL_TARGET_LOCALES, translateManyConcurrent } from "./lib/translate.mjs";

const SLUG = "wordpress-maintenance-updates";
const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 4);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hashSource(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function loadEnSource() {
  // Authoritative EN fields from custom.ts (kept in sync manually with that file).
  return {
    title: "Maintenance & Updates",
    subtitle:
      "Keep your WordPress site healthy with scheduled core, plugin and theme updates, backups and proactive monitoring — in fixed Business, Business pro and Enterprise packages.",
    blocks: [
      { type: "heading", text: "Why maintenance matters" },
      {
        type: "paragraph",
        text: "Outdated plugins and themes are the #1 cause of WordPress hacks, broken checkouts and sudden downtime. Professional maintenance keeps your site secure, fast and compatible — without you having to live in wp-admin.",
      },
      { type: "heading", text: "Packages that match your site" },
      {
        type: "paragraph",
        text: "Maintenance and updates are delivered through the same monthly care packages as WordPress care. Choose the tier that fits how complex your site is — then we handle the update rhythm, backups and monitoring.",
      },
      {
        type: "list",
        items: [
          "Business — standard WordPress site: core/plugin/theme updates, speed care and optional green high-speed hosting. No complex plugins, webshop, multilingual or multisite.",
          "Business pro — professional WordPress site: everything in Business, plus support for 1–2 complex plugins, multisite and multilingual. Optional OTAP pipeline for safer releases.",
          "Enterprise — complex WordPress site: 2+ complex plugins, webshop-ready care, quarterly service review and OTAP pipeline included.",
        ],
      },
      { type: "heading", text: "What's included in every package" },
      {
        type: "list",
        items: [
          "WordPress core updates (tested before go-live)",
          "Plugin and theme updates with conflict checks",
          "Pre-update backup of files and database",
          "Uptime monitoring and alert response",
          "Security scan after each update cycle",
          "Monthly health report with actions taken",
          "Optimized speed as part of ongoing care",
          "Rollback plan if an update causes issues",
        ],
      },
      { type: "heading", text: "How we work" },
      {
        type: "paragraph",
        text: "We follow a calm, repeatable cadence: backup → update on staging or a low-traffic window → smoke test (forms, checkout, login) → go-live → report. On Business pro and Enterprise we can use an OTAP pipeline so changes move safely from development to production.",
      },
      { type: "heading", text: "Ideal for" },
      {
        type: "list",
        items: [
          "Standard brochure or company sites (Business)",
          "Professional sites with a few complex plugins, multilingual or multisite (Business pro)",
          "Complex platforms, WooCommerce shops and OTAP workflows (Enterprise)",
          "Teams without an in-house WordPress developer",
          "Agencies that want reliable retainership for clients",
        ],
      },
      { type: "heading", text: "With or without hosting" },
      {
        type: "paragraph",
        text: "Every package is available with green high-speed hosting or without hosting if you already host elsewhere. Toggle the option above the columns to see both prices; VAT is included.",
      },
      { type: "heading", text: "Get started" },
      {
        type: "paragraph",
        text: "Pick Business, Business pro or Enterprise above, or tell us how complex your site is (plugins, shop, multilingual, multisite). We'll confirm the right package and take updates off your plate.",
      },
    ],
  };
}

async function translateBlocks(blocks, locale) {
  const out = [];
  for (const block of blocks) {
    if (block.type === "heading" || block.type === "paragraph") {
      const [text] = await translateManyConcurrent([block.text], locale, "en", {
        concurrency: 1,
      });
      out.push({ type: block.type, text: text || block.text });
      await sleep(80);
      continue;
    }
    if (block.type === "list") {
      const items = await translateManyConcurrent(block.items, locale, "en", {
        concurrency: CONCURRENCY,
      });
      out.push({
        type: "list",
        items: items.map((t, i) => t || block.items[i]),
      });
      await sleep(120);
      continue;
    }
    out.push(block);
  }
  return out;
}

const source = loadEnSource();
const sourceHash = hashSource(source);
const prisma = new PrismaClient();
const locales = ALL_TARGET_LOCALES.filter((l) => l !== "en" && l !== "nl");

let written = 0;
let failed = 0;

for (const locale of locales) {
  try {
    console.log(`custom_service ${SLUG} → ${locale}`);
    const [title] = await translateManyConcurrent([source.title], locale, "en", {
      concurrency: 1,
    });
    await sleep(60);
    const [subtitle] = await translateManyConcurrent(
      [source.subtitle],
      locale,
      "en",
      { concurrency: 1 },
    );
    await sleep(80);
    const blocks = await translateBlocks(source.blocks, locale);
    const payload = {
      title: title || source.title,
      subtitle: subtitle || source.subtitle,
      blocks,
    };
    await prisma.localizedCopy.upsert({
      where: {
        kind_itemKey_locale: {
          kind: "custom_service",
          itemKey: SLUG,
          locale,
        },
      },
      create: {
        kind: "custom_service",
        itemKey: SLUG,
        locale,
        sourceHash,
        payload,
      },
      update: {
        sourceHash,
        payload,
      },
    });
    written += 1;
    console.log(`  ok ${locale}: ${payload.title}`);
  } catch (error) {
    failed += 1;
    console.error(`  fail ${locale}:`, error?.message || error);
  }
}

// Refresh catalog-i18n summary for this slug across locales
const catalogPath = "src/content/fixweb/catalog-i18n.json";
const pack = JSON.parse(readFileSync(catalogPath, "utf8"));
const enSummary =
  pack.summaries?.en?.[SLUG] ||
  "Scheduled WordPress core, plugin and theme updates with backups and monitoring — in Business, Business pro and Enterprise packages.";

for (const locale of locales) {
  try {
    const [summary] = await translateManyConcurrent([enSummary], locale, "en", {
      concurrency: 1,
    });
    pack.summaries[locale] = pack.summaries[locale] || {};
    if (summary && summary !== enSummary) {
      pack.summaries[locale][SLUG] = summary;
      console.log(`summary ${locale}: ${summary.slice(0, 80)}…`);
    }
    // Also fix service title if it still looks like English garbage
    const currentTitle = pack.services?.[locale]?.[SLUG];
    if (
      currentTitle &&
      (/Free maintenance/i.test(currentTitle) ||
        currentTitle === "Maintenance & Updates")
    ) {
      const [title] = await translateManyConcurrent(
        ["Maintenance & Updates"],
        locale,
        "en",
        { concurrency: 1 },
      );
      if (title && title !== "Maintenance & Updates") {
        pack.services[locale][SLUG] = title;
        console.log(`title ${locale}: ${title}`);
      }
    }
    await sleep(60);
  } catch (error) {
    failed += 1;
    console.error(`summary fail ${locale}:`, error?.message || error);
  }
}

writeFileSync(catalogPath, `${JSON.stringify(pack, null, 2)}\n`);
await prisma.$disconnect();
console.log(JSON.stringify({ written, failed, locales: locales.length }, null, 2));
if (failed && !written) process.exit(1);

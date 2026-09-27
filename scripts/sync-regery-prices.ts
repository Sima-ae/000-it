/**
 * Sync Regery public prices into Manual TLDs only.
 *
 *   npx tsx scripts/sync-regery-prices.ts
 *   npx tsx scripts/sync-regery-prices.ts --from-file
 *
 * --from-file uses prisma/data/regery-tld-prices.json (offline / fallback).
 * Live fetch is preferred so weekly cron stays up to date.
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { prisma } from "../src/lib/prisma";
import { syncDomainPricesFromRegery } from "../src/lib/domains/sync-regery-prices";
import type { RegeryPriceRow } from "../src/lib/domains/regery";

function loadFromFile(): RegeryPriceRow[] {
  const path = resolve(process.cwd(), "prisma/data/regery-tld-prices.json");
  const rows = JSON.parse(readFileSync(path, "utf8")) as Array<{
    tld: string;
    registerCents: number;
    renewCents: number;
    transferCents?: number;
    restoreCents?: number;
  }>;
  return rows.map((r) => ({
    tld: String(r.tld || "")
      .toLowerCase()
      .replace(/^\./, ""),
    registerCents: Math.max(0, Math.round(r.registerCents || 0)),
    renewCents: Math.max(0, Math.round(r.renewCents || 0)),
    transferCents: Math.max(0, Math.round(r.transferCents || 0)),
    restoreCents: Math.max(0, Math.round(r.restoreCents || 0)),
  }));
}

async function main() {
  const fromFile = process.argv.includes("--from-file");
  const result = fromFile
    ? await syncDomainPricesFromRegery(loadFromFile())
    : await syncDomainPricesFromRegery();

  const manual = await prisma.domainProduct.count({
    where: { manualPricing: true },
  });
  const sync = await prisma.domainProduct.count({
    where: { manualPricing: false },
  });

  console.log(JSON.stringify({ ...result, fromFile, manual, sync }, null, 2));
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

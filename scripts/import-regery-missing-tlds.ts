/**
 * @deprecated Prefer: npx tsx scripts/sync-regery-prices.ts
 *
 * Kept as a thin wrapper so older docs/commands still work.
 * Always Regery → Manual only (never touches Namecheap Sync rows).
 */
import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { readFileSync } from "fs";
import { resolve } from "path";
import { prisma } from "../src/lib/prisma";
import { syncDomainPricesFromRegery } from "../src/lib/domains/sync-regery-prices";
import type { RegeryPriceRow } from "../src/lib/domains/regery";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const path = resolve(process.cwd(), "prisma/data/regery-tld-prices.json");
  const rows = JSON.parse(readFileSync(path, "utf8")) as RegeryPriceRow[];

  if (dryRun) {
    const existing = await prisma.domainProduct.findMany({
      select: { tld: true, manualPricing: true },
    });
    const byTld = new Map(existing.map((r) => [r.tld.toLowerCase(), r]));
    let wouldCreate = 0;
    let wouldUpdate = 0;
    let skippedNamecheapOwned = 0;
    for (const row of rows) {
      const have = byTld.get(String(row.tld || "").toLowerCase());
      if (have && !have.manualPricing) {
        skippedNamecheapOwned += 1;
        continue;
      }
      if (!have) wouldCreate += 1;
      else wouldUpdate += 1;
    }
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          fetched: rows.length,
          wouldCreate,
          wouldUpdate,
          skippedNamecheapOwned,
          note: "Use scripts/sync-regery-prices.ts for live weekly sync",
        },
        null,
        2,
      ),
    );
    await prisma.$disconnect();
    return;
  }

  const result = await syncDomainPricesFromRegery(rows);
  console.log(JSON.stringify(result, null, 2));
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

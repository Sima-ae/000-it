import { readFileSync } from "fs";
import { resolve } from "path";
import { prisma } from "@/lib/prisma";
import { markupPercentForBuyPriceCents } from "@/lib/domains/pricing";
import {
  fetchRegeryDomainPrices,
  type RegeryPriceRow,
} from "@/lib/domains/regery";

/**
 * Sync Regery prices into DomainProduct.
 *
 * HARD RULES:
 * - Only create/update rows with manualPricing=true (Regery / manual catalog).
 * - Never write Regery prices onto Namecheap-synced rows (manualPricing=false).
 * - Sell margin stays the same buy-price % tiers.
 */
export type SyncRegeryPricesResult = {
  ok: true;
  source: "regery";
  fetched: number;
  created: number;
  updated: number;
  unchanged: number;
  skippedNamecheapOwned: number;
  skippedInvalid: number;
  usedFileFallback: boolean;
};

function centsEqual(a: number, b: number) {
  return Math.round(a) === Math.round(b);
}

function loadRegeryFileFallback(): RegeryPriceRow[] {
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

export async function syncDomainPricesFromRegery(
  rows?: RegeryPriceRow[],
): Promise<SyncRegeryPricesResult> {
  let usedFileFallback = false;
  let catalog = rows;
  if (!catalog) {
    try {
      catalog = await fetchRegeryDomainPrices();
    } catch (error) {
      console.warn(
        "[domains/sync-regery] live fetch failed, using file fallback",
        error,
      );
      catalog = loadRegeryFileFallback();
      usedFileFallback = true;
      if (catalog.length < 100) {
        throw error instanceof Error
          ? error
          : new Error("REGERY_PRICES_FETCH_FAILED");
      }
    }
  }

  const existing = await prisma.domainProduct.findMany({
    select: {
      tld: true,
      manualPricing: true,
      basePriceInCents: true,
      renewBasePriceInCents: true,
      transferBasePriceInCents: true,
      restoreBasePriceInCents: true,
    },
  });
  const byTld = new Map(existing.map((r) => [r.tld.toLowerCase(), r]));

  let created = 0;
  let updated = 0;
  let unchanged = 0;
  let skippedNamecheapOwned = 0;
  let skippedInvalid = 0;

  for (const row of catalog) {
    const tld = row.tld.toLowerCase();
    const have = byTld.get(tld);

    if (have && !have.manualPricing) {
      // Namecheap (or other non-manual) owns this TLD — never overwrite.
      skippedNamecheapOwned += 1;
      continue;
    }

    const basePriceInCents = row.registerCents;
    if (basePriceInCents <= 0) {
      skippedInvalid += 1;
      continue;
    }
    const renewBasePriceInCents =
      row.renewCents > 0 ? row.renewCents : basePriceInCents;
    const transferBasePriceInCents = Math.max(0, row.transferCents);
    const restoreBasePriceInCents = Math.max(0, row.restoreCents);
    const markupPercent = markupPercentForBuyPriceCents(basePriceInCents);

    if (!have) {
      await prisma.domainProduct.create({
        data: {
          tld,
          basePriceInCents,
          renewBasePriceInCents,
          transferBasePriceInCents,
          restoreBasePriceInCents,
          markupFixedCents: 0,
          markupPercent,
          manualPricing: true,
          isActive: true,
        },
      });
      created += 1;
      byTld.set(tld, {
        tld,
        manualPricing: true,
        basePriceInCents,
        renewBasePriceInCents,
        transferBasePriceInCents,
        restoreBasePriceInCents,
      });
      continue;
    }

    if (
      centsEqual(have.basePriceInCents, basePriceInCents) &&
      centsEqual(have.renewBasePriceInCents, renewBasePriceInCents) &&
      centsEqual(have.transferBasePriceInCents, transferBasePriceInCents) &&
      centsEqual(have.restoreBasePriceInCents, restoreBasePriceInCents)
    ) {
      unchanged += 1;
      continue;
    }

    await prisma.domainProduct.update({
      where: { tld },
      data: {
        basePriceInCents,
        renewBasePriceInCents,
        transferBasePriceInCents,
        restoreBasePriceInCents,
        markupFixedCents: 0,
        markupPercent,
        manualPricing: true,
      },
    });
    updated += 1;
  }

  return {
    ok: true,
    source: "regery",
    fetched: catalog.length,
    created,
    updated,
    unchanged,
    skippedNamecheapOwned,
    skippedInvalid,
    usedFileFallback,
  };
}

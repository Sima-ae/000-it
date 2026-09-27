import { prisma } from "@/lib/prisma";
import {
  getDomainPricingCatalog,
  isNamecheapConfigured,
  namecheapMissingEnv,
} from "@/lib/domains/namecheap";
import { markupPercentForBuyPriceCents } from "@/lib/domains/pricing";

/** Fixed markup is always €0 — sell margin is tiered % of buy price. */
const DEFAULT_MARKUP_FIXED_CENTS = 0;

/** Seeded / curated TLDs (kept for reference / reports). */
export const CORE_DOMAIN_TLDS = [
  "nl",
  "com",
  "eu",
  "be",
  "net",
  "org",
  "io",
  "app",
  "dev",
  "online",
] as const;

async function usdToEurRate(): Promise<number> {
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=EUR",
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error(`FX HTTP ${res.status}`);
    const data = (await res.json()) as { rates?: { EUR?: number } };
    if (data.rates?.EUR) return data.rates.EUR;
  } catch (error) {
    console.warn("[domains/sync-prices] FX fallback", error);
  }
  return 0.92;
}

function isValidTldName(tld: string): boolean {
  return (
    tld.length >= 2 &&
    tld.length <= 63 &&
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/.test(
      tld,
    )
  );
}

function usdToEurCents(usd: number, rate: number): number {
  return Math.max(1, Math.round(usd * rate * 100));
}

function mapUsdByTld(
  rows: { tld: string; priceUsd: number }[],
): Map<string, number> {
  return new Map(rows.map((row) => [row.tld, row.priceUsd] as const));
}

export type SyncDomainPricesResult = {
  ok: true;
  source: "namecheap";
  updated: number;
  created: number;
  renewUpdated: number;
  transferUpdated: number;
  restoreUpdated: number;
  skipped: number;
  skippedManualOwned: number;
  exchangeRateUsed: number;
  pricedTlds: number;
  renewPricedTlds: number;
  transferPricedTlds: number;
  restorePricedTlds: number;
  categoryNames: string[];
};

export async function syncDomainPricesFromNamecheap(): Promise<
  SyncDomainPricesResult
> {
  if (!isNamecheapConfigured()) {
    const missing = namecheapMissingEnv();
    throw new Error(
      missing.length
        ? `NAMECHEAP_NOT_CONFIGURED — missing ${missing.join(", ")}. Restart the app after updating .env`
        : "NAMECHEAP_NOT_CONFIGURED — restart the app after updating .env",
    );
  }

  const rate = await usdToEurRate();
  const catalog = await getDomainPricingCatalog();
  const renewByTld = mapUsdByTld(catalog.renew);
  const transferByTld = mapUsdByTld(catalog.transfer);
  const restoreByTld = mapUsdByTld(catalog.reactivate);

  let updated = 0;
  let created = 0;
  let renewUpdated = 0;
  let transferUpdated = 0;
  let restoreUpdated = 0;
  let skipped = 0;
  let skippedManualOwned = 0;

  for (const row of catalog.register) {
    if (!isValidTldName(row.tld)) {
      skipped += 1;
      continue;
    }

    const basePriceInCents = usdToEurCents(row.priceUsd, rate);
    const renewUsd = renewByTld.get(row.tld);
    const renewBasePriceInCents =
      renewUsd != null && renewUsd > 0
        ? usdToEurCents(renewUsd, rate)
        : basePriceInCents;
    // Strict Namecheap-only: missing transfer/restore → 0 (never keep a Regery fill).
    const transferUsd = transferByTld.get(row.tld);
    const transferBasePriceInCents =
      transferUsd != null && transferUsd > 0
        ? usdToEurCents(transferUsd, rate)
        : 0;
    const restoreUsd = restoreByTld.get(row.tld);
    const restoreBasePriceInCents =
      restoreUsd != null && restoreUsd > 0
        ? usdToEurCents(restoreUsd, rate)
        : 0;

    const existing = await prisma.domainProduct.findUnique({
      where: { tld: row.tld },
    });

    if (!existing) {
      await prisma.domainProduct.create({
        data: {
          tld: row.tld,
          basePriceInCents,
          renewBasePriceInCents,
          transferBasePriceInCents,
          restoreBasePriceInCents,
          markupFixedCents: DEFAULT_MARKUP_FIXED_CENTS,
          markupPercent: markupPercentForBuyPriceCents(basePriceInCents),
          manualPricing: false,
          isActive: true,
        },
      });
      created += 1;
      renewUpdated += 1;
      if (transferBasePriceInCents > 0) transferUpdated += 1;
      if (restoreBasePriceInCents > 0) restoreUpdated += 1;
      continue;
    }

    // Regery / manual catalog owns this TLD — never overwrite with Namecheap.
    if (existing.manualPricing) {
      skippedManualOwned += 1;
      continue;
    }

    await prisma.domainProduct.update({
      where: { tld: row.tld },
      data: {
        basePriceInCents,
        renewBasePriceInCents,
        transferBasePriceInCents,
        restoreBasePriceInCents,
        markupFixedCents: DEFAULT_MARKUP_FIXED_CENTS,
        markupPercent: markupPercentForBuyPriceCents(basePriceInCents),
        manualPricing: false,
      },
    });
    updated += 1;
    renewUpdated += 1;
    if (transferBasePriceInCents > 0) transferUpdated += 1;
    if (restoreBasePriceInCents > 0) restoreUpdated += 1;
  }

  // Side channels: TLDs only present in renew / transfer / reactivate feeds.
  // Still never touch manual (Regery) rows.
  async function patchPriceOnly(
    tld: string,
    data: {
      renewBasePriceInCents?: number;
      transferBasePriceInCents?: number;
      restoreBasePriceInCents?: number;
    },
  ) {
    if (!isValidTldName(tld)) return false;
    const existing = await prisma.domainProduct.findUnique({ where: { tld } });
    if (!existing || existing.manualPricing) return false;
    await prisma.domainProduct.update({ where: { tld }, data });
    return true;
  }

  for (const row of catalog.renew) {
    if (catalog.register.some((r) => r.tld === row.tld)) continue;
    const ok = await patchPriceOnly(row.tld, {
      renewBasePriceInCents: usdToEurCents(row.priceUsd, rate),
    });
    if (ok) renewUpdated += 1;
  }

  for (const row of catalog.transfer) {
    if (catalog.register.some((r) => r.tld === row.tld)) continue;
    const ok = await patchPriceOnly(row.tld, {
      transferBasePriceInCents: usdToEurCents(row.priceUsd, rate),
    });
    if (ok) transferUpdated += 1;
  }

  for (const row of catalog.reactivate) {
    if (catalog.register.some((r) => r.tld === row.tld)) continue;
    const ok = await patchPriceOnly(row.tld, {
      restoreBasePriceInCents: usdToEurCents(row.priceUsd, rate),
    });
    if (ok) restoreUpdated += 1;
  }

  return {
    ok: true,
    source: "namecheap",
    updated,
    created,
    renewUpdated,
    transferUpdated,
    restoreUpdated,
    skipped,
    skippedManualOwned,
    exchangeRateUsed: rate,
    pricedTlds: catalog.register.length,
    renewPricedTlds: catalog.renew.length,
    transferPricedTlds: catalog.transfer.length,
    restorePricedTlds: catalog.reactivate.length,
    categoryNames: catalog.categoryNames,
  };
}

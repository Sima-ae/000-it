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

export type SyncDomainPricesResult = {
  ok: true;
  updated: number;
  created: number;
  renewUpdated: number;
  skipped: number;
  exchangeRateUsed: number;
  pricedTlds: number;
  renewPricedTlds: number;
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
  const renewByTld = new Map(
    catalog.renew.map((row) => [row.tld, row.priceUsd] as const),
  );

  let updated = 0;
  let created = 0;
  let renewUpdated = 0;
  let skipped = 0;

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
        : null;

    const existing = await prisma.domainProduct.findUnique({
      where: { tld: row.tld },
    });

    if (!existing) {
      await prisma.domainProduct.create({
        data: {
          tld: row.tld,
          basePriceInCents,
          renewBasePriceInCents: renewBasePriceInCents ?? 0,
          markupFixedCents: DEFAULT_MARKUP_FIXED_CENTS,
          markupPercent: markupPercentForBuyPriceCents(basePriceInCents),
          manualPricing: false,
          isActive: true,
        },
      });
      created += 1;
      if (renewBasePriceInCents != null) renewUpdated += 1;
      continue;
    }

    // Manual buy/renew (e.g. .be or TLDs not sold by supplier) — never overwrite.
    if (existing.manualPricing) {
      continue;
    }

    await prisma.domainProduct.update({
      where: { tld: row.tld },
      data: {
        basePriceInCents,
        markupFixedCents: DEFAULT_MARKUP_FIXED_CENTS,
        markupPercent: markupPercentForBuyPriceCents(basePriceInCents),
        ...(renewBasePriceInCents != null ? { renewBasePriceInCents } : {}),
      },
    });
    updated += 1;
    if (renewBasePriceInCents != null) renewUpdated += 1;
  }

  // TLDs that only appear in renew feed (rare) — still refresh renew buy price
  for (const row of catalog.renew) {
    if (!isValidTldName(row.tld)) continue;
    if (catalog.register.some((r) => r.tld === row.tld)) continue;
    const existing = await prisma.domainProduct.findUnique({
      where: { tld: row.tld },
    });
    if (!existing || existing.manualPricing) continue;
    const renewBasePriceInCents = usdToEurCents(row.priceUsd, rate);
    await prisma.domainProduct.update({
      where: { tld: row.tld },
      data: { renewBasePriceInCents },
    });
    renewUpdated += 1;
  }

  return {
    ok: true,
    updated,
    created,
    renewUpdated,
    skipped,
    exchangeRateUsed: rate,
    pricedTlds: catalog.register.length,
    renewPricedTlds: catalog.renew.length,
  };
}

import { prisma } from "@/lib/prisma";
import {
  getRegisterPricing,
  isNamecheapConfigured,
  namecheapMissingEnv,
} from "@/lib/domains/namecheap";

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

export type SyncDomainPricesResult = {
  ok: true;
  updated: number;
  exchangeRateUsed: number;
  pricedTlds: number;
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
  const pricing = await getRegisterPricing();
  let updated = 0;

  for (const row of pricing) {
    const existing = await prisma.domainProduct.findUnique({
      where: { tld: row.tld },
    });
    if (!existing) continue;
    const basePriceInCents = Math.max(
      1,
      Math.round(row.priceUsd * rate * 100),
    );
    await prisma.domainProduct.update({
      where: { tld: row.tld },
      data: { basePriceInCents },
    });
    updated += 1;
  }

  return {
    ok: true,
    updated,
    exchangeRateUsed: rate,
    pricedTlds: pricing.length,
  };
}

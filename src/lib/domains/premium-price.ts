import { sellPriceCents } from "@/lib/domains/pricing";
import { usdToEurCents } from "@/lib/domains/fx";

/** Apply our tiered margin to a supplier buy amount already in EUR cents. */
export function sellFromBuyCents(buyCents: number): number {
  return sellPriceCents({ basePriceInCents: Math.max(0, Math.round(buyCents)) });
}

/** Convert premium USD buy → EUR sell (cents) with tiered margin. */
export function sellFromBuyUsd(buyUsd: number, usdToEurRate: number): number {
  const buyCents = usdToEurCents(buyUsd, usdToEurRate);
  if (buyCents <= 0) return 0;
  return sellFromBuyCents(buyCents);
}

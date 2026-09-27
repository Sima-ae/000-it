export type DomainPricingInput = {
  basePriceInCents: number;
  /** Ignored for sell price — kept for DB compatibility; always treated as 0. */
  markupFixedCents?: number;
  /** Ignored for sell price — % is derived from buy price tiers. */
  markupPercent?: number;
  offerPriceInCents?: number | null;
};

export type DomainRenewPricingInput = {
  renewBasePriceInCents: number;
  markupFixedCents?: number;
  markupPercent?: number;
};

/**
 * Markup % of the supplier buy price (euro cents).
 * Fixed € markup is always 0 — sell = buy + (buy × this %).
 *
 * Tiers (buy price incl. converted EUR):
 * ≤ €2 → 40% · ≤ €5 → 35% · ≤ €10 → 30% · ≤ €50 → 25% · ≤ €100 → 20%
 * ≤ €1.000 → 15% · ≤ €5.000 → 10% · ≤ €50.000 → 5% · ≤ €100.000 → 4%
 * ≤ €500.000 → 3% · ≤ €1.000.000 → 2% · above → 1%
 */
export function markupPercentForBuyPriceCents(buyPriceInCents: number): number {
  const c = Math.max(0, Math.round(buyPriceInCents));
  if (c <= 200) return 40; // ≤ €2,00
  if (c <= 500) return 35; // ≤ €5,00
  if (c <= 1_000) return 30; // ≤ €10,00
  if (c <= 5_000) return 25; // ≤ €50,00
  if (c <= 10_000) return 20; // ≤ €100,00
  if (c <= 100_000) return 15; // ≤ €1.000,00
  if (c <= 500_000) return 10; // ≤ €5.000,00
  if (c <= 5_000_000) return 5; // ≤ €50.000,00
  if (c <= 10_000_000) return 4; // ≤ €100.000,00
  if (c <= 50_000_000) return 3; // ≤ €500.000,00
  if (c <= 100_000_000) return 2; // ≤ €1.000.000,00
  return 1; // €1.000.000,01+
}

/** List / markup sell price incl. VAT (same convention as shop), euro cents. */
export function sellPriceCents(product: DomainPricingInput): number {
  const base = Math.max(0, Math.round(product.basePriceInCents));
  const pct = markupPercentForBuyPriceCents(base);
  return base + Math.round(base * (pct / 100));
}

/** Effective registration price: offer when set and below list, otherwise list. */
export function effectiveSellPriceCents(product: DomainPricingInput): number {
  const list = sellPriceCents(product);
  const offer = product.offerPriceInCents;
  if (
    typeof offer === "number" &&
    Number.isFinite(offer) &&
    offer > 0 &&
    offer < list
  ) {
    return Math.round(offer);
  }
  return list;
}

export function hasOfferPrice(product: DomainPricingInput): boolean {
  return effectiveSellPriceCents(product) < sellPriceCents(product);
}

/** Renewal sell price (1 year) — same tier rules on the renew buy price. */
export function renewSellPriceCents(product: DomainRenewPricingInput): number {
  const base = Math.max(0, Math.round(product.renewBasePriceInCents));
  if (base <= 0) return 0;
  const pct = markupPercentForBuyPriceCents(base);
  return base + Math.round(base * (pct / 100));
}

export function formatEuroFromCents(cents: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

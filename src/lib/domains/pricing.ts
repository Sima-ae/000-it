export type DomainPricingInput = {
  basePriceInCents: number;
  markupFixedCents: number;
  markupPercent: number;
};

/** Sell price incl. VAT (same convention as shop), euro cents. */
export function sellPriceCents(product: DomainPricingInput): number {
  const base = Math.max(0, Math.round(product.basePriceInCents));
  const fixed = Math.max(0, Math.round(product.markupFixedCents));
  const pct = Math.max(0, Number(product.markupPercent) || 0);
  const markupPct = Math.round(base * (pct / 100));
  return base + fixed + markupPct;
}

export function formatEuroFromCents(cents: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

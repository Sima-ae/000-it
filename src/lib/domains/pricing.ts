export type DomainPricingInput = {
  basePriceInCents: number;
  markupFixedCents: number;
  markupPercent: number;
  offerPriceInCents?: number | null;
};

export type DomainRenewPricingInput = {
  renewBasePriceInCents: number;
  markupFixedCents: number;
  markupPercent: number;
};

/** List / markup sell price incl. VAT (same convention as shop), euro cents. */
export function sellPriceCents(product: DomainPricingInput): number {
  const base = Math.max(0, Math.round(product.basePriceInCents));
  const fixed = Math.max(0, Math.round(product.markupFixedCents));
  const pct = Math.max(0, Number(product.markupPercent) || 0);
  const markupPct = Math.round(base * (pct / 100));
  return base + fixed + markupPct;
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

/** Renewal sell price (1 year) with the same markup rules as registration. */
export function renewSellPriceCents(product: DomainRenewPricingInput): number {
  const base = Math.max(0, Math.round(product.renewBasePriceInCents));
  if (base <= 0) return 0;
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

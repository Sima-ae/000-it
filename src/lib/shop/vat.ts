/** Shop VAT — prices are inclusive of 21% BTW (Dutch standard rate). */
export const VAT_RATE = 0.21;

export function eurosToCents(euros: number) {
  return Math.round(euros * 100);
}

export function centsToEuros(cents: number) {
  return cents / 100;
}

/** Split an inclusive amount (euros) into excl + VAT. */
export function splitInclusiveVat(totalInclEuros: number, vatRate = VAT_RATE) {
  const totalIncl = Math.round(totalInclEuros * 100) / 100;
  const excl = Math.round((totalIncl / (1 + vatRate)) * 100) / 100;
  const vat = Math.round((totalIncl - excl) * 100) / 100;
  return { excl, vat, incl: totalIncl };
}

/** Split inclusive cents into excl + VAT cents (cent-accurate for Stripe). */
export function splitInclusiveVatCents(totalInclCents: number, vatRate = VAT_RATE) {
  const exclCents = Math.round(totalInclCents / (1 + vatRate));
  const vatCents = totalInclCents - exclCents;
  return { exclCents, vatCents, inclCents: totalInclCents };
}

export function formatShopEuro(amountEuros: number, locale: string) {
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amountEuros);
}

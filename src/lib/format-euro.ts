/** Client-safe euro formatting. */
export function formatEuro(price: number, locale: string = "nl-NL") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

/** Small HTML helpers for kennisbank article bodies. */

export function p(...paras: string[]) {
  return paras.map((t) => `<p>${t}</p>`).join("\n");
}

export function h2(t: string) {
  return `<h2>${t}</h2>`;
}

export function h3(t: string) {
  return `<h3>${t}</h3>`;
}

export function ol(items: string[]) {
  return `<ol>\n${items.map((i) => `  <li>${i}</li>`).join("\n")}\n</ol>`;
}

export function ul(items: string[]) {
  return `<ul>\n${items.map((i) => `  <li>${i}</li>`).join("\n")}\n</ul>`;
}

export function tip(t: string, locale: "nl" | "en" = "nl") {
  const label = locale === "nl" ? "Tip" : "Tip";
  return `<aside class="kb-callout kb-callout-tip"><p><strong>${label}:</strong> ${t}</p></aside>`;
}

export function warn(t: string, locale: "nl" | "en" = "nl") {
  const label = locale === "nl" ? "Let op" : "Note";
  return `<aside class="kb-callout kb-callout-warn"><p><strong>${label}:</strong> ${t}</p></aside>`;
}

export function joinBlocks(...parts: string[]) {
  return parts.filter(Boolean).join("\n");
}

export function supportOutro(locale: "nl" | "en", related?: string) {
  if (locale === "nl") {
    return p(
      `Kom je er niet uit? Open een ticket bij TripleZero iT via het klantenpanel. Vermeld je domeinnaam, wat je al hebt geprobeerd en eventuele foutmeldingen (tekst of screenshot).`,
      related
        ? `Gerelateerd: ${related}.`
        : `Bekijk ook andere artikelen in de kennisbank over hosting, e-mail en beveiliging.`,
    );
  }
  return p(
    `Still stuck? Open a ticket with TripleZero iT via the client panel. Include your domain name, what you already tried, and any exact error messages (text or screenshot).`,
    related
      ? `Related: ${related}.`
      : `Also browse other knowledge-base articles on hosting, email and security.`,
  );
}

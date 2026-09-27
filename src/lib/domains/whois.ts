/**
 * Build a WHOIS lookup URL for an unavailable domain.
 * Prefer TLD whois portals with a deep link when known; otherwise
 * https://who.is/whois/{domain} (always prefills the search).
 */
export function whoisLookupUrl(domain: string, tld?: string): string {
  const d = domain.toLowerCase().trim();
  const ext = (tld || d.split(".").pop() || "")
    .toLowerCase()
    .replace(/^\./, "");
  if (!d) return "https://who.is/";

  const encoded = encodeURIComponent(d);
  const whoIsDirect = `https://who.is/whois/${encoded}`;

  // Portals that accept a domain in the path/query (prefilled lookup).
  switch (ext) {
    case "com":
    case "net":
    case "org":
    case "info":
    case "biz":
    case "io":
    case "co":
    case "me":
    case "app":
    case "dev":
    case "online":
    case "shop":
    case "xyz":
    case "ai":
      // whois.com-style deep link
      return `https://www.whois.com/whois/${encoded}`;
    case "nl":
      // whois.nl (SIDN) has no stable deep-link → who.is prefills the domain
      return whoIsDirect;
    case "be":
      return `https://www.dnsbelgium.be/nl/whois?domain=${encoded}`;
    case "eu":
      return `https://whois.eurid.eu/#/search/${encoded}`;
    case "de":
      return `https://www.denic.de/webwhois/?lang=en&domain=${encoded}`;
    case "uk":
    case "co.uk":
      return `https://www.whois.com/whois/${encoded}`;
    default:
      // Generic fallback with domain already in the path
      return whoIsDirect;
  }
}

/** Strip legacy / competitor agency branding from imported content. Client-safe. */
export function brandify(text: string) {
  if (typeof text !== "string") return "";
  return text
    .replace(/privacy@fix-web\.com/gi, "privacy@000-it.com")
    .replace(/info@fix-web\.com/gi, "info@000-it.com")
    .replace(/https?:\/\/(www\.)?fix-web\.com/gi, "https://000-it.com")
    .replace(/(www\.)?fix-web\.com/gi, "000-it.com")
    .replace(/FIX-WEB\.shop/gi, "TripleZero iT")
    .replace(/Fix-Web\.site/gi, "TripleZero iT")
    .replace(/FIX-WEB\.SITE/gi, "TripleZero iT")
    .replace(/Fix[\s-]?Web/gi, "TripleZero iT")
    .replace(/FIX[\s-]?WEB/gi, "TripleZero iT")
    // Competitor / agency names — never present as our brand
    .replace(/\bJust[\s-]?Host\b/g, "TripleZero iT")
    .replace(/\bJustHost(?:ing)?\b/gi, "TripleZero iT")
    .replace(/\bMiss[\s-]?Hack\b/gi, "TripleZero iT")
    .replace(/\bIndigo[\s-]?Webstudio\b/gi, "TripleZero iT")
    .replace(/\bIndigo[\s-]?Web[\s-]?Studio\b/gi, "TripleZero iT")
    .replace(/\bWebbouwers?\b/gi, "TripleZero iT")
    .replace(/Hosted on Namecheap Cloud/gi, "Hosted on TripleZero iT")
    .replace(/Namecheap Cloud/gi, "TripleZero iT")
    .replace(/\bNamecheap\b/gi, "TripleZero iT")
    .replace(/TripleZero iT Hosting/g, "TripleZero iT");
}

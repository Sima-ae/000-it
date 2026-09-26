/**
 * Strip legacy boilerplate prefixes from kennisbank excerpts / SEO descriptions.
 * Kept separate from prisma/kennisbank/build-body to avoid pulling body builders
 * into the app bundle.
 */
export function stripKennisbankExcerptPrefix(text: string): string {
  return text
    .replace(
      /^(?:Professionele handleiding van\s+[^:]+:\s*|Professional\s+[^:]*?\s*guide:\s*|Bijgewerkte handleiding van\s+[^:]+:\s*|Professionelle Anleitung von\s+[^:]+:\s*|Guide professionnel de\s+[^:]*:\s*|Guía profesional de\s+[^:]+:\s*|Guida professionale\s+(?:a\s+)?[^:]+:\s*|Guia profissional\s+[^:]+:\s*)/i,
      "",
    )
    .trim();
}

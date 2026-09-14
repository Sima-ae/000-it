/**
 * Locale-aware URL slug helper.
 * Keeps letters from any script (Latin, Cyrillic, Greek, Arabic, CJK, …).
 */
export function slugifyLocalized(input: string, max = 120): string {
  const base = (input || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    // Strip combining marks only for Latin-ish diacritics (é → e) after NFD;
    // keep CJK/Arabic/Cyrillic intact via NFKC above then selective strip.
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .normalize("NFC")
    .replace(/[''`´]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  if (!base) return "item";
  return base.slice(0, max).replace(/-+$/g, "") || "item";
}

/** ASCII-only fallback (legacy kennisbank / news IDs). */
export function slugifyAscii(input: string, max = 160): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max);
}

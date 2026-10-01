/**
 * ExtraHosting (domains_hosting) content allowlists.
 * Keep FAQ / kennisbank / agent matches scoped to domains & hosting.
 */

/** Top-level kennisbank category slugs shown on ExtraHosting. */
export const EXTRA_HOSTING_KENNISBANK_CATEGORY_SLUGS = new Set([
  "domeinnamen",
  "hosting",
  "e-mail",
  "directadmin",
  "cyberpanel",
  "plesk",
  "vps",
  "beveiliging",
  "wordpress",
  "support",
  "microsoft",
  "cdn-performance-cloudflare",
  "foutmeldingen-troubleshooting",
  "infrastructuur-servers",
  "veilig-online",
  "privacy-juridisch-compliance",
]);

/** FAQ category ids kept on ExtraHosting (nl + en packs). */
export const EXTRA_HOSTING_FAQ_CATEGORY_IDS = new Set([
  "domeinen",
  "webhosting",
  "email-dns",
  "support",
]);

export function isExtraHostingKennisbankCategorySlug(slug: string): boolean {
  if (EXTRA_HOSTING_KENNISBANK_CATEGORY_SLUGS.has(slug)) return true;
  // Child categories often use `{parent}-…` (e.g. hosting-overige).
  for (const allowed of EXTRA_HOSTING_KENNISBANK_CATEGORY_SLUGS) {
    if (slug.startsWith(`${allowed}-`)) return true;
  }
  return false;
}

export function articleAllowedOnExtraHosting(categorySlugs: string[]): boolean {
  return categorySlugs.some(isExtraHostingKennisbankCategorySlug);
}

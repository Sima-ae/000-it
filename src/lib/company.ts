/**
 * Seller / company details for invoices and legal mentions.
 * Override via env in production (VAT/TRN, trade license).
 * Safe to import from client components — only public defaults apply in the browser.
 */
export type CompanyProfile = {
  legalName: string;
  tradeName: string;
  tagline: string;
  addressLines: string[];
  email: string;
  supportEmail: string;
  website: string;
  /** VAT / BTW / TRN number shown on invoices */
  vatNumber: string | null;
  /** Chamber of commerce / trade license / KvK */
  registrationNumber: string | null;
  /** Label for tax id (BTW, VAT, TRN, …) */
  vatLabel: string;
  registrationLabel: string;
  currency: string;
  defaultTaxRatePercent: number;
};

function env(name: string) {
  try {
    return process.env[name]?.trim() || undefined;
  } catch {
    return undefined;
  }
}

export function getCompanyProfile(): CompanyProfile {
  const addressLines = [
    env("COMPANY_ADDRESS_LINE1") || "The Burlington Tower - Floor 19",
    env("COMPANY_ADDRESS_LINE2") || "57P7+2R2 - Marasi Dr",
    env("COMPANY_ADDRESS_LINE3") || "Business Bay - Dubai",
    env("COMPANY_ADDRESS_LINE4") || "United Arab Emirates",
  ].filter(Boolean);

  const smtpFrom = env("SMTP_FROM");
  const smtpEmail = smtpFrom?.includes("<")
    ? smtpFrom.replace(/^.*<([^>]+)>.*$/, "$1").trim()
    : undefined;

  const siteBrand = (env("SITE_BRAND") || "").toLowerCase();
  const isExtra =
    siteBrand === "extrahosting" ||
    siteBrand === "extra-hosting" ||
    (env("NEXT_PUBLIC_APP_URL") || "").includes("extrahosting");

  const defaultName = isExtra ? "ExtraHosting" : "TripleZero iT";
  const defaultWebsite = isExtra
    ? "https://extrahosting.eu"
    : "https://000-it.com";
  const defaultEmail = isExtra ? "info@extrahosting.eu" : "info@000-it.com";
  const defaultSupport = isExtra
    ? "support@extrahosting.eu"
    : "support@000-it.com";
  const defaultTagline = isExtra
    ? "Domains · Websites · Webhosting"
    : "AI, AEO, GEO, SEO, domeinen, hosting en marketing";

  return {
    legalName: env("COMPANY_LEGAL_NAME") || env("COMPANY_NAME") || defaultName,
    tradeName: env("COMPANY_TRADE_NAME") || defaultName,
    tagline: env("COMPANY_TAGLINE") || defaultTagline,
    addressLines,
    email: env("COMPANY_EMAIL") || smtpEmail || defaultEmail,
    supportEmail: env("COMPANY_SUPPORT_EMAIL") || defaultSupport,
    website:
      env("COMPANY_WEBSITE") || env("NEXT_PUBLIC_APP_URL") || defaultWebsite,
    vatNumber: env("COMPANY_VAT_NUMBER") || null,
    registrationNumber:
      env("COMPANY_REGISTRATION_NUMBER") || env("COMPANY_KVK_NUMBER") || null,
    vatLabel: env("COMPANY_VAT_LABEL") || "BTW / VAT",
    registrationLabel:
      env("COMPANY_REGISTRATION_LABEL") || "Trade license / KvK",
    currency: "EUR",
    defaultTaxRatePercent: 21,
  };
}

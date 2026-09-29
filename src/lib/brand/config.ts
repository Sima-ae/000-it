/**
 * Multi-brand site configuration (TripleZero iT + ExtraHosting).
 * Brand is resolved from Host header and/or SITE_BRAND env.
 */

export type SiteBrandId = "triplezero" | "extrahosting";

export type LocalePrefixMode = "always" | "never";

export type CountryLocaleHost = {
  host: string;
  locale: string;
  brand: SiteBrandId;
};

/** Country TLDs that serve a fixed locale at the URL root (no /{locale} prefix). */
export const COUNTRY_LOCALE_HOSTS: CountryLocaleHost[] = [
  { host: "extrahosting.nl", locale: "nl", brand: "extrahosting" },
  { host: "www.extrahosting.nl", locale: "nl", brand: "extrahosting" },
];

export type BrandPublicConfig = {
  id: SiteBrandId;
  displayName: string;
  shortName: string;
  /** Public marketing site (apex preferred). */
  primaryHost: string;
  staffBaseUrl: string;
  logoSrc: string;
  logoAlt: string;
  ogImage: string;
  favicon: string;
  /** CSS data-brand attribute value */
  dataBrand: SiteBrandId;
  /** Domains + hosting only (no services/AI/WP care). */
  catalogMode: "full" | "domains_hosting";
  /** Show staff CRM / admin UI on this brand. */
  staffUi: boolean;
  defaultLocale: string;
  defaultDescription: { nl: string; en: string };
  defaultKeywords: { nl: string[]; en: string[] };
  supportEmail: string;
  contactEmail: string;
  tagline: { nl: string; en: string };
};

export const BRANDS: Record<SiteBrandId, BrandPublicConfig> = {
  triplezero: {
    id: "triplezero",
    displayName: "TripleZero iT",
    shortName: "TripleZero",
    primaryHost: "000-it.com",
    staffBaseUrl: "https://000-it.com",
    logoSrc: "/branding/WEBLOGO-TripleZero-iT.png",
    logoAlt: "TripleZero iT",
    ogImage: "/branding/LOGO-TripleZero-iT.jpg",
    favicon: "/branding/favicon.png",
    dataBrand: "triplezero",
    catalogMode: "full",
    staffUi: true,
    defaultLocale: "nl",
    defaultDescription: {
      nl: "Ontdek alle AI mogelijkheden voor ondernemers en zzp'ers: AI-integratie, AEO, GEO, SEO, marketing en maatwerk software.",
      en: "Discover all AI possibilities for entrepreneurs and freelancers: AI integration, AEO, GEO, SEO, marketing and custom software.",
    },
    defaultKeywords: {
      nl: [
        "TripleZero iT",
        "AI",
        "AEO",
        "GEO",
        "SEO",
        "domeinen",
        "hosting",
        "WordPress",
        "webdesign",
      ],
      en: [
        "TripleZero iT",
        "AI",
        "AEO",
        "GEO",
        "SEO",
        "domains",
        "hosting",
        "WordPress",
        "web design",
      ],
    },
    supportEmail: "support@000-it.com",
    contactEmail: "info@000-it.com",
    tagline: {
      nl: "AI, AEO, GEO, SEO, domeinen, hosting en marketing",
      en: "AI, AEO, GEO, SEO, domains, hosting and marketing",
    },
  },
  extrahosting: {
    id: "extrahosting",
    displayName: "ExtraHosting",
    shortName: "ExtraHosting",
    primaryHost: "extrahosting.eu",
    staffBaseUrl: "https://000-it.com",
    logoSrc: "/branding/extrahosting/WEBLOGO-ExtraHosting.png",
    logoAlt: "ExtraHosting",
    ogImage: "/branding/extrahosting/WEBLOGO-ExtraHosting.png",
    favicon: "/branding/extrahosting/WEBLOGO-ExtraHosting.png",
    dataBrand: "extrahosting",
    catalogMode: "domains_hosting",
    staffUi: false,
    defaultLocale: "en",
    defaultDescription: {
      nl: "Domeinnamen en webhosting van ExtraHosting — shared hosting, WordPress hosting, VPS en domeinregistratie.",
      en: "Domains and web hosting from ExtraHosting — shared hosting, WordPress hosting, VPS and domain registration.",
    },
    defaultKeywords: {
      nl: [
        "ExtraHosting",
        "domeinen",
        "webhosting",
        "WordPress hosting",
        "VPS",
        "shared hosting",
        "domeinregistratie",
      ],
      en: [
        "ExtraHosting",
        "domains",
        "web hosting",
        "WordPress hosting",
        "VPS",
        "shared hosting",
        "domain registration",
      ],
    },
    supportEmail: "support@extrahosting.eu",
    contactEmail: "info@extrahosting.eu",
    tagline: {
      nl: "Domeinen · Websites · Webhosting",
      en: "Domains · Websites · Webhosting",
    },
  },
};

export type ResolvedHostContext = {
  host: string;
  brand: SiteBrandId;
  config: BrandPublicConfig;
  /** When set, this host serves only this locale at the URL root. */
  fixedLocale: string | null;
  localePrefix: LocalePrefixMode;
  /** Default locale for next-intl on this host. */
  defaultLocale: string;
};

function normalizeHost(hostHeader: string | null | undefined): string {
  return (hostHeader || "").split(":")[0].toLowerCase().trim();
}

function brandFromEnv(): SiteBrandId | null {
  const raw = (process.env.SITE_BRAND || "").trim().toLowerCase();
  if (raw === "extrahosting" || raw === "extra-hosting") return "extrahosting";
  if (raw === "triplezero" || raw === "000-it" || raw === "000it") return "triplezero";
  return null;
}

/** Map hostname → brand (without env). */
export function brandIdForHost(hostHeader: string | null | undefined): SiteBrandId {
  const host = normalizeHost(hostHeader);
  const country = COUNTRY_LOCALE_HOSTS.find((c) => c.host === host);
  if (country) return country.brand;

  if (
    host === "extrahosting.eu" ||
    host === "www.extrahosting.eu" ||
    host.endsWith(".extrahosting.eu")
  ) {
    return "extrahosting";
  }

  if (
    host === "000-it.com" ||
    host === "www.000-it.com" ||
    host.endsWith(".000-it.com")
  ) {
    return "triplezero";
  }

  // Local / preview: prefer SITE_BRAND, else triplezero.
  return brandFromEnv() || "triplezero";
}

export function resolveHostContext(
  hostHeader: string | null | undefined,
): ResolvedHostContext {
  const host = normalizeHost(hostHeader) || "localhost";
  const country = COUNTRY_LOCALE_HOSTS.find((c) => c.host === host);
  const brand = brandIdForHost(host);
  const config = BRANDS[brand];

  if (country) {
    return {
      host,
      brand,
      config,
      fixedLocale: country.locale,
      localePrefix: "never",
      defaultLocale: country.locale,
    };
  }

  return {
    host,
    brand,
    config,
    fixedLocale: null,
    localePrefix: "always",
    defaultLocale: config.defaultLocale,
  };
}

export function getBrandConfig(brand: SiteBrandId = "triplezero"): BrandPublicConfig {
  return BRANDS[brand];
}

/** Absolute https origin for a host (no trailing slash). */
export function publicOriginForHost(hostHeader: string | null | undefined): string {
  const host = normalizeHost(hostHeader);
  if (!host || host === "localhost" || host.startsWith("127.")) {
    return (
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      "http://localhost:3066"
    );
  }
  return `https://${host}`;
}

/** Preferred public URL for the brand (apex). */
export function brandPrimaryOrigin(brand: SiteBrandId): string {
  return `https://${BRANDS[brand].primaryHost}`;
}

export function isExtraHostingBrand(brand: SiteBrandId): boolean {
  return brand === "extrahosting";
}

export function isDomainsHostingCatalog(brand: SiteBrandId): boolean {
  return BRANDS[brand].catalogMode === "domains_hosting";
}

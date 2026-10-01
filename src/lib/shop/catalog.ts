import importedProducts from "@/content/fixweb/imported-products.json";
import localImages from "@/content/fixweb/local-images.json";
import { getProductI18n } from "@/content/fixweb/product-i18n";
import { catalogServiceTitle } from "@/content/fixweb/catalog-title";
import { brandify } from "@/lib/brandify";
import type { ShopAdminBillingInterval } from "@/lib/shop/admin";
import { eurosToCents } from "@/lib/shop/vat";
import {
  WP_CARE_HOSTING_FEATURE_INDEX,
  WP_CARE_KEYS,
  WP_CARE_PRICES,
  wpCarePackageCopy,
  wpCareProductId,
  wpCareSlug,
  type WpCareHosting,
  type WpCareKey,
} from "@/content/wordpress-care";

export type ShopBillingPeriod = "monthly" | "yearly";
export type ShopProductType = "plan" | "service" | "product";
export type ShopBillingInterval = ShopAdminBillingInterval;
export type ShopProductLineOfBusiness = "SERVICE" | "HOSTING";

export type ShopProduct = {
  id: string;
  sku?: string;
  slug: string;
  type: ShopProductType;
  name: { nl: string; en: string };
  description: { nl: string; en: string };
  shortDescription: { nl: string; en: string };
  /** Unit price including VAT, in euro cents (list/display price) */
  priceInclCents: number;
  /**
   * Optional sale/discount unit price incl. VAT (euro cents).
   * When set and lower than list price, shop cards strike through the list price.
   */
  discountPriceInclCents?: number | null;
  /**
   * When set, checkout charges this many list periods (e.g. 12 for yearly
   * hosting packages that are advertised per month).
   */
  checkoutMonths?: number;
  currency: "EUR";
  image?: string | null;
  /** Legacy monthly/yearly flag for plans */
  billingPeriod?: ShopBillingPeriod;
  /** Full billing model for admin-managed catalog */
  billingInterval?: ShopBillingInterval;
  billAsYearlyPackage?: boolean;
  category?: string | null;
  lineOfBusiness?: ShopProductLineOfBusiness;
  planKey?: "starter" | "growth";
  featured?: boolean;
  published?: boolean;
  sortOrder?: number;
  tags?: string[];
};

/** Shop and hosting-category column order. */
export const SHARED_HOSTING_SLUG_ORDER = [
  "shared-hosting-basic",
  "shared-hosting-business",
  "shared-hosting-plus",
] as const;

export const CLOUD_HOSTING_SLUG_ORDER = [
  "cloud-hosting-start",
  "cloud-hosting-basic",
  "cloud-hosting-plus",
] as const;

export const EMAIL_HOSTING_SLUG_ORDER = [
  "email-hosting-basic",
  "email-hosting-business",
  "email-hosting-pro",
] as const;

export const RESELLER_HOSTING_SLUG_ORDER = [
  "reseller-hosting-start",
  "reseller-hosting-basic",
  "reseller-hosting-business",
  "reseller-hosting-plus",
] as const;

export const WORDPRESS_HOSTING_SLUG_ORDER = [
  "wordpress-hosting-basic",
  "wordpress-hosting-business",
  "wordpress-hosting-plus",
] as const;

export const VPS_HOSTING_SLUG_ORDER = [
  "vps-hosting-start",
  "vps-hosting-basic",
  "vps-hosting-business",
  "vps-hosting-plus",
] as const;

/** Hosting plans listed monthly but sold as a 12-month package. */
export const HOSTING_YEARLY_SLUGS = new Set<string>([
  ...SHARED_HOSTING_SLUG_ORDER,
  ...CLOUD_HOSTING_SLUG_ORDER,
  ...EMAIL_HOSTING_SLUG_ORDER,
  ...RESELLER_HOSTING_SLUG_ORDER,
  ...WORDPRESS_HOSTING_SLUG_ORDER,
  ...VPS_HOSTING_SLUG_ORDER,
]);

export function shopProductsInSlugOrder(
  products: ShopProduct[],
  order: readonly string[],
) {
  const rank = new Map<string, number>(order.map((slug, index) => [slug, index]));
  return products
    .filter((product) => rank.has(product.slug))
    .sort((a, b) => (rank.get(a.slug) ?? 999) - (rank.get(b.slug) ?? 999));
}

/** WordPress care packages with monthly + discounted yearly billing. */
export const SUPPORT_PACKAGE_KEYS = ["pro", "double", "premium"] as const;
export type SupportPackageKey = (typeof SUPPORT_PACKAGE_KEYS)[number];

export const SUPPORT_PACKAGE_PRICES: Record<
  SupportPackageKey,
  { monthly: number; yearly: number; savePercent: number }
> = {
  pro: { monthly: 29.99, yearly: 323.91, savePercent: 10 },
  double: { monthly: 54.99, yearly: 560.83, savePercent: 15 },
  premium: { monthly: 89.99, yearly: 863.88, savePercent: 20 },
};

const SUPPORT_BASE_SLUGS = new Set(
  SUPPORT_PACKAGE_KEYS.map((key) => `${key}-support`),
);

export function supportPackageSlug(
  key: SupportPackageKey,
  period: ShopBillingPeriod,
) {
  const base = `${key}-support`;
  return period === "yearly" ? `${base}-yearly` : base;
}

export function supportProductId(
  key: SupportPackageKey,
  period: ShopBillingPeriod,
) {
  return `service-${supportPackageSlug(key, period)}`;
}

export {
  WP_CARE_KEYS,
  wpCareProductId,
  isWpCareSlug,
  type WpCareKey,
  type WpCareHosting,
} from "@/content/wordpress-care";

export function isSupportPackageSlug(slug: string) {
  return (
    SUPPORT_BASE_SLUGS.has(slug) ||
    SUPPORT_PACKAGE_KEYS.some((key) => slug === `${key}-support-yearly`)
  );
}

/** Effective unit price (discount when set, otherwise list). */
export function shopUnitPriceInclCents(product: ShopProduct) {
  const discount = product.discountPriceInclCents;
  if (
    typeof discount === "number" &&
    Number.isFinite(discount) &&
    discount > 0 &&
    discount < product.priceInclCents
  ) {
    return discount;
  }
  return product.priceInclCents;
}

export function shopHasDiscount(product: ShopProduct) {
  return shopUnitPriceInclCents(product) < product.priceInclCents;
}

/** Charged unit price (incl. VAT cents) used in cart / Stripe. */
export function shopChargeInclCents(product: ShopProduct) {
  const months =
    product.checkoutMonths && product.checkoutMonths > 1
      ? product.checkoutMonths
      : product.billAsYearlyPackage
        ? 12
        : 1;
  return shopUnitPriceInclCents(product) * months;
}

type ImportedProduct = {
  slug: string;
  name: string;
  price: number;
  currency: string;
  shortDescription: string;
  description: string;
  images?: string[];
};

const imageMap = localImages as Record<string, string | null>;
const imported = (importedProducts as { products: ImportedProduct[] }).products;

const PLAN_MONTHLY_EUR = {
  starter: 39.95,
  growth: 64.95,
} as const;

function yearlyFromMonthly(monthly: number) {
  return Math.round(monthly * 12 * 0.9 * 100) / 100;
}

const PLAN_PERIOD_SUFFIX = /\s*\((maandelijks|jaarlijks|monthly|yearly)\)\s*$/i;

/**
 * Column title from the saved shop product, without the billing-period suffix.
 * Only nl/en use catalog product names; other locales fall back to
 * `messages/{locale}.json` pricing.starter / pricing.growth.
 */
export function resolvePlanNamesFromCatalog(catalog: ShopProduct[], locale: string) {
  if (locale !== "nl" && locale !== "en") {
    return { starter: null, growth: null };
  }

  const lang = locale === "nl" ? "nl" : "en";

  function nameFor(slugs: string[]) {
    for (const slug of slugs) {
      const product = catalog.find((item) => item.slug === slug);
      if (!product) continue;
      const raw = (product.name[lang] || product.name.en || product.name.nl || "").replace(
        PLAN_PERIOD_SUFFIX,
        "",
      ).trim();
      if (raw) return raw;
    }
    return null;
  }

  return {
    starter: nameFor(["plan-starter-monthly", "plan-starter-yearly"]),
    growth: nameFor(["plan-growth-monthly", "plan-growth-yearly"]),
  };
}

/** WordPress care column prices (euros, incl. VAT) from saved shop products. */
export function resolveWpCarePricesFromCatalog(catalog: ShopProduct[]) {
  const bySlug = new Map(catalog.map((product) => [product.slug, product]));

  function euros(key: WpCareKey, hosting: WpCareHosting, fallback: number) {
    const product = bySlug.get(wpCareSlug(key, hosting));
    if (!product) return fallback;
    return shopUnitPriceInclCents(product) / 100;
  }

  return {
    business: {
      withHosting: euros("business", "with", WP_CARE_PRICES.business.withHosting),
      withoutHosting: euros("business", "without", WP_CARE_PRICES.business.withoutHosting),
    },
    businessPro: {
      withHosting: euros("businessPro", "with", WP_CARE_PRICES.businessPro.withHosting),
      withoutHosting: euros(
        "businessPro",
        "without",
        WP_CARE_PRICES.businessPro.withoutHosting,
      ),
    },
    enterprise: {
      withHosting: euros("enterprise", "with", WP_CARE_PRICES.enterprise.withHosting),
      withoutHosting: euros(
        "enterprise",
        "without",
        WP_CARE_PRICES.enterprise.withoutHosting,
      ),
    },
  } satisfies typeof WP_CARE_PRICES;
}

/** Resolve AI plan display prices (euros) from shop catalog rows. */
export function resolvePlanPricesFromCatalog(catalog: ShopProduct[]) {
  const bySlug = new Map(catalog.map((p) => [p.slug, p]));

  function eurosFor(slug: string, fallback: number) {
    const product = bySlug.get(slug);
    if (!product) return fallback;
    return shopUnitPriceInclCents(product) / 100;
  }

  return {
    starter: {
      monthly: eurosFor("plan-starter-monthly", PLAN_MONTHLY_EUR.starter),
      yearly: eurosFor(
        "plan-starter-yearly",
        yearlyFromMonthly(PLAN_MONTHLY_EUR.starter),
      ),
    },
    growth: {
      monthly: eurosFor("plan-growth-monthly", PLAN_MONTHLY_EUR.growth),
      yearly: eurosFor(
        "plan-growth-yearly",
        yearlyFromMonthly(PLAN_MONTHLY_EUR.growth),
      ),
    },
  } as const;
}

const PLAN_COPY = {
  starter: {
    name: { nl: "Business", en: "Business" },
    short: {
      nl: "Servicepakket (één factuur TZ-S): domein, hosting inbegrepen, webshop/website, 1 AI-agent, AEO/GEO/SEO basic en premium support. Geen aparte hostingfactuur.",
      en: "Service package (single TZ-S invoice): domain, hosting included, shop/website, 1 AI agent, AEO/GEO/SEO basic and premium support. Not a separate hosting invoice.",
    },
    featuresNl: [
      "1× domeinnaam .COM / .EU / .NL",
      "1× webhosting (inbegrepen in dit servicepakket)",
      "1× e-commerce shop / website",
      "1× AI-agent",
      "AI-scanner",
      "AEO, GEO & SEO basic",
      "Premium support",
      "24/7 monitoring",
    ],
    featuresEn: [
      "1× domain .COM / .EU / .UK",
      "1× web hosting (included in this service package)",
      "1× e-commerce shop / website",
      "1× AI agent",
      "AI scanner",
      "AEO, GEO & SEO basic",
      "Premium support",
      "24/7 monitoring",
    ],
  },
  growth: {
    name: { nl: "Extra Growth", en: "Extra Growth" },
    short: {
      nl: "Servicepakket (één factuur TZ-S): 2 AI-agents, AEO/GEO/SEO plus, hosting inbegrepen, webshop/website en premium support. Standalone hosting blijft TZ-H.",
      en: "Service package (single TZ-S invoice): 2 AI agents, AEO/GEO/SEO plus, hosting included, shop/website and premium support. Standalone hosting stays TZ-H.",
    },
    featuresNl: [
      "1× domeinnaam .COM / .EU / .NL",
      "1× webhosting (inbegrepen in dit servicepakket)",
      "1× e-commerce shop / website",
      "2× AI-agents",
      "AI-scanner",
      "AEO, GEO & SEO plus",
      "Premium support",
      "24/7 monitoring",
    ],
    featuresEn: [
      "1× domain .COM / .EU / .UK",
      "1× web hosting (included in this service package)",
      "1× e-commerce shop / website",
      "2× AI agents",
      "AI scanner",
      "AEO, GEO & SEO plus",
      "Premium support",
      "24/7 monitoring",
    ],
  },
} as const;

function buildPlanProduct(
  planKey: "starter" | "growth",
  period: ShopBillingPeriod,
): ShopProduct {
  const monthly = PLAN_MONTHLY_EUR[planKey];
  const price = period === "yearly" ? yearlyFromMonthly(monthly) : monthly;
  const copy = PLAN_COPY[planKey];
  const periodLabel = {
    nl: period === "yearly" ? "jaarbetaling (10% korting)" : "maandbetaling (eenmalig)",
    en: period === "yearly" ? "yearly payment (10% off)" : "monthly payment (one-time)",
  };

  return {
    id: `plan-${planKey}-${period}`,
    sku: `PLAN-${planKey.toUpperCase()}-${period === "yearly" ? "YR" : "MO"}`,
    slug: `plan-${planKey}-${period}`,
    type: "plan",
    name: {
      nl: `${copy.name.nl} (${period === "yearly" ? "jaarlijks" : "maandelijks"})`,
      en: `${copy.name.en} (${period === "yearly" ? "yearly" : "monthly"})`,
    },
    shortDescription: {
      nl: `${copy.short.nl} Eenmalige ${periodLabel.nl}. Inclusief BTW.`,
      en: `${copy.short.en} One-time ${periodLabel.en}. Including VAT.`,
    },
    description: {
      nl: `${copy.short.nl}\n\nInbegrepen:\n${copy.featuresNl.map((f) => `– ${f}`).join("\n")}\n\nBetaling: eenmalig voor de geselecteerde periode (${periodLabel.nl}). Inclusief BTW.`,
      en: `${copy.short.en}\n\nIncluded:\n${copy.featuresEn.map((f) => `– ${f}`).join("\n")}\n\nPayment: one-time for the selected period (${periodLabel.en}). Including VAT.`,
    },
    priceInclCents: eurosToCents(price),
    currency: "EUR",
    image: "/uploads/fixweb/ai-integratie.png",
    billingPeriod: period,
    billingInterval: period === "yearly" ? "yearly" : "monthly",
    category: "plans",
    planKey,
    featured: planKey === "growth",
    published: true,
    sortOrder: planKey === "growth" ? 1 : 2,
  };
}

function buildSupportProducts(): ShopProduct[] {
  const products: ShopProduct[] = [];

  for (const key of SUPPORT_PACKAGE_KEYS) {
    const baseSlug = `${key}-support`;
    const source = imported.find((p) => p.slug === baseSlug);
    const i18nNl = getProductI18n(baseSlug, "nl");
    const i18nEn = getProductI18n(baseSlug, "en");
    const image = imageMap[baseSlug] || source?.images?.[0] || null;
    const nameNl = brandify(i18nNl?.name || source?.name || `${key} Support`);
    const nameEn = brandify(i18nEn?.name || source?.name || `${key} Support`);
    const shortNl = brandify(
      i18nNl?.shortDescription || source?.shortDescription || "",
    );
    const shortEn = brandify(
      i18nEn?.shortDescription || source?.shortDescription || "",
    );
    const descNl = brandify(i18nNl?.description || source?.description || shortNl);
    const descEn = brandify(i18nEn?.description || source?.description || shortEn);
    const pricing = SUPPORT_PACKAGE_PRICES[key];
    const sortBase = key === "pro" ? 40 : key === "double" ? 41 : 42;

    for (const period of ["monthly", "yearly"] as const) {
      const slug = supportPackageSlug(key, period);
      const price = period === "yearly" ? pricing.yearly : pricing.monthly;
      const periodLabel =
        period === "yearly"
          ? { nl: "jaarlijks", en: "yearly" }
          : { nl: "maandelijks", en: "monthly" };

      products.push({
        id: supportProductId(key, period),
        sku: `SVC-${slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 40)}`,
        slug,
        type: "service",
        name: {
          nl: `${nameNl} (${periodLabel.nl})`,
          en: `${nameEn} (${periodLabel.en})`,
        },
        shortDescription: {
          nl: `${shortNl}\n\nFacturatie: ${periodLabel.nl}. Inclusief BTW.`,
          en: `${shortEn}\n\nBilling: ${periodLabel.en}. Including VAT.`,
        },
        description: {
          nl: `${descNl}\n\nBetaling: ${periodLabel.nl}${
            period === "yearly" ? ` (bespaar ${pricing.savePercent}%)` : ""
          }. Inclusief BTW.`,
          en: `${descEn}\n\nPayment: ${periodLabel.en}${
            period === "yearly" ? ` (save ${pricing.savePercent}%)` : ""
          }. Including VAT.`,
        },
        priceInclCents: eurosToCents(price),
        currency: "EUR",
        image,
        billingPeriod: period,
        billingInterval: period,
        category: "wordpress-beheer",
        featured: key === "double",
        published: true,
        sortOrder: sortBase + (period === "yearly" ? 3 : 0),
        tags: ["wordpress-beheer", key, period],
      });
    }
  }

  return products;
}

function buildServiceProducts(): ShopProduct[] {
  return imported
    .filter((p) => !SUPPORT_BASE_SLUGS.has(p.slug))
    .map((p, index) => {
    const i18nNl = getProductI18n(p.slug, "nl");
    const i18nEn = getProductI18n(p.slug, "en");
    const image = imageMap[p.slug] || p.images?.[0] || null;
    const nameNl = brandify(i18nNl?.name || p.name);
    const nameEn = brandify(i18nEn?.name || p.name);
    const shortNl = brandify(i18nNl?.shortDescription || p.shortDescription || "");
    const shortEn = brandify(i18nEn?.shortDescription || p.shortDescription || "");
    const descNl = brandify(i18nNl?.description || p.description || shortNl);
    const descEn = brandify(i18nEn?.description || p.description || shortEn);

    const yearlyHosting = HOSTING_YEARLY_SLUGS.has(p.slug);

    return {
      id: `service-${p.slug}`,
      sku: `SVC-${p.slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 40)}`,
      slug: p.slug,
      type: "service" as const,
      name: { nl: nameNl, en: nameEn },
      shortDescription: { nl: shortNl, en: shortEn },
      description: { nl: descNl, en: descEn },
      priceInclCents: eurosToCents(p.price),
      checkoutMonths: yearlyHosting ? 12 : undefined,
      billAsYearlyPackage: yearlyHosting,
      billingPeriod: yearlyHosting ? ("yearly" as const) : undefined,
      billingInterval: yearlyHosting
        ? ("yearly" as const)
        : ("one_time" as const),
      category: yearlyHosting ? "hosting" : "other",
      lineOfBusiness: yearlyHosting ? ("HOSTING" as const) : ("SERVICE" as const),
      currency: "EUR" as const,
      image,
      featured: p.slug === "reseller-hosting-plus" || undefined,
      published: true,
      sortOrder: 100 + index,
    };
  });
}

function buildWpCareProducts(): ShopProduct[] {
  const products: ShopProduct[] = [];

  for (const key of WP_CARE_KEYS) {
    const nl = wpCarePackageCopy("nl", key);
    const en = wpCarePackageCopy("en", key);
    const prices = WP_CARE_PRICES[key];
    const sortBase = key === "business" ? 30 : key === "businessPro" ? 31 : 32;

    for (const hosting of ["with", "without"] as const satisfies readonly WpCareHosting[]) {
      const slug = wpCareSlug(key, hosting);
      const price = hosting === "with" ? prices.withHosting : prices.withoutHosting;
      const featuresNl =
        hosting === "with"
          ? nl.features
          : nl.features.filter((_, index) => index !== WP_CARE_HOSTING_FEATURE_INDEX);
      const featuresEn =
        hosting === "with"
          ? en.features
          : en.features.filter((_, index) => index !== WP_CARE_HOSTING_FEATURE_INDEX);
      const hostingNl = hosting === "with" ? "met hosting" : "zonder hosting";
      const hostingEn = hosting === "with" ? "with hosting" : "without hosting";
      const noteNl =
        hosting === "with"
          ? "Inclusief groene razendsnelle hosting."
          : "Hosting is niet inbegrepen.";
      const noteEn =
        hosting === "with"
          ? "Includes green high-speed hosting."
          : "Hosting is not included.";

      products.push({
        id: wpCareProductId(key, hosting),
        sku: `SVC-WP-CARE-${slug.replace(/[^a-z0-9]+/gi, "-").toUpperCase()}`.slice(0, 64),
        slug,
        type: "service",
        name: {
          nl: `WordPress ${nl.name} (maandelijks, ${hostingNl})`,
          en: `WordPress ${en.name} (monthly, ${hostingEn})`,
        },
        shortDescription: {
          nl: `${nl.badge}. ${noteNl} Maandelijks servicepakket, inclusief BTW.`,
          en: `${en.badge}. ${noteEn} Monthly service package, including VAT.`,
        },
        description: {
          nl: `${nl.badge}.\n\n${noteNl}\n\nInbegrepen:\n${featuresNl.map((feature) => `– ${feature}`).join("\n")}\n\nBetaling: maandelijks. Inclusief BTW.`,
          en: `${en.badge}.\n\n${noteEn}\n\nIncluded:\n${featuresEn.map((feature) => `– ${feature}`).join("\n")}\n\nPayment: monthly. Including VAT.`,
        },
        priceInclCents: eurosToCents(price),
        currency: "EUR",
        image:
          key === "business"
            ? "/uploads/fixweb/pro-support.png"
            : key === "businessPro"
              ? "/uploads/fixweb/double-support.png"
              : "/uploads/fixweb/premium-support.png",
        billingPeriod: "monthly",
        billingInterval: "monthly",
        category: "wordpress-care",
        lineOfBusiness: "SERVICE",
        featured: key === "businessPro",
        published: true,
        sortOrder: sortBase + (hosting === "without" ? 3 : 0),
        tags: ["wordpress-care", key, hosting, "monthly"],
      });
    }
  }

  return products;
}

/** Built-in catalog used as seed + fallback when the DB is empty. */
export const STATIC_SHOP_CATALOG: ShopProduct[] = [
  buildPlanProduct("starter", "monthly"),
  buildPlanProduct("starter", "yearly"),
  buildPlanProduct("growth", "monthly"),
  buildPlanProduct("growth", "yearly"),
  ...buildWpCareProducts(),
  ...buildSupportProducts(),
  ...buildServiceProducts(),
];

let activeCatalog: ShopProduct[] = STATIC_SHOP_CATALOG;
let byId = new Map(activeCatalog.map((p) => [p.id, p]));
let bySlug = new Map(activeCatalog.map((p) => [p.slug, p]));

function rebuildIndexes(catalog: ShopProduct[]) {
  activeCatalog = catalog;
  byId = new Map(catalog.map((p) => [p.id, p]));
  bySlug = new Map(catalog.map((p) => [p.slug, p]));
}

/** Hydrate client/runtime catalog from API or DB rows. */
export function setRuntimeShopCatalog(products: ShopProduct[]) {
  if (!products.length) {
    rebuildIndexes(STATIC_SHOP_CATALOG);
    return;
  }
  rebuildIndexes(products);
}

export function listShopProducts(opts?: { type?: ShopProductType }) {
  if (!opts?.type) return activeCatalog;
  return activeCatalog.filter((p) => p.type === opts.type);
}

export function getShopProductById(id: string) {
  return byId.get(id) ?? null;
}

export function getShopProductBySlug(slug: string) {
  return bySlug.get(slug) ?? null;
}

export function planProductId(
  planKey: "starter" | "growth",
  period: ShopBillingPeriod,
) {
  return `plan-${planKey}-${period}`;
}

export function localizeShopProduct(product: ShopProduct, locale: string) {
  const lang = locale === "nl" ? "nl" : "en";

  // Catalog/DB fields are the source of truth for every shop product
  // (services + hosting). Static product-i18n is only used for other locales
  // when NL/EN catalog fields are empty.
  const pick = (...candidates: Array<string | null | undefined>) => {
    for (const value of candidates) {
      if (typeof value === "string" && value.trim()) return value;
    }
    return "";
  };

  const fromProductName = pick(
    product.name[lang],
    product.name.en,
    product.name.nl,
  );
  const fromProductShort = pick(
    product.shortDescription[lang],
    product.shortDescription.en,
    product.shortDescription.nl,
  );
  const fromProductDescription = pick(
    product.description[lang],
    product.description.en,
    product.description.nl,
  );

  const needsPackFallback =
    locale !== "nl" &&
    locale !== "en" &&
    (!fromProductName || !fromProductShort || !fromProductDescription);
  const fromPack = needsPackFallback
    ? product.slug
      ? getProductI18n(product.slug, locale)
      : null
    : null;

  return {
    ...product,
    localizedName: brandify(pick(fromProductName, fromPack?.name)),
    localizedShort: brandify(
      pick(fromProductShort, fromPack?.shortDescription),
    ),
    localizedDescription: brandify(
      pick(fromProductDescription, fromPack?.description),
    ),
  };
}

const HOSTING_CATEGORY_BY_PREFIX: Array<{
  prefix: string;
  categorySlug: string;
  fallback: string;
}> = [
  { prefix: "shared-hosting-", categorySlug: "shared-hosting", fallback: "Shared Hosting" },
  { prefix: "cloud-hosting-", categorySlug: "cloud-hosting", fallback: "Cloud Hosting" },
  { prefix: "email-hosting-", categorySlug: "email-hosting", fallback: "Email Hosting" },
  { prefix: "reseller-hosting-", categorySlug: "reseller-hosting", fallback: "Reseller Hosting" },
  { prefix: "wordpress-hosting-", categorySlug: "wordpress-hosting", fallback: "WordPress Hosting" },
  { prefix: "vps-hosting-", categorySlug: "vps-hosting", fallback: "VPS Hosting" },
];

const SERVICE_CATEGORY_LABELS: Record<
  string,
  { nl: string; en: string }
> = {
  plans: { nl: "AI Compleet", en: "AI Complete" },
  "wordpress-support": { nl: "WordPress-beheer", en: "WordPress support" },
  "wordpress-care": { nl: "WordPress-zorg", en: "WordPress care" },
};

/** Parent category for cart/checkout titles (e.g. Cloud Hosting - Plus). */
export function shopProductCategoryLabel(
  product: Pick<ShopProduct, "slug" | "category">,
  locale: string,
): string | null {
  for (const entry of HOSTING_CATEGORY_BY_PREFIX) {
    if (product.slug.startsWith(entry.prefix)) {
      return catalogServiceTitle(entry.categorySlug, locale, entry.fallback);
    }
  }
  const category = product.category?.trim();
  if (!category || category === "hosting" || category === "other") return null;
  const pack = SERVICE_CATEGORY_LABELS[category];
  if (pack) return locale === "nl" ? pack.nl : pack.en;
  return null;
}

/**
 * Cart/checkout display name: "Cloud Hosting - Plus" when the SKU title
 * is only the plan tier (or otherwise needs its category).
 */
export function shopProductDisplayName(
  product: ShopProduct,
  locale: string,
): string {
  const name = localizeShopProduct(product, locale).localizedName.trim();
  const category = shopProductCategoryLabel(product, locale)?.trim();
  if (!category) return name;
  const nameLower = name.toLowerCase();
  const categoryLower = category.toLowerCase();
  if (
    nameLower === categoryLower ||
    nameLower.startsWith(`${categoryLower} `) ||
    nameLower.startsWith(`${categoryLower}-`) ||
    nameLower.startsWith(`${categoryLower} -`)
  ) {
    return name;
  }
  return `${category} - ${name}`;
}


type DbShopRow = {
  id: string;
  sku: string;
  slug: string;
  type: string;
  nameNl: string;
  nameEn: string;
  shortDescriptionNl: string;
  shortDescriptionEn: string;
  descriptionNl: string;
  descriptionEn: string;
  priceInclCents: number;
  discountPriceInclCents: number | null;
  currency: string;
  billingInterval: string;
  billAsYearlyPackage: boolean;
  checkoutMonths: number | null;
  category: string | null;
  lineOfBusiness?: string | null;
  image: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  planKey: string | null;
  tags: unknown;
};

export function mapDbShopProduct(row: DbShopRow): ShopProduct {
  const billingInterval = (
    ["one_time", "weekly", "monthly", "yearly"].includes(row.billingInterval)
      ? row.billingInterval
      : "one_time"
  ) as ShopBillingInterval;

  const type = (
    ["plan", "service", "product"].includes(row.type) ? row.type : "service"
  ) as ShopProductType;

  const planKey =
    row.planKey === "starter" || row.planKey === "growth" ? row.planKey : undefined;

  const billingPeriod: ShopBillingPeriod | undefined =
    billingInterval === "yearly"
      ? "yearly"
      : billingInterval === "monthly"
        ? "monthly"
        : undefined;

  const tags = Array.isArray(row.tags) ? row.tags.map(String) : [];
  const lineOfBusiness: ShopProductLineOfBusiness =
    row.lineOfBusiness === "HOSTING" ||
    row.category === "hosting" ||
    HOSTING_YEARLY_SLUGS.has(row.slug)
      ? "HOSTING"
      : "SERVICE";

  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    type,
    name: { nl: row.nameNl, en: row.nameEn },
    shortDescription: {
      nl: row.shortDescriptionNl,
      en: row.shortDescriptionEn,
    },
    description: { nl: row.descriptionNl, en: row.descriptionEn },
    priceInclCents: row.priceInclCents,
    discountPriceInclCents: row.discountPriceInclCents ?? null,
    checkoutMonths: row.checkoutMonths ?? undefined,
    billAsYearlyPackage: row.billAsYearlyPackage,
    currency: "EUR",
    image: row.image,
    billingInterval,
    billingPeriod,
    category: row.category,
    lineOfBusiness,
    planKey,
    featured: row.featured,
    published: row.published,
    sortOrder: row.sortOrder,
    tags,
  };
}

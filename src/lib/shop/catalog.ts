import importedProducts from "@/content/fixweb/imported-products.json";
import localImages from "@/content/fixweb/local-images.json";
import { getProductI18n } from "@/content/fixweb/product-i18n";
import { brandify } from "@/lib/brandify";
import type { ShopAdminBillingInterval } from "@/lib/shop/admin";
import { eurosToCents } from "@/lib/shop/vat";

export type ShopBillingPeriod = "monthly" | "yearly";
export type ShopProductType = "plan" | "service" | "product";
export type ShopBillingInterval = ShopAdminBillingInterval;

export type ShopProduct = {
  id: string;
  sku?: string;
  slug: string;
  type: ShopProductType;
  name: { nl: string; en: string };
  description: { nl: string; en: string };
  shortDescription: { nl: string; en: string };
  /** Unit price including 21% VAT, in euro cents (list/display price) */
  priceInclCents: number;
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
  planKey?: "starter" | "growth";
  featured?: boolean;
  published?: boolean;
  sortOrder?: number;
  tags?: string[];
};

/** Hosting plans listed monthly but sold as a 12-month package. */
export const HOSTING_YEARLY_SLUGS = new Set([
  "shared-hosting-basic",
  "shared-hosting-plus",
  "shared-hosting-business",
  "wordpress-hosting-basic",
  "wordpress-hosting-plus",
  "wordpress-hosting-business",
  "vps-hosting-basic",
  "vps-hosting-plus",
  "vps-hosting-business",
]);

/** WordPress support packages with monthly + discounted yearly billing. */
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

export function isSupportPackageSlug(slug: string) {
  return (
    SUPPORT_BASE_SLUGS.has(slug) ||
    SUPPORT_PACKAGE_KEYS.some((key) => slug === `${key}-support-yearly`)
  );
}

/** Charged unit price (incl. VAT cents) used in cart / Stripe. */
export function shopChargeInclCents(product: ShopProduct) {
  const months =
    product.checkoutMonths && product.checkoutMonths > 1
      ? product.checkoutMonths
      : product.billAsYearlyPackage
        ? 12
        : 1;
  return product.priceInclCents * months;
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

const PLAN_COPY = {
  starter: {
    name: { nl: "Business", en: "Business" },
    short: {
      nl: "Compleet startpakket: domein, hosting, webshop/website, 1 AI-agent, AEO/GEO/SEO basic en premium support.",
      en: "Complete starter pack: domain, hosting, shop/website, 1 AI agent, AEO/GEO/SEO basic and premium support.",
    },
    featuresNl: [
      "1× domeinnaam .COM / .EU / .NL",
      "1× webhosting",
      "1× e-commerce shop / website",
      "1× AI-agent",
      "AI-scanner",
      "AEO, GEO & SEO basic",
      "Premium support",
      "24/7 monitoring",
    ],
    featuresEn: [
      "1× domain .COM / .EU / .NL",
      "1× web hosting",
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
      nl: "Groeiplan met 2 AI-agents, AEO/GEO/SEO plus, hosting, webshop/website en premium support.",
      en: "Growth plan with 2 AI agents, AEO/GEO/SEO plus, hosting, shop/website and premium support.",
    },
    featuresNl: [
      "1× domeinnaam .COM / .EU / .NL",
      "1× webhosting",
      "1× e-commerce shop / website",
      "2× AI-agents",
      "AI-scanner",
      "AEO, GEO & SEO plus",
      "Premium support",
      "24/7 monitoring",
    ],
    featuresEn: [
      "1× domain .COM / .EU / .NL",
      "1× web hosting",
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
      nl: `${copy.short.nl} Eenmalige ${periodLabel.nl}. Inclusief 21% BTW.`,
      en: `${copy.short.en} One-time ${periodLabel.en}. Including 21% VAT.`,
    },
    description: {
      nl: `${copy.short.nl}\n\nInbegrepen:\n${copy.featuresNl.map((f) => `– ${f}`).join("\n")}\n\nBetaling: eenmalig voor de geselecteerde periode (${periodLabel.nl}). Inclusief 21% BTW.`,
      en: `${copy.short.en}\n\nIncluded:\n${copy.featuresEn.map((f) => `– ${f}`).join("\n")}\n\nPayment: one-time for the selected period (${periodLabel.en}). Including 21% VAT.`,
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
          nl: `${shortNl}\n\nFacturatie: ${periodLabel.nl}. Inclusief 21% BTW.`,
          en: `${shortEn}\n\nBilling: ${periodLabel.en}. Including 21% VAT.`,
        },
        description: {
          nl: `${descNl}\n\nBetaling: ${periodLabel.nl}${
            period === "yearly" ? ` (bespaar ${pricing.savePercent}%)` : ""
          }. Inclusief 21% BTW.`,
          en: `${descEn}\n\nPayment: ${periodLabel.en}${
            period === "yearly" ? ` (save ${pricing.savePercent}%)` : ""
          }. Including 21% VAT.`,
        },
        priceInclCents: eurosToCents(price),
        currency: "EUR",
        image,
        billingPeriod: period,
        billingInterval: period,
        category: "wordpress-support",
        featured: key === "double",
        published: true,
        sortOrder: sortBase + (period === "yearly" ? 3 : 0),
        tags: ["wordpress-support", key, period],
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
      currency: "EUR" as const,
      image,
      published: true,
      sortOrder: 100 + index,
    };
  });
}

/** Built-in catalog used as seed + fallback when the DB is empty. */
export const STATIC_SHOP_CATALOG: ShopProduct[] = [
  buildPlanProduct("starter", "monthly"),
  buildPlanProduct("starter", "yearly"),
  buildPlanProduct("growth", "monthly"),
  buildPlanProduct("growth", "yearly"),
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
  return {
    ...product,
    localizedName: product.name[lang],
    localizedShort: product.shortDescription[lang],
    localizedDescription: product.description[lang],
  };
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
  currency: string;
  billingInterval: string;
  billAsYearlyPackage: boolean;
  checkoutMonths: number | null;
  category: string | null;
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
    checkoutMonths: row.checkoutMonths ?? undefined,
    billAsYearlyPackage: row.billAsYearlyPackage,
    currency: "EUR",
    image: row.image,
    billingInterval,
    billingPeriod,
    category: row.category,
    planKey,
    featured: row.featured,
    published: row.published,
    sortOrder: row.sortOrder,
    tags,
  };
}

/** Server-side: load published products from DB, fall back to static catalog. */
export async function loadShopCatalogFromDb(opts?: {
  includeUnpublished?: boolean;
}): Promise<ShopProduct[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.shopCatalogProduct.findMany({
      where: opts?.includeUnpublished ? undefined : { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    if (!rows.length) return STATIC_SHOP_CATALOG;
    const mapped = rows.map(mapDbShopProduct);
    if (!opts?.includeUnpublished) setRuntimeShopCatalog(mapped);
    return mapped;
  } catch (error) {
    console.warn(
      "[shop] DB catalog unavailable, using static fallback",
      error instanceof Error ? error.message : error,
    );
    return STATIC_SHOP_CATALOG;
  }
}

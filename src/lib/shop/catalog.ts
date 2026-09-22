import importedProducts from "@/content/fixweb/imported-products.json";
import localImages from "@/content/fixweb/local-images.json";
import { getProductI18n } from "@/content/fixweb/product-i18n";
import { brandify } from "@/lib/brandify";
import { eurosToCents } from "@/lib/shop/vat";

export type ShopBillingPeriod = "monthly" | "yearly";
export type ShopProductType = "plan" | "service";

export type ShopProduct = {
  id: string;
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
  billingPeriod?: ShopBillingPeriod;
  planKey?: "starter" | "growth";
  featured?: boolean;
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

/** Charged unit price (incl. VAT cents) used in cart / Stripe. */
export function shopChargeInclCents(product: ShopProduct) {
  const months = product.checkoutMonths && product.checkoutMonths > 1
    ? product.checkoutMonths
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
    planKey,
    featured: planKey === "growth",
  };
}

function buildServiceProducts(): ShopProduct[] {
  return imported.map((p) => {
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
      slug: p.slug,
      type: "service",
      name: { nl: nameNl, en: nameEn },
      shortDescription: { nl: shortNl, en: shortEn },
      description: { nl: descNl, en: descEn },
      priceInclCents: eurosToCents(p.price),
      checkoutMonths: yearlyHosting ? 12 : undefined,
      billingPeriod: yearlyHosting ? "yearly" : undefined,
      currency: "EUR",
      image,
    };
  });
}

const CATALOG: ShopProduct[] = [
  buildPlanProduct("starter", "monthly"),
  buildPlanProduct("starter", "yearly"),
  buildPlanProduct("growth", "monthly"),
  buildPlanProduct("growth", "yearly"),
  ...buildServiceProducts(),
];

const byId = new Map(CATALOG.map((p) => [p.id, p]));
const bySlug = new Map(CATALOG.map((p) => [p.slug, p]));

export function listShopProducts(opts?: { type?: ShopProductType }) {
  if (!opts?.type) return CATALOG;
  return CATALOG.filter((p) => p.type === opts.type);
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

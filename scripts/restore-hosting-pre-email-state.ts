/**
 * Restore hosting plans after accidental shop:seed --force.
 * Rebuilds names + specs from product-i18n / STATIC catalog and
 * restores known-good list/sale prices (promo pattern).
 * Keeps E-mail Hosting; does not delete anything.
 *
 *   npm run shop:repair-hosting
 *   npx tsx --env-file=.env scripts/restore-hosting-pre-email-state.ts
 */
import { prisma } from "../src/lib/prisma";
import { getProductI18n } from "../src/content/fixweb/product-i18n";
import { STATIC_SHOP_CATALOG } from "../src/lib/shop/catalog";

/** List / sale (EUR). Sale must be lower than list when set. */
const PRICES: Record<string, { list: number; sale: number | null }> = {
  "shared-hosting-basic": { list: 4.99, sale: 4.13 },
  "shared-hosting-business": { list: 7.99, sale: 5.98 },
  "shared-hosting-plus": { list: 13.99, sale: 8.75 },
  "cloud-hosting-start": { list: 25.99, sale: 11.99 },
  "cloud-hosting-basic": { list: 45.99, sale: 21.99 },
  "cloud-hosting-plus": { list: 64.99, sale: 41.99 },
  "email-hosting-basic": { list: 2.7, sale: null },
  "email-hosting-business": { list: 3.25, sale: null },
  "email-hosting-plus": { list: 5.5, sale: null },
  "reseller-hosting-start": { list: 14.85, sale: 11.99 },
  "reseller-hosting-basic": { list: 20.25, sale: 14.99 },
  "reseller-hosting-business": { list: 26.5, sale: 19.99 },
  "reseller-hosting-plus": { list: 37.5, sale: 33.99 },
  "wordpress-hosting-basic": { list: 6.35, sale: 4.99 },
  "wordpress-hosting-business": { list: 11.89, sale: 7.99 },
  "wordpress-hosting-plus": { list: 18.35, sale: 13.99 },
  "vps-hosting-start": { list: 17.99, sale: 8.99 },
  "vps-hosting-basic": { list: 10.99, sale: 9.12 },
  "vps-hosting-business": { list: 15.99, sale: 14.66 },
  "vps-hosting-plus": { list: 29.99, sale: 26.65 },
};

const NAMES: Record<string, { nl: string; en: string }> = {
  "shared-hosting-basic": { nl: "Shared Hosting Basic", en: "Shared Hosting Basic" },
  "shared-hosting-business": { nl: "Shared Hosting Business", en: "Shared Hosting Business" },
  "shared-hosting-plus": { nl: "Shared Hosting Plus", en: "Shared Hosting Plus" },
  "cloud-hosting-start": { nl: "Cloud Hosting Start", en: "Cloud Hosting Start" },
  "cloud-hosting-basic": { nl: "Cloud Hosting Basic", en: "Cloud Hosting Basic" },
  "cloud-hosting-plus": { nl: "Cloud Hosting Plus", en: "Cloud Hosting Plus" },
  "email-hosting-basic": { nl: "E-mail Hosting Basic", en: "Email Hosting Basic" },
  "email-hosting-business": { nl: "E-mail Hosting Business", en: "Email Hosting Business" },
  "email-hosting-plus": { nl: "E-mail Hosting Plus", en: "Email Hosting Plus" },
  "reseller-hosting-start": { nl: "Reseller Hosting Start", en: "Reseller Hosting Start" },
  "reseller-hosting-basic": { nl: "Reseller Hosting Basic", en: "Reseller Hosting Basic" },
  "reseller-hosting-business": { nl: "Reseller Hosting Business", en: "Reseller Hosting Business" },
  "reseller-hosting-plus": { nl: "Reseller Hosting Plus", en: "Reseller Hosting Plus" },
  "wordpress-hosting-basic": { nl: "WordPress Hosting Basic", en: "WordPress Hosting Basic" },
  "wordpress-hosting-business": { nl: "WordPress Hosting Business", en: "WordPress Hosting Business" },
  "wordpress-hosting-plus": { nl: "WordPress Hosting Plus", en: "WordPress Hosting Plus" },
  "vps-hosting-start": { nl: "VPS Hosting Start", en: "VPS Hosting Start" },
  "vps-hosting-basic": { nl: "VPS Hosting Basic", en: "VPS Hosting Basic" },
  "vps-hosting-business": { nl: "VPS Hosting Business", en: "VPS Hosting Business" },
  "vps-hosting-plus": { nl: "VPS Hosting Plus", en: "VPS Hosting Plus" },
};

function eurosToCents(euros: number) {
  return Math.round(euros * 100);
}

async function main() {
  let updated = 0;

  for (const [slug, names] of Object.entries(NAMES)) {
    const prices = PRICES[slug];
    if (!prices) continue;

    const existing = await prisma.shopCatalogProduct.findUnique({ where: { slug } });
    if (!existing) {
      console.log("skip missing", slug);
      continue;
    }

    const i18nNl = getProductI18n(slug, "nl");
    const i18nEn = getProductI18n(slug, "en");
    const staticRow = STATIC_SHOP_CATALOG.find((p) => p.slug === slug);

    const shortNl =
      i18nNl?.shortDescription?.trim() ||
      staticRow?.shortDescription.nl ||
      existing.shortDescriptionNl;
    const shortEn =
      i18nEn?.shortDescription?.trim() ||
      staticRow?.shortDescription.en ||
      existing.shortDescriptionEn;
    const descNl =
      i18nNl?.description?.trim() ||
      staticRow?.description.nl ||
      existing.descriptionNl;
    const descEn =
      i18nEn?.description?.trim() ||
      staticRow?.description.en ||
      existing.descriptionEn;

    await prisma.shopCatalogProduct.update({
      where: { slug },
      data: {
        nameNl: names.nl,
        nameEn: names.en,
        shortDescriptionNl: shortNl,
        shortDescriptionEn: shortEn,
        descriptionNl: descNl,
        descriptionEn: descEn,
        priceInclCents: eurosToCents(prices.list),
        discountPriceInclCents:
          prices.sale == null ? null : eurosToCents(prices.sale),
        billAsYearlyPackage: true,
        checkoutMonths: 12,
        billingInterval: "yearly",
        category: "hosting",
        lineOfBusiness: "HOSTING",
        published: true,
      },
    });

    updated += 1;
    console.log(
      "restored",
      slug,
      names.nl,
      `list €${prices.list.toFixed(2)}`,
      prices.sale != null ? `sale €${prices.sale.toFixed(2)}` : "no sale",
    );
  }

  console.log(JSON.stringify({ updated }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

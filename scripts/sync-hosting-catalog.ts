/**
 * Insert missing hosting products from STATIC_SHOP_CATALOG.
 * Existing rows keep the copy and prices saved in hosting-admin.
 *
 *   npx tsx scripts/sync-hosting-catalog.ts
 */
import { prisma } from "../src/lib/prisma";
import {
  HOSTING_YEARLY_SLUGS,
  STATIC_SHOP_CATALOG,
} from "../src/lib/shop/catalog";

const HOSTING_SORT: Record<string, number> = {
  "shared-hosting-basic": 100,
  "shared-hosting-business": 101,
  "shared-hosting-plus": 102,
  "cloud-hosting-start": 105,
  "cloud-hosting-basic": 106,
  "cloud-hosting-plus": 107,
  "reseller-hosting-start": 108,
  "reseller-hosting-basic": 109,
  "reseller-hosting-business": 110,
  "reseller-hosting-plus": 111,
  "wordpress-hosting-basic": 112,
  "wordpress-hosting-business": 113,
  "wordpress-hosting-plus": 114,
  "vps-hosting-start": 119,
  "vps-hosting-basic": 120,
  "vps-hosting-business": 121,
  "vps-hosting-plus": 122,
};

async function main() {
  const hosting = STATIC_SHOP_CATALOG.filter((p) =>
    HOSTING_YEARLY_SLUGS.has(p.slug),
  );

  for (const product of hosting) {
    const sortOrder = HOSTING_SORT[product.slug] ?? product.sortOrder ?? 100;
    const data = {
      sku: product.sku || `SVC-${product.slug.toUpperCase()}`,
      slug: product.slug,
      type: product.type,
      nameNl: product.name.nl,
      nameEn: product.name.en,
      shortDescriptionNl: product.shortDescription.nl,
      shortDescriptionEn: product.shortDescription.en,
      descriptionNl: product.description.nl,
      descriptionEn: product.description.en,
      priceInclCents: product.priceInclCents,
      discountPriceInclCents: product.discountPriceInclCents ?? null,
      currency: "EUR",
      billingInterval: product.billingInterval || "yearly",
      billAsYearlyPackage: product.billAsYearlyPackage ?? true,
      checkoutMonths: product.checkoutMonths ?? 12,
      category: product.category || "hosting",
      lineOfBusiness: "HOSTING" as const,
      image: product.image || null,
      featured: product.featured ?? false,
      published: product.published !== false,
      sortOrder,
      planKey: null as string | null,
      tags: product.tags || ["hosting"],
    };

    const existing = await prisma.shopCatalogProduct.findUnique({
      where: { slug: product.slug },
    });
    if (existing) {
      // Never overwrite copy or prices already saved in hosting-admin.
      await prisma.shopCatalogProduct.update({
        where: { slug: product.slug },
        data: {
          lineOfBusiness: "HOSTING",
          category: existing.category || "hosting",
          sortOrder,
          billAsYearlyPackage: existing.billAsYearlyPackage || data.billAsYearlyPackage,
          checkoutMonths: existing.checkoutMonths ?? data.checkoutMonths,
        },
      });
      console.log("kept", product.slug);
      continue;
    }

    await prisma.shopCatalogProduct.create({
      data: { id: product.id, ...data },
    });

    console.log(
      "synced",
      product.slug,
      `€${(product.priceInclCents / 100).toFixed(2)}`,
      product.shortDescription.nl.split("\n").slice(0, 2).join(" · "),
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

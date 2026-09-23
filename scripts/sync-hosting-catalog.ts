/**
 * Sync hosting products in ShopCatalogProduct from STATIC_SHOP_CATALOG
 * (imported-products + product-i18n). Use after fixing specs/prices in static files.
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
  "wordpress-hosting-basic": 110,
  "wordpress-hosting-business": 111,
  "wordpress-hosting-plus": 112,
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
      image: product.image || null,
      featured: product.featured ?? false,
      published: product.published !== false,
      sortOrder,
      planKey: null as string | null,
      tags: product.tags || ["hosting"],
    };

    await prisma.shopCatalogProduct.upsert({
      where: { slug: product.slug },
      create: { id: product.id, ...data },
      update: data,
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

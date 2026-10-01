/**
 * Seed ShopCatalogProduct from the static shop catalog.
 *
 *   npm run shop:seed
 *   npm run shop:seed -- --force            # update non-hosting rows only
 *   npm run shop:seed -- --force-hosting    # ALSO overwrite hosting (dangerous)
 *
 * Hosting rows (shared/cloud/email/reseller/wordpress/vps) are NEVER updated
 * by default — even with --force — so hosting-admin prices/names/specs stay
 * intact when adding new products (e.g. email hosting).
 */
import { prisma } from "../src/lib/prisma";
import {
  HOSTING_YEARLY_SLUGS,
  STATIC_SHOP_CATALOG,
} from "../src/lib/shop/catalog";
import { lineOfBusinessFromProduct } from "../src/lib/shop/line-of-business";

const force = process.argv.includes("--force");
const forceHosting = process.argv.includes("--force-hosting");

function isHostingProduct(slug: string) {
  return HOSTING_YEARLY_SLUGS.has(slug) || slug.startsWith("email-hosting-");
}

async function main() {
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let hostingProtected = 0;

  for (const [index, product] of STATIC_SHOP_CATALOG.entries()) {
    const sku =
      product.sku ||
      `SKU-${product.id.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 40)}`;

    const existing = await prisma.shopCatalogProduct.findFirst({
      where: { OR: [{ id: product.id }, { sku }, { slug: product.slug }] },
    });

    const lineOfBusiness = lineOfBusinessFromProduct({
      slug: product.slug,
      category: product.category,
      lineOfBusiness: product.lineOfBusiness,
    });

    const data = {
      sku,
      slug: product.slug,
      type: product.type,
      nameNl: product.name.nl,
      nameEn: product.name.en,
      shortDescriptionNl: product.shortDescription.nl,
      shortDescriptionEn: product.shortDescription.en,
      descriptionNl: product.description.nl,
      descriptionEn: product.description.en,
      priceInclCents: product.priceInclCents,
      currency: "EUR",
      billingInterval: product.billingInterval || "one_time",
      billAsYearlyPackage: Boolean(product.billAsYearlyPackage),
      checkoutMonths: product.checkoutMonths ?? null,
      category: product.category || null,
      lineOfBusiness,
      image: product.image || null,
      featured: Boolean(product.featured),
      published: product.published !== false,
      sortOrder: product.sortOrder ?? index,
      planKey: product.planKey || null,
      tags: product.tags || [],
    };

    if (!existing) {
      await prisma.shopCatalogProduct.create({
        data: { id: product.id, ...data },
      });
      created += 1;
      console.log(`created ${product.id}`);
      continue;
    }

    if (!force && !forceHosting) {
      skipped += 1;
      continue;
    }

    if (isHostingProduct(product.slug) && !forceHosting) {
      // Keep hosting-admin copy/prices. Only refresh structural metadata.
      await prisma.shopCatalogProduct.update({
        where: { id: existing.id },
        data: {
          lineOfBusiness: "HOSTING",
          category: existing.category || "hosting",
          billAsYearlyPackage:
            existing.billAsYearlyPackage || data.billAsYearlyPackage,
          checkoutMonths: existing.checkoutMonths ?? data.checkoutMonths,
          image: existing.image || data.image,
        },
      });
      hostingProtected += 1;
      console.log(`protected hosting ${existing.slug}`);
      continue;
    }

    await prisma.shopCatalogProduct.update({
      where: { id: existing.id },
      data,
    });
    updated += 1;
    console.log(`updated ${existing.id}`);
  }

  console.log(
    JSON.stringify(
      { created, updated, skipped, hostingProtected, force, forceHosting },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

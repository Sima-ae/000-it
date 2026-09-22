/**
 * Seed ShopCatalogProduct from the static shop catalog.
 *
 *   npm run shop:seed
 *   npm run shop:seed -- --force   # update existing rows by id
 */
import { prisma } from "../src/lib/prisma";
import { STATIC_SHOP_CATALOG } from "../src/lib/shop/catalog";

const force = process.argv.includes("--force");

async function main() {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const [index, product] of STATIC_SHOP_CATALOG.entries()) {
    const sku =
      product.sku ||
      `SKU-${product.id.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 40)}`;

    const existing = await prisma.shopCatalogProduct.findFirst({
      where: { OR: [{ id: product.id }, { sku }, { slug: product.slug }] },
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

    if (!force) {
      skipped += 1;
      continue;
    }

    await prisma.shopCatalogProduct.update({
      where: { id: existing.id },
      data,
    });
    updated += 1;
    console.log(`updated ${existing.id}`);
  }

  console.log(JSON.stringify({ created, updated, skipped, force }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

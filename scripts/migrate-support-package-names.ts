/**
 * One-off: rename Basic/Standard support products in ShopCatalogProduct to Pro/Double.
 *   npx tsx scripts/migrate-support-package-names.ts
 */
import { prisma } from "../src/lib/prisma";
import { STATIC_SHOP_CATALOG } from "../src/lib/shop/catalog";

const renames: Record<string, string> = {
  "service-basic-support": "service-pro-support",
  "service-basic-support-yearly": "service-pro-support-yearly",
  "service-standard-support": "service-double-support",
  "service-standard-support-yearly": "service-double-support-yearly",
};

async function upsertFromStatic(newId: string) {
  const fresh = STATIC_SHOP_CATALOG.find((p) => p.id === newId);
  if (!fresh) throw new Error(`missing static product ${newId}`);

  const data = {
    sku: fresh.sku || `SVC-${fresh.slug.toUpperCase()}`,
    slug: fresh.slug,
    type: fresh.type,
    nameNl: fresh.name.nl,
    nameEn: fresh.name.en,
    shortDescriptionNl: fresh.shortDescription.nl,
    shortDescriptionEn: fresh.shortDescription.en,
    descriptionNl: fresh.description.nl,
    descriptionEn: fresh.description.en,
    priceInclCents: fresh.priceInclCents,
    currency: "EUR" as const,
    billingInterval: fresh.billingInterval || "one_time",
    billAsYearlyPackage: Boolean(fresh.billAsYearlyPackage),
    checkoutMonths: fresh.checkoutMonths ?? null,
    category: fresh.category || null,
    image: fresh.image || null,
    featured: Boolean(fresh.featured),
    published: fresh.published !== false,
    sortOrder: fresh.sortOrder ?? 0,
    planKey: fresh.planKey || null,
    tags: fresh.tags || [],
  };

  const existingNew = await prisma.shopCatalogProduct.findUnique({ where: { id: newId } });
  if (existingNew) {
    await prisma.shopCatalogProduct.update({ where: { id: newId }, data });
    return "updated";
  }
  await prisma.shopCatalogProduct.create({ data: { id: newId, ...data } });
  return "created";
}

async function main() {
  for (const [oldId, newId] of Object.entries(renames)) {
    const existingOld = await prisma.shopCatalogProduct.findUnique({ where: { id: oldId } });
    const action = await upsertFromStatic(newId);
    if (existingOld) {
      await prisma.shopCatalogProduct.delete({ where: { id: oldId } });
      console.log(`${action} ${newId}; deleted ${oldId}`);
    } else {
      console.log(`${action} ${newId}; no old row ${oldId}`);
    }
  }

  const leftovers = await prisma.shopCatalogProduct.findMany({
    where: {
      slug: {
        in: [
          "basic-support",
          "basic-support-yearly",
          "standard-support",
          "standard-support-yearly",
        ],
      },
    },
    select: { id: true, slug: true },
  });
  for (const row of leftovers) {
    await prisma.shopCatalogProduct.delete({ where: { id: row.id } });
    console.log("deleted leftover", row.slug);
  }

  const check = await prisma.shopCatalogProduct.findMany({
    where: { slug: { contains: "support" } },
    select: { id: true, slug: true, nameNl: true },
    orderBy: { slug: "asc" },
  });
  console.log(JSON.stringify(check, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

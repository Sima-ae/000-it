import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  "seo-optimization": 130,
};

async function main() {
  const business = await prisma.shopCatalogProduct.findUniqueOrThrow({
    where: { slug: "wordpress-hosting-business" },
  });
  const plus = await prisma.shopCatalogProduct.findUniqueOrThrow({
    where: { slug: "wordpress-hosting-plus" },
  });

  // Swap bodies so slug order Basic → Business → Plus matches capacity.
  // business slug gets former Plus (mid); plus slug gets former Pro (top).
  await prisma.shopCatalogProduct.update({
    where: { slug: "wordpress-hosting-business" },
    data: {
      nameNl: "WordPress Hosting Business",
      nameEn: "WordPress Hosting Business",
      shortDescriptionNl: plus.shortDescriptionNl.replaceAll(
        "WordPress Hosting Plus",
        "WordPress Hosting Business",
      ),
      shortDescriptionEn: plus.shortDescriptionEn.replaceAll(
        "WordPress Hosting Plus",
        "WordPress Hosting Business",
      ),
      descriptionNl: plus.descriptionNl.replaceAll(
        "WordPress Hosting Plus",
        "WordPress Hosting Business",
      ),
      descriptionEn: plus.descriptionEn.replaceAll(
        "WordPress Hosting Plus",
        "WordPress Hosting Business",
      ),
      priceInclCents: plus.priceInclCents,
      image: plus.image,
    },
  });

  await prisma.shopCatalogProduct.update({
    where: { slug: "wordpress-hosting-plus" },
    data: {
      nameNl: "WordPress Hosting Plus",
      nameEn: "WordPress Hosting Plus",
      shortDescriptionNl: business.shortDescriptionNl.replaceAll(
        "WordPress Hosting Pro",
        "WordPress Hosting Plus",
      ),
      shortDescriptionEn: business.shortDescriptionEn.replaceAll(
        "WordPress Hosting Pro",
        "WordPress Hosting Plus",
      ),
      descriptionNl: business.descriptionNl.replaceAll(
        "WordPress Hosting Pro",
        "WordPress Hosting Plus",
      ),
      descriptionEn: business.descriptionEn.replaceAll(
        "WordPress Hosting Pro",
        "WordPress Hosting Plus",
      ),
      priceInclCents: business.priceInclCents,
      image: business.image,
    },
  });

  const all = await prisma.shopCatalogProduct.findMany({
    where: { type: { in: ["service", "product"] } },
    select: { id: true, slug: true, sortOrder: true },
  });

  for (const [slug, sortOrder] of Object.entries(HOSTING_SORT)) {
    await prisma.shopCatalogProduct.updateMany({
      where: { slug },
      data: { sortOrder },
    });
  }

  const others = all
    .filter((p) => !(p.slug in HOSTING_SORT) && !p.slug.includes("support"))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));

  let next = 200;
  for (const p of others) {
    await prisma.shopCatalogProduct.update({
      where: { id: p.id },
      data: { sortOrder: next++ },
    });
  }

  const check = await prisma.shopCatalogProduct.findMany({
    where: {
      OR: [{ slug: { contains: "hosting" } }, { slug: "seo-optimization" }],
    },
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true,
      nameNl: true,
      sortOrder: true,
      priceInclCents: true,
    },
  });
  console.log(JSON.stringify(check, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

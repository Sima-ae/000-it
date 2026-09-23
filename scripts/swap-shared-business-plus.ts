import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const business = await prisma.shopCatalogProduct.findUniqueOrThrow({
    where: { slug: "shared-hosting-business" },
  });
  const plus = await prisma.shopCatalogProduct.findUniqueOrThrow({
    where: { slug: "shared-hosting-plus" },
  });

  // Mid (current Plus) → Business; top price (current Business) → Plus
  await prisma.shopCatalogProduct.update({
    where: { slug: "shared-hosting-business" },
    data: {
      nameNl: "Shared Hosting Business",
      nameEn: "Shared Hosting Business",
      shortDescriptionNl: plus.shortDescriptionNl.replaceAll(
        "Shared Hosting Plus",
        "Shared Hosting Business",
      ),
      shortDescriptionEn: plus.shortDescriptionEn.replaceAll(
        "Shared Hosting Plus",
        "Shared Hosting Business",
      ),
      descriptionNl: plus.descriptionNl.replaceAll(
        "Shared Hosting Plus",
        "Shared Hosting Business",
      ),
      descriptionEn: plus.descriptionEn.replaceAll(
        "Shared Hosting Plus",
        "Shared Hosting Business",
      ),
      priceInclCents: plus.priceInclCents,
      discountPriceInclCents: plus.discountPriceInclCents,
      image: plus.image,
      sortOrder: 101,
    },
  });

  await prisma.shopCatalogProduct.update({
    where: { slug: "shared-hosting-plus" },
    data: {
      nameNl: "Shared Hosting Plus",
      nameEn: "Shared Hosting Plus",
      shortDescriptionNl: business.shortDescriptionNl.replaceAll(
        "Shared Hosting Business",
        "Shared Hosting Plus",
      ),
      shortDescriptionEn: business.shortDescriptionEn.replaceAll(
        "Shared Hosting Business",
        "Shared Hosting Plus",
      ),
      descriptionNl: business.descriptionNl.replaceAll(
        "Shared Hosting Business",
        "Shared Hosting Plus",
      ),
      descriptionEn: business.descriptionEn.replaceAll(
        "Shared Hosting Business",
        "Shared Hosting Plus",
      ),
      priceInclCents: business.priceInclCents,
      discountPriceInclCents: business.discountPriceInclCents,
      image: business.image,
      sortOrder: 102,
    },
  });

  const check = await prisma.shopCatalogProduct.findMany({
    where: { slug: { startsWith: "shared-hosting-" } },
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true,
      nameNl: true,
      priceInclCents: true,
      shortDescriptionNl: true,
      sortOrder: true,
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

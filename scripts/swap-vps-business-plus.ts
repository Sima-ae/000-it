import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const business = await prisma.shopCatalogProduct.findUniqueOrThrow({
    where: { slug: "vps-hosting-business" },
  });
  const plus = await prisma.shopCatalogProduct.findUniqueOrThrow({
    where: { slug: "vps-hosting-plus" },
  });

  // Mid specs (current Plus) → Business; top specs (current Business) → Plus
  await prisma.shopCatalogProduct.update({
    where: { slug: "vps-hosting-business" },
    data: {
      nameNl: "VPS Hosting Business",
      nameEn: "VPS Hosting Business",
      shortDescriptionNl: plus.shortDescriptionNl.replaceAll(
        "VPS Hosting Plus",
        "VPS Hosting Business",
      ),
      shortDescriptionEn: plus.shortDescriptionEn.replaceAll(
        "VPS Hosting Plus",
        "VPS Hosting Business",
      ),
      descriptionNl: plus.descriptionNl.replaceAll(
        "VPS Hosting Plus",
        "VPS Hosting Business",
      ),
      descriptionEn: plus.descriptionEn.replaceAll(
        "VPS Hosting Plus",
        "VPS Hosting Business",
      ),
      priceInclCents: plus.priceInclCents,
      image: plus.image,
      sortOrder: 121,
    },
  });

  await prisma.shopCatalogProduct.update({
    where: { slug: "vps-hosting-plus" },
    data: {
      nameNl: "VPS Hosting Plus",
      nameEn: "VPS Hosting Plus",
      shortDescriptionNl: business.shortDescriptionNl.replaceAll(
        "VPS Hosting Business",
        "VPS Hosting Plus",
      ),
      shortDescriptionEn: business.shortDescriptionEn.replaceAll(
        "VPS Hosting Business",
        "VPS Hosting Plus",
      ),
      descriptionNl: business.descriptionNl.replaceAll(
        "VPS Hosting Business",
        "VPS Hosting Plus",
      ),
      descriptionEn: business.descriptionEn.replaceAll(
        "VPS Hosting Business",
        "VPS Hosting Plus",
      ),
      priceInclCents: business.priceInclCents,
      image: business.image,
      sortOrder: 122,
    },
  });

  const check = await prisma.shopCatalogProduct.findMany({
    where: { slug: { startsWith: "vps-hosting-" } },
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

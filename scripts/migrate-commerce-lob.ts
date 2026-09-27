import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const hostingSlugs = [
  "web-hosting",
  "shared-hosting-basic",
  "shared-hosting-plus",
  "shared-hosting-business",
  "wordpress-hosting-basic",
  "wordpress-hosting-plus",
  "wordpress-hosting-business",
  "vps-hosting-basic",
  "vps-hosting-plus",
  "vps-hosting-business",
];

async function main() {
  const bySlug = await prisma.shopCatalogProduct.updateMany({
    where: {
      OR: [
        { category: "hosting" },
        { slug: { in: hostingSlugs } },
        { slug: { startsWith: "shared-hosting-" } },
        { slug: { startsWith: "wordpress-hosting-" } },
        { slug: { startsWith: "vps-hosting-" } },
      ],
    },
    data: { lineOfBusiness: "HOSTING" },
  });
  console.log("products HOSTING", bySlug.count);

  const orders = await prisma.shopOrder.findMany({ include: { items: true } });
  let tagged = 0;
  for (const o of orders) {
    const products = await prisma.shopCatalogProduct.findMany({
      where: { id: { in: o.items.map((i) => i.productId) } },
      select: { id: true, lineOfBusiness: true, slug: true, category: true },
    });
    const allHosting =
      products.length > 0 &&
      products.every(
        (p) =>
          p.lineOfBusiness === "HOSTING" ||
          p.category === "hosting" ||
          hostingSlugs.includes(p.slug),
      );
    if (allHosting) {
      await prisma.shopOrder.update({
        where: { id: o.id },
        data: { lineOfBusiness: "HOSTING" },
      });
      await prisma.shopOrderItem.updateMany({
        where: { orderId: o.id },
        data: { lineOfBusiness: "HOSTING" },
      });
      tagged += 1;
    }
  }
  console.log("orders tagged HOSTING", tagged);

  const { markupPercentForBuyPriceCents } = await import(
    "../src/lib/domains/pricing"
  );
  const tlds = [
    { tld: "nl", basePriceInCents: 550 },
    { tld: "com", basePriceInCents: 1100 },
    { tld: "eu", basePriceInCents: 650 },
    { tld: "be", basePriceInCents: 700 },
    { tld: "net", basePriceInCents: 1200 },
    { tld: "org", basePriceInCents: 1100 },
    { tld: "io", basePriceInCents: 3500 },
    { tld: "app", basePriceInCents: 1400 },
    { tld: "dev", basePriceInCents: 1400 },
    { tld: "online", basePriceInCents: 300 },
  ].map((t) => ({
    ...t,
    markupFixedCents: 0,
    markupPercent: markupPercentForBuyPriceCents(t.basePriceInCents),
  }));
  for (const t of tlds) {
    await prisma.domainProduct.upsert({
      where: { tld: t.tld },
      update: t,
      create: { ...t, isActive: true },
    });
  }
  console.log("seeded TLDs", tlds.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

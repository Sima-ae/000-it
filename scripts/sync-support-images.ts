import { prisma } from "../src/lib/prisma";
import { STATIC_SHOP_CATALOG } from "../src/lib/shop/catalog";

async function main() {
  const slugs = [
    "pro-support",
    "pro-support-yearly",
    "double-support",
    "double-support-yearly",
    "premium-support",
    "premium-support-yearly",
  ];
  for (const product of STATIC_SHOP_CATALOG.filter((p) => slugs.includes(p.slug))) {
    const row = await prisma.shopCatalogProduct.findUnique({ where: { id: product.id } });
    if (!row) {
      console.log("missing", product.id);
      continue;
    }
    if (row.image !== (product.image || null)) {
      await prisma.shopCatalogProduct.update({
        where: { id: product.id },
        data: { image: product.image || null },
      });
      console.log("fixed", product.slug, row.image, "->", product.image);
    } else {
      console.log("ok", product.slug, row.image);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

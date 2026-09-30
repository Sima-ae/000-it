import {
  mapDbShopProduct,
  setRuntimeShopCatalog,
  STATIC_SHOP_CATALOG,
  type ShopProduct,
} from "@/lib/shop/catalog";

/** Server-side: load published products from DB, fall back to static catalog. */
export async function loadShopCatalogFromDb(opts?: {
  includeUnpublished?: boolean;
}): Promise<ShopProduct[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.shopCatalogProduct.findMany({
      where: opts?.includeUnpublished ? undefined : { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    if (!rows.length) {
      setRuntimeShopCatalog(STATIC_SHOP_CATALOG);
      return STATIC_SHOP_CATALOG;
    }
    // DB rows always win. Fill gaps from static so missing SKUs (e.g. cloud)
    // still appear until they are synced into the catalog.
    const mapped = rows.map(mapDbShopProduct);
    const bySlug = new Map(mapped.map((product) => [product.slug, product]));
    for (const product of STATIC_SHOP_CATALOG) {
      if (!bySlug.has(product.slug)) {
        mapped.push(product);
        bySlug.set(product.slug, product);
      }
    }
    mapped.sort(
      (a, b) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.slug.localeCompare(b.slug),
    );
    setRuntimeShopCatalog(mapped);
    try {
      const { clearServiceContentCaches } = await import("@/lib/fixweb-content");
      clearServiceContentCaches();
    } catch {
      // ignore — content module may not be available in all runtimes
    }
    return mapped;
  } catch (error) {
    console.warn(
      "[shop] DB catalog unavailable, using static fallback",
      error instanceof Error ? error.message : error,
    );
    setRuntimeShopCatalog(STATIC_SHOP_CATALOG);
    return STATIC_SHOP_CATALOG;
  }
}

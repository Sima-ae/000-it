import {
  mapDbShopProduct,
  setRuntimeShopCatalog,
  STATIC_SHOP_CATALOG,
  type ShopProduct,
} from "@/lib/shop/catalog";

/** Server-side: load published products from DB. Static catalog only if DB is empty. */
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
    // DB is the only source of truth for live products (names, specs, slugs, prices).
    const mapped = rows.map(mapDbShopProduct).sort(
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

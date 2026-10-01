/**
 * After hosting-admin create/update/delete, refresh in-process catalog
 * and revalidate public surfaces that render shop products.
 */
export async function refreshPublicShopSurfaces() {
  try {
    const { clearServiceContentCaches } = await import("@/lib/fixweb-content");
    clearServiceContentCaches();
  } catch {
    // ignore
  }
  try {
    const { loadShopCatalogFromDb } = await import("@/lib/shop/catalog-db");
    await loadShopCatalogFromDb({ includeUnpublished: true });
  } catch {
    // ignore
  }
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/", "layout");
    revalidatePath("/shop");
    revalidatePath("/diensten");
    revalidatePath("/diensten/categorie/hosting");
    for (const slug of [
      "shared-hosting",
      "cloud-hosting",
      "reseller-hosting",
      "wordpress-hosting",
      "vps-hosting",
    ]) {
      revalidatePath(`/diensten/${slug}`);
    }
  } catch {
    // ignore — not available in all runtimes
  }
}

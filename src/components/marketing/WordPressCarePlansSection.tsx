import { WordPressCarePlans } from "@/components/marketing/WordPressCarePlans";
import { resolveWpCarePricesFromCatalog } from "@/lib/shop/catalog";
import { loadShopCatalogFromDb } from "@/lib/shop/catalog-db";

/** WordPress care columns with prices from the saved shop catalog. */
export async function WordPressCarePlansSection({
  showTitle = false,
}: {
  showTitle?: boolean;
} = {}) {
  const catalog = await loadShopCatalogFromDb();
  return (
    <WordPressCarePlans
      prices={resolveWpCarePricesFromCatalog(catalog)}
      showTitle={showTitle}
    />
  );
}

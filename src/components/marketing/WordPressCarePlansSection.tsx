import { WordPressCarePlans } from "@/components/marketing/WordPressCarePlans";
import {
  loadShopCatalogFromDb,
  resolveWpCarePricesFromCatalog,
} from "@/lib/shop/catalog";

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

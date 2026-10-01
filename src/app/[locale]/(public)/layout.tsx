import { Navigation } from "@/components/shared/Navigation";
import { Footer } from "@/components/shared/Footer";
import { ContentTransition } from "@/components/shared/ContentTransition";
import { ShopCatalogProvider } from "@/components/shop/ShopCatalogProvider";
import { loadShopCatalogFromDb } from "@/lib/shop/catalog-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always hydrate from DB so menu + cart titles match hosting-admin.
  const initialProducts = await loadShopCatalogFromDb();

  return (
    <div className="flex min-h-screen flex-col">
      <ShopCatalogProvider initialProducts={initialProducts}>
        <Navigation />
        <main className="flex flex-1 flex-col pt-(--nav-offset)">
          <ContentTransition>{children}</ContentTransition>
        </main>
        <Footer />
      </ShopCatalogProvider>
    </div>
  );
}

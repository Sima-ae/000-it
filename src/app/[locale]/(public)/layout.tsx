import { Navigation } from "@/components/shared/Navigation";
import { Footer } from "@/components/shared/Footer";
import { ContentTransition } from "@/components/shared/ContentTransition";
import { ShopCatalogHydrator } from "@/components/shop/ShopCatalogHydrator";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <ShopCatalogHydrator />
      <Navigation />
      <main className="flex-1 pt-(--nav-offset)">
        <ContentTransition>{children}</ContentTransition>
      </main>
      <Footer />
    </div>
  );
}

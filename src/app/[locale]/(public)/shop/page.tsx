import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/marketing/Reveal";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { loadShopCatalogFromDb } from "@/lib/shop/catalog";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shop");
  const catalog = await loadShopCatalogFromDb();
  const plans = catalog.filter((p) => p.type === "plan");
  const services = catalog.filter(
    (p) => p.type === "service" || p.type === "product",
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <Reveal>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
      </Reveal>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{t("plans")}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((product) => (
            <ShopProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{t("services")}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((product) => (
            <ShopProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

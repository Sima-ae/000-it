import { getTranslations, setRequestLocale } from "next-intl/server";
import { PricingPlans } from "@/components/marketing/PricingPlans";
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
  const pricing = await getTranslations("pricing");
  const catalog = await loadShopCatalogFromDb();
  const services = catalog.filter(
    (p) => p.type === "service" || p.type === "product",
  );

  const plans = [
    {
      id: "starter" as const,
      name: pricing("starter"),
      monthlyPrice: 39.95,
      features: pricing.raw("features.starter") as string[],
      featured: false,
    },
    {
      id: "growth" as const,
      name: pricing("growth"),
      monthlyPrice: 64.95,
      features: pricing.raw("features.growth") as string[],
      featured: true,
    },
    {
      id: "enterprise" as const,
      name: pricing("enterprise"),
      monthlyPrice: null,
      features: pricing.raw("features.enterprise") as string[],
      featured: false,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-14 pt-6 md:px-6 md:pb-20 md:pt-8">
      <h1 className="sr-only">{t("title")}</h1>

      <PricingPlans
        variant="embedded"
        plans={plans}
        labels={{
          title: t("plans"),
          subtitle: pricing("subtitle"),
          plansHeadline: pricing("plansHeadline"),
          monthly: pricing("monthly"),
          yearly: pricing("yearly"),
          save: pricing("saveYearly"),
          perMonth: pricing("month"),
          perYear: pricing("year"),
          cta: pricing("cta"),
          ctaContact: pricing("ctaContact"),
          custom: pricing("custom"),
          mostChosen: pricing("mostChosen"),
        }}
      />

      <p className="mx-auto mt-6 max-w-2xl text-center text-muted-foreground">
        {t("subtitle")}
      </p>

      <section className="mt-16 text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-accent">
          {t("services")}
        </h2>
        <div className="mt-6 grid gap-4 text-left md:grid-cols-2 xl:grid-cols-3">
          {services.map((product) => (
            <ShopProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

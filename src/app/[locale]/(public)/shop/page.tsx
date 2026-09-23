import { getTranslations, setRequestLocale } from "next-intl/server";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { ShopSupportSection } from "@/components/shop/ShopSupportSection";
import {
  isSupportPackageSlug,
  loadShopCatalogFromDb,
  localizeShopProduct,
  type ShopProduct,
} from "@/lib/shop/catalog";

export const dynamic = "force-dynamic";

const HOSTING_SLUG_ORDER = [
  "shared-hosting-basic",
  "shared-hosting-business",
  "shared-hosting-plus",
  "wordpress-hosting-basic",
  "wordpress-hosting-business",
  "wordpress-hosting-plus",
  "vps-hosting-basic",
  "vps-hosting-business",
  "vps-hosting-plus",
] as const;

const HOSTING_SLUGS = new Set<string>(HOSTING_SLUG_ORDER);

function sortHostingProducts(products: ShopProduct[]) {
  const rank = new Map(HOSTING_SLUG_ORDER.map((slug, index) => [slug, index]));
  return [...products].sort(
    (a, b) => (rank.get(a.slug) ?? 999) - (rank.get(b.slug) ?? 999),
  );
}

function sortServiceProducts(products: ShopProduct[], locale: string) {
  return [...products].sort((a, b) => {
    const aName = localizeShopProduct(a, locale).localizedName;
    const bName = localizeShopProduct(b, locale).localizedName;
    return aName.localeCompare(bName, locale, { sensitivity: "base" });
  });
}

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
  const supportServices = catalog.filter(
    (p) =>
      (p.type === "service" || p.type === "product") &&
      isSupportPackageSlug(p.slug),
  );
  const catalogProducts = catalog.filter(
    (p) =>
      (p.type === "service" || p.type === "product") &&
      !isSupportPackageSlug(p.slug),
  );
  const hostingProducts = sortHostingProducts(
    catalogProducts.filter((p) => HOSTING_SLUGS.has(p.slug)),
  );
  const serviceProducts = sortServiceProducts(
    catalogProducts.filter((p) => !HOSTING_SLUGS.has(p.slug)),
    locale,
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

      <ShopSupportSection title={t("support")} products={supportServices} />

      {hostingProducts.length > 0 ? (
        <section className="mt-16 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-accent">
            {t("webhosting")}
          </h2>
          <div className="mt-6 grid gap-4 text-left md:grid-cols-2 xl:grid-cols-3">
            {hostingProducts.map((product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {serviceProducts.length > 0 ? (
        <section className="mt-16 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-accent">
            {t("services")}
          </h2>
          <div className="mt-6 grid gap-4 text-left md:grid-cols-2 xl:grid-cols-3">
            {serviceProducts.map((product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

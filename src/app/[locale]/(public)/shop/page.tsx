import { getTranslations, setRequestLocale } from "next-intl/server";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import { WordPressCarePlansSection } from "@/components/marketing/WordPressCarePlansSection";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { ShopHostingSection } from "@/components/shop/ShopHostingSection";
import {
  isHostingShopProduct,
  isSupportPackageSlug,
  isWpCareSlug,
  localizeShopProduct,
  resolvePlanNamesFromCatalog,
  resolvePlanPricesFromCatalog,
  shopHostingProductsForCategory,
  type ShopProduct,
} from "@/lib/shop/catalog";
import { loadShopCatalogFromDb } from "@/lib/shop/catalog-db";
import { getRequestBrand } from "@/lib/brand/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
  const brand = await getRequestBrand();
  const hostingOnly = brand.catalogMode === "domains_hosting";
  const t = await getTranslations("shop");
  const pricing = await getTranslations("pricing");
  const catalog = await loadShopCatalogFromDb();
  const planPrices = resolvePlanPricesFromCatalog(catalog);
  const planNames = resolvePlanNamesFromCatalog(catalog, locale);
  const catalogProducts = catalog.filter(
    (p) =>
      (p.type === "service" || p.type === "product") &&
      !isSupportPackageSlug(p.slug) &&
      !isWpCareSlug(p.slug) &&
      (!hostingOnly || isHostingShopProduct(p)),
  );
  const sharedHostingProducts = shopHostingProductsForCategory(
    catalogProducts,
    "shared-hosting",
  );
  const cloudHostingProducts = shopHostingProductsForCategory(
    catalogProducts,
    "cloud-hosting",
  );
  const emailHostingProducts = shopHostingProductsForCategory(
    catalogProducts,
    "email-hosting",
  );
  const resellerHostingProducts = shopHostingProductsForCategory(
    catalogProducts,
    "reseller-hosting",
  );
  const wordpressHostingProducts = shopHostingProductsForCategory(
    catalogProducts,
    "wordpress-hosting",
  );
  const vpsHostingProducts = shopHostingProductsForCategory(
    catalogProducts,
    "vps-hosting",
  );
  const serviceProducts = hostingOnly
    ? []
    : sortServiceProducts(
        catalogProducts.filter((p) => !isHostingShopProduct(p)),
        locale,
      );

  const plans = [
    {
      id: "starter" as const,
      name: planNames.starter || pricing("starter"),
      monthlyPrice: planPrices.starter.monthly,
      yearlyPrice: planPrices.starter.yearly,
      features: pricing.raw("features.starter") as string[],
      featured: false,
    },
    {
      id: "growth" as const,
      name: planNames.growth || pricing("growth"),
      monthlyPrice: planPrices.growth.monthly,
      yearlyPrice: planPrices.growth.yearly,
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
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-4 pt-6 md:px-6 md:pt-8",
        hostingOnly
          ? "flex flex-1 flex-col pb-8 md:pb-10"
          : "pb-14 md:pb-20",
      )}
    >
      <h1 className="sr-only">{t("title")}</h1>

      {!hostingOnly ? (
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
      ) : null}

      {!hostingOnly ? (
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      ) : null}

      <ShopHostingSection
        className={hostingOnly ? "mt-2" : undefined}
        title={t("sharedHosting")}
        products={sharedHostingProducts}
      />

      <ShopHostingSection
        title={t("cloudHosting")}
        products={cloudHostingProducts}
      />

      <ShopHostingSection
        title={t("emailHosting")}
        products={emailHostingProducts}
      />

      <ShopHostingSection
        title={t("resellerHosting")}
        products={resellerHostingProducts}
      />

      <ShopHostingSection
        title={t("wordpressHosting")}
        products={wordpressHostingProducts}
      />

      <ShopHostingSection
        title={t("vpsHosting")}
        products={vpsHostingProducts}
      />

      {!hostingOnly ? (
        <div className="mt-16">
          <WordPressCarePlansSection showTitle />
        </div>
      ) : null}

      {serviceProducts.length > 0 ? (
        <section className="mt-16 text-center">
          <h2 className="font-display text-[1.8rem] font-semibold tracking-tight text-accent md:text-[1.9rem]">
            {t("services")}
          </h2>
          <div className="mt-6 grid gap-4 text-start md:grid-cols-2 xl:grid-cols-3">
            {serviceProducts.map((product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {hostingOnly ? (
        <p className="mx-auto mt-auto max-w-2xl pt-16 text-center text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      ) : null}
    </div>
  );
}

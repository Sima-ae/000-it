import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import { WordPressCarePlansSection } from "@/components/marketing/WordPressCarePlansSection";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { ShopHostingSection } from "@/components/shop/ShopHostingSection";
import { Reveal } from "@/components/marketing/Reveal";
import { BRANDING_IMAGES } from "@/lib/branding-images";
import {
  HOSTING_YEARLY_SLUGS,
  isSupportPackageSlug,
  isWpCareSlug,
  loadShopCatalogFromDb,
  localizeShopProduct,
  resolvePlanNamesFromCatalog,
  resolvePlanPricesFromCatalog,
  SHARED_HOSTING_SLUG_ORDER,
  shopProductsInSlugOrder,
  VPS_HOSTING_SLUG_ORDER,
  WORDPRESS_HOSTING_SLUG_ORDER,
  type ShopProduct,
} from "@/lib/shop/catalog";

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
  const t = await getTranslations("shop");
  const pricing = await getTranslations("pricing");
  const catalog = await loadShopCatalogFromDb();
  const planPrices = resolvePlanPricesFromCatalog(catalog);
  const planNames = resolvePlanNamesFromCatalog(catalog, locale);
  const catalogProducts = catalog.filter(
    (p) =>
      (p.type === "service" || p.type === "product") &&
      !isSupportPackageSlug(p.slug) &&
      !isWpCareSlug(p.slug),
  );
  const sharedHostingProducts = shopProductsInSlugOrder(
    catalogProducts,
    SHARED_HOSTING_SLUG_ORDER,
  );
  const wordpressHostingProducts = shopProductsInSlugOrder(
    catalogProducts,
    WORDPRESS_HOSTING_SLUG_ORDER,
  );
  const vpsHostingProducts = shopProductsInSlugOrder(
    catalogProducts,
    VPS_HOSTING_SLUG_ORDER,
  );
  const serviceProducts = sortServiceProducts(
    catalogProducts.filter((p) => !HOSTING_YEARLY_SLUGS.has(p.slug)),
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
    <div className="mx-auto max-w-6xl px-4 pb-14 pt-6 md:px-6 md:pb-20 md:pt-8">
      <h1 className="sr-only">{t("title")}</h1>

      <Reveal>
        <div className="mb-6 flex justify-center md:mb-8">
          <div className="relative h-32 w-40 overflow-hidden sm:h-36 sm:w-48">
            <Image
              src={BRANDING_IMAGES.consultantLaptop}
              alt=""
              fill
              unoptimized
              sizes="192px"
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </Reveal>

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

      <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted-foreground">
        {t("subtitle")}
      </p>

      <ShopHostingSection
        title={t("sharedHosting")}
        products={sharedHostingProducts}
      />

      <ShopHostingSection
        title={t("wordpressHosting")}
        products={wordpressHostingProducts}
      />

      <ShopHostingSection
        title={t("vpsHosting")}
        products={vpsHostingProducts}
      />

      <div className="mt-16">
        <WordPressCarePlansSection showTitle />
      </div>

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

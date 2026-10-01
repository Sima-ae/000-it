import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { SoftLink } from "@/components/shared/SoftLink";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { ServiceCard } from "@/components/content/ServiceCard";
import { Reveal } from "@/components/marketing/Reveal";
import { ServiceInquiryDialog } from "@/components/marketing/ServiceInquiryDialog";
import { ShopProductImage } from "@/components/shop/ShopProductImage";
import { TabletFrame } from "@/components/content/TabletFrame";
import { WordPressCarePlansSection } from "@/components/marketing/WordPressCarePlansSection";
import {
  getCatalogItem,
  serviceCatalog,
  serviceGroups,
  serviceGroupHref,
  serviceHref,
} from "@/content/fixweb/catalog";
import { localizedHref } from "@/i18n/pathnames";
import {
  catalogGroupTitle,
  catalogServiceTitle,
} from "@/content/fixweb/catalog-title";
import { getServiceCardMeta, getServiceContent } from "@/lib/fixweb-content";
import { brandingFallbackForServiceSlug } from "@/lib/branding-images";
import { getRequestBrand } from "@/lib/brand/server";
import {
  CLOUD_HOSTING_SLUG_ORDER,
  getShopProductBySlug,
  RESELLER_HOSTING_SLUG_ORDER,
  SHARED_HOSTING_SLUG_ORDER,
  shopProductsInSlugOrder,
  VPS_HOSTING_SLUG_ORDER,
  WORDPRESS_HOSTING_SLUG_ORDER,
} from "@/lib/shop/catalog";
import { loadShopCatalogFromDb } from "@/lib/shop/catalog-db";
import { cn } from "@/lib/utils";
import { ShopHostingSection } from "@/components/shop/ShopHostingSection";
import { LiveServiceProductHero } from "@/components/shop/LiveServiceProductHero";
import { notFound } from "next/navigation";

const aiInquiryBySlug: Record<
  string,
  { source: string; key: "wp" | "ecom" | "web" }
> = {
  "ai-in-wordpress": { source: "AI_IN_WORDPRESS", key: "wp" },
  "ai-in-ecommerce": { source: "AI_IN_ECOMMERCE", key: "ecom" },
  "ai-in-website": { source: "AI_IN_WEBSITE", key: "web" },
};

const HOSTING_PLAN_PAGES = {
  "shared-hosting": {
    order: SHARED_HOSTING_SLUG_ORDER,
    titleKey: "sharedHosting",
  },
  "cloud-hosting": {
    order: CLOUD_HOSTING_SLUG_ORDER,
    titleKey: "cloudHosting",
  },
  "reseller-hosting": {
    order: RESELLER_HOSTING_SLUG_ORDER,
    titleKey: "resellerHosting",
  },
  "wordpress-hosting": {
    order: WORDPRESS_HOSTING_SLUG_ORDER,
    titleKey: "wordpressHosting",
  },
  "vps-hosting": {
    order: VPS_HOSTING_SLUG_ORDER,
    titleKey: "vpsHosting",
  },
} as const;

export async function CatalogServiceDetail({
  locale,
  slug,
}: {
  locale: string;
  slug: string;
}) {
  const tNav = await getTranslations("nav");
  const t = await getTranslations("services");
  const tShop = await getTranslations("shop");
  const content = await getServiceContent(slug, locale);
  if (!content) notFound();

  const brand = await getRequestBrand();
  const meta = getCatalogItem(slug);
  const groupLabel = serviceGroups.find((g) => g.id === meta?.group);
  const inquiry = aiInquiryBySlug[slug];
  const showSupportPlans =
    slug === "wordpress-beheer" || slug === "wordpress-maintenance-updates";
  const hostingPlanPage =
    slug in HOSTING_PLAN_PAGES
      ? HOSTING_PLAN_PAGES[slug as keyof typeof HOSTING_PLAN_PAGES]
      : null;

  const shopCatalog = await loadShopCatalogFromDb();
  const shopProduct = getShopProductBySlug(slug);
  const hostingPlanProducts = hostingPlanPage
    ? shopProductsInSlugOrder(shopCatalog, hostingPlanPage.order)
    : [];
  const canOrder = Boolean(
    shopProduct &&
      shopProduct.published !== false &&
      shopProduct.priceInclCents > 0,
  );
  const relatedCandidates = serviceCatalog.filter(
    (item) =>
      item.group === meta?.group &&
      item.slug !== slug &&
      !item.href,
  );
  const related = (
    await Promise.all(
      relatedCandidates.map(async (item) => ({
        item,
        relatedContent: await getServiceCardMeta(item.slug, locale),
      })),
    )
  )
    .filter(({ relatedContent }) => Boolean(relatedContent?.hasBody))
    .slice(0, 3);

  const heroImage =
    content.image ||
    brandingFallbackForServiceSlug(slug, meta?.group);
  const isHostingPage = meta?.group === "hosting";

  return (
    <div>
      <section
        className={cn(
          "relative overflow-hidden",
          !showSupportPlans && "border-b border-border/60",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 15% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 55%), radial-gradient(ellipse 60% 45% at 95% 70%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-6 md:px-6 md:pt-14 md:pb-8">
          <Reveal>
            <p className="text-sm text-muted-foreground">
              <SoftLink href={localizedHref(locale, "/diensten")} className="hover:text-foreground">
                {tNav("services")}
              </SoftLink>
              {groupLabel ? (
                <>
                  <span className="mx-2">/</span>
                  <SoftLink
                    href={serviceGroupHref(locale, groupLabel.id)}
                    className="hover:text-foreground"
                  >
                    {catalogGroupTitle(groupLabel.id, locale, groupLabel.title)}
                  </SoftLink>
                </>
              ) : null}
              <span className="mx-2">/</span>
              <span>{content.title}</span>
            </p>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                {groupLabel ? (
                  <SoftLink
                    href={serviceGroupHref(locale, groupLabel.id)}
                    className="text-xs font-semibold uppercase tracking-[0.16em] text-primary hover:underline"
                  >
                    {catalogGroupTitle(groupLabel.id, locale, groupLabel.title)}
                  </SoftLink>
                ) : null}
                {shopProduct ? (
                  <LiveServiceProductHero
                    slug={slug}
                    fallbackProduct={shopProduct}
                    fallbackTitle={content.title}
                    fallbackSubtitle={
                      isHostingPage && content.kind === "product"
                        ? null
                        : content.subtitle
                    }
                    fallbackPrice={
                      typeof content.price === "number" ? content.price : null
                    }
                    fallbackListPrice={
                      "listPrice" in content &&
                      typeof content.listPrice === "number"
                        ? content.listPrice
                        : null
                    }
                    fallbackFeatures={
                      "features" in content && Array.isArray(content.features)
                        ? content.features
                        : []
                    }
                    priceSuffix={
                      "priceSuffix" in content ? content.priceSuffix : null
                    }
                    checkoutMonths={
                      "checkoutMonths" in content &&
                      typeof content.checkoutMonths === "number"
                        ? content.checkoutMonths
                        : null
                    }
                    orderLabel={tShop("order")}
                    goToCartLabel={tShop("goToCart")}
                    canOrder={canOrder}
                    titleClassName={
                      isHostingPage
                        ? brand.id === "extrahosting"
                          ? "text-[#1e9bff]"
                          : "text-accent"
                        : undefined
                    }
                  />
                ) : (
                  <>
                    <h1
                      className={cn(
                        "font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl",
                        isHostingPage &&
                          (brand.id === "extrahosting"
                            ? "text-[#1e9bff]"
                            : "text-accent"),
                      )}
                    >
                      {content.title}
                    </h1>
                    {content.subtitle ? (
                      <p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">
                        {content.subtitle}
                      </p>
                    ) : null}
                  </>
                )}
              </div>
              {heroImage ? (
                isHostingPage ? (
                  <div className="relative mx-auto aspect-square w-full max-w-60 justify-self-center lg:mx-0 lg:justify-self-end">
                    <ShopProductImage
                      src={heroImage}
                      alt={content.title}
                      sizes="240px"
                      priority
                      className="object-contain"
                      fallbackClassName="object-contain p-0 opacity-90"
                    />
                  </div>
                ) : (
                  <TabletFrame className="justify-self-center lg:justify-self-end">
                    <ShopProductImage
                      src={heroImage}
                      alt={content.title}
                      sizes="240px"
                      priority
                      className="object-contain p-2"
                      fallbackClassName="object-contain p-2 opacity-90"
                    />
                  </TabletFrame>
                )
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      <div
        className={cn(
          "mx-auto max-w-6xl px-4 pb-12 md:px-6 md:pb-16",
          isHostingPage ? "pt-6 md:pt-8" : "pt-2",
        )}
      >
        {showSupportPlans ? (
          <section className="mb-10 border-b border-border/60 pb-10 md:mb-12 md:pb-12">
            <WordPressCarePlansSection />
          </section>
        ) : null}

        {hostingPlanPage && hostingPlanProducts.length ? (
          <ShopHostingSection
            className="mt-6 mb-10 md:mt-8 md:mb-12"
            title={tShop(hostingPlanPage.titleKey)}
            products={hostingPlanProducts}
            showTitle={false}
          />
        ) : null}

        <Reveal delay={0.05}>
          <div className="glass glow-hover relative overflow-hidden rounded-[1.75rem] p-6 md:p-10">
            {content.blocks.length ? (
              <ContentBlocks blocks={content.blocks} />
            ) : (
              <p className="text-muted-foreground">{t("emptyBody")}</p>
            )}
          </div>
        </Reveal>

        {!canOrder ? (
          <Reveal delay={0.08}>
            <div className="mt-10 rounded-[1.75rem] border border-border/70 bg-linear-to-br from-primary/10 via-background to-accent/10 px-6 py-8 md:px-10">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                {inquiry ? t(`inquiry.${inquiry.key}.ctaTitle`) : t("readyTitle")}
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                {inquiry ? t(`inquiry.${inquiry.key}.ctaText`) : t("readyBody")}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {inquiry ? (
                  <>
                    <ServiceInquiryDialog
                      serviceTitle={content.title}
                      source={inquiry.source}
                      messageHint={t(`inquiry.${inquiry.key}.hint`)}
                      triggerLabel={t("openContactForm")}
                    />
                    <Button asChild variant="outline" className="rounded-2xl">
                      <SoftLink href={localizedHref(locale, "/ai-scan")}>
                        {t("freeAiScan")}
                      </SoftLink>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild className="rounded-2xl">
                      <SoftLink href={localizedHref(locale, "/afspraak")}>
                        {tNav("book")}
                      </SoftLink>
                    </Button>
                    <Button asChild variant="outline" className="rounded-2xl">
                      <SoftLink href={localizedHref(locale, "/ai-scan")}>
                        {t("freeAiScan")}
                      </SoftLink>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Reveal>
        ) : null}

        {related.length ? (
          <section className="mt-14">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                {t("related")}
              </h2>
            </Reveal>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map(({ item, relatedContent }, i) => (
                <Reveal key={item.slug} delay={i * 0.04}>
                  <ServiceCard
                    href={serviceHref(locale, item)}
                    title={
                      relatedContent?.title?.trim() ||
                      catalogServiceTitle(item.slug, locale, item.title)
                    }
                    summary={relatedContent?.subtitle || ""}
                    price={relatedContent?.price ?? undefined}
                    listPrice={
                      relatedContent && "listPrice" in relatedContent
                        ? (relatedContent.listPrice as
                            | number
                            | null
                            | undefined) ?? undefined
                        : undefined
                    }
                    image={
                      relatedContent?.image ??
                      brandingFallbackForServiceSlug(item.slug, meta?.group) ??
                      undefined
                    }
                  />
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

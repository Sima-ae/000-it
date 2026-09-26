import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { SoftLink } from "@/components/shared/SoftLink";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { ServiceCard } from "@/components/content/ServiceCard";
import { Reveal } from "@/components/marketing/Reveal";
import { ServiceInquiryDialog } from "@/components/marketing/ServiceInquiryDialog";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { ShopProductImage } from "@/components/shop/ShopProductImage";
import { TabletFrame } from "@/components/content/TabletFrame";
import { WordPressSupportPlans } from "@/components/marketing/WordPressSupportPlans";
import {
  getCatalogItem,
  getServiceSlugs,
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
import { formatEuro, getServiceCardMeta, getServiceContent } from "@/lib/fixweb-content";
import { brandingFallbackForServiceSlug } from "@/lib/branding-images";
import {
  getShopProductBySlug,
  loadShopCatalogFromDb,
} from "@/lib/shop/catalog";
import { buildServiceMetadata } from "@/lib/seo";
import { resolveEntityParam } from "@/lib/resolve-entity-param";
import { canonicalEntityKey } from "@/lib/entity-slug-cache";
import { hydrateEntitySlugs } from "@/lib/entity-slugs";
import { cn } from "@/lib/utils";

const aiInquiryBySlug: Record<
  string,
  { source: string; key: "wp" | "ecom" | "web" }
> = {
  "ai-in-wordpress": { source: "AI_IN_WORDPRESS", key: "wp" },
  "ai-in-ecommerce": { source: "AI_IN_ECOMMERCE", key: "ecom" },
  "ai-in-website": { source: "AI_IN_WEBSITE", key: "web" },
};

/** Live shop catalog drives price/specs — must not bake stale static product data. */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug: rawSlug } = await params;
  await hydrateEntitySlugs(locale);
  const slug = canonicalEntityKey(locale, "service", rawSlug);
  const content = await getServiceContent(slug, locale);
  if (!content) return { title: "Not found", robots: { index: false } };
  return buildServiceMetadata({
    locale,
    slug,
    title: content.title,
    description: content.subtitle,
    image: content.image,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug: rawSlug } = await params;
  setRequestLocale(locale);
  const slug = await resolveEntityParam({
    locale,
    entityType: "service",
    param: rawSlug,
    internalPathFor: (key) => `/diensten/${key}`,
  });
  const tNav = await getTranslations("nav");
  const t = await getTranslations("services");
  const tShop = await getTranslations("shop");
  const content = await getServiceContent(slug, locale);
  if (!content) notFound();

  const meta = getCatalogItem(slug);
  const groupLabel = serviceGroups.find((g) => g.id === meta?.group);
  const inquiry = aiInquiryBySlug[slug];
  const showSupportPlans = slug === "wordpress-support";

  // Any shop catalog product with this slug (and a price) is orderable —
  // including products that receive a price later via admin / seed.
  await loadShopCatalogFromDb();
  const shopProduct = getShopProductBySlug(slug);
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
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
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
                <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                  {content.title}
                </h1>
                {content.subtitle ? (
                  <p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">
                    {content.subtitle}
                  </p>
                ) : null}
                {typeof content.price === "number" ? (
                  <div className="mt-6">
                    {"listPrice" in content &&
                    typeof content.listPrice === "number" ? (
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <p className="font-display text-xl font-medium text-muted-foreground line-through decoration-2">
                          {formatEuro(content.listPrice)}
                        </p>
                        <p className="font-display text-3xl font-bold text-primary">
                          {formatEuro(content.price)}
                          {"priceSuffix" in content && content.priceSuffix ? (
                            <span className="ml-2 text-base font-medium text-muted-foreground">
                              {content.priceSuffix}
                            </span>
                          ) : null}
                        </p>
                      </div>
                    ) : (
                      <p className="font-display text-3xl font-bold text-foreground">
                        {formatEuro(content.price)}
                        {"priceSuffix" in content && content.priceSuffix ? (
                          <span className="ml-2 text-base font-medium text-muted-foreground">
                            {content.priceSuffix}
                          </span>
                        ) : null}
                      </p>
                    )}
                    {"checkoutMonths" in content &&
                    typeof content.checkoutMonths === "number" &&
                    content.checkoutMonths > 1 ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tShop("billedYearly", { months: content.checkoutMonths })}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {"features" in content && Array.isArray(content.features) && content.features.length ? (
                  <ul className="mt-5 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                    {content.features.slice(0, 8).map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-8 flex flex-wrap gap-3">
                  {canOrder && shopProduct ? (
                    <>
                      <AddToCartButton
                        productId={shopProduct.id}
                        label={tShop("order")}
                        size="lg"
                      />
                      <Button asChild size="lg" variant="outline" className="rounded-2xl">
                        <SoftLink href={localizedHref(locale, "/shop/cart")}>
                          {tShop("goToCart")}
                        </SoftLink>
                      </Button>
                    </>
                  ) : (
                    <>
                      {inquiry ? (
                        <ServiceInquiryDialog
                          serviceTitle={content.title}
                          source={inquiry.source}
                          messageHint={t(`inquiry.${inquiry.key}.hint`)}
                          triggerLabel={t(`inquiry.${inquiry.key}.trigger`)}
                        />
                      ) : slug === "ai-scan" ? (
                        <Button asChild size="lg" className="rounded-2xl">
                          <SoftLink href={localizedHref(locale, "/ai-scan")}>
                            {t("startFreeAiScan")}
                          </SoftLink>
                        </Button>
                      ) : (
                        <Button asChild size="lg" className="rounded-2xl">
                          <SoftLink href={localizedHref(locale, "/afspraak")}>
                            {tNav("book")}
                          </SoftLink>
                        </Button>
                      )}
                      <Button asChild size="lg" variant="outline" className="rounded-2xl">
                        <SoftLink href={localizedHref(locale, "/contact")}>
                          {t("contact")}
                        </SoftLink>
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {heroImage ? (
                <TabletFrame className="justify-self-center lg:justify-self-end">
                  <ShopProductImage
                    src={heroImage}
                    alt={content.title}
                    sizes="240px"
                    priority
                    className="object-cover"
                    fallbackClassName="object-cover p-0 opacity-90"
                  />
                </TabletFrame>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        {showSupportPlans ? (
          <section className="mb-14 border-b border-border/60 pb-14">
            <WordPressSupportPlans />
          </section>
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

        <Reveal delay={0.08}>
          <div className="mt-10 rounded-[1.75rem] border border-border/70 bg-linear-to-br from-primary/10 via-background to-accent/10 px-6 py-8 md:px-10">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {inquiry ? t(`inquiry.${inquiry.key}.ctaTitle`) : t("readyTitle")}
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {inquiry ? t(`inquiry.${inquiry.key}.ctaText`) : t("readyBody")}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {canOrder && shopProduct ? (
                <>
                  <AddToCartButton
                    productId={shopProduct.id}
                    label={tShop("order")}
                  />
                  <Button asChild variant="outline" className="rounded-2xl">
                    <SoftLink href={localizedHref(locale, "/shop/cart")}>
                      {tShop("goToCart")}
                    </SoftLink>
                  </Button>
                </>
              ) : inquiry ? (
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
                    title={catalogServiceTitle(item.slug, locale, item.title)}
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

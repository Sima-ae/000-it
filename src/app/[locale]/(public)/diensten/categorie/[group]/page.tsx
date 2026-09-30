import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/Reveal";
import { GlassCard } from "@/components/marketing/GlassCard";
import { CategoryHero } from "@/components/content/CategoryHero";
import { WordPressCarePlansSection } from "@/components/marketing/WordPressCarePlansSection";
import { ServerLocationsOverview } from "@/components/marketing/ServerLocationsOverview";
import { ShopHostingSection } from "@/components/shop/ShopHostingSection";
import { ServiceCard } from "@/components/content/ServiceCard";
import { SoftLink } from "@/components/shared/SoftLink";
import {
  catalogGroupSummary,
  getServiceGroup,
  isServiceGroupId,
  serviceGroups,
  serviceGroupHref,
  serviceGroupPath,
  serviceHref,
  sortedServiceGroups,
} from "@/content/fixweb/catalog";
import { catalogGroupTitle } from "@/content/fixweb/catalog-title";
import { serverLocationsCopy } from "@/content/server-locations";
import { brandingFallbackForServiceSlug } from "@/lib/branding-images";
import { listServiceGroupCards } from "@/lib/service-group-listing";
import {
  CLOUD_HOSTING_SLUG_ORDER,
  SHARED_HOSTING_SLUG_ORDER,
  shopProductsInSlugOrder,
  VPS_HOSTING_SLUG_ORDER,
  WORDPRESS_HOSTING_SLUG_ORDER,
} from "@/lib/shop/catalog";
import { loadShopCatalogFromDb } from "@/lib/shop/catalog-db";
import { buildPageMetadata } from "@/lib/seo";
import { localizedHref } from "@/i18n/pathnames";
import { getRequestBrand } from "@/lib/brand/server";

type Params = { params: Promise<{ locale: string; group: string }> };

/** Shop catalog prices/specs must stay live. */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return serviceGroups
    .filter((group) => group.id !== "design")
    .map((group) => ({ group: group.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, group: groupId } = await params;
  if (groupId === "design") {
    return { title: "Design", robots: { index: false } };
  }
  if (!isServiceGroupId(groupId)) {
    return { title: "Not found", robots: { index: false } };
  }
  const group = getServiceGroup(groupId);
  if (!group) return { title: "Not found", robots: { index: false } };
  const title = catalogGroupTitle(group.id, locale, group.title);
  const description = catalogGroupSummary(group.id, locale);
  return buildPageMetadata({
    locale,
    path: serviceGroupPath(group.id),
    title,
    description,
    keywords: [title, locale === "nl" ? "diensten" : "services"],
  });
}

export default async function ServiceCategoryPage({ params }: Params) {
  const { locale, group: groupId } = await params;
  setRequestLocale(locale);
  if (groupId === "design") {
    redirect(localizedHref(locale, "/design"));
  }
  if (!isServiceGroupId(groupId)) notFound();

  const group = getServiceGroup(groupId);
  if (!group) notFound();

  const brand = await getRequestBrand();
  const hostingOnly = brand.catalogMode === "domains_hosting";

  const t = await getTranslations("services");
  const tNav = await getTranslations("nav");
  const tShop = await getTranslations("shop");
  const title = catalogGroupTitle(group.id, locale, group.title);
  const summary = catalogGroupSummary(group.id, locale);
  const cards = await listServiceGroupCards(locale, group.id, {
    includeCustomHref: true,
  });
  if (!cards.length) notFound();

  const isHosting = group.id === "hosting";
  const pageCards = isHosting
    ? cards.filter((card) => card.item.slug === "domains")
    : cards;
  const hostingCatalog = isHosting ? await loadShopCatalogFromDb() : [];
  const sharedHostingProducts = shopProductsInSlugOrder(
    hostingCatalog,
    SHARED_HOSTING_SLUG_ORDER,
  );
  const cloudHostingProducts = shopProductsInSlugOrder(
    hostingCatalog,
    CLOUD_HOSTING_SLUG_ORDER,
  );
  const wordpressHostingProducts = shopProductsInSlugOrder(
    hostingCatalog,
    WORDPRESS_HOSTING_SLUG_ORDER,
  );
  const vpsHostingProducts = shopProductsInSlugOrder(
    hostingCatalog,
    VPS_HOSTING_SLUG_ORDER,
  );

  const otherGroups = hostingOnly
    ? []
    : sortedServiceGroups(locale).filter((item) => item.id !== group.id);
  const serverLocations = isHosting ? serverLocationsCopy(locale) : null;
  const jumpLinks = isHosting
    ? [
        { key: "shared-hosting", id: "gedeelde-hosting", label: tShop("sharedHosting") },
        {
          key: "cloud-hosting",
          id: "cloud-hosting-pakketten",
          label: tShop("cloudHosting"),
        },
        {
          key: "wordpress-hosting",
          id: "wordpress-hosting-pakketten",
          label: tShop("wordpressHosting"),
        },
        { key: "vps-hosting", id: "vps-hosting-pakketten", label: tShop("vpsHosting") },
        {
          key: "server-locations",
          id: "server-locaties",
          label: serverLocations!.title,
        },
        ...pageCards.map((card) => ({
          key: card.item.slug,
          id: card.item.slug,
          label: card.title,
        })),
      ]
    : cards.map((card) => ({
        key: card.item.slug,
        id: card.item.slug,
        label: card.title,
      }));

  return (
    <div
      className={
        hostingOnly
          ? "mx-auto max-w-6xl px-4 pb-6 pt-6 sm:px-5 sm:pb-8 sm:pt-8 md:px-6 md:pb-10 md:pt-10"
          : "mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-5 sm:pb-14 sm:pt-8 md:px-6 md:pb-20 md:pt-10"
      }
    >      <CategoryHero
        locale={locale}
        groupId={group.id}
        title={title}
        summary={summary || undefined}
        count={cards.length}
        countLabel={t("countLabel")}
        servicesLabel={tNav("services")}
        servicesHref={localizedHref(locale, "/diensten")}
        jumpLinks={jumpLinks.length > 2 ? jumpLinks : undefined}
        jumpBasePath={serviceGroupPath(group.id)}
      />

      {group.id === "wordpress" ? (
        <div className="mt-8 sm:mt-10 md:mt-12">
          <WordPressCarePlansSection />
        </div>
      ) : null}

      {isHosting ? (
        <div className="mt-8 sm:mt-10 md:mt-12">
          <ShopHostingSection
            id="gedeelde-hosting"
            className="mt-0"
            title={tShop("sharedHosting")}
            products={sharedHostingProducts}
          />
          <ShopHostingSection
            id="cloud-hosting-pakketten"
            title={tShop("cloudHosting")}
            products={cloudHostingProducts}
          />
          <ShopHostingSection
            id="wordpress-hosting-pakketten"
            title={tShop("wordpressHosting")}
            products={wordpressHostingProducts}
          />
          <ShopHostingSection
            id="vps-hosting-pakketten"
            title={tShop("vpsHosting")}
            products={vpsHostingProducts}
          />
        </div>
      ) : null}

      {isHosting ? (
        <div className="mt-14 sm:mt-16 md:mt-20">
          <ServerLocationsOverview />
        </div>
      ) : null}

      <div
        className={
          isHosting
            ? "mx-auto mt-14 grid w-full max-w-sm sm:mt-16 md:mt-20"
            : "mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 md:mt-12 lg:grid-cols-3"
        }
      >
        {pageCards.map((card, i) => (
          <div
            key={card.item.slug}
            id={card.item.slug}
            className="scroll-mt-(--nav-offset) md:scroll-mt-[calc(var(--nav-offset)+3.25rem)]"
          >
            <Reveal delay={Math.min(i, 8) * 0.03}>
              <ServiceCard
                href={serviceHref(locale, card.item)}
                title={card.title}
                summary={card.summary}
                price={card.price}
                listPrice={card.listPrice}
                image={
                  card.image ||
                  brandingFallbackForServiceSlug(card.item.slug, group.id)
                }
              />
            </Reveal>
          </div>
        ))}
      </div>

      {otherGroups.length ? (
        <section className="mt-16">
          <Reveal>
            <h2
              className={
                isHosting
                  ? "text-center font-display text-2xl font-semibold tracking-tight"
                  : "font-display text-2xl font-semibold tracking-tight"
              }
            >
              {t("title")}
            </h2>
            <p
              className={
                isHosting
                  ? "mt-1 text-center text-sm text-muted-foreground"
                  : "mt-1 text-sm text-muted-foreground"
              }
            >
              {t("subtitle")}
            </p>
          </Reveal>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherGroups.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.04}>
                <SoftLink href={serviceGroupHref(locale, item.id)} className="block h-full">
                  <GlassCard className="flex h-full flex-col p-5">
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      {catalogGroupTitle(item.id, locale, item.title)}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {catalogGroupSummary(item.id, locale)}
                    </p>
                  </GlassCard>
                </SoftLink>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {!hostingOnly ? (
        <Reveal delay={0.08}>
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" className="rounded-2xl px-7">
              <SoftLink href={localizedHref(locale, "/diensten")}>{t("viewAll")}</SoftLink>
            </Button>
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}

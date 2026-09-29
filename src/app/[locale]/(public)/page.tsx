import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { SoftLink } from "@/components/shared/SoftLink";
import { HomeHeroBanner } from "@/components/marketing/HomeHeroBanner";
import { BrandingCollage } from "@/components/marketing/BrandingCollage";
import { Reveal } from "@/components/marketing/Reveal";
import { HomeServiceCards } from "@/components/marketing/HomeServiceCards";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import { DomainSearch } from "@/components/domains/DomainSearch";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { localizedHref } from "@/i18n/pathnames";
import { getAiScanCount } from "@/lib/ai-scan-count";
import { BRANDING_CONTACT_IMAGE, BRANDING_SERVICES_IMAGE } from "@/lib/branding-images";
import { buildPageMetadata, buildStaticPageMetadata, organizationJsonLd } from "@/lib/seo";
import {
  loadShopCatalogFromDb,
  resolvePlanNamesFromCatalog,
  resolvePlanPricesFromCatalog,
} from "@/lib/shop/catalog";
import {
  catalogGroupSummary,
  serviceGroupHref,
  sortedServiceGroups,
} from "@/content/fixweb/catalog";
import { catalogGroupTitle } from "@/content/fixweb/catalog-title";
import { getRequestBrand } from "@/lib/brand/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const brand = await getRequestBrand();
  if (brand.id === "extrahosting") {
    const isNl = locale === "nl";
    return buildPageMetadata({
      locale,
      path: "/",
      title: isNl
        ? "Domeinen en webhosting"
        : "Domains and web hosting",
      description: isNl ? brand.defaultDescription.nl : brand.defaultDescription.en,
      keywords: isNl ? brand.defaultKeywords.nl : brand.defaultKeywords.en,
      image: brand.ogImage,
    });
  }
  return buildStaticPageMetadata(locale, "/");
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const brand = await getRequestBrand();
  const hostingOnly = brand.catalogMode === "domains_hosting";
  const t = await getTranslations();
  const hero = await getTranslations("hero");
  const services = await getTranslations("services");
  const pricing = await getTranslations("pricing");
  const faq = await getTranslations("faq");
  const shop = await getTranslations("shop");
  const domains = await getTranslations("domainsPage");

  const scanCount = getAiScanCount();
  const catalog = await loadShopCatalogFromDb();
  const planPrices = resolvePlanPricesFromCatalog(catalog);
  const planNames = resolvePlanNamesFromCatalog(catalog, locale);

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

  const serviceGroups = hostingOnly
    ? sortedServiceGroups(locale).filter((g) => g.id === "hosting")
    : sortedServiceGroups(locale);

  return (
    <div className="overflow-x-clip">
      <JsonLd data={organizationJsonLd()} />
      <HomeHeroBanner scanCount={scanCount} />

      <section className="mx-auto w-full max-w-6xl px-4 pt-6 pb-3 sm:px-5 md:px-6 md:pt-10 md:pb-4">
        <Reveal from="up" duration={0.55}>
          <div className="mx-auto max-w-3xl text-center md:max-w-none">
            <h2 className="font-display text-balance text-[1.7rem] font-semibold tracking-tight text-primary sm:text-[2.1rem] md:whitespace-nowrap md:text-[2.5rem]">
              {domains("heroTitle")}
            </h2>
            <p className="-mt-1.5 text-sm text-muted-foreground md:whitespace-nowrap md:text-base">
              {domains("heroSubtitle")}
            </p>
          </div>
        </Reveal>
        <Reveal from="up" delay={0.05} duration={0.55}>
          <div className="mx-auto mt-5 w-full min-w-0 overflow-hidden rounded-3xl border border-border/70 bg-background/80 p-3 shadow-sm backdrop-blur sm:mt-6 sm:p-5 md:p-6">
            <DomainSearch tldGridRows={3} />
          </div>
          <p className="mx-auto mt-3 w-full text-center text-xs text-muted-foreground sm:text-sm md:whitespace-nowrap">
            {domains("heroSubtitleNote")}
          </p>
        </Reveal>
      </section>

      {!hostingOnly ? (
        <BrandingCollage
          href={localizedHref(locale, "/diensten")}
          label={services("title")}
        />
      ) : null}

      {!hostingOnly ? (
        <PricingPlans
          plans={plans}
          labels={{
            subtitle: shop("subtitle"),
            categoryTitle: shop("plans"),
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
            viewAll: pricing("viewAll"),
          }}
        />
      ) : null}

      {!hostingOnly ? (
        <BrandingCollage
          href={localizedHref(locale, "/diensten")}
          src={BRANDING_SERVICES_IMAGE}
          label={services("title")}
        />
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pt-10 pb-4 md:px-6 md:pt-12 md:pb-6">
        <Reveal from="up" duration={0.6}>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-primary md:text-5xl">
              {hostingOnly ? shop("title") : services("title")}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {hostingOnly ? shop("subtitle") : services("subtitle")}
            </p>
          </div>
        </Reveal>

        <HomeServiceCards
          items={serviceGroups.map((group) => ({
            id: group.id,
            href: serviceGroupHref(locale, group.id),
            title: catalogGroupTitle(group.id, locale, group.title),
            summary: catalogGroupSummary(group.id, locale),
          }))}
        />

        <Reveal from="scale" delay={0.1} duration={0.5}>
          <div className="mt-8 flex justify-center md:mt-10">
            <Button asChild size="lg" className="rounded-2xl px-7">
              <SoftLink
                href={
                  hostingOnly
                    ? serviceGroupHref(locale, "hosting")
                    : localizedHref(locale, "/diensten")
                }
              >
                {services("viewAll")}
              </SoftLink>
            </Button>
          </div>
        </Reveal>
      </section>

      <BrandingCollage
        href={localizedHref(locale, "/contact")}
        src={BRANDING_CONTACT_IMAGE}
        label={t("nav.contact")}
        className="pt-6 pb-2 md:pt-8 md:pb-3"
      />

      <section className="mx-auto max-w-6xl px-4 pt-10 pb-16 md:px-6 md:pt-12 md:pb-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal from="left" duration={0.6}>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
              {faq("title")}
            </h2>
            <p className="mt-3 max-w-sm text-muted-foreground">{hero("ctaBannerText")}</p>
            <Button asChild size="lg" className="mt-5 rounded-2xl px-7">
              <SoftLink href={localizedHref(locale, "/faq")}>{faq("viewAll")}</SoftLink>
            </Button>
          </Reveal>
          <Reveal from="right" delay={0.1} duration={0.65}>
            <div className="glass glow-hover relative overflow-hidden rounded-[1.75rem] px-5 md:px-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="1" className="border-border/60">
                  <AccordionTrigger className="text-start font-display text-base hover:no-underline md:text-lg">
                    {faq("q1")}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq("a1")}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="2" className="border-border/60">
                  <AccordionTrigger className="text-start font-display text-base hover:no-underline md:text-lg">
                    {faq("q2")}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq("a2")}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="3" className="border-border/60">
                  <AccordionTrigger className="text-start font-display text-base hover:no-underline md:text-lg">
                    {faq("q3")}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq("a3")}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-2 md:px-6 md:pb-3">
        <Reveal from="scale" duration={0.7}>
          <div className="glow-hover relative overflow-hidden rounded-4xl">
            <div className="glow-bg absolute inset-0" aria-hidden>
              <Image
                src="/branding/banner1-nieuw.jpg"
                alt=""
                fill
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="-scale-x-100 object-cover object-center"
              />
            </div>
            <div className="cta-brand-gradient glow-bg pointer-events-none absolute inset-0" aria-hidden />
            <div
              className="glow-bg pointer-events-none absolute inset-0 opacity-50"
              aria-hidden
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 70% 80% at 85% 50%, rgba(255,255,255,0.12), transparent 55%), radial-gradient(ellipse 50% 60% at 10% 80%, rgba(0,0,0,0.22), transparent 50%)",
              }}
            />
            <div className="relative z-1 px-8 py-14 text-center text-white md:px-14 md:py-20">
              <p className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
                {t("hero.ctaScanTitle")}
              </p>
              <p className="mx-auto mt-4 max-w-xl text-base text-white/70 md:text-lg">
                {t("hero.ctaBannerText")}
              </p>
              <Button
                asChild
                size="lg"
                className="mt-8 rounded-2xl bg-white text-primary hover:bg-white/90"
              >
                <SoftLink href={localizedHref(locale, "/afspraak")}>{t("nav.book")}</SoftLink>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

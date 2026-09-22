import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { SoftLink } from "@/components/shared/SoftLink";
import { GlassCard } from "@/components/marketing/GlassCard";
import { HomeHeroBanner } from "@/components/marketing/HomeHeroBanner";
import { HomeIntroSection } from "@/components/marketing/HomeIntroSection";
import { Reveal } from "@/components/marketing/Reveal";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { localizedHref } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";
import { getAiScanCount } from "@/lib/ai-scan-count";
import { buildStaticPageMetadata, organizationJsonLd } from "@/lib/seo";
import {
  catalogGroupSummary,
  serviceGroupHref,
  sortedServiceGroups,
} from "@/content/fixweb/catalog";
import { catalogGroupTitle } from "@/content/fixweb/catalog-title";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "/");
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const hero = await getTranslations("hero");
  const services = await getTranslations("services");
  const pricing = await getTranslations("pricing");
  const faq = await getTranslations("faq");

  const scanCount = getAiScanCount();

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
    <div className="overflow-x-hidden">
      <JsonLd data={organizationJsonLd()} />
      <HomeHeroBanner />

      <HomeIntroSection scanCount={scanCount} />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <Reveal from="up" duration={0.6}>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
              {services("title")}
            </h2>
            <p className="mt-3 text-muted-foreground md:text-lg">{services("subtitle")}</p>
          </div>
        </Reveal>

        <div className="grid gap-3 md:grid-cols-6">
          {sortedServiceGroups(locale).map((group, index) => {
            const span =
              index < 2
                ? "md:col-span-3"
                : index === 5
                  ? "md:col-span-6"
                  : "md:col-span-2";
            const from =
              index % 3 === 0 ? "left" : index % 3 === 1 ? "up" : "right";

            return (
              <Reveal
                key={group.id}
                from={from}
                delay={Math.min(index * 0.07, 0.35)}
                duration={0.55}
                className={cn("h-full", span)}
              >
                <SoftLink href={serviceGroupHref(locale, group.id)} className="block h-full">
                  <GlassCard className="flex h-full flex-col p-5 md:p-5">
                    <h3 className="font-display text-lg font-semibold tracking-tight md:text-xl">
                      {catalogGroupTitle(group.id, locale, group.title)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {catalogGroupSummary(group.id, locale)}
                    </p>
                  </GlassCard>
                </SoftLink>
              </Reveal>
            );
          })}
        </div>

        <Reveal from="scale" delay={0.1} duration={0.5}>
          <div className="mt-8 flex justify-center md:mt-10">
            <Button asChild size="lg" className="rounded-2xl px-7">
              <SoftLink href={localizedHref(locale, "/diensten")}>{services("viewAll")}</SoftLink>
            </Button>
          </div>
        </Reveal>
      </section>

      <PricingPlans
        plans={plans}
        labels={{
          title: pricing("title"),
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

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal from="left" duration={0.6}>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
              {faq("title")}
            </h2>
            <p className="mt-3 max-w-sm text-muted-foreground">{hero("ctaBannerText")}</p>
          </Reveal>
          <Reveal from="right" delay={0.1} duration={0.65}>
            <div className="glass glow-hover relative overflow-hidden rounded-[1.75rem] px-5 md:px-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="1" className="border-border/60">
                  <AccordionTrigger className="text-left font-display text-base hover:no-underline md:text-lg">
                    {faq("q1")}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq("a1")}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="2" className="border-border/60">
                  <AccordionTrigger className="text-left font-display text-base hover:no-underline md:text-lg">
                    {faq("q2")}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq("a2")}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="3" className="border-border/60">
                  <AccordionTrigger className="text-left font-display text-base hover:no-underline md:text-lg">
                    {faq("q3")}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq("a3")}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 md:px-6 md:pb-12">
        <Reveal from="scale" duration={0.7}>
          <div className="glow-hover relative overflow-hidden rounded-4xl">
            <div className="glow-bg absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(94,59,136,0.45),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(0,124,141,0.28),transparent_42%),linear-gradient(135deg,#2a1845,#14181f_55%,#0f1720)]" />
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
                <SoftLink href={localizedHref(locale, "/afspraak")}>{t("hero.ctaScan")}</SoftLink>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

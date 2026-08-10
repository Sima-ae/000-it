import { getTranslations, setRequestLocale } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SoftLink } from "@/components/shared/SoftLink";
import { GlassCard } from "@/components/marketing/GlassCard";
import { AnimatedCounter } from "@/components/marketing/AnimatedCounter";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { Reveal } from "@/components/marketing/Reveal";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { getAiScanCount } from "@/lib/ai-scan-count";

const serviceKeys = [
  { key: "ai", href: "/diensten/ai-integration" },
  { key: "web", href: "/diensten/custom-webdesign" },
  { key: "ads", href: "/diensten/digital-marketing" },
  { key: "content", href: "/diensten/content-writing" },
  { key: "seo", href: "/diensten/seo-optimization" },
  { key: "software", href: "/diensten/nextjs-development" },
] as const;

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
      monthlyPrice: 44.95,
      features: pricing.raw("features.starter") as string[],
      featured: false,
    },
    {
      id: "growth" as const,
      name: pricing("growth"),
      monthlyPrice: 99.95,
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
      <section className="relative bg-transparent">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-4 pt-8 md:px-6 md:pb-6 md:pt-10 lg:grid-cols-2 lg:gap-10">
          <div className="max-w-xl">
            <h1 className="font-display text-2xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
              {hero("title")}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              {hero("subtitle")}
            </p>
            <div className="mt-8 space-y-3">
              <p className="font-display text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                {hero("ctaHeroTitle")}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="rounded-2xl px-7">
                  <SoftLink href={`/${locale}/ai-scan`}>{hero("ctaScan")}</SoftLink>
                </Button>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-border/70 px-3 py-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="font-display text-base font-bold tracking-tight text-foreground">
                    <AnimatedCounter value={scanCount} />
                  </span>
                  <span className="text-xs text-muted-foreground">{hero("scansLabel")}</span>
                </div>
              </div>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      <PricingPlans
        plans={plans}
        labels={{
          title: pricing("title"),
          subtitle: pricing("subtitle"),
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
        <Reveal>
          <div className="mb-10 max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
              {services("title")}
            </h2>
            <p className="mt-3 text-muted-foreground md:text-lg">{services("subtitle")}</p>
          </div>
        </Reveal>

        <div className="grid gap-3 md:grid-cols-6">
          {serviceKeys.map((item, index) => {
            const span =
              index < 2
                ? "md:col-span-3"
                : item.key === "software"
                  ? "md:col-span-6"
                  : "md:col-span-2";

            return (
              <Reveal key={item.key} delay={index * 0.05} className={cn("h-full", span)}>
                <SoftLink href={`/${locale}${item.href}`} className="block h-full">
                  <GlassCard className="flex h-full flex-col p-5 md:p-5">
                    <h3 className="font-display text-lg font-semibold tracking-tight md:text-xl">
                      {services(`items.${item.key}.title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {services(`items.${item.key}.desc`)}
                    </p>
                  </GlassCard>
                </SoftLink>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
              {faq("title")}
            </h2>
            <p className="mt-3 max-w-sm text-muted-foreground">{hero("subtitle")}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="glass rounded-[1.75rem] px-5 md:px-6">
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
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(91,60,139,0.45),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(26,166,138,0.28),transparent_42%),linear-gradient(135deg,#2a1845,#14181f_55%,#0f1720)]" />
            <div className="relative px-8 py-14 text-center text-white md:px-14 md:py-20">
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
                <SoftLink href={`/${locale}/afspraak`}>{t("hero.ctaScan")}</SoftLink>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

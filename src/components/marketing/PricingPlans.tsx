"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import { ServiceInquiryDialog } from "@/components/marketing/ServiceInquiryDialog";
import { useCartStore } from "@/lib/shop/cart-store";
import { cn } from "@/lib/utils";

export type PricingPlan = {
  id: "starter" | "growth" | "enterprise";
  name: string;
  /** Monthly price in euros, or null for custom/enterprise */
  monthlyPrice: number | null;
  features: string[];
  featured: boolean;
};

type Billing = "monthly" | "yearly";

function formatEuro(amount: number, locale: string) {
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/** Append billing period to the 1× webhosting feature for starter/growth plans. */
function withHostingPeriod(feature: string, billing: Billing, locale: string) {
  const isHosting =
    /^1\s*[×x]\s*web\s*-?hosting$/i.test(feature.trim()) ||
    /^1\s*[×x]\s*webhosting$/i.test(feature.trim());
  if (!isHosting) return feature;

  if (locale === "nl") {
    return billing === "yearly"
      ? "1× webhosting (12 maanden)"
      : "1× webhosting (1 maand)";
  }
  return billing === "yearly"
    ? "1× web hosting (12 months)"
    : "1× web hosting (1 month)";
}

export function PricingPlans({
  plans,
  labels,
}: {
  plans: PricingPlan[];
  labels: {
    title: string;
    subtitle: string;
    plansHeadline: string;
    monthly: string;
    yearly: string;
    save: string;
    perMonth: string;
    perYear: string;
    cta: string;
    ctaContact: string;
    custom: string;
    mostChosen: string;
  };
}) {
  const locale = useLocale();
  const router = useRouter();
  const addPlan = useCartStore((s) => s.addPlan);
  const [billing, setBilling] = useState<Billing>("monthly");
  const [hoveredPlanId, setHoveredPlanId] = useState<string | null>(null);

  const resolved = useMemo(
    () =>
      plans.map((plan) => {
        if (plan.monthlyPrice == null) {
          return {
            ...plan,
            displayPrice: labels.custom,
            period: null as string | null,
          };
        }
        if (billing === "yearly") {
          const yearly = Math.round(plan.monthlyPrice * 12 * 0.9 * 100) / 100;
          return {
            ...plan,
            displayPrice: formatEuro(yearly, locale),
            period: labels.perYear,
          };
        }
        return {
          ...plan,
          displayPrice: formatEuro(plan.monthlyPrice, locale),
          period: labels.perMonth,
        };
      }),
    [plans, billing, labels, locale],
  );

  function orderPlan(planId: "starter" | "growth") {
    addPlan(planId, billing, 1);
    router.push(`/${locale}/shop/cart`);
  }

  return (
    <section
      id="prijzen"
      className="mx-auto max-w-6xl scroll-mt-28 px-4 py-10 md:scroll-mt-32 md:px-6 md:py-12"
    >
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[1.65rem] font-semibold tracking-tight md:text-[2.05rem]">
            {labels.title}
          </h2>
          <p className="mt-1 text-sm font-normal text-muted-foreground md:text-base">
            ({labels.subtitle})
          </p>
        </div>
      </Reveal>

      <div className="mb-6 mt-8 flex flex-col items-center gap-3 md:mt-10">
        <p className="max-w-xl text-center font-display text-lg font-semibold tracking-tight text-foreground md:text-xl">
          {labels.plansHeadline}
        </p>
        <div
          role="group"
          aria-label={locale === "nl" ? "Facturatieperiode" : "Billing period"}
          className="inline-flex rounded-full border border-border/60 bg-muted/50 p-0.5"
        >
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition md:text-[13px]",
              billing === "monthly"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {labels.monthly}
          </button>
          <button
            type="button"
            onClick={() => setBilling("yearly")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition md:text-[13px]",
              billing === "yearly"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {labels.yearly}
          </button>
        </div>
        {billing === "yearly" ? (
          <p className="text-xs font-medium text-primary">{labels.save}</p>
        ) : null}
      </div>

      <div
        className="grid items-stretch gap-3 lg:grid-cols-3 lg:gap-4"
        onMouseLeave={() => setHoveredPlanId(null)}
      >
        {resolved.map((plan, index) => {
          const glowOnHover = hoveredPlanId === plan.id;
          const featuredIdlePulse = plan.featured && hoveredPlanId === null;

          return (
          <Reveal key={plan.id} delay={index * 0.06}>
            <div
              onMouseEnter={() => setHoveredPlanId(plan.id)}
              className="h-full"
            >
            <GlassCard
              glow={false}
              className={cn(
                "relative flex h-full flex-col overflow-hidden rounded-2xl p-5 transition-shadow duration-300",
                plan.featured && "mesh-panel lg:-translate-y-1",
                featuredIdlePulse && "pricing-featured-pulse ring-1 ring-primary/25",
                glowOnHover && "pricing-card-glow ring-1 ring-primary/30",
              )}
            >
              {plan.featured ? (
                <div className="pricing-badge absolute right-3 top-3 z-10 rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary-foreground">
                  {labels.mostChosen}
                </div>
              ) : null}
              <h3
                className={cn(
                  "font-display text-base font-semibold tracking-tight md:text-lg",
                  plan.featured && "pr-20",
                )}
              >
                {plan.name}
              </h3>
              <p className="mt-2 font-display text-2xl font-bold tracking-tight md:text-[1.75rem]">
                {plan.displayPrice}
                {plan.period ? (
                  <span className="ml-1 text-xs font-medium text-muted-foreground">
                    {plan.period}
                  </span>
                ) : null}
              </p>
              <ul className="mt-4 flex-1 space-y-1.5 text-[13px] leading-snug text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span>{withHostingPeriod(f, billing, locale)}</span>
                  </li>
                ))}
              </ul>
              {plan.id === "enterprise" ? (
                <ServiceInquiryDialog
                  serviceTitle={plan.name}
                  source="PRICING_ENTERPRISE"
                  triggerLabel={labels.ctaContact}
                  dialogTitle={
                    locale === "nl" ? "Contact over Enterprise" : "Contact about Enterprise"
                  }
                  dialogDescription={
                    locale === "nl"
                      ? "Vertel kort wat u nodig heeft — we sturen een voorstel op maat."
                      : "Tell us briefly what you need — we’ll send a tailored proposal."
                  }
                  messageHint={locale === "nl" ? "Enterprise-plan" : "Enterprise plan"}
                  variant="outline"
                  size="sm"
                  className="mt-5 w-full rounded-xl"
                />
              ) : (
                <Button
                  className="mt-5 w-full rounded-xl"
                  size="sm"
                  variant={plan.featured ? "default" : "outline"}
                  onClick={() => {
                    if (plan.id === "starter" || plan.id === "growth") {
                      orderPlan(plan.id);
                    }
                  }}
                >
                  {labels.cta}
                </Button>
              )}
            </GlassCard>
            </div>
          </Reveal>
          );
        })}
      </div>
    </section>
  );
}

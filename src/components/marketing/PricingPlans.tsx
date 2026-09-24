"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import { ServiceInquiryDialog } from "@/components/marketing/ServiceInquiryDialog";
import { SoftLink } from "@/components/shared/SoftLink";
import { useCartStore } from "@/lib/shop/cart-store";
import { cn } from "@/lib/utils";
import { hashFor, localizedHref } from "@/i18n/pathnames";

export type PricingPlan = {
  id: "starter" | "growth" | "enterprise";
  name: string;
  /** Monthly price in euros, or null for custom/enterprise */
  monthlyPrice: number | null;
  /**
   * Optional catalog yearly price (euros). When set, used instead of
   * computing monthly × 12 × 0.9.
   */
  yearlyPrice?: number | null;
  features: string[];
  featured: boolean;
};

type Billing = "monthly" | "yearly";

function formatEuro(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function PricingPlans({
  plans,
  labels,
  variant = "standalone",
}: {
  plans: PricingPlan[];
  labels: {
    title: string;
    subtitle: string;
    /** Green section label under the page title (homepage). Embedded uses `title` for this. */
    categoryTitle?: string;
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
    viewAll?: string;
  };
  /** `embedded` = shop block under Winkel (category title only). */
  variant?: "standalone" | "embedded";
}) {
  const locale = useLocale();
  const t = useTranslations("pricing");
  const router = useRouter();
  const addPlan = useCartStore((s) => s.addPlan);
  const [billing, setBilling] = useState<Billing>("monthly");
  const [hoveredPlanId, setHoveredPlanId] = useState<string | null>(null);
  const embedded = variant === "embedded";
  const categoryLabel = embedded ? labels.title : labels.categoryTitle;

  function withHostingPeriod(feature: string, period: Billing) {
    const isHosting =
      /^1\s*[×x]\s*web\s*-?hosting$/i.test(feature.trim()) ||
      /^1\s*[×x]\s*webhosting$/i.test(feature.trim());
    if (!isHosting) return feature;
    return period === "yearly" ? t("hostingYear") : t("hostingMonth");
  }

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
          const yearly =
            plan.yearlyPrice != null && Number.isFinite(plan.yearlyPrice)
              ? plan.yearlyPrice
              : Math.round(plan.monthlyPrice * 12 * 0.9 * 100) / 100;
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
    router.push(localizedHref(locale, "/shop/cart"));
  }

  return (
    <section
      id={embedded ? undefined : hashFor(locale, "prijzen")}
      className={cn(
        embedded
          ? "scroll-mt-28 md:scroll-mt-32"
          : "mx-auto max-w-6xl scroll-mt-28 px-4 pt-6 pb-0 md:scroll-mt-32 md:px-6 md:pt-8",
      )}
    >
      {categoryLabel ? (
        <Reveal from="up" duration={0.45}>
          <h3 className="text-center font-display text-2xl font-semibold tracking-tight text-accent">
            {categoryLabel}
          </h3>
        </Reveal>
      ) : null}

      <div
        className={cn(
          "mb-5 flex flex-col items-center gap-2.5",
          categoryLabel ? "mt-2.5" : "mt-0",
        )}
      >
        <p className="max-w-4xl text-center text-muted-foreground md:whitespace-nowrap">
          {labels.plansHeadline}
        </p>
        <div
          role="group"
          aria-label={t("billingPeriod")}
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
          <Reveal
            key={plan.id}
            from={index === 0 ? "left" : index === 2 ? "right" : "up"}
            delay={index * 0.08}
            duration={0.55}
          >
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
                    <span>{withHostingPeriod(f, billing)}</span>
                  </li>
                ))}
              </ul>
              {plan.id === "enterprise" ? (
                <ServiceInquiryDialog
                  serviceTitle={plan.name}
                  source="PRICING_ENTERPRISE"
                  triggerLabel={labels.ctaContact}
                  dialogTitle={t("contactEnterprise")}
                  dialogDescription={t("enterpriseDesc")}
                  messageHint={t("enterpriseHint")}
                  variant="outline"
                  className="mt-5 w-full rounded-2xl"
                />
              ) : (
                <Button
                  className="mt-5 w-full rounded-2xl"
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

      {!embedded ? (
        <Reveal from="up" duration={0.55}>
          <div className="mx-auto mt-12 max-w-2xl text-center md:mt-14">
            <h2 className="font-display text-4xl font-semibold tracking-tight text-primary md:text-5xl">
              {labels.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{labels.subtitle}</p>
            {labels.viewAll ? (
              <div className="mt-8 flex justify-center md:mt-10">
                <Button asChild size="lg" className="rounded-2xl px-7">
                  <SoftLink href={localizedHref(locale, "/shop")}>
                    {labels.viewAll}
                  </SoftLink>
                </Button>
              </div>
            ) : null}
          </div>
        </Reveal>
      ) : null}
    </section>
  );
}

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
    // Always use the currently selected billing toggle (monthly vs yearly total).
    addPlan(planId, billing, 1);
    router.push(`/${locale}/shop/cart`);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
      <Reveal>
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
            {labels.title}
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg">{labels.subtitle}</p>
        </div>
      </Reveal>

      <div className="mb-10 flex flex-col items-center gap-3">
        <div
          role="group"
          aria-label={locale === "nl" ? "Facturatieperiode" : "Billing period"}
          className="inline-flex rounded-2xl border border-border/70 bg-muted/40 p-1"
        >
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition",
              billing === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {labels.monthly}
          </button>
          <button
            type="button"
            onClick={() => setBilling("yearly")}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition",
              billing === "yearly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {labels.yearly}
          </button>
        </div>
        {billing === "yearly" ? (
          <p className="text-sm font-medium text-primary">{labels.save}</p>
        ) : (
          <p className="h-5 text-sm text-transparent select-none">{labels.save}</p>
        )}
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-3">
        {resolved.map((plan, index) => (
          <Reveal key={plan.id} delay={index * 0.08}>
            <GlassCard
              className={cn(
                "relative flex h-full flex-col overflow-hidden",
                plan.featured && "mesh-panel ring-1 ring-primary/20 lg:-translate-y-3 lg:scale-[1.03]",
              )}
            >
              {plan.featured && (
                <div className="mb-4 inline-flex w-fit rounded-xl bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {labels.mostChosen}
                </div>
              )}
              <h3 className="font-display text-xl font-semibold tracking-tight">{plan.name}</h3>
              <p className="mt-4 font-display text-4xl font-bold tracking-tight">
                {plan.displayPrice}
                {plan.period ? (
                  <span className="ml-1 text-sm font-medium text-muted-foreground">{plan.period}</span>
                ) : null}
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {withHostingPeriod(f, billing, locale)}
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
                  size="default"
                  className="mt-8 w-full"
                />
              ) : (
                <Button
                  className="mt-8 w-full rounded-2xl"
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
          </Reveal>
        ))}
      </div>
    </section>
  );
}

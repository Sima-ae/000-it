"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import { useCartStore } from "@/lib/shop/cart-store";
import {
  SUPPORT_PACKAGE_KEYS,
  SUPPORT_PACKAGE_PRICES,
  type SupportPackageKey,
} from "@/lib/shop/catalog";
import { localizedHref } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";

type Billing = "monthly" | "yearly";

type FeatureKey =
  | "sites"
  | "monitoring"
  | "backups"
  | "updates"
  | "errors"
  | "malware"
  | "speed"
  | "seo";

const PACKAGE_FEATURES: Record<
  SupportPackageKey,
  { key: FeatureKey; included: boolean }[]
> = {
  pro: [
    { key: "sites", included: true },
    { key: "monitoring", included: true },
    { key: "backups", included: true },
    { key: "updates", included: true },
    { key: "errors", included: true },
    { key: "malware", included: true },
    { key: "speed", included: false },
    { key: "seo", included: false },
  ],
  double: [
    { key: "sites", included: true },
    { key: "monitoring", included: true },
    { key: "backups", included: true },
    { key: "updates", included: true },
    { key: "errors", included: true },
    { key: "malware", included: true },
    { key: "speed", included: true },
    { key: "seo", included: false },
  ],
  premium: [
    { key: "sites", included: true },
    { key: "monitoring", included: true },
    { key: "backups", included: true },
    { key: "updates", included: true },
    { key: "errors", included: true },
    { key: "malware", included: true },
    { key: "speed", included: true },
    { key: "seo", included: true },
  ],
};

function formatEuro(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function WordPressSupportPlans() {
  const locale = useLocale();
  const t = useTranslations("wordpressSupport");
  const tPricing = useTranslations("pricing");
  const router = useRouter();
  const addSupportPackage = useCartStore((s) => s.addSupportPackage);
  const [billing, setBilling] = useState<Billing>("monthly");
  const [hovered, setHovered] = useState<string | null>(null);

  const packages = useMemo(
    () =>
      SUPPORT_PACKAGE_KEYS.map((key) => {
        const pricing = SUPPORT_PACKAGE_PRICES[key];
        const price =
          billing === "yearly" ? pricing.yearly : pricing.monthly;
        return {
          key,
          name: t(`packages.${key}.name`),
          tagline: t(`packages.${key}.tagline`),
          price,
          period: billing === "yearly" ? tPricing("year") : tPricing("month"),
          savePercent: pricing.savePercent,
          features: PACKAGE_FEATURES[key],
          featured: key === "double",
        };
      }),
    [billing, t, tPricing],
  );

  function orderPackage(key: SupportPackageKey) {
    addSupportPackage(key, billing, 1);
    router.push(localizedHref(locale, "/shop/cart"));
  }

  return (
    <section className="scroll-mt-28 md:scroll-mt-32">
      <div className="mb-6 flex flex-col items-center gap-3">
        <div
          role="group"
          aria-label={tPricing("billingPeriod")}
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
            {tPricing("monthly")}
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
            {tPricing("yearly")}
          </button>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {t("saveYearlyHint")}
        </p>
      </div>

      <div
        className="grid items-stretch gap-3 lg:grid-cols-3 lg:gap-4"
        onMouseLeave={() => setHovered(null)}
      >
        {packages.map((pkg, index) => {
          const glowOnHover = hovered === pkg.key;
          const featuredIdle = pkg.featured && hovered === null;

          return (
            <Reveal
              key={pkg.key}
              from={index === 0 ? "left" : index === 2 ? "right" : "up"}
              delay={index * 0.08}
              duration={0.55}
            >
              <div
                onMouseEnter={() => setHovered(pkg.key)}
                className="h-full"
              >
                <GlassCard
                  glow={false}
                  className={cn(
                    "relative flex h-full flex-col overflow-hidden rounded-2xl p-5 transition-shadow duration-300",
                    pkg.featured && "mesh-panel lg:-translate-y-1",
                    featuredIdle &&
                      "pricing-featured-pulse ring-1 ring-primary/25",
                    glowOnHover && "pricing-card-glow ring-1 ring-primary/30",
                  )}
                >
                  {pkg.featured ? (
                    <div className="pricing-badge absolute right-3 top-3 z-10 rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary-foreground">
                      {tPricing("mostChosen")}
                    </div>
                  ) : null}
                  <h3
                    className={cn(
                      "font-display text-base font-semibold tracking-tight md:text-lg",
                      pkg.featured && "pr-20",
                    )}
                  >
                    {pkg.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pkg.tagline}
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold tracking-tight md:text-[1.75rem]">
                    {formatEuro(pkg.price, locale)}
                    <span className="ml-1 text-xs font-medium text-muted-foreground">
                      {pkg.period}
                    </span>
                  </p>
                  {billing === "yearly" ? (
                    <p className="mt-1 text-xs font-medium text-accent">
                      {t("savePercent", { percent: pkg.savePercent })}
                    </p>
                  ) : null}
                  <ul className="mt-4 flex-1 space-y-1.5 text-[13px] leading-snug text-muted-foreground">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature.key}
                        className={cn(
                          "flex items-start gap-2",
                          !feature.included && "opacity-45 line-through",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-1.5 h-1 w-1 shrink-0 rounded-full",
                            feature.included ? "bg-accent" : "bg-muted-foreground",
                          )}
                        />
                        <span>{t(`features.${feature.key}.${pkg.key}`)}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-5 w-full rounded-xl"
                    size="sm"
                    variant={pkg.featured ? "default" : "outline"}
                    onClick={() => orderPackage(pkg.key)}
                  >
                    {t("orderNow")}
                  </Button>
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    {t("noCreditCard")}
                  </p>
                </GlassCard>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

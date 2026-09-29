"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import { useCartStore } from "@/lib/shop/cart-store";
import { formatShopEuro } from "@/lib/shop/vat";
import { localizedHref } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";
import {
  WP_CARE_HOSTING_FEATURE_INDEX,
  WP_CARE_PRICES,
  wpCarePackages,
  wpCareUi,
  type WpCareHosting,
  type WpCareKey,
} from "@/content/wordpress-care";

export function WordPressCarePlans({
  prices = WP_CARE_PRICES,
  showTitle = false,
}: {
  prices?: typeof WP_CARE_PRICES;
  showTitle?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("pricing");
  const tShop = useTranslations("shop");
  const care = useMemo(() => wpCareUi(locale), [locale]);
  const router = useRouter();
  const addWpCarePackage = useCartStore((s) => s.addWpCarePackage);
  const [hosting, setHosting] = useState<WpCareHosting>("with");
  const [hovered, setHovered] = useState<WpCareKey | null>(null);
  const packages = useMemo(() => wpCarePackages(locale, prices), [locale, prices]);

  function orderPackage(key: WpCareKey) {
    addWpCarePackage(key, hosting, 1);
    router.push(localizedHref(locale, "/shop/cart"));
  }

  return (
    <section className="scroll-mt-28 md:scroll-mt-32">
      {showTitle ? (
        <Reveal from="up" duration={0.45}>
          <h2 className="text-center font-display text-2xl font-semibold tracking-tight text-accent">
            {care.title}
          </h2>
        </Reveal>
      ) : null}

      <div
        className={cn(
          "mb-5 flex flex-col items-center gap-2.5",
          showTitle && "mt-2.5",
        )}
      >
        <p className="max-w-3xl text-center text-muted-foreground">
          {care.headline}
        </p>
        <div
          role="group"
          aria-label={care.hostingChoice}
          className="inline-flex rounded-full border border-border/60 bg-muted/50 p-0.5"
        >
          <button
            type="button"
            onClick={() => setHosting("with")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition md:text-[13px]",
              hosting === "with"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {care.withHosting}
          </button>
          <button
            type="button"
            onClick={() => setHosting("without")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition md:text-[13px]",
              hosting === "without"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {care.withoutHosting}
          </button>
        </div>
      </div>

      <div
        className="grid items-stretch gap-3 lg:grid-cols-3 lg:gap-4"
        onMouseLeave={() => setHovered(null)}
      >
        {packages.map((pkg, index) => {
          const glowOnHover = hovered === pkg.key;
          const featuredIdle = pkg.featured && hovered === null;
          const price =
            hosting === "with" ? pkg.withHosting : pkg.withoutHosting;
          const altPrice =
            hosting === "with" ? pkg.withoutHosting : pkg.withHosting;
          const altTemplate =
            hosting === "with" ? care.altWithout : care.altWith;
          const altLine = altTemplate.replace(
            "{price}",
            formatShopEuro(altPrice, locale),
          );

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
                    <div className="pricing-badge absolute end-3 top-3 z-10 rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary-foreground">
                      {t("mostChosen")}
                    </div>
                  ) : null}
                  <span
                    className={cn(
                      "inline-flex w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary",
                      pkg.featured && "me-16",
                    )}
                  >
                    {pkg.badge}
                  </span>
                  <h3 className="mt-3 font-display text-base font-semibold tracking-tight md:text-lg">
                    {pkg.name}
                  </h3>
                  <p className="mt-2 font-display text-2xl font-bold tracking-tight text-primary md:text-[1.75rem]">
                    {formatShopEuro(price, locale)}
                    <span className="ms-1 text-xs font-medium text-muted-foreground">
                      {t("month")}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{altLine}</p>
                  <ul className="mt-4 flex-1 space-y-1.5 text-[13px] leading-snug text-muted-foreground">
                    {pkg.features.map((feature, featureIndex) => {
                      const included =
                        hosting === "with" ||
                        featureIndex !== WP_CARE_HOSTING_FEATURE_INDEX;
                      return (
                        <li
                          key={feature}
                          className={cn(
                            "flex items-start gap-2",
                            !included && "opacity-45 line-through",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-1.5 h-1 w-1 shrink-0 rounded-full",
                              included ? "bg-accent" : "bg-muted-foreground",
                            )}
                          />
                          <span>{feature}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <Button
                    className="mt-5 w-full rounded-2xl"
                    variant={pkg.featured ? "default" : "outline"}
                    onClick={() => orderPackage(pkg.key)}
                  >
                    {t("cta")}
                  </Button>
                </GlassCard>
              </div>
            </Reveal>
          );
        })}
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">{tShop("subtitle")}</p>
    </section>
  );
}

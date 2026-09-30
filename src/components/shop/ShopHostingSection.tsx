"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import { useCartStore } from "@/lib/shop/cart-store";
import { centsToEuros, formatShopEuro } from "@/lib/shop/vat";
import {
  localizeShopProduct,
  shopHasDiscount,
  shopUnitPriceInclCents,
  type ShopBillingPeriod,
  type ShopProduct,
} from "@/lib/shop/catalog";
import { localizedHref } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";

function hostingFeatures(short: string) {
  return short
    .split(/\n+/)
    .flatMap((line) => line.split(/\s+[–•]\s+/))
    .map((line) => line.replace(/^[–\-•]\s*/, "").trim())
    .filter(Boolean);
}

function packageMonths(product: ShopProduct) {
  if (product.checkoutMonths && product.checkoutMonths > 1) {
    return product.checkoutMonths;
  }
  if (product.billAsYearlyPackage) return 12;
  return 1;
}

export function ShopHostingSection({
  title,
  products,
  id,
  className,
  showTitle = true,
}: {
  title: string;
  products: ShopProduct[];
  id?: string;
  className?: string;
  showTitle?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("shop");
  const tPricing = useTranslations("pricing");
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [billing, setBilling] = useState<ShopBillingPeriod>("monthly");
  const [hovered, setHovered] = useState<string | null>(null);

  if (products.length === 0) return null;

  function orderProduct(productId: string) {
    addItem(productId, 1);
    router.push(localizedHref(locale, "/shop/cart"));
  }

  return (
    <section
      id={id}
      className={cn("mt-16 scroll-mt-28 text-start md:scroll-mt-32", className)}
    >
      {showTitle ? (
        <Reveal from="up" duration={0.45}>
          <h2 className="text-center font-display text-[1.65rem] font-semibold tracking-tight text-accent md:text-[1.75rem]">
            {title}
          </h2>
        </Reveal>
      ) : null}

      <div
        className={cn(
          "mb-5 flex flex-col items-center gap-2.5",
          showTitle ? "mt-2.5" : "mt-0",
        )}
      >
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
      </div>

      <div
        className={cn(
          "grid items-stretch gap-3",
          products.length >= 4
            ? "sm:grid-cols-2 lg:grid-cols-4 lg:gap-3"
            : "lg:grid-cols-3 lg:gap-4",
        )}
        onMouseLeave={() => setHovered(null)}
      >
        {products.map((product, index) => {
          const localized = localizeShopProduct(product, locale);
          const featured =
            product.slug.endsWith("-business") ||
            product.slug.endsWith("-professional");
          const glowOnHover = hovered === product.id;
          const featuredIdle = featured && hovered === null;
          const months = packageMonths(product);
          const showAsYearly = billing === "yearly" && months > 1;
          const multiplier = showAsYearly ? months : 1;
          const hasDiscount = shopHasDiscount(product);
          const listPrice = formatShopEuro(
            centsToEuros(product.priceInclCents * multiplier),
            locale,
          );
          const salePrice = formatShopEuro(
            centsToEuros(shopUnitPriceInclCents(product) * multiplier),
            locale,
          );
          const period = showAsYearly ? tPricing("year") : t("perMonth");
          const features = hostingFeatures(localized.localizedShort);

          return (
            <Reveal
              key={product.id}
              from={
                index === 0
                  ? "left"
                  : index === products.length - 1
                    ? "right"
                    : "up"
              }
              delay={index * 0.08}
              duration={0.55}
            >
              <div
                onMouseEnter={() => setHovered(product.id)}
                className="h-full"
              >
                <GlassCard
                  glow={false}
                  className={cn(
                    "relative flex h-full flex-col overflow-hidden rounded-2xl transition-shadow duration-300",
                    products.length >= 4 ? "p-4" : "p-5",
                    featured && "mesh-panel lg:-translate-y-1",
                    featuredIdle &&
                      "pricing-featured-pulse ring-1 ring-primary/25",
                    glowOnHover && "pricing-card-glow ring-1 ring-primary/30",
                  )}
                >
                  {featured ? (
                    <div className="pricing-badge absolute inset-e-3 top-3 z-10 rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary-foreground">
                      {tPricing("mostChosen")}
                    </div>
                  ) : null}
                  <h3
                    className={cn(
                      "font-display text-base font-semibold tracking-tight md:text-lg",
                      featured && "pe-20",
                    )}
                  >
                    {localized.localizedName}
                  </h3>
                  <p className="mt-2 font-display text-2xl font-bold tracking-tight text-primary md:text-[1.75rem]">
                    {salePrice}
                    <span className="ms-1 text-xs font-medium text-muted-foreground">
                      {period}
                    </span>
                  </p>
                  {hasDiscount ? (
                    <p className="mt-1 text-xs text-muted-foreground line-through">
                      {listPrice}
                    </p>
                  ) : null}
                  {months > 1 && !showAsYearly ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("billedYearly", { months })}
                    </p>
                  ) : null}
                  <ul className="mt-4 flex-1 space-y-1.5 text-[13px] leading-snug text-muted-foreground">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-5 w-full rounded-2xl"
                    variant={featured || glowOnHover ? "default" : "outline"}
                    onClick={() => orderProduct(product.id)}
                  >
                    {tPricing("cta")}
                  </Button>
                </GlassCard>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import {
  SUPPORT_PACKAGE_KEYS,
  type ShopBillingPeriod,
  type ShopProduct,
  type SupportPackageKey,
} from "@/lib/shop/catalog";
import { cn } from "@/lib/utils";

function supportKeyFromSlug(slug: string): SupportPackageKey | null {
  for (const key of SUPPORT_PACKAGE_KEYS) {
    if (slug === `${key}-support` || slug === `${key}-support-yearly`) {
      return key;
    }
  }
  return null;
}

function isYearlySupportSlug(slug: string) {
  return SUPPORT_PACKAGE_KEYS.some((key) => slug === `${key}-support-yearly`);
}

export function ShopSupportSection({
  title,
  products,
}: {
  title: string;
  products: ShopProduct[];
}) {
  const tPricing = useTranslations("pricing");
  const [billing, setBilling] = useState<ShopBillingPeriod>("monthly");

  const visible = useMemo(() => {
    const byKey = new Map<SupportPackageKey, ShopProduct>();
    for (const product of products) {
      const key = supportKeyFromSlug(product.slug);
      if (!key) continue;
      const yearly = isYearlySupportSlug(product.slug);
      if (billing === "yearly" ? yearly : !yearly) {
        byKey.set(key, product);
      }
    }
    return SUPPORT_PACKAGE_KEYS.map((key) => byKey.get(key)).filter(
      (p): p is ShopProduct => Boolean(p),
    );
  }, [products, billing]);

  if (visible.length === 0) return null;

  return (
    <section className="mt-16 text-center">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-accent">
        {title}
      </h2>

      <div className="mb-5 mt-2.5 flex flex-col items-center gap-2.5">
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
        {billing === "yearly" ? (
          <p className="text-xs font-medium text-primary">
            {tPricing("saveYearly")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 text-left md:grid-cols-2 xl:grid-cols-3">
        {visible.map((product) => (
          <ShopProductCard
            key={product.id}
            product={product}
            cartMode="support"
          />
        ))}
      </div>
    </section>
  );
}

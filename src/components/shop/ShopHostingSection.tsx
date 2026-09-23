"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import type { ShopBillingPeriod, ShopProduct } from "@/lib/shop/catalog";
import { cn } from "@/lib/utils";

export function ShopHostingSection({
  title,
  products,
}: {
  title: string;
  products: ShopProduct[];
}) {
  const tPricing = useTranslations("pricing");
  const [billing, setBilling] = useState<ShopBillingPeriod>("monthly");

  if (products.length === 0) return null;

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
      </div>

      <div className="grid gap-4 text-left md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ShopProductCard
            key={product.id}
            product={product}
            pricePeriod={billing}
          />
        ))}
      </div>
    </section>
  );
}

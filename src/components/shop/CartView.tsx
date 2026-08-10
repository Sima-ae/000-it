"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/shop/cart-store";
import { resolveCartItems, cartTotalsInEuros } from "@/lib/shop/cart";
import { localizeShopProduct } from "@/lib/shop/catalog";
import { centsToEuros, formatShopEuro } from "@/lib/shop/vat";

export function CartView() {
  const locale = useLocale();
  const t = useTranslations("shop");
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const totals = useMemo(() => resolveCartItems(items), [items]);
  const euros = cartTotalsInEuros(totals);

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-border/70 bg-muted/20 p-10 text-center">
        <p className="text-muted-foreground">{t("emptyCart")}</p>
        <Button asChild className="mt-6 rounded-2xl">
          <SoftLink href={`/${locale}/shop`}>{t("continueShopping")}</SoftLink>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-4">
        {totals.lines.map((line) => {
          const localized = localizeShopProduct(line.product, locale);
          return (
            <div
              key={line.product.id}
              className="flex gap-4 rounded-2xl border border-border/70 bg-background/60 p-4"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                {line.product.image ? (
                  <Image
                    src={line.product.image}
                    alt={localized.localizedName}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized={line.product.image.startsWith("http")}
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <SoftLink
                  href={`/${locale}/shop/${line.product.slug}`}
                  className="font-medium hover:underline"
                >
                  {localized.localizedName}
                </SoftLink>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatShopEuro(centsToEuros(line.product.priceInclCents), locale)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{t("quantity")}</span>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={line.quantity}
                      onChange={(e) =>
                        setQuantity(line.product.id, Number(e.target.value) || 1)
                      }
                      className="h-9 w-16 rounded-md border border-border bg-background px-2"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeItem(line.product.id)}
                    className="text-sm text-muted-foreground underline-offset-2 hover:underline"
                  >
                    {t("remove")}
                  </button>
                </div>
              </div>
              <p className="shrink-0 font-medium">
                {formatShopEuro(centsToEuros(line.lineInclCents), locale)}
              </p>
            </div>
          );
        })}
      </div>

      <aside className="h-fit rounded-2xl border border-border/70 bg-muted/20 p-6">
        <h2 className="font-display text-xl font-semibold">{t("orderSummary")}</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t("subtotalExcl")}</dt>
            <dd>{formatShopEuro(euros.subtotalExcl, locale)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t("vat")}</dt>
            <dd>{formatShopEuro(euros.vat, locale)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border/60 pt-3 text-base font-semibold">
            <dt>{t("totalIncl")}</dt>
            <dd>{formatShopEuro(euros.totalIncl, locale)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted-foreground">{t("vatNote")}</p>
        <Button asChild className="mt-6 w-full rounded-2xl">
          <SoftLink href={`/${locale}/shop/checkout`}>{t("toCheckout")}</SoftLink>
        </Button>
        <Button asChild variant="ghost" className="mt-2 w-full">
          <SoftLink href={`/${locale}/shop`}>{t("continueShopping")}</SoftLink>
        </Button>
      </aside>
    </div>
  );
}

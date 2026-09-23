"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shop/QuantityStepper";
import { ShopProductImage } from "@/components/shop/ShopProductImage";
import { useCartStore } from "@/lib/shop/cart-store";
import { resolveCartItems, cartTotalsInEuros } from "@/lib/shop/cart";
import { localizeShopProduct, shopUnitPriceInclCents } from "@/lib/shop/catalog";
import { centsToEuros, formatShopEuro } from "@/lib/shop/vat";
import { localizedHref } from "@/i18n/pathnames";

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
          <SoftLink href={localizedHref(locale, "/shop")}>{t("continueShopping")}</SoftLink>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-4">
        {totals.lines.map((line) => {
          const localized = localizeShopProduct(line.product, locale);
          const unitPriceCents =
            line.product.checkoutMonths && line.product.checkoutMonths > 1
              ? shopUnitPriceInclCents(line.product)
              : line.unitInclCents;
          const unit = formatShopEuro(centsToEuros(unitPriceCents), locale);
          return (
            <div
              key={line.product.id}
              className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/60 p-4 sm:flex-row"
            >
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:h-20 sm:w-20">
                <ShopProductImage
                  src={line.product.image}
                  alt={localized.localizedName}
                  sizes="(max-width: 640px) 100vw, 80px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <SoftLink
                  href={localizedHref(locale, `/shop/${line.product.slug}`)}
                  className="font-medium hover:underline"
                >
                  {localized.localizedName}
                </SoftLink>
                <p className="mt-1 text-sm text-muted-foreground">
                  {unit}
                  {line.product.checkoutMonths && line.product.checkoutMonths > 1
                    ? ` ${t("perMonth")}`
                    : null}{" "}
                  <span aria-hidden>·</span> {t("inclVat")}
                </p>
                {line.product.checkoutMonths && line.product.checkoutMonths > 1 ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("billedYearly", { months: line.product.checkoutMonths })}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <QuantityStepper
                    label={t("quantity")}
                    value={line.quantity}
                    onChange={(next) => setQuantity(line.product.id, next)}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(line.product.id)}
                    aria-label={t("remove")}
                    title={t("remove")}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-600/10 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
              <p className="shrink-0 text-right font-semibold sm:pt-1">
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
          <SoftLink href={localizedHref(locale, "/shop/checkout")}>{t("toCheckout")}</SoftLink>
        </Button>
        <Button asChild variant="ghost" className="mt-2 w-full">
          <SoftLink href={localizedHref(locale, "/shop")}>{t("continueShopping")}</SoftLink>
        </Button>
      </aside>
    </div>
  );
}

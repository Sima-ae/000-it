"use client";

import { useLocale, useTranslations } from "next-intl";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import {
  useLiveShopProduct,
  useShopCatalog,
} from "@/components/shop/ShopCatalogProvider";
import {
  localizeShopProduct,
  shopUnitPriceInclCents,
  type ShopProduct,
} from "@/lib/shop/catalog";
import { formatEuro } from "@/lib/format-euro";
import { localizedHref } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";

function featureLines(short: string) {
  return short
    .split(/\n+/)
    .flatMap((line) => line.split(/\s+[–•]\s+/))
    .map((line) => line.replace(/^[–\-•]\s*/, "").trim())
    .filter(Boolean);
}

/**
 * Hero copy/price/specs for a shop-backed service page.
 * Always prefers the live ShopCatalogProvider (DB) over SSR props.
 */
export function LiveServiceProductHero({
  slug,
  fallbackProduct,
  fallbackTitle,
  fallbackSubtitle,
  fallbackPrice,
  fallbackListPrice,
  fallbackFeatures,
  priceSuffix,
  checkoutMonths,
  orderLabel,
  goToCartLabel,
  titleClassName,
  canOrder,
}: {
  slug: string;
  fallbackProduct: ShopProduct | null;
  fallbackTitle: string;
  fallbackSubtitle?: string | null;
  fallbackPrice?: number | null;
  fallbackListPrice?: number | null;
  fallbackFeatures?: string[];
  priceSuffix?: string | null;
  checkoutMonths?: number | null;
  orderLabel: string;
  goToCartLabel: string;
  titleClassName?: string;
  canOrder: boolean;
}) {
  const locale = useLocale();
  const tShop = useTranslations("shop");
  const { titleFor } = useShopCatalog();
  const live = useLiveShopProduct(fallbackProduct ?? undefined);
  const product = live ?? fallbackProduct ?? null;

  const localized = product ? localizeShopProduct(product, locale) : null;
  const title = (
    localized?.localizedName?.trim() ||
    titleFor(slug, locale, fallbackTitle) ||
    fallbackTitle
  ).trim();
  const features = localized?.localizedShort
    ? featureLines(localized.localizedShort)
    : (fallbackFeatures ?? []);
  const subtitle =
    features.length > 0
      ? features.slice(0, 4).join(" · ")
      : fallbackSubtitle || null;

  const unitCents = product ? shopUnitPriceInclCents(product) : null;
  const listCents = product?.priceInclCents ?? null;
  const price =
    unitCents != null && unitCents > 0 ? unitCents / 100 : (fallbackPrice ?? null);
  const listPrice =
    unitCents != null && listCents != null && unitCents < listCents
      ? listCents / 100
      : (fallbackListPrice ?? null);
  const months =
    product?.checkoutMonths && product.checkoutMonths > 1
      ? product.checkoutMonths
      : checkoutMonths && checkoutMonths > 1
        ? checkoutMonths
        : null;
  const orderable =
    canOrder &&
    Boolean(
      product && product.published !== false && product.priceInclCents > 0,
    );

  return (
    <div>
      <h1
        className={cn(
          "font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl",
          titleClassName,
        )}
      >
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">
          {subtitle}
        </p>
      ) : null}
      {typeof price === "number" ? (
        <div className="mt-6">
          {typeof listPrice === "number" ? (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="font-display text-xl font-medium text-muted-foreground line-through decoration-2">
                {formatEuro(listPrice)}
              </p>
              <p className="font-display text-3xl font-bold text-primary">
                {formatEuro(price)}
                {priceSuffix ? (
                  <span className="ms-2 text-base font-medium text-muted-foreground">
                    {priceSuffix}
                  </span>
                ) : null}
              </p>
            </div>
          ) : (
            <p className="font-display text-3xl font-bold text-foreground">
              {formatEuro(price)}
              {priceSuffix ? (
                <span className="ms-2 text-base font-medium text-muted-foreground">
                  {priceSuffix}
                </span>
              ) : null}
            </p>
          )}
          {months ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {tShop("billedYearly", { months })}
            </p>
          ) : null}
        </div>
      ) : null}
      {orderable && product ? (
        <div className="mt-5 flex flex-wrap gap-3">
          <AddToCartButton productId={product.id} label={orderLabel} />
          <Button asChild variant="outline" className="rounded-2xl">
            <SoftLink href={localizedHref(locale, "/shop/cart")}>
              {goToCartLabel}
            </SoftLink>
          </Button>
        </div>
      ) : null}
      {features.length ? (
        <ul className="mt-5 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
          {features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/marketing/GlassCard";
import { SoftLink } from "@/components/shared/SoftLink";
import { ShopProductImage } from "@/components/shop/ShopProductImage";
import { useCartStore } from "@/lib/shop/cart-store";
import { centsToEuros, formatShopEuro } from "@/lib/shop/vat";
import {
  SUPPORT_PACKAGE_KEYS,
  shopHasDiscount,
  shopUnitPriceInclCents,
  type ShopProduct,
  type SupportPackageKey,
  localizeShopProduct,
} from "@/lib/shop/catalog";
import { localizedHref } from "@/i18n/pathnames";

function supportKeyFromSlug(slug: string): SupportPackageKey | null {
  for (const key of SUPPORT_PACKAGE_KEYS) {
    if (slug === `${key}-support` || slug === `${key}-support-yearly`) {
      return key;
    }
  }
  return null;
}

export function ShopProductCard({
  product,
  cartMode = "default",
}: {
  product: ShopProduct;
  /** Use support cart helper so monthly/yearly variants swap cleanly. */
  cartMode?: "default" | "support";
}) {
  const locale = useLocale();
  const t = useTranslations("shop");
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const addSupportPackage = useCartStore((s) => s.addSupportPackage);
  const localized = localizeShopProduct(product, locale);
  const hasDiscount = shopHasDiscount(product);
  const listPrice = formatShopEuro(centsToEuros(product.priceInclCents), locale);
  const salePrice = formatShopEuro(
    centsToEuros(shopUnitPriceInclCents(product)),
    locale,
  );
  const perMonth =
    product.checkoutMonths && product.checkoutMonths > 1 ? (
      <span className="ml-1 text-base font-medium text-muted-foreground">
        {t("perMonth")}
      </span>
    ) : null;

  function handleAdd() {
    if (cartMode === "support") {
      const key = supportKeyFromSlug(product.slug);
      if (key) {
        const period = product.slug.endsWith("-yearly") ? "yearly" : "monthly";
        addSupportPackage(key, period, 1);
        router.push(localizedHref(locale, "/shop/cart"));
        return;
      }
    }
    addItem(product.id, 1);
    router.push(localizedHref(locale, "/shop/cart"));
  }

  return (
    <GlassCard className="flex h-full flex-col overflow-hidden p-0">
      <SoftLink href={localizedHref(locale, `/shop/${product.slug}`)} className="block">
        <div className="relative h-40 w-full bg-muted/40">
          <ShopProductImage
            src={product.image}
            alt={localized.localizedName}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </SoftLink>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.type === "plan"
            ? t("typePlan")
            : product.type === "product"
              ? t("typeProduct")
              : t("typeService")}
        </p>
        <SoftLink href={localizedHref(locale, `/shop/${product.slug}`)}>
          <h2 className="font-display mt-1 text-lg font-semibold tracking-tight">
            {localized.localizedName}
          </h2>
        </SoftLink>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {localized.localizedShort}
        </p>
        {hasDiscount ? (
          <div className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            <p className="font-display text-lg font-medium text-muted-foreground line-through decoration-2">
              {listPrice}
            </p>
            <p className="font-display text-3xl font-semibold tracking-tight text-primary">
              {salePrice}
              {perMonth}
            </p>
          </div>
        ) : (
          <p className="font-display mt-4 text-2xl font-semibold">
            {listPrice}
            {perMonth}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{t("inclVat")}</p>
        {product.checkoutMonths && product.checkoutMonths > 1 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {t("billedYearly", { months: product.checkoutMonths })}
          </p>
        ) : null}
        <Button className="mt-4 w-full rounded-2xl" onClick={handleAdd}>
          {t("addToCart")}
        </Button>
      </div>
    </GlassCard>
  );
}

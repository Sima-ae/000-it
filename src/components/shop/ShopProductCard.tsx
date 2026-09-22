"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/marketing/GlassCard";
import { SoftLink } from "@/components/shared/SoftLink";
import { ShopProductImage } from "@/components/shop/ShopProductImage";
import { useCartStore } from "@/lib/shop/cart-store";
import { centsToEuros, formatShopEuro } from "@/lib/shop/vat";
import type { ShopProduct } from "@/lib/shop/catalog";
import { localizeShopProduct } from "@/lib/shop/catalog";
import { localizedHref } from "@/i18n/pathnames";

export function ShopProductCard({ product }: { product: ShopProduct }) {
  const locale = useLocale();
  const t = useTranslations("shop");
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const localized = localizeShopProduct(product, locale);
  const price = formatShopEuro(centsToEuros(product.priceInclCents), locale);

  function handleAdd() {
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
          {product.type === "plan" ? t("typePlan") : t("typeService")}
        </p>
        <SoftLink href={localizedHref(locale, `/shop/${product.slug}`)}>
          <h2 className="font-display mt-1 text-lg font-semibold tracking-tight">
            {localized.localizedName}
          </h2>
        </SoftLink>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {localized.localizedShort}
        </p>
        <p className="font-display mt-4 text-2xl font-semibold">
          {price}
          {product.checkoutMonths && product.checkoutMonths > 1 ? (
            <span className="ml-1 text-base font-medium text-muted-foreground">
              {t("perMonth")}
            </span>
          ) : null}
        </p>
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

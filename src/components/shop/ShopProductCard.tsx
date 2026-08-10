"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/marketing/GlassCard";
import { SoftLink } from "@/components/shared/SoftLink";
import { useCartStore } from "@/lib/shop/cart-store";
import { centsToEuros, formatShopEuro } from "@/lib/shop/vat";
import type { ShopProduct } from "@/lib/shop/catalog";
import { localizeShopProduct } from "@/lib/shop/catalog";

export function ShopProductCard({ product }: { product: ShopProduct }) {
  const locale = useLocale();
  const t = useTranslations("shop");
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const localized = localizeShopProduct(product, locale);
  const price = formatShopEuro(centsToEuros(product.priceInclCents), locale);

  function handleAdd() {
    addItem(product.id, 1);
    router.push(`/${locale}/shop/cart`);
  }

  return (
    <GlassCard className="flex h-full flex-col overflow-hidden p-0">
      <SoftLink href={`/${locale}/shop/${product.slug}`} className="block">
        <div className="relative h-40 w-full bg-muted/40">
          {product.image ? (
            <Image
              src={product.image}
              alt={localized.localizedName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized={product.image.startsWith("http")}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              TripleZero iT
            </div>
          )}
        </div>
      </SoftLink>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.type === "plan" ? t("typePlan") : t("typeService")}
        </p>
        <SoftLink href={`/${locale}/shop/${product.slug}`}>
          <h2 className="font-display mt-1 text-lg font-semibold tracking-tight">
            {localized.localizedName}
          </h2>
        </SoftLink>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {localized.localizedShort}
        </p>
        <p className="font-display mt-4 text-2xl font-semibold">{price}</p>
        <p className="text-xs text-muted-foreground">{t("inclVat")}</p>
        <Button className="mt-4 w-full rounded-2xl" onClick={handleAdd}>
          {t("addToCart")}
        </Button>
      </div>
    </GlassCard>
  );
}

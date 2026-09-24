import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { ShopProductImage } from "@/components/shop/ShopProductImage";
import { getShopProductBySlug, loadShopCatalogFromDb, localizeShopProduct, shopHasDiscount, shopUnitPriceInclCents } from "@/lib/shop/catalog";
import { centsToEuros, formatShopEuro } from "@/lib/shop/vat";
import { localizedHref } from "@/i18n/pathnames";
import { resolveEntityParam } from "@/lib/resolve-entity-param";

export const dynamic = "force-dynamic";

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug: rawSlug } = await params;
  setRequestLocale(locale);
  const slug = await resolveEntityParam({
    locale,
    entityType: "shop",
    param: rawSlug,
    internalPathFor: (key) => `/shop/${key}`,
  });
  const t = await getTranslations("shop");
  await loadShopCatalogFromDb();
  const product = getShopProductBySlug(slug);
  if (!product) notFound();

  const localized = localizeShopProduct(product, locale);
  const paragraphs = localized.localizedDescription
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:px-6 md:py-20">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <SoftLink href={localizedHref(locale, "/shop")}>{t("backToShop")}</SoftLink>
      </Button>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/60 bg-muted">
          <ShopProductImage
            src={product.image}
            alt={localized.localizedName}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>


        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.type === "plan"
              ? t("typePlan")
              : product.type === "product"
                ? t("typeProduct")
                : t("typeService")}
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">
            {localized.localizedName}
          </h1>
          <p className="mt-4 text-muted-foreground">{localized.localizedShort}</p>
          {shopHasDiscount(product) ? (
            <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="font-display text-xl font-medium text-muted-foreground line-through decoration-2">
                {formatShopEuro(centsToEuros(product.priceInclCents), locale)}
              </p>
              <p className="font-display text-4xl font-bold tracking-tight text-primary">
                {formatShopEuro(
                  centsToEuros(shopUnitPriceInclCents(product)),
                  locale,
                )}
                {product.checkoutMonths && product.checkoutMonths > 1 ? (
                  <span className="ml-2 text-base font-medium text-muted-foreground">
                    {t("perMonth")}
                  </span>
                ) : null}
              </p>
            </div>
          ) : (
            <p className="font-display mt-6 text-3xl font-bold">
              {formatShopEuro(centsToEuros(product.priceInclCents), locale)}
              {product.checkoutMonths && product.checkoutMonths > 1 ? (
                <span className="ml-2 text-base font-medium text-muted-foreground">
                  {t("perMonth")}
                </span>
              ) : null}
            </p>
          )}
          <p className="text-sm text-muted-foreground">{t("inclVat")}</p>
          {product.checkoutMonths && product.checkoutMonths > 1 ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {t("billedYearly", { months: product.checkoutMonths })}
            </p>
          ) : null}
          <AddToCartButton
            productId={product.id}
            label={t("order")}
            className="mt-6"
          />
        </div>
      </div>

      <div className="prose prose-neutral mt-12 max-w-none dark:prose-invert">
        {paragraphs.map((paragraph, index) => (
          <p
            key={`${index}-${paragraph.slice(0, 24)}`}
            className="mb-4 whitespace-pre-wrap text-base leading-relaxed text-foreground/90"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

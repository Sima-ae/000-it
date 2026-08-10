import { getTranslations, setRequestLocale } from "next-intl/server";
import { CartView } from "@/components/shop/CartView";

export default async function ShopCartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shop");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
        {t("cartTitle")}
      </h1>
      <p className="mt-3 text-muted-foreground">{t("cartSubtitle")}</p>
      <div className="mt-10">
        <CartView />
      </div>
    </div>
  );
}

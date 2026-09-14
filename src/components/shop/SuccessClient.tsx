"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/shop/cart-store";
import { localizedHref } from "@/i18n/pathnames";

export function SuccessClient({
  orderNumber,
  email,
}: {
  orderNumber?: string | null;
  email?: string | null;
}) {
  const locale = useLocale();
  const t = useTranslations("shop");
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center md:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight">{t("successTitle")}</h1>
      <p className="mt-4 text-muted-foreground">{t("successBody")}</p>
      {orderNumber ? (
        <p className="mt-6 text-sm">
          {t("orderNumber")}: <span className="font-semibold">{orderNumber}</span>
        </p>
      ) : null}
      {email ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {t("confirmationEmail")}: {email}
        </p>
      ) : null}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-2xl">
          <SoftLink href={localizedHref(locale, "/shop")}>{t("continueShopping")}</SoftLink>
        </Button>
        <Button asChild variant="outline" className="rounded-2xl">
          <SoftLink href={localizedHref(locale, "/")}>{t("backHome")}</SoftLink>
        </Button>
      </div>
    </div>
  );
}

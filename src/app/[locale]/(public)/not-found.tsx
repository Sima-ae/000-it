"use client";

import { useLocale, useTranslations } from "next-intl";
import { SoftLink } from "@/components/shared/SoftLink";
import { localizedHref } from "@/i18n/pathnames";

export default function NotFound() {
  const locale = useLocale();
  const t = useTranslations("errors");

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {t("notFoundTitle")}
      </h1>
      <p className="mt-3 text-muted-foreground">{t("notFoundBody")}</p>
      <SoftLink
        href={localizedHref(locale, "/")}
        className="mt-6 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        {t("backHome")}
      </SoftLink>
    </div>
  );
}

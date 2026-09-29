"use client";

import { useEffect } from "react";
import { localeTextDir } from "@/i18n/languages";
import type { SiteBrandId } from "@/lib/brand/config";

/** Keep <html lang/dir/data-brand> in sync on client navigations. */
export function LocaleHtmlLang({
  locale,
  brand,
}: {
  locale: string;
  brand?: SiteBrandId;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeTextDir(locale);
    if (brand) {
      document.documentElement.dataset.brand = brand;
    }
  }, [locale, brand]);
  return null;
}

"use client";

import { useEffect } from "react";
import { localeTextDir } from "@/i18n/languages";
import type { SiteBrandId } from "@/lib/brand/config";

/** Keep <html lang/dir/data-brand> in sync — set brand before paint when possible. */
export function LocaleHtmlLang({
  locale,
  brand,
}: {
  locale: string;
  brand?: SiteBrandId;
}) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeTextDir(locale);
    if (brand) {
      document.documentElement.dataset.brand = brand;
    }
  }

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeTextDir(locale);
    if (brand) {
      document.documentElement.dataset.brand = brand;
    }
  }, [locale, brand]);
  return null;
}

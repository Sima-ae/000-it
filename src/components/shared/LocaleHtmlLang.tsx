"use client";

import { useEffect } from "react";
import { localeTextDir } from "@/i18n/languages";

/** Keep <html lang/dir> in sync on client navigations between locales. */
export function LocaleHtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeTextDir(locale);
  }, [locale]);
  return null;
}

"use client";

import { useEffect } from "react";

const RTL_LOCALES = new Set(["ar", "he"]);

export function LocaleHtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
  }, [locale]);
  return null;
}

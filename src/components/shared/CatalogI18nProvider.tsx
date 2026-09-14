"use client";

import type { ReactNode } from "react";
import type { CatalogOverlay } from "@/lib/localized-copy-cache";
import { setCatalogLocaleOverlay } from "@/content/fixweb/catalog-title";

export function CatalogI18nProvider({
  locale,
  overlay,
  children,
}: {
  locale: string;
  overlay: CatalogOverlay;
  children: ReactNode;
}) {
  setCatalogLocaleOverlay(locale, overlay);
  return children;
}

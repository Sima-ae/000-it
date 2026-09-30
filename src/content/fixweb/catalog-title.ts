import catalogI18n from "@/content/fixweb/catalog-i18n.json";
import type { CatalogOverlay } from "@/lib/localized-copy-cache";
import { brandify } from "@/lib/brandify";

type CatalogPack = {
  services: Record<string, Record<string, string>>;
  groups: Record<string, Record<string, string>>;
  summaries?: Record<string, Record<string, string>>;
  labels?: Record<string, Record<string, string>>;
};

const data = catalogI18n as CatalogPack;
const overlayByLocale: Record<string, CatalogOverlay> = {};

export function setCatalogLocaleOverlay(locale: string, overlay: CatalogOverlay) {
  overlayByLocale[locale] = overlay;
}

export function catalogServiceTitle(
  slug: string,
  locale: string,
  fallback: string,
): string {
  return brandify(
    overlayByLocale[locale]?.services?.[slug] ||
      data.services[locale]?.[slug] ||
      data.services.en?.[slug] ||
      fallback,
  );
}

export function catalogServiceSummary(
  slug: string,
  locale: string,
  fallback: string = "",
): string {
  return brandify(
    data.summaries?.[locale]?.[slug] ||
      data.summaries?.en?.[slug] ||
      fallback,
  );
}

export function catalogUiLabel(
  key: string,
  locale: string,
  fallback: string,
): string {
  return brandify(
    data.labels?.[locale]?.[key] || data.labels?.en?.[key] || fallback,
  );
}

export function catalogGroupTitle(
  id: string,
  locale: string,
  fallback: string,
): string {
  return brandify(
    overlayByLocale[locale]?.groups?.[id] ||
      data.groups[locale]?.[id] ||
      data.groups.en?.[id] ||
      fallback,
  );
}

export function catalogGroupSummary(
  id: string,
  locale: string,
  fallback: string = "",
): string {
  const pack = data as CatalogPack & {
    groupSummaries?: Record<string, Record<string, string>>;
  };
  return brandify(
    pack.groupSummaries?.[locale]?.[id] ||
      pack.groupSummaries?.en?.[id] ||
      fallback,
  );
}

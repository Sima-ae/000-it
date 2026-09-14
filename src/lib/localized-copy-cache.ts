export type LocalizedKind =
  | "seo"
  | "catalog_service"
  | "catalog_group"
  | "page"
  | "product"
  | "custom_service"
  | "ui";

export type CatalogOverlay = {
  services: Record<string, string>;
  groups: Record<string, string>;
};

type CacheEntry = {
  at: number;
  rows: Map<string, unknown>;
};

const memory = new Map<string, CacheEntry>();

export const LOCALIZED_COPY_TTL_MS = 45_000;

function cacheKey(kind: string, itemKey: string) {
  return `${kind}:${itemKey}`;
}

export function localizedCopyCacheAge(locale: string) {
  const hit = memory.get(locale);
  return hit ? Date.now() - hit.at : Number.POSITIVE_INFINITY;
}

export function replaceLocalizedCopyCache(
  locale: string,
  rows: Map<string, unknown>,
) {
  memory.set(locale, { at: Date.now(), rows });
}

export function rememberLocalizedCopy(
  kind: LocalizedKind,
  itemKey: string,
  locale: string,
  payload: unknown,
) {
  const entry = memory.get(locale);
  if (!entry) return;
  entry.rows.set(cacheKey(kind, itemKey), payload);
}

export function getLocalizedCopySync<T>(
  kind: LocalizedKind,
  itemKey: string,
  locale: string,
): T | null {
  if (locale === "nl" || locale === "en") return null;
  const payload = memory.get(locale)?.rows.get(cacheKey(kind, itemKey));
  return (payload as T) || null;
}

export function getCatalogOverlaySync(locale: string): CatalogOverlay {
  const empty: CatalogOverlay = { services: {}, groups: {} };
  if (locale === "nl" || locale === "en") return empty;
  const rows = memory.get(locale)?.rows;
  if (!rows) return empty;
  const services: Record<string, string> = {};
  const groups: Record<string, string> = {};
  for (const [key, payload] of rows) {
    if (typeof payload !== "object" || !payload) continue;
    const rec = payload as { title?: string };
    if (typeof rec.title !== "string" || !rec.title.trim()) continue;
    if (key.startsWith("catalog_service:")) {
      services[key.slice("catalog_service:".length)] = rec.title;
    } else if (key.startsWith("catalog_group:")) {
      groups[key.slice("catalog_group:".length)] = rec.title;
    }
  }
  return { services, groups };
}

export function getUiMessageOverlaySync(locale: string): Record<string, unknown> {
  if (locale === "nl" || locale === "en") return {};
  const payload = getLocalizedCopySync<Record<string, unknown>>("ui", "_messages", locale);
  return payload && typeof payload === "object" ? payload : {};
}

export function localizedCopyRowKey(kind: string, itemKey: string) {
  return cacheKey(kind, itemKey);
}

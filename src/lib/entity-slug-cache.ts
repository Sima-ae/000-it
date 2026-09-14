/**
 * In-memory per-locale entity slug maps (canonical key ↔ public slug).
 * Hydrated from EntitySlug rows; used by pathnames + pages (sync).
 */

export type EntityType =
  | "service"
  | "kb_category"
  | "kb_article"
  | "city"
  | "portfolio"
  | "shop";

type LocaleMaps = {
  at: number;
  /** entityType → canonicalKey → publicSlug */
  forward: Map<string, Map<string, string>>;
  /** entityType → publicSlug → canonicalKey */
  reverse: Map<string, Map<string, string>>;
};

const memory = new Map<string, LocaleMaps>();

export const ENTITY_SLUG_TTL_MS = 60_000;

function emptyMaps(at = Date.now()): LocaleMaps {
  return { at, forward: new Map(), reverse: new Map() };
}

export function entitySlugCacheAge(locale: string) {
  const hit = memory.get(locale);
  return hit ? Date.now() - hit.at : Number.POSITIVE_INFINITY;
}

export function replaceEntitySlugCache(
  locale: string,
  rows: Array<{ entityType: string; entityKey: string; slug: string }>,
) {
  const maps = emptyMaps();
  for (const row of rows) {
    if (!row.entityType || !row.entityKey || !row.slug) continue;
    let fwd = maps.forward.get(row.entityType);
    if (!fwd) {
      fwd = new Map();
      maps.forward.set(row.entityType, fwd);
    }
    let rev = maps.reverse.get(row.entityType);
    if (!rev) {
      rev = new Map();
      maps.reverse.set(row.entityType, rev);
    }
    fwd.set(row.entityKey, row.slug);
    rev.set(row.slug, row.entityKey);
    // Canonical also resolves to itself
    rev.set(row.entityKey, row.entityKey);
  }
  memory.set(locale, maps);
}

export function rememberEntitySlug(
  locale: string,
  entityType: EntityType,
  entityKey: string,
  slug: string,
) {
  let maps = memory.get(locale);
  if (!maps) {
    maps = emptyMaps();
    memory.set(locale, maps);
  }
  let fwd = maps.forward.get(entityType);
  if (!fwd) {
    fwd = new Map();
    maps.forward.set(entityType, fwd);
  }
  let rev = maps.reverse.get(entityType);
  if (!rev) {
    rev = new Map();
    maps.reverse.set(entityType, rev);
  }
  const prev = fwd.get(entityKey);
  if (prev && prev !== slug) rev.delete(prev);
  fwd.set(entityKey, slug);
  rev.set(slug, entityKey);
  rev.set(entityKey, entityKey);
}

/** Public slug for a canonical key (falls back to canonical). */
export function publicEntitySlug(
  locale: string,
  entityType: EntityType,
  canonicalKey: string,
): string {
  const slug = memory.get(locale)?.forward.get(entityType)?.get(canonicalKey);
  return slug || canonicalKey;
}

/** Canonical key for a public slug (falls back to input). */
export function canonicalEntityKey(
  locale: string,
  entityType: EntityType,
  publicOrCanonical: string,
): string {
  const key = memory
    .get(locale)
    ?.reverse.get(entityType)
    ?.get(publicOrCanonical);
  return key || publicOrCanonical;
}

export function hasEntitySlugMaps(locale: string) {
  return memory.has(locale);
}

/** Serializable dump for client language-switch / SoftLink remaps. */
export type EntitySlugSnapshot = Record<
  string,
  Array<{ entityType: string; entityKey: string; slug: string }>
>;

export function exportEntitySlugSnapshot(): EntitySlugSnapshot {
  const out: EntitySlugSnapshot = {};
  for (const [locale, maps] of memory) {
    const rows: Array<{ entityType: string; entityKey: string; slug: string }> =
      [];
    for (const [entityType, fwd] of maps.forward) {
      for (const [entityKey, slug] of fwd) {
        rows.push({ entityType, entityKey, slug });
      }
    }
    out[locale] = rows;
  }
  return out;
}

export function applyEntitySlugSnapshot(snapshot: EntitySlugSnapshot) {
  for (const [locale, rows] of Object.entries(snapshot || {})) {
    replaceEntitySlugCache(locale, rows || []);
  }
}

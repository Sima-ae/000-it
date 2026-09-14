import { prisma } from "@/lib/prisma";
import { slugifyLocalized } from "@/lib/slugify";
import {
  ENTITY_SLUG_TTL_MS,
  canonicalEntityKey,
  entitySlugCacheAge,
  publicEntitySlug,
  rememberEntitySlug,
  replaceEntitySlugCache,
  type EntityType,
} from "@/lib/entity-slug-cache";

export type { EntityType } from "@/lib/entity-slug-cache";
export { canonicalEntityKey, publicEntitySlug };

export async function hydrateEntitySlugs(locale: string) {
  if (entitySlugCacheAge(locale) < ENTITY_SLUG_TTL_MS) return;
  try {
    const rows = await prisma.entitySlug.findMany({
      where: { locale },
      select: { entityType: true, entityKey: true, slug: true },
    });
    replaceEntitySlugCache(locale, rows);
  } catch (error) {
    console.warn(
      "[entity-slugs] hydrate failed",
      locale,
      error instanceof Error ? error.message : error,
    );
    if (entitySlugCacheAge(locale) === Number.POSITIVE_INFINITY) {
      replaceEntitySlugCache(locale, []);
    }
  }
}

export async function hydrateAllEntitySlugs() {
  try {
    const rows = await prisma.entitySlug.findMany({
      select: { entityType: true, entityKey: true, locale: true, slug: true },
    });
    const byLocale = new Map<string, typeof rows>();
    for (const row of rows) {
      const list = byLocale.get(row.locale) || [];
      list.push(row);
      byLocale.set(row.locale, list);
    }
    for (const [locale, list] of byLocale) {
      replaceEntitySlugCache(locale, list);
    }
  } catch (error) {
    console.warn(
      "[entity-slugs] hydrateAll failed",
      error instanceof Error ? error.message : error,
    );
  }
}

async function slugTaken(
  entityType: EntityType,
  locale: string,
  slug: string,
  exceptKey?: string,
) {
  const existing = await prisma.entitySlug.findUnique({
    where: {
      entityType_locale_slug: { entityType, locale, slug },
    },
    select: { entityKey: true },
  });
  if (!existing) return false;
  return exceptKey ? existing.entityKey !== exceptKey : true;
}

export async function uniqueEntitySlug(
  entityType: EntityType,
  locale: string,
  desired: string,
  entityKey: string,
): Promise<string> {
  const base = slugifyLocalized(desired) || slugifyLocalized(entityKey) || "item";
  if (!(await slugTaken(entityType, locale, base, entityKey))) return base;

  // Prefer stable suffix from canonical key
  const keyTail = slugifyLocalized(entityKey).split("-").slice(-2).join("-") || "x";
  let candidate = `${base}-${keyTail}`.slice(0, 120);
  if (!(await slugTaken(entityType, locale, candidate, entityKey))) return candidate;

  for (let i = 2; i < 50; i += 1) {
    candidate = `${base}-${i}`.slice(0, 120);
    if (!(await slugTaken(entityType, locale, candidate, entityKey))) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`.slice(0, 120);
}

export async function upsertEntitySlug(input: {
  entityType: EntityType;
  entityKey: string;
  locale: string;
  slug: string;
}) {
  const slug = await uniqueEntitySlug(
    input.entityType,
    input.locale,
    input.slug,
    input.entityKey,
  );
  const row = await prisma.entitySlug.upsert({
    where: {
      entityType_entityKey_locale: {
        entityType: input.entityType,
        entityKey: input.entityKey,
        locale: input.locale,
      },
    },
    create: {
      entityType: input.entityType,
      entityKey: input.entityKey,
      locale: input.locale,
      slug,
    },
    update: { slug },
  });
  rememberEntitySlug(input.locale, input.entityType, input.entityKey, row.slug);
  return row;
}

export async function ensureEntitySlugFromTitle(input: {
  entityType: EntityType;
  entityKey: string;
  locale: string;
  title: string;
  force?: boolean;
}) {
  if (!input.force) {
    const existing = await prisma.entitySlug.findUnique({
      where: {
        entityType_entityKey_locale: {
          entityType: input.entityType,
          entityKey: input.entityKey,
          locale: input.locale,
        },
      },
    });
    if (existing?.slug) {
      rememberEntitySlug(
        input.locale,
        input.entityType,
        input.entityKey,
        existing.slug,
      );
      return existing;
    }
  }
  return upsertEntitySlug({
    entityType: input.entityType,
    entityKey: input.entityKey,
    locale: input.locale,
    slug: input.title || input.entityKey,
  });
}

/** Seed canonical key as the public slug (nl / identity locales). */
export async function ensureCanonicalEntitySlug(input: {
  entityType: EntityType;
  entityKey: string;
  locale: string;
}) {
  return ensureEntitySlugFromTitle({
    entityType: input.entityType,
    entityKey: input.entityKey,
    locale: input.locale,
    title: input.entityKey,
  });
}

import { redirect } from "next/navigation";
import {
  canonicalEntityKey,
  publicEntitySlug,
  type EntityType,
} from "@/lib/entity-slug-cache";
import { hydrateEntitySlugs, hydrateAllEntitySlugs } from "@/lib/entity-slugs";
import { localizedHref } from "@/i18n/pathnames";

export { hydrateEntitySlugs, hydrateAllEntitySlugs };

/**
 * Resolve a public (or canonical) slug to the canonical key.
 * If the URL used the wrong public form for this locale, 301 to the preferred URL.
 */
export async function resolveEntityParam(opts: {
  locale: string;
  entityType: EntityType;
  param: string;
  /** Internal path builder using CANONICAL keys, e.g. (key) => `/diensten/${key}` */
  internalPathFor: (canonicalKey: string) => string;
}): Promise<string> {
  await hydrateEntitySlugs(opts.locale);
  const canonical = canonicalEntityKey(opts.locale, opts.entityType, opts.param);
  const preferred = publicEntitySlug(opts.locale, opts.entityType, canonical);
  if (preferred && preferred !== opts.param) {
    redirect(localizedHref(opts.locale, opts.internalPathFor(canonical)));
  }
  return canonical;
}

export async function resolveKennisbankParams(opts: {
  locale: string;
  categoryParam: string;
  articleParam?: string;
}): Promise<{ categoryKey: string; articleKey?: string }> {
  await hydrateEntitySlugs(opts.locale);
  const categoryKey = canonicalEntityKey(
    opts.locale,
    "kb_category",
    opts.categoryParam,
  );
  const preferredCat = publicEntitySlug(opts.locale, "kb_category", categoryKey);

  if (!opts.articleParam) {
    if (preferredCat !== opts.categoryParam) {
      redirect(localizedHref(opts.locale, `/kennisbank/${categoryKey}`));
    }
    return { categoryKey };
  }

  const articleKey = canonicalEntityKey(
    opts.locale,
    "kb_article",
    opts.articleParam,
  );
  const preferredArt = publicEntitySlug(opts.locale, "kb_article", articleKey);
  if (preferredCat !== opts.categoryParam || preferredArt !== opts.articleParam) {
    redirect(
      localizedHref(opts.locale, `/kennisbank/${categoryKey}/${articleKey}`),
    );
  }
  return { categoryKey, articleKey };
}

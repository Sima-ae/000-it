/**
 * Client-safe kennisbank URL helpers (no Prisma).
 */

/** True if `slug` is `rootSlug` or nested under it in a flat category list with parentSlug. */
export function categoryIsUnderRoot(
  slug: string,
  rootSlug: string,
  categories: { slug: string; parentSlug?: string | null }[],
): boolean {
  if (slug === rootSlug) return true;
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  let cur: string | null | undefined = slug;
  const seen = new Set<string>();
  while (cur) {
    if (cur === rootSlug) return true;
    if (seen.has(cur)) break;
    seen.add(cur);
    cur = bySlug.get(cur)?.parentSlug;
  }
  return false;
}

/** Article may be shown under a parent category even if only linked to a child. */
export function articleMatchesBrowseCategory(
  articleCategorySlugs: string[],
  browseCategorySlug: string,
  categories: { slug: string; parentSlug?: string | null }[],
): boolean {
  if (articleCategorySlugs.includes(browseCategorySlug)) return true;
  return articleCategorySlugs.some((s) =>
    categoryIsUnderRoot(s, browseCategorySlug, categories),
  );
}

/**
 * Best category slug for an article link when browsing `browseCategorySlug`.
 * Prefer an exact article category under the browse tree (child over parent).
 */
export function articleHrefCategorySlug(
  articleCategorySlugs: string[],
  browseCategorySlug?: string | null,
  categories: { slug: string; parentSlug?: string | null }[] = [],
): string {
  if (!articleCategorySlugs.length) return browseCategorySlug || "";
  if (
    browseCategorySlug &&
    articleCategorySlugs.includes(browseCategorySlug)
  ) {
    return browseCategorySlug;
  }
  if (browseCategorySlug && categories.length) {
    const under = articleCategorySlugs.filter((s) =>
      categoryIsUnderRoot(s, browseCategorySlug, categories),
    );
    if (under.length) {
      // Prefer the deepest (most specific) match — usually a child slug.
      const depth = (slug: string) => {
        let d = 0;
        let cur: string | null | undefined = slug;
        const bySlug = new Map(categories.map((c) => [c.slug, c]));
        while (cur && cur !== browseCategorySlug) {
          d += 1;
          cur = bySlug.get(cur)?.parentSlug;
          if (d > 20) break;
        }
        return d;
      };
      return [...under].sort((a, b) => depth(b) - depth(a))[0];
    }
  }
  return articleCategorySlugs[0];
}

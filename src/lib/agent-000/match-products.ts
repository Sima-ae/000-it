import {
  serviceCatalog,
  serviceGroupHref,
  serviceHref,
  type ServiceNavItem,
} from "@/content/fixweb/catalog";
import { localizedHref } from "@/i18n/pathnames";
import {
  normalizeAgentText,
  tokenizeAgentText,
  tokenHitScore,
} from "@/lib/agent-000/text";
import {
  HOSTING_YEARLY_SLUGS,
  listShopProducts,
  localizeShopProduct,
  shopUnitPriceInclCents,
  type ShopProduct,
} from "@/lib/shop/catalog";
import { loadShopCatalogFromDb } from "@/lib/shop/catalog-db";

export const PRODUCT_CONFIDENCE_HIT = 0.32;
export const PRODUCT_CONFIDENCE_STRONG = 0.48;

export type ProductMatch = {
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  priceInclCents: number | null;
  image: string | null;
  badge: string | null;
  confidence: number;
  /** Prefer showing as compact card in chat. */
  kind: "service" | "product" | "hosting" | "plan";
};

type IndexedProduct = {
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  priceInclCents: number | null;
  image: string | null;
  badge: string | null;
  kind: ProductMatch["kind"];
  hayNorm: string;
  hayTok: Set<string>;
  slugNorm: string;
};

/** Synonyms so “beheer” / “care” / “onderhoud” map to WordPress care services. */
const SYNONYM_EXPAND: Record<string, string[]> = {
  beheer: ["care", "onderhoud", "maintenance", "support", "wordpress-beheer"],
  care: ["beheer", "onderhoud", "maintenance", "wordpress-beheer"],
  onderhoud: ["beheer", "care", "maintenance", "updates"],
  maintenance: ["onderhoud", "beheer", "care", "updates"],
  support: ["beheer", "care", "helpdesk", "ticket"],
  hosting: ["host", "webhosting", "server"],
  wordpress: ["wp"],
  wp: ["wordpress"],
  pakket: ["plan", "package", "abonnement"],
  package: ["pakket", "plan"],
  prijs: ["kosten", "tarief", "price"],
  price: ["prijs", "kosten"],
  domein: ["domain", "domeinen", "domains", "tld"],
  domain: ["domein", "domeinen", "domains", "tld"],
  domeinen: ["domein", "domain", "domains"],
  domains: ["domein", "domain", "domeinen"],
  registreren: ["register", "registration", "domein"],
  register: ["registreren", "registration", "domain"],
  verhuizen: ["transfer", "verhuis", "migrate"],
  transfer: ["verhuizen", "verhuis", "migrate"],
  verlengen: ["renew", "renewal", "verlenging"],
  renew: ["verlengen", "renewal", "verlenging"],
  dns: ["nameserver", "nameservers", "zone"],
};

const PANEL_NOISE = new Set([
  "directadmin",
  "plesk",
  "cyberpanel",
  "phpmyadmin",
  "mysql",
  "database",
  "databases",
]);

function expandTokens(tokens: string[]): string[] {
  const out = new Set(tokens);
  for (const t of tokens) {
    for (const extra of SYNONYM_EXPAND[t] || []) {
      out.add(extra);
    }
  }
  return [...out];
}

function isCommercialQuery(tokens: string[]): boolean {
  const set = new Set(tokens);
  const hasWp = set.has("wordpress") || set.has("wp");
  const hasCare =
    set.has("beheer") ||
    set.has("care") ||
    set.has("onderhoud") ||
    set.has("maintenance") ||
    set.has("support") ||
    set.has("pakket") ||
    set.has("package") ||
    set.has("hosting") ||
    set.has("plan") ||
    set.has("prijs") ||
    set.has("price");
  const hasDomain =
    set.has("domein") ||
    set.has("domeinen") ||
    set.has("domain") ||
    set.has("domains") ||
    set.has("registreren") ||
    set.has("register") ||
    set.has("verhuizen") ||
    set.has("transfer") ||
    set.has("verlengen") ||
    set.has("renew") ||
    set.has("dns") ||
    set.has("tld");
  return hasWp || hasCare || hasDomain;
}

function isHostingOnlyAllowed(item: IndexedProduct): boolean {
  if (item.kind === "hosting") return true;
  if (HOSTING_YEARLY_SLUGS.has(item.slug)) return true;
  if (item.slug.includes("hosting")) return true;
  if (item.slug === "group-hosting") return true;
  if (item.slug === "domains" || item.slug.includes("domein")) return true;
  return false;
}

function productKind(
  product: ShopProduct,
  item?: ServiceNavItem | null,
): ProductMatch["kind"] {
  if (product.type === "plan") return "plan";
  if (
    product.lineOfBusiness === "HOSTING" ||
    product.category?.includes("hosting") ||
    HOSTING_YEARLY_SLUGS.has(product.slug) ||
    product.slug.includes("hosting")
  ) {
    return "hosting";
  }
  if (item?.kind === "page") return "service";
  return "product";
}

function badgeFor(
  locale: string,
  kind: ProductMatch["kind"],
  category: string | null | undefined,
  slug?: string,
): string | null {
  const nl = locale.toLowerCase().startsWith("nl");
  if (slug === "domains" || slug?.includes("domein")) {
    return nl ? "Domeinen" : "Domains";
  }
  if (kind === "hosting") return nl ? "Hosting" : "Hosting";
  if (kind === "plan") return nl ? "Pakket" : "Plan";
  if (category?.includes("wordpress") || category?.includes("care")) {
    return nl ? "WordPress beheer" : "WordPress care";
  }
  if (kind === "service") return nl ? "Dienst" : "Service";
  return nl ? "Product" : "Product";
}

function indexShopProduct(locale: string, product: ShopProduct): IndexedProduct | null {
  if (product.published === false) return null;
  // Prefer monthly listings; skip yearly duplicates — keep yearly-only hosting plans.
  if (
    (product.billingPeriod === "yearly" || product.slug.endsWith("-yearly")) &&
    !HOSTING_YEARLY_SLUGS.has(product.slug)
  ) {
    return null;
  }
  const localized = localizeShopProduct(product, locale);
  const title = localized.localizedName;
  const subtitle = (localized.localizedShort || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)[0] || "";
  const item = serviceCatalog.find((s) => s.slug === product.slug) || null;
  const kind = productKind(product, item);
  const href = item
    ? serviceHref(locale, item)
    : localizedHref(locale, `/shop/${product.slug}`);
  const tags = (product.tags || []).join(" ");
  const hay = [
    title,
    subtitle,
    product.slug.replace(/-/g, " "),
    product.category || "",
    tags,
    item?.title || "",
    item?.titleNl || "",
    item?.summary || "",
    item?.summaryNl || "",
  ].join(" ");
  return {
    slug: product.slug,
    title,
    subtitle,
    href,
    priceInclCents: shopUnitPriceInclCents(product),
    image: product.image || null,
    badge: badgeFor(locale, kind, product.category, product.slug),
    kind,
    hayNorm: normalizeAgentText(hay),
    hayTok: new Set(tokenizeAgentText(hay)),
    slugNorm: normalizeAgentText(product.slug.replace(/-/g, " ")),
  };
}

function indexServicePage(locale: string, item: ServiceNavItem): IndexedProduct {
  const nl = locale.toLowerCase().startsWith("nl");
  const title = nl ? item.titleNl || item.title : item.title;
  const subtitle = nl
    ? item.summaryNl || item.summary || ""
    : item.summary || item.summaryNl || "";
  const kind: ProductMatch["kind"] =
    item.group === "hosting"
      ? "hosting"
      : item.kind === "page"
        ? "service"
        : "product";
  const hay = [
    title,
    subtitle,
    item.slug.replace(/-/g, " "),
    item.group,
    item.title,
    item.titleNl || "",
  ].join(" ");
  return {
    slug: item.slug,
    title,
    subtitle,
    href: serviceHref(locale, item),
    priceInclCents: null,
    image: null,
    badge: badgeFor(locale, kind, item.group, item.slug),
    kind,
    hayNorm: normalizeAgentText(hay),
    hayTok: new Set(tokenizeAgentText(hay)),
    slugNorm: normalizeAgentText(item.slug.replace(/-/g, " ")),
  };
}

function indexGroupLanding(locale: string, groupId: string, titles: { en: string; nl: string }): IndexedProduct {
  const nl = locale.toLowerCase().startsWith("nl");
  const title = nl ? titles.nl : titles.en;
  const hay = `${title} ${groupId} wordpress beheer care support hosting`;
  return {
    slug: `group-${groupId}`,
    title,
    subtitle: nl ? "Bekijk alle pakketten en diensten" : "Browse all packages and services",
    href: serviceGroupHref(locale, groupId),
    priceInclCents: null,
    image: null,
    badge: nl ? "Categorie" : "Category",
    kind: "service",
    hayNorm: normalizeAgentText(hay),
    hayTok: new Set(tokenizeAgentText(hay)),
    slugNorm: normalizeAgentText(`${groupId} wordpress`),
  };
}

function scoreIndexed(queryTokens: string[], expanded: string[], item: IndexedProduct): number {
  if (!queryTokens.length) return 0;
  const joined = queryTokens.join(" ");
  let score = 0;
  let titleHits = 0;
  let distinctiveHits = 0;

  if (joined.length > 4 && item.hayNorm.includes(joined)) score += 0.85;
  if (joined.length > 4 && item.slugNorm.includes(joined)) score += 0.55;

  // Exact slug phrase boost (e.g. wordpress-beheer)
  if (item.slugNorm === joined || item.slugNorm.includes(joined)) score += 0.35;

  for (const t of expanded) {
    const isOriginal = queryTokens.includes(t);
    const weight = isOriginal ? 1 : 0.45;
    const hit = tokenHitScore(t, item.hayTok, item.hayNorm);
    const slugHit = item.slugNorm.includes(t) ? 1 : 0;
    score += hit * 1.35 * weight;
    score += slugHit * 0.55 * weight;
    if (hit > 0.6 && isOriginal) titleHits += 1;
    if (isOriginal && hit > 0 && !PANEL_NOISE.has(t)) distinctiveHits += 1;
  }

  // Strong boost when both wordpress + care/beheer tokens land.
  const hasWp =
    item.hayTok.has("wordpress") ||
    item.slugNorm.includes("wordpress") ||
    item.slugNorm.includes("wp care") ||
    item.slug.includes("wp-care");
  const wantsCare = queryTokens.some((t) =>
    ["beheer", "care", "onderhoud", "maintenance", "support"].includes(t),
  );
  if (hasWp && wantsCare && (queryTokens.includes("wordpress") || queryTokens.includes("wp"))) {
    score += 0.55;
  }

  const denom = Math.max(expanded.length * 0.85, queryTokens.length * 1.1);
  let confidence = Math.min(1, score / denom);

  if (titleHits === 0 && distinctiveHits === 0) confidence *= 0.4;
  return confidence;
}

function buildCorpus(locale: string): IndexedProduct[] {
  const bySlug = new Map<string, IndexedProduct>();

  for (const product of listShopProducts()) {
    const indexed = indexShopProduct(locale, product);
    if (!indexed) continue;
    bySlug.set(indexed.slug, indexed);
  }

  // Service catalog pages (fill gaps shop may not list, e.g. wordpress-beheer hub).
  for (const item of serviceCatalog) {
    if (bySlug.has(item.slug)) {
      // Enrich haystack with catalog titles/summaries.
      const existing = bySlug.get(item.slug)!;
      const extra = indexServicePage(locale, item);
      existing.hayNorm = normalizeAgentText(`${existing.hayNorm} ${extra.hayNorm}`);
      existing.hayTok = new Set([...existing.hayTok, ...extra.hayTok]);
      if (!existing.subtitle && extra.subtitle) existing.subtitle = extra.subtitle;
      if (!existing.image && extra.image) existing.image = extra.image;
      // Prefer the dedicated service page URL over /shop when available.
      existing.href = extra.href;
      continue;
    }
    bySlug.set(item.slug, indexServicePage(locale, item));
  }

  // Category landings for broad queries.
  bySlug.set(
    "group-wordpress",
    indexGroupLanding(locale, "wordpress", {
      en: "WordPress & Support",
      nl: "WordPress en support",
    }),
  );
  bySlug.set(
    "group-hosting",
    indexGroupLanding(locale, "hosting", {
      en: "Hosting",
      nl: "Hosting",
    }),
  );

  return [...bySlug.values()];
}

/**
 * Rank sellable services, products and hosting plans for Agent 000 chat cards.
 */
export async function rankProducts(
  locale: string,
  question: string,
  limit = 6,
  opts?: { hostingOnly?: boolean },
): Promise<ProductMatch[]> {
  const q = question.trim();
  if (q.length < 2) return [];

  try {
    await loadShopCatalogFromDb();
  } catch {
    /* static catalog fallback already loaded */
  }

  const queryTokens = tokenizeAgentText(q);
  if (!queryTokens.length) return [];
  const expanded = expandTokens(queryTokens);
  const commercial = isCommercialQuery(queryTokens);
  const hostingOnly =
    opts?.hostingOnly === true ||
    (process.env.SITE_BRAND || "").toLowerCase().includes("extra") ||
    (process.env.NEXT_PUBLIC_APP_URL || "").includes("extrahosting");

  const scored: ProductMatch[] = [];
  for (const item of buildCorpus(locale)) {
    if (hostingOnly && !isHostingOnlyAllowed(item)) continue;

    let confidence = scoreIndexed(queryTokens, expanded, item);
    if (!commercial) confidence *= 0.85;

    const qHasWp =
      queryTokens.includes("wordpress") || queryTokens.includes("wp");
    if (qHasWp && item.slug === "group-hosting") confidence *= 0.25;
    if (
      qHasWp &&
      item.slug.startsWith("group-") &&
      item.slug !== "group-wordpress"
    ) {
      confidence *= 0.4;
    }
    // Prefer the WordPress beheer hub over generic group when both match.
    if (
      !hostingOnly &&
      qHasWp &&
      queryTokens.some((t) =>
        ["beheer", "care", "onderhoud", "maintenance"].includes(t),
      ) &&
      item.slug === "wordpress-beheer"
    ) {
      confidence = Math.min(1, confidence + 0.2);
    }

    // Bare “hosting” query → prefer hosting plans over care+hosting bundles.
    if (
      queryTokens.length <= 2 &&
      queryTokens.includes("hosting") &&
      !queryTokens.includes("wordpress") &&
      !queryTokens.includes("wp") &&
      (item.slug.includes("wp-care") || item.slug.includes("wordpress-beheer"))
    ) {
      confidence *= 0.3;
    }

    // Domain queries → boost domains card / hosting group.
    const qHasDomain = queryTokens.some((t) =>
      [
        "domein",
        "domeinen",
        "domain",
        "domains",
        "registreren",
        "register",
        "verhuizen",
        "transfer",
        "verlengen",
        "renew",
        "dns",
      ].includes(t),
    );
    if (qHasDomain && (item.slug === "domains" || item.slug.includes("domein"))) {
      confidence = Math.min(1, confidence + 0.28);
    }
    if (
      qHasDomain &&
      !queryTokens.includes("hosting") &&
      item.kind === "hosting" &&
      item.slug !== "domains"
    ) {
      confidence *= 0.75;
    }

    if (confidence < 0.14) continue;
    scored.push({
      slug: item.slug,
      title: item.title,
      subtitle: item.subtitle,
      href: item.href,
      priceInclCents: item.priceInclCents,
      image: item.image,
      badge: item.badge,
      confidence,
      kind: item.kind,
    });
  }

  scored.sort((a, b) => b.confidence - a.confidence);

  // Prefer concrete products over category landing when both match.
  const top = scored.slice(0, Math.max(1, limit * 2));
  const withoutDupGroup = top.filter((m, i, arr) => {
    if (!m.slug.startsWith("group-")) return true;
    return !arr.some(
      (other, j) =>
        j < i &&
        !other.slug.startsWith("group-") &&
        other.confidence >= m.confidence - 0.08,
    );
  });

  return withoutDupGroup.slice(0, Math.max(1, limit));
}

export function isProductBrowseQuery(question: string): boolean {
  const tokens = tokenizeAgentText(question);
  return isCommercialQuery(tokens);
}

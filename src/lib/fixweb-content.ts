import importedPages from "@/content/fixweb/imported-pages.json";
import importedProducts from "@/content/fixweb/imported-products.json";
import localImages from "@/content/fixweb/local-images.json";
import {
  catalogServiceSummary,
  catalogServiceTitle,
  catalogUiLabel,
} from "@/content/fixweb/catalog-title";
import { getCatalogItem, type ServiceNavItem } from "@/content/fixweb/catalog";
import { getPageI18n } from "@/content/fixweb/page-i18n";
import { getProductI18n } from "@/content/fixweb/product-i18n";
import { getCustomServiceContent } from "@/content/services/custom";
import { brandify } from "@/lib/brandify";
import { formatEuro as formatEuroShared } from "@/lib/format-euro";
import { hydrateLocalizedCopy } from "@/lib/localized-copy";
import { isExtraHostingSurface } from "@/lib/brand/public-name";
import {
  CLOUD_HOSTING_SLUG_ORDER,
  getShopProductBySlug,
  localizeShopProduct,
  RESELLER_HOSTING_SLUG_ORDER,
  SHARED_HOSTING_SLUG_ORDER,
  shopUnitPriceInclCents,
  VPS_HOSTING_SLUG_ORDER,
  WORDPRESS_HOSTING_SLUG_ORDER,
} from "@/lib/shop/catalog";
import { loadShopCatalogFromDb } from "@/lib/shop/catalog-db";

export { brandify } from "@/lib/brandify";

type ImportedPage = {
  title: string;
  sections: { heading: string; paragraphs: string[]; bullets: string[] }[];
  rawText: string;
};

type ImportedProduct = {
  slug: string;
  name: string;
  price: number;
  currency: string;
  shortDescription: string;
  description: string;
  images?: string[];
};

const pages = (importedPages as { pages: Record<string, ImportedPage> }).pages;
const products = (importedProducts as { products: ImportedProduct[] }).products;
const imageMap = localImages as Record<string, string | null>;

const productBySlug = new Map(products.map((p) => [p.slug, p]));
const serviceContentCache = new Map<string, ReturnType<typeof buildServiceContent>>();
const serviceCardCache = new Map<string, ReturnType<typeof buildServiceCardMeta>>();

export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

function contentCacheKey(locale: string, slug: string) {
  return `${isExtraHostingSurface() ? "eh" : "tz"}:${locale}:${slug}`;
}

function brandifyBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.map((block) => {
    if (block.type === "list") {
      return { ...block, items: block.items.map((item) => brandify(item)) };
    }
    return { ...block, text: brandify(block.text) };
  });
}

/** Drop content caches (e.g. after service image/copy updates in dev). */
export function clearServiceContentCaches() {
  serviceContentCache.clear();
  serviceCardCache.clear();
}

/** Drop “email us at info@…” CTAs — service pages already show a booking button. */
export function stripEmailContactBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.filter((block) => {
    if (block.type === "list") return true;
    const text = (block.text || "").trim();
    if (/info@000-it\.com/i.test(text)) return false;
    if (/^(direct contact|get in touch|neem contact|contact)$/i.test(text)) return false;
    return true;
  });
}

export function textToBlocks(raw: string, options?: { maxBlocks?: number }): ContentBlock[] {
  const text = brandify(raw || "").trim();
  if (!text) return [];

  const maxBlocks = options?.maxBlocks ?? Number.POSITIVE_INFINITY;
  const chunks = text.split(/\n{2,}/).map((c) => c.trim()).filter(Boolean);
  const blocks: ContentBlock[] = [];

  for (const chunk of chunks) {
    if (blocks.length >= maxBlocks) break;

    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    const bulletLines = lines.filter((l) => /^[-–•]\s+/.test(l));
    if (bulletLines.length >= 2 && bulletLines.length === lines.length) {
      blocks.push({
        type: "list",
        items: bulletLines.map((l) => brandify(l.replace(/^[-–•]\s+/, ""))),
      });
      continue;
    }

    if (lines.length === 1) {
      const line = lines[0];
      const isHeading =
        line.length < 80 &&
        !/[.!?]$/.test(line) &&
        (/^[A-Z0-9]/.test(line) || line.split(" ").length <= 8);
      blocks.push({ type: isHeading ? "heading" : "paragraph", text: brandify(line) });
      continue;
    }

    const [first, ...rest] = lines;
    if (first.length < 70 && !/[.!?]$/.test(first)) {
      blocks.push({ type: "heading", text: brandify(first) });
    } else {
      blocks.push({ type: "paragraph", text: brandify(first) });
    }

    if (blocks.length >= maxBlocks) break;

    const restBullets = rest.filter((l) => /^[-–•]\s+/.test(l));
    if (restBullets.length && restBullets.length === rest.length) {
      blocks.push({
        type: "list",
        items: restBullets.map((l) => brandify(l.replace(/^[-–•]\s+/, ""))),
      });
    } else if (rest.length) {
      blocks.push({ type: "paragraph", text: brandify(rest.join(" ")) });
    }
  }

  return stripEmailContactBlocks(blocks);
}

function productFeatures(shortDescription: string) {
  return shortDescription
    .split("\n")
    .map((line) => line.replace(/^[-–•]\s*/, "").trim())
    .filter(
      (line) =>
        line.length > 1 &&
        !/^what can you expect/i.test(line) &&
        !/^wat kun je verwachten/i.test(line),
    );
}

/** Overview pages whose “plans” list must follow the live shop catalog. */
const HOSTING_OVERVIEW_SLUGS: Record<string, readonly string[]> = {
  "shared-hosting": SHARED_HOSTING_SLUG_ORDER,
  "cloud-hosting": CLOUD_HOSTING_SLUG_ORDER,
  "reseller-hosting": RESELLER_HOSTING_SLUG_ORDER,
  "wordpress-hosting": WORDPRESS_HOSTING_SLUG_ORDER,
  "vps-hosting": VPS_HOSTING_SLUG_ORDER,
};

function planTierLabel(name: string) {
  return name
    .replace(/^(shared|cloud|reseller|wordpress|vps)\s+hosting\s+/i, "")
    .trim();
}

function hostingPlanSummaryLine(slug: string, locale: string) {
  const shop = getShopProductBySlug(slug);
  const useCatalog = Boolean(shop && shop.published !== false && (locale === "nl" || locale === "en"));
  const i18n = useCatalog ? null : getProductI18n(slug, locale);
  const shortDescription = useCatalog
    ? localizeShopProduct(shop!, locale).localizedShort
    : i18n?.shortDescription ||
      (shop ? localizeShopProduct(shop, locale === "nl" ? "nl" : "en").localizedShort : "");
  const name = useCatalog
    ? localizeShopProduct(shop!, locale).localizedName
    : i18n?.name || shop?.name[locale === "nl" ? "nl" : "en"] || slug;
  const features = productFeatures(shortDescription || "");
  const label = planTierLabel(name);
  if (!label || features.length === 0) return null;
  return `${label} — ${features.join(", ")}`;
}

/** Replace hardcoded plan bullets with the specs stored on each hosting product. */
function withLiveHostingPlanSpecs(
  slug: string,
  locale: string,
  blocks: ContentBlock[],
): ContentBlock[] {
  const order = HOSTING_OVERVIEW_SLUGS[slug];
  if (!order) return blocks;
  const lines = order
    .map((productSlug) => hostingPlanSummaryLine(productSlug, locale))
    .filter((line): line is string => Boolean(line));
  if (lines.length < 2) return blocks;

  let replaced = false;
  return blocks.map((block) => {
    if (replaced || block.type !== "list") return block;
    const blob = block.items.join(" ");
    if (!/[—–-]/.test(blob)) return block;
    // Match typical hosting plan feature lists (storage/CPU/traffic/control panels).
    if (
      !/(GB|Gb|CPU|SSD|NVMe|website|Websites|bezoekers|visitors|PHP|RAM|opslag|dataverkeer|bandbreedte|DirectAdmin|Plesk|Installatron|domains|domeinen)/i.test(
        blob,
      )
    ) {
      return block;
    }
    replaced = true;
    return { ...block, items: lines.map((item) => brandify(item)) };
  });
}

/** Prefer live shop-catalog copy/price over static imported products. */
function preferDedicatedServiceImage(
  contentImage: string | null | undefined,
  shopImage: string | null | undefined,
): string | null {
  if (contentImage?.startsWith("/uploads/fixweb/")) return contentImage;
  return shopImage || contentImage || null;
}

function shopCatalogOverlay(slug: string, locale: string) {
  const shop = getShopProductBySlug(slug);
  if (!shop || shop.published === false || shop.priceInclCents <= 0) {
    return null;
  }

  const unitCents = shopUnitPriceInclCents(shop);
  const listCents = shop.priceInclCents;
  const priceOverlay = {
    price: unitCents / 100,
    listPrice: unitCents < listCents ? listCents / 100 : null,
    currency: "EUR" as const,
    image: shop.image || null,
    checkoutMonths: shop.checkoutMonths ?? null,
  };

  // Shop catalog only stores NL/EN copy — keep localized i18n body elsewhere.
  if (locale !== "nl" && locale !== "en") {
    return {
      title: null as string | null,
      shortDescription: null as string | null,
      description: null as string | null,
      features: [] as string[],
      blocks: [] as ContentBlock[],
      ...priceOverlay,
    };
  }

  const localized = localizeShopProduct(shop, locale);
  const shortDescription = brandify(localized.localizedShort || "");
  const description = brandify(localized.localizedDescription || "");
  const features = productFeatures(shortDescription);
  const planHeading = catalogUiLabel(
    "description",
    locale,
    locale === "nl" ? "Omschrijving" : "Description",
  );
  // Specs stay in the hero (features); body is description text only.
  const descriptionBlocks = textToBlocks(description, {
    maxBlocks: 12,
  });
  const blocks: ContentBlock[] = descriptionBlocks.length
    ? [{ type: "heading", text: planHeading }, ...descriptionBlocks]
    : [];

  return {
    title: brandify(localized.localizedName),
    shortDescription,
    description,
    features,
    blocks,
    ...priceOverlay,
  };
}

export function getImportedPage(slug: string, options?: { maxBlocks?: number }) {
  const page = pages[slug];
  if (!page) return null;
  return {
    title: brandify(page.title),
    rawText: brandify(page.rawText),
    blocks: textToBlocks(page.rawText, options),
  };
}

export function getImportedProduct(
  slug: string,
  options?: { lean?: boolean; locale?: string },
) {
  const locale = options?.locale ?? "nl";
  const lean = options?.lean ?? false;

  // Prefer live shop catalog (backend) over static imported/i18n copy.
  const shop = getShopProductBySlug(slug);
  if (shop && shop.published !== false) {
    const localized = localizeShopProduct(shop, locale);
    const shortDescription = brandify(localized.localizedShort || "");
    const description = brandify(localized.localizedDescription || "");
    const features = productFeatures(shortDescription);
    const descriptionSource = lean
      ? description
      : description || shortDescription || "";
    const descriptionBlocks = lean
      ? textToBlocks(descriptionSource, { maxBlocks: 8 })
      : textToBlocks(descriptionSource);
    const planHeading = catalogUiLabel(
      "description",
      locale,
      locale === "nl" ? "Omschrijving" : "Description",
    );
    const blocks: ContentBlock[] = descriptionBlocks.length
      ? [{ type: "heading", text: planHeading }, ...descriptionBlocks]
      : [];

    return {
      slug,
      name: brandify(localized.localizedName),
      price: shopUnitPriceInclCents(shop) / 100,
      currency: "EUR",
      shortDescription,
      description,
      images: shop.image ? [shop.image] : [],
      features,
      localImage: shop.image || imageMap[slug] || null,
      blocks,
    };
  }

  const product = productBySlug.get(slug);
  if (!product) return null;

  // No shop row: use imported product fields first, then i18n packs.
  const i18n = getProductI18n(slug, locale);
  const name = brandify(product.name || i18n?.name || slug);
  const shortDescription = brandify(
    product.shortDescription || i18n?.shortDescription || "",
  );
  const description = brandify(
    product.description || i18n?.description || shortDescription || "",
  );
  const features = productFeatures(shortDescription);

  const descriptionSource = lean
    ? description
    : description || shortDescription || "";
  const descriptionBlocks = lean
    ? textToBlocks(descriptionSource, { maxBlocks: 8 })
    : textToBlocks(descriptionSource);

  const planHeading = catalogUiLabel(
    "description",
    locale,
    locale === "nl" ? "Omschrijving" : "Description",
  );
  // Specs are shown with price at the top — do not repeat them under Description.
  const blocks: ContentBlock[] = descriptionBlocks.length
    ? [{ type: "heading", text: planHeading }, ...descriptionBlocks]
    : [];

  return {
    ...product,
    name,
    shortDescription,
    description,
    features,
    localImage: imageMap[slug] || product.images?.[0] || null,
    blocks,
  };
}

const pageImageFallback: Record<string, string> = {
  "content-writing": "/uploads/fixweb/content-writing.png",
  "social-media-management": "/uploads/fixweb/social-media-management.png",
  "media-creation": "/uploads/fixweb/media-creation.png",
  "community-management": "/uploads/fixweb/community-management.png",
  "digital-marketing": "/uploads/fixweb/digital-marketing.png",
  "product-listing": "/uploads/fixweb/product-listing.png",
  "data-entry": "/uploads/fixweb/data-entry.png",
  "e-commerce": "/uploads/fixweb/e-commerce.png",
  "seo-optimization": "/uploads/fixweb/seo-optimization.png",
  "ecommerce-seo": "/uploads/fixweb/seo-optimization.png",
  "conversion-optimization": "/uploads/fixweb/digital-marketing.png",
  "speed-optimization": "/uploads/fixweb/website-speed-optimization.png",
  "analytics-optimization": "/uploads/fixweb/seo-optimization.png",
  "accessibility-optimization": "/uploads/fixweb/custom-webdesign.png",
  "web-hosting": "/uploads/fixweb/web-hosting.png",
  "shared-hosting": "/uploads/fixweb/shared-hosting-category.png",
  "cloud-hosting": "/uploads/fixweb/cloud-hosting.png",
  "reseller-hosting": "/uploads/fixweb/reseller-hosting-hero.png",
  "wordpress-hosting": "/uploads/fixweb/wordpress-hosting.png",
  "vps-hosting": "/uploads/fixweb/vps-hosting.png",
  domains: "/uploads/fixweb/domains.png",
  "wordpress-beheer": "/uploads/fixweb/wordpress-beheer.png",
  "wordpress-maintenance-updates":
    "/uploads/fixweb/wordpress-maintenance-updates.png",
  "grafisch-design": "/uploads/fixweb/grafisch-design.png",
  "text-optimization": "/uploads/fixweb/text-optimization.png",
};

function firstParagraphSubtitle(blocks: ContentBlock[], fallback = "") {
  const paragraph = blocks.find((b) => b.type === "paragraph");
  if (paragraph && paragraph.type === "paragraph") {
    const text = paragraph.text.trim();
    if (text.length > 20) return text.length > 220 ? `${text.slice(0, 217)}…` : text;
  }
  return fallback;
}

function firstRawSnippet(raw: string, fallback = "") {
  const cleaned = brandify(raw || "")
    .split(/\n+/)
    .map((line) => line.replace(/^[-–•]\s*/, "").trim())
    .find(
      (line) =>
        line.length > 20 &&
        !/^(plan\s*highlights|omschrijving|description)$/i.test(line),
    );
  if (!cleaned) return fallback;
  return cleaned.length > 220 ? `${cleaned.slice(0, 217)}…` : cleaned;
}

function serviceTitleForLocale(slug: string, locale: string, nl: string, en: string) {
  if (locale === "nl") return nl || en;
  if (locale === "en") return en || nl;
  return catalogServiceTitle(slug, locale, en || nl);
}

function serviceSubtitleForLocale(slug: string, locale: string, nl: string, en: string) {
  if (locale === "nl") return nl || en;
  if (locale === "en") return en || nl;
  return catalogServiceSummary(slug, locale, en || nl) || en || nl;
}

function buildServiceContent(slug: string, locale: string) {
  const meta = getCatalogItem(slug);
  if (!meta) return null;
  const isNl = locale === "nl";

  const custom = getCustomServiceContent(slug, locale);
  if (custom) {
    return {
      meta,
      title: custom.title,
      subtitle: custom.subtitle,
      price: custom.price,
      currency: custom.currency,
      image: custom.image,
      blocks: custom.blocks,
      kind: custom.kind,
      priceSuffix: null as string | null,
      features: [] as string[],
    };
  }

  if (meta.kind === "product") {
    const lean = meta.group === "hosting";
    const product = getImportedProduct(slug, { lean, locale });
    if (!product) return null;
    const featureSubtitle =
      product.features.length > 0
        ? product.features.slice(0, 4).join(" · ")
        : product.shortDescription.split("\n")[0] || meta.summary || "";
    const isHostingProduct = meta.group === "hosting";
    return {
      meta,
      title: serviceTitleForLocale(
        slug,
        locale,
        meta.titleNl || product.name,
        meta.title || product.name,
      ),
      subtitle: featureSubtitle,
      price: product.price,
      currency: product.currency,
      priceSuffix: isHostingProduct
        ? catalogUiLabel("perMonth", locale, locale === "nl" ? "/ maand" : "/ month")
        : null,
      image: product.localImage || pageImageFallback[slug] || null,
      blocks: product.blocks,
      kind: "product" as const,
      features: product.features,
    };
  }

  const localizedPage = getPageI18n(slug, locale, { fallback: false });
  if (localizedPage) {
    return {
      meta,
      title: brandify(localizedPage.title),
      subtitle: brandify(localizedPage.subtitle || ""),
      price: null as number | null,
      currency: null as string | null,
      image: pageImageFallback[slug] || null,
      blocks: brandifyBlocks(stripEmailContactBlocks(localizedPage.blocks)),
      kind: "page" as const,
      priceSuffix: null as string | null,
      features: [] as string[],
    };
  }

  // Cap huge legacy pages (especially WordPress hosting overview)
  const page = getImportedPage(slug, {
    maxBlocks: meta.group === "hosting" ? 12 : 40,
  });
  if (!page) {
    return {
      meta,
      title: serviceTitleForLocale(slug, locale, meta.titleNl, meta.title),
      subtitle: serviceSubtitleForLocale(
        slug,
        locale,
        meta.summaryNl || "",
        meta.summary || "",
      ),
      price: null as number | null,
      currency: null as string | null,
      image: pageImageFallback[slug] || null,
      blocks: [] as ContentBlock[],
      kind: "page" as const,
      priceSuffix: null as string | null,
      features: [] as string[],
    };
  }

  const catalogSubtitle =
    catalogServiceSummary(
      slug,
      locale,
      (isNl ? meta.summaryNl : meta.summary) || meta.summary || "",
    ) || "";
  const bodySubtitle = firstParagraphSubtitle(page.blocks, catalogSubtitle);
  return {
    meta,
    title: serviceTitleForLocale(
      slug,
      locale,
      meta.titleNl || page.title,
      page.title || meta.title,
    ),
    subtitle: serviceSubtitleForLocale(slug, locale, bodySubtitle, bodySubtitle),
    price: null as number | null,
    currency: null as string | null,
    image: pageImageFallback[slug] || null,
    blocks: page.blocks,
    kind: "page" as const,
    priceSuffix: null as string | null,
    features: [] as string[],
  };
}

export async function getServiceContent(slug: string, locale: string = "nl") {
  await hydrateLocalizedCopy(locale);
  await loadShopCatalogFromDb();
  const key = contentCacheKey(locale, slug);
  let content: ReturnType<typeof buildServiceContent>;
  if (locale === "nl" || locale === "en") {
    if (serviceContentCache.has(key)) {
      content = serviceContentCache.get(key)!;
    } else {
      content = buildServiceContent(slug, locale);
      serviceContentCache.set(key, content);
    }
  } else {
    content = buildServiceContent(slug, locale);
  }

  if (!content) return content;

  const overlay = shopCatalogOverlay(slug, locale);
  if (!overlay) {
    return {
      ...content,
      blocks: withLiveHostingPlanSpecs(slug, locale, content.blocks),
    };
  }

  const featureSubtitle =
    overlay.features.length > 0
      ? overlay.features.slice(0, 4).join(" · ")
      : overlay.shortDescription
        ? overlay.shortDescription.split("\n")[0] || content.subtitle || ""
        : content.subtitle || "";

  const blocks = overlay.blocks.length
    ? brandifyBlocks(overlay.blocks as ContentBlock[])
    : content.blocks;

  return {
    ...content,
    title: brandify(overlay.title || content.title),
    subtitle: brandify(featureSubtitle || content.subtitle || ""),
    price: overlay.price,
    listPrice: overlay.listPrice,
    currency: overlay.currency,
    priceSuffix:
      content.meta.group === "hosting"
        ? catalogUiLabel("perMonth", locale, locale === "nl" ? "/ maand" : "/ month")
        : content.priceSuffix ?? null,
    image: preferDedicatedServiceImage(content.image, overlay.image),
    blocks: withLiveHostingPlanSpecs(slug, locale, blocks),
    features: overlay.features.length
      ? overlay.features.map((f) => brandify(f))
      : content.features,
    checkoutMonths: overlay.checkoutMonths,
  };
}

function buildServiceCardMeta(slug: string, locale: string) {
  const meta = getCatalogItem(slug);
  if (!meta) return null;
  const isNl = locale === "nl";

  const custom = getCustomServiceContent(slug, locale);
  if (custom) {
    return {
      title: custom.title,
      subtitle: custom.subtitle,
      price: custom.price,
      image: custom.image,
      hasBody: custom.blocks.length > 0 || typeof custom.price === "number",
    };
  }

  if (meta.kind === "product") {
    const shop = getShopProductBySlug(slug);
    if (shop && shop.published !== false) {
      const localized = localizeShopProduct(shop, locale);
      const shortDescription = brandify(localized.localizedShort || "");
      const features = productFeatures(shortDescription);
      const subtitle =
        features.length > 0
          ? features.slice(0, 4).join(" · ")
          : shortDescription.split("\n")[0] ||
            catalogServiceSummary(
              slug,
              locale,
              (isNl ? meta.summaryNl : meta.summary) || "",
            ) ||
            "";
      return {
        title: brandify(localized.localizedName),
        subtitle,
        price: shopUnitPriceInclCents(shop) / 100,
        image: shop.image || imageMap[slug] || pageImageFallback[slug] || null,
        hasBody: true,
      };
    }

    const product = productBySlug.get(slug);
    if (!product) return null;
    const i18n = getProductI18n(slug, locale);
    const shortDescription = brandify(
      product.shortDescription || i18n?.shortDescription || "",
    );
    const features = productFeatures(shortDescription);
    const name = brandify(product.name || i18n?.name || slug);
    const subtitle =
      features.length > 0
        ? features.slice(0, 4).join(" · ")
        : shortDescription.split("\n")[0] ||
          catalogServiceSummary(
            slug,
            locale,
            (isNl ? meta.summaryNl : meta.summary) || "",
          ) ||
          "";
    return {
      title: serviceTitleForLocale(slug, locale, meta.titleNl || name, meta.title || name),
      subtitle,
      price: product.price,
      image: imageMap[slug] || product.images?.[0] || pageImageFallback[slug] || null,
      hasBody: true,
    };
  }

  const localizedPage = getPageI18n(slug, locale, { fallback: false });
  if (localizedPage) {
    return {
      title: brandify(localizedPage.title),
      subtitle: brandify(localizedPage.subtitle || ""),
      price: null as number | null,
      image: pageImageFallback[slug] || null,
      hasBody: localizedPage.blocks.length > 0,
    };
  }

  const page = pages[slug];
  const catalogSubtitle =
    catalogServiceSummary(
      slug,
      locale,
      (isNl ? meta.summaryNl : meta.summary) || meta.summary || "",
    ) || "";
  const subtitle = page ? firstRawSnippet(page.rawText, catalogSubtitle) : catalogSubtitle;
  return {
    title: serviceTitleForLocale(slug, locale, meta.titleNl, meta.title),
    subtitle: serviceSubtitleForLocale(slug, locale, subtitle, subtitle),
    price: null as number | null,
    image: pageImageFallback[slug] || null,
    hasBody: Boolean(page?.rawText?.trim()) || Boolean(subtitle),
  };
}

/** Lightweight card data — skips full block parsing for listings. */
export async function getServiceCardMeta(slug: string, locale: string = "nl") {
  await hydrateLocalizedCopy(locale);
  await loadShopCatalogFromDb();
  const key = contentCacheKey(locale, slug);
  let meta: ReturnType<typeof buildServiceCardMeta>;
  if (locale === "nl" || locale === "en") {
    if (serviceCardCache.has(key)) {
      meta = serviceCardCache.get(key)!;
    } else {
      meta = buildServiceCardMeta(slug, locale);
      serviceCardCache.set(key, meta);
    }
  } else {
    meta = buildServiceCardMeta(slug, locale);
  }

  if (!meta) return meta;

  const overlay = shopCatalogOverlay(slug, locale);
  if (!overlay) return meta;

  const subtitle =
    overlay.features.length > 0
      ? overlay.features.slice(0, 4).join(" · ")
      : overlay.shortDescription
        ? overlay.shortDescription.split("\n")[0] || meta.subtitle
        : meta.subtitle;

  return {
    ...meta,
    title: brandify(overlay.title || meta.title),
    subtitle: brandify(subtitle || ""),
    price: overlay.price,
    listPrice: overlay.listPrice,
    image: preferDedicatedServiceImage(meta.image, overlay.image),
    hasBody: true,
  };
}

export function listProductsByGroup(group: ServiceNavItem["group"]) {
  return products
    .filter((p) => getCatalogItem(p.slug)?.group === group)
    .map((p) => ({
      ...p,
      localImage: imageMap[p.slug] || p.images?.[0] || null,
      name: brandify(p.name),
      shortDescription: brandify(p.shortDescription || ""),
    }));
}

export function getAllProducts() {
  return products.map((p) => ({
    ...p,
    localImage: imageMap[p.slug] || p.images?.[0] || null,
    name: brandify(p.name),
    shortDescription: brandify(p.shortDescription || ""),
  }));
}

export function formatEuro(price: number) {
  return formatEuroShared(price);
}

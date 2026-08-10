import importedPages from "@/content/fixweb/imported-pages.json";
import importedProducts from "@/content/fixweb/imported-products.json";
import localImages from "@/content/fixweb/local-images.json";
import { getCatalogItem, type ServiceNavItem } from "@/content/fixweb/catalog";
import { getCustomServiceContent } from "@/content/services/custom";

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

/** Strip legacy Fix-Web branding from imported content. */
export function brandify(text: string) {
  return text
    .replace(/info@fix-web\.com/gi, "info@000-it.com")
    .replace(/https?:\/\/(www\.)?fix-web\.com/gi, "https://000-it.com")
    .replace(/(www\.)?fix-web\.com/gi, "000-it.com")
    .replace(/FIX-WEB\.shop/gi, "TripleZero iT")
    .replace(/Fix-Web\.site/gi, "TripleZero iT")
    .replace(/FIX-WEB\.SITE/gi, "TripleZero iT")
    .replace(/Fix[\s-]?Web/gi, "TripleZero iT")
    .replace(/FIX[\s-]?WEB/gi, "TripleZero iT");
}

export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

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

  return blocks;
}

function productFeatures(shortDescription: string) {
  return shortDescription
    .split("\n")
    .map((line) => line.replace(/^[-–•]\s*/, "").trim())
    .filter(
      (line) =>
        line.length > 1 &&
        !/^what can you expect/i.test(line) &&
        !/^wat kunt u verwachten/i.test(line),
    );
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

export function getImportedProduct(slug: string, options?: { lean?: boolean }) {
  const product = productBySlug.get(slug);
  if (!product) return null;
  const shortDescription = brandify(product.shortDescription || "");
  const features = productFeatures(shortDescription);
  const lean = options?.lean ?? false;
  const descriptionBlocks = lean
    ? textToBlocks(product.description || "", { maxBlocks: 4 })
    : textToBlocks(product.description || shortDescription || "");

  const blocks: ContentBlock[] =
    features.length >= 2
      ? [
          { type: "heading", text: "Plan highlights" },
          { type: "list", items: features },
          ...descriptionBlocks,
        ]
      : descriptionBlocks;

  return {
    ...product,
    name: brandify(product.name),
    shortDescription,
    description: brandify(product.description || ""),
    features,
    localImage: imageMap[slug] || product.images?.[0] || null,
    blocks,
  };
}

const pageImageFallback: Record<string, string> = {
  "content-writing": "/uploads/fixweb/content-social.png",
  "social-media-management": "/uploads/fixweb/content-social.png",
  "media-creation": "/uploads/fixweb/content-social.png",
  "community-management": "/uploads/fixweb/content-social.png",
  "digital-marketing": "/uploads/fixweb/ai-advertising.png",
  "product-listing": "/uploads/fixweb/ai-advertising.png",
  "data-entry": "/uploads/fixweb/ai-advertising.png",
  "e-commerce": "/uploads/fixweb/maatwerk-software.png",
  "seo-optimization": "/uploads/fixweb/seo-optimization.png",
  "web-hosting": "/uploads/fixweb/shared-hosting-basic.png",
  "shared-hosting": "/uploads/fixweb/shared-hosting-plus.png",
  "wordpress-hosting": "/uploads/fixweb/wordpress-hosting-basic.png",
  "vps-hosting": "/uploads/fixweb/vps-hosting-basic.png",
  domains: "/uploads/fixweb/shared-hosting-business.png",
  "wordpress-support": "/uploads/fixweb/wordpress-security.png",
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
    .find((line) => line.length > 20 && !/^plan highlights$/i.test(line));
  if (!cleaned) return fallback;
  return cleaned.length > 220 ? `${cleaned.slice(0, 217)}…` : cleaned;
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
    const product = getImportedProduct(slug, { lean });
    if (!product) return null;
    const featureSubtitle =
      product.features.length > 0
        ? product.features.slice(0, 4).join(" · ")
        : product.shortDescription.split("\n")[0] || meta.summary || "";
    const isHostingProduct = meta.group === "hosting";
    return {
      meta,
      title: isNl ? meta.titleNl || product.name : meta.title || product.name,
      subtitle: featureSubtitle,
      price: product.price,
      currency: product.currency,
      priceSuffix: isHostingProduct ? (isNl ? "/ maand" : "/ month") : null,
      image: product.localImage || pageImageFallback[slug] || null,
      blocks: isNl
        ? product.blocks.map((block) =>
            block.type === "heading" && block.text === "Plan highlights"
              ? { ...block, text: "Planhighlights" }
              : block,
          )
        : product.blocks,
      kind: "product" as const,
      features: product.features,
    };
  }

  // Cap huge legacy pages (especially WordPress hosting overview)
  const page = getImportedPage(slug, {
    maxBlocks: meta.group === "hosting" ? 12 : 40,
  });
  if (!page) {
    return {
      meta,
      title: isNl ? meta.titleNl : meta.title,
      subtitle: (isNl ? meta.summaryNl : meta.summary) || "",
      price: null as number | null,
      currency: null as string | null,
      image: pageImageFallback[slug] || null,
      blocks: [] as ContentBlock[],
      kind: "page" as const,
      priceSuffix: null as string | null,
      features: [] as string[],
    };
  }

  const catalogSubtitle = (isNl ? meta.summaryNl : meta.summary) || meta.summary || "";
  return {
    meta,
    title: isNl ? meta.titleNl || page.title : page.title || meta.title,
    subtitle: firstParagraphSubtitle(page.blocks, catalogSubtitle),
    price: null as number | null,
    currency: null as string | null,
    image: pageImageFallback[slug] || null,
    blocks: page.blocks,
    kind: "page" as const,
    priceSuffix: null as string | null,
    features: [] as string[],
  };
}

export function getServiceContent(slug: string, locale: string = "nl") {
  const key = `${locale}:${slug}`;
  if (serviceContentCache.has(key)) return serviceContentCache.get(key)!;
  const content = buildServiceContent(slug, locale);
  serviceContentCache.set(key, content);
  return content;
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
    const product = productBySlug.get(slug);
    if (!product) return null;
    const shortDescription = brandify(product.shortDescription || "");
    const features = productFeatures(shortDescription);
    const subtitle =
      features.length > 0
        ? features.slice(0, 4).join(" · ")
        : shortDescription.split("\n")[0] || (isNl ? meta.summaryNl : meta.summary) || "";
    return {
      title: isNl ? meta.titleNl || brandify(product.name) : meta.title || brandify(product.name),
      subtitle,
      price: product.price,
      image: imageMap[slug] || product.images?.[0] || pageImageFallback[slug] || null,
      hasBody: true,
    };
  }

  const page = pages[slug];
  const catalogSubtitle = (isNl ? meta.summaryNl : meta.summary) || meta.summary || "";
  const subtitle = page ? firstRawSnippet(page.rawText, catalogSubtitle) : catalogSubtitle;
  return {
    title: isNl ? meta.titleNl : meta.title,
    subtitle,
    price: null as number | null,
    image: pageImageFallback[slug] || null,
    hasBody: Boolean(page?.rawText?.trim()) || Boolean(subtitle),
  };
}

/** Lightweight card data — skips full block parsing for listings. */
export function getServiceCardMeta(slug: string, locale: string = "nl") {
  const key = `${locale}:${slug}`;
  if (serviceCardCache.has(key)) return serviceCardCache.get(key)!;
  const meta = buildServiceCardMeta(slug, locale);
  serviceCardCache.set(key, meta);
  return meta;
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
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

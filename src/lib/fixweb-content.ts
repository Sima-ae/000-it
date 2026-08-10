import importedPages from "@/content/fixweb/imported-pages.json";
import importedProducts from "@/content/fixweb/imported-products.json";
import localImages from "@/content/fixweb/local-images.json";
import { getCatalogItem, type ServiceNavItem } from "@/content/fixweb/catalog";

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

export function textToBlocks(raw: string): ContentBlock[] {
  const text = brandify(raw || "").trim();
  if (!text) return [];

  const chunks = text.split(/\n{2,}/).map((c) => c.trim()).filter(Boolean);
  const blocks: ContentBlock[] = [];

  for (const chunk of chunks) {
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

export function getImportedPage(slug: string) {
  const page = pages[slug];
  if (!page) return null;
  return {
    title: brandify(page.title),
    rawText: brandify(page.rawText),
    blocks: textToBlocks(page.rawText),
  };
}

export function getImportedProduct(slug: string) {
  const product = products.find((p) => p.slug === slug);
  if (!product) return null;
  return {
    ...product,
    name: brandify(product.name),
    shortDescription: brandify(product.shortDescription || ""),
    description: brandify(product.description || ""),
    localImage: imageMap[slug] || product.images?.[0] || null,
    blocks: textToBlocks(product.description || product.shortDescription || ""),
  };
}

export function getServiceContent(slug: string) {
  const meta = getCatalogItem(slug);
  if (!meta) return null;

  if (meta.kind === "product") {
    const product = getImportedProduct(slug);
    if (!product) return null;
    return {
      meta,
      title: product.name,
      subtitle: product.shortDescription.split("\n")[0] || meta.summary || "",
      price: product.price,
      currency: product.currency,
      image: product.localImage,
      blocks: product.blocks,
      kind: "product" as const,
    };
  }

  const page = getImportedPage(slug);
  if (!page) return null;
  return {
    meta,
    title: page.title || meta.title,
    subtitle: meta.summary || "",
    price: null as number | null,
    currency: null as string | null,
    image: null as string | null,
    blocks: page.blocks,
    kind: "page" as const,
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
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

import {
  writeFileSync,
  mkdirSync,
  existsSync,
  readFileSync,
  unlinkSync,
  readdirSync,
} from "node:fs";
import { join } from "node:path";
import { seoCities } from "@/content/seo/cities";
import { staticPageSeo } from "@/content/seo/pages";
import { getServiceSlugs, serviceCatalog, serviceGroups, serviceGroupPath } from "@/content/fixweb/catalog";
import { listPublishedNewsIds } from "@/lib/news";
import { listShopProducts } from "@/lib/shop/catalog";
import { sitemapAbsoluteUrl, sitemapPublicOrigin } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { enabledLanguages } from "@/i18n/languages";
import { localizedHref } from "@/i18n/pathnames";
import { hydrateAllEntitySlugs } from "@/lib/entity-slugs";

const LOCALES = enabledLanguages().map((l) => l.code);

/** Bump when regenerating after a major content release. */
const CONTENT_REV = "2026-09-14c";

/**
 * Soft cap per file. With ~35 hreflang alternates, keep well under the
 * 50MB / 50_000 URL sitemap protocol limits.
 */
const MAX_URLS_PER_FILE = 4000;

export type SitemapUrlEntry = {
  loc: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: string;
  alternates?: Record<string, string>;
};

function toIsoDate(input?: Date | string | null) {
  if (!input) return new Date().toISOString().slice(0, 10);
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function localizedUrls(path: string) {
  const clean = path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`;
  return Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      sitemapAbsoluteUrl(localizedHref(locale, clean === "/" ? "/" : clean)),
    ]),
  ) as Record<string, string>;
}

function pushLocalized(
  entries: SitemapUrlEntry[],
  path: string,
  opts: {
    lastmod: string;
    changefreq: SitemapUrlEntry["changefreq"];
    priority: number;
  },
) {
  const langs = localizedUrls(path);
  const priority = Math.min(1, Math.max(0, opts.priority)).toFixed(2);
  for (const locale of LOCALES) {
    entries.push({
      loc: langs[locale],
      lastmod: opts.lastmod,
      changefreq: opts.changefreq,
      priority,
      alternates: langs,
    });
  }
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderUrlset(entries: SitemapUrlEntry[]) {
  const body = entries
    .map((entry) => {
      const alts = entry.alternates
        ? Object.entries(entry.alternates)
            .map(
              ([lang, href]) =>
                `    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}" />`,
            )
            .concat(
              entry.alternates.nl
                ? [
                    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(entry.alternates.nl)}" />`,
                  ]
                : [],
            )
            .join("\n")
        : "";

      return [
        "  <url>",
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        alts,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
}

export function renderSitemapIndex(files: Array<{ path: string; lastmod: string }>) {
  const origin = sitemapPublicOrigin();
  const body = files
    .map(
      (f) => `  <sitemap>
    <loc>${escapeXml(`${origin}${f.path}`)}</loc>
    <lastmod>${escapeXml(f.lastmod)}</lastmod>
  </sitemap>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}

function loadKennisbankCatalogFallback(): {
  categories: string[];
  articles: Array<{ slug: string; categories: string[] }>;
} {
  try {
    const raw = JSON.parse(
      readFileSync(join(process.cwd(), "prisma/kennisbank/catalog.json"), "utf8"),
    ) as {
      categories: Array<[string, string, string] | [string, string, string, string]>;
      articles: Array<{ slug: string; categories: string[] }>;
    };
    return {
      categories: (raw.categories || []).map((c) => c[0]).filter(Boolean),
      articles: (raw.articles || []).filter((a) => a.slug && a.categories?.length),
    };
  } catch {
    return { categories: [], articles: [] };
  }
}

function chunkEntries<T>(items: T[], size: number): T[][] {
  if (!items.length) return [];
  if (items.length <= size) return [items];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export async function collectSitemapSets() {
  await hydrateAllEntitySlugs();

  const cities: SitemapUrlEntry[] = [];
  const pages: SitemapUrlEntry[] = [];
  const services: SitemapUrlEntry[] = [];
  const shop: SitemapUrlEntry[] = [];
  const news: SitemapUrlEntry[] = [];
  const portfolio: SitemapUrlEntry[] = [];
  const kennisbank: SitemapUrlEntry[] = [];

  // 1) Cities first (highest local-SEO priority)
  for (const city of seoCities) {
    pushLocalized(cities, `/locaties/${city.slug}`, {
      lastmod: toIsoDate(CONTENT_REV),
      changefreq: city.changeFrequency,
      priority: city.priority,
    });
  }
  pushLocalized(cities, "/locaties", {
    lastmod: toIsoDate(CONTENT_REV),
    changefreq: "weekly",
    priority: 0.86,
  });

  // 2) Static marketing / legal pages
  const sortedPages = [...staticPageSeo].sort((a, b) => b.priority - a.priority);
  for (const page of sortedPages) {
    if (page.path === "/locaties" || page.path === "/shop") continue;
    pushLocalized(pages, page.path, {
      lastmod: toIsoDate(page.lastmod),
      changefreq: page.changeFrequency,
      priority: page.priority,
    });
  }

  // 3) Service detail pages
  const serviceLastmod = toIsoDate(CONTENT_REV);
  for (const slug of getServiceSlugs()) {
    const item = serviceCatalog.find((s) => s.slug === slug);
    const priority =
      slug.includes("seo") || slug.includes("aeo") || slug.includes("geo") || slug.includes("ai-")
        ? 0.88
        : 0.75;
    pushLocalized(services, `/diensten/${slug}`, {
      lastmod: serviceLastmod,
      changefreq: "weekly",
      priority: item?.group === "ai" ? Math.max(priority, 0.9) : priority,
    });
  }
  for (const group of serviceGroups) {
    pushLocalized(services, serviceGroupPath(group.id), {
      lastmod: serviceLastmod,
      changefreq: "weekly",
      priority: group.id === "ai" ? 0.9 : 0.84,
    });
  }

  // 4) Shop index + products
  pushLocalized(shop, "/shop", {
    lastmod: toIsoDate(CONTENT_REV),
    changefreq: "weekly",
    priority: 0.95,
  });
  for (const product of listShopProducts()) {
    pushLocalized(shop, `/shop/${product.slug}`, {
      lastmod: toIsoDate(CONTENT_REV),
      changefreq: "weekly",
      priority: product.type === "plan" ? 0.9 : 0.75,
    });
  }

  // 5) News articles (DB)
  try {
    const posts = await listPublishedNewsIds();
    for (const post of posts) {
      const lastmod = toIsoDate(post.updatedAt || post.date);
      const langs = localizedUrls(`/nieuws/${post.id}`);
      for (const locale of LOCALES) {
        news.push({
          loc: langs[locale],
          lastmod,
          changefreq: "weekly",
          priority: "0.80",
          alternates: langs,
        });
      }
    }
  } catch (error) {
    console.warn("[sitemap] news unavailable:", error);
  }

  // 6) Portfolio projects (DB)
  try {
    const projects = await prisma.portfolioProject.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, createdAt: true },
      orderBy: { updatedAt: "desc" },
    });
    for (const project of projects) {
      pushLocalized(portfolio, `/portfolio/${project.slug}`, {
        lastmod: toIsoDate(project.updatedAt || project.createdAt),
        changefreq: "monthly",
        priority: 0.7,
      });
    }
  } catch (error) {
    console.warn("[sitemap] portfolio unavailable:", error);
  }

  // 7) Kennisbank — DB first, catalog.json fallback
  try {
    const { listCategories, listPublishedArticlePaths } = await import("@/lib/kennisbank");
    const cats = await listCategories({ locale: "nl" });
    for (const cat of cats) {
      pushLocalized(kennisbank, `/kennisbank/${cat.slug}`, {
        lastmod: toIsoDate(cat.updatedAt || CONTENT_REV),
        changefreq: "weekly",
        priority: 0.7,
      });
    }
    const paths = await listPublishedArticlePaths();
    for (const item of paths) {
      pushLocalized(kennisbank, `/kennisbank/${item.categorySlug}/${item.articleSlug}`, {
        lastmod: toIsoDate(item.updatedAt || CONTENT_REV),
        changefreq: "monthly",
        priority: 0.65,
      });
    }
  } catch (error) {
    console.warn("[sitemap] kennisbank DB unavailable — using catalog.json fallback");
    console.warn(error instanceof Error ? error.message : error);
    const catalog = loadKennisbankCatalogFallback();
    for (const slug of catalog.categories) {
      pushLocalized(kennisbank, `/kennisbank/${slug}`, {
        lastmod: toIsoDate(CONTENT_REV),
        changefreq: "weekly",
        priority: 0.7,
      });
    }
    for (const article of catalog.articles) {
      for (const categorySlug of article.categories) {
        pushLocalized(kennisbank, `/kennisbank/${categorySlug}/${article.slug}`, {
          lastmod: toIsoDate(CONTENT_REV),
          changefreq: "monthly",
          priority: 0.65,
        });
      }
    }
  }

  return { cities, pages, services, shop, news, portfolio, kennisbank };
}

/**
 * Build `/sitemap.xml` index XML from child files on disk.
 * Never throws — used by the HTTP route so the endpoint cannot 500.
 */
export function buildSitemapIndexFromDisk(rootDir = process.cwd()): {
  xml: string;
  files: Array<{ path: string; lastmod: string }>;
} {
  const dir = join(rootDir, "public", "sitemaps");
  const today = toIsoDate(new Date());
  const preferredOrder = [
    "sitemap-cities",
    "sitemap-pages",
    "sitemap-services",
    "sitemap-shop",
    "sitemap-kennisbank",
    "sitemap-news",
    "sitemap-portfolio",
  ];

  const found = existsSync(dir)
    ? readdirSync(dir).filter((f) => f.startsWith("sitemap-") && f.endsWith(".xml"))
    : [];

  const sorted = [...found].sort((a, b) => {
    const baseA = a.replace(/-\d+\.xml$/, ".xml").replace(/\.xml$/, "");
    const baseB = b.replace(/-\d+\.xml$/, ".xml").replace(/\.xml$/, "");
    const ia = preferredOrder.findIndex((p) => baseA.startsWith(p));
    const ib = preferredOrder.findIndex((p) => baseB.startsWith(p));
    if (ia !== ib) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b);
  });

  const files = sorted.map((name) => {
    let lastmod = today;
    try {
      const text = readFileSync(join(dir, name), "utf8");
      const m = text.match(/<lastmod>([^<]+)<\/lastmod>/);
      if (m?.[1]) lastmod = m[1].slice(0, 10);
    } catch {
      /* keep today */
    }
    return { path: `/sitemaps/${name}`, lastmod };
  });

  return { xml: renderSitemapIndex(files), files };
}

export async function writeSitemapFiles(rootDir = process.cwd()) {
  const outDir = join(rootDir, "public", "sitemaps");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  // Clear previous generated children so renamed/split files do not linger.
  for (const name of readdirSync(outDir)) {
    if (name.startsWith("sitemap-") && name.endsWith(".xml")) {
      try {
        unlinkSync(join(outDir, name));
      } catch {
        /* ignore */
      }
    }
  }

  const sets = await collectSitemapSets();
  const today = toIsoDate(new Date());

  const groups: Array<{ base: string; entries: SitemapUrlEntry[] }> = [
    { base: "sitemap-cities", entries: sets.cities },
    { base: "sitemap-pages", entries: sets.pages },
    { base: "sitemap-services", entries: sets.services },
    { base: "sitemap-shop", entries: sets.shop },
    { base: "sitemap-kennisbank", entries: sets.kennisbank },
    { base: "sitemap-news", entries: sets.news },
    { base: "sitemap-portfolio", entries: sets.portfolio },
  ];

  const indexFiles: Array<{ path: string; lastmod: string }> = [];
  const allUrls: string[] = [];

  for (const group of groups) {
    if (!group.entries.length) continue;
    const chunks = chunkEntries(group.entries, MAX_URLS_PER_FILE);
    chunks.forEach((entries, idx) => {
      const name =
        chunks.length === 1 ? `${group.base}.xml` : `${group.base}-${idx + 1}.xml`;
      writeFileSync(join(outDir, name), renderUrlset(entries), "utf8");
      const newest = entries.reduce(
        (max, e) => (e.lastmod > max ? e.lastmod : max),
        entries[0]?.lastmod || today,
      );
      indexFiles.push({ path: `/sitemaps/${name}`, lastmod: newest });
      allUrls.push(...entries.map((e) => e.loc));
    });
  }

  const indexXml = renderSitemapIndex(indexFiles);
  // Main entry for crawlers (also served by app/sitemap.xml/route.ts).
  writeFileSync(join(rootDir, "public", "sitemap.xml"), indexXml, "utf8");

  writeFileSync(
    join(outDir, "urls.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        localeCount: LOCALES.length,
        urlCount: allUrls.length,
        origin: sitemapPublicOrigin(),
        urls: allUrls,
      },
      null,
      2,
    ),
    "utf8",
  );

  return { indexFiles, urlCount: allUrls.length, urls: allUrls, indexXml };
}

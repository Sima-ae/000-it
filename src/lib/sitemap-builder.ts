import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { seoCities } from "@/content/seo/cities";
import { staticPageSeo } from "@/content/seo/pages";
import { getServiceSlugs, serviceCatalog } from "@/content/fixweb/catalog";
import { listPublishedNewsIds } from "@/lib/news";
import { absoluteUrl, siteOrigin } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { enabledLanguages } from "@/i18n/languages";

const LOCALES = enabledLanguages().map((l) => l.code);

export type SitemapUrlEntry = {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
  alternates?: Record<string, string>;
};

function isoDate(input?: Date | string | null) {
  if (!input) return new Date().toISOString().slice(0, 10);
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function localizedUrls(path: string) {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return Object.fromEntries(
    LOCALES.map((locale) => [locale, absoluteUrl(`/${locale}${clean}`)]),
  ) as Record<string, string>;
}

function pushLocalized(
  entries: SitemapUrlEntry[],
  path: string,
  opts: { lastmod: string; changefreq: string; priority: number },
) {
  const langs = localizedUrls(path);
  for (const locale of LOCALES) {
    entries.push({
      loc: langs[locale],
      lastmod: opts.lastmod,
      changefreq: opts.changefreq,
      priority: opts.priority.toFixed(2),
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
                `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(href)}" />`,
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
        `    <lastmod>${entry.lastmod}</lastmod>`,
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

function renderSitemapIndex(files: Array<{ path: string; lastmod: string }>) {
  const origin = siteOrigin();
  const body = files
    .map(
      (f) => `  <sitemap>
    <loc>${escapeXml(`${origin}${f.path}`)}</loc>
    <lastmod>${f.lastmod}</lastmod>
  </sitemap>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}

export async function collectSitemapSets() {
  const cities: SitemapUrlEntry[] = [];
  const pages: SitemapUrlEntry[] = [];
  const services: SitemapUrlEntry[] = [];
  const news: SitemapUrlEntry[] = [];
  const portfolio: SitemapUrlEntry[] = [];

  // 1) Cities first — already sorted by priority desc
  for (const city of seoCities) {
    pushLocalized(cities, `/locaties/${city.slug}`, {
      lastmod: isoDate("2026-08-10"),
      changefreq: city.changeFrequency,
      priority: city.priority,
    });
  }
  pushLocalized(cities, "/locaties", {
    lastmod: isoDate("2026-08-10"),
    changefreq: "weekly",
    priority: 0.86,
  });

  // 2) Static pages by configured priority
  const sortedPages = [...staticPageSeo].sort((a, b) => b.priority - a.priority);
  for (const page of sortedPages) {
    if (page.path === "/locaties") continue; // already in cities set
    pushLocalized(pages, page.path, {
      lastmod: isoDate(page.lastmod),
      changefreq: page.changeFrequency,
      priority: page.priority,
    });
  }

  // 3) Services
  const serviceLastmod = isoDate("2026-08-10");
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

  // 4) News from DB
  try {
    const posts = await listPublishedNewsIds();
    for (const post of posts) {
      const lastmod = isoDate(post.updatedAt || post.date);
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

  // 5) Portfolio from DB
  try {
    const projects = await prisma.portfolioProject.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, createdAt: true },
      orderBy: { updatedAt: "desc" },
    });
    for (const project of projects) {
      pushLocalized(portfolio, `/portfolio/${project.slug}`, {
        lastmod: isoDate(project.updatedAt || project.createdAt),
        changefreq: "monthly",
        priority: 0.7,
      });
    }
  } catch (error) {
    console.warn("[sitemap] portfolio unavailable:", error);
  }

  return { cities, pages, services, news, portfolio };
}

export async function writeSitemapFiles(rootDir = process.cwd()) {
  const outDir = join(rootDir, "public", "sitemaps");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const sets = await collectSitemapSets();
  const today = isoDate(new Date());

  const files = [
    { name: "sitemap-cities.xml", entries: sets.cities },
    { name: "sitemap-pages.xml", entries: sets.pages },
    { name: "sitemap-services.xml", entries: sets.services },
    { name: "sitemap-news.xml", entries: sets.news },
    { name: "sitemap-portfolio.xml", entries: sets.portfolio },
  ];

  const indexFiles: Array<{ path: string; lastmod: string }> = [];

  for (const file of files) {
    if (!file.entries.length) continue;
    const xml = renderUrlset(file.entries);
    writeFileSync(join(outDir, file.name), xml, "utf8");
    const newest = file.entries.reduce(
      (max, e) => (e.lastmod > max ? e.lastmod : max),
      file.entries[0]?.lastmod || today,
    );
    indexFiles.push({ path: `/sitemaps/${file.name}`, lastmod: newest });
  }

  const indexXml = renderSitemapIndex(indexFiles);
  writeFileSync(join(rootDir, "public", "sitemap.xml"), indexXml, "utf8");

  const allUrls = files.flatMap((f) => f.entries.map((e) => e.loc));
  writeFileSync(
    join(outDir, "urls.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), urls: allUrls }, null, 2),
    "utf8",
  );

  return { indexFiles, urlCount: allUrls.length, urls: allUrls };
}

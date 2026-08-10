#!/usr/bin/env tsx
/**
 * Professional multi-file sitemap generator.
 * Usage: npm run generate-sitemap
 *
 * Writes:
 *  - public/sitemap.xml (index — cities first)
 *  - public/sitemaps/sitemap-cities.xml
 *  - public/sitemaps/sitemap-pages.xml
 *  - public/sitemaps/sitemap-services.xml
 *  - public/sitemaps/sitemap-news.xml
 *  - public/sitemaps/sitemap-portfolio.xml
 *  - public/sitemaps/urls.json (for IndexNow)
 */
import { writeSitemapFiles } from "../src/lib/sitemap-builder";

async function main() {
  const result = await writeSitemapFiles(process.cwd());
  const origin = (await import("../src/lib/seo")).siteOrigin();
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
    console.warn(
      `[generate-sitemap] URLs use ${origin}. For production files run:\n  SITEMAP_BASE_URL=https://000-it.com npm run generate-sitemap`,
    );
  }
  console.log(`[generate-sitemap] Wrote sitemap index with ${result.indexFiles.length} child sitemaps`);
  for (const file of result.indexFiles) {
    console.log(`  - ${file.path} (lastmod ${file.lastmod})`);
  }
  console.log(`[generate-sitemap] ${result.urlCount} URLs total`);
}

main().catch((error) => {
  console.error("[generate-sitemap] failed", error);
  process.exit(1);
});

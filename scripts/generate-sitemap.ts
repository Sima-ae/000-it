#!/usr/bin/env tsx
/**
 * Professional multi-file sitemap generator.
 * Usage: npm run generate-sitemap
 *
 * Always writes https://000-it.com unless SITEMAP_BASE_URL is a non-localhost URL.
 *
 * Output:
 *  - public/sitemap.xml          ← main index (Google/Bing/Yahoo entry point)
 *  - public/sitemaps/sitemap-*.xml
 *  - public/sitemaps/urls.json   ← IndexNow
 */
import { writeSitemapFiles } from "../src/lib/sitemap-builder";

async function main() {
  if (
    !process.env.SITEMAP_BASE_URL ||
    /localhost|127\.0\.0\.1/i.test(process.env.SITEMAP_BASE_URL)
  ) {
    process.env.SITEMAP_BASE_URL = "https://000-it.com";
  }

  const result = await writeSitemapFiles(process.cwd());
  console.log(`[generate-sitemap] origin=${process.env.SITEMAP_BASE_URL}`);
  console.log(
    `[generate-sitemap] Wrote sitemap index with ${result.indexFiles.length} child sitemaps`,
  );
  for (const file of result.indexFiles) {
    console.log(`  - ${file.path} (lastmod ${file.lastmod})`);
  }
  console.log(`[generate-sitemap] ${result.urlCount} URLs total`);

  // Hard fail if any localhost leaked into the public sitemap.
  const bad = result.urls.find((u) => /localhost|127\.0\.0\.1|:3066/i.test(u));
  if (bad) {
    console.error(`[generate-sitemap] INVALID localhost URL in sitemap: ${bad}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("[generate-sitemap] failed", error);
  process.exit(1);
});

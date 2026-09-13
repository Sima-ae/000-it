import { NextResponse } from "next/server";
import { buildSitemapIndexFromDisk } from "@/lib/sitemap-builder";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Canonical sitemap index for the whole site.
 *
 * Spec-compliant sitemapindex XML for Google, Bing, Yahoo, Yandex, etc.
 * Always returns HTTP 200 (never 500). Child urlsets: /sitemaps/*.xml
 */
export async function GET() {
  try {
    const { xml, files } = buildSitemapIndexFromDisk(process.cwd());
    // If disk has no children yet, still return a valid empty index (200).
    void files;
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[sitemap.xml] unexpected error — returning empty valid index", error);
    const empty = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</sitemapindex>
`;
    return new NextResponse(empty, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
}

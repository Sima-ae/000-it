import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMPTY_URLSET = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>
`;

function xmlResponse(xml: string, cache = true) {
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // No X-Robots-Tag — keep sitemaps fully processable by Google.
      "Cache-Control": cache
        ? "public, s-maxage=3600, stale-while-revalidate=86400"
        : "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * Canonical sitemap index. Lists every child urlset under /sitemaps/
 * (cities, pages, services, shop, news, portfolio, kennisbank chunks).
 */
export async function GET() {
  try {
    const staticPath = join(process.cwd(), "public", "sitemap.xml");
    if (existsSync(staticPath)) {
      const xml = readFileSync(staticPath, "utf8");
      if (xml.includes("<url>") || xml.includes("<sitemap>")) {
        return xmlResponse(xml);
      }
    }
    console.error("[sitemap.xml] missing or empty public/sitemap.xml");
    return xmlResponse(EMPTY_URLSET, false);
  } catch (error) {
    console.error("[sitemap.xml] unexpected error", error);
    return xmlResponse(EMPTY_URLSET, false);
  }
}

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { buildSitemapIndexFromDisk } from "@/lib/sitemap-builder";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMPTY_INDEX = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</sitemapindex>
`;

function xmlResponse(xml: string, cache = true) {
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": cache
        ? "public, s-maxage=3600, stale-while-revalidate=86400"
        : "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * Canonical sitemap index for the whole site.
 * Prefer live disk children; fall back to committed public/sitemap.xml so
 * Google never sees an empty processed index.
 */
export async function GET() {
  try {
    const { xml, files } = buildSitemapIndexFromDisk(process.cwd());
    if (files.length > 0) {
      return xmlResponse(xml);
    }

    const staticPath = join(process.cwd(), "public", "sitemap.xml");
    if (existsSync(staticPath)) {
      const fallback = readFileSync(staticPath, "utf8");
      if (fallback.includes("<sitemap>") || fallback.includes("<url>")) {
        return xmlResponse(fallback);
      }
    }

    console.error("[sitemap.xml] no child sitemaps on disk — empty index");
    return xmlResponse(EMPTY_INDEX, false);
  } catch (error) {
    console.error("[sitemap.xml] unexpected error — trying static fallback", error);
    try {
      const staticPath = join(process.cwd(), "public", "sitemap.xml");
      if (existsSync(staticPath)) {
        return xmlResponse(readFileSync(staticPath, "utf8"), false);
      }
    } catch {
      /* fall through */
    }
    return xmlResponse(EMPTY_INDEX, false);
  }
}

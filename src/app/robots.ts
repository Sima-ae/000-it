import type { MetadataRoute } from "next";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { sitemapPublicOrigin } from "@/lib/seo";
import { ROBOTS_DISALLOW_ALL_AGENTS } from "@/lib/anti-scrape";

function robotsSitemapList(origin: string): string[] {
  const fallback = [
    `${origin}/sitemap.xml`,
    `${origin}/sitemaps/sitemap-kennisbank-index.xml`,
  ];
  try {
    const raw = readFileSync(
      join(process.cwd(), "public", "sitemaps", "urls.json"),
      "utf8",
    );
    const data = JSON.parse(raw) as { robotsSitemaps?: string[] };
    if (Array.isArray(data.robotsSitemaps) && data.robotsSitemaps.length) {
      return data.robotsSitemaps.map((path) =>
        path.startsWith("http") ? path : `${origin}${path}`,
      );
    }
  } catch {
    /* use fallback */
  }
  // Only advertise kennisbank index when the file exists on disk.
  if (
    !existsSync(
      join(process.cwd(), "public", "sitemaps", "sitemap-kennisbank-index.xml"),
    )
  ) {
    return [`${origin}/sitemap.xml`];
  }
  return fallback;
}

export default function robots(): MetadataRoute.Robots {
  // Always point crawlers at the public production host.
  const origin = sitemapPublicOrigin();
  const disallow = [
    "/api/",
    "/*/dashboard",
    "/*/dashboard/",
    "/*/login",
    "/*/register",
    "/*-admin",
    "/*-admin/",
    "/crm",
    "/*/crm",
    "/*/crm/",
    "/sitemaps/urls.json",
  ];

  return {
    rules: [
      // Google, Bing, Yahoo (Slurp), DuckDuckGo, Yandex, … — full site + kennisbank.
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      // AI training / SEO scrapers — nothing.
      {
        userAgent: [...ROBOTS_DISALLOW_ALL_AGENTS],
        disallow: "/",
      },
      // Meta link-preview crawlers (WhatsApp / Messenger / Facebook)
      {
        userAgent: "WhatsApp",
        allow: "/",
      },
      {
        userAgent: "facebookexternalhit",
        allow: "/",
      },
      {
        userAgent: "Facebot",
        allow: "/",
      },
      {
        userAgent: "meta-externalagent",
        allow: "/",
      },
    ],
    // Core flat sitemap + kennisbank index (GSC reads both).
    sitemap: robotsSitemapList(origin),
    host: origin,
  };
}

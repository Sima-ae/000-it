import type { MetadataRoute } from "next";
import { sitemapPublicOrigin } from "@/lib/seo";
import { ROBOTS_DISALLOW_ALL_AGENTS } from "@/lib/anti-scrape";

function robotsSitemapList(origin: string): string[] {
  // Always advertise only the index. Child urlsets are discovered via
  // <sitemapindex> — listing them in robots.txt makes GSC show peers instead
  // of nested children under the index.
  return [`${origin}/sitemap.xml`];
}

export default function robots(): MetadataRoute.Robots {
  // Always point crawlers at the public production host.
  const origin = sitemapPublicOrigin();
  const host = (() => {
    try {
      return new URL(origin).host;
    } catch {
      return "000-it.com";
    }
  })();
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
      // Answer engines (AEO/GEO citation) — public marketing pages, not training.
      {
        userAgent: [
          "OAI-SearchBot",
          "ChatGPT-User",
          "Claude-SearchBot",
          "PerplexityBot",
          "Perplexity-User",
          "YouBot",
          "DuckAssistBot",
        ],
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
    // Only the sitemap index — Google expands child urlsets from it.
    sitemap: robotsSitemapList(origin),
    // Bing Host directive: hostname only (no scheme).
    host,
  };
}

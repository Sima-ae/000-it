import type { MetadataRoute } from "next";
import { sitemapPublicOrigin } from "@/lib/seo";
import { ROBOTS_DISALLOW_ALL_AGENTS } from "@/lib/anti-scrape";

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
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}

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
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      {
        userAgent: [...ROBOTS_DISALLOW_ALL_AGENTS],
        disallow: "/",
      },
      // Explicit allow for Meta link-preview crawlers (WhatsApp / Messenger / Facebook)
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
    // Professional sitemap index (cities → pages → services → shop → kennisbank → news → portfolio)
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}

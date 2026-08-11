import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
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
    // Sitemap index lists cities first, then pages/services/news/portfolio
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}

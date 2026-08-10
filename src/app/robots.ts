import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
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
        ],
      },
    ],
    // Sitemap index lists cities first, then pages/services/news/portfolio
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}

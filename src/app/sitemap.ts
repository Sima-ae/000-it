import type { MetadataRoute } from "next";
import { listPublishedNewsIds, NEWS_PAGE_SIZE } from "@/lib/news";
import { listShopProducts } from "@/lib/shop/catalog";
import { absoluteUrl, newsArticlePath, siteOrigin } from "@/lib/seo";

const LOCALES = ["nl", "en"] as const;

function localized(path: string) {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return {
    nl: absoluteUrl(`/nl${clean}`),
    en: absoluteUrl(`/en${clean}`),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  const staticPaths = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/shop", priority: 0.95, changeFrequency: "weekly" as const },
    { path: "/nieuws", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/portfolio", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/over-ons", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/ai-scan", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/diensten", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/afspraak", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/faq", priority: 0.5, changeFrequency: "monthly" as const },
  ];

  for (const item of staticPaths) {
    const langs = localized(item.path);
    for (const locale of LOCALES) {
      entries.push({
        url: langs[locale],
        lastModified: now,
        changeFrequency: item.changeFrequency,
        priority: item.priority,
        alternates: { languages: langs },
      });
    }
  }

  for (const product of listShopProducts()) {
    const langs = {
      nl: absoluteUrl(`/nl/shop/${product.slug}`),
      en: absoluteUrl(`/en/shop/${product.slug}`),
    };
    for (const locale of LOCALES) {
      entries.push({
        url: langs[locale],
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.75,
        alternates: { languages: langs },
      });
    }
  }

  try {
    const posts = await listPublishedNewsIds();
    for (const post of posts) {
      const lastModified = post.updatedAt || (post.date ? new Date(post.date) : now);
      const langs = {
        nl: absoluteUrl(newsArticlePath("nl", post.id)),
        en: absoluteUrl(newsArticlePath("en", post.id)),
      };
      for (const locale of LOCALES) {
        entries.push({
          url: langs[locale],
          lastModified,
          changeFrequency: "weekly",
          priority: 0.8,
          alternates: { languages: langs },
        });
      }
    }

    const totalPages = Math.max(1, Math.ceil(posts.length / NEWS_PAGE_SIZE));
    for (let page = 2; page <= totalPages; page += 1) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${siteOrigin()}/${locale}/nieuws?page=${page}`,
          lastModified: now,
          changeFrequency: "daily",
          priority: 0.55,
        });
      }
    }
  } catch (error) {
    console.error("[sitemap] news posts unavailable", error);
  }

  return entries;
}

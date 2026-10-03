import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { toInternalPath } from "@/i18n/pathnames";
import { isRtlLocale } from "@/i18n/languages";
import {
  catalogGroupSummary,
  getCatalogItem,
  getServiceGroup,
  isServiceGroupId,
} from "@/content/fixweb/catalog";
import { catalogGroupTitle, setCatalogLocaleOverlay } from "@/content/fixweb/catalog-title";
import { cityDisplayName, getSeoCity } from "@/content/seo/cities";
import { getStaticPageSeo, getStaticPageSeoCopy } from "@/content/seo/pages";
import { brandingImageForKennisbank } from "@/lib/branding-images";
import { hydrateEntitySlugs } from "@/lib/entity-slugs";
import { getServiceContent } from "@/lib/fixweb-content";
import { getArticleBySlug, getCategoryBySlug } from "@/lib/kennisbank";
import {
  getCatalogOverlaySync,
  hydrateLocalizedCopy,
} from "@/lib/localized-copy";
import { getPublishedNewsPost } from "@/lib/news";
import { prisma } from "@/lib/prisma";
import { readRequestSiteBrand } from "@/lib/brand/install-public-name";
import { replaceTripleZeroName } from "@/lib/brand/public-name";
import {
  absoluteUrl,
  activeSiteSeo,
  brandAwareOgImagePath,
  defaultOgImage,
  geoMetadataOther,
  htmlLangTag,
  localePath,
  ogImageDimensions,
  openGraphLocale,
  siteOrigin,
} from "@/lib/seo";
import {
  getShopProductBySlug,
  localizeShopProduct,
} from "@/lib/shop/catalog";
import { loadShopCatalogFromDb } from "@/lib/shop/catalog-db";

export type SocialPreview = {
  locale: string;
  title: string;
  description: string;
  url: string;
  image: string;
  geoRegion: string;
  geoPlacename: string;
  geoPosition: string;
  geoIcbm: string;
};

function plain(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function parseLocalePath(rawPath: string): { locale: string; path: string } {
  const clean = (rawPath || "/").split("?")[0].split("#")[0] || "/";
  const parts = clean.split("/").filter(Boolean);
  const maybeLocale = parts[0];
  if (maybeLocale && (routing.locales as readonly string[]).includes(maybeLocale)) {
    const rest = "/" + parts.slice(1).join("/");
    return {
      locale: maybeLocale,
      path: rest === "/" ? "/" : rest.replace(/\/$/, "") || "/",
    };
  }
  return { locale: routing.defaultLocale, path: clean === "/" ? "/" : clean };
}

/** Rebuild the public path from a social-preview request. */
export function rawPathFromPreviewRequest(input: {
  segments?: string[] | null;
  header?: string | null;
  query?: string | null;
}) {
  if (input.segments?.length) {
    const decoded = input.segments.map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });
    return `/${decoded.join("/")}`;
  }
  const header = input.header?.trim();
  if (header) return header.startsWith("/") ? header : `/${header}`;
  const query = input.query?.trim();
  if (query) return query.startsWith("/") ? query : `/${query}`;
  return "/";
}

function brandizePreviewText(value: string): string {
  if (readRequestSiteBrand() !== "extrahosting") return value;
  return replaceTripleZeroName(value);
}

function previewOf(
  locale: string,
  title: string,
  description: string,
  internalPath: string,
  image?: string | null,
  city?: Parameters<typeof geoMetadataOther>[0],
): SocialPreview {
  const seo = activeSiteSeo();
  const path = !internalPath || internalPath === "/" ? "" : internalPath;
  const geo = geoMetadataOther(city, locale);
  return {
    locale,
    title: plain(brandizePreviewText(title)) || seo.name,
    description: plain(brandizePreviewText(description)),
    url: absoluteUrl(localePath(locale, path)),
    image: defaultOgImage(brandAwareOgImagePath(image || seo.defaultOgImage)),
    geoRegion: geo["geo.region"],
    geoPlacename: geo["geo.placename"],
    geoPosition: geo["geo.position"],
    geoIcbm: geo.ICBM,
  };
}

function extraHostingHomePreview(locale: string): SocialPreview | null {
  if (readRequestSiteBrand() !== "extrahosting") return null;
  const seo = activeSiteSeo();
  const isNl = locale === "nl";
  return previewOf(
    locale,
    isNl ? "Domeinen en webhosting" : "Domains and web hosting",
    isNl ? seo.defaultDescription.nl : seo.defaultDescription.en,
    "/",
    seo.defaultOgImage,
  );
}

function localizedFallback(locale: string, internalPath: string): SocialPreview {
  const seo = activeSiteSeo();
  if (seo.brandId === "extrahosting") {
    return (
      extraHostingHomePreview(locale) ||
      previewOf(
        locale,
        seo.name,
        locale === "nl" ? seo.defaultDescription.nl : seo.defaultDescription.en,
        internalPath,
        seo.defaultOgImage,
      )
    );
  }
  const home = getStaticPageSeoCopy("/", locale);
  const description =
    home?.description ||
    (locale === "nl" ? seo.defaultDescription.nl : seo.defaultDescription.en);
  return previewOf(locale, seo.name, description, internalPath);
}

export async function resolveSocialPreview(rawPath: string): Promise<SocialPreview> {
  const parsed = parseLocalePath(rawPath);
  const locale = parsed.locale;
  await Promise.all([hydrateLocalizedCopy(locale), hydrateEntitySlugs(locale)]);
  setCatalogLocaleOverlay(locale, getCatalogOverlaySync(locale));
  const path = toInternalPath(locale, parsed.path);
  const isNl = locale === "nl";
  const seo = activeSiteSeo();
  const fallbackDescription = isNl
    ? seo.defaultDescription.nl
    : seo.defaultDescription.en;

  if (path === "/" || path === "") {
    const home = extraHostingHomePreview(locale);
    if (home) return home;
  }

  const groupMatch = path.match(/^\/diensten\/categorie\/([^/]+)\/?$/);
  if (groupMatch) {
    const groupId = groupMatch[1];
    if (groupId === "design") {
      const design = getStaticPageSeoCopy("/design", locale);
      const page = getStaticPageSeo("/design");
      if (design) {
        return previewOf(locale, design.title, design.description, "/design", page?.image);
      }
    }
    if (isServiceGroupId(groupId)) {
      const group = getServiceGroup(groupId);
      if (group) {
        const title = catalogGroupTitle(group.id, locale, isNl ? group.titleNl || group.title : group.title);
        const description =
          catalogGroupSummary(group.id, locale) || fallbackDescription;
        return previewOf(locale, title, description, `/diensten/categorie/${group.id}`);
      }
    }
  }

  const serviceMatch = path.match(/^\/diensten\/([^/]+)\/?$/);
  if (serviceMatch && serviceMatch[1] !== "categorie") {
    const slug = serviceMatch[1];
    const content = await getServiceContent(slug, locale);
    const meta = getCatalogItem(slug);
    const title =
      content?.title ||
      (isNl ? meta?.titleNl : meta?.title) ||
      seo.name;
    const description =
      content?.subtitle ||
      (isNl ? meta?.summaryNl : meta?.summary) ||
      fallbackDescription;
    const canonicalPath = meta?.href || `/diensten/${slug}`;
    return previewOf(locale, title, description, canonicalPath, content?.image);
  }

  if (path === "/domeinen") {
    const content = await getServiceContent("domains", locale);
    const meta = getCatalogItem("domains");
    const page = getStaticPageSeo("/domeinen");
    const copy = getStaticPageSeoCopy("/domeinen", locale);
    return previewOf(
      locale,
      content?.title || copy?.title || (isNl ? meta?.titleNl : meta?.title) || seo.name,
      content?.subtitle || copy?.description || (isNl ? meta?.summaryNl : meta?.summary) || fallbackDescription,
      "/domeinen",
      content?.image || page?.image,
    );
  }

  const cityMatch = path.match(/^\/locaties\/([^/]+)\/?$/);
  if (cityMatch) {
    const city = getSeoCity(cityMatch[1]);
    if (city) {
      const name = cityDisplayName(city, locale);
      let title = `AI, AEO, GEO & SEO in ${name}`;
      let description = isNl
        ? `TripleZero iT helpt bedrijven in ${name} met AI-integratie, AEO, GEO, SEO, marketing en maatwerk software.`
        : `TripleZero iT helps businesses in ${name} with AI integration, AEO, GEO, SEO, marketing and custom software.`;
      try {
        const t = await getTranslations({ locale, namespace: "locations" });
        title = t("cityTitle", { name });
        description = t("cityIntro", { name });
      } catch {
        /* messages missing — English/Dutch fallback above */
      }
      return previewOf(
        locale,
        title,
        description,
        `/locaties/${city.slug}`,
        city.image,
        city,
      );
    }
  }

  const newsMatch = path.match(/^\/nieuws\/([^/]+)\/?$/);
  if (newsMatch) {
    try {
      const post = await getPublishedNewsPost(newsMatch[1], locale);
      if (post) {
        return previewOf(
          locale,
          post.title,
          post.excerpt || post.description || post.title,
          `/nieuws/${post.id}`,
          post.coverImage,
        );
      }
    } catch {
      /* fall through */
    }
  }

  const kbArticleMatch = path.match(/^\/kennisbank\/([^/]+)\/([^/]+)\/?$/);
  if (kbArticleMatch) {
    try {
      const category = kbArticleMatch[1];
      const slug = kbArticleMatch[2];
      const article = await getArticleBySlug(slug, { locale });
      if (article) {
        return previewOf(
          locale,
          article.seoTitle || article.title,
          article.seoDescription || article.excerpt || article.title,
          `/kennisbank/${category}/${slug}`,
          brandingImageForKennisbank(category),
        );
      }
    } catch {
      /* fall through */
    }
  }

  const kbCategoryMatch = path.match(/^\/kennisbank\/([^/]+)\/?$/);
  if (kbCategoryMatch) {
    try {
      const category = kbCategoryMatch[1];
      const cat = await getCategoryBySlug(category, { locale });
      if (cat) {
        let suffix = "TripleZero iT";
        try {
          const t = await getTranslations({ locale, namespace: "kennisbank" });
          suffix = t("seoTitleSuffix");
        } catch {
          /* keep brand suffix */
        }
        return previewOf(
          locale,
          `${cat.name} — ${suffix}`,
          cat.description || cat.name,
          `/kennisbank/${category}`,
          brandingImageForKennisbank(category),
        );
      }
    } catch {
      /* fall through */
    }
  }

  const portfolioMatch = path.match(/^\/portfolio\/([^/]+)\/?$/);
  if (portfolioMatch) {
    try {
      const item = await prisma.portfolioProject.findFirst({
        where: { slug: portfolioMatch[1], published: true },
      });
      if (item) {
        return previewOf(
          locale,
          item.title,
          item.summary || item.title,
          `/portfolio/${item.slug}`,
          item.coverImage,
        );
      }
    } catch {
      /* fall through */
    }
  }

  const shopMatch = path.match(/^\/shop\/([^/]+)\/?$/);
  if (shopMatch && !["cart", "checkout", "success"].includes(shopMatch[1])) {
    try {
      await loadShopCatalogFromDb();
      const product = getShopProductBySlug(shopMatch[1]);
      if (product) {
        const localized = localizeShopProduct(product, locale);
        const description =
          localized.localizedShort ||
          localized.localizedDescription.split(/\n{2,}/)[0] ||
          localized.localizedName;
        return previewOf(
          locale,
          localized.localizedName,
          description,
          `/shop/${product.slug}`,
          product.image,
        );
      }
    } catch {
      /* fall through */
    }
  }

  const page = getStaticPageSeo(path === "/" ? "/" : path);
  if (page) {
    const copy = getStaticPageSeoCopy(page.path, locale);
    return previewOf(
      locale,
      copy?.title || (isNl ? page.title.nl : page.title.en),
      copy?.description || (isNl ? page.description.nl : page.description.en),
      page.path,
      page.image,
    );
  }

  return localizedFallback(locale, path === "/" ? "/" : path);
}

export function renderSocialPreviewHtml(preview: SocialPreview) {
  const seo = activeSiteSeo();
  const title = escAttr(preview.title);
  const description = escAttr(preview.description);
  const url = escAttr(preview.url);
  const image = escAttr(preview.image);
  const ogLocale = escAttr(openGraphLocale(preview.locale));
  const altLocale = escAttr(openGraphLocale(preview.locale === "nl" ? "en" : "nl"));
  const geo = {
    "geo.region": preview.geoRegion,
    "geo.placename": preview.geoPlacename,
    "geo.position": preview.geoPosition,
    ICBM: preview.geoIcbm,
  };
  const dims = ogImageDimensions(preview.image);
  const imageType = preview.image.toLowerCase().includes(".jpg") || preview.image.toLowerCase().includes(".jpeg")
    ? "image/jpeg"
    : preview.image.toLowerCase().includes(".webp")
      ? "image/webp"
      : "image/png";
  const dir = isRtlLocale(preview.locale) ? "rtl" : "ltr";
  const lang = escAttr(htmlLangTag(preview.locale));
  const siteName = escAttr(seo.name);

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8"/>
<title>${title}</title>
<meta name="description" content="${description}"/>
<meta name="geo.region" content="${escAttr(geo["geo.region"])}"/>
<meta name="geo.placename" content="${escAttr(geo["geo.placename"])}"/>
<meta name="geo.position" content="${escAttr(geo["geo.position"])}"/>
<meta name="ICBM" content="${escAttr(geo.ICBM)}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="${siteName}"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${description}"/>
<meta property="og:url" content="${url}"/>
<meta property="og:locale" content="${ogLocale}"/>
<meta property="og:locale:alternate" content="${altLocale}"/>
<meta property="og:image" content="${image}"/>
<meta property="og:image:secure_url" content="${image}"/>
<meta property="og:image:type" content="${imageType}"/>
<meta property="og:image:width" content="${dims.width}"/>
<meta property="og:image:height" content="${dims.height}"/>
<meta property="og:image:alt" content="${title}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${description}"/>
<meta name="twitter:image" content="${image}"/>
<link rel="canonical" href="${url}"/>
</head>
<body>
<p>${title}</p>
<p>${description}</p>
<p><a href="${url}">${escAttr(siteOrigin())}</a></p>
</body>
</html>`;
}

function escAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

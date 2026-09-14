import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { getCatalogItem } from "@/content/fixweb/catalog";
import { getServiceContent } from "@/lib/fixweb-content";
import {
  SITE_SEO,
  absoluteUrl,
  defaultOgImage,
  localePath,
  siteOrigin,
} from "@/lib/seo";
import { getStaticPageSeo, getStaticPageSeoCopy } from "@/content/seo/pages";
import { getSeoCity } from "@/content/seo/cities";
import { hydrateLocalizedCopy } from "@/lib/localized-copy";
import { toInternalPath } from "@/i18n/pathnames";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseLocalePath(rawPath: string): { locale: string; path: string } {
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

async function resolvePreview(rawPath: string) {
  const parsed = parseLocalePath(rawPath);
  const locale = parsed.locale;
  const path = toInternalPath(locale, parsed.path);
  const isNl = locale === "nl";
  await hydrateLocalizedCopy(locale);

  // Service detail: /diensten/:slug
  const serviceMatch = path.match(/^\/diensten\/([^/]+)\/?$/);
  if (serviceMatch) {
    const slug = serviceMatch[1];
    const content = await getServiceContent(slug, locale);
    const meta = getCatalogItem(slug);
    const title =
      content?.title ||
      (isNl ? meta?.titleNl : meta?.title) ||
      SITE_SEO.name;
    const description =
      content?.subtitle ||
      (isNl ? meta?.summaryNl : meta?.summary) ||
      (isNl ? SITE_SEO.defaultDescription.nl : SITE_SEO.defaultDescription.en);
    const image = defaultOgImage(content?.image || SITE_SEO.defaultOgImage);
    return {
      locale,
      title,
      description,
      url: absoluteUrl(localePath(locale, `/diensten/${slug}`)),
      image,
    };
  }

  // City page: /locaties/:city
  const cityMatch = path.match(/^\/locaties\/([^/]+)\/?$/);
  if (cityMatch) {
    const city = getSeoCity(cityMatch[1]);
    if (city) {
      const name = isNl ? city.nameNl : city.nameEn;
      const country = isNl ? city.countryNameNl : city.countryNameEn;
      return {
        locale,
        title: isNl
          ? `AI, AEO, GEO & SEO in ${name} | TripleZero iT`
          : `AI, AEO, GEO & SEO in ${name} | TripleZero iT`,
        description: isNl
          ? `TripleZero iT helpt bedrijven in ${name} (${country}) met AI-integratie, AEO, GEO, SEO, marketing en maatwerk software.`
          : `TripleZero iT helps businesses in ${name} (${country}) with AI integration, AEO, GEO, SEO, marketing and custom software.`,
        url: absoluteUrl(localePath(locale, `/locaties/${city.slug}`)),
        image: defaultOgImage(SITE_SEO.defaultOgImage),
      };
    }
  }

  const page = getStaticPageSeo(path === "/" ? "/" : path);
  if (page) {
    const copy = getStaticPageSeoCopy(page.path, locale);
    return {
      locale,
      title: copy?.title || (isNl ? page.title.nl : page.title.en),
      description: copy?.description || (isNl ? page.description.nl : page.description.en),
      url: absoluteUrl(localePath(locale, page.path === "/" ? "" : page.path)),
      image: defaultOgImage(page.image || SITE_SEO.defaultOgImage),
    };
  }

  return {
    locale,
    title: SITE_SEO.name,
    description: isNl ? SITE_SEO.defaultDescription.nl : SITE_SEO.defaultDescription.en,
    url: absoluteUrl(localePath(locale, path === "/" ? "" : path)),
    image: defaultOgImage(SITE_SEO.defaultOgImage),
  };
}

/**
 * Tiny HTML shell for WhatsApp / Messenger / Facebook crawlers.
 * WhatsApp only reads the first ~5KB; Next.js puts fonts/scripts before OG tags,
 * so bots otherwise miss og:image/title. This response is <2KB with OG first.
 */
export async function GET(request: NextRequest) {
  const rawPath = request.nextUrl.searchParams.get("u") || "/";
  const preview = await resolvePreview(rawPath);
  const title = escAttr(preview.title);
  const description = escAttr(preview.description);
  const url = escAttr(preview.url);
  const image = escAttr(preview.image);
  const locale = preview.locale === "nl" ? "nl_NL" : "en_US";

  const html = `<!DOCTYPE html>
<html lang="${preview.locale}">
<head>
<meta charset="utf-8"/>
<title>${title}</title>
<meta name="description" content="${description}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="${escAttr(SITE_SEO.name)}"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${description}"/>
<meta property="og:url" content="${url}"/>
<meta property="og:locale" content="${locale}"/>
<meta property="og:image" content="${image}"/>
<meta property="og:image:secure_url" content="${image}"/>
<meta property="og:image:type" content="image/png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="${title}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${description}"/>
<meta name="twitter:image" content="${image}"/>
<link rel="canonical" href="${url}"/>
</head>
<body>
<p>${title}</p>
<p><a href="${url}">${escAttr(siteOrigin())}</a></p>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}

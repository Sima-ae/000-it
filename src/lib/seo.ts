import type { Metadata } from "next";
import type { NewsPost } from "@/lib/news";
import type { SeoCity } from "@/content/seo/cities";
import { getStaticPageSeo, type PageSeo } from "@/content/seo/pages";

export const SITE_SEO = {
  name: "TripleZero iT",
  legalName: "TripleZero iT",
  url:
    process.env.SITEMAP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://000-it.com",
  email: "info@000-it.com",
  defaultOgImage: "/branding/og-default.png",
  defaultDescription: {
    nl: "Ontdek alle AI mogelijkheden voor ondernemers en zzp'ers: AI-integratie, AEO, GEO, SEO, marketing en maatwerk software.",
    en: "Discover all AI possibilities for entrepreneurs and freelancers: AI integration, AEO, GEO, SEO, marketing and custom software.",
  },
  defaultKeywords: {
    nl: [
      "TripleZero iT",
      "AI",
      "AEO",
      "GEO",
      "SEO",
      "AI-integratie",
      "online marketing",
      "Nederland",
      "België",
      "webdesign",
      "automatisering",
    ],
    en: [
      "TripleZero iT",
      "AI",
      "AEO",
      "GEO",
      "SEO",
      "AI integration",
      "online marketing",
      "Netherlands",
      "Belgium",
      "web design",
      "automation",
    ],
  },
  /** Netherlands-focused business (Europe/Amsterdam). */
  geo: {
    region: "NL",
    placename: "Nederland",
    country: "Netherlands",
    countryCode: "NL",
    /** Approximate NL centroid / Randstad for geo meta (no public street address). */
    latitude: 52.1326,
    longitude: 5.2913,
    icbm: "52.1326, 5.2913",
    position: "52.1326;5.2913",
  },
  areaServed: ["NL", "BE"],
  sameAs: [] as string[],
} as const;

export function siteOrigin() {
  return SITE_SEO.url.replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  if (!path) return siteOrigin();
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function localePath(locale: string, path = "") {
  const clean = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `/${locale}${clean}`;
}

export function newsArticlePath(locale: string, id: string) {
  return localePath(locale, `/nieuws/${id}`);
}

export function hreflangAlternates(pathWithoutLocale: string) {
  const path = pathWithoutLocale.startsWith("/")
    ? pathWithoutLocale
    : `/${pathWithoutLocale}`;
  return {
    canonical: absoluteUrl(localePath("nl", path === "/" ? "" : path)),
    languages: {
      nl: absoluteUrl(localePath("nl", path === "/" ? "" : path)),
      en: absoluteUrl(localePath("en", path === "/" ? "" : path)),
      "x-default": absoluteUrl(localePath("nl", path === "/" ? "" : path)),
    },
  };
}

export function geoMetadataOther(city?: Pick<SeoCity, "nameNl" | "nameEn" | "country" | "latitude" | "longitude">, locale = "nl") {
  if (city) {
    const placename = locale === "nl" ? city.nameNl : city.nameEn;
    return {
      "geo.region": city.country,
      "geo.placename": placename,
      "geo.position": `${city.latitude};${city.longitude}`,
      ICBM: `${city.latitude}, ${city.longitude}`,
    };
  }
  return {
    "geo.region": SITE_SEO.geo.region,
    "geo.placename": SITE_SEO.geo.placename,
    "geo.position": SITE_SEO.geo.position,
    ICBM: SITE_SEO.geo.icbm,
  };
}

function truncate(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

export function defaultOgImage(path?: string | null) {
  return absoluteUrl(path || SITE_SEO.defaultOgImage);
}

export type BuildPageMetadataInput = {
  locale: string;
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  city?: SeoCity;
};

export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const isNl = input.locale === "nl";
  const path = input.path === "/" ? "" : input.path.startsWith("/") ? input.path : `/${input.path}`;
  const url = absoluteUrl(localePath(input.locale, path));
  const langs = hreflangAlternates(path || "/");
  const image = defaultOgImage(input.image);
  const imageAlt = input.imageAlt || input.title;
  const keywords =
    input.keywords?.length
      ? input.keywords
      : isNl
        ? [...SITE_SEO.defaultKeywords.nl]
        : [...SITE_SEO.defaultKeywords.en];
  const ogLocale = isNl ? "nl_NL" : "en_US";
  const altLocale = isNl ? "en_US" : "nl_NL";
  const description = truncate(input.description);

  return {
    title: input.title,
    description,
    keywords,
    authors: [{ name: SITE_SEO.name, url: siteOrigin() }],
    creator: SITE_SEO.name,
    publisher: SITE_SEO.name,
    robots: input.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    alternates: {
      canonical: absoluteUrl(localePath(input.locale, path)),
      languages: langs.languages,
    },
    openGraph: {
      type: input.type || "website",
      url,
      title: input.title,
      description,
      siteName: SITE_SEO.name,
      locale: ogLocale,
      alternateLocale: [altLocale],
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: [image],
    },
    other: geoMetadataOther(input.city, input.locale),
  };
}

export function buildStaticPageMetadata(locale: string, path: string, overrides?: Partial<BuildPageMetadataInput>): Metadata {
  const page = getStaticPageSeo(path);
  const isNl = locale === "nl";
  if (!page) {
    return buildPageMetadata({
      locale,
      path,
      title: SITE_SEO.name,
      description: isNl ? SITE_SEO.defaultDescription.nl : SITE_SEO.defaultDescription.en,
      ...overrides,
    });
  }
  return buildPageMetadata({
    locale,
    path: page.path,
    title: isNl ? page.title.nl : page.title.en,
    description: isNl ? page.description.nl : page.description.en,
    keywords: isNl ? page.keywords.nl : page.keywords.en,
    image: page.image,
    type: page.ogType,
    ...overrides,
  });
}

export function buildServiceMetadata(opts: {
  locale: string;
  slug: string;
  title: string;
  description: string;
  image?: string | null;
}): Metadata {
  const isNl = opts.locale === "nl";
  const path = `/diensten/${opts.slug}`;
  const keywords = isNl
    ? [
        opts.title,
        "TripleZero iT",
        "AEO",
        "GEO",
        "SEO",
        "AI",
        "Nederland",
        "België",
        "diensten",
        opts.slug.replace(/-/g, " "),
      ]
    : [
        opts.title,
        "TripleZero iT",
        "AEO",
        "GEO",
        "SEO",
        "AI",
        "Netherlands",
        "Belgium",
        "services",
        opts.slug.replace(/-/g, " "),
      ];

  return buildPageMetadata({
    locale: opts.locale,
    path,
    title: opts.title,
    description: opts.description || (isNl ? SITE_SEO.defaultDescription.nl : SITE_SEO.defaultDescription.en),
    keywords,
    image: opts.image,
    imageAlt: opts.title,
  });
}

export function buildCityMetadata(city: SeoCity, locale: string): Metadata {
  const isNl = locale === "nl";
  const name = isNl ? city.nameNl : city.nameEn;
  const country = isNl ? city.countryNameNl : city.countryNameEn;
  const title = isNl
    ? `AI, AEO, GEO & SEO in ${name} | TripleZero iT`
    : `AI, AEO, GEO & SEO in ${name} | TripleZero iT`;
  const description = isNl
    ? `TripleZero iT helpt bedrijven in ${name} (${country}) met AI-integratie, AEO, GEO, SEO, marketing en maatwerk software. Vraag een gratis AI-scan aan.`
    : `TripleZero iT helps businesses in ${name} (${country}) with AI integration, AEO, GEO, SEO, marketing and custom software. Request a free AI scan.`;
  const keywords = isNl
    ? [
        `AI ${name}`,
        `SEO ${name}`,
        `AEO ${name}`,
        `GEO ${name}`,
        `webdesign ${name}`,
        `marketing ${name}`,
        name,
        city.regionNl,
        country,
        "TripleZero iT",
      ]
    : [
        `AI ${name}`,
        `SEO ${name}`,
        `AEO ${name}`,
        `GEO ${name}`,
        `web design ${name}`,
        `marketing ${name}`,
        name,
        city.regionEn,
        country,
        "TripleZero iT",
      ];

  return buildPageMetadata({
    locale,
    path: `/locaties/${city.slug}`,
    title,
    description,
    keywords,
    city,
    image: SITE_SEO.defaultOgImage,
    imageAlt: title,
  });
}

export function pageSeoToSitemapMeta(page: PageSeo) {
  return {
    path: page.path,
    lastModified: new Date(page.lastmod),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  };
}

export function buildNewsKeywords(post: NewsPost, locale: string) {
  const base =
    locale === "nl"
      ? ["nieuws", "AI nieuws", "kunstmatige intelligentie", "TripleZero iT", "Nederland", "SEO", "AEO", "GEO"]
      : ["news", "AI news", "artificial intelligence", "TripleZero iT", "Netherlands", "SEO", "AEO", "GEO"];
  return Array.from(
    new Set(
      [...base, post.industry || "", ...(post.tags || [])]
        .map((k) => k.trim())
        .filter(Boolean),
    ),
  );
}

export function buildNewsArticleMetadata(
  post: NewsPost,
  locale: string,
): Metadata {
  const title = post.title;
  const description = truncate(post.excerpt || post.description || title);
  const keywords = buildNewsKeywords(post, locale);
  const urlPath = newsArticlePath(locale, post.id);
  const url = absoluteUrl(urlPath);
  const image = post.coverImage ? absoluteUrl(post.coverImage) : undefined;
  const ogLocale = locale === "nl" ? "nl_NL" : "en_US";
  const altLocale = locale === "nl" ? "en_US" : "nl_NL";
  const published = post.date || undefined;

  return {
    title,
    description,
    keywords,
    authors: [{ name: post.author || SITE_SEO.name }],
    creator: post.author || SITE_SEO.name,
    publisher: SITE_SEO.name,
    category: post.industry || (locale === "nl" ? "Nieuws" : "News"),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: url,
      languages: {
        nl: absoluteUrl(newsArticlePath("nl", post.id)),
        en: absoluteUrl(newsArticlePath("en", post.id)),
        "x-default": absoluteUrl(newsArticlePath("nl", post.id)),
      },
    },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: SITE_SEO.name,
      locale: ogLocale,
      alternateLocale: [altLocale],
      publishedTime: published,
      modifiedTime: published,
      authors: [post.author || SITE_SEO.name],
      tags: keywords,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
    other: {
      ...geoMetadataOther(),
      "article:published_time": published || "",
      "article:author": post.author || SITE_SEO.name,
      "article:section": post.industry || "",
      "article:tag": keywords.join(", "),
    },
  };
}

export function buildNewsIndexMetadata(locale: string, page = 1): Metadata {
  const isNl = locale === "nl";
  const title = isNl ? "Nieuws" : "News";
  const description = isNl
    ? "AI- en tech-nieuws van TripleZero iT: analyses, productupdates en praktische inzichten voor bedrijven in Nederland."
    : "AI and tech news from TripleZero iT: analysis, product updates and practical insights for businesses.";
  const path = page > 1 ? `/nieuws?page=${page}` : "/nieuws";
  const url = absoluteUrl(localePath(locale, path.split("?")[0]));
  const keywords = isNl
    ? ["nieuws", "AI nieuws", "tech nieuws", "TripleZero iT", "Nederland", "kunstmatige intelligentie"]
    : ["news", "AI news", "tech news", "TripleZero iT", "Netherlands", "artificial intelligence"];

  return {
    title: page > 1 ? `${title} · ${isNl ? "Pagina" : "Page"} ${page}` : title,
    description,
    keywords,
    robots: { index: true, follow: true },
    alternates: {
      canonical: page > 1 ? absoluteUrl(localePath(locale, `/nieuws?page=${page}`)) : url,
      languages: {
        nl: absoluteUrl(localePath("nl", "/nieuws")),
        en: absoluteUrl(localePath("en", "/nieuws")),
        "x-default": absoluteUrl(localePath("nl", "/nieuws")),
      },
    },
    openGraph: {
      type: "website",
      url,
      title: `${title} · ${SITE_SEO.name}`,
      description,
      siteName: SITE_SEO.name,
      locale: isNl ? "nl_NL" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_SEO.name}`,
      description,
    },
    other: geoMetadataOther(),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    name: SITE_SEO.name,
    legalName: SITE_SEO.legalName,
    url: siteOrigin(),
    email: SITE_SEO.email,
    logo: absoluteUrl(SITE_SEO.defaultOgImage),
    image: absoluteUrl(SITE_SEO.defaultOgImage),
    description: SITE_SEO.defaultDescription.en,
    areaServed: SITE_SEO.areaServed.map((code) => ({
      "@type": "Country",
      name: code === "NL" ? "Netherlands" : code === "BE" ? "Belgium" : code,
    })),
    address: {
      "@type": "PostalAddress",
      addressCountry: SITE_SEO.geo.countryCode,
      addressRegion: SITE_SEO.geo.placename,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE_SEO.geo.latitude,
      longitude: SITE_SEO.geo.longitude,
    },
    knowsAbout: ["Artificial Intelligence", "AEO", "GEO", "SEO", "Digital Marketing", "Web Design"],
    sameAs: SITE_SEO.sameAs,
  };
}

export function cityServiceJsonLd(city: SeoCity, locale: string) {
  const isNl = locale === "nl";
  const name = isNl ? city.nameNl : city.nameEn;
  const url = absoluteUrl(localePath(locale, `/locaties/${city.slug}`));

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `${SITE_SEO.name} — ${name}`,
    url,
    image: absoluteUrl(SITE_SEO.defaultOgImage),
    email: SITE_SEO.email,
    areaServed: {
      "@type": "City",
      name,
      containedInPlace: {
        "@type": "Country",
        name: isNl ? city.countryNameNl : city.countryNameEn,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: city.latitude,
        longitude: city.longitude,
      },
    },
    provider: {
      "@type": "Organization",
      name: SITE_SEO.name,
      url: siteOrigin(),
    },
    serviceType: ["AI integration", "AEO", "GEO", "SEO", "Digital marketing"],
  };
}

export function newsArticleJsonLd(post: NewsPost, locale: string) {
  const url = absoluteUrl(newsArticlePath(locale, post.id));
  const image = post.coverImage ? absoluteUrl(post.coverImage) : undefined;
  const keywords = buildNewsKeywords(post, locale);

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: post.title,
    description: truncate(post.excerpt || post.description || post.title),
    image: image ? [image] : undefined,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author || SITE_SEO.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_SEO.name,
      url: siteOrigin(),
    },
    articleSection: post.industry || (locale === "nl" ? "Nieuws" : "News"),
    keywords: keywords.join(", "),
    inLanguage: locale === "nl" ? "nl-NL" : "en-US",
    isAccessibleForFree: true,
    about: {
      "@type": "Thing",
      name: post.industry || "Artificial Intelligence",
    },
    contentLocation: {
      "@type": "Place",
      name: SITE_SEO.geo.placename,
      address: {
        "@type": "PostalAddress",
        addressCountry: SITE_SEO.geo.countryCode,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: SITE_SEO.geo.latitude,
        longitude: SITE_SEO.geo.longitude,
      },
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

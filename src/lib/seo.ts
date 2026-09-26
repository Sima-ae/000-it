import type { Metadata } from "next";
import { publicNewsTags, type NewsPost } from "@/lib/news";
import type { SeoCity } from "@/content/seo/cities";
import { getStaticPageSeo, getStaticPageSeoCopy, type PageSeo } from "@/content/seo/pages";
import { enabledLanguages } from "@/i18n/languages";
import { localizedHref } from "@/i18n/pathnames";
import { hydrateLocalizedCopy } from "@/lib/localized-copy";

export const SITE_SEO = {
  name: "TripleZero iT",
  legalName: "TripleZero iT",
  url:
    process.env.SITEMAP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://000-it.com",
  email: "info@000-it.com",
  /** Prefer a real existing asset — used for OG/Twitter when no page image is set. */
  defaultOgImage: "/branding/banner.png",
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
      "Azië",
      "Europa",
      "VAE",
      "USA",
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
      "Asia",
      "Europe",
      "UAE",
      "USA",
      "Netherlands",
      "Belgium",
      "web design",
      "automation",
    ],
  },
  /** HQ / primary geo meta (NL). Service coverage is Asia, Europe, UAE and USA. */
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
  areaServed: [
    { type: "Continent", name: "Asia" },
    { type: "Continent", name: "Europe" },
    { type: "Country", name: "United Arab Emirates", code: "AE" },
    { type: "Country", name: "United States", code: "US" },
    { type: "Country", name: "Netherlands", code: "NL" },
    { type: "Country", name: "Belgium", code: "BE" },
  ],
  sameAs: [] as string[],
} as const;

export function siteOrigin() {
  // Never leak the internal Next listen port (e.g. :3066) into canonical/OG URLs.
  let url = SITE_SEO.url.replace(/\/$/, "").replace(/:3066\b/g, "");
  // Production safety: never emit localhost/loopback as the public site origin.
  if (
    process.env.NODE_ENV === "production" &&
    /localhost|127\.0\.0\.1/i.test(url)
  ) {
    url = "https://000-it.com";
  }
  return url;
}

/**
 * Origin used in generated sitemap XML / IndexNow.
 * Defaults to the live host so local `.env` (localhost) cannot poison public sitemaps.
 * Override with SITEMAP_BASE_URL when needed.
 */
export function sitemapPublicOrigin() {
  const explicit = process.env.SITEMAP_BASE_URL?.replace(/\/$/, "");
  if (explicit && !/localhost|127\.0\.0\.1/i.test(explicit)) {
    return explicit.replace(/:3066\b/g, "");
  }
  const fromSite = siteOrigin();
  if (/localhost|127\.0\.0\.1/i.test(fromSite)) {
    return "https://000-it.com";
  }
  return fromSite;
}

export function absoluteUrl(path: string) {
  if (!path) return siteOrigin();
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Absolute URL forced to the public sitemap host (never localhost). */
export function sitemapAbsoluteUrl(path: string) {
  const origin = sitemapPublicOrigin();
  if (!path) return origin;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const u = new URL(path);
      return `${origin}${u.pathname}${u.search}`;
    } catch {
      return path;
    }
  }
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function localePath(locale: string, path = "") {
  const clean = path.startsWith("/") ? path : path ? `/${path}` : "";
  if (!clean || clean === "/") return `/${locale}`;
  return localizedHref(locale, clean);
}

export function newsArticlePath(locale: string, id: string) {
  return localizedHref(locale, `/nieuws/${id}`);
}

export function hreflangAlternates(pathWithoutLocale: string) {
  const path = pathWithoutLocale.startsWith("/")
    ? pathWithoutLocale
    : `/${pathWithoutLocale}`;
  const languages: Record<string, string> = {
    "x-default": absoluteUrl(localizedHref("nl", path === "/" ? "/" : path)),
  };
  for (const lang of enabledLanguages()) {
    languages[lang.code] = absoluteUrl(
      localizedHref(lang.code, path === "/" ? "/" : path),
    );
  }
  return {
    canonical: absoluteUrl(localizedHref("nl", path === "/" ? "/" : path)),
    languages,
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
  const placename =
    locale === "nl"
      ? SITE_SEO.geo.placename
      : SITE_SEO.geo.country;
  return {
    "geo.region": SITE_SEO.geo.region,
    "geo.placename": placename,
    "geo.position": SITE_SEO.geo.position,
    ICBM: SITE_SEO.geo.icbm,
  };
}

function truncate(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

/** Open Graph locale codes for enabled site languages. */
const OG_LOCALE_BY_CODE: Record<string, string> = {
  nl: "nl_NL",
  en: "en_US",
  fr: "fr_FR",
  de: "de_DE",
  es: "es_ES",
  pt: "pt_PT",
  it: "it_IT",
  el: "el_GR",
  pl: "pl_PL",
  cs: "cs_CZ",
  sk: "sk_SK",
  hu: "hu_HU",
  ro: "ro_RO",
  bg: "bg_BG",
  hr: "hr_HR",
  sr: "sr_RS",
  bs: "bs_BA",
  cnr: "sr_ME",
  sq: "sq_AL",
  mk: "mk_MK",
  lt: "lt_LT",
  da: "da_DK",
  sv: "sv_SE",
  no: "nb_NO",
  fi: "fi_FI",
  uk: "uk_UA",
  ru: "ru_RU",
  tr: "tr_TR",
  he: "he_IL",
  ar: "ar_SA",
  ka: "ka_GE",
  hy: "hy_AM",
  az: "az_AZ",
  zh: "zh_CN",
  ja: "ja_JP",
};

export function openGraphLocale(locale: string) {
  return OG_LOCALE_BY_CODE[locale] || (locale === "nl" ? "nl_NL" : "en_US");
}

export function htmlLangTag(locale: string) {
  const og = openGraphLocale(locale);
  return og.replace("_", "-");
}

function coreKeywordsForLocale(locale: string): string[] {
  if (locale === "nl") return [...SITE_SEO.defaultKeywords.nl];
  return [...SITE_SEO.defaultKeywords.en];
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
  const path = input.path === "/" ? "" : input.path.startsWith("/") ? input.path : `/${input.path}`;
  const url = absoluteUrl(localePath(input.locale, path));
  const langs = hreflangAlternates(path || "/");
  const image = defaultOgImage(input.image);
  const imageAlt = input.imageAlt || input.title;
  const keywords =
    input.keywords?.length
      ? input.keywords
      : coreKeywordsForLocale(input.locale);
  const ogLocale = openGraphLocale(input.locale);
  const altLocale = openGraphLocale(input.locale === "nl" ? "en" : "nl");
  const description = truncate(input.description);
  const imageType = image.toLowerCase().endsWith(".jpg") || image.toLowerCase().endsWith(".jpeg")
    ? "image/jpeg"
    : image.toLowerCase().endsWith(".webp")
      ? "image/webp"
      : "image/png";

  return {
    title: input.title,
    description,
    keywords,
    authors: [{ name: SITE_SEO.name, url: siteOrigin() }],
    creator: SITE_SEO.name,
    publisher: SITE_SEO.name,
    robots: input.noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
            "max-image-preview": "none",
            "max-snippet": 0,
            "max-video-preview": 0,
          },
        }
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
          secureUrl: image,
          type: imageType,
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

export async function buildStaticPageMetadata(locale: string, path: string, overrides?: Partial<BuildPageMetadataInput>): Promise<Metadata> {
  await hydrateLocalizedCopy(locale);
  const page = getStaticPageSeo(path);
  const copy = getStaticPageSeoCopy(path, locale);
  if (!page || !copy) {
    const fallback = locale === "nl" ? SITE_SEO.defaultDescription.nl : SITE_SEO.defaultDescription.en;
    return buildPageMetadata({
      locale,
      path,
      title: SITE_SEO.name,
      description: fallback,
      ...overrides,
    });
  }
  return buildPageMetadata({
    locale,
    path: page.path,
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
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
        "Azië",
        "Europa",
        "VAE",
        "USA",
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
        "Asia",
        "Europe",
        "UAE",
        "USA",
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
      ? [
          "nieuws",
          "AI nieuws",
          "kunstmatige intelligentie",
          "TripleZero iT",
          "Azië",
          "Europa",
          "VAE",
          "USA",
          "Nederland",
          "SEO",
          "AEO",
          "GEO",
        ]
      : [
          "news",
          "AI news",
          "artificial intelligence",
          "TripleZero iT",
          "Asia",
          "Europe",
          "UAE",
          "USA",
          "Netherlands",
          "SEO",
          "AEO",
          "GEO",
        ];
  return Array.from(
    new Set(
      [...base, post.industry || "", ...publicNewsTags(post.tags)]
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
  const image = post.coverImage ? absoluteUrl(post.coverImage) : defaultOgImage();
  const ogLocale = openGraphLocale(locale);
  const altLocale = openGraphLocale(locale === "nl" ? "en" : "nl");
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
      languages: hreflangAlternates(`/nieuws/${post.id}`).languages,
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
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    other: {
      ...geoMetadataOther(undefined, locale),
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
    ? "AI- en tech-nieuws van TripleZero iT: analyses, productupdates en praktische inzichten."
    : "AI and tech news from TripleZero iT: analysis, product updates and practical insights.";
  const path = page > 1 ? `/nieuws?page=${page}` : "/nieuws";
  const url = absoluteUrl(localePath(locale, path.split("?")[0]));
  const keywords = [
    ...coreKeywordsForLocale(locale),
    ...(isNl
      ? ["nieuws", "AI nieuws", "tech nieuws", "kunstmatige intelligentie"]
      : ["news", "AI news", "tech news", "artificial intelligence"]),
  ];
  const langs = hreflangAlternates("/nieuws");
  const image = defaultOgImage();

  return {
    title: page > 1 ? `${title} · ${isNl ? "Pagina" : "Page"} ${page}` : title,
    description,
    keywords,
    robots: { index: true, follow: true },
    alternates: {
      canonical:
        page > 1
          ? absoluteUrl(`${localePath(locale, "/nieuws")}?page=${page}`)
          : url,
      languages: langs.languages,
    },
    openGraph: {
      type: "website",
      url,
      title: `${title} · ${SITE_SEO.name}`,
      description,
      siteName: SITE_SEO.name,
      locale: openGraphLocale(locale),
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${title} · ${SITE_SEO.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_SEO.name}`,
      description,
      images: [image],
    },
    other: geoMetadataOther(undefined, locale),
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
    areaServed: SITE_SEO.areaServed.map((place) => ({
      "@type": place.type,
      name: place.name,
      ...("code" in place && place.code
        ? { identifier: place.code }
        : {}),
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
  const image = post.coverImage
    ? absoluteUrl(post.coverImage)
    : defaultOgImage();
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
    image: [image],
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
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/branding/WEBLOGO-TripleZero-iT.png"),
      },
    },
    articleSection: post.industry || (locale === "nl" ? "Nieuws" : "News"),
    keywords: keywords.join(", "),
    inLanguage: htmlLangTag(locale),
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

export function buildKennisbankKeywords(opts: {
  locale: string;
  title: string;
  categoryName?: string;
  categorySlug?: string;
  extra?: string[];
}) {
  const isNl = opts.locale === "nl";
  const base = [
    ...coreKeywordsForLocale(opts.locale),
    opts.title,
    opts.categoryName || "",
    opts.categorySlug?.replace(/-/g, " ") || "",
    ...(isNl
      ? ["kennisbank", "handleiding", "uitleg", "hosting", "WordPress"]
      : [
          "knowledge base",
          "guide",
          "how to",
          "hosting",
          "WordPress",
        ]),
    ...(opts.extra || []),
  ];
  return Array.from(
    new Set(base.map((k) => k.trim()).filter(Boolean)),
  );
}

export function buildKennisbankCategoryMetadata(opts: {
  locale: string;
  categorySlug: string;
  name: string;
  description: string;
  image?: string | null;
  titleSuffix: string;
}): Metadata {
  const title = `${opts.name} — ${opts.titleSuffix} | ${SITE_SEO.name}`;
  const description = truncate(
    opts.description ||
      (opts.locale === "nl"
        ? `${opts.name} in de TripleZero iT kennisbank: stapsgewijze uitleg over AEO, GEO, SEO, hosting en AI.`
        : `${opts.name} in the TripleZero iT knowledge base: step-by-step guidance on AEO, GEO, SEO, hosting and AI.`),
  );
  return buildPageMetadata({
    locale: opts.locale,
    path: `/kennisbank/${opts.categorySlug}`,
    title,
    description,
    keywords: buildKennisbankKeywords({
      locale: opts.locale,
      title: opts.name,
      categoryName: opts.name,
      categorySlug: opts.categorySlug,
    }),
    image: opts.image || SITE_SEO.defaultOgImage,
    imageAlt: opts.name,
    type: "website",
  });
}

export function buildKennisbankArticleMetadata(opts: {
  locale: string;
  categorySlug: string;
  articleSlug: string;
  title: string;
  description: string;
  seoTitle?: string | null;
  image?: string | null;
  categoryName?: string;
  tags?: string[];
  updatedAt?: string | Date | null;
}): Metadata {
  const title =
    opts.seoTitle?.trim() ||
    `${opts.title} | ${SITE_SEO.name}`;
  const description = truncate(opts.description || opts.title);
  const meta = buildPageMetadata({
    locale: opts.locale,
    path: `/kennisbank/${opts.categorySlug}/${opts.articleSlug}`,
    title,
    description,
    keywords: buildKennisbankKeywords({
      locale: opts.locale,
      title: opts.title,
      categoryName: opts.categoryName,
      categorySlug: opts.categorySlug,
      extra: opts.tags,
    }),
    image: opts.image || SITE_SEO.defaultOgImage,
    imageAlt: opts.title,
    type: "article",
  });
  const published =
    opts.updatedAt instanceof Date
      ? opts.updatedAt.toISOString()
      : opts.updatedAt || undefined;
  const keywords = buildKennisbankKeywords({
    locale: opts.locale,
    title: opts.title,
    categoryName: opts.categoryName,
    categorySlug: opts.categorySlug,
    extra: opts.tags,
  });
  const other: Record<string, string> = {
    ...(meta.other as Record<string, string> | undefined),
    "article:section": opts.categoryName || "",
    "article:tag": keywords.join(", "),
  };
  if (published) {
    other["article:published_time"] = published;
    other["article:modified_time"] = published;
  }
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: published,
      modifiedTime: published,
      tags: keywords,
    },
    other,
  };
}

export function kennisbankArticleJsonLd(opts: {
  locale: string;
  categorySlug: string;
  articleSlug: string;
  title: string;
  description: string;
  categoryName?: string;
  image?: string | null;
  updatedAt?: string | Date | null;
}) {
  const path = `/kennisbank/${opts.categorySlug}/${opts.articleSlug}`;
  const url = absoluteUrl(localePath(opts.locale, path));
  const image = defaultOgImage(opts.image);
  const modified =
    opts.updatedAt instanceof Date
      ? opts.updatedAt.toISOString()
      : opts.updatedAt || undefined;
  const keywords = buildKennisbankKeywords({
    locale: opts.locale,
    title: opts.title,
    categoryName: opts.categoryName,
    categorySlug: opts.categorySlug,
  });

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: opts.title,
    description: truncate(opts.description || opts.title),
    image: [image],
    datePublished: modified,
    dateModified: modified,
    author: {
      "@type": "Organization",
      name: SITE_SEO.name,
      url: siteOrigin(),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_SEO.name,
      url: siteOrigin(),
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/branding/WEBLOGO-TripleZero-iT.png"),
      },
    },
    articleSection: opts.categoryName || (opts.locale === "nl" ? "Kennisbank" : "Knowledge base"),
    keywords: keywords.join(", "),
    inLanguage: htmlLangTag(opts.locale),
    isAccessibleForFree: true,
    about: {
      "@type": "Thing",
      name: opts.categoryName || opts.title,
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

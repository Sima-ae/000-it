import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@/lib/brand/install-public-name";
import { GoogleTag } from "@/components/analytics/GoogleTag";
import { RTL_LOCALES } from "@/i18n/languages";
import { SITE_SEO, absoluteUrl, geoMetadataOther, siteOrigin } from "@/lib/seo";

const display = localFont({
  src: "../fonts/syne-latin-wght-normal.woff2",
  variable: "--font-display",
  weight: "500 800",
  // Keep <head> small: WhatsApp only reads ~5KB and otherwise misses OG tags.
  preload: false,
});

const body = localFont({
  src: "../fonts/figtree-latin-wght-normal.woff2",
  variable: "--font-body",
  weight: "400 700",
  preload: false,
});

const geistMono = localFont({
  src: "../fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: SITE_SEO.name,
    template: `%s · ${SITE_SEO.name}`,
  },
  description: SITE_SEO.defaultDescription.nl,
  applicationName: SITE_SEO.name,
  authors: [{ name: SITE_SEO.name, url: siteOrigin() }],
  creator: SITE_SEO.name,
  publisher: SITE_SEO.name,
  keywords: [...SITE_SEO.defaultKeywords.nl],
  // Brand favicon for all browsers / devices — never the Next.js / Vercel triangle.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/branding/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/branding/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/branding/favicon.png", sizes: "any", type: "image/png" },
      { url: "/branding/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/branding/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/branding/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/branding/favicon.png", color: "#000000" },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: SITE_SEO.name,
    statusBarStyle: "black-translucent",
  },
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
  openGraph: {
    type: "website",
    siteName: SITE_SEO.name,
    title: SITE_SEO.name,
    description: SITE_SEO.defaultDescription.nl,
    url: siteOrigin(),
    locale: "nl_NL",
    alternateLocale: ["en_US"],
    images: [
      {
        url: absoluteUrl(SITE_SEO.defaultOgImage),
        width: SITE_SEO.defaultOgImageWidth,
        height: SITE_SEO.defaultOgImageHeight,
        alt: SITE_SEO.name,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_SEO.name,
    description: SITE_SEO.defaultDescription.nl,
    images: [absoluteUrl(SITE_SEO.defaultOgImage)],
  },
  other: {
    ...geoMetadataOther(),
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#000000",
  },
  verification: {
    other: {
      "impact-site-verification": "2231b5f9-68a2-4efc-bf05-7248ba199077",
    },
  },
};

const IMPACT_VERIFICATION_CODE = "2231b5f9-68a2-4efc-bf05-7248ba199077";

/**
 * Sync <html lang/dir/data-brand> before paint from URL + hostname.
 * Root layout cannot take [locale] params (shared across locales / SSG),
 * and headers() would force the whole tree dynamic — keep this tiny + LocaleHtmlLang.
 */
const LOCALE_HTML_BOOTSTRAP = `(function(){try{var h=(location.hostname||"").toLowerCase();var brand=/extrahosting/.test(h)?"extrahosting":"triplezero";document.documentElement.dataset.brand=brand;var m=location.pathname.match(/^\\/([a-z]{2,3})(?=\\/|$)/i);var loc=m?m[1].toLowerCase():(h==="extrahosting.nl"||h==="www.extrahosting.nl"?"nl":brand==="extrahosting"?"en":"nl");var rtl={${[...RTL_LOCALES].map((l) => `${l}:1`).join(",")}};document.documentElement.lang=loc;document.documentElement.dir=rtl[loc]?"rtl":"ltr";}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      data-brand="triplezero"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOCALE_HTML_BOOTSTRAP }} />
        {/* Impact.com — exact `value` attribute from their verification instructions */}
        <meta
          name="impact-site-verification"
          content={IMPACT_VERIFICATION_CODE}
          {...{ value: IMPACT_VERIFICATION_CODE }}
        />
      </head>
      <body className={`${display.variable} ${body.variable} ${geistMono.variable} antialiased`}>
        <GoogleTag />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { GoogleTag } from "@/components/analytics/GoogleTag";
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
        width: 1200,
        height: 630,
        alt: SITE_SEO.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_SEO.name,
    description: SITE_SEO.defaultDescription.nl,
    images: [absoluteUrl(SITE_SEO.defaultOgImage)],
  },
  other: geoMetadataOther(),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${display.variable} ${body.variable} ${geistMono.variable} antialiased`}>
        <GoogleTag />
        {children}
      </body>
    </html>
  );
}

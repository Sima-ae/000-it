import type { Metadata } from "next";
import { Figtree, Geist_Mono, Syne } from "next/font/google";
import "./globals.css";
import { SITE_SEO, absoluteUrl, geoMetadataOther, siteOrigin } from "@/lib/seo";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        {children}
      </body>
    </html>
  );
}

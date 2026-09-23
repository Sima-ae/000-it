import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  // Keep soft-navigated pages in the client router cache longer (Next 15)
  experimental: {
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "image.pollinations.ai",
      },
      {
        protocol: "https",
        hostname: "000-it.com",
      },
      {
        protocol: "https",
        hostname: "www.000-it.com",
      },
    ],
  },
  async redirects() {
    const graphicDesignRedirects = [
      ["digital-design", "grafisch-design"],
      ["design-numerique", "design-graphique"],
      ["digitales-design", "grafisches-design"],
      ["diseno-digital", "diseno-grafico"],
      ["design-digital", "design-grafico"],
      ["design-digitale", "design-grafico"],
      ["psifiako-design", "grafikos-schediasmos"],
      ["design-cyfrowy", "projektowanie-graficzne"],
      ["digitalni-design", "graficky-design"],
      ["digitalny-dizajn", "graficky-dizajn"],
      ["digitalis-tervezes", "grafikai-tervezes"],
      ["digitalen-dizajn", "grafichen-dizajn"],
      ["digitalni-dizajn", "graficki-dizajn"],
      ["dizajn-dixhital", "dizajn-grafik"],
      ["skaitmeninis-dizainas", "grafikos-dizainas"],
      ["digitaalinen-suunnittelu", "graafinen-suunnittelu"],
      ["cyfrovyj-dyzajn", "grafichnyj-dyzajn"],
      ["cifrovoj-dizajn", "graficheskij-dizajn"],
      ["dijital-tasarim", "grafik-tasarim"],
      ["itzuv-digitali", "itzuv-grafi"],
      ["tasmim-raqami", "tasmim-grafiki"],
      ["cipruli-dizaini", "grapikuli-dizaini"],
      ["tvayin-dizayn", "grafikakan-dizayn"],
      ["reqemsal-dizayn", "qrafik-dizayn"],
      ["shuzi-sheji", "pingmian-sheji"],
      ["dejitaru-dezain", "gurafikku-dezain"],
    ] as const;

    return [
      {
        source: "/:locale/diensten/ai-search-visibility",
        destination: "/:locale/diensten/aeo-optimization",
        permanent: true,
      },
      {
        source: "/:locale/diensten/basic-support",
        destination: "/:locale/diensten/pro-support",
        permanent: true,
      },
      {
        source: "/:locale/diensten/standard-support",
        destination: "/:locale/diensten/double-support",
        permanent: true,
      },
      {
        source: "/:locale/shop/basic-support",
        destination: "/:locale/shop/pro-support",
        permanent: true,
      },
      {
        source: "/:locale/shop/standard-support",
        destination: "/:locale/shop/double-support",
        permanent: true,
      },
      {
        source: "/:locale/shop/basic-support-yearly",
        destination: "/:locale/shop/pro-support-yearly",
        permanent: true,
      },
      {
        source: "/:locale/shop/standard-support-yearly",
        destination: "/:locale/shop/double-support-yearly",
        permanent: true,
      },
      ...graphicDesignRedirects.map(([from, to]) => ({
        source: `/:locale/${from}`,
        destination: `/:locale/${to}`,
        permanent: true,
      })),
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          { key: "X-Robots-Tag", value: "noai, noimageai" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noai, noimageai" },
        ],
      },
      {
        // Help WhatsApp/Messenger cache the OG asset cleanly
        source: "/branding/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

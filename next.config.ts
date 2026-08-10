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
    return [
      {
        source: "/:locale/diensten/ai-search-visibility",
        destination: "/:locale/diensten/aeo-optimization",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);

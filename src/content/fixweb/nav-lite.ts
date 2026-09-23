import { localizedHref } from "@/i18n/pathnames";
/** Lightweight footer/nav links — avoids pulling full catalog into every page shell. */
export const footerServiceLinks = [
  { slug: "ai-scan", title: "AI scan", titleNl: "AI-scan", href: undefined as string | undefined },
  {
    slug: "webdesign-support",
    title: "Website Support",
    titleNl: "Website support",
    href: undefined as string | undefined,
  },
  {
    slug: "grafisch-design",
    title: "Design",
    titleNl: "Design",
    href: "/design",
  },
  {
    slug: "wordpress-support",
    title: "WordPress Support",
    titleNl: "WordPress support",
    href: undefined as string | undefined,
  },
  {
    slug: "seo-optimization",
    title: "SEO Optimization",
    titleNl: "SEO optimalisatie",
    href: undefined as string | undefined,
  },
  {
    slug: "web-hosting",
    title: "Web Hosting",
    titleNl: "Web hosting",
    href: undefined as string | undefined,
  },
] as const;

export function footerServiceHref(locale: string, item: (typeof footerServiceLinks)[number]) {
  if (item.href) return localizedHref(locale, item.href);
  return localizedHref(locale, `/diensten/${item.slug}`);
}

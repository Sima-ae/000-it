export type ServiceNavItem = {
  slug: string;
  title: string;
  titleNl: string;
  kind: "page" | "product";
  group: "wordpress" | "marketing" | "hosting" | "ai";
  summary?: string;
  summaryNl?: string;
};

/** Service/page inventory mapped into TripleZero routes under /diensten/[slug] */
export const serviceCatalog: ServiceNavItem[] = [
  // WordPress & Support (pages + products)
  {
    slug: "wordpress-support",
    title: "WordPress Support",
    titleNl: "WordPress Support",
    kind: "page",
    group: "wordpress",
    summary: "Expert WordPress support to keep your site running smoothly.",
    summaryNl: "Expert WordPress support zodat je site soepel blijft draaien.",
  },
  {
    slug: "wordpress-error-fix",
    title: "WordPress Error Fix",
    titleNl: "WordPress Bugs / Error Fix",
    kind: "product",
    group: "wordpress",
  },
  {
    slug: "wordpress-malware-removal",
    title: "WordPress Malware Removal",
    titleNl: "Malware verwijderen & beveiligen",
    kind: "product",
    group: "wordpress",
  },
  {
    slug: "wordpress-security",
    title: "WordPress Security, Firewall & SSL",
    titleNl: "WordPress Security, Firewall & SSL",
    kind: "product",
    group: "wordpress",
  },
  {
    slug: "wordpress-speed-optimization",
    title: "WordPress Speed Optimization",
    titleNl: "Performance & Speed Optimization",
    kind: "product",
    group: "wordpress",
  },
  {
    slug: "wordpress-backup-hosting-migration",
    title: "WordPress Backup & Hosting Migration",
    titleNl: "Backup / Migrate WordPress",
    kind: "product",
    group: "wordpress",
  },
  {
    slug: "wordpress-plugin-theme-installation",
    title: "WordPress Plugin / Theme Installation",
    titleNl: "Plugin / Theme installatie",
    kind: "product",
    group: "wordpress",
  },
  {
    slug: "basic-support",
    title: "Basic Support",
    titleNl: "Basic Support",
    kind: "product",
    group: "wordpress",
  },
  {
    slug: "standard-support",
    title: "Standard Support",
    titleNl: "Standard Support",
    kind: "product",
    group: "wordpress",
  },
  {
    slug: "premium-support",
    title: "Premium Support",
    titleNl: "Premium Support",
    kind: "product",
    group: "wordpress",
  },

  // Marketing
  {
    slug: "seo-optimization",
    title: "SEO Optimization",
    titleNl: "SEO Optimalisatie",
    kind: "page",
    group: "marketing",
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    titleNl: "Digital Marketing",
    kind: "page",
    group: "marketing",
  },
  {
    slug: "content-writing",
    title: "Content Writing",
    titleNl: "Content Writing",
    kind: "page",
    group: "marketing",
  },
  {
    slug: "social-media-management",
    title: "Social Media Management",
    titleNl: "Social Media Management",
    kind: "page",
    group: "marketing",
  },
  {
    slug: "media-creation",
    title: "Media Creation",
    titleNl: "Media Creation",
    kind: "page",
    group: "marketing",
  },
  {
    slug: "e-commerce",
    title: "E-commerce",
    titleNl: "E-commerce",
    kind: "page",
    group: "marketing",
  },
  {
    slug: "product-listing",
    title: "Product Listing",
    titleNl: "Product Listing",
    kind: "page",
    group: "marketing",
  },
  {
    slug: "community-management",
    title: "Community Management",
    titleNl: "Community Management",
    kind: "page",
    group: "marketing",
  },
  {
    slug: "data-entry",
    title: "Data Entry",
    titleNl: "Data Entry",
    kind: "page",
    group: "marketing",
  },

  // Hosting
  {
    slug: "web-hosting",
    title: "Web Hosting",
    titleNl: "Web Hosting",
    kind: "page",
    group: "hosting",
  },
  {
    slug: "shared-hosting",
    title: "Shared Hosting",
    titleNl: "Shared Hosting",
    kind: "page",
    group: "hosting",
  },
  {
    slug: "wordpress-hosting",
    title: "WordPress Hosting",
    titleNl: "WordPress Hosting",
    kind: "page",
    group: "hosting",
  },
  {
    slug: "vps-hosting",
    title: "VPS Hosting",
    titleNl: "VPS Hosting",
    kind: "page",
    group: "hosting",
  },
  {
    slug: "domains",
    title: "Domains",
    titleNl: "Domeinen",
    kind: "page",
    group: "hosting",
  },
  {
    slug: "shared-hosting-basic",
    title: "Shared Hosting Basic",
    titleNl: "Shared Hosting Basic",
    kind: "product",
    group: "hosting",
  },
  {
    slug: "shared-hosting-plus",
    title: "Shared Hosting Plus",
    titleNl: "Shared Hosting Plus",
    kind: "product",
    group: "hosting",
  },
  {
    slug: "shared-hosting-business",
    title: "Shared Hosting Business",
    titleNl: "Shared Hosting Business",
    kind: "product",
    group: "hosting",
  },
  {
    slug: "wordpress-hosting-basic",
    title: "WordPress Hosting Basic",
    titleNl: "WordPress Hosting Basic",
    kind: "product",
    group: "hosting",
  },
  {
    slug: "wordpress-hosting-plus",
    title: "WordPress Hosting Plus",
    titleNl: "WordPress Hosting Plus",
    kind: "product",
    group: "hosting",
  },
  {
    slug: "wordpress-hosting-business",
    title: "WordPress Hosting Business",
    titleNl: "WordPress Hosting Business",
    kind: "product",
    group: "hosting",
  },
  {
    slug: "vps-hosting-basic",
    title: "VPS Hosting Basic",
    titleNl: "VPS Hosting Basic",
    kind: "product",
    group: "hosting",
  },
  {
    slug: "vps-hosting-plus",
    title: "VPS Hosting Plus",
    titleNl: "VPS Hosting Plus",
    kind: "product",
    group: "hosting",
  },
  {
    slug: "vps-hosting-business",
    title: "VPS Hosting Business",
    titleNl: "VPS Hosting Business",
    kind: "product",
    group: "hosting",
  },
];

export const serviceGroups = [
  { id: "wordpress" as const, title: "WordPress & Support", titleNl: "WordPress & Support" },
  { id: "marketing" as const, title: "Marketing & Growth", titleNl: "Marketing & Groei" },
  { id: "hosting" as const, title: "Hosting & Domains", titleNl: "Hosting & Domeinen" },
];

export const legalPages = [
  { slug: "privacy-policy", href: "/privacy", title: "Privacy Policy", titleNl: "Privacybeleid" },
  { slug: "cookie-policy", href: "/cookies", title: "Cookie Policy", titleNl: "Cookiebeleid" },
  {
    slug: "terms-and-conditions",
    href: "/voorwaarden",
    title: "Terms and Conditions",
    titleNl: "Algemene voorwaarden",
  },
] as const;

export function getCatalogItem(slug: string) {
  return serviceCatalog.find((item) => item.slug === slug);
}

export function getServiceSlugs() {
  return serviceCatalog.map((item) => item.slug);
}

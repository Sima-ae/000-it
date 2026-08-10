export type ServiceNavItem = {
  slug: string;
  title: string;
  titleNl: string;
  kind: "page" | "product";
  group: "wordpress" | "webdesign" | "marketing" | "hosting" | "design";
  summary?: string;
  summaryNl?: string;
  /** Optional absolute path override (e.g. /digital-design) */
  href?: string;
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

  // Webdesign & Support (non-WordPress)
  {
    slug: "webdesign-support",
    title: "Webdesign & Support",
    titleNl: "Webdesign & Support",
    kind: "page",
    group: "webdesign",
    summary:
      "Custom websites and ongoing support for PHP, HTML, CSS, JavaScript and Next.js — not WordPress.",
    summaryNl:
      "Maatwerk websites en doorlopende support voor PHP, HTML, CSS, JavaScript en Next.js — geen WordPress.",
  },
  {
    slug: "custom-webdesign",
    title: "Custom Webdesign",
    titleNl: "Maatwerk Webdesign",
    kind: "page",
    group: "webdesign",
    summary: "Pixel-sharp, conversion-focused websites built from scratch.",
    summaryNl: "Pixel-scherpe, conversiegerichte websites vanaf nul gebouwd.",
  },
  {
    slug: "php-web-development",
    title: "PHP Web Development",
    titleNl: "PHP Webontwikkeling",
    kind: "page",
    group: "webdesign",
    summary: "Robust PHP applications, APIs and legacy modernization.",
    summaryNl: "Robuuste PHP-applicaties, API’s en modernisering van legacy code.",
  },
  {
    slug: "nextjs-development",
    title: "Next.js Development",
    titleNl: "Next.js Ontwikkeling",
    kind: "page",
    group: "webdesign",
    summary: "Fast, SEO-ready React apps with App Router and modern DX.",
    summaryNl: "Snelle, SEO-klare React-apps met App Router en moderne DX.",
  },
  {
    slug: "html-css-javascript",
    title: "HTML / CSS / JavaScript",
    titleNl: "HTML / CSS / JavaScript",
    kind: "page",
    group: "webdesign",
    summary: "Front-end builds, landing pages and interactive UI without a CMS.",
    summaryNl: "Front-end builds, landingspagina’s en interactieve UI zonder CMS.",
  },
  {
    slug: "website-maintenance",
    title: "Website Maintenance & Support",
    titleNl: "Website Onderhoud & Support",
    kind: "page",
    group: "webdesign",
    summary: "Updates, monitoring, bugfixes and performance care for custom stacks.",
    summaryNl: "Updates, monitoring, bugfixes en performance-zorg voor maatwerk stacks.",
  },
  {
    slug: "api-integrations",
    title: "API Integrations",
    titleNl: "API-integraties",
    kind: "page",
    group: "webdesign",
    summary: "Connect CRMs, payments, ERPs and AI services cleanly.",
    summaryNl: "Koppel CRM’s, betalingen, ERP’s en AI-diensten netjes aan elkaar.",
  },
  {
    slug: "website-malware-security",
    title: "Malware Removal & Security",
    titleNl: "Malware verwijderen & beveiliging",
    kind: "page",
    group: "webdesign",
    summary:
      "Malware cleanup, hardening and ongoing security for custom PHP, HTML and Next.js sites — not WordPress.",
    summaryNl:
      "Malware opruimen, harden en doorlopende beveiliging voor maatwerk PHP-, HTML- en Next.js-sites — geen WordPress.",
  },
  {
    slug: "website-speed-optimization",
    title: "Performance & Speed Optimization",
    titleNl: "Performance & Speed Optimization",
    kind: "page",
    group: "webdesign",
    summary:
      "Faster load times, Core Web Vitals and caching for custom stacks outside WordPress.",
    summaryNl:
      "Snellere laadtijden, Core Web Vitals en caching voor maatwerk stacks buiten WordPress.",
  },
  {
    slug: "website-backup-migration",
    title: "Backup / Migration",
    titleNl: "Backup / Migratie",
    kind: "page",
    group: "webdesign",
    summary:
      "Safe backups and zero-downtime migrations for custom websites and apps.",
    summaryNl:
      "Veilige backups en migraties zonder downtime voor maatwerk websites en apps.",
  },

  // Marketing
  {
    slug: "seo-optimization",
    title: "SEO Optimization",
    titleNl: "SEO Optimalisatie",
    kind: "product",
    group: "marketing",
    summary: "Rank higher with technical SEO, content and authority building.",
    summaryNl: "Hoger ranken met technische SEO, content en autoriteit.",
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    titleNl: "Digital Marketing",
    kind: "page",
    group: "marketing",
    summary: "Full-funnel campaigns across ads, SEO, email and conversion.",
    summaryNl: "Full-funnel campagnes over ads, SEO, e-mail en conversie.",
  },
  {
    slug: "content-writing",
    title: "Content Writing",
    titleNl: "Content Writing",
    kind: "page",
    group: "marketing",
    summary: "SEO blogs, website copy, newsletters and conversion-focused writing.",
    summaryNl: "SEO-blogs, websiteteksten, nieuwsbrieven en conversiegerichte copy.",
  },
  {
    slug: "social-media-management",
    title: "Social Media Management",
    titleNl: "Social Media Management",
    kind: "page",
    group: "marketing",
    summary: "Strategy, content calendar and community engagement on every channel.",
    summaryNl: "Strategie, contentkalender en community-engagement op elk kanaal.",
  },
  {
    slug: "media-creation",
    title: "Media Creation",
    titleNl: "Media Creation",
    kind: "page",
    group: "marketing",
    summary: "Visuals, video snippets and creative assets for campaigns.",
    summaryNl: "Visuals, video-snippets en creatieve assets voor campagnes.",
  },
  {
    slug: "e-commerce",
    title: "E-commerce",
    titleNl: "E-commerce",
    kind: "page",
    group: "marketing",
    summary: "Build, optimize and grow your online store end to end.",
    summaryNl: "Bouw, optimaliseer en groei je webshop van A tot Z.",
  },
  {
    slug: "product-listing",
    title: "Product Listing",
    titleNl: "Product Listing",
    kind: "page",
    group: "marketing",
    summary: "Marketplace-ready product titles, descriptions and attributes.",
    summaryNl: "Marketplace-klare producttitels, beschrijvingen en attributen.",
  },
  {
    slug: "community-management",
    title: "Community Management",
    titleNl: "Community Management",
    kind: "page",
    group: "marketing",
    summary: "Moderation, replies and reputation care across communities.",
    summaryNl: "Moderatie, reacties en reputatiezorg in communities.",
  },
  {
    slug: "data-entry",
    title: "Data Entry",
    titleNl: "Data Entry",
    kind: "page",
    group: "marketing",
    summary: "Accurate catalog, CRM and operations data at scale.",
    summaryNl: "Nauwkeurige catalogus-, CRM- en operations-data op schaal.",
  },

  // Digital Design (print & brand visuals)
  {
    slug: "digital-design",
    title: "Digital Design",
    titleNl: "Digital Design",
    kind: "page",
    group: "design",
    href: "/digital-design",
    summary:
      "Logos, business cards, flyers, stickers, magazines and posters in Photoshop, Illustrator and InDesign.",
    summaryNl:
      "Logo’s, visitekaartjes, flyers, stickers, magazines en posters in Photoshop, Illustrator en InDesign.",
  },
  {
    slug: "logo-brand-identity",
    title: "Logo & Brand Identity",
    titleNl: "Logo & Merkidentiteit",
    kind: "page",
    group: "design",
    summary: "Distinctive logos and brand systems that scale across print and digital.",
    summaryNl: "Herkende logo’s en merksystemen die schalen over print en digitaal.",
  },
  {
    slug: "business-cards-stationery",
    title: "Business Cards & Stationery",
    titleNl: "Visitekaartjes & Briefpapier",
    kind: "page",
    group: "design",
    summary: "Print-ready business cards, letterheads and envelopes.",
    summaryNl: "Drukklare visitekaartjes, briefpapier en enveloppen.",
  },
  {
    slug: "flyers-posters",
    title: "Flyers & Posters",
    titleNl: "Flyers & Posters",
    kind: "page",
    group: "design",
    summary: "Campaign visuals for events, retail and outdoor.",
    summaryNl: "Campagnevisuals voor events, retail en outdoor.",
  },
  {
    slug: "stickers-packaging",
    title: "Stickers & Packaging",
    titleNl: "Stickers & Packaging",
    kind: "page",
    group: "design",
    summary: "Die-cut stickers, labels and simple packaging artwork.",
    summaryNl: "Contourgestanste stickers, labels en eenvoudige packaging artwork.",
  },
  {
    slug: "magazines-brochures",
    title: "Magazines & Brochures",
    titleNl: "Magazines & Brochures",
    kind: "page",
    group: "design",
    summary: "Multi-page layouts in InDesign for print and PDF.",
    summaryNl: "Meerpagina-layouts in InDesign voor print en PDF.",
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
  { id: "webdesign" as const, title: "Webdesign & Support", titleNl: "Webdesign & Support" },
  { id: "design" as const, title: "Digital Design", titleNl: "Digital Design" },
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
  // Only routes under /diensten/[slug] — items with custom href are separate pages
  return serviceCatalog.filter((item) => !item.href).map((item) => item.slug);
}

export function serviceHref(locale: string, item: ServiceNavItem) {
  if (item.href) return `/${locale}${item.href}`;
  return `/${locale}/diensten/${item.slug}`;
}

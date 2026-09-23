import {
  catalogGroupTitle,
  catalogServiceTitle,
} from "@/content/fixweb/catalog-title";
import { localizedHref } from "@/i18n/pathnames";

export type ServiceNavItem = {
  slug: string;
  title: string;
  titleNl: string;
  kind: "page" | "product";
  group: "ai" | "optimization" | "wordpress" | "webdesign" | "marketing" | "hosting" | "design";
  summary?: string;
  summaryNl?: string;
  /** Optional absolute path override (e.g. /grafisch-design) */
  href?: string;
};

/** Service/page inventory mapped into TripleZero routes under /diensten/[slug] */
export const serviceCatalog: ServiceNavItem[] = [
  // Optimalisatie (display order: AEO → GEO → SEO)
  {
    slug: "aeo-optimization",
    title: "AEO Optimization",
    titleNl: "AEO optimalisatie",
    kind: "page",
    group: "optimization",
    summary: "Answer Engine Optimization for citable, answer-ready content.",
    summaryNl: "Answer Engine Optimization voor citeerbare, antwoordklare content.",
  },
  {
    slug: "geo-optimization",
    title: "GEO Optimization",
    titleNl: "GEO optimalisatie",
    kind: "page",
    group: "optimization",
    summary: "Geographic Search Engine Optimization for Maps, local packs and regional search.",
    summaryNl: "Geographic Search Engine Optimization voor Maps, local packs en regionaal zoeken.",
  },
  {
    slug: "seo-optimization",
    title: "SEO Optimization",
    titleNl: "SEO optimalisatie",
    kind: "product",
    group: "optimization",
    summary: "Rank higher with technical SEO, content and authority building.",
    summaryNl: "Hoger ranken met technische SEO, content en autoriteit.",
  },
  {
    slug: "text-optimization",
    title: "Text Optimization",
    titleNl: "Teksten optimaliseren",
    kind: "page",
    group: "optimization",
    summary:
      "Sharper web copy: clearer headlines, stronger pages and conversion-focused wording that supports SEO, AEO and UX.",
    summaryNl:
      "Scherpe webteksten: heldere koppen, sterkere pagina’s en conversiegerichte formulering die SEO, AEO en UX versterkt.",
  },
  {
    slug: "ai-scan",
    title: "AI scan",
    titleNl: "AI-scan",
    kind: "page",
    group: "ai",
    summary: "Readiness scan for AEO, GEO (local), SEO and AI answer engines.",
    summaryNl: "Readiness-scan voor AEO, GEO (lokaal), SEO en AI-antwoordenengines.",
  },
  {
    slug: "ai-in-ecommerce",
    title: "AI in E-commerce",
    titleNl: "AI in e-commerce",
    kind: "page",
    group: "ai",
    summary:
      "AI for webshops: product assistants, smart search, cart help and conversion-focused automation.",
    summaryNl:
      "AI voor webshops: productassistenten, slimme search, cart-hulp en conversiegerichte automatisering.",
  },
  {
    slug: "ai-in-website",
    title: "AI in Website",
    titleNl: "AI in website",
    kind: "page",
    group: "ai",
    summary:
      "AI for custom websites — chat, leads, knowledge search and automation on PHP, HTML/JS and Next.js.",
    summaryNl:
      "AI voor maatwerkwebsites — chat, leads, knowledge search en automatisering op PHP, HTML/JS en Next.js.",
  },
  {
    slug: "ai-chatbots",
    title: "AI Agents and Chatbots",
    titleNl: "AI agents en chatbots",
    kind: "page",
    group: "ai",
    summary:
      "Conversational AI agents and chatbots for websites, support and sales — on-brand, grounded and with human escalation.",
    summaryNl:
      "Conversationele AI-agents en chatbots voor websites, support en sales — on-brand, grounded en met menselijke escalatie.",
  },
  {
    slug: "ai-content-strategy",
    title: "AI Content Strategy",
    titleNl: "AI contentstrategie",
    kind: "page",
    group: "ai",
    summary: "Human-led content systems accelerated by AI.",
    summaryNl: "Mensgestuurde contentsystemen versneld met AI.",
  },
  {
    slug: "ai-automation",
    title: "AI Automation",
    titleNl: "AI automatisering",
    kind: "page",
    group: "ai",
    summary: "Automate repetitive marketing, ops and support work with AI — safely and measurably.",
    summaryNl:
      "Automatiseer repetitief marketing-, ops- en supportwerk met AI — veilig en meetbaar.",
  },
  {
    slug: "ai-workflows",
    title: "AI Workflows",
    titleNl: "AI workflows",
    kind: "page",
    group: "ai",
    summary: "Designed AI workflows: triggers, steps, approvals and integrations end to end.",
    summaryNl:
      "Ontworpen AI-workflows: triggers, stappen, goedkeuringen en integraties van begin tot eind.",
  },
  {
    slug: "ai-marketing-agents",
    title: "AI Marketing Agents",
    titleNl: "AI marketing agents",
    kind: "page",
    group: "ai",
    summary: "Role-based agents for SEO, content, social and ads.",
    summaryNl: "Rolgebaseerde agents voor SEO, content, social en ads.",
  },
  {
    slug: "ai-integration",
    title: "Custom AI Integration",
    titleNl: "AI integratie en maatwerk",
    kind: "page",
    group: "ai",
    summary: "Custom AI features, RAG and APIs in your product stack.",
    summaryNl: "Maatwerk AI-features, RAG en API’s in jouw productstack.",
  },
  {
    slug: "ai-consultancy",
    title: "AI Strategy & Consultancy",
    titleNl: "AI strategie en advies",
    kind: "page",
    group: "ai",
    summary: "Executive AI strategy, pilots and ROI frameworks.",
    summaryNl: "Bestuursklare AI-strategie, pilots en ROI-frameworks.",
  },

  // WordPress & Support (pages + products)
  {
    slug: "ai-in-wordpress",
    title: "AI in WordPress",
    titleNl: "AI in WordPress",
    kind: "page",
    group: "wordpress",
    summary:
      "Chatbots, content AI, automation and custom AI features built into your WordPress site.",
    summaryNl:
      "Chatbots, content-AI, automatisering en maatwerk AI in jouw WordPress-website.",
  },
  {
    slug: "wordpress-support",
    title: "WordPress Support",
    titleNl: "WordPress support",
    kind: "page",
    group: "wordpress",
    summary: "Expert WordPress support to keep your site running smoothly.",
    summaryNl: "Expert WordPress support zodat jouw site soepel blijft draaien.",
  },
  {
    slug: "wordpress-error-fix",
    title: "Fix Bugs and Errors",
    titleNl: "Bugs en errors verhelpen",
    kind: "product",
    group: "wordpress",
  },
  {
    slug: "wordpress-malware-removal",
    title: "Malware Removal",
    titleNl: "Malware verwijderen",
    kind: "product",
    group: "wordpress",
  },
  {
    slug: "wordpress-security",
    title: "Firewall, Security & SSL",
    titleNl: "Firewall, security en SSL",
    kind: "product",
    group: "wordpress",
  },
  {
    slug: "wordpress-speed-optimization",
    title: "WordPress Speed Optimization",
    titleNl: "Prestaties en snelheid",
    kind: "product",
    group: "wordpress",
  },
  {
    slug: "wordpress-backup-hosting-migration",
    title: "Backups and Migration",
    titleNl: "Backups en migratie",
    kind: "product",
    group: "wordpress",
  },
  {
    slug: "wordpress-plugin-theme-installation",
    title: "WordPress Plugin / Theme Installation",
    titleNl: "Plugin / theme installatie",
    kind: "product",
    group: "wordpress",
  },
  {
    slug: "wordpress-maintenance-updates",
    title: "Maintenance & Updates",
    titleNl: "Onderhoud en updates",
    kind: "page",
    group: "wordpress",
    summary:
      "Ongoing WordPress core, plugin and theme updates with backups, monitoring and care.",
    summaryNl:
      "Doorlopend WordPress core-, plugin- en theme-updates met backups, monitoring en nazorg.",
  },
  {
    slug: "basic-support",
    title: "Basic Support",
    titleNl: "Basic support",
    kind: "product",
    group: "wordpress",
  },
  {
    slug: "standard-support",
    title: "Standard Support",
    titleNl: "Standard support",
    kind: "product",
    group: "wordpress",
  },
  {
    slug: "premium-support",
    title: "Premium Support",
    titleNl: "Premium support",
    kind: "product",
    group: "wordpress",
  },

  // Webdesign & Support (non-WordPress)
  {
    slug: "webdesign-support",
    title: "Website Support",
    titleNl: "Website support",
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
    titleNl: "Maatwerk webdesign",
    kind: "page",
    group: "webdesign",
    summary: "Pixel-sharp, conversion-focused websites built from scratch.",
    summaryNl: "Pixel-scherpe, conversiegerichte websites vanaf nul gebouwd.",
  },
  {
    slug: "php-web-development",
    title: "PHP Web Development",
    titleNl: "PHP webontwikkeling",
    kind: "page",
    group: "webdesign",
    summary: "Robust PHP applications, APIs and legacy modernization.",
    summaryNl: "Robuuste PHP-applicaties, API’s en modernisering van legacy code.",
  },
  {
    slug: "nextjs-development",
    title: "Next.js Development",
    titleNl: "Next.js ontwikkeling",
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
    title: "Maintenance & Updates",
    titleNl: "Onderhoud en updates",
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
    slug: "website-malware-removal",
    title: "Malware Removal",
    titleNl: "Malware verwijderen",
    kind: "page",
    group: "webdesign",
    summary:
      "Malware cleanup for custom PHP, HTML and Next.js sites — separate from WordPress malware packages.",
    summaryNl:
      "Malware opruimen voor maatwerk PHP-, HTML- en Next.js-sites — los van WordPress-malwarepakketten.",
  },
  {
    slug: "website-security",
    title: "Firewall, Security & SSL",
    titleNl: "Firewall, security en SSL",
    kind: "page",
    group: "webdesign",
    summary:
      "Hardening, firewall/WAF, HTTPS/SSL and security monitoring for custom websites — not WordPress.",
    summaryNl:
      "Harden, firewall/WAF, HTTPS/SSL en security-monitoring voor maatwerkwebsites — geen WordPress.",
  },
  {
    slug: "website-speed-optimization",
    title: "Performance & Speed Optimization",
    titleNl: "Prestaties en snelheid",
    kind: "page",
    group: "webdesign",
    summary:
      "Faster load times, Core Web Vitals and caching for custom stacks outside WordPress.",
    summaryNl:
      "Snellere laadtijden, Core Web Vitals en caching voor maatwerk stacks buiten WordPress.",
  },
  {
    slug: "website-backup-migration",
    title: "Backups and Migration",
    titleNl: "Backups en migratie",
    kind: "page",
    group: "webdesign",
    summary:
      "Safe backups and zero-downtime migrations for custom websites and apps.",
    summaryNl:
      "Veilige backups en migraties zonder downtime voor maatwerk websites en apps.",
  },

  // Marketing
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    titleNl: "Digital marketing",
    kind: "page",
    group: "marketing",
    summary: "Full-funnel campaigns across ads, SEO, email and conversion.",
    summaryNl: "Full-funnel campagnes over ads, SEO, e-mail en conversie.",
  },
  {
    slug: "content-writing",
    title: "Content Writing",
    titleNl: "Content writing",
    kind: "page",
    group: "marketing",
    summary: "SEO blogs, website copy, newsletters and conversion-focused writing.",
    summaryNl: "SEO-blogs, websiteteksten, nieuwsbrieven en conversiegerichte copy.",
  },
  {
    slug: "social-media-management",
    title: "Social Media Management",
    titleNl: "Social media beheer",
    kind: "page",
    group: "marketing",
    summary: "Strategy, content calendar and community engagement on every channel.",
    summaryNl: "Strategie, contentkalender en community-engagement op elk kanaal.",
  },
  {
    slug: "media-creation",
    title: "Media Creation",
    titleNl: "Media Creatie",
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
    summaryNl: "Bouw, optimaliseer en groei jouw webshop van A tot Z.",
  },
  {
    slug: "product-listing",
    title: "Product Listing",
    titleNl: "Product listing",
    kind: "page",
    group: "marketing",
    summary: "Marketplace-ready product titles, descriptions and attributes.",
    summaryNl: "Marketplace-klare producttitels, beschrijvingen en attributen.",
  },
  {
    slug: "community-management",
    title: "Community Management",
    titleNl: "Communitybeheer",
    kind: "page",
    group: "marketing",
    summary: "Moderation, replies and reputation care across communities.",
    summaryNl: "Moderatie, reacties en reputatiezorg in communities.",
  },
  {
    slug: "data-entry",
    title: "Data Entry",
    titleNl: "Data entry",
    kind: "page",
    group: "marketing",
    summary: "Accurate catalog, CRM and operations data at scale.",
    summaryNl: "Nauwkeurige catalogus-, CRM- en operations-data op schaal.",
  },

  // Grafisch / Graphic Design (print & brand visuals)
  {
    slug: "grafisch-design",
    title: "Graphic Design",
    titleNl: "Grafisch Design",
    kind: "page",
    group: "design",
    href: "/grafisch-design",
    summary:
      "Logos, business cards, flyers, stickers, magazines and posters in Photoshop, Illustrator and InDesign.",
    summaryNl:
      "Logo’s, visitekaartjes, flyers, stickers, magazines en posters in Photoshop, Illustrator en InDesign.",
  },
  {
    slug: "logo-brand-identity",
    title: "Logo & Brand Identity",
    titleNl: "Logo en merkidentiteit",
    kind: "page",
    group: "design",
    summary: "Distinctive logos and brand systems that scale across print and digital.",
    summaryNl: "Herkende logo’s en merksystemen die schalen over print en digitaal.",
  },
  {
    slug: "business-cards",
    title: "Business Cards",
    titleNl: "Visitekaartjes",
    kind: "page",
    group: "design",
    summary: "Design and print business cards in small or large quantities.",
    summaryNl: "Ontwerp en druk visitekaartjes in kleine of grote oplages.",
  },
  {
    slug: "briefpapier",
    title: "Letterhead",
    titleNl: "Briefpapier",
    kind: "page",
    group: "design",
    summary: "Letterhead design and printing in small or large quantities.",
    summaryNl: "Briefpapier ontwerp en drukwerk in kleine of grote oplages.",
  },
  {
    slug: "flyers-posters",
    title: "Flyers & Posters",
    titleNl: "Flyers en posters",
    kind: "page",
    group: "design",
    summary: "Flyer and poster design plus printing in small or large quantities.",
    summaryNl: "Flyer- en posterontwerp plus drukwerk in kleine of grote oplages.",
  },
  {
    slug: "stickers-packaging",
    title: "Stickers",
    titleNl: "Stickers",
    kind: "page",
    group: "design",
    summary: "Sticker design and printing — small batches or large runs.",
    summaryNl: "Stickerontwerp en drukwerk — kleine batches of grote runs.",
  },
  {
    slug: "magazines-brochures",
    title: "Magazines & Brochures",
    titleNl: "Magazines en brochures",
    kind: "page",
    group: "design",
    summary: "Brochure and magazine design plus printing in small or large quantities.",
    summaryNl: "Brochure- en magazine-ontwerp plus drukwerk in kleine of grote oplages.",
  },

  // Hosting
  {
    slug: "web-hosting",
    title: "Web Hosting",
    titleNl: "Web hosting",
    kind: "page",
    group: "hosting",
  },
  {
    slug: "shared-hosting",
    title: "Shared Hosting",
    titleNl: "Shared hosting",
    kind: "page",
    group: "hosting",
  },
  {
    slug: "wordpress-hosting",
    title: "WordPress Hosting",
    titleNl: "WordPress hosting",
    kind: "page",
    group: "hosting",
  },
  {
    slug: "vps-hosting",
    title: "VPS Hosting",
    titleNl: "VPS hosting",
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
    titleNl: "Shared hosting basic",
    kind: "product",
    group: "hosting",
  },
  {
    slug: "shared-hosting-plus",
    title: "Shared Hosting Plus",
    titleNl: "Shared hosting plus",
    kind: "product",
    group: "hosting",
  },
  {
    slug: "shared-hosting-business",
    title: "Shared Hosting Business",
    titleNl: "Shared hosting business",
    kind: "product",
    group: "hosting",
  },
  {
    slug: "wordpress-hosting-basic",
    title: "WordPress Hosting Basic",
    titleNl: "WordPress hosting basic",
    kind: "product",
    group: "hosting",
  },
  {
    slug: "wordpress-hosting-plus",
    title: "WordPress Hosting Plus",
    titleNl: "WordPress hosting plus",
    kind: "product",
    group: "hosting",
  },
  {
    slug: "wordpress-hosting-business",
    title: "WordPress Hosting Pro",
    titleNl: "WordPress hosting pro",
    kind: "product",
    group: "hosting",
  },
  {
    slug: "vps-hosting-basic",
    title: "VPS Hosting Basic",
    titleNl: "VPS hosting basic",
    kind: "product",
    group: "hosting",
  },
  {
    slug: "vps-hosting-plus",
    title: "VPS Hosting Plus",
    titleNl: "VPS hosting plus",
    kind: "product",
    group: "hosting",
  },
  {
    slug: "vps-hosting-business",
    title: "VPS Hosting Business",
    titleNl: "VPS hosting business",
    kind: "product",
    group: "hosting",
  },
];

export const serviceGroups = [
  { id: "ai" as const, title: "AI", titleNl: "AI" },
  { id: "optimization" as const, title: "Optimization", titleNl: "Optimalisatie" },
  { id: "wordpress" as const, title: "WordPress & Support", titleNl: "WordPress en support" },
  { id: "webdesign" as const, title: "Webdesign & Support", titleNl: "Webdesign en support" },
  { id: "design" as const, title: "Design", titleNl: "Design" },
  { id: "marketing" as const, title: "Marketing & Growth", titleNl: "Marketing en groei" },
  { id: "hosting" as const, title: "Webhosting & Domains", titleNl: "Webhosting en domeinen" },
];

/** AI first, then remaining categories A–Z by localized title. */
export function sortedServiceGroups(locale: string) {
  const ai = serviceGroups.find((g) => g.id === "ai");
  const rest = serviceGroups
    .filter((g) => g.id !== "ai")
    .sort((a, b) =>
      catalogGroupTitle(a.id, locale, a.title).localeCompare(
        catalogGroupTitle(b.id, locale, b.title),
        locale,
        { sensitivity: "base" },
      ),
    );
  return ai ? [ai, ...rest] : rest;
}

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
  if (item.href) return localizedHref(locale, item.href);
  return localizedHref(locale, `/diensten/${item.slug}`);
}

export type ServiceGroupId = ServiceNavItem["group"];

const SERVICE_GROUP_IDS = new Set(serviceGroups.map((group) => group.id));

export function isServiceGroupId(value: string): value is ServiceGroupId {
  return SERVICE_GROUP_IDS.has(value as ServiceGroupId);
}

export function getServiceGroup(id: string) {
  return serviceGroups.find((group) => group.id === id) ?? null;
}

export function serviceGroupPath(groupId: string) {
  if (groupId === "design") return "/design";
  return `/diensten/categorie/${groupId}`;
}

export function serviceGroupHref(locale: string, groupId: string) {
  return localizedHref(locale, serviceGroupPath(groupId));
}

const serviceGroupSummaries: Record<ServiceGroupId, { en: string; nl: string }> = {
  ai: {
    en: "Chatbots, workflows, AI in websites and shops, integration and AI consultancy.",
    nl: "Chatbots, workflows, AI in websites en shops, integratie en AI-advies.",
  },
  optimization: {
    en: "AEO, GEO and SEO so your site is found in search and answer engines.",
    nl: "AEO, GEO en SEO zodat je site gevonden wordt in zoek- en antwoordmachines.",
  },
  wordpress: {
    en: "Maintenance, security, malware removal, speed, backups and WordPress support.",
    nl: "Onderhoud, security, malware, snelheid, backups en WordPress-support.",
  },
  webdesign: {
    en: "Custom websites, conversion, security, speed and Next.js development.",
    nl: "Maatwerk websites, conversie, security, snelheid en Next.js-ontwikkeling.",
  },
  design: {
    en: "Logos, branding, flyers, magazines, print and digital design.",
    nl: "Logo's, branding, flyers, magazines, drukwerk en digital design.",
  },
  marketing: {
    en: "Content, social media, ads, e-commerce, media and community management.",
    nl: "Content, social media, ads, e-commerce, media en community management.",
  },
  hosting: {
    en: "Web hosting, WordPress hosting, VPS and domains.",
    nl: "Webhosting, WordPress-hosting, VPS en domeinen.",
  },
};

export function catalogGroupSummary(id: string, locale: string) {
  const row = serviceGroupSummaries[id as ServiceGroupId];
  if (!row) return "";
  return locale === "nl" ? row.nl : row.en;
}

/** A–Z by locale title; hosting keeps given order */
export function sortServicesAz(
  items: ServiceNavItem[],
  locale: string,
  options?: { preserveGroupIds?: string[] },
) {
  const preserve = new Set(options?.preserveGroupIds ?? ["hosting", "ai", "optimization"]);
  const byGroup = new Map<ServiceNavItem["group"], ServiceNavItem[]>();
  for (const item of items) {
    const list = byGroup.get(item.group) || [];
    list.push(item);
    byGroup.set(item.group, list);
  }
  const out: ServiceNavItem[] = [];
  for (const group of sortedServiceGroups(locale)) {
    const list = byGroup.get(group.id) || [];
    if (preserve.has(group.id)) {
      out.push(...list);
      continue;
    }
    out.push(
      ...[...list].sort((a, b) =>
        catalogServiceTitle(a.slug, locale, a.title).localeCompare(
          catalogServiceTitle(b.slug, locale, b.title),
          locale,
          { sensitivity: "base" },
        ),
      ),
    );
  }
  return out;
}

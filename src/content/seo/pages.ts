/**
 * Canonical SEO copy + keywords for static marketing/legal pages.
 * `lastmod` is the content revision date (ISO) used in the sitemap.
 */
import { getLocalizedCopySync } from "@/lib/localized-copy-cache";

export type PageSeo = {
  path: string;
  lastmod: string;
  priority: number;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  title: { nl: string; en: string };
  description: { nl: string; en: string };
  keywords: { nl: string[]; en: string[] };
  image?: string;
  ogType?: "website" | "article";
};

/** Shared keyword clusters (AEO, GEO, SEO alphabetical). */
const CORE_NL = [
  "TripleZero iT",
  "AI",
  "AEO",
  "GEO",
  "SEO",
  "AI-integratie",
  "online marketing",
  "Nederland",
  "België",
];
const CORE_EN = [
  "TripleZero iT",
  "AI",
  "AEO",
  "GEO",
  "SEO",
  "AI integration",
  "online marketing",
  "Netherlands",
  "Belgium",
];

const REV = "2026-09-14";

export const staticPageSeo: PageSeo[] = [
  {
    path: "/",
    lastmod: REV,
    priority: 1,
    changeFrequency: "weekly",
    title: {
      nl: "Ontdek alle AI mogelijkheden voor ondernemers en zzp'ers",
      en: "Discover all AI possibilities for entrepreneurs and freelancers",
    },
    description: {
      nl: "Groei sneller met TripleZero iT: AI-integratie, AEO, GEO, SEO, advertising, content en maatwerk software — inclusief gratis AI-scan.",
      en: "Grow faster with TripleZero iT: AI integration, AEO, GEO, SEO, advertising, content and custom software — including a free AI scan.",
    },
    keywords: {
      nl: [...CORE_NL, "AI-scan", "webdesign", "automatisering", "zzp"],
      en: [...CORE_EN, "AI scan", "web design", "automation", "freelancer"],
    },
    image: "/branding/og-default.png",
  },
  {
    path: "/diensten",
    lastmod: REV,
    priority: 0.95,
    changeFrequency: "weekly",
    title: {
      nl: "Diensten — AI, AEO, GEO, SEO & marketing",
      en: "Services — AI, AEO, GEO, SEO & marketing",
    },
    description: {
      nl: "Alle TripleZero iT-diensten: AI-integratie, AEO/GEO/SEO, webdesign, WordPress, hosting, digital marketing en design.",
      en: "All TripleZero iT services: AI integration, AEO/GEO/SEO, web design, WordPress, hosting, digital marketing and design.",
    },
    keywords: {
      nl: [...CORE_NL, "diensten", "webdesign", "WordPress", "hosting"],
      en: [...CORE_EN, "services", "web design", "WordPress", "hosting"],
    },
    image: "/uploads/fixweb/aeo-seo.png",
  },
  {
    path: "/shop",
    lastmod: REV,
    priority: 0.95,
    changeFrequency: "weekly",
    title: {
      nl: "Shop — pakketten, hosting & AI-diensten",
      en: "Shop — plans, hosting & AI services",
    },
    description: {
      nl: "Bestel TripleZero iT-pakketten, hosting en AI-diensten online. Transparante prijzen inclusief BTW.",
      en: "Order TripleZero iT plans, hosting and AI services online. Transparent pricing including VAT.",
    },
    keywords: {
      nl: [...CORE_NL, "shop", "pakketten", "hosting", "webshop", "AI-agent"],
      en: [...CORE_EN, "shop", "plans", "hosting", "store", "AI agent"],
    },
  },
  {
    path: "/ai-scan",
    lastmod: REV,
    priority: 0.94,
    changeFrequency: "weekly",
    title: {
      nl: "Gratis AI-scan — AEO, GEO & SEO scores",
      en: "Free AI scan — AEO, GEO & SEO scores",
    },
    description: {
      nl: "Laat uw website scannen op AEO, GEO, SEO en AI-readiness. Ontvang scores en verbeterpunten van TripleZero iT.",
      en: "Scan your website for AEO, GEO, SEO and AI readiness. Get scores and prioritized fixes from TripleZero iT.",
    },
    keywords: {
      nl: [...CORE_NL, "AI-scan", "AI-readiness", "website scan", "gratis scan"],
      en: [...CORE_EN, "AI scan", "AI readiness", "website scan", "free scan"],
    },
    image: "/uploads/fixweb/ai-scan.png",
  },
  {
    path: "/afspraak",
    lastmod: REV,
    priority: 0.9,
    changeFrequency: "monthly",
    title: {
      nl: "Afspraak maken met TripleZero iT",
      en: "Book a meeting with TripleZero iT",
    },
    description: {
      nl: "Plan een vrijblijvend gesprek over AI, AEO, GEO, SEO, marketing of maatwerk software. Kies een tijd die past.",
      en: "Schedule a no-obligation call about AI, AEO, GEO, SEO, marketing or custom software. Pick a time that works.",
    },
    keywords: {
      nl: [...CORE_NL, "afspraak", "consult", "intake"],
      en: [...CORE_EN, "appointment", "consultation", "intake"],
    },
  },
  {
    path: "/contact",
    lastmod: REV,
    priority: 0.88,
    changeFrequency: "monthly",
    title: {
      nl: "Contact — TripleZero iT",
      en: "Contact — TripleZero iT",
    },
    description: {
      nl: "Neem contact op met TripleZero iT voor AI-integratie, AEO, GEO, SEO, marketing en software. We reageren snel.",
      en: "Contact TripleZero iT for AI integration, AEO, GEO, SEO, marketing and software. We reply quickly.",
    },
    keywords: {
      nl: [...CORE_NL, "contact", "offerte", "info@000-it.com"],
      en: [...CORE_EN, "contact", "quote", "info@000-it.com"],
    },
  },
  {
    path: "/over-ons",
    lastmod: REV,
    priority: 0.8,
    changeFrequency: "monthly",
    title: {
      nl: "Over TripleZero iT — missie, visie & aanpak",
      en: "About TripleZero iT — mission, vision & approach",
    },
    description: {
      nl: "Leer TripleZero iT kennen: AI-gedreven groei voor bedrijven in Nederland en België, met zero guesswork.",
      en: "Meet TripleZero iT: AI-driven growth for businesses in the Netherlands and Belgium, with zero guesswork.",
    },
    keywords: {
      nl: [...CORE_NL, "over ons", "missie", "visie", "TripleZero"],
      en: [...CORE_EN, "about us", "mission", "vision", "TripleZero"],
    },
  },
  {
    path: "/portfolio",
    lastmod: REV,
    priority: 0.85,
    changeFrequency: "weekly",
    title: {
      nl: "Portfolio — projecten van TripleZero iT",
      en: "Portfolio — TripleZero iT projects",
    },
    description: {
      nl: "Bekijk geselecteerde projecten: websites, apps, AI-integraties en growth-systemen van TripleZero iT.",
      en: "Browse selected projects: websites, apps, AI integrations and growth systems by TripleZero iT.",
    },
    keywords: {
      nl: [...CORE_NL, "portfolio", "cases", "projecten", "webdesign"],
      en: [...CORE_EN, "portfolio", "case studies", "projects", "web design"],
    },
  },
  {
    path: "/case-studies",
    lastmod: REV,
    priority: 0.75,
    changeFrequency: "weekly",
    title: {
      nl: "Case studies — meetbare AI-groei",
      en: "Case studies — measurable AI growth",
    },
    description: {
      nl: "Resultaten van klanten die groeien met AI, AEO, GEO, SEO en digital marketing via TripleZero iT.",
      en: "Results from clients growing with AI, AEO, GEO, SEO and digital marketing via TripleZero iT.",
    },
    keywords: {
      nl: [...CORE_NL, "case studies", "resultaten", "klantcases"],
      en: [...CORE_EN, "case studies", "results", "client success"],
    },
  },
  {
    path: "/nieuws",
    lastmod: REV,
    priority: 0.9,
    changeFrequency: "daily",
    title: {
      nl: "Nieuws — AI, AEO, GEO & SEO inzichten",
      en: "News — AI, AEO, GEO & SEO insights",
    },
    description: {
      nl: "AI- en tech-nieuws van TripleZero iT: analyses, productupdates en praktische inzichten.",
      en: "AI and tech news from TripleZero iT: analysis, product updates and practical insights.",
    },
    keywords: {
      nl: [...CORE_NL, "nieuws", "AI nieuws", "tech nieuws"],
      en: [...CORE_EN, "news", "AI news", "tech news"],
    },
  },
  {
    path: "/faq",
    lastmod: REV,
    priority: 0.7,
    changeFrequency: "monthly",
    title: {
      nl: "Veelgestelde vragen — TripleZero iT",
      en: "Frequently asked questions — TripleZero iT",
    },
    description: {
      nl: "Uitgebreide antwoorden over TripleZero iT — van AI en SEO tot design, marketing, support en hosting.",
      en: "In-depth answers about TripleZero iT — from AI and SEO to design, marketing, support and hosting.",
    },
    keywords: {
      nl: [...CORE_NL, "veelgestelde vragen", "hulp"],
      en: [...CORE_EN, "FAQ", "frequently asked questions", "help"],
    },
  },
  {
    path: "/kennisbank",
    lastmod: "2026-09-13",
    priority: 0.85,
    changeFrequency: "weekly",
    title: {
      nl: "Kennisbank — TripleZero iT Hosting",
      en: "Knowledge base — TripleZero iT Hosting",
    },
    description: {
      nl: "Informatie over domeinnamen, hosting, e-mail, control panels, WordPress, beveiliging en onze TripleZero-producten — stap voor stap, met professionele uitleg.",
      en: "Information about domains, hosting, email, control panels, WordPress, security and our TripleZero products — step by step, with professional explanations.",
    },
    keywords: {
      nl: [...CORE_NL, "kennisbank", "hosting", "DirectAdmin", "WordPress", "e-mail"],
      en: [...CORE_EN, "knowledge base", "hosting", "DirectAdmin", "WordPress", "email"],
    },
  },
  {
    path: "/digital-design",
    lastmod: REV,
    priority: 0.72,
    changeFrequency: "monthly",
    title: {
      nl: "Digital design — branding & creatives",
      en: "Digital design — branding & creatives",
    },
    description: {
      nl: "Digital design door TripleZero iT: huisstijl, graphics en creatives die conversie en merksterkte versterken.",
      en: "Digital design by TripleZero iT: brand systems, graphics and creatives that strengthen conversion and brand.",
    },
    keywords: {
      nl: [...CORE_NL, "digital design", "branding", "huisstijl", "creatives"],
      en: [...CORE_EN, "digital design", "branding", "brand identity", "creatives"],
    },
    image: "/uploads/fixweb/content-social.png",
  },
  {
    path: "/locaties",
    lastmod: REV,
    priority: 0.86,
    changeFrequency: "weekly",
    title: {
      nl: "Locaties — AI & SEO diensten in NL en BE",
      en: "Locations — AI & SEO services in NL and BE",
    },
    description: {
      nl: "TripleZero iT helpt bedrijven in Amsterdam, Rotterdam, Utrecht, Antwerpen, Brussel en meer met AI, AEO, GEO en SEO.",
      en: "TripleZero iT helps businesses in Amsterdam, Rotterdam, Utrecht, Antwerp, Brussels and more with AI, AEO, GEO and SEO.",
    },
    keywords: {
      nl: [...CORE_NL, "locaties", "Amsterdam", "Rotterdam", "Antwerpen", "lokaal"],
      en: [...CORE_EN, "locations", "Amsterdam", "Rotterdam", "Antwerp", "local"],
    },
  },
  {
    path: "/privacy",
    lastmod: "2026-07-01",
    priority: 0.3,
    changeFrequency: "yearly",
    title: {
      nl: "Privacybeleid",
      en: "Privacy Policy",
    },
    description: {
      nl: "Privacybeleid van TripleZero iT: hoe wij persoonsgegevens verwerken via 000-it.com.",
      en: "Privacy Policy of TripleZero iT: how we process personal data via 000-it.com.",
    },
    keywords: {
      nl: ["privacybeleid", "AVG", "GDPR", "TripleZero iT", "persoonsgegevens"],
      en: ["privacy policy", "GDPR", "TripleZero iT", "personal data"],
    },
  },
  {
    path: "/cookies",
    lastmod: "2026-07-01",
    priority: 0.3,
    changeFrequency: "yearly",
    title: {
      nl: "Cookiebeleid",
      en: "Cookie Policy",
    },
    description: {
      nl: "Cookiebeleid van TripleZero iT: welke cookies wij gebruiken en hoe u voorkeuren beheert.",
      en: "Cookie Policy of TripleZero iT: which cookies we use and how you manage preferences.",
    },
    keywords: {
      nl: ["cookiebeleid", "cookies", "toestemming", "TripleZero iT"],
      en: ["cookie policy", "cookies", "consent", "TripleZero iT"],
    },
  },
  {
    path: "/voorwaarden",
    lastmod: "2026-07-01",
    priority: 0.3,
    changeFrequency: "yearly",
    title: {
      nl: "Algemene voorwaarden",
      en: "Terms and Conditions",
    },
    description: {
      nl: "Algemene voorwaarden voor het gebruik van 000-it.com en de diensten van TripleZero iT.",
      en: "Terms and Conditions for using 000-it.com and TripleZero iT services.",
    },
    keywords: {
      nl: ["algemene voorwaarden", "voorwaarden", "TripleZero iT"],
      en: ["terms and conditions", "terms of use", "TripleZero iT"],
    },
  },
];

export type LocalizedSeoCopy = {
  title: string;
  description: string;
  keywords: string[];
};

export function getStaticPageSeo(path: string) {
  const clean = path === "/" ? "/" : path.replace(/\/$/, "") || "/";
  return staticPageSeo.find((p) => p.path === clean);
}

export function getStaticPageSeoCopy(
  path: string,
  locale: string,
): LocalizedSeoCopy | null {
  const page = getStaticPageSeo(path);
  if (!page) return null;
  if (locale === "nl") {
    return {
      title: page.title.nl,
      description: page.description.nl,
      keywords: page.keywords.nl,
    };
  }
  if (locale === "en") {
    return {
      title: page.title.en,
      description: page.description.en,
      keywords: page.keywords.en,
    };
  }
  const overlay = getLocalizedCopySync<LocalizedSeoCopy>("seo", page.path, locale);
  if (overlay?.title && overlay.description) {
    return {
      title: overlay.title,
      description: overlay.description,
      keywords: overlay.keywords?.length ? overlay.keywords : page.keywords.en,
    };
  }
  return {
    title: page.title.en,
    description: page.description.en,
    keywords: page.keywords.en,
  };
}

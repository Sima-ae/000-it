type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

type CustomService = {
  title: string;
  titleNl: string;
  subtitle: string;
  subtitleNl: string;
  image?: string | null;
  price?: number | null;
  blocks: ContentBlock[];
  blocksNl: ContentBlock[];
};

function p(text: string): ContentBlock {
  return { type: "paragraph", text };
}
function h(text: string): ContentBlock {
  return { type: "heading", text };
}
function l(items: string[]): ContentBlock {
  return { type: "list", items };
}

const customServices: Record<string, CustomService> = {
  "webdesign-support": {
    title: "Webdesign & Support",
    titleNl: "Webdesign & Support",
    subtitle:
      "Professional websites and ongoing support for custom stacks — PHP, HTML, CSS, JavaScript and Next.js. Completely separate from WordPress.",
    subtitleNl:
      "Professionele websites en doorlopende support voor maatwerk stacks — PHP, HTML, CSS, JavaScript en Next.js. Volledig los van WordPress.",
    image: "/uploads/fixweb/webdesign-conversie.png",
    blocks: [
      h("Built for real codebases"),
      p(
        "We design, develop and maintain websites that are not locked into WordPress. Ideal for brands that need speed, control and clean engineering.",
      ),
      h("What we cover"),
      l([
        "Custom UI/UX and front-end implementation",
        "PHP applications and modernizations",
        "Next.js / React applications",
        "HTML, CSS and JavaScript landing pages",
        "API integrations and automation hooks",
        "Monitoring, bugfixes and performance care",
      ]),
      h("How we work"),
      p(
        "Discovery → design → build → launch → retainership. You get clear milestones, measurable KPIs and a single team that owns design and engineering.",
      ),
    ],
    blocksNl: [
      h("Gemaakt voor echte codebases"),
      p(
        "Wij ontwerpen, bouwen en onderhouden websites die niet vastzitten aan WordPress. Ideaal voor merken die snelheid, controle en schone engineering willen.",
      ),
      h("Wat we doen"),
      l([
        "Maatwerk UI/UX en front-end implementatie",
        "PHP-applicaties en modernisering",
        "Next.js / React-applicaties",
        "HTML, CSS en JavaScript landingspagina’s",
        "API-integraties en automatisering",
        "Monitoring, bugfixes en performance-zorg",
      ]),
      h("Werkwijze"),
      p(
        "Intake → design → build → livegang → nazorg. Heldere milestones, meetbare KPI’s en één team voor design én engineering.",
      ),
    ],
  },
  "custom-webdesign": {
    title: "Custom Webdesign",
    titleNl: "Maatwerk Webdesign",
    subtitle: "Conversion-focused websites designed and coded for your brand.",
    subtitleNl: "Conversiegerichte websites, ontworpen en gecodeerd voor jouw merk.",
    image: "/uploads/fixweb/webdesign-conversie.png",
    blocks: [
      h("From concept to launch"),
      p(
        "Wireframes, visual design and production-ready front-end — without a bloated theme stack.",
      ),
      l([
        "Brand-aligned layouts and components",
        "Responsive across desktop, tablet and mobile",
        "Accessibility and Core Web Vitals in scope",
        "CMS-optional: static, headless or custom admin",
      ]),
    ],
    blocksNl: [
      h("Van concept tot livegang"),
      p(
        "Wireframes, visueel design en production-ready front-end — zonder opgeblazen theme-stack.",
      ),
      l([
        "Merkgerichte layouts en componenten",
        "Responsive op desktop, tablet en mobiel",
        "Toegankelijkheid en Core Web Vitals meegenomen",
        "CMS optioneel: static, headless of custom admin",
      ]),
    ],
  },
  "php-web-development": {
    title: "PHP Web Development",
    titleNl: "PHP Webontwikkeling",
    subtitle: "Reliable PHP apps, portals and API backends.",
    subtitleNl: "Betrouwbare PHP-apps, portals en API-backends.",
    image: "/uploads/fixweb/maatwerk-software.png",
    blocks: [
      h("Modern PHP, practical delivery"),
      l([
        "Custom business portals and dashboards",
        "Legacy PHP cleanup and security hardening",
        "REST / webhook integrations",
        "Performance profiling and refactoring",
      ]),
    ],
    blocksNl: [
      h("Modern PHP, praktische oplevering"),
      l([
        "Maatwerk portals en dashboards",
        "Legacy PHP opschonen en beveiligen",
        "REST / webhook-integraties",
        "Performance profiling en refactoring",
      ]),
    ],
  },
  "nextjs-development": {
    title: "Next.js Development",
    titleNl: "Next.js Ontwikkeling",
    subtitle: "App Router, server components and SEO-ready React products.",
    subtitleNl: "App Router, server components en SEO-klare React-producten.",
    image: "/uploads/fixweb/maatwerk-software.png",
    blocks: [
      h("Ship fast without sacrificing quality"),
      l([
        "Marketing sites and SaaS front-ends",
        "i18n, auth and dashboard modules",
        "Edge-friendly performance patterns",
        "Deployments on Vercel, Node or your VPS",
      ]),
    ],
    blocksNl: [
      h("Snel live zonder in te leveren op kwaliteit"),
      l([
        "Marketing sites en SaaS front-ends",
        "i18n, auth en dashboard-modules",
        "Edge-vriendelijke performance-patronen",
        "Deploys op Vercel, Node of jouw VPS",
      ]),
    ],
  },
  "html-css-javascript": {
    title: "HTML / CSS / JavaScript",
    titleNl: "HTML / CSS / JavaScript",
    subtitle: "Lean front-end builds when you do not need a CMS.",
    subtitleNl: "Slanke front-end builds wanneer je geen CMS nodig hebt.",
    image: "/uploads/fixweb/webdesign-conversie.png",
    blocks: [
      h("Clean markup, strong craft"),
      l([
        "Landing pages and microsites",
        "Interactive UI and animations",
        "Cross-browser QA",
        "Handoff-ready assets for your team",
      ]),
    ],
    blocksNl: [
      h("Schone markup, sterk vakmanschap"),
      l([
        "Landingspagina’s en microsites",
        "Interactieve UI en animaties",
        "Cross-browser QA",
        "Opleverklare assets voor jouw team",
      ]),
    ],
  },
  "website-maintenance": {
    title: "Website Maintenance & Support",
    titleNl: "Website Onderhoud & Support",
    subtitle: "Keep custom sites healthy after launch.",
    subtitleNl: "Houd maatwerk sites gezond na livegang.",
    image: "/uploads/fixweb/webdesign-conversie.png",
    blocks: [
      h("Retainership that actually helps"),
      l([
        "Security and dependency updates",
        "Uptime checks and incident response",
        "Bugfixes and small feature iterations",
        "Monthly performance and SEO health notes",
      ]),
    ],
    blocksNl: [
      h("Nazorg die écht helpt"),
      l([
        "Security- en dependency-updates",
        "Uptime-checks en incident response",
        "Bugfixes en kleine feature-iteraties",
        "Maandelijkse performance- en SEO-notities",
      ]),
    ],
  },
  "api-integrations": {
    title: "API Integrations",
    titleNl: "API-integraties",
    subtitle: "Connect the tools your business already runs on.",
    subtitleNl: "Koppel de tools waarmee jouw bedrijf al werkt.",
    image: "/uploads/fixweb/maatwerk-software.png",
    blocks: [
      h("Systems that talk to each other"),
      l([
        "CRM, billing and ERP connectors",
        "Payment providers and webhooks",
        "AI / automation endpoints",
        "Error handling, logging and retries",
      ]),
    ],
    blocksNl: [
      h("Systemen die met elkaar praten"),
      l([
        "CRM-, facturatie- en ERP-koppelingen",
        "Payment providers en webhooks",
        "AI- / automatiserings-endpoints",
        "Foutafhandeling, logging en retries",
      ]),
    ],
  },
  "logo-brand-identity": {
    title: "Logo & Brand Identity",
    titleNl: "Logo & Merkidentiteit",
    subtitle: "Logos and brand systems ready for print and screen.",
    subtitleNl: "Logo’s en merksystemen klaar voor print en scherm.",
    image: "/uploads/fixweb/content-social.png",
    blocks: [
      h("Crafted in Illustrator"),
      l([
        "Logo concepts and refinement",
        "Color, type and usage guidelines",
        "Export packs (SVG, PDF, PNG)",
        "Social and stationery adaptations",
      ]),
    ],
    blocksNl: [
      h("Gemaakt in Illustrator"),
      l([
        "Logo-concepten en uitwerking",
        "Kleur-, lettertype- en gebruiksrichtlijnen",
        "Export packs (SVG, PDF, PNG)",
        "Social- en stationery-varianten",
      ]),
    ],
  },
  "business-cards-stationery": {
    title: "Business Cards & Stationery",
    titleNl: "Visitekaartjes & Briefpapier",
    subtitle: "Print-ready stationery that matches your brand.",
    subtitleNl: "Drukklare stationery die bij jouw merk past.",
    image: "/uploads/fixweb/content-social.png",
    blocks: [
      h("Photoshop · Illustrator · InDesign"),
      l([
        "Business cards (single or double sided)",
        "Letterheads and envelopes",
        "Bleed, CMYK and printer-ready files",
        "Optional print coordination",
      ]),
    ],
    blocksNl: [
      h("Photoshop · Illustrator · InDesign"),
      l([
        "Visitekaartjes (enkel- of dubbelzijdig)",
        "Briefpapier en enveloppen",
        "Aflopend, CMYK en drukklare bestanden",
        "Optionele drukcoördinatie",
      ]),
    ],
  },
  "flyers-posters": {
    title: "Flyers & Posters",
    titleNl: "Flyers & Posters",
    subtitle: "Campaign visuals that stop the scroll — and the walk-by.",
    subtitleNl: "Campagnevisuals die opvallen — online én op straat.",
    image: "/uploads/fixweb/content-social.png",
    blocks: [
      h("For events, retail and outdoor"),
      l([
        "A-series flyers and large-format posters",
        "Strong hierarchy and CTA placement",
        "Print-safe color and typography",
        "Digital variants for social ads",
      ]),
    ],
    blocksNl: [
      h("Voor events, retail en outdoor"),
      l([
        "A-formaat flyers en grootformaat posters",
        "Sterke hiërarchie en CTA-plaatsing",
        "Drukveilige kleur en typografie",
        "Digitale varianten voor social ads",
      ]),
    ],
  },
  "stickers-packaging": {
    title: "Stickers & Packaging",
    titleNl: "Stickers & Packaging",
    subtitle: "Die-cut stickers, labels and simple packaging artwork.",
    subtitleNl: "Contourgestanste stickers, labels en eenvoudige packaging.",
    image: "/uploads/fixweb/content-social.png",
    blocks: [
      h("Detail that survives production"),
      l([
        "Die-cut paths and safe margins",
        "Labels for products and shipping",
        "Spot varnish / foil notes when needed",
        "Vector and print PDF delivery",
      ]),
    ],
    blocksNl: [
      h("Detail dat de productie overleeft"),
      l([
        "Stanslijnen en veilige marges",
        "Labels voor producten en verzending",
        "Spotlak- / folienotities indien nodig",
        "Vector- en print-PDF oplevering",
      ]),
    ],
  },
  "magazines-brochures": {
    title: "Magazines & Brochures",
    titleNl: "Magazines & Brochures",
    subtitle: "Multi-page editorial layouts in Adobe InDesign.",
    subtitleNl: "Meerpagina editorial layouts in Adobe InDesign.",
    image: "/uploads/fixweb/content-social.png",
    blocks: [
      h("InDesign for serious print"),
      l([
        "Brochures, lookbooks and magazines",
        "Master pages, styles and grids",
        "Image prep and prepress checks",
        "Print PDF / interactive PDF options",
      ]),
    ],
    blocksNl: [
      h("InDesign voor serieuze print"),
      l([
        "Brochures, lookbooks en magazines",
        "Master pages, styles en grids",
        "Beeldbewerking en prepress-checks",
        "Print-PDF / interactieve PDF-opties",
      ]),
    ],
  },
};

export function getCustomServiceContent(slug: string, locale: string) {
  const entry = customServices[slug];
  if (!entry) return null;
  const isNl = locale === "nl";
  return {
    title: isNl ? entry.titleNl : entry.title,
    subtitle: isNl ? entry.subtitleNl : entry.subtitle,
    price: entry.price ?? null,
    currency: entry.price != null ? "EUR" : null,
    image: entry.image ?? null,
    blocks: isNl ? entry.blocksNl : entry.blocks,
    kind: "page" as const,
  };
}

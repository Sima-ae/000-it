import { aiCustomServices } from "@/content/services/ai";
import { aiInWordpressService } from "@/content/services/ai-in-wordpress";
import {
  aiInEcommerceService,
  aiInWebsiteService,
} from "@/content/services/ai-in-webdesign";

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
  "ai-in-wordpress": aiInWordpressService,
  "ai-in-ecommerce": aiInEcommerceService,
  "ai-in-website": aiInWebsiteService,
  ...aiCustomServices,
  "wordpress-maintenance-updates": {
    title: "Maintenance & Updates",
    titleNl: "Onderhoud en updates",
    subtitle:
      "Keep your WordPress site healthy with scheduled core, plugin and theme updates, backups and proactive monitoring.",
    subtitleNl:
      "Houd uw WordPress-site gezond met geplande core-, plugin- en theme-updates, backups en proactieve monitoring.",
    image: "/uploads/fixweb/wordpress-security.png",
    blocks: [
      h("Why maintenance matters"),
      p(
        "Outdated plugins and themes are the #1 cause of WordPress hacks, broken checkouts and sudden downtime. Professional maintenance keeps your site secure, fast and compatible — without you having to live in wp-admin.",
      ),
      h("What’s included"),
      l([
        "WordPress core updates (tested before go-live)",
        "Plugin and theme updates with conflict checks",
        "Pre-update backup of files and database",
        "Uptime monitoring and alert response",
        "Security scan after each update cycle",
        "Monthly health report with actions taken",
        "Staging checks for critical sites (on request)",
        "Rollback plan if an update causes issues",
      ]),
      h("How we work"),
      p(
        "We follow a calm, repeatable cadence: backup → update on staging or low-traffic window → smoke test (forms, checkout, login) → go-live → report. You always know what changed and why.",
      ),
      h("Ideal for"),
      l([
        "Business sites and WooCommerce stores",
        "Multi-site setups that need consistent care",
        "Teams without an in-house WordPress developer",
        "Agencies that want reliable retainership for clients",
      ]),
      h("Optional add-ons"),
      l([
        "Daily off-site backups with retention policy",
        "Performance tune-ups after major updates",
        "Malware cleanup if something slips through",
        "Content edits and small feature requests in the same retainer",
      ]),
      h("Get started"),
      p(
        "Tell us how many sites you run and how critical each is. We’ll propose a Basic, Standard or Premium maintenance rhythm that matches your risk and budget — then take updates off your plate.",
      ),
    ],
    blocksNl: [
      h("Waarom onderhoud telt"),
      p(
        "Verouderde plugins en themes zijn de #1 oorzaak van WordPress-hacks, kapotte checkouts en plotselinge downtime. Professioneel onderhoud houdt uw site veilig, snel en compatible — zonder dat u in wp-admin hoeft te leven.",
      ),
      h("Wat erbij zit"),
      l([
        "WordPress core-updates (getest vóór livegang)",
        "Plugin- en theme-updates met conflictcontrole",
        "Backup van bestanden en database vóór elke update",
        "Uptime-monitoring en alert-opvolging",
        "Security-scan na elke update-cyclus",
        "Maandelijks health-rapport met uitgevoerde acties",
        "Staging-checks voor kritieke sites (op verzoek)",
        "Rollback-plan als een update problemen geeft",
      ]),
      h("Werkwijze"),
      p(
        "We werken in een rustig, herhaalbaar ritme: backup → update op staging of in een rustig moment → smoke test (forms, checkout, login) → livegang → rapport. U weet altijd wat er veranderde en waarom.",
      ),
      h("Ideaal voor"),
      l([
        "Bedrijfssites en WooCommerce-webshops",
        "Multi-site setups die consistente zorg nodig hebben",
        "Teams zonder in-house WordPress-developer",
        "Bureaus die betrouwbare nazorg voor klanten willen",
      ]),
      h("Optionele add-ons"),
      l([
        "Dagelijkse off-site backups met retentiebeleid",
        "Performance-tune-ups na grote updates",
        "Malware-opschoning als er toch iets misgaat",
        "Contentwijzigingen en kleine features in hetzelfde abonnement",
      ]),
      h("Aan de slag"),
      p(
        "Vertel ons hoeveel sites u heeft en hoe kritiek ze zijn. Wij stellen een Basic-, Standard- of Premium-onderhoudsritme voor dat bij uw risico en budget past — en nemen updates van uw bord.",
      ),
    ],
  },
  "webdesign-support": {
    title: "Website Support",
    titleNl: "Website support",
    subtitle:
      "Professional websites and ongoing support for custom stacks — PHP, HTML, CSS, JavaScript and Next.js. Completely separate from WordPress.",
    subtitleNl:
      "Professionele websites en doorlopende support voor maatwerk stacks — PHP, HTML, CSS, javascript en Next.js. volledig los van WordPress.",
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
        "Malware removal",
        "Security hardening",
        "Performance & speed optimization",
        "Backup / migration without downtime",
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
        "Malware verwijderen",
        "Firewall, Security en SSL",
        "Performance en snelheid",
        "Backup / migratie zonder downtime",
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
    titleNl: "Maatwerk webdesign",
    subtitle: "Conversion-focused websites designed and coded for your brand.",
    subtitleNl: "Conversiegerichte websites, ontworpen en gecodeerd voor uw merk.",
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
    titleNl: "PHP webontwikkeling",
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
    titleNl: "Next.js ontwikkeling",
    subtitle: "App Router, server components and SEO-ready React products.",
    subtitleNl: "App router, server components en SEO-klare react-producten.",
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
        "Deploys op Vercel, Node of uw VPS",
      ]),
    ],
  },
  "html-css-javascript": {
    title: "HTML / CSS / JavaScript",
    titleNl: "HTML / CSS / JavaScript",
    subtitle: "Lean front-end builds when you do not need a CMS.",
    subtitleNl: "Slanke front-end builds wanneer u geen cms nodig heeft.",
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
        "Opleverklare assets voor uw team",
      ]),
    ],
  },
  "website-maintenance": {
    title: "Daily Maintenance",
    titleNl: "Dagelijks onderhoud",
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
    subtitleNl: "Koppel de tools waarmee uw bedrijf al werkt.",
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
  "website-malware-removal": {
    title: "Malware Removal",
    titleNl: "Malware verwijderen",
    subtitle:
      "Detect and remove malware from custom PHP, HTML and Next.js websites — without breaking your application.",
    subtitleNl:
      "Detecteer en verwijder malware van maatwerk PHP-, HTML- en Next.js-websites — zonder uw applicatie te breken.",
    image: "/uploads/fixweb/wordpress-malware-removal.png",
    blocks: [
      h("Malware removal for custom websites"),
      p(
        "Malware on a custom site is different from a WordPress takeover. We inspect code, server config, databases and uploads to find and remove infections cleanly — completely separate from WordPress malware packages.",
      ),
      h("What we remove"),
      l([
        "Full malware scan across files, databases and uploads",
        "Backdoors, webshells and injected scripts",
        "Rogue cron jobs and unauthorized scheduled tasks",
        "Malicious redirects, SEO spam and hidden iframes",
        "Compromised dependencies and tainted deploy artifacts",
      ]),
      h("How we work"),
      l([
        "Isolate and backup before cleanup",
        "Manual + automated analysis of infected paths",
        "Clean restoration of damaged files where needed",
        "Smoke tests so forms, checkout and auth still work",
        "Incident report with findings and reinfection risks",
      ]),
      h("After cleanup"),
      p(
        "We hand over a clear report and next steps. For lasting protection, pair this with our separate Beveiliging / Security service — this page stays focused on malware removal only.",
      ),
    ],
    blocksNl: [
      h("Malware verwijderen voor maatwerkwebsites"),
      p(
        "Malware op een maatwerksite is anders dan een WordPress-hack. Wij inspecteren code, serverconfig, databases en uploads om infecties schoon te vinden en te verwijderen — volledig los van WordPress-malwarepakketten.",
      ),
      h("Wat we verwijderen"),
      l([
        "Volledige malware-scan over bestanden, databases en uploads",
        "Backdoors, webshells en geïnjecteerde scripts",
        "Rogue cronjobs en ongeautoriseerde scheduled tasks",
        "Kwaadaardige redirects, SEO-spam en verborgen iframes",
        "Gecompromitteerde dependencies en vervuilde deploy-artifacts",
      ]),
      h("Werkwijze"),
      l([
        "Isoleren en backup vóór cleanup",
        "Handmatige + geautomatiseerde analyse van geïnfecteerde paden",
        "Schoon herstellen van beschadigde bestanden waar nodig",
        "Smoke tests zodat forms, checkout en auth blijven werken",
        "Incidentrapport met bevindingen en herinfectierisico’s",
      ]),
      h("Na de cleanup"),
      p(
        "U krijgt een helder rapport en vervolgstappen. Voor structurele bescherming combineert u dit met onze aparte dienst Beveiliging — deze pagina gaat alleen over malware verwijderen.",
      ),
    ],
  },
  "website-security": {
    title: "Firewall, Security & SSL",
    titleNl: "Firewall, security en SSL",
    subtitle:
      "Harden custom websites with firewall/WAF, SSL/HTTPS, access control and monitoring — for PHP, HTML and Next.js stacks.",
    subtitleNl:
      "Hard maatwerkwebsites met firewall/waf, SSL/https, toegangscontrole en monitoring — voor PHP-, HTML- en Next.js-stacks.",
    image: "/uploads/fixweb/wordpress-security.png",
    blocks: [
      h("Firewall, security & SSL for custom websites"),
      p(
        "Prevention matters as much as cleanup. We harden your non-WordPress stack with SSL/HTTPS, firewall/WAF guidance and access controls — separate from malware removal and separate from WordPress security packages.",
      ),
      h("What we secure"),
      l([
        "SSL / TLS certificates and HTTPS configuration",
        "Firewall / WAF setup guidance and rate-limiting advice",
        "Security headers (CSP, HSTS, X-Frame-Options and related)",
        "Access control, least privilege and admin path protection",
        "Dependency and runtime updates (Node, PHP, packages)",
        "Logging, alerts and monitoring recommendations",
      ]),
      h("Ideal for"),
      l([
        "Custom PHP applications and portals",
        "Next.js / React production sites",
        "HTML/JS landing stacks with forms and APIs",
        "E-commerce and lead-gen sites that need ongoing hardening",
      ]),
      h("Engagement options"),
      p(
        "One-off security harden after launch or audit, or a retainership with periodic checks. If you are already infected, start with Malware verwijderen — then harden with Firewall, Security en SSL.",
      ),
    ],
    blocksNl: [
      h("Firewall, security en SSL voor maatwerkwebsites"),
      p(
        "Preventie telt net zo zwaar als opruimen. Wij hardenen uw non-WordPress stack met SSL/HTTPS, firewall/WAF-advies en toegangscontrole — los van malware verwijderen en los van WordPress-securitypakketten.",
      ),
      h("Wat we beveiligen"),
      l([
        "SSL- / TLS-certificaten en HTTPS-configuratie",
        "Firewall- / WAF-setupadvies en rate-limiting",
        "Security headers (CSP, HSTS, X-Frame-Options en gerelateerd)",
        "Toegangscontrole, least privilege en admin-pad bescherming",
        "Dependency- en runtime-updates (Node, PHP, packages)",
        "Logging, alerts en monitoring-aanbevelingen",
      ]),
      h("Ideaal voor"),
      l([
        "Maatwerk PHP-applicaties en portals",
        "Next.js / React productiesites",
        "HTML/JS-landingstacks met forms en API’s",
        "E-commerce en lead-gen sites die doorlopend harden nodig hebben",
      ]),
      h("Samenwerkingsvormen"),
      p(
        "Eenmalig harden na launch of audit, of een retainer met periodieke checks. Bent u al geïnfecteerd? Start met Malware verwijderen — harden daarna met Firewall, Security en SSL.",
      ),
    ],
  },
  "website-speed-optimization": {
    title: "Performance & Speed Optimization",
    titleNl: "Performance en snelheid",
    subtitle:
      "Cut load times and improve Core Web Vitals for custom front-ends and APIs — not a WordPress cache plugin.",
    subtitleNl:
      "Verkort laadtijden en verbeter core web vitals voor maatwerk front-ends en API’s — geen WordPress cache-plugin.",
    image: "/uploads/fixweb/wordpress-speed-optimization.png",
    blocks: [
      h("Speed that converts"),
      p(
        "Slow pages kill leads. We profile your stack (HTML/CSS/JS, PHP or Next.js), remove bottlenecks and ship a faster experience users feel immediately.",
      ),
      h("Optimization scope"),
      l([
        "Lighthouse / Web Vitals baseline and target plan",
        "Asset strategy: images, fonts, code splitting, lazy loading",
        "Server and CDN caching for custom apps",
        "Database and API response tuning",
        "Rendering path improvements (SSR/ISR/static where useful)",
        "Before/after report with measurable gains",
      ]),
      h("Typical results"),
      p(
        "Teams usually see faster LCP, lower bounce rates and better SEO signals within one sprint after launch of the optimizations.",
      ),
    ],
    blocksNl: [
      h("Snelheid die converteert"),
      p(
        "Trage pagina’s kosten leads. Wij profileren uw stack (HTML/CSS/JS, PHP of Next.js), verwijderen bottlenecks en leveren een snellere ervaring die gebruikers meteen voelen.",
      ),
      h("Optimalisatie-scope"),
      l([
        "Lighthouse / Web Vitals-baseline en doelplan",
        "Asset-strategie: images, fonts, code splitting, lazy loading",
        "Server- en CDN-caching voor maatwerk apps",
        "Database- en API-responstuning",
        "Rendering-pad verbeteren (SSR/ISR/static waar nuttig)",
        "Voor/na-rapport met meetbare winst",
      ]),
      h("Typische resultaten"),
      p(
        "Teams zien meestal snellere LCP, lagere bounce en betere SEO-signalen binnen één sprint na livegang van de optimalisaties.",
      ),
    ],
  },
  "website-backup-migration": {
    title: "Backup / Migration",
    titleNl: "Backup / migratie",
    subtitle:
      "Reliable backups and low-downtime migrations for custom websites, PHP apps and Next.js projects.",
    subtitleNl:
      "Betrouwbare backups en migraties met minimale downtime voor maatwerk websites, PHP-apps en Next.js-projecten.",
    image: "/uploads/fixweb/wordpress-backup-hosting-migration.png",
    blocks: [
      h("Move without the panic"),
      p(
        "Whether you switch host, region or architecture, we plan the cutover, verify data integrity and keep a rollback path ready.",
      ),
      h("What is included"),
      l([
        "Full backup of files, databases and environment config",
        "Migration to new VPS, cloud or managed hosting",
        "DNS cutover plan with low/zero downtime windows",
        "SSL, redirects and smoke tests after go-live",
        "Automated backup schedule setup (daily/weekly)",
        "Rollback package stored for the first critical days",
      ]),
      h("Best fit"),
      p(
        "Perfect when you outgrow shared hosting, move off a legacy server, or need a disaster-recovery routine for a production app.",
      ),
    ],
    blocksNl: [
      h("Verhuizen zonder paniek"),
      p(
        "Of u nu van host, regio of architectuur wisselt: wij plannen de cutover, controleren dataintegriteit en houden een rollback-pad klaar.",
      ),
      h("Wat erbij zit"),
      l([
        "Volledige backup van bestanden, databases en environment-config",
        "Migratie naar nieuwe VPS, cloud of managed hosting",
        "DNS-cutoverplan met lage/zero downtime-windows",
        "SSL, redirects en smoke tests na livegang",
        "Automatische backup-planning (dagelijks/wekelijks)",
        "Rollback-pakket bewaard voor de eerste kritieke dagen",
      ]),
      h("Ideaal wanneer"),
      p(
        "Perfect als u shared hosting ontgroeit, van een legacy server af wilt, of disaster-recovery nodig heeft voor een productie-app.",
      ),
    ],
  },
  "logo-brand-identity": {
    title: "Logo & Brand Identity",
    titleNl: "Logo en merkidentiteit",
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
  "business-cards": {
    title: "Business Cards",
    titleNl: "Visitekaartjes",
    subtitle:
      "Business card design and printing — from a small starter batch to large team runs.",
    subtitleNl:
      "Visitekaartjes ontwerp en drukwerk — van een kleine startoplage tot grote teamruns.",
    image: "/uploads/fixweb/content-social.png",
    blocks: [
      h("Business card design & printing"),
      p(
        "We design business cards that represent your brand in handshakes and meetings — and we can print them for you in small or large quantities, with the finishes your brand needs.",
      ),
      l([
        "Single- or double-sided layouts",
        "Portrait or landscape formats",
        "Brand-aligned typography, color and logo placement",
        "Spot UV, soft-touch, foil or emboss options when relevant",
        "Bleed, crop marks and print-ready PDF / AI files",
      ]),
      h("Printing for clients"),
      p(
        "Need physical cards? We arrange printing in small amounts (starter packs, pilots, personal sets) or big amounts (full teams, events, rebrands). You get proofs, clear paper/finish choices and delivery coordination.",
      ),
      l([
        "Small runs for individuals or soft launches",
        "Large runs for companies, events and multi-role sets",
        "Paper weight, coating and special finish advice",
        "Proof check before full production",
      ]),
      h("Ideal for"),
      l([
        "New brands and rebrands",
        "Sales and leadership teams",
        "Event and networking kits",
        "Matching sets for multiple roles or languages",
      ]),
    ],
    blocksNl: [
      h("Visitekaartjes ontwerp & drukwerk"),
      p(
        "Wij ontwerpen visitekaartjes die uw merk uitstralen bij handshakes en meetings — en we kunnen ze voor u drukken in kleine of grote oplages, met de afwerkingen die bij uw merk passen.",
      ),
      l([
        "Enkel- of dubbelzijdige layouts",
        "Staand of liggend formaat",
        "Merkconforme typografie, kleur en logoplaatsing",
        "Spot UV, soft-touch, folie of preeg indien relevant",
        "Aflopend, snijmerken en drukklare PDF / AI-bestanden",
      ]),
      h("Drukwerk voor klanten"),
      p(
        "Fysieke kaarten nodig? Wij regelen drukwerk in kleine oplages (startsets, pilots, persoonlijke sets) of grote oplages (hele teams, events, rebrands). U krijgt proofs, heldere papier-/afwerkingskeuzes en leveringscoördinatie.",
      ),
      l([
        "Kleine oplages voor individuen of soft launches",
        "Grote oplages voor bedrijven, events en multi-rol sets",
        "Advies over papiergewicht, coating en speciale afwerking",
        "Proof-controle vóór volle productie",
      ]),
      h("Ideaal voor"),
      l([
        "Nieuwe merken en rebrands",
        "Sales- en leadership-teams",
        "Event- en netwerkpakketten",
        "Sets voor meerdere rollen of talen",
      ]),
    ],
  },
  briefpapier: {
    title: "Letterhead",
    titleNl: "Briefpapier",
    subtitle:
      "Letterhead and huisstijl stationery — design plus print in small or large quantities.",
    subtitleNl:
      "Briefpapier en huisstijl-stationery — ontwerp plus drukwerk in kleine of grote oplages.",
    image: "/uploads/fixweb/content-social.png",
    blocks: [
      h("Letterhead & corporate stationery"),
      p(
        "We design letterheads and matching stationery that keep your brand consistent in correspondence — and we can print them for you in small office packs or large company runs.",
      ),
      l([
        "A4 letterhead templates (digital and print)",
        "Continuation sheets where needed",
        "Matching envelopes (DL / C5 and custom)",
        "Huisstijl alignment with logo, color and typography",
        "CMYK, bleed and printer-ready PDF / InDesign files",
      ]),
      h("Printing for clients"),
      p(
        "Order what you need: a small quantity for day-to-day use, or a large quantity for the whole organisation. We handle specs, proofs and production so your stationery arrives ready to use.",
      ),
      l([
        "Small print runs for startups and departments",
        "Large print runs for company-wide stationery",
        "Paper and finish recommendations",
        "Proof approval before bulk printing",
      ]),
      h("Ideal for"),
      l([
        "Companies professionalising outbound mail",
        "Rebrands that need stationery refreshed",
        "Agencies and offices with frequent formal correspondence",
      ]),
    ],
    blocksNl: [
      h("Briefpapier & huisstijl-drukwerk"),
      p(
        "Wij ontwerpen briefpapier en bijpassende stationery die uw merk consistent houden in correspondentie — en we kunnen ze voor u drukken in kleine kantoorpakketten of grote bedrijfsruns.",
      ),
      l([
        "A4-briefpapiertemplates (digitaal en print)",
        "Vervolgvellen indien nodig",
        "Bijpassende enveloppen (DL / C5 en maatwerk)",
        "Huisstijl-afstemming op logo, kleur en typografie",
        "CMYK, aflopend en drukklare PDF / InDesign-bestanden",
      ]),
      h("Drukwerk voor klanten"),
      p(
        "Bestel wat u nodig heeft: een kleine oplage voor dagelijks gebruik, of een grote oplage voor de hele organisatie. Wij regelen specs, proofs en productie zodat uw stationery klaar is voor gebruik.",
      ),
      l([
        "Kleine drukoplages voor startups en afdelingen",
        "Grote drukoplages voor bedrijfsbrede stationery",
        "Advies over papier en afwerking",
        "Proof-goedkeuring vóór bulkdruk",
      ]),
      h("Ideaal voor"),
      l([
        "Bedrijven die uitgaande post professionaliseren",
        "Rebrands die stationery willen vernieuwen",
        "Bureaus en kantoren met veel formele correspondentie",
      ]),
    ],
  },
  "flyers-posters": {
    title: "Flyers & Posters",
    titleNl: "Flyers en posters",
    subtitle:
      "Flyer and poster design — and printing in small or large quantities for campaigns, retail and events.",
    subtitleNl:
      "Flyer- en posterontwerp — en drukwerk in kleine of grote oplages voor campagnes, retail en events.",
    image: "/uploads/fixweb/content-social.png",
    blocks: [
      h("Flyer & poster design"),
      p(
        "We design flyers and posters that stop the walk-by: clear hierarchy, strong CTA placement, campaign-ready visuals and typography that stays sharp in print — from A-series handouts to large-format posters.",
      ),
      l([
        "A-series flyers (A6, A5, A4 and custom)",
        "Posters for indoor, retail and outdoor formats",
        "Campaign concepts aligned with your brand",
        "Print-safe color (CMYK), resolution and bleed",
        "Digital variants for social ads when useful",
      ]),
      h("Printing in small or big numbers"),
      p(
        "After design, we can print for you. Need a small batch for a local promo or pop-up? Or a large run for a launch, store network or event? We scale the print quantity to your campaign — with proofs and delivery coordination.",
      ),
      l([
        "Small quantities for tests, soft launches and local events",
        "Large quantities for national campaigns, retail and trade shows",
        "Paper, finish and format advice per use case",
        "Proof check before full production",
        "Optional bundling with stickers or business cards for kits",
      ]),
      h("Ideal for"),
      l([
        "Retail promotions and seasonal campaigns",
        "Events, openings and festivals",
        "Product launches and lead magnets",
        "Window displays and outdoor visibility",
      ]),
      h("How we work"),
      p(
        "Briefing → concepts → feedback → final print files → optional print production in the quantity you need. One partner for design and printing, so nothing gets lost between agencies.",
      ),
    ],
    blocksNl: [
      h("Flyer- & posterontwerp"),
      p(
        "Wij ontwerpen flyers en posters die opvallen: heldere hiërarchie, sterke CTA-plaatsing, campagneklare visuals en typografie die scherp blijft in druk — van A-formaat folders tot grootformaat posters.",
      ),
      l([
        "A-formaat flyers (A6, A5, A4 en maatwerk)",
        "Posters voor indoor, retail en outdoor formats",
        "Campagneconcepten afgestemd op uw merk",
        "Drukveilige kleur (CMYK), resolutie en bleed",
        "Digitale varianten voor social ads indien nuttig",
      ]),
      h("Drukwerk in kleine of grote oplages"),
      p(
        "Na het ontwerp kunnen we voor u drukken. Een kleine batch nodig voor een lokale promo of pop-up? Of een grote run voor een launch, winkelnetwerk of event? Wij schalen de drukoplage mee met uw campagne — met proofs en leveringscoördinatie.",
      ),
      l([
        "Kleine oplages voor tests, soft launches en lokale events",
        "Grote oplages voor landelijke campagnes, retail en beurzen",
        "Advies over papier, afwerking en formaat per use-case",
        "Proof-controle vóór volle productie",
        "Optioneel bundelen met stickers of visitekaartjes voor kits",
      ]),
      h("Ideaal voor"),
      l([
        "Retail-promoties en seizoenscampagnes",
        "Events, openingen en festivals",
        "Productlanceringen en lead magnets",
        "Etalages en outdoor zichtbaarheid",
      ]),
      h("Werkwijze"),
      p(
        "Briefing → concepten → feedback → finale drukbestanden → optioneel drukwerk in de oplage die u nodig heeft. Eén partner voor ontwerp en printing, zodat er niets tussen bureaus verdwijnt.",
      ),
    ],
  },
  "stickers-packaging": {
    title: "Stickers",
    titleNl: "Stickers",
    subtitle:
      "Sticker design and printing — small batches or large runs, die-cut and finished.",
    subtitleNl:
      "Stickerontwerp en drukwerk — kleine batches of grote runs, contourgestanst en afgewerkt.",
    image: "/uploads/fixweb/content-social.png",
    blocks: [
      h("Sticker design & printing"),
      p(
        "We design stickers that look sharp on products, events and merch — and we print them for you in small or large quantities, with correct bleed, cut paths and finishes.",
      ),
      l([
        "Custom sticker artwork and brand-aligned variants",
        "Die-cut / kiss-cut paths with safe margins",
        "Sheet layouts and single-sticker formats",
        "Spot varnish, foil or matte/gloss options when needed",
        "Vector and print-ready PDF delivery",
      ]),
      h("Printing for clients"),
      p(
        "From a small merch drop or giveaway pack to a large product or event run — we scale sticker printing to the amount you need, with proofs before production.",
      ),
      l([
        "Small quantities for pilots, merch and personal branding",
        "Large quantities for products, events and retail",
        "Material and finish advice (vinyl, paper, laminate)",
        "Proof approval before bulk printing",
      ]),
      h("Ideal for"),
      l([
        "Product and branding stickers",
        "Event and giveaway stickers",
        "Window and laptop stickers",
        "Limited-edition merch drops",
      ]),
    ],
    blocksNl: [
      h("Stickerontwerp & drukwerk"),
      p(
        "Wij ontwerpen stickers die scherp staan op product, event en merch — en drukken ze voor u in kleine of grote oplages, met juiste bleed, snijlijnen en afwerkingen.",
      ),
      l([
        "Maatwerk stickerartwork en merkconforme varianten",
        "Contourgestanste / kiss-cut paden met veilige marges",
        "Velindelingen en single-sticker formats",
        "Spotlak-, folie- of mat/glans-opties indien nodig",
        "Vector- en drukklare PDF-oplevering",
      ]),
      h("Drukwerk voor klanten"),
      p(
        "Van een kleine merch drop of giveaway tot een grote product- of eventrun — wij schalen stickerdrukwerk naar de hoeveelheid die u nodig heeft, met proofs vóór productie.",
      ),
      l([
        "Kleine oplages voor pilots, merch en personal branding",
        "Grote oplages voor producten, events en retail",
        "Advies over materiaal en afwerking (vinyl, papier, laminaat)",
        "Proof-goedkeuring vóór bulkdruk",
      ]),
      h("Ideaal voor"),
      l([
        "Product- en brandingstickers",
        "Event- en giveaway-stickers",
        "Raam- en laptopstickers",
        "Limited-edition merch drops",
      ]),
    ],
  },
  "magazines-brochures": {
    title: "Magazines & Brochures",
    titleNl: "Magazines en brochures",
    subtitle:
      "Multi-page brochure and magazine design — plus printing in small or large quantities.",
    subtitleNl:
      "Meerpagina brochure- en magazine-ontwerp — plus drukwerk in kleine of grote oplages.",
    image: "/uploads/fixweb/content-social.png",
    blocks: [
      h("Brochure & magazine design"),
      p(
        "We design multi-page editorial layouts in Adobe InDesign: clear grids, styles, image prep and prepress checks — for lookbooks, company brochures and magazines.",
      ),
      l([
        "Brochures, lookbooks and magazines",
        "Master pages, styles and grids",
        "Image prep and prepress checks",
        "Print PDF and interactive PDF options",
      ]),
      h("Printing for clients"),
      p(
        "We can print your brochure or magazine in a small quantity (pilots, VIP packs, soft launches) or a large quantity (events, mailings, retail). Specs, proofs and finishing are coordinated with production.",
      ),
      l([
        "Small print runs for tests and selective distribution",
        "Large print runs for campaigns and mass distribution",
        "Paper, binding and finish recommendations",
        "Proof check before full production",
      ]),
    ],
    blocksNl: [
      h("Brochure- & magazine-ontwerp"),
      p(
        "Wij ontwerpen meerpagina editorial layouts in Adobe InDesign: heldere grids, stijlen, beeldbewerking en prepress-checks — voor lookbooks, bedrijfsbrochures en magazines.",
      ),
      l([
        "Brochures, lookbooks en magazines",
        "Master pages, styles en grids",
        "Beeldbewerking en prepress-checks",
        "Print-PDF en interactieve PDF-opties",
      ]),
      h("Drukwerk voor klanten"),
      p(
        "Wij kunnen uw brochure of magazine drukken in een kleine oplage (pilots, VIP-packs, soft launches) of een grote oplage (events, mailings, retail). Specs, proofs en afwerking stemmen we af met de productie.",
      ),
      l([
        "Kleine drukoplages voor tests en selectieve distributie",
        "Grote drukoplages voor campagnes en massadistributie",
        "Advies over papier, binding en afwerking",
        "Proof-controle vóór volle productie",
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

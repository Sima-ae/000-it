import { getLocalizedCopySync } from "@/lib/localized-copy-cache";
import { aiCustomServices } from "@/content/services/ai";
import { aiInWordpressService } from "@/content/services/ai-in-wordpress";
import {
  aiInEcommerceService,
  aiInWebsiteService,
} from "@/content/services/ai-in-webdesign";
import optimizationI18nPack from "@/content/services/optimization-i18n-pack.json";

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
      "Houd jouw WordPress-site gezond met geplande core-, plugin- en theme-updates, backups en proactieve monitoring.",
    image: "/uploads/fixweb/wordpress-maintenance-updates.png",
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
        "Verouderde plugins en themes zijn de #1 oorzaak van WordPress-hacks, kapotte checkouts en plotselinge downtime. Professioneel onderhoud houdt jouw site veilig, snel en compatible — zonder dat je in wp-admin hoeft te leven.",
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
        "We werken in een rustig, herhaalbaar ritme: backup → update op staging of in een rustig moment → smoke test (forms, checkout, login) → livegang → rapport. Je weet altijd wat er veranderde en waarom.",
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
        "Vertel ons hoeveel sites je hebt en hoe kritiek ze zijn. Wij stellen een Basic-, Standard- of Premium-onderhoudsritme voor dat bij jouw risico en budget past — en nemen updates van jouw bord.",
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
    image: "/uploads/fixweb/webdesign-support.png",
    blocks: [
      h("Support for websites built around your business"),
      p("A custom website needs more than an occasional developer. TripleZero iT provides a dependable technical partner for PHP, HTML, JavaScript and Next.js sites: we solve issues, improve what matters and keep the platform ready for your next step."),
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
      h("A practical support model"),
      p("We begin with a technical intake: your stack, hosting, source code, integrations and business-critical journeys. From there, we agree priorities, response expectations and a sensible cadence for planned work and urgent fixes."),
      h("What you receive"),
      l(["A clear backlog with scope and priority", "Plain-language updates on work completed", "Testing of critical paths before release", "Documentation for changes, access and recurring tasks", "A single team for design, development and technical care"]),
      h("Ideal for"),
      l(["Businesses without an in-house web team", "Growing platforms that need regular iteration", "Agencies needing experienced development capacity", "Teams inheriting a custom or legacy website"]),
      h("How to start"),
      p("Share your website, current challenges and preferred way of working. We assess the starting point and propose a focused first sprint or an ongoing support arrangement."),
    ],
    blocksNl: [
      h("Support voor websites die om jouw bedrijf zijn gebouwd"),
      p("Een maatwerkwebsite heeft meer nodig dan af en toe een developer. TripleZero iT is jouw betrouwbare technische partner voor PHP-, HTML-, JavaScript- en Next.js-sites: we lossen problemen op, verbeteren wat telt en houden het platform klaar voor jouw volgende stap."),
      h("Wat we doen"),
      l([
        "Maatwerk UI/UX en front-end implementatie",
        "PHP-applicaties en modernisering",
        "Next.js / React-applicaties",
        "HTML, CSS en JavaScript landingspagina’s",
        "API-integraties en automatisering",
        "Malware verwijderen",
        "Firewall, Security en SSL",
        "Prestaties en snelheid",
        "Backups en migratie zonder downtime",
        "Monitoring, bugfixes en performance-zorg",
      ]),
      h("Een praktische supportvorm"),
      p("We starten met een technische intake: jouw stack, hosting, broncode, integraties en bedrijfskritische klantreizen. Daarna bepalen we prioriteiten, responstijden en een passend ritme voor gepland werk en spoedfixes."),
      h("Wat je krijgt"),
      l(["Een heldere backlog met scope en prioriteit", "Duidelijke updates over uitgevoerd werk", "Tests van kritieke paden vóór release", "Documentatie van wijzigingen, toegang en terugkerende taken", "Eén team voor design, ontwikkeling en technisch beheer"]),
      h("Ideaal voor"),
      l(["Bedrijven zonder intern webteam", "Groeiende platforms die regelmatig moeten doorontwikkelen", "Bureaus die ervaren ontwikkelcapaciteit zoeken", "Teams die een maatwerk- of legacywebsite overnemen"]),
      h("Aan de slag"),
      p("Deel jouw website, huidige uitdagingen en gewenste samenwerking. Wij beoordelen de startsituatie en doen een voorstel voor een gerichte eerste sprint of doorlopende support."),
    ],
  },
  "custom-webdesign": {
    title: "Custom Webdesign",
    titleNl: "Maatwerk webdesign",
    subtitle: "Conversion-focused websites designed and coded for your brand.",
    subtitleNl: "Conversiegerichte websites, ontworpen en gecodeerd voor jouw merk.",
    image: "/uploads/fixweb/custom-webdesign.png",
    blocks: [
      h("A website designed to support commercial goals"),
      p("A strong website makes it easy for the right visitor to understand your offer and take the next step. We combine brand, content structure and conversion-focused UX in a tailored design that can be built cleanly and maintained confidently."),
      h("What we design"),
      l([
        "Brand-aligned layouts and components",
        "Responsive across desktop, tablet and mobile",
        "Accessibility and Core Web Vitals in scope",
        "CMS-optional: static, headless or custom admin",
      ]),
      h("Our approach"),
      p("We align on audiences, objectives and content before designing screens. Wireframes validate hierarchy and journeys; visual design then turns the approved direction into a consistent component system, ready for development."),
      h("What you receive"),
      l(["Discovery and page-structure recommendations", "Wireframes for key pages and conversion paths", "High-fidelity responsive designs", "Reusable components and interaction guidance", "Production-ready front-end or an organised developer handover"]),
      h("Built for long-term use"),
      p("We design for real content, different screen sizes and future pages—not for a one-off presentation. Accessibility, performance and Core Web Vitals are considered from the first concepts."),
      h("How to start"),
      p("Tell us what the website needs to achieve, who it serves and what already exists. We propose a clear design scope, timeline and route from concept to launch."),
    ],
    blocksNl: [
      h("Een website die commerciële doelen ondersteunt"),
      p("Een sterke website maakt snel duidelijk wat je aanbiedt en welke volgende stap de juiste bezoeker kan zetten. We combineren merk, contentstructuur en conversiegerichte UX in een maatwerkontwerp dat schoon gebouwd en goed beheerd kan worden."),
      h("Wat we ontwerpen"),
      l([
        "Merkgerichte layouts en componenten",
        "Responsive op desktop, tablet en mobiel",
        "Toegankelijkheid en Core Web Vitals meegenomen",
        "CMS optioneel: static, headless of custom admin",
      ]),
      h("Onze aanpak"),
      p("We stemmen eerst doelgroepen, doelen en content af. Wireframes toetsen hiërarchie en klantreizen; het visuele ontwerp vertaalt de gekozen richting vervolgens naar een consistent componentsysteem, klaar voor ontwikkeling."),
      h("Wat je krijgt"),
      l(["Discovery en advies over paginastructuur", "Wireframes voor kernpagina’s en conversiepaden", "High-fidelity responsive ontwerpen", "Herbruikbare componenten en interactierichtlijnen", "Production-ready front-end of een geordende developer handover"]),
      h("Gebouwd voor langdurig gebruik"),
      p("We ontwerpen voor echte content, verschillende schermformaten en toekomstige pagina’s—niet alleen voor een presentatie. Toegankelijkheid, performance en Core Web Vitals nemen we vanaf de eerste concepten mee."),
      h("Aan de slag"),
      p("Vertel wat de website moet bereiken, voor wie hij is en wat er al bestaat. Wij maken een helder voorstel voor scope, planning en de route van concept naar livegang."),
    ],
  },
  "php-web-development": {
    title: "PHP Web Development",
    titleNl: "PHP webontwikkeling",
    subtitle: "Reliable PHP apps, portals and API backends.",
    subtitleNl: "Betrouwbare PHP-apps, portals en API-backends.",
    image: "/uploads/fixweb/php-web-development.png",
    blocks: [
      h("Reliable PHP for business-critical work"),
      p("PHP still powers many important customer portals, platforms and internal tools. We develop new functionality and improve existing applications with an emphasis on security, maintainability and a release process your business can rely on."),
      h("What we build and improve"),
      l([
        "Custom business portals and dashboards",
        "Legacy PHP cleanup and security hardening",
        "REST / webhook integrations",
        "Performance profiling and refactoring",
      ]),
      h("Our development approach"),
      p("We first map the codebase, dependencies and highest-risk user flows. Work is split into manageable releases, tested against agreed acceptance criteria and documented so your application is easier to operate after delivery."),
      h("Typical deliverables"),
      l(["Technical assessment and prioritised improvement plan", "Secure, reviewed application code", "API contracts and integration documentation", "Database and performance improvements where needed", "Deployment notes and handover for your team"]),
      h("Ideal for"),
      l(["Companies running a custom PHP portal or application", "Teams modernising a legacy platform in phases", "Businesses connecting PHP systems to new services", "Organisations that need dependable external development capacity"]),
      h("Start with an assessment"),
      p("Send us a short description of the application, its users and the change you need. We can begin with a focused audit or scope a first development sprint."),
    ],
    blocksNl: [
      h("Betrouwbare PHP voor bedrijfskritisch werk"),
      p("PHP draait nog altijd veel belangrijke klantportalen, platforms en interne tools. Wij ontwikkelen nieuwe functionaliteit en verbeteren bestaande applicaties met aandacht voor veiligheid, onderhoudbaarheid en een releaseproces waarop jouw organisatie kan rekenen."),
      h("Wat we bouwen en verbeteren"),
      l([
        "Maatwerk portals en dashboards",
        "Legacy PHP opschonen en beveiligen",
        "REST / webhook-integraties",
        "Performance profiling en refactoring",
      ]),
      h("Onze ontwikkelaanpak"),
      p("We brengen eerst de codebase, dependencies en risicovolle gebruikersflows in kaart. Het werk verdelen we in overzichtelijke releases, testen we aan de hand van afgesproken acceptatiecriteria en documenteren we voor eenvoudiger beheer."),
      h("Typische opleveringen"),
      l(["Technische beoordeling en geprioriteerd verbeterplan", "Veilige, gereviewde applicatiecode", "API-contracten en integratiedocumentatie", "Database- en performanceverbeteringen waar nodig", "Deploynotities en overdracht aan jouw team"]),
      h("Ideaal voor"),
      l(["Bedrijven met een maatwerk PHP-portaal of applicatie", "Teams die een legacyplatform gefaseerd moderniseren", "Organisaties die PHP-systemen met nieuwe diensten koppelen", "Bedrijven die betrouwbare externe ontwikkelcapaciteit zoeken"]),
      h("Start met een beoordeling"),
      p("Stuur ons een korte omschrijving van de applicatie, gebruikers en gewenste wijziging. We kunnen starten met een gerichte audit of een eerste ontwikkelsprint afbakenen."),
    ],
  },
  "nextjs-development": {
    title: "Next.js Development",
    titleNl: "Next.js ontwikkeling",
    subtitle: "App Router, server components and SEO-ready React products.",
    subtitleNl: "App router, server components en SEO-klare react-producten.",
    image: "/uploads/fixweb/nextjs-development.png",
    blocks: [
      h("Modern web products built to perform"),
      p("Next.js is a strong foundation for fast marketing sites, customer experiences and SaaS front-ends—but only when architecture matches the product. We build with performance, SEO, security and maintainable delivery in mind."),
      h("What we build"),
      l([
        "Marketing sites and SaaS front-ends",
        "i18n, auth and dashboard modules",
        "Edge-friendly performance patterns",
        "Deployments on Vercel, Node or your VPS",
      ]),
      h("How we work"),
      p("We define the required user journeys, content model and integrations before selecting the right rendering and hosting approach. Development happens in focused milestones with previews, quality checks and a controlled release."),
      h("What you receive"),
      l(["A scalable Next.js application structure", "Responsive interfaces built from reusable components", "SEO, metadata and analytics foundations", "Integration with CMS, APIs, authentication or payments", "Deployment documentation and optional ongoing support"]),
      h("When Next.js is a good fit"),
      l(["High-performance marketing and multilingual sites", "SaaS dashboards and authenticated portals", "Headless CMS implementations", "Teams replacing slow or difficult-to-maintain front ends"]),
      h("How to start"),
      p("Share your goals, existing systems and target launch window. We turn this into a pragmatic technical scope and a phased delivery plan."),
    ],
    blocksNl: [
      h("Moderne webproducten die presteren"),
      p("Next.js is een sterke basis voor snelle marketingwebsites, klantomgevingen en SaaS-front-ends—maar alleen als de architectuur bij het product past. Wij bouwen met performance, SEO, veiligheid en beheersbare oplevering voor ogen."),
      h("Wat we bouwen"),
      l([
        "Marketing sites en SaaS front-ends",
        "i18n, auth en dashboard-modules",
        "Edge-vriendelijke performance-patronen",
        "Deploys op Vercel, Node of jouw VPS",
      ]),
      h("Hoe we werken"),
      p("We bepalen eerst de benodigde klantreizen, het contentmodel en integraties voordat we rendering en hosting kiezen. Ontwikkeling gebeurt in gerichte mijlpalen met previews, kwaliteitscontroles en een gecontroleerde release."),
      h("Wat je krijgt"),
      l(["Een schaalbare Next.js-applicatiestructuur", "Responsive interfaces met herbruikbare componenten", "SEO-, metadata- en analyticsfundament", "Koppelingen met CMS, API’s, authenticatie of betalingen", "Deploydocumentatie en optionele doorlopende support"]),
      h("Wanneer Next.js past"),
      l(["Snelle marketing- en meertalige websites", "SaaS-dashboards en afgeschermde portalen", "Headless CMS-implementaties", "Teams die een trage of lastig te beheren front-end vervangen"]),
      h("Aan de slag"),
      p("Deel jouw doelen, bestaande systemen en gewenste livegang. Wij vertalen dit naar een pragmatische technische scope en gefaseerd opleverplan."),
    ],
  },
  "html-css-javascript": {
    title: "HTML / CSS / JavaScript",
    titleNl: "HTML / CSS / JavaScript",
    subtitle: "Lean front-end builds when you do not need a CMS.",
    subtitleNl: "Slanke front-end builds wanneer je geen cms nodig hebt.",
    image: "/uploads/fixweb/html-css-javascript.png",
    blocks: [
      h("Lean front ends with no unnecessary platform"),
      p("Not every project needs a CMS or application framework. For campaigns, landing pages and focused digital experiences, a well-built HTML, CSS and JavaScript site is fast, durable and simple to host."),
      h("What we deliver"),
      l([
        "Landing pages and microsites",
        "Interactive UI and animations",
        "Cross-browser QA",
        "Handoff-ready assets for your team",
      ]),
      h("How we build"),
      p("We translate your design and content into semantic markup, responsive styling and purposeful interactions. Each build is tested across current browsers and devices, with attention to accessibility, page weight and forms."),
      h("What you receive"),
      l(["Clean, maintainable source code", "Responsive pages and reusable styles", "Optimised assets and performance checks", "Analytics, forms or API connections where needed", "Deployment guidance or launch support"]),
      h("Ideal for"),
      l(["Campaign landing pages and product launches", "Microsites and event pages", "Teams with a finished design that need reliable implementation", "Businesses that want a fast site without CMS overhead"]),
      h("How to start"),
      p("Send your goals, sitemap and any existing designs or brand assets. We define the pages, interactions and launch requirements before building."),
    ],
    blocksNl: [
      h("Slanke front-ends zonder onnodig platform"),
      p("Niet elk project heeft een CMS of applicatieframework nodig. Voor campagnes, landingspagina’s en gerichte digitale ervaringen is een goed gebouwde HTML-, CSS- en JavaScript-site snel, duurzaam en eenvoudig te hosten."),
      h("Wat we opleveren"),
      l([
        "Landingspagina’s en microsites",
        "Interactieve UI en animaties",
        "Cross-browser QA",
        "Opleverklare assets voor jouw team",
      ]),
      h("Hoe we bouwen"),
      p("We vertalen jouw ontwerp en content naar semantische markup, responsive styling en doelgerichte interacties. Elke build testen we in actuele browsers en op apparaten, met aandacht voor toegankelijkheid, paginagewicht en formulieren."),
      h("Wat je krijgt"),
      l(["Schone, onderhoudbare broncode", "Responsive pagina’s en herbruikbare stijlen", "Geoptimaliseerde assets en performancechecks", "Analytics, formulieren of API-koppelingen waar nodig", "Deployadvies of launchsupport"]),
      h("Ideaal voor"),
      l(["Campagnelandingspagina’s en productlanceringen", "Microsites en eventpagina’s", "Teams met een uitgewerkt ontwerp die betrouwbare implementatie zoeken", "Bedrijven die een snelle site zonder CMS-overhead willen"]),
      h("Aan de slag"),
      p("Stuur jouw doelen, sitemap en eventuele bestaande ontwerpen of merkassets. We bepalen eerst pagina’s, interacties en launchvereisten."),
    ],
  },
  "website-maintenance": {
    title: "Maintenance & Updates",
    titleNl: "Onderhoud en updates",
    subtitle: "Keep custom sites healthy after launch.",
    subtitleNl: "Houd maatwerk sites gezond na livegang.",
    image: "/uploads/fixweb/website-maintenance.png",
    blocks: [
      h("Keep your custom website dependable after launch"),
      p("Launching is the beginning, not the end. Dependencies change, integrations fail and business priorities move. Our maintenance service gives custom websites and applications a planned rhythm for care, fixes and improvement."),
      h("What is included"),
      l([
        "Security and dependency updates",
        "Uptime checks and incident response",
        "Bugfixes and small feature iterations",
        "Monthly performance and SEO health notes",
      ]),
      h("How we work"),
      p("We agree a practical service rhythm around your site’s importance. Planned work is prioritised in a visible backlog; incidents are triaged against agreed critical paths such as lead forms, login, checkout and key integrations."),
      h("What you receive"),
      l(["Regular technical health checks", "A prioritised backlog and transparent effort estimates", "Release testing and rollback awareness", "Concise reporting on updates, incidents and recommendations", "Access to the team that understands your stack"]),
      h("Ideal for"),
      l(["Custom PHP, Next.js and static websites", "Lead-generation sites where downtime costs enquiries", "Product teams needing a flexible external partner", "Organisations without a permanent web operations role"]),
      h("Start with a health check"),
      p("We review your stack, hosting and current risks, then propose the right maintenance cadence and a first set of priorities."),
    ],
    blocksNl: [
      h("Houd jouw maatwerkwebsite betrouwbaar na livegang"),
      p("Livegang is het begin, niet het einde. Dependencies veranderen, integraties kunnen falen en bedrijfsprioriteiten verschuiven. Met ons onderhoud krijgt jouw maatwerkwebsite of applicatie een vast ritme voor beheer, fixes en verbetering."),
      h("Wat erbij zit"),
      l([
        "Security- en dependency-updates",
        "Uptime-checks en incident response",
        "Bugfixes en kleine feature-iteraties",
        "Maandelijkse performance- en SEO-notities",
      ]),
      h("Hoe we werken"),
      p("We spreken een praktisch serviceritme af dat past bij het belang van jouw site. Gepland werk prioriteren we in een zichtbare backlog; incidenten beoordelen we op afgesproken kritieke paden zoals leadformulieren, login, checkout en integraties."),
      h("Wat je krijgt"),
      l(["Regelmatige technische health checks", "Een geprioriteerde backlog met transparante inschattingen", "Releasetests en aandacht voor rollback", "Beknopte rapportage over updates, incidenten en adviezen", "Toegang tot een team dat jouw stack kent"]),
      h("Ideaal voor"),
      l(["Maatwerk PHP-, Next.js- en statische websites", "Leadgeneratiesites waar downtime aanvragen kost", "Productteams die een flexibele externe partner nodig hebben", "Organisaties zonder vaste weboperationsrol"]),
      h("Start met een health check"),
      p("We beoordelen jouw stack, hosting en huidige risico’s en stellen daarna het juiste onderhoudsritme en een eerste prioriteitenlijst voor."),
    ],
  },
  "api-integrations": {
    title: "API Integrations",
    titleNl: "API-integraties",
    subtitle: "Connect the tools your business already runs on.",
    subtitleNl: "Koppel de tools waarmee jouw bedrijf al werkt.",
    image: "/uploads/fixweb/api-integrations.png",
    blocks: [
      h("Make the systems behind your business work together"),
      p("Manual copying between CRM, finance, e-commerce and internal tools costs time and introduces errors. We create reliable API integrations that move the right data between systems with clear ownership and observability."),
      h("Common integration work"),
      l([
        "CRM, billing and ERP connectors",
        "Payment providers and webhooks",
        "AI / automation endpoints",
        "Error handling, logging and retries",
      ]),
      h("Our approach"),
      p("We map the business process before writing code: which system is authoritative, what triggers an action, which data can move and what must happen when an external service is unavailable. This prevents fragile point-to-point connections."),
      h("What you receive"),
      l(["Integration design and data-mapping documentation", "Secure authenticated connections and secret handling", "Validation, retry logic and meaningful error logging", "Testing with representative records and edge cases", "Handover notes and monitoring recommendations"]),
      h("Ideal for"),
      l(["Businesses connecting CRM, ERP, billing or customer portals", "Webshops synchronising orders, stock or customer data", "Teams replacing repetitive spreadsheet-based processes", "Platforms exposing reliable APIs to customers or partners"]),
      h("How to start"),
      p("Tell us the systems, the process and the outcome you need. We assess the available APIs and scope a robust integration path."),
    ],
    blocksNl: [
      h("Laat de systemen achter jouw bedrijf samenwerken"),
      p("Handmatig kopiëren tussen CRM, finance, e-commerce en interne tools kost tijd en veroorzaakt fouten. Wij bouwen betrouwbare API-integraties die de juiste data verplaatsen, met duidelijk eigenaarschap en inzicht in de werking."),
      h("Veelvoorkomende integraties"),
      l([
        "CRM-, facturatie- en ERP-koppelingen",
        "Payment providers en webhooks",
        "AI- / automatiserings-endpoints",
        "Foutafhandeling, logging en retries",
      ]),
      h("Onze aanpak"),
      p("Voor we code schrijven brengen we het bedrijfsproces in kaart: welk systeem is leidend, wat triggert een actie, welke data mag bewegen en wat gebeurt er als een externe dienst niet beschikbaar is. Zo voorkomen we kwetsbare punt-naar-puntkoppelingen."),
      h("Wat je krijgt"),
      l(["Integratieontwerp en documentatie van datamapping", "Veilige geauthenticeerde koppelingen en secretbeheer", "Validatie, retrylogica en bruikbare foutlogging", "Tests met representatieve records en uitzonderingen", "Overdrachtsnotities en monitoringadvies"]),
      h("Ideaal voor"),
      l(["Bedrijven die CRM, ERP, facturatie of klantportalen koppelen", "Webshops die orders, voorraad of klantdata synchroniseren", "Teams die repeterende spreadsheetprocessen vervangen", "Platforms die betrouwbare API’s aan klanten of partners bieden"]),
      h("Aan de slag"),
      p("Vertel welke systemen, welk proces en welke uitkomst je nodig hebt. Wij beoordelen de beschikbare API’s en bakenen een robuuste integratieroute af."),
    ],
  },
  "website-malware-removal": {
    title: "Malware Removal",
    titleNl: "Malware verwijderen",
    subtitle:
      "Detect and remove malware from custom PHP, HTML and Next.js websites — without breaking your application.",
    subtitleNl:
      "Detecteer en verwijder malware van maatwerk PHP-, HTML- en Next.js-websites — zonder jouw applicatie te breken.",
    image: "/uploads/fixweb/website-malware-removal.png",
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
        "Je krijgt een helder rapport en vervolgstappen. Voor structurele bescherming combineert je dit met onze aparte dienst Beveiliging — deze pagina gaat alleen over malware verwijderen.",
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
    image: "/uploads/fixweb/website-security.png",
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
        "Preventie telt net zo zwaar als opruimen. Wij hardenen jouw non-WordPress stack met SSL/HTTPS, firewall/WAF-advies en toegangscontrole — los van malware verwijderen en los van WordPress-securitypakketten.",
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
        "Eenmalig harden na launch of audit, of een retainer met periodieke checks. Ben je al geïnfecteerd? Start met Malware verwijderen — harden daarna met Firewall, Security en SSL.",
      ),
    ],
  },
  "website-speed-optimization": {
    title: "Performance & Speed Optimization",
    titleNl: "Prestaties en snelheid",
    subtitle:
      "Cut load times and improve Core Web Vitals for custom front-ends and APIs — not a WordPress cache plugin.",
    subtitleNl:
      "Verkort laadtijden en verbeter core web vitals voor maatwerk front-ends en API’s — geen WordPress cache-plugin.",
    image: "/uploads/fixweb/website-speed-optimization.png",
    blocks: [
      h("Performance that supports visibility and conversion"),
      p("Slow pages cost attention, enquiries and trust. We investigate the real causes across your front end, hosting and APIs, then make targeted improvements that benefit visitors and your Core Web Vitals—not a generic cache-plugin installation."),
      h("What we investigate and optimise"),
      l([
        "Lighthouse / Web Vitals baseline and target plan",
        "Asset strategy: images, fonts, code splitting, lazy loading",
        "Server and CDN caching for custom apps",
        "Database and API response tuning",
        "Rendering path improvements (SSR/ISR/static where useful)",
        "Before/after report with measurable gains",
      ]),
      h("Our approach"),
      p("We start with a baseline on the pages and devices that matter to your audience. The work is prioritised by expected impact and technical effort, tested in a safe environment and measured again after release."),
      h("What you receive"),
      l(["Performance baseline and prioritised action plan", "Implemented improvements across code, assets or infrastructure", "Before-and-after Core Web Vitals evidence", "Clear explanation of trade-offs and remaining opportunities", "Recommendations for keeping performance stable as the site grows"]),
      h("Ideal for"),
      l(["Lead-generation and e-commerce websites", "Custom PHP or Next.js applications with slow journeys", "Teams preparing a campaign, redesign or SEO push", "Businesses that need evidence before investing in a rebuild"]),
      h("How to start"),
      p("Share the affected URLs, your analytics context and any recent changes. We assess the highest-value performance work and propose a focused optimisation sprint."),
    ],
    blocksNl: [
      h("Performance die zichtbaarheid en conversie ondersteunt"),
      p("Trage pagina’s kosten aandacht, aanvragen en vertrouwen. We onderzoeken de echte oorzaken in front-end, hosting en API’s en verbeteren gericht wat bezoekers en jouw Core Web Vitals helpt—niet alleen met een generieke cache-plugin."),
      h("Wat we onderzoeken en optimaliseren"),
      l([
        "Lighthouse / Web Vitals-baseline en doelplan",
        "Asset-strategie: images, fonts, code splitting, lazy loading",
        "Server- en CDN-caching voor maatwerk apps",
        "Database- en API-responstuning",
        "Rendering-pad verbeteren (SSR/ISR/static waar nuttig)",
        "Voor/na-rapport met meetbare winst",
      ]),
      h("Onze aanpak"),
      p("We starten met een nulmeting op de pagina’s en apparaten die voor jouw doelgroep tellen. We prioriteren op verwachte impact en technische inspanning, testen veilig en meten na livegang opnieuw."),
      h("Wat je krijgt"),
      l(["Performance-baseline en geprioriteerd actieplan", "Geïmplementeerde verbeteringen in code, assets of infrastructuur", "Voor- en nameting van Core Web Vitals", "Heldere uitleg van afwegingen en resterende kansen", "Advies om performance stabiel te houden terwijl de site groeit"]),
      h("Ideaal voor"),
      l(["Leadgeneratie- en e-commercewebsites", "Maatwerk PHP- of Next.js-applicaties met trage klantreizen", "Teams die een campagne, redesign of SEO-traject voorbereiden", "Bedrijven die bewijs willen vóór ze in een rebuild investeren"]),
      h("Aan de slag"),
      p("Deel de betreffende URL’s, analyticscontext en recente wijzigingen. Wij beoordelen het meest waardevolle optimalisatiewerk en stellen een gerichte sprint voor."),
    ],
  },
  "website-backup-migration": {
    title: "Backups and Migration",
    titleNl: "Backups en migratie",
    subtitle:
      "Reliable backups and low-downtime migrations for custom websites, PHP apps and Next.js projects.",
    subtitleNl:
      "Betrouwbare backups en migraties met minimale downtime voor maatwerk websites, PHP-apps en Next.js-projecten.",
    image: "/uploads/fixweb/website-backup-migration.png",
    blocks: [
      h("Move infrastructure with control, not disruption"),
      p("A hosting move or recovery is a business-critical change. We prepare the data, environments, DNS and verification steps so your custom website or application moves cleanly, with a tested rollback option if anything unexpected occurs."),
      h("What is included"),
      l([
        "Full backup of files, databases and environment config",
        "Migration to new VPS, cloud or managed hosting",
        "DNS cutover plan with low/zero downtime windows",
        "SSL, redirects and smoke tests after go-live",
        "Automated backup schedule setup (daily/weekly)",
        "Rollback package stored for the first critical days",
      ]),
      h("Our migration process"),
      p("We audit the current environment, create and verify backups, build the target environment and rehearse critical checks. During cutover we monitor the change, validate data and user journeys, and retain a clear route back until the new setup is proven."),
      h("What you receive"),
      l(["Migration plan with timing, responsibilities and risk points", "Verified backup and restoration approach", "Configured target environment and deployment notes", "Post-migration checks for key pages, forms and integrations", "Handover documentation for ongoing backup and recovery"]),
      h("Ideal for"),
      l(["Moving from shared or legacy hosting", "Migrating PHP applications or Next.js projects", "Businesses needing a reliable disaster-recovery routine", "Teams consolidating hosting or changing cloud providers"]),
      h("How to start"),
      p("Tell us what is moving, where it is hosted and which journeys cannot be interrupted. We assess the complexity and propose a safe migration window."),
    ],
    blocksNl: [
      h("Verhuis infrastructuur gecontroleerd, zonder verstoring"),
      p("Een hostingmigratie of herstel is een bedrijfskritische wijziging. We bereiden data, omgevingen, DNS en verificatiestappen voor zodat jouw maatwerkwebsite of applicatie schoon verhuist, met een geteste rollbackoptie als iets onverwachts gebeurt."),
      h("Wat erbij zit"),
      l([
        "Volledige backup van bestanden, databases en environment-config",
        "Migratie naar nieuwe VPS, cloud of managed hosting",
        "DNS-cutoverplan met lage/zero downtime-windows",
        "SSL, redirects en smoke tests na livegang",
        "Automatische backup-planning (dagelijks/wekelijks)",
        "Rollback-pakket bewaard voor de eerste kritieke dagen",
      ]),
      h("Ons migratieproces"),
      p("We auditen de huidige omgeving, maken en controleren backups, bouwen de doelomgeving en oefenen kritieke checks. Tijdens de cutover monitoren we de wijziging, valideren we data en klantreizen en houden we een duidelijke weg terug totdat de nieuwe setup bewezen is."),
      h("Wat je krijgt"),
      l(["Migratieplan met planning, verantwoordelijkheden en risicopunten", "Geverifieerde backup- en herstelwerkwijze", "Geconfigureerde doelomgeving en deploynotities", "Checks na migratie voor kernpagina’s, formulieren en integraties", "Overdrachtsdocumentatie voor doorlopende backup en herstel"]),
      h("Ideaal wanneer"),
      l(["Je van shared of legacy hosting verhuist", "Je PHP-applicaties of Next.js-projecten migreert", "Jouw bedrijf een betrouwbare disaster-recoveryroutine nodig heeft", "Je hosting wilt consolideren of van cloudprovider verandert"]),
      h("Aan de slag"),
      p("Vertel wat er verhuist, waar het draait en welke klantreizen niet onderbroken mogen worden. Wij beoordelen de complexiteit en stellen een veilig migratiemoment voor."),
    ],
  },
  "logo-brand-identity": {
    title: "Logo & Brand Identity",
    titleNl: "Logo en merkidentiteit",
    subtitle: "Logos and brand systems ready for print and screen.",
    subtitleNl: "Logo’s en merksystemen klaar voor print en scherm.",
    image: "/uploads/fixweb/logo-brand-identity.png",
    blocks: [
      h("A recognisable identity for every touchpoint"),
      p("A logo is only effective when it works consistently across website, social channels, sales material and print. We create practical brand identities that are distinctive, clear and ready for everyday use by your team and suppliers."),
      h("What we create"),
      l([
        "Logo concepts and refinement",
        "Color, type and usage guidelines",
        "Export packs (SVG, PDF, PNG)",
        "Social and stationery adaptations",
      ]),
      h("Our design process"),
      p("We begin with your market, audience and positioning, then explore a small number of considered directions. Feedback is used to refine one route into a complete, usable identity instead of producing endless disconnected concepts."),
      h("What you receive"),
      l(["Refined primary logo and supporting variations", "Colour palette and typography recommendations", "Clear-use guidelines for digital and print", "Organised files for web, social and production", "Optional rollout to website, stationery and campaign assets"]),
      h("Ideal for"),
      l(["New businesses establishing a professional presence", "Companies preparing a rebrand", "Teams whose current identity lacks consistency", "Organisations needing files that printers and developers can use correctly"]),
      h("How to start"),
      p("Share your business, audience, current identity and the places the brand must appear. We propose a focused identity scope and decision process."),
    ],
    blocksNl: [
      h("Een herkenbare identiteit voor elk contactmoment"),
      p("Een logo werkt pas goed wanneer het consistent werkt op jouw website, social kanalen, salesmateriaal en drukwerk. We ontwikkelen praktische merkidentiteiten die onderscheidend, helder en direct bruikbaar zijn voor jouw team en leveranciers."),
      h("Wat we creëren"),
      l([
        "Logo-concepten en uitwerking",
        "Kleur-, lettertype- en gebruiksrichtlijnen",
        "Export packs (SVG, PDF, PNG)",
        "Social- en stationery-varianten",
      ]),
      h("Ons ontwerpproces"),
      p("We starten bij jouw markt, doelgroep en positionering en verkennen vervolgens een klein aantal doordachte richtingen. Met feedback verfijnen we één route tot een complete, bruikbare identiteit, zonder eindeloze losse concepten."),
      h("Wat je krijgt"),
      l(["Verfijnd hoofdlogo en ondersteunende varianten", "Kleurenpalet en typografieadvies", "Duidelijke gebruiksrichtlijnen voor digitaal en print", "Geordende bestanden voor web, social en productie", "Optionele doorvertaling naar website, stationery en campagne-assets"]),
      h("Ideaal voor"),
      l(["Nieuwe bedrijven die professioneel willen starten", "Organisaties die een rebrand voorbereiden", "Teams waarvan de huidige identiteit inconsistent is", "Bedrijven die bestanden nodig hebben die drukkers en developers goed kunnen gebruiken"]),
      h("Aan de slag"),
      p("Deel jouw bedrijf, doelgroep, huidige identiteit en de plekken waar het merk moet verschijnen. Wij stellen een gerichte identiteitsscope en beslisproces voor."),
    ],
  },
  "business-cards": {
    title: "Business Cards",
    titleNl: "Visitekaartjes",
    subtitle:
      "Business card design and printing — from a small starter batch to large team runs.",
    subtitleNl:
      "Visitekaartjes ontwerp en drukwerk — van een kleine startoplage tot grote teamruns.",
    image: "/uploads/fixweb/business-cards.png",
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
        "Wij ontwerpen visitekaartjes die jouw merk uitstralen bij handshakes en meetings — en we kunnen ze voor je drukken in kleine of grote oplages, met de afwerkingen die bij jouw merk passen.",
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
        "Fysieke kaarten nodig? Wij regelen drukwerk in kleine oplages (startsets, pilots, persoonlijke sets) of grote oplages (hele teams, events, rebrands). Je krijgt proofs, heldere papier-/afwerkingskeuzes en leveringscoördinatie.",
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
      "Letterhead and brand stationery — design plus print in small or large quantities.",
    subtitleNl:
      "Briefpapier en huisstijl-stationery — ontwerp plus drukwerk in kleine of grote oplages.",
    image: "/uploads/fixweb/letterhead.png",
    blocks: [
      h("Letterhead & corporate stationery"),
      p(
        "We design letterheads and matching stationery that keep your brand consistent in correspondence — and we can print them for you in small office packs or large company runs.",
      ),
      l([
        "A4 letterhead templates (digital and print)",
        "Continuation sheets where needed",
        "Matching envelopes (DL / C5 and custom)",
        "Brand alignment with logo, color and typography",
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
        "Wij ontwerpen briefpapier en bijpassende stationery die jouw merk consistent houden in correspondentie — en we kunnen ze voor je drukken in kleine kantoorpakketten of grote bedrijfsruns.",
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
        "Bestel wat je nodig hebt: een kleine oplage voor dagelijks gebruik, of een grote oplage voor de hele organisatie. Wij regelen specs, proofs en productie zodat jouw stationery klaar is voor gebruik.",
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
    image: "/uploads/fixweb/flyers-posters.png",
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
        "Campagneconcepten afgestemd op jouw merk",
        "Drukveilige kleur (CMYK), resolutie en bleed",
        "Digitale varianten voor social ads indien nuttig",
      ]),
      h("Drukwerk in kleine of grote oplages"),
      p(
        "Na het ontwerp kunnen we voor je drukken. Een kleine batch nodig voor een lokale promo of pop-up? Of een grote run voor een launch, winkelnetwerk of event? Wij schalen de drukoplage mee met jouw campagne — met proofs en leveringscoördinatie.",
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
        "Briefing → concepten → feedback → finale drukbestanden → optioneel drukwerk in de oplage die je nodig hebt. Eén partner voor ontwerp en printing, zodat er niets tussen bureaus verdwijnt.",
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
    image: "/uploads/fixweb/stickers-packaging.png",
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
        "Wij ontwerpen stickers die scherp staan op product, event en merch — en drukken ze voor je in kleine of grote oplages, met juiste bleed, snijlijnen en afwerkingen.",
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
        "Van een kleine merch drop of giveaway tot een grote product- of eventrun — wij schalen stickerdrukwerk naar de hoeveelheid die je nodig hebt, met proofs vóór productie.",
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
    image: "/uploads/fixweb/magazines-brochures.png",
    blocks: [
      h("Editorial design that makes complex information clear"),
      p("A brochure or magazine has to do more than look polished: it needs to guide readers through a story, product range or proposition. We create considered multi-page layouts that work in print, as a digital PDF and across future editions."),
      h("What we design"),
      l([
        "Brochures, lookbooks and magazines",
        "Master pages, styles and grids",
        "Image prep and prepress checks",
        "Print PDF and interactive PDF options",
      ]),
      h("Our process"),
      p("We establish the purpose, audience, format and content plan first. We then create a grid and visual direction, lay out approved copy and imagery, manage feedback rounds and prepare every page for production."),
      h("Printing and production"),
      p("We can coordinate small runs for pilots or selective distribution as well as larger production for events, mailings and retail. Paper, binding and finishes are recommended against your budget, intended use and delivery requirements."),
      l([
        "Small print runs for tests and selective distribution",
        "Large print runs for campaigns and mass distribution",
        "Paper, binding and finish recommendations",
        "Proof check before full production",
      ]),
      h("What you receive"),
      l(["A structured editorial layout and reusable page system", "Press-ready PDF files with correct bleed and specifications", "Digital PDF version where required", "Production coordination and proof review on request", "Source-file handover by agreement"]),
      h("Ideal for"),
      l(["Company brochures and capability documents", "Product catalogues and lookbooks", "Editorial magazines and annual reports", "Sales packs for events, retail or direct mail"]),
      h("How to start"),
      p("Send us your goal, rough page count, content status and intended distribution. We help define the format, production route and a realistic layout schedule."),
    ],
    blocksNl: [
      h("Redactioneel ontwerp dat complexe informatie helder maakt"),
      p("Een brochure of magazine moet meer doen dan er verzorgd uitzien: lezers moeten gemakkelijk door een verhaal, productaanbod of propositie worden geleid. We creëren doordachte meerpaginayouts die werken in druk, als digitale PDF en in toekomstige edities."),
      h("Wat we ontwerpen"),
      l([
        "Brochures, lookbooks en magazines",
        "Master pages, styles en grids",
        "Beeldbewerking en prepress-checks",
        "Print-PDF en interactieve PDF-opties",
      ]),
      h("Ons proces"),
      p("We bepalen eerst doel, doelgroep, formaat en contentplan. Daarna maken we grid en visuele richting, zetten we goedgekeurde tekst en beeld op, begeleiden we feedbackrondes en bereiden we elke pagina voor op productie."),
      h("Drukwerk en productie"),
      p("We kunnen kleine oplages voor pilots of selectieve verspreiding coördineren, maar ook grotere producties voor events, mailings en retail. Papier, binding en afwerking adviseren we op basis van budget, gebruik en leververeisten."),
      l([
        "Kleine drukoplages voor tests en selectieve distributie",
        "Grote drukoplages voor campagnes en massadistributie",
        "Advies over papier, binding en afwerking",
        "Proof-controle vóór volle productie",
      ]),
      h("Wat je krijgt"),
      l(["Een gestructureerde editorial layout en herbruikbaar paginasysteem", "Drukklare PDF-bestanden met juiste afloop en specificaties", "Digitale PDF-versie waar nodig", "Productiecoördinatie en proofcontrole op verzoek", "Overdracht van bronbestanden in overleg"]),
      h("Ideaal voor"),
      l(["Bedrijfsbrochures en capability documents", "Productcatalogi en lookbooks", "Redactionele magazines en jaarverslagen", "Salespakketten voor events, retail of direct mail"]),
      h("Aan de slag"),
      p("Stuur jouw doel, globale paginatelling, contentstatus en gewenste verspreiding. We helpen het formaat, de productieroute en een realistische layoutplanning bepalen."),
    ],
  },
};

export function listCustomServiceSlugs() {
  return Object.keys(customServices);
}

export function getCustomServiceSource(slug: string) {
  const entry = customServices[slug];
  if (!entry) return null;
  return {
    en: {
      title: entry.title,
      subtitle: entry.subtitle,
      blocks: entry.blocks,
    },
    nl: {
      title: entry.titleNl,
      subtitle: entry.subtitleNl,
      blocks: entry.blocksNl,
    },
  };
}

const OPTIMIZATION_I18N_SLUGS = new Set([
  "ecommerce-seo",
  "conversion-optimization",
  "speed-optimization",
  "analytics-optimization",
  "accessibility-optimization",
]);

function getOptimizationI18nPage(slug: string, locale: string) {
  if (!OPTIMIZATION_I18N_SLUGS.has(slug) || locale === "en" || locale === "nl") {
    return null;
  }
  const localePack = (optimizationI18nPack as Record<
    string,
    Record<string, { title: string; subtitle: string; blocks: ContentBlock[] }>
  >)[locale];
  return localePack?.[slug] ?? null;
}

export function getCustomServiceContent(slug: string, locale: string) {
  const entry = customServices[slug];
  if (!entry) return null;
  if (locale === "nl") {
    return {
      title: entry.titleNl,
      subtitle: entry.subtitleNl,
      price: entry.price ?? null,
      currency: entry.price != null ? "EUR" : null,
      image: entry.image ?? null,
      blocks: entry.blocksNl,
      kind: "page" as const,
    };
  }
  const packPage = getOptimizationI18nPage(slug, locale);
  if (packPage) {
    return {
      title: packPage.title,
      subtitle: packPage.subtitle,
      price: entry.price ?? null,
      currency: entry.price != null ? "EUR" : null,
      image: entry.image ?? null,
      blocks: packPage.blocks?.length ? packPage.blocks : entry.blocks,
      kind: "page" as const,
    };
  }
  const overlay = getLocalizedCopySync<{
    title: string;
    subtitle: string;
    blocks: ContentBlock[];
  }>("custom_service", slug, locale);
  return {
    title: overlay?.title || entry.title,
    subtitle: overlay?.subtitle || entry.subtitle,
    price: entry.price ?? null,
    currency: entry.price != null ? "EUR" : null,
    image: entry.image ?? null,
    blocks: overlay?.blocks?.length ? overlay.blocks : entry.blocks,
    kind: "page" as const,
  };
}

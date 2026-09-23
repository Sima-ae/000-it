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

/** Full bilingual pages for every AI service in the catalog. */
export const aiCustomServices: Record<string, CustomService> = {
  "ai-scan": {
    title: "AI scan",
    titleNl: "AI-scan",
    subtitle:
      "A structured readiness scan for classic search, answer engines and local visibility — AEO, GEO, SEO and technical foundations in one clear scorecard.",
    subtitleNl:
      "Een gestructureerde readiness-scan voor klassieke zoekmachines, AI-antwoorden én lokale vindbaarheid — AEO, GEO, SEO en technische basis in één duidelijke scorekaart.",
    image: "/uploads/fixweb/ai-scan.png",
    blocks: [
      h("What the AI scan evaluates"),
      p(
        "Search is no longer only ten blue links. Your brand must also be understandable to answer engines and discoverable in the right geography. The TripleZero iT AI scan measures how ready your site is for that shift — and what to fix first.",
      ),
      l([
        "AEO signals: answer-ready content, FAQ patterns and entity clarity",
        "GEO readiness: local pack, Maps and geographic search signals",
        "SEO fundamentals: titles, structure, crawlability and on-page clarity",
        "Technical indicators: performance, mobile UX and structural hygiene",
        "Prioritized actions with business impact, not vanity metrics",
      ]),
      h("What you receive"),
      l([
        "A scored overview across AEO, GEO, SEO and AI readiness",
        "Concrete improvement backlog ordered by impact",
        "Clear language for marketers and developers alike",
        "Optional follow-up proposal to execute the fixes",
      ]),
      h("Ideal for"),
      l([
        "Brands launching or redesigning a website",
        "Teams investing in content or paid acquisition",
        "Agencies that need a fast client baseline",
        "Leadership that wants search visibility without guesswork",
      ]),
      h("How to start"),
      p(
        "Run the free scan on your URL, then book a review if you want us to turn findings into a sprint plan. Many clients combine the scan with AEO/GEO optimization or an AI content retainer.",
      ),
    ],
    blocksNl: [
      h("Wat de AI-scan beoordeelt"),
      p(
        "Zoeken is niet meer alleen tien blauwe links. Jouw merk moet ook begrijpelijk zijn voor antwoordenengines en vindbaar in de juiste regio. De TripleZero iT AI-scan meet hoe klaar jouw site is voor die verschuiving — en wat je eerst moet fixen.",
      ),
      l([
        "AEO-signalen: antwoordklare content, FAQ-patronen en entity-clarity",
        "GEO-readiness: local pack, Maps en geografische zoeksignalen",
        "SEO-fundamentals: titles, structuur, crawlbaarheid en on-page duidelijkheid",
        "Technische indicatoren: performance, mobile UX en structurele hygiëne",
        "Geprioriteerde acties met business-impact, geen vanity metrics",
      ]),
      h("Wat je krijgt"),
      l([
        "Een score-overzicht over AEO, GEO, SEO en AI-readiness",
        "Concrete verbeterbacklog op impact gesorteerd",
        "Duidelijke taal voor marketeers én developers",
        "Optioneel vervolgvoorstel om fixes uit te voeren",
      ]),
      h("Ideaal voor"),
      l([
        "Merken die een site lanceren of herontwerpen",
        "Teams die investeren in content of paid acquisition",
        "Bureaus die snel een baseline voor klanten nodig hebben",
        "Management dat zoekzichtbaarheid wil zonder giswerk",
      ]),
      h("Aan de slag"),
      p(
        "Start de gratis scan op jouw URL en plan desgewenst een review. Veel klanten combineren de scan met AEO/GEO-optimalisatie of een AI-content-retainer.",
      ),
    ],
  },

  "aeo-optimization": {
    title: "AEO Optimization",
    titleNl: "AEO optimalisatie",
    subtitle:
      "Answer Engine Optimization so your brand shows up in AI answers — clear, citable and trusted, aligned with SEO and GEO.",
    subtitleNl:
      "Answer engine optimization zodat jouw merk verschijnt in AI-antwoorden — helder, citeerbaar en betrouwbaar, afgestemd op SEO en GEO.",
    image: "/uploads/fixweb/aeo-optimalisatie.png",
    blocks: [
      h("Why AEO matters"),
      p(
        "Users increasingly ask AI systems for recommendations, comparisons and how-tos. If your pages are not structured for answers, you lose visibility even when classic rankings look fine.",
      ),
      h("What we optimize"),
      l([
        "Question–answer content architecture and FAQ blocks",
        "Entity clarity: who you are, what you offer, where you operate",
        "Structured data and semantic headings that support extraction",
        "Evidence, sources and E-E-A-T signals AI systems prefer",
        "Internal linking that reinforces topical authority",
      ]),
      h("AEO with SEO and GEO"),
      p(
        "AEO works best when it is not a silo. We align answer-ready content with technical SEO health and geographic search signals so classic rankings, local visibility and AI answers reinforce each other — one backlog, shared priorities and shared measurement.",
      ),
      l([
        "Intent research spanning classic, local and AI-assisted queries",
        "On-page upgrades that serve rankings and answer extraction",
        "Templates for service, product and hub pages",
        "Reporting that links organic + AI-assisted demand to leads",
      ]),
      h("Deliverables"),
      l([
        "AEO audit against your priority topics and competitors",
        "Content and template blueprint for answer-ready pages",
        "Implementation on WordPress, Next.js or your CMS",
        "Measurement framework for citations, branded queries and assisted traffic",
        "Optional 90-day execution plan after an AI scan baseline",
      ]),
      h("Best paired with"),
      p(
        "GEO (geographic) optimization, AI content strategy and a periodic AI scan to track readiness as models and SERPs evolve.",
      ),
    ],
    blocksNl: [
      h("Waarom AEO telt"),
      p(
        "Gebruikers vragen AI-systemen steeds vaker om aanbevelingen, vergelijkingen en how-to’s. Als jouw pagina’s niet als antwoorden zijn opgebouwd, verlies je zichtbaarheid — ook als klassieke rankings goed lijken.",
      ),
      h("Wat we optimaliseren"),
      l([
        "Vraag–antwoord contentarchitectuur en FAQ-blokken",
        "Entity-clarity: wie je bent, wat je biedt, waar je actief bent",
        "Structured data en semantische headings die extractie ondersteunen",
        "Bewijs, bronnen en E-E-A-T-signalen die AI-systemen prefereren",
        "Interne linking die topical authority versterkt",
      ]),
      h("AEO met SEO en GEO"),
      p(
        "AEO werkt het best wanneer het geen silo is. Wij stemmen antwoordklare content af op technische SEO-health en geografische zoeksignalen zodat klassieke rankings, lokale vindbaarheid en AI-antwoorden elkaar versterken — één backlog, gedeelde prioriteiten en gedeelde meting.",
      ),
      l([
        "Intent-onderzoek over klassieke, lokale én AI-assisted queries",
        "On-page upgrades die rankings én antwoordextractie dienen",
        "Templates voor dienst-, product- en hubpagina’s",
        "Rapportage die organische + AI-assisted vraag koppelt aan leads",
      ]),
      h("Opleveringen"),
      l([
        "AEO-audit op jouw prioriteitsthema’s en concurrenten",
        "Content- en templateblueprint voor antwoordklare pagina’s",
        "Implementatie op WordPress, Next.js of jouw CMS",
        "Meetkader voor citaties, branded queries en assisted traffic",
        "Optioneel 90-dagen uitvoeringsplan na een AI-scan baseline",
      ]),
      h("Sterk in combinatie met"),
      p(
        "GEO (geografische) optimalisatie, AI-contentstrategie en een periodieke AI-scan om readiness te volgen naarmate models en SERPs veranderen.",
      ),
    ],
  },

  "geo-optimization": {
    title: "GEO Optimization",
    titleNl: "GEO optimalisatie",
    subtitle:
      "Geographic Search Engine Optimization so customers nearby find you — on Maps, local packs and location-based search.",
    subtitleNl:
      "Geographic Search Engine Optimization zodat klanten in jouw regio je vinden — in Maps, local packs en locatiegericht zoeken.",
    image: "/uploads/fixweb/geo-optimization.png",
    blocks: [
      h("GEO vs classic SEO"),
      p(
        "Geographic Search Engine Optimization (GEO) focuses on visibility where place matters: Google Maps, the local pack, “near me” queries and city- or region-specific searches. Classic SEO builds topical authority; GEO makes sure your business shows up in the right geography at the right moment.",
      ),
      h("Our GEO approach"),
      l([
        "Google Business Profile optimization and review strategy",
        "Consistent NAP (name, address, phone) across directories and citations",
        "Location and service-area pages with clear local intent",
        "Local schema, maps embeds and geo-relevant internal linking",
        "Local keyword research and competitor gap analysis by city/region",
        "Monitoring of Maps rankings, local pack presence and call/direction actions",
      ]),
      h("Outcomes you can expect"),
      l([
        "Stronger presence in local packs and Maps for priority areas",
        "More qualified leads from nearby customers and service areas",
        "Cleaner location signals so search engines trust where you operate",
        "A scalable playbook when you expand to new cities or branches",
      ]),
      h("Engagement model"),
      p(
        "Start with a local audit + quick wins, then a monthly GEO retainer for listings, location content and monitoring — or a fixed project for a multi-location rollout or redesign.",
      ),
    ],
    blocksNl: [
      h("GEO vs klassieke SEO"),
      p(
        "Geographic Search Engine Optimization (GEO) richt zich op vindbaarheid waar locatie telt: Google Maps, de local pack, “bij mij in de buurt”-zoekopdrachten en stad- of regiozoeken. Klassieke SEO bouwt topical authority; GEO zorgt dat jouw bedrijf op de juiste plek op het juiste moment zichtbaar is.",
      ),
      h("Onze GEO-aanpak"),
      l([
        "Optimalisatie van Google Business Profile en reviewstrategie",
        "Consistente NAP (naam, adres, telefoon) in directories en citaties",
        "Locatie- en werkgebiedpagina’s met duidelijke lokale intentie",
        "Lokale schema, kaarten en geo-relevante interne linking",
        "Lokaal keywordonderzoek en concurrentieanalyse per stad/regio",
        "Monitoring van Maps-rankings, local-pack aanwezigheid en bel-/route-acties",
      ]),
      h("Resultaten die je mag verwachten"),
      l([
        "Sterkere aanwezigheid in local packs en Maps voor prioriteitsgebieden",
        "Meer gekwalificeerde leads van klanten in de buurt en werkgebieden",
        "Schonere locatiesignalen zodat zoekmachines vertrouwen waar je actief bent",
        "Een schaalbaar playbook wanneer je uitbreidt naar nieuwe steden of vestigingen",
      ]),
      h("Samenwerkingsvorm"),
      p(
        "Start met een lokale audit + quick wins, daarna een maandelijkse GEO-retainer voor listings, locatiecontent en monitoring — of een vast project voor multi-locatie rollout of redesign.",
      ),
    ],
  },

  "text-optimization": {
    title: "Text Optimization",
    titleNl: "Teksten optimaliseren",
    subtitle:
      "Professional copy that ranks, persuades and converts — clearer headlines, stronger page structure and wording aligned with SEO, AEO and your brand voice.",
    subtitleNl:
      "Professionele teksten die ranken, overtuigen en converteren — heldere koppen, sterkere paginastructuur en formulering afgestemd op AEO, GEO en SEO plus jouw bedrijfsnaam en/of merknaam.",
    image: "/uploads/fixweb/text-optimization.png",
    blocks: [
      h("Why text optimization matters"),
      p(
        "Search engines, AI answer systems and real visitors all judge your pages by the quality of the writing. Weak headlines, vague benefits and thin paragraphs cost rankings and leads — even when the design and technical SEO look fine.",
      ),
      h("What we optimize"),
      l([
        "Page titles, H1–H3 hierarchy and meta descriptions",
        "Hero copy, value propositions and CTAs",
        "Service, product and landing-page body text",
        "FAQs and answer-ready blocks for AEO",
        "Internal link anchors and supporting microcopy",
        "Tone of voice consistency across NL and EN (and more locales on request)",
      ]),
      h("How we work"),
      p(
        "We start from your offer, audience and search intent — then rewrite or restructure the highest-impact pages first. Every edit balances clarity for humans with signals that help classic SEO and answer engines extract trustworthy statements.",
      ),
      l([
        "Audit of current copy against competitors and intent",
        "Keyword and question research woven into natural language",
        "Rewrite drafts with clear hierarchy and scannable sections",
        "Review round with your team before go-live",
        "Optional CMS implementation on WordPress, Next.js or your stack",
      ]),
      h("Deliverables"),
      l([
        "Prioritized text audit with quick wins and deeper rewrites",
        "Optimized copy for agreed pages (or a fixed package of URLs)",
        "Headline and CTA variants ready to test",
        "Style notes so future content stays on-brand",
        "Handover document for your marketing or content team",
      ]),
      h("Ideal for"),
      l([
        "Sites that rank but convert poorly",
        "New services or products that need sharp positioning",
        "Teams refreshing outdated or AI-generic copy",
        "Businesses aligning SEO/AEO with clearer customer language",
      ]),
      h("Best paired with"),
      p(
        "SEO optimization, AEO optimization, AI content strategy and content writing — so technical visibility and persuasive copy reinforce each other.",
      ),
      h("How to start"),
      p(
        "Share your priority URLs and goals (leads, rankings or clarity). We propose a focused rewrite scope or a monthly text-optimization retainer.",
      ),
    ],
    blocksNl: [
      h("Waarom teksten optimaliseren telt"),
      p(
        "Zoekmachines, AI-antwoordsystemen én echte bezoekers beoordelen jouw pagina’s op de kwaliteit van de tekst. Zwakke koppen, vage voordelen en dunne alinea’s kosten rankings én leads — ook als design en technische SEO op orde lijken.",
      ),
      h("Wat we optimaliseren"),
      l([
        "Paginatitels, H1–H3-hiërarchie en meta descriptions",
        "Hero-teksten, value propositions en CTA’s",
        "Dienst-, product- en landingspaginateksten",
        "FAQ’s en antwoordklare blokken voor AEO",
        "Ankerteksten van interne links en ondersteunende microcopy",
        "Consistente merkstem in NL en EN (meer talen op aanvraag)",
      ]),
      h("Hoe we werken"),
      p(
        "We starten bij jouw aanbod, doelgroep en zoekintentie — en herschrijven of herstructureren eerst de pagina’s met de grootste impact. Elke aanpassing balanseert helderheid voor mensen met signalen waarmee klassieke SEO en answer engines betrouwbare statements kunnen extraheren.",
      ),
      l([
        "Audit van huidige copy ten opzichte van concurrenten en intentie",
        "Keyword- en vraagonderzoek verwerkt in natuurlijke taal",
        "Herschrijfvoorstellen met duidelijke hiërarchie en scanbare secties",
        "Reviewronde met jouw team vóór livegang",
        "Optionele CMS-implementatie op WordPress, Next.js of jouw stack",
      ]),
      h("Opleveringen"),
      l([
        "Geprioriteerde tekstaudit met quick wins en diepere herschrijvingen",
        "Geoptimaliseerde copy voor afgesproken pagina’s (of een vast URL-pakket)",
        "Headline- en CTA-varianten klaar om te testen",
        "Style notes zodat nieuwe content on-brand blijft",
        "Overdrachtsdocument voor marketing of contentteam",
      ]),
      h("Ideaal voor"),
      l([
        "Sites die ranken maar slecht converteren",
        "Nieuwe diensten of producten die scherpe positionering nodig hebben",
        "Teams die verouderde of generieke AI-copy willen aanscherpen",
        "Bedrijven die SEO/AEO willen koppelen aan heldere klanttaal",
      ]),
      h("Sterk in combinatie met"),
      p(
        "SEO-optimalisatie, AEO-optimalisatie, AI-contentstrategie en content writing — zodat technische vindbaarheid en overtuigende copy elkaar versterken.",
      ),
      h("Aan de slag"),
      p(
        "Deel jouw prioritaire URL’s en doelen (leads, rankings of duidelijkheid). Wij stellen een gerichte herschrijfscope of een maandelijkse retainer voor teksten optimaliseren voor.",
      ),
    ],
  },

  "ecommerce-seo": {
    title: "E-commerce SEO",
    titleNl: "E-commerce SEO",
    subtitle:
      "Product, category and technical SEO for webshops — more organic traffic and better-qualified buyers.",
    subtitleNl:
      "Product-, categorie- en technische SEO voor webshops — meer organisch verkeer en beter gekwalificeerde kopers.",
    image: "/uploads/fixweb/seo-optimization.png",
    blocks: [
      h("SEO built for shops"),
      p(
        "Webshops need more than a few blog posts. We optimise product and category architecture, filters, indexation and commercial search intent so organic traffic turns into baskets — not bounce.",
      ),
      h("What we optimise"),
      l([
        "Category and product page templates (titles, descriptions, schema)",
        "Faceted navigation, crawl budget and duplicate-content control",
        "Internal linking between collections, products and guides",
        "Technical hygiene: speed signals, mobile UX, XML sitemaps",
        "Content for commercial queries: comparisons, FAQs and buying guides",
        "International / multilingual setups when relevant",
      ]),
      h("Outcomes"),
      l([
        "Stronger rankings for money keywords and category terms",
        "Cleaner indexation and less wasted crawl on thin or duplicate URLs",
        "More qualified organic sessions that reach product and checkout",
        "A repeatable SEO playbook as your catalogue grows",
      ]),
      h("Best paired with"),
      p(
        "SEO optimization, conversion optimization, Core Web Vitals & speed and AI in e-commerce — so visibility, experience and conversion reinforce each other.",
      ),
      h("How to start"),
      p(
        "Share your shop URL, CMS (WooCommerce, Shopify, custom) and top revenue categories. We propose an audit plus a fixed sprint or monthly e-commerce SEO retainer.",
      ),
    ],
    blocksNl: [
      h("SEO gebouwd voor webshops"),
      p(
        "Webshops hebben meer nodig dan een paar blogposts. Wij optimaliseren product- en categoriearchitectuur, filters, indexatie en commerciële zoekintentie zodat organisch verkeer in mandjes eindigt — niet in bounce.",
      ),
      h("Wat we optimaliseren"),
      l([
        "Categorie- en productpagina-templates (titels, beschrijvingen, schema)",
        "Gefacetteerde navigatie, crawl budget en duplicate-content-controle",
        "Interne linking tussen collecties, producten en gidsen",
        "Technische hygiene: snelheidssignalen, mobile UX, XML-sitemaps",
        "Content voor commerciële queries: vergelijkingen, FAQ’s en koopgidsen",
        "Internationale / meertalige setups indien relevant",
      ]),
      h("Resultaten"),
      l([
        "Sterkere rankings op money-keywords en categorietermen",
        "Schonere indexatie en minder verspilde crawl op dunne of dubbele URL’s",
        "Meer gekwalificeerde organische sessies die product en checkout bereiken",
        "Een herhaalbaar SEO-playbook terwijl jouw catalogus groeit",
      ]),
      h("Sterk in combinatie met"),
      p(
        "SEO-optimalisatie, conversie-optimalisatie, Core Web Vitals en snelheid en AI in e-commerce — zodat vindbaarheid, ervaring en conversie elkaar versterken.",
      ),
      h("Aan de slag"),
      p(
        "Deel jouw shop-URL, CMS (WooCommerce, Shopify, maatwerk) en top-omzetcategorieën. Wij stellen een audit plus een vaste sprint of maandelijkse e-commerce SEO-retainer voor.",
      ),
    ],
  },

  "conversion-optimization": {
    title: "Conversion Optimization",
    titleNl: "Conversie-optimalisatie",
    subtitle:
      "CRO for landings, funnels and CTAs — more enquiries and sales from the traffic you already have.",
    subtitleNl:
      "CRO voor landings, funnels en CTA’s — meer aanvragen en verkopen uit het verkeer dat je al hebt.",
    image: "/uploads/fixweb/digital-marketing.png",
    blocks: [
      h("Why CRO matters"),
      p(
        "More traffic without conversion is expensive noise. We improve the journeys that turn visits into leads and sales — messaging, layout, friction and proof — with tests you can measure.",
      ),
      h("What we improve"),
      l([
        "Landing pages, service pages and checkout / form flows",
        "Headlines, CTAs, trust signals and offer clarity",
        "Mobile UX friction and form length",
        "A/B and multivariate tests with clear hypotheses",
        "Heatmaps, session insights and funnel drop-off analysis",
        "Post-click alignment between ads and landing experience",
      ]),
      h("How we work"),
      p(
        "Baseline → hypotheses → design/copy variants → test → learn → roll out winners. You get a prioritised backlog, not random tweaks.",
      ),
      h("Deliverables"),
      l([
        "Conversion audit with quick wins and deeper experiments",
        "Wireframe or copy variants for priority pages",
        "Test plan with success metrics",
        "Implementation support on your CMS or front-end",
        "Report with results and next experiments",
      ]),
      h("Best paired with"),
      p(
        "Text optimization, analytics and measurement, Core Web Vitals & speed and digital marketing — so acquisition, experience and proof work as one system.",
      ),
    ],
    blocksNl: [
      h("Waarom CRO telt"),
      p(
        "Meer traffic zonder conversie is dure ruis. Wij verbeteren de journeys die bezoeken omzetten in leads en verkopen — boodschap, layout, frictie en bewijs — met tests die je kunt meten.",
      ),
      h("Wat we verbeteren"),
      l([
        "Landings-, dienstpagina’s en checkout- / form-flows",
        "Koppen, CTA’s, trust-signalen en aanbodduidelijkheid",
        "Mobile UX-frictie en formuliervragen",
        "A/B- en multivariate tests met heldere hypothesen",
        "Heatmaps, sessie-inzichten en funnel drop-off-analyse",
        "Post-click-afstemming tussen ads en landingservaring",
      ]),
      h("Werkwijze"),
      p(
        "Baseline → hypothesen → design-/copyvarianten → test → leren → winnaars uitrollen. Je krijgt een geprioriteerde backlog, geen willekeurige tweaks.",
      ),
      h("Opleveringen"),
      l([
        "Conversie-audit met quick wins en diepere experimenten",
        "Wireframe- of copyvarianten voor prioriteitspagina’s",
        "Testplan met succesmetrics",
        "Implementatie-ondersteuning op jouw CMS of front-end",
        "Rapport met resultaten en volgende experimenten",
      ]),
      h("Sterk in combinatie met"),
      p(
        "Teksten optimaliseren, analytics en meting, Core Web Vitals en snelheid en digital marketing — zodat acquisitie, ervaring en bewijs als één systeem werken.",
      ),
    ],
  },

  "speed-optimization": {
    title: "Core Web Vitals & speed",
    titleNl: "Core Web Vitals en snelheid",
    subtitle:
      "Faster pages and stronger Core Web Vitals — better UX, rankings and conversion across stacks.",
    subtitleNl:
      "Snellere pagina’s en sterkere Core Web Vitals — betere UX, rankings en conversie op elke stack.",
    image: "/uploads/fixweb/website-speed-optimization.png",
    blocks: [
      h("Performance as a growth lever"),
      p(
        "Slow pages hurt rankings, bounce rates and trust. We improve load times and Core Web Vitals with a stack-agnostic approach — then route to WordPress- or custom-specific work when needed.",
      ),
      h("What we optimise"),
      l([
        "LCP, INP and CLS baselines and targets",
        "Images, fonts, scripts and third-party weight",
        "Caching, CDN and server response time",
        "Critical rendering path and above-the-fold priorities",
        "Hosting and application bottlenecks",
        "Before/after measurement on the pages that matter",
      ]),
      h("WordPress or custom?"),
      p(
        "This page is the starting point for performance as an optimization service. For deep WordPress tune-ups we can continue with WordPress speed optimization; for PHP/Next.js stacks we use website performance & speed.",
      ),
      h("Deliverables"),
      l([
        "Performance audit with prioritised actions",
        "Implemented quick wins and structural fixes",
        "Before/after Core Web Vitals evidence",
        "Guidance to keep speed stable as content grows",
      ]),
      h("How to start"),
      p(
        "Share your URLs, stack and current hosting. We baseline the key journeys and propose a focused speed sprint.",
      ),
    ],
    blocksNl: [
      h("Performance als groeifactor"),
      p(
        "Trage pagina’s schaden rankings, bounce en vertrouwen. Wij verbeteren laadtijden en Core Web Vitals stack-agnostisch — en sturen door naar WordPress- of maatwerkspecifiek werk wanneer nodig.",
      ),
      h("Wat we optimaliseren"),
      l([
        "LCP-, INP- en CLS-baselines en doelen",
        "Images, fonts, scripts en third-party gewicht",
        "Caching, CDN en serverresponstijd",
        "Critical rendering path en above-the-fold prioriteiten",
        "Hosting- en applicatieknelpunten",
        "Voor/na-meting op de pagina’s die ertoe doen",
      ]),
      h("WordPress of maatwerk?"),
      p(
        "Deze pagina is het startpunt voor performance als optimalisatiedienst. Voor diepe WordPress-tune-ups gaan we verder met WordPress-snelheidsoptimalisatie; voor PHP/Next.js-stacks met prestaties en snelheid voor maatwerksites.",
      ),
      h("Opleveringen"),
      l([
        "Performance-audit met geprioriteerde acties",
        "Geïmplementeerde quick wins en structurele fixes",
        "Voor/na-bewijs van Core Web Vitals",
        "Advies om snelheid stabiel te houden terwijl content groeit",
      ]),
      h("Aan de slag"),
      p(
        "Deel jouw URL’s, stack en huidige hosting. Wij baselinen de kernjourneys en stellen een gerichte snelheidssprint voor.",
      ),
    ],
  },

  "analytics-optimization": {
    title: "Analytics and measurement",
    titleNl: "Analytics en meting",
    subtitle:
      "GA4, Search Console and clear reporting so you know what drives leads and revenue.",
    subtitleNl:
      "GA4, Search Console en heldere rapportage zodat je weet wat leads en omzet aandrijft.",
    image: "/uploads/fixweb/seo-optimization.png",
    blocks: [
      h("Measurement you can act on"),
      p(
        "Without clean data, SEO, ads and CRO are guesswork. We set up and refine analytics so you see which channels, pages and campaigns create real business outcomes.",
      ),
      h("What we set up and improve"),
      l([
        "GA4 property structure, events and conversions",
        "Google Search Console coverage and query insights",
        "Tag hygiene (GTM) and consent-aware tracking",
        "Dashboards for traffic, leads, revenue and content",
        "Attribution that matches how your sales cycle works",
        "Alerts for tracking breakage and sudden drops",
      ]),
      h("Deliverables"),
      l([
        "Tracking audit and fix plan",
        "Configured events / conversions for priority goals",
        "A practical dashboard your team will actually use",
        "Documentation for marketing and developers",
        "Optional monthly readout with next actions",
      ]),
      h("Best paired with"),
      p(
        "SEO, conversion optimization and digital marketing — so every euro in acquisition is measured against outcomes, not vanity metrics.",
      ),
    ],
    blocksNl: [
      h("Meting waarop je kunt sturen"),
      p(
        "Zonder schone data zijn SEO, ads en CRO giswerk. Wij richten analytics in en verfijnen die zodat je ziet welke kanalen, pagina’s en campagnes echte businessresultaten opleveren.",
      ),
      h("Wat we inrichten en verbeteren"),
      l([
        "GA4-propertystructuur, events en conversies",
        "Google Search Console-dekking en query-inzichten",
        "Tag-hygiëne (GTM) en consent-bewuste tracking",
        "Dashboards voor traffic, leads, omzet en content",
        "Attributie die past bij jouw salescyclus",
        "Alerts bij trackingfouten en plotselinge dips",
      ]),
      h("Opleveringen"),
      l([
        "Tracking-audit en herstelplan",
        "Geconfigureerde events / conversies voor prioriteitsdoelen",
        "Een praktisch dashboard dat jouw team echt gebruikt",
        "Documentatie voor marketing en developers",
        "Optionele maandelijkse readout met vervolgacties",
      ]),
      h("Sterk in combinatie met"),
      p(
        "SEO, conversie-optimalisatie en digital marketing — zodat elke euro in acquisitie wordt gemeten aan uitkomsten, niet aan vanity metrics.",
      ),
    ],
  },

  "accessibility-optimization": {
    title: "Accessibility",
    titleNl: "Toegankelijkheid",
    subtitle:
      "WCAG-minded improvements so more people can use your site — and search engines understand it better.",
    subtitleNl:
      "WCAG-gerichte verbeteringen zodat meer mensen jouw site kunnen gebruiken — en zoekmachines hem beter begrijpen.",
    image: "/uploads/fixweb/custom-webdesign.png",
    blocks: [
      h("Access is good for people and for business"),
      p(
        "Accessible sites reach more customers, reduce legal risk and often improve SEO and UX at the same time. We harden the foundations: structure, contrast, keyboard use and assistive technology support.",
      ),
      h("What we improve"),
      l([
        "Semantic HTML, headings and landmark structure",
        "Keyboard navigation and focus states",
        "Colour contrast and readable typography",
        "Alt text, forms, errors and ARIA where needed",
        "Media alternatives and skip links",
        "Automated + manual checks against WCAG 2.2 AA targets",
      ]),
      h("Deliverables"),
      l([
        "Accessibility audit with severity and effort",
        "Prioritised fix backlog for design and development",
        "Implementation support or review of your team’s PRs",
        "Retest evidence after remediations",
        "Practical guidelines so new pages stay accessible",
      ]),
      h("How to start"),
      p(
        "Share your key templates (home, service, product, form). We audit those first and propose a remediation sprint aligned with your release calendar.",
      ),
    ],
    blocksNl: [
      h("Toegang is goed voor mensen én business"),
      p(
        "Toegankelijke sites bereiken meer klanten, verlagen juridisch risico en verbeteren vaak tegelijk SEO en UX. Wij versterken de basis: structuur, contrast, toetsenbordgebruik en ondersteuning voor hulptechnologie.",
      ),
      h("Wat we verbeteren"),
      l([
        "Semantische HTML, headings en landmark-structuur",
        "Toetsenbordnavigatie en focusstates",
        "Kleurcontrast en leesbare typografie",
        "Alt-teksten, formulieren, foutmeldingen en ARIA waar nodig",
        "Media-alternatieven en skiplinks",
        "Geautomatiseerde + handmatige checks tegen WCAG 2.2 AA-doelen",
      ]),
      h("Opleveringen"),
      l([
        "Toegankelijkheidsaudit met ernst en effort",
        "Geprioriteerde fix-backlog voor design en development",
        "Implementatie-ondersteuning of review van PR’s van jouw team",
        "Hertest-bewijs na remediaties",
        "Praktische richtlijnen zodat nieuwe pagina’s toegankelijk blijven",
      ]),
      h("Aan de slag"),
      p(
        "Deel jouw kern-templates (home, dienst, product, formulier). Wij auditen die eerst en stellen een remediatiesprint voor die past bij jouw releasekalender.",
      ),
    ],
  },

  "ai-content-strategy": {
    title: "AI Content Strategy",
    titleNl: "AI contentstrategie",
    subtitle:
      "Human-led content systems accelerated by AI — on-brand, SEO/AEO-ready and measurable.",
    subtitleNl:
      "Mensgestuurde contentsystemen versneld met AI — on-brand, SEO/AEO-klaar en meetbaar.",
    image: "/uploads/fixweb/ai-content-strategy.png",
    blocks: [
      h("A content system that uses AI responsibly"),
      p("AI can accelerate research and production, but it cannot replace expertise or judgement. We build a practical content system that gives your team more output while protecting brand voice, factual accuracy and commercial focus."),
      h("What we build"),
      l([
        "Editorial calendars tied to SEO/AEO topic clusters",
        "Brand voice guides and prompt libraries for your team",
        "Landing pages, blogs, FAQs and product copy at scale",
        "Review workflows with fact-check and compliance gates",
        "Performance loops: what ranks, what converts, what to retire",
      ]),
      h("How we develop the strategy"),
      p("We start with your audience, offer, sales journey and existing content. From there we select the topics and formats with the clearest business value, define the production workflow and establish how performance will be reviewed."),
      h("Quality and governance"),
      l([
        "Source requirements and claim standards",
        "Human approval before publish",
        "No duplicate or spun content across locales",
        "Clear ownership between marketing and subject-matter experts",
      ]),
      h("What you receive"),
      l(["Audience and topic-cluster plan", "Editorial calendar with priorities and formats", "Brand voice and prompting guidance", "Templates for briefs, drafting and human review", "Measurement plan linking content to visibility, leads and learning"]),
      h("Ideal for"),
      l(["Marketing teams that need consistent expert content", "B2B businesses building SEO and AEO visibility", "Organisations scaling NL and English content", "Teams that want AI adoption without publishing generic copy"]),
      h("How to start"),
      p("We can begin with a content audit and strategy workshop, a focused production sprint or a monthly retainer. The right option depends on your content maturity and capacity."),
    ],
    blocksNl: [
      h("Een contentsysteem dat AI verantwoord inzet"),
      p("AI kan research en productie versnellen, maar vervangt geen expertise of oordeel. We bouwen een praktisch contentsysteem waarmee jouw team meer kan produceren, zonder concessies aan merkstem, feitelijke juistheid en commerciële focus."),
      h("Wat we bouwen"),
      l([
        "Redactionele kalenders gekoppeld aan SEO/AEO-topicclusters",
        "Merkstem-guides en promptbibliotheken voor jouw team",
        "Landingspagina’s, blogs, FAQ’s en productcopy op schaal",
        "Review-workflows met factcheck en compliance-gates",
        "Performance-loops: wat rankt, wat converteert, wat stoppen",
      ]),
      h("Hoe we de strategie ontwikkelen"),
      p("We starten bij jouw doelgroep, aanbod, sales journey en bestaande content. Daarna kiezen we thema’s en formats met de duidelijkste businesswaarde, bepalen we de productieworkflow en leggen we vast hoe we resultaten evalueren."),
      h("Kwaliteit en governance"),
      l([
        "Bronvereisten en claimstandaarden",
        "Menselijke goedkeuring vóór publicatie",
        "Geen duplicate of gespinde content over locales",
        "Duidelijk ownership tussen marketing en subject-matter experts",
      ]),
      h("Wat je krijgt"),
      l(["Plan voor doelgroep en topicclusters", "Redactionele kalender met prioriteiten en formats", "Richtlijnen voor merkstem en prompting", "Templates voor briefs, drafting en menselijke review", "Meetplan dat content koppelt aan zichtbaarheid, leads en leren"]),
      h("Ideaal voor"),
      l(["Marketingteams die consistente expertcontent nodig hebben", "B2B-bedrijven die SEO- en AEO-zichtbaarheid opbouwen", "Organisaties die NL- en Engelstalige content opschalen", "Teams die AI willen inzetten zonder generieke copy te publiceren"]),
      h("Aan de slag"),
      p("We kunnen beginnen met een contentaudit en strategiesessie, een gerichte productiesprint of een maandelijkse retainer. Wat past, hangt af van jouw contentvolwassenheid en capaciteit."),
    ],
  },

  "ai-chatbots": {
    title: "AI Agents and Chatbots",
    titleNl: "AI agents en chatbots",
    subtitle:
      "Professional AI agents and chatbots that answer, qualify, guide and escalate — grounded in your knowledge, on-brand and built for conversion and support.",
    subtitleNl:
      "Professionele AI-agents en chatbots die antwoorden, kwalificeren, begeleiden en escaleren — grounded in jouw knowledge, on-brand en gebouwd voor conversie en support.",
    image: "/uploads/fixweb/ai-chatbots.png",
    blocks: [
      h("Agents and chatbots — what’s the difference?"),
      p(
        "A chatbot is the conversational interface visitors use on your site or in messaging channels. An AI agent is the role behind it: goals, tools, knowledge access and rules. We design both together so the experience feels helpful — not like a scripted FAQ widget.",
      ),
      h("What we build"),
      l([
        "Website chat agents trained on your pages, FAQs, policies and product data",
        "Support agents that triage, summarize and draft replies with ticket handoff",
        "Sales agents that qualify leads and book appointments",
        "Service finders (“which package fits me?”) with clear recommendations",
        "Internal agents for staff: knowledge search and first-draft answers",
        "Multilingual NL/EN conversations (more languages on request)",
        "Embedded widgets for WordPress, Next.js, PHP and custom stacks",
      ]),
      h("Agent capabilities"),
      l([
        "Retrieve answers from approved knowledge (RAG) instead of inventing facts",
        "Ask clarifying questions before recommending",
        "Capture lead details and sync to CRM",
        "Trigger workflows (create ticket, notify team, schedule call)",
        "Respect tone of voice and brand guidelines",
        "Escalate to a human with full conversation context",
      ]),
      h("ChatBot experiences that convert"),
      l([
        "Proactive greetings on high-intent pages",
        "Guided flows for pricing, demos and support",
        "After-hours coverage without false promises",
        "Mobile-first chat UX that matches your design system",
        "Analytics: engagement, deflection, leads assisted, handoff rate",
      ]),
      h("Safety, privacy and quality"),
      p(
        "Uncontrolled chatbots damage trust. We ship guardrails so agents stay within your facts and policies.",
      ),
      l([
        "Block inventing prices, legal claims or competitor comparisons",
        "Allow/deny topic lists and sensitive-data handling",
        "Human takeover for billing, complaints and VIP cases",
        "GDPR-aware logging and retention options",
        "Review cycles to improve answers from real conversations",
      ]),
      h("How we implement"),
      l([
        "Discovery: goals, channels, knowledge sources and risk level",
        "Knowledge prep and evaluation set (golden questions)",
        "Prototype → soft launch → iterate on tone and accuracy",
        "Integration with CRM, tickets and calendars where needed",
        "Training for your team plus a runbook to update knowledge",
      ]),
      h("Ideal for"),
      l([
        "Service businesses that get the same questions daily",
        "E-commerce and lead-gen sites needing 24/7 first response",
        "Teams that want AI help without losing human control",
        "Brands expanding NL/EN support capacity",
      ]),
      h("Related services"),
      p(
        "For role-based marketing agents (SEO, content, social, ads), see AI Marketing Agents. For multi-step process automation, see AI workflows and AI automatisering.",
      ),
    ],
    blocksNl: [
      h("Agents en chatbots — wat is het verschil?"),
      p(
        "Een chatbot is de conversationele interface die bezoekers gebruiken op jouw site of in messagingkanalen. Een AI-agent is de rol erachter: doelen, tools, knowledge-toegang en regels. Wij ontwerpen beide samen zodat de ervaring behulpzaam voelt — niet als een starre FAQ-widget.",
      ),
      h("Wat we bouwen"),
      l([
        "Website-chatagents getraind op jouw pagina’s, FAQ’s, policies en productdata",
        "Support-agents die triëren, samenvatten en antwoorden draften met ticket-handoff",
        "Sales-agents die leads kwalificeren en afspraken boeken",
        "Service finders (“welk pakket past bij mij?”) met heldere aanbevelingen",
        "Interne agents voor medewerkers: knowledge search en first-draft antwoorden",
        "Meertalige NL/EN-gesprekken (meer talen op verzoek)",
        "Embedded widgets voor WordPress, Next.js, PHP en maatwerkstacks",
      ]),
      h("Agent-mogelijkheden"),
      l([
        "Antwoorden ophalen uit goedgekeurde knowledge (RAG) in plaats van feiten verzinnen",
        "Verduidelijkingsvragen stellen vóór een aanbeveling",
        "Leidgegevens vastleggen en syncen naar CRM",
        "Workflows triggeren (ticket maken, team notificeren, call plannen)",
        "Tone of voice en merkrichtlijnen respecteren",
        "Escaleren naar een mens met volledige gesprekscontext",
      ]),
      h("ChatBot-ervaringen die converteren"),
      l([
        "Proactieve begroetingen op high-intent pagina’s",
        "Guided flows voor pricing, demo’s en support",
        "Outside office hours dekking zonder valse beloftes",
        "Mobile-first chat-UX die bij jouw design system past",
        "Analytics: engagement, deflection, assisted leads, handoff-rate",
      ]),
      h("Veiligheid, privacy en kwaliteit"),
      p(
        "Ongecontroleerde chatbots schaden vertrouwen. Wij leveren guardrails zodat agents binnen jouw feiten en policies blijven.",
      ),
      l([
        "Geen verzonnen prijzen, juridische claims of concurrentievergelijkingen",
        "Allow/deny topiclijsten en gevoelige-dataverwerking",
        "Menselijke overname bij facturatie, klachten en VIP-cases",
        "GDPR-bewuste logging en retentie-opties",
        "Review-cycli om antwoorden te verbeteren uit echte gesprekken",
      ]),
      h("Hoe we implementeren"),
      l([
        "Discovery: doelen, kanalen, knowledge-bronnen en risiconiveau",
        "Knowledge-prep en evaluation set (golden questions)",
        "Prototype → soft launch → itereren op toon en juistheid",
        "Integratie met CRM, tickets en kalenders waar nodig",
        "Training voor jouw team plus een runbook om knowledge te updaten",
      ]),
      h("Ideaal voor"),
      l([
        "Dienstverleners die dagelijks dezelfde vragen krijgen",
        "E-commerce en lead-gen sites die 24/7 first response nodig hebben",
        "Teams die AI-hulp willen zonder menselijke controle te verliezen",
        "Merken die NL/EN-supportcapaciteit willen uitbreiden",
      ]),
      h("Gerelateerde diensten"),
      p(
        "Voor rolgebaseerde marketing-agents (SEO, content, social, ads) zie AI Marketing Agents. Voor multi-step procesautomatisering zie AI workflows en AI automatisering.",
      ),
    ],
  },

  "ai-automation": {
    title: "AI Automation",
    titleNl: "AI automatisering",
    subtitle:
      "Use AI to automate repetitive work across marketing, sales, support and operations — with clear ROI, guardrails and human control where it matters.",
    subtitleNl:
      "Gebruik AI om repetitief werk te automatiseren in marketing, sales, support en operations — met duidelijke roi, guardrails en menselijke controle waar het telt.",
    image: "/uploads/fixweb/ai-automation.png",
    blocks: [
      h("What AI automation is"),
      p(
        "AI automation is not “chat for everything”. It is targeted automation: AI handles reading, drafting, classifying, enriching and routing — while your systems and people stay in charge of decisions that carry risk or brand impact.",
      ),
      h("Where automation pays off"),
      l([
        "Summarizing tickets, emails and meeting notes",
        "Drafting follow-ups and first-response replies",
        "Enriching leads and tagging CRM records",
        "Classifying inbound requests and routing to the right team",
        "Generating content briefs from research inputs",
        "Extracting structured data from documents and forms",
        "Internal knowledge search across Drive, Notion and docs",
        "Reducing copy-paste work between tools",
      ]),
      h("Business outcomes"),
      l([
        "Hours saved per week on repetitive tasks",
        "Faster response times for leads and support",
        "Fewer missed handoffs between tools and teams",
        "More consistent quality with review checkpoints",
        "Clear KPIs: time saved, volume handled, error rate, CSAT proxies",
      ]),
      h("How we keep it safe"),
      p(
        "Automation without governance creates risk. We design allow/deny rules, human approval gates for sensitive actions, logging for auditability, and evaluation checks so quality does not drift over time.",
      ),
      l([
        "Risk scoring per use case before build",
        "Human checkpoints for pricing, legal and customer-facing send",
        "Secure API connectors and least-privilege access",
        "Monitoring for failures, cost spikes and quality drops",
      ]),
      h("How we deliver"),
      l([
        "Process mapping and ROI estimate before build",
        "Pilot on one high-impact process",
        "Integrations with your stack (CRM, mail, tickets, CMS, sheets)",
        "Documentation and handover for your team",
        "Optional monthly backlog to expand automation safely",
      ]),
      h("Ideal starting points"),
      l([
        "Support deflection and ticket triage",
        "Inbound lead enrichment and routing",
        "Content production assists with human publish control",
        "Ops reporting and data cleanup",
      ]),
      h("Ready to automate with AI?"),
      p(
        "Tell us which repetitive process costs the most time. We propose a feasible automation plan — and can connect it to dedicated AI workflows when you need multi-step orchestration.",
      ),
    ],
    blocksNl: [
      h("Wat AI-automatisering is"),
      p(
        "AI-automatisering is niet “chat voor alles”. Het is gerichte automatisering: AI leest, draft, classificeert, verrijkt en routeert — terwijl jouw systemen en mensen baas blijven over beslissingen met risico of merkimpact.",
      ),
      h("Waar automatisering loont"),
      l([
        "Tickets, e-mails en meetingnotes samenvatten",
        "Follow-ups en first-response antwoorden draften",
        "Leads verrijken en CRM-records taggen",
        "Inbound verzoeken classificeren en naar het juiste team routeren",
        "Contentbriefs genereren uit research-input",
        "Gestructureerde data uit documenten en forms halen",
        "Interne knowledge search over Drive, Notion en docs",
        "Copy-paste-werk tussen tools verminderen",
      ]),
      h("Business-resultaten"),
      l([
        "Uren per week bespaard op repetitieve taken",
        "Snellere responstijden voor leads en support",
        "Minder gemiste handoffs tussen tools en teams",
        "Consistentere kwaliteit met review-checkpoints",
        "Heldere KPI’s: tijdwinst, volume, foutrate, CSAT-proxies",
      ]),
      h("Hoe we het veilig houden"),
      p(
        "Automatisering zonder governance creëert risico. Wij ontwerpen allow/deny-regels, menselijke goedkeuringsgates voor gevoelige acties, logging voor auditability, en evaluation-checks zodat kwaliteit niet wegdrijft.",
      ),
      l([
        "Risicoscoring per use-case vóór build",
        "Menselijke checkpoints voor prijzen, juridisch en klantgerichte send",
        "Veilige API-connectors en least-privilege toegang",
        "Monitoring op failures, kostenpieken en kwaliteitsdalingen",
      ]),
      h("Hoe we opleveren"),
      l([
        "Process mapping en ROI-inschatting vóór build",
        "Pilot op één high-impact proces",
        "Integraties met jouw stack (CRM, mail, tickets, CMS, sheets)",
        "Documentatie en handover voor jouw team",
        "Optioneel maandelijkse backlog om veilig uit te breiden",
      ]),
      h("Ideale startpunten"),
      l([
        "Support-deflection en ticket-triage",
        "Inbound lead-enrichment en routing",
        "Contentproductie-assistentie met menselijke publish-controle",
        "Ops-rapportage en data-cleanup",
      ]),
      h("Klaar om te automatiseren met AI?"),
      p(
        "Vertel welk repetitief proces de meeste tijd kost. Wij stellen een haalbaar automatiseringsplan voor — en koppelen het aan dedicated AI workflows wanneer je multi-step orchestratie nodig hebt.",
      ),
    ],
  },

  "ai-workflows": {
    title: "AI Workflows",
    titleNl: "AI workflows",
    subtitle:
      "End-to-end AI workflows: triggers, steps, branching, approvals and integrations — designed for reliability, not one-off prompts.",
    subtitleNl:
      "End-to-end AI-workflows: triggers, stappen, branching, goedkeuringen en integraties — ontworpen voor betrouwbaarheid, geen eenmalige prompts.",
    image: "/uploads/fixweb/ai-workflows.png",
    blocks: [
      h("What an AI workflow is"),
      p(
        "An AI workflow is a repeatable process with a clear start, AI-assisted steps, optional human approvals, and a defined outcome in your tools. Unlike a single chat prompt, workflows run the same way every time — with logging, retries and measurable results.",
      ),
      h("Building blocks"),
      l([
        "Triggers: form submit, new lead, new ticket, schedule, webhook, email inbound",
        "AI steps: classify, summarize, extract, draft, score, translate, recommend",
        "Logic: conditions, branching, loops and fallbacks",
        "Human gates: review before send, publish or spend",
        "Actions: update CRM, create ticket reply, post draft, notify Slack/Teams",
        "Observability: logs, success/fail rates, cost per run",
      ]),
      h("Workflow possibilities"),
      l([
        "Lead → enrich → score → route → draft outreach → human approve → send",
        "Ticket → summarize → suggest reply → escalate if VIP/complaint",
        "Keyword input → brief → outline → draft → SEO checklist → editor queue",
        "Meeting recording/notes → action items → CRM tasks → follow-up mail draft",
        "Product feed change → update descriptions → QA → publish staging",
        "Inbound PDF/invoice → extract fields → validate → push to finance tool",
        "Social calendar → variants → brand check → schedule queue",
        "Support FAQ gap → draft answer → knowledge base update request",
      ]),
      h("Tools and integrations"),
      p(
        "We connect workflows to the stack you already use: CRM, helpdesk, mail, CMS, e-commerce, spreadsheets, Slack/Teams and custom APIs. The goal is orchestration that fits your operations — not forcing a new platform for everything.",
      ),
      h("Design principles"),
      l([
        "One owner and one success metric per workflow",
        "Idempotent steps so retries do not duplicate actions",
        "Clear failure paths and human escalation",
        "Brand and compliance rules embedded in prompts and checks",
        "Cost controls: caching, model tiering and rate limits",
      ]),
      h("What you get"),
      l([
        "Workflow map (trigger → steps → outcome)",
        "Working automation in staging, then production",
        "Runbook for your team: how to pause, edit and monitor",
        "Dashboard metrics or report of runs, savings and quality",
        "Roadmap to add the next high-ROI workflows",
      ]),
      h("Related service"),
      p(
        "Need broader automation strategy first? Start with AI automatisering. Ready to design specific multi-step flows? AI workflows is the build track.",
      ),
    ],
    blocksNl: [
      h("Wat een AI-workflow is"),
      p(
        "Een AI-workflow is een herhaalbaar proces met een duidelijke start, AI-ondersteunde stappen, optionele menselijke goedkeuringen en een gedefinieerde uitkomst in jouw tools. Anders dan één chatprompt draait een workflow elke keer hetzelfde — met logging, retries en meetbare resultaten.",
      ),
      h("Bouwstenen"),
      l([
        "Triggers: form submit, nieuwe lead, nieuw ticket, schedule, webhook, inbound e-mail",
        "AI-stappen: classificeren, samenvatten, extracten, draften, scoren, vertalen, aanbevelen",
        "Logica: conditions, branching, loops en fallbacks",
        "Menselijke gates: review vóór send, publish of spend",
        "Acties: CRM updaten, ticketantwoord maken, draft posten, Slack/Teams notificeren",
        "Observability: logs, success/fail-rates, kosten per run",
      ]),
      h("Workflow-mogelijkheden"),
      l([
        "Lead → verrijken → scoren → routeren → outreach draften → mens goedkeuren → versturen",
        "Ticket → samenvatten → antwoord voorstellen → escaleren bij VIP/klacht",
        "Keyword-input → brief → outline → draft → SEO-checklist → editor-queue",
        "Meetingnotes → action items → CRM-taken → follow-up maildraft",
        "Productfeed-wijziging → teksten updaten → QA → staging publiceren",
        "Inbound PDF/factuur → velden extracten → valideren → naar finance-tool",
        "Social kalender → varianten → brand check → schedule-queue",
        "Support FAQ-gap → antwoord draften → knowledge base update-aanvraag",
      ]),
      h("Tools en integraties"),
      p(
        "Wij koppelen workflows aan de stack die je al gebruikt: CRM, helpdesk, mail, CMS, e-commerce, spreadsheets, Slack/Teams en custom API’s. Het doel is orchestratie die bij jouw operations past — niet overal een nieuw platform forceren.",
      ),
      h("Ontwerpprincipes"),
      l([
        "Eén owner en één success metric per workflow",
        "Idempotente stappen zodat retries geen dubbele acties veroorzaken",
        "Duidelijke failure-paden en menselijke escalatie",
        "Merk- en compliance-regels in prompts en checks",
        "Kostencontrole: caching, model-tiering en rate limits",
      ]),
      h("Wat je krijgt"),
      l([
        "Workflow-map (trigger → stappen → uitkomst)",
        "Werkende automatisering op staging, daarna productie",
        "Runbook voor jouw team: pauzeren, bewerken en monitoren",
        "Dashboardmetrics of rapport van runs, besparing en kwaliteit",
        "Roadmap voor de volgende high-ROI workflows",
      ]),
      h("Gerelateerde dienst"),
      p(
        "Eerst bredere automatiseringsstrategie? Start met AI automatisering. Klaar om specifieke multi-step flows te bouwen? AI workflows is het build-traject.",
      ),
    ],
  },

  "ai-marketing-agents": {
    title: "AI Marketing Agents",
    titleNl: "AI marketing agents",
    subtitle:
      "Specialized AI agents for SEO, content, social and ads — coordinated with human strategy.",
    subtitleNl:
      "Gespecialiseerde AI-agents voor SEO, content, social en ads — gecoördineerd met menselijke strategie.",
    image: "/uploads/fixweb/ai-marketing-agents.png",
    blocks: [
      h("Role-based AI that supports your marketing team"),
      p("Generic chat is not a marketing system. We configure specialised agents with a clear role, approved knowledge and measurable output—while your team or ours keeps control over strategy, publishing and budget."),
      h("Agent roles we deploy"),
      l([
        "SEO agent: gaps, briefs and technical flags",
        "Content agent: outlines and drafts against brand rules",
        "Social agent: calendars, variants and engagement drafts",
        "Ads agent: creative angles and performance hypotheses",
        "Orchestration so agents share context instead of conflicting",
      ]),
      h("How agents fit your process"),
      p("We map where research, drafting, review and approval currently slow down. Each agent receives a defined input, output, escalation route and owner, so it assists a repeatable process instead of creating more content to manage."),
      h("Control, safety and quality"),
      l([
        "Brand and compliance prompt packs",
        "Approval gates before publish or spend",
        "Human strategy ownership for KPI targets",
        "Approved data sources and clear do-not-do rules",
        "Performance reviews to improve useful outputs over time",
      ]),
      h("What you receive"),
      l(["Agent role definitions and workflow map", "Brand-aware instructions and prompt library", "Configured agent outputs for your team or dashboard", "Review and approval checkpoints", "Training and a plan for ongoing refinement"]),
      h("Ideal for"),
      l(["Marketing teams with recurring SEO, content, social or ads work", "B2B organisations that need more output without losing quality", "Agencies supporting multiple client accounts", "Teams that need transparent AI usage and clear ownership"]),
      h("How to start"),
      p("We start with one high-value marketing process and a clear success measure. After a controlled pilot, we expand only where the agent demonstrably saves time or improves quality."),
    ],
    blocksNl: [
      h("Rolgebaseerde AI die jouw marketingteam ondersteunt"),
      p("Generieke chat is geen marketingssysteem. We configureren gespecialiseerde agents met een duidelijke rol, goedgekeurde knowledge en meetbare output—terwijl jouw team of het onze de strategie, publicatie en het budget beheert."),
      h("Agentrollen die we inzetten"),
      l([
        "SEO-agent: gaps, briefs en technische flags",
        "Content-agent: outlines en drafts volgens merkregels",
        "Social-agent: kalenders, varianten en engagement-drafts",
        "Ads-agent: creative angles en performance-hypotheses",
        "Orchestratie zodat agents context delen in plaats van conflicteren",
      ]),
      h("Hoe agents in jouw proces passen"),
      p("We brengen in kaart waar research, drafting, review en goedkeuring nu vertragen. Elke agent krijgt een gedefinieerde input, output, escalatieroute en eigenaar, zodat hij een herhaalbaar proces ondersteunt in plaats van extra werk te creëren."),
      h("Controle, veiligheid en kwaliteit"),
      l([
        "Merk- en compliance-promptpacks",
        "Goedkeuringsgates vóór publicatie of spend",
        "Menselijk strategy-ownership voor KPI-targets",
        "Goedgekeurde databronnen en duidelijke grenzen",
        "Performancereviews om bruikbare output te verbeteren",
      ]),
      h("Wat je krijgt"),
      l(["Agentrolbeschrijvingen en workflowmap", "Merkrichtlijnen en promptbibliotheek", "Geconfigureerde agentoutput voor jouw team of dashboard", "Review- en goedkeuringsmomenten", "Training en plan voor doorlopende verfijning"]),
      h("Ideaal voor"),
      l(["Marketingteams met terugkerend SEO-, content-, social- of ads-werk", "B2B-organisaties die meer output willen zonder kwaliteitsverlies", "Bureaus die meerdere klantaccounts ondersteunen", "Teams die transparant AI-gebruik en duidelijk eigenaarschap nodig hebben"]),
      h("Aan de slag"),
      p("We starten met één waardevol marketingproces en een duidelijke succesmaat. Na een gecontroleerde pilot breiden we alleen uit waar de agent aantoonbaar tijd bespaart of kwaliteit verbetert."),
    ],
  },

  "ai-integration": {
    title: "Custom AI Integration",
    titleNl: "AI integratie en maatwerk",
    subtitle:
      "Custom AI features in your product or stack — APIs, embeddings, RAG and secure deployment.",
    subtitleNl:
      "Maatwerk AI-features in jouw product of stack — API’s, embeddings, rag en veilige deployment.",
    image: "/uploads/fixweb/ai-integration.png",
    blocks: [
      h("AI capabilities integrated into the tools you use"),
      p("When a standalone AI tool is not enough, we design and build the capability into your website, portal or internal systems. The result is a useful product feature or workflow, not a disconnected experiment."),
      h("Technical scope"),
      l([
        "Retrieval-augmented generation over your private docs",
        "API wrappers and middleware for model providers",
        "Embeddings, vector search and evaluation pipelines",
        "Auth, rate limits, logging and cost controls",
        "Frontend UX for chat, search and copilots in Next.js or your stack",
      ]),
      h("How we make integration reliable"),
      p("We define the user problem, permitted data, quality threshold and operational owner before selecting technology. A small prototype validates the experience; production work adds authentication, monitoring, evaluation and the safeguards needed for real users."),
      h("Delivery process"),
      l([
        "Discovery workshop and success metrics",
        "Architecture decision record and security review",
        "MVP in weeks, then iterate on quality and cost",
        "Handover docs, runbooks and optional retainership",
      ]),
      h("What you receive"),
      l(["A solution design aligned with your existing stack", "Working AI feature or integration in a safe delivery environment", "Data, access and cost-control configuration", "Evaluation cases and monitoring recommendations", "Technical documentation and a practical handover"]),
      h("Ideal for"),
      l(["SaaS products adding AI-powered user experiences", "Client portals and internal knowledge tools", "Knowledge-heavy businesses that need reliable answers from approved sources", "Agencies embedding AI capabilities into their own services"]),
      h("How to start"),
      p("Share the user problem, systems involved and the outcome you expect. We assess feasibility, data readiness and the smallest valuable MVP."),
    ],
    blocksNl: [
      h("AI-capabilities geïntegreerd in de tools die je gebruikt"),
      p("Wanneer een losse AI-tool niet genoeg is, ontwerpen en bouwen we de capability in jouw website, portal of interne systemen. Het resultaat is een bruikbare productfeature of workflow, geen losstaand experiment."),
      h("Technische scope"),
      l([
        "Retrieval-augmented generation over jouw private docs",
        "API-wrappers en middleware voor modelproviders",
        "Embeddings, vector search en evaluation-pipelines",
        "Auth, rate limits, logging en kostencontrole",
        "Frontend-UX voor chat, search en copilots in Next.js of jouw stack",
      ]),
      h("Hoe we integraties betrouwbaar maken"),
      p("We bepalen het gebruikersprobleem, toegestane data, kwaliteitsgrens en operationele eigenaar voordat we technologie kiezen. Een klein prototype valideert de ervaring; productiewerk voegt authenticatie, monitoring, evaluatie en guardrails voor echte gebruikers toe."),
      h("Opleverproces"),
      l([
        "Discovery-workshop en success metrics",
        "Architecture decision record en security review",
        "MVP in weken, daarna itereren op kwaliteit en kosten",
        "Handover-docs, runbooks en optioneel retainership",
      ]),
      h("Wat je krijgt"),
      l(["Een solution design dat past bij jouw bestaande stack", "Werkende AI-feature of integratie in een veilige opleveromgeving", "Configuratie voor data, toegang en kostencontrole", "Evaluatiecases en monitoringadvies", "Technische documentatie en praktische overdracht"]),
      h("Ideaal voor"),
      l(["SaaS-producten die AI-ervaringen voor gebruikers toevoegen", "Klantportalen en interne knowledgetools", "Knowledge-intensieve bedrijven die betrouwbare antwoorden uit goedgekeurde bronnen nodig hebben", "Bureaus die AI-capabilities in hun eigen diensten verwerken"]),
      h("Aan de slag"),
      p("Deel het gebruikersprobleem, betrokken systemen en de gewenste uitkomst. Wij beoordelen haalbaarheid, data-readiness en de kleinste waardevolle MVP."),
    ],
  },

  "ai-consultancy": {
    title: "AI Strategy & Consultancy",
    titleNl: "AI strategie en advies",
    subtitle:
      "Executive-ready AI strategy: where to invest, what to avoid, and how to measure ROI safely.",
    subtitleNl:
      "Bestuursklare AI-strategie: waar te investeren, wat te vermijden, en hoe roi veilig te meten.",
    image: "/uploads/fixweb/ai-consultancy.png",
    blocks: [
      h("Make informed AI decisions before investing"),
      p("Most AI initiatives struggle because the business problem, ownership or measures of success are unclear. We help leadership and operational teams choose practical use cases, manage risk and create a roadmap that can be delivered."),
      h("Advisory themes"),
      l([
        "Opportunity mapping across marketing, support, product and ops",
        "Build vs buy decisions and vendor shortlists",
        "Data readiness, privacy and brand-risk policies",
        "KPI frameworks and pilot design",
        "Team enablement: prompts, review rituals and ownership",
      ]),
      h("Our consultancy approach"),
      p("We combine stakeholder interviews, process review and opportunity scoring with a realistic view of your data, systems and capacity. Recommendations are prioritised by value, feasibility, risk and the evidence needed to proceed."),
      h("What you receive"),
      l(["A clear view of where AI can and cannot help", "Prioritised use-case backlog with owners and success measures", "Build-versus-buy and vendor assessment where relevant", "Governance recommendations for privacy, quality and human oversight", "A phased roadmap from pilot to scaled adoption"]),
      h("Engagement formats"),
      l([
        "Half-day strategy workshop",
        "4–6 week discovery with roadmap",
        "Ongoing fractional AI lead for leadership meetings",
      ]),
      h("Ideal for"),
      l(["Leadership teams deciding where to focus AI investment", "Businesses with many ideas but no agreed priorities", "Organisations preparing a first AI pilot", "Teams that need independent technical and operational guidance"]),
      h("Next step"),
      p("Book an intake and bring the processes or opportunities currently under discussion. You leave with a prioritised direction, and TripleZero iT can implement selected items through the relevant AI delivery service."),
    ],
    blocksNl: [
      h("Neem onderbouwde AI-beslissingen vóór je investeert"),
      p("De meeste AI-initiatieven lopen vast omdat het bedrijfsprobleem, eigenaarschap of de succesmaat onduidelijk is. We helpen management en operationele teams praktische use-cases kiezen, risico beheersen en een uitvoerbare roadmap maken."),
      h("Advies-thema’s"),
      l([
        "Opportunity mapping over marketing, support, product en ops",
        "Build vs buy-beslissingen en vendor-shortlists",
        "Data-readiness, privacy en merkrisico-policies",
        "KPI-frameworks en pilotontwerp",
        "Team enablement: prompts, review-rituelen en ownership",
      ]),
      h("Onze adviesaanpak"),
      p("We combineren gesprekken met stakeholders, procesanalyse en opportunitiescoring met een realistische blik op jouw data, systemen en capaciteit. Aanbevelingen prioriteren we op waarde, haalbaarheid, risico en het bewijs dat nodig is om door te gaan."),
      h("Wat je krijgt"),
      l(["Een helder beeld van waar AI wel en niet kan helpen", "Geprioriteerde use-casebacklog met eigenaren en succesmaten", "Build-versus-buy- en vendorbeoordeling waar relevant", "Governanceadvies voor privacy, kwaliteit en menselijke controle", "Gefaseerde roadmap van pilot naar schaalbare toepassing"]),
      h("Samenwerkingsvormen"),
      l([
        "Halve-dag strategiesessie",
        "4–6 weken discovery met roadmap",
        "Doorlopend fractional AI-lead voor leadership-meetings",
      ]),
      h("Ideaal voor"),
      l(["Managementteams die AI-investeringen willen prioriteren", "Bedrijven met veel ideeën maar geen gedeelde focus", "Organisaties die een eerste AI-pilot voorbereiden", "Teams die onafhankelijk technisch en operationeel advies nodig hebben"]),
      h("Volgende stap"),
      p("Plan een intake en neem de processen of kansen mee die nu worden besproken. Je krijgt een geprioriteerde richting; TripleZero iT kan geselecteerde onderdelen daarna via de passende AI-dienst uitvoeren."),
    ],
  },
};

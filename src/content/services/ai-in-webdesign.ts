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

export const aiInEcommerceService: CustomService = {
  title: "AI in E-commerce",
  titleNl: "AI in e-commerce",
  subtitle:
    "Practical AI for webshops — product assistants, smarter search, cart help, support deflection and automation that lift conversion without hurting trust.",
  subtitleNl:
    "Praktische AI voor webshops — productassistenten, slimmere search, cart-hulp, support-deflection en automatisering die conversie verhogen zonder vertrouwen te schaden.",
  image: "/uploads/fixweb/ai-in-ecommerce.png",
  blocks: [
    h("AI built for webshops"),
    p(
      "E-commerce AI is not a generic chatbot glued to your homepage. We design AI that understands your catalog, stock, pricing rules and brand tone — on custom shops, headless commerce, Shopify-like stacks or PHP / Next.js storefronts (separate from WordPress/WooCommerce packages when you need a custom stack).",
    ),
    h("What is possible"),
    l([
      "Product Q&A trained on descriptions, specs, FAQs and policies",
      "Size, fit and “which product is right for me?” assistants",
      "Smart search and semantic product discovery",
      "Cart and checkout helpers that reduce abandonment",
      "Order-status and returns answers with safe escalation to humans",
      "Personalized recommendations within clear merchandising rules",
      "Content assists for product descriptions and category copy",
      "Support deflection for the questions that clog your inbox",
      "Ops automation: tagging, summarizing tickets, enriching CRM",
      "Multilingual shop assistants for NL/EN (and more on request)",
    ]),
    h("Conversion-first use cases"),
    l([
      "Guide shoppers to the right SKU faster",
      "Answer pre-purchase objections 24/7",
      "Reduce “where is my order?” tickets after purchase",
      "Upsell/cross-sell with catalog truth — not inventing stock or prices",
      "Help merchandisers draft and refresh product content at scale",
    ]),
    h("How we keep it safe"),
    p(
      "Prices, stock and promotions must stay accurate. We ground answers in your product data and policies, add guardrails against hallucinations, and always offer a path to human support for complaints, payments and edge cases.",
    ),
    l([
      "Catalog-aware retrieval (PIM, feed or storefront data)",
      "Hard rules for pricing, shipping and legal claims",
      "Human takeover for billing, disputes and VIP cases",
      "Performance-friendly widgets so Core Web Vitals stay healthy",
      "GDPR-aware logging and data handling",
    ]),
    h("What you get"),
    l([
      "Discovery of shopper questions and conversion bottlenecks",
      "Working AI feature(s) on staging, then production",
      "Admin docs and a short training for your team",
      "KPIs: assisted conversion, deflection, AOV influence, CSAT proxies",
      "Optional retainer for catalog sync, prompts and optimisation",
    ]),
    h("Ready to add AI to your webshop?"),
    p(
      "Share your shop URL, platform and the top questions customers ask. Use the contact button for a short request — we reply with feasibility and next steps.",
    ),
  ],
  blocksNl: [
    h("AI gebouwd voor webshops"),
    p(
      "E-commerce-AI is geen generieke chatbot op jouw homepage. Wij ontwerpen AI die jouw catalogus, voorraad, prijsregels en merktoon begrijpt — op maatwerkshops, headless commerce, Shopify-achtige stacks of PHP- / Next.js-storefronts (los van WordPress/WooCommerce-pakketten wanneer je een custom stack nodig hebt).",
    ),
    h("Wat er mogelijk is"),
    l([
      "Product-Q&A getraind op beschrijvingen, specs, FAQ’s en policies",
      "Maat/fit- en “welk product past bij mij?”-assistenten",
      "Slimme search en semantische product discovery",
      "Cart- en checkout-hulp die abandonment verlaagt",
      "Orderstatus- en retourantwoorden met veilige escalatie naar mensen",
      "Gepersonaliseerde aanbevelingen binnen duidelijke merchandisingregels",
      "Contenthulp voor productteksten en categorieteksten",
      "Support-deflection voor vragen die jouw inbox verstoppen",
      "Ops-automatisering: taggen, tickets samenvatten, CRM verrijken",
      "Meertalige shopassistenten voor NL/EN (meer op verzoek)",
    ]),
    h("Conversiegerichte use-cases"),
    l([
      "Shoppers sneller naar de juiste SKU leiden",
      "Pre-purchase bezwaren 24/7 beantwoorden",
      "“Waar is mijn bestelling?”-tickets na aankoop verminderen",
      "Upsell/cross-sell met cataloguswaarheid — geen verzonnen voorraad of prijzen",
      "Merchandisers helpen productcontent op schaal te draften en te vernieuwen",
    ]),
    h("Hoe we het veilig houden"),
    p(
      "Prijzen, voorraad en acties moeten kloppen. We baseren antwoorden op jouw productdata en policies, zetten guardrails tegen hallucinaties, en bieden altijd een pad naar menselijke support bij klachten, betalingen en edge cases.",
    ),
    l([
      "Catalogus-aware retrieval (PIM, feed of storefront-data)",
      "Harde regels voor prijzen, verzending en juridische claims",
      "Menselijke overname bij facturatie, disputes en VIP-cases",
      "Performance-vriendelijke widgets zodat Core Web Vitals gezond blijven",
      "GDPR-bewuste logging en dataverwerking",
    ]),
    h("Wat je krijgt"),
    l([
      "Discovery van shoppervragen en conversieknelpunten",
      "Werkende AI-feature(s) op staging, daarna productie",
      "Admin-docs en korte training voor jouw team",
      "KPI’s: assisted conversion, deflection, AOV-invloed, CSAT-proxies",
      "Optioneel retainer voor catalogus-sync, prompts en optimalisatie",
    ]),
    h("Klaar om AI in jouw webshop te zetten?"),
    p(
      "Deel jouw shop-URL, platform en de topvragen van klanten. Gebruik de contactknop voor een kort verzoek — we reageren met haalbaarheid en vervolgstappen.",
    ),
  ],
};

export const aiInWebsiteService: CustomService = {
  title: "AI in Website",
  titleNl: "AI in website",
  subtitle:
    "AI for custom websites — chat, lead qualification, knowledge search and automation on PHP, HTML/JS and Next.js sites (not WordPress).",
  subtitleNl:
    "AI voor maatwerkwebsites — chat, leadkwalificatie, knowledge search en automatisering op PHP-, HTML/js- en Next.js-sites (geen WordPress).",
  image: "/uploads/fixweb/ai-in-website.png",
  blocks: [
    h("AI for modern websites"),
    p(
      "If your site is custom-built — Next.js, PHP, static front-ends or hybrid stacks — we embed AI that fits your architecture, brand and conversion goals. This service is deliberately separate from AI in WordPress.",
    ),
    h("What is possible"),
    l([
      "On-site assistants trained on your pages, FAQs and documents",
      "Lead qualification and appointment booking flows",
      "Smart site search over content and knowledge bases",
      "Service finders and “which package fits me?” guides",
      "Internal copilots for sales, support or editors",
      "Form and CRM enrichment from conversations",
      "Content drafting helpers with human publish control",
      "Multilingual NL/EN experiences",
      "Custom AI features via APIs, RAG and your own data",
    ]),
    h("Typical website goals"),
    l([
      "Answer visitor questions before they bounce",
      "Qualify inbound leads outside office hours",
      "Reduce repetitive support and sales follow-ups",
      "Make complex offers easier to understand",
      "Speed up content and knowledge workflows for your team",
    ]),
    h("How we implement"),
    l([
      "Discovery: goals, stack, traffic and compliance needs",
      "Knowledge prep from approved pages and docs",
      "Architecture: widget, API route or full feature in your app",
      "Guardrails for pricing, legal and brand claims",
      "UX that matches your design system and accessibility bar",
      "Performance: async loading and caching where possible",
      "Handover with docs, training and optional retainership",
    ]),
    h("Stacks we work with"),
    l([
      "Next.js / React applications",
      "PHP websites and custom apps",
      "HTML / CSS / JavaScript landing sites",
      "Headless CMS + front-end combinations",
    ]),
    h("What you get"),
    l([
      "A clear AI feature plan tied to business KPIs",
      "Working integration on staging and production",
      "Measurement for engagement, leads assisted and deflection",
      "A path to expand into automation or e-commerce AI later",
    ]),
    h("Ready to add AI to your website?"),
    p(
      "Tell us your URL, tech stack and what visitors ask most. Use the contact button — we reply with a feasibility note and concrete next steps.",
    ),
  ],
  blocksNl: [
    h("AI voor moderne websites"),
    p(
      "Als jouw site maatwerk is — Next.js, PHP, statische front-ends of hybride stacks — bouwen we AI die past bij jouw architectuur, merk en conversiedoelen. Deze dienst is bewust los van AI in WordPress.",
    ),
    h("Wat er mogelijk is"),
    l([
      "On-site assistenten getraind op jouw pagina’s, FAQ’s en documenten",
      "Leadkwalificatie en afspraakflows",
      "Slimme sitesearch over content en knowledge bases",
      "Service finders en “welk pakket past bij mij?”-gidsen",
      "Interne copilots voor sales, support of editors",
      "Formulier- en CRM-verrijking uit gesprekken",
      "Content-draft helpers met menselijke publish-controle",
      "Meertalige NL/EN-ervaringen",
      "Maatwerk AI-features via API’s, RAG en jouw eigen data",
    ]),
    h("Typische websitedoelen"),
    l([
      "Bezoekersvragen beantwoorden vóór ze bounce’n",
      "Inbound leads kwalificeren buiten kantooruren",
      "Repetitieve support- en sales-follow-ups verminderen",
      "Complexe aanbiedingen makkelijker maken",
      "Content- en knowledge-workflows voor jouw team versnellen",
    ]),
    h("Hoe we implementeren"),
    l([
      "Discovery: doelen, stack, traffic en compliance",
      "Knowledge-prep uit goedgekeurde pagina’s en docs",
      "Architectuur: widget, API-route of volle feature in jouw app",
      "Guardrails voor prijzen, juridische en merkclaims",
      "UX die bij jouw design system en accessibility past",
      "Performance: async laden en caching waar mogelijk",
      "Handover met docs, training en optioneel retainership",
    ]),
    h("Stacks waarmee we werken"),
    l([
      "Next.js / React-applicaties",
      "PHP-websites en maatwerk-apps",
      "HTML / CSS / JavaScript landingsites",
      "Headless CMS + front-end combinaties",
    ]),
    h("Wat je krijgt"),
    l([
      "Een helder AI-featureplan gekoppeld aan business-KPI’s",
      "Werkende integratie op staging en productie",
      "Meting van engagement, assisted leads en deflection",
      "Een pad om later uit te breiden naar automatisering of e-commerce-AI",
    ]),
    h("Klaar om AI in jouw website te zetten?"),
    p(
      "Vertel ons jouw URL, tech stack en wat bezoekers het meest vragen. Gebruik de contactknop — we reageren met een haalbaarheidsadvies en concrete stappen.",
    ),
  ],
};

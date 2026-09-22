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

export const aiInWordpressService: CustomService = {
  title: "AI in WordPress",
  titleNl: "AI in WordPress",
  subtitle:
    "Bring practical AI into your WordPress site — chatbots, content assistance, WooCommerce helpers, automation and custom plugins — secure, on-brand and built to convert.",
  subtitleNl:
    "Breng praktische AI in jouw WordPress-site — chatbots, contenthulp, WooCommerce-assistenten, automatisering en maatwerkplugins — veilig, on-brand en gebouwd om te converteren.",
  image: "/uploads/fixweb/ai-in-wordpress.png",
  blocks: [
    h("What “AI in WordPress” means"),
    p(
      "WordPress already powers millions of business sites. AI makes those sites faster to run and smarter for visitors: answering questions, drafting content, routing leads, recommending products and reducing support load — without replacing your brand voice or editorial control.",
    ),
    p(
      "TripleZero iT designs, builds and maintains AI features that fit your existing theme, plugins and hosting — with clear guardrails for privacy, accuracy and performance.",
    ),
    h("What is possible"),
    l([
      "On-site AI chat trained on your pages, FAQ, policies and product catalog",
      "Lead qualification and appointment booking assistants",
      "WooCommerce helpers: product Q&A, size/fit guidance, order status summaries",
      "AI-assisted content drafting in wp-admin (posts, pages, product descriptions)",
      "Smart search and knowledge retrieval over your docs and media library",
      "Support ticket drafts and triage connected to your helpdesk",
      "Internal copilots for editors, sales or support staff",
      "Automation: tagging, summarizing comments, enriching CRM fields",
      "Multilingual replies and content assists for NL/EN sites",
      "Custom AI plugins and API integrations tailored to your stack",
    ]),
    h("Popular use cases by industry"),
    l([
      "E-commerce: reduce “where is my order?” and product questions before checkout",
      "Services & agencies: qualify inbound leads and book discovery calls 24/7",
      "Education & membership: answer course FAQs from approved materials",
      "SaaS / tech: document assistants and onboarding chat on marketing WordPress sites",
      "Local business: appointment booking with service-area and pricing guardrails",
    ]),
    h("How we implement AI safely in WordPress"),
    p(
      "We never drop a generic chatbot on your site and hope for the best. Every build includes knowledge preparation, prompt/policy design, testing, and a human escalation path.",
    ),
    l([
      "Discovery: goals, traffic, plugins, hosting limits and compliance needs",
      "Knowledge base: curated pages, FAQs, product data — not the whole messy internet",
      "Architecture: plugin vs headless widget vs hybrid; caching and rate limits",
      "Guardrails: block inventing prices, legal claims or competitor comparisons",
      "UX: brand tone, mobile layout, accessibility and clear “talk to a human” exits",
      "Security: API keys, roles, logging, GDPR-aware data handling",
      "Performance: async loading so Core Web Vitals stay healthy",
      "Handover: docs, admin training and optional monthly optimisation",
    ]),
    h("Plugins vs custom build"),
    p(
      "Sometimes a well-configured premium plugin is enough. Sometimes you need a custom plugin talking to your models, CRM or PIM. We advise honestly — build vs buy — and deliver whichever path fits budget and risk.",
    ),
    l([
      "Configured AI plugins with brand prompts and knowledge sync",
      "Custom WordPress plugins for unique workflows",
      "Headless AI widgets embedded in block themes / Elementor / Gutenberg",
      "Integrations with HubSpot, Salesforce, email, tickets or WhatsApp",
    ]),
    h("WooCommerce & AI"),
    p(
      "For shops we focus on conversion and support deflection: product assistants, cart recovery hints, post-purchase answers and catalog-aware recommendations — always with stock and pricing truth from WooCommerce, not hallucinated data.",
    ),
    h("Content AI for editors"),
    p(
      "Editors stay in control. We can add drafting helpers inside WordPress that propose titles, outlines, meta descriptions and AEO-ready FAQ blocks — with your review workflow before publish.",
    ),
    h("What you get"),
    l([
      "Working AI feature(s) on staging, then production",
      "Admin documentation and a short training call",
      "Measurement: deflection, leads assisted, engagement or conversion KPIs",
      "Optional retainer for model updates, knowledge refresh and A/B tweaks",
    ]),
    h("Ideal starting points"),
    l([
      "Website chat + FAQ knowledge for support deflection",
      "Lead assistant on high-intent service pages",
      "WooCommerce product Q&A for top SKUs",
      "Editor copilots for a content-heavy blog or magazine",
    ]),
    h("Ready to add AI to your WordPress site?"),
    p(
      "Tell us your URL, what visitors ask most often, and whether you use WooCommerce. Use the contact button to send a short request — we reply with a clear feasibility note and next steps.",
    ),
  ],
  blocksNl: [
    h("Wat “AI in WordPress” betekent"),
    p(
      "WordPress draait al miljoenen bedrijfssites. AI maakt die sites sneller te beheren en slimmer voor bezoekers: vragen beantwoorden, content draften, leads routeren, producten aanbevelen en supportlast verlagen — zonder jouw merkstem of redactionele controle te vervangen.",
    ),
    p(
      "TripleZero iT ontwerpt, bouwt en onderhoudt AI-features die passen bij jouw bestaande theme, plugins en hosting — met duidelijke guardrails voor privacy, juistheid en performance.",
    ),
    h("Wat er mogelijk is"),
    l([
      "On-site AI-chat getraind op jouw pagina’s, FAQ, policies en productcatalogus",
      "Leadkwalificatie en afspraakassistenten",
      "WooCommerce-hulp: product-Q&A, maat/fit-advies, orderstatus-samenvattingen",
      "AI-ondersteund contentdraften in wp-admin (posts, pages, productteksten)",
      "Slimme search en knowledge retrieval over docs en mediabibliotheek",
      "Supportticket-drafts en triage gekoppeld aan jouw helpdesk",
      "Interne copilots voor editors, sales of support",
      "Automatisering: taggen, comments samenvatten, CRM-velden verrijken",
      "Meertalige antwoorden en contenthulp voor NL/EN-sites",
      "Maatwerk AI-plugins en API-integraties op jouw stack",
    ]),
    h("Populaire use-cases per branche"),
    l([
      "E-commerce: minder “waar is mijn bestelling?” en productvragen vóór checkout",
      "Diensten & agencies: inbound leads kwalificeren en discovery calls 24/7 boeken",
      "Educatie & membership: cursus-FAQ’s beantwoorden uit goedgekeurde materialen",
      "SaaS / tech: documentassistenten en onboarding-chat op marketing-WordPress",
      "Lokale business: afspraken boeken met servicegebied- en prijsguardrails",
    ]),
    h("Hoe we AI veilig in WordPress zetten"),
    p(
      "We zetten nooit zomaar een generieke chatbot live. Elke build bevat knowledge-prep, prompt-/policy-design, testing en een menselijke escalatiepad.",
    ),
    l([
      "Discovery: doelen, traffic, plugins, hostinglimieten en compliance",
      "Knowledge base: curated pagina’s, FAQ’s, productdata — niet het hele internet",
      "Architectuur: plugin vs headless widget vs hybrid; caching en rate limits",
      "Guardrails: geen verzonnen prijzen, juridische claims of concurrentievergelijkingen",
      "UX: merktoon, mobile layout, toegankelijkheid en duidelijke “praat met een mens”-exit",
      "Security: API-keys, rollen, logging, GDPR-bewuste dataverwerking",
      "Performance: async laden zodat Core Web Vitals gezond blijven",
      "Handover: docs, admin-training en optioneel maandelijks optimaliseren",
    ]),
    h("Plugins vs maatwerk"),
    p(
      "Soms volstaat een goed geconfigureerde premium plugin. Soms heb je een custom plugin nodig die praat met jouw models, CRM of PIM. Wij adviseren eerlijk — build vs buy — en leveren wat past bij budget en risico.",
    ),
    l([
      "Geconfigureerde AI-plugins met merkprompts en knowledge-sync",
      "Custom WordPress-plugins voor unieke workflows",
      "Headless AI-widgets in block themes / Elementor / Gutenberg",
      "Integraties met HubSpot, Salesforce, e-mail, tickets of WhatsApp",
    ]),
    h("WooCommerce & AI"),
    p(
      "Voor webshops focussen we op conversie en support-deflection: productassistenten, cart-recovery hints, post-purchase antwoorden en catalogus-aware aanbevelingen — altijd met voorraad- en prijswaarheid uit WooCommerce, geen verzonnen data.",
    ),
    h("Content-AI voor editors"),
    p(
      "Editors blijven baas. We kunnen draft-helpers in WordPress toevoegen die titles, outlines, meta descriptions en AEO-klare FAQ-blokken voorstellen — met jouw review vóór publicatie.",
    ),
    h("Wat je krijgt"),
    l([
      "Werkende AI-feature(s) op staging, daarna productie",
      "Admin-documentatie en een korte training",
      "Meting: deflection, assisted leads, engagement of conversie-KPI’s",
      "Optioneel retainer voor model-updates, knowledge-refresh en A/B-tweaks",
    ]),
    h("Ideale startpunten"),
    l([
      "Websitechat + FAQ-knowledge voor support-deflection",
      "Leadassistent op high-intent dienstpagina’s",
      "WooCommerce product-Q&A voor top-SKU’s",
      "Editor-copilots voor een content-zware blog of magazine",
    ]),
    h("Klaar om AI in jouw WordPress-site te zetten?"),
    p(
      "Vertel ons jouw URL, wat bezoekers het meest vragen, en of je WooCommerce gebruikt. Gebruik de contactknop voor een kort verzoek — we reageren met een haalbaarheidsadvies en vervolgstappen.",
    ),
  ],
};

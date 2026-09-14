/**
 * Translate remaining public UI chrome into messages namespaces.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_TARGET_LOCALES, translateManyConcurrent } from "./lib/translate.mjs";

const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 6);

/** namespace.key -> EN string */
const EN = {
  "services.mostPopular": "Most popular services",
  "services.countLabel": "services",
  "services.openDigitalDesign": "Open Digital Design",
  "services.startFreeAiScan": "Start free AI scan",
  "services.related": "Related services",
  "services.freeAiScan": "Free AI scan",
  "services.openContactForm": "Open contact form",
  "services.contact": "Contact",
  "services.emptyBody": "Contact us for a tailored proposal.",
  "services.readyTitle": "Ready to get started?",
  "services.readyBody":
    "Book an intake or send a message — we’ll reply quickly with a concrete proposal.",
  "services.groupMarketing":
    "Content, Data, E-commerce, Marketing, Media Creation and Social Media",
  "services.jump.content": "Content generation",
  "services.jump.data": "Data management",
  "services.jump.ecommerce": "E-commerce",
  "services.jump.marketing": "Marketing",
  "services.jump.media": "Media Creation",
  "services.jump.audioVideo": "Audio and Video",
  "services.jump.social": "Social Media",
  "services.jump.community": "Community management",
  "services.jump.webhosting": "Webhosting",
  "services.jump.domains": "Domains",
  "services.jump.ai": "AI",
  "services.jump.aeo": "AEO",
  "services.jump.geo": "GEO",
  "services.jump.seo": "SEO",
  "services.jump.chatbots": "Chatbots",
  "services.jump.workflows": "Workflows",
  "services.jump.advice": "Advice",
  "services.jump.integration": "Integration",
  "services.jump.automation": "Automation",
  "services.jump.digitalDesign": "Digital Design",
  "services.jump.printing": "Printing",
  "services.jump.webdesign": "Webdesign",
  "services.jump.malware": "Malware removal",
  "services.jump.backup": "Backup and migration",
  "services.jump.security": "Security",
  "services.jump.speed": "Performance and speed",
  "services.jump.custom": "Custom",
  "services.jump.wordpress": "WordPress",
  "services.jump.maintenance": "Maintenance",
  "services.jump.support": "Support",
  "services.inquiry.wp.trigger": "Request AI for WordPress",
  "services.inquiry.wp.ctaTitle": "Want AI built into your WordPress?",
  "services.inquiry.wp.ctaText":
    "Send a short request via the form — we’ll review chatbots, content AI, WooCommerce or custom builds and reply with concrete next steps.",
  "services.inquiry.wp.hint": "WordPress website",
  "services.inquiry.ecom.trigger": "Request AI for E-commerce",
  "services.inquiry.ecom.ctaTitle": "Want AI built into your webshop?",
  "services.inquiry.ecom.ctaText":
    "Send a short request — we’ll review product assistants, search, cart help or support AI and reply with concrete next steps.",
  "services.inquiry.ecom.hint": "webshop",
  "services.inquiry.web.trigger": "Request AI for website",
  "services.inquiry.web.ctaTitle": "Want AI built into your website?",
  "services.inquiry.web.ctaText":
    "Send a short request — we’ll review chat, lead qualification, knowledge search or custom AI on your stack and reply with concrete next steps.",
  "services.inquiry.web.hint": "custom website",
  "common.openMenu": "Open menu",
  "common.cart": "Shopping cart",
  "common.account": "Account",
  "common.allServices": "All services",
  "pricing.billingPeriod": "Billing period",
  "pricing.contactEnterprise": "Contact about Enterprise",
  "pricing.enterpriseHint": "Enterprise plan",
  "pricing.enterpriseDesc":
    "Tell us briefly what you need — we’ll send a tailored proposal.",
  "pricing.hostingMonth": "1× web hosting (1 month)",
  "pricing.hostingYear": "1× web hosting (12 months)",
  "inquiry.websiteHint": "website / webshop",
  "inquiry.defaultMessage":
    "Hello TripleZero iT,\n\nI would like to learn more about {service} for our {hint}.\n\nWebsite URL:\nGoal (e.g. chatbot, product assistant, content AI, custom):\n\n",
  "inquiry.requestAi": "Request AI integration",
  "inquiry.sendRequest": "Send request",
  "hero.liveSignals": "Live growth signals",
  "legal.sharingData": "Sharing data: ",
  "legal.name": "Name",
  "legal.expiration": "Expiration",
  "legal.function": "Function",
  "locations.startFreeAiScan": "Start free AI scan",
  "locations.allServices": "All services",
  "locations.breadcrumb": "Locations",
  "locations.cityTitle": "AI, AEO, GEO & SEO in {name}",
  "locations.cityIntro":
    "TripleZero iT helps entrepreneurs and teams in {name} grow faster with AI integration, AEO, GEO, SEO, online marketing and custom software. Local insight, measurable results.",
  "locations.bulletScan": "Free AI scan for websites in {name}",
  "locations.bulletSeo":
    "AEO, GEO and SEO optimization for classic and AI search engines",
  "locations.bulletStack": "Web design, WordPress, hosting and digital marketing",
  "cases.client": "Client",
  "cases.industry": "Industry",
  "cases.technologies": "Technologies",
  "cases.visit": "View project",
  "news.previous": "Previous",
  "news.next": "Next",
  "news.pageOf": "Page {page} of {total}",
  "news.author": "Author",
  "news.date": "Date",
  "news.category": "Category",
  "news.openLink": "Open link",
  "news.readArticle": "Read article",
  "news.title": "News",
  "news.back": "Back to news",
  "news.viewSource": "View source",
  "news.subtitle": "Stay up to date with all developments.",
};

const NL = {
  "services.mostPopular": "Meest populaire diensten",
  "services.countLabel": "diensten",
  "services.openDigitalDesign": "Open digital design",
  "services.startFreeAiScan": "Start gratis AI-scan",
  "services.related": "Gerelateerde diensten",
  "services.freeAiScan": "Gratis AI-scan",
  "services.openContactForm": "Open contactformulier",
  "services.contact": "Contact",
  "services.emptyBody": "Neem contact op voor een voorstel op maat.",
  "services.readyTitle": "Klaar om te starten?",
  "services.readyBody":
    "Plan een intake of stuur een bericht — we reageren snel met een concreet voorstel.",
  "services.groupMarketing":
    "Content, Data, E-commerce, Marketing, Media Creatie en Social Media",
  "services.jump.content": "Content genereren",
  "services.jump.data": "Data beheer",
  "services.jump.ecommerce": "E-commerce",
  "services.jump.marketing": "Marketing",
  "services.jump.media": "Media Creatie",
  "services.jump.audioVideo": "Audio en Video",
  "services.jump.social": "Social Media",
  "services.jump.community": "Community management",
  "services.jump.webhosting": "Webhosting",
  "services.jump.domains": "Domeinnamen",
  "services.jump.ai": "AI",
  "services.jump.aeo": "AEO",
  "services.jump.geo": "GEO",
  "services.jump.seo": "SEO",
  "services.jump.chatbots": "Chatbots",
  "services.jump.workflows": "Workflows",
  "services.jump.advice": "Advies",
  "services.jump.integration": "Integratie",
  "services.jump.automation": "Automatisering",
  "services.jump.digitalDesign": "Digital design",
  "services.jump.printing": "Printing",
  "services.jump.webdesign": "Webdesign",
  "services.jump.malware": "Malware verwijderen",
  "services.jump.backup": "Backup en migratie",
  "services.jump.security": "Beveiliging",
  "services.jump.speed": "Performance en snelheid",
  "services.jump.custom": "Maatwerk",
  "services.jump.wordpress": "WordPress",
  "services.jump.maintenance": "Onderhoud",
  "services.jump.support": "Support",
  "services.inquiry.wp.trigger": "Vraag AI voor WordPress aan",
  "services.inquiry.wp.ctaTitle": "AI in uw WordPress laten bouwen?",
  "services.inquiry.wp.ctaText":
    "Stuur een korte aanvraag via het formulier — we kijken mee naar chatbots, content-AI, WooCommerce of maatwerk en reageren met concrete stappen.",
  "services.inquiry.wp.hint": "WordPress-website",
  "services.inquiry.ecom.trigger": "Vraag AI voor E-commerce aan",
  "services.inquiry.ecom.ctaTitle": "AI in uw webshop laten bouwen?",
  "services.inquiry.ecom.ctaText":
    "Stuur een korte aanvraag — we kijken mee naar productassistenten, search, cart-hulp of support-AI en reageren met concrete stappen.",
  "services.inquiry.ecom.hint": "webshop",
  "services.inquiry.web.trigger": "Vraag AI voor website aan",
  "services.inquiry.web.ctaTitle": "AI in uw website laten bouwen?",
  "services.inquiry.web.ctaText":
    "Stuur een korte aanvraag — we kijken mee naar chat, leadkwalificatie, knowledge search of maatwerk-AI op uw stack en reageren met concrete stappen.",
  "services.inquiry.web.hint": "maatwerkwebsite",
  "common.openMenu": "Menu openen",
  "common.cart": "Winkelwagen",
  "common.account": "Account",
  "common.allServices": "Alle diensten",
  "pricing.billingPeriod": "Facturatieperiode",
  "pricing.contactEnterprise": "Contact over Enterprise",
  "pricing.enterpriseHint": "Enterprise-plan",
  "pricing.enterpriseDesc":
    "Vertel kort wat u nodig heeft — we sturen een voorstel op maat.",
  "pricing.hostingMonth": "1× webhosting (1 maand)",
  "pricing.hostingYear": "1× webhosting (12 maanden)",
  "inquiry.websiteHint": "website / webshop",
  "inquiry.defaultMessage":
    "Hallo TripleZero iT,\n\nIk wil graag meer weten over {service} voor onze {hint}.\n\nWebsite-URL:\nDoel (bijv. chatbot, productassistent, content-AI, maatwerk):\n\n",
  "inquiry.requestAi": "Vraag AI-aanvraag in",
  "inquiry.sendRequest": "Verstuur aanvraag",
  "hero.liveSignals": "Live growth signalen",
  "legal.sharingData": "Gegevens delen: ",
  "legal.name": "Naam",
  "legal.expiration": "Verloop",
  "legal.function": "Functie",
  "locations.startFreeAiScan": "Start gratis AI-scan",
  "locations.allServices": "Alle diensten",
  "locations.breadcrumb": "Locaties",
  "locations.cityTitle": "AI, AEO, GEO & SEO in {name}",
  "locations.cityIntro":
    "TripleZero iT helpt ondernemers en teams in {name} sneller groeien met AI-integratie, AEO, GEO, SEO, online marketing en maatwerk software. Lokaal denkwerk, meetbare resultaten.",
  "locations.bulletScan": "Gratis AI-scan voor websites in {name}",
  "locations.bulletSeo":
    "AEO, GEO en SEO optimalisatie voor klassieke én AI-zoekmachines",
  "locations.bulletStack": "Webdesign, WordPress, hosting en digital marketing",
  "cases.client": "Klant",
  "cases.industry": "Branche",
  "cases.technologies": "Technologieën",
  "cases.visit": "Bekijk project",
  "news.previous": "Vorige",
  "news.next": "Volgende",
  "news.pageOf": "Pagina {page} van {total}",
  "news.author": "Auteur",
  "news.date": "Datum",
  "news.category": "Categorie",
  "news.openLink": "Bekijk link",
  "news.readArticle": "Lees artikel",
  "news.title": "Nieuws",
  "news.back": "Terug naar nieuws",
  "news.viewSource": "Bekijk bron",
  "news.subtitle": "Blijf op de hoogte van alle ontwikkelingen.",
};

function setPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = cur[parts[i]] || {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

const keys = Object.keys(EN);
const locales = ["en", "nl", ...ALL_TARGET_LOCALES.filter((l) => l !== "nl")];

for (const locale of locales) {
  const msgPath = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(msgPath, "utf8"));
  if (locale === "en") {
    for (const [k, v] of Object.entries(EN)) setPath(data, k, v);
  } else if (locale === "nl") {
    for (const [k, v] of Object.entries(NL)) setPath(data, k, v);
  } else {
    const missing = keys.filter((k) => {
      const cur = getPath(data, k);
      return !cur || cur === EN[k];
    });
    if (!missing.length) {
      console.log(`chrome ${locale} (cached)`);
      continue;
    }
    console.log(`chrome ${locale} (${missing.length})`);
    const vals = await translateManyConcurrent(
      missing.map((k) => EN[k]),
      locale,
      "en",
      { concurrency: CONCURRENCY },
    );
    missing.forEach((k, i) => setPath(data, k, vals[i]));
  }
  writeFileSync(msgPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`wrote ${locale}`);
}
console.log("done public chrome");

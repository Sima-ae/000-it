/**
 * Apply curated EN titles + phrase cleanup for remaining Dutch leftovers.
 * Usage: node prisma/kennisbank/patch-en-titles.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ARTICLES = "prisma/kennisbank/articles";

const curated = {
  "domein-quarantaine-halen": "Remove a .nl domain from quarantine",
  "waarom-is-mijn-url-gelockt": "Why is my domain locked?",
  "abonnement-of-dienst-opheffen-opzeggen": "Cancel a subscription or service",
  "wat-is-een-autorisatiecode": "What is an authorization code (EPP/auth code)?",
  "wat-is-xmlrpc-php-en-hoe-zet-je-xml-rpc-uit": "What is xmlrpc.php and how do you disable XML-RPC?",
  "inloggen-op-cyberpanel": "Sign in to CyberPanel",
  "welke-vervolgstappen-zet-ik-na-mijn-ai-scan": "What next steps should I take after my AI scan?",
  "hosting-in-business-extra-growth-versus-losse-hosting-in-de-shop":
    "Hosting in Business/Extra Growth versus standalone hosting in the shop",
  "hoe-open-ik-het-ai-agents-overzicht-in-mijn-account":
    "How do I open the AI agents overview in my account?",
  "hoe-start-pauzeer-of-zet-ik-een-ai-agent-op-idle":
    "How do I start, pause, or set an AI agent to idle?",
  "inloggen-op-managed-vps-bij-triplezero-it": "Sign in to a managed VPS at TripleZero iT",
  "inloggen-op-het-wordpress-dashboard": "Sign in to the WordPress dashboard",
  "handmatig-een-nieuwe-plesk-licentie-installeren": "Manually install a new Plesk license",
  "extra-gebruiker-toevoegen-aan-je-klantomgeving": "Add an extra user to your client area",
  "overzicht-producten-en-diensten": "Overview of products and services",
  "inloggen-op-je-klantomgeving": "Sign in to your client area and change your password",
  "inloggen-op-je-mysql-database": "Sign in to your MySQL database",
  "gegevens-wijzigen-in-je-klantomgeving": "Change details in your client area",
  "producten-bestellen-in-je-klantomgeving": "Order products in your client area",
  upgraden: "Upgrade products",
  "overzicht-menu-items-in-plesk": "Overview of menu items in Plesk",
  "wat-doet-de-content-agent-en-wanneer-zet-ik-die-in":
    "What does the content agent do and when should I use it?",
  "wanneer-zet-ik-een-agent-op-paused-versus-idle":
    "When should I set an agent to PAUSED versus IDLE?",
  "hoe-helpen-content-agents-bij-blogs-landingspaginas-en-faqs":
    "How do content agents help with blogs, landing pages and FAQs?",
  "hoe-zet-ik-social-en-ads-agents-in-als-een-marketingworkflow":
    "How do I use social and ads agents as one marketing workflow?",
  "hoe-combineer-ik-research-agent-en-content-agent-voor-nieuwe-diensten":
    "How do I combine the research agent and content agent for new services?",
  "hoe-gebruik-ik-de-chatbot-agent-naast-live-chat-en-tickets":
    "How do I use the chatbot agent alongside live chat and tickets?",
  "hoe-past-seo-optimalisatie-losse-dienst-naast-een-pakkettraject":
    "How does SEO optimization (standalone service) fit alongside a package track?",
  "wat-is-het-verschil-tussen-de-diensten-aeo-geo-en-seo-optimalisatie":
    "What is the difference between the AEO, GEO and SEO optimization services?",
  "hoe-verhuis-ik-mijn-bestaande-blog-posts-en-media-zonder-seo-schade":
    "How do I move my existing blog (posts and media) without SEO damage?",
  "concepten-inplannen-en-publiceren-hoe-werkt-de-workflow":
    "Drafts, scheduling and publishing: how does the workflow work?",
  "featured-snippets-en-faq-blokken-in-blogposts-wanneer-wel-niet":
    "Featured snippets and FAQ blocks in blog posts: when to use them",
  "hoe-hergebruik-ik-oude-posts-updates-redirects-zonder-duplicate-content":
    "How do I reuse old posts (updates, redirects) without duplicate content?",
  "hoe-deel-ik-nieuwe-posts-automatisch-of-handmatig-op-social-media":
    "How do I share new posts automatically or manually on social media?",
  "rss-sitemaps-en-indexatie-hoe-blijven-nieuwe-posts-vindbaar":
    "RSS, sitemaps and indexation: how do new posts stay findable?",
  "monetisatie-van-een-blog-affiliates-sponsored-posts-vermelding":
    "Monetizing a blog: affiliates, sponsored posts and what to disclose",
  "nieuwsbrief-na-elk-artikel-hoe-zet-ik-een-eenvoudige-workflow-op":
    "Newsletter after each article: how do I set up a simple workflow?",
  "licentie-toewijzen-of-intrekken-microsoft-365":
    "Assign or revoke a Microsoft 365 license for a user",
  "rollen-global-admin-versus-gebruiker":
    "Roles in Microsoft 365: global admin versus user",
  "gebruiker-offboarden-mailbox-onedrive-overdragen":
    "Offboard a user: transfer mailbox and OneDrive",
  "social-proof-en-trustsignalen-op-landingspaginas":
    "Social proof and trust signals on landing pages",
  "landingspagina-versus-homepage-wanneer-wat":
    "Landing page versus homepage: when to use which",
  "privacytekst-en-toestemming-bij-leadformulieren":
    "Privacy text and consent on lead forms",
  "meertalige-landingspaginas-zonder-dubbele-content":
    "Multilingual landing pages without duplicate content",
  "landingspagina-koppelen-aan-crm-of-nieuwsbrief":
    "Connect a landing page to CRM or a newsletter",
  "designsystemen-hergebruiken-op-landingspaginas":
    "Reuse design systems on landing pages",
  "landingspaginas-hosten-naast-wordpress-of-next-js":
    "Host landing pages alongside WordPress or Next.js",
  "schema-org-voor-landingspaginas-offer-faq":
    "Schema.org for landing pages (Offer, FAQ)",
  "remarketing-landingspaginas-consistent-houden":
    "Keep remarketing landing pages consistent",
  "chatbot-op-je-website-use-cases-die-echt-helpen":
    "Chatbot on your website: use cases that actually help",
  "eerste-zapier-workflow-leadformulier-naar-e-mail":
    "First Zapier workflow: lead form to email",
  "social-posts-plannen-via-automatisering": "Schedule social posts with automation",
  "backup-van-workflow-definities": "Backup of workflow definitions",
  "audittrail-wie-wijzigde-welke-workflow":
    "Audit trail: who changed which workflow",
  "cross-domain-tracking-voor-landingspagina-shop":
    "Cross-domain tracking for landing page + shop",
  "kwalitatief-onderzoek-interviews-naast-cijfers":
    "Qualitative research: interviews alongside metrics",
  "cdn-en-vitals-edge-dichterbij-de-gebruiker":
    "CDN and vitals: edge closer to the user",
  "alternatieven-stripe-naast-mollie": "Alternatives: Stripe alongside Mollie",
  "structured-data-product-naast-de-feed": "Structured data Product alongside the feed",
  "cdn-kiezen-naast-hosting-bij-triplezero-it":
    "Choosing a CDN alongside hosting at TripleZero iT",
  "cloudflare-dns-naast-triplezero-it-nameservers":
    "Cloudflare DNS alongside TripleZero iT nameservers",
  "lokale-landingspaginas-zonder-doorway-spam":
    "Local landing pages without doorway spam",
  "staging-vps-naast-productie": "Staging VPS alongside production",
  "custom-error-pages-die-helpen-i-p-v-verwarren":
    "Custom error pages that help instead of confuse",
  "nieuwsbrief-aantoonbare-toestemming": "Newsletter: demonstrable consent",
  "digitale-producten-versus-fysieke-goederen":
    "Digital products versus physical goods",
  "low-code-builders-voor-landingspaginas": "Low-code builders for landing pages",
  "agency-workflow-figma-naar-cms": "Agency workflow: Figma to CMS",
  "caldav-carddav-conceptueel-naast-imap": "CalDAV/CardDAV conceptually alongside IMAP",
  "aaaa-ipv6-naast-a-records": "AAAA (IPv6) alongside A records",
  "redis-als-object-cache-naast-page-cache": "Redis as object cache alongside page cache",
  "poortscanning-detecteren-en-reageren": "Detecting and responding to port scanning",
  "rate-limits-van-externe-apis-respecteren": "Respect rate limits of external APIs",
};

// Global phrase cleanup for any remaining partial Dutch
const phraseFixes = [
  [/Sign in to on /gi, "Sign in to "],
  [/\bklantomgeving\b/gi, "client area"],
  [/\bgebruiker\b/gi, "user"],
  [/\blicentie\b/gi, "license"],
  [/\bhandmatig\b/gi, "manually"],
  [/\bnieuwsbrief\b/gi, "newsletter"],
  [/\blandingspagina’s\b/gi, "landing pages"],
  [/\blandingspaginas\b/gi, "landing pages"],
  [/\blandingspagina\b/gi, "landing page"],
  [/\boverzicht\b/gi, "overview"],
  [/\bproducten\b/gi, "products"],
  [/\bdiensten\b/gi, "services"],
  [/\bnaast\b/gi, "alongside"],
  [/\bgelockt\b/gi, "locked"],
  [/\bquarantaine\b/gi, "quarantine"],
  [/\bautorisatiecode\b/gi, "authorization code"],
  [/\bpauzeer\b/gi, "pause"],
  [/\bvervolgstappen\b/gi, "next steps"],
  [/\blosse\b/gi, "standalone"],
  [/\bpakkettraject\b/gi, "package track"],
  [/\btoewijzen\b/gi, "assign"],
  [/\bintrekken\b/gi, "revoke"],
  [/\baantoonbare toestemming\b/gi, "demonstrable consent"],
  [/\btrustsignalen\b/gi, "trust signals"],
  [/\bprivacytekst\b/gi, "privacy text"],
  [/\btoestemming\b/gi, "consent"],
  [/\bleadformulieren\b/gi, "lead forms"],
  [/\bmeertalige\b/gi, "multilingual"],
  [/\bdubbele content\b/gi, "duplicate content"],
  [/\bhergebruiken\b/gi, "reuse"],
  [/\bdesignsystemen\b/gi, "design systems"],
  [/\bhosten\b/gi, "host"],
  [/\bhouden\b/gi, "keep"],
  [/\becht helpen\b/gi, "actually help"],
  [/\bleadformulier\b/gi, "lead form"],
  [/\beerste\b/gi, "first"],
  [/\baudittrail\b/gi, "audit trail"],
  [/\bwie wijzigde\b/gi, "who changed"],
  [/\bkwalitatief onderzoek\b/gi, "qualitative research"],
  [/\bcijfers\b/gi, "metrics"],
  [/\bdichterbij\b/gi, "closer to"],
  [/\balternatieven\b/gi, "alternatives"],
  [/\bkiezen\b/gi, "choose"],
  [/\blokale\b/gi, "local"],
  [/\bproductie\b/gi, "production"],
  [/\bhelpen i\.p\.v\. verwarren\b/gi, "help instead of confuse"],
  [/\bdigitale\b/gi, "digital"],
  [/\bfysieke goederen\b/gi, "physical goods"],
  [/\bconceptueel\b/gi, "conceptually"],
  [/\bindexatie\b/gi, "indexation"],
  [/\bblijven\b/gi, "stay"],
  [/\bvindbaar\b/gi, "findable"],
  [/\bmonetisatie\b/gi, "monetization"],
  [/\bvermelding\b/gi, "disclosure"],
  [/\bconcepten\b/gi, "drafts"],
  [/\binplannen\b/gi, "scheduling"],
  [/\bpubliceren\b/gi, "publishing"],
  [/\bhergebruik I\b/gi, "reuse"],
  [/\boude posts\b/gi, "old posts"],
  [/\bdeel I\b/gi, "share"],
  [/\bcombineer I\b/gi, "combine"],
  [/\bzet I\b/gi, "set"],
  [/\bhelpen content-agents\b/gi, "content agents help"],
  [/\bdoet the\b/gi, "does the"],
  [/\bSEO-optimalisatie\b/gi, "SEO optimization"],
  [/\bCancel\/cancel\b/gi, "Cancel"],
];

let fixed = 0;
for (const file of readdirSync(ARTICLES).filter((f) => f.endsWith(".json"))) {
  const slug = file.replace(/\.json$/, "");
  const path = join(ARTICLES, file);
  const data = JSON.parse(readFileSync(path, "utf8"));
  let title = data.en?.title || "";
  const before = title;
  if (curated[slug]) {
    title = curated[slug];
  } else {
    for (const [re, rep] of phraseFixes) title = title.replace(re, rep);
    title = title.replace(/\s+/g, " ").trim();
    if (title) title = title.charAt(0).toUpperCase() + title.slice(1);
  }
  if (title !== before) {
    data.en.title = title;
    data.en.seoTitle = `${title} | TripleZero iT`;
    writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
    fixed += 1;
  }
}
console.log(JSON.stringify({ fixed, curated: Object.keys(curated).length }));

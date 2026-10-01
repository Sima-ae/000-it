/**
 * Expand NL FAQ: enrich answers with KB/service links + add new Q&As.
 * Usage: node scripts/expand-faq-nl.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "src/content/faq-i18n");
const pack = JSON.parse(readFileSync(join(DIR, "nl.json"), "utf8"));

const L = {
  sharedVps: "/kennisbank/hosting/hoe-kies-ik-tussen-shared-hosting-wordpress-hosting-en-vps",
  sharedPlans: "/kennisbank/hosting/wat-is-shared-hosting-basic-plus-en-business",
  vpsPlans: "/kennisbank/hosting/wat-is-vps-hosting-basic-plus-en-business",
  chooseHosting: "/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket",
  migrate: "/kennisbank/hosting/website-of-e-mail-verhuizen-regelen-wij-voor-je",
  sslWhat: "/kennisbank/beveiliging/wat-is-ssl-en-waarom-heb-je-het-nodig",
  sslLe: "/kennisbank/hosting/hoe-installeer-ik-een-gratis-lets-encrypt-ssl-certificaat",
  ssh: "/kennisbank/hosting/heb-ik-ssh-toegang-op-mijn-hosting",
  sharedToVps: "/kennisbank/hosting/wanneer-stap-ik-over-van-shared-naar-vps",
  cdn: "/kennisbank/cdn-performance-cloudflare/wat-een-cdn-doet-voor-je-website",
  dns: "/kennisbank/domeinnamen/dns-records-beheren",
  dnssec: "/kennisbank/domeinnamen/wat-is-dnssec-en-hoe-voeg-ik-het-toe-aan-mijn-domein",
  spf: "/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam",
  dmarc: "/kennisbank/domeinnamen/hoe-kan-ik-een-dmarc-record-toevoegen",
  dkim: "/kennisbank/domeinnamen/dkim-record-toevoegen-aan-dns-domeinnaam",
  domainBroken: "/kennisbank/domeinnamen/mijn-nieuwe-domeinnaam-werkt-niet",
  protectId: "/kennisbank/domeinnamen/protect-id-domein-anoniem-registreren",
  quarantine: "/kennisbank/domeinnamen/domein-quarantaine-halen",
  wpInstall: "/kennisbank/wordpress/handleiding-wordpress-installeren",
  wpMigrate: "/kennisbank/domeinnamen/wordpress-website-verhuizen",
  wpDown: "/kennisbank/hosting/website-down-na-update-wordpress",
  wpCritical: "/kennisbank/wordpress/kritieke-fout-wordpress",
  wpHttps: "/kennisbank/wordpress/wordpress-url-omzetten-van-http-naar-https",
  wpCookie: "/kennisbank/wordpress/hoe-voeg-ik-een-gdpr-avg-cookiebanner-toe-in-wordpress",
  aiScanWhat: "/kennisbank/ai-scan/wat-is-de-ai-scan-van-triplezero-it-hosting",
  aiScanStart: "/kennisbank/ai-scan/hoe-start-ik-een-ai-scan-op-mijn-website",
  aiScanScores: "/kennisbank/ai-scan/hoe-lees-ik-de-ai-scan-scores-aeo-geo-seo-performance-en-ai-readiness",
  aiScanNext: "/kennisbank/ai-scan/welke-vervolgstappen-zet-ik-na-mijn-ai-scan",
  aiScanVs: "/kennisbank/ai-scan/ai-scan-versus-een-volledig-aeo-geo-seo-traject-wat-is-het-verschil",
  aeo: "/kennisbank/aeo-geo-seo/wat-is-aeo-answer-engine-optimization",
  geo: "/kennisbank/aeo-geo-seo/wat-is-geo-geographic-seo-en-voor-wie-is-het-relevant",
  aeoGeoSeo: "/kennisbank/aeo-geo-seo/hoe-hangen-aeo-geo-en-seo-samen",
  localSeo: "/kennisbank/aeo-geo-seo/hoe-verbeter-ik-mijn-lokale-vindbaarheid-google-business-profile-en-nap",
  seoOrder: "/kennisbank/aeo-geo-seo/hoe-bestel-of-start-ik-seo-optimalisatie-via-triplezero-it-hosting",
  backup: "/kennisbank/support/mijn-site-doet-het-niet-meer-hebben-jullie-een-backup",
  jetbackup: "/kennisbank/directadmin/wat-is-jetbackup-en-waar-gebruik-ik-het-voor",
  daBackup: "/kennisbank/directadmin/backup-maken-en-terugzetten-directadmin",
  ticket: "/kennisbank/support/hoe-maak-ik-een-support-ticket-aan-in-het-klantenpanel",
  ticketPanel: "/kennisbank/support/hoe-stel-ik-een-ticket-in-voor-support-via-het-klantenpanel",
  chatVs: "/kennisbank/support/chat-versus-ticket-versus-belafspraak-wat-kies-ik-wanneer",
  call: "/kennisbank/support/hoe-werkt-de-belafspraak-bij-triplezero-it-hosting",
  assistant: "/kennisbank/support/digitale-assistent-triplezero-it-hosting",
  contactSupport: "/kennisbank/support/hoe-neem-ik-contact-op-met-de-support-van-triplezero-it-hosting",
  beforeSupport: "/kennisbank/support/wat-kan-ik-zelf-doen-voordat-ik-contact-opneem-met-support",
  loginLost: "/kennisbank/crm-klantenpanel/logingegevens-klantenpanel-kwijt",
  invoiceEdit: "/kennisbank/crm-klantenpanel/hoe-wijzig-ik-mijn-factuurgegevens-en-betaalmethode",
  invoiceView: "/kennisbank/crm-klantenpanel/hoe-download-of-raadpleeg-ik-factuurdetails",
  agents: "/kennisbank/ai-agents/wat-zijn-ai-agents-bij-triplezero-it-hosting",
  agentsOpen: "/kennisbank/ai-agents/hoe-open-ik-het-ai-agents-overzicht-in-mijn-account",
  consent: "/kennisbank/analytics-conversie-toegankelijkheid/consent-mode-en-cookiebanners-correct-koppelen",
  privacyForm: "/kennisbank/webdesign-en-maatwerk/privacytekst-en-toestemming-bij-leadformulieren",
  emailIssues: "/kennisbank/hosting/problemen-met-e-mail-website",
  emailAndroid: "/kennisbank/e-mail/e-mail-instellen-op-android",
  emailWp: "/kennisbank/e-mail/e-mailadres-eigen-domein-wordpress",
  inodes: "/kennisbank/hosting/inodes-en-inode-limieten",
  storage: "/kennisbank/hosting/onbeperkte-opslag-en-dataverkeer",
  tfa: "/kennisbank/directadmin/2fa-instellen-in-directadmin",
  objectCache: "/kennisbank/hosting/persistent-object-cache-in-wordpress",
  dedicatedVs: "/kennisbank/infrastructuur-servers/verschil-tussen-dedicated-vps-en-shared-hosting",
};

function link(label, href) {
  return `[${label}](${href})`;
}

function appendLinks(answer, links) {
  if (!links?.length) return answer;
  if (answer.includes("/kennisbank/") || answer.includes("](/")) return answer;
  const line = links.map(([label, href]) => link(label, href)).join(" · ");
  return `${answer.trim()} Meer lezen: ${line}.`;
}

/** Enrich existing item answers by id */
const enrich = {
  "alg-1": (a) =>
    appendLinks(a, [
      ["Over ons", "/over-ons"],
      ["Diensten", "/diensten"],
    ]),
  "alg-2": (a) =>
    appendLinks(a, [
      ["Afspraak plannen", "/afspraak"],
      ["Contact", "/contact"],
    ]),
  "ai-1": (a) =>
    appendLinks(a, [
      ["Wat is de AI-scan?", L.aiScanWhat],
      ["AI-scan starten", "/ai-scan"],
    ]),
  "ai-2": (a) =>
    appendLinks(a, [
      ["Scores uitleggen", L.aiScanScores],
    ]),
  "ai-3": (a) =>
    appendLinks(a, [
      ["AI-scan starten", L.aiScanStart],
    ]),
  "ai-8": (a) =>
    appendLinks(a, [
      ["AI-readiness in de scan", L.aiScanScores],
    ]),
  "ai-9": (a) =>
    appendLinks(a, [
      ["Wat zijn AI-agents?", L.agents],
      ["Agents in je account", L.agentsOpen],
    ]),
  "seo-1": (a) =>
    appendLinks(a, [
      ["Hoe AEO, GEO en SEO samenhangen", L.aeoGeoSeo],
      ["Wat is AEO?", L.aeo],
    ]),
  "seo-2": (a) =>
    appendLinks(a, [
      ["Wat is GEO?", L.geo],
    ]),
  "seo-5": (a) =>
    appendLinks(a, [
      ["Lokale vindbaarheid verbeteren", L.localSeo],
    ]),
  "seo-3": (a) =>
    appendLinks(a, [
      ["SEO starten", L.seoOrder],
    ]),
  "sup-1": (a) =>
    appendLinks(a, [
      ["Contact met support", L.contactSupport],
      ["Chat, ticket of belafspraak", L.chatVs],
    ]),
  "sup-2": (a) =>
    appendLinks(a, [
      ["Contact", "/contact"],
      ["Ticket aanmaken", L.ticket],
      ["Belafspraak", L.call],
    ]),
  "sup-4": (a) =>
    appendLinks(a, [
      ["Backups bij downtime", L.backup],
    ]),
  "sup-6": (a) =>
    appendLinks(a, [
      ["Site down na WP-update", L.wpDown],
    ]),
  "sup-7": (a) =>
    appendLinks(a, [
      ["Website of e-mail verhuizen", L.migrate],
    ]),
  "sup-8": (a) =>
    appendLinks(a, [
      ["Backups", L.backup],
      ["Zelf checken vóór support", L.beforeSupport],
    ]),
  "sup-9": (a) =>
    appendLinks(a, [
      ["Ticket via klantenpanel", L.ticketPanel],
      ["Login kwijt?", L.loginLost],
    ]),
  "web-1": (a) =>
    appendLinks(a, [
      ["WordPress installeren", L.wpInstall],
      ["Diensten", "/diensten"],
    ]),
  "web-11": (a) =>
    appendLinks(a, [
      ["Wat doet een CDN?", L.cdn],
    ]),
  "host-1": (a) =>
    appendLinks(
      "We bieden shared hosting, cloud hosting, WordPress hosting en VPS — plus domeinregistratie.",
      [
        ["Shared, WordPress of VPS kiezen", L.sharedVps],
        ["Hostingpakketten", "/diensten/categorie/hosting"],
      ],
    ),
  "host-2": (a) =>
    appendLinks(
      "Shared is voordelig voor kleinere sites. Cloud geeft meer resources en schaalbaarheid, volledig beheerd. WordPress hosting is geoptimaliseerd voor WP. VPS geeft meer controle voor zwaardere loads.",
      [
        ["Verschillen uitgelegd", L.sharedVps],
        ["Shared-plannen", L.sharedPlans],
        ["VPS-plannen", L.vpsPlans],
      ],
    ),
  "host-3": (a) =>
    appendLinks(a, [
      ["Domeinen", "/domeinen"],
      ["DNS beheren", L.dns],
    ]),
  "host-4": (a) =>
    appendLinks(a, [
      ["Wat is SSL?", L.sslWhat],
      ["Let's Encrypt installeren", L.sslLe],
    ]),
  "host-5": (a) =>
    appendLinks(a, [
      ["Website of e-mail verhuizen", L.migrate],
      ["WordPress verhuizen", L.wpMigrate],
    ]),
  "host-6": (a) =>
    appendLinks(a, [
      ["JetBackup", L.jetbackup],
      ["Backup in DirectAdmin", L.daBackup],
    ]),
  "host-7": (a) =>
    appendLinks(a, [
      ["Wanneer naar VPS?", L.sharedToVps],
    ]),
  "host-8": (a) =>
    appendLinks(a, [
      ["SPF-record", L.spf],
      ["DKIM", L.dkim],
      ["DMARC", L.dmarc],
    ]),
  "host-9": (a) =>
    appendLinks(a, [
      ["SSL", L.sslWhat],
      ["2FA in DirectAdmin", L.tfa],
    ]),
  "host-10": (a) =>
    appendLinks(a, [
      ["Shared naar VPS", L.sharedToVps],
    ]),
  "host-11": (a) =>
    appendLinks(a, [
      ["Wat doet een CDN?", L.cdn],
    ]),
  "host-13": (a) =>
    appendLinks(a, [
      ["DNS-records beheren", L.dns],
      ["DNSSEC", L.dnssec],
    ]),
  "host-14": (a) =>
    appendLinks(a, [
      ["Juiste hostingpakket kiezen", L.chooseHosting],
      ["Shared vs WP vs VPS", L.sharedVps],
    ]),
  "host-15": (a) =>
    appendLinks(a, [
      ["Shop", "/shop"],
      ["Hostingdiensten", "/diensten/categorie/hosting"],
    ]),
};

const additions = {
  algemeen: [
    {
      id: "alg-14",
      question: "Wat is Agent 000 (de chatassistent)?",
      answer: `Agent 000 is onze digitale assistent op de site en in supportflows. Hij beantwoordt veelgestelde vragen, wijst naar kennisbankartikelen en kan je doorverwijzen naar live chat, een ticket of een afspraak wanneer menselijke hulp beter past. Meer lezen: ${link("Digitale assistent", L.assistant)} · ${link("Chat, ticket of belafspraak", L.chatVs)}.`,
    },
    {
      id: "alg-15",
      question: "Hoe plan ik een afspraak of belafspraak?",
      answer: `Via de pagina Afspraak kies je een moment dat past. Voor snelle vragen kun je ook live chat of een ticket gebruiken; een belafspraak is handig bij complexere trajecten of intakes. Meer lezen: ${link("Afspraak", "/afspraak")} · ${link("Belafspraak uitgelegd", L.call)}.`,
    },
    {
      id: "alg-16",
      question: "Waar zie ik de status van jullie diensten?",
      answer: `Op de statuspage tonen we incidenten en onderhoud rond hosting en gerelateerde diensten, zodat je snel ziet of er iets speelt. Meer lezen: ${link("Statuspage", "/statuspage")}.`,
    },
    {
      id: "alg-17",
      question: "Hebben jullie een kennisbank?",
      answer: `Ja. In de kennisbank staan handleidingen over domeinen, DNS, e-mail, hosting, WordPress, AI-scan, security en meer — met stapsgewijze uitleg. Meer lezen: ${link("Kennisbank", "/kennisbank")}.`,
    },
    {
      id: "alg-18",
      question: "Hoe gaan jullie om met privacy en cookies?",
      answer: `We werken AVG-bewust: privacyteksten, toestemming bij formulieren en cookiebanners/consent mode waar tracking nodig is. Voor WordPress helpen we met een correcte cookie-setup. Meer lezen: ${link("Cookiebanner in WordPress", L.wpCookie)} · ${link("Consent mode", L.consent)} · ${link("Privacy bij formulieren", L.privacyForm)}.`,
    },
    {
      id: "alg-19",
      question: "Waar vind ik jullie nieuws en updates?",
      answer: `Op de nieuwspagina publiceren we updates over producten, security en tips. Voor technische storingen kijk je op de statuspage. Meer lezen: ${link("Nieuws", "/nieuws")} · ${link("Statuspage", "/statuspage")}.`,
    },
    {
      id: "alg-20",
      question: "Wat kost het om met jullie te werken?",
      answer: `Dat hangt af van de mix: hosting en shopproducten hebben vaste prijzen; design, SEO, ads en retainers volgen na intake. In de shop zie je pakketten; voor maatwerk krijg je een voorstel. Meer lezen: ${link("Shop", "/shop")} · ${link("Contact", "/contact")}.`,
    },
    {
      id: "alg-21",
      question: "Kunnen jullie ook alleen consulting of audit doen?",
      answer: `Ja. Audits, AI-scans, technische reviews en sparringsessies kunnen los van een full-service traject. Daarna kun je zelf uitvoeren of ons laten doorpakken. Meer lezen: ${link("AI-scan", "/ai-scan")} · ${link("Diensten", "/diensten")}.`,
    },
  ],
  ai: [
    {
      id: "ai-14",
      question: "Hoe start ik een AI-scan op mijn website?",
      answer: `Ga naar de AI-scan, voer je URL in en start de analyse. Je krijgt scores voor AEO, GEO, SEO, performance en AI-readiness plus verbeterpunten. Meer lezen: ${link("AI-scan starten", L.aiScanStart)} · ${link("AI-scan pagina", "/ai-scan")}.`,
    },
    {
      id: "ai-15",
      question: "Hoe lees ik de AI-scan scores?",
      answer: `Elke score toont hoe sterk je staat op dat vlak; lage scores komen met concrete tips. Gebruik de scan als prioriteitenlijst, niet als eenmalige “report card”. Meer lezen: ${link("Scores uitleggen", L.aiScanScores)} · ${link("Vervolgstappen", L.aiScanNext)}.`,
    },
    {
      id: "ai-16",
      question: "Wat is het verschil tussen een AI-scan en een volledig AEO/GEO/SEO-traject?",
      answer: `De scan is een snelle diagnose. Een traject voert verbeteringen door: content, structured data, technische SEO, lokale signalen en meting over tijd. Meer lezen: ${link("Scan versus traject", L.aiScanVs)} · ${link("SEO starten", L.seoOrder)}.`,
    },
    {
      id: "ai-17",
      question: "Waar vind ik eerdere AI-scans in mijn account?",
      answer: `Ingelogde klanten zien eerdere scans en analyses in het dashboard (SEO-analyse), zodat je voortgang kunt vergelijken. Meer lezen: ${link("AI-scan", L.aiScanWhat)} · ${link("Account / dashboard", "/account")}.`,
    },
    {
      id: "ai-18",
      question: "Wat doe ik na een lage AEO- of GEO-score?",
      answer: `Prioriteer FAQ’s, entities, structured data (AEO) en Google Business Profile / NAP / lokale landingspagina’s (GEO). We helpen die roadmap omzetten in uitvoering. Meer lezen: ${link("Scores", L.aiScanScores)} · ${link("Lokale vindbaarheid", L.localSeo)}.`,
    },
    {
      id: "ai-19",
      question: "Hoe werken AI-agents in het klantportaal?",
      answer: `AI-agents ondersteunen taken rond SEO, content, social of ads. Je opent het overzicht in je account, ziet status en kunt agents starten of pauzeren volgens je pakket. Meer lezen: ${link("Wat zijn AI-agents?", L.agents)} · ${link("Agents openen", L.agentsOpen)}.`,
    },
    {
      id: "ai-20",
      question: "Is de AI-scan gratis?",
      answer: `Er is een toegankelijke instap via de AI-scan pagina; diepere analyses en trajecten vallen onder diensten of retainers. Na de scan zie je meteen of een vervolg zinvol is. Meer lezen: ${link("AI-scan", "/ai-scan")} · ${link("Wat is de AI-scan?", L.aiScanWhat)}.`,
    },
    {
      id: "ai-21",
      question: "Helpt Agent 000 ook met AI- en SEO-vragen?",
      answer: `Ja. Agent 000 gebruikt FAQ en kennisbank om AEO/GEO/SEO- en AI-scanvragen te beantwoorden en linkt door naar de juiste artikelen of een menselijke opvolging. Meer lezen: ${link("Digitale assistent", L.assistant)} · ${link("FAQ", "/faq")}.`,
    },
  ],
  "aeo-geo-seo": [
    {
      id: "seo-15",
      question: "Wat is AEO precies?",
      answer: `AEO (Answer Engine Optimization) maakt content zo dat AI-antwoorden en antwoordengines je merk correct kunnen citeren: duidelijke FAQ’s, entities en structured data. Meer lezen: ${link("Wat is AEO?", L.aeo)} · ${link("AEO, GEO en SEO", L.aeoGeoSeo)}.`,
    },
    {
      id: "seo-16",
      question: "Wat is GEO (geographic SEO)?",
      answer: `GEO versterkt lokale en regionale vindbaarheid — Maps, local packs en locatiegericht zoeken — via GBP, NAP-consistentie en lokale content. Meer lezen: ${link("Wat is GEO?", L.geo)} · ${link("Lokale vindbaarheid", L.localSeo)}.`,
    },
    {
      id: "seo-17",
      question: "Hoe bestel of start ik SEO-optimalisatie?",
      answer: `Start met een AI-scan of audit, daarna een voorstel met prioriteiten. Je kunt SEO ook via shop/diensten of retainer combineren met content en tech. Meer lezen: ${link("SEO starten", L.seoOrder)} · ${link("AI-scan", "/ai-scan")}.`,
    },
    {
      id: "seo-18",
      question: "Helpen jullie met structured data en FAQ-schema?",
      answer: `Ja. We zetten relevante schema’s (FAQ, Organization, LocalBusiness, producten) en structureren content zodat zoekmachines én AI je beter begrijpen. Meer lezen: ${link("AEO uitleg", L.aeo)} · ${link("AI-scan scores", L.aiScanScores)}.`,
    },
    {
      id: "seo-19",
      question: "Wat doen jullie aan Core Web Vitals?",
      answer: `We meten LCP, INP en CLS, lossen zware assets, hosting/caching en theme-problemen op, en koppelen dat aan CDN waar zinvol. Meer lezen: ${link("CDN", L.cdn)} · ${link("Hosting kiezen", L.chooseHosting)}.`,
    },
    {
      id: "seo-20",
      question: "Kunnen jullie SEO combineren met hosting en WordPress-care?",
      answer: `Ja. Stabiele hosting, updates en performance vormen de basis; SEO bouwt daarop. Veel klanten combineren WP-care + hosting + doorlopende SEO. Meer lezen: ${link("Hosting", "/diensten/categorie/hosting")} · ${link("SEO starten", L.seoOrder)}.`,
    },
  ],
  adverteren: [
    {
      id: "ads-14",
      question: "Helpen jullie met consent mode en cookiebanners voor ads?",
      answer: `Ja. Zonder correcte consent en tagging is advertentiemeting onbetrouwbaar. We koppelen banners, GTM/GA4 en pixels netjes. Meer lezen: ${link("Consent mode", L.consent)} · ${link("Cookiebanner WordPress", L.wpCookie)}.`,
    },
    {
      id: "ads-15",
      question: "Kunnen jullie landingspagina’s voor campagnes bouwen?",
      answer: `Ja — snelle landingspagina’s of WordPress-pagina’s afgestemd op zoekintentie, met tracking en CRO-basics. Meer lezen: ${link("Diensten", "/diensten")} · ${link("Shop", "/shop")}.`,
    },
    {
      id: "ads-16",
      question: "Hoe voorkomen jullie verspild adbudget?",
      answer: `Strakke accountstructuur, negatieve keywords, audience-uitsluitingen, landingpage-fit en wekelijkse optimalisatie op CPA/ROAS — niet op klikken alleen.`,
    },
    {
      id: "ads-17",
      question: "Werken ads goed samen met AEO/SEO?",
      answer: `Ja. Ads leveren snelle data en traffic; SEO/AEO bouwen duurzame zichtbaarheid. Insights uit keywords en creatives voeden content en landingspagina’s. Meer lezen: ${link("AEO, GEO en SEO", L.aeoGeoSeo)}.`,
    },
  ],
  design: [
    {
      id: "des-14",
      question: "Leveren jullie ook design systemen en componentbibliotheken?",
      answer: `Ja, voor merken die consistent willen schalen: tokens, componenten en documentatie zodat marketing en product dezelfde taal spreken.`,
    },
    {
      id: "des-15",
      question: "Kunnen jullie bestaande merkstijl digitaliseren?",
      answer: `Ja. We vertalen print of incomplete brand guidelines naar webklare kleuren, typografie, UI-kit en templates.`,
    },
    {
      id: "des-16",
      question: "Doen jullie UX-research of alleen visueel design?",
      answer: `Beide. Waar nodig starten we met interviews, funnelanalyse of heatmaps; daarna UI. Zo ontwerpen we op gedrag, niet alleen op smaak.`,
    },
    {
      id: "des-17",
      question: "Kunnen jullie social templates en ad creatives ontwerpen?",
      answer: `Ja — carrousels, thumbnails, stories en adsets die aansluiten op jullie merk en campagnedoelen. Meer lezen: ${link("Diensten", "/diensten")}.`,
    },
  ],
  marketing: [
    {
      id: "mkt-14",
      question: "Wat zit er typisch in een marketingretainer?",
      answer: `Een mix van strategie, content of SEO, campagnes, rapportage en experimenten — afgestemd op KPI’s. Scope en uren leggen we vast zodat prioriteiten helder blijven. Meer lezen: ${link("Shop", "/shop")} · ${link("Contact", "/contact")}.`,
    },
    {
      id: "mkt-15",
      question: "Helpen jullie met positionering en messaging?",
      answer: `Ja. Heldere positionering, value props en pagina-copy zorgen dat ads, SEO en sales dezelfde boodschap uitdragen.`,
    },
    {
      id: "mkt-16",
      question: "Meten jullie marketing aan pipeline, niet alleen traffic?",
      answer: `Waar mogelijk wel: leads, SQL’s, revenue of assisted conversions. Traffic zonder kwaliteit sturen we bij of stoppen we.`,
    },
    {
      id: "mkt-17",
      question: "Kunnen jullie marketing stack en tracking opschonen?",
      answer: `Ja — GTM, GA4, pixels, CRM-koppelingen en consent. Schone data is de basis voor goede beslissingen. Meer lezen: ${link("Consent mode", L.consent)}.`,
    },
  ],
  "social-media": [
    {
      id: "soc-14",
      question: "Helpen jullie met social proof en reviews?",
      answer: `Ja. We plannen review-requests, cases en UGC-achtige formats die vertrouwen opbouwen — zonder nepengagement.`,
    },
    {
      id: "soc-15",
      question: "Kunnen jullie employee advocacy opzetten?",
      answer: `Ja, vooral op LinkedIn: eenvoudige guidelines, templates en een ritme zodat het team zichtbaar expertise deelt.`,
    },
    {
      id: "soc-16",
      question: "Hoe koppelen jullie social aan de website en shop?",
      answer: `Via UTM’s, landingspagina’s, productlinks en retargeting. Social is een kanaal in de funnel, geen eiland. Meer lezen: ${link("Shop", "/shop")}.`,
    },
  ],
  support: [
    {
      id: "sup-14",
      question: "Wat is het verschil tussen chat, ticket en belafspraak?",
      answer: `Chat is snel voor korte vragen; tickets zijn beter voor technische cases met logs en opvolging; een belafspraak past bij intake of complexe uitleg. Meer lezen: ${link("Chat versus ticket versus belafspraak", L.chatVs)}.`,
    },
    {
      id: "sup-15",
      question: "Hoe maak ik een supportticket aan?",
      answer: `Log in op het klantenpanel en open een ticket met duidelijke URL, stappen en screenshots. Hoe beter de info, hoe sneller we kunnen helpen. Meer lezen: ${link("Ticket aanmaken", L.ticket)} · ${link("Ticket via panel", L.ticketPanel)}.`,
    },
    {
      id: "sup-16",
      question: "Hebben jullie backups als mijn site platligt?",
      answer: `Ja, afhankelijk van je hosting- of supportpakket. Bij downtime herstellen we waar mogelijk vanuit backups en onderzoeken we de oorzaak. Meer lezen: ${link("Backups bij downtime", L.backup)} · ${link("JetBackup", L.jetbackup)}.`,
    },
    {
      id: "sup-17",
      question: "Wat kan ik zelf checken voordat ik support bel?",
      answer: `Check statuspage, DNS-propagatie, recente updates, schijfruimte en of de fout reproduceerbaar is. Dat versnelt de diagnose. Meer lezen: ${link("Zelf doen vóór support", L.beforeSupport)} · ${link("Statuspage", "/statuspage")}.`,
    },
    {
      id: "sup-18",
      question: "Hoe werkt live chat op de site?",
      answer: `Open live chat via de chatknop. Agent 000 helpt eerst met FAQ/kennisbank; bij complexere of urgente zaken schakelen we door naar een medewerker. Meer lezen: ${link("Digitale assistent", L.assistant)} · ${link("Contact", "/contact")}.`,
    },
    {
      id: "sup-19",
      question: "Helpen jullie bij een kritieke WordPress-fout?",
      answer: `Ja. We diagnosticeren white screens, kritieke PHP-fouten en plugin-conflicten, met backup en gerichte fix. Meer lezen: ${link("Kritieke fout WordPress", L.wpCritical)} · ${link("Down na update", L.wpDown)}.`,
    },
    {
      id: "sup-20",
      question: "Kunnen jullie remote meekijken (TeamViewer e.d.)?",
      answer: `Waar nodig en met toestemming wel, voor desktop- of panelproblemen. Voor de meeste hostingzaken volstaat toegang tot panel, DNS of WordPress. Meer lezen: ${link("Contact support", L.contactSupport)}.`,
    },
    {
      id: "sup-21",
      question: "Hoe zeg ik een abonnement of dienst op?",
      answer: `Opzeggen kan via het klantenpanel of support; let op opzegtermijnen in je overeenkomst. We helpen data/export en DNS-overdracht netjes afronden. Meer lezen: ${link("Contact", "/contact")} · ${link("Account", "/account")}.`,
    },
    {
      id: "sup-22",
      question: "Bieden jullie WordPress Care / onderhoudspakketten?",
      answer: `Ja. Updates, backups, security-checks en performance vallen onder care-pakketten — ideaal naast hosting. Meer lezen: ${link("Shop", "/shop")} · ${link("WordPress installeren", L.wpInstall)}.`,
    },
    {
      id: "sup-23",
      question: "Wat als e-mail plotseling stopt met werken?",
      answer: `Check DNS (MX/SPF/DKIM/DMARC), mailboxquota en of Microsoft of providers mail blokkeren. Wij helpen de keten doormeten. Meer lezen: ${link("E-mailproblemen", L.emailIssues)} · ${link("SPF", L.spf)}.`,
    },
  ],
  webdesign: [
    {
      id: "web-15",
      question: "Bouwen jullie ook webshops?",
      answer: `Ja, van marketing-sites met checkout-integraties tot e-commerce op WordPress of maatwerk. Scope, betalingen en fulfillment stemmen we af in de intake. Meer lezen: ${link("Diensten", "/diensten")} · ${link("Shop", "/shop")}.`,
    },
    {
      id: "web-16",
      question: "Hoe gaan jullie om met privacyteksten op sites?",
      answer: `We adviseren en implementeren privacy- en toestemmingsflows bij formulieren en banners, afgestemd op jullie jurist waar nodig. Meer lezen: ${link("Privacy bij formulieren", L.privacyForm)} · ${link("Cookiebanner", L.wpCookie)}.`,
    },
    {
      id: "web-17",
      question: "Leveren jullie staging-omgevingen?",
      answer: `Ja, waar relevant: staging voor reviews en tests, daarna gecontroleerde deploy naar productie.`,
    },
    {
      id: "web-18",
      question: "Kunnen jullie een bestaande WordPress-site overnemen en verbeteren?",
      answer: `Ja — audit, updates, security, snelheid, UX en SEO, zonder onnodig vanaf nul te bouwen. Meer lezen: ${link("WP verhuizen", L.wpMigrate)} · ${link("Kritieke fouten", L.wpCritical)}.`,
    },
    {
      id: "web-19",
      question: "Hoe zit het met HTTP naar HTTPS na oplevering?",
      answer: `Sites gaan standaard op HTTPS. Bij migraties forceren we HTTPS en lossen we mixed-content op. Meer lezen: ${link("HTTP naar HTTPS in WordPress", L.wpHttps)} · ${link("SSL", L.sslWhat)}.`,
    },
  ],
  webhosting: [
    {
      id: "host-16",
      question: "Wat is cloud hosting bij jullie?",
      answer: `Cloud hosting geeft meer resources en schaalbaarheid dan klassieke shared, terwijl wij het beheer blijven doen. Ideaal wanneer shared krap wordt maar full VPS nog niet nodig is. Meer lezen: ${link("Shared vs WP vs VPS", L.sharedVps)} · ${link("Hosting", "/diensten/categorie/hosting")}.`,
    },
    {
      id: "host-17",
      question: "Hoe registreer of verhuis ik een domeinnaam?",
      answer: `Nieuw registreren of transfer kan via domeinen/shop; bij een transfer heb je vaak een auth-code nodig. Daarna zetten we DNS en nameservers goed. Meer lezen: ${link("Domeinen", "/domeinen")} · ${link("Nieuw domein werkt niet", L.domainBroken)}.`,
    },
    {
      id: "host-18",
      question: "Wat zijn SPF, DKIM en DMARC?",
      answer: `Het zijn DNS-records die e-mailauthenticatie regelen en spoofing/spam verminderen. Zonder correcte records belandt mail vaker in spam. Meer lezen: ${link("SPF", L.spf)} · ${link("DKIM", L.dkim)} · ${link("DMARC", L.dmarc)}.`,
    },
    {
      id: "host-19",
      question: "Hoe beheer ik DNS-records?",
      answer: `Via het DNS-beheer van je domein of hostingpanel zet je A, AAAA, CNAME, MX en TXT-records. Wij helpen bij migraties en mail-auth. Meer lezen: ${link("DNS beheren", L.dns)} · ${link("DNSSEC", L.dnssec)}.`,
    },
    {
      id: "host-20",
      question: "Wat is DNSSEC?",
      answer: `DNSSEC ondertekent DNS-antwoorden zodat manipulatie moeilijker wordt. We kunnen het activeren waar jouw TLD en setup dat ondersteunen. Meer lezen: ${link("DNSSEC uitleg", L.dnssec)}.`,
    },
    {
      id: "host-21",
      question: "Heb ik SSH-toegang op mijn hosting?",
      answer: `Dat hangt van het pakket af. Op veel plannen is SSH beschikbaar of aan te vragen; op VPS heb je doorgaans volledige toegang. Meer lezen: ${link("SSH-toegang", L.ssh)}.`,
    },
    {
      id: "host-22",
      question: "Hoe installeer ik WordPress op jullie hosting?",
      answer: `Via het control panel (bijv. DirectAdmin/Installatron) of handmatig. We hebben een stapsgewijze handleiding. Meer lezen: ${link("WordPress installeren", L.wpInstall)}.`,
    },
    {
      id: "host-23",
      question: "Wat zijn inodes en waarom raakt mijn pakket “vol”?",
      answer: `Inodes tellen bestanden/mappen, niet alleen GB’s. Veel kleine cache- of mailbestanden kunnen de limiet raken terwijl schijfruimte nog vrij lijkt. Meer lezen: ${link("Inodes", L.inodes)} · ${link("Opslag en verkeer", L.storage)}.`,
    },
    {
      id: "host-24",
      question: "Wat betekent “onbeperkte” opslag of dataverkeer?",
      answer: `“Onbeperkt” volgt fair-use: normaal websitegebruik is prima; misbruik of extreme loads kunnen we beperken om het platform stabiel te houden. Meer lezen: ${link("Opslag en verkeer", L.storage)}.`,
    },
    {
      id: "host-25",
      question: "Kan ik mijn domein anoniem registreren (Protect ID)?",
      answer: `Waar de registry het toelaat, kun je privacy/Protect ID overwegen. Regels verschillen per extensie (.nl heeft eigen kaders). Meer lezen: ${link("Protect ID", L.protectId)}.`,
    },
    {
      id: "host-26",
      question: "Mijn domein staat in quarantaine — wat nu?",
      answer: `Na opheffing kan een domein in quarantaine staan. Afhankelijk van de registry kun je het vaak nog terugactiveren tegen kosten. Meer lezen: ${link("Domein uit quarantaine", L.quarantine)} · ${link("Support", "/contact")}.`,
    },
    {
      id: "host-27",
      question: "Hoe zet ik e-mail op mijn telefoon?",
      answer: `Gebruik IMAP/SMTP-gegevens uit je panel. Voor Android (en vergelijkbaar op iOS) staan de stappen in de kennisbank. Meer lezen: ${link("E-mail op Android", L.emailAndroid)} · ${link("E-mail bij WordPress/domein", L.emailWp)}.`,
    },
    {
      id: "host-28",
      question: "Wat is het verschil tussen shared, VPS en dedicated?",
      answer: `Shared deelt resources; VPS isoleert meer CPU/RAM; dedicated is een hele server. Kies op traffic, controlebehoefte en budget. Meer lezen: ${link("Dedicated vs VPS vs shared", L.dedicatedVs)} · ${link("Shared/WP/VPS", L.sharedVps)}.`,
    },
    {
      id: "host-29",
      question: "Hoe werk ik met DirectAdmin?",
      answer: `DirectAdmin is het control panel voor e-mail, DNS, databases, backups en installs. Log in met je panelgegevens; 2FA raden we sterk aan. Meer lezen: ${link("2FA in DirectAdmin", L.tfa)} · ${link("Backups", L.daBackup)}.`,
    },
    {
      id: "host-30",
      question: "Bieden jullie object cache voor WordPress?",
      answer: `Op geschikte plannen ondersteunen we persistent object cache om database-queries te verminderen en sneller te laden. Meer lezen: ${link("Object cache", L.objectCache)}.`,
    },
    {
      id: "host-31",
      question: "Hoe verleng of betaal ik hosting en domeinen?",
      answer: `Via het klantenpanel en facturen; automatische verlenging is vaak beschikbaar. Houd factuurgegevens actueel om onderbreking te voorkomen. Meer lezen: ${link("Factuurgegevens", L.invoiceEdit)} · ${link("Facturen bekijken", L.invoiceView)}.`,
    },
    {
      id: "host-32",
      question: "Kan ik meerdere domeinen op één hosting zetten?",
      answer: `Vaak ja, via addon- of park-domeinen — afhankelijk van je pakketlimieten. Wij helpen bij koppeling en DNS. Meer lezen: ${link("Hosting kiezen", L.chooseHosting)} · ${link("DNS", L.dns)}.`,
    },
    {
      id: "host-33",
      question: "Wat als mijn nieuwe domeinnaam nog niet werkt?",
      answer: `Meestal is het DNS-propagatie, ontbrekende records of nameservers die nog niet zijn bijgewerkt. Check A/MX-records en wacht tot TTL’s verlopen. Meer lezen: ${link("Nieuw domein werkt niet", L.domainBroken)} · ${link("DNS beheren", L.dns)}.`,
    },
    {
      id: "host-34",
      question: "Hoe veilig is inloggen op mijn hostingpanel?",
      answer: `Gebruik een sterk wachtwoord en schakel 2FA in. Deel geen panel-logins via onveilige kanalen. Meer lezen: ${link("2FA DirectAdmin", L.tfa)} · ${link("Login kwijt", L.loginLost)}.`,
    },
    {
      id: "host-35",
      question: "Waar bestel ik hosting of een domein direct?",
      answer: `In de shop of via de hosting- en domeinpagina’s. Na bestelling ontvang je toegang tot panel en facturen in je account. Meer lezen: ${link("Shop", "/shop")} · ${link("Domeinen", "/domeinen")} · ${link("Hosting", "/diensten/categorie/hosting")}.`,
    },
  ],
};

const newCategories = [
  {
    id: "account-portaal",
    title: "Account en portaal",
    items: [
      {
        id: "acc-1",
        question: "Hoe log ik in op het klantenportaal?",
        answer: `Ga naar account/login en gebruik het e-mailadres van je klantaccount. Ben je gegevens kwijt, gebruik wachtwoord reset of neem contact op. Meer lezen: ${link("Account", "/account")} · ${link("Login kwijt", L.loginLost)}.`,
      },
      {
        id: "acc-2",
        question: "Wat zie ik in mijn dashboard?",
        answer: `Afhankelijk van je diensten: tickets, projecten, facturen, AI-scan/agents en snelle links naar support. Meer lezen: ${link("AI-agents in account", L.agentsOpen)} · ${link("Ticket aanmaken", L.ticket)}.`,
      },
      {
        id: "acc-3",
        question: "Ik ben mijn logingegevens kwijt — wat nu?",
        answer: `Gebruik “wachtwoord vergeten” of volg de kennisbankstappen voor het klantenpanel. Lukt het niet, open een ticket via een bekend contactadres. Meer lezen: ${link("Logingegevens kwijt", L.loginLost)}.`,
      },
      {
        id: "acc-4",
        question: "Hoe open ik een ticket vanuit het portaal?",
        answer: `In het klantenpanel kies je support/tickets, beschrijf je probleem en voeg bewijs toe (URL, screenshots). Meer lezen: ${link("Ticket aanmaken", L.ticket)} · ${link("Ticket via panel", L.ticketPanel)}.`,
      },
      {
        id: "acc-5",
        question: "Waar vind ik mijn facturen?",
        answer: `In het portaal onder facturatie/billing kun je facturen bekijken en downloaden. Meer lezen: ${link("Facturen raadplegen", L.invoiceView)}.`,
      },
      {
        id: "acc-6",
        question: "Hoe wijzig ik factuurgegevens of betaalmethode?",
        answer: `Pas bedrijfsnaam, BTW-nummer en betaalmethode aan in je accountinstellingen zodat nieuwe facturen kloppen. Meer lezen: ${link("Factuurgegevens wijzigen", L.invoiceEdit)}.`,
      },
      {
        id: "acc-7",
        question: "Kunnen collega’s ook toegang krijgen?",
        answer: `Ja, met accountrollen (client, manager, admin) zodat meerdere teamleden tickets of projecten kunnen volgen zonder alles te delen.`,
      },
      {
        id: "acc-8",
        question: "Zijn AI-scan en AI-agents gekoppeld aan mijn account?",
        answer: `Ja. Scans en agents horen bij je klantaccount zodat historie en rechten bewaard blijven. Meer lezen: ${link("AI-agents", L.agents)} · ${link("AI-scan", L.aiScanWhat)}.`,
      },
      {
        id: "acc-9",
        question: "Hoe veilig is mijn klantaccount?",
        answer: `Gebruik unieke wachtwoorden en 2FA waar beschikbaar (ook op hostingpanels). Deel geen sessies op gedeelde computers. Meer lezen: ${link("2FA DirectAdmin", L.tfa)}.`,
      },
      {
        id: "acc-10",
        question: "Kan ik projectstatus en deliverables volgen?",
        answer: `Waar projecten in het portaal staan, zie je status en communicatie. Anders houden we je via tickets of sprintupdates op de hoogte.`,
      },
      {
        id: "acc-11",
        question: "Hoe koppel ik diensten uit de shop aan mijn account?",
        answer: `Na checkout horen orders bij je account; provisioning (hosting, domein) volgt automatisch of via onboarding door support. Meer lezen: ${link("Shop", "/shop")}.`,
      },
      {
        id: "acc-12",
        question: "Waar stel ik notificaties of voorkeuren in?",
        answer: `In accountinstellingen beheer je profiel- en waar beschikbaar notificatievoorkeuren. Voor factuurmails hou je je e-mailadres actueel.`,
      },
    ],
  },
  {
    id: "shop-bestellen",
    title: "Shop en bestellen",
    items: [
      {
        id: "shop-1",
        question: "Wat kan ik in de shop bestellen?",
        answer: `Hostingpakketten, domeinen, care/support-producten en andere diensten die we online aanbieden. Maatwerk offertes lopen via contact. Meer lezen: ${link("Shop", "/shop")} · ${link("Hosting", "/diensten/categorie/hosting")}.`,
      },
      {
        id: "shop-2",
        question: "Hoe werkt de winkelwagen en checkout?",
        answer: `Voeg producten toe, controleer periode (maand/jaar) en rond af via checkout. Daarna ontvang je bevestiging en toegang tot je account. Meer lezen: ${link("Winkelwagen", "/shop/cart")}.`,
      },
      {
        id: "shop-3",
        question: "Zijn prijzen inclusief of exclusief btw?",
        answer: `In de shop tonen we prijzen volgens de getoonde btw-context (vaak incl. voor consumentenflows). Op de factuur staat btw netto uitgesplitst voor zakelijke klanten.`,
      },
      {
        id: "shop-4",
        question: "Kan ik maandelijks of jaarlijks betalen?",
        answer: `Veel hosting- en care-producten hebben maand- en jaaropties. Jaarlijks is vaak voordeliger; details staan per productkaart.`,
      },
      {
        id: "shop-5",
        question: "Welke betaalmethoden accepteren jullie?",
        answer: `Gangbare online methoden via de checkout (afhankelijk van regio). Voor enterprise-facturen kunnen we facturatie op rekening afspreken via contact.`,
      },
      {
        id: "shop-6",
        question: "Krijg ik meteen toegang na betaling?",
        answer: `Voor standaard hosting/domeinproducten volgt provisioning snel na succesvolle betaling. Bij custom diensten plant support de kick-off.`,
      },
      {
        id: "shop-7",
        question: "Kan ik later upgraden van pakket?",
        answer: `Ja. Van shared naar cloud/VPS of van Basic naar Plus/Business kan met migratieplanning. Meer lezen: ${link("Shared naar VPS", L.sharedToVps)} · ${link("Pakket kiezen", L.chooseHosting)}.`,
      },
      {
        id: "shop-8",
        question: "Hoe combineer ik shopproducten met maatwerk?",
        answer: `Bestel hosting/care online en plan design, SEO of ads via intake. We bundelen facturatie en account waar mogelijk. Meer lezen: ${link("Contact", "/contact")}.`,
      },
      {
        id: "shop-9",
        question: "Wat als mijn bestelling niet aankomt of vastloopt?",
        answer: `Check je mail (inclusief spam) en het portaal. Blijft het stil, open een ticket of mail support met ordernummer. Meer lezen: ${link("Contact", "/contact")} · ${link("Tickets", L.ticket)}.`,
      },
      {
        id: "shop-10",
        question: "Kan ik een domein en hosting in één order bestellen?",
        answer: `Ja, dat is de gebruikelijke flow: domein + hosting in de winkelwagen, daarna DNS-koppeling. Meer lezen: ${link("Domeinen", "/domeinen")} · ${link("Shop", "/shop")}.`,
      },
      {
        id: "shop-11",
        question: "Zijn er pakketten voor WordPress Care?",
        answer: `Ja. Care-pakketten dekken updates, monitoring en onderhoud — los of naast hosting. Meer lezen: ${link("Shop", "/shop")}.`,
      },
      {
        id: "shop-12",
        question: "Hoe annuleer of wijzig ik een bestelling?",
        answer: `Direct na order via support; daarna gelden opzeg- en wijzigingsvoorwaarden per product. We helpen migratie of export als je stopt. Meer lezen: ${link("Contact", "/contact")}.`,
      },
    ],
  },
];

pack.subtitle =
  "Vragen en antwoorden — van AI, AEO, GEO en SEO tot design, domeinen, hosting, account, shop, marketing en support.";

for (const cat of pack.categories) {
  for (const item of cat.items) {
    const fn = enrich[item.id];
    if (fn) item.answer = fn(item.answer);
  }
  const extra = additions[cat.id];
  if (extra) {
    const existing = new Set(cat.items.map((i) => i.id));
    for (const item of extra) {
      if (!existing.has(item.id)) cat.items.push(item);
    }
  }
}

const existingCatIds = new Set(pack.categories.map((c) => c.id));
const catsToInsert = newCategories.filter((c) => !existingCatIds.has(c.id));
if (catsToInsert.length) {
  const supportIdx = pack.categories.findIndex((c) => c.id === "support");
  if (supportIdx >= 0) {
    pack.categories.splice(supportIdx, 0, ...catsToInsert);
  } else {
    pack.categories.push(...catsToInsert);
  }
}

const total = pack.categories.reduce((s, c) => s + c.items.length, 0);
writeFileSync(join(DIR, "nl.json"), `${JSON.stringify(pack, null, 2)}\n`);
console.log(
  "wrote nl.json",
  pack.categories.map((c) => `${c.id}:${c.items.length}`).join(", "),
  "total",
  total,
);

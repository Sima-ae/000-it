/**
 * Final pass: translate remaining EN titles with Dutch leftovers from NL.
 * Usage: npx tsx --env-file=.env prisma/kennisbank/fix-remaining-en-titles-pass2.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { translateText } = await import("../../src/lib/google-translate.ts");

const ARTICLES = join(__dirname, "articles");
const catalog = JSON.parse(readFileSync(join(__dirname, "catalog.json"), "utf8"));

/** Clear Dutch tokens (length≥4, not common EN cognates). */
const DUTCH_WORDS = `
inschakelen uitschakelen instellen toevoegen verwijderen aanpassen controleren oplossen
gebruiken herstellen activeren deactiveren beheren koppelen migreren verhuizen opzeggen
downloaden publiceren inplannen hergebruik combineer helpen inzetten beperken beveiligen
vermijden debuggen uitzetten vinden houden werken zetten pauzer pauzeer pauzeren doet
gebeurt faalt draait helpt scoren wachtwoord handtekening klantenpanel klantomgeving
quarantaine autorisatiecode gelockt licentie handmatig nieuwsbrief landingspagina gebruiker
gebruikers toewijzen intrekken pakkettraject vervolgstappen overzicht producten diensten
aantoonbare toestemming trustsignalen privacytekst meertalige dubbele hergebruiken
designsystemen hosten leadformulier audittrail kwalitatief onderzoek cijfers dichterbij
alternatieven fysieke goederen conceptueel indexatie vindbaar monetisatie concepten
belafspraak samenwerking externe specialisten opleveringen feedbackrondes veelvoorkomende
oorzaken strategie schijfruimte betaling betalingen kortingen korting geslaagde mislukte
klantcommunicatie maandelijkse jaarlijkse resellerpakket shopprijzen tijdelijk volle
vernieuwing oplossing gedrag nazorg snellere wijziging juridische leveranciers echte
storingen wissel achter productvarianten traject doorlopende betaalbewijzen klanten
contentupdates volledig prioriteiten tegelijk gereed lancering regels extensies
prijsweergave ankerprijzen ethisch toegankelijkheidseisen releaseproces alleen stappen
canonieke gecomprimeerd herstelactie missers incidentcommunicatie prijsvermelding
productpagina veelgemaakte fouten cookiebeleid zinvol teksten transparantie mailverlies
factuuradres tarieven hallucinaties kennisbank geschikt bureaus blijvend servicestatus
mailboxquota facturen factuur abonnement foutmelding paneel instellingen beheer
aanschaffen domeinnaam e-mailadres communicatie losse optimalisatie stappenplan
handleiding uitleg waarom wanneer welke naast zonder tussen tegen onder boven
spamfilter mailboxen certificaat dienstverleners winkel zelf documenteer verwerkingen
eenvoudig anoniem registreren vermindering notificaties vervallen snelheid privacy
afbeeldingen betekenen lage verbeter vindbaarheid certificering kwetsbaarheid converteren
importeren acties starten resultaat opleveren krijg citaties vermeldingen antwoorden
moet invoeren snelle leveren snelst scorewinst meet beter scoort aanpassingen schrijf
klikken redactionele publicatie feiten overzichtelijke blogpagina archief lijst
forceren uitgifte propagatie wijzigingen exporteren vergadering plannen meldingen
beschikbaarheid verdachte inlogpogingen geblokkeerde vergrendeling toestemmingen
formulieren validatie semantische toegankelijkheid valideren organiseren animaties
kapotmaken formulierlengte verminderen interpreteren prioriteren maatwerk geleidelijke
uitrol synchroniseren aanvragen foutafhandeling automatisering velden transformeren
automatische factuurherinneringen opzetten redactieproces mens blijft
eindverantwoordelijk genereren documenteren risicos leveranciersafhankelijkheid
privacyvriendelijk alternatief doelen conversies definieren mobiele duimvriendelijke
paginasnelheid conversiefactor verbeteren hero formulierlabels foutmeldingen
toegankelijke toegankelijk richtlijnen respecteren antwoorden markeren productvariaties
attributen minimaliseren personaliseren abonnementen terugkerende terugbetalingen
afhandelen titels beschrijvingen eisen valkuilen webshop productgalerijen comprimeren
onnodige inventariseren overal inclusief configureren hierarchie vooraf exporteren
voorselecteren beperkingen adminrollen minimaliseren lage merkinstellingen
hardwareconfiguratie diagnosticeren communiceren tijdens livegang netwerkdiagram
rapporten anonimiseren delen dataminimalisatie mogelijk cookiedoelen herroepingsrecht
duidelijk moet tonen levertijden realistisch algemene voorwaarden leesbaarheid
verminderen betrouwbaarheid testen toegankelijkheid keuzehulp flexibiliteit kosten
basisformulier notificaties afdwingen voorraad helder voorraadfeeds magazijn
dataverlies roteren teamaccount mag wie meet or your works the kies doe kun
certificering kwetsbaarheid converteren importeren exporteren forceren plannen
starten beheren openen vinden lezen houden werken zetten helpen doen gebeuren
registreren anoniem notificaties vervallen snelheid betekenen verbeter vindbaarheid
citaties vermeldingen antwoorden invoeren snelle leveren scorewinst aanpassingen
schrijf klikken redactionele publicatie feiten overzichtelijke archief lijst
uitgifte propagatie wijzigingen vergadering meldingen beschikbaarheid verdachte
inlogpogingen geblokkeerde vergrendeling toestemmingen formulieren validatie
semantische toegankelijkheid valideren organiseren animaties kapotmaken
formulierlengte verminderen interpreteren prioriteren maatwerk geleidelijke uitrol
synchroniseren aanvragen foutafhandeling automatisering transformeren automatische
factuurherinneringen opzetten redactieproces eindverantwoordelijk genereren
documenteren risicos leveranciersafhankelijkheid privacyvriendelijk alternatief
doelen conversies definieren mobiele duimvriendelijke paginasnelheid conversiefactor
formulierlabels foutmeldingen toegankelijke richtlijnen respecteren markeren
productvariaties attributen minimaliseren personaliseren abonnementen terugkerende
terugbetalingen afhandelen titels beschrijvingen eisen valkuilen webshop
productgalerijen comprimeren onnodige inventariseren overal inclusief configureren
hierarchie voorselecteren beperkingen adminrollen merkinstellingen
hardwareconfiguratie diagnosticeren communiceren tijdens livegang netwerkdiagram
rapporten anonimiseren dataminimalisatie cookiedoelen herroepingsrecht duidelijk
levertijden realistisch algemene voorwaarden leesbaarheid betrouwbaarheid
keuzehulp flexibiliteit basisformulier notificaties afdwingen voorraad helder
voorraadfeeds magazijn dataverlies roteren documenteer verwerkingen eenvoudig
anoniem registreren vermindering notificaties vervallen snelheid afbeeldingen
toe betekenen lage verbeter vindbaarheid certificering kwetsbaarheid converteren
importeren acties kortingen mag starten pauzeren resultaat opleveren krijg citaties
vermeldingen antwoorden moet invoeren snelle leveren snelst scorewinst meet beter
scoort aanpassingen schrijf klikken redactionele publicatie feiten overzichtelijke
blogpagina archief lijst forceren uitgifte propagatie wijzigingen exporteren
vergadering plannen starten meldingen beschikbaarheid verdachte inlogpogingen
vergrendeling toestemmingen formulieren validatie semantische toegankelijkheid
valideren organiseren animaties kapotmaken formulierlengte verminderen interpreteren
prioriteren maatwerk geleidelijke uitrol synchroniseren aanvragen foutafhandeling
automatisering velden transformeren automatische factuurherinneringen opzetten
redactieproces mens blijft eindverantwoordelijk faqs genereren valideren
documenteren risicos privacy leveranciersafhankelijkheid privacyvriendelijk
alternatief doelen conversies definieren mobiele conversie duimvriendelijke
paginasnelheid conversiefactor verbeteren hero-afbeeldingen formulierlabels
foutmeldingen toegankelijk captchas houden review-schema richtlijnen respecteren
antwoorden markeren productvariaties attributen correct checkout-velden
minimaliseren personaliseren abonnementen terugkerende betalingen terugbetalingen
afhandelen titels beschrijvingen product-seo afbeeldingen eisen valkuilen
webshop-snelheid optimaliseren productgalerijen comprimeren onnodige
inventariseren ssl-overal forceren inclusief verbeteren correct configureren
interpreteren hierarchie documenteren vooraf exporteren voorselecteren
beperkingen adminrollen minimaliseren lage content-score verbeteren
merkinstellingen documenteer hardwareconfiguratie diagnosticeren communiceren
tijdens outage livegang checkt netwerkdiagram rapporten genereren converteren
anonimiseren delen dataminimalisatie formulieren mogelijk documenteer
verwerkingen eenvoudig privacyvriendelijk cookiedoelen herroepingsrecht
duidelijk moet tonen levertijden realistisch communiceren algemene voorwaarden
leesbaarheid verminderen payout-snelheid betrouwbaarheid testen toegankelijkheid
pagebuilders keuzehulp snelheid flexibiliteit kosten basisformulier notificaties
formulieren afdwingen vooraf exporteren optimaliseren voorraad helder
communiceren voorraadfeeds synchroniseren magazijn minimaliseren dataverlies
roteren ip-adres geblokkeerd verificatie certificering betalingen kwetsbaarheid
contactpersonen misbruik vanwege laten afhandelen e-mailheaders opvragen
configuratiebestanden downgraden klachtenprocedure kwaliteitsgarantie
domeinnaamregistratie begrippenlijst terugplaatsen onderdelen uitgelegd
statistieken browsergeschiedenis wissen bestandsbeheer microsoft-onderdelen
mailaccount geblokkeerd vanwege misbruik mail extern laten afhandelen
`.trim().split(/\s+/).filter((w) => w.length >= 4);

const uniq = [...new Set(DUTCH_WORDS.map((w) => w.toLowerCase()))];
const DUTCH_RE = new RegExp(
  `\\b(?:${uniq.map((w) => w.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")).join("|")})\\b`,
  "i",
);

const BROKEN =
  /\bHow do I works\b|\bHow do I kies I\b|\bHow do I meet I\b|\bHow do I krijg I\b|\bHow do I schrijf I\b|\bworks the\b|\bdoe your\b|\bkun your\b|\bkies I\b|\bmoet I\b|\bSign in to on\b|\bKan I\b|\bHeb I\b|\bI wil\b|\bI kan\b|\bAlles about\b|\bzet I\b|\bdeel I\b|\bWelk \w+ kies I\b|\bWhen kies I\b|\bwhat kies I\b|\bWie mag\b|\bCheck your website works not\b|\bHow do I \w+ I (my|your|or)\b|\bwhat your before\b|\bRemove Geen\b|\bRemove Onnodige\b|\bInstall CSR genereren\b|\bSet up Productvariaties\b|\bFaqs genereren\b|\bDocumenteer\b/i;

function needsFix(title) {
  if (!title?.trim()) return true;
  if (BROKEN.test(title)) return true;
  const scrub = title.replace(/\.(de|nl|com|eu|be|fr|info|net|org)\b/gi, "");
  return DUTCH_RE.test(scrub);
}

function polish(s) {
  let out = s
    .replace(/\s+/g, " ")
    .replace(/\s+\?/g, "?")
    .replace(/\bspf\b/gi, "SPF")
    .replace(/\bdkim\b/gi, "DKIM")
    .replace(/\bdmarc\b/gi, "DMARC")
    .replace(/\bssl\b/gi, "SSL")
    .replace(/\bdns\b/gi, "DNS")
    .replace(/\bphp\b/gi, "PHP")
    .replace(/\bftp\b/gi, "FTP")
    .replace(/\bssh\b/gi, "SSH")
    .replace(/\bwordpress\b/gi, "WordPress")
    .replace(/\bdirectadmin\b/gi, "DirectAdmin")
    .replace(/\bcyberpanel\b/gi, "CyberPanel")
    .replace(/\bplesk\b/gi, "Plesk")
    .replace(/\bwoocommerce\b/gi, "WooCommerce")
    .replace(/\bcloudflare\b/gi, "Cloudflare")
    .replace(/\btriplezero it\b/gi, "TripleZero iT")
    .replace(/\bbtw\b/gi, "VAT")
    .trim();
  if (!out) return out;
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/** Curated titles for stubborn leftovers / broken MT. */
const curated = {
  "documenteer-je-verwerkingen-eenvoudig": "Document your processing activities simply",
  "documenteer-je-cookiedoelen": "Document your cookie purposes",
  "documenteer-je-hardwareconfiguratie-voor-support":
    "Document your hardware configuration for support",
  "netwerkdiagram-documenteren-voor-support": "Document a network diagram for support",
  "protect-id-domein-anoniem-registreren": "Register a domain anonymously (Protect ID)",
  "geen-vermindering-schijfruimte-directadmin-na-verwijderen-bestanden":
    "Disk space not decreasing in DirectAdmin after deleting files?",
  "lets-encrypt-notificaties-vervallen": "Let’s Encrypt expiry notifications",
  "nieuwe-dns-service-voor-meer-snelheid-en-privacy":
    "New DNS service for more speed and privacy",
  "hoe-voeg-ik-afbeeldingen-en-media-toe-in-wordpress":
    "How do I add images and media in WordPress?",
  "wat-betekenen-een-lage-geo-score-en-hoe-verbeter-ik-lokale-vindbaarheid":
    "What does a low GEO score mean and how do I improve local findability?",
  "iso-certificering": "ISO certification",
  betalingen: "Payments",
  "linux-kwetsbaarheid-cve-2026-31431": "Linux vulnerability CVE-2026-31431",
  "access-database-converteren-naar-microsoft-sql":
    "Convert an Access database to Microsoft SQL",
  "microsoft-365-tenant-importeren": "Import a Microsoft 365 tenant",
  "acties-en-kortingen": "Promotions and discounts",
  "wie-mag-ai-agents-starten-of-pauzeren-in-mijn-teamaccount":
    "Who may start or pause AI agents in my team account?",
  "hoe-meet-ik-of-mijn-ai-agents-resultaat-opleveren":
    "How do I measure whether my AI agents deliver results?",
  "hoe-krijg-ik-citaties-of-vermeldingen-in-ai-antwoorden":
    "How do I get citations or mentions in AI answers?",
  "welke-url-moet-ik-invoeren-bij-de-ai-scan-www-apex-of-staging":
    "Which URL should I enter for the AI scan (www, apex or staging)?",
  "welke-snelle-fixes-leveren-het-snelst-scorewinst-op-na-een-ai-scan":
    "Which quick fixes deliver the fastest score gains after an AI scan?",
  "hoe-meet-ik-of-mijn-website-beter-scoort-na-aanpassingen":
    "How do I measure whether my website scores better after changes?",
  "hoe-schrijf-ik-titles-en-meta-descriptions-die-meer-klikken-opleveren":
    "How do I write titles and meta descriptions that earn more clicks?",
  "redactionele-checklist-voor-publicatie-feiten-links-afbeeldingen-cta":
    "Editorial checklist before publishing (facts, links, images, CTA)",
  "afbeeldingen-optimaliseren-voor-blogs-formaat-alt-tekst-lazy-load":
    "Optimize images for blogs (size, alt text, lazy load)",
  "hoe-maak-ik-een-overzichtelijke-blogpagina-archief-grid-of-lijst":
    "How do I create a clear blog page (archive, grid or list)?",
  "https-forceren-na-ssl-uitgifte-in-cyberpanel":
    "Force HTTPS after SSL issuance in CyberPanel",
  "dns-propagatie-controleren-na-wijzigingen-in-cyberpanel":
    "Check DNS propagation after changes in CyberPanel",
  "phpmyadmin-openen-en-databases-importeren-of-exporteren-in-cyberpanel":
    "Open phpMyAdmin and import or export databases in CyberPanel",
  "vergadering-plannen-en-starten-in-teams": "Schedule and start a meeting in Teams",
  "teams-meldingen-en-beschikbaarheid-beheren":
    "Manage Teams notifications and availability",
  "verdachte-inlogpogingen-microsoft-365":
    "Suspicious sign-in attempts and blocked Microsoft 365 accounts",
  "phpmyadmin-databases-importeren-of-exporteren-in-plesk":
    "phpMyAdmin: import or export databases in Plesk",
  "smartphone-beveiligen-vergrendeling-apps-toestemmingen":
    "Secure your smartphone: lock screen, apps and permissions",
  "formulieren-en-validatie-in-react-next-js": "Forms and validation in React/Next.js",
  "rate-limiting-en-captcha-bij-php-formulieren":
    "Rate limiting and CAPTCHA on PHP forms",
  "semantische-html-voor-seo-en-toegankelijkheid":
    "Semantic HTML for SEO and accessibility",
  "formulieren-valideren-met-native-html5-en-js":
    "Validate forms with native HTML5 and JS",
  "assets-organiseren-css-js-en-afbeeldingen":
    "Organize assets: CSS, JS and images",
  "animaties-die-performance-niet-kapotmaken":
    "Animations that do not break performance",
  "formulierlengte-en-friction-verminderen": "Reduce form length and friction",
  "heatmaps-en-scroll-depth-interpreteren": "Interpret heatmaps and scroll depth",
  "security-patches-prioriteren-voor-maatwerk-code":
    "Prioritize security patches for custom code",
  "feature-flags-voor-geleidelijke-uitrol": "Feature flags for gradual rollout",
  "crm-synchroniseren-met-website-aanvragen":
    "Synchronize CRM with website form submissions",
  "foutafhandeling-en-retries-in-automatisering":
    "Error handling and retries in automation",
  "data-mapping-tussen-apps-velden-transformeren":
    "Data mapping between apps (transforming fields)",
  "automatische-factuurherinneringen-opzetten":
    "Set up automatic invoice reminders",
  "redactieproces-mens-blijft-eindverantwoordelijk":
    "Editorial process: a human stays finally responsible",
  "faqs-genereren-en-valideren-voor-aeo": "Generate and validate FAQs for AEO",
  "editorial-guidelines-documenteren-voor-je-team":
    "Document editorial guidelines for your team",
  "risicos-privacy-ip-en-leveranciersafhankelijkheid":
    "Risks: privacy, IP and vendor lock-in",
  "matomo-als-privacyvriendelijk-alternatief":
    "Matomo as a privacy-friendly alternative",
  "doelen-en-conversies-definieren-in-matomo":
    "Define goals and conversions in Matomo",
  "mobiele-conversie-duimvriendelijke-ui": "Mobile conversion: thumb-friendly UI",
  "paginasnelheid-als-conversiefactor": "Page speed as a conversion factor",
  "lcp-verbeteren-hero-afbeeldingen-en-fonts":
    "Improve LCP: hero images and fonts",
  "formulierlabels-en-foutmeldingen-toegankelijk":
    "Accessible form labels and error messages",
  "toegankelijke-pdfs-en-downloads": "Accessible PDFs and downloads",
  "captchas-toegankelijk-houden": "Keep CAPTCHAs accessible",
  "review-schema-richtlijnen-respecteren": "Review schema: follow the guidelines",
  "structured-data-en-aeo-antwoorden-markeren":
    "Structured data and AEO: mark answers",
  "productvariaties-en-attributen-correct-instellen":
    "Set up product variations and attributes correctly",
  "checkout-velden-minimaliseren": "Minimize checkout fields",
  "woocommerce-e-mails-personaliseren": "Personalize WooCommerce emails",
  "abonnementen-en-terugkerende-betalingen":
    "Subscriptions and recurring payments",
  "terugbetalingen-en-chargebacks-afhandelen":
    "Handle refunds and chargebacks",
  "titels-en-beschrijvingen-voor-product-seo":
    "Titles and descriptions for product SEO",
  "afbeeldingen-in-feeds-eisen-en-valkuilen":
    "Images in feeds: requirements and pitfalls",
  "webshop-snelheid-database-queries-optimaliseren":
    "Webshop speed: optimize database queries",
  "afbeeldingen-en-productgalerijen-comprimeren":
    "Compress images and product galleries",
  "onnodige-plugins-inventariseren-en-verwijderen":
    "Inventory and remove unnecessary plugins",
  "ssl-overal-forceren-inclusief-assets": "Force SSL everywhere, including assets",
  "cache-hit-ratio-verbeteren": "Improve cache hit ratio",
  "https-op-de-edge-correct-configureren": "Configure HTTPS correctly on the edge",
  "analytics-in-cloudflare-interpreteren": "Interpret analytics in Cloudflare",
  "cache-hierarchie-documenteren-voor-je-team":
    "Document the cache hierarchy for your team",
  "cdn-image-resizing-versus-vooraf-exporteren":
    "CDN image resizing versus exporting in advance",
  "lcp-element-voorselecteren-fetchpriority":
    "Preselect the LCP element (fetchpriority)",
  "composer-op-shared-hosting-beperkingen":
    "Composer on shared hosting: limitations",
  "adminrollen-minimaliseren-in-entra-id": "Minimize admin roles in Entra ID",
  "lage-content-score-verbeteren": "Improve a low content score",
  "plesk-reseller-white-label-merkinstellingen":
    "Plesk reseller: white-label brand settings",
  "grub-bootloader-problemen-diagnosticeren":
    "Diagnose GRUB/bootloader problems",
  "communiceren-met-support-tijdens-een-outage":
    "Communicate with support during an outage",
  "grub-bootloader-problemen-diagnosticeren-wat-je-voor-livegang-checkt":
    "Diagnose GRUB/bootloader problems: what to check before go-live",
  "http-502-bad-gateway-diagnosticeren": "Diagnose HTTP 502 Bad Gateway",
  "dmarc-rua-ruf-rapporten-interpreteren": "Interpret DMARC RUA/RUF reports",
  "csr-genereren-met-openssl": "Generate a CSR with OpenSSL",
  "myisam-naar-innodb-converteren": "Convert MyISAM to InnoDB",
  "staging-db-anonimiseren-voor-delen": "Anonymize a staging DB before sharing",
  "dataminimalisatie-in-formulieren": "Data minimization in forms",
  "analytics-zonder-cookies-waar-mogelijk":
    "Analytics without cookies where possible",
  "youtube-embeds-privacyvriendelijk": "Privacy-friendly YouTube embeds",
  "herroepingsrecht-wat-je-duidelijk-moet-tonen":
    "Right of withdrawal: what you must show clearly",
  "levertijden-realistisch-communiceren": "Communicate delivery times realistically",
  "herroepingsrecht-wat-je-duidelijk-moet-tonen-checklist-voor-mkb":
    "Right of withdrawal: what you must show clearly — SMB checklist",
  "algemene-voorwaarden-scope-en-leesbaarheid":
    "Terms and conditions: scope and readability",
  "vendor-lock-in-verminderen": "Reduce vendor lock-in",
  "payout-snelheid-en-cashflow": "Payout speed and cashflow",
  "webhook-betrouwbaarheid-testen": "Test webhook reliability",
  "toegankelijkheid-in-pagebuilders": "Accessibility in page builders",
  "keuzehulp-snelheid-flexibiliteit-kosten":
    "Decision guide: speed, flexibility, cost",
  "gravity-forms-basisformulier-en-notificaties":
    "Gravity Forms: basic form and notifications",
  "recaptcha-op-wordpress-formulieren": "reCAPTCHA on WordPress forms",
  "csr-genereren-en-certificaat-installeren":
    "Generate a CSR and install the certificate",
  "imunify-malware-scans-interpreteren": "Interpret Imunify/malware scans",
  "third-party-script-budget-afdwingen": "Enforce a third-party script budget",
  "image-cdn-resizing-versus-vooraf-exporteren":
    "Image CDN resizing versus exporting in advance",
  "woocommerce-blocks-checkout-optimaliseren":
    "Optimize WooCommerce Blocks checkout",
  "voorraad-en-backorders-helder-communiceren":
    "Communicate stock and backorders clearly",
  "voorraadfeeds-synchroniseren-met-magazijn":
    "Synchronize stock feeds with the warehouse",
  "checkout-fields-minimaliseren-zonder-dataverlies":
    "Minimize checkout fields without losing data",
  "woocommerce-rest-api-keys-roteren": "Rotate WooCommerce REST API keys",
  "ip-adres-geblokkeerd": "IP address blocked?",
  "google-verificatie": "Google verification",
  "mailaccount-geblokkeerd-vanwege-misbruik":
    "Mail account blocked due to abuse",
  "mail-extern-laten-afhandelen": "Have mail handled externally",
  "e-mailheaders-opvragen": "Request email headers",
  "web-config-configuratiebestanden": "Web.config configuration files",
  downgraden: "Downgrade",
  klachtenprocedure: "Complaints procedure",
  kwaliteitsgarantie: "Quality guarantee",
  domeinnaamregistratie: "Domain name registration",
  begrippenlijst: "Glossary",
  "backups-terugplaatsen": "Restore backups",
  "microsoft-onderdelen-uitgelegd": "Microsoft components explained",
  "website-statistieken": "Website statistics",
  "browsergeschiedenis-wissen": "Clear browser history",
  "bestandsbeheer-in-plesk": "File management in Plesk",
  contactpersonen: "Contacts in webmail",
  "contactpersonen-webmail": "Contacts in webmail",
  "gmail-melding-the-certificate-doesnt-match-the-host":
    "Gmail message: the certificate doesn’t match the host",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  let scanned = 0;
  let fixed = 0;
  let curatedN = 0;
  let mtN = 0;
  let failed = 0;
  const stillBad = [];

  for (const article of catalog.articles) {
    scanned += 1;
    const path = join(ARTICLES, `${article.slug}.json`);
    const file = JSON.parse(readFileSync(path, "utf8"));
    const current = file.en?.title || "";

    let enTitle = curated[article.slug] || null;
    if (enTitle) {
      curatedN += 1;
    } else if (needsFix(current)) {
      const nlTitle = (file.nl?.title || article.title).trim();
      try {
        enTitle = polish(await translateText(nlTitle, "en", "nl"));
        mtN += 1;
        await sleep(150);
      } catch (e) {
        failed += 1;
        console.error(`[fail] ${article.slug}`, e?.message || e);
        await sleep(400);
        continue;
      }
    } else {
      continue;
    }

    if (enTitle !== current) {
      file.en = {
        ...file.en,
        title: enTitle,
        seoTitle: `${enTitle} | TripleZero iT`,
      };
      writeFileSync(path, `${JSON.stringify(file, null, 2)}\n`);
      fixed += 1;
    }

    if (needsFix(enTitle) && !curated[article.slug]) {
      stillBad.push(`${article.slug} => ${enTitle}`);
    }

    if (fixed % 25 === 0 && fixed > 0) {
      console.log(`[pass2] fixed=${fixed} curated=${curatedN} mt=${mtN}`);
    }
  }

  console.log(
    JSON.stringify(
      {
        scanned,
        fixed,
        curated: curatedN,
        mt: mtN,
        failed,
        stillFlagged: stillBad.length,
        samples: stillBad.slice(0, 50),
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

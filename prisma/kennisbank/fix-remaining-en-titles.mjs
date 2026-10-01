/**
 * Fix remaining EN titles with clear Dutch leftovers via MyMemory/translateText,
 * then apply curated overrides for anything still wrong.
 *
 * Usage: npx tsx --env-file=.env prisma/kennisbank/fix-remaining-en-titles.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Dynamic import of TS translate helper via tsx
const { translateText } = await import("../../src/lib/google-translate.ts");

const ARTICLES = join(__dirname, "articles");
const catalog = JSON.parse(readFileSync(join(__dirname, "catalog.json"), "utf8"));

/** Dutch-only tokens / broken MT patterns that must not remain in EN titles. */
const CLEAR_NL =
  /\b(?:wachtwoord|handtekening|klantenpanel|klantomgeving|quarantaine|autorisatiecode|gelockt|licentie|handmatig|nieuwsbrief|landingspagina|gebruiker|toewijzen|intrekken|pakkettraject|vervolgstappen|pauzeer|pauzer|overzicht|producten|diensten|aantoonbare|toestemming|trustsignalen|privacytekst|meertalige|dubbele|hergebruiken|designsystemen|hosten|leadformulier|audittrail|kwalitatief|onderzoek|cijfers|dichterbij|alternatieven|fysieke|goederen|conceptueel|indexatie|vindbaar|monetisatie|concepten|inplannen|publiceren|hergebruik|combineer|helpen|doet|zelf|dienstverleners|winkel|betaling|korting|gebeurt|geslaagde|kun|mislukte|klantcommunicatie|maandelijkse|jaarlijkse|belafspraak|samenwerking|externe|specialisten|opleveringen|feedbackrondes|veelvoorkomende|oorzaken|strategie|schijfruimte|inloggen|uitschakelen|inschakelen|opzeggen|verhuizen|koppelen|doorsturen|certificaat|nameserver|spamfilter|mailboxen|stappenplan|handleiding|uitleg|waarom|wanneer|welke|naast|zonder|tussen|tegen|onder|boven|naar|factuur|facturen|abonnement|foutmelding|paneel|instellingen|beheer|beheren|aanschaffen|herstellen|aanpassen|toevoegen|verwijderen|instellen|domeinnaam|e-mailadres|communicatie|losse|optimalisatie|resellerpakket|shopprijzen|btw|tijdelijk|volle|vernieuwing|faalt|oplossing|gedrag|migreren|Nazorg|helpt|inzetten|snellere|downloaden|wijziging|lezen|Juridische|leveranciers|echte|beperken|storingen|wissel|achter|Productvarianten|traject|doorlopende|betaalbewijzen|klanten|contentupdates|volledig|prioriteiten|tegelijk|laag|scoren|samen|gereed|lancering|regels|uitzetten|vinden|draait|debuggen|extensies|beveiligen|vermijden|Prijsweergave|ankerprijzen|ethisch|toegankelijkheidseisen|releaseproces|alleen|stappen|Valuta|Canonieke|gebruikers|gecomprimeerd|herstelactie|missers|Incidentcommunicatie|Prijsvermelding|productpagina|veelgemaakte|fouten|Cookiebeleid|zinvol|teksten|houden|Transparantie|mailverlies|Factuuradres|periode|tarieven|hallucinaties|grounding|kennisbank|geschikt|bureaus|hun|blijvend|servicestatus|Multifactorauthenticatie|Twee-factorauthenticatie|mailboxquota|vernieuwing|oplossing|debuggen|beheren|Hallucinaties|kennisbank|vermijden|Prijsweergave|ankerprijzen|toegankelijkheidseisen|Doorlopende|releaseproces|alleen|echte|stappen|Canonieke|productvarianten|beperken|Wanneer|helpt|strategie|contentupdates|gebruikers|gecomprimeerd|snellere|veelvoorkomende|oorzaken|downloaden|btw-check|herstelactie|missers|Incidentcommunicatie|Jaarlijkse|Prijsvermelding|veelgemaakte|fouten|Cookiebeleid|zinvol|juridische|inschakelen|Exit-strategie|leveranciers|Transparantie|lezen|EU-klanten|Klantcommunicatie|mislukte|mailverlies|Factuuradres|BTW-periode|ethisch|inzetten|BTW-tarieven|onder|resellerpakket|shopprijzen|kies I|How do I works|How do I kies|works the|doe your|kun your|Sign in to on|Kan I|Heb I|I wil|I kan|zet I|deel I|Alles about|Welk |geschikt|bureaus|hun klanten|blijvend|prioriteiten|tegelijk|scoren|samen in|gereed|lancering|wanneer wel|tijdelijk uitschakelen|volle mailboxen|SSL-vernieuwing|faalt|\.htaccess-gedrag|lezen in|draait dubbel|debuggen|IMAP-mailboxen migreren|Plesk-extensies|klanten \(|beveiligen achter|Juridische|Nazorg and|optimalisatie|Prijsweergave|ethisch inzetten|above-the-fold strategie|wanneer wel|toegankelijkheidseisen|Doorlopende|alleen at|EU-klanten|Facturen and|betaalbewijzen|Canonieke|beperken|Wanneer a|Purge strategie|echte gebruikers|achter Cloudflare|wanneer wel inzetten|wel gecomprimeerd|Opcache inschakelen|snellere PHP|Mislukte transfer|DNSSEC inschakelen|2FA inschakelen|Facturen downloaden|migreren to|Nazorg:|achter Nginx|when wel|oorzaken and|echte missers|502 achter|Logs lezen|Bouncecodes lezen|Nameserver-wijziging|inschakelen and lezen|when the helpt|Incidentcommunicatie|Jaarlijkse cookie|Prijsvermelding|Cookiebeleid|what wel|juridische teksten|Juridische review|Exit-strategie|Transparantie to|SLA.?s lezen|EU-klanten|Klantcommunicatie|RUA\) lezen|migreren without|when wel or|uitschakelen and|uitschakelen or|storingen after|Factuuradres|inschakelen achter|ethisch inzetten|Productvarianten and|BTW-tarieven|volledig AEO|kies I|belafspraak|Maandelijkse|jaarlijkse betaling|korting|gebeurt er|geslaagde|kun your zelf|Welk agenttype|pauzer|helpt the meest|opleveringen|feedbackrondes|doorlopende optimalisatie|én SEO|TripleZero-traject|gereed for|When kies|geschikt for|Welk blogplatform|blijvend work|Twee-factorauthenticatie|tijdelijk uitschakelen|volle mailboxen|SSL-vernieuwing|regels tijdelijk|mislukte uploads|htaccess-gedrag|lezen in CyberPanel|faalt or draait|IMAP-mailboxen|Multifactorauthenticatie|storingen|tijdelijk uitschakelen|volle mailboxen|SSL-vernieuwing|extensies for your klanten|beveiligen|vermijden|Nazorg|Prijsweergave|strategie|wanneer wel|toegankelijkheidseisen|Doorlopende|alleen at echte|Valuta|Facturen|Canonieke|beperken|Wanneer a cdn|strategie after|echte gebruikers|achter Cloudflare|Workers wanneer|wel gecomprimeerd|inschakelen for snellere|Mislukte|inschakelen and DS|inschakelen on your|Facturen downloaden|migreren to TripleZero|herstelactie|achter Nginx|when wel or not|oorzaken and fixes|echte missers|502 achter|Logs lezen|Bouncecodes lezen|Nameserver-wijziging|inschakelen and lezen|when the helpt|Incidentcommunicatie|Jaarlijkse|Prijsvermelding|veelgemaakte|Cookiebeleid|zinvol is|juridische teksten|Juridische review|Exit-strategie|Transparantie|lezen without|EU-klanten|Klantcommunicatie|lezen$|migreren without|when wel or not|uitschakelen|beperken|storingen after|Factuuradres|achter CDN|ethisch inzetten|Productvarianten|BTW-tarieven|website tijdelijk|Mailservice uitschakelen|HSTS inschakelen|externe domains|Welk agenttype|wat gebeurt|helpt the|opleveringen|combine AI-scan, traject|prioriteiten|samen in a|gereed for lancering|When kies I|geschikt for bureaus|Welk blogplatform|blijvend work|Dubbele|Maandelijkse|Klantcommunicatie|Mislukte|Jaarlijkse|Rollback-strategie)\b/i;

const BROKEN =
  /\bHow do I works\b|\bHow do I kies I\b|\bworks the\b|\bdoe your\b|\bkun your\b|\bkies I\b|\bSign in to on\b|\bKan I\b|\bHeb I\b|\bI wil\b|\bI kan\b|\bAlles about\b|\bzet I\b|\bdeel I\b|\bWelk \w+ kies I\b|\bWhen kies I\b|\bwhat kies I\b|\bCheck your website works not\b/i;

function needsFix(title) {
  if (!title?.trim()) return true;
  const scrub = title.replace(/\.(de|nl|com|eu|be|fr|info|net|org)\b/gi, "");
  return CLEAR_NL.test(scrub) || BROKEN.test(title);
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
    .replace(/\bVAT-tarieven\b/gi, "VAT rates")
    .trim();
  if (!out) return out;
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/** Curated overrides for anything MT still gets wrong. */
const curated = {
  "toevoegen-account-in-plesk-onder-resellerpakket":
    "Add an account in Plesk under a reseller package",
  "hoe-werkt-de-belafspraak-bij-triplezero-it-hosting":
    "How does a call appointment work at TripleZero iT?",
  "hoe-werkt-de-samenwerking-met-teamviewer-voor-support":
    "How does TeamViewer collaboration work for support?",
  "hoe-werkt-de-samenwerking-met-externe-specialisten":
    "How does collaboration with external specialists work?",
  "ai-scan-versus-een-volledig-aeo-geo-seo-traject-wat-is-het-verschil":
    "AI scan versus a full AEO/GEO/SEO track: what is the difference?",
  "hoe-werkt-btw-21-op-shopprijzen-bij-triplezero-it-hosting":
    "How does 21% VAT work on shop prices at TripleZero iT?",
  "maandelijkse-versus-jaarlijkse-betaling-hoe-werkt-de-korting":
    "Monthly versus yearly billing: how does the discount work?",
  "wat-gebeurt-er-na-een-geslaagde-betaling-in-de-shop":
    "What happens after a successful payment in the shop?",
  "hoe-kies-ik-tussen-shared-hosting-wordpress-hosting-en-vps":
    "How do I choose between shared hosting, WordPress hosting and VPS?",
  "chat-versus-ticket-versus-belafspraak-wat-kies-ik-wanneer":
    "Chat versus ticket versus call appointment: what should I choose when?",
  "migreren-naar-microsoft-365": "Migrate to Microsoft 365",
  "hoe-werkt-microsoft-teams": "How does Microsoft Teams work?",
  "sni-inschakelen-op-een-directadmin-server": "Enable SNI on a DirectAdmin server",
  "je-website-werkt-niet-dit-kun-je-zelf-controleren":
    "Your website is down? What you can check yourself",
  "mailservice-uitschakelen": "Disable mail service",
  "website-tijdelijk-offline-zetten": "Take a website offline temporarily",
  "hsts-inschakelen": "Enable HSTS",
  "dns-service-en-externe-domeinnamen": "DNS service and external domain names",
  "welk-agenttype-kies-ik-als-eerste-in-business-1-agent":
    "Which agent type should I choose first in Business (1 agent)?",
  "wat-gebeurt-er-als-ik-een-running-agent-pauzer":
    "What happens if I pause a RUNNING agent?",
  "welke-structured-data-helpt-het-meest-bij-aeo-faq-howto-organization":
    "Which structured data helps most for AEO (FAQ, HowTo, Organization)?",
  "wat-gebeurt-er-na-kickoff-planning-opleveringen-en-feedbackrondes":
    "What happens after kickoff: planning, deliverables and feedback rounds?",
  "hoe-combineer-ik-ai-scan-traject-en-doorlopende-optimalisatie":
    "How do I combine AI scan, a track and ongoing optimization?",
  "hoe-kies-ik-prioriteiten-als-aeo-geo-en-seo-tegelijk-laag-scoren":
    "How do I set priorities when AEO, GEO and SEO all score low?",
  "hoe-gebruik-ik-search-console-en-analytics-samen-in-een-triplezero-traject":
    "How do I use Search Console and Analytics together in a TripleZero track?",
  "checklist-voor-go-live-aeo-geo-en-seo-gereed-voor-lancering":
    "Go-live checklist: AEO, GEO and SEO ready for launch",
  "wanneer-kies-ik-aeo-geo-of-seo-optimalisatie-na-mijn-scan":
    "When should I choose AEO, GEO or SEO optimization after my scan?",
  "is-de-ai-scan-geschikt-voor-bureaus-en-hun-klanten":
    "Is the AI scan suitable for agencies and their clients?",
  "welk-blogplatform-kies-ik-wordpress-org-wordpress-com-of-blogger":
    "Which blog platform should I choose: WordPress.org, WordPress.com or Blogger?",
  "hoe-kies-ik-url-slugs-en-permalinks-die-blijvend-werken":
    "How do I choose URL slugs and permalinks that keep working?",
  "twee-factorauthenticatie-2fa-inschakelen-in-cyberpanel":
    "Enable two-factor authentication (2FA) in CyberPanel",
  "een-website-tijdelijk-uitschakelen-suspend-in-cyberpanel":
    "Temporarily suspend a website in CyberPanel",
  "mailboxquota-en-volle-mailboxen-in-cyberpanel":
    "Mailbox quotas and full mailboxes in CyberPanel",
  "catch-all-mailbox-wanneer-wel-of-niet-in-cyberpanel":
    "Catch-all mailbox: when to use it in CyberPanel",
  "ssl-vernieuwing-faalt-in-cyberpanel-oorzaken-en-oplossing":
    "SSL renewal fails in CyberPanel: causes and fix",
  "modsecurity-false-positives-regels-tijdelijk-uitzetten-per-site":
    "ModSecurity false positives: temporarily disable rules per site",
  "schijfruimte-inodes-en-mislukte-uploads-in-cyberpanel":
    "Disk space, inodes and failed uploads in CyberPanel",
  "rewrite-rules-en-htaccess-gedrag-onder-openlitespeed-in-cyberpanel":
    "Rewrite rules and .htaccess behavior under OpenLiteSpeed in CyberPanel",
  "error-en-access-logs-vinden-en-lezen-in-cyberpanel":
    "Find and read error and access logs in CyberPanel",
  "cronjob-faalt-of-draait-dubbel-debuggen-in-cyberpanel":
    "Cron job fails or runs twice: debugging in CyberPanel",
  "imap-mailboxen-migreren-naar-exchange-online":
    "Migrate IMAP mailboxes to Exchange Online",
  "mfa-inschakelen-microsoft-365": "Enable multifactor authentication (MFA) for Microsoft 365",
  "microsoft-365-servicestatus-en-storingen":
    "Check Microsoft 365 service status and outages",
  "twee-factorauthenticatie-2fa-inschakelen-in-plesk":
    "Enable two-factor authentication (2FA) in Plesk",
  "een-website-tijdelijk-uitschakelen-suspend-in-plesk":
    "Temporarily suspend a website in Plesk",
  "mailboxquota-en-volle-mailboxen-in-plesk":
    "Mailbox quotas and full mailboxes in Plesk",
  "ssl-vernieuwing-faalt-in-plesk-oorzaken-en-oplossing":
    "SSL renewal fails in Plesk: causes and fix",
  "plesk-extensies-beheren-voor-je-klanten-wp-toolkit-git-lets-encrypt":
    "Manage Plesk extensions for your clients (WP Toolkit, Git, Let’s Encrypt)",
  "twee-factorauthenticatie-2fa-inschakelen-online-accounts":
    "Enable two-factor authentication (2FA) for your online accounts",
  "rollback-strategie-bij-mislukte-deployments":
    "Rollback strategy for failed deployments",
  "nazorg-en-optimalisatie-na-go-live": "Aftercare and optimization after go-live",
  "critical-css-en-above-the-fold-strategie":
    "Critical CSS and above-the-fold strategy",
  "facturen-en-betaalbewijzen-naar-klanten": "Invoices and payment proofs to customers",
  "wanneer-een-cdn-wel-en-niet-helpt": "When a CDN helps — and when it does not",
  "purge-strategie-na-contentupdates": "Purge strategy after content updates",
  "workers-wanneer-wel-inzetten": "Workers: when to use them",
  "opcache-inschakelen-voor-snellere-php": "Enable OPcache for faster PHP",
  "mislukte-transfer-veelvoorkomende-oorzaken":
    "Failed transfer: common causes",
  "dnssec-inschakelen-en-ds-records": "Enable DNSSEC and DS records",
  "2fa-inschakelen-op-je-triplezero-account": "Enable 2FA on your TripleZero account",
  "facturen-downloaden-en-btw-check": "Download invoices and check VAT",
  "http-401-unauthorized-oorzaken-en-fixes":
    "HTTP 401 Unauthorized: causes and fixes",
  "http-401-unauthorized-oorzaken-en-fixes-checklist-voor-mkb":
    "HTTP 401 Unauthorized: causes and fixes — checklist for SMBs",
  "nameserver-wijziging-checklist": "Nameserver change checklist",
  "slow-query-log-inschakelen-en-lezen": "Enable and read the slow query log",
  "jaarlijkse-cookie-audit": "Annual cookie audit",
  "juridische-review-wanneer-inschakelen": "Legal review: when to involve counsel",
  "exit-strategie-bij-saas-leveranciers": "Exit strategy with SaaS vendors",
  "klantcommunicatie-bij-mislukte-betaling":
    "Customer communication after a failed payment",
  "wp-cron-uitschakelen-en-echte-cron-gebruiken":
    "Disable WP-Cron and use a real cron job",
  "xml-rpc-uitschakelen-of-beperken": "Disable or limit XML-RPC",
  "dnssec-storingen-na-nameserver-wissel":
    "DNSSEC outages after a nameserver change",
  "http-3-inschakelen-achter-cdn": "Enable HTTP/3 behind a CDN",
  "productvarianten-en-seo-een-url-strategie":
    "Product variants and SEO: one URL strategy",
  "dubbele-betaling": "Double payment",
  "aria-wanneer-wel-en-wanneer-niet": "ARIA: when to use it and when not",
  "geo-blocking-wanneer-wel-of-niet": "Geo-blocking: when to use it and when not",
  "wordpress-multisite-wanneer-wel-of-niet":
    "WordPress Multisite: when to use it and when not",
  "catch-all-mailbox-wanneer-wel-of-niet-in-cyberpanel":
    "Catch-all mailbox: when to use it in CyberPanel",
  "bot-fight-mode-en-echte-gebruikers": "Bot Fight Mode and real users",
  "ip-allowlist-voor-rdp-ssh-achter-cloudflare":
    "IP allowlist for RDP/SSH behind Cloudflare",
  "hero-image-niet-lazy-en-wel-gecomprimeerd":
    "Hero image: not lazy-loaded, but compressed",
  "wordpress-migreren-naar-triplezero-it": "Migrate WordPress to TripleZero iT",
  "nazorg-post-mortem-na-een-herstelactie":
    "Aftercare: post-mortem after a recovery action",
  "uvicorn-gunicorn-achter-nginx": "Uvicorn/Gunicorn behind Nginx",
  "http-404-echte-missers-versus-soft-404":
    "HTTP 404: real misses versus soft-404",
  "502-achter-reverse-proxy-of-cdn": "502 behind a reverse proxy or CDN",
  "logs-lezen-access-log-versus-error-log":
    "Reading logs: access_log versus error_log",
  "bouncecodes-lezen-4xx-versus-5xx": "Reading bounce codes (4xx versus 5xx)",
  "http-3-en-quic-wanneer-het-helpt": "HTTP/3 and QUIC: when it helps",
  "incidentcommunicatie-naar-klanten": "Incident communication to customers",
  "prijsvermelding-en-btw-op-productpaginas":
    "Price display and VAT on product pages",
  "prijsvermelding-en-btw-op-productpaginas-veelgemaakte-fouten":
    "Price display and VAT on product pages: common mistakes",
  "cookiebeleid-koppelen-aan-echte-tags":
    "Link your cookie policy to the actual tags",
  "disclaimer-wat-wel-en-niet-zinvol-is":
    "Disclaimer: what is useful and what is not",
  "meertalige-juridische-teksten-consistent-houden":
    "Keep multilingual legal texts consistent",
  "transparantie-naar-klanten-over-tooling":
    "Transparency to customers about tooling",
  "uptime-slas-lezen-zonder-marketing":
    "Reading uptime SLAs without the marketing fluff",
  "multi-currency-voor-eu-klanten": "Multi-currency for EU customers",
  "dmarc-aggregate-reports-rua-lezen":
    "Reading DMARC aggregate reports (RUA)",
  "imap-mailbox-migreren-zonder-mailverlies":
    "Migrate an IMAP mailbox without losing mail",
  "factuuradres-wijzigen-voor-btw-periode":
    "Change invoice address before a VAT period",
  "abandoned-cart-e-mails-ethisch-inzetten":
    "Using abandoned-cart emails ethically",
  "btw-tarieven-per-land-in-woocommerce": "VAT rates per country in WooCommerce",
  "juridische-context-nl-toegankelijkheidseisen":
    "Legal context NL: accessibility requirements",
  "doorlopende-a11y-in-je-releaseproces":
    "Ongoing accessibility in your release process",
  "howto-schema-alleen-bij-echte-stappen":
    "HowTo schema: only for real step-by-step guides",
  "valutas-en-eu-klanten": "Currencies and EU customers",
  "canonieke-urls-voor-productvarianten":
    "Canonical URLs for product variants",
  "brute-force-op-wp-login-beperken": "Limit brute-force on wp-login",
  "prijsweergave-en-ankerprijzen-ethisch-inzetten":
    "Price display and anchor prices: use them ethically",
  "juridische-disclaimers-en-claims-vermijden":
    "Legal disclaimers and avoiding claims",
  "webhook-endpoints-beveiligen-achter-https":
    "Secure webhook endpoints behind HTTPS",
  "hallucinaties-beperken-grounding-met-kennisbank-en-faq":
    "Limit hallucinations: grounding with knowledge base and FAQ",
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
        await sleep(160);
      } catch (e) {
        failed += 1;
        console.error(`[fail] ${article.slug}`, e?.message || e);
        await sleep(400);
        continue;
      }
    } else {
      continue;
    }

    if (enTitle === current) {
      if (needsFix(enTitle)) stillBad.push(`${article.slug} => ${enTitle}`);
      continue;
    }

    file.en = {
      ...file.en,
      title: enTitle,
      seoTitle: `${enTitle} | TripleZero iT`,
    };
    writeFileSync(path, `${JSON.stringify(file, null, 2)}\n`);
    fixed += 1;
    if (needsFix(enTitle) && !curated[article.slug]) {
      stillBad.push(`${article.slug} => ${enTitle}`);
    }
    if (fixed % 20 === 0) {
      console.log(`[fix-remaining] fixed=${fixed} curated=${curatedN} mt=${mtN}`);
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
        samples: stillBad.slice(0, 40),
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

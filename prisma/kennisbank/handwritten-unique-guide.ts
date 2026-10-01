/**
 * Per-title unique kennisbank guides (NL + EN).
 * Used to rewrite shared-pack articles into title-specific how-tos.
 * Uniqueness comes from title objects embedded in steps (not only quoted title).
 */
import {
  h2,
  joinBlocks,
  ol,
  p,
  supportOutro,
  tip,
  ul,
  warn,
} from "./html-helpers";

export type UniqueArticle = {
  slug: string;
  title: string;
  topic: string;
  categories: string[];
};

export type UniqueGuide = {
  excerptNl: string;
  excerptEn: string;
  bodyNl: string;
  bodyEn: string;
};

type Surface =
  | "directadmin"
  | "cyberpanel"
  | "plesk"
  | "wordpress"
  | "webmail"
  | "mailclient"
  | "dns"
  | "ssl"
  | "vps"
  | "windows"
  | "docker"
  | "client"
  | "m365"
  | "payments"
  | "cdn"
  | "ai"
  | "design"
  | "shop"
  | "security"
  | "remote"
  | "generic";

type Action =
  | "setup"
  | "fix"
  | "explain"
  | "compare"
  | "secure"
  | "backup"
  | "migrate"
  | "optimize"
  | "order";

type Analysis = {
  titleNl: string;
  titleEn: string;
  slug: string;
  surface: Surface;
  action: Action;
  objectsNl: string[];
  objectsEn: string[];
  focusNl: string;
  focusEn: string;
  variant: number;
};

const STOP_NL = new Set([
  "de", "het", "een", "van", "voor", "met", "op", "in", "aan", "en", "of", "je", "jouw",
  "mijn", "hoe", "wat", "waarom", "welke", "waar", "kan", "ik", "zijn", "is", "te", "tot",
  "naar", "bij", "als", "dan", "ook", "niet", "nog", "al", "om", "uit", "over", "dit",
  "die", "dat", "er", "zo", "maar", "door", "via", "per", "vs", "versus",
  "gebruik", "gebruiken", "voeg", "toevoegen", "stel", "instellen", "maak", "maken",
  "los", "oplossen", "bescherm", "beschermen", "start", "starten", "open", "openen",
  "kies", "kiezen", "zet", "zetten", "pas", "aanpassen", "wijzig", "wijzigen",
  "verwijder", "verwijderen", "controleer", "controleren", "bekijk", "bekijken",
  "activeer", "activeren", "installeer", "installeren", "verbind", "verbinden",
]);

const STOP_EN = new Set([
  "the", "a", "an", "of", "for", "with", "on", "in", "to", "and", "or", "your", "my",
  "how", "what", "why", "which", "where", "can", "i", "is", "are", "be", "do", "does",
  "did", "at", "by", "as", "if", "then", "also", "not", "yet", "all", "from", "out",
  "over", "this", "that", "these", "those", "so", "but", "via", "per", "vs", "versus",
  "use", "using", "add", "adding", "set", "setting", "make", "making", "fix", "fixing",
  "protect", "protecting", "start", "starting", "open", "opening", "choose", "choosing",
  "put", "change", "changing", "remove", "removing", "check", "checking", "view",
  "activate", "activating", "install", "installing", "connect", "connecting", "enable",
  "disable", "get", "got", "have", "has", "when", "should", "will", "into", "onto",
  "sign", "signed", "signing", "follow", "following", "guide", "guides", "step", "steps",
]);

function subject(title: string): string {
  return title.replace(/\?+$/, "").trim();
}

function tokensFrom(title: string, slug: string, stop: Set<string>, fallback: string): string[] {
  const raw = `${title} ${slug.replace(/-/g, " ")}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((t) => t.length >= 3 && !stop.has(t));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of raw) {
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= 8) break;
  }
  return out.length ? out : [fallback];
}

function translateObj(t: string): string {
  const map: Record<string, string> = {
    wachtwoord: "password",
    handtekening: "signature",
    mailbox: "mailbox",
    mailboxen: "mailboxes",
    domein: "domain",
    domeinnaam: "domain name",
    domeinnamen: "domain names",
    server: "server",
    firewall: "firewall",
    backup: "backup",
    backups: "backups",
    database: "database",
    plugin: "plugin",
    thema: "theme",
    certificaat: "certificate",
    poortscanning: "port scanning",
    webmail: "webmail",
    outlook: "Outlook",
    wordpress: "WordPress",
    woocommerce: "WooCommerce",
    cloudflare: "Cloudflare",
    docker: "Docker",
    vpn: "VPN",
    cookies: "cookies",
    privacy: "privacy",
    analytics: "analytics",
    checkout: "checkout",
    factuur: "invoice",
    facturen: "invoices",
    ticket: "ticket",
    cronjob: "cron job",
    cronjobs: "cron jobs",
    subdomain: "subdomain",
    subdomein: "subdomain",
    nameserver: "nameserver",
    nameservers: "nameservers",
    dns: "DNS",
    ssl: "SSL",
    https: "HTTPS",
    ssh: "SSH",
    ftp: "FTP",
    filezilla: "FileZilla",
    roundcube: "Roundcube",
    directadmin: "DirectAdmin",
    cyberpanel: "CyberPanel",
    plesk: "Plesk",
    microsoft: "Microsoft",
    teams: "Teams",
    onedrive: "OneDrive",
    mollie: "Mollie",
    stripe: "Stripe",
    kinderen: "children",
    online: "online",
    teamviewer: "TeamViewer",
    windows: "Windows",
    mac: "Mac",
    android: "Android",
    iphone: "iPhone",
    redirect: "redirect",
    forward: "forward",
    spam: "spam",
    phishing: "phishing",
    malware: "malware",
    monitoring: "monitoring",
    snapshot: "snapshot",
    rescue: "rescue",
    raid: "RAID",
    bonding: "bonding",
    vlan: "VLAN",
    webhook: "webhook",
    hmac: "HMAC",
    agent: "agent",
    agents: "agents",
    scan: "scan",
    aeo: "AEO",
    seo: "SEO",
    geo: "GEO",
    inloggen: "sign-in",
    uitloggen: "sign-out",
    quarantaine: "quarantine",
    autorisatiecode: "authorization code",
    gelockt: "locked",
    licentie: "license",
    handmatig: "manual",
    nieuwsbrief: "newsletter",
    landingspagina: "landing page",
    landingspaginas: "landing pages",
    gebruiker: "user",
    gebruikers: "users",
    klantenpanel: "client panel",
    klantomgeving: "client area",
    toewijzen: "assign",
    intrekken: "revoke",
    pakkettraject: "package track",
    vervolgstappen: "next steps",
    overzicht: "overview",
    producten: "products",
    diensten: "services",
    aantoonbare: "demonstrable",
    toestemming: "consent",
    trustsignalen: "trust signals",
    privacytekst: "privacy text",
    meertalige: "multilingual",
    dubbele: "duplicate",
    belafspraak: "call appointment",
    samenwerking: "collaboration",
    opleveringen: "deliverables",
    feedbackrondes: "feedback rounds",
    schijfruimte: "disk space",
    betaling: "payment",
    betalingen: "payments",
    korting: "discount",
    geslaagde: "successful",
    mislukte: "failed",
    maandelijkse: "monthly",
    jaarlijkse: "yearly",
    instellingen: "settings",
    beheer: "management",
    beheren: "manage",
    abonnement: "subscription",
    opzeggen: "cancel",
    verhuizen: "migrate",
    migreren: "migrate",
    koppelen: "connect",
    doorsturen: "forward",
    spamfilter: "spam filter",
    stappenplan: "checklist",
    handleiding: "guide",
    uitleg: "explanation",
    foutmelding: "error message",
    paneel: "panel",
    hostingpakket: "hosting plan",
    hosting: "hosting",
    website: "website",
    websites: "websites",
    "e-mailadres": "email address",
    emailadres: "email address",
    "e-mail": "email",
    email: "email",
    postvak: "mailbox",
    inodes: "inodes",
    bandbreedte: "bandwidth",
    dataverkeer: "traffic",
    onbeperkte: "unlimited",
    opslag: "storage",
    onderwerp: "topic",
    bescherm: "protect",
    beschermen: "protect",
    halen: "remove",
    werken: "work",
    werkt: "works",
    zelf: "yourself",
    klanten: "customers",
    leveranciers: "vendors",
    strategie: "strategy",
    vernieuwing: "renewal",
    faalt: "fails",
    tijdelijk: "temporary",
    volledige: "full",
    volledig: "full",
    prioriteiten: "priorities",
    externe: "external",
    specialisten: "specialists",
    support: "support",
    reseller: "reseller",
    unmanaged: "unmanaged",
    shared: "shared",
    dedicated: "dedicated",
    cloud: "cloud",
    vps: "VPS",
    cdn: "CDN",
    proxy: "proxy",
    nginx: "Nginx",
    apache: "Apache",
    mysql: "MySQL",
    mariadb: "MariaDB",
    php: "PHP",
    nodejs: "Node.js",
    python: "Python",
    react: "React",
    nextjs: "Next.js",
    matomo: "Matomo",
    google: "Google",
    gmail: "Gmail",
    thunderbird: "Thunderbird",
    installatron: "Installatron",
    jetbackup: "JetBackup",
    letsencrypt: "Let's Encrypt",
    imunify: "Imunify",
    modsecurity: "ModSecurity",
    opcache: "OPcache",
    redis: "Redis",
    memcached: "Memcached",
    htaccess: ".htaccess",
    rewrite: "rewrite",
    redirecten: "redirect",
    forwarden: "forward",
    alias: "alias",
    aliases: "aliases",
    parked: "parked",
    catch: "catch-all",
    quota: "quota",
    limiet: "limit",
    limieten: "limits",
    uurlimiet: "hourly limit",
    blacklist: "blacklist",
    whitelist: "whitelist",
    allowlist: "allowlist",
    blocklist: "blocklist",
    geblokkeerd: "blocked",
    gelocked: "locked",
    locked: "locked",
    lock: "lock",
    unlock: "unlock",
    transfer: "transfer",
    authcode: "auth code",
    epp: "EPP",
    whois: "WHOIS",
    sidn: "SIDN",
    trustee: "trustee",
    privacyguard: "privacy guard",
    protect: "protect",
    children: "children",
    kids: "kids",
    parental: "parental",
    demonstrable: "demonstrable",
    consent: "consent",
    newsletter: "newsletter",
    quarantine: "quarantine",
  };
  return map[t] || t;
}

function detectSurface(hay: string): Surface {
  if (/teamviewer|anydesk|rustdesk|remote.?desktop|afstandsbediening/.test(hay)) return "remote";
  if (/domeinnaam|domein.?registr|whois|autorisatie|trustee|quarantaine|nameserver|sidn/.test(hay) && !/wordpress|dns.?record|a-record/.test(hay))
    return "client";
  if (/roundcube|webmail.?pro|handtekening|bijlage|contactpersonen|submap/.test(hay) && /webmail|roundcube|mail/.test(hay))
    return "webmail";
  if (/outlook|iphone|ipad|android|mac.?mail|thunderbird|e-mail.?instellen|samsung/.test(hay)) return "mailclient";
  if (/cyberpanel|openlitespeed/.test(hay)) return "cyberpanel";
  if (/\bplesk\b/.test(hay)) return "plesk";
  if (/wordpress|wp-admin|woocommerce|plugin|thema|cookiebanner|gdpr|avg/.test(hay)) return "wordpress";
  if (/iis|mssql|windows.?server|\brdp\b|web.?config/.test(hay) && !/wordpress/.test(hay)) return "windows";
  if (/docker|compose|container|kubernetes/.test(hay)) return "docker";
  if (/cloudflare|cdn|http\/?2|purge.?cache|litespeed.?cache/.test(hay)) return "cdn";
  if (/mollie|stripe|ideal|betaal/.test(hay)) return "payments";
  if (/microsoft|m365|office.?365|entra|teams|onedrive|exchange.?online/.test(hay)) return "m365";
  if (/ai-scan|ai-agent|chatgpt|openai|n8n|zapier|aeo|answer.?engine/.test(hay)) return "ai";
  if (/kinderen|ouderschap|digitale.?veiligheid.?kind/.test(hay)) return "security";
  if (/webdesign|figma|landingspagina|animatie|\bcss\b|\bux\b|\bui\b|page.?builder/.test(hay))
    return "design";
  if (/webshop|e-commerce|checkout|winkelwagen|productfeed/.test(hay)) return "shop";
  if (/spf|dkim|dmarc|dns|a-record|cname|nameserver|mx-record|zone/.test(hay)) return "dns";
  if (/ssl|letsencrypt|https|certificaat|tls/.test(hay)) return "ssl";
  if (/poortscan|fail2ban|firewall|ufw|iptables|malware|phishing|2fa|hack|cve|beveilig|wachtwoordmanager|passkey/.test(hay))
    return "security";
  if (/\bssh\b|vps|rescue|fsck|grub|ipmi|ilo|idrac|raid|wireguard|vpn|snapshot/.test(hay)) return "vps";
  if (/directadmin|installatron|jetbackup|file.?manager|mysql|phpmyadmin|cron/.test(hay)) return "directadmin";
  if (/klantenpanel|factuur|abonnement|opzeg|domein.?lock|ticket|crm/.test(hay))
    return "client";
  if (/e-mail|email|mailbox|spam|imap|smtp|mailing|nieuwsbrief/.test(hay)) return "webmail";
  return "generic";
}

function detectAction(hay: string): Action {
  if (/verschil|versus|vs\.|vergelijk|wanneer.?kies|keuzehulp|wat.?is|wat.?zijn/.test(hay)) return "compare";
  if (/fix|storing|fout|error|403|404|500|502|werkt.?niet|oplossen|debug|herstellen/.test(hay))
    return "fix";
  if (/backup|restore|jetbackup|3-2-1|disaster/.test(hay)) return "backup";
  if (/verhuis|migrat|overstap/.test(hay)) return "migrate";
  if (/beveilig|secure|firewall|2fa|harden|malware|phishing|wachtwoord/.test(hay)) return "secure";
  if (/snel|performance|optimaliseer|cache|lcp|core.?web/.test(hay)) return "optimize";
  if (/bestel|licentie|abonnement|pakket|upgrade|opzeg/.test(hay)) return "order";
  if (/uitleg|begrip|waarom|conceptueel/.test(hay)) return "explain";
  return "setup";
}

function hashVariant(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % 5;
}

function analyze(article: UniqueArticle, titleEn: string): Analysis {
  const titleNl = subject(article.title);
  const titleEnClean = subject(titleEn);
  const hay = `${article.slug} ${article.title} ${article.topic} ${article.categories.join(" ")}`.toLowerCase();
  const objectsNl = tokensFrom(article.title, article.slug, STOP_NL, "onderwerp");
  // Prefer tokens from the fixed EN title so focus/excerpt stay English.
  const fromEnTitle = tokensFrom(titleEnClean, "", STOP_EN, "topic").filter(
    (t) => t && t !== "topic",
  );
  const objectsEn = (
    fromEnTitle.length ? fromEnTitle : objectsNl.map(translateObj)
  ).map((t) => translateObj(t));
  return {
    titleNl,
    titleEn: titleEnClean,
    slug: article.slug,
    surface: detectSurface(hay),
    action: detectAction(hay),
    objectsNl,
    objectsEn,
    focusNl: objectsNl.slice(0, 3).join(", "),
    focusEn: objectsEn.slice(0, 3).join(", "),
    variant: hashVariant(article.slug),
  };
}

function surfaceLabel(s: Surface, locale: "nl" | "en"): string {
  const nl: Record<Surface, string> = {
    directadmin: "DirectAdmin",
    cyberpanel: "CyberPanel",
    plesk: "Plesk",
    wordpress: "WordPress (wp-admin)",
    webmail: "webmail (Roundcube / Webmail Pro)",
    mailclient: "je e-mailprogramma (Outlook / Apple Mail / telefoon)",
    dns: "DNS-beheer (klantenpanel of Zone Editor)",
    ssl: "DirectAdmin → SSL Certificates",
    vps: "VPS via SSH of de provider-console",
    windows: "Windows Server via RDP/console",
    docker: "Docker / Compose op de server",
    client: "het TripleZero iT klantenpanel",
    m365: "Microsoft 365 admin / Outlook",
    payments: "betaaldashboard (Mollie/Stripe) + shop-admin",
    cdn: "CDN/Cloudflare of servercache",
    ai: "AI-scan / agent-dashboard",
    design: "CMS/theme of frontend op staging",
    shop: "webshop-admin (producten/checkout)",
    security: "beveiligingsinstellingen (panel, firewall of CMS)",
    remote: "je pc/Mac met TeamViewer/AnyDesk (of vergelijkbare remote-tool)",
    generic: "het juiste TripleZero iT-systeem voor deze taak",
  };
  const en: Record<Surface, string> = {
    directadmin: "DirectAdmin",
    cyberpanel: "CyberPanel",
    plesk: "Plesk",
    wordpress: "WordPress (wp-admin)",
    webmail: "webmail (Roundcube / Webmail Pro)",
    mailclient: "your mail app (Outlook / Apple Mail / phone)",
    dns: "DNS management (client panel or Zone Editor)",
    ssl: "DirectAdmin → SSL Certificates",
    vps: "the VPS via SSH or the provider console",
    windows: "Windows Server via RDP/console",
    docker: "Docker / Compose on the server",
    client: "the TripleZero iT client panel",
    m365: "Microsoft 365 admin / Outlook",
    payments: "the payment dashboard (Mollie/Stripe) + shop admin",
    cdn: "CDN/Cloudflare or server cache",
    ai: "the AI-scan / agent dashboard",
    design: "CMS/theme or frontend on staging",
    shop: "shop admin (products/checkout)",
    security: "security settings (panel, firewall or CMS)",
    remote: "your PC/Mac with TeamViewer/AnyDesk (or similar remote tool)",
    generic: "the correct TripleZero iT system for this task",
  };
  return locale === "nl" ? nl[s] : en[s];
}

function entrySteps(a: Analysis, locale: "nl" | "en"): string[] {
  const surf = surfaceLabel(a.surface, locale);
  const focus = locale === "nl" ? a.focusNl : a.focusEn;
  const title = locale === "nl" ? a.titleNl : a.titleEn;

  if (locale === "nl") {
    const openVariants = [
      `Open ${surf} en zoek specifiek naar instellingen rond <strong>${focus}</strong>.`,
      `Log in op ${surf}. Filter of zoek op onderdelen die horen bij <strong>${focus}</strong>.`,
      `Ga naar ${surf}. Houd dit artikel (“${title}”) ernaast zodat je alleen de bedoelde wijziging doet.`,
      `Start in ${surf}. Noteer vóór je klikt de huidige waarde voor <strong>${focus}</strong>.`,
      `Werk in ${surf}. Beperk je tot het onderwerp <strong>${focus}</strong> — geen parallelle experimenten.`,
    ];
    return [openVariants[a.variant]];
  }
  const openVariants = [
    `Open ${surf} and look specifically for settings around <strong>${focus}</strong>.`,
    `Sign in to ${surf}. Filter or search for parts that belong to <strong>${focus}</strong>.`,
    `Go to ${surf}. Keep this article (“${title}”) beside you so you only make the intended change.`,
    `Start in ${surf}. Before clicking, note the current value for <strong>${focus}</strong>.`,
    `Work in ${surf}. Stay on the topic <strong>${focus}</strong> — no parallel experiments.`,
  ];
  return [openVariants[a.variant]];
}

function coreSteps(a: Analysis, locale: "nl" | "en"): string[] {
  const o0 = locale === "nl" ? a.objectsNl[0] : a.objectsEn[0];
  const o1 = (locale === "nl" ? a.objectsNl[1] : a.objectsEn[1]) || o0;
  const o2 = (locale === "nl" ? a.objectsNl[2] : a.objectsEn[2]) || o1;
  const title = locale === "nl" ? a.titleNl : a.titleEn;

  const bySurfaceNl: Partial<Record<Surface, string[]>> = {
    webmail: [
      `Log in met het <strong>volledige e-mailadres</strong> en mailboxwachtwoord (niet het DirectAdmin-wachtwoord).`,
      `Open in Roundcube/Webmail Pro het menu dat bij <strong>${o0}</strong> / <strong>${o1}</strong> past (Instellingen, Identiteiten, Filters, Mappen of Opstellen).`,
      `Sla de aanpassing voor “${title}” op in webmail.`,
      `Stuur of ontvang een testbericht en controleer of <strong>${o2}</strong> zichtbaar/correct is.`,
    ],
    mailclient: [
      `Voeg of open het account in de client; kies IMAP (aanbevolen) tenzij je bewust POP nodig hebt.`,
      `Vul IMAP/SMTP uit de welkomstmail in; gebruikersnaam = volledig adres; poorten doorgaans 993 en 465/587 met SSL/TLS.`,
      `Richt de clientinstelling specifiek op <strong>${o0}</strong> / <strong>${o1}</strong> zoals in de titel.`,
      `Test ontvangen én verzenden; faalt SMTP: check wachtwoord, poort en of webmail wél werkt.`,
    ],
    directadmin: [
      `Selecteer het juiste domein/user-account in DirectAdmin.`,
      `Open de module die past bij <strong>${o0}</strong> (E-mail, DNS, File Manager, SSL, Cron Jobs, MySQL of Installatron).`,
      `Noteer de huidige status, pas daarna alleen toe wat “${title}” vraagt rond <strong>${o1}</strong>.`,
      `Sla op en test buiten DirectAdmin (browser, webmail, DNS-lookup of cron-log).`,
    ],
    cyberpanel: [
      `Kies in CyberPanel de juiste website.`,
      `Open SSL, DNS, Email, File Manager of Backup — gericht op <strong>${o0}</strong>.`,
      `Pas de wijziging voor <strong>${o1}</strong> toe; purge OLS-cache indien de site oude content toont.`,
      `Controleer Error Logs als iets 500/wit geeft na de wijziging.`,
    ],
    plesk: [
      `Open het juiste abonnement/domein in Plesk.`,
      `Gebruik Mail, DNS, SSL/TLS, Files, Databases of WordPress Toolkit voor <strong>${o0}</strong>.`,
      `Wijzig <strong>${o1}</strong> volgens “${title}”; bevestig.`,
      `Test extern (browser/mail/DNS).`,
    ],
    wordpress: [
      `Maak een backup (Installatron of panel) vóór je <strong>${o0}</strong> wijzigt.`,
      `Log in op <code>/wp-admin</code> en open Plugins, Thema’s, Instellingen, Media of WooCommerce — wat bij <strong>${o1}</strong> past.`,
      `Voer de wijziging door; bij een critical error: isoleer via File Manager (<code>plugins</code> hernoemen).`,
      `Leeg caches en test de pagina’s die <strong>${o2}</strong> raken.`,
    ],
    dns: [
      `Open DNS-beheer voor het juiste domein; exporteer/screenshot de zone.`,
      `Wijzig alleen records die bij <strong>${o0}</strong> / <strong>${o1}</strong> horen (A, AAAA, CNAME, MX, TXT, NS).`,
      `Sla op; wacht op TTL/propagatie.`,
      `Verifieer met externe lookup; test daarna site of mail.`,
    ],
    ssl: [
      `Controleer dat A/AAAA naar deze hosting wijst vóór je een certificaat aanvraagt.`,
      `DirectAdmin → SSL Certificates / Let’s Encrypt; neem apex én www mee indien beide gebruikt.`,
      `Forceer HTTPS pas ná succesvolle uitgifte.`,
      `Test https in een privévenster; check of <strong>${o0}</strong> zonder naamfout laadt.`,
    ],
    vps: [
      `Bevestig SSH of console-toegang; maak een snapshot bij riskante stappen rond <strong>${o0}</strong>.`,
      `Verbind en inventariseer huidige staat (services, poorten, schijf) vóór je <strong>${o1}</strong> wijzigt.`,
      `Voer alleen de geplande serverwijziging uit voor “${title}”.`,
      `Herstart enkel de betrokken dienst; test bereikbaarheid van buiten.`,
    ],
    windows: [
      `Maak een snapshot; verbind via RDP of noVNC/console.`,
      `Open Server Manager / de juiste installer voor <strong>${o0}</strong>.`,
      `Installeer of configureer <strong>${o1}</strong>; pas firewallpoorten gericht aan.`,
      `Test de dienst lokaal en extern.`,
    ],
    docker: [
      `Ga naar de compose-/projectmap; noteer image-tags en volumes.`,
      `Pas alleen de service die bij <strong>${o0}</strong> hoort aan.`,
      `Start/herstart met compose; check logs tot healthy.`,
      `Test de URL/poort die bij <strong>${o1}</strong> hoort.`,
    ],
    client: [
      `Log in op het TripleZero iT klantenpanel.`,
      `Open Domeinen, Producten, Facturen of Tickets — wat bij <strong>${o0}</strong> past.`,
      `Voer de actie voor “${title}” door (status, order, WHOIS, opzeg of ticketfeiten).`,
      `Controleer bevestigingsmail of panelstatus voor <strong>${o1}</strong>.`,
    ],
    m365: [
      `Open admin.microsoft.com of outlook.office.com (afhankelijk van de taak).`,
      `Controleer licentie, gebruiker en (bij mail) MX/DNS rond <strong>${o0}</strong>.`,
      `Pas de Microsoft-instelling voor <strong>${o1}</strong> toe; vermijd onnodige globale admin.`,
      `Test met één account de geraakte app.`,
    ],
    payments: [
      `Zet de plugin/app eerst in testmodus met testkeys voor <strong>${o0}</strong>.`,
      `Configureer webhook-URL + secret; valideer handtekeningen.`,
      `Doe een testbetaling die <strong>${o1}</strong> raakt; check orderstatus.`,
      `Schakel live pas na succes; herhaal een kleine smoke-test.`,
    ],
    cdn: [
      `Open de juiste CDN-zone of cache-panel voor het domein.`,
      `Pas caching/regels of purge toe gericht op <strong>${o0}</strong>.`,
      `Houd origin SSL/DNS kloppend; sluit checkout/wp-admin uit van full-page cache indien shop.`,
      `Test in privévenster of <strong>${o1}</strong> de nieuwe content toont.`,
    ],
    ai: [
      `Open de AI-scan of agent/workflow in het portal.`,
      `Controleer input (URL, trigger, credentials) voor <strong>${o0}</strong>.`,
      `Draai scan of dry-run; lees scores/logs rond <strong>${o1}</strong>.`,
      `Voer gerichte fixes door en hertest.`,
    ],
    design: [
      `Werk op staging met backup; open theme/builder/code voor <strong>${o0}</strong>.`,
      `Bouw of pas aan volgens “${title}” met focus op <strong>${o1}</strong>.`,
      `Check responsive, contrast en zware assets.`,
      `Deploy, purge cache, spot-check desktop + mobiel.`,
    ],
    shop: [
      `Backup of staging; open shop-admin.`,
      `Wijzig producten/feed/checkout die bij <strong>${o0}</strong> horen.`,
      `Sluit cart/checkout uit van full-page cache.`,
      `Doorloop een testorder die <strong>${o1}</strong> raakt.`,
    ],
    security: [
      `Inventariseer het risico rond <strong>${o0}</strong> (poorten, accounts, plugins, logs).`,
      `Pas de beveiligingsmaatregel toe (patch, 2FA, firewall, WAF, secret rotatie) voor <strong>${o1}</strong>.`,
      `Verwijder of disable wat niet nodig is.`,
      `Test legitieme toegang én dat het misbruikpad geblokkeerd is.`,
    ],
    remote: [
      `Installeer of open <strong>${o0}</strong> op de juiste machine (Mac/Windows) met een actuele versie.`,
      `Deel alleen een eenmalige code/ID met de supportmedewerker; controleer de TripleZero iT-identiteit.`,
      `Beperk rechten (alleen kijken vs besturing) tot wat “${title}” nodig heeft rond <strong>${o1}</strong>.`,
      `Beëindig de sessie na afloop; deel geen permanente onbeheerde toegang zonder afspraak.`,
    ],
    generic: [
      `Bepaal welk systeem “${title}” raakt en open dat gericht.`,
      `Noteer de huidige staat van <strong>${o0}</strong> / <strong>${o1}</strong>.`,
      `Voer één gerichte wijziging door; sla op of herstart alleen wat nodig is.`,
      `Verifieer met een externe test dat <strong>${o2}</strong> klopt.`,
    ],
  };

  const bySurfaceEn: Partial<Record<Surface, string[]>> = {
    webmail: [
      `Sign in with the <strong>full email address</strong> and mailbox password (not the DirectAdmin password).`,
      `In Roundcube/Webmail Pro open the menu for <strong>${o0}</strong> / <strong>${o1}</strong> (Settings, Identities, Filters, Folders or Compose).`,
      `Save the “${title}” adjustment in webmail.`,
      `Send or receive a test message and confirm <strong>${o2}</strong> looks correct.`,
    ],
    mailclient: [
      `Add or open the account in the client; choose IMAP (recommended) unless you truly need POP.`,
      `Enter IMAP/SMTP from the welcome email; username = full address; ports usually 993 and 465/587 with SSL/TLS.`,
      `Point the client setting specifically at <strong>${o0}</strong> / <strong>${o1}</strong> as in the title.`,
      `Test receive and send; if SMTP fails: check password, port and whether webmail still works.`,
    ],
    directadmin: [
      `Select the correct domain/user account in DirectAdmin.`,
      `Open the module that fits <strong>${o0}</strong> (Email, DNS, File Manager, SSL, Cron Jobs, MySQL or Installatron).`,
      `Note the current status, then apply only what “${title}” requires around <strong>${o1}</strong>.`,
      `Save and test outside DirectAdmin (browser, webmail, DNS lookup or cron log).`,
    ],
    cyberpanel: [
      `Select the correct website in CyberPanel.`,
      `Open SSL, DNS, Email, File Manager or Backup — focused on <strong>${o0}</strong>.`,
      `Apply the <strong>${o1}</strong> update; purge OLS cache if the site shows stale content.`,
      `Check Error Logs if you get 500/white screen after the change.`,
    ],
    plesk: [
      `Open the correct subscription/domain in Plesk.`,
      `Use Mail, DNS, SSL/TLS, Files, Databases or WordPress Toolkit for <strong>${o0}</strong>.`,
      `Change <strong>${o1}</strong> per “${title}”; confirm.`,
      `Test externally (browser/mail/DNS).`,
    ],
    wordpress: [
      `Take a backup (Installatron or panel) before changing <strong>${o0}</strong>.`,
      `Sign in to <code>/wp-admin</code> and open Plugins, Themes, Settings, Media or WooCommerce — whatever fits <strong>${o1}</strong>.`,
      `Apply the change; on a critical error isolate via File Manager (rename <code>plugins</code>).`,
      `Clear caches and test the pages that touch <strong>${o2}</strong>.`,
    ],
    dns: [
      `Open DNS management for the correct domain; export/screenshot the zone.`,
      `Change only records that belong to <strong>${o0}</strong> / <strong>${o1}</strong> (A, AAAA, CNAME, MX, TXT, NS).`,
      `Save; wait for TTL/propagation.`,
      `Verify with an external lookup; then test site or mail.`,
    ],
    ssl: [
      `Confirm A/AAAA points at this hosting before requesting a certificate.`,
      `DirectAdmin → SSL Certificates / Let’s Encrypt; include apex and www if both are used.`,
      `Force HTTPS only after successful issuance.`,
      `Test https in a private window; check <strong>${o0}</strong> loads without a name mismatch.`,
    ],
    vps: [
      `Confirm SSH or console access; take a snapshot for risky steps around <strong>${o0}</strong>.`,
      `Connect and inventory current state (services, ports, disk) before changing <strong>${o1}</strong>.`,
      `Apply only the planned server change for “${title}”.`,
      `Restart only the affected service; test reachability from outside.`,
    ],
    windows: [
      `Take a snapshot; connect via RDP or noVNC/console.`,
      `Open Server Manager / the correct installer for <strong>${o0}</strong>.`,
      `Install or configure <strong>${o1}</strong>; adjust firewall ports carefully.`,
      `Test the service locally and externally.`,
    ],
    docker: [
      `Go to the compose/project directory; note image tags and volumes.`,
      `Change only the service that belongs to <strong>${o0}</strong>.`,
      `Start/restart with compose; check logs until healthy.`,
      `Test the URL/port for <strong>${o1}</strong>.`,
    ],
    client: [
      `Sign in to the TripleZero iT client panel.`,
      `Open Domains, Products, Invoices or Tickets — whatever fits <strong>${o0}</strong>.`,
      `Perform the action for “${title}” (status, order, WHOIS, cancel or ticket facts).`,
      `Check confirmation email or panel status for <strong>${o1}</strong>.`,
    ],
    m365: [
      `Open admin.microsoft.com or outlook.office.com (depending on the task).`,
      `Check license, user and (for mail) MX/DNS around <strong>${o0}</strong>.`,
      `Apply the Microsoft setting for <strong>${o1}</strong>; avoid unnecessary global admin.`,
      `Test the affected app with one account.`,
    ],
    payments: [
      `Put the plugin/app in test mode with test keys for <strong>${o0}</strong> first.`,
      `Configure webhook URL + secret; validate signatures.`,
      `Run a test payment that hits <strong>${o1}</strong>; check order status.`,
      `Go live only after success; repeat a small smoke test.`,
    ],
    cdn: [
      `Open the correct CDN zone or cache panel for the domain.`,
      `Apply caching/rules or purge focused on <strong>${o0}</strong>.`,
      `Keep origin SSL/DNS correct; exclude checkout/wp-admin from full-page cache for shops.`,
      `Test in a private window that <strong>${o1}</strong> shows the new content.`,
    ],
    ai: [
      `Open the AI scan or agent/workflow in the portal.`,
      `Check input (URL, trigger, credentials) for <strong>${o0}</strong>.`,
      `Run the scan or dry-run; read scores/logs around <strong>${o1}</strong>.`,
      `Apply targeted fixes and retest.`,
    ],
    design: [
      `Work on staging with a backup; open theme/builder/code for <strong>${o0}</strong>.`,
      `Build or adjust per “${title}” with focus on <strong>${o1}</strong>.`,
      `Check responsive layout, contrast and heavy assets.`,
      `Deploy, purge cache, spot-check desktop + mobile.`,
    ],
    shop: [
      `Backup or staging; open shop admin.`,
      `Change products/feed/checkout that belong to <strong>${o0}</strong>.`,
      `Exclude cart/checkout from full-page cache.`,
      `Walk through a test order that hits <strong>${o1}</strong>.`,
    ],
    security: [
      `Map the risk around <strong>${o0}</strong> (ports, accounts, plugins, logs).`,
      `Apply the security control (patch, 2FA, firewall, WAF, secret rotation) for <strong>${o1}</strong>.`,
      `Remove or disable what is not needed.`,
      `Test legitimate access and that the abuse path is blocked.`,
    ],
    remote: [
      `Install or open <strong>${o0}</strong> on the correct machine (Mac/Windows) with a current version.`,
      `Share only a one-time code/ID with the support engineer; verify TripleZero iT identity.`,
      `Limit permissions (view-only vs control) to what “${title}” needs around <strong>${o1}</strong>.`,
      `End the session afterwards; do not leave permanent unattended access without agreement.`,
    ],
    generic: [
      `Decide which system “${title}” touches and open it deliberately.`,
      `Note the current state of <strong>${o0}</strong> / <strong>${o1}</strong>.`,
      `Apply one targeted change; save or restart only what is needed.`,
      `Verify with an external test that <strong>${o2}</strong> is correct.`,
    ],
  };

  const map = locale === "nl" ? bySurfaceNl : bySurfaceEn;
  return map[a.surface] || map.generic!;
}

function actionExtra(a: Analysis, locale: "nl" | "en"): string[] {
  const focus = locale === "nl" ? a.focusNl : a.focusEn;
  if (locale === "nl") {
    switch (a.action) {
      case "compare":
        return [
          `Zet de opties uit “${a.titleNl}” naast elkaar op vaste criteria (kosten, beheer, risico, schaal) met focus op <strong>${focus}</strong>.`,
          `Kies één pad en noteer de volgende concrete actie (order, migratie of configuratie).`,
        ];
      case "fix":
        return [
          `Isoleer: werkt het elders wél (ander netwerk, webmail vs client, staging vs live) voor <strong>${focus}</strong>?`,
          `Koppel aan de laatste wijziging; rol terug of fix één oorzaak tegelijk.`,
        ];
      case "backup":
        return [
          `Bevestig wat in de backup zit (files/DB/mail) voor <strong>${focus}</strong> en waar de offsite-kopie staat.`,
          `Doe waar mogelijk een restore-test op een veilig doel vóór je productie overschrijft.`,
        ];
      case "secure":
        return [
          `Roteer credentials die bij <strong>${focus}</strong> horen als er misbruik mogelijk was.`,
          `Zet monitoring of een herhaalcheck in de agenda.`,
        ];
      default:
        return [
          `Documenteer wat je wijzigde rond <strong>${focus}</strong> (oude → nieuwe waarde) voor support.`,
        ];
    }
  }
  switch (a.action) {
    case "compare":
      return [
        `Compare the options in “${a.titleEn}” on fixed criteria (cost, ops, risk, scale) with focus on <strong>${focus}</strong>.`,
        `Pick one path and note the next concrete action (order, migration or configuration).`,
      ];
    case "fix":
      return [
        `Isolate: does it work elsewhere (other network, webmail vs client, staging vs live) for <strong>${focus}</strong>?`,
        `Correlate with the last change; roll back or fix one cause at a time.`,
      ];
    case "backup":
      return [
        `Confirm what the backup includes (files/DB/mail) for <strong>${focus}</strong> and where the offsite copy lives.`,
        `Where possible run a restore test to a safe target before overwriting production.`,
      ];
    case "secure":
      return [
        `Rotate credentials tied to <strong>${focus}</strong> if abuse was possible.`,
        `Schedule monitoring or a follow-up check.`,
      ];
    default:
      return [
        `Document what you changed around <strong>${focus}</strong> (old → new value) for support.`,
      ];
  }
}

function prep(a: Analysis, locale: "nl" | "en"): string[] {
  const surf = surfaceLabel(a.surface, locale);
  const focus = locale === "nl" ? a.focusNl : a.focusEn;
  if (locale === "nl") {
    return [
      `Toegang tot ${surf}`,
      `Focus van dit artikel: <strong>${focus}</strong>`,
      a.action === "backup" || a.action === "secure" || a.surface === "wordpress" || a.surface === "vps"
        ? "Recente backup of snapshot"
        : "Notitie van de huidige instelling/status",
    ];
  }
  return [
    `Access to ${surf}`,
    `Focus of this article: <strong>${focus}</strong>`,
    a.action === "backup" || a.action === "secure" || a.surface === "wordpress" || a.surface === "vps"
      ? "Recent backup or snapshot"
      : "Note of the current setting/status",
  ];
}

function verify(a: Analysis, locale: "nl" | "en"): string[] {
  const focus = locale === "nl" ? a.focusNl : a.focusEn;
  const contextBit =
    locale === "nl"
      ? a.slug.split("-").slice(0, 4).join(" ")
      : a.objectsEn.slice(0, 3).join(" ") || a.focusEn;
  if (locale === "nl") {
    return [
      `Resultaat voor <strong>${focus}</strong> komt overeen met “${a.titleNl}”`,
      `Geen regressie op een kritieke flow naast ${contextBit}`,
      "Externe test of tweede browser/netwerk bevestigt het resultaat",
    ];
  }
  return [
    `Result for <strong>${focus}</strong> matches “${a.titleEn}”`,
    `No regression on a critical flow beside <strong>${contextBit}</strong>`,
    "External test or second browser/network confirms the result",
  ];
}

function tipWarn(a: Analysis, locale: "nl" | "en"): { tip: string; warn: string; related: string } {
  const focus = locale === "nl" ? a.focusNl : a.focusEn;
  if (locale === "nl") {
    return {
      tip: `Werk in kleine stappen: eerst <strong>${focus}</strong> goed krijgen, daarna pas optionele extras.`,
      warn: `Wijzig niet blind productie zonder backup als <strong>${focus}</strong> login, DNS, mail of betalingen raakt.`,
      related: `${surfaceLabel(a.surface, "nl")}, backups, tickets`,
    };
  }
  return {
    tip: `Work in small steps: get <strong>${focus}</strong> right first, then optional extras.`,
    warn: `Do not blindly change production without a backup if <strong>${focus}</strong> touches login, DNS, mail or payments.`,
    related: `${surfaceLabel(a.surface, "en")}, backups, tickets`,
  };
}

function buildBody(a: Analysis, locale: "nl" | "en"): string {
  const steps = [...entrySteps(a, locale), ...coreSteps(a, locale), ...actionExtra(a, locale)];
  const tw = tipWarn(a, locale);
  const title = locale === "nl" ? a.titleNl : a.titleEn;
  const surf = surfaceLabel(a.surface, locale);
  const focus = locale === "nl" ? a.focusNl : a.focusEn;

  if (locale === "nl") {
    const intros = [
      `Deze handleiding gaat over <strong>${title}</strong>. Je werkt in ${surf}, met focus op <strong>${focus}</strong> — niet op losse sidequests in andere menu’s.`,
      `Voor <strong>${title}</strong> volg je een gericht stappenplan in ${surf}. Kernthema’s: <strong>${focus}</strong>.`,
      `<strong>${title}</strong> los je op via ${surf}. Hieronder staan concrete stappen voor <strong>${focus}</strong>, inclusief controle achteraf.`,
    ];
    return joinBlocks(
      p(intros[a.variant % intros.length]),
      h2("Voorbereiding"),
      ul(prep(a, "nl")),
      h2("Stappen"),
      ol(steps),
      h2("Controleren"),
      ul(verify(a, "nl")),
      tip(tw.tip, "nl"),
      warn(tw.warn, "nl"),
      supportOutro("nl", tw.related),
    );
  }
  const intros = [
    `This guide covers <strong>${title}</strong>. You work in ${surf}, focusing on <strong>${focus}</strong> — not unrelated side quests in other menus.`,
    `For <strong>${title}</strong> follow a targeted checklist in ${surf}. Core themes: <strong>${focus}</strong>.`,
    `<strong>${title}</strong> is solved via ${surf}. Below are concrete steps for <strong>${focus}</strong>, including verification afterwards.`,
  ];
  return joinBlocks(
    p(intros[a.variant % intros.length]),
    h2("Preparation"),
    ul(prep(a, "en")),
    h2("Steps"),
    ol(steps),
    h2("Verify"),
    ul(verify(a, "en")),
    tip(tw.tip, "en"),
    warn(tw.warn, "en"),
    supportOutro("en", tw.related),
  );
}

export function buildHandwrittenUniqueGuide(
  article: UniqueArticle,
  titleEn: string,
): UniqueGuide {
  const a = analyze(article, titleEn);
  const excerptNl = `${a.titleNl}: stappen in ${surfaceLabel(a.surface, "nl")} voor ${a.focusNl}.`;
  const excerptEn = `${a.titleEn}: steps in ${surfaceLabel(a.surface, "en")} for ${a.focusEn}.`;
  return {
    excerptNl: excerptNl.slice(0, 220),
    excerptEn: excerptEn.slice(0, 220),
    bodyNl: buildBody(a, "nl"),
    bodyEn: buildBody(a, "en"),
  };
}

/**
 * Writes professional NL+EN knowledge-base articles from catalog metadata.
 * Curated overrides win; otherwise category/topic-aware guides are generated.
 *
 * Hard rule: third-party kennisbanken may inform facts and panel paths only.
 * Published copy must be original wording (same meaning, not the same sentences).
 */
import type { KennisbankArticleFile } from "./article-schema";
import { CURATED_ARTICLES } from "./curated-articles";
import { matchPlaybook } from "./professional-playbooks";
import { buildUniqueLongformGuide } from "./unique-longform-guide";
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

export type CatalogArticle = {
  slug: string;
  title: string;
  categories: string[];
  topic: string;
};

type Kind = "explain" | "howto" | "troubleshoot" | "compare";

type Panel =
  | "directadmin"
  | "cyberpanel"
  | "plesk"
  | "wordpress"
  | "email"
  | "dns"
  | "vps"
  | "client"
  | "general";

function detectKind(title: string, slug: string): Kind {
  const t = `${title} ${slug}`.toLowerCase();
  if (
    /vergelijk|versus|vs\.|verschil|welke-|wanneer-kies|compare|difference/.test(
      t,
    )
  ) {
    return "compare";
  }
  if (
    /werkt niet|niet bereikbaar|fout|error|troubleshooting|lukt niet|mislukt|probleem|kan niet|niet inloggen|down|500|404|403|timeout/.test(
      t,
    )
  ) {
    return "troubleshoot";
  }
  if (
    /^wat is |^wat zijn |^wat betekent |^what is |^what are |uitleg|begrip/.test(
      t,
    ) ||
    /^wat-is-|^what-is-/.test(slug)
  ) {
    return "explain";
  }
  return "howto";
}

function detectPanel(categories: string[], topic: string, title: string): Panel {
  const hay = `${categories.join(" ")} ${topic} ${title}`.toLowerCase();
  if (/cyberpanel|openlitespeed|\bcp-/.test(hay)) return "cyberpanel";
  if (/\bplesk\b/.test(hay)) return "plesk";
  if (/directadmin|installatron|jetbackup|\bda-/.test(hay)) return "directadmin";
  if (/wordpress|woocommerce|wp-admin|elementor/.test(hay)) return "wordpress";
  if (/e-mail|email|webmail|smtp|imap|spf|dkim|dmarc|roundcube/.test(hay))
    return "email";
  if (/dns|domeinnaam|nameserver|a-record|cname|mx-record|whois|sidn/.test(hay))
    return "dns";
  if (/\bvps\b|ssh|firewall|server/.test(hay)) return "vps";
  if (/crm|klantenpanel|factuur|ticket|pakket/.test(hay)) return "client";
  return "general";
}

function panelLabel(panel: Panel, locale: "nl" | "en"): string {
  const nl: Record<Panel, string> = {
    directadmin: "DirectAdmin",
    cyberpanel: "CyberPanel",
    plesk: "Plesk",
    wordpress: "WordPress (wp-admin) en je hostingpanel",
    email: "webmail of je e-mailclient, plus DNS waar nodig",
    dns: "DNS-beheer in het klantenpanel of DirectAdmin",
    vps: "je VPS (SSH en/of control panel)",
    client: "het TripleZero iT klantenpanel",
    general: "het TripleZero iT klantenpanel of DirectAdmin",
  };
  const en: Record<Panel, string> = {
    directadmin: "DirectAdmin",
    cyberpanel: "CyberPanel",
    plesk: "Plesk",
    wordpress: "WordPress (wp-admin) and your hosting panel",
    email: "webmail or your email client, plus DNS where needed",
    dns: "DNS management in the client panel or DirectAdmin",
    vps: "your VPS (SSH and/or control panel)",
    client: "the TripleZero iT client panel",
    general: "the TripleZero iT client panel or DirectAdmin",
  };
  return locale === "nl" ? nl[panel] : en[panel];
}

function panelSteps(panel: Panel, locale: "nl" | "en", _subject: string): string[] {
  if (locale === "nl") {
    switch (panel) {
      case "directadmin":
        return [
          "Log in op DirectAdmin en selecteer het juiste domein of gebruikersaccount.",
          "Open de relevante module (Account Manager, E-mail Accounts, DNS Management, File Manager, Installatron, SSL Certificates of Advanced Features).",
          "Noteer de huidige waarde of status voordat je iets wijzigt.",
          "Voer de wijziging door, sla op en blijf op dit domein werken.",
          "Test buiten het panel (browser, webmail of externe DNS-lookup) of het resultaat klopt.",
        ];
      case "cyberpanel":
        return [
          "Log in op CyberPanel en open de juiste website.",
          "Gebruik de module die bij de taak past (SSL, Email, DNS, File Manager of Backup).",
          "Sla op en purge OpenLiteSpeed-cache als de wijziging niet zichtbaar is.",
          "Controleer error-logs bij fouten of een witte pagina.",
        ];
      case "plesk":
        return [
          "Log in op Plesk en open het juiste abonnement/domein.",
          "Ga naar Mail, DNS, Databases, SSL/TLS, Files of WordPress Toolkit — afhankelijk van de taak.",
          "Voer de wijziging door en bevestig.",
          "Test website, mail of DNS vanaf een extern netwerk.",
        ];
      case "wordpress":
        return [
          "Maak eerst een backup (Installatron, JetBackup of panel-backup).",
          "Log in op /wp-admin van de juiste site.",
          "Voer de wijziging door (plugin, thema, instelling, gebruiker of media).",
          "Leeg page-cache / object-cache / CDN-cache als je oude content blijft zien.",
          "Controleer de voorkant én een kritieke flow (formulier, login of checkout).",
        ];
      case "email":
        return [
          "Bepaal of het in de mailbox, de client of DNS (SPF/DKIM/MX) speelt.",
          "Test eerst webmail: werkt die wel en de client niet, dan ligt het aan de client.",
          "Pas mailbox- of DNS-instellingen aan en sla op.",
          "Verstuur en ontvang een testmail naar een extern adres; check headers bij authenticatieproblemen.",
        ];
      case "dns":
        return [
          "Open DNS-beheer in het klantenpanel of DirectAdmin voor het juiste domein.",
          "Exporteer of screenshot de zone voordat je wijzigt.",
          "Pas alleen het benodigde recordtype aan (A, AAAA, CNAME, MX, TXT, NS).",
          "Wacht op propagatie en controleer met een externe lookup.",
          "Test daarna site en/of mail.",
        ];
      case "vps":
        return [
          "Maak of bevestig een recente snapshot/backup.",
          "Log in via SSH of het VPS-panel.",
          "Voer de wijziging door (dienst, firewall, resource of config).",
          "Herstart alleen de betrokken dienst.",
          "Controleer poorten, processen en monitoring.",
        ];
      case "client":
        return [
          "Log in op het TripleZero iT klantenpanel.",
          "Open Tickets, Facturen, Domeinen, Producten of Account — wat bij de taak past.",
          "Voer de actie uit en bevestig waar gevraagd.",
          "Controleer status of bevestigingsmail.",
        ];
      default:
        return [
          "Log in op het TripleZero iT klantenpanel of DirectAdmin en selecteer het juiste domein.",
          "Open de module die bij hosting, DNS, mail of accountbeheer past.",
          "Noteer de oude waarde, pas aan en sla op.",
          "Test het resultaat en documenteer wat je wijzigde.",
        ];
    }
  }

  switch (panel) {
    case "directadmin":
      return [
        "Sign in to DirectAdmin and select the correct domain or user account.",
        "Open the relevant module (Account Manager, Email Accounts, DNS Management, File Manager, Installatron, SSL Certificates or Advanced Features).",
        "Note the current value or status before you change anything.",
        "Apply the change, save, and stay on this domain.",
        "Test outside the panel (browser, webmail or external DNS lookup).",
      ];
    case "cyberpanel":
      return [
        "Sign in to CyberPanel and open the correct website.",
        "Use the module that matches the task (SSL, Email, DNS, File Manager or Backup).",
        "Save and purge OpenLiteSpeed cache if the change is not visible.",
        "Check error logs for failures or a blank page.",
      ];
    case "plesk":
      return [
        "Sign in to Plesk and open the correct subscription/domain.",
        "Go to Mail, DNS, Databases, SSL/TLS, Files or WordPress Toolkit — depending on the task.",
        "Apply the change and confirm.",
        "Test the website, mail or DNS from an external network.",
      ];
    case "wordpress":
      return [
        "Create a backup first (Installatron, JetBackup or panel backup).",
        "Sign in to /wp-admin of the correct site.",
        "Make the change (plugin, theme, setting, user or media).",
        "Clear page cache / object cache / CDN cache if you still see old content.",
        "Check the front end and a critical flow (form, login or checkout).",
      ];
    case "email":
      return [
        "Decide whether the issue is in the mailbox, the client, or DNS (SPF/DKIM/MX).",
        "Test webmail first: if webmail works and the client does not, fix the client.",
        "Adjust mailbox or DNS settings and save.",
        "Send and receive a test message to an external address; inspect headers for auth issues.",
      ];
    case "dns":
      return [
        "Open DNS management in the client panel or DirectAdmin for the correct domain.",
        "Export or screenshot the zone before changes.",
        "Change only the required record type (A, AAAA, CNAME, MX, TXT, NS).",
        "Wait for propagation and verify with an external lookup.",
        "Then test the site and/or email.",
      ];
    case "vps":
      return [
        "Create or confirm a recent snapshot/backup.",
        "Sign in via SSH or the VPS panel.",
        "Apply the change (service, firewall, resource or config).",
        "Restart only the affected service.",
        "Check ports, processes and monitoring.",
      ];
    case "client":
      return [
        "Sign in to the TripleZero iT client panel.",
        "Open Tickets, Invoices, Domains, Products or Account — whichever matches the task.",
        "Complete the action and confirm when prompted.",
        "Verify the status or confirmation email.",
      ];
    default:
      return [
        "Sign in to the TripleZero iT client panel or DirectAdmin and select the correct domain.",
        "Open the module that matches hosting, DNS, mail or account management.",
        "Note the old value, change it and save.",
        "Test the result and document what you changed.",
      ];
  }
}

function prepItems(panel: Panel, locale: "nl" | "en"): string[] {
  if (locale === "nl") {
    const base = [
      `Toegang tot ${panelLabel(panel, "nl")}.`,
      "Je domeinnaam en eventuele logingegevens.",
      "Een recente backup bij structurele of riskante wijzigingen.",
    ];
    if (panel === "dns") base.push("Overzicht van bestaande records (export of screenshot).");
    if (panel === "email") base.push("Mailboxadres en wachtwoord, of DNS-toegang voor SPF/DKIM/MX.");
    if (panel === "wordpress") base.push("wp-admin toegang en eventueel FTP/SFTP.");
    if (panel === "vps") base.push("SSH-sleutel of root/sudo-toegang indien van toepassing.");
    return base;
  }
  const base = [
    `Access to ${panelLabel(panel, "en")}.`,
    "Your domain name and any login credentials.",
    "A recent backup before structural or risky changes.",
  ];
  if (panel === "dns") base.push("An overview of current records (export or screenshot).");
  if (panel === "email")
    base.push("Mailbox address and password, or DNS access for SPF/DKIM/MX.");
  if (panel === "wordpress") base.push("wp-admin access and FTP/SFTP if needed.");
  if (panel === "vps") base.push("SSH key or root/sudo access where applicable.");
  return base;
}

function verifyItems(panel: Panel, locale: "nl" | "en"): string[] {
  if (locale === "nl") {
    switch (panel) {
      case "email":
        return [
          "Testmail komt aan (en liefst niet in spam).",
          "Webmail en/of client werken zoals verwacht.",
          "SPF/DKIM/MX kloppen bij authenticatie-onderwerpen.",
        ];
      case "dns":
        return [
          "Externe DNS-lookup toont het nieuwe record.",
          "Website en/of mail werken na propagatie.",
          "Geen conflicterende dubbele records.",
        ];
      case "wordpress":
        return [
          "Voorkant laadt zonder critical error.",
          "wp-admin bereikbaar.",
          "Formulier/checkout/login getest indien relevant.",
        ];
      default:
        return [
          "Het verwachte gedrag is zichtbaar buiten het panel.",
          "Geen nieuwe fouten in logs of monitoring.",
          "Backup of rollbackpad nog beschikbaar.",
        ];
    }
  }
  switch (panel) {
    case "email":
      return [
        "Test email arrives (preferably not in spam).",
        "Webmail and/or the client work as expected.",
        "SPF/DKIM/MX are correct for authentication topics.",
      ];
    case "dns":
      return [
        "External DNS lookup shows the new record.",
        "Website and/or email work after propagation.",
        "No conflicting duplicate records.",
      ];
    case "wordpress":
      return [
        "Front end loads without a critical error.",
        "wp-admin is reachable.",
        "Form/checkout/login tested where relevant.",
      ];
    default:
      return [
        "Expected behaviour is visible outside the panel.",
        "No new errors in logs or monitoring.",
        "Backup or rollback path is still available.",
      ];
  }
}

/** Lightweight Dutch → English title helper for common KB patterns. */
export function englishTitleFromDutch(nlTitle: string, slug: string): string {
  const original = nlTitle.trim();

  if (/^Wat is /i.test(original)) {
    return polishTitle(
      `What is ${translateWords(original.replace(/^Wat is /i, "").replace(/\?$/, ""))}?`,
    );
  }
  if (/^Wat zijn /i.test(original)) {
    return polishTitle(
      `What are ${translateWords(original.replace(/^Wat zijn /i, "").replace(/\?$/, ""))}?`,
    );
  }
  if (/^Wat betekent /i.test(original)) {
    return polishTitle(
      `What does ${translateWords(original.replace(/^Wat betekent /i, "").replace(/\?$/, ""))} mean?`,
    );
  }
  if (/^Hoe kan ik /i.test(original)) {
    return polishTitle(
      `How do I ${translateActionPhrase(original.replace(/^Hoe kan ik /i, "").replace(/\?$/, ""))}?`,
    );
  }
  if (/^Hoe /i.test(original)) {
    const rest = original.replace(/^Hoe /i, "").replace(/\?$/, "");
    // "Hoe installeer ik X" / "Hoe gebruik je X"
    const stripped = rest
      .replace(/^installeer ik /i, "install ")
      .replace(/^gebruik (ik|je|je) /i, "use ")
      .replace(/^gebruik je /i, "use ")
      .replace(/^stel ik /i, "set up ")
      .replace(/^voeg ik /i, "add ")
      .replace(/^wijzig ik /i, "change ")
      .replace(/^maak ik /i, "create ")
      .replace(/^verwijder ik /i, "remove ")
      .replace(/^beheer ik /i, "manage ")
      .replace(/^vind ik /i, "find ")
      .replace(/^open ik /i, "open ");
    return polishTitle(`How do I ${translateActionPhrase(stripped)}?`);
  }
  if (/^Waar kan ik /i.test(original)) {
    return polishTitle(
      `Where can I ${translateActionPhrase(original.replace(/^Waar kan ik /i, "").replace(/\?$/, ""))}?`,
    );
  }
  if (/^Waar vind ik /i.test(original)) {
    return polishTitle(
      `Where do I find ${translateWords(original.replace(/^Waar vind ik /i, "").replace(/\?$/, ""))}?`,
    );
  }

  // Leading Dutch infinitive: "Aanpassen E-mail quota"
  const leadInf = original.match(
    /^(Toevoegen|Aanmaken|Wijzigen|Verwijderen|Instellen|Beheren|Installeren|Updaten|Gebruiken|Koppelen|Herstellen|Controleren|Bekijken|Blokkeren|Activeren|Aanpassen|Inloggen)\s+(.+)$/i,
  );
  if (leadInf) {
    const verbMap: Record<string, string> = {
      toevoegen: "Add",
      aanmaken: "Create",
      wijzigen: "Change",
      verwijderen: "Remove",
      instellen: "Set up",
      beheren: "Manage",
      installeren: "Install",
      updaten: "Update",
      gebruiken: "Use",
      koppelen: "Connect",
      herstellen: "Restore",
      controleren: "Check",
      bekijken: "View",
      blokkeren: "Block",
      activeren: "Enable",
      aanpassen: "Adjust",
      inloggen: "Sign in to",
    };
    const verb = verbMap[leadInf[1].toLowerCase()] || "Configure";
    return polishTitle(`${verb} ${translateWords(leadInf[2].replace(/\?$/, ""))}`);
  }

  // Dutch infinitive at the end: "Nieuw e-mailadres aanmaken in DirectAdmin"
  const inf = original.match(
    /^(.+?)\s+(toevoegen|aanmaken|wijzigen|verwijderen|instellen|beheren|installeren|updaten|gebruiken|koppelen|herstellen|controleren|bekijken|blokkeren|activeren|inloggen)(\s+.+)?\??$/i,
  );
  if (inf) {
    const verbMap: Record<string, string> = {
      toevoegen: "Add",
      aanmaken: "Create",
      wijzigen: "Change",
      verwijderen: "Remove",
      instellen: "Set up",
      beheren: "Manage",
      installeren: "Install",
      updaten: "Update",
      gebruiken: "Use",
      koppelen: "Connect",
      herstellen: "Restore",
      controleren: "Check",
      bekijken: "View",
      blokkeren: "Block",
      activeren: "Enable",
      inloggen: "Sign in to",
    };
    const verb = verbMap[inf[2].toLowerCase()] || "Configure";
    const object = translateWords(inf[1]);
    const tail = inf[3] ? ` ${translateWords(inf[3].trim())}` : "";
    return polishTitle(`${verb} ${object}${tail}`);
  }

  const fromWords = polishTitle(translateWords(original.replace(/\?$/, "")));
  if (fromWords && !/[àáäâèéëêìíïîòóöôùúüû]/.test(fromWords.toLowerCase())) {
    return original.endsWith("?") ? `${fromWords}?` : fromWords;
  }
  return polishTitle(titleFromSlug(slug, original));
}

function translateActionPhrase(rest: string): string {
  return translateWords(
    rest
      .replace(/^een /i, "")
      .replace(/installeer(en)?/gi, "install")
      .replace(/toevoegen/gi, "add")
      .replace(/instellen/gi, "set up")
      .replace(/wijzigen/gi, "change")
      .replace(/verwijderen/gi, "remove")
      .replace(/aanmaken/gi, "create")
      .replace(/beheren/gi, "manage")
      .replace(/installeren/gi, "install")
      .replace(/updaten/gi, "update")
      .replace(/inloggen/gi, "sign in")
      .replace(/gebruiken/gi, "use")
      .replace(/koppelen/gi, "connect")
      .replace(/herstellen/gi, "restore")
      .replace(/controleren/gi, "check")
      .replace(/bekijken/gi, "view")
      .replace(/blokkeren/gi, "block")
      .replace(/activeren/gi, "enable")
      .replace(/uitschakelen/gi, "disable"),
  );
}

function translateWords(input: string): string {
  const glossary: Record<string, string> = {
    een: "a",
    het: "the",
    de: "the",
    van: "of",
    voor: "for",
    met: "with",
    naar: "to",
    aan: "to",
    in: "in",
    op: "on",
    of: "or",
    en: "and",
    je: "your",
    jouw: "your",
    mijn: "my",
    ik: "I",
    gratis: "free",
    nieuw: "new",
    nieuwe: "new",
    bestaande: "existing",
    extra: "extra",
    volledige: "full",
    via: "via",
    jullie: "your",
    deze: "this",
    dit: "this",
    die: "that",
    dat: "that",
    waar: "where",
    hoe: "how",
    wat: "what",
    wanneer: "when",
    welke: "which",
    waarom: "why",
    niet: "not",
    meer: "more",
    nog: "still",
    ook: "also",
    zonder: "without",
    tussen: "between",
    tegen: "against",
    bij: "at",
    uit: "from",
    over: "about",
    na: "after",
    vóór: "before",
    domein: "domain",
    domeinen: "domains",
    domeinnaam: "domain name",
    "e-mail": "email",
    "e-mailadres": "email address",
    emailadres: "email address",
    mailadres: "email address",
    logingegevens: "login details",
    inloggegevens: "login details",
    gegevens: "details",
    mailbox: "mailbox",
    wachtwoord: "password",
    wachtwoorden: "passwords",
    wachtwoordbeheer: "password management",
    wachtwoordherstel: "password recovery",
    wachtwoordmanager: "password manager",
    wachtwoordbeleid: "password policy",
    wachtwoordloze: "passwordless",
    "e-mailwachtwoord": "email password",
    "e-mailhandtekening": "email signature",
    gebruikersnaam: "username",
    certificaat: "certificate",
    certificaten: "certificates",
    "ssl-certificaat": "SSL certificate",
    backup: "backup",
    "back-up": "backup",
    backups: "backups",
    website: "website",
    websites: "websites",
    bestand: "file",
    bestanden: "files",
    map: "folder",
    mappen: "folders",
    database: "database",
    databases: "databases",
    server: "server",
    servers: "servers",
    hosting: "hosting",
    hostingpakket: "hosting plan",
    pakket: "plan",
    account: "account",
    accountnaam: "account name",
    reseller: "reseller",
    subdomein: "subdomain",
    forward: "forward",
    doorsturen: "forwarding",
    spamfilter: "spam filter",
    spam: "spam",
    handtekening: "signature",
    handtekeningen: "signatures",
    detecteren: "detect",
    reageren: "respond",
    poortscanning: "port scanning",
    verifieren: "verify",
    resetten: "reset",
    domeinnamen: "domains",
    netwerkisolatie: "network isolation",
    quota: "quota",
    aanpassen: "adjust",
    opslag: "storage",
    schijfruimte: "disk space",
    bandbreedte: "bandwidth",
    dataverkeer: "data traffic",
    fout: "error",
    foutmelding: "error message",
    instellingen: "settings",
    handleiding: "guide",
    uitleg: "explanation",
    verschil: "difference",
    verschillen: "differences",
    afzenders: "senders",
    trefwoorden: "keywords",
    afschermen: "protect",
    beveiligen: "secure",
    als: "as",
    automatisch: "automatic",
    antwoord: "reply",
    verwijzing: "pointer",
    wordpress: "WordPress",
    directadmin: "DirectAdmin",
    cyberpanel: "CyberPanel",
    plesk: "Plesk",
    installatron: "Installatron",
    jetbackup: "JetBackup",
    ssl: "SSL",
    dns: "DNS",
    php: "PHP",
    ftp: "FTP",
    ssh: "SSH",
    spf: "SPF",
    "spf-record": "SPF record",
    dkim: "DKIM",
    "dkim-record": "DKIM record",
    dmarc: "DMARC",
    mx: "MX",
    txt: "TXT",
    cname: "CNAME",
    record: "record",
    records: "records",
    toevoegen: "add",
    aanmaken: "create",
    wijzigen: "change",
    verwijderen: "remove",
    instellen: "set up",
    beheren: "manage",
    installeren: "install",
    updaten: "update",
    gebruiken: "use",
    koppelen: "connect",
    herstellen: "restore",
    controleren: "check",
    bekijken: "view",
    blokkeren: "block",
    activeren: "enable",
    inloggen: "sign in",
    uitloggen: "sign out",
    maken: "create",
    zetten: "set",
    vinden: "find",
    openen: "open",
    werken: "work",
    werkt: "works",
    mislukt: "failed",
    probleem: "problem",
    problemen: "problems",
    encrypt: "Encrypt",
    lets: "Let's",
  };

  return input
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) return token;
      const clean = token.replace(/[?!.,:;]+$/g, "");
      const punct = token.slice(clean.length);
      const key = clean.toLowerCase();
      if (glossary[key]) return glossary[key] + punct;
      if (/^[A-Z0-9]{2,}$/.test(clean)) return clean + punct;
      return token;
    })
    .join("")
    .replace(/\s+/g, " ")
    .replace(/\bto to\b/gi, "to")
    .replace(/\badd to\b/gi, "add to")
    .trim();
}

function polishTitle(s: string): string {
  let out = s
    .replace(/\bspf\b/gi, "SPF")
    .replace(/\bdkim\b/gi, "DKIM")
    .replace(/\bdmarc\b/gi, "DMARC")
    .replace(/\bssl\b/gi, "SSL")
    .replace(/\bdns\b/gi, "DNS")
    .replace(/\bphp\b/gi, "PHP")
    .replace(/\bftp\b/gi, "FTP")
    .replace(/\bssh\b/gi, "SSH")
    .replace(/\bmx\b/gi, "MX")
    .replace(/\btxt\b/gi, "TXT")
    .replace(/\bcname\b/gi, "CNAME")
    .replace(/\bwordpress\b/gi, "WordPress")
    .replace(/\bdirectadmin\b/gi, "DirectAdmin")
    .replace(/\bcyberpanel\b/gi, "CyberPanel")
    .replace(/\bplesk\b/gi, "Plesk")
    .replace(/\binstallatron\b/gi, "Installatron")
    .replace(/\bjetbackup\b/gi, "JetBackup")
    .replace(/\blet's encrypt\b/gi, "Let's Encrypt")
    .replace(/\s+\?/g, "?")
    .replace(/\s+/g, " ")
    .trim();
  if (!out) return out;
  out = out.charAt(0).toUpperCase() + out.slice(1);
  return out;
}

function titleFromSlug(slug: string, fallback: string): string {
  const glossary: Record<string, string> = {
    wat: "what",
    is: "is",
    hoe: "how",
    kan: "can",
    ik: "I",
    een: "a",
    het: "the",
    de: "the",
    van: "of",
    voor: "for",
    met: "with",
    naar: "to",
    in: "in",
    op: "on",
    of: "or",
    en: "and",
    je: "your",
    jouw: "your",
    mijn: "my",
    wordpress: "WordPress",
    directadmin: "DirectAdmin",
    cyberpanel: "CyberPanel",
    plesk: "Plesk",
    installatron: "Installatron",
    ssl: "SSL",
    dns: "DNS",
    php: "PHP",
    ftp: "FTP",
    ssh: "SSH",
    email: "email",
    "e-mail": "email",
    domein: "domain",
    domeinnaam: "domain name",
    mailbox: "mailbox",
    backup: "backup",
    updaten: "update",
    installeren: "install",
    verwijderen: "remove",
    toevoegen: "add",
    wijzigen: "change",
    instellen: "set up",
    beheren: "manage",
    aanmaken: "create",
    inloggen: "sign in",
    fout: "error",
    werkt: "works",
    niet: "not",
    gratis: "free",
    nieuw: "new",
    certificaat: "certificate",
  };
  const parts = slug.split("-").filter(Boolean);
  if (!parts.length) return fallback;
  const words = parts.map((w) => glossary[w.toLowerCase()] || w);
  return polishTitle(words.join(" "));
}

function subjectNoun(title: string): string {
  return title
    .replace(/\?+$/, "")
    .replace(/^Wat is (een |de |het )?/i, "")
    .replace(/^Wat zijn /i, "")
    .replace(/^Hoe kan ik /i, "")
    .replace(/^Hoe /i, "")
    .replace(/^Waar kan ik /i, "")
    .trim();
}

function buildExplain(
  title: string,
  enTitle: string,
  panel: Panel,
  topic: string,
): { nl: string; en: string; excerptNl: string; excerptEn: string } {
  const subject = subjectNoun(title);
  const panelNl = panelLabel(panel, "nl");
  const panelEn = panelLabel(panel, "en");

  const excerptNl = `${subject}: wat het is, waar je het regelt bij TripleZero iT (${panelNl}) en waar je op let.`;
  const excerptEn = `${enTitle.replace(/\?$/, "")}: what it is, where to manage it at TripleZero iT (${panelEn}), and what to watch for.`;

  const nl = joinBlocks(
    p(
      `<strong>${title.replace(/\?$/, "")}</strong> komt vaak terug bij hosting, DNS, e-mail of je control panel. Hieronder staat wat het inhoudt en hoe je het in de praktijk bij TripleZero iT gebruikt.`,
      `Je beheert dit meestal via ${panelNl}. Gebruik altijd het juiste domein of account voordat je iets wijzigt.`,
    ),
    h2("Kort uitgelegd"),
    ul([
      `${subject} is relevant wanneer je configuratie, bereikbaarheid of beveiliging van je diensten aanpast.`,
      `Verkeerde aannames leiden tot verkeerde fixes: check eerst of DNS, panel en applicatie bij hetzelfde domein horen.`,
      `Noteer je huidige setup (product, domein, panel) zodat uitleg past op jouw situatie.`,
    ]),
    h2("Waar regel je dit?"),
    ol([
      `Log in op ${panelNl}.`,
      `Selecteer het domein of abonnement waarop “${subject}” betrekking heeft.`,
      `Open de bijbehorende sectie (DNS, e-mail, bestanden, SSL, applicaties of account).`,
      `Wijzig alleen wat je begrijpt; maak eerst een backup bij riskante stappen.`,
    ]),
    h2("Praktische aandachtspunten"),
    ul([
      "Wijzig één kritieke instelling tegelijk, zodat je oorzaak en gevolg kunt zien.",
      "Test altijd buiten het panel (browser, mailclient of DNS-lookup).",
      "Bij twijfel over impact op mail, SEO of checkout: bekijk gerelateerde artikelen of open een ticket.",
    ]),
    tip(
      `Vat in één zin samen wat “${subject}” voor jouw project betekent vóór je iets wijzigt.`,
      "nl",
    ),
    warn(
      "Gebruik geen wachtwoorden opnieuw over meerdere diensten. Activeer 2FA waar beschikbaar.",
      "nl",
    ),
    supportOutro("nl"),
  );

  const en = joinBlocks(
    p(
      `<strong>${enTitle.replace(/\?$/, "")}</strong> comes up often with hosting, DNS, email or your control panel. Below is what it means and how you use it in practice at TripleZero iT.`,
      `You usually manage this via ${panelEn}. Always select the correct domain or account before changing anything.`,
    ),
    h2("In short"),
    ul([
      `${subjectNoun(enTitle)} matters when you change configuration, availability or security of your services.`,
      `Wrong assumptions lead to wrong fixes: first confirm DNS, panel and application belong to the same domain.`,
      `Note your current setup (product, domain, panel) so the guidance matches your situation.`,
    ]),
    h2("Where to manage it"),
    ol([
      `Sign in to ${panelEn}.`,
      `Select the domain or subscription that “${subjectNoun(enTitle)}” applies to.`,
      `Open the matching section (DNS, email, files, SSL, applications or account).`,
      `Only change what you understand; take a backup before risky steps.`,
    ]),
    h2("Practical points"),
    ul([
      "Change one critical setting at a time so you can see cause and effect.",
      "Always test outside the panel (browser, mail client or DNS lookup).",
      "If you are unsure about impact on mail, SEO or checkout: read related articles or open a ticket.",
    ]),
    tip(
      `Summarise in one sentence what “${subjectNoun(enTitle)}” means for your project before you change anything.`,
      "en",
    ),
    warn(
      "Do not reuse passwords across services. Enable 2FA wherever available.",
      "en",
    ),
    supportOutro("en"),
  );

  return { nl, en, excerptNl, excerptEn };
}

function buildHowto(
  title: string,
  enTitle: string,
  panel: Panel,
): { nl: string; en: string; excerptNl: string; excerptEn: string } {
  const subject = subjectNoun(title);
  const panelNl = panelLabel(panel, "nl");
  const panelEn = panelLabel(panel, "en");
  const excerptNl = `Stapsgewijze handleiding: ${subject} via ${panelNl} bij TripleZero iT.`;
  const excerptEn = `Step-by-step guide: ${subjectNoun(enTitle)} via ${panelEn} at TripleZero iT.`;

  const nl = joinBlocks(
    p(
      `Deze handleiding helpt je om <strong>${subject}</strong> veilig en controleerbaar uit te voeren bij TripleZero iT.`,
      `We werken via ${panelNl}. Gebruik altijd het juiste domein/account en maak eerst een backup bij riskante wijzigingen.`,
    ),
    h2("Wat je nodig hebt"),
    ul(prepItems(panel, "nl")),
    h2("Stappen"),
    ol(panelSteps(panel, "nl", subject)),
    h2("Controleren"),
    ul(verifyItems(panel, "nl")),
    tip(
      "Noteer oude waarden voordat je opslaat. Dat maakt terugdraaien sneller.",
      "nl",
    ),
    warn(
      "Wijzig niet meerdere kritieke opties tegelijk op productie.",
      "nl",
    ),
    supportOutro("nl"),
  );

  const en = joinBlocks(
    p(
      `This guide helps you complete <strong>${subjectNoun(enTitle)}</strong> safely and in a verifiable way at TripleZero iT.`,
      `We use ${panelEn}. Always work on the correct domain/account and take a backup first when the change is risky.`,
    ),
    h2("What you need"),
    ul(prepItems(panel, "en")),
    h2("Steps"),
    ol(panelSteps(panel, "en", subjectNoun(enTitle))),
    h2("Verify"),
    ul(verifyItems(panel, "en")),
    tip(
      "Note old values before you save. That makes rollback faster.",
      "en",
    ),
    warn(
      "Do not change multiple critical options at once on production.",
      "en",
    ),
    supportOutro("en"),
  );

  return { nl, en, excerptNl, excerptEn };
}

function buildTroubleshoot(
  title: string,
  enTitle: string,
  panel: Panel,
): { nl: string; en: string; excerptNl: string; excerptEn: string } {
  const subject = subjectNoun(title);
  const panelNl = panelLabel(panel, "nl");
  const panelEn = panelLabel(panel, "en");
  const excerptNl = `Probleemoplossing voor ${subject}: eerst isoleren, dan gericht herstellen via ${panelNl}.`;
  const excerptEn = `Troubleshooting ${subjectNoun(enTitle)}: isolate first, then fix via ${panelEn}.`;

  const nl = joinBlocks(
    p(
      `Als <strong>${subject}</strong> niet werkt, isoleer je eerst de oorzaak voordat je meerdere dingen tegelijk wijzigt.`,
      `Controleer of het probleem op één domein, één apparaat of overal speelt. Gebruik ${panelNl} als startpunt.`,
    ),
    h2("Eerst checken"),
    ol([
      "Reproduceer het probleem en noteer exacte fouttekst, tijdstip en URL/hostname.",
      "Test vanaf een ander netwerk of 4G om lokale cache/DNS uit te sluiten.",
      "Controleer of DNS naar de juiste nameservers en records wijst.",
      `Log in op ${panelNl} en bevestig dat het account/domein actief is (niet suspended).`,
    ]),
    h2("Gerichte stappen"),
    ol(panelSteps(panel, "nl", subject)),
    h2("Als het blijft misgaan"),
    ul([
      "Zet recente wijzigingen terug (DNS, SSL, plugin, PHP-versie).",
      "Bekijk error_log, mail-log of servermonitoring rond het tijdstip van de fout.",
      "Open een ticket met domein, tijdstip, foutmelding en wat je al probeerde.",
    ]),
    tip("Wijzig één verdachte setting tegelijk, anders verdwijnt de oorzaak uit beeld.", "nl"),
    warn("Geen directory-deletes of database-drops zonder restoreplan.", "nl"),
    supportOutro("nl"),
  );

  const en = joinBlocks(
    p(
      `When <strong>${subjectNoun(enTitle)}</strong> fails, isolate the cause before changing several things at once.`,
      `Check whether the issue affects one domain, one device, or everywhere. Start from ${panelEn}.`,
    ),
    h2("Check first"),
    ol([
      "Reproduce the issue and note the exact error text, time and URL/hostname.",
      "Test from another network or mobile data to rule out local cache/DNS.",
      "Confirm DNS points to the correct nameservers and records.",
      `Sign in to ${panelEn} and confirm the account/domain is active (not suspended).`,
    ]),
    h2("Targeted steps"),
    ol(panelSteps(panel, "en", subjectNoun(enTitle))),
    h2("If it still fails"),
    ul([
      "Revert recent changes (DNS, SSL, plugin, PHP version).",
      "Inspect error_log, mail log or server monitoring around the failure time.",
      "Open a ticket with domain, time, error message and what you already tried.",
    ]),
    tip(
      "Change one suspicious setting at a time, or the root cause disappears.",
      "en",
    ),
    warn("Do not delete directories or drop databases without a restore plan.", "en"),
    supportOutro("en"),
  );

  return { nl, en, excerptNl, excerptEn };
}

function buildCompare(
  title: string,
  enTitle: string,
  panel: Panel,
): { nl: string; en: string; excerptNl: string; excerptEn: string } {
  const subject = subjectNoun(title);
  const excerptNl = `Keuzehulp: ${subject} — wanneer welk alternatief past bij TripleZero iT.`;
  const excerptEn = `Decision guide: ${subjectNoun(enTitle)} — which option fits at TripleZero iT.`;

  const nl = joinBlocks(
    p(
      `Bij <strong>${subject}</strong> gaat het om een bewuste keuze tussen opties. Hieronder staan de criteria waarmee je beslist, zonder marketingtaal.`,
    ),
    h2("Vergelijk op deze punten"),
    ul([
      "Doel: website, mail, webshop, reseller of development.",
      "Beheer: wil je een control panel (DirectAdmin/CyberPanel/Plesk) of vooral SSH?",
      "Risico: downtime, mailaflevering, SEO en backups.",
      "Kosten en limieten: schijf, inodes, traffic, supportniveau.",
    ]),
    h2("Praktische werkwijze"),
    ol([
      "Schrijf in één zin wat je wilt bereiken.",
      `Check in ${panelLabel(panel, "nl")} welke opties op jouw pakket beschikbaar zijn.`,
      "Kies de eenvoudigste oplossing die je eis dekt.",
      "Test op staging of buiten piekuren voordat je productie omschakelt.",
    ]),
    tip("Documenteer de keuze: dan kan support sneller meedenken.", "nl"),
    warn("Kopieer niet blind de setup van een concurrent — DNS en panel verschillen per host.", "nl"),
    supportOutro("nl"),
  );

  const en = joinBlocks(
    p(
      `<strong>${subjectNoun(enTitle)}</strong> is about choosing between options on purpose. Below are the criteria to decide, without marketing fluff.`,
    ),
    h2("Compare on these points"),
    ul([
      "Goal: website, email, webshop, reseller or development.",
      "Management: do you want a control panel (DirectAdmin/CyberPanel/Plesk) or mainly SSH?",
      "Risk: downtime, mail delivery, SEO and backups.",
      "Cost and limits: disk, inodes, traffic, support level.",
    ]),
    h2("Practical approach"),
    ol([
      "Write one sentence describing what you need to achieve.",
      `Check in ${panelLabel(panel, "en")} which options your plan includes.`,
      "Pick the simplest solution that meets the requirement.",
      "Test on staging or outside peak hours before switching production.",
    ]),
    tip("Document the choice so support can help faster.", "en"),
    warn(
      "Do not copy a competitor setup blindly — DNS and panels differ per host.",
      "en",
    ),
    supportOutro("en"),
  );

  return { nl, en, excerptNl, excerptEn };
}

/** Topic-specific high-quality builders for common hosting subjects. */
function buildTopicSpecific(
  article: CatalogArticle,
  enTitle: string,
): { nl: string; en: string; excerptNl: string; excerptEn: string } | null {
  const topic = article.topic;
  const title = article.title;

  if (topic === "spf" || /spf/.test(article.slug)) {
    return {
      excerptNl:
        "Voeg een SPF TXT-record toe zodat ontvangende servers weten welke systemen namens jouw domein mogen mailen.",
      excerptEn:
        "Add an SPF TXT record so receiving servers know which systems may send mail for your domain.",
      nl: joinBlocks(
        p(
          `Een SPF-record (Sender Policy Framework) is een DNS TXT-record dat aangeeft welke servers e-mail mogen versturen namens jouw domein. Zonder correct SPF belanden berichten sneller in spam.`,
          `Bij TripleZero iT beheer je DNS via het klantenpanel of DirectAdmin. Gebruik bij voorkeur één SPF-record per domein.`,
        ),
        h2("SPF toevoegen"),
        ol([
          "Log in op het klantenpanel of DirectAdmin en open DNS-beheer voor je domein.",
          "Zoek bestaande TXT-records die beginnen met <code>v=spf1</code>. Verwijder of voeg samen — meerdere SPF-records zijn fout.",
          "Voeg één TXT-record toe op de root (@) met jouw geldige SPF-beleid, bijvoorbeeld inclusief de include die TripleZero iT voor jouw mailplatform communiceert.",
          "Sla op en wacht op DNS-propagatie.",
          "Verstuur een testmail en controleer in de headers op <code>spf=pass</code>.",
        ]),
        h2("Veelgemaakte fouten"),
        ul([
          "Meerdere SPF-records op hetzelfde domein.",
          "Meer dan 10 DNS-lookups in het SPF-beleid.",
          "Direct <code>-all</code> (hard fail) terwijl nieuwsbrief- of CRM-SMTP nog ontbreekt.",
        ]),
        tip("Start met <code>~all</code> (soft fail) tot alle verzendsystemen zijn opgenomen.", "nl"),
        warn("Wijzig SPF niet tegelijk met MX tenzij je een cutover-plan hebt.", "nl"),
        supportOutro("nl", "DKIM, DMARC"),
      ),
      en: joinBlocks(
        p(
          `An SPF record (Sender Policy Framework) is a DNS TXT record that lists which servers may send email for your domain. Without correct SPF, messages land in spam more often.`,
          `At TripleZero iT you manage DNS in the client panel or DirectAdmin. Prefer a single SPF record per domain.`,
        ),
        h2("Add SPF"),
        ol([
          "Sign in to the client panel or DirectAdmin and open DNS management for your domain.",
          "Find existing TXT records starting with <code>v=spf1</code>. Merge or remove extras — multiple SPF records are invalid.",
          "Add one TXT record on the root (@) with your valid SPF policy, including the include TripleZero iT documents for your mail platform.",
          "Save and wait for DNS propagation.",
          "Send a test message and check headers for <code>spf=pass</code>.",
        ]),
        h2("Common mistakes"),
        ul([
          "Multiple SPF records on the same domain.",
          "More than 10 DNS lookups in the SPF policy.",
          "Jumping to <code>-all</code> (hard fail) while newsletter or CRM SMTP is still missing.",
        ]),
        tip("Start with <code>~all</code> (soft fail) until every sending system is included.", "en"),
        warn("Do not change SPF and MX together unless you have a cutover plan.", "en"),
        supportOutro("en", "DKIM, DMARC"),
      ),
    };
  }

  if (topic === "dmarc" || /dmarc/.test(article.slug)) {
    return {
      excerptNl:
        "DMARC koppelt SPF en DKIM aan een beleid en rapportage voor je domein.",
      excerptEn:
        "DMARC ties SPF and DKIM to a policy and reporting for your domain.",
      nl: joinBlocks(
        p(
          `DMARC vertelt ontvangende servers wat ze moeten doen als SPF of DKIM faalt, en kan rapporten sturen naar een mailbox die jij kiest.`,
        ),
        h2("DMARC instellen"),
        ol([
          "Zorg dat SPF en DKIM eerst correct werken.",
          "Voeg een TXT-record toe op <code>_dmarc</code>, bijvoorbeeld <code>v=DMARC1; p=none; rua=mailto:dmarc@jouwdomein.nl</code>.",
          "Monitor rapporten enkele weken.",
          "Schaal daarna op naar <code>p=quarantine</code> of <code>p=reject</code> als de data schoon is.",
        ]),
        ul([
          "<code>p=none</code>: alleen monitoren.",
          "<code>p=quarantine</code>: verdachte mail naar spam.",
          "<code>p=reject</code>: niet-authentieke mail weigeren.",
        ]),
        warn(
          "Zet niet meteen op reject als je externe SMTP (nieuwsbrief, CRM, webshop) gebruikt zonder die in SPF/DKIM op te nemen.",
          "nl",
        ),
        supportOutro("nl", "SPF, DKIM"),
      ),
      en: joinBlocks(
        p(
          `DMARC tells receiving servers what to do when SPF or DKIM fail, and can send reports to a mailbox you choose.`,
        ),
        h2("Set up DMARC"),
        ol([
          "Make sure SPF and DKIM work correctly first.",
          "Add a TXT record on <code>_dmarc</code>, for example <code>v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com</code>.",
          "Monitor reports for a few weeks.",
          "Then move to <code>p=quarantine</code> or <code>p=reject</code> once the data looks clean.",
        ]),
        ul([
          "<code>p=none</code>: monitor only.",
          "<code>p=quarantine</code>: send suspicious mail to spam.",
          "<code>p=reject</code>: reject unauthenticated mail.",
        ]),
        warn(
          "Do not jump to reject while external SMTP (newsletter, CRM, shop) is still missing from SPF/DKIM.",
          "en",
        ),
        supportOutro("en", "SPF, DKIM"),
      ),
    };
  }

  if (topic === "dkim" || /^dkim/.test(article.slug)) {
    return {
      excerptNl:
        "Schakel DKIM in via DirectAdmin of je mailplatform en publiceer het DNS TXT-record.",
      excerptEn:
        "Enable DKIM in DirectAdmin or your mail platform and publish the DNS TXT record.",
      nl: joinBlocks(
        p(
          `DKIM ondertekent uitgaande e-mail cryptografisch. Ontvangende servers controleren of het bericht onderweg is gewijzigd en of de handtekening bij jouw domein hoort.`,
        ),
        h2("DKIM activeren"),
        ol([
          "Log in op DirectAdmin en selecteer het juiste domein.",
          "Open E-mailgegevens / E-mailauthenticatie (of DNS-beheer).",
          "Schakel DKIM in. DirectAdmin publiceert doorgaans automatisch het TXT-record.",
          "Controleer in DNS of het DKIM-record zichtbaar is.",
          "Verstuur een testmail en zoek in de headers naar <code>dkim=pass</code>.",
        ]),
        tip("Combineer DKIM altijd met SPF en daarna DMARC.", "nl"),
        supportOutro("nl", "SPF, DMARC"),
      ),
      en: joinBlocks(
        p(
          `DKIM signs outgoing email cryptographically. Receiving servers check whether the message changed in transit and whether the signature belongs to your domain.`,
        ),
        h2("Enable DKIM"),
        ol([
          "Sign in to DirectAdmin and select the correct domain.",
          "Open Email accounts / Email authentication (or DNS management).",
          "Enable DKIM. DirectAdmin usually publishes the TXT record automatically.",
          "Confirm the DKIM record is visible in DNS.",
          "Send a test message and look for <code>dkim=pass</code> in the headers.",
        ]),
        tip("Always combine DKIM with SPF, then DMARC.", "en"),
        supportOutro("en", "SPF, DMARC"),
      ),
    };
  }

  if (topic === "letsencrypt-da" || /lets-encrypt|letsencrypt/.test(article.slug)) {
    return {
      excerptNl:
        "Activeer een gratis Let’s Encrypt SSL-certificaat in DirectAdmin en forceer HTTPS pas daarna.",
      excerptEn:
        "Enable a free Let’s Encrypt SSL certificate in DirectAdmin, then force HTTPS.",
      nl: joinBlocks(
        p(
          `Met Let’s Encrypt in DirectAdmin vraag je een gratis SSL-certificaat aan voor je domein (en meestal www). DNS moet al naar de server wijzen voordat de aanvraag slaagt.`,
        ),
        h2("Stappen"),
        ol([
          "Zorg dat het A/AAAA-record van je domein naar deze hosting wijst.",
          "Log in op DirectAdmin → SSL Certificates (of Let’s Encrypt / Free & automatic certificate).",
          "Selecteer het domein en vink www aan indien nodig.",
          "Vraag het certificaat aan en wacht tot de status geldig is.",
          "Forceer HTTPS via DirectAdmin of .htaccess pas nadat het certificaat actief is.",
          "Test https://jouwdomein in een privévenster.",
        ]),
        tip("Dek apex én www in één certificaat om mixed redirects te voorkomen.", "nl"),
        warn("Forceer HTTPS niet terwijl het certificaat nog ontbreekt — dan krijg je browserfouten.", "nl"),
        supportOutro("nl", "HTTPS forceren, DNS A-record"),
      ),
      en: joinBlocks(
        p(
          `Let’s Encrypt in DirectAdmin issues a free SSL certificate for your domain (and usually www). DNS must already point to the server before issuance succeeds.`,
        ),
        h2("Steps"),
        ol([
          "Make sure the domain A/AAAA record points to this hosting.",
          "Sign in to DirectAdmin → SSL Certificates (or Let’s Encrypt / Free & automatic certificate).",
          "Select the domain and include www if needed.",
          "Request the certificate and wait until the status is valid.",
          "Force HTTPS via DirectAdmin or .htaccess only after the certificate is active.",
          "Test https://yourdomain in a private window.",
        ]),
        tip("Cover apex and www in one certificate to avoid mixed redirects.", "en"),
        warn(
          "Do not force HTTPS while the certificate is still missing — browsers will show errors.",
          "en",
        ),
        supportOutro("en", "Force HTTPS, DNS A record"),
      ),
    };
  }

  // No special topic builder
  void title;
  void enTitle;
  void topic;
  return null;
}

const FILLER_RE =
  /Concrete check voor dit artikel|Dit artikel legt uit wat|nep-stappenplan|Open Files\/FTP\/PHP\/SSL\/Backups\/Cron zoals dit onderwerp vraagt|open het juiste wp-admin menu voor dit onderwerp/i;

function isUsableBuilderHtml(html: string): boolean {
  return html.trim().length >= 280 && !FILLER_RE.test(html);
}

export function writeArticle(article: CatalogArticle): KennisbankArticleFile {
  const curated = CURATED_ARTICLES[article.slug];
  if (curated) {
    return {
      ...curated,
      nl: {
        ...curated.nl,
        title: article.title,
        seoTitle: curated.nl.seoTitle || `${article.title} | TripleZero iT`,
        seoDescription: curated.nl.seoDescription || curated.nl.excerpt,
      },
      en: {
        ...curated.en,
        seoTitle: curated.en.seoTitle || `${curated.en.title} | TripleZero iT`,
        seoDescription: curated.en.seoDescription || curated.en.excerpt,
      },
    };
  }

  const enTitle = englishTitleFromDutch(article.title, article.slug);

  // Narrow playbooks (e.g. Installatron WP install).
  const playbook = matchPlaybook(article);
  if (playbook) {
    return {
      slug: article.slug,
      topic: article.topic,
      nl: {
        title: article.title,
        excerpt: playbook.excerptNl,
        bodyHtml: playbook.bodyNl,
        seoTitle: `${article.title} | TripleZero iT`,
        seoDescription: playbook.excerptNl,
      },
      en: {
        title: enTitle,
        excerpt: playbook.excerptEn,
        bodyHtml: playbook.bodyEn,
        seoTitle: `${enTitle} | TripleZero iT`,
        seoDescription: playbook.excerptEn,
      },
    };
  }

  // Procedural fallback (real panel steps — no meta-filler).
  const guide = buildUniqueLongformGuide(article, enTitle);
  return {
    slug: article.slug,
    topic: article.topic,
    nl: {
      title: article.title,
      excerpt: guide.excerptNl,
      bodyHtml: guide.bodyNl,
      seoTitle: `${article.title} | TripleZero iT`,
      seoDescription: guide.excerptNl,
    },
    en: {
      title: enTitle,
      excerpt: guide.excerptEn,
      bodyHtml: guide.bodyEn,
      seoTitle: `${enTitle} | TripleZero iT`,
      seoDescription: guide.excerptEn,
    },
  };
}

/** Optional NL override from a known-good topic builder (skips filler). */
export function withDutchBuilderBody(
  file: KennisbankArticleFile,
  bodyNl: string | null | undefined,
  excerptNl?: string | null,
): KennisbankArticleFile {
  if (!bodyNl || !isUsableBuilderHtml(bodyNl)) return file;
  return {
    ...file,
    nl: {
      ...file.nl,
      excerpt: excerptNl?.trim() || file.nl.excerpt,
      bodyHtml: bodyNl,
      seoDescription: excerptNl?.trim() || file.nl.seoDescription || file.nl.excerpt,
    },
  };
}

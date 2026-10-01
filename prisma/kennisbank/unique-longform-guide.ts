/**
 * Unique long-form kennisbank guides per catalog article.
 * Each slug gets its own section mix, steps, checks and wording —
 * not a shared catch-all playbook with the title swapped in.
 */
import {
  h2,
  h3,
  joinBlocks,
  ol,
  p,
  supportOutro,
  tip,
  ul,
  warn,
} from "./html-helpers";

export type GuideArticle = {
  slug: string;
  title: string;
  topic: string;
  categories: string[];
};

export type LongformGuide = {
  excerptNl: string;
  excerptEn: string;
  bodyNl: string;
  bodyEn: string;
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

type Locale = "nl" | "en";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(seed: number, arr: T[], salt = 0): T {
  return arr[(seed + salt * 97) % arr.length]!;
}

function pickN<T>(seed: number, arr: T[], n: number, salt = 0): T[] {
  if (arr.length === 0) return [];
  const out: T[] = [];
  const used = new Set<number>();
  for (let i = 0; i < Math.min(n, arr.length); i++) {
    let idx = (seed + salt * 31 + i * 17) % arr.length;
    let guard = 0;
    while (used.has(idx) && guard < arr.length) {
      idx = (idx + 1) % arr.length;
      guard++;
    }
    used.add(idx);
    out.push(arr[idx]!);
  }
  return out;
}

function subjectOf(title: string): string {
  return title.replace(/\?+$/, "").trim();
}

function detectKind(title: string, slug: string): Kind {
  const t = `${title} ${slug}`.toLowerCase();
  if (/vergelijk|versus|vs\.|verschil|welke-|wanneer-kies|compare|difference/.test(t))
    return "compare";
  if (
    /werkt niet|niet bereikbaar|fout|error|troubleshooting|lukt niet|mislukt|probleem|kan niet|niet inloggen|down|500|404|403|timeout|spam gezien|quarantaine/.test(
      t,
    )
  )
    return "troubleshoot";
  if (
    /^wat is |^wat zijn |^wat betekent |^what is |^what are |uitleg|begrip/.test(t) ||
    /^wat-is-|^what-is-/.test(slug)
  )
    return "explain";
  return "howto";
}

function detectPanel(categories: string[], topic: string, title: string, slug: string): Panel {
  const hay = `${categories.join(" ")} ${topic} ${title} ${slug}`.toLowerCase();
  if (/cyberpanel|openlitespeed|\bcp-/.test(hay)) return "cyberpanel";
  if (/\bplesk\b/.test(hay)) return "plesk";
  if (/directadmin|installatron|jetbackup|\bda-/.test(hay)) return "directadmin";
  if (/wordpress|woocommerce|wp-admin|elementor|plugin|thema|theme/.test(hay))
    return "wordpress";
  if (/e-mail|email|webmail|smtp|imap|spf|dkim|dmarc|roundcube|mailbox/.test(hay))
    return "email";
  if (/dns|domeinnaam|nameserver|a-record|cname|mx-record|whois|sidn|forward/.test(hay))
    return "dns";
  if (/\bvps\b|ssh|firewall|server|snapshot/.test(hay)) return "vps";
  if (/crm|klantenpanel|factuur|ticket|pakket|opzeg|abonnement|shop/.test(hay))
    return "client";
  return "general";
}

type NicheKey =
  | "wp_comments_spam"
  | "wp_down_update"
  | "wp_plugin"
  | "wp_cache"
  | "wp_login"
  | "wp_ssl_url"
  | "wp_migrate"
  | "wp_users"
  | "wp_perf"
  | "wp_security"
  | "wp_woo"
  | "wp_generic"
  | "dns_records"
  | "dns_ns"
  | "dns_forward"
  | "dns_whois"
  | "email_client"
  | "email_auth"
  | "email_webmail"
  | "email_deliver"
  | "email_ooo"
  | "email_catchall"
  | "email_create"
  | "email_signature"
  | "ftp_files"
  | "php_version"
  | "backup_restore"
  | "da_domain"
  | "da_ssl"
  | "da_files"
  | "da_db"
  | "cp_login"
  | "cp_site"
  | "plesk_reseller"
  | "plesk_site"
  | "vps_ssh"
  | "vps_plan"
  | "vps_firewall"
  | "client_cancel"
  | "client_invoice"
  | "client_ticket"
  | "hosting_quota"
  | "security_2fa"
  | "compare_host"
  | "generic";

function detectNiche(hay: string): NicheKey {
  // Infrastructure / panels first (avoid category words like "beveiliging" stealing SSH).
  if (/cyberpanel.*inlog|inloggen-op-cyberpanel|cp-login/.test(hay)) return "cp_login";
  if (/cyberpanel|openlitespeed/.test(hay)) return "cp_site";
  if (/plesk.*reseller|reseller.*plesk/.test(hay)) return "plesk_reseller";
  if (/\bplesk\b/.test(hay)) return "plesk_site";
  if (/\bssh\b/.test(hay)) return "vps_ssh";
  if (/firewall|ufw|iptables|csf/.test(hay)) return "vps_firewall";
  if (/vps.*basic|vps.*plus|vps.*business|vps hosting/.test(hay)) return "vps_plan";
  if (/2fa|two-step|two factor/.test(hay)) return "security_2fa";
  if (/ftp|filezilla|sftp/.test(hay)) return "ftp_files";
  if (/php.?versie|php version|php.?instellingen|php.?selector/.test(hay)) return "php_version";
  if (/backup|jetbackup|herstellen|restore/.test(hay)) return "backup_restore";
  if (/directadmin.*ssl|lets encrypt|https forceren|ssl-certificaat/.test(hay)) return "da_ssl";
  if (/database|mysql|mariadb|phpmyadmin/.test(hay)) return "da_db";
  if (/file manager|bestanden/.test(hay) && /directadmin|hosting/.test(hay)) return "da_files";
  if (/directadmin|domein toevoegen.*direct|subdomein/.test(hay) && !/wordpress|wp-/.test(hay))
    return "da_domain";

  if (/opzeg|opheffen|cancel|abonnement.*stop/.test(hay)) return "client_cancel";
  if (/factuur|invoice|betaling|incasso/.test(hay)) return "client_invoice";
  if (/ticket|support|klantenpanel/.test(hay)) return "client_ticket";
  if (/quota|schijfruimte|bandbreedte|inode|is vol|pakket is vol|mailbox.*vol/.test(hay))
    return "hosting_quota";
  if (/versus|vergelijk|verschil tussen/.test(hay)) return "compare_host";

  if (/comment|reactie/.test(hay) && /spam|wordpress|wp-|blog/.test(hay)) return "wp_comments_spam";
  if (/down|critical error|witte pagina|white screen/.test(hay) && /update|wordpress|plugin|thema/.test(hay))
    return "wp_down_update";
  if (/woocommerce|checkout|webshop|winkelwagen/.test(hay)) return "wp_woo";
  if (/cache|litespeed|wp rocket|super cache/.test(hay)) return "wp_cache";
  if (/inlog|login|wachtwoord vergeten|wp-admin/.test(hay) && /wordpress|wp/.test(hay))
    return "wp_login";
  if (/siteurl|home url|https.*wordpress|wordpress.*ssl|mixed content/.test(hay))
    return "wp_ssl_url";
  if (/verhuis|migrat|verplaats.*wordpress|wordpress.*verhuis/.test(hay)) return "wp_migrate";
  if (/gebruiker|user role|administrator|redacteur/.test(hay) && /wordpress|wp/.test(hay))
    return "wp_users";
  if (/traag|performance|snelheid|ttfb|optimize/.test(hay) && /wordpress|site|website/.test(hay))
    return "wp_perf";
  if (
    (/hack|malware|wordfence|bruteforce/.test(hay) ||
      (/beveilig/.test(hay) && /wordpress|wp-/.test(hay))) &&
    /wordpress|wp-|plugin|thema/.test(hay)
  )
    return "wp_security";
  if (/plugin/.test(hay) && /wordpress|wp/.test(hay)) return "wp_plugin";
  if (/wordpress|wp-admin|woocommerce/.test(hay)) return "wp_generic";

  if (/spf|dkim|dmarc/.test(hay)) return "email_auth";
  if (/nameserver|ns-record|dns service/.test(hay)) return "dns_ns";
  if (/forward|redirect|doorsturen/.test(hay) && /domein|domain|url/.test(hay))
    return "dns_forward";
  if (/whois|autorisatie|epp|transfercode|quarantaine|alles-over-.*domein/.test(hay))
    return "dns_whois";
  if (/dns|a-record|cname|mx|txt-record|zone/.test(hay)) return "dns_records";

  if (/out.of.office|afwezig|autorespond|automatisch antwoord|ooo/.test(hay)) return "email_ooo";
  if (/catch.?all|catchall/.test(hay)) return "email_catchall";
  if (/handtekening|signature/.test(hay) && /mail|webmail|e-mail/.test(hay))
    return "email_signature";
  if (/e-mailadres aanmaken|mailbox aanmaken|create.?mailbox|nieuw e-mail/.test(hay))
    return "email_create";
  if (/webmail|roundcube/.test(hay)) return "email_webmail";
  if (/spam|phishing|blokkeert|deliver|aankom|bounce/.test(hay) && /mail|e-mail|email/.test(hay))
    return "email_deliver";
  if (/outlook|thunderbird|apple mail|smtp|imap|mailbox|e-mail|email/.test(hay))
    return "email_client";

  return "generic";
}

type NichePack = {
  angleNl: (s: string) => string;
  angleEn: (s: string) => string;
  prepNl: string[];
  prepEn: string[];
  stepsNl: (s: string) => string[];
  stepsEn: (s: string) => string[];
  verifyNl: string[];
  verifyEn: string[];
  pitfallsNl: string[];
  pitfallsEn: string[];
  tipNl: string[];
  tipEn: string[];
  warnNl: string[];
  warnEn: string[];
  relatedNl: string;
  relatedEn: string;
  whyNl: (s: string) => string;
  whyEn: (s: string) => string;
};

function nichePacks(): Record<NicheKey, NichePack> {
  const wpBasePrepNl = [
    "Recente Installatron- of panel-backup (bestanden + database).",
    "Toegang tot /wp-admin van de juiste site.",
    "DirectAdmin-login voor File Manager/PHP/SSL als wp-admin faalt.",
  ];
  const wpBasePrepEn = [
    "Recent Installatron or panel backup (files + database).",
    "Access to /wp-admin of the correct site.",
    "DirectAdmin login for File Manager/PHP/SSL if wp-admin fails.",
  ];

  return {
    wp_comments_spam: {
      angleNl: (s) =>
        `${s} speelt meestal in Discussie-instellingen, Akismet/anti-spam-plugins of in de moderatiewachtrij — niet in DNS of SSL.`,
      angleEn: (s) =>
        `${s} usually lives in Discussion settings, Akismet/anti-spam plugins or the moderation queue — not in DNS or SSL.`,
      prepNl: [...wpBasePrepNl, "Overzicht van actieve anti-spam plugins."],
      prepEn: [...wpBasePrepEn, "Overview of active anti-spam plugins."],
      stepsNl: () => [
        "Open wp-admin → Reacties en controleer Spam én Moderatie (niet alleen Goedgekeurd).",
        "Ga naar Instellingen → Discussie: check of reacties moeten worden goedgekeurd, of links in reacties worden tegengehouden, en of je e-mailnotificaties aan staan.",
        "Open Akismet of je anti-spam plugin: bevestig API-key, false-positive logs en of legitieme reacties per ongeluk geblokkeerd worden.",
        "Test met een reactie vanaf een ander netwerk/browser (ingelogde admins bypassen vaak filters).",
        "Als alles in spam verdwijnt na een update: schakel de laatst gewijzigde anti-spam plugin tijdelijk uit en herhaal de test.",
      ],
      stepsEn: () => [
        "Open wp-admin → Comments and check Spam and Moderation (not only Approved).",
        "Go to Settings → Discussion: check whether comments need approval, whether links are held, and whether email notifications are on.",
        "Open Akismet or your anti-spam plugin: confirm API key, false-positive logs and whether legitimate comments are blocked by mistake.",
        "Test with a comment from another network/browser (logged-in admins often bypass filters).",
        "If everything lands in spam after an update: temporarily disable the last changed anti-spam plugin and retest.",
      ],
      verifyNl: [
        "Een testreactie verschijnt in Moderatie of Goedgekeurd, niet alleen Spam.",
        "E-mailnotificatie voor nieuwe reactie komt aan (indien ingeschakeld).",
        "Geen flood van botreacties na het versoepelen van filters.",
      ],
      verifyEn: [
        "A test comment appears in Moderation or Approved, not only Spam.",
        "New-comment email notification arrives (if enabled).",
        "No bot-comment flood after relaxing filters.",
      ],
      pitfallsNl: [
        "Alleen in Goedgekeurd kijken terwijl items in Spam staan.",
        "Captcha of blacklist die je eigen domein/IP blokkeert.",
        "Caching van de reactiesectie zodat goedgekeurde items niet zichtbaar lijken.",
      ],
      pitfallsEn: [
        "Only checking Approved while items sit in Spam.",
        "Captcha or blacklist blocking your own domain/IP.",
        "Caching the comments section so approved items look missing.",
      ],
      tipNl: [
        "Witlijst je eigen e-maildomein in de anti-spam plugin als medewerkersreacties verdwijnen.",
      ],
      tipEn: [
        "Whitelist your own email domain in the anti-spam plugin if staff comments disappear.",
      ],
      warnNl: [
        "Schakel anti-spam niet volledig uit op een publieke site — versoepel gericht of witlijst.",
      ],
      warnEn: [
        "Do not fully disable anti-spam on a public site — relax filters or whitelist instead.",
      ],
      relatedNl: "WordPress critical error, Installatron-backup, e-mail deliverability",
      relatedEn: "WordPress critical error, Installatron backup, email deliverability",
      whyNl: (s) =>
        `Bij ${s.toLowerCase()} wil je legitieme gesprekken behouden zonder open te staan voor botspam. De juiste laag is moderatie + anti-spam, niet het hostingpanel.`,
      whyEn: (s) =>
        `For ${s.toLowerCase()} you want real conversation without opening the door to bots. The right layer is moderation + anti-spam, not the hosting panel.`,
    },
    wp_down_update: {
      angleNl: (s) =>
        `${s} komt vaak door een incompatibele plugin/thema of PHP-fout na core/plugin-update. Herstel eerst de site, update daarna gecontroleerd.`,
      angleEn: (s) =>
        `${s} often comes from an incompatible plugin/theme or PHP error after a core/plugin update. Restore the site first, then update in a controlled way.`,
      prepNl: [...wpBasePrepNl, "Notitie welke updates net zijn uitgevoerd."],
      prepEn: [...wpBasePrepEn, "Note of which updates were just applied."],
      stepsNl: () => [
        "Open de site in een privévenster: noteer critical error, witte pagina of HTTP 500.",
        "Via DirectAdmin File Manager: hernoem <code>wp-content/plugins</code> tijdelijk naar <code>plugins-off</code> om plugins uit te schakelen.",
        "Werkt de site weer: hernoem terug en schakel plugins één voor één in tot de boosdoener duidelijk is.",
        "Bij thema-probleem: zet via FTP/SFTP een default thema actief of herstel theme-bestanden uit backup.",
        "Controleer DirectAdmin → Domain Setup / PHP Version: te nieuwe PHP kan oude plugins breken; te oude PHP triggert security-blokkades.",
        "Herinstalleer of rollback de problematische update; leeg daarna alle caches.",
      ],
      stepsEn: () => [
        "Open the site in a private window: note critical error, white screen or HTTP 500.",
        "Via DirectAdmin File Manager: temporarily rename <code>wp-content/plugins</code> to <code>plugins-off</code> to disable plugins.",
        "If the site recovers: rename back and enable plugins one by one until the culprit is clear.",
        "For theme issues: activate a default theme via FTP/SFTP or restore theme files from backup.",
        "Check DirectAdmin → Domain Setup / PHP Version: too-new PHP can break old plugins; too-old PHP triggers security blocks.",
        "Reinstall or roll back the bad update; then clear all caches.",
      ],
      verifyNl: [
        "Homepage en wp-admin laden zonder critical error.",
        "Recente posts/producten zichtbaar.",
        "Geen PHP fatals in error_log van het domein.",
      ],
      verifyEn: [
        "Homepage and wp-admin load without a critical error.",
        "Recent posts/products visible.",
        "No PHP fatals in the domain error_log.",
      ],
      pitfallsNl: [
        "Opnieuw updaten zonder de boosdoener te isoleren.",
        "Uploads-map of database wissen tijdens ‘opschonen’.",
        "Alleen page-cache legen terwijl object-cache de fout vasthoudt.",
      ],
      pitfallsEn: [
        "Updating again without isolating the culprit.",
        "Deleting uploads or the database while ‘cleaning’.",
        "Clearing only page cache while object cache keeps the fault.",
      ],
      tipNl: ["Gebruik staging of een kopie vóór bulk-updates op een live shop."],
      tipEn: ["Use staging or a copy before bulk updates on a live shop."],
      warnNl: ["Herstel nooit blind een week-oude backup over verse orders heen."],
      warnEn: ["Never blindly restore a week-old backup over fresh orders."],
      relatedNl: "PHP-versie wijzigen, Installatron-backup, plugin conflicten",
      relatedEn: "Change PHP version, Installatron backup, plugin conflicts",
      whyNl: () =>
        "Een update die de site platlegt vraagt om isolatie (plugins/thema/PHP), niet om meteen alles opnieuw te installeren.",
      whyEn: () =>
        "An update that takes the site down needs isolation (plugins/theme/PHP), not an immediate full reinstall.",
    },
    wp_plugin: {
      angleNl: (s) =>
        `${s} raakt plugins, autoload-opties of mu-plugins. Werk altijd met backup en activeer wijzigingen één voor één.`,
      angleEn: (s) =>
        `${s} touches plugins, autoloaded options or must-use plugins. Always work with a backup and apply changes one at a time.`,
      prepNl: wpBasePrepNl,
      prepEn: wpBasePrepEn,
      stepsNl: (s) => [
        "Maak een backup van files + database.",
        `Voer de handeling voor “${s}” uit via Plugins in wp-admin (installeren, bijwerken, deactiveren of verwijderen).`,
        "Bij een fatal: hernoem de pluginmap via File Manager en herstel wp-admin.",
        "Controleer of mu-plugins of een must-use loader de wijziging overschrijft.",
        "Leeg caches en test de flows die de plugin raakt (forms, login, checkout).",
      ],
      stepsEn: (s) => [
        "Create a files + database backup.",
        `Apply the change for “${s}” via Plugins in wp-admin (install, update, deactivate or delete).`,
        "On a fatal: rename the plugin folder via File Manager and recover wp-admin.",
        "Check whether must-use plugins override the change.",
        "Clear caches and test flows the plugin touches (forms, login, checkout).",
      ],
      verifyNl: [
        "Pluginstatus klopt in de pluginslijst.",
        "Geen critical error op voorkant of wp-admin.",
        "Functie van de plugin doet wat je verwacht (of is bewust uit).",
      ],
      verifyEn: [
        "Plugin status is correct in the plugins list.",
        "No critical error on front end or wp-admin.",
        "Plugin feature works as expected (or is intentionally off).",
      ],
      pitfallsNl: [
        "Meerdere plugins tegelijk updaten zonder tussentijdse check.",
        "Nulstellen van de databaseopties van een plugin zonder export.",
      ],
      pitfallsEn: [
        "Updating multiple plugins at once without intermediate checks.",
        "Resetting plugin database options without an export.",
      ],
      tipNl: ["Houd een korte changelog bij: welke plugin, welke versie, welk tijdstip."],
      tipEn: ["Keep a short changelog: which plugin, which version, which time."],
      warnNl: ["Verwijder geen pluginmappen die nog custom code of licenses bevatten zonder archive."],
      warnEn: ["Do not delete plugin folders that still hold custom code or licenses without an archive."],
      relatedNl: "Website down na update, Installatron-backup, PHP-versie",
      relatedEn: "Site down after update, Installatron backup, PHP version",
      whyNl: (s) =>
        `Plugins zijn de meest voorkomende breuklijn bij “${s}”. Isoleren voorkomt dat je uren zoekt in thema of DNS.`,
      whyEn: (s) =>
        `Plugins are the most common break point for “${s}”. Isolation stops you hunting for hours in theme or DNS.`,
    },
    wp_cache: {
      angleNl: (s) =>
        `${s} gaat over page-/object-/CDN-cache. Verkeerde cache verklaart ‘oude content’ en soms vastzittende fouten na fixes.`,
      angleEn: (s) =>
        `${s} is about page/object/CDN cache. Bad cache explains ‘old content’ and sometimes sticky errors after fixes.`,
      prepNl: [...wpBasePrepNl, "Welke cacheplugin of CDN actief is."],
      prepEn: [...wpBasePrepEn, "Which cache plugin or CDN is active."],
      stepsNl: () => [
        "Purge de cacheplugin in wp-admin (complete purge, niet alleen één URL).",
        "Purge eventuele CDN/proxy-cache.",
        "In DirectAdmin/OLS: purge servercache als die actief is.",
        "Test in privévenster en op mobiel netwerk.",
        "Schakel tijdelijk ‘cache ingelogde gebruikers’ uit als editors oude content zien.",
      ],
      stepsEn: () => [
        "Purge the cache plugin in wp-admin (full purge, not only one URL).",
        "Purge any CDN/proxy cache.",
        "In DirectAdmin/OLS: purge server cache if enabled.",
        "Test in a private window and on mobile network.",
        "Temporarily disable ‘cache logged-in users’ if editors see stale content.",
      ],
      verifyNl: ["Gewijzigde content zichtbaar zonder hard-refresh-trucs.", "Geen gemixte oude/nieuwe assets."],
      verifyEn: ["Changed content visible without hard-refresh tricks.", "No mixed old/new assets."],
      pitfallsNl: ["Alleen browsercache legen terwijl page-cache blijft staan."],
      pitfallsEn: ["Only clearing browser cache while page cache remains."],
      tipNl: ["Na DNS/SSL-wijzigingen ook CDN-cache meenemen."],
      tipEn: ["After DNS/SSL changes, clear CDN cache too."],
      warnNl: ["Full-page cache op checkout/cart kan woocommerce-breuken veroorzaken."],
      warnEn: ["Full-page cache on checkout/cart can break WooCommerce."],
      relatedNl: "WordPress performance, CDN, OpenLiteSpeed cache",
      relatedEn: "WordPress performance, CDN, OpenLiteSpeed cache",
      whyNl: () => "Cache versnelt, maar verbergt wijzigingen tot je bewust purget.",
      whyEn: () => "Cache speeds things up, but hides changes until you purge on purpose.",
    },
    wp_login: {
      angleNl: (s) =>
        `${s} kan wp-wachtwoord, gebruikersrol, security-plugin, SSL-redirect of verkeerde site-URL zijn.`,
      angleEn: (s) =>
        `${s} can be WP password, user role, security plugin, SSL redirect or a wrong site URL.`,
      prepNl: [...wpBasePrepNl, "Bevestiging welk domein/URL de echte site is."],
      prepEn: [...wpBasePrepEn, "Confirmation which domain/URL is the real site."],
      stepsNl: () => [
        "Probeer /wp-login.php en /wp-admin; noteer redirect loops of 404.",
        "Reset wachtwoord via ‘Wachtwoord vergeten’ of via phpMyAdmin (users-tabel) als mail faalt.",
        "Deactiveer security/limit-login plugins via File Manager als je geblokkeerd bent.",
        "Controleer siteurl/home in wp_options of wp-config — http/https en www moeten kloppen.",
        "Test opnieuw in privévenster zonder oude cookies.",
      ],
      stepsEn: () => [
        "Try /wp-login.php and /wp-admin; note redirect loops or 404.",
        "Reset password via ‘Lost password’ or phpMyAdmin (users table) if mail fails.",
        "Disable security/limit-login plugins via File Manager if you are locked out.",
        "Check siteurl/home in wp_options or wp-config — http/https and www must match.",
        "Retest in a private window without old cookies.",
      ],
      verifyNl: ["Inloggen lukt met het bedoelde account.", "Geen oneindige redirect."],
      verifyEn: ["Login works with the intended account.", "No infinite redirect."],
      pitfallsNl: ["Verkeerde database bewerken op een staging-kloon."],
      pitfallsEn: ["Editing the wrong database on a staging clone."],
      tipNl: ["Gebruik een unieke admin-gebruikersnaam; ‘admin’ trekt brute-force."],
      tipEn: ["Use a unique admin username; ‘admin’ attracts brute force."],
      warnNl: ["Deel geen wp-admin credentials in tickets in plain text langer dan nodig."],
      warnEn: ["Do not leave wp-admin credentials in tickets longer than needed."],
      relatedNl: "SSL/HTTPS, WordPress URL, security plugins",
      relatedEn: "SSL/HTTPS, WordPress URL, security plugins",
      whyNl: () => "Loginproblemen zijn vaak redirect of lockout, niet ‘hosting down’.",
      whyEn: () => "Login issues are often redirect or lockout, not ‘hosting down’.",
    },
    wp_ssl_url: {
      angleNl: (s) =>
        `${s} koppelt certificaat, force-HTTPS en WordPress siteurl/home. Die drie moeten synchroon lopen.`,
      angleEn: (s) =>
        `${s} ties certificate, force-HTTPS and WordPress siteurl/home together. Those three must stay in sync.`,
      prepNl: [...wpBasePrepNl, "Werkend Let’s Encrypt-certificaat in DirectAdmin."],
      prepEn: [...wpBasePrepEn, "Working Let’s Encrypt certificate in DirectAdmin."],
      stepsNl: () => [
        "Bevestig geldig certificaat voor apex én www in DirectAdmin SSL.",
        "Zet WordPress Adressen (Instellingen → Algemeen) op https://…",
        "Forceer HTTPS in panel of .htaccess pas ná geldig certificaat.",
        "Zoek hard-coded http:// in thema/plugin of database en corrigeer gericht.",
        "Leeg cache/CDN en test mixed content in browser DevTools.",
      ],
      stepsEn: () => [
        "Confirm a valid certificate for apex and www in DirectAdmin SSL.",
        "Set WordPress Addresses (Settings → General) to https://…",
        "Force HTTPS in the panel or .htaccess only after a valid certificate.",
        "Find hard-coded http:// in theme/plugin or database and fix carefully.",
        "Clear cache/CDN and test mixed content in browser DevTools.",
      ],
      verifyNl: ["Hangslot zonder mixed content.", "wp-admin blijft op https."],
      verifyEn: ["Padlock without mixed content.", "wp-admin stays on https."],
      pitfallsNl: ["HTTPS forceren zonder certificaat → browserfout."],
      pitfallsEn: ["Forcing HTTPS without a certificate → browser error."],
      tipNl: ["Wijzig siteurl/home één voor één en test tussendoor."],
      tipEn: ["Change siteurl/home one at a time and test in between."],
      warnNl: ["Blinde search-replace in de hele database kan geserialiseerde data breken."],
      warnEn: ["Blind search-replace across the whole database can break serialized data."],
      relatedNl: "Let’s Encrypt, mixed content, CDN SSL",
      relatedEn: "Let’s Encrypt, mixed content, CDN SSL",
      whyNl: () => "SSL zonder kloppende WP-URL’s geeft loops of mixed content.",
      whyEn: () => "SSL without matching WP URLs causes loops or mixed content.",
    },
    wp_migrate: {
      angleNl: (s) =>
        `${s} vereist files, database én URL-vervangingen. Vergeet je één laag, dan breekt login of media.`,
      angleEn: (s) =>
        `${s} needs files, database and URL replacements. Miss one layer and login or media breaks.`,
      prepNl: [...wpBasePrepNl, "Bron- en doelhostinggegevens, DNS-plan voor cutover."],
      prepEn: [...wpBasePrepEn, "Source and destination hosting details, DNS cutover plan."],
      stepsNl: () => [
        "Exporteer files (wp-content + config) en database van de bron.",
        "Importeer op doelhosting; corrigeer wp-config (DB-naam, user, salt indien nodig).",
        "Vervang URL’s veilig (WP-CLI search-replace of gespecialiseerde tool).",
        "Test op hosts-file of tijdelijk subdomein vóór DNS-cutover.",
        "Zet DNS om, activeer SSL, leeg caches.",
      ],
      stepsEn: () => [
        "Export files (wp-content + config) and database from the source.",
        "Import on destination hosting; fix wp-config (DB name, user, salts if needed).",
        "Replace URLs safely (WP-CLI search-replace or a specialised tool).",
        "Test via hosts file or temporary subdomain before DNS cutover.",
        "Flip DNS, enable SSL, clear caches.",
      ],
      verifyNl: ["Media laadt vanaf nieuw domein.", "Login en permalinks werken."],
      verifyEn: ["Media loads from the new domain.", "Login and permalinks work."],
      pitfallsNl: ["Alleen files kopiëren zonder database."],
      pitfallsEn: ["Copying files only without the database."],
      tipNl: ["Verlaag TTL 24u vóór cutover."],
      tipEn: ["Lower TTL 24h before cutover."],
      warnNl: ["Overschrijf geen live database zonder rollback."],
      warnEn: ["Do not overwrite a live database without rollback."],
      relatedNl: "DNS A-record, SSL, Installatron",
      relatedEn: "DNS A record, SSL, Installatron",
      whyNl: () => "Migratie is een keten: data → URL’s → DNS → SSL.",
      whyEn: () => "Migration is a chain: data → URLs → DNS → SSL.",
    },
    wp_users: {
      angleNl: (s) =>
        `${s} draait om rollen, capabilities en wie wp-admin mag openen. Minder rechten is veiliger.`,
      angleEn: (s) =>
        `${s} is about roles, capabilities and who may open wp-admin. Fewer privileges is safer.`,
      prepNl: wpBasePrepNl,
      prepEn: wpBasePrepEn,
      stepsNl: (s) => [
        `Open Gebruikers in wp-admin en zoek het account dat bij “${s}” hoort.`,
        "Pas rol aan (Administrator alleen voor wie het écht nodig heeft).",
        "Reset wachtwoord en bevestig e-mailadres.",
        "Verwijder of demote onbekende admins na een hack-vermoeden.",
        "Controleer membership/security-plugins die rollen overschrijven.",
      ],
      stepsEn: (s) => [
        `Open Users in wp-admin and find the account related to “${s}”.`,
        "Adjust the role (Administrator only for people who truly need it).",
        "Reset password and confirm email address.",
        "Remove or demote unknown admins after a suspected compromise.",
        "Check membership/security plugins that override roles.",
      ],
      verifyNl: ["Account kan precies de bedoelde schermen openen.", "Geen extra spook-admins."],
      verifyEn: ["Account can open exactly the intended screens.", "No extra ghost admins."],
      pitfallsNl: ["Jezelf de laatste admin-rechten ontnemen."],
      pitfallsEn: ["Removing admin rights from your only remaining admin."],
      tipNl: ["Gebruik aparte accounts per persoon — geen gedeelde ‘redactie’ admin."],
      tipEn: ["Use separate accounts per person — no shared ‘editorial’ admin."],
      warnNl: ["Wis geen auteuraccounts met historische content zonder hertoewijzing."],
      warnEn: ["Do not delete author accounts with historical content without reassigning."],
      relatedNl: "WordPress login, security hardening",
      relatedEn: "WordPress login, security hardening",
      whyNl: () => "Rollen bepalen schade bij gestolen credentials.",
      whyEn: () => "Roles determine the blast radius of stolen credentials.",
    },
    wp_perf: {
      angleNl: (s) =>
        `${s} verbeter je met metingen eerst (TTFB, zware plugins, images), daarna caching en hostingresources.`,
      angleEn: (s) =>
        `${s} improves when you measure first (TTFB, heavy plugins, images), then caching and hosting resources.`,
      prepNl: [...wpBasePrepNl, "Eén trage URL als referentie."],
      prepEn: [...wpBasePrepEn, "One slow URL as reference."],
      stepsNl: () => [
        "Meet TTFB en paginatijd vóór wijzigingen.",
        "Schakel zware plugins tijdelijk uit om impact te zien.",
        "Optimaliseer afbeeldingen en lazy-load waar zinvol.",
        "Activeer page-cache; sluit cart/checkout uit bij WooCommerce.",
        "Check PHP-versie en object-cache; bekijk slow-query logs bij DB-zwaarte.",
      ],
      stepsEn: () => [
        "Measure TTFB and page time before changes.",
        "Temporarily disable heavy plugins to see impact.",
        "Optimise images and lazy-load where useful.",
        "Enable page cache; exclude cart/checkout on WooCommerce.",
        "Check PHP version and object cache; review slow-query logs for DB weight.",
      ],
      verifyNl: ["Referentie-URL sneller in herhaalde meting.", "Geen functionele regressie."],
      verifyEn: ["Reference URL faster on repeat measurement.", "No functional regression."],
      pitfallsNl: ["Vijf optimalisatieplugins tegelijk stapelen."],
      pitfallsEn: ["Stacking five optimisation plugins at once."],
      tipNl: ["Eén wijziging per meting — anders weet je niet wat hielp."],
      tipEn: ["One change per measurement — otherwise you will not know what helped."],
      warnNl: ["Minify/combine kan checkout of pagebuilders breken."],
      warnEn: ["Minify/combine can break checkout or page builders."],
      relatedNl: "Cache legen, PHP-versie, VPS-resources",
      relatedEn: "Clear cache, PHP version, VPS resources",
      whyNl: () => "Snelheid zonder meting is giswerk.",
      whyEn: () => "Speed work without measurement is guesswork.",
    },
    wp_security: {
      angleNl: (s) =>
        `${s} vraagt om hardening: updates, minimale plugins, sterke admins, backups — niet alleen een security-plugin-install.`,
      angleEn: (s) =>
        `${s} needs hardening: updates, minimal plugins, strong admins, backups — not only installing a security plugin.`,
      prepNl: wpBasePrepNl,
      prepEn: wpBasePrepEn,
      stepsNl: (s) => [
        `Inventariseer verdachte admins, nieuwe plugins en gewijzigde bestanden rond “${s}”.`,
        "Update core, thema’s en plugins; verwijder wat je niet gebruikt.",
        "Forceer wachtwoordreset voor alle admins; schakel 2FA in waar beschikbaar.",
        "Scan met je security-plugin; isoleer malware-bestanden i.p.v. alles te wissen.",
        "Roteer wp-config salts en databasewachtwoord na een bevestigde infectie.",
      ],
      stepsEn: (s) => [
        `Inventory suspicious admins, new plugins and changed files around “${s}”.`,
        "Update core, themes and plugins; remove unused items.",
        "Force password resets for all admins; enable 2FA where available.",
        "Scan with your security plugin; isolate malware files instead of deleting everything.",
        "Rotate wp-config salts and database password after a confirmed infection.",
      ],
      verifyNl: ["Geen onbekende admins.", "Homepage schoon in externe scanner."],
      verifyEn: ["No unknown admins.", "Homepage clean on an external scanner."],
      pitfallsNl: ["Alleen symptomen wissen (spamfiles) zonder loginpad te dichten."],
      pitfallsEn: ["Only removing symptoms (spam files) without closing the login path."],
      tipNl: ["Beperk XML-RPC en wisselstandaard ‘admin’ gebruikersnaam af."],
      tipEn: ["Limit XML-RPC and retire the default ‘admin’ username."],
      warnNl: ["Herstel uit een geïnfecteerde backup herintroduceert malware."],
      warnEn: ["Restoring an infected backup reintroduces malware."],
      relatedNl: "Backups, 2FA, WordPress login",
      relatedEn: "Backups, 2FA, WordPress login",
      whyNl: () => "Security is proces + backup, niet één knop.",
      whyEn: () => "Security is process + backup, not one button.",
    },
    wp_woo: {
      angleNl: (s) =>
        `${s} raakt checkout, betaalplugins, cache-uitzonderingen en soms cron voor orders/e-mails.`,
      angleEn: (s) =>
        `${s} touches checkout, payment plugins, cache exclusions and sometimes cron for orders/emails.`,
      prepNl: [...wpBasePrepNl, "Testorder-mogelijkheid of staging."],
      prepEn: [...wpBasePrepEn, "Ability to place a test order or use staging."],
      stepsNl: (s) => [
        `Maak backup; noteer actieve betaal- en verzendplugins voor “${s}”.`,
        "Test checkout in privévenster; noteer exacte fout of hangpunt.",
        "Sluit cart/checkout/mijn-account uit van full-page cache.",
        "Controleer WooCommerce → Status op fouten, webhooks en geplande acties.",
        "Schakel laatst gewijzigde checkout-plugin uit om conflicten te isoleren.",
      ],
      stepsEn: (s) => [
        `Create a backup; note active payment and shipping plugins for “${s}”.`,
        "Test checkout in a private window; note the exact error or hang point.",
        "Exclude cart/checkout/my-account from full-page cache.",
        "Check WooCommerce → Status for errors, webhooks and scheduled actions.",
        "Disable the last changed checkout plugin to isolate conflicts.",
      ],
      verifyNl: ["Testorder rondt af.", "Bevestigingsmail komt aan."],
      verifyEn: ["Test order completes.", "Confirmation email arrives."],
      pitfallsNl: ["Live betaalgateway testen zonder sandbox."],
      pitfallsEn: ["Testing a live payment gateway without sandbox."],
      tipNl: ["Houd WooCommerce, PHP en betaalplugin binnen ondersteunde combinaties."],
      tipEn: ["Keep WooCommerce, PHP and payment plugins on supported combinations."],
      warnNl: ["Cache op checkout kan dubbele orders of lege carts geven."],
      warnEn: ["Caching checkout can cause duplicate orders or empty carts."],
      relatedNl: "Cache, e-mail authenticatie, PHP-versie",
      relatedEn: "Cache, email authentication, PHP version",
      whyNl: () => "Shopfouten kosten omzet; isoleer checkout apart van blogplugins.",
      whyEn: () => "Shop failures cost revenue; isolate checkout from blog plugins.",
    },
    wp_generic: {
      angleNl: (s) =>
        `Voor “${s}” werk je in WordPress op TripleZero iT hosting: backup, gerichte wijziging in wp-admin of bestanden, daarna cache en controle.`,
      angleEn: (s) =>
        `For “${s}” you work in WordPress on TripleZero iT hosting: backup, targeted change in wp-admin or files, then cache and verify.`,
      prepNl: wpBasePrepNl,
      prepEn: wpBasePrepEn,
      stepsNl: (s) => [
        "Maak een Installatron- of panel-backup.",
        `Open wp-admin en lokaliseer het scherm dat bij “${s}” hoort (Instellingen, Plugins, Thema, Gebruikers, WooCommerce of Media).`,
        "Noteer de huidige waarde; pas alleen wat nodig is voor dit onderwerp aan.",
        "Als wp-admin faalt: gebruik DirectAdmin File Manager/SFTP voor plugins/thema of wp-config.",
        "Leeg page-/object-/CDN-cache.",
        "Test voorkant en het specifieke resultaat van deze taak.",
      ],
      stepsEn: (s) => [
        "Create an Installatron or panel backup.",
        `Open wp-admin and locate the screen that matches “${s}” (Settings, Plugins, Theme, Users, WooCommerce or Media).`,
        "Note the current value; change only what this topic needs.",
        "If wp-admin fails: use DirectAdmin File Manager/SFTP for plugins/theme or wp-config.",
        "Clear page/object/CDN cache.",
        "Test the front end and the specific outcome of this task.",
      ],
      verifyNl: [
        "Het specifieke gedrag van dit onderwerp klopt.",
        "Geen critical error.",
        "wp-admin blijft bereikbaar.",
      ],
      verifyEn: [
        "The specific behaviour for this topic is correct.",
        "No critical error.",
        "wp-admin stays reachable.",
      ],
      pitfallsNl: [
        "Wijzigingen doorvoeren zonder backup.",
        "Meerdere plugins/thema’s tegelijk aanpassen.",
        "Alleen browsercache legen.",
      ],
      pitfallsEn: [
        "Changing things without a backup.",
        "Changing multiple plugins/themes at once.",
        "Only clearing browser cache.",
      ],
      tipNl: ["Documenteer wat je wijzigde met tijdstip — handig bij rollback."],
      tipEn: ["Document what you changed with a timestamp — useful for rollback."],
      warnNl: ["Verwijder geen uploads of database-tabellen zonder restoreplan."],
      warnEn: ["Do not delete uploads or database tables without a restore plan."],
      relatedNl: "Installatron-backup, PHP-versie, critical error",
      relatedEn: "Installatron backup, PHP version, critical error",
      whyNl: (s) =>
        `“${s}” verdient een eigen werkwijze: eerst scope (wp-admin vs bestanden vs hosting), dan één wijziging, dan bewijs dat het werkt.`,
      whyEn: (s) =>
        `“${s}” deserves its own workflow: scope first (wp-admin vs files vs hosting), then one change, then proof it works.`,
    },
    dns_records: {
      angleNl: (s) =>
        `${s} doe je in één DNS-zone als bron van waarheid. Wijzig gericht recordtypes en verifieer extern.`,
      angleEn: (s) =>
        `${s} belongs in one DNS zone as source of truth. Change record types deliberately and verify externally.`,
      prepNl: [
        "Toegang tot DNS in klantenpanel of DirectAdmin Zone Editor.",
        "Screenshot/export van de huidige zone.",
        "Welk recordtype je nodig hebt (A, AAAA, CNAME, MX, TXT, NS).",
      ],
      prepEn: [
        "Access to DNS in the client panel or DirectAdmin Zone Editor.",
        "Screenshot/export of the current zone.",
        "Which record type you need (A, AAAA, CNAME, MX, TXT, NS).",
      ],
      stepsNl: (s) => [
        "Open DNS-beheer voor het juiste domein.",
        `Pas het record aan dat bij “${s}” hoort — raak andere records niet onnodig aan.`,
        "Controleer op duplicaten (twee A’s, conflicterende CNAME op hetzelfde label).",
        "Sla op; verlaag TTL alleen bij geplande cutovers.",
        "Verifieer met externe lookup en test site/mail.",
      ],
      stepsEn: (s) => [
        "Open DNS management for the correct domain.",
        `Change the record that matches “${s}” — do not touch unrelated records.`,
        "Check for duplicates (two A records, conflicting CNAME on the same label).",
        "Save; lower TTL only for planned cutovers.",
        "Verify with an external lookup and test site/mail.",
      ],
      verifyNl: ["Externe lookup toont de nieuwe waarde.", "Geen onverwachte mail-/site-uitval."],
      verifyEn: ["External lookup shows the new value.", "No unexpected mail/site outage."],
      pitfallsNl: ["CNAME op apex zonder ALIAS/ANAME.", "MX én web tegelijk wijzigen zonder plan."],
      pitfallsEn: ["CNAME on apex without ALIAS/ANAME.", "Changing MX and web at once without a plan."],
      tipNl: ["Wacht op TTL; ‘het werkt niet meteen’ is vaak propagatie."],
      tipEn: ["Respect TTL; ‘it does not work yet’ is often propagation."],
      warnNl: ["Nameserver-wijzigingen propagëren langer dan één record."],
      warnEn: ["Nameserver changes propagate longer than a single record."],
      relatedNl: "SPF, domein forward, SSL",
      relatedEn: "SPF, domain forward, SSL",
      whyNl: () => "DNS-fouten voelen als ‘hosting down’ terwijl de zone de oorzaak is.",
      whyEn: () => "DNS mistakes feel like ‘hosting down’ while the zone is the cause.",
    },
    dns_ns: {
      angleNl: (s) =>
        `${s} verplaatst de autoritatieve zone. Plan TTL, mail en web samen — dit is geen kleine recordwijziging.`,
      angleEn: (s) =>
        `${s} moves the authoritative zone. Plan TTL, mail and web together — this is not a small record edit.`,
      prepNl: ["Registrar-login", "Doel-nameservers", "Kopie van huidige zone"],
      prepEn: ["Registrar login", "Target nameservers", "Copy of current zone"],
      stepsNl: () => [
        "Kopieer alle records naar de nieuwe DNS-dienst vóór de NS-switch.",
        "Verlaag TTL op kritieke records 24u van tevoren indien mogelijk.",
        "Zet nameservers bij de registrar om.",
        "Monitor lookup tot de nieuwe zone overal zichtbaar is.",
        "Test web, mail en verificatie-TXT’s.",
      ],
      stepsEn: () => [
        "Copy all records to the new DNS service before the NS switch.",
        "Lower TTL on critical records 24h ahead when possible.",
        "Update nameservers at the registrar.",
        "Monitor lookups until the new zone is visible everywhere.",
        "Test web, mail and verification TXT records.",
      ],
      verifyNl: ["NS-lookup toont de nieuwe nameservers.", "MX en A kloppen nog."],
      verifyEn: ["NS lookup shows the new nameservers.", "MX and A still correct."],
      pitfallsNl: ["NS omzetten terwijl de nieuwe zone incompleet is."],
      pitfallsEn: ["Switching NS while the new zone is incomplete."],
      tipNl: ["Houd registrar-NS en zone-inhoud in één runbook."],
      tipEn: ["Keep registrar NS and zone contents in one runbook."],
      warnNl: ["Halverwege NS-migratie mail laten lopen zonder MX-check is riskant."],
      warnEn: ["Running mail mid NS-migration without MX checks is risky."],
      relatedNl: "DNS records, domeintransfer",
      relatedEn: "DNS records, domain transfer",
      whyNl: () => "NS bepaalt wélke zone telt — niet welk A-record je net typte.",
      whyEn: () => "NS decides which zone counts — not which A record you just typed.",
    },
    dns_forward: {
      angleNl: (s) =>
        `${s} kan via DNS/forwarding in het panel of via webserver-redirect. Kies één mechanisme.`,
      angleEn: (s) =>
        `${s} can use panel DNS/forwarding or a webserver redirect. Pick one mechanism.`,
      prepNl: ["Doel-URL", "Of www én apex moeten meegenomen worden"],
      prepEn: ["Target URL", "Whether www and apex both need to follow"],
      stepsNl: (s) => [
        `Bepaal of je een panel-forward of een hosting-redirect (.htaccess/nginx) nodig hebt voor “${s}”.`,
        "Stel 301 in voor permanente verhuizing, 302 voor tijdelijk.",
        "Dek apex en www af om split traffic te voorkomen.",
        "Test met curl -I of browser DevTools op de Location-header.",
        "Controleer dat SSL op bron én doel geen waarschuwing geeft.",
      ],
      stepsEn: (s) => [
        `Decide whether you need a panel forward or a hosting redirect (.htaccess/nginx) for “${s}”.`,
        "Use 301 for permanent moves, 302 for temporary.",
        "Cover apex and www to avoid split traffic.",
        "Test with curl -I or browser DevTools on the Location header.",
        "Confirm SSL on source and target shows no warning.",
      ],
      verifyNl: ["Browser landt op de doel-URL.", "Geen redirect-loop."],
      verifyEn: ["Browser lands on the target URL.", "No redirect loop."],
      pitfallsNl: ["Forward + conflicterend A-record tegelijk."],
      pitfallsEn: ["Forward plus a conflicting A record at the same time."],
      tipNl: ["Voor SEO: 301 en dezelfde path-mapping waar mogelijk."],
      tipEn: ["For SEO: 301 and same path mapping where possible."],
      warnNl: ["E-mail volgt geen HTTP-forward — MX blijft apart."],
      warnEn: ["Email does not follow HTTP forwards — MX stays separate."],
      relatedNl: "DNS A-record, SSL, WordPress URL",
      relatedEn: "DNS A record, SSL, WordPress URL",
      whyNl: () => "Dubbele redirectmechanismen veroorzaken loops.",
      whyEn: () => "Duplicate redirect mechanisms cause loops.",
    },
    dns_whois: {
      angleNl: (s) =>
        `${s} speelt bij de registrar/SIDN-kant: WHOIS, auth-codes, quarantaine of transfers — niet in wp-admin.`,
      angleEn: (s) =>
        `${s} lives on the registrar/SIDN side: WHOIS, auth codes, quarantine or transfers — not in wp-admin.`,
      prepNl: ["Klantenpanel-login", "Domeinnaam exact", "Eventuele legitimatie"],
      prepEn: ["Client panel login", "Exact domain name", "Any identity verification"],
      stepsNl: (s) => [
        "Log in op het TripleZero iT klantenpanel → Domeinen.",
        `Open het domein en zoek de actie die bij “${s}” past (WHOIS, auth/EPP-code, transferlock, contacten).`,
        "Voer de wijziging door en bevestig eventuele e-mailverificatie.",
        "Wacht op verwerking bij de registry; forceer geen dubbele requests.",
        "Controleer WHOIS/status tot de nieuwe staat zichtbaar is.",
      ],
      stepsEn: (s) => [
        "Sign in to the TripleZero iT client panel → Domains.",
        `Open the domain and find the action that matches “${s}” (WHOIS, auth/EPP code, transfer lock, contacts).`,
        "Apply the change and confirm any email verification.",
        "Wait for registry processing; do not spam duplicate requests.",
        "Check WHOIS/status until the new state is visible.",
      ],
      verifyNl: ["WHOIS/status toont de verwachte waarde.", "Bevestigingsmail bewaard."],
      verifyEn: ["WHOIS/status shows the expected value.", "Confirmation email kept."],
      pitfallsNl: ["Auth-code delen via onveilige kanalen."],
      pitfallsEn: ["Sharing auth codes over insecure channels."],
      tipNl: ["Zet transferlock weer aan na een geslaagde transfer."],
      tipEn: ["Re-enable transfer lock after a successful transfer."],
      warnNl: ["Quarantaine/.nl-regels hebben vaste wachttijden — support kan die niet inkorten."],
      warnEn: ["Quarantine/.nl rules have fixed waiting times — support cannot shorten them."],
      relatedNl: "Domeintransfer, DNS nameservers",
      relatedEn: "Domain transfer, DNS nameservers",
      whyNl: () => "Registry-status overrulet wat je in hosting zet.",
      whyEn: () => "Registry status overrides what you set in hosting.",
    },
    email_client: {
      angleNl: (s) =>
        `${s} los je op door webmail te vergelijken met de client: werkt webmail, dan ligt het aan IMAP/SMTP-instellingen.`,
      angleEn: (s) =>
        `${s} is solved by comparing webmail to the client: if webmail works, fix IMAP/SMTP settings.`,
      prepNl: ["Mailbox + wachtwoord", "Juiste hostnames/poorten", "Webmail-URL"],
      prepEn: ["Mailbox + password", "Correct hostnames/ports", "Webmail URL"],
      stepsNl: (s) => [
        `Log in op webmail met dezelfde mailbox als in “${s}”.`,
        "Werkt webmail: configureer de client opnieuw (IMAP in, SMTP uit, SSL/TLS).",
        "Gebruik het volledige e-mailadres als gebruikersnaam.",
        "Controleer of een VPN/firewall poort 993/465/587 blokkeert.",
        "Verstuur een test naar een extern adres en bekijk of het aankomt.",
      ],
      stepsEn: (s) => [
        `Sign in to webmail with the same mailbox as in “${s}”.`,
        "If webmail works: reconfigure the client (IMAP in, SMTP out, SSL/TLS).",
        "Use the full email address as username.",
        "Check whether a VPN/firewall blocks ports 993/465/587.",
        "Send a test to an external address and confirm delivery.",
      ],
      verifyNl: ["Ontvangen en verzenden werkt in de client.", "Geen herhaalde wachtwoordprompts."],
      verifyEn: ["Receive and send work in the client.", "No repeated password prompts."],
      pitfallsNl: ["Oude POP-profielen die mail van de server wissen."],
      pitfallsEn: ["Old POP profiles that delete mail from the server."],
      tipNl: ["Bij twijfel: nieuw profiel aanmaken i.p.v. eindeloos te patchen."],
      tipEn: ["When unsure: create a new profile instead of endless patching."],
      warnNl: ["Deel mailboxwachtwoorden niet in screenshots van tickets."],
      warnEn: ["Do not share mailbox passwords in ticket screenshots."],
      relatedNl: "Webmail, SPF/DKIM, app-wachtwoorden",
      relatedEn: "Webmail, SPF/DKIM, app passwords",
      whyNl: () => "Clientfouten lijken op serverstoringen tot webmail bewijst van niet.",
      whyEn: () => "Client faults look like server outages until webmail proves otherwise.",
    },
    email_auth: {
      angleNl: (s) =>
        `${s} hoort in DNS (TXT): één SPF, DKIM-selectors en DMARC-policy. Meer SPF-records breken authenticatie.`,
      angleEn: (s) =>
        `${s} belongs in DNS (TXT): one SPF, DKIM selectors and DMARC policy. Multiple SPF records break authentication.`,
      prepNl: ["DNS-toegang", "Lijst van legitieme verzendbronnen"],
      prepEn: ["DNS access", "List of legitimate sending sources"],
      stepsNl: (s) => [
        "Inventariseer alle diensten die namens het domein mailen (hosting, Microsoft, ESP).",
        `Publiceer of corrigeer het DNS-record voor “${s}” volgens de huidige syntax.`,
        "Zorg voor maximaal één SPF TXT op @.",
        "Wacht op propagatie; test met headeranalyse van een ontvangen mail.",
        "Verhoog DMARC pas van none → quarantine/reject als de rapporten schoon zijn.",
      ],
      stepsEn: (s) => [
        "Inventory every service that sends for the domain (hosting, Microsoft, ESP).",
        `Publish or fix the DNS record for “${s}” with current syntax.`,
        "Keep at most one SPF TXT on @.",
        "Wait for propagation; test with header analysis on a received message.",
        "Raise DMARC from none → quarantine/reject only when reports are clean.",
      ],
      verifyNl: ["Auth=pass in headers.", "Geen dubbele SPF."],
      verifyEn: ["Auth=pass in headers.", "No duplicate SPF."],
      pitfallsNl: ["Losse SPF per tool i.p.v. include: samenvoegen."],
      pitfallsEn: ["Separate SPF per tool instead of merging includes."],
      tipNl: ["Begin DMARC op p=none met rua-rapportage."],
      tipEn: ["Start DMARC at p=none with rua reporting."],
      warnNl: ["DMARC reject zonder DKIM/SPF-dekking stopt legitieme mail."],
      warnEn: ["DMARC reject without SPF/DKIM coverage stops legitimate mail."],
      relatedNl: "DNS TXT, Microsoft 365, spamklachten",
      relatedEn: "DNS TXT, Microsoft 365, spam complaints",
      whyNl: () => "Zonder auth belanden berichten in spam of worden geweigerd.",
      whyEn: () => "Without auth, messages land in spam or get rejected.",
    },
    email_webmail: {
      angleNl: (s) =>
        `${s} gebruikt de webmail-URL uit je welkomstmail. Werkt dit niet, check mailboxstatus en wachtwoordreset in het panel.`,
      angleEn: (s) =>
        `${s} uses the webmail URL from your welcome email. If it fails, check mailbox status and password reset in the panel.`,
      prepNl: ["Webmail-URL", "Mailboxadres", "Panel-login"],
      prepEn: ["Webmail URL", "Mailbox address", "Panel login"],
      stepsNl: () => [
        "Open de webmail-URL (niet een willekeurige /webmail op een ander domein).",
        "Log in met volledig adres + wachtwoord.",
        "Faalt login: reset wachtwoord in DirectAdmin → Email Accounts.",
        "Controleer schijfquota van de mailbox.",
        "Test map Inbox/Sent en een externe testmail.",
      ],
      stepsEn: () => [
        "Open the webmail URL (not a random /webmail on another domain).",
        "Sign in with full address + password.",
        "If login fails: reset password in DirectAdmin → Email Accounts.",
        "Check mailbox disk quota.",
        "Test Inbox/Sent and an external test message.",
      ],
      verifyNl: ["Webmail opent Inbox.", "Verzenden werkt."],
      verifyEn: ["Webmail opens Inbox.", "Sending works."],
      pitfallsNl: ["Verkeerde serverkeuze bij multi-hosting."],
      pitfallsEn: ["Wrong server choice on multi-host setups."],
      tipNl: ["Bookmark de juiste webmail-URL per merk/host."],
      tipEn: ["Bookmark the correct webmail URL per brand/host."],
      warnNl: ["Publieke computers: altijd uitloggen."],
      warnEn: ["Public computers: always sign out."],
      relatedNl: "Mailbox aanmaken, clientinstellingen",
      relatedEn: "Create mailbox, client settings",
      whyNl: () => "Webmail is de snelle waarheidstest voor mailboxproblemen.",
      whyEn: () => "Webmail is the fast truth test for mailbox problems.",
    },
    email_deliver: {
      angleNl: (s) =>
        `${s} vraagt om bouncecodes, spamfolders, blacklists en auth-headers — niet alleen ‘opnieuw versturen’.`,
      angleEn: (s) =>
        `${s} needs bounce codes, spam folders, blacklists and auth headers — not only ‘send again’.`,
      prepNl: ["Voorbeeldbericht + headers", "Ontvangend adres"],
      prepEn: ["Sample message + headers", "Receiving address"],
      stepsNl: (s) => [
        `Bepaal of het niet aankomt, in spam belandt, of een bounce teruggeeft voor “${s}”.`,
        "Check SPF/DKIM/DMARC van het verzenddomein.",
        "Bekijk of de inhoud URL-shorteners of bijlagen triggert.",
        "Test naar meerdere providers (Microsoft, Gmail).",
        "Bij blokkade: noteer SMTP-foutcode in het ticket.",
      ],
      stepsEn: (s) => [
        `Decide whether mail is missing, in spam, or bouncing for “${s}”.`,
        "Check SPF/DKIM/DMARC of the sending domain.",
        "See whether content triggers URL shorteners or attachment filters.",
        "Test against multiple providers (Microsoft, Gmail).",
        "On blocks: note the SMTP error code in the ticket.",
      ],
      verifyNl: ["Mail komt aan in Inbox op een externe mailbox.", "Auth pass."],
      verifyEn: ["Mail arrives in Inbox on an external mailbox.", "Auth pass."],
      pitfallsNl: ["Alleen intern naar dezelfde server testen."],
      pitfallsEn: ["Only testing internally to the same server."],
      tipNl: ["Bewaar volledige headers — support heeft die nodig."],
      tipEn: ["Keep full headers — support needs them."],
      warnNl: ["Gekochte mailinglijsten zonder opt-in schaden de reputatie van het hele IP."],
      warnEn: ["Bought mailing lists without opt-in damage the whole IP reputation."],
      relatedNl: "SPF, DKIM, DMARC, webmail",
      relatedEn: "SPF, DKIM, DMARC, webmail",
      whyNl: () => "Deliverability is reputatie + auth + inhoud.",
      whyEn: () => "Deliverability is reputation + auth + content.",
    },
    email_ooo: {
      angleNl: (s) =>
        `${s} stel je in per mailbox (DirectAdmin Autoresponders of webmail-filters), met start/einddatum en een heldere tekst.`,
      angleEn: (s) =>
        `${s} is set per mailbox (DirectAdmin Autoresponders or webmail filters), with start/end dates and clear copy.`,
      prepNl: ["DirectAdmin- of webmail-login", "Tekst voor het antwoord", "Periode"],
      prepEn: ["DirectAdmin or webmail login", "Reply text", "Date range"],
      stepsNl: (s) => [
        "Log in op DirectAdmin → E-mail Accounts / Autoresponders (of webmail → Filters).",
        `Selecteer de mailbox waar “${s}” voor bedoeld is.`,
        "Schakel autoresponder in; plak onderwerp + body; zet start- en einddatum.",
        "Stuur een testmail vanaf een extern adres en controleer of één antwoord terugkomt.",
        "Zet na afloop de responder uit of laat de einddatum verlopen.",
      ],
      stepsEn: (s) => [
        "Sign in to DirectAdmin → Email Accounts / Autoresponders (or webmail → Filters).",
        `Select the mailbox “${s}” is meant for.`,
        "Enable the autoresponder; paste subject + body; set start and end dates.",
        "Send a test from an external address and confirm one reply comes back.",
        "Disable the responder afterwards or let the end date expire.",
      ],
      verifyNl: [
        "Externe test krijgt precies één auto-reply.",
        "Geen reply-loops met andere autoresponders.",
      ],
      verifyEn: [
        "External test gets exactly one auto-reply.",
        "No reply loops with other autoresponders.",
      ],
      pitfallsNl: ["Responder op catch-all zonder limiet → spamstorm."],
      pitfallsEn: ["Responder on catch-all without limits → spam storm."],
      tipNl: ["Vermeld een alternatief contact in de tekst."],
      tipEn: ["Include an alternate contact in the text."],
      warnNl: ["Autoresponders op gedeelde postvakken kunnen vertrouwelijke info lekken."],
      warnEn: ["Autoresponders on shared mailboxes can leak confidential info."],
      relatedNl: "Webmail, mailbox aanmaken, filters",
      relatedEn: "Webmail, create mailbox, filters",
      whyNl: () => "Out-of-office hoort bij de mailbox, niet bij DNS of WordPress.",
      whyEn: () => "Out-of-office belongs to the mailbox, not DNS or WordPress.",
    },
    email_catchall: {
      angleNl: (s) =>
        `${s} vangt adressen die niet bestaan op één mailbox. Handig voor migraties; riskant voor spam.`,
      angleEn: (s) =>
        `${s} catches addresses that do not exist into one mailbox. Useful for migrations; risky for spam.`,
      prepNl: ["DirectAdmin-login", "Doelmailbox die de catch-all ontvangt"],
      prepEn: ["DirectAdmin login", "Target mailbox that receives the catch-all"],
      stepsNl: (s) => [
        "Open DirectAdmin → Catch-All / Default Address voor het domein.",
        `Kies ‘naar mailbox sturen’ of fail/blackhole — afhankelijk van wat “${s}” moet doen.`,
        "Wijs een bestaande mailbox aan als je wilt ontvangen.",
        "Test met een verzonnen lokaal deel (nietbestaand@domein).",
        "Monitor spamvolume de eerste dagen.",
      ],
      stepsEn: (s) => [
        "Open DirectAdmin → Catch-All / Default Address for the domain.",
        `Choose ‘send to mailbox’ or fail/blackhole — depending on what “${s}” should do.`,
        "Point to an existing mailbox if you want to receive mail.",
        "Test with a made-up local part (nosuchuser@domain).",
        "Monitor spam volume for the first days.",
      ],
      verifyNl: ["Testadres landt waar je verwacht.", "Bestaande mailboxen blijven onaangetast."],
      verifyEn: ["Test address lands where you expect.", "Existing mailboxes stay unaffected."],
      pitfallsNl: ["Catch-all + open formulieren = spamhoek."],
      pitfallsEn: ["Catch-all + open forms = spam magnet."],
      tipNl: ["Zet catch-all uit zodra migratiealiases klaar zijn."],
      tipEn: ["Disable catch-all once migration aliases are done."],
      warnNl: ["Catch-all is geen vervanging voor echte mailboxen met sterke wachtwoorden."],
      warnEn: ["Catch-all is not a substitute for real mailboxes with strong passwords."],
      relatedNl: "Mailbox aanmaken, spamfilters, DNS MX",
      relatedEn: "Create mailbox, spam filters, DNS MX",
      whyNl: () => "Catch-all is een tijdelijk vangnet, geen permanente architectuur.",
      whyEn: () => "Catch-all is a temporary net, not permanent architecture.",
    },
    email_create: {
      angleNl: (s) =>
        `${s}: nieuw adres per domein in DirectAdmin E-mail Accounts, met eigen wachtwoord en quota.`,
      angleEn: (s) =>
        `${s}: new address per domain in DirectAdmin Email Accounts, with its own password and quota.`,
      prepNl: ["DirectAdmin-login", "Gewenst lokaal deel", "Sterk wachtwoord"],
      prepEn: ["DirectAdmin login", "Desired local part", "Strong password"],
      stepsNl: (s) => [
        "Log in op DirectAdmin en selecteer het domein.",
        "Open E-mail Accounts → Create Account.",
        `Stel het adres in voor “${s}”, kies wachtwoord en quota.`,
        "Sla op en open webmail met volledig adres + mailboxwachtwoord.",
        "Deel IMAP/SMTP-gegevens met de gebruiker via een veilig kanaal.",
      ],
      stepsEn: (s) => [
        "Sign in to DirectAdmin and select the domain.",
        "Open Email Accounts → Create Account.",
        `Configure the address for “${s}”, choose password and quota.`,
        "Save and open webmail with full address + mailbox password.",
        "Share IMAP/SMTP details with the user over a safe channel.",
      ],
      verifyNl: ["Webmail login lukt.", "Quota zichtbaar in de accountslijst."],
      verifyEn: ["Webmail login works.", "Quota visible in the accounts list."],
      pitfallsNl: ["Panelwachtwoord gebruiken i.p.v. mailboxwachtwoord."],
      pitfallsEn: ["Using the panel password instead of the mailbox password."],
      tipNl: ["Eén mailbox per persoon — makkelijker bij offboarding."],
      tipEn: ["One mailbox per person — easier when offboarding."],
      warnNl: ["Zet geen zwakke wachtwoorden op adressen die facturen ontvangen."],
      warnEn: ["Do not put weak passwords on addresses that receive invoices."],
      relatedNl: "Webmail, clientinstellingen, quota",
      relatedEn: "Webmail, client settings, quota",
      whyNl: () => "Een echte mailbox is beheerbaar; aliases en catch-all zijn aanvullingen.",
      whyEn: () => "A real mailbox is manageable; aliases and catch-all are add-ons.",
    },
    email_signature: {
      angleNl: (s) =>
        `${s} hoort in webmail (identiteit/handtekening) of in de desktopclient — niet in DNS.`,
      angleEn: (s) =>
        `${s} belongs in webmail (identity/signature) or the desktop client — not in DNS.`,
      prepNl: ["Webmail- of clientlogin", "Tekst/HTML voor de handtekening"],
      prepEn: ["Webmail or client login", "Text/HTML for the signature"],
      stepsNl: (s) => [
        "Open webmail (Roundcube/Webmail Pro) of je mailclient.",
        `Ga naar Instellingen → Identiteiten / Handtekening voor “${s}”.`,
        "Plak tekst of eenvoudige HTML; vermijd zware tracking-pixels.",
        "Sla op en stuur een testmail naar een extern adres.",
        "Controleer of de handtekening op antwoorden én nieuwe berichten staat zoals bedoeld.",
      ],
      stepsEn: (s) => [
        "Open webmail (Roundcube/Webmail Pro) or your mail client.",
        `Go to Settings → Identities / Signature for “${s}”.`,
        "Paste text or light HTML; avoid heavy tracking pixels.",
        "Save and send a test to an external address.",
        "Confirm the signature appears on replies and new messages as intended.",
      ],
      verifyNl: ["Handtekening zichtbaar in ontvangen test.", "Geen kapotte afbeeldingen."],
      verifyEn: ["Signature visible in received test.", "No broken images."],
      pitfallsNl: ["Alleen in Outlook zetten terwijl collega’s webmail gebruiken."],
      pitfallsEn: ["Setting it only in Outlook while colleagues use webmail."],
      tipNl: ["Houd juridische voetregels kort — lange disclaimers raken in spamfilters."],
      tipEn: ["Keep legal footers short — long disclaimers trip spam filters."],
      warnNl: ["Host handtekeningafbeeldingen op https van je eigen domein."],
      warnEn: ["Host signature images on https from your own domain."],
      relatedNl: "Webmail, clientinstellingen, deliverability",
      relatedEn: "Webmail, client settings, deliverability",
      whyNl: () => "Handtekeningen zijn client/webmail-voorkeuren per identiteit.",
      whyEn: () => "Signatures are per-identity client/webmail preferences.",
    },
    ftp_files: {
      angleNl: (s) =>
        `${s}: verbind via FTP/FTPS/SFTP met een beperkt account en de juiste home-map — nooit 777 ‘om het te fixen’.`,
      angleEn: (s) =>
        `${s}: connect via FTP/FTPS/SFTP with a limited account and the correct home folder — never 777 ‘to make it work’.`,
      prepNl: [
        "FTP-user of SFTP-login",
        "Host/poort uit welkomstmail",
        "FileZilla of Cyberduck",
      ],
      prepEn: [
        "FTP user or SFTP login",
        "Host/port from welcome email",
        "FileZilla or Cyberduck",
      ],
      stepsNl: (s) => [
        `Open DirectAdmin → FTP Management; maak of noteer het account voor “${s}”.`,
        "Beperk de directory tot de bedoelde webroot.",
        "Verbind in FileZilla met FTPS/SFTP; accepteer alleen het verwachte certificaat/hostkey.",
        "Als ‘mappenlijst mislukt’: check encryption-modus, poort, passieve mode en firewall.",
        "Upload een klein testbestand en open het via HTTP om het pad te bevestigen.",
      ],
      stepsEn: (s) => [
        `Open DirectAdmin → FTP Management; create or note the account for “${s}”.`,
        "Limit the directory to the intended web root.",
        "Connect in FileZilla with FTPS/SFTP; accept only the expected certificate/host key.",
        "If ‘directory listing failed’: check encryption mode, port, passive mode and firewall.",
        "Upload a small test file and open it via HTTP to confirm the path.",
      ],
      verifyNl: ["Verbinding stabiel.", "Testbestand zichtbaar op de verwachte URL."],
      verifyEn: ["Connection stable.", "Test file visible on the expected URL."],
      pitfallsNl: [
        "Plain FTP op openbare wifi.",
        "Verkeerde home-map → uploads in een andere site.",
      ],
      pitfallsEn: [
        "Plain FTP on public Wi-Fi.",
        "Wrong home folder → uploads into another site.",
      ],
      tipNl: ["SFTP (SSH) is vaak stabieler dan FTP+passief achter captive portals."],
      tipEn: ["SFTP (SSH) is often more stable than FTP+passive behind captive portals."],
      warnNl: ["Deel geen FTP-wachtwoorden in tickets langer dan nodig."],
      warnEn: ["Do not leave FTP passwords in tickets longer than needed."],
      relatedNl: "File Manager, CHMOD, SFTP",
      relatedEn: "File Manager, CHMOD, SFTP",
      whyNl: () =>
        "FTP-problemen zijn bijna altijd protocol, pad of rechten — niet ‘kapotte hosting’.",
      whyEn: () =>
        "FTP issues are almost always protocol, path or permissions — not ‘broken hosting’.",
    },
    php_version: {
      angleNl: (s) =>
        `${s}: PHP kies je per domein. Te oud = security warnings; te nieuw = pluginbreaks. Eén versie per keer.`,
      angleEn: (s) =>
        `${s}: PHP is chosen per domain. Too old = security warnings; too new = plugin breaks. One version at a time.`,
      prepNl: ["Backup", "Welke PHP de app officieel steunt"],
      prepEn: ["Backup", "Which PHP the app officially supports"],
      stepsNl: (s) => [
        "Maak een backup als de site kritiek is.",
        `Open DirectAdmin (of CyberPanel/Plesk) PHP-selector voor het domein van “${s}”.`,
        "Kies de doelversie; sla op.",
        "Purge caches; test homepage, wp-admin, forms/checkout.",
        "Bij fatals: één versie terug en isoleer de plugin/thema die faalt.",
      ],
      stepsEn: (s) => [
        "Create a backup if the site is critical.",
        `Open DirectAdmin (or CyberPanel/Plesk) PHP selector for the domain of “${s}”.`,
        "Pick the target version; save.",
        "Purge caches; test homepage, wp-admin, forms/checkout.",
        "On fatals: step one version back and isolate the failing plugin/theme.",
      ],
      verifyNl: ["phpinfo of panel toont de nieuwe versie.", "Geen critical error."],
      verifyEn: ["phpinfo or panel shows the new version.", "No critical error."],
      pitfallsNl: ["PHP-upgrade combineren met bulk plugin-updates."],
      pitfallsEn: ["Combining a PHP upgrade with bulk plugin updates."],
      tipNl: ["Noteer de vorige versie in je ticket/changelog."],
      tipEn: ["Note the previous version in your ticket/changelog."],
      warnNl: ["EOL PHP-versies horen niet op productie."],
      warnEn: ["EOL PHP versions do not belong in production."],
      relatedNl: "WordPress critical error, backups, plugins",
      relatedEn: "WordPress critical error, backups, plugins",
      whyNl: () => "PHP is de runtime van je site — verkeerde versie voelt als ‘random fatals’.",
      whyEn: () => "PHP is your site runtime — the wrong version feels like ‘random fatals’.",
    },
    backup_restore: {
      angleNl: (s) =>
        `${s}: kies scope (files/DB/mail), label de set, en herstel selectief. Overwrite zonder plan is het grootste risico.`,
      angleEn: (s) =>
        `${s}: pick scope (files/DB/mail), label the set, and restore selectively. Overwrite without a plan is the biggest risk.`,
      prepNl: [
        "DirectAdmin/JetBackup/Installatron-toegang",
        "Welke datum/scope je nodig hebt",
      ],
      prepEn: [
        "DirectAdmin/JetBackup/Installatron access",
        "Which date/scope you need",
      ],
      stepsNl: (s) => [
        `Bepaal of “${s}” een nieuwe backup, een controle of een restore vraagt.`,
        "Maak of selecteer de set (home, DB, mail, cron, DNS).",
        "Bij restore: eerst files of eerst DB — niet alles blind als alleen één laag stuk is.",
        "Test site en mail na afloop.",
        "Houd retentie en schijfquota in de gaten.",
      ],
      stepsEn: (s) => [
        `Decide whether “${s}” needs a new backup, a check, or a restore.`,
        "Create or select the set (home, DB, mail, cron, DNS).",
        "On restore: files first or DB first — not everything blindly if only one layer is broken.",
        "Test site and mail afterwards.",
        "Watch retention and disk quota.",
      ],
      verifyNl: ["Set staat in de lijst of restore is geverifieerd op de live URL."],
      verifyEn: ["Set appears in the list or restore is verified on the live URL."],
      pitfallsNl: ["Week-oude backup over verse webshoporders heen zetten."],
      pitfallsEn: ["Restoring a week-old backup over fresh shop orders."],
      tipNl: ["Extra export downloaden vóór riskante restores."],
      tipEn: ["Download an extra export before risky restores."],
      warnNl: ["Geïnfecteerde backups opnieuw inzetten herintroduceert malware."],
      warnEn: ["Re-applying infected backups reintroduces malware."],
      relatedNl: "Installatron-backup, schijfgebruik, migratie",
      relatedEn: "Installatron backup, disk usage, migration",
      whyNl: () => "Backup zonder restoretest is een aanname, geen verzekering.",
      whyEn: () => "A backup without a restore test is an assumption, not insurance.",
    },
    da_domain: {
      angleNl: (s) =>
        `${s} regel je in DirectAdmin op het juiste gebruikersaccount: domein toevoegen, DNS en document root.`,
      angleEn: (s) =>
        `${s} is handled in DirectAdmin on the correct user account: add domain, DNS and document root.`,
      prepNl: ["DirectAdmin-login", "Domein dat naar de server wijst of gaat wijzen"],
      prepEn: ["DirectAdmin login", "Domain pointing or about to point to the server"],
      stepsNl: (s) => [
        "Log in op DirectAdmin en selecteer het juiste account.",
        `Open Domain Setup / Domain Pointers / Subdomain — wat bij “${s}” past.`,
        "Voeg toe of corrigeer; controleer document root.",
        "Wijs DNS A/AAAA of nameservers correct.",
        "Vraag SSL aan zodra DNS klopt; test de site.",
      ],
      stepsEn: (s) => [
        "Sign in to DirectAdmin and select the correct account.",
        `Open Domain Setup / Domain Pointers / Subdomain — whichever matches “${s}”.`,
        "Add or fix; verify the document root.",
        "Point DNS A/AAAA or nameservers correctly.",
        "Request SSL once DNS is correct; test the site.",
      ],
      verifyNl: ["Domein staat in de lijst.", "HTTP(S) bereikt de bedoelde map."],
      verifyEn: ["Domain appears in the list.", "HTTP(S) hits the intended folder."],
      pitfallsNl: ["Domein onder verkeerd reseller/user aanmaken."],
      pitfallsEn: ["Creating the domain under the wrong reseller/user."],
      tipNl: ["Noteer document root vóór je SSL forceert."],
      tipEn: ["Note the document root before forcing SSL."],
      warnNl: ["Pointers vs aparte domeinen gedragen zich anders bij mail."],
      warnEn: ["Pointers vs separate domains behave differently for mail."],
      relatedNl: "SSL, DNS A-record, Installatron",
      relatedEn: "SSL, DNS A record, Installatron",
      whyNl: () => "Zonder domein in DA bestaat er geen webroot of SSL-target.",
      whyEn: () => "Without the domain in DA there is no webroot or SSL target.",
    },
    da_ssl: {
      angleNl: (s) =>
        `${s} vereist kloppende DNS vóór Let’s Encrypt, daarna pas force-HTTPS.`,
      angleEn: (s) =>
        `${s} needs correct DNS before Let’s Encrypt, and only then force-HTTPS.`,
      prepNl: ["A/AAAA naar deze hosting", "DirectAdmin SSL-module"],
      prepEn: ["A/AAAA to this hosting", "DirectAdmin SSL module"],
      stepsNl: () => [
        "Controleer DNS A/AAAA.",
        "Open SSL Certificates / Let’s Encrypt; selecteer domein (+ www).",
        "Vraag aan en wacht op ‘valid’.",
        "Forceer HTTPS pas daarna.",
        "Test in privévenster.",
      ],
      stepsEn: () => [
        "Verify DNS A/AAAA.",
        "Open SSL Certificates / Let’s Encrypt; select domain (+ www).",
        "Request and wait for ‘valid’.",
        "Force HTTPS only after that.",
        "Test in a private window.",
      ],
      verifyNl: ["Hangslot actief.", "Geen cert-naam mismatch."],
      verifyEn: ["Padlock active.", "No certificate name mismatch."],
      pitfallsNl: ["HTTPS forceren zonder certificaat."],
      pitfallsEn: ["Forcing HTTPS without a certificate."],
      tipNl: ["Dek www en apex in één certificaat af."],
      tipEn: ["Cover www and apex in one certificate."],
      warnNl: ["CDN-SSL apart controleren als je proxyt."],
      warnEn: ["Check CDN SSL separately if you proxy."],
      relatedNl: "DNS, WordPress HTTPS, mixed content",
      relatedEn: "DNS, WordPress HTTPS, mixed content",
      whyNl: () => "LE faalt bijna altijd op DNS of rate limits — niet op ‘kapotte hosting’.",
      whyEn: () => "LE almost always fails on DNS or rate limits — not ‘broken hosting’.",
    },
    da_files: {
      angleNl: (s) =>
        `${s} doe je via File Manager of SFTP. Rechten, paden en backups bepalen of uploads veilig zijn.`,
      angleEn: (s) =>
        `${s} is done via File Manager or SFTP. Permissions, paths and backups decide whether uploads are safe.`,
      prepNl: ["DirectAdmin of SFTP-login", "Pad naar de site (domains/…/public_html)"],
      prepEn: ["DirectAdmin or SFTP login", "Path to the site (domains/…/public_html)"],
      stepsNl: (s) => [
        "Open File Manager of verbind via SFTP.",
        `Navigeer naar de map die bij “${s}” hoort; wijzig niets buiten die scope.`,
        "Upload/hernoem/verwijder met een lokale kopie als backup.",
        "Zet rechten niet op 777 ‘voor de zekerheid’.",
        "Test de URL die de file serveert.",
      ],
      stepsEn: (s) => [
        "Open File Manager or connect via SFTP.",
        `Navigate to the folder for “${s}”; change nothing outside that scope.`,
        "Upload/rename/delete with a local backup copy.",
        "Do not set permissions to 777 ‘just in case’.",
        "Test the URL that serves the file.",
      ],
      verifyNl: ["Bestand bereikbaar of bewust verwijderd.", "Site nog intact."],
      verifyEn: ["File reachable or intentionally removed.", "Site still intact."],
      pitfallsNl: ["public_html van het verkeerde domein bewerken."],
      pitfallsEn: ["Editing public_html of the wrong domain."],
      tipNl: ["SFTP is stabieler dan browser-upload voor grote zips."],
      tipEn: ["SFTP is more stable than browser upload for large zips."],
      warnNl: ["rm -rf of mass-delete zonder listing eerst."],
      warnEn: ["rm -rf or mass-delete without listing first."],
      relatedNl: "Backups, WordPress file access, rechten",
      relatedEn: "Backups, WordPress file access, permissions",
      whyNl: () => "Bestandsfouten zijn meteen zichtbaar als 404 of blank pages.",
      whyEn: () => "File mistakes show up immediately as 404s or blank pages.",
    },
    da_db: {
      angleNl: (s) =>
        `${s} combineert MySQL-gebruiker, database en privileges. wp-config moet exact matchen.`,
      angleEn: (s) =>
        `${s} combines MySQL user, database and privileges. wp-config must match exactly.`,
      prepNl: ["DirectAdmin MySQL-module", "Notitie van DB-naam/user"],
      prepEn: ["DirectAdmin MySQL module", "Note of DB name/user"],
      stepsNl: (s) => [
        "Open MySQL Management in DirectAdmin.",
        `Maak of pas database/user aan voor “${s}”.`,
        "Koppel user met alle privileges op die database.",
        "Werk wp-config.php of app-config bij.",
        "Test met phpMyAdmin of de applicatie-login.",
      ],
      stepsEn: (s) => [
        "Open MySQL Management in DirectAdmin.",
        `Create or adjust database/user for “${s}”.`,
        "Grant the user all privileges on that database.",
        "Update wp-config.php or app config.",
        "Test with phpMyAdmin or the application login.",
      ],
      verifyNl: ["App verbindt zonder DB-fout.", "User ziet alleen de bedoelde DB."],
      verifyEn: ["App connects without DB error.", "User only sees the intended DB."],
      pitfallsNl: ["User aanmaken zonder privileges op de DB."],
      pitfallsEn: ["Creating a user without privileges on the DB."],
      tipNl: ["Gebruik unieke DB-wachtwoorden per site."],
      tipEn: ["Use unique DB passwords per site."],
      warnNl: ["Drop database is onomkeerbaar zonder backup."],
      warnEn: ["Drop database is irreversible without a backup."],
      relatedNl: "phpMyAdmin, WordPress migratie, backups",
      relatedEn: "phpMyAdmin, WordPress migration, backups",
      whyNl: () => "DB-mismatch is de klassieke ‘Error establishing a database connection’.",
      whyEn: () => "DB mismatch is the classic ‘Error establishing a database connection’.",
    },
    cp_login: {
      angleNl: (s) =>
        `${s}: gebruik de CyberPanel-URL en credentials uit de welkomstmail (poort 8090 tenzij anders aangegeven).`,
      angleEn: (s) =>
        `${s}: use the CyberPanel URL and credentials from the welcome email (port 8090 unless told otherwise).`,
      prepNl: ["Welkomstmail", "Admin-wachtwoord", "Eventueel VPN/allowlist"],
      prepEn: ["Welcome email", "Admin password", "VPN/allowlist if any"],
      stepsNl: () => [
        "Open de CyberPanel-URL uit de mail (https://server:8090 of jouw hostname).",
        "Log in met admin of het verstrekte account.",
        "Bij falen: check IP-blokkade, certificaatwaarschuwing (ga alleen door als het jouw server is), wachtwoordreset via console indien geboden.",
        "Bevestig dat je de juiste server hebt (hostname/IP).",
        "Zet 2FA aan zodra je binnen bent.",
      ],
      stepsEn: () => [
        "Open the CyberPanel URL from the email (https://server:8090 or your hostname).",
        "Sign in with admin or the provided account.",
        "On failure: check IP blocks, certificate warnings (continue only if it is your server), password reset via console if offered.",
        "Confirm you have the correct server (hostname/IP).",
        "Enable 2FA once inside.",
      ],
      verifyNl: ["Dashboard laadt.", "Websites-lijst zichtbaar."],
      verifyEn: ["Dashboard loads.", "Websites list visible."],
      pitfallsNl: ["Inloggen op een andere VPS met dezelfde UI."],
      pitfallsEn: ["Signing into a different VPS with the same UI."],
      tipNl: ["Bewaar de panel-URL in je password manager."],
      tipEn: ["Store the panel URL in your password manager."],
      warnNl: ["Negeer geen certificaatfouten op onbekende IP’s."],
      warnEn: ["Do not ignore certificate errors on unknown IPs."],
      relatedNl: "CyberPanel websites, SSL, firewall",
      relatedEn: "CyberPanel websites, SSL, firewall",
      whyNl: () => "Zonder panel-login kun je geen site, SSL of mail beheren op CP.",
      whyEn: () => "Without panel login you cannot manage sites, SSL or mail on CP.",
    },
    cp_site: {
      angleNl: (s) =>
        `${s} in CyberPanel: selecteer altijd eerst de juiste website, daarna de module (SSL, DNS, File Manager, Email, Backup).`,
      angleEn: (s) =>
        `${s} in CyberPanel: always select the correct website first, then the module (SSL, DNS, File Manager, Email, Backup).`,
      prepNl: ["CyberPanel-login", "Domeinnaam"],
      prepEn: ["CyberPanel login", "Domain name"],
      stepsNl: (s) => [
        "Log in op CyberPanel.",
        `Open Websites en kies het domein voor “${s}”.`,
        "Voer de taak uit in de juiste module.",
        "Purge OpenLiteSpeed-cache als de wijziging niet zichtbaar is.",
        "Check error-logs bij 500/witte pagina.",
      ],
      stepsEn: (s) => [
        "Sign in to CyberPanel.",
        `Open Websites and choose the domain for “${s}”.`,
        "Complete the task in the correct module.",
        "Purge OpenLiteSpeed cache if the change is not visible.",
        "Check error logs on 500/white screen.",
      ],
      verifyNl: ["Wijziging zichtbaar op de live URL.", "Geen nieuwe errors in logs."],
      verifyEn: ["Change visible on the live URL.", "No new errors in logs."],
      pitfallsNl: ["Verkeerde vhost bewerken op multi-site servers."],
      pitfallsEn: ["Editing the wrong vhost on multi-site servers."],
      tipNl: ["Noteer oude waarden vóór DNS/SSL-saves."],
      tipEn: ["Note old values before DNS/SSL saves."],
      warnNl: ["OLS-cache kan ‘fixes’ uren verbergen."],
      warnEn: ["OLS cache can hide ‘fixes’ for hours."],
      relatedNl: "CyberPanel login, OLS cache, SSL",
      relatedEn: "CyberPanel login, OLS cache, SSL",
      whyNl: () => "CP is website-centric: verkeerde site = verkeerde productie-impact.",
      whyEn: () => "CP is website-centric: wrong site = wrong production impact.",
    },
    plesk_reseller: {
      angleNl: (s) =>
        `${s}: open eerst het klantabonnement, daarna service plans / subscriptions — anders bewerk je de verkeerde tenant.`,
      angleEn: (s) =>
        `${s}: open the customer subscription first, then service plans / subscriptions — or you edit the wrong tenant.`,
      prepNl: ["Plesk reseller-login", "Klant- of abonnementsnaam"],
      prepEn: ["Plesk reseller login", "Customer or subscription name"],
      stepsNl: (s) => [
        "Log in op Plesk (8443 of welkomstlink).",
        `Open Customers/Subscriptions en kies de juiste tenant voor “${s}”.`,
        "Maak of pas het hostingpakket/abonnement aan (resources, features).",
        "Wijs domein toe en bevestig service plan limits.",
        "Test of de klant binnen de limieten kan werken.",
      ],
      stepsEn: (s) => [
        "Sign in to Plesk (8443 or welcome link).",
        `Open Customers/Subscriptions and choose the correct tenant for “${s}”.`,
        "Create or adjust the hosting package/subscription (resources, features).",
        "Assign the domain and confirm service plan limits.",
        "Test that the customer can work within the limits.",
      ],
      verifyNl: ["Abonnement zichtbaar onder de klant.", "Resources kloppen."],
      verifyEn: ["Subscription visible under the customer.", "Resources are correct."],
      pitfallsNl: ["Service plan wijzigen op het verkeerde subscription."],
      pitfallsEn: ["Changing the service plan on the wrong subscription."],
      tipNl: ["Gebruik duidelijke plan-namen (klant + datum)."],
      tipEn: ["Use clear plan names (customer + date)."],
      warnNl: ["Overboeking van disk/CPU raakt alle sites op het plan."],
      warnEn: ["Overcommitting disk/CPU affects every site on the plan."],
      relatedNl: "Plesk domein, WordPress Toolkit, mail",
      relatedEn: "Plesk domain, WordPress Toolkit, mail",
      whyNl: () => "Reseller-fouten zijn multi-tenant fouten.",
      whyEn: () => "Reseller mistakes are multi-tenant mistakes.",
    },
    plesk_site: {
      angleNl: (s) =>
        `${s} in Plesk hoort bij één subscription: Mail, DNS, SSL/TLS, Files, Databases of WordPress Toolkit.`,
      angleEn: (s) =>
        `${s} in Plesk belongs to one subscription: Mail, DNS, SSL/TLS, Files, Databases or WordPress Toolkit.`,
      prepNl: ["Plesk-login", "Juiste subscription"],
      prepEn: ["Plesk login", "Correct subscription"],
      stepsNl: (s) => [
        `Log in en open het abonnement/domein voor “${s}”.`,
        "Kies de tool die bij de taak past.",
        "Voer de wijziging door en bevestig.",
        "Test extern (browser, mail, DNS).",
        "Controleer Logs bij fouten.",
      ],
      stepsEn: (s) => [
        `Sign in and open the subscription/domain for “${s}”.`,
        "Choose the tool that matches the task.",
        "Apply the change and confirm.",
        "Test externally (browser, mail, DNS).",
        "Check Logs on failures.",
      ],
      verifyNl: ["Resultaat zichtbaar buiten Plesk.", "Geen traffic naar verkeerd abonnement."],
      verifyEn: ["Result visible outside Plesk.", "No traffic hitting the wrong subscription."],
      pitfallsNl: ["Files openen van een ander abonnement met dezelfde sitenaam."],
      pitfallsEn: ["Opening files from another subscription with the same site name."],
      tipNl: ["Gebruik de zoekbalk bovenaan om het juiste domein te vinden."],
      tipEn: ["Use the top search bar to find the correct domain."],
      warnNl: ["Reseller: nooit blind in ‘eigen’ admin werken terwijl je een klant bedoelde."],
      warnEn: ["Reseller: never work blindly in ‘your own’ admin when you meant a customer."],
      relatedNl: "Plesk reseller, SSL, DNS",
      relatedEn: "Plesk reseller, SSL, DNS",
      whyNl: () => "Plesk isoleert per subscription — dat is een feature én een valkuil.",
      whyEn: () => "Plesk isolates per subscription — that is both a feature and a trap.",
    },
    vps_ssh: {
      angleNl: (s) =>
        `${s}: SSH is sleutel- of wachtwoordtoegang tot de VPS. Op shared hosting ontbreekt root-SSH vaak bewust.`,
      angleEn: (s) =>
        `${s}: SSH is key or password access to the VPS. Shared hosting often omits root SSH on purpose.`,
      prepNl: ["IP/hostname", "Gebruiker", "Private key of wachtwoord", "Poort (22 of custom)"],
      prepEn: ["IP/hostname", "User", "Private key or password", "Port (22 or custom)"],
      stepsNl: (s) => [
        `Bevestig of je pakket SSH toestaat (VPS/managed vs shared) voor “${s}”.`,
        "Verbind met `ssh user@host -p poort` of een GUI-client.",
        "Bij key-auth: juiste private key en permissions (600) op de keyfile.",
        "Faalt connectie: check firewall, fail2ban, juiste IP, console/VNC in het VPS-panel.",
        "Doe minimale commando’s; documenteer wijzigingen.",
      ],
      stepsEn: (s) => [
        `Confirm whether your plan allows SSH (VPS/managed vs shared) for “${s}”.`,
        "Connect with `ssh user@host -p port` or a GUI client.",
        "For key auth: correct private key and permissions (600) on the key file.",
        "On failure: check firewall, fail2ban, correct IP, console/VNC in the VPS panel.",
        "Run minimal commands; document changes.",
      ],
      verifyNl: ["Shell-prompt bereikbaar.", "Exit en opnieuw inloggen lukt."],
      verifyEn: ["Shell prompt reachable.", "Exit and login again works."],
      pitfallsNl: ["Firewall dichzetten inclusief je eigen SSH-poort."],
      pitfallsEn: ["Closing the firewall including your own SSH port."],
      tipNl: ["Gebruik keys i.p.v. root-wachtwoord over internet."],
      tipEn: ["Prefer keys over root passwords on the public internet."],
      warnNl: ["Shared hosting: geen root verwachten — vraag SFTP/jailed SSH na."],
      warnEn: ["Shared hosting: do not expect root — ask about SFTP/jailed SSH."],
      relatedNl: "VPS firewall, snapshots, SFTP",
      relatedEn: "VPS firewall, snapshots, SFTP",
      whyNl: () => "SSH-rechten hangen aan het product, niet aan ‘alle hosting is gelijk’.",
      whyEn: () => "SSH rights follow the product, not ‘all hosting is equal’.",
    },
    vps_plan: {
      angleNl: (s) =>
        `${s} beschrijft capaciteit (CPU, RAM, disk, traffic) en verantwoordelijkheid. Kies op workload, niet op marketinglabels.`,
      angleEn: (s) =>
        `${s} describes capacity (CPU, RAM, disk, traffic) and responsibility. Choose by workload, not marketing labels.`,
      prepNl: ["Huidig resourcegebruik", "Groeiverwachting"],
      prepEn: ["Current resource usage", "Growth expectation"],
      stepsNl: (s) => [
        `Lees de specificaties die bij “${s}” horen (vCPU, RAM, NVMe/SSD, snapshots).`,
        "Vergelijk met je piekbelasting (shop, agency-sites, CI).",
        "Bepaal of je managed taken (backups, panel) nodig hebt.",
        "Kies het plan; plan migratie/snapshot bij upgrade.",
        "Monitor na livegang CPU/RAM/disk een week.",
      ],
      stepsEn: (s) => [
        `Read the specs for “${s}” (vCPU, RAM, NVMe/SSD, snapshots).`,
        "Compare with peak load (shop, agency sites, CI).",
        "Decide whether you need managed tasks (backups, panel).",
        "Pick the plan; plan migration/snapshot on upgrade.",
        "Monitor CPU/RAM/disk for a week after go-live.",
      ],
      verifyNl: ["Resources dekken de piek met marge.", "Backups/snapshots actief."],
      verifyEn: ["Resources cover peak with headroom.", "Backups/snapshots active."],
      pitfallsNl: ["Te klein starten zonder upgrade-pad."],
      pitfallsEn: ["Starting too small without an upgrade path."],
      tipNl: ["RAM-tekort uit zich als swap thrashing, niet altijd als ‘site down’."],
      tipEn: ["RAM shortage shows up as swap thrashing, not always as ‘site down’."],
      warnNl: ["Onbeheerde VPS zonder monitoring is een weekendrisico."],
      warnEn: ["Unmanaged VPS without monitoring is a weekend risk."],
      relatedNl: "SSH, snapshots, managed hosting versus VPS",
      relatedEn: "SSH, snapshots, managed hosting versus VPS",
      whyNl: () => "Het juiste plan voorkomt noodupgrades tijdens campagnes.",
      whyEn: () => "The right plan prevents emergency upgrades during campaigns.",
    },
    vps_firewall: {
      angleNl: (s) =>
        `${s}: open alleen benodigde poorten, behoud een managementpad (console), test vanaf een secondair netwerk.`,
      angleEn: (s) =>
        `${s}: open only required ports, keep a management path (console), test from a secondary network.`,
      prepNl: ["Snapshot", "Lijst poorten (22/80/443/…)", "Console-toegang"],
      prepEn: ["Snapshot", "Port list (22/80/443/…)", "Console access"],
      stepsNl: (s) => [
        `Maak een snapshot vóór firewallwijzigingen voor “${s}”.`,
        "Pas regels toe (ufw/firewalld/panel) — allow SSH eerst.",
        "Laad regels; verbreek je sessie niet voordat een tweede login lukt.",
        "Test websitepoorten en mailpoorten indien relevant.",
        "Log denied traffic kort om false positives te zien.",
      ],
      stepsEn: (s) => [
        `Take a snapshot before firewall changes for “${s}”.`,
        "Apply rules (ufw/firewalld/panel) — allow SSH first.",
        "Load rules; do not drop your session until a second login works.",
        "Test web ports and mail ports where relevant.",
        "Log denied traffic briefly to spot false positives.",
      ],
      verifyNl: ["SSH blijft werken.", "Publieke diensten bereikbaar, rest dicht."],
      verifyEn: ["SSH still works.", "Public services reachable, everything else closed."],
      pitfallsNl: ["Default deny zonder SSH-allow."],
      pitfallsEn: ["Default deny without SSH allow."],
      tipNl: ["Houd provider-console bookmark bij de hand."],
      tipEn: ["Keep the provider console bookmark handy."],
      warnNl: ["Cloud-security groups én OS-firewall moeten beide kloppen."],
      warnEn: ["Cloud security groups and OS firewall must both be correct."],
      relatedNl: "SSH, fail2ban, snapshots",
      relatedEn: "SSH, fail2ban, snapshots",
      whyNl: () => "Firewallfouten locken je buiten je eigen server.",
      whyEn: () => "Firewall mistakes lock you out of your own server.",
    },
    client_cancel: {
      angleNl: (s) =>
        `${s} regel je in het klantenpanel met de juiste opzegtermijn. DNS/mail stoppen niet automatisch zoals je denkt — plan content/export.`,
      angleEn: (s) =>
        `${s} is handled in the client panel with the correct notice period. DNS/mail do not stop the way you might assume — plan content/export.`,
      prepNl: ["Klantenpanel-login", "Welk product/domein", "Export/backup indien nodig"],
      prepEn: ["Client panel login", "Which product/domain", "Export/backup if needed"],
      stepsNl: (s) => [
        "Log in op het TripleZero iT klantenpanel.",
        `Open Producten/Diensten en selecteer wat je wilt beëindigen voor “${s}”.`,
        "Start opzegging; bevestig einddatum/termijn.",
        "Exporteer site, mail en DNS-zone vóór de einddatum.",
        "Bewaar bevestiging; controleer dat facturatie stopt na de einddatum.",
      ],
      stepsEn: (s) => [
        "Sign in to the TripleZero iT client panel.",
        `Open Products/Services and select what you want to end for “${s}”.`,
        "Start cancellation; confirm end date/notice period.",
        "Export site, mail and DNS zone before the end date.",
        "Keep confirmation; verify billing stops after the end date.",
      ],
      verifyNl: ["Status = opgezegd/pending cancel.", "Bevestigingsmail aanwezig."],
      verifyEn: ["Status = cancelled/pending cancel.", "Confirmation email present."],
      pitfallsNl: ["Alleen DNS omzetten zonder abonnement op te zeggen."],
      pitfallsEn: ["Only changing DNS without cancelling the subscription."],
      tipNl: ["Zeg tijdig op vóór automatische verlenging."],
      tipEn: ["Cancel in time before auto-renewal."],
      warnNl: ["Domein en hosting zijn vaak aparte producten."],
      warnEn: ["Domain and hosting are often separate products."],
      relatedNl: "Backups, domeintransfer, facturen",
      relatedEn: "Backups, domain transfer, invoices",
      whyNl: () => "Administratieve stop ≠ technische export — doe beide.",
      whyEn: () => "Administrative stop ≠ technical export — do both.",
    },
    client_invoice: {
      angleNl: (s) =>
        `${s} vind je onder Facturen in het klantenpanel: download, betaalstatus en eventuele herinneringen.`,
      angleEn: (s) =>
        `${s} lives under Invoices in the client panel: download, payment status and any reminders.`,
      prepNl: ["Klantenpanel-login", "Factuurnummer of periode"],
      prepEn: ["Client panel login", "Invoice number or period"],
      stepsNl: (s) => [
        "Open Facturen in het klantenpanel.",
        `Zoek de factuur die bij “${s}” hoort.`,
        "Download PDF; controleer bedrag, BTW en betaalstatus.",
        "Betaal via de aangeboden methode of upload bewijs indien gevraagd.",
        "Bij betwisting: open een ticket met factuurnummer.",
      ],
      stepsEn: (s) => [
        "Open Invoices in the client panel.",
        `Find the invoice related to “${s}”.`,
        "Download PDF; check amount, VAT and payment status.",
        "Pay via the offered method or upload proof if asked.",
        "On disputes: open a ticket with the invoice number.",
      ],
      verifyNl: ["Status betaald of in behandeling zoals verwacht."],
      verifyEn: ["Status paid or pending as expected."],
      pitfallsNl: ["Verkeerd klantnummer/omgeving bij agencies."],
      pitfallsEn: ["Wrong customer number/environment at agencies."],
      tipNl: ["Bewaar PDF’s buiten het panel voor boekhouding."],
      tipEn: ["Keep PDFs outside the panel for accounting."],
      warnNl: ["Negeer herinneringen niet — diensten kunnen beperkt worden."],
      warnEn: ["Do not ignore reminders — services may be limited."],
      relatedNl: "Opzeggen, tickets, betaalmethoden",
      relatedEn: "Cancellation, tickets, payment methods",
      whyNl: () => "Factuurstatus verklaart vaak ‘plotselinge’ servicebeperkingen.",
      whyEn: () => "Invoice status often explains ‘sudden’ service limits.",
    },
    client_ticket: {
      angleNl: (s) =>
        `${s}: een goed ticket bevat domein, tijdstip, stappen al gedaan en exacte fouttekst.`,
      angleEn: (s) =>
        `${s}: a good ticket includes domain, timestamp, steps already tried and exact error text.`,
      prepNl: ["Domeinnaam", "Screenshots/fouttekst", "Klantenpanel-login"],
      prepEn: ["Domain name", "Screenshots/error text", "Client panel login"],
      stepsNl: (s) => [
        "Log in → Tickets → Nieuw.",
        `Beschrijf “${s}” in één zin + impact (down, mail, DNS).`,
        "Plak foutmeldingen als tekst; voeg screenshot toe.",
        "Noem wat je al probeerde.",
        "Reageer op follow-ups in hetzelfde ticket.",
      ],
      stepsEn: (s) => [
        "Sign in → Tickets → New.",
        `Describe “${s}” in one sentence + impact (down, mail, DNS).`,
        "Paste error messages as text; attach a screenshot.",
        "State what you already tried.",
        "Reply to follow-ups in the same ticket.",
      ],
      verifyNl: ["Ticketnummer ontvangen.", "Status zichtbaar in panel."],
      verifyEn: ["Ticket number received.", "Status visible in panel."],
      pitfallsNl: ["Nieuwe tickets openen per reply i.p.v. te threaden."],
      pitfallsEn: ["Opening a new ticket per reply instead of threading."],
      tipNl: ["Eén onderwerp per ticket houdt diagnoses snel."],
      tipEn: ["One subject per ticket keeps diagnoses fast."],
      warnNl: ["Geen wachtwoorden in bijlagen laten staan."],
      warnEn: ["Do not leave passwords in attachments."],
      relatedNl: "Statusupdates, noodgevallen, kennisbank",
      relatedEn: "Status updates, emergencies, knowledge base",
      whyNl: () => "Incomplete tickets kosten rondes — complete tickets lossen sneller op.",
      whyEn: () => "Incomplete tickets cost rounds — complete tickets resolve faster.",
    },
    hosting_quota: {
      angleNl: (s) =>
        `${s} zie je in DirectAdmin/usage meters: disk, inodes, bandwidth. Overschrijding geeft mail- of sitefouten.`,
      angleEn: (s) =>
        `${s} shows in DirectAdmin/usage meters: disk, inodes, bandwidth. Exceeding limits causes mail or site errors.`,
      prepNl: ["Panel-login", "Welk limiettype"],
      prepEn: ["Panel login", "Which limit type"],
      stepsNl: (s) => [
        `Open usage/schijfstatistieken voor “${s}”.`,
        "Zoek grote logs, backups, mailboxes of node_modules/uploads.",
        "Ruim gecontroleerd op of upgrade het pakket.",
        "Roteer logs; verplaats oude backups offsite.",
        "Hercheck meters na 15–60 minuten.",
      ],
      stepsEn: (s) => [
        `Open usage/disk stats for “${s}”.`,
        "Find large logs, backups, mailboxes or node_modules/uploads.",
        "Clean up carefully or upgrade the plan.",
        "Rotate logs; move old backups offsite.",
        "Recheck meters after 15–60 minutes.",
      ],
      verifyNl: ["Gebruik onder de limiet.", "Site/mail weer stabiel."],
      verifyEn: ["Usage under the limit.", "Site/mail stable again."],
      pitfallsNl: ["Alleen files wissen terwijl mailboxes vol zitten."],
      pitfallsEn: ["Only deleting files while mailboxes are full."],
      tipNl: ["Inodes raken vol bij miljoenen kleine bestanden (cache)."],
      tipEn: ["Inodes fill up with millions of tiny files (cache)."],
      warnNl: ["Wis geen live uploads-map ‘om ruimte te maken’."],
      warnEn: ["Do not delete the live uploads folder ‘to free space’."],
      relatedNl: "Backups, mailquota, pakketupgrade",
      relatedEn: "Backups, mail quota, plan upgrade",
      whyNl: () => "Quota is een harde limiet — optimaliseer of upgrade.",
      whyEn: () => "Quota is a hard limit — optimise or upgrade.",
    },
    security_2fa: {
      angleNl: (s) =>
        `${s} koppelt een authenticator-app aan je panelaccount. Bewaar backupcodes offline.`,
      angleEn: (s) =>
        `${s} links an authenticator app to your panel account. Store backup codes offline.`,
      prepNl: ["Authenticator-app", "Panel-login"],
      prepEn: ["Authenticator app", "Panel login"],
      stepsNl: () => [
        "Open Two-Step/2FA in DirectAdmin of klantenpanel.",
        "Scan QR; bevestig met een code.",
        "Download backupcodes.",
        "Test logout/login.",
        "Verwijder oude devices uit de app-lijst indien getoond.",
      ],
      stepsEn: () => [
        "Open Two-Step/2FA in DirectAdmin or the client panel.",
        "Scan QR; confirm with a code.",
        "Download backup codes.",
        "Test logout/login.",
        "Remove old devices from the app list if shown.",
      ],
      verifyNl: ["Login vraagt om 2FA-code.", "Backupcodes opgeslagen."],
      verifyEn: ["Login asks for a 2FA code.", "Backup codes stored."],
      pitfallsNl: ["Codes alleen in de mailbox bewaren die je juist beveiligt."],
      pitfallsEn: ["Storing codes only in the mailbox you are trying to protect."],
      tipNl: ["Gebruik één app met cloud-backup van de seeds indien je beleid dat toelaat."],
      tipEn: ["Use one app with seed cloud-backup if your policy allows it."],
      warnNl: ["Verlies van app én codes = account recovery via support."],
      warnEn: ["Losing both app and codes = account recovery via support."],
      relatedNl: "Wachtwoord wijzigen, panel-login",
      relatedEn: "Change password, panel login",
      whyNl: () => "2FA stopt de meeste credential-stuffing aanvallen.",
      whyEn: () => "2FA stops most credential-stuffing attacks.",
    },
    compare_host: {
      angleNl: (s) =>
        `${s}: vergelijk op workload, beheer (managed vs self), resources en risico — niet op één feature-checkbox.`,
      angleEn: (s) =>
        `${s}: compare by workload, management (managed vs self), resources and risk — not by a single feature checkbox.`,
      prepNl: ["Huidige knelpunten", "Budget/termijn"],
      prepEn: ["Current bottlenecks", "Budget/timeline"],
      stepsNl: (s) => [
        `Schrijf op wat “${s}” moet oplossen (traffic, isolatie, root, mail, prijs).`,
        "Zet opties naast elkaar op CPU/RAM/disk, backups, panel, SLA.",
        "Weeg operationele last (updates, firewall, monitoring).",
        "Kies de kleinste optie die piek + groei dekt.",
        "Plan migratie en rollback.",
      ],
      stepsEn: (s) => [
        `Write down what “${s}” must solve (traffic, isolation, root, mail, price).`,
        "Compare options on CPU/RAM/disk, backups, panel, SLA.",
        "Weigh operational load (updates, firewall, monitoring).",
        "Pick the smallest option that covers peak + growth.",
        "Plan migration and rollback.",
      ],
      verifyNl: ["Keuze gedocumenteerd met criteria.", "Migratiepad duidelijk."],
      verifyEn: ["Choice documented with criteria.", "Migration path clear."],
      pitfallsNl: ["Kiezen op prijs terwijl CPU-limieten de shop breken."],
      pitfallsEn: ["Choosing on price while CPU limits break the shop."],
      tipNl: ["Agency met veel sites: isolatie > ruwe GHz."],
      tipEn: ["Agency with many sites: isolation > raw GHz."],
      warnNl: ["‘Onbeperkt’ zonder fair-use is zelden letterlijk onbeperkt."],
      warnEn: ["‘Unlimited’ without fair use is rarely literally unlimited."],
      relatedNl: "VPS-plannen, managed hosting, migratie",
      relatedEn: "VPS plans, managed hosting, migration",
      whyNl: () => "Een goede vergelijking voorkomt migraties binnen drie maanden.",
      whyEn: () => "A good comparison prevents migrations within three months.",
    },
    generic: {
      angleNl: (s) =>
        `Deze handleiding behandelt “${s}” op TripleZero iT: eerst scope, dan voorbereiding, dan gerichte stappen en controle.`,
      angleEn: (s) =>
        `This guide covers “${s}” on TripleZero iT: scope first, then preparation, then targeted steps and verification.`,
      prepNl: [
        "Login voor klantenpanel en/of DirectAdmin.",
        "Domeinnaam en product waar dit over gaat.",
        "Backup als de wijziging structureel is.",
      ],
      prepEn: [
        "Login for client panel and/or DirectAdmin.",
        "Domain and product this concerns.",
        "Backup if the change is structural.",
      ],
      stepsNl: (s) => [
        `Bepaal of “${s}” in DNS, hostingpanel, applicatie of accountbeheer thuishoort.`,
        "Open alleen dat oppervlak; noteer de huidige staat.",
        "Voer de minimale wijziging door die het doel bereikt.",
        "Bewaar oude waarden tot je geverifieerd hebt.",
        "Test buiten het panel (browser, mailclient of DNS-lookup).",
        "Documenteer resultaat voor jezelf of je team.",
      ],
      stepsEn: (s) => [
        `Decide whether “${s}” belongs in DNS, hosting panel, application or account management.`,
        "Open only that surface; note the current state.",
        "Apply the minimal change that achieves the goal.",
        "Keep old values until you have verified.",
        "Test outside the panel (browser, mail client or DNS lookup).",
        "Document the result for yourself or your team.",
      ],
      verifyNl: [
        "Het verwachte resultaat is zichtbaar buiten het panel.",
        "Geen regressie op aanpalende diensten (web/mail/DNS).",
        "Rollbackpad nog beschikbaar.",
      ],
      verifyEn: [
        "Expected result is visible outside the panel.",
        "No regression on adjacent services (web/mail/DNS).",
        "Rollback path still available.",
      ],
      pitfallsNl: [
        "Meerdere systemen tegelijk wijzigen.",
        "Geen notitie van oude waarden.",
        "Aannemen dat propagatie ‘meteen’ klaar is.",
      ],
      pitfallsEn: [
        "Changing multiple systems at once.",
        "Not noting old values.",
        "Assuming propagation is instant.",
      ],
      tipNl: ["Werk in één sessie aan één domein — minder verwarring bij multi-account."],
      tipEn: ["Work on one domain per session — less confusion on multi-account setups."],
      warnNl: ["Voer geen destructieve deletes uit zonder export."],
      warnEn: ["Do not run destructive deletes without an export."],
      relatedNl: "Backups, tickets, DNS en SSL",
      relatedEn: "Backups, tickets, DNS and SSL",
      whyNl: (s) =>
        `“${s}” gaat sneller als je het juiste systeem kiest vóór je knoppen indrukt.`,
      whyEn: (s) =>
        `“${s}” goes faster when you pick the right system before pressing buttons.`,
    },
  };
}

function kindHeadings(kind: Kind, locale: Locale, seed: number): {
  prep: string;
  steps: string;
  verify: string;
  pitfalls: string;
  why: string;
  scope: string;
} {
  if (locale === "nl") {
    const prep = pick(seed, ["Voorbereiding", "Wat je nodig hebt", "Voor je begint"], 1);
    const steps = pick(seed, ["Stappen", "Werkwijze", "Uitvoering"], 2);
    const verify = pick(seed, ["Controleren", "Zo weet je dat het gelukt is", "Acceptatiechecks"], 3);
    const pitfalls = pick(seed, ["Veelgemaakte fouten", "Valkuilen", "Dit juist níet doen"], 4);
    const why =
      kind === "explain"
        ? pick(seed, ["Waarom dit ertoe doet", "In de praktijk", "Context"], 5)
        : pick(seed, ["Waarom deze aanpak", "Achtergrond", "Scope"], 5);
    const scope = pick(seed, ["Wat dit artikel wel en niet dekt", "Reikwijdte", "Grenzen van deze guide"], 6);
    return { prep, steps, verify, pitfalls, why, scope };
  }
  const prep = pick(seed, ["Preparation", "What you need", "Before you start"], 1);
  const steps = pick(seed, ["Steps", "Procedure", "How to execute"], 2);
  const verify = pick(seed, ["Verify", "How you know it worked", "Acceptance checks"], 3);
  const pitfalls = pick(seed, ["Common mistakes", "Pitfalls", "What not to do"], 4);
  const why =
    kind === "explain"
      ? pick(seed, ["Why this matters", "In practice", "Context"], 5)
      : pick(seed, ["Why this approach", "Background", "Scope"], 5);
  const scope = pick(seed, ["What this article covers", "Coverage", "Boundaries of this guide"], 6);
  return { prep, steps, verify, pitfalls, why, scope };
}

function scopeText(
  kind: Kind,
  panel: Panel,
  subject: string,
  locale: Locale,
  seed: number,
): string {
  if (locale === "nl") {
    const panelBit = {
      wordpress: "wp-admin, bestanden en hostingpanel",
      directadmin: "DirectAdmin-modules",
      cyberpanel: "CyberPanel/OpenLiteSpeed",
      plesk: "Plesk-subscriptions",
      email: "mailbox, client en DNS-auth",
      dns: "DNS-zone en registrar",
      vps: "VPS/SSH en firewall",
      client: "klantenpanel en accountbeheer",
      general: "panel, DNS of applicatie — afhankelijk van de taak",
    }[panel];
    if (kind === "explain") {
      return pick(
        seed,
        [
          `We leggen “${subject}” uit en koppelen het aan concrete plekken in ${panelBit}. Geen losse theorie zonder handelingsperspectief.`,
          `Dit is een uitleg plus praktische checks voor “${subject}” binnen ${panelBit}.`,
          `Focus: begrip van “${subject}” en waar je het in ${panelBit} terugziet.`,
        ],
        7,
      );
    }
    if (kind === "troubleshoot") {
      return pick(
        seed,
        [
          `Diagnose voor “${subject}”: isoleren in ${panelBit}, daarna fixen. Geen scattershot wijzigingen.`,
          `We behandelen “${subject}” als storing: symptoom → laag (${panelBit}) → correctie → bewijs.`,
          `Reikwijdte is troubleshooting van “${subject}” via ${panelBit}, niet een volledige herbouw tenzij nodig.`,
        ],
        7,
      );
    }
    if (kind === "compare") {
      return `Vergelijkingskader voor “${subject}”: criteria, trade-offs en wanneer je wisselt — praktisch bruikbaar naast ${panelBit}.`;
    }
    return pick(
      seed,
      [
        `Handelingsgerichte guide voor “${subject}” in ${panelBit}, inclusief controle en valkuilen.`,
        `Je voert “${subject}” uit via ${panelBit}, met backupbesef en verificatie.`,
        `Stappenplan voor “${subject}” met focus op ${panelBit}; aanpalende systemen alleen waar nodig.`,
      ],
      7,
    );
  }

  const panelBit = {
    wordpress: "wp-admin, files and the hosting panel",
    directadmin: "DirectAdmin modules",
    cyberpanel: "CyberPanel/OpenLiteSpeed",
    plesk: "Plesk subscriptions",
    email: "mailbox, client and DNS auth",
    dns: "DNS zone and registrar",
    vps: "VPS/SSH and firewall",
    client: "client panel and account management",
    general: "panel, DNS or application — depending on the task",
  }[panel];
  if (kind === "explain") {
    return pick(
      seed,
      [
        `We explain “${subject}” and map it to concrete places in ${panelBit}. No theory without action.`,
        `This is an explanation plus practical checks for “${subject}” inside ${panelBit}.`,
        `Focus: understanding “${subject}” and where it shows up in ${panelBit}.`,
      ],
      7,
    );
  }
  if (kind === "troubleshoot") {
    return pick(
      seed,
      [
        `Diagnosis for “${subject}”: isolate in ${panelBit}, then fix. No scattershot changes.`,
        `We treat “${subject}” as an incident: symptom → layer (${panelBit}) → correction → proof.`,
        `Scope is troubleshooting “${subject}” via ${panelBit}, not a full rebuild unless required.`,
      ],
      7,
    );
  }
  if (kind === "compare") {
    return `Comparison frame for “${subject}”: criteria, trade-offs and when to switch — usable alongside ${panelBit}.`;
  }
  return pick(
    seed,
    [
      `Actionable guide for “${subject}” in ${panelBit}, including verification and pitfalls.`,
      `You carry out “${subject}” via ${panelBit}, with backup awareness and verification.`,
      `Step plan for “${subject}” focused on ${panelBit}; adjacent systems only where needed.`,
    ],
    7,
  );
}

function excerptFor(subject: string, niche: NicheKey, locale: Locale, seed: number): string {
  if (locale === "nl") {
    return pick(
      seed,
      [
        `${subject}: professionele werkwijze met voorbereiding, stappen, controle en valkuilen.`,
        `Long-form guide: ${subject} — van scope tot verificatie op TripleZero iT.`,
        `${subject} praktisch uitgewerkt: wat je nodig hebt, hoe je het doet, hoe je het checkt.`,
      ],
      8,
    ).slice(0, 158);
  }
  return pick(
    seed,
    [
      `${subject}: professional workflow with prep, steps, verification and pitfalls.`,
      `Long-form guide: ${subject} — from scope to verification on TripleZero iT.`,
      `${subject} in practice: what you need, how to do it, how to verify.`,
    ],
    8,
  ).slice(0, 158);
}

/** Build a fully unique long-form NL+EN guide for one catalog article. */
export function buildUniqueLongformGuide(
  article: GuideArticle,
  enTitle: string,
): LongformGuide {
  const subjectNl = subjectOf(article.title);
  const subjectEn = subjectOf(enTitle);
  const seed = hash(article.slug);
  const kind = detectKind(article.title, article.slug);
  const panel = detectPanel(article.categories, article.topic, article.title, article.slug);
  const hay = `${article.slug} ${article.title} ${article.topic} ${article.categories.join(" ")}`.toLowerCase();
  const niche = detectNiche(hay);
  const packs = nichePacks();
  const pack = packs[niche];

  const hNl = kindHeadings(kind, "nl", seed);
  const hEn = kindHeadings(kind, "en", seed);

  const tipNl = pick(seed, pack.tipNl, 11);
  const tipEn = pick(seed, pack.tipEn, 11);
  const warnNl = pick(seed, pack.warnNl, 12);
  const warnEn = pick(seed, pack.warnEn, 12);
  const pitfallsNl = pickN(seed, pack.pitfallsNl, Math.min(3, pack.pitfallsNl.length), 13);
  const pitfallsEn = pickN(seed, pack.pitfallsEn, Math.min(3, pack.pitfallsEn.length), 13);

  const slugParts = article.slug.split("-").filter((t) => t.length > 2);
  const token = slugParts.slice(0, 4).join(" / ");
  const focusWordsNl = slugParts.slice(0, 6).join(", ");
  const extraVerifyNl = `Artikelcheck <code>${article.slug}</code>: “${subjectNl}” levert het verwachte resultaat zonder regressie op web/mail/DNS.`;
  const extraVerifyEn = `Article check <code>${article.slug}</code>: “${subjectEn}” yields the expected result without regressing web/mail/DNS.`;

  const stepsNl = [
    ...pack.stepsNl(subjectNl),
    pick(
      seed,
      [
        `Leg vast wat je wijzigde voor “${subjectNl}” (oude → nieuwe waarde) zodat rollback snel kan.`,
        `Herhaal de kerncontrole voor “${subjectNl}” vanaf een tweede netwerk of privévenster.`,
        `Koppel dit resultaat terug aan topic <code>${article.topic}</code> in je interne notitie of ticket.`,
      ],
      16,
    ),
  ];
  const stepsEn = [
    ...pack.stepsEn(subjectEn),
    pick(
      seed,
      [
        `Record what you changed for “${subjectEn}” (old → new value) so rollback is fast.`,
        `Repeat the core check for “${subjectEn}” from a second network or private window.`,
        `Tie this outcome back to topic <code>${article.topic}</code> in your internal note or ticket.`,
      ],
      16,
    ),
  ];

  const deepNl = joinBlocks(
    h2(pick(seed, ["Diepte voor dit onderwerp", "Focuspunten van deze guide", "Unieke aandachtspunten"], 17)),
    p(
      `Deze long-form guide is geschreven voor <strong>${subjectNl}</strong> (slug <code>${article.slug}</code>).`,
      `Signalen uit titel/topic: ${focusWordsNl || article.topic}. Werk alleen in de laag die daarbij hoort — meng geen DNS-fixen met wp-admin-fixes tenzij dit onderwerp dat expliciet vraagt.`,
    ),
    ul(
      pickN(
        seed,
        [
          `Bevestig dat je op het juiste product/domein zit voordat je “${subjectNl}” doorvoert.`,
          `Als er een foutmelding is: bewaar de exacte tekst bij “${subjectNl}” — parafraseren vertraagt support.`,
          `Na succes: korte notitie met tijdstip + ${token || article.topic}.`,
          `Bij twijfel tussen panel A en B: kies de laag die topic <code>${article.topic}</code> impliciet noemt.`,
          `Test regressie op één aanpalende flow (login, mail of homepage) na “${subjectNl}”.`,
        ],
        3,
        18,
      ),
    ),
  );
  const deepEn = joinBlocks(
    h2(pick(seed, ["Depth for this topic", "Focus of this guide", "Unique checkpoints"], 17)),
    p(
      `This long-form guide is written for <strong>${subjectEn}</strong> (slug <code>${article.slug}</code>).`,
      `Signals from title/topic: ${focusWordsNl || article.topic}. Stay in the matching layer — do not mix DNS edits with wp-admin fixes unless this topic explicitly requires it.`,
    ),
    ul(
      pickN(
        seed,
        [
          `Confirm you are on the correct product/domain before applying “${subjectEn}”.`,
          `If there is an error: keep the exact text for “${subjectEn}” — paraphrasing slows support.`,
          `After success: a short note with timestamp + ${token || article.topic}.`,
          `When unsure between panel A and B: pick the layer topic <code>${article.topic}</code> implies.`,
          `Regression-test one adjacent flow (login, mail or homepage) after “${subjectEn}”.`,
        ],
        3,
        18,
      ),
    ),
  );

  const optionalNl =
    seed % 2 === 0
      ? joinBlocks(
          h2(pick(seed, ["Rollback", "Als het misgaat", "Herstelpad"], 19)),
          ol([
            `Zet de vorige waarde terug die je noteerde voor “${subjectNl}”.`,
            "Herstel uit backup alleen als de live staat corrupt is — selectief waar mogelijk.",
            "Open een ticket met slug/onderwerp, domein en wat je al terugdraaide.",
          ]),
        )
      : joinBlocks(
          h2(pick(seed, ["Wanneer support inschakelen", "Escalatie", "Grenzen van self-service"], 19)),
          ul([
            `Je zit vast na de stappen voor “${subjectNl}” en hebt fouttekst + tijdstip.`,
            "Er is impact op productie (checkout, mail, DNS) buiten kantooruren.",
            "Je vermoedt accountcompromittering of malware.",
          ]),
        );

  const optionalEn =
    seed % 2 === 0
      ? joinBlocks(
          h2(pick(seed, ["Rollback", "If it goes wrong", "Recovery path"], 19)),
          ol([
            `Restore the previous value you noted for “${subjectEn}”.`,
            "Restore from backup only if the live state is corrupt — selectively where possible.",
            "Open a ticket with slug/subject, domain and what you already rolled back.",
          ]),
        )
      : joinBlocks(
          h2(pick(seed, ["When to involve support", "Escalation", "Self-service limits"], 19)),
          ul([
            `You are stuck after the steps for “${subjectEn}” and have error text + timestamp.`,
            "There is production impact (checkout, mail, DNS) outside business hours.",
            "You suspect account compromise or malware.",
          ]),
        );

  const bodyNl = joinBlocks(
    p(pack.angleNl(subjectNl), pack.whyNl(subjectNl)),
    h2(hNl.scope),
    p(scopeText(kind, panel, subjectNl, "nl", seed)),
    deepNl,
    h2(hNl.why),
    p(
      pick(
        seed,
        [
          `Categorieën in de kennisbank: ${article.categories.slice(0, 4).join(", ") || "algemeen"}. Topic-key: <code>${article.topic}</code>.`,
          `Dit onderwerp valt onder ${article.categories.slice(0, 3).join(", ") || "hosting"} (topic <code>${article.topic}</code>).`,
          `Interne classificatie: topic <code>${article.topic}</code> — gebruik die context bij tickets over “${subjectNl}”.`,
        ],
        14,
      ),
    ),
    h2(hNl.prep),
    ul(pack.prepNl),
    h2(hNl.steps),
    ol(stepsNl),
    h2(hNl.verify),
    ul([...pack.verifyNl, extraVerifyNl]),
    h2(hNl.pitfalls),
    ul(pitfallsNl),
    optionalNl,
    h3(pick(seed, ["Praktische tip", "Werkafspraak", "Extra aandachtspunt"], 15)),
    tip(tipNl, "nl"),
    warn(warnNl, "nl"),
    supportOutro("nl", `${pack.relatedNl}; ${subjectNl}`),
  );

  const bodyEn = joinBlocks(
    p(pack.angleEn(subjectEn), pack.whyEn(subjectEn)),
    h2(hEn.scope),
    p(scopeText(kind, panel, subjectEn, "en", seed)),
    deepEn,
    h2(hEn.why),
    p(
      pick(
        seed,
        [
          `Knowledge-base categories: ${article.categories.slice(0, 4).join(", ") || "general"}. Topic key: <code>${article.topic}</code>.`,
          `This subject sits under ${article.categories.slice(0, 3).join(", ") || "hosting"} (topic <code>${article.topic}</code>).`,
          `Internal classification: topic <code>${article.topic}</code> — include that context in tickets about “${subjectEn}”.`,
        ],
        14,
      ),
    ),
    h2(hEn.prep),
    ul(pack.prepEn),
    h2(hEn.steps),
    ol(stepsEn),
    h2(hEn.verify),
    ul([...pack.verifyEn, extraVerifyEn]),
    h2(hEn.pitfalls),
    ul(pitfallsEn),
    optionalEn,
    h3(pick(seed, ["Practical tip", "Working agreement", "Extra checkpoint"], 15)),
    tip(tipEn, "en"),
    warn(warnEn, "en"),
    supportOutro("en", `${pack.relatedEn}; ${subjectEn}`),
  );

  return {
    excerptNl: excerptFor(subjectNl, niche, "nl", seed),
    excerptEn: excerptFor(subjectEn, niche, "en", seed),
    bodyNl,
    bodyEn,
  };
}

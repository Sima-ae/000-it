/**
 * Procedural kennisbank guides: real panel steps, no meta-filler.
 * Prefer hand-crafted topic builders in build-body when available.
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

export type GuideArticle = {
  slug: string;
  title: string;
  topic: string;
  categories: string[];
};

export type ProceduralGuide = {
  excerptNl: string;
  excerptEn: string;
  bodyNl: string;
  bodyEn: string;
};

type Locale = "nl" | "en";

type Pack = {
  excerptNl: string;
  excerptEn: string;
  introNl: string;
  introEn: string;
  prepNl: string[];
  prepEn: string[];
  stepsNl: string[];
  stepsEn: string[];
  verifyNl: string[];
  verifyEn: string[];
  tipNl: string;
  tipEn: string;
  warnNl: string;
  warnEn: string;
  relatedNl: string;
  relatedEn: string;
};

function subject(title: string): string {
  return title.replace(/\?+$/, "").trim();
}

function hayOf(a: GuideArticle): string {
  return `${a.slug} ${a.title} ${a.topic} ${a.categories.join(" ")}`.toLowerCase();
}

function packBody(pack: Pack, locale: Locale): string {
  if (locale === "nl") {
    return joinBlocks(
      p(pack.introNl),
      h2("Voorbereiding"),
      ul(pack.prepNl),
      h2("Stappen"),
      ol(pack.stepsNl),
      h2("Controleren"),
      ul(pack.verifyNl),
      tip(pack.tipNl, "nl"),
      warn(pack.warnNl, "nl"),
      supportOutro("nl", pack.relatedNl),
    );
  }
  return joinBlocks(
    p(pack.introEn),
    h2("Preparation"),
    ul(pack.prepEn),
    h2("Steps"),
    ol(pack.stepsEn),
    h2("Verify"),
    ul(pack.verifyEn),
    tip(pack.tipEn, "en"),
    warn(pack.warnEn, "en"),
    supportOutro("en", pack.relatedEn),
  );
}

function matchPack(hay: string, titleNl: string, titleEn: string): Pack {
  // --- Cron (must beat generic DirectAdmin) ---
  if (/cron/.test(hay)) {
    const panel = /cyberpanel|openlitespeed/.test(hay)
      ? "cyberpanel"
      : /\bplesk\b/.test(hay)
        ? "plesk"
        : "directadmin";
    if (panel === "cyberpanel") {
      return {
        excerptNl: "Plan een cronjob in CyberPanel: schema, commando en output controleren.",
        excerptEn: "Schedule a cron job in CyberPanel: timing, command and output checks.",
        introNl: `Voor “${titleNl}” open je in CyberPanel de Cron Jobs-module. Vul een geldig schema en een absoluut pad naar php/curl of een script in.`,
        introEn: `For “${titleEn}”, open Cron Jobs in CyberPanel. Set a valid schedule and an absolute path to php/curl or your script.`,
        prepNl: ["CyberPanel-login", "Werkend commando (getest waar mogelijk)", "Gewenste frequentie"],
        prepEn: ["CyberPanel login", "Working command (tested if possible)", "Desired frequency"],
        stepsNl: [
          "Log in op CyberPanel.",
          "Ga naar <strong>Cron Jobs</strong> → <strong>Add Cron</strong>.",
          "Kies minute / hour / day / month / weekday (of een preset).",
          "Vul het commando in met volledig pad, bijvoorbeeld <code>/usr/bin/php /home/USER/public_html/wp-cron.php</code> of een curl-URL.",
          "Sla op. Optioneel: stuur output naar een logbestand i.p.v. mail bij elke run.",
          "Wacht op de eerste run of forceer handmatig via SSH als je die hebt.",
        ],
        stepsEn: [
          "Sign in to CyberPanel.",
          "Go to <strong>Cron Jobs</strong> → <strong>Add Cron</strong>.",
          "Set minute / hour / day / month / weekday (or a preset).",
          "Enter the command with a full path, e.g. <code>/usr/bin/php /home/USER/public_html/wp-cron.php</code> or a curl URL.",
          "Save. Optionally redirect output to a log file instead of email on every run.",
          "Wait for the first run, or trigger manually via SSH if available.",
        ],
        verifyNl: ["Job staat in de cronlijst", "Log/output toont een geslaagde run", "Geen onverwachte CPU-pieken"],
        verifyEn: ["Job appears in the cron list", "Log/output shows a successful run", "No unexpected CPU spikes"],
        tipNl: "Test het commando eerst handmatig voordat je het plant.",
        tipEn: "Test the command manually before scheduling it.",
        warnNl: "Te korte intervallen (elke minuut) kunnen de server belasten.",
        warnEn: "Very short intervals (every minute) can overload the server.",
        relatedNl: "PHP-versie, WordPress DISABLE_WP_CRON, backups",
        relatedEn: "PHP version, WordPress DISABLE_WP_CRON, backups",
      };
    }
    if (panel === "plesk") {
      return {
        excerptNl: "Maak een geplande taak in Plesk (Scheduled Tasks) met het juiste commando.",
        excerptEn: "Create a Plesk scheduled task with the correct command.",
        introNl: `“${titleNl}” doe je in Plesk via Scheduled Tasks op het juiste abonnement.`,
        introEn: `“${titleEn}” is done in Plesk via Scheduled Tasks on the correct subscription.`,
        prepNl: ["Plesk-login", "Juiste subscription", "Commando/pad"],
        prepEn: ["Plesk login", "Correct subscription", "Command/path"],
        stepsNl: [
          "Log in op Plesk en open het juiste abonnement.",
          "Ga naar <strong>Scheduled Tasks</strong> (Geplande taken).",
          "Klik op Add Task / Taak toevoegen.",
          "Kies Run a PHP script of Run a command.",
          "Stel het schema in en vul scriptpad of shell-commando in.",
          "Sla op en bekijk de task history na de eerste run.",
        ],
        stepsEn: [
          "Sign in to Plesk and open the correct subscription.",
          "Go to <strong>Scheduled Tasks</strong>.",
          "Click Add Task.",
          "Choose Run a PHP script or Run a command.",
          "Set the schedule and enter the script path or shell command.",
          "Save and check task history after the first run.",
        ],
        verifyNl: ["Taak zichtbaar in de lijst", "History toont succes"],
        verifyEn: ["Task visible in the list", "History shows success"],
        tipNl: "Gebruik PHP-handler van het abonnement zodat de juiste PHP-versie draait.",
        tipEn: "Use the subscription PHP handler so the correct PHP version runs.",
        warnNl: "Werk nooit in het verkeerde subscription op een reseller-server.",
        warnEn: "Never work in the wrong subscription on a reseller server.",
        relatedNl: "PHP-versie, logs, WordPress-cron",
        relatedEn: "PHP version, logs, WordPress cron",
      };
    }
    return {
      excerptNl: "Cronjob instellen in DirectAdmin: Advanced Features → Cron Jobs, schema + commando, daarna controleren.",
      excerptEn: "Set up a cron job in DirectAdmin: Advanced Features → Cron Jobs, schedule + command, then verify.",
      introNl: `Een cronjob voert een commando automatisch uit op een schema. Voor “${titleNl}” gebruik je in DirectAdmin <strong>Advanced Features → Cron Jobs</strong> — niet Domain Setup of DNS.`,
      introEn: `A cron job runs a command on a schedule. For “${titleEn}” use DirectAdmin <strong>Advanced Features → Cron Jobs</strong> — not Domain Setup or DNS.`,
      prepNl: [
        "DirectAdmin-login van het juiste gebruikersaccount",
        "Het commando dat je wilt plannen (php-script, curl-URL of shell)",
        "Gewenste frequentie (bijv. elk uur, dagelijks om 03:00)",
      ],
      prepEn: [
        "DirectAdmin login for the correct user account",
        "The command to schedule (php script, curl URL or shell)",
        "Desired frequency (e.g. hourly, daily at 03:00)",
      ],
      stepsNl: [
        "Log in op DirectAdmin.",
        "Open <strong>Advanced Features</strong> → <strong>Cron Jobs</strong>.",
        "Klik op <strong>Create Cron Job</strong> (of Add Cron Job).",
        "Vul de tijdvelden in: Minute, Hour, Day of Month, Month, Day of Week. Voorbeeld dagelijks om 03:15: minute <code>15</code>, hour <code>3</code>, rest <code>*</code>.",
        "Plak het <strong>Command</strong>. Gebruik absolute paden, bijvoorbeeld <code>/usr/local/bin/php /home/GEBRUIKER/domains/domein.nl/public_html/wp-cron.php</code> of <code>curl -s https://jouwdomein.nl/wp-cron.php?doing_wp_cron >/dev/null</code>.",
        "Kies of je cron-output per e-mail wilt (vaak uitzetten of naar een log redirecten met <code>>/home/GEBRUIKER/cron.log 2>&1</code>).",
        "Sla op. De job verschijnt in de lijst.",
      ],
      stepsEn: [
        "Sign in to DirectAdmin.",
        "Open <strong>Advanced Features</strong> → <strong>Cron Jobs</strong>.",
        "Click <strong>Create Cron Job</strong> (or Add Cron Job).",
        "Fill the time fields: Minute, Hour, Day of Month, Month, Day of Week. Example daily at 03:15: minute <code>15</code>, hour <code>3</code>, rest <code>*</code>.",
        "Paste the <strong>Command</strong>. Use absolute paths, e.g. <code>/usr/local/bin/php /home/USER/domains/domain.com/public_html/wp-cron.php</code> or <code>curl -s https://yourdomain.com/wp-cron.php?doing_wp_cron >/dev/null</code>.",
        "Choose whether to email cron output (often disable it, or redirect to a log with <code>>/home/USER/cron.log 2>&1</code>).",
        "Save. The job appears in the list.",
      ],
      verifyNl: [
        "De cronjob staat in de Cron Jobs-lijst met het juiste schema",
        "Na de geplande tijd: log of scriptresultaat is bijgewerkt",
        "Bij WordPress: events lopen (of DISABLE_WP_CRON + servercron werkt)",
      ],
      verifyEn: [
        "The cron job is listed with the correct schedule",
        "After the scheduled time: log or script result was updated",
        "For WordPress: events run (or DISABLE_WP_CRON + server cron works)",
      ],
      tipNl: "Test hetzelfde commando eerst via SSH (als beschikbaar) of een eenmalige run, zodat je syntaxfouten niet in stilte plant.",
      tipEn: "Test the same command via SSH (if available) or a one-off run so you do not schedule silent syntax errors.",
      warnNl: "Relatieve paden en ‘php’ zonder volledig pad falen vaak stil. Mail-output bij elke minuut-job overspoelt je inbox.",
      warnEn: "Relative paths and bare ‘php’ without a full path often fail silently. Email on every-minute jobs floods your inbox.",
      relatedNl: "PHP-versie wijzigen, WordPress-cron, SSH-toegang",
      relatedEn: "Change PHP version, WordPress cron, SSH access",
    };
  }

  if (/letsencrypt|let.?s encrypt|ssl-certificaat|gratis ssl|https forceren/.test(hay)) {
    return {
      excerptNl: "Let’s Encrypt aanvragen in DirectAdmin/SSL Certificates; HTTPS pas forceren na geldig certificaat.",
      excerptEn: "Request Let’s Encrypt in DirectAdmin/SSL Certificates; force HTTPS only after a valid certificate.",
      introNl: `Voor “${titleNl}” moet DNS (A/AAAA) al naar deze server wijzen. Daarna vraag je het certificaat aan in DirectAdmin.`,
      introEn: `For “${titleEn}”, DNS (A/AAAA) must already point at this server. Then request the certificate in DirectAdmin.`,
      prepNl: ["A/AAAA naar TripleZero iT hosting", "DirectAdmin-login", "Apex én www indien beide gebruikt"],
      prepEn: ["A/AAAA to TripleZero iT hosting", "DirectAdmin login", "Apex and www if both are used"],
      stepsNl: [
        "Controleer dat het A/AAAA-record van het domein naar deze server wijst.",
        "Log in op DirectAdmin → <strong>SSL Certificates</strong> (of Let’s Encrypt / Free & automatic certificate).",
        "Selecteer het domein en vink www aan indien nodig.",
        "Vraag het certificaat aan en wacht tot de status geldig/issued is.",
        "Forceer HTTPS via de paneloptie of .htaccess pas ná succesvolle uitgifte.",
        "Test https://jouwdomein in een privévenster.",
      ],
      stepsEn: [
        "Confirm the domain A/AAAA record points at this server.",
        "Sign in to DirectAdmin → <strong>SSL Certificates</strong> (or Let’s Encrypt / Free & automatic certificate).",
        "Select the domain and include www if needed.",
        "Request the certificate and wait until status is valid/issued.",
        "Force HTTPS via the panel option or .htaccess only after successful issuance.",
        "Test https://yourdomain in a private window.",
      ],
      verifyNl: ["Hangslot zonder naamfout", "http redirect naar https werkt"],
      verifyEn: ["Padlock without name mismatch", "http redirects to https"],
      tipNl: "Dek apex en www in één certificaat af.",
      tipEn: "Cover apex and www in one certificate.",
      warnNl: "HTTPS forceren zonder certificaat geeft browserfouten.",
      warnEn: "Forcing HTTPS without a certificate causes browser errors.",
      relatedNl: "DNS A-record, WordPress URL naar HTTPS",
      relatedEn: "DNS A record, WordPress URL to HTTPS",
    };
  }

  if (/\bspf\b|dkim|dmarc/.test(hay)) {
    return {
      excerptNl: "E-mailauthenticatie in DNS: één SPF, DKIM-selectors en DMARC-policy publiceren en testen.",
      excerptEn: "Email authentication in DNS: publish one SPF, DKIM selectors and DMARC policy, then test.",
      introNl: `“${titleNl}” hoort in DNS (TXT), niet in wp-admin. Houd maximaal één SPF-record op @.`,
      introEn: `“${titleEn}” belongs in DNS (TXT), not wp-admin. Keep at most one SPF record on @.`,
      prepNl: ["DNS-toegang", "Lijst van legitieme verzendbronnen (hosting, M365, ESP)"],
      prepEn: ["DNS access", "List of legitimate senders (hosting, M365, ESP)"],
      stepsNl: [
        "Open DNS-beheer voor het domein (klantenpanel of DirectAdmin Zone Editor).",
        "Voor SPF: zoek bestaande <code>v=spf1</code>-TXT’s, voeg samen tot één record, sla op.",
        "Voor DKIM: schakel DKIM in DirectAdmin/mailplatform in en publiceer het getoonde TXT-record.",
        "Voor DMARC: voeg TXT op <code>_dmarc</code> toe, start met <code>v=DMARC1; p=none; rua=mailto:…</code>.",
        "Wacht op propagatie; stuur een testmail en check headers op spf/dkim/dmarc=pass.",
      ],
      stepsEn: [
        "Open DNS management for the domain (client panel or DirectAdmin Zone Editor).",
        "For SPF: find existing <code>v=spf1</code> TXT records, merge into one, save.",
        "For DKIM: enable DKIM in DirectAdmin/mail platform and publish the shown TXT record.",
        "For DMARC: add TXT on <code>_dmarc</code>, start with <code>v=DMARC1; p=none; rua=mailto:…</code>.",
        "Wait for propagation; send a test and check headers for spf/dkim/dmarc=pass.",
      ],
      verifyNl: ["Headers tonen pass", "Geen dubbele SPF"],
      verifyEn: ["Headers show pass", "No duplicate SPF"],
      tipNl: "Begin DMARC op p=none tot rapporten schoon zijn.",
      tipEn: "Start DMARC at p=none until reports are clean.",
      warnNl: "DMARC reject zonder volledige SPF/DKIM-dekking stopt legitieme mail.",
      warnEn: "DMARC reject without full SPF/DKIM coverage stops legitimate mail.",
      relatedNl: "DNS TXT, webmail, Microsoft 365",
      relatedEn: "DNS TXT, webmail, Microsoft 365",
    };
  }

  if (/php.?versie|php version|php.?selector|php.?instellingen/.test(hay)) {
    return {
      excerptNl: "PHP-versie per domein wijzigen in DirectAdmin en daarna site + wp-admin testen.",
      excerptEn: "Change PHP version per domain in DirectAdmin, then test the site and wp-admin.",
      introNl: `“${titleNl}”: kies PHP per domein. Te oud is onveilig; te nieuw kan plugins breken.`,
      introEn: `“${titleEn}”: pick PHP per domain. Too old is unsafe; too new can break plugins.`,
      prepNl: ["Backup bij kritieke site", "Gewenste PHP-versie"],
      prepEn: ["Backup for critical sites", "Target PHP version"],
      stepsNl: [
        "Log in op DirectAdmin en selecteer het domein.",
        "Open <strong>Domain Setup</strong> → <strong>PHP Version Select</strong> (of MultiPHP).",
        "Kies de versie en sla op.",
        "Purge caches indien actief.",
        "Test homepage, wp-admin en kritieke formulieren/checkout.",
      ],
      stepsEn: [
        "Sign in to DirectAdmin and select the domain.",
        "Open <strong>Domain Setup</strong> → <strong>PHP Version Select</strong> (or MultiPHP).",
        "Choose the version and save.",
        "Purge caches if enabled.",
        "Test homepage, wp-admin and critical forms/checkout.",
      ],
      verifyNl: ["Panel/phpinfo toont nieuwe versie", "Geen critical error"],
      verifyEn: ["Panel/phpinfo shows new version", "No critical error"],
      tipNl: "Wijzig één versie tegelijk; combineer niet met bulk plugin-updates.",
      tipEn: "Change one version at a time; do not combine with bulk plugin updates.",
      warnNl: "EOL PHP hoort niet op productie.",
      warnEn: "EOL PHP does not belong in production.",
      relatedNl: "WordPress critical error, Installatron-backup",
      relatedEn: "WordPress critical error, Installatron backup",
    };
  }

  if (/ftp|filezilla|sftp|chmod|bestandsrechten/.test(hay)) {
    if (/filezilla|verbinden/.test(hay)) {
      return {
        excerptNl:
          "FileZilla verbinden: host, gebruiker, wachtwoord, poort en FTPS/SFTP uit DirectAdmin of je welkomstmail.",
        excerptEn:
          "Connect FileZilla: host, user, password, port and FTPS/SFTP from DirectAdmin or your welcome email.",
        introNl: `FileZilla is een FTP/SFTP-client. Voor “${titleNl}” haal je de gegevens uit DirectAdmin → FTP Management (of je welkomstmail) en maak je in FileZilla een site met encryptie.`,
        introEn: `FileZilla is an FTP/SFTP client. For “${titleEn}” get details from DirectAdmin → FTP Management (or your welcome email) and create an encrypted FileZilla site.`,
        prepNl: [
          "FileZilla Client geïnstalleerd",
          "DirectAdmin-login of welkomstmail met FTP-host",
          "FTP-gebruikersnaam + wachtwoord",
        ],
        prepEn: [
          "FileZilla Client installed",
          "DirectAdmin login or welcome email with FTP host",
          "FTP username + password",
        ],
        stepsNl: [
          "DirectAdmin → <strong>FTP Management</strong>: noteer of maak een FTP-account; noteer de home-directory (vaak <code>.../public_html</code>).",
          "FileZilla → <strong>Bestand</strong> → <strong>Sitebeheerder</strong> → <strong>Nieuwe site</strong>.",
          "Protocol: <strong>FTP</strong> met Encryptie <strong>Expliciete FTP over TLS vereisen</strong>, of <strong>SFTP</strong> (poort 22) als dat op je pakket mag.",
          "Host = serverhostname uit de welkomstmail (niet altijd je domeinnaam). Poort 21 (FTPS) of 22 (SFTP).",
          "Logontype Normaal: FTP-user + wachtwoord → <strong>Verbinden</strong>. Accepteer certificaat/host key alleen als de host klopt.",
          "Rechts: server. Open <code>public_html</code> (of de FTP-home). Links: je PC.",
          "Upload <code>ftp-test.txt</code>, open via https://jouwdomein/ftp-test.txt, verwijder daarna het testbestand.",
        ],
        stepsEn: [
          "DirectAdmin → <strong>FTP Management</strong>: note or create an FTP account; note the home directory (often <code>.../public_html</code>).",
          "FileZilla → <strong>File</strong> → <strong>Site Manager</strong> → <strong>New site</strong>.",
          "Protocol: <strong>FTP</strong> with Encryption <strong>Require explicit FTP over TLS</strong>, or <strong>SFTP</strong> (port 22) if allowed.",
          "Host = server hostname from the welcome email (not always your domain). Port 21 (FTPS) or 22 (SFTP).",
          "Logon type Normal: FTP user + password → <strong>Connect</strong>. Accept certificate/host key only if the host matches.",
          "Right pane: server. Open <code>public_html</code> (or FTP home). Left pane: your PC.",
          "Upload <code>ftp-test.txt</code>, open via https://yourdomain/ftp-test.txt, then delete the test file.",
        ],
        verifyNl: [
          "Stabiele verbinding",
          "public_html / verwachte mappen zichtbaar",
          "Testbestand via HTTP bereikbaar en weer verwijderd",
        ],
        verifyEn: [
          "Stable connection",
          "public_html / expected folders visible",
          "Test file reachable via HTTP and then deleted",
        ],
        tipNl:
          "‘Mappenlijst mislukt’: Passief, TLS forceren, of SFTP. Check of poort 21/22 geblokkeerd is.",
        tipEn:
          "‘Failed to retrieve directory listing’: Passive mode, force TLS, or SFTP. Check ports 21/22.",
        warnNl: "Geen plain FTP op openbare wifi. FTP-wachtwoorden niet in tickets plakken.",
        warnEn: "No plain FTP on public Wi-Fi. Do not paste FTP passwords into tickets.",
        relatedNl: "FTP-account aanmaken, SFTP, CHMOD, File Manager",
        relatedEn: "Create FTP account, SFTP, CHMOD, File Manager",
      };
    }
    return {
      excerptNl: "FTP/SFTP in DirectAdmin: account, home-map, verbinden met FileZilla.",
      excerptEn: "FTP/SFTP in DirectAdmin: account, home folder, connect with FileZilla.",
      introNl: `“${titleNl}”: FTP-account met beperkte home-map; verbind bij voorkeur met FTPS of SFTP.`,
      introEn: `“${titleEn}”: FTP account with a limited home folder; prefer FTPS or SFTP.`,
      prepNl: ["DirectAdmin-login", "FileZilla", "Host uit welkomstmail"],
      prepEn: ["DirectAdmin login", "FileZilla", "Host from welcome email"],
      stepsNl: [
        "DirectAdmin → <strong>FTP Management</strong> → Create (of bestaand account).",
        "Beperk Directory tot de bedoelde webroot/submap.",
        "FileZilla: host = serverhostname, user/wachtwoord, poort 21 (FTPS) of 22 (SFTP).",
        "Kies expliciete FTP over TLS of SFTP — geen plain FTP.",
        "Upload een testbestand en controleer het pad in de browser.",
      ],
      stepsEn: [
        "DirectAdmin → <strong>FTP Management</strong> → Create (or existing account).",
        "Limit Directory to the intended web root/subdirectory.",
        "FileZilla: host = server hostname, user/password, port 21 (FTPS) or 22 (SFTP).",
        "Choose explicit FTP over TLS or SFTP — not plain FTP.",
        "Upload a test file and confirm the path in the browser.",
      ],
      verifyNl: ["Verbinding stabiel", "Testbestand op verwachte URL"],
      verifyEn: ["Stable connection", "Test file on expected URL"],
      tipNl: "SFTP is vaak stabieler achter strenge firewalls.",
      tipEn: "SFTP is often more stable behind strict firewalls.",
      warnNl: "Geen 777-rechten ‘om het te laten werken’.",
      warnEn: "Do not use 777 permissions ‘to make it work’.",
      relatedNl: "File Manager, rechten, SFTP",
      relatedEn: "File Manager, permissions, SFTP",
    };
  }

  if (/mailbox|e-mailadres aanmaken|nieuw e-mail|create.?mailbox|webmail|out.of.office|autorespond|catch.?all|handtekening/.test(hay) || (/e-mail|email/.test(hay) && /directadmin|aanmaken|wachtwoord|quota/.test(hay))) {
    if (/out.of.office|autorespond|afwezig|\booo\b/.test(hay)) {
      return {
        excerptNl: "Out-of-office / autoresponder per mailbox in DirectAdmin of webmail.",
        excerptEn: "Out-of-office / autoresponder per mailbox in DirectAdmin or webmail.",
        introNl: `“${titleNl}” stel je in per mailbox via DirectAdmin Autoresponders (of webmail-filters), met start-/einddatum.`,
        introEn: `“${titleEn}” is set per mailbox via DirectAdmin Autoresponders (or webmail filters), with start/end dates.`,
        prepNl: ["DirectAdmin- of webmail-login", "Tekst", "Periode"],
        prepEn: ["DirectAdmin or webmail login", "Message text", "Date range"],
        stepsNl: [
          "DirectAdmin → E-mail Accounts / Autoresponders (of webmail → Filters).",
          "Selecteer de juiste mailbox.",
          "Schakel autoresponder in; vul onderwerp + body; zet datums.",
          "Test vanaf een extern adres (één reply).",
          "Zet uit na afloop.",
        ],
        stepsEn: [
          "DirectAdmin → Email Accounts / Autoresponders (or webmail → Filters).",
          "Select the correct mailbox.",
          "Enable autoresponder; set subject + body; set dates.",
          "Test from an external address (one reply).",
          "Disable afterwards.",
        ],
        verifyNl: ["Externe test krijgt één auto-reply"],
        verifyEn: ["External test gets one auto-reply"],
        tipNl: "Vermeld een alternatief contact in de tekst.",
        tipEn: "Include an alternate contact in the text.",
        warnNl: "Autoresponder op catch-all zonder limiet → spamstorm.",
        warnEn: "Autoresponder on catch-all without limits → spam storm.",
        relatedNl: "Webmail, mailbox aanmaken",
        relatedEn: "Webmail, create mailbox",
      };
    }
    if (/webmail/.test(hay)) {
      return {
        excerptNl: "Webmail openen vanuit DirectAdmin of de webmail-URL met mailboxwachtwoord.",
        excerptEn: "Open webmail from DirectAdmin or the webmail URL with the mailbox password.",
        introNl: `“${titleNl}”: log in met het volledige e-mailadres en het mailboxwachtwoord (niet het DirectAdmin-wachtwoord).`,
        introEn: `“${titleEn}”: sign in with the full email address and mailbox password (not the DirectAdmin password).`,
        prepNl: ["Webmail-URL of DA-link", "Mailbox + wachtwoord"],
        prepEn: ["Webmail URL or DA link", "Mailbox + password"],
        stepsNl: [
          "Open DirectAdmin → E-mail Accounts of de webmail-link uit de welkomstmail.",
          "Kies Roundcube / Webmail Pro.",
          "Log in met volledig adres + mailboxwachtwoord.",
          "Controleer Inbox en stuur een test naar extern.",
        ],
        stepsEn: [
          "Open DirectAdmin → Email Accounts or the webmail link from the welcome email.",
          "Choose Roundcube / Webmail Pro.",
          "Sign in with full address + mailbox password.",
          "Check Inbox and send an external test.",
        ],
        verifyNl: ["Inbox opent", "Verzenden werkt"],
        verifyEn: ["Inbox opens", "Sending works"],
        tipNl: "Werkt webmail wel en Outlook niet → fix clientinstellingen.",
        tipEn: "If webmail works and Outlook does not → fix client settings.",
        warnNl: "Op publieke computers altijd uitloggen.",
        warnEn: "On public computers always sign out.",
        relatedNl: "Mailboxwachtwoord, IMAP/SMTP",
        relatedEn: "Mailbox password, IMAP/SMTP",
      };
    }
    return {
      excerptNl: "Mailbox aanmaken of beheren in DirectAdmin E-mail Accounts.",
      excerptEn: "Create or manage a mailbox in DirectAdmin Email Accounts.",
      introNl: `“${titleNl}” regel je per domein in DirectAdmin → E-mail Accounts.`,
      introEn: `“${titleEn}” is handled per domain in DirectAdmin → Email Accounts.`,
      prepNl: ["DirectAdmin-login", "Gewenst adres", "Sterk wachtwoord"],
      prepEn: ["DirectAdmin login", "Desired address", "Strong password"],
      stepsNl: [
        "Selecteer het domein in DirectAdmin.",
        "Open <strong>E-mail Accounts</strong>.",
        "Create Account / wijzig quota of wachtwoord.",
        "Test in webmail met volledig adres + mailboxwachtwoord.",
      ],
      stepsEn: [
        "Select the domain in DirectAdmin.",
        "Open <strong>Email Accounts</strong>.",
        "Create Account / change quota or password.",
        "Test in webmail with full address + mailbox password.",
      ],
      verifyNl: ["Webmail login lukt"],
      verifyEn: ["Webmail login works"],
      tipNl: "Noteer IMAP/SMTP uit de welkomstmail voor desktopclients.",
      tipEn: "Note IMAP/SMTP from the welcome email for desktop clients.",
      warnNl: "Deel mailboxwachtwoorden niet in tickets.",
      warnEn: "Do not paste mailbox passwords into tickets.",
      relatedNl: "Webmail, SPF, quota",
      relatedEn: "Webmail, SPF, quota",
    };
  }

  if (/dns|a-record|cname|nameserver|zone|mx-record|forward|redirect/.test(hay) && !/wordpress|wp-/.test(hay)) {
    return {
      excerptNl: "DNS-records beheren: juiste zone, één wijziging, externe lookup ter controle.",
      excerptEn: "Manage DNS records: correct zone, one change, verify with an external lookup.",
      introNl: `“${titleNl}” doe je in DNS-beheer (klantenpanel of DirectAdmin Zone Editor). Wijzig alleen het benodigde recordtype.`,
      introEn: `“${titleEn}” is done in DNS management (client panel or DirectAdmin Zone Editor). Change only the required record type.`,
      prepNl: ["DNS-toegang", "Screenshot/export van de huidige zone"],
      prepEn: ["DNS access", "Screenshot/export of the current zone"],
      stepsNl: [
        "Open DNS-beheer voor het juiste domein.",
        "Exporteer of screenshot de zone.",
        "Pas A, AAAA, CNAME, MX, TXT of NS aan — alleen wat nodig is.",
        "Sla op; wacht op TTL/propagatie.",
        "Controleer met een externe lookup; test daarna site of mail.",
      ],
      stepsEn: [
        "Open DNS management for the correct domain.",
        "Export or screenshot the zone.",
        "Change A, AAAA, CNAME, MX, TXT or NS — only what is needed.",
        "Save; wait for TTL/propagation.",
        "Verify with an external lookup; then test site or mail.",
      ],
      verifyNl: ["Lookup toont nieuwe waarde", "Geen conflicterende duplicaten"],
      verifyEn: ["Lookup shows new value", "No conflicting duplicates"],
      tipNl: "CNAME op apex alleen met ALIAS/ANAME — anders A/AAAA.",
      tipEn: "CNAME on apex only with ALIAS/ANAME — otherwise A/AAAA.",
      warnNl: "Nameserver-wijzigingen propagëren langer dan één record.",
      warnEn: "Nameserver changes propagate longer than a single record.",
      relatedNl: "SPF, SSL, domein forward",
      relatedEn: "SPF, SSL, domain forward",
    };
  }

  if (/wordpress|wp-admin|woocommerce|plugin|thema|critical error|comment|reactie/.test(hay)) {
    if (/comment|reactie/.test(hay) && /spam/.test(hay)) {
      return {
        excerptNl: "Reacties in spam: controleer Moderatie/Spam, Discussie-instellingen en anti-spam plugins.",
        excerptEn: "Comments in spam: check Moderation/Spam, Discussion settings and anti-spam plugins.",
        introNl: `“${titleNl}” speelt in WordPress-moderatie en anti-spam — niet in DNS of SSL.`,
        introEn: `“${titleEn}” is about WordPress moderation and anti-spam — not DNS or SSL.`,
        prepNl: ["wp-admin toegang", "Welke anti-spam plugin actief is"],
        prepEn: ["wp-admin access", "Which anti-spam plugin is active"],
        stepsNl: [
          "Open wp-admin → <strong>Reacties</strong> en check Spam én Moderatie.",
          "Ga naar Instellingen → Discussie: goedkeuring, linklimits, notificaties.",
          "Open Akismet of je anti-spam plugin: API-key, false positives, whitelist.",
          "Test een reactie vanaf een ander netwerk (admins bypassen filters vaak).",
          "Bij plotselinge spam na update: laatste anti-spam plugin tijdelijk uit en herhaal de test.",
        ],
        stepsEn: [
          "Open wp-admin → <strong>Comments</strong> and check Spam and Moderation.",
          "Go to Settings → Discussion: approval, link limits, notifications.",
          "Open Akismet or your anti-spam plugin: API key, false positives, whitelist.",
          "Test a comment from another network (admins often bypass filters).",
          "If spam spiked after an update: temporarily disable the last anti-spam plugin and retest.",
        ],
        verifyNl: ["Testreactie landt in Moderatie of Goedgekeurd", "Geen botflood na versoepelen"],
        verifyEn: ["Test comment lands in Moderation or Approved", "No bot flood after relaxing filters"],
        tipNl: "Whitelist je eigen e-maildomein als medewerkersreacties verdwijnen.",
        tipEn: "Whitelist your own email domain if staff comments disappear.",
        warnNl: "Anti-spam niet volledig uitzetten op een publieke site.",
        warnEn: "Do not fully disable anti-spam on a public site.",
        relatedNl: "WordPress login, cache legen",
        relatedEn: "WordPress login, clear cache",
      };
    }
    if (/down|critical error|kritieke fout|witte pagina/.test(hay)) {
      return {
        excerptNl: "WordPress down/critical error: plugins isoleren via File Manager, PHP checken, cache legen.",
        excerptEn: "WordPress down/critical error: isolate plugins via File Manager, check PHP, clear cache.",
        introNl: `Bij “${titleNl}” isoleer je eerst plugins/thema via bestanden als wp-admin niet opent.`,
        introEn: `For “${titleEn}”, isolate plugins/theme via files first if wp-admin will not open.`,
        prepNl: ["Backup", "DirectAdmin File Manager of SFTP"],
        prepEn: ["Backup", "DirectAdmin File Manager or SFTP"],
        stepsNl: [
          "Noteer de fouttekst (critical error / 500 / witte pagina).",
          "Via File Manager: hernoem <code>wp-content/plugins</code> naar <code>plugins-off</code>.",
          "Werkt de site: hernoem terug en activeer plugins één voor één tot de boosdoener duidelijk is.",
          "Thema-probleem: activeer een default thema via bestanden of database.",
          "Controleer DirectAdmin → PHP Version Select bij fatals na een update.",
          "Leeg alle caches en test wp-admin + homepage.",
        ],
        stepsEn: [
          "Note the error text (critical error / 500 / white screen).",
          "Via File Manager: rename <code>wp-content/plugins</code> to <code>plugins-off</code>.",
          "If the site recovers: rename back and enable plugins one by one until the culprit is clear.",
          "Theme issue: activate a default theme via files or the database.",
          "Check DirectAdmin → PHP Version Select on fatals after an update.",
          "Clear all caches and test wp-admin + homepage.",
        ],
        verifyNl: ["Homepage en wp-admin laden", "Geen PHP fatals in error_log"],
        verifyEn: ["Homepage and wp-admin load", "No PHP fatals in error_log"],
        tipNl: "Update niet opnieuw voordat de boosdoener geïsoleerd is.",
        tipEn: "Do not update again until the culprit is isolated.",
        warnNl: "Wis geen uploads of database tijdens ‘opschonen’.",
        warnEn: "Do not delete uploads or the database while ‘cleaning’.",
        relatedNl: "PHP-versie, Installatron-backup",
        relatedEn: "PHP version, Installatron backup",
      };
    }
    if (/woocommerce|checkout|winkelwagen|webshop/.test(hay)) {
      return {
        excerptNl: "WooCommerce: backup, checkout testen, cache-uitzonderingen, Status-pagina.",
        excerptEn: "WooCommerce: backup, test checkout, cache exclusions, Status page.",
        introNl: `“${titleNl}” raakt WooCommerce-checkout, betaalplugins of cache. Werk met backup en testorders.`,
        introEn: `“${titleEn}” touches WooCommerce checkout, payment plugins or cache. Work with a backup and test orders.`,
        prepNl: ["Backup", "wp-admin", "Testorder mogelijk of staging"],
        prepEn: ["Backup", "wp-admin", "Test order possible or staging"],
        stepsNl: [
          "Maak een backup.",
          "Test checkout in een privévenster; noteer exacte fout of hangpunt.",
          "Sluit cart/checkout/mijn-account uit van full-page cache.",
          "Open WooCommerce → Status: fouten, webhooks, geplande acties.",
          "Schakel de laatst gewijzigde checkout-/betaalplugin uit om te isoleren.",
          "Herhaal de testorder.",
        ],
        stepsEn: [
          "Create a backup.",
          "Test checkout in a private window; note the exact error or hang point.",
          "Exclude cart/checkout/my-account from full-page cache.",
          "Open WooCommerce → Status: errors, webhooks, scheduled actions.",
          "Disable the last changed checkout/payment plugin to isolate.",
          "Repeat the test order.",
        ],
        verifyNl: ["Testorder rondt af", "Bevestigingsmail komt aan"],
        verifyEn: ["Test order completes", "Confirmation email arrives"],
        tipNl: "Gebruik sandbox/testmode van de betaalprovider waar mogelijk.",
        tipEn: "Use the payment provider sandbox/test mode where possible.",
        warnNl: "Full-page cache op checkout veroorzaakt lege carts of dubbele orders.",
        warnEn: "Full-page cache on checkout causes empty carts or duplicate orders.",
        relatedNl: "Cache, PHP-versie, e-mailauthenticatie",
        relatedEn: "Cache, PHP version, email authentication",
      };
    }
    if (/plugin/.test(hay)) {
      return {
        excerptNl: "WordPress-plugin: backup, via Plugins installeren/bijwerken/deactiveren, daarna testen.",
        excerptEn: "WordPress plugin: backup, install/update/deactivate via Plugins, then test.",
        introNl: `“${titleNl}” doe je via wp-admin → Plugins. Bij een fatal: pluginmap hernoemen via File Manager.`,
        introEn: `“${titleEn}” is done via wp-admin → Plugins. On a fatal: rename the plugin folder via File Manager.`,
        prepNl: ["Backup files + database", "wp-admin"],
        prepEn: ["Backup files + database", "wp-admin"],
        stepsNl: [
          "Maak een backup.",
          "Open wp-admin → Plugins.",
          "Installeer, werk bij, deactiveer of verwijder alleen de bedoelde plugin.",
          "Leeg caches.",
          "Test de pagina’s/flows die die plugin raakt.",
        ],
        stepsEn: [
          "Create a backup.",
          "Open wp-admin → Plugins.",
          "Install, update, deactivate or delete only the intended plugin.",
          "Clear caches.",
          "Test the pages/flows that plugin affects.",
        ],
        verifyNl: ["Pluginstatus klopt", "Geen critical error"],
        verifyEn: ["Plugin status correct", "No critical error"],
        tipNl: "Eén plugin tegelijk updaten op productie.",
        tipEn: "Update one plugin at a time in production.",
        warnNl: "Verwijder geen map met custom code zonder archive.",
        warnEn: "Do not delete a folder with custom code without an archive.",
        relatedNl: "Critical error, Installatron-backup",
        relatedEn: "Critical error, Installatron backup",
      };
    }
    // Default WordPress howto — concrete menus, no “screen that matches title”
    return {
      excerptNl: `${titleNl}: backup, wp-admin, cache legen, controleren.`,
      excerptEn: `${titleEn}: backup, wp-admin, clear cache, verify.`,
      introNl: `Voor “${titleNl}” werk je in WordPress (/wp-admin) op TripleZero iT hosting. Maak eerst een backup; wijzig daarna gericht en leeg de cache.`,
      introEn: `For “${titleEn}” you work in WordPress (/wp-admin) on TripleZero iT hosting. Take a backup first; then change carefully and clear caches.`,
      prepNl: [
        "Installatron- of panel-backup (files + database)",
        "Login op /wp-admin van de juiste site",
        "DirectAdmin File Manager als wp-admin niet opent",
      ],
      prepEn: [
        "Installatron or panel backup (files + database)",
        "Login to /wp-admin of the correct site",
        "DirectAdmin File Manager if wp-admin will not open",
      ],
      stepsNl: [
        "Maak een backup via Installatron of DirectAdmin.",
        "Log in op <code>/wp-admin</code>.",
        "Voer de wijziging door in het juiste menu: Plugins, Thema’s, Instellingen, Gebruikers, Media of WooCommerce.",
        "Sla op. Bij een critical error: hernoem via File Manager tijdelijk <code>wp-content/plugins</code> of activeer een default thema.",
        "Leeg page-cache, object-cache en CDN-cache.",
        "Test de homepage, login en een kritieke flow (formulier of checkout).",
      ],
      stepsEn: [
        "Create a backup via Installatron or DirectAdmin.",
        "Sign in to <code>/wp-admin</code>.",
        "Apply the change in the correct menu: Plugins, Themes, Settings, Users, Media or WooCommerce.",
        "Save. On a critical error: via File Manager temporarily rename <code>wp-content/plugins</code> or activate a default theme.",
        "Clear page cache, object cache and CDN cache.",
        "Test the homepage, login and a critical flow (form or checkout).",
      ],
      verifyNl: ["Geen critical error", "Wijziging zichtbaar op de voorkant of in wp-admin"],
      verifyEn: ["No critical error", "Change visible on the front end or in wp-admin"],
      tipNl: "Wijzig één plugin of thema tegelijk — snellere rollback.",
      tipEn: "Change one plugin or theme at a time — faster rollback.",
      warnNl: "Verwijder geen uploads-map of database-tabellen zonder restoreplan.",
      warnEn: "Do not delete the uploads folder or database tables without a restore plan.",
      relatedNl: "Installatron-backup, PHP-versie, critical error",
      relatedEn: "Installatron backup, PHP version, critical error",
    };
  }

  if (/cyberpanel|openlitespeed/.test(hay)) {
    return {
      excerptNl: "CyberPanel: website selecteren, juiste module (SSL/DNS/Email/Files/Backup), OLS-cache legen.",
      excerptEn: "CyberPanel: select website, correct module (SSL/DNS/Email/Files/Backup), purge OLS cache.",
      introNl: `In CyberPanel kies je eerst de website. Voor “${titleNl}” open je daarna SSL, DNS, Email, File Manager of Backup — afhankelijk van de taak.`,
      introEn: `In CyberPanel select the website first. For “${titleEn}” then open SSL, DNS, Email, File Manager or Backup — depending on the task.`,
      prepNl: ["CyberPanel-URL + login", "Domeinnaam"],
      prepEn: ["CyberPanel URL + login", "Domain name"],
      stepsNl: [
        "Log in op CyberPanel (poort 8090 of welkomstlink).",
        "Ga naar Websites en open het juiste domein.",
        "Kies de module: SSL, DNS, Email, File Manager, Databases of Backup.",
        "Voer de wijziging door en sla op.",
        "Purge OpenLiteSpeed-cache als de site oude content toont.",
        "Bij 500/witte pagina: open Error Logs van die website.",
      ],
      stepsEn: [
        "Sign in to CyberPanel (port 8090 or welcome link).",
        "Go to Websites and open the correct domain.",
        "Choose the module: SSL, DNS, Email, File Manager, Databases or Backup.",
        "Apply the change and save.",
        "Purge OpenLiteSpeed cache if the site shows old content.",
        "On 500/white screen: open Error Logs for that website.",
      ],
      verifyNl: ["Wijziging zichtbaar op de live URL", "Geen nieuwe errors in de logs"],
      verifyEn: ["Change visible on the live URL", "No new errors in the logs"],
      tipNl: "Noteer oude DNS/SSL-waarden vóór je opslaat.",
      tipEn: "Note old DNS/SSL values before you save.",
      warnNl: "Verkeerde website selecteren wijzigt productie van een andere site.",
      warnEn: "Selecting the wrong website changes another site’s production.",
      relatedNl: "CyberPanel login, SSL, OLS cache",
      relatedEn: "CyberPanel login, SSL, OLS cache",
    };
  }

  if (/\bplesk\b/.test(hay)) {
    return {
      excerptNl: "Plesk: juiste subscription openen, tool gebruiken (Mail/DNS/SSL/Files/WordPress), extern testen.",
      excerptEn: "Plesk: open the correct subscription, use the tool (Mail/DNS/SSL/Files/WordPress), test externally.",
      introNl: `In Plesk horen wijzigingen bij één abonnement. Voor “${titleNl}” open je eerst dat abonnement, daarna Mail, DNS, SSL/TLS, Files, Databases of WordPress Toolkit.`,
      introEn: `In Plesk, changes belong to one subscription. For “${titleEn}” open that subscription first, then Mail, DNS, SSL/TLS, Files, Databases or WordPress Toolkit.`,
      prepNl: ["Plesk-login", "Juiste subscription/domein"],
      prepEn: ["Plesk login", "Correct subscription/domain"],
      stepsNl: [
        "Log in op Plesk (poort 8443 of welkomstlink).",
        "Selecteer het juiste abonnement of domein (zoekbalk).",
        "Open Mail, DNS, SSL/TLS, Files, Databases of WordPress Toolkit.",
        "Voer de wijziging door en bevestig.",
        "Test extern: browser, mailclient of DNS-lookup.",
      ],
      stepsEn: [
        "Sign in to Plesk (port 8443 or welcome link).",
        "Select the correct subscription or domain (search bar).",
        "Open Mail, DNS, SSL/TLS, Files, Databases or WordPress Toolkit.",
        "Apply the change and confirm.",
        "Test externally: browser, mail client or DNS lookup.",
      ],
      verifyNl: ["Resultaat zichtbaar buiten Plesk"],
      verifyEn: ["Result visible outside Plesk"],
      tipNl: "Als reseller: open eerst het klantaccount, niet je eigen admin-context.",
      tipEn: "As a reseller: open the customer account first, not your own admin context.",
      warnNl: "Blind werken in het verkeerde subscription raakt de verkeerde klant.",
      warnEn: "Working blindly in the wrong subscription hits the wrong customer.",
      relatedNl: "Plesk SSL, DNS, WordPress Toolkit",
      relatedEn: "Plesk SSL, DNS, WordPress Toolkit",
    };
  }

  if ((/\bssh\b/.test(hay) || /\bvps\b/.test(hay)) && !/ftp|filezilla|wordpress|dns|spf|mail|cron|woocommerce/.test(hay)) {
    return {
      excerptNl: "VPS/SSH: rechten checken, snapshot, gerichte wijziging, alleen betrokken dienst herstarten.",
      excerptEn: "VPS/SSH: check rights, snapshot, targeted change, restart only the affected service.",
      introNl: `“${titleNl}” op een VPS/server: bevestig eerst of je SSH of de provider-console hebt. Bij riskante wijzigingen (firewall, users) maak je eerst een snapshot.`,
      introEn: `“${titleEn}” on a VPS/server: first confirm you have SSH or the provider console. For risky changes (firewall, users) take a snapshot first.`,
      prepNl: ["Bevestiging of SSH op jouw pakket mag", "IP/user/key of console", "Snapshot bij riskante edits"],
      prepEn: ["Confirm SSH is allowed on your plan", "IP/user/key or console", "Snapshot for risky edits"],
      stepsNl: [
        "Bevestig in welkomstmail/klantenpanel of SSH/VPS van toepassing is.",
        "Verbind met SSH of open de provider-console.",
        "Voer alleen de geplande wijziging door (dienst, firewallregel, limiet).",
        "Herstart enkel de betrokken dienst.",
        "Controleer poorten, processen en monitoring/uptime.",
      ],
      stepsEn: [
        "Confirm in welcome email/client panel whether SSH/VPS applies.",
        "Connect with SSH or open the provider console.",
        "Apply only the planned change (service, firewall rule, limit).",
        "Restart only the affected service.",
        "Check ports, processes and monitoring/uptime.",
      ],
      verifyNl: ["SSH of dienst bereikbaar zoals bedoeld"],
      verifyEn: ["SSH or service reachable as intended"],
      tipNl: "Houd de console-URL bij de hand vóór firewall-edits.",
      tipEn: "Keep the console URL handy before firewall edits.",
      warnNl: "Sluit je eigen SSH-poort niet af zonder console-pad.",
      warnEn: "Do not close your own SSH port without a console path.",
      relatedNl: "Snapshots, firewall, SFTP",
      relatedEn: "Snapshots, firewall, SFTP",
    };
  }

  if (/directadmin|installatron|jetbackup|file manager|database|mysql/.test(hay)) {
    return {
      excerptNl: `${titleNl}: DirectAdmin — juiste module, wijzigen, buiten het panel testen.`,
      excerptEn: `${titleEn}: DirectAdmin — correct module, change, test outside the panel.`,
      introNl: `“${titleNl}” doe je in DirectAdmin. Gebruik de module die bij de taak past: Account Manager, E-mail Accounts, DNS Management, File Manager, Installatron, SSL Certificates, Cron Jobs of MySQL Management.`,
      introEn: `“${titleEn}” is done in DirectAdmin. Use the module for the task: Account Manager, Email Accounts, DNS Management, File Manager, Installatron, SSL Certificates, Cron Jobs or MySQL Management.`,
      prepNl: ["DirectAdmin-login", "Juiste domein/user", "Backup bij riskante wijzigingen"],
      prepEn: ["DirectAdmin login", "Correct domain/user", "Backup for risky changes"],
      stepsNl: [
        "Log in op DirectAdmin en selecteer het juiste account/domein.",
        "Open de relevante module (E-mail, DNS, File Manager, Installatron, SSL, Cron Jobs of MySQL).",
        "Noteer de huidige waarde of status.",
        "Voer de wijziging door en sla op.",
        "Test buiten DirectAdmin: browser, webmail, DNS-lookup of cron-log.",
      ],
      stepsEn: [
        "Sign in to DirectAdmin and select the correct account/domain.",
        "Open the relevant module (Email, DNS, File Manager, Installatron, SSL, Cron Jobs or MySQL).",
        "Note the current value or status.",
        "Apply the change and save.",
        "Test outside DirectAdmin: browser, webmail, DNS lookup or cron log.",
      ],
      verifyNl: ["Verwachte uitkomst zichtbaar buiten DirectAdmin"],
      verifyEn: ["Expected outcome visible outside DirectAdmin"],
      tipNl: "Blijf op één domein werken tot de taak klaar is.",
      tipEn: "Stay on one domain until the task is done.",
      warnNl: "Wijzigingen onder het verkeerde user-account raken de verkeerde site.",
      warnEn: "Changes under the wrong user account hit the wrong site.",
      relatedNl: "Backups, SSL, e-mail, DNS",
      relatedEn: "Backups, SSL, email, DNS",
    };
  }

  // Generic but still concrete — client panel / account tasks
  return {
    excerptNl: `${titleNl}: in het TripleZero iT klantenpanel of DirectAdmin uitvoeren en controleren.`,
    excerptEn: `${titleEn}: complete in the TripleZero iT client panel or DirectAdmin and verify.`,
    introNl: `Voor “${titleNl}” werkt u in het TripleZero iT klantenpanel (domeinen, facturen, tickets, producten) of in DirectAdmin voor technische hostingzaken. Kies één systeem en rond de taak daar af.`,
    introEn: `For “${titleEn}” work in the TripleZero iT client panel (domains, invoices, tickets, products) or in DirectAdmin for technical hosting tasks. Pick one system and finish the task there.`,
    prepNl: ["Klantenpanel- of DirectAdmin-login", "Domeinnaam of klantnummer", "Backup bij structurele wijzigingen"],
    prepEn: ["Client panel or DirectAdmin login", "Domain name or customer number", "Backup for structural changes"],
    stepsNl: [
      "Log in op het TripleZero iT klantenpanel of DirectAdmin.",
      "Open Domeinen, DNS, Producten, Facturen, Tickets of de DirectAdmin-module die bij de taak past.",
      "Noteer de huidige status of waarde.",
      "Voer de wijziging door en bevestig waar het systeem dat vraagt.",
      "Controleer status, bevestigingsmail of een externe test (site/mail/DNS).",
    ],
    stepsEn: [
      "Sign in to the TripleZero iT client panel or DirectAdmin.",
      "Open Domains, DNS, Products, Invoices, Tickets or the DirectAdmin module for the task.",
      "Note the current status or value.",
      "Apply the change and confirm when prompted.",
      "Check status, confirmation email or an external test (site/mail/DNS).",
    ],
    verifyNl: ["Status in het panel is bijgewerkt", "Externe test klopt indien van toepassing"],
    verifyEn: ["Status in the panel is updated", "External test passes where applicable"],
    tipNl: "Vermeld domein, tijdstip en exacte fouttekst in tickets.",
    tipEn: "Include domain, timestamp and exact error text in tickets.",
    warnNl: "Geen destructieve deletes (domein/hosting) zonder export of opzegbevestiging.",
    warnEn: "No destructive deletes (domain/hosting) without an export or cancellation confirmation.",
    relatedNl: "Tickets, backups, DNS en SSL",
    relatedEn: "Tickets, backups, DNS and SSL",
  };
}

/** Build a procedural NL+EN guide with real steps (no meta-filler). */
export function buildProceduralGuide(
  article: GuideArticle,
  enTitle: string,
): ProceduralGuide {
  const titleNl = subject(article.title);
  const titleEn = subject(enTitle);
  const pack = matchPack(hayOf(article), titleNl, titleEn);
  return {
    excerptNl: pack.excerptNl,
    excerptEn: pack.excerptEn,
    bodyNl: packBody(pack, "nl"),
    bodyEn: packBody(pack, "en"),
  };
}

/** @deprecated Use buildProceduralGuide */
export const buildUniqueLongformGuide = buildProceduralGuide;

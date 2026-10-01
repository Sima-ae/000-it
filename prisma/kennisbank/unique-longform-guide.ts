/**
 * Procedural kennisbank guides: real panel / product steps, no meta-filler.
 * matchPack order matters: specific niches before broad fallbacks.
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

function P(
  excerptNl: string,
  excerptEn: string,
  introNl: string,
  introEn: string,
  prepNl: string[],
  prepEn: string[],
  stepsNl: string[],
  stepsEn: string[],
  verifyNl: string[],
  verifyEn: string[],
  tipNl: string,
  tipEn: string,
  warnNl: string,
  warnEn: string,
  relatedNl: string,
  relatedEn: string,
): Pack {
  return {
    excerptNl,
    excerptEn,
    introNl,
    introEn,
    prepNl,
    prepEn,
    stepsNl,
    stepsEn,
    verifyNl,
    verifyEn,
    tipNl,
    tipEn,
    warnNl,
    warnEn,
    relatedNl,
    relatedEn,
  };
}

function matchPack(hay: string, titleNl: string, titleEn: string): Pack {
  // --- Cron ---
  if (/cron/.test(hay)) {
    const panel = /cyberpanel|openlitespeed/.test(hay)
      ? "cyberpanel"
      : /\bplesk\b/.test(hay)
        ? "plesk"
        : "directadmin";
    if (panel === "cyberpanel") {
      return P(
        "Plan een cronjob in CyberPanel: schema, commando en output controleren.",
        "Schedule a cron job in CyberPanel: timing, command and output checks.",
        `Voor “${titleNl}” open je in CyberPanel de Cron Jobs-module. Vul een geldig schema en een absoluut pad naar php/curl of een script in.`,
        `For “${titleEn}”, open Cron Jobs in CyberPanel. Set a valid schedule and an absolute path to php/curl or your script.`,
        ["CyberPanel-login", "Werkend commando (getest waar mogelijk)", "Gewenste frequentie"],
        ["CyberPanel login", "Working command (tested if possible)", "Desired frequency"],
        [
          "Log in op CyberPanel.",
          "Ga naar <strong>Cron Jobs</strong> → <strong>Add Cron</strong>.",
          "Kies minute / hour / day / month / weekday (of een preset).",
          "Vul het commando in met volledig pad, bijvoorbeeld <code>/usr/bin/php /home/USER/public_html/wp-cron.php</code> of een curl-URL.",
          "Sla op. Optioneel: stuur output naar een logbestand i.p.v. mail bij elke run.",
          "Wacht op de eerste run of forceer handmatig via SSH als je die hebt.",
        ],
        [
          "Sign in to CyberPanel.",
          "Go to <strong>Cron Jobs</strong> → <strong>Add Cron</strong>.",
          "Set minute / hour / day / month / weekday (or a preset).",
          "Enter the command with a full path, e.g. <code>/usr/bin/php /home/USER/public_html/wp-cron.php</code> or a curl URL.",
          "Save. Optionally redirect output to a log file instead of email on every run.",
          "Wait for the first run, or trigger manually via SSH if available.",
        ],
        ["Job staat in de cronlijst", "Log/output toont een geslaagde run", "Geen onverwachte CPU-pieken"],
        ["Job appears in the cron list", "Log/output shows a successful run", "No unexpected CPU spikes"],
        "Test het commando eerst handmatig voordat je het plant.",
        "Test the command manually before scheduling it.",
        "Te korte intervallen (elke minuut) kunnen de server belasten.",
        "Very short intervals (every minute) can overload the server.",
        "PHP-versie, WordPress DISABLE_WP_CRON, backups",
        "PHP version, WordPress DISABLE_WP_CRON, backups",
      );
    }
    if (panel === "plesk") {
      return P(
        "Maak een geplande taak in Plesk (Scheduled Tasks) met het juiste commando.",
        "Create a Plesk scheduled task with the correct command.",
        `“${titleNl}” doe je in Plesk via Scheduled Tasks op het juiste abonnement.`,
        `“${titleEn}” is done in Plesk via Scheduled Tasks on the correct subscription.`,
        ["Plesk-login", "Juiste subscription", "Commando/pad"],
        ["Plesk login", "Correct subscription", "Command/path"],
        [
          "Log in op Plesk en open het juiste abonnement.",
          "Ga naar <strong>Scheduled Tasks</strong> (Geplande taken).",
          "Klik op Add Task / Taak toevoegen.",
          "Kies Run a PHP script of Run a command.",
          "Stel het schema in en vul scriptpad of shell-commando in.",
          "Sla op en bekijk de task history na de eerste run.",
        ],
        [
          "Sign in to Plesk and open the correct subscription.",
          "Go to <strong>Scheduled Tasks</strong>.",
          "Click Add Task.",
          "Choose Run a PHP script or Run a command.",
          "Set the schedule and enter the script path or shell command.",
          "Save and check task history after the first run.",
        ],
        ["Taak zichtbaar in de lijst", "History toont succes"],
        ["Task visible in the list", "History shows success"],
        "Gebruik PHP-handler van het abonnement zodat de juiste PHP-versie draait.",
        "Use the subscription PHP handler so the correct PHP version runs.",
        "Werk nooit in het verkeerde subscription op een reseller-server.",
        "Never work in the wrong subscription on a reseller server.",
        "PHP-versie, logs, WordPress-cron",
        "PHP version, logs, WordPress cron",
      );
    }
    return P(
      "Cronjob instellen in DirectAdmin: Advanced Features → Cron Jobs, schema + commando, daarna controleren.",
      "Set up a cron job in DirectAdmin: Advanced Features → Cron Jobs, schedule + command, then verify.",
      `Een cronjob voert een commando automatisch uit op een schema. Voor “${titleNl}” gebruik je in DirectAdmin <strong>Advanced Features → Cron Jobs</strong> — niet Domain Setup of DNS.`,
      `A cron job runs a command on a schedule. For “${titleEn}” use DirectAdmin <strong>Advanced Features → Cron Jobs</strong> — not Domain Setup or DNS.`,
      [
        "DirectAdmin-login van het juiste gebruikersaccount",
        "Het commando dat je wilt plannen (php-script, curl-URL of shell)",
        "Gewenste frequentie (bijv. elk uur, dagelijks om 03:00)",
      ],
      [
        "DirectAdmin login for the correct user account",
        "The command to schedule (php script, curl URL or shell)",
        "Desired frequency (e.g. hourly, daily at 03:00)",
      ],
      [
        "Log in op DirectAdmin.",
        "Open <strong>Advanced Features</strong> → <strong>Cron Jobs</strong>.",
        "Klik op <strong>Create Cron Job</strong> (of Add Cron Job).",
        "Vul de tijdvelden in: Minute, Hour, Day of Month, Month, Day of Week. Voorbeeld dagelijks om 03:15: minute <code>15</code>, hour <code>3</code>, rest <code>*</code>.",
        "Plak het <strong>Command</strong>. Gebruik absolute paden, bijvoorbeeld <code>/usr/local/bin/php /home/GEBRUIKER/domains/domein.nl/public_html/wp-cron.php</code> of <code>curl -s https://jouwdomein.nl/wp-cron.php?doing_wp_cron >/dev/null</code>.",
        "Kies of je cron-output per e-mail wilt (vaak uitzetten of naar een log redirecten met <code>>/home/GEBRUIKER/cron.log 2>&1</code>).",
        "Sla op. De job verschijnt in de lijst.",
      ],
      [
        "Sign in to DirectAdmin.",
        "Open <strong>Advanced Features</strong> → <strong>Cron Jobs</strong>.",
        "Click <strong>Create Cron Job</strong> (or Add Cron Job).",
        "Fill the time fields: Minute, Hour, Day of Month, Month, Day of Week. Example daily at 03:15: minute <code>15</code>, hour <code>3</code>, rest <code>*</code>.",
        "Paste the <strong>Command</strong>. Use absolute paths, e.g. <code>/usr/local/bin/php /home/USER/domains/domain.com/public_html/wp-cron.php</code> or <code>curl -s https://yourdomain.com/wp-cron.php?doing_wp_cron >/dev/null</code>.",
        "Choose whether to email cron output (often disable it, or redirect to a log with <code>>/home/USER/cron.log 2>&1</code>).",
        "Save. The job appears in the list.",
      ],
      [
        "De cronjob staat in de Cron Jobs-lijst met het juiste schema",
        "Na de geplande tijd: log of scriptresultaat is bijgewerkt",
        "Bij WordPress: events lopen (of DISABLE_WP_CRON + servercron werkt)",
      ],
      [
        "The cron job is listed with the correct schedule",
        "After the scheduled time: log or script result was updated",
        "For WordPress: events run (or DISABLE_WP_CRON + server cron works)",
      ],
      "Test hetzelfde commando eerst via SSH (als beschikbaar) of een eenmalige run, zodat je syntaxfouten niet in stilte plant.",
      "Test the same command via SSH (if available) or a one-off run so you do not schedule silent syntax errors.",
      "Relatieve paden en ‘php’ zonder volledig pad falen vaak stil. Mail-output bij elke minuut-job overspoelt je inbox.",
      "Relative paths and bare ‘php’ without a full path often fail silently. Email on every-minute jobs floods your inbox.",
      "PHP-versie wijzigen, WordPress-cron, SSH-toegang",
      "Change PHP version, WordPress cron, SSH access",
    );
  }

  // --- SSL ---
  if (/letsencrypt|let.?s encrypt|ssl-certificaat|gratis ssl|https forceren|\bssl\b|https|certificaat|tls/.test(hay) && !/gmail|outlook|mail.?programma|pgp/.test(hay)) {
    return P(
      "Let’s Encrypt / SSL in DirectAdmin: DNS eerst, certificaat aanvragen, daarna HTTPS forceren.",
      "Let’s Encrypt / SSL in DirectAdmin: DNS first, request certificate, then force HTTPS.",
      `Voor “${titleNl}” moet DNS (A/AAAA) al naar deze server wijzen. Daarna vraag je het certificaat aan in DirectAdmin → SSL Certificates.`,
      `For “${titleEn}”, DNS (A/AAAA) must already point at this server. Then request the certificate in DirectAdmin → SSL Certificates.`,
      ["A/AAAA naar TripleZero iT hosting", "DirectAdmin-login", "Apex én www indien beide gebruikt"],
      ["A/AAAA to TripleZero iT hosting", "DirectAdmin login", "Apex and www if both are used"],
      [
        "Controleer dat het A/AAAA-record van het domein naar deze server wijst.",
        "Log in op DirectAdmin → <strong>SSL Certificates</strong> (of Let’s Encrypt / Free & automatic certificate).",
        "Selecteer het domein en vink www aan indien nodig.",
        "Vraag het certificaat aan en wacht tot de status geldig/issued is.",
        "Forceer HTTPS via de paneloptie of .htaccess pas ná succesvolle uitgifte.",
        "Test https://jouwdomein in een privévenster.",
      ],
      [
        "Confirm the domain A/AAAA record points at this server.",
        "Sign in to DirectAdmin → <strong>SSL Certificates</strong> (or Let’s Encrypt / Free & automatic certificate).",
        "Select the domain and include www if needed.",
        "Request the certificate and wait until status is valid/issued.",
        "Force HTTPS via the panel option or .htaccess only after successful issuance.",
        "Test https://yourdomain in a private window.",
      ],
      ["Hangslot zonder naamfout", "http redirect naar https werkt"],
      ["Padlock without name mismatch", "http redirects to https"],
      "Dek apex en www in één certificaat af.",
      "Cover apex and www in one certificate.",
      "HTTPS forceren zonder certificaat geeft browserfouten.",
      "Forcing HTTPS without a certificate causes browser errors.",
      "DNS A-record, WordPress URL naar HTTPS",
      "DNS A record, WordPress URL to HTTPS",
    );
  }

  // --- Mail auth (before generic DNS / email) ---
  if (/\bspf\b|dkim|dmarc|bimi|ptr|rdns|reverse.?dns/.test(hay)) {
    return P(
      "E-mailauthenticatie in DNS: SPF/DKIM/DMARC (of PTR) publiceren en met headers testen.",
      "Email authentication in DNS: publish SPF/DKIM/DMARC (or PTR) and verify via headers.",
      `“${titleNl}” hoort in DNS (TXT) of bij PTR via de host — niet in wp-admin. Houd maximaal één SPF-record op @.`,
      `“${titleEn}” belongs in DNS (TXT) or PTR via the host — not wp-admin. Keep at most one SPF record on @.`,
      ["DNS-toegang (of ticket voor PTR)", "Lijst van legitieme verzendbronnen"],
      ["DNS access (or ticket for PTR)", "List of legitimate senders"],
      [
        "Open DNS-beheer voor het domein (klantenpanel of DirectAdmin Zone Editor).",
        "Voor SPF: zoek bestaande <code>v=spf1</code>-TXT’s, voeg samen tot één record, sla op.",
        "Voor DKIM: schakel DKIM in DirectAdmin/mailplatform in en publiceer het getoonde TXT-record.",
        "Voor DMARC: voeg TXT op <code>_dmarc</code> toe, start met <code>v=DMARC1; p=none; rua=mailto:…</code>.",
        "Voor BIMI/PTR: volg het product- of hostproces; PTR vraag je via support met IP + gewenste hostname.",
        "Wacht op propagatie; stuur een testmail en check headers op spf/dkim/dmarc=pass.",
      ],
      [
        "Open DNS management for the domain (client panel or DirectAdmin Zone Editor).",
        "For SPF: find existing <code>v=spf1</code> TXT records, merge into one, save.",
        "For DKIM: enable DKIM in DirectAdmin/mail platform and publish the shown TXT record.",
        "For DMARC: add TXT on <code>_dmarc</code>, start with <code>v=DMARC1; p=none; rua=mailto:…</code>.",
        "For BIMI/PTR: follow the product or host process; request PTR via support with IP + desired hostname.",
        "Wait for propagation; send a test and check headers for spf/dkim/dmarc=pass.",
      ],
      ["Headers tonen pass", "Geen dubbele SPF"],
      ["Headers show pass", "No duplicate SPF"],
      "Begin DMARC op p=none tot rapporten schoon zijn.",
      "Start DMARC at p=none until reports are clean.",
      "DMARC reject zonder volledige SPF/DKIM-dekking stopt legitieme mail.",
      "DMARC reject without full SPF/DKIM coverage stops legitimate mail.",
      "DNS TXT, webmail, Microsoft 365",
      "DNS TXT, webmail, Microsoft 365",
    );
  }

  // --- PHP version ---
  if (/php.?versie|php version|php.?selector|php.?instellingen/.test(hay)) {
    return P(
      "PHP-versie per domein wijzigen in DirectAdmin en daarna site + wp-admin testen.",
      "Change PHP version per domain in DirectAdmin, then test the site and wp-admin.",
      `“${titleNl}”: kies PHP per domein. Te oud is onveilig; te nieuw kan plugins breken.`,
      `“${titleEn}”: pick PHP per domain. Too old is unsafe; too new can break plugins.`,
      ["Backup bij kritieke site", "Gewenste PHP-versie"],
      ["Backup for critical sites", "Target PHP version"],
      [
        "Log in op DirectAdmin en selecteer het domein.",
        "Open <strong>Domain Setup</strong> → <strong>PHP Version Select</strong> (of MultiPHP).",
        "Kies de versie en sla op.",
        "Purge caches indien actief.",
        "Test homepage, wp-admin en kritieke formulieren/checkout.",
      ],
      [
        "Sign in to DirectAdmin and select the domain.",
        "Open <strong>Domain Setup</strong> → <strong>PHP Version Select</strong> (or MultiPHP).",
        "Choose the version and save.",
        "Purge caches if enabled.",
        "Test homepage, wp-admin and critical forms/checkout.",
      ],
      ["Panel/phpinfo toont nieuwe versie", "Geen critical error"],
      ["Panel/phpinfo shows new version", "No critical error"],
      "Wijzig één versie tegelijk; combineer niet met bulk plugin-updates.",
      "Change one version at a time; do not combine with bulk plugin updates.",
      "EOL PHP hoort niet op productie.",
      "EOL PHP does not belong in production.",
      "WordPress critical error, Installatron-backup",
      "WordPress critical error, Installatron backup",
    );
  }

  // --- FTP / FileZilla ---
  if (/ftp|filezilla|sftp|chmod|bestandsrechten/.test(hay)) {
    if (/filezilla|verbinden/.test(hay)) {
      return P(
        "FileZilla verbinden: host, gebruiker, wachtwoord, poort en FTPS/SFTP uit DirectAdmin of je welkomstmail.",
        "Connect FileZilla: host, user, password, port and FTPS/SFTP from DirectAdmin or your welcome email.",
        `FileZilla is een FTP/SFTP-client. Voor “${titleNl}” haal je de gegevens uit DirectAdmin → FTP Management (of je welkomstmail) en maak je in FileZilla een site met encryptie.`,
        `FileZilla is an FTP/SFTP client. For “${titleEn}” get details from DirectAdmin → FTP Management (or your welcome email) and create an encrypted FileZilla site.`,
        ["FileZilla Client geïnstalleerd", "DirectAdmin-login of welkomstmail met FTP-host", "FTP-gebruikersnaam + wachtwoord"],
        ["FileZilla Client installed", "DirectAdmin login or welcome email with FTP host", "FTP username + password"],
        [
          "DirectAdmin → <strong>FTP Management</strong>: noteer of maak een FTP-account; noteer de home-directory (vaak <code>.../public_html</code>).",
          "FileZilla → <strong>Bestand</strong> → <strong>Sitebeheerder</strong> → <strong>Nieuwe site</strong>.",
          "Protocol: <strong>FTP</strong> met Encryptie <strong>Expliciete FTP over TLS vereisen</strong>, of <strong>SFTP</strong> (poort 22) als dat op je pakket mag.",
          "Host = serverhostname uit de welkomstmail (niet altijd je domeinnaam). Poort 21 (FTPS) of 22 (SFTP).",
          "Logontype Normaal: FTP-user + wachtwoord → <strong>Verbinden</strong>. Accepteer certificaat/host key alleen als de host klopt.",
          "Rechts: server. Open <code>public_html</code> (of de FTP-home). Links: je PC.",
          "Upload <code>ftp-test.txt</code>, open via https://jouwdomein/ftp-test.txt, verwijder daarna het testbestand.",
        ],
        [
          "DirectAdmin → <strong>FTP Management</strong>: note or create an FTP account; note the home directory (often <code>.../public_html</code>).",
          "FileZilla → <strong>File</strong> → <strong>Site Manager</strong> → <strong>New site</strong>.",
          "Protocol: <strong>FTP</strong> with Encryption <strong>Require explicit FTP over TLS</strong>, or <strong>SFTP</strong> (port 22) if allowed.",
          "Host = server hostname from the welcome email (not always your domain). Port 21 (FTPS) or 22 (SFTP).",
          "Logon type Normal: FTP user + password → <strong>Connect</strong>. Accept certificate/host key only if the host matches.",
          "Right pane: server. Open <code>public_html</code> (or FTP home). Left pane: your PC.",
          "Upload <code>ftp-test.txt</code>, open via https://yourdomain/ftp-test.txt, then delete the test file.",
        ],
        ["Stabiele verbinding", "public_html / verwachte mappen zichtbaar", "Testbestand via HTTP bereikbaar en weer verwijderd"],
        ["Stable connection", "public_html / expected folders visible", "Test file reachable via HTTP and then deleted"],
        "‘Mappenlijst mislukt’: Passief, TLS forceren, of SFTP. Check of poort 21/22 geblokkeerd is.",
        "‘Failed to retrieve directory listing’: Passive mode, force TLS, or SFTP. Check ports 21/22.",
        "Geen plain FTP op openbare wifi. FTP-wachtwoorden niet in tickets plakken.",
        "No plain FTP on public Wi-Fi. Do not paste FTP passwords into tickets.",
        "FTP-account aanmaken, SFTP, CHMOD, File Manager",
        "Create FTP account, SFTP, CHMOD, File Manager",
      );
    }
    return P(
      "FTP/SFTP in DirectAdmin: account, home-map, verbinden met FileZilla.",
      "FTP/SFTP in DirectAdmin: account, home folder, connect with FileZilla.",
      `“${titleNl}”: FTP-account met beperkte home-map; verbind bij voorkeur met FTPS of SFTP.`,
      `“${titleEn}”: FTP account with a limited home folder; prefer FTPS or SFTP.`,
      ["DirectAdmin-login", "FileZilla", "Host uit welkomstmail"],
      ["DirectAdmin login", "FileZilla", "Host from welcome email"],
      [
        "DirectAdmin → <strong>FTP Management</strong> → Create (of bestaand account).",
        "Beperk Directory tot de bedoelde webroot/submap.",
        "FileZilla: host = serverhostname, user/wachtwoord, poort 21 (FTPS) of 22 (SFTP).",
        "Kies expliciete FTP over TLS of SFTP — geen plain FTP.",
        "Upload een testbestand en controleer het pad in de browser.",
      ],
      [
        "DirectAdmin → <strong>FTP Management</strong> → Create (or existing account).",
        "Limit Directory to the intended web root/subdirectory.",
        "FileZilla: host = server hostname, user/password, port 21 (FTPS) or 22 (SFTP).",
        "Choose explicit FTP over TLS or SFTP — not plain FTP.",
        "Upload a test file and confirm the path in the browser.",
      ],
      ["Verbinding stabiel", "Testbestand op verwachte URL"],
      ["Stable connection", "Test file on expected URL"],
      "SFTP is vaak stabieler achter strenge firewalls.",
      "SFTP is often more stable behind strict firewalls.",
      "Geen 777-rechten ‘om het te laten werken’.",
      "Do not use 777 permissions ‘to make it work’.",
      "File Manager, rechten, SFTP",
      "File Manager, permissions, SFTP",
    );
  }

  // --- HMAC / webhooks (must beat “handtekening” email) ---
  if (/hmac|webhook|api.?signatur|jwt|oauth/.test(hay)) {
    return P(
      "Webhooks/HMAC: shared secret, handtekening verifiëren, replay en logging controleren.",
      "Webhooks/HMAC: shared secret, verify signature, check replay and logging.",
      `“${titleNl}” gaat over API/webhooks — niet over e-mailhandtekeningen in Roundcube. Verifieer de HMAC met het shared secret van de provider.`,
      `“${titleEn}” is about APIs/webhooks — not Roundcube email signatures. Verify the HMAC with the provider shared secret.`,
      ["Endpoint-URL (HTTPS)", "Shared secret van de provider", "Voorbeeldpayload + handtekeningheader"],
      ["Endpoint URL (HTTPS)", "Provider shared secret", "Sample payload + signature header"],
      [
        "Lees de providerdocumentatie: welke header (bijv. <code>X-Hub-Signature-256</code>) en welk algoritme (vaak HMAC-SHA256).",
        "Sla het shared secret op in omgevingsvariabelen — niet in git.",
        "Bereken HMAC over de ruwe request body met het secret; vergelijk timing-safe met de headerwaarde.",
        "Wijs requests met ontbrekende/ongeldige handtekening af (401/403).",
        "Log alleen metadata (status, request-id); log geen secrets of volledige PII.",
        "Test met de sandbox/testevent van de provider.",
      ],
      [
        "Read the provider docs: which header (e.g. <code>X-Hub-Signature-256</code>) and algorithm (often HMAC-SHA256).",
        "Store the shared secret in environment variables — not in git.",
        "Compute HMAC over the raw request body with the secret; compare timing-safe to the header value.",
        "Reject requests with missing/invalid signatures (401/403).",
        "Log metadata only (status, request id); never log secrets or full PII.",
        "Test with the provider sandbox/test event.",
      ],
      ["Geldige testevent wordt geaccepteerd", "Gemanipuleerde body wordt geweigerd"],
      ["Valid test event accepted", "Tampered body rejected"],
      "Gebruik altijd de raw body vóór JSON-parse voor de handtekening.",
      "Always use the raw body before JSON parse for the signature.",
      "Publiceer geen webhook-URL zonder secret-check.",
      "Do not expose a webhook URL without a secret check.",
      "Omgevingsvariabelen, HTTPS, rate limiting",
      "Environment variables, HTTPS, rate limiting",
    );
  }

  // --- Email niches (order: specific → generic) ---
  const emailish =
    /mailbox|e-mail|email|webmail|roundcube|outlook|imap|smtp|spam|catch.?all|handtekening|signature|autorespond|out.of.office|afwezig|quota|bijlage|contactpersonen|submap|alias|forward|mx-record|mailing/.test(
      hay,
    );

  if (emailish && !/hmac|webhook/.test(hay)) {
    // Signature in Roundcube / Webmail Pro / mail client
    if (/handtekening|signature|afzender.?en.?handtekening/.test(hay)) {
      if (/roundcube/.test(hay)) {
        return P(
          "Handtekening in Roundcube: Instellingen → Identiteiten → handtekening HTML/tekst, daarna testmail.",
          "Roundcube signature: Settings → Identities → HTML/text signature, then send a test.",
          `“${titleNl}” stel je in Roundcube in per identiteit — niet via DirectAdmin E-mail Accounts.`,
          `“${titleEn}” is set in Roundcube per identity — not via DirectAdmin Email Accounts.`,
          ["Webmail-login (volledig adres + mailboxwachtwoord)", "Tekst of HTML van de handtekening", "Logo/URL indien gewenst"],
          ["Webmail login (full address + mailbox password)", "Signature text or HTML", "Logo/URL if desired"],
          [
            "Open webmail (DirectAdmin → E-mail Accounts → Roundcube, of de webmail-URL).",
            "Log in met het volledige e-mailadres en mailboxwachtwoord.",
            "Ga naar <strong>Instellingen</strong> (tandwiel) → <strong>Identiteiten</strong>.",
            "Selecteer de juiste identiteit (of maak er een) → tab <strong>Handtekening</strong>.",
            "Plak platte tekst of HTML; vink ‘HTML-handtekening’ aan indien je opmaak gebruikt.",
            "Sla op. Stel eventueel ‘Handtekening standaard onder nieuwe berichten’ in bij Voorkeuren → Opstellen.",
            "Stel een nieuw bericht op en controleer de handtekening; stuur een test naar een extern adres.",
          ],
          [
            "Open webmail (DirectAdmin → Email Accounts → Roundcube, or the webmail URL).",
            "Sign in with the full email address and mailbox password.",
            "Go to <strong>Settings</strong> (gear) → <strong>Identities</strong>.",
            "Select the correct identity (or create one) → <strong>Signature</strong> tab.",
            "Paste plain text or HTML; enable HTML signature if you use formatting.",
            "Save. Optionally enable ‘Add signature by default’ under Preferences → Composing.",
            "Compose a new message, confirm the signature, and send a test to an external address.",
          ],
          ["Handtekening zichtbaar in nieuw bericht", "Externe ontvanger ziet de juiste tekst/logo"],
          ["Signature visible in a new message", "External recipient sees the correct text/logo"],
          "Gebruik gehoste logo-URL’s (HTTPS), geen zware bijlagen als handtekening.",
          "Use hosted logo URLs (HTTPS), not heavy attachments as a signature.",
          "HTML-handtekeningen kunnen in sommige clients anders renderen — test Outlook én Gmail.",
          "HTML signatures can render differently in some clients — test Outlook and Gmail.",
          "Webmail Pro-handtekening, IMAP-client, SPF/DKIM",
          "Webmail Pro signature, IMAP client, SPF/DKIM",
        );
      }
      if (/webmail.?pro|horde/.test(hay)) {
        return P(
          "Handtekening in Webmail Pro: voorkeuren/identiteit, HTML of tekst, daarna testen.",
          "Webmail Pro signature: preferences/identity, HTML or text, then test.",
          `“${titleNl}” stel je in Webmail Pro in onder je identiteit/voorkeuren — niet in DirectAdmin mailbox-aanmaak.`,
          `“${titleEn}” is set in Webmail Pro under identity/preferences — not in DirectAdmin mailbox create.`,
          ["Webmail Pro-login", "Handtekeningstekst/HTML"],
          ["Webmail Pro login", "Signature text/HTML"],
          [
            "Open Webmail Pro via DirectAdmin of de webmail-URL; log in met volledig adres + mailboxwachtwoord.",
            "Open <strong>Voorkeuren</strong> / Options → Identiteiten of Personal Information.",
            "Plak de handtekening (tekst of HTML) en sla op.",
            "Stel een nieuw bericht op en controleer de handtekening onderaan.",
            "Stuur een test naar een extern adres.",
          ],
          [
            "Open Webmail Pro via DirectAdmin or the webmail URL; sign in with full address + mailbox password.",
            "Open <strong>Preferences</strong> / Options → Identities or Personal Information.",
            "Paste the signature (text or HTML) and save.",
            "Compose a new message and check the signature at the bottom.",
            "Send a test to an external address.",
          ],
          ["Handtekening zichtbaar bij opstellen"],
          ["Signature visible when composing"],
          "Houd de handtekening kort; te veel images verhogen spamscore.",
          "Keep the signature short; too many images raise spam scores.",
          "Wijzigingen gelden per webmail-account, niet automatisch in Outlook.",
          "Changes apply per webmail account, not automatically in Outlook.",
          "Roundcube-handtekening, Outlook-handtekening",
          "Roundcube signature, Outlook signature",
        );
      }
      // Mail program / generic signature
      return P(
        "E-mailhandtekening in je mailprogramma of webmail: per account/identiteit instellen en testen.",
        "Email signature in your mail client or webmail: set per account/identity and test.",
        `“${titleNl}”: handtekeningen zitten in de client (Outlook/Apple Mail/Android) of in webmail-identiteiten — niet bij mailbox aanmaken in DirectAdmin.`,
        `“${titleEn}”: signatures live in the client (Outlook/Apple Mail/Android) or webmail identities — not in DirectAdmin mailbox create.`,
        ["Juiste mailboxaccount in de client", "Tekst/HTML van de handtekening"],
        ["Correct mailbox account in the client", "Signature text/HTML"],
        [
          "Desktop (Outlook): Bestand → Opties → E-mail → Handtekeningen → Nieuw; koppel aan het juiste account.",
          "Apple Mail: Mail → Instellingen → Handtekeningen; sleep naar het account.",
          "Webmail: Instellingen → Identiteiten → Handtekening (Roundcube) of Voorkeuren (Webmail Pro).",
          "Sla op en stel een nieuw bericht op vanaf het juiste From-adres.",
          "Stuur een test naar Gmail/Outlook en controleer opmaak.",
        ],
        [
          "Desktop (Outlook): File → Options → Mail → Signatures → New; assign to the correct account.",
          "Apple Mail: Mail → Settings → Signatures; assign to the account.",
          "Webmail: Settings → Identities → Signature (Roundcube) or Preferences (Webmail Pro).",
          "Save and compose a new message from the correct From address.",
          "Send a test to Gmail/Outlook and check formatting.",
        ],
        ["Handtekening verschijnt op nieuwe mails van dat account"],
        ["Signature appears on new mail from that account"],
        "Één handtekening per From-adres voorkomt verkeerde merkopmaak.",
        "One signature per From address avoids wrong branding.",
        "Grote inline images in handtekeningen kunnen in spamfilters zwaarder wegen.",
        "Large inline images in signatures can weigh heavier in spam filters.",
        "Webmail, SPF, bedrijfsidentiteit",
        "Webmail, SPF, brand identity",
      );
    }

    if (/regels|filters|filter/.test(hay) && /webmail|roundcube|inbox/.test(hay)) {
      return P(
        "Filters/regels in webmail: voorwaarde → actie (map/markeren), volgorde controleren, testmail.",
        "Webmail filters/rules: condition → action (folder/flag), check order, test message.",
        `“${titleNl}” maak je in Roundcube of Webmail Pro onder Filters/Regels — niet in DNS.`,
        `“${titleEn}” is created in Roundcube or Webmail Pro under Filters/Rules — not in DNS.`,
        ["Webmail-login", "Welke afzender/onderwerp je wilt vangen", "Doelmap of actie"],
        ["Webmail login", "Which sender/subject to catch", "Target folder or action"],
        [
          "Log in op Roundcube of Webmail Pro.",
          "Roundcube: Instellingen → Filters (of Filters-plugin). Webmail Pro: Filters / Mail Filters.",
          "Maak een regel: voorwaarde (From, Subject, To) + actie (verplaatsen, markeren, doorsturen).",
          "Zet de volgorde: specifieke regels boven catch-all-achtige regels.",
          "Sla op. Stuur een testmail die aan de voorwaarde voldoet.",
          "Controleer of het bericht in de juiste map landt.",
        ],
        [
          "Sign in to Roundcube or Webmail Pro.",
          "Roundcube: Settings → Filters (or Filters plugin). Webmail Pro: Filters / Mail Filters.",
          "Create a rule: condition (From, Subject, To) + action (move, flag, forward).",
          "Order rules: specific rules above catch-all-like rules.",
          "Save. Send a test message that matches the condition.",
          "Confirm the message lands in the correct folder.",
        ],
        ["Testmail volgt de regel", "Geen oneindige forward-lussen"],
        ["Test mail follows the rule", "No infinite forward loops"],
        "Test met één bericht vóór je een agressieve ‘delete’-actie activeert.",
        "Test with one message before enabling an aggressive delete action.",
        "Server-side filters werken ook als Outlook dicht is; clientregels niet.",
        "Server-side filters work even when Outlook is closed; client rules do not.",
        "Spamfilter, mappen, autoresponder",
        "Spam filter, folders, autoresponder",
      );
    }

    if (/verwijderen|delete|wissen/.test(hay) && /roundcube|webmail|bericht/.test(hay)) {
      return P(
        "Berichten verwijderen in Roundcube: Prullenbak legen, quota vrijmaken, sync controleren.",
        "Delete messages in Roundcube: empty Trash, free quota, check sync.",
        `“${titleNl}”: verwijderen gebeurt in de webmail-UI; bij quota-problemen ook Prullenbak en Spam legen.`,
        `“${titleEn}”: deletion happens in the webmail UI; for quota issues also empty Trash and Spam.`,
        ["Webmail-login", "Welke map (Inbox/Spam/Prullenbak)"],
        ["Webmail login", "Which folder (Inbox/Spam/Trash)"],
        [
          "Log in op Roundcube.",
          "Selecteer berichten → Verwijderen (naar Prullenbak) of Shift+Delete voor permanent (indien beschikbaar).",
          "Open <strong>Prullenbak</strong> → legen / Empty.",
          "Leeg ook <strong>Spam/Junk</strong> als de mailbox vol is.",
          "Vernieuw; controleer quota in DirectAdmin → E-mail Accounts indien nodig.",
        ],
        [
          "Sign in to Roundcube.",
          "Select messages → Delete (to Trash) or Shift+Delete for permanent (if available).",
          "Open <strong>Trash</strong> → Empty.",
          "Also empty <strong>Spam/Junk</strong> if the mailbox is full.",
          "Refresh; check quota in DirectAdmin → Email Accounts if needed.",
        ],
        ["Berichten weg", "Quota daalt of blijft onder limiet"],
        ["Messages gone", "Quota drops or stays under limit"],
        "IMAP-clients tonen Prullenbak pas na sync — vernieuw de map.",
        "IMAP clients only show Trash after sync — refresh the folder.",
        "Permanent verwijderen is niet altijd terug te zetten zonder backup.",
        "Permanent delete is not always recoverable without a backup.",
        "Mailboxquota, IMAP, spammap",
        "Mailbox quota, IMAP, spam folder",
      );
    }

    if (/verschil|versus|vs\.|vergelijk/.test(hay) && /roundcube|webmail.?pro/.test(hay)) {
      return P(
        "Roundcube vs Webmail Pro: beide openen via DirectAdmin; kies op functie (filters, UI, plugins).",
        "Roundcube vs Webmail Pro: both open via DirectAdmin; choose by features (filters, UI, plugins).",
        `“${titleNl}”: beide clients gebruiken dezelfde mailbox. Het verschil zit in interface en filters — niet in MX.`,
        `“${titleEn}”: both clients use the same mailbox. The difference is UI and filters — not MX.`,
        ["Mailbox + wachtwoord", "DirectAdmin of webmail-URL"],
        ["Mailbox + password", "DirectAdmin or webmail URL"],
        [
          "Open DirectAdmin → E-mail Accounts → webmail-link, of ga naar de webmail-URL.",
          "Kies Roundcube of Webmail Pro op het keuzescherm.",
          "Log in met hetzelfde volledige adres + mailboxwachtwoord.",
          "Vergelijk: mappen, filters/identiteiten, bijlagen, zoeken.",
          "Blijf bij één client voor dagelijks werk om verwarring over concepten/filters te voorkomen.",
        ],
        [
          "Open DirectAdmin → Email Accounts → webmail link, or go to the webmail URL.",
          "Choose Roundcube or Webmail Pro on the picker.",
          "Sign in with the same full address + mailbox password.",
          "Compare: folders, filters/identities, attachments, search.",
          "Stick to one client for daily work to avoid confusion about drafts/filters.",
        ],
        ["Beide openen dezelfde Inbox", "Filters van de gekozen client werken"],
        ["Both open the same Inbox", "Filters of the chosen client work"],
        "Desktop-Outlook blijft naast webmail werken via IMAP.",
        "Desktop Outlook still works alongside webmail via IMAP.",
        "Handtekening per client apart instellen.",
        "Set signatures per client separately.",
        "Handtekening, filters, IMAP",
        "Signature, filters, IMAP",
      );
    }

    if (/bijlage|attachment/.test(hay) && /webmail|roundcube/.test(hay)) {
      return P(
        "Bijlage in webmail: Nieuw bericht → Bijlage, limiet respecteren, daarna controleren.",
        "Attachment in webmail: New message → Attach, respect size limits, then verify.",
        `“${titleNl}”: voeg bijlagen toe in de compose-UI van Roundcube/Webmail Pro; grote bestanden via cloudlink.`,
        `“${titleEn}”: add attachments in the Roundcube/Webmail Pro compose UI; use a cloud link for large files.`,
        ["Webmail-login", "Bestand binnen limiet (vaak ~25–50 MB totaal)"],
        ["Webmail login", "File within limit (often ~25–50 MB total)"],
        [
          "Log in op webmail → <strong>Nieuw bericht</strong>.",
          "Klik op het paperclip-/Bijlage-icoon en selecteer het bestand.",
          "Wacht tot de upload klaar is vóór je verzendt.",
          "Verstuur naar een testadres en open de bijlage daar.",
          "Faalt de upload: comprimeer/zip of deel via beveiligde link i.p.v. bijlage.",
        ],
        [
          "Sign in to webmail → <strong>New message</strong>.",
          "Click the paperclip/Attach icon and select the file.",
          "Wait until the upload finishes before sending.",
          "Send to a test address and open the attachment there.",
          "If upload fails: zip/compress or share via a secure link instead.",
        ],
        ["Bijlage aankomt en opent"],
        ["Attachment arrives and opens"],
        "Meerdere kleine bijlagen zijn betrouwbaarder dan één enorm bestand.",
        "Several small attachments are more reliable than one huge file.",
        "Uitvoerende bijlagen (.exe) worden vaak geblokkeerd — zip helpt niet altijd.",
        "Executable attachments (.exe) are often blocked — zipping does not always help.",
        "Quota, spamfilter, cloudopslag",
        "Quota, spam filter, cloud storage",
      );
    }

    if (/contactpersonen|contacts|adresboek/.test(hay) && /webmail|roundcube/.test(hay)) {
      return P(
        "Contacten in webmail: Adresboek → nieuw contact of import, daarna zoeken bij opstellen.",
        "Contacts in webmail: Address book → new contact or import, then search when composing.",
        `“${titleNl}” beheert u in het webmail-adresboek van Roundcube/Webmail Pro.`,
        `“${titleEn}” is managed in the Roundcube/Webmail Pro address book.`,
        ["Webmail-login", "Naam + e-mailadres van het contact"],
        ["Webmail login", "Contact name + email"],
        [
          "Log in op webmail → open <strong>Adresboek</strong> / Contacts.",
          "Klik Nieuw contact; vul naam en e-mail in; sla op.",
          "Of: Importeer vCard/CSV indien de client dat ondersteunt.",
          "Bij opstellen: begin te typen in Aan — het contact moet verschijnen.",
        ],
        [
          "Sign in to webmail → open <strong>Address Book</strong> / Contacts.",
          "Click New contact; enter name and email; save.",
          "Or: import vCard/CSV if the client supports it.",
          "When composing: start typing in To — the contact should appear.",
        ],
        ["Contact verschijnt in autocomplete"],
        ["Contact appears in autocomplete"],
        "Gescheiden privé/werk-adresboeken voorkomt verkeerde verzending.",
        "Separate personal/work address books prevents wrong recipients.",
        "Exporteer contacten vóór je van client wisselt.",
        "Export contacts before switching clients.",
        "Identiteiten, filters",
        "Identities, filters",
      );
    }

    if (/submap|folder|mappen/.test(hay) && /webmail|roundcube|imap/.test(hay)) {
      return P(
        "Submappen in webmail/IMAP: map aanmaken, abonneren, in client vernieuwen.",
        "Folders in webmail/IMAP: create folder, subscribe, refresh in the client.",
        `“${titleNl}”: mappen zijn server-side (IMAP). Maak ze in webmail aan en abonneer Outlook/telefoon.`,
        `“${titleEn}”: folders are server-side (IMAP). Create them in webmail and subscribe Outlook/phone.`,
        ["Webmail- of IMAP-login", "Gewenste mapnaam"],
        ["Webmail or IMAP login", "Desired folder name"],
        [
          "Webmail: rechtsklik op een map → Nieuwe map / Create folder.",
          "Geef een duidelijke naam (zonder rare tekens) en sla op.",
          "In Outlook/telefoon: maplijst vernieuwen / IMAP folders → Subscribe.",
          "Optioneel: filterregel die mail naar de nieuwe map verplaatst.",
        ],
        [
          "Webmail: right-click a folder → New folder / Create folder.",
          "Use a clear name (avoid odd characters) and save.",
          "In Outlook/phone: refresh folder list / IMAP folders → Subscribe.",
          "Optional: filter rule that moves mail into the new folder.",
        ],
        ["Map zichtbaar in webmail én IMAP-client"],
        ["Folder visible in webmail and IMAP client"],
        "Gebruik IMAP, niet POP, als je mappen op alle apparaten wilt.",
        "Use IMAP, not POP, if you want folders on all devices.",
        "POP downloadt naar één PC en synct mappen niet.",
        "POP downloads to one PC and does not sync folders.",
        "Filters, quota, Roundcube",
        "Filters, quota, Roundcube",
      );
    }

    if (/shared.?mailbox|gedeelde.?mailbox|alias|catch.?all|doorstuur|forward/.test(hay) && !/wordpress|wp-/.test(hay)) {
      return P(
        "Alias, forward, catch-all of shared mailbox: kies het juiste type in DirectAdmin en test.",
        "Alias, forward, catch-all or shared mailbox: pick the right type in DirectAdmin and test.",
        `“${titleNl}”: alias/forward/catch-all regel je in DirectAdmin E-mail — niet als aparte ‘handtekening’.`,
        `“${titleEn}”: alias/forward/catch-all is configured in DirectAdmin Email — not as a ‘signature’.`,
        ["DirectAdmin-login", "Bronadres + doeladres", "Of je een echte mailbox of alleen doorsturen wilt"],
        ["DirectAdmin login", "Source + destination address", "Whether you need a real mailbox or forward-only"],
        [
          "Bepaal het type: <strong>mailbox</strong> (inloggen), <strong>forwarder</strong> (alleen doorsturen), <strong>alias</strong> naar bestaande mailbox, of <strong>catch-all</strong> (alles@domein).",
          "DirectAdmin → E-mail Accounts / Forwarders / Catch-All.",
          "Maak of wijzig alleen het bedoelde record; noteer het doeladres.",
          "Stuur een test van een extern adres naar het bronadres.",
          "Controleer aankomst in de doelmailbox (en Spam).",
        ],
        [
          "Decide the type: <strong>mailbox</strong> (login), <strong>forwarder</strong> (forward only), <strong>alias</strong> to an existing mailbox, or <strong>catch-all</strong> (all@domain).",
          "DirectAdmin → Email Accounts / Forwarders / Catch-All.",
          "Create or change only the intended record; note the destination.",
          "Send a test from an external address to the source address.",
          "Confirm arrival in the destination mailbox (and Spam).",
        ],
        ["Testmail komt aan op het doel"],
        ["Test mail arrives at the destination"],
        "Catch-all vangt ook typfout-spam — liever expliciete adressen.",
        "Catch-all also catches typo-spam — prefer explicit addresses.",
        "Autoresponder op catch-all zonder limiet → loops/spam.",
        "Autoresponder on catch-all without limits → loops/spam.",
        "Mailbox aanmaken, SPF, spamfilter",
        "Create mailbox, SPF, spam filter",
      );
    }

    if (/out.of.office|autorespond|afwezig|\booo\b/.test(hay)) {
      return P(
        "Out-of-office / autoresponder per mailbox in DirectAdmin of webmail.",
        "Out-of-office / autoresponder per mailbox in DirectAdmin or webmail.",
        `“${titleNl}” stel je in per mailbox via DirectAdmin Autoresponders (of webmail-filters), met start-/einddatum.`,
        `“${titleEn}” is set per mailbox via DirectAdmin Autoresponders (or webmail filters), with start/end dates.`,
        ["DirectAdmin- of webmail-login", "Tekst", "Periode"],
        ["DirectAdmin or webmail login", "Message text", "Date range"],
        [
          "DirectAdmin → E-mail Accounts / Autoresponders (of webmail → Filters).",
          "Selecteer de juiste mailbox.",
          "Schakel autoresponder in; vul onderwerp + body; zet datums.",
          "Test vanaf een extern adres (één reply).",
          "Zet uit na afloop.",
        ],
        [
          "DirectAdmin → Email Accounts / Autoresponders (or webmail → Filters).",
          "Select the correct mailbox.",
          "Enable autoresponder; set subject + body; set dates.",
          "Test from an external address (one reply).",
          "Disable afterwards.",
        ],
        ["Externe test krijgt één auto-reply"],
        ["External test gets one auto-reply"],
        "Vermeld een alternatief contact in de tekst.",
        "Include an alternate contact in the text.",
        "Autoresponder op catch-all zonder limiet → spamstorm.",
        "Autoresponder on catch-all without limits → spam storm.",
        "Webmail, mailbox aanmaken",
        "Webmail, create mailbox",
      );
    }

    if (/spamfilter|spamfilter.?pro|blacklist|backscatter|veel.?spam/.test(hay)) {
      return P(
        "Spamfilter (Pro) instellen: score/whitelist/blacklist, daarna legitieme mail testen.",
        "Configure spam filter (Pro): score/whitelist/blacklist, then test legitimate mail.",
        `“${titleNl}”: pas spamfiltering per mailbox of domein aan in DirectAdmin/Spamfilter — whitelist eerst je eigen domeinen.`,
        `“${titleEn}”: adjust spam filtering per mailbox or domain in DirectAdmin/Spam filter — whitelist your own domains first.`,
        ["DirectAdmin- of Spamfilter Pro-login", "Voorbeelden van valse positieven en echte spam"],
        ["DirectAdmin or Spamfilter Pro login", "Examples of false positives and real spam"],
        [
          "Open DirectAdmin → Spamassassin / Spam Filter, of Spamfilter Pro volgens je productmail.",
          "Zet de drempel niet in één keer extreem streng; noteer de huidige score.",
          "Whitelist belangrijke afzenders/domeinen; blacklist alleen hardnekkige spambronnen.",
          "Controleer de Spam/Junk-map op valse positieven en leer/release waar beschikbaar.",
          "Stuur een test van een legitiem extern adres en van een bekende spamtest (zorgvuldig).",
        ],
        [
          "Open DirectAdmin → Spamassassin / Spam Filter, or Spamfilter Pro per your product email.",
          "Do not set the threshold extremely strict in one step; note the current score.",
          "Whitelist important senders/domains; blacklist only persistent spam sources.",
          "Check the Spam/Junk folder for false positives and learn/release where available.",
          "Send a test from a legitimate external address and a known spam test (carefully).",
        ],
        ["Legitieme mail in Inbox", "Spam grotendeels in Spam/Junk"],
        ["Legitimate mail in Inbox", "Spam mostly in Spam/Junk"],
        "SPF/DKIM/DMARC verlagen spam beter dan alleen een hogere score.",
        "SPF/DKIM/DMARC reduce spam better than only raising the score.",
        "Te agressief filteren mist facturen en wachtwoordresets.",
        "Over-aggressive filtering misses invoices and password resets.",
        "SPF/DKIM, webmail Spam-map",
        "SPF/DKIM, webmail Spam folder",
      );
    }

    if (/outlook|iphone|ipad|android|mac.?mail|apple.?mail|thunderbird|e-mail.?instellen|mail.?instellen/.test(hay)) {
      return P(
        "E-mailaccount instellen in je client: IMAP/SMTP uit de welkomstmail, daarna verzenden/ontvangen testen.",
        "Set up email in your client: IMAP/SMTP from the welcome email, then test send/receive.",
        `“${titleNl}”: gebruik IMAP (aanbevolen) + SMTP met het volledige adres als gebruikersnaam. Gegevens staan in je welkomstmail of DirectAdmin.`,
        `“${titleEn}”: use IMAP (recommended) + SMTP with the full address as username. Details are in your welcome email or DirectAdmin.`,
        ["Welkomstmail of DA: IMAP/SMTP-host, poorten, SSL/TLS", "Mailboxwachtwoord", "Apparaat/client"],
        ["Welcome email or DA: IMAP/SMTP host, ports, SSL/TLS", "Mailbox password", "Device/client"],
        [
          "Noteer uit de welkomstmail: inkomende server (IMAP), uitgaande (SMTP), poorten (vaak 993/465 of 587) en encryptie.",
          "Voeg in de client een nieuw account toe → handmatig/IMAP (niet Exchange tenzij je M365 hebt).",
          "Gebruikersnaam = volledig e-mailadres; wachtwoord = mailboxwachtwoord (niet DirectAdmin).",
          "Schakel SSL/TLS in; accepteer geen ‘ongeldig certificaat’ op de verkeerde hostnaam.",
          "Test: ontvang een mail in Inbox en stuur een antwoord naar extern.",
        ],
        [
          "From the welcome email note: incoming (IMAP), outgoing (SMTP), ports (often 993/465 or 587) and encryption.",
          "In the client add a new account → manual/IMAP (not Exchange unless you have M365).",
          "Username = full email address; password = mailbox password (not DirectAdmin).",
          "Enable SSL/TLS; do not accept an invalid certificate on the wrong hostname.",
          "Test: receive mail in Inbox and send a reply externally.",
        ],
        ["Inbox synchroniseert", "Verzenden zonder SMTP-fout"],
        ["Inbox syncs", "Sending without SMTP error"],
        "Webmail werkt wél en de client niet → verkeerde host/poort/wachtwoord in de client.",
        "If webmail works and the client does not → wrong host/port/password in the client.",
        "POP verwijdert vaak mail van de server — kies IMAP voor meerdere apparaten.",
        "POP often removes mail from the server — choose IMAP for multiple devices.",
        "Webmail, SPF, wachtwoord wijzigen",
        "Webmail, SPF, change password",
      );
    }

    if (/quota|vol|postvak.?is.?vol|mailbox.?full/.test(hay)) {
      return P(
        "Mailbox of hostingquota vol: opruimen, limiet verhogen in DirectAdmin, daarna opnieuw testen.",
        "Mailbox or hosting quota full: clean up, raise limit in DirectAdmin, then retest.",
        `“${titleNl}”: volle mailboxen weigeren mail. Ruim Spam/Prullenbak/grote bijlagen op of verhoog quota.`,
        `“${titleEn}”: full mailboxes reject mail. Clean Spam/Trash/large attachments or raise quota.`,
        ["DirectAdmin-login", "Welke mailbox of welk pakket vol is"],
        ["DirectAdmin login", "Which mailbox or plan is full"],
        [
          "DirectAdmin → E-mail Accounts: bekijk Usage vs Quota per mailbox.",
          "Webmail: leeg Spam en Prullenbak; verwijder grote bijlagen.",
          "Verhoog mailboxquota indien je pakket dat toelaat, of upgrade opslag.",
          "Bij schijfquota van het hele account: File Manager / backups opruimen.",
          "Stuur een testmail naar de mailbox.",
        ],
        [
          "DirectAdmin → Email Accounts: check Usage vs Quota per mailbox.",
          "Webmail: empty Spam and Trash; remove large attachments.",
          "Raise mailbox quota if your plan allows, or upgrade storage.",
          "For whole-account disk quota: clean File Manager / backups.",
          "Send a test message to the mailbox.",
        ],
        ["Usage onder limiet", "Nieuwe mail komt aan"],
        ["Usage under limit", "New mail arrives"],
        "IMAP ‘Alle mail offline’ vult lokale schijf — niet altijd serverquota.",
        "IMAP ‘Keep offline’ fills local disk — not always server quota.",
        "Verwijderen zonder Prullenbak legen geeft geen ruimte vrij.",
        "Deleting without emptying Trash does not free space.",
        "Backup, File Manager, upgrade",
        "Backup, File Manager, upgrade",
      );
    }

    if (/ontvang|verzend|550|niet.?verstuurd|bounce|smtp.?fout/.test(hay)) {
      return P(
        "Mail ontvangen/verzenden herstellen: webmail testen, SMTP/IMAP checken, DNS/SPF en blokkades.",
        "Fix mail receive/send: test webmail, check SMTP/IMAP, DNS/SPF and blocks.",
        `“${titleNl}”: isoleer eerst of webmail wél werkt. Daarna client, DNS (MX/SPF) of blokkade.`,
        `“${titleEn}”: first isolate whether webmail works. Then client, DNS (MX/SPF) or a block.`,
        ["Webmail-toegang", "Exacte fouttekst/bouncecode", "Tijdstip van de mislukte mail"],
        ["Webmail access", "Exact error/bounce code", "Timestamp of the failed mail"],
        [
          "Test in webmail: ontvangen én verzenden naar een extern adres.",
          "Werkt webmail: herstel client (wachtwoord, IMAP 993, SMTP 465/587, SSL).",
          "Werkt ontvangen niet: controleer MX en of de mailbox bestaat / niet vol is.",
          "Werkt verzenden niet: check SPF (één record), SMTP-auth, en 550/blokkeerberichten.",
          "Zoek de fout in Spam/logs; whitelist of pas SPF aan indien nodig.",
        ],
        [
          "Test in webmail: receive and send to an external address.",
          "If webmail works: fix the client (password, IMAP 993, SMTP 465/587, SSL).",
          "If receive fails: check MX and whether the mailbox exists / is not full.",
          "If send fails: check SPF (one record), SMTP auth, and 550/block messages.",
          "Find the error in Spam/logs; whitelist or fix SPF if needed.",
        ],
        ["Webmail send/receive OK", "Client of DNS-fix bevestigd met test"],
        ["Webmail send/receive OK", "Client or DNS fix confirmed with a test"],
        "Bewaar de volledige bounce — die noemt vaak de exacte oorzaak.",
        "Keep the full bounce — it often names the exact cause.",
        "Blind SPF wijzigen zonder inventaris van verzendbronnen breekt andere mail.",
        "Blindly changing SPF without listing senders breaks other mail.",
        "SPF/DKIM, spamfilter, clientinstellingen",
        "SPF/DKIM, spam filter, client settings",
      );
    }

    // Generic webmail login — only when the topic is opening/using webmail
    if (/hoe.?gebruik.?je.?webmail|webmail.?open|inloggen.?webmail|webmail.?vanuit.?directadmin/.test(hay) || (/webmail/.test(hay) && !/handtekening|signature|filter|bijlage|contact|submap|roundcube|pro/.test(hay))) {
      return P(
        "Webmail openen vanuit DirectAdmin of de webmail-URL met mailboxwachtwoord.",
        "Open webmail from DirectAdmin or the webmail URL with the mailbox password.",
        `“${titleNl}”: log in met het volledige e-mailadres en het mailboxwachtwoord (niet het DirectAdmin-wachtwoord).`,
        `“${titleEn}”: sign in with the full email address and mailbox password (not the DirectAdmin password).`,
        ["Webmail-URL of DA-link", "Mailbox + wachtwoord"],
        ["Webmail URL or DA link", "Mailbox + password"],
        [
          "Open DirectAdmin → E-mail Accounts of de webmail-link uit de welkomstmail.",
          "Kies Roundcube / Webmail Pro.",
          "Log in met volledig adres + mailboxwachtwoord.",
          "Controleer Inbox en stuur een test naar extern.",
        ],
        [
          "Open DirectAdmin → Email Accounts or the webmail link from the welcome email.",
          "Choose Roundcube / Webmail Pro.",
          "Sign in with full address + mailbox password.",
          "Check Inbox and send an external test.",
        ],
        ["Inbox opent", "Verzenden werkt"],
        ["Inbox opens", "Sending works"],
        "Werkt webmail wel en Outlook niet → fix clientinstellingen.",
        "If webmail works and Outlook does not → fix client settings.",
        "Op publieke computers altijd uitloggen.",
        "On public computers always sign out.",
        "Mailboxwachtwoord, IMAP/SMTP",
        "Mailbox password, IMAP/SMTP",
      );
    }

    if (/nieuw.?e-mail|e-mailadres.?aanmaken|create.?mailbox|mailbox.?aanmaken|wachtwoord.?van.?e-mail|quota.?e-mail|e-mail.?accounts/.test(hay) || (/e-mail|email|mailbox/.test(hay) && /directadmin|aanmaken|wachtwoord|quota/.test(hay))) {
      return P(
        "Mailbox aanmaken of beheren in DirectAdmin E-mail Accounts.",
        "Create or manage a mailbox in DirectAdmin Email Accounts.",
        `“${titleNl}” regel je per domein in DirectAdmin → E-mail Accounts.`,
        `“${titleEn}” is handled per domain in DirectAdmin → Email Accounts.`,
        ["DirectAdmin-login", "Gewenst adres", "Sterk wachtwoord"],
        ["DirectAdmin login", "Desired address", "Strong password"],
        [
          "Selecteer het domein in DirectAdmin.",
          "Open <strong>E-mail Accounts</strong>.",
          "Create Account / wijzig quota of wachtwoord.",
          "Test in webmail met volledig adres + mailboxwachtwoord.",
        ],
        [
          "Select the domain in DirectAdmin.",
          "Open <strong>Email Accounts</strong>.",
          "Create Account / change quota or password.",
          "Test in webmail with full address + mailbox password.",
        ],
        ["Webmail login lukt"],
        ["Webmail login works"],
        "Noteer IMAP/SMTP uit de welkomstmail voor desktopclients.",
        "Note IMAP/SMTP from the welcome email for desktop clients.",
        "Deel mailboxwachtwoorden niet in tickets.",
        "Do not paste mailbox passwords into tickets.",
        "Webmail, SPF, quota",
        "Webmail, SPF, quota",
      );
    }
  }

  // --- Domain admin ---
  if (/whois|autorisatiecode|auth.?code|epp|quarantaine|trustee|protect.?id|domein.?lock|transfer|sidn|\.nl control|nameserver.?wijzig/.test(hay)) {
    return P(
      "Domeinbeheer in het klantenpanel: WHOIS, auth-code, lock, quarantine of nameservers — één wijziging tegelijk.",
      "Domain admin in the client panel: WHOIS, auth code, lock, quarantine or nameservers — one change at a time.",
      `“${titleNl}” hoort in het TripleZero iT klantenpanel onder Domeinen — niet in WordPress.`,
      `“${titleEn}” belongs in the TripleZero iT client panel under Domains — not in WordPress.`,
      ["Klantenpanel-login", "Domeinnaam", "Eventueel ID-check / registreergegevens"],
      ["Client panel login", "Domain name", "ID check / registrant details if required"],
      [
        "Log in op het TripleZero iT klantenpanel → <strong>Domeinen</strong>.",
        "Open het juiste domein.",
        "Voor WHOIS/contact: werk registrant/admin bij en sla op (Protect ID waar van toepassing).",
        "Voor transfer: ontgrendel (lock uit), vraag autorisatiecode/EPP aan, bewaar die veilig.",
        "Voor quarantine/SIDN: volg de panelstatus of instructies; betaal/heractiveer binnen de termijn.",
        "Voor nameservers: zet de nieuwe NS, bevestig, wacht op propagatie voordat je DNS elders wijzigt.",
      ],
      [
        "Sign in to the TripleZero iT client panel → <strong>Domains</strong>.",
        "Open the correct domain.",
        "For WHOIS/contact: update registrant/admin and save (Protect ID where applicable).",
        "For transfer: unlock, request auth/EPP code, store it safely.",
        "For quarantine/SIDN: follow panel status or instructions; pay/reactivate within the deadline.",
        "For nameservers: set new NS, confirm, wait for propagation before changing DNS elsewhere.",
      ],
      ["Panelstatus klopt", "WHOIS/NS/auth-code komt overeen met de bedoeling"],
      ["Panel status correct", "WHOIS/NS/auth code matches the intent"],
      "Screenshot de oude nameservers vóór je wisselt.",
      "Screenshot old nameservers before switching.",
      "Auth-codes niet in publieke tickets of chat plakken.",
      "Do not paste auth codes into public tickets or chat.",
      "DNS, SSL na nameserver-wijziging",
      "DNS, SSL after nameserver change",
    );
  }

  // --- DNS (exclude email forward / WP) ---
  if (/dns|a-record|cname|nameserver|zone|mx-record|txt-record|dnssec/.test(hay) && !/wordpress|wp-|handtekening|outlook|webmail/.test(hay)) {
    return P(
      "DNS-records beheren: juiste zone, één wijziging, externe lookup ter controle.",
      "Manage DNS records: correct zone, one change, verify with an external lookup.",
      `“${titleNl}” doe je in DNS-beheer (klantenpanel of DirectAdmin Zone Editor). Wijzig alleen het benodigde recordtype.`,
      `“${titleEn}” is done in DNS management (client panel or DirectAdmin Zone Editor). Change only the required record type.`,
      ["DNS-toegang", "Screenshot/export van de huidige zone"],
      ["DNS access", "Screenshot/export of the current zone"],
      [
        "Open DNS-beheer voor het juiste domein.",
        "Exporteer of screenshot de zone.",
        "Pas A, AAAA, CNAME, MX, TXT of NS aan — alleen wat nodig is.",
        "Sla op; wacht op TTL/propagatie.",
        "Controleer met een externe lookup; test daarna site of mail.",
      ],
      [
        "Open DNS management for the correct domain.",
        "Export or screenshot the zone.",
        "Change A, AAAA, CNAME, MX, TXT or NS — only what is needed.",
        "Save; wait for TTL/propagation.",
        "Verify with an external lookup; then test site or mail.",
      ],
      ["Lookup toont nieuwe waarde", "Geen conflicterende duplicaten"],
      ["Lookup shows new value", "No conflicting duplicates"],
      "CNAME op apex alleen met ALIAS/ANAME — anders A/AAAA.",
      "CNAME on apex only with ALIAS/ANAME — otherwise A/AAAA.",
      "Nameserver-wijzigingen propagëren langer dan één record.",
      "Nameserver changes propagate longer than a single record.",
      "SPF, SSL, domein forward",
      "SPF, SSL, domain forward",
    );
  }

  // --- Windows / IIS / MSSQL ---
  // Note: never match bare /rdp/ — substring of "wordpress".
  // Also ignore catalog tag "windows-vps" on WordPress articles.
  if (
    (/\biis\b|\bmssql\b|windows.?server|\brdp\b|\bnovnc\b|web.?config|web.?platform.?installer|hyper-v/.test(hay) ||
      (/windows.?vps/.test(hay) && !/wordpress|wp-|woocommerce/.test(hay))) &&
    !/wordpress|wp-admin|woocommerce|roundcube|webmail/.test(hay)
  ) {
    return P(
      "Windows-servertaak: RDP/console, rol of software installeren, firewall, daarna dienst testen.",
      "Windows server task: RDP/console, install role or software, firewall, then test the service.",
      `“${titleNl}” hoort op een Windows VPS via RDP of de provider-console — niet via Linux-SSH-stappen of DirectAdmin e-mail.`,
      `“${titleEn}” belongs on a Windows VPS via RDP or the provider console — not Linux SSH steps or DirectAdmin email.`,
      ["RDP- of consoletoegang", "Admin-rechten", "Snapshot/backup vóór rollen"],
      ["RDP or console access", "Admin rights", "Snapshot/backup before roles"],
      [
        "Maak een snapshot indien beschikbaar.",
        "Verbind met RDP of open noVNC/console in het klantenpanel.",
        "Open Server Manager / Roles of het juiste installer-pad (IIS, MSSQL Express, Web Platform Installer).",
        "Installeer alleen benodigde rollen/features; noteer poorten (80/443/1433/3389).",
        "Pas Windows Firewall toe: sta de dienstpoort toe, beperk RDP tot bekende IP’s waar mogelijk.",
        "Test de dienst lokaal en extern (browser, SQL-client, site).",
      ],
      [
        "Take a snapshot if available.",
        "Connect with RDP or open noVNC/console in the client panel.",
        "Open Server Manager / Roles or the correct installer path (IIS, MSSQL Express, Web Platform Installer).",
        "Install only required roles/features; note ports (80/443/1433/3389).",
        "Adjust Windows Firewall: allow the service port, restrict RDP to known IPs where possible.",
        "Test the service locally and externally (browser, SQL client, site).",
      ],
      ["Dienst luistert op de verwachte poort", "Externe test slaagt"],
      ["Service listens on the expected port", "External test succeeds"],
      "Houd de console-URL bij de hand vóór je RDP-firewall aanscherpt.",
      "Keep the console URL handy before tightening RDP firewall rules.",
      "Open RDP niet wereldwijd zonder sterke admin-wachtwoorden en updates.",
      "Do not expose RDP globally without strong admin passwords and updates.",
      "Snapshots, backups, SSL op IIS",
      "Snapshots, backups, SSL on IIS",
    );
  }

  // --- Docker ---
  if (/docker|compose|container|kubernetes|k8s/.test(hay)) {
    return P(
      "Containers: image/compose, poorten en volumes, healthcheck, daarna alleen betrokken stack herstarten.",
      "Containers: image/compose, ports and volumes, healthcheck, then restart only the affected stack.",
      `“${titleNl}”: werk met Docker Compose of de container-runtime op je VPS; wijzig één service tegelijk.`,
      `“${titleEn}”: work with Docker Compose or the container runtime on your VPS; change one service at a time.`,
      ["SSH of console op de host", "Compose-file of run-commando", "Snapshot bij productiewijzigingen"],
      ["SSH or console on the host", "Compose file or run command", "Snapshot for production changes"],
      [
        "Ga naar de projectmap met <code>docker-compose.yml</code> (of noteer je run-parameters).",
        "Controleer image-tags, poortmapping, env-file en volumes.",
        "Pas alleen de bedoelde service/config toe.",
        "Start/herstart met <code>docker compose up -d</code> (of equivalent).",
        "Check <code>docker compose ps</code> / logs tot healthy.",
        "Test de URL of poort extern.",
      ],
      [
        "Go to the project directory with <code>docker-compose.yml</code> (or note your run parameters).",
        "Check image tags, port mapping, env file and volumes.",
        "Apply only the intended service/config.",
        "Start/restart with <code>docker compose up -d</code> (or equivalent).",
        "Check <code>docker compose ps</code> / logs until healthy.",
        "Test the URL or port externally.",
      ],
      ["Container healthy", "Externe test OK"],
      ["Container healthy", "External test OK"],
      "Pin image-tags i.p.v. <code>latest</code> op productie.",
      "Pin image tags instead of <code>latest</code> in production.",
      "Bind-mounts met secrets niet world-readable maken.",
      "Do not make bind mounts with secrets world-readable.",
      "Omgevingsvariabelen, reverse proxy, backups",
      "Environment variables, reverse proxy, backups",
    );
  }

  // --- Deploy / git / env ---
  if (/git.?based.?deploy|git.?deploy|pull.?build|pm2|systemd|omgevingsvariabel|env.?var|ci.?cd|deploy/.test(hay) && !/wordpress|woocommerce/.test(hay)) {
    return P(
      "Deploy op de server: pull, build, env, herstart van alleen de app-dienst, daarna healthcheck.",
      "Server deploy: pull, build, env, restart only the app service, then healthcheck.",
      `“${titleNl}”: deploy via git op de VPS — secrets in env, niet in de repo.`,
      `“${titleEn}”: deploy via git on the VPS — secrets in env, not in the repo.`,
      ["SSH-toegang", "Repo-toegang/deploy key", "Bekende build-stappen"],
      ["SSH access", "Repo access/deploy key", "Known build steps"],
      [
        "Maak een snapshot of noteer de huidige release-tag.",
        "SSH naar de app-host; <code>cd</code> naar de appmap.",
        "Pull de bedoelde branch/tag; installeer dependencies / build.",
        "Zet/controleer omgevingsvariabelen buiten git (.env of systemd EnvironmentFile).",
        "Herstart alleen de app (pm2/systemd/docker compose).",
        "Hit de health-URL of homepage; check logs op errors.",
      ],
      [
        "Take a snapshot or note the current release tag.",
        "SSH to the app host; <code>cd</code> to the app directory.",
        "Pull the intended branch/tag; install dependencies / build.",
        "Set/verify environment variables outside git (.env or systemd EnvironmentFile).",
        "Restart only the app (pm2/systemd/docker compose).",
        "Hit the health URL or homepage; check logs for errors.",
      ],
      ["App beantwoordt 200/healthy", "Geen secret in git status"],
      ["App returns 200/healthy", "No secret in git status"],
      "Houd een vorige release-map voor snelle rollback.",
      "Keep a previous release directory for quick rollback.",
      "Force-push naar productie-branches vermijden.",
      "Avoid force-push to production branches.",
      "Backups, SSL, monitoring",
      "Backups, SSL, monitoring",
    );
  }

  // --- Cloudflare / CDN / cache ---
  if (/cloudflare|cdn|cache.?legen|purge|http\/?2|litespeed.?cache|redis.?object.?cache/.test(hay) && !/wordpress.?plugin.?install/.test(hay)) {
    return P(
      "CDN/cache: juiste zone, purge of regel, origin bereikbaar houden, daarna live URL testen.",
      "CDN/cache: correct zone, purge or rule, keep origin reachable, then test the live URL.",
      `“${titleNl}”: wijzigingen in Cloudflare/CDN of servercache — test altijd de live URL én eventueel bypass.`,
      `“${titleEn}”: changes in Cloudflare/CDN or server cache — always test the live URL and an optional bypass.`,
      ["CDN/panel-login", "Domein/zone", "Of SSL Full (strict) al klopt"],
      ["CDN/panel login", "Domain/zone", "Whether SSL Full (strict) already works"],
      [
        "Open de juiste Cloudflare-zone of CDN-panel voor het domein.",
        "Voor cacheproblemen: Purge Cache (selectief of everything) na een contentwijziging.",
        "Voor performance: controleer caching-level, HTTP/2/3, en page rules/Cache Rules.",
        "Houd origin (A/AAAA of CNAME) bereikbaar; proxied oranje wolk alleen als SSL op origin geldig is.",
        "Test in privévenster en eventueel met cache-bypass header of development mode.",
      ],
      [
        "Open the correct Cloudflare zone or CDN panel for the domain.",
        "For cache issues: Purge Cache (selective or everything) after a content change.",
        "For performance: check caching level, HTTP/2/3, and page/Cache Rules.",
        "Keep origin (A/AAAA or CNAME) reachable; orange-cloud proxy only if origin SSL is valid.",
        "Test in a private window and optionally with a cache-bypass header or development mode.",
      ],
      ["Nieuwe content zichtbaar", "Geen SSL/loop-fouten"],
      ["New content visible", "No SSL/loop errors"],
      "Sluit /cart /checkout /wp-admin uit van full-page CDN-cache.",
      "Exclude /cart /checkout /wp-admin from full-page CDN cache.",
      "Everything-purge op piekverkeer kan origin overbelasten — liever selectief.",
      "Everything-purge at peak traffic can overload origin — prefer selective.",
      "SSL, DNS, WordPress-cache",
      "SSL, DNS, WordPress cache",
    );
  }

  // --- Privacy / cookies / a11y ---
  if (/avg|gdpr|privacy|cookie|consent|toegankelijk|wcag|aria/.test(hay)) {
    return P(
      "Privacy/toegankelijkheid op de site: policy/banner of a11y-fix, daarna controleren in de browser.",
      "Privacy/accessibility on the site: policy/banner or a11y fix, then verify in the browser.",
      `“${titleNl}”: dit is website-configuratie (banner, policy, markup) — niet DirectAdmin DNS.`,
      `“${titleEn}”: this is site configuration (banner, policy, markup) — not DirectAdmin DNS.`,
      ["wp-admin of site-CMS-toegang", "Juridische tekst/eisen die je wilt volgen", "Backup vóór pluginwijzigingen"],
      ["wp-admin or site CMS access", "Legal text/requirements you follow", "Backup before plugin changes"],
      [
        "Maak een backup.",
        "Voor cookies/consent: activeer of configureer de consent-plugin; blokkeer niet-essentiële scripts tot akkoord.",
        "Koppel privacyverklaring/cookiepolicy-pagina’s in het menu en in de banner.",
        "Voor toegankelijkheid: fix contrast, alt-teksten, koppenhiërarchie, toetsenbordfocus op templates.",
        "Test: privévenster (banner), screenreader/keyboard, en dat analytics pas na consent laden.",
      ],
      [
        "Create a backup.",
        "For cookies/consent: enable or configure the consent plugin; block non-essential scripts until consent.",
        "Link privacy/cookie policy pages in the menu and banner.",
        "For accessibility: fix contrast, alt text, heading hierarchy, keyboard focus on templates.",
        "Test: private window (banner), screen reader/keyboard, and analytics only after consent.",
      ],
      ["Banner toont vóór niet-essentiële cookies", "Basis a11y-checks groen"],
      ["Banner shows before non-essential cookies", "Basic a11y checks pass"],
      "Documenteer welke cookies essentieel vs marketing zijn.",
      "Document which cookies are essential vs marketing.",
      "Juridisch advies blijft maatwerk — dit is technische uitvoering.",
      "Legal advice remains case-specific — this is technical implementation.",
      "Analytics, WordPress-plugins, SSL",
      "Analytics, WordPress plugins, SSL",
    );
  }

  // --- Analytics ---
  if (/analytics|gtm|ga4|google.?tag|conversie|pixel|matomo/.test(hay)) {
    return P(
      "Analytics/tags: container of property, tag op de site, consent respecteren, realtime controleren.",
      "Analytics/tags: container or property, tag on the site, respect consent, verify realtime.",
      `“${titleNl}”: plaats GTM/GA4/pixel via CMS of GTM; laad marketingtags pas na consent.`,
      `“${titleEn}”: place GTM/GA4/pixel via CMS or GTM; load marketing tags only after consent.`,
      ["Toegang tot GA4/GTM of pixel-account", "Site-CMS of GTM-container", "Consent-oplossing"],
      ["Access to GA4/GTM or pixel account", "Site CMS or GTM container", "Consent solution"],
      [
        "Maak of open de GA4-property / GTM-container / pixel.",
        "Plaats de container-snippet in de site (theme, plugin of GTM).",
        "Koppel tags aan consent-mode of je cookiebanner.",
        "Publiceer de container; test in Tag Assistant / realtime.",
        "Controleer een conversie-event met een testdoel.",
      ],
      [
        "Create or open the GA4 property / GTM container / pixel.",
        "Place the container snippet on the site (theme, plugin or GTM).",
        "Bind tags to consent mode or your cookie banner.",
        "Publish the container; test in Tag Assistant / realtime.",
        "Verify a conversion event with a test goal.",
      ],
      ["Realtime/debug toont pageview", "Geen tags vóór consent (indien vereist)"],
      ["Realtime/debug shows pageview", "No tags before consent (if required)"],
      "Eén primaire container voorkomt dubbele pageviews.",
      "One primary container avoids duplicate pageviews.",
      "Dubbele GA-snippets inflaten statistieken.",
      "Duplicate GA snippets inflate stats.",
      "Cookieconsent, Cloudflare cache, WordPress",
      "Cookie consent, Cloudflare cache, WordPress",
    );
  }

  // --- AI / automation ---
  if (/chatgpt|openai|ai.?integr|automatisering|n8n|zapier|make\.com|llm/.test(hay)) {
    return P(
      "AI/automatisering koppelen: API-key veilig, workflow testen, rate limits en logging.",
      "Connect AI/automation: secure API key, test workflow, rate limits and logging.",
      `“${titleNl}”: koppel de dienst via API of automation-tool; bewaar keys in secrets/env.`,
      `“${titleEn}”: connect the service via API or automation tool; store keys in secrets/env.`,
      ["Account bij de AI/automation-provider", "API-key of OAuth", "Doelworkflow (trigger → actie)"],
      ["Account with the AI/automation provider", "API key or OAuth", "Target workflow (trigger → action)"],
      [
        "Maak een API-key met minimale scopes; sla op in env/secrets — niet in de frontend.",
        "Bouw de workflow in n8n/Zapier/Make of je app: trigger → model/API-call → actie.",
        "Beperk PII in prompts; filter output vóór publicatie op de site.",
        "Test met een dry-run; bekijk logs en foutafhandeling.",
        "Zet rate limits / budget alerts aan.",
      ],
      [
        "Create an API key with minimal scopes; store in env/secrets — not in the frontend.",
        "Build the workflow in n8n/Zapier/Make or your app: trigger → model/API call → action.",
        "Limit PII in prompts; filter output before publishing on the site.",
        "Test with a dry run; review logs and error handling.",
        "Enable rate limits / budget alerts.",
      ],
      ["Testworkflow slaagt", "Key niet zichtbaar in client-side code"],
      ["Test workflow succeeds", "Key not visible in client-side code"],
      "Gebruik aparte keys voor staging en productie.",
      "Use separate keys for staging and production.",
      "Publiceer nooit ongemodereerde modeloutput op klantgerichte pagina’s.",
      "Never publish unmoderated model output on customer-facing pages.",
      "Webhooks, omgevingsvariabelen, privacy",
      "Webhooks, environment variables, privacy",
    );
  }

  // --- 2FA / client panel auth ---
  if (/2fa|two.?factor|mfa|klantenpanel|crm.?login|logingegevens.?klantenpanel/.test(hay)) {
    return P(
      "Klantenpanel: inloggen, 2FA activeren of herstel, daarna backupcodes bewaren.",
      "Client panel: sign in, enable or recover 2FA, then store backup codes.",
      `“${titleNl}” doe je in het TripleZero iT klantenpanel onder je accountbeveiliging.`,
      `“${titleEn}” is done in the TripleZero iT client panel under account security.`,
      ["Klantenpanel-URL", "Huidig wachtwoord", "Authenticator-app of e-mailherstel"],
      ["Client panel URL", "Current password", "Authenticator app or email recovery"],
      [
        "Log in op het TripleZero iT klantenpanel.",
        "Open account-/beveiligingsinstellingen (2FA / Two-factor).",
        "Activeer 2FA: scan QR in je authenticator-app of volg e-mail/SMS-stappen.",
        "Sla backupcodes offline op.",
        "Log uit en opnieuw in om 2FA te verifiëren.",
        "Bij kwijt: gebruik backupcode of support-herstel met identiteitscheck.",
      ],
      [
        "Sign in to the TripleZero iT client panel.",
        "Open account/security settings (2FA / Two-factor).",
        "Enable 2FA: scan QR in your authenticator app or follow email/SMS steps.",
        "Store backup codes offline.",
        "Sign out and back in to verify 2FA.",
        "If lost: use a backup code or support recovery with identity check.",
      ],
      ["Login met 2FA lukt", "Backupcodes bewaard"],
      ["Login with 2FA works", "Backup codes stored"],
      "Eén authenticator-app als primaire bron voorkomt chaos bij telefoonwissel.",
      "One authenticator app as primary source avoids chaos when changing phones.",
      "Deel backupcodes niet in tickets.",
      "Do not share backup codes in tickets.",
      "Wachtwoord reset, support",
      "Password reset, support",
    );
  }

  // --- WordPress ---
  if (/wordpress|wp-admin|woocommerce|plugin|thema|critical error|comment|reactie/.test(hay)) {
    if (/comment|reactie/.test(hay) && /spam/.test(hay)) {
      return P(
        "Reacties in spam: controleer Moderatie/Spam, Discussie-instellingen en anti-spam plugins.",
        "Comments in spam: check Moderation/Spam, Discussion settings and anti-spam plugins.",
        `“${titleNl}” speelt in WordPress-moderatie en anti-spam — niet in DNS of SSL.`,
        `“${titleEn}” is about WordPress moderation and anti-spam — not DNS or SSL.`,
        ["wp-admin toegang", "Welke anti-spam plugin actief is"],
        ["wp-admin access", "Which anti-spam plugin is active"],
        [
          "Open wp-admin → <strong>Reacties</strong> en check Spam én Moderatie.",
          "Ga naar Instellingen → Discussie: goedkeuring, linklimits, notificaties.",
          "Open Akismet of je anti-spam plugin: API-key, false positives, whitelist.",
          "Test een reactie vanaf een ander netwerk (admins bypassen filters vaak).",
          "Bij plotselinge spam na update: laatste anti-spam plugin tijdelijk uit en herhaal de test.",
        ],
        [
          "Open wp-admin → <strong>Comments</strong> and check Spam and Moderation.",
          "Go to Settings → Discussion: approval, link limits, notifications.",
          "Open Akismet or your anti-spam plugin: API key, false positives, whitelist.",
          "Test a comment from another network (admins often bypass filters).",
          "If spam spiked after an update: temporarily disable the last anti-spam plugin and retest.",
        ],
        ["Testreactie landt in Moderatie of Goedgekeurd", "Geen botflood na versoepelen"],
        ["Test comment lands in Moderation or Approved", "No bot flood after relaxing filters"],
        "Whitelist je eigen e-maildomein als medewerkersreacties verdwijnen.",
        "Whitelist your own email domain if staff comments disappear.",
        "Anti-spam niet volledig uitzetten op een publieke site.",
        "Do not fully disable anti-spam on a public site.",
        "WordPress login, cache legen",
        "WordPress login, clear cache",
      );
    }
    if (/down|critical error|kritieke fout|witte pagina/.test(hay)) {
      return P(
        "WordPress down/critical error: plugins isoleren via File Manager, PHP checken, cache legen.",
        "WordPress down/critical error: isolate plugins via File Manager, check PHP, clear cache.",
        `Bij “${titleNl}” isoleer je eerst plugins/thema via bestanden als wp-admin niet opent.`,
        `For “${titleEn}”, isolate plugins/theme via files first if wp-admin will not open.`,
        ["Backup", "DirectAdmin File Manager of SFTP"],
        ["Backup", "DirectAdmin File Manager or SFTP"],
        [
          "Noteer de fouttekst (critical error / 500 / witte pagina).",
          "Via File Manager: hernoem <code>wp-content/plugins</code> naar <code>plugins-off</code>.",
          "Werkt de site: hernoem terug en activeer plugins één voor één tot de boosdoener duidelijk is.",
          "Thema-probleem: activeer een default thema via bestanden of database.",
          "Controleer DirectAdmin → PHP Version Select bij fatals na een update.",
          "Leeg alle caches en test wp-admin + homepage.",
        ],
        [
          "Note the error text (critical error / 500 / white screen).",
          "Via File Manager: rename <code>wp-content/plugins</code> to <code>plugins-off</code>.",
          "If the site recovers: rename back and enable plugins one by one until the culprit is clear.",
          "Theme issue: activate a default theme via files or the database.",
          "Check DirectAdmin → PHP Version Select on fatals after an update.",
          "Clear all caches and test wp-admin + homepage.",
        ],
        ["Homepage en wp-admin laden", "Geen PHP fatals in error_log"],
        ["Homepage and wp-admin load", "No PHP fatals in error_log"],
        "Update niet opnieuw voordat de boosdoener geïsoleerd is.",
        "Do not update again until the culprit is isolated.",
        "Wis geen uploads of database tijdens ‘opschonen’.",
        "Do not delete uploads or the database while ‘cleaning’.",
        "PHP-versie, Installatron-backup",
        "PHP version, Installatron backup",
      );
    }
    if (/woocommerce|checkout|winkelwagen|webshop/.test(hay)) {
      return P(
        "WooCommerce: backup, checkout testen, cache-uitzonderingen, Status-pagina.",
        "WooCommerce: backup, test checkout, cache exclusions, Status page.",
        `“${titleNl}” raakt WooCommerce-checkout, betaalplugins of cache. Werk met backup en testorders.`,
        `“${titleEn}” touches WooCommerce checkout, payment plugins or cache. Work with a backup and test orders.`,
        ["Backup", "wp-admin", "Testorder mogelijk of staging"],
        ["Backup", "wp-admin", "Test order possible or staging"],
        [
          "Maak een backup.",
          "Test checkout in een privévenster; noteer exacte fout of hangpunt.",
          "Sluit cart/checkout/mijn-account uit van full-page cache.",
          "Open WooCommerce → Status: fouten, webhooks, geplande acties.",
          "Schakel de laatst gewijzigde checkout-/betaalplugin uit om te isoleren.",
          "Herhaal de testorder.",
        ],
        [
          "Create a backup.",
          "Test checkout in a private window; note the exact error or hang point.",
          "Exclude cart/checkout/my-account from full-page cache.",
          "Open WooCommerce → Status: errors, webhooks, scheduled actions.",
          "Disable the last changed checkout/payment plugin to isolate.",
          "Repeat the test order.",
        ],
        ["Testorder rondt af", "Bevestigingsmail komt aan"],
        ["Test order completes", "Confirmation email arrives"],
        "Gebruik sandbox/testmode van de betaalprovider waar mogelijk.",
        "Use the payment provider sandbox/test mode where possible.",
        "Full-page cache op checkout veroorzaakt lege carts of dubbele orders.",
        "Full-page cache on checkout causes empty carts or duplicate orders.",
        "Cache, PHP-versie, e-mailauthenticatie",
        "Cache, PHP version, email authentication",
      );
    }
    if (/plugin/.test(hay)) {
      return P(
        "WordPress-plugin: backup, via Plugins installeren/bijwerken/deactiveren, daarna testen.",
        "WordPress plugin: backup, install/update/deactivate via Plugins, then test.",
        `“${titleNl}” doe je via wp-admin → Plugins. Bij een fatal: pluginmap hernoemen via File Manager.`,
        `“${titleEn}” is done via wp-admin → Plugins. On a fatal: rename the plugin folder via File Manager.`,
        ["Backup files + database", "wp-admin"],
        ["Backup files + database", "wp-admin"],
        [
          "Maak een backup.",
          "Open wp-admin → Plugins.",
          "Installeer, werk bij, deactiveer of verwijder alleen de bedoelde plugin.",
          "Leeg caches.",
          "Test de pagina’s/flows die die plugin raakt.",
        ],
        [
          "Create a backup.",
          "Open wp-admin → Plugins.",
          "Install, update, deactivate or delete only the intended plugin.",
          "Clear caches.",
          "Test the pages/flows that plugin affects.",
        ],
        ["Pluginstatus klopt", "Geen critical error"],
        ["Plugin status correct", "No critical error"],
        "Eén plugin tegelijk updaten op productie.",
        "Update one plugin at a time in production.",
        "Verwijder geen map met custom code zonder archive.",
        "Do not delete a folder with custom code without an archive.",
        "Critical error, Installatron-backup",
        "Critical error, Installatron backup",
      );
    }
    return P(
      `${titleNl}: backup, wp-admin, cache legen, controleren.`,
      `${titleEn}: backup, wp-admin, clear cache, verify.`,
      `Voor “${titleNl}” werk je in WordPress (/wp-admin) op TripleZero iT hosting. Maak eerst een backup; wijzig daarna gericht en leeg de cache.`,
      `For “${titleEn}” you work in WordPress (/wp-admin) on TripleZero iT hosting. Take a backup first; then change carefully and clear caches.`,
      [
        "Installatron- of panel-backup (files + database)",
        "Login op /wp-admin van de juiste site",
        "DirectAdmin File Manager als wp-admin niet opent",
      ],
      [
        "Installatron or panel backup (files + database)",
        "Login to /wp-admin of the correct site",
        "DirectAdmin File Manager if wp-admin will not open",
      ],
      [
        "Maak een backup via Installatron of DirectAdmin.",
        "Log in op <code>/wp-admin</code>.",
        "Voer de wijziging door in het menu dat bij het onderwerp past (Plugins, Thema’s, Instellingen, Gebruikers, Media of WooCommerce).",
        "Sla op. Bij een critical error: hernoem via File Manager tijdelijk <code>wp-content/plugins</code> of activeer een default thema.",
        "Leeg page-cache, object-cache en CDN-cache.",
        "Test de homepage, login en een kritieke flow (formulier of checkout).",
      ],
      [
        "Create a backup via Installatron or DirectAdmin.",
        "Sign in to <code>/wp-admin</code>.",
        "Apply the change in the menu that matches the topic (Plugins, Themes, Settings, Users, Media or WooCommerce).",
        "Save. On a critical error: via File Manager temporarily rename <code>wp-content/plugins</code> or activate a default theme.",
        "Clear page cache, object cache and CDN cache.",
        "Test the homepage, login and a critical flow (form or checkout).",
      ],
      ["Geen critical error", "Wijziging zichtbaar op de voorkant of in wp-admin"],
      ["No critical error", "Change visible on the front end or in wp-admin"],
      "Wijzig één plugin of thema tegelijk — snellere rollback.",
      "Change one plugin or theme at a time — faster rollback.",
      "Verwijder geen uploads-map of database-tabellen zonder restoreplan.",
      "Do not delete the uploads folder or database tables without a restore plan.",
      "Installatron-backup, PHP-versie, critical error",
      "Installatron backup, PHP version, critical error",
    );
  }

  // --- CyberPanel / Plesk ---
  if (/cyberpanel|openlitespeed/.test(hay)) {
    return P(
      "CyberPanel: website selecteren, juiste module (SSL/DNS/Email/Files/Backup), OLS-cache legen.",
      "CyberPanel: select website, correct module (SSL/DNS/Email/Files/Backup), purge OLS cache.",
      `In CyberPanel kies je eerst de website. Voor “${titleNl}” open je daarna SSL, DNS, Email, File Manager of Backup — afhankelijk van de taak.`,
      `In CyberPanel select the website first. For “${titleEn}” then open SSL, DNS, Email, File Manager or Backup — depending on the task.`,
      ["CyberPanel-URL + login", "Domeinnaam"],
      ["CyberPanel URL + login", "Domain name"],
      [
        "Log in op CyberPanel (poort 8090 of welkomstlink).",
        "Ga naar Websites en open het juiste domein.",
        "Kies de module: SSL, DNS, Email, File Manager, Databases of Backup.",
        "Voer de wijziging door en sla op.",
        "Purge OpenLiteSpeed-cache als de site oude content toont.",
        "Bij 500/witte pagina: open Error Logs van die website.",
      ],
      [
        "Sign in to CyberPanel (port 8090 or welcome link).",
        "Go to Websites and open the correct domain.",
        "Choose the module: SSL, DNS, Email, File Manager, Databases or Backup.",
        "Apply the change and save.",
        "Purge OpenLiteSpeed cache if the site shows old content.",
        "On 500/white screen: open Error Logs for that website.",
      ],
      ["Wijziging zichtbaar op de live URL", "Geen nieuwe errors in de logs"],
      ["Change visible on the live URL", "No new errors in the logs"],
      "Noteer oude DNS/SSL-waarden vóór je opslaat.",
      "Note old DNS/SSL values before you save.",
      "Verkeerde website selecteren wijzigt productie van een andere site.",
      "Selecting the wrong website changes another site’s production.",
      "CyberPanel login, SSL, OLS cache",
      "CyberPanel login, SSL, OLS cache",
    );
  }

  if (/\bplesk\b/.test(hay)) {
    return P(
      "Plesk: juiste subscription openen, tool gebruiken (Mail/DNS/SSL/Files/WordPress), extern testen.",
      "Plesk: open the correct subscription, use the tool (Mail/DNS/SSL/Files/WordPress), test externally.",
      `In Plesk horen wijzigingen bij één abonnement. Voor “${titleNl}” open je eerst dat abonnement, daarna Mail, DNS, SSL/TLS, Files, Databases of WordPress Toolkit.`,
      `In Plesk, changes belong to one subscription. For “${titleEn}” open that subscription first, then Mail, DNS, SSL/TLS, Files, Databases or WordPress Toolkit.`,
      ["Plesk-login", "Juiste subscription/domein"],
      ["Plesk login", "Correct subscription/domain"],
      [
        "Log in op Plesk (poort 8443 of welkomstlink).",
        "Selecteer het juiste abonnement of domein (zoekbalk).",
        "Open Mail, DNS, SSL/TLS, Files, Databases of WordPress Toolkit.",
        "Voer de wijziging door en bevestig.",
        "Test extern: browser, mailclient of DNS-lookup.",
      ],
      [
        "Sign in to Plesk (port 8443 or welcome link).",
        "Select the correct subscription or domain (search bar).",
        "Open Mail, DNS, SSL/TLS, Files, Databases or WordPress Toolkit.",
        "Apply the change and confirm.",
        "Test externally: browser, mail client or DNS lookup.",
      ],
      ["Resultaat zichtbaar buiten Plesk"],
      ["Result visible outside Plesk"],
      "Als reseller: open eerst het klantaccount, niet je eigen admin-context.",
      "As a reseller: open the customer account first, not your own admin context.",
      "Blind werken in het verkeerde subscription raakt de verkeerde klant.",
      "Working blindly in the wrong subscription hits the wrong customer.",
      "Plesk SSL, DNS, WordPress Toolkit",
      "Plesk SSL, DNS, WordPress Toolkit",
    );
  }

  // --- SSH only when SSH is actually the topic (not bare “vps/server”) ---
  if (
    (/\bssh\b|fail2ban|authorized_keys|ssh.?key|ssh.?toegang|ssh.?login/.test(hay) ||
      (/\bvps\b/.test(hay) && /firewall|snapshot|console|wireguard|ufw|iptables/.test(hay))) &&
    !/ftp|filezilla|wordpress|dns|spf|mail|cron|woocommerce|iis|windows|mssql/.test(hay)
  ) {
    return P(
      "VPS/SSH: rechten checken, snapshot, gerichte wijziging, alleen betrokken dienst herstarten.",
      "VPS/SSH: check rights, snapshot, targeted change, restart only the affected service.",
      `“${titleNl}” op een VPS/server: bevestig eerst of je SSH of de provider-console hebt. Bij riskante wijzigingen (firewall, users) maak je eerst een snapshot.`,
      `“${titleEn}” on a VPS/server: first confirm you have SSH or the provider console. For risky changes (firewall, users) take a snapshot first.`,
      ["Bevestiging of SSH op jouw pakket mag", "IP/user/key of console", "Snapshot bij riskante edits"],
      ["Confirm SSH is allowed on your plan", "IP/user/key or console", "Snapshot for risky edits"],
      [
        "Bevestig in welkomstmail/klantenpanel of SSH/VPS van toepassing is.",
        "Verbind met SSH of open de provider-console.",
        "Voer alleen de geplande wijziging door (dienst, firewallregel, limiet, key).",
        "Herstart enkel de betrokken dienst.",
        "Controleer poorten, processen en monitoring/uptime.",
      ],
      [
        "Confirm in welcome email/client panel whether SSH/VPS applies.",
        "Connect with SSH or open the provider console.",
        "Apply only the planned change (service, firewall rule, limit, key).",
        "Restart only the affected service.",
        "Check ports, processes and monitoring/uptime.",
      ],
      ["SSH of dienst bereikbaar zoals bedoeld"],
      ["SSH or service reachable as intended"],
      "Houd de console-URL bij de hand vóór firewall-edits.",
      "Keep the console URL handy before firewall edits.",
      "Sluit je eigen SSH-poort niet af zonder console-pad.",
      "Do not close your own SSH port without a console path.",
      "Snapshots, firewall, SFTP",
      "Snapshots, firewall, SFTP",
    );
  }

  // --- MySQL / databases ---
  if (/database|mysql|phpmyadmin|innodb|myisam|slow.?query|max.?connections|binary.?log|charset|collation|deadlock|replica.?lag|prisma/.test(hay)) {
    return P(
      "Database in DirectAdmin: MySQL Management / phpMyAdmin — aanmaken, importeren of herstellen, daarna connectie testen.",
      "Database in DirectAdmin: MySQL Management / phpMyAdmin — create, import or repair, then test the connection.",
      `“${titleNl}” doe je via DirectAdmin → MySQL Management en phpMyAdmin. Werk met backups vóór import/repair.`,
      `“${titleEn}” is done via DirectAdmin → MySQL Management and phpMyAdmin. Take backups before import/repair.`,
      ["DirectAdmin-login", "DB-naam/user of exportbestand", "Backup vóór destructieve acties"],
      ["DirectAdmin login", "DB name/user or export file", "Backup before destructive actions"],
      [
        "Log in op DirectAdmin → <strong>MySQL Management</strong>.",
        "Maak database + user aan of selecteer de bestaande database; noteer host (vaak localhost), user, wachtwoord, db-naam.",
        "Open <strong>phpMyAdmin</strong> voor import, export, repair/optimize of SQL.",
        "Voor import van grote dumps: gebruik eventueel SSH/mysql-cli als phpMyAdmin timeout geeft.",
        "Pas connection strings in de app (.env / wp-config) alleen aan als user/db wijzigen.",
        "Test de site of een eenvoudige query; check error_log bij connectiefouten.",
      ],
      [
        "Sign in to DirectAdmin → <strong>MySQL Management</strong>.",
        "Create database + user or select the existing database; note host (often localhost), user, password, db name.",
        "Open <strong>phpMyAdmin</strong> for import, export, repair/optimize or SQL.",
        "For large dump imports: use SSH/mysql-cli if phpMyAdmin times out.",
        "Update app connection strings (.env / wp-config) only if user/db change.",
        "Test the site or a simple query; check error_log on connection errors.",
      ],
      ["Connectie vanuit de app werkt", "Geen access-denied / unknown database"],
      ["App connection works", "No access-denied / unknown database"],
      "Gebruik utf8mb4 voor nieuwe databases.",
      "Use utf8mb4 for new databases.",
      "Drop/repair nooit zonder recente export.",
      "Never drop/repair without a recent export.",
      "JetBackup, File Manager, app .env",
      "JetBackup, File Manager, app .env",
    );
  }

  // --- File Manager / htaccess / password protect ---
  if (/file.?manager|bestandsbeheer|htaccess|mappen.?beschermen|chmod|inode/.test(hay) || (/directadmin/.test(hay) && /bestand|schijf|opslag|quota/.test(hay))) {
    return P(
      "Bestanden in DirectAdmin File Manager: juiste map, rechten, .htaccess; schijf/inodes controleren.",
      "Files in DirectAdmin File Manager: correct folder, permissions, .htaccess; check disk/inodes.",
      `“${titleNl}”: werk in DirectAdmin → File Manager in de juiste user/domeinmap (vaak domains/…/public_html).`,
      `“${titleEn}”: work in DirectAdmin → File Manager in the correct user/domain path (often domains/…/public_html).`,
      ["DirectAdmin-login", "Pad naar de site", "Backup bij .htaccess/rechten"],
      ["DirectAdmin login", "Path to the site", "Backup for .htaccess/permissions"],
      [
        "Log in op DirectAdmin → <strong>System Info & Files</strong> → <strong>File Manager</strong>.",
        "Navigeer naar <code>domains/jouwdomein/public_html</code> (of de bedoelde submap).",
        "Voor .htaccess/beveiliging: bewerk of maak <code>.htaccess</code>; voor mapwachtwoord gebruik Password Protected Directories.",
        "Zet bestandsrechten conservatief (bestanden ~644, mappen ~755) — geen 777.",
        "Bij volle schijf/inodes: verwijder caches, oude backups en grote logs; leeg Prullenbak in File Manager.",
        "Test de URL in een privévenster.",
      ],
      [
        "Sign in to DirectAdmin → <strong>System Info & Files</strong> → <strong>File Manager</strong>.",
        "Navigate to <code>domains/yourdomain/public_html</code> (or the intended subdirectory).",
        "For .htaccess/security: edit or create <code>.htaccess</code>; for folder passwords use Password Protected Directories.",
        "Keep permissions conservative (files ~644, folders ~755) — not 777.",
        "If disk/inodes are full: remove caches, old backups and large logs; empty File Manager Trash.",
        "Test the URL in a private window.",
      ],
      ["Site/map gedraagt zich zoals bedoeld", "Geen 500 door kapotte .htaccess"],
      ["Site/folder behaves as intended", "No 500 from a broken .htaccess"],
      "Download eerst een kopie van .htaccess vóór je experimenteert.",
      "Download a copy of .htaccess before experimenting.",
      "Verwijder geen wp-config of .env ‘om ruimte te maken’.",
      "Do not delete wp-config or .env ‘to free space’.",
      "FTP/SFTP, backups, PHP-fouten",
      "FTP/SFTP, backups, PHP errors",
    );
  }

  // --- JetBackup ---
  if (/jetbackup|backup.?maken|backup.?terug|restore|volledige.?site.?back/.test(hay)) {
    return P(
      "Backup/restore met JetBackup of DirectAdmin Create/Restore Backups.",
      "Backup/restore with JetBackup or DirectAdmin Create/Restore Backups.",
      `“${titleNl}”: maak of herstel via JetBackup / DirectAdmin backups. Kies files, databases of full; test daarna de site.`,
      `“${titleEn}”: create or restore via JetBackup / DirectAdmin backups. Choose files, databases or full; then test the site.`,
      ["DirectAdmin-login", "Welk herstelpunt", "Of mail/DNS meegaat"],
      ["DirectAdmin login", "Which restore point", "Whether mail/DNS is included"],
      [
        "Log in op DirectAdmin → JetBackup of <strong>Create/Restore Backups</strong>.",
        "Voor backup: selecteer home, databases, e-mail en/of cron; start de job; wacht tot Completed.",
        "Voor restore: kies datum/type; restore selectief (alleen DB of alleen files) als dat veiliger is.",
        "Na restore: leeg caches; test homepage, wp-admin en een kritieke flow.",
        "Controleer schijfruimte — oude backups opruimen volgens retentie.",
      ],
      [
        "Sign in to DirectAdmin → JetBackup or <strong>Create/Restore Backups</strong>.",
        "For backup: select home, databases, email and/or cron; start the job; wait until Completed.",
        "For restore: pick date/type; restore selectively (DB only or files only) when safer.",
        "After restore: clear caches; test homepage, wp-admin and a critical flow.",
        "Check disk space — prune old backups per retention.",
      ],
      ["Backup Completed of site werkt na restore"],
      ["Backup Completed or site works after restore"],
      "Selectieve restore verkleint risico t.o.v. full overwrite.",
      "Selective restore reduces risk versus full overwrite.",
      "Restore overschrijft live data — bevestig het juiste account.",
      "Restore overwrites live data — confirm the correct account.",
      "File Manager, MySQL, SSL",
      "File Manager, MySQL, SSL",
    );
  }

  // --- Installatron ---
  if (/installatron/.test(hay)) {
    return P(
      "Installatron: app installeren/updaten/backupen, daarna URL en login testen.",
      "Installatron: install/update/backup the app, then test URL and login.",
      `“${titleNl}” doe je in DirectAdmin → Installatron Applications Browser / My Applications.`,
      `“${titleEn}” is done in DirectAdmin → Installatron Applications Browser / My Applications.`,
      ["DirectAdmin-login", "Doeldomein/map", "Admin-gegevens voor de app"],
      ["DirectAdmin login", "Target domain/folder", "App admin credentials"],
      [
        "DirectAdmin → <strong>Installatron</strong> → Applications Browser of My Applications.",
        "Kies Install / Update / Backup / Restore voor de juiste installatie.",
        "Controleer pad (public_html of submap) en database-opties.",
        "Rond de wizard af; noteer admin-URL en wachtwoord.",
        "Open de site en /wp-admin (of app-login); leeg caches.",
      ],
      [
        "DirectAdmin → <strong>Installatron</strong> → Applications Browser or My Applications.",
        "Choose Install / Update / Backup / Restore for the correct installation.",
        "Check path (public_html or subdirectory) and database options.",
        "Finish the wizard; note admin URL and password.",
        "Open the site and /wp-admin (or app login); clear caches.",
      ],
      ["App bereikbaar", "Login werkt"],
      ["App reachable", "Login works"],
      "Backup in Installatron vóór updates op productie.",
      "Take an Installatron backup before production updates.",
      "Installeer niet twee CMS’en in dezelfde map.",
      "Do not install two CMSs in the same folder.",
      "PHP-versie, JetBackup, SSL",
      "PHP version, JetBackup, SSL",
    );
  }

  // --- DA domain / subdomain / pointer ---
  if (/directadmin/.test(hay) && /domein|subdomein|domain|pointer|verwijzing|reseller/.test(hay)) {
    return P(
      "Domein of subdomein in DirectAdmin: Domain Setup / Subdomain Management, DNS, daarna bereikbaarheid testen.",
      "Domain or subdomain in DirectAdmin: Domain Setup / Subdomain Management, DNS, then test reachability.",
      `“${titleNl}”: voeg het domein toe onder het juiste user-account in DirectAdmin, wijs DNS, wacht op propagatie.`,
      `“${titleEn}”: add the domain under the correct user account in DirectAdmin, point DNS, wait for propagation.`,
      ["DirectAdmin-login (juiste user/reseller)", "Domeinnaam", "DNS-toegang"],
      ["DirectAdmin login (correct user/reseller)", "Domain name", "DNS access"],
      [
        "Log in op DirectAdmin als de user die het domein mag hosten (reseller: eerst user kiezen).",
        "Open <strong>Domain Setup</strong> → Add Domain, of <strong>Subdomain Management</strong> / Domain Pointers.",
        "Vul de naam in; kies PHP/SSL-opties indien gevraagd; sla op.",
        "Zet A/AAAA (of NS) naar deze server in DNS.",
        "Vraag SSL aan na propagatie; test http(s)://domein.",
      ],
      [
        "Sign in to DirectAdmin as the user that may host the domain (reseller: select the user first).",
        "Open <strong>Domain Setup</strong> → Add Domain, or <strong>Subdomain Management</strong> / Domain Pointers.",
        "Enter the name; choose PHP/SSL options if asked; save.",
        "Point A/AAAA (or NS) to this server in DNS.",
        "Request SSL after propagation; test http(s)://domain.",
      ],
      ["Domein zichtbaar in DA", "Site of placeholder bereikbaar"],
      ["Domain visible in DA", "Site or placeholder reachable"],
      "Subdomeinen krijgen vaak een eigen map onder public_html of domains/.",
      "Subdomains often get their own folder under public_html or domains/.",
      "Verwijderen van een domein wist webroot — backup eerst.",
      "Removing a domain deletes the web root — backup first.",
      "DNS, SSL, File Manager",
      "DNS, SSL, File Manager",
    );
  }

  // --- DA password / login / IP block / stats ---
  if (/directadmin/.test(hay) && /wachtwoord|login|brute.?force|ip.?blok|statistiek|custombuild|sni/.test(hay)) {
    return P(
      "DirectAdmin-accountbeheer: wachtwoord, brute-force monitor of IP-blokkade — daarna opnieuw inloggen testen.",
      "DirectAdmin account admin: password, brute-force monitor or IP block — then test login again.",
      `“${titleNl}” regel je in DirectAdmin onder Account/Security of Admin/Reseller-tools.`,
      `“${titleEn}” is handled in DirectAdmin under Account/Security or Admin/Reseller tools.`,
      ["Huidige DA-login of reseller/admin-toegang", "Eigen IP bij blokkades"],
      ["Current DA login or reseller/admin access", "Your own IP when blocking"],
      [
        "Log in op DirectAdmin.",
        "Wachtwoord: Account Manager / Password → stel een sterk wachtwoord in; sla op.",
        "Brute Force Monitor / IP Blocker: bekijk blocked IPs; unblock jezelf indien nodig; blokkeer alleen misbruik-IP’s.",
        "Statistieken: Site Summary / AWStats / Logs — open het juiste domein.",
        "Log uit en opnieuw in om de wijziging te bevestigen.",
      ],
      [
        "Sign in to DirectAdmin.",
        "Password: Account Manager / Password → set a strong password; save.",
        "Brute Force Monitor / IP Blocker: review blocked IPs; unblock yourself if needed; block only abuse IPs.",
        "Statistics: Site Summary / AWStats / Logs — open the correct domain.",
        "Sign out and back in to confirm the change.",
      ],
      ["Opnieuw inloggen lukt", "Blokkade/statistiek klopt"],
      ["Login works again", "Block/stats look correct"],
      "Bewaar het nieuwe DA-wachtwoord in een password manager.",
      "Store the new DA password in a password manager.",
      "Blokkeer niet je eigen kantoor-IP zonder console-pad.",
      "Do not block your own office IP without a console path.",
      "2FA klantenpanel, FTP-wachtwoord",
      "Client panel 2FA, FTP password",
    );
  }

  // --- Remaining DirectAdmin mentions ---
  if (/\bdirectadmin\b/.test(hay)) {
    return P(
      `${titleNl}: in DirectAdmin uitvoeren en buiten het panel controleren.`,
      `${titleEn}: complete in DirectAdmin and verify outside the panel.`,
      `“${titleNl}” doe je in DirectAdmin op het juiste user-account. Open Account Manager, E-mail Accounts, DNS Management, File Manager, Installatron, SSL Certificates, Cron Jobs of MySQL Management — kies bewust één tool.`,
      `“${titleEn}” is done in DirectAdmin on the correct user account. Open Account Manager, Email Accounts, DNS Management, File Manager, Installatron, SSL Certificates, Cron Jobs or MySQL Management — pick one tool deliberately.`,
      ["DirectAdmin-login", "Juiste domein/user", "Backup bij riskante wijzigingen"],
      ["DirectAdmin login", "Correct domain/user", "Backup for risky changes"],
      [
        "Log in op DirectAdmin en selecteer het juiste account/domein.",
        "Open Account Manager, E-mail, DNS, File Manager, Installatron, SSL, Cron Jobs of MySQL — specifiek voor deze taak.",
        "Noteer de huidige waarde of status.",
        "Voer de wijziging door en sla op.",
        "Test buiten DirectAdmin: browser, webmail, DNS-lookup of log.",
      ],
      [
        "Sign in to DirectAdmin and select the correct account/domain.",
        "Open Account Manager, Email, DNS, File Manager, Installatron, SSL, Cron Jobs or MySQL — specific to this task.",
        "Note the current value or status.",
        "Apply the change and save.",
        "Test outside DirectAdmin: browser, webmail, DNS lookup or log.",
      ],
      ["Verwachte uitkomst zichtbaar buiten DirectAdmin"],
      ["Expected outcome visible outside DirectAdmin"],
      "Blijf op één domein werken tot de taak klaar is.",
      "Stay on one domain until the task is done.",
      "Wijzigingen onder het verkeerde user-account raken de verkeerde site.",
      "Changes under the wrong user account hit the wrong site.",
      "Backups, SSL, e-mail, DNS",
      "Backups, SSL, email, DNS",
    );
  }

  // --- Hosting plan / upgrade / cancel ---
  if (/hostingpakket|abonnement|opzeg|upgrade|downgrade|verhuizen|migratie|factuur|invoice|bandbreedte|opslag/.test(hay)) {
    return P(
      "Abonnement/hosting in het klantenpanel: status checken, wijziging doorvoeren, bevestiging controleren.",
      "Plan/hosting in the client panel: check status, apply the change, confirm.",
      `“${titleNl}” regel je in het TripleZero iT klantenpanel (producten/facturen) of via support bij verhuizingen.`,
      `“${titleEn}” is handled in the TripleZero iT client panel (products/invoices) or via support for migrations.`,
      ["Klantenpanel-login", "Klantnummer/domein", "Welke wijziging (upgrade/opzeg/verhuizing)"],
      ["Client panel login", "Customer number/domain", "Which change (upgrade/cancel/migration)"],
      [
        "Log in op het TripleZero iT klantenpanel.",
        "Open Producten/Diensten of Facturen — afhankelijk van de vraag.",
        "Voor pakketwijziging: kies upgrade/downgrade en bevestig de order.",
        "Voor opzeggen: volg Opzeggen/Cancel en bewaar de bevestiging.",
        "Voor verhuizing: open een ticket met DNS-tijdpad en of mail meeverhuist.",
        "Controleer bevestigingsmail en panelstatus.",
      ],
      [
        "Sign in to the TripleZero iT client panel.",
        "Open Products/Services or Invoices — depending on the request.",
        "For plan changes: choose upgrade/downgrade and confirm the order.",
        "For cancellation: follow Cancel and keep the confirmation.",
        "For migrations: open a ticket with DNS timeline and whether mail moves too.",
        "Check confirmation email and panel status.",
      ],
      ["Panelstatus of orderbevestiging klopt"],
      ["Panel status or order confirmation is correct"],
      "Noteer einddatum en of domein apart van hosting loopt.",
      "Note the end date and whether domain is separate from hosting.",
      "Geen destructieve deletes zonder export.",
      "No destructive deletes without an export.",
      "DNS, backups, tickets",
      "DNS, backups, tickets",
    );
  }

  // --- Port scanning detect & respond ---
  if (/poortscan|port.?scan|nmap|reconnaissance|port.?scanning/.test(hay)) {
    return P(
      "Poortscanning detecteren in logs/firewall en reageren: sluiten, rate-limiten, monitoren.",
      "Detect port scanning in logs/firewall and respond: close, rate-limit, monitor.",
      `“${titleNl}” is een VPS/firewall-taak: herken scanpatronen in logs, beperk blootgestelde poorten en blokkeer agressieve bronnen — niet via wp-admin.`,
      `“${titleEn}” is a VPS/firewall task: spot scan patterns in logs, limit exposed ports and block aggressive sources — not via wp-admin.`,
      ["SSH of provider-console", "Toegang tot firewall/fail2ban/logs", "Lijst van poorten die echt open moeten"],
      ["SSH or provider console", "Access to firewall/fail2ban/logs", "List of ports that must stay open"],
      [
        "Bevestig het signaal: hostingalert, <code>auth.log</code>/<code>secure</code>, firewall-log of fail2ban-hits met veel poorten vanaf één IP in korte tijd.",
        "Inventariseer luisterende poorten (<code>ss -tulpn</code> of panel-firewall). Noteer wat productief nodig is (22/80/443, …).",
        "Sluit onnodige poorten in de host-firewall (ufw/firewalld/iptables) én in de provider-firewall/security group.",
        "Activeer of tune fail2ban/crowdsec voor sshd (en eventueel andere jails); blokkeer hardnekkige scanner-IP’s.",
        "Zet SSH op keys + eventueel non-standaard poort of allowlist; schakel wachtwoordlogin uit als keys werken.",
        "Monitor 24–48 uur: dalen de hits? Blijven legitieme diensten bereikbaar?",
      ],
      [
        "Confirm the signal: host alert, <code>auth.log</code>/<code>secure</code>, firewall log or fail2ban hits with many ports from one IP in a short window.",
        "Inventory listening ports (<code>ss -tulpn</code> or panel firewall). Note what production needs (22/80/443, …).",
        "Close unnecessary ports in the host firewall (ufw/firewalld/iptables) and in the provider firewall/security group.",
        "Enable or tune fail2ban/crowdsec for sshd (and other jails); block persistent scanner IPs.",
        "Move SSH to keys + optional non-default port or allowlist; disable password login once keys work.",
        "Monitor 24–48h: are hits dropping? Do legitimate services stay reachable?",
      ],
      ["Alleen benodigde poorten open", "Scanner-IP’s geblokkeerd of sterk beperkt", "Eigen SSH/HTTP nog bereikbaar"],
      ["Only required ports open", "Scanner IPs blocked or strongly limited", "Your SSH/HTTP still reachable"],
      "Houd de provider-console-URL bij de hand vóór je SSH-regels aanscherpt.",
      "Keep the provider console URL handy before tightening SSH rules.",
      "Blokkeer niet je eigen kantoor-IP of monitoring zonder uitzondering.",
      "Do not block your own office IP or monitoring without an exception.",
      "Firewall, fail2ban, snapshots, SSH-keys",
      "Firewall, fail2ban, snapshots, SSH keys",
    );
  }

  // --- Firewall / fail2ban / netwerk herstellen ---
  if (/fail2ban|crowdsec|ufw|iptables|firewalld|firewallregel|ip.?blokkeer|netwerk.?herstellen.?na.?verkeerde.?firewall/.test(hay)) {
    return P(
      "Firewall/fail2ban: regel zetten of herstellen via console, daarna bereikbaarheid testen.",
      "Firewall/fail2ban: apply or restore a rule via console, then test reachability.",
      `“${titleNl}”: wijzig firewallregels liever met console-pad klaar. Test SSH/HTTP vanaf een tweede netwerk.`,
      `“${titleEn}”: change firewall rules with a console path ready. Test SSH/HTTP from a second network.`,
      ["Provider-console of IPMI/KVM", "Huidige regels geëxporteerd/screenshot", "Welke poorten/IP’s bedoeld zijn"],
      ["Provider console or IPMI/KVM", "Current rules exported/screenshot", "Intended ports/IPs"],
      [
        "Open de provider-console (of IPMI) vóór je SSH-poorten dichtzet.",
        "Bekijk huidige regels (<code>ufw status</code>, <code>iptables -L -n</code>, firewalld, of cloud security group).",
        "Pas alleen de bedoelde allow/deny toe; behoud management-toegang.",
        "Voor fail2ban: controleer jail, bantime, ignoreip; unban jezelf met <code>fail2ban-client set JAIL unbanip IP</code> indien nodig.",
        "Test vanaf extern: SSH, website, monitoring.",
        "Lukt SSH niet meer: herstel via console de laatste werkende regelset.",
      ],
      [
        "Open the provider console (or IPMI) before closing SSH ports.",
        "Review current rules (<code>ufw status</code>, <code>iptables -L -n</code>, firewalld, or cloud security group).",
        "Apply only the intended allow/deny; keep management access.",
        "For fail2ban: check jail, bantime, ignoreip; unban yourself with <code>fail2ban-client set JAIL unbanip IP</code> if needed.",
        "Test externally: SSH, website, monitoring.",
        "If SSH fails: restore the last working ruleset via console.",
      ],
      ["Beoogde poorten open", "Ongewenst verkeer geweigerd", "Eigen beheerpad werkt"],
      ["Intended ports open", "Unwanted traffic denied", "Your admin path works"],
      "Zet je vaste kantoor-IP op ignoreip/allowlist.",
      "Put your static office IP on ignoreip/allowlist.",
      "Een ‘deny all’ zonder allow SSH/console = lock-out.",
      "A ‘deny all’ without allow SSH/console = lock-out.",
      "Poortscanning, snapshots, console",
      "Port scanning, snapshots, console",
    );
  }

  // --- Rescue / boot / fsck / grub ---
  if (/rescue|fsck|grub|bootloader|kernel.?panic|fstab|single.?user|rootwachtwoord.?reset|os.?schijf.?niet.?meer.?boot|bestanden.?redden/.test(hay)) {
    return P(
      "Rescue/boot-herstel: console of rescue-ISO, schijf mounten, repareren, daarna normaal booten.",
      "Rescue/boot recovery: console or rescue ISO, mount disk, repair, then boot normally.",
      `“${titleNl}” doe je via provider rescue/KVM — niet via DirectAdmin. Werk read-only eerst; schrijf pas na diagnose.`,
      `“${titleEn}” is done via provider rescue/KVM — not DirectAdmin. Start read-only; write only after diagnosis.`,
      ["Provider-panel met Rescue/KVM", "Schijf/volume-ID", "Snapshot als die nog kan"],
      ["Provider panel with Rescue/KVM", "Disk/volume ID", "Snapshot if still possible"],
      [
        "Maak een snapshot als de machine nog reageert.",
        "Start Rescue mode of mount een rescue-ISO via KVM/IPMI; boot daarin.",
        "Identificeer de OS-schijf (<code>lsblk</code>); mount read-only om data te inspecteren.",
        "Voor wachtwoord: chroot of passwd in de gemounte root; voor fstab/grub: herstel config en <code>grub-install</code>/<code>update-grub</code> volgens distro.",
        "Voor filesystem: draai <code>fsck</code> alleen op unmounted volumes.",
        "Unmount, schakel rescue uit, reboot naar het normale OS; verifieer login en diensten.",
      ],
      [
        "Take a snapshot if the machine still responds.",
        "Start Rescue mode or mount a rescue ISO via KVM/IPMI; boot into it.",
        "Identify the OS disk (<code>lsblk</code>); mount read-only to inspect data.",
        "For password: chroot or passwd on the mounted root; for fstab/grub: fix config and <code>grub-install</code>/<code>update-grub</code> per distro.",
        "For filesystem: run <code>fsck</code> only on unmounted volumes.",
        "Unmount, disable rescue, reboot to the normal OS; verify login and services.",
      ],
      ["Systeem boot weer", "Data bereikbaar of hersteld", "Geen fstab-loop meer"],
      ["System boots again", "Data reachable or recovered", "No more fstab loop"],
      "Kopieer kritieke data eerst naar een tweede volume vóór agressieve fsck.",
      "Copy critical data to a second volume before aggressive fsck.",
      "fsck op een gemounte root kan schade verergeren.",
      "fsck on a mounted root can make damage worse.",
      "Snapshots, IPMI/KVM, backups",
      "Snapshots, IPMI/KVM, backups",
    );
  }

  // --- IPMI / iLO / iDRAC / BMC / KVM ---
  if (/ipmi|ilo|idrac|bmc|kvm.?ip|out.of.band|virtual.?media|remote.?management|remote.?console/.test(hay)) {
    return P(
      "Out-of-band beheer (IPMI/iLO/iDRAC): veilig netwerk, login, console/ISO, daarna isolatie checken.",
      "Out-of-band management (IPMI/iLO/iDRAC): secure network, login, console/ISO, then verify isolation.",
      `“${titleNl}”: BMC/remote console is een apart beheerpad. Houd het uit het publieke internet of achter VPN.`,
      `“${titleEn}”: BMC/remote console is a separate management path. Keep it off the public internet or behind VPN.`,
      ["BMC-URL/IP", "Sterke BMC-credentials", "VPN of management-VLAN indien verplicht"],
      ["BMC URL/IP", "Strong BMC credentials", "VPN or management VLAN if required"],
      [
        "Bereik de BMC alleen via VPN/management-netwerk — niet open op 0.0.0.0/0.",
        "Log in; wijzig default-wachtwoorden; schakel ongebruikte services uit.",
        "Open de HTML5/Java remote console om het OS te zien alsof je fysiek voor de server zit.",
        "Voor OS-install/rescue: mount ISO via Virtual Media; boot van CD/DVD in boot-order.",
        "Documenteer MAC, BMC-IP en welk netwerksegment hoort bij beheer.",
        "Test of je zonder BMC nog steeds monitoring hebt, maar bij netwerk-down wél console.",
      ],
      [
        "Reach the BMC only via VPN/management network — not open on 0.0.0.0/0.",
        "Sign in; change default passwords; disable unused services.",
        "Open the HTML5/Java remote console to see the OS as if you were physically there.",
        "For OS install/rescue: mount ISO via Virtual Media; boot from CD/DVD in boot order.",
        "Document MAC, BMC IP and which network segment is for management.",
        "Verify you still have monitoring without BMC, but console when the OS network is down.",
      ],
      ["Console opent", "BMC niet publiek bereikbaar", "ISO-mount werkt indien nodig"],
      ["Console opens", "BMC not publicly reachable", "ISO mount works if needed"],
      "Bewaar BMC-wachtwoorden in een password manager, gescheiden van OS-root.",
      "Store BMC passwords in a password manager, separate from OS root.",
      "Verouderde BMC-firmware is een veelgebruikt aanvalsoppervlak — plan updates.",
      "Outdated BMC firmware is a common attack surface — plan updates.",
      "Rescue mode, firewall op management-VLAN, firmware",
      "Rescue mode, firewall on management VLAN, firmware",
    );
  }

  // --- Storage / RAID / SMART / disk ---
  if (/raid|nvme|dwpd|smart|serverschijf|disk.?full|schijf.?vol|lvm|volume.?redden|endurance/.test(hay)) {
    return P(
      "Opslag/RAID/SMART: gezondheid checken, ruimte vrijmaken of redundantie verifiëren, daarna monitoring.",
      "Storage/RAID/SMART: check health, free space or verify redundancy, then monitoring.",
      `“${titleNl}”: werk met SMART/RAID-status en snapshots vóór je schijven vervangt of volumes wijzigt.`,
      `“${titleEn}”: use SMART/RAID status and snapshots before replacing disks or changing volumes.`,
      ["Console/SSH", "RAID/HBA-tool of smartctl", "Backup van kritieke data"],
      ["Console/SSH", "RAID/HBA tool or smartctl", "Backup of critical data"],
      [
        "Check vrije ruimte (<code>df -h</code>) en inodes (<code>df -i</code>); ruim logs/backups/caches op indien vol.",
        "Lees SMART (<code>smartctl -a</code>) of controller-status: reallocated sectors, failed disks.",
        "Bij RAID: bevestig dat het array degraded of OK is vóór je een disk trekt; volg hot-spare procedure.",
        "Voor data redden: kopieer naar een tweede volume vóór fsck of disk-replace.",
        "Zet alerts op SMART/RAID/disk-usage in monitoring.",
        "Test of de applicatie na cleanup/replace weer stabiel I/O heeft.",
      ],
      [
        "Check free space (<code>df -h</code>) and inodes (<code>df -i</code>); clean logs/backups/caches if full.",
        "Read SMART (<code>smartctl -a</code>) or controller status: reallocated sectors, failed disks.",
        "For RAID: confirm the array is degraded or OK before pulling a disk; follow hot-spare procedure.",
        "To salvage data: copy to a second volume before fsck or disk replace.",
        "Enable alerts for SMART/RAID/disk usage in monitoring.",
        "Verify the application has stable I/O after cleanup/replace.",
      ],
      ["Geen kritieke SMART-fouten genegeerd", "Ruimte onder alarmdrempel", "Array healthy of rebuild gestart"],
      ["No critical SMART faults ignored", "Space under alert threshold", "Array healthy or rebuild started"],
      "Kies endurance (DWPD/TBW) passend bij write-heavy workloads (DB/logs).",
      "Pick endurance (DWPD/TBW) suited to write-heavy workloads (DB/logs).",
      "Hot-remove zonder degraded-check kan het array kilen.",
      "Hot-removing without a degraded check can kill the array.",
      "Backups, monitoring, rescue",
      "Backups, monitoring, rescue",
    );
  }

  // --- VPN / bonding / private network ---
  if (/wireguard|openvpn|\bvpn\b|bonding|vlan|private.?network|netwerkkaart.?bond/.test(hay)) {
    return P(
      "VPN of netwerkbonding: config toepassen, tunnel/LACP testen, daarna failover checken.",
      "VPN or network bonding: apply config, test tunnel/LACP, then check failover.",
      `“${titleNl}”: wijzig netwerk liever met console bij de hand; test bereikbaarheid en failover expliciet.`,
      `“${titleEn}”: change networking with console handy; explicitly test reachability and failover.`,
      ["SSH of console", "Peer-IP’s/keys of switch-config", "Rollback van oude netwerkconfig"],
      ["SSH or console", "Peer IPs/keys or switch config", "Rollback of old network config"],
      [
        "Noteer huidige IP’s/routes (<code>ip a</code>, <code>ip r</code>).",
        "Voor VPN: installeer/configureer WireGuard/OpenVPN; wissel keys; start de tunnel; check handshake.",
        "Voor bonding/VLAN: zet de bond/VLAN-interfaces volgens provider-doc; behoud een management-pad.",
        "Test ping/SSH over het nieuwe pad; daarna failover (kabel/peer down) indien redundantie het doel is.",
        "Zet de config persistent (systemd/netplan/network scripts).",
        "Documenteer private ranges en wie toegang heeft.",
      ],
      [
        "Note current IPs/routes (<code>ip a</code>, <code>ip r</code>).",
        "For VPN: install/configure WireGuard/OpenVPN; exchange keys; start the tunnel; check handshake.",
        "For bonding/VLAN: set bond/VLAN interfaces per provider docs; keep a management path.",
        "Test ping/SSH over the new path; then failover (unplug/peer down) if redundancy is the goal.",
        "Make the config persistent (systemd/netplan/network scripts).",
        "Document private ranges and who has access.",
      ],
      ["Tunnel of bond UP", "Traffic over het bedoelde pad", "Management bereikbaar bij failover-test"],
      ["Tunnel or bond UP", "Traffic on the intended path", "Management reachable during failover test"],
      "Houd BMC/console bereikbaar buiten de VPN die je net wijzigt.",
      "Keep BMC/console reachable outside the VPN you are changing.",
      "Verkeerde netmask/gateway = directe lock-out op remote VPS.",
      "Wrong netmask/gateway = immediate lock-out on a remote VPS.",
      "Firewall, private networking, monitoring",
      "Firewall, private networking, monitoring",
    );
  }

  // --- Backup / DR / 3-2-1 ---
  if (/3-2-1|disaster.?recovery|\brto\b|\brpo\b|backupstrategie|backup.?ritme|offsite.?backup/.test(hay)) {
    return P(
      "Backup/DR: retentie en offsite vastleggen, restore testen, RTO/RPO afstemmen.",
      "Backup/DR: define retention and offsite, test restore, align RTO/RPO.",
      `“${titleNl}”: een strategie telt pas na een geslaagde restore-test — niet alleen na “backup gelukt”.`,
      `“${titleEn}”: a strategy only counts after a successful restore test — not merely “backup OK”.`,
      ["Overzicht systemen (files/DB/mail)", "Backuptool (JetBackup/snapshots/object storage)", "Doel-RTO/RPO"],
      ["Inventory of systems (files/DB/mail)", "Backup tool (JetBackup/snapshots/object storage)", "Target RTO/RPO"],
      [
        "Inventariseer wat kritisch is (DB, uploads, config, mail) en hoe vaak het wijzigt.",
        "Stel 3-2-1 in: ≥3 kopieën, 2 media/typen, 1 offsite (andere provider/region).",
        "Configureer schema + retentie; versleutel offsite waar mogelijk.",
        "Doe een restore-test op staging of een los volume; meet de tijd (RTO) en datapunt (RPO).",
        "Documenteer wie restore mag starten en hoe je support informeert bij outage.",
        "Plan periodieke herhaaltests (bijv. elk kwartaal).",
      ],
      [
        "Inventory what is critical (DB, uploads, config, mail) and how often it changes.",
        "Implement 3-2-1: ≥3 copies, 2 media/types, 1 offsite (other provider/region).",
        "Configure schedule + retention; encrypt offsite where possible.",
        "Run a restore test on staging or a spare volume; measure time (RTO) and data point (RPO).",
        "Document who may start restores and how you inform support during outage.",
        "Schedule periodic retests (e.g. quarterly).",
      ],
      ["Offsite-kopie bestaat", "Restore-test geslaagd met genoteerde RTO/RPO"],
      ["Offsite copy exists", "Restore test succeeded with noted RTO/RPO"],
      "Test ook “alleen database” en “alleen files” — niet enkel full.",
      "Also test “database only” and “files only” — not just full.",
      "Backups op dezelfde schijf als productie zijn geen offsite.",
      "Backups on the same disk as production are not offsite.",
      "JetBackup, snapshots, monitoring",
      "JetBackup, snapshots, monitoring",
    );
  }

  // --- Monitoring ---
  if (/monitoring|uptime|alerting|smart.?temperatuur|hardware.?monitoring|prometheus|grafana|statuspagina/.test(hay)) {
    return P(
      "Monitoring: checks op poort/HTTP/disk, alerts naar de juiste kanalen, stiltes vermijden.",
      "Monitoring: checks on port/HTTP/disk, alerts to the right channels, avoid silent failures.",
      `“${titleNl}”: monitor wat uitval verklaart (HTTP, poort, disk, CPU) en test of alerts echt aankomen.`,
      `“${titleEn}”: monitor what explains outages (HTTP, port, disk, CPU) and verify alerts actually arrive.`,
      ["Monitoringtool of provider-alerts", "Lijst van kritieke URL’s/poorten", "Escalatiekanaal (mail/SMS/chat)"],
      ["Monitoring tool or provider alerts", "List of critical URLs/ports", "Escalation channel (mail/SMS/chat)"],
      [
        "Kies checks: HTTPS-status, TCP-poort, disk%/inode, CPU/RAM, eventueel SMART/RAID.",
        "Zet drempels en maintenance windows om false positives te beperken.",
        "Stuur alerts naar een kanaal dat iemand buiten kantooruren ziet.",
        "Forceer een testalert (of stop de dienst kort in staging) en bevestig ontvangst.",
        "Koppel runbooks: wat doen bij 502, disk full, SSH down.",
      ],
      [
        "Choose checks: HTTPS status, TCP port, disk%/inode, CPU/RAM, optionally SMART/RAID.",
        "Set thresholds and maintenance windows to limit false positives.",
        "Send alerts to a channel someone sees outside office hours.",
        "Force a test alert (or briefly stop the service in staging) and confirm delivery.",
        "Attach runbooks: what to do on 502, disk full, SSH down.",
      ],
      ["Testalert ontvangen", "Productiechecks groen"],
      ["Test alert received", "Production checks green"],
      "Monitor ook het certificaatverloop (niet alleen homepage 200).",
      "Also monitor certificate expiry (not only homepage 200).",
      "Alerts zonder eigenaar worden genegeerd — wijs een rol toe.",
      "Alerts without an owner get ignored — assign a role.",
      "Firewall, backups, statuscommunicatie",
      "Firewall, backups, status communication",
    );
  }

  // --- HTTP errors / troubleshooting ---
  if (/403|404|500|502|503|504|http.?status|foutmelding|troubleshooting|website.?down|witte.?pagina/.test(hay) && !/wordpress.?critical/.test(hay)) {
    return P(
      "HTTP-fout oplossen: status isoleren, logs/DNS/SSL/app checken, fix verifiëren in privévenster.",
      "Fix HTTP errors: isolate status, check logs/DNS/SSL/app, verify fix in a private window.",
      `“${titleNl}”: begin met de exacte statuscode en URL. Daarna DNS → SSL → webserver/app → cache/CDN.`,
      `“${titleEn}”: start with the exact status code and URL. Then DNS → SSL → web server/app → cache/CDN.`,
      ["Exacte URL + statuscode", "Tijdstip", "Toegang tot panel/logs of CDN"],
      ["Exact URL + status code", "Timestamp", "Access to panel/logs or CDN"],
      [
        "Reproduceer in een privévenster; noteer 403/404/500/502/503/504.",
        "403: rechten/.htaccess/WAF; 404: pad/DNS/document root; 5xx: error_log/PHP/app, upstream timeout.",
        "Check DNS A/AAAA en SSL-geldigheid; bypass CDN tijdelijk indien nodig.",
        "DirectAdmin/CyberPanel/Plesk: Error Log van het domein; herstel laatste wijziging (plugin, deploy, firewall).",
        "Purge cache; test opnieuw vanaf mobiel netwerk.",
      ],
      [
        "Reproduce in a private window; note 403/404/500/502/503/504.",
        "403: permissions/.htaccess/WAF; 404: path/DNS/document root; 5xx: error_log/PHP/app, upstream timeout.",
        "Check DNS A/AAAA and SSL validity; temporarily bypass CDN if needed.",
        "DirectAdmin/CyberPanel/Plesk: domain Error Log; revert last change (plugin, deploy, firewall).",
        "Purge cache; retest from a mobile network.",
      ],
      ["URL geeft verwachte status (200/redirect)", "Geen nieuwe errors in log"],
      ["URL returns expected status (200/redirect)", "No new errors in the log"],
      "Neem de response headers en eerste logregel mee in tickets.",
      "Include response headers and the first log line in tickets.",
      "Blind plugins herinstalleren zonder log = langer downtime.",
      "Blindly reinstalling plugins without logs = longer downtime.",
      "DNS, SSL, PHP-versie, CDN",
      "DNS, SSL, PHP version, CDN",
    );
  }

  // --- Microsoft 365 ---
  if (/microsoft.?365|office.?365|exchange.?online|entra|azure.?ad|teams|onedrive|sharepoint|outlook.?web|m365/.test(hay)) {
    return P(
      "Microsoft 365: admin center of Outlook — DNS/licentie/mailbox, daarna client testen.",
      "Microsoft 365: admin center or Outlook — DNS/license/mailbox, then test the client.",
      `“${titleNl}” hoort in Microsoft 365 admin / Outlook op het web — MX/TXT bij DNS, niet in DirectAdmin mailbox-aanmaak (tenzij hybride).`,
      `“${titleEn}” belongs in Microsoft 365 admin / Outlook on the web — MX/TXT in DNS, not DirectAdmin mailbox create (unless hybrid).`,
      ["M365-admin of gebruikerstoegang", "Domein geverifieerd in M365", "DNS-toegang voor MX/TXT"],
      ["M365 admin or user access", "Domain verified in M365", "DNS access for MX/TXT"],
      [
        "Log in op admin.microsoft.com of outlook.office.com (afhankelijk van de taak).",
        "Voor mail: controleer gebruikerslicentie, mailbox bestaat, MX/Autodiscover/DKIM-records.",
        "Voor Entra/rollen: ken minimale adminrollen toe; vermijd globale admin voor dagelijks werk.",
        "Voor Teams/OneDrive: check sharing-policies en dat de gebruiker is aangemeld met het juiste account.",
        "Test vanaf een client: nieuw bericht, agenda of bestand delen.",
      ],
      [
        "Sign in to admin.microsoft.com or outlook.office.com (depending on the task).",
        "For mail: verify user license, mailbox exists, MX/Autodiscover/DKIM records.",
        "For Entra/roles: assign least-privilege admin roles; avoid global admin for daily work.",
        "For Teams/OneDrive: check sharing policies and that the user signed in with the right account.",
        "Test from a client: new message, calendar or file share.",
      ],
      ["Functie werkt voor de testgebruiker", "DNS/licentie zonder fout"],
      ["Feature works for the test user", "DNS/license without error"],
      "Wijzig MX pas als je mailboxen in M365 klaarstaan.",
      "Change MX only once mailboxes are ready in M365.",
      "Dubbele MX naar hosting én M365 zonder plan = mailchaos.",
      "Dual MX to hosting and M365 without a plan = mail chaos.",
      "DNS, SPF/DKIM, gebruikerslicenties",
      "DNS, SPF/DKIM, user licenses",
    );
  }

  // --- Payments / Mollie ---
  if (/mollie|ideal|stripe|betaalprovider|webhook.?betaal|abonnementsbetaling|apple.?pay|google.?pay/.test(hay)) {
    return P(
      "Betaalprovider: API-keys, webhook, testbetaling, daarna live en logging controleren.",
      "Payment provider: API keys, webhook, test payment, then verify live mode and logging.",
      `“${titleNl}”: koppel Mollie/Stripe in de shop met testkeys eerst; webhooks moeten HMAC/handtekening valideren.`,
      `“${titleEn}”: connect Mollie/Stripe in the shop with test keys first; webhooks must validate HMAC/signature.`,
      ["Merchant-dashboard login", "Test- en live API-keys", "Webhook-URL (HTTPS)"],
      ["Merchant dashboard login", "Test and live API keys", "Webhook URL (HTTPS)"],
      [
        "Maak/keys in het Mollie- of Stripe-dashboard; bewaar secrets buiten git.",
        "Configureer de plugin/app in testmodus; zet de webhook-URL en secret.",
        "Doe een testbetaling (iDEAL/testkaart); controleer orderstatus en webhook-log.",
        "Schakel live keys pas na geslaagde test; herhaal één kleine live smoke-test.",
        "Monitor mislukte webhooks en refund-flows.",
      ],
      [
        "Create keys in the Mollie or Stripe dashboard; keep secrets out of git.",
        "Configure the plugin/app in test mode; set webhook URL and secret.",
        "Run a test payment (iDEAL/test card); check order status and webhook log.",
        "Switch to live keys only after a successful test; repeat one small live smoke test.",
        "Monitor failed webhooks and refund flows.",
      ],
      ["Testorder betaald + status bijgewerkt", "Webhook 2xx in dashboard"],
      ["Test order paid + status updated", "Webhook 2xx in dashboard"],
      "Sluit checkout uit van full-page cache.",
      "Exclude checkout from full-page cache.",
      "Live keys op staging = risico op echte charges.",
      "Live keys on staging = risk of real charges.",
      "WooCommerce Status, HTTPS, HMAC-webhooks",
      "WooCommerce Status, HTTPS, HMAC webhooks",
    );
  }

  // --- Compare / keuzehulp ---
  if (/verschil|versus|vs\.|vergelijk|wanneer.?kies|keuzehulp|wat.?is.?een|dedicated.?resources.?versus/.test(hay)) {
    return P(
      "Keuzehulp: eisen inventariseren, opties vergelijken op vaste criteria, beslissing vastleggen.",
      "Decision guide: inventory requirements, compare options on fixed criteria, record the decision.",
      `“${titleNl}” is geen panelklik-procedure maar een beslissing. Gebruik harde criteria (verkeer, root, budget, beheer).`,
      `“${titleEn}” is not a panel-click procedure but a decision. Use hard criteria (traffic, root, budget, ops).`,
      ["Huidige workload (CPU/RAM/verkeer)", "Budget/maand", "Of je root/SSH nodig hebt"],
      ["Current workload (CPU/RAM/traffic)", "Monthly budget", "Whether you need root/SSH"],
      [
        "Schrijf op: traffic, pieken, of je custom software/root nodig hebt, SLA-verwachting.",
        "Zet opties naast elkaar (shared / VPS / dedicated / colocation) op: isolatie, schaal, prijs, beheerlast.",
        "Toets TripleZero iT-pakketten of offertes tegen die criteria — niet alleen de laagste prijs.",
        "Kies één pad; noteer migratiewerk (DNS, mail, backups) als je overstapt.",
        "Plan een review na 30 dagen met metingen (CPU, storage, tickets).",
      ],
      [
        "Write down: traffic, peaks, whether you need custom software/root, SLA expectation.",
        "Compare options (shared / VPS / dedicated / colocation) on: isolation, scale, price, ops effort.",
        "Match TripleZero iT plans or quotes against those criteria — not only lowest price.",
        "Pick one path; note migration work (DNS, mail, backups) if switching.",
        "Plan a 30-day review with metrics (CPU, storage, tickets).",
      ],
      ["Beslissing gedocumenteerd met criteria", "Volgende migratie-/orderstap duidelijk"],
      ["Decision documented with criteria", "Next migration/order step clear"],
      "Overprovision ‘voor de zekerheid’ kost maandelijks — meet eerst.",
      "Overprovisioning ‘to be safe’ costs monthly — measure first.",
      "Alleen op marketingclaims kiezen zonder metingen leidt tot verkeerde resize.",
      "Choosing on marketing claims without metrics leads to the wrong resize.",
      "VPS, dedicated, backups, support",
      "VPS, dedicated, backups, support",
    );
  }

  // --- Webdesign / maatwerk ---
  if (/webdesign|figma|landingspagina|animatie|hero|css|ux|ui|maatwerk.?site|page.?builder/.test(hay) || /webdesign-en-maatwerk/.test(hay)) {
    return P(
      "Design/maatwerk op de site: ontwerp vastleggen, in CMS/theme bouwen, performance en mobiel testen.",
      "Design/custom work on the site: lock the design, build in CMS/theme, test performance and mobile.",
      `“${titleNl}”: werk in het CMS/theme of frontend-repo — niet in DNS. Ship met backup en visuele QA.`,
      `“${titleEn}”: work in the CMS/theme or frontend repo — not in DNS. Ship with backup and visual QA.`,
      ["Designbron (Figma/specs)", "Staging of lokale omgeving", "Backup van productie"],
      ["Design source (Figma/specs)", "Staging or local environment", "Production backup"],
      [
        "Bevestig scope: welke pagina/component en wanneer het live mag.",
        "Bouw op staging (theme/child theme, page builder of frontend-code) volgens het ontwerp.",
        "Check responsive breakpoints, contrast en laadtijd (zware images comprimeren).",
        "Review met stakeholder; verwerk feedback op staging.",
        "Deploy naar productie; purge cache; spot-check desktop + mobiel.",
      ],
      [
        "Confirm scope: which page/component and when it may go live.",
        "Build on staging (theme/child theme, page builder or frontend code) per the design.",
        "Check responsive breakpoints, contrast and load time (compress heavy images).",
        "Review with stakeholder; apply feedback on staging.",
        "Deploy to production; purge cache; spot-check desktop + mobile.",
      ],
      ["Visueel gelijk aan afgesproken ontwerp", "Geen layoutbreuk op mobiel", "Kernflows klikbaar"],
      ["Visually matches agreed design", "No mobile layout break", "Core flows clickable"],
      "Eén component per deploy verkleint rollback.",
      "One component per deploy reduces rollback scope.",
      "Direct op productie ‘even snel’ bouwen zonder staging = hoog risico.",
      "Building ‘quickly’ on production without staging = high risk.",
      "Staging, cache, toegankelijkheid",
      "Staging, cache, accessibility",
    );
  }

  // --- Ecommerce (non-Woo specific leftovers) ---
  if (/webshop|e-commerce|productfeed|landingspagina|checkout|winkelwagen|catalogus/.test(hay) || /e-commerce-webshops/.test(hay)) {
    return P(
      "Webshop-aanpassing: staging/backup, wijziging in shop-admin, checkout testen, cache uitzonderen.",
      "Store change: staging/backup, change in shop admin, test checkout, exclude from cache.",
      `“${titleNl}”: wijzig catalogus/checkout op staging of met backup; test altijd een bestelronde.`,
      `“${titleEn}”: change catalog/checkout on staging or with a backup; always test an order path.`,
      ["Shop-admin toegang", "Backup", "Testbetaalmethode of sandbox"],
      ["Shop admin access", "Backup", "Test payment method or sandbox"],
      [
        "Maak een backup of werk op staging.",
        "Voer de wijziging door in het shop-admin (producten, feed, checkout-velden, landingspagina).",
        "Sluit cart/checkout uit van full-page cache/CDN.",
        "Doorloop een testorder tot betaalredirect of bevestiging.",
        "Controleer bevestigingsmail en voorraad/status.",
      ],
      [
        "Create a backup or work on staging.",
        "Apply the change in shop admin (products, feed, checkout fields, landing page).",
        "Exclude cart/checkout from full-page cache/CDN.",
        "Walk through a test order to payment redirect or confirmation.",
        "Check confirmation email and stock/status.",
      ],
      ["Testorder slaagt", "Feed of pagina toont juiste data"],
      ["Test order succeeds", "Feed or page shows correct data"],
      "Documenteer plugin-/feedversies bij elke wijziging.",
      "Document plugin/feed versions with every change.",
      "Live experimenteren met checkout zonder backup kost omzet.",
      "Experimenting on live checkout without a backup costs revenue.",
      "Mollie/Stripe, cache, WooCommerce Status",
      "Mollie/Stripe, cache, WooCommerce Status",
    );
  }

  // --- Security alerts / CVE / hardening ---
  if (/cve|security.?alert|kwetsbaarheid|malware|gehackt|bruteforce|firewall.?waf|hardening|security.?alert.?op.?windows/.test(hay)) {
    return P(
      "Beveiligingsmelding: scope bepalen, patchen/updaten, credentials draaien, monitoring controleren.",
      "Security alert: determine scope, patch/update, rotate credentials, check monitoring.",
      `“${titleNl}”: behandel de melding gericht — update/patch, isoleer gecompromitteerde accounts, verifieer daarna.`,
      `“${titleEn}”: handle the alert specifically — update/patch, isolate compromised accounts, then verify.`,
      ["Welke systemen geraakt zijn", "Backup/snapshot", "Admin-toegang tot panel/VPS"],
      ["Which systems are affected", "Backup/snapshot", "Admin access to panel/VPS"],
      [
        "Lees de melding: product, CVE/versie, of het jouw stack raakt.",
        "Maak snapshot/backup vóór wijzigingen.",
        "Pas beschikbare updates toe (panel, OS, CMS, plugins) of mitigeer volgens advisory.",
        "Roteer wachtwoorden/keys van geraakte accounts; forceer logout waar mogelijk.",
        "Controleer logs op misbruik; scan op malware bij websites.",
        "Herhaal monitoring/uptime tot stabiel.",
      ],
      [
        "Read the alert: product, CVE/version, whether it hits your stack.",
        "Take snapshot/backup before changes.",
        "Apply available updates (panel, OS, CMS, plugins) or mitigate per advisory.",
        "Rotate passwords/keys for affected accounts; force logout where possible.",
        "Check logs for abuse; malware-scan websites.",
        "Watch monitoring/uptime until stable.",
      ],
      ["Patch/mitigatie toegepast", "Geen open misbruikindicatoren"],
      ["Patch/mitigation applied", "No open abuse indicators"],
      "Noteer tijdstippen voor later forensisch werk.",
      "Note timestamps for later forensics.",
      "Negeer alerts niet ‘omdat de site nog online is’.",
      "Do not ignore alerts ‘because the site is still online’.",
      "Backups, 2FA, WAF/firewall",
      "Backups, 2FA, WAF/firewall",
    );
  }

  // --- Support / communicatie bij outage ---
  if (/support|ticket|post.?mortem|outage|belafspraak|communiceren.?met.?support/.test(hay) && /support|outage|ticket|post.?mortem|nazorg/.test(hay)) {
    return P(
      "Support/outage: feiten bundelen, ticket met impact/tijdlijn, daarna nazorg vastleggen.",
      "Support/outage: gather facts, ticket with impact/timeline, then record follow-up.",
      `“${titleNl}”: goede tickets versnellen herstel — domein, tijdstip, impact en wat je al deed.`,
      `“${titleEn}”: good tickets speed recovery — domain, time, impact and what you already tried.`,
      ["Domein/server-ID", "Tijdlijn (UTC of lokale tijd)", "Fouttekst/screenshots"],
      ["Domain/server ID", "Timeline (UTC or local time)", "Error text/screenshots"],
      [
        "Schrijf impact: wie raakt het (site/mail/API) en sinds wanneer.",
        "Open een ticket in het TripleZero iT klantenpanel met feiten, geen aannames.",
        "Voeg toe: recente wijzigingen, logs, monitoringalerts.",
        "Blijf bereikbaar op het opgegeven kanaal tijdens actieve outage.",
        "Na herstel: korte post-mortem (oorzaak, fix, preventie) voor intern behoud.",
      ],
      [
        "Write impact: who is affected (site/mail/API) and since when.",
        "Open a ticket in the TripleZero iT client panel with facts, not assumptions.",
        "Include: recent changes, logs, monitoring alerts.",
        "Stay reachable on the listed channel during an active outage.",
        "After recovery: short post-mortem (cause, fix, prevention) for internal retention.",
      ],
      ["Ticket bevat reproduceerbare feiten", "Herstel of next step bevestigd"],
      ["Ticket contains reproducible facts", "Recovery or next step confirmed"],
      "Eén ticket per incident houdt de tijdlijn schoon.",
      "One ticket per incident keeps the timeline clean.",
      "Wachtwoorden niet in tickets plakken.",
      "Do not paste passwords into tickets.",
      "Monitoring, backups, statusupdates",
      "Monitoring, backups, status updates",
    );
  }

  // --- Next.js / PHP maatwerk (dev) ---
  if (/next\.?js|react|php.?maatwerk|api.?route|prisma|deployment.?next/.test(hay) || /nextjs-en-react|php-maatwerk/.test(hay)) {
    return P(
      "App-wijziging: lokaal/staging bouwen, env checken, deploy, healthcheck op productie.",
      "App change: build locally/staging, check env, deploy, production healthcheck.",
      `“${titleNl}”: wijzig code via git/staging; secrets in env; verifieer met een health-URL na deploy.`,
      `“${titleEn}”: change code via git/staging; secrets in env; verify with a health URL after deploy.`,
      ["Repo-toegang", "Staging of preview", "Productie-env gescheiden"],
      ["Repo access", "Staging or preview", "Production env separated"],
      [
        "Branch vanaf main; implementeer de wijziging met tests waar aanwezig.",
        "Controleer env-vars (DB-URL, API-keys) — geen secrets in de client bundle.",
        "Deploy naar staging/preview; test de flow.",
        "Merge/deploy naar productie; herstart alleen de app-dienst.",
        "Hit homepage/health/API; bekijk logs op errors.",
      ],
      [
        "Branch from main; implement the change with tests where present.",
        "Check env vars (DB URL, API keys) — no secrets in the client bundle.",
        "Deploy to staging/preview; test the flow.",
        "Merge/deploy to production; restart only the app service.",
        "Hit homepage/health/API; review logs for errors.",
      ],
      ["Healthcheck groen", "Geen secret in git diff"],
      ["Healthcheck green", "No secret in git diff"],
      "Feature flags verkleinen risico bij grote releases.",
      "Feature flags reduce risk on large releases.",
      "Direct pushen naar productie zonder staging = moeilijke rollback.",
      "Pushing straight to production without staging = hard rollback.",
      "Omgevingsvariabelen, backups, monitoring",
      "Environment variables, backups, monitoring",
    );
  }

  // --- AI scan ---
  if (/ai-scan|eerste.?ai.?scan|technische.?score|content.?score|scan.?delen|van.?scan.?naar/.test(hay) || /ai-scan/.test(hay)) {
    return P(
      "AI-scan: scan starten of resultaten lezen, snelle fixes doorvoeren, opnieuw meten.",
      "AI scan: start a scan or read results, apply quick fixes, measure again.",
      `“${titleNl}” doe je in het TripleZero iT AI-scan dashboard: invullen → scannen → scores lezen → verbeteringen → hertest.`,
      `“${titleEn}” is done in the TripleZero iT AI-scan dashboard: fill in → scan → read scores → improve → retest.`,
      ["Klantenpanel- of AI-scan-login", "URL van de site", "Doel (techniek, content of AEO)"],
      ["Client panel or AI-scan login", "Site URL", "Goal (technical, content or AEO)"],
      [
        "Open de AI-scan in het TripleZero iT-portal en kies of start de juiste scan.",
        "Vul URL, markt/taal en eventuele concurrenten of focusgebieden correct in.",
        "Wacht tot de scan klaar is; open Technische score, Content-score en AEO/GEO-signalen.",
        "Pak eerst rode/of lage items met snelle fixes (meta, headings, snelheid, schema, interne links).",
        "Voer fixes door op staging/productie; purge cache.",
        "Start een hertest of vergelijk met de vorige run; deel het rapport met marketing indien nodig.",
      ],
      [
        "Open the AI scan in the TripleZero iT portal and choose or start the right scan.",
        "Enter URL, market/language and any competitors or focus areas correctly.",
        "Wait until the scan finishes; open Technical score, Content score and AEO/GEO signals.",
        "Tackle red/low items with quick fixes first (meta, headings, speed, schema, internal links).",
        "Apply fixes on staging/production; purge cache.",
        "Start a retest or compare with the previous run; share the report with marketing if needed.",
      ],
      ["Scores verbeterd of verklaard", "Rapport deelbaar/exporteerbaar"],
      ["Scores improved or explained", "Report shareable/exportable"],
      "Eén thema per sprint (bijv. alleen technical) voorkomt versnippering.",
      "One theme per sprint (e.g. technical only) avoids scatter.",
      "Scanresultaten negeren zonder tickets/taken levert geen groei op.",
      "Ignoring scan results without tickets/tasks yields no growth.",
      "AEO/GEO-traject, Core Web Vitals, schema",
      "AEO/GEO program, Core Web Vitals, schema",
    );
  }

  // --- AI agents / workflows ---
  if (/ai-agent|agenttypen|agent.?levert|n8n|zapier|workflow.?agent|meerdere.?agent/.test(hay) || /ai-agents/.test(hay)) {
    return P(
      "AI-agent/workflow: trigger en tools checken, dry-run, logs, daarna productie aanzetten.",
      "AI agent/workflow: check trigger and tools, dry-run, logs, then enable production.",
      `“${titleNl}”: debug agents via runs/logs — geen DNS. Beperk tools/scopes tot wat nodig is.`,
      `“${titleEn}”: debug agents via runs/logs — not DNS. Limit tools/scopes to what is needed.`,
      ["Agent-dashboard of n8n/Zapier-login", "Laatste run-ID/fout", "API-keys/env beschikbaar"],
      ["Agent dashboard or n8n/Zapier login", "Last run ID/error", "API keys/env available"],
      [
        "Open de agent/workflow en bekijk de laatste failed of lege run.",
        "Controleer trigger (schedule/webhook), inputpayload en of credentials geldig zijn.",
        "Draai een dry-run/test met bekende input; bekijk elke stap-output.",
        "Bij geen output: timeout, rate-limit, lege prompt-context of geblokkeerde tool — fix die stap.",
        "Voor meerdere agenttypen: scheid verantwoordelijkheden (research vs publish) en koppel via duidelijke handoffs.",
        "Zet alerts op failures; documenteer owner en rollback.",
      ],
      [
        "Open the agent/workflow and inspect the last failed or empty run.",
        "Check trigger (schedule/webhook), input payload and whether credentials are valid.",
        "Run a dry-run/test with known input; inspect each step output.",
        "If no output: timeout, rate limit, empty prompt context or blocked tool — fix that step.",
        "For multiple agent types: separate responsibilities (research vs publish) and link via clear handoffs.",
        "Enable failure alerts; document owner and rollback.",
      ],
      ["Test-run levert verwachte output", "Productie-run stabiel of gepauzeerd met reden"],
      ["Test run yields expected output", "Production run stable or paused with a reason"],
      "Log geen secrets of volledige klant-PII in agent-transcripts.",
      "Do not log secrets or full customer PII in agent transcripts.",
      "Onbeperkte autonomie zonder review op klantkanalen is riskant.",
      "Unlimited autonomy without review on customer channels is risky.",
      "Webhooks, omgevingsvariabelen, AI-beleid",
      "Webhooks, environment variables, AI policy",
    );
  }

  // --- AEO / answer engines ---
  if (/aeo|answer.?engine|geo.?seo|antwoordengine/.test(hay) || /aeo-geo-seo/.test(hay)) {
    return P(
      "AEO/GEO: meetbaar maken in answer engines, content/structuur verbeteren, opnieuw meten.",
      "AEO/GEO: make measurable in answer engines, improve content/structure, measure again.",
      `“${titleNl}”: kies queries, noteer of je merk genoemd wordt, verbeter bronpagina’s (duidelijke antwoorden + schema), hertest.`,
      `“${titleEn}”: pick queries, note whether your brand is cited, improve source pages (clear answers + schema), retest.`,
      ["Lijst van prioritaire queries", "CMS-toegang", "Baseline-screenshot of AI-scan"],
      ["List of priority queries", "CMS access", "Baseline screenshot or AI scan"],
      [
        "Stel 10–20 queries vast waarop je gevonden wilt worden (merk + categorie).",
        "Meet baseline in relevante answer engines / AI-overviews en in je AI-scan AEO-signalen.",
        "Verbeter landings-/blogpagina’s: directe antwoordalinea, H2-vragen, FAQ-schema, interne links, verse feiten.",
        "Publiceer; zorg dat pagina’s indexeerbaar en snel zijn.",
        "Herhaal de meting na 2–4 weken; leg wins en gaps vast voor het traject.",
      ],
      [
        "Define 10–20 queries where you want to be found (brand + category).",
        "Measure baseline in relevant answer engines / AI overviews and in your AI-scan AEO signals.",
        "Improve landing/blog pages: direct answer paragraph, H2 questions, FAQ schema, internal links, fresh facts.",
        "Publish; ensure pages are indexable and fast.",
        "Repeat measurement after 2–4 weeks; record wins and gaps for the program.",
      ],
      ["Baseline en hertest gedocumenteerd", "Minstens één pagina structureel verbeterd"],
      ["Baseline and retest documented", "At least one page structurally improved"],
      "Meet op vaste queries — niet elke week een nieuwe set.",
      "Measure on fixed queries — not a new set every week.",
      "Alleen ‘meer content’ zonder antwoordstructuur helpt AEO zelden.",
      "Only ‘more content’ without answer structure rarely helps AEO.",
      "AI-scan, schema, Core Web Vitals",
      "AI scan, schema, Core Web Vitals",
    );
  }

  // --- Microsoft (broader than M365-only keywords) ---
  if (/\bmicrosoft\b|m365|office.?365|entra|exchange.?online/.test(hay) || /microsoft/.test(hay)) {
    return P(
      "Microsoft 365 / Microsoft-diensten: admin center, licentie of storing isoleren, daarna client testen.",
      "Microsoft 365 / Microsoft services: admin center, isolate license or outage, then test the client.",
      `“${titleNl}” hoort in Microsoft admin/portal of het TripleZero iT-bestelproces — niet in DirectAdmin webmail (tenzij hybride mail).`,
      `“${titleEn}” belongs in the Microsoft admin/portal or TripleZero iT order flow — not DirectAdmin webmail (unless hybrid mail).`,
      ["Admin- of gebruikerstoegang", "Tenant/domein", "Licentie- of foutmelding"],
      ["Admin or user access", "Tenant/domain", "License or error message"],
      [
        "Bepaal of het om bestellen/licenties, inloggen, mail, Teams/OneDrive of een storing gaat.",
        "Bestellen/beheren: TripleZero iT klantenpanel of Microsoft 365-admin → facturering/licenties.",
        "Storing: check service health in admin.microsoft.com; isoleer user vs tenant-breed.",
        "Login/wachtwoord: self-service reset of admin reset; controleer Conditional Access/MFA.",
        "Test de geraakte app (Outlook, Teams, OneDrive) met één account; documenteer resultaat.",
      ],
      [
        "Decide whether it is ordering/licenses, sign-in, mail, Teams/OneDrive or an outage.",
        "Ordering/managing: TripleZero iT client panel or Microsoft 365 admin → billing/licenses.",
        "Outage: check service health in admin.microsoft.com; isolate user vs tenant-wide.",
        "Login/password: self-service reset or admin reset; check Conditional Access/MFA.",
        "Test the affected app (Outlook, Teams, OneDrive) with one account; document the result.",
      ],
      ["Issue opgelost of bevestigd als Microsoft-side", "Testaccount werkt"],
      ["Issue resolved or confirmed Microsoft-side", "Test account works"],
      "Noteer incident-ID uit Service Health in tickets.",
      "Note the Service Health incident ID in tickets.",
      "Tenant-brede wijzigingen zonder change-window raken iedereen.",
      "Tenant-wide changes without a change window affect everyone.",
      "DNS/MX bij mailmigratie, 2FA, licenties",
      "DNS/MX for mail migration, 2FA, licenses",
    );
  }

  // --- Category-aware fallbacks (real steps, not meta “pick a system”) ---
  if (/infrastructuur-servers|dedicated-en-remote-mgmt|rescue-recovery|vpn-netwerk|vps/.test(hay)) {
    return P(
      `${titleNl}: op de server via SSH/console — inventariseren, wijzigen, bereikbaarheid testen.`,
      `${titleEn}: on the server via SSH/console — inventory, change, test reachability.`,
      `“${titleNl}” hoort op VPS/dedicated via SSH of provider-console. Snapshot bij riskante netwerk-/schijfwijzigingen.`,
      `“${titleEn}” belongs on VPS/dedicated via SSH or provider console. Snapshot for risky network/disk changes.`,
      ["SSH of provider-console", "Snapshot bij riskante stappen", "Monitoring of externe test-URL"],
      ["SSH or provider console", "Snapshot for risky steps", "Monitoring or external test URL"],
      [
        "Maak of bevestig een recente snapshot/backup.",
        "Verbind via SSH of open de console/IPMI.",
        "Inventariseer huidige staat (services, poorten, schijf, routes) vóór je wijzigt.",
        "Voer de gerichte serverwijziging door die bij dit onderwerp hoort.",
        "Herstart alleen de betrokken dienst; test SSH/HTTP/monitoring van buiten.",
      ],
      [
        "Create or confirm a recent snapshot/backup.",
        "Connect via SSH or open the console/IPMI.",
        "Inventory current state (services, ports, disk, routes) before changing.",
        "Apply the targeted server change that belongs to this topic.",
        "Restart only the affected service; test SSH/HTTP/monitoring from outside.",
      ],
      ["Dienst bereikbaar zoals bedoeld", "Geen lock-out op beheerpad"],
      ["Service reachable as intended", "No lock-out on the admin path"],
      "Houd console-URL open in een tweede tab tijdens firewall-edits.",
      "Keep the console URL open in a second tab during firewall edits.",
      "Productiewijzigingen zonder snapshot op unieke servers is riskant.",
      "Production changes without a snapshot on unique servers are risky.",
      "Firewall, backups, monitoring",
      "Firewall, backups, monitoring",
    );
  }

  if (/beveiliging|veilig-online|beveiliging-overige/.test(hay)) {
    return P(
      `${titleNl}: risico beperken — inventaris, maatregel, controle met scan of login-test.`,
      `${titleEn}: reduce risk — inventory, control, verify with scan or login test.`,
      `“${titleNl}”: kies één beveiligingsmaatregel (2FA, firewall, patch, WAF, secrets) en verifieer het effect.`,
      `“${titleEn}”: pick one security control (2FA, firewall, patch, WAF, secrets) and verify the effect.`,
      ["Admin-toegang tot het geraakte systeem", "Backup/snapshot", "Lijst van accounts/poorten"],
      ["Admin access to the affected system", "Backup/snapshot", "List of accounts/ports"],
      [
        "Bepaal het aanvalsoppervlak: open poorten, admin-URL’s, verouderde software, zwakke accounts.",
        "Pas de maatregel toe (patch, 2FA, firewallregel, WAF, secret rotatie).",
        "Verwijder of disable wat niet nodig is (default users, ongebruikte plugins, open shares).",
        "Test legitieme toegang nog steeds werkt; test dat misbruikpad geblokkeerd is.",
        "Log het resultaat en plan een herhaalcheck.",
      ],
      [
        "Map the attack surface: open ports, admin URLs, outdated software, weak accounts.",
        "Apply the control (patch, 2FA, firewall rule, WAF, secret rotation).",
        "Remove or disable what is not needed (default users, unused plugins, open shares).",
        "Test legitimate access still works; test the abuse path is blocked.",
        "Log the result and schedule a recheck.",
      ],
      ["Maatregel actief", "Legitieme flow OK"],
      ["Control active", "Legitimate flow OK"],
      "Minimale privileges per account voorkomt schade bij lekken.",
      "Least privilege per account limits damage on leaks.",
      "Security-by-obscurity zonder patches is onvoldoende.",
      "Security by obscurity without patches is not enough.",
      "2FA, backups, monitoring",
      "2FA, backups, monitoring",
    );
  }

  if (/foutmeldingen-troubleshooting|http-foutcodes/.test(hay)) {
    return P(
      `${titleNl}: reproduceer de fout, lees status/log, fix één oorzaak, hertest.`,
      `${titleEn}: reproduce the error, read status/log, fix one cause, retest.`,
      `“${titleNl}”: zonder exacte fouttekst/status werk je blind. Isoleer eerst, wijzig daarna één ding.`,
      `“${titleEn}”: without exact error text/status you work blind. Isolate first, then change one thing.`,
      ["URL of stap die faalt", "Statuscode/fouttekst", "Panel- of logtoegang"],
      ["URL or failing step", "Status code/error text", "Panel or log access"],
      [
        "Reproduceer en bewaar statuscode, response en tijdstip.",
        "Check DNS/SSL als de hele site down lijkt; anders error_log/app-log.",
        "Koppel aan de laatste wijziging (deploy, plugin, DNS, firewall).",
        "Rol terug of pas de gerichte fix toe.",
        "Hertest vanaf schoon netwerk; bevestig monitoring groen.",
      ],
      [
        "Reproduce and save status code, response and timestamp.",
        "Check DNS/SSL if the whole site seems down; otherwise error_log/app log.",
        "Correlate with the last change (deploy, plugin, DNS, firewall).",
        "Roll back or apply the targeted fix.",
        "Retest from a clean network; confirm monitoring is green.",
      ],
      ["Fout weg of verklaard", "Geen nieuwe regressie"],
      ["Error gone or explained", "No new regression"],
      "Eén wijziging per keer maakt de oorzaak aantoonbaar.",
      "One change at a time makes the cause demonstrable.",
      "Alles tegelijk ‘fixen’ verlengt downtime.",
      "Changing everything at once extends downtime.",
      "Logs, DNS, SSL, cache",
      "Logs, DNS, SSL, cache",
    );
  }

  if (/domeinnamen|domein-registratie|domeinnamen-overige/.test(hay)) {
    return P(
      `${titleNl}: in het klantenpanel onder Domeinen — wijzigen, DNS/propagatie checken.`,
      `${titleEn}: in the client panel under Domains — change, verify DNS/propagation.`,
      `“${titleNl}” regel je in het TripleZero iT klantenpanel → Domeinen (WHOIS, NS, lock, auth-code).`,
      `“${titleEn}” is handled in the TripleZero iT client panel → Domains (WHOIS, NS, lock, auth code).`,
      ["Klantenpanel-login", "Domeinnaam", "Eventuele auth-code/ID-check"],
      ["Client panel login", "Domain name", "Auth code/ID check if needed"],
      [
        "Log in → Domeinen → open het juiste domein.",
        "Voer de domeinactie uit (WHOIS, nameservers, lock, transfercode, contact).",
        "Bevestig en bewaar eventuele codes veilig.",
        "Controleer WHOIS/NS-lookup tot de wijziging zichtbaar is.",
        "Test website/mail pas na verwachte propagatie.",
      ],
      [
        "Sign in → Domains → open the correct domain.",
        "Perform the domain action (WHOIS, nameservers, lock, transfer code, contact).",
        "Confirm and store any codes safely.",
        "Check WHOIS/NS lookup until the change is visible.",
        "Test website/mail only after expected propagation.",
      ],
      ["Panelstatus klopt", "Externe lookup toont nieuwe waarde"],
      ["Panel status correct", "External lookup shows new value"],
      "Screenshot oude nameservers vóór een NS-wissel.",
      "Screenshot old nameservers before an NS change.",
      "Auth-codes niet in publieke kanalen delen.",
      "Do not share auth codes on public channels.",
      "DNS, SSL, transfers",
      "DNS, SSL, transfers",
    );
  }

  if (/e-mail|e-mail-overige/.test(hay)) {
    return P(
      `${titleNl}: mailbox of DNS-mail — webmail testen, daarna client of SPF/MX fixen.`,
      `${titleEn}: mailbox or DNS mail — test webmail, then fix client or SPF/MX.`,
      `“${titleNl}”: isoleer met webmail. Werkt webmail, dan is het client/DNS; werkt webmail niet, dan mailbox/MX/quota.`,
      `“${titleEn}”: isolate with webmail. If webmail works, it is client/DNS; if not, mailbox/MX/quota.`,
      ["Webmail-login", "Welkomstmail IMAP/SMTP of DNS-toegang", "Exacte fout/bounce"],
      ["Webmail login", "Welcome email IMAP/SMTP or DNS access", "Exact error/bounce"],
      [
        "Test ontvangen en verzenden in webmail.",
        "Controleer mailboxquota en of het adres bestaat in DirectAdmin.",
        "Check MX en SPF (één SPF-record) als bezorging faalt.",
        "Herstel clientinstellingen (IMAP 993 / SMTP 465 of 587, volledig adres als user).",
        "Stuur een externe test en lees headers indien nodig.",
      ],
      [
        "Test receive and send in webmail.",
        "Check mailbox quota and whether the address exists in DirectAdmin.",
        "Check MX and SPF (one SPF record) if delivery fails.",
        "Fix client settings (IMAP 993 / SMTP 465 or 587, full address as user).",
        "Send an external test and read headers if needed.",
      ],
      ["Webmail of client send/receive OK"],
      ["Webmail or client send/receive OK"],
      "Bewaar de bounce — die noemt vaak de exacte blokkade.",
      "Keep the bounce — it often names the exact block.",
      "SPF wijzigen zonder inventaris van verzenders breekt andere mail.",
      "Changing SPF without listing senders breaks other mail.",
      "Spamfilter, DKIM, webmail",
      "Spam filter, DKIM, webmail",
    );
  }

  if (/hosting|hosting-overige|hosting-keuze|shop-en-pakketten/.test(hay)) {
    return P(
      `${titleNl}: hosting via klantenpanel of DirectAdmin — status checken, wijziging, live testen.`,
      `${titleEn}: hosting via client panel or DirectAdmin — check status, change, live test.`,
      `“${titleNl}”: gebruik het klantenpanel voor pakket/factuur en DirectAdmin voor techniek (PHP, DNS, files).`,
      `“${titleEn}”: use the client panel for plan/invoice and DirectAdmin for tech (PHP, DNS, files).`,
      ["Klantenpanel- en/of DirectAdmin-login", "Domein", "Backup bij structurele wijzigingen"],
      ["Client panel and/or DirectAdmin login", "Domain", "Backup for structural changes"],
      [
        "Bepaal of de taak commercieel (pakket/factuur) of technisch (PHP/DNS/files) is.",
        "Voer de wijziging door in klantenpanel of DirectAdmin.",
        "Wacht op provisionering indien van toepassing.",
        "Test de website of mail vanaf een extern netwerk.",
        "Controleer bevestigingsmail of panelstatus.",
      ],
      [
        "Decide whether the task is commercial (plan/invoice) or technical (PHP/DNS/files).",
        "Apply the change in the client panel or DirectAdmin.",
        "Wait for provisioning if applicable.",
        "Test the website or mail from an external network.",
        "Check confirmation email or panel status.",
      ],
      ["Status klopt in panel", "Live test OK"],
      ["Status correct in panel", "Live test OK"],
      "Technische én DNS-wijzigingen niet tegelijk zonder plan.",
      "Do not combine tech and DNS changes without a plan.",
      "Opzeggen zonder export vernietigt data.",
      "Cancelling without an export destroys data.",
      "DNS, SSL, backups",
      "DNS, SSL, backups",
    );
  }

  // --- Final fallback: title-driven checklist (still concrete, not panel roulette) ---
  return P(
    `${titleNl}: voorbereiden, uitvoeren, controleren — met feiten en één wijziging tegelijk.`,
    `${titleEn}: prepare, execute, verify — with facts and one change at a time.`,
    `Voor “${titleNl}” verzamel je eerst feiten (waar het speelt, fouttekst, laatste wijziging). Voer daarna één gerichte actie uit en verifieer het resultaat.`,
    `For “${titleEn}” first gather facts (where it happens, error text, last change). Then take one targeted action and verify the result.`,
    [
      "Waar speelt het? (VPS, hostingpanel, DNS, CMS, mail, klantenpanel)",
      "Exacte fouttekst, status of symptoom",
      "Backup/snapshot als je iets structureels wijzigt",
    ],
    [
      "Where does it happen? (VPS, hosting panel, DNS, CMS, mail, client panel)",
      "Exact error text, status or symptom",
      "Backup/snapshot if you change something structural",
    ],
    [
      "Schrijf in één zin het gewenste eindresultaat van “" + titleNl + "”.",
      "Noteer huidige staat (screenshot, versie, record, logregel).",
      "Voer één gerichte wijziging door in het systeem dat bij die staat hoort.",
      "Sla op / herstart alleen wat nodig is.",
      "Verifieer met een externe test of tweede browser/netwerk; leg vast wat er veranderde.",
    ],
    [
      "Write in one sentence the desired end state of “" + titleEn + "”.",
      "Note current state (screenshot, version, record, log line).",
      "Apply one targeted change in the system that owns that state.",
      "Save / restart only what is needed.",
      "Verify with an external test or second browser/network; record what changed.",
    ],
    ["Eindresultaat bereikt of verklaard waarom niet", "Geen onbedoelde regressie op een kritieke flow"],
    ["End state reached or explained why not", "No unintended regression on a critical flow"],
    "Tickets: domein, tijdstip, fouttekst, wat je al probeerde.",
    "Tickets: domain, timestamp, error text, what you already tried.",
    "Geen destructieve deletes zonder restorepunt.",
    "No destructive deletes without a restore point.",
    "Backups, monitoring, support",
    "Backups, monitoring, support",
  );
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

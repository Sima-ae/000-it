/**
 * Professional topic playbooks: real panel steps keyed by topic/slug/title signals.
 * Original wording only — facts may match industry guides, sentences must not.
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

export type Playbook = {
  excerptNl: string;
  excerptEn: string;
  bodyNl: string;
  bodyEn: string;
};

function pack(
  excerptNl: string,
  excerptEn: string,
  nl: string[],
  en: string[],
): Playbook {
  return {
    excerptNl,
    excerptEn,
    bodyNl: joinBlocks(...nl),
    bodyEn: joinBlocks(...en),
  };
}

/** Match the strongest playbook for an article; null if none. */
export function matchPlaybook(input: {
  slug: string;
  title: string;
  topic: string;
  categories: string[];
}): Playbook | null {
  const hay = `${input.slug} ${input.title} ${input.topic} ${input.categories.join(" ")}`.toLowerCase();

  if (/installatron/.test(hay) && /wat-is|what-is|wat is/.test(hay)) {
    return null; // curated
  }

  if (/wp-install|wordpress-install|handleiding-wordpress-installeren|wordpress installeren/.test(hay)) {
    return pack(
      "Installeer WordPress via Installatron in DirectAdmin: domein kiezen, admin aanmaken en controleren.",
      "Install WordPress with Installatron in DirectAdmin: choose domain, create admin, then verify.",
      [
        p(
          `Met Installatron zet je een schone WordPress-installatie op je TripleZero iT hosting zonder handmatig databases of wp-config te maken.`,
          `Werk op het juiste domein en zorg dat de doelmap leeg is (of een bewuste submap), anders overschrijf je bestaande bestanden.`,
        ),
        h2("Voorbereiding"),
        ul([
          "DirectAdmin-login en toegang tot Installatron.",
          "Domeinnaam die al naar deze hosting wijst (A-record/nameservers).",
          "Sterke admin-gebruikersnaam (niet “admin”) en wachtwoord.",
        ]),
        h2("Stappen"),
        ol([
          "Log in op DirectAdmin en open <strong>Installatron Applications Installer</strong> (Web Applications of Advanced Features).",
          "Kies <strong>WordPress</strong> → <strong>Install</strong>.",
          "Selecteer domein en pad: leeg voor de webroot, of bijvoorbeeld <code>/blog</code> voor een submap.",
          "Vul sitetitel, admin-gebruiker, wachtwoord en e-mailadres in.",
          "Schakel optionele “extra plugins” uit als je een minimale installatie wilt.",
          "Rond af en open daarna <code>/wp-admin</code> om in te loggen.",
        ]),
        h2("Controleren"),
        ul([
          "De homepage laadt op het gekozen adres.",
          "wp-admin is bereikbaar met je nieuwe account.",
          "De site staat onder Installatron → My Applications.",
        ]),
        tip("Activeer daarna SSL (Let’s Encrypt) en zet de WordPress-URL’s op https.", "nl"),
        warn("Installeer niet over een bestaande site heen zonder backup en lege map.", "nl"),
        supportOutro("nl", "Wat is Installatron, Let’s Encrypt SSL, WordPress-URL naar HTTPS"),
      ],
      [
        p(
          `Installatron puts a clean WordPress install on your TripleZero iT hosting without creating databases or editing wp-config by hand.`,
          `Use the correct domain and an empty target folder (or an intentional subdirectory), or you may overwrite existing files.`,
        ),
        h2("Preparation"),
        ul([
          "DirectAdmin login and Installatron access.",
          "Domain already pointing at this hosting (A record/nameservers).",
          "Strong admin username (not “admin”) and password.",
        ]),
        h2("Steps"),
        ol([
          "Sign in to DirectAdmin and open <strong>Installatron Applications Installer</strong> (Web Applications or Advanced Features).",
          "Choose <strong>WordPress</strong> → <strong>Install</strong>.",
          "Select domain and path: leave empty for the web root, or e.g. <code>/blog</code> for a subdirectory.",
          "Enter site title, admin user, password and email address.",
          "Disable optional “extra plugins” if you want a minimal install.",
          "Finish, then open <code>/wp-admin</code> and sign in.",
        ]),
        h2("Verify"),
        ul([
          "The homepage loads on the chosen URL.",
          "wp-admin works with your new account.",
          "The site appears under Installatron → My Applications.",
        ]),
        tip("Next, enable SSL (Let’s Encrypt) and set WordPress URLs to https.", "en"),
        warn("Do not install over an existing site without a backup and an empty folder.", "en"),
        supportOutro("en", "What is Installatron, Let’s Encrypt SSL, WordPress URL to HTTPS"),
      ],
    );
  }

  if (/\bspf\b/.test(hay)) {
    return pack(
      "Voeg één SPF TXT-record toe in DNS zodat ontvangende servers weten wie namens jouw domein mag mailen.",
      "Add a single SPF TXT record in DNS so receivers know who may send mail for your domain.",
      [
        p(
          `SPF (Sender Policy Framework) is een DNS TXT-record dat opsomt welke servers e-mail mogen versturen voor jouw domein. Zonder geldig SPF belandt uitgaande mail vaker in spam.`,
          `Bij TripleZero iT beheer je dit in DNS via het klantenpanel of DirectAdmin. Houd het bij <strong>één</strong> SPF-record per domein.`,
        ),
        h2("Stappen"),
        ol([
          "Open DNS-beheer voor het juiste domein.",
          "Zoek bestaande TXT-records die met <code>v=spf1</code> beginnen. Meerdere SPF-records samenvoegen of opschonen.",
          "Voeg op de root (@) één TXT toe met het beleid dat bij jouw mailplatform hoort (include van TripleZero iT / externe SMTP).",
          "Sla op en wacht op propagatie.",
          "Stuur een testmail en controleer in de headers op <code>spf=pass</code>.",
        ]),
        h2("Valkuilen"),
        ul([
          "Meer dan één SPF-record op hetzelfde domein.",
          "Meer dan 10 DNS-lookups in het beleid.",
          "Direct <code>-all</code> terwijl nieuwsbrief- of CRM-SMTP nog ontbreekt.",
        ]),
        tip("Begin met <code>~all</code> tot alle verzendsystemen zijn opgenomen; koppel daarna DKIM en DMARC.", "nl"),
        supportOutro("nl", "DKIM, DMARC"),
      ],
      [
        p(
          `SPF (Sender Policy Framework) is a DNS TXT record that lists which servers may send email for your domain. Without valid SPF, outbound mail lands in spam more often.`,
          `At TripleZero iT you edit this in DNS via the client panel or DirectAdmin. Keep <strong>one</strong> SPF record per domain.`,
        ),
        h2("Steps"),
        ol([
          "Open DNS management for the correct domain.",
          "Find existing TXT records starting with <code>v=spf1</code>. Merge or clean up duplicates.",
          "On the root (@), add one TXT with the policy for your mail platform (TripleZero iT include / external SMTP).",
          "Save and wait for propagation.",
          "Send a test message and check headers for <code>spf=pass</code>.",
        ]),
        h2("Pitfalls"),
        ul([
          "More than one SPF record on the same domain.",
          "More than 10 DNS lookups in the policy.",
          "Jumping to <code>-all</code> while newsletter or CRM SMTP is still missing.",
        ]),
        tip("Start with <code>~all</code> until every sender is included; then add DKIM and DMARC.", "en"),
        supportOutro("en", "DKIM, DMARC"),
      ],
    );
  }

  if (/\bdkim\b/.test(hay)) {
    return pack(
      "Schakel DKIM in DirectAdmin in en controleer het DNS TXT-record voor uitgaande mail.",
      "Enable DKIM in DirectAdmin and confirm the DNS TXT record for outbound mail.",
      [
        p(
          `DKIM zet een cryptografische handtekening op uitgaande berichten. Ontvangende servers zien zo of de mail onderweg is gewijzigd en of die bij jouw domein hoort.`,
        ),
        h2("Stappen"),
        ol([
          "Log in op DirectAdmin en selecteer het domein.",
          "Open E-mailauthenticatie / E-mailgegevens (of DNS Management).",
          "Schakel DKIM in; DirectAdmin publiceert meestal automatisch het TXT-record.",
          "Controleer in DNS of het DKIM-record zichtbaar is.",
          "Verstuur een testmail en zoek in de headers naar <code>dkim=pass</code>.",
        ]),
        tip("Combineer DKIM met SPF en rond daarna af met DMARC.", "nl"),
        supportOutro("nl", "SPF, DMARC"),
      ],
      [
        p(
          `DKIM adds a cryptographic signature to outbound messages. Receiving servers can tell whether the mail changed in transit and whether it belongs to your domain.`,
        ),
        h2("Steps"),
        ol([
          "Sign in to DirectAdmin and select the domain.",
          "Open Email authentication / Email accounts (or DNS Management).",
          "Enable DKIM; DirectAdmin usually publishes the TXT record automatically.",
          "Confirm the DKIM record is visible in DNS.",
          "Send a test message and look for <code>dkim=pass</code> in the headers.",
        ]),
        tip("Combine DKIM with SPF, then finish with DMARC.", "en"),
        supportOutro("en", "SPF, DMARC"),
      ],
    );
  }

  if (/\bdmarc\b/.test(hay)) {
    return pack(
      "Publiceer een DMARC-beleid op _dmarc en schaal op van monitoren naar quarantine/reject.",
      "Publish a DMARC policy on _dmarc and move from monitoring to quarantine/reject.",
      [
        p(
          `DMARC koppelt SPF en DKIM aan een beleid: wat moet een ontvanger doen bij mislukte authenticatie, en waar gaan rapporten naartoe?`,
        ),
        h2("Stappen"),
        ol([
          "Zorg dat SPF en DKIM eerst betrouwbaar slagen.",
          "Voeg een TXT-record toe op <code>_dmarc</code>, bijvoorbeeld <code>v=DMARC1; p=none; rua=mailto:dmarc@jouwdomein.nl</code>.",
          "Analyseer rapporten enkele weken.",
          "Verhoog daarna naar <code>p=quarantine</code> of <code>p=reject</code> als de data schoon is.",
        ]),
        warn(
          "Zet niet meteen op reject als nieuwsbrief, CRM of webshop-SMTP nog buiten SPF/DKIM valt.",
          "nl",
        ),
        supportOutro("nl", "SPF, DKIM"),
      ],
      [
        p(
          `DMARC ties SPF and DKIM to a policy: what receivers should do when authentication fails, and where reports should go.`,
        ),
        h2("Steps"),
        ol([
          "Make sure SPF and DKIM pass reliably first.",
          "Add a TXT record on <code>_dmarc</code>, for example <code>v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com</code>.",
          "Review reports for a few weeks.",
          "Then move to <code>p=quarantine</code> or <code>p=reject</code> once the data looks clean.",
        ]),
        warn(
          "Do not jump to reject while newsletter, CRM or shop SMTP is still outside SPF/DKIM.",
          "en",
        ),
        supportOutro("en", "SPF, DKIM"),
      ],
    );
  }

  if (/letsencrypt|let.?s encrypt|ssl-certificaat|gratis ssl/.test(hay) && /directadmin|da|plesk|cyberpanel|ssl/.test(hay)) {
    return pack(
      "Vraag een gratis Let’s Encrypt-certificaat aan in je control panel en forceer HTTPS pas daarna.",
      "Request a free Let’s Encrypt certificate in your control panel, then force HTTPS.",
      [
        p(
          `Let’s Encrypt levert gratis TLS-certificaten. De aanvraag slaagt alleen als DNS van het domein al naar deze server wijst.`,
        ),
        h2("Stappen in DirectAdmin"),
        ol([
          "Controleer het A/AAAA-record van apex en www.",
          "Open DirectAdmin → <strong>SSL Certificates</strong> / Let’s Encrypt.",
          "Selecteer het domein (en www indien nodig) en vraag het certificaat aan.",
          "Wacht tot de status geldig is.",
          "Forceer HTTPS via de paneloptie of .htaccess pas ná succesvolle uitgifte.",
          "Test de site in een privévenster op https://",
        ]),
        tip("Dek apex én www in één certificaat om redirect-loops te vermijden.", "nl"),
        warn("Forceer geen HTTPS terwijl het certificaat nog ontbreekt.", "nl"),
        supportOutro("nl", "WordPress-URL naar HTTPS, DNS A-record"),
      ],
      [
        p(
          `Let’s Encrypt issues free TLS certificates. Issuance only works when the domain DNS already points at this server.`,
        ),
        h2("Steps in DirectAdmin"),
        ol([
          "Confirm the A/AAAA record for apex and www.",
          "Open DirectAdmin → <strong>SSL Certificates</strong> / Let’s Encrypt.",
          "Select the domain (and www if needed) and request the certificate.",
          "Wait until the status is valid.",
          "Force HTTPS via the panel option or .htaccess only after successful issuance.",
          "Test the site in a private window on https://",
        ]),
        tip("Cover apex and www in one certificate to avoid redirect loops.", "en"),
        warn("Do not force HTTPS while the certificate is still missing.", "en"),
        supportOutro("en", "WordPress URL to HTTPS, DNS A record"),
      ],
    );
  }

  if (/mailbox|e-mailadres aanmaken|create-mailbox|nieuw e-mail/.test(hay)) {
    return pack(
      "Maak een mailbox in DirectAdmin E-mail Accounts met quota en een sterk wachtwoord.",
      "Create a mailbox in DirectAdmin Email Accounts with a quota and a strong password.",
      [
        p(
          `Nieuwe adressen maak je per domein in DirectAdmin. Het mailboxwachtwoord is niet hetzelfde als je panel- of FTP-wachtwoord.`,
        ),
        h2("Stappen"),
        ol([
          "Log in op DirectAdmin en selecteer het domein.",
          "Open <strong>E-mail Accounts</strong>.",
          "Klik op <strong>Create Account</strong> / account aanmaken.",
          "Kies het lokale deel (vóór @), een sterk wachtwoord en eventueel een quota.",
          "Sla op en test in webmail met het volledige adres + mailboxwachtwoord.",
        ]),
        tip("Noteer IMAP/SMTP-gegevens uit de welkomstmail voor Outlook of Apple Mail.", "nl"),
        warn("Deel mailboxwachtwoorden niet in tickets; reset liever en stuur een veilig kanaal.", "nl"),
        supportOutro("nl", "Webmail, e-mailwachtwoord wijzigen, SPF"),
      ],
      [
        p(
          `You create new addresses per domain in DirectAdmin. The mailbox password is not the same as your panel or FTP password.`,
        ),
        h2("Steps"),
        ol([
          "Sign in to DirectAdmin and select the domain.",
          "Open <strong>Email Accounts</strong>.",
          "Click <strong>Create Account</strong>.",
          "Choose the local part (before @), a strong password and an optional quota.",
          "Save and test in webmail with the full address + mailbox password.",
        ]),
        tip("Copy IMAP/SMTP details from the welcome email for Outlook or Apple Mail.", "en"),
        warn("Do not paste mailbox passwords into tickets; reset and use a safe channel instead.", "en"),
        supportOutro("en", "Webmail, change email password, SPF"),
      ],
    );
  }

  if (/webmail/.test(hay) && /directadmin|open|gebruik|hoe/.test(hay)) {
    return pack(
      "Open webmail vanuit DirectAdmin of via de webmail-URL en log in met mailboxadres + mailboxwachtwoord.",
      "Open webmail from DirectAdmin or the webmail URL and sign in with mailbox address + mailbox password.",
      [
        p(
          `Webmail is handig om te testen of een probleem in de mailserver of in je desktopclient zit. Lukt webmail wel en Outlook niet, dan ligt de oorzaak meestal in de clientinstellingen.`,
        ),
        h2("Stappen"),
        ol([
          "Open DirectAdmin → <strong>E-mail Accounts</strong> of de webmail-link uit je welkomstmail.",
          "Kies Roundcube / Webmail Pro indien gevraagd.",
          "Log in met het volledige e-mailadres en het <strong>mailbox</strong>wachtwoord (niet het DirectAdmin-wachtwoord).",
          "Controleer Postvak IN en verstuur een testbericht naar een extern adres.",
        ]),
        tip("Werkt webmail niet: reset het mailboxwachtwoord en controleer of het account niet over quota is.", "nl"),
        supportOutro("nl", "E-mailwachtwoord, quota, SPF"),
      ],
      [
        p(
          `Webmail is useful to see whether a problem sits on the mail server or in your desktop client. If webmail works and Outlook does not, the client settings are usually wrong.`,
        ),
        h2("Steps"),
        ol([
          "Open DirectAdmin → <strong>Email Accounts</strong> or the webmail link from your welcome email.",
          "Choose Roundcube / Webmail Pro if prompted.",
          "Sign in with the full email address and the <strong>mailbox</strong> password (not the DirectAdmin password).",
          "Check Inbox and send a test message to an external address.",
        ]),
        tip("If webmail fails: reset the mailbox password and check the account is not over quota.", "en"),
        supportOutro("en", "Email password, quota, SPF"),
      ],
    );
  }

  if (/ftp|filezilla|extra-ftp/.test(hay)) {
    return pack(
      "Maak of gebruik een FTP/SFTP-account in DirectAdmin en verbind veilig met de juiste home-map.",
      "Create or use an FTP/SFTP account in DirectAdmin and connect safely to the correct home directory.",
      [
        p(
          `FTP-accounts geef je bij voorkeur een beperkte home-map (alleen de site van die developer). Gebruik waar mogelijk FTPS of SFTP in plaats van plain FTP.`,
        ),
        h2("Stappen"),
        ol([
          "Log in op DirectAdmin → <strong>FTP Management</strong>.",
          "Maak een account aan of noteer de bestaande gebruiker.",
          "Beperk de directory tot de bedoelde webroot indien mogelijk.",
          "Verbind in FileZilla/Cyberduck met host, gebruikersnaam, wachtwoord en poort uit de welkomstmail.",
          "Land in de juiste map en upload of download ter controle een klein testbestand.",
        ]),
        warn("Gebruik geen 777-rechten “om het te laten werken”; fix ownership/pad in plaats daarvan.", "nl"),
        supportOutro("nl", "File Manager, CHMOD"),
      ],
      [
        p(
          `Prefer FTP accounts with a limited home directory (only that developer’s site). Use FTPS or SFTP instead of plain FTP when possible.`,
        ),
        h2("Steps"),
        ol([
          "Sign in to DirectAdmin → <strong>FTP Management</strong>.",
          "Create an account or note the existing user.",
          "Limit the directory to the intended web root when possible.",
          "Connect in FileZilla/Cyberduck with host, username, password and port from the welcome email.",
          "Land in the correct folder and upload or download a small test file.",
        ]),
        warn("Do not use 777 permissions “to make it work”; fix ownership/path instead.", "en"),
        supportOutro("en", "File Manager, CHMOD"),
      ],
    );
  }

  if (/php-versie|php version|php-instellingen|php-version/.test(hay)) {
    return pack(
      "Wijzig de PHP-versie per domein in DirectAdmin en test daarna de site en wp-admin.",
      "Change the PHP version per domain in DirectAdmin, then test the site and wp-admin.",
      [
        p(
          `PHP-versies stel je per domein in. Te oud geeft security-warnings in WordPress; te nieuw kan plugins breken. Wijzig één versie tegelijk en houd een backup achter de hand.`,
        ),
        h2("Stappen"),
        ol([
          "Maak een backup of Installatron-backup als de site kritiek is.",
          "DirectAdmin → Domain Setup / <strong>PHP Version Select</strong> (naam kan licht verschillen).",
          "Selecteer het domein en de gewenste PHP-versie.",
          "Sla op en purge eventuele LiteSpeed/WordPress-cache.",
          "Test homepage, wp-admin, formulieren en (indien webshop) checkout.",
        ]),
        tip("Check phpinfo of de panelindicator om te bevestigen dat de nieuwe versie actief is.", "nl"),
        warn("Combineer geen major PHP-upgrade met een grote WordPress/plugin-update in één keer.", "nl"),
        supportOutro("nl", "WordPress critical error, Installatron-backup"),
      ],
      [
        p(
          `PHP versions are set per domain. Too old triggers WordPress security warnings; too new can break plugins. Change one version at a time and keep a backup ready.`,
        ),
        h2("Steps"),
        ol([
          "Create a backup or Installatron backup if the site is critical.",
          "DirectAdmin → Domain Setup / <strong>PHP Version Select</strong> (label may vary slightly).",
          "Select the domain and the desired PHP version.",
          "Save and purge LiteSpeed/WordPress cache if needed.",
          "Test homepage, wp-admin, forms and checkout if you run a shop.",
        ]),
        tip("Check phpinfo or the panel indicator to confirm the new version is active.", "en"),
        warn("Do not combine a major PHP upgrade with a large WordPress/plugin update in one go.", "en"),
        supportOutro("en", "WordPress critical error, Installatron backup"),
      ],
    );
  }

  if (/backup|jetbackup|herstellen|restore/.test(hay) && /directadmin|jet|site/.test(hay)) {
    return pack(
      "Maak of herstel een backup via DirectAdmin of JetBackup: kies scope, test en bewaar retentie.",
      "Create or restore a backup via DirectAdmin or JetBackup: pick scope, test, and keep retention.",
      [
        p(
          `Backups zijn je terugvalpad vóór updates, migraties of grote edits. Installatron-backups dekken één app; DirectAdmin/JetBackup dekken bestanden, mail en databases breder.`,
        ),
        h2("Backup maken"),
        ol([
          "Open DirectAdmin → Create/Restore Backups of JetBackup (als aanwezig).",
          "Kies wat je meeneemt: home, e-mail, databases, cron, DNS.",
          "Start de backup en noteer tijdstip/label.",
          "Controleer of de set in de lijst staat en schijfquota nog ruimte heeft.",
        ]),
        h2("Terugzetten"),
        ol([
          "Selecteer de juiste backupset.",
          "Herstel selectief (alleen DB of alleen files) als de storing beperkt is.",
          "Test de site en mail na restore.",
        ]),
        warn("Overwrite-restores zonder recente export zijn riskant — dubbelcheck domein en datum.", "nl"),
        supportOutro("nl", "Installatron-backup, schijfgebruik"),
      ],
      [
        p(
          `Backups are your rollback path before updates, migrations or large edits. Installatron backups cover one app; DirectAdmin/JetBackup cover files, mail and databases more broadly.`,
        ),
        h2("Create a backup"),
        ol([
          "Open DirectAdmin → Create/Restore Backups or JetBackup (if available).",
          "Choose what to include: home, email, databases, cron, DNS.",
          "Start the backup and note the time/label.",
          "Confirm the set appears in the list and disk quota still has room.",
        ]),
        h2("Restore"),
        ol([
          "Select the correct backup set.",
          "Restore selectively (DB only or files only) when the issue is limited.",
          "Test the site and mail after restore.",
        ]),
        warn("Overwrite restores without a recent export are risky — double-check domain and date.", "en"),
        supportOutro("en", "Installatron backup, disk usage"),
      ],
    );
  }

  if (/2fa|two-step|two factor/.test(hay)) {
    return pack(
      "Schakel DirectAdmin Two-Step Authentication in, koppel een authenticator-app en bewaar backupcodes.",
      "Enable DirectAdmin Two-Step Authentication, link an authenticator app, and store backup codes.",
      [
        p(
          `2FA beschermt je control panel tegen gestolen wachtwoorden. Koppel een authenticator-app (niet sms als je het kunt vermijden) en bewaar herstelcodes offline.`,
        ),
        h2("Stappen"),
        ol([
          "Log in op DirectAdmin → Account Manager / Two-Step Authentication.",
          "Start de setup en scan de QR-code met je authenticator-app.",
          "Bevestig met een eenmalige code.",
          "Download of noteer de backupcodes op een veilige plek.",
          "Log uit en opnieuw in om 2FA te testen.",
        ]),
        warn("Verlies je app én backupcodes, dan is panelherstel via support nodig — bewaar codes dus écht.", "nl"),
        supportOutro("nl", "DirectAdmin-login, wachtwoord wijzigen"),
      ],
      [
        p(
          `2FA protects your control panel if a password is stolen. Link an authenticator app (prefer that over SMS) and store recovery codes offline.`,
        ),
        h2("Steps"),
        ol([
          "Sign in to DirectAdmin → Account Manager / Two-Step Authentication.",
          "Start setup and scan the QR code with your authenticator app.",
          "Confirm with a one-time code.",
          "Download or write down backup codes somewhere safe.",
          "Sign out and back in to test 2FA.",
        ]),
        warn("If you lose both the app and backup codes, panel recovery needs support — store codes for real.", "en"),
        supportOutro("en", "DirectAdmin login, change password"),
      ],
    );
  }

  if (/dns|a-record|cname|nameserver|zone/.test(hay) && !/spf|dkim|dmarc/.test(hay)) {
    return pack(
      "Beheer DNS-records in het klantenpanel of DirectAdmin: wijzig één record, wacht op propagatie, controleer extern.",
      "Manage DNS records in the client panel or DirectAdmin: change one record, wait for propagation, verify externally.",
      [
        p(
          `DNS bepaalt waar je domein naartoe wijst (web, mail, verificaties). Werk altijd in één zone als bron van waarheid en wijzig kritieke records niet allemaal tegelijk.`,
        ),
        h2("Stappen"),
        ol([
          "Open DNS-beheer voor het juiste domein (klantenpanel of DirectAdmin Zone Editor).",
          "Exporteer of screenshot de huidige zone.",
          "Pas alleen het benodigde type aan (A, AAAA, CNAME, MX, TXT, NS).",
          "Sla op; verlaag TTL tijdelijk alleen bij geplande cutovers.",
          "Controleer met een externe lookup en test daarna site of mail.",
        ]),
        tip("CNAME op de apex (@) kan alleen met ALIAS/ANAME — anders A/AAAA gebruiken.", "nl"),
        warn("Nameserver-wijzigingen propagëren langer dan één record — plan die apart.", "nl"),
        supportOutro("nl", "SPF, domein forward, SSL"),
      ],
      [
        p(
          `DNS decides where your domain points (web, mail, verifications). Keep one zone as the source of truth and avoid changing every critical record at once.`,
        ),
        h2("Steps"),
        ol([
          "Open DNS management for the correct domain (client panel or DirectAdmin Zone Editor).",
          "Export or screenshot the current zone.",
          "Change only the required type (A, AAAA, CNAME, MX, TXT, NS).",
          "Save; lower TTL temporarily only for planned cutovers.",
          "Verify with an external lookup, then test the site or mail.",
        ]),
        tip("CNAME on the apex (@) needs ALIAS/ANAME — otherwise use A/AAAA.", "en"),
        warn("Nameserver changes propagate longer than a single record — plan them separately.", "en"),
        supportOutro("en", "SPF, domain forward, SSL"),
      ],
    );
  }

  if (/wordpress|wp-admin|plugin|critical error|woocommerce/.test(hay)) {
    const subjectNl = input.title.replace(/\?+$/, "").trim();
    const subjectEn = subjectNl; // EN title applied by writeArticle wrapper
    return pack(
      `${subjectNl}: werkwijze via wp-admin en hostingpanel — backup, wijziging, cache, controle.`,
      `${subjectEn}: workflow via wp-admin and hosting panel — backup, change, cache, verify.`,
      [
        p(
          `Dit artikel gaat over <strong>${subjectNl}</strong> in een WordPress-omgeving op TripleZero iT hosting.`,
          `Werk in lagen: eerst een backup, daarna de wijziging in wp-admin of via bestanden, tot slot cache legen en controleren. Zo fix je de oorzaak in plaats van alleen het symptoom.`,
        ),
        h2("Voorbereiding"),
        ul([
          "Installatron- of panel-backup (files + database).",
          "Toegang tot /wp-admin en DirectAdmin.",
          "Korte notitie van actieve plugins/thema’s vóór je iets uitschakelt.",
        ]),
        h2("Stappen"),
        ol([
          "Maak een backup.",
          `Voer de handeling voor “${subjectNl}” door in wp-admin, of via File Manager/SFTP als wp-admin niet bereikbaar is.`,
          "Bij een critical error: hernoem tijdelijk de map <code>plugins</code> of schakel terug naar een default thema via bestanden.",
          "Leeg page-cache, object-cache en eventueel CDN.",
          "Test voorkant, login en kritieke flows (formulier/checkout).",
        ]),
        tip("Gebruik staging of een kopie als de shop live orders verwerkt.", "nl"),
        warn("Verwijder geen uploads-map of database-tabellen zonder restoreplan.", "nl"),
        supportOutro("nl", "Installatron-backup, PHP-versie, critical error"),
      ],
      [
        p(
          `This article covers <strong>${subjectEn}</strong> in a WordPress setup on TripleZero iT hosting.`,
          `Work in layers: backup first, then the change in wp-admin or via files, then clear caches and verify. That fixes causes instead of only symptoms.`,
        ),
        h2("Preparation"),
        ul([
          "Installatron or panel backup (files + database).",
          "Access to /wp-admin and DirectAdmin.",
          "A short note of active plugins/themes before you disable anything.",
        ]),
        h2("Steps"),
        ol([
          "Create a backup.",
          `Apply the change for “${subjectEn}” in wp-admin, or via File Manager/SFTP if wp-admin is unreachable.`,
          "On a critical error: temporarily rename the <code>plugins</code> folder or switch back to a default theme via files.",
          "Clear page cache, object cache and CDN if used.",
          "Test the front end, login and critical flows (form/checkout).",
        ]),
        tip("Use staging or a copy if the shop processes live orders.", "en"),
        warn("Do not delete the uploads folder or database tables without a restore plan.", "en"),
        supportOutro("en", "Installatron backup, PHP version, critical error"),
      ],
    );
  }

  if (/cyberpanel|openlitespeed/.test(hay)) {
    return pack(
      "Werk in CyberPanel: juiste website selecteren, wijziging doorvoeren, OLS-cache en logs controleren.",
      "Work in CyberPanel: select the correct website, apply the change, then check OLS cache and logs.",
      [
        p(
          `CyberPanel beheert sites op OpenLiteSpeed. Selecteer altijd de juiste website voordat je DNS, SSL, e-mail of bestanden wijzigt.`,
        ),
        h2("Stappen"),
        ol([
          "Log in op CyberPanel met de URL uit je welkomstmail.",
          "Open Websites en kies het juiste domein.",
          "Voer de taak uit in de bijbehorende module (SSL, Email, DNS, File Manager, Backup).",
          "Purge OpenLiteSpeed-cache als de wijziging niet zichtbaar is.",
          "Controleer error-logs bij 500-fouten of witte pagina’s.",
        ]),
        tip("Noteer oude waarden vóór je opslaat — vooral bij DNS en SSL.", "nl"),
        supportOutro("nl"),
      ],
      [
        p(
          `CyberPanel manages sites on OpenLiteSpeed. Always select the correct website before changing DNS, SSL, email or files.`,
        ),
        h2("Steps"),
        ol([
          "Sign in to CyberPanel with the URL from your welcome email.",
          "Open Websites and choose the correct domain.",
          "Complete the task in the matching module (SSL, Email, DNS, File Manager, Backup).",
          "Purge OpenLiteSpeed cache if the change is not visible.",
          "Check error logs for 500 errors or blank pages.",
        ]),
        tip("Note old values before you save — especially for DNS and SSL.", "en"),
        supportOutro("en"),
      ],
    );
  }

  if (/\bplesk\b/.test(hay)) {
    return pack(
      "Werk in Plesk op het juiste abonnement: mail, DNS, SSL, bestanden of WordPress Toolkit.",
      "Work in Plesk on the correct subscription: mail, DNS, SSL, files or WordPress Toolkit.",
      [
        p(
          `In Plesk horen wijzigingen bij een abonnement/domein. Als reseller: open eerst het juiste klantaccount, anders pas je per ongeluk een andere site aan.`,
        ),
        h2("Stappen"),
        ol([
          "Log in op Plesk (poort 8443 of de link uit je welkomstmail).",
          "Selecteer het juiste abonnement of domein.",
          "Open de tool die bij de taak hoort (Mail, DNS, SSL/TLS, Files, Databases, WordPress).",
          "Voer de wijziging door en bevestig.",
          "Test extern (browser, mailclient of DNS-lookup).",
        ]),
        warn("Werk nooit blind in het verkeerde subscription op een reseller-server.", "nl"),
        supportOutro("nl"),
      ],
      [
        p(
          `In Plesk, changes belong to a subscription/domain. As a reseller: open the correct customer account first, or you may edit the wrong site.`,
        ),
        h2("Steps"),
        ol([
          "Sign in to Plesk (port 8443 or the link from your welcome email).",
          "Select the correct subscription or domain.",
          "Open the tool for the task (Mail, DNS, SSL/TLS, Files, Databases, WordPress).",
          "Apply the change and confirm.",
          "Test externally (browser, mail client or DNS lookup).",
        ]),
        warn("Never work blindly in the wrong subscription on a reseller server.", "en"),
        supportOutro("en"),
      ],
    );
  }

  if (/vps|ssh|firewall|server/.test(hay) && /infrastructuur|vps|ssh|firewall/.test(hay)) {
    return pack(
      "VPS-wijzigingen: snapshot eerst, daarna gericht diensten of firewall aanpassen en monitoren.",
      "VPS changes: snapshot first, then adjust services or firewall carefully and monitor.",
      [
        p(
          `Op een VPS heb je meer vrijheid en meer risico. Maak eerst een snapshot/backup, wijzig één component, en herstart alleen de betrokken dienst.`,
        ),
        h2("Stappen"),
        ol([
          "Maak of bevestig een recente snapshot.",
          "Log in via SSH of het VPS-panel.",
          "Voer de geplande wijziging door (dienst, firewallregel, resource-limiet).",
          "Herstart alleen de betrokken service.",
          "Controleer poorten, processen en monitoring/uptime.",
        ]),
        warn("Vermijd <code>rm -rf</code> en blinde firewall-locks die je eigen SSH afsluiten.", "nl"),
        supportOutro("nl"),
      ],
      [
        p(
          `A VPS gives more freedom and more risk. Take a snapshot/backup first, change one component, and restart only the affected service.`,
        ),
        h2("Steps"),
        ol([
          "Create or confirm a recent snapshot.",
          "Sign in via SSH or the VPS panel.",
          "Apply the planned change (service, firewall rule, resource limit).",
          "Restart only the affected service.",
          "Check ports, processes and monitoring/uptime.",
        ]),
        warn("Avoid <code>rm -rf</code> and firewall locks that cut off your own SSH access.", "en"),
        supportOutro("en"),
      ],
    );
  }

  // Client panel / tickets / shop
  if (/ticket|klantenpanel|crm|factuur|pakket|support/.test(hay) && /tz-|crm|shop|support|ticket/.test(hay)) {
    return pack(
      "Regel de taak in het TripleZero iT klantenpanel: juiste menu, bevestiging en opvolging.",
      "Complete the task in the TripleZero iT client panel: right menu, confirmation and follow-up.",
      [
        p(
          `In het klantenpanel regel je accountzaken, facturen, tickets en producten. Vermeld altijd domeinnaam of klantnummer als je support nodig hebt.`,
        ),
        h2("Stappen"),
        ol([
          "Log in op het TripleZero iT klantenpanel.",
          "Open het onderdeel dat bij je vraag past (Tickets, Facturen, Domeinen, Producten of Projecten).",
          "Voer de actie uit en bevestig waar het systeem dat vraagt.",
          "Bewaar bevestigingsmail of ticketnummer.",
          "Controleer of de status in het panel is bijgewerkt.",
        ]),
        tip("Voor storingen: noteer tijdstip, URL en exacte fouttekst in het ticket.", "nl"),
        supportOutro("nl"),
      ],
      [
        p(
          `In the client panel you manage account tasks, invoices, tickets and products. Always include domain name or customer number when you need support.`,
        ),
        h2("Steps"),
        ol([
          "Sign in to the TripleZero iT client panel.",
          "Open the section that matches your request (Tickets, Invoices, Domains, Products or Projects).",
          "Complete the action and confirm when prompted.",
          "Keep the confirmation email or ticket number.",
          "Check that the status updated in the panel.",
        ]),
        tip("For outages: include time, URL and exact error text in the ticket.", "en"),
        supportOutro("en"),
      ],
    );
  }

  return null;
}

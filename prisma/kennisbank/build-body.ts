/**
 * Generates original Dutch HTML knowledge-base articles for TripleZero iT Hosting.
 * Content is topic-driven — not copied from third-party hosts.
 */

const BRAND = "TripleZero iT Hosting";

function p(...paras: string[]) {
  return paras.map((t) => `<p>${t}</p>`).join("\n");
}

function h2(t: string) {
  return `<h2>${t}</h2>`;
}

function h3(t: string) {
  return `<h3>${t}</h3>`;
}

function ol(items: string[]) {
  return `<ol>\n${items.map((i) => `  <li>${i}</li>`).join("\n")}\n</ol>`;
}

function ul(items: string[]) {
  return `<ul>\n${items.map((i) => `  <li>${i}</li>`).join("\n")}\n</ul>`;
}

function tip(t: string) {
  return `<p><strong>Tip:</strong> ${t}</p>`;
}

function warn(t: string) {
  return `<p><strong>Let op:</strong> ${t}</p>`;
}

function outro(related?: string) {
  return p(
    `Heb je na het volgen van deze stappen nog vragen? Neem contact op met ${BRAND} support via het ticketssysteem of e-mail. Vermeld altijd je domeinnaam en een duidelijke omschrijving van het probleem, zodat we sneller kunnen helpen.`,
    related
      ? `Gerelateerd: ${related}`
      : `Bekijk ook andere artikelen in de kennisbank voor aanvullende uitleg over hosting, e-mail en beveiliging.`,
  );
}

type Ctx = { title: string; topic: string };

const topicBuilders: Record<string, (ctx: Ctx) => string> = {
  spf: ({ title }) =>
    [
      p(
        `Een SPF-record (Sender Policy Framework) vertelt ontvangende mailservers welke systemen namens jouw domein e-mail mogen versturen. Zonder correct SPF-record belanden legitieme berichten sneller in spam of worden ze geweigerd.`,
        `Bij ${BRAND} beheer je DNS meestal via het klantenpanel of DirectAdmin. Onderstaande stappen helpen je om een professioneel SPF-beleid in te richten.`,
      ),
      h2("Waarom SPF belangrijk is"),
      ul([
        "Vermindert spoofing: derden kunnen jouw domein minder makkelijk misbruiken als afzender.",
        "Verbetert aflevering bij Gmail, Microsoft 365 en andere providers.",
        "Vormt samen met DKIM en DMARC de basis van moderne e-mailauthenticatie.",
      ]),
      h2("SPF-record toevoegen"),
      ol([
        "Log in op het klantenpanel of DirectAdmin van je domein.",
        "Open DNS-beheer en zoek naar bestaande TXT-records met <code>v=spf1</code>.",
        "Gebruik bij voorkeur één SPF-record per domein. Meerdere SPF-records veroorzaken fouten.",
        `Voeg een TXT-record toe op de root (@) met bijvoorbeeld: <code>v=spf1 include:mail.${BRAND.toLowerCase().replace(/\s+/g, "")}.example a mx ~all</code> — gebruik de include/host die ${BRAND} voor jouw pakket communiceert.`,
        "Sla op en wacht op DNS-propagatie (vaak enkele minuten tot enkele uren).",
      ]),
      h2("Veelgemaakte fouten"),
      ul([
        "Meerdere SPF-records op hetzelfde domein.",
        "Te veel DNS-lookups (SPF heeft een limiet van 10).",
        "Hard fail (<code>-all</code>) terwijl nog niet alle verzendsystemen zijn opgenomen.",
      ]),
      tip(
        "Test met een SPF-validatietool en verstuur een testmail naar een extern adres. Controleer de headers op ‘spf=pass’.",
      ),
      outro("DKIM en DMARC artikelen in deze kennisbank."),
    ].join("\n"),

  dmarc: () =>
    [
      p(
        `DMARC koppelt SPF en DKIM aan een beleid: wat moet een ontvangende server doen als authenticatie faalt? Met een DMARC-record bescherm je jouw merk en krijg je inzicht in misbruik van je domein.`,
      ),
      h2("DMARC in drie stappen"),
      ol([
        "Zorg dat SPF en DKIM correct werken voordat je streng beleid afdwingt.",
        "Voeg een TXT-record toe op <code>_dmarc</code> met bijvoorbeeld <code>v=DMARC1; p=none; rua=mailto:dmarc@jouwdomein.nl</code>.",
        "Analyseer rapporten enkele weken en schaal daarna op naar <code>p=quarantine</code> of <code>p=reject</code>.",
      ]),
      h2("Beleid uitgelegd"),
      ul([
        "<code>p=none</code>: alleen monitoren — ideaal om te starten.",
        "<code>p=quarantine</code>: verdachte mail naar spam.",
        "<code>p=reject</code>: niet-authentieke mail weigeren.",
      ]),
      warn(
        "Zet niet meteen op reject als je nieuwsbrieven, CRM of webshops via externe SMTP verstuurt. Neem die diensten eerst op in SPF/DKIM.",
      ),
      outro(),
    ].join("\n"),

  dkim: () =>
    [
      p(
        `DKIM ondertekent uitgaande e-mail cryptografisch. Ontvangende servers controleren of de inhoud onderweg niet is gewijzigd en of de handtekening bij jouw domein hoort.`,
      ),
      h2("DKIM activeren bij TripleZero iT Hosting"),
      ol([
        "Log in op DirectAdmin en selecteer het juiste domein.",
        "Open E-mailgegevens / E-mailauthenticatie (of DNS-beheer).",
        "Schakel DKIM in. DirectAdmin publiceert doorgaans automatisch het benodigde TXT-record.",
        "Controleer in DNS of een record zoals <code>x._domainkey</code> bestaat.",
        "Verstuur een testmail en controleer in de headers op ‘dkim=pass’.",
      ]),
      tip(
        "Beheer je DNS extern (Cloudflare e.d.), kopieer het DKIM-record handmatig naar die provider.",
      ),
      outro(),
    ].join("\n"),

  "cp-login": () =>
    [
      p(
        `CyberPanel is het webcontrolpanel op OpenLiteSpeed waarmee je websites, e-mail, SSL en databases beheert bij ${BRAND}. Inloggen gebeurt via een beveiligde HTTPS-URL op poort 8090 of via de link in je welkomstmail.`,
      ),
      h2("Eerste keer inloggen"),
      ol([
        "Open de CyberPanel-URL uit je welkomstmail (vaak <code>https://serverhostname:8090</code>).",
        "Accepteer indien nodig het certificaat tijdens de eerste setup; daarna gebruik je Let’s Encrypt voor het panel.",
        "Log in met de admin- of websitegebruiker-gegevens die ${BRAND} heeft verstrekt.",
        "Wijzig direct het standaardwachtwoord en activeer bij voorkeur 2FA.",
      ]),
      warn("Deel nooit je admin-login. Maak voor dagelijks beheer een aparte websitegebruiker met beperkte rechten."),
      outro(),
    ].join("\n"),

  "cp-domain": () =>
    [
      p(
        `In CyberPanel voeg je websites toe als ‘Websites’ of ‘Child Domains’. Zorg dat DNS al naar de server wijst voordat je SSL aanvraagt.`,
      ),
      h2("Domein toevoegen"),
      ol([
        "Ga naar Websites → Create Website.",
        "Vul domeinnaam, e-mail van de eigenaar en PHP-versie in.",
        "Kies of je SSL meteen wilt aanmaken (Let’s Encrypt) zodra DNS correct staat.",
        "Bevestig en wacht tot de virtual host is aangemaakt.",
        "Upload bestanden via File Manager of Git/FTP naar de document root.",
      ]),
      tip("Controleer A/AAAA-records voordat je SSL forceert; anders faalt Let’s Encrypt-validatie."),
      outro(),
    ].join("\n"),

  "cp-ssl": () =>
    [
      p(
        `CyberPanel integreert Let’s Encrypt zodat je gratis SSL-certificaten kunt uitgeven en vernieuwen voor websites en mail.`,
      ),
      h2("SSL aanvragen"),
      ol([
        "Open SSL → Issue SSL of gebruik de SSL-optie bij je website.",
        "Selecteer het domein (inclusief www indien gewenst).",
        "Start de uitgifte en controleer of HTTP-validatie bereikbaar is.",
        "Forceer daarna HTTPS-redirect in CyberPanel of via .htaccess/OpenLiteSpeed rules.",
      ]),
      outro(),
    ].join("\n"),

  "cp-email": () =>
    [
      p(
        `CyberPanel biedt e-mailaccounts per domein, inclusief webmail. Stel SPF/DKIM correct in voor betrouwbare aflevering.`,
      ),
      h2("Mailbox aanmaken"),
      ol([
        "Ga naar Email → Create Email.",
        "Kies domein, lokale mailboxnaam en wachtwoord.",
        "Stel quota in passend bij je pakket.",
        "Configureer clients met IMAP/SMTP volgens de gegevens in je welkomstmail.",
      ]),
      outro(),
    ].join("\n"),

  "cp-mysql": () =>
    [
      p(
        `Databases in CyberPanel maak je aan via Databases → Create Database. Noteer host, databasenaam, gebruiker en wachtwoord veilig.`,
      ),
      h2("Stappen"),
      ol([
        "Open Databases → Create Database.",
        "Koppel de database aan de juiste websitegebruiker.",
        "Gebruik phpMyAdmin of CLI voor import/export.",
        "Beperk rechten tot alleen wat de applicatie nodig heeft.",
      ]),
      outro(),
    ].join("\n"),

  "cp-wordpress": () =>
    [
      p(
        `CyberPanel bevat een WordPress-installer waarmee je snel een schone installatie kunt opzetten op OpenLiteSpeed.`,
      ),
      h2("WordPress installeren"),
      ol([
        "Ga naar Websites → List Websites → beheer het gewenste domein.",
        "Kies WordPress (of Applications) en start de installer.",
        "Vul sitenaam, admin-gebruiker en sterk wachtwoord in.",
        "Schakel na installatie SSL in en update WordPress, thema’s en plugins.",
        "Installeer een firewall-plugin en maak een eerste backup.",
      ]),
      outro(),
    ].join("\n"),

  "cp-backup": () =>
    [
      p(
        `Regelmatige backups in CyberPanel beschermen je tegen fouten, hacks en mislukte updates. Plan zowel lokale als externe backups.`,
      ),
      h2("Backup & restore"),
      ol([
        "Open Backup → Create Backup en selecteer websites/databases.",
        "Plan een schema (dagelijks/wekelijks) passend bij je wijzigingsfrequentie.",
        "Test periodiek een restore op een testdomein.",
        "Bewaar kritieke exports ook buiten de server.",
      ]),
      outro(),
    ].join("\n"),

  "cp-php": () =>
    [
      p(
        `Per website kun je in CyberPanel een PHP-versie kiezen. Gebruik een ondersteunde versie die jouw CMS en plugins vereisen.`,
      ),
      h2("PHP wijzigen"),
      ol([
        "Open de website-instellingen in CyberPanel.",
        "Selecteer de gewenste PHP-release.",
        "Pas indien nodig extensions (intl, imagick, redis) aan.",
        "Test de site grondig na de switch.",
      ]),
      outro(),
    ].join("\n"),

  "cp-files": () =>
    [
      p(
        `De File Manager in CyberPanel laat je bestanden uploaden, bewerken, rechten zetten en archieven uitpakken zonder aparte FTP-client.`,
      ),
      h2("Veilig werken"),
      ul([
        "Wijzig geen systeemdirectories buiten je website-root.",
        "Zet bestandsrechten strak (typisch 644/755) en vermijd 777.",
        "Maak een backup vóór bulkverwijderingen.",
      ]),
      outro(),
    ].join("\n"),

  "cp-ftp": () =>
    [
      p(
        `Voor geautomatiseerde uploads of externe tools maak je in CyberPanel FTP-gebruikers aan. Gebruik bij voorkeur SFTP waar beschikbaar.`,
      ),
      h2("FTP-account"),
      ol([
        "Ga naar FTP → Create FTP Account.",
        "Beperk de home-directory tot de document root van het betreffende domein.",
        "Gebruik een sterk wachtwoord en wissel periodiek.",
        "Verbind met FileZilla via de host, poort en credentials uit CyberPanel.",
      ]),
      outro(),
    ].join("\n"),

  "cp-dns": () =>
    [
      p(
        `Beheer je DNS via CyberPanel (PowerDNS) of via externe nameservers. Wijzigingen aan MX/A/TXT hebben directe impact op mail en websites.`,
      ),
      h2("DNS bewerken"),
      ol([
        "Open DNS → Add/Delete Records.",
        "Selecteer het zone-domein.",
        "Voeg of wijzig A, AAAA, CNAME, MX, TXT (SPF/DKIM/DMARC) toe.",
        "Controleer TTL en test met dig/nslookup.",
      ]),
      outro(),
    ].join("\n"),

  "cp-redirect": () =>
    [
      p(
        `Redirects in CyberPanel kun je instellen via vHost-configuratie, Rewrite rules of door een redirect-document in de document root.`,
      ),
      h2("Aanbevolen aanpak"),
      ol([
        "Bepaal of je een 301 (permanent) of 302 (tijdelijk) nodig hebt.",
        "Stel de redirect in via Rewrite Rules of een dedicated redirect-website.",
        "Test zowel apex-domein als www.",
        "Vermijd redirect-lussen met HTTPS-forcers.",
      ]),
      outro(),
    ].join("\n"),

  "cp-firewall": () =>
    [
      p(
        `CyberPanel combineert CSF/firewall-opties en ModSecurity om brute-force en OWASP-aanvallen te mitigeren. Fine-tuning voorkomt false positives.`,
      ),
      h2("Beveiliging aanscherpen"),
      ul([
        "Houd ModSecurity aan voor publieke WordPress-sites.",
        "Whitelist legitieme admin-IP’s indien nodig.",
        "Monitor ban-logs bij onterechte blokkades.",
      ]),
      outro(),
    ].join("\n"),

  "cp-ols": () =>
    [
      p(
        `OpenLiteSpeed is de webserver achter CyberPanel. Caching, HTTP/2/3 en LiteSpeed-cache-plugins kunnen WordPress aanzienlijk versnellen.`,
      ),
      h2("Basics"),
      ul([
        "Gebruik LSCache voor WordPress waar mogelijk.",
        "Purge cache na grote contentwijzigingen.",
        "Controleer error-logs bij 5xx-fouten in CyberPanel.",
      ]),
      outro(),
    ].join("\n"),

  "cp-cron": () =>
    [
      p(
        `Cronjobs in CyberPanel plannen terugkerende taken zoals WordPress-cron, backups of custom scripts.`,
      ),
      h2("Cron toevoegen"),
      ol([
        "Ga naar Cron Jobs → Add Cron.",
        "Kies de juiste gebruiker en planning (minuut/uur/dag).",
        "Test het commando eerst handmatig via SSH indien beschikbaar.",
        "Log output naar een bestand voor debugging.",
      ]),
      outro(),
    ].join("\n"),

  "cp-subdomain": () =>
    [
      p(
        `Subdomeinen in CyberPanel maak je aan als child domain of subdomain onder een bestaande website.`,
      ),
      h2("Aanmaken"),
      ol([
        "Open Websites → Create Child Domain / Subdomain.",
        "Koppel DNS (A-record) aan het server-IP.",
        "Installeer SSL voor het subdomein.",
        "Plaats content in de toegewezen document root.",
      ]),
      outro(),
    ].join("\n"),

  "cp-migrate": () =>
    [
      p(
        `Het verplaatsen van websites tussen CyberPanel-accounts vraagt om bestanden, databases en DNS/mailconfiguratie. Plan downtime of gebruik een tijdelijk hostname.`,
      ),
      h2("Checklist"),
      ol([
        "Maak een volledige backup van bron en doel.",
        "Exporteer database en synchroniseer files.",
        "Update wp-config of app-credentials.",
        "Wijzig DNS pas als de doelomgeving getest is.",
      ]),
      outro(),
    ].join("\n"),

  "cp-troubleshoot": () =>
    [
      p(
        `Bij problemen in CyberPanel kijk je eerst naar service-status, error-logs, schijfruimte en recente wijzigingen.`,
      ),
      h2("Diagnose"),
      ol([
        "Controleer of OpenLiteSpeed, MariaDB/MySQL en mailservices draaien.",
        "Bekijk website- en serverlogs in CyberPanel.",
        "Verifieer DNS, SSL-geldigheid en firewall-bans.",
        "Herstel vanuit backup als een update de site brak.",
        `Open een ticket bij ${BRAND} met logs en tijdstip als je er niet uit komt.`,
      ]),
      outro(),
    ].join("\n"),

  "email-settings": () =>
    [
      p(
        `Voor e-mailclients heb je de juiste inkomende en uitgaande servers nodig. Bij ${BRAND} gebruik je doorgaans je domeinnaam of de servernamen uit de welkomstmail.`,
      ),
      h2("Standaardinstellingen"),
      ul([
        "IMAP: poort 993, SSL/TLS",
        "POP3: poort 995, SSL/TLS (alleen als je bewust POP gebruikt)",
        "SMTP: poort 465 (SSL) of 587 (STARTTLS)",
        "Gebruikersnaam: het volledige e-mailadres",
        "Authenticatie: verplicht voor SMTP",
      ]),
      tip("Kies IMAP als je op meerdere apparaten dezelfde mailbox wilt synchroniseren."),
      outro(),
    ].join("\n"),

  "pop-imap": () =>
    [
      p(
        `IMAP houdt e-mail op de server en synchroniseert mappen tussen apparaten. POP downloadt berichten vaak lokaal en kan ze van de server verwijderen.`,
      ),
      h2("Welke kies je?"),
      ul([
        "IMAP: smartphones + laptop + webmail tegelijk — aanbevolen.",
        "POP: alleen als je bewust lokaal archiveert en de server leeg wilt houden.",
      ]),
      warn("Met POP riskeer je dat mail ‘zoekraakt’ op andere apparaten als verwijderen van de server aan staat."),
      outro(),
    ].join("\n"),

  "what-is-ssl": () =>
    [
      p(
        `SSL/TLS versleutelt het verkeer tussen bezoeker en server. Browsers tonen HTTPS en beschouwen sites zonder certificaat als onveilig.`,
      ),
      h2("Waarom je SSL nodig hebt"),
      ul([
        "Beschermt logins, formulieren en cookies.",
        "Positief voor vertrouwen en SEO.",
        "Verplicht voor moderne betaal- en API-integraties.",
      ]),
      p(
        `Bij ${BRAND} kun je gratis Let’s Encrypt-certificaten installeren via DirectAdmin, CyberPanel of Plesk. Betaalde certificaten bieden extra validatie of organisatievermelding.`,
      ),
      outro(),
    ].join("\n"),

  "digital-assistant": () =>
    [
      p(
        `De digitale assistent van ${BRAND} helpt je sneller antwoorden te vinden op veelgestelde hosting-, domein- en e-mailvragen — 24/7 als aanvulling op menselijke support.`,
      ),
      h2("Wat je eraan hebt"),
      ul([
        "Snelle verwijzingen naar kennisbankartikelen.",
        "Hulp bij veelvoorkomende stappen (DNS, webmail, SSL).",
        "Doorverwijzing naar een medewerker wanneer een ticket nodig is.",
      ]),
      tip("Formuleer je vraag met domeinnaam en foutmelding voor het beste resultaat."),
      outro(),
    ].join("\n"),
};

function genericBody(ctx: Ctx): string {
  const { title, topic } = ctx;
  const isCyber = topic.startsWith("cp-");
  const panel = isCyber
    ? "CyberPanel"
    : topic.includes("plesk")
      ? "Plesk"
      : topic.includes("da") ||
          topic.includes("directadmin") ||
          topic.includes("installatron") ||
          topic.includes("jetbackup")
        ? "DirectAdmin"
        : "het klantenpanel";

  const lower = `${title} ${topic}`.toLowerCase();
  const focusBlocks: string[] = [];

  if (/dns|spf|dkim|dmarc|nameserver|sidn|whois|quarantaine|trustee|autorisatie/.test(lower)) {
    focusBlocks.push(
      h2("DNS- en registratieaspecten"),
      p(
        `Bij dit onderwerp speelt DNS of de domeinregistratie een centrale rol. Controleer nameservers, TTL en of wijzigingen al wereldwijd zichtbaar zijn voordat je concludeert dat iets “niet werkt”.`,
        `Werk bij voorkeur met één bron van waarheid voor DNS: ofwel ${BRAND}-nameservers, ofwel een externe DNS-provider — niet allebei half geconfigureerd.`,
      ),
    );
  }
  if (/mail|e-mail|smtp|imap|pop|spam|webmail|outlook|gmail|roundcube/.test(lower)) {
    focusBlocks.push(
      h2("E-mailspecifieke aandachtspunten"),
      p(
        `Test altijd zowel ontvangen als verzenden. Problemen met alleen verzenden wijzen vaak op SMTP-authenticatie, poortblokkades bij de ISP of ontbrekende SPF/DKIM.`,
        `Gebruik webmail als referentie: werkt webmail wel en je client niet, dan ligt de oorzaak in de clientinstellingen.`,
      ),
    );
  }
  if (/wordpress|plugin|theme|installatron|xmlrpc|wordfence|akismet/.test(lower)) {
    focusBlocks.push(
      h2("WordPress-specifieke aandachtspunten"),
      p(
        `Schakel caching tijdelijk uit bij het debuggen, werk met een staging-kopie waar mogelijk, en noteer plugin-/themaversies vóór updates.`,
        `Na herstel: update core, thema’s en plugins, controleer permalinks en forceer HTTPS indien SSL actief is.`,
      ),
    );
  }
  if (/ssl|https|encrypt|certificaat|2fa|hack|firewall|htaccess|ssh|pgp/.test(lower)) {
    focusBlocks.push(
      h2("Beveiliging en certificaatcontrole"),
      p(
        `Controleer certificaatketen, vernieuwingsdatum en of www én apex-domein gedekt zijn. Forceer HTTPS pas nadat het certificaat geldig is.`,
        `Beperk admin-toegang, gebruik unieke wachtwoorden en activeer 2FA waar beschikbaar in panel en WordPress.`,
      ),
    );
  }
  if (/opslag|schijf|inode|bandbreedte|quota|backup|ftp|filezilla|php/.test(lower)) {
    focusBlocks.push(
      h2("Resources en limieten"),
      p(
        `Bekijk in het control panel het actuele verbruik van schijf, inodes en bandbreedte. Ruim logs, oude backups en ongebruikte installaties op voordat je het pakket vergroot.`,
        `Na het verwijderen van bestanden kan gebruiksevaluatie enkele minuten tot uren achterlopen — vernieuw de statistieken of wacht op de nachtelijk recount.`,
      ),
    );
  }

  return [
    p(
      `In dit artikel van de ${BRAND} kennisbank leggen we uit: <strong>${title}</strong>. We beschrijven het doel, de voorbereiding en een duidelijke werkwijze die je stap voor stap kunt volgen.`,
      `Deze handleiding is geschreven voor klanten van ${BRAND} en gaat uit van gangbare configuraties op gedeelde hosting, reselleromgevingen en control panels zoals DirectAdmin, CyberPanel en Plesk.`,
    ),
    h2("Wat je nodig hebt"),
    ul([
      `Toegang tot ${panel} of het ${BRAND} klantenpanel.`,
      "Je domeinnaam en eventuele login-/mailboxgegevens.",
      "Een actuele browser en, waar van toepassing, FTP/SSH-toegang.",
      "Bij voorkeur een recente backup voordat je structurele wijzigingen doorvoert.",
    ]),
    h2("Stapsgewijze aanpak"),
    ol([
      `Log in op het juiste paneel bij ${BRAND} en selecteer het domein of account waarop de wijziging betrekking heeft.`,
      "Controleer of je de juiste omgeving hebt (productie versus test) en noteer de huidige instellingen.",
      `Voer de handeling uit die past bij “${title}”. Werk rustig en wijzig niet meerdere kritieke opties tegelijk.`,
      "Sla de wijzigingen op en test het resultaat: website, e-mail of DNS — afhankelijk van het onderwerp.",
      "Documenteer wat je hebt aangepast, zodat je later kunt terugrollen of support sneller kunt helpen.",
    ]),
    h2("Diepere uitleg"),
    p(
      `Het onderwerp “${title}” raakt vaak meerdere lagen: DNS, webserver, mailserver, applicatie (bijvoorbeeld WordPress) en accountlimieten. Problemen ontstaan meestal wanneer één laag is gewijzigd zonder de andere te controleren.`,
      `Bij ${BRAND} adviseren we om eerst te verifiëren of DNS naar de juiste nameservers wijst, daarna control panel-instellingen te controleren, en pas daarna applicatie-instellingen (plugins, thema’s, .htaccess) te wijzigen.`,
    ),
    ...focusBlocks,
    h3("Controlelijst na afloop"),
    ul([
      "Werkt de website over HTTP en HTTPS zonder certificaatfouten?",
      "Komen testmails aan en worden ze niet als spam gemarkeerd?",
      "Zijn limieten (schijf, inodes, bandbreedte) nog binnen de pakketgrenzen?",
      "Staan er geen onbedoelde redirects, firewall-blokkades of PHP-fouten in de logs?",
    ]),
    h2("Veelvoorkomende knelpunten"),
    ul([
      "DNS-propagatie: wijzigingen zijn niet overal meteen zichtbaar.",
      "Verkeerd geselecteerd domein of gebruiker in een reselleromgeving.",
      "Cache (browser, CDN, LiteSpeed/OpenLiteSpeed, WordPress-plugins) die oude content toont.",
      "Ontbrekende rechten op mappen of verkeerde document root.",
    ]),
    tip(
      `Maak vóór risicovolle stappen een backup via DirectAdmin, CyberPanel, JetBackup of Installatron. Zo kun je snel terug naar een werkende situatie.`,
    ),
    warn(
      `Gebruik nooit wachtwoorden opnieuw over meerdere diensten heen. Activeer waar mogelijk 2FA op het klantenpanel en control panel.`,
    ),
    h2("Wanneer support inschakelen"),
    p(
      `Als je na deze stappen vastloopt — bijvoorbeeld bij hardnekkige mailfouten, SSL-problemen of een onbereikbare site — open dan een ticket bij ${BRAND}. Vermeld domeinnaam, tijdstip, foutmelding (screenshot of exacte tekst) en wat je al hebt geprobeerd.`,
    ),
    outro(),
  ].join("\n");
}

export function buildArticleHtml(title: string, topic: string): string {
  const ctx = { title, topic };
  const builder = topicBuilders[topic];
  if (builder) return builder(ctx);
  return genericBody(ctx);
}

export function buildExcerpt(title: string): string {
  return `Professionele handleiding van ${BRAND}: ${title.replace(/\?$/, "")}. Stapsgewijze uitleg, aandachtspunten en tips voor een stabiele configuratie.`;
}

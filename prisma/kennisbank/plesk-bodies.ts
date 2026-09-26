/**
 * Dutch kennisbank bodies for Plesk topics (TripleZero iT).
 * New articles use tz-pl-*.
 */
function p(...paras: string[]) {
  return paras.map((t) => `<p>${t}</p>`).join("\n");
}

function h2(t: string) {
  return `<h2>${t}</h2>`;
}

function ol(items: string[]) {
  return `<ol>\n${items.map((i) => `  <li>${i}</li>`).join("\n")}\n</ol>`;
}

function ul(items: string[]) {
  return `<ul>\n${items.map((i) => `  <li>${i}</li>`).join("\n")}\n</ul>`;
}

function tip(t: string) {
  return `<aside class="kb-callout kb-callout-tip"><p><strong>Tip:</strong> ${t}</p></aside>`;
}

function warn(t: string) {
  return `<aside class="kb-callout kb-callout-warn"><p><strong>Let op:</strong> ${t}</p></aside>`;
}

function outro(related?: string) {
  return p(
    `Heb je na het volgen van deze stappen nog vragen? Neem contact op met TripleZero iT support via het ticketssysteem. Vermeld hostname, Plesk-URL (poort 8443) en wat je precies ziet (foutmelding of screenshot).`,
    related
      ? `Gerelateerd: ${related}`
      : `Bekijk ook andere artikelen in Plesk over toegang, websites, e-mail, SSL, WordPress Toolkit en backups.`,
  );
}

type Ctx = { title: string; topic: string };

export const pleskTopicBuilders: Record<string, (ctx: Ctx) => string> = {
  "tz-pl-password-reset": () =>
    [
      p(
        `Een vergeten of gecompromitteerd <strong>Plesk-wachtwoord</strong> reset je veilig — niet via onbekende “resetlinks” op het internet.`,
      ),
      h2("Wie mag resetten"),
      ul([
        "Extra gebruiker of mailbox: de abonnementseigenaar reset het in <strong>Gebruikers</strong> of <strong>Mail</strong>.",
        "Abonnementseigenaar: de reseller of TripleZero iT-beheer reset het in het klantaccount.",
        "Serveradmin (VPS): alleen via servertoegang of een ticket bij TripleZero iT, niet door te gokken op poort 8443.",
      ]),
      h2("Checklist na reset"),
      ol([
        "Stel een sterk, uniek wachtwoord in (wachtwoordmanager).",
        "Log uit op andere apparaten waar mogelijk.",
        "Controleer of er geen onbekende extra gebruikers zijn aangemaakt.",
        "Schakel 2FA in op het panel-account.",
      ]),
      warn("Deel nooit je Plesk-wachtwoord in chat of e-mail buiten het ticketssysteem."),
      outro("2FA inschakelen; inloggen lukt niet op 8443."),
    ].join("\n"),

  "tz-pl-2fa": () =>
    [
      p(
        `<strong>Twee-factorauthenticatie (2FA)</strong> in Plesk beperkt schade als een wachtwoord uitlekt. Activeer dit op het panel-account waarmee je inlogt op poort 8443.`,
      ),
      h2("Stappen"),
      ol([
        "Log in op Plesk via de URL uit je welkomstmail.",
        "Open je profiel (rechtsboven) en kies <strong>Twee-factorauthenticatie</strong> of Google Authenticator.",
        "Scan de QR-code met een authenticator-app.",
        "Sla backupcodes of het herstelwoord veilig op.",
        "Log uit en opnieuw in: wachtwoord + 2FA-code.",
      ]),
      tip("Zonder backupcodes kun je jezelf buitensluiten — bewaar ze in een kluis of wachtwoordmanager, niet in dezelfde inbox."),
      outro("Wachtwoord resetten; extra gebruikers beheren."),
    ].join("\n"),

  "tz-pl-first-steps": () =>
    [
      p(
        `Na oplevering van een Plesk-server of -abonnement bij TripleZero iT volg je een vaste checklist: toegang beveiligen, DNS, eerste site en backups.`,
      ),
      h2("Dag 1"),
      ol([
        "Log in via de welkomst-URL (meestal <code>https://hostname:8443</code>).",
        "Wijzig het admin- of abonnementswachtwoord en zet 2FA aan.",
        "Controleer hostname, panel-SSL en dat je in het juiste <strong>abonnement</strong> werkt.",
        "Zet nameservers of A-records voor je eerste domein.",
        "Voeg het domein toe, wacht op DNS en vraag Let’s Encrypt aan.",
      ]),
      h2("Daarna"),
      ul([
        "Maak extra gebruikers voor developers in plaats van het admin-account te delen.",
        "Plan een backup en test één restore-oefening.",
        "Configureer SPF/DKIM als e-mail op deze Plesk-server draait.",
      ]),
      tip("Bewaar credentials alleen in een wachtwoordmanager — niet in gedeelde spreadsheets."),
      outro("Domein toevoegen; Let’s Encrypt; backups."),
    ].join("\n"),

  "tz-pl-login-8443": () =>
    [
      p(
        `Plesk bereik je meestal via <code>https://hostname:8443</code>. Timeouts, certificaatfouten of een leeg scherm komen bijna altijd door DNS, firewall of panel-SSL — niet door een “kapot” abonnement.`,
      ),
      h2("Checklist"),
      ul([
        "Gebruik de exacte URL uit de welkomstmail van TripleZero iT (niet http, niet poort 80).",
        "A/AAAA van de hostname wijst naar de server.",
        "Poort 8443 (TCP) is bereikbaar; op een VPS kan de firewall die poort beperken tot jouw IP.",
        "Panel-SSL voor de hostname voorkomt browserwaarschuwingen.",
      ]),
      h2("Problemen"),
      ol([
        "Timeout → verkeerd IP, VPN of firewall. Test vanaf een ander netwerk.",
        "Certificaatfout → hostname klopt niet of panel-SSL is verlopen; vernieuw via Tools &amp; Settings → SSL/TLS.",
        "Wachtwoord geweigerd → reset via reseller of ticket, niet eindeloos proberen (Fail2Ban).",
        "502/503 op het panel → Apache/nginx/sw-cp-server; op een VPS: services in Plesk of een ticket.",
      ]),
      warn("Poort 8880 (HTTP) is onveilig voor dagelijks beheer. Boekmark altijd HTTPS op 8443."),
      outro("Wachtwoord resetten; Fail2Ban; Plesk updaten op je VPS."),
    ].join("\n"),

  "tz-pl-resource-limits": () =>
    [
      p(
        `In Plesk zie je <strong>resourcegebruik</strong> (schijf, verkeer, mailboxen, databases) per abonnement. Zo voorkom je “disk quota exceeded” en mislukte uploads voordat de site omvalt.`,
      ),
      h2("Waar je kijkt"),
      ul([
        "Abonnementsoverzicht: schijf, verkeer en aantal sites t.o.v. het service plan.",
        "Websites &amp; Domeinen → statistieken of schijfgebruik per domein.",
        "Mail → quota per mailbox (apart van de siteschijf).",
      ]),
      h2("Als je tegen limieten zit"),
      ol([
        "Ruim oude backups, logs, cache en ongebruikte staging-sites op.",
        "Leeg prullenbakken in File Manager en WordPress.",
        "Verplaats grote mailarchieven naar IMAP-lokaal of verhoog mailboxquota.",
        "Vraag TripleZero iT of je reseller om een plan-upgrade — niet om de limiet in php.ini te omzeilen.",
      ]),
      outro("Mailboxquota; geplande backups; File Manager."),
    ].join("\n"),

  "tz-pl-subdomain": () =>
    [
      p(
        `Een <strong>subdomein</strong> (<code>shop.voorbeeld.nl</code>) is een eigen website in Plesk: eigen document root, SSL en vaak eigen PHP. Gebruik het niet als alias voor dezelfde content.`,
      ),
      h2("Stappen"),
      ol([
        "Open <strong>Websites &amp; Domeinen</strong> in het juiste abonnement.",
        "Kies <strong>Subdomein toevoegen</strong> en vul de hostnaam in (bijvoorbeeld <code>blog</code>).",
        "Laat de document root op de voorgestelde map staan, tenzij je bewust een andere padstructuur wilt.",
        "Wacht tot DNS (A/AAAA of CNAME) naar de server wijst.",
        "Vraag Let’s Encrypt aan voor het subdomein.",
      ]),
      tip("Wildcard-DNS (<code>*.voorbeeld.nl</code>) maakt nieuwe subdomeinen sneller live, maar Let’s Encrypt-wildcard vraagt extra DNS-validatie."),
      outro("Domeinalias; Let’s Encrypt; hoofdmap wijzigen."),
    ].join("\n"),

  "tz-pl-domain-alias": () =>
    [
      p(
        `Een <strong>domeinalias</strong> (parked domain) wijst een extra domeinnaam naar dezelfde site-inhoud. Handig voor merkvarianten, niet voor een tweede, losse website.`,
      ),
      h2("Wanneer alias"),
      ul([
        "<code>oldedomein.nl</code> moet meeliften op <code>nieuwdomein.nl</code>.",
        "Eén document root, één CMS, één database.",
      ]),
      h2("Stappen"),
      ol([
        "Zorg dat DNS van het aliasdomein naar dezelfde server wijst.",
        "Websites &amp; Domeinen → <strong>Domeinalias toevoegen</strong> bij de primaire site.",
        "Kies of e-mail van het alias naar dezelfde mailboxen mag (vaak ja bij merkaliasen).",
        "Vraag SSL aan voor het aliasdomein.",
        "Zet een 301 naar het voorkeursdomein zodat zoekmachines één canonical zien.",
      ]),
      warn("Een echte tweede website = extra domein toevoegen, geen alias. Alias deelt bestanden; extra domein krijgt een eigen root."),
      outro("WWW- en HTTPS-redirects; extra domein toevoegen."),
    ].join("\n"),

  "tz-pl-www-https-redirects": () =>
    [
      p(
        `Kies één canonical host (<strong>www</strong> of <strong>non-www</strong>) en forceer <strong>HTTPS</strong>. Zonder vaste redirects krijg je duplicate content, mixed SSL en ingelogde sessies op het “verkeerde” adres.`,
      ),
      h2("Volgorde"),
      ol([
        "DNS: apex én www wijzen naar de server (A/AAAA of CNAME voor www).",
        "SSL voor beide hostnames (Let’s Encrypt in Plesk dekt www meestal mee).",
        "Hostinginstellingen of Apache/nginx-instellingen → permanente redirect naar HTTPS.",
        "Voorkeursdomein (www of non-www) instellen in Plesk of via hostinginstellingen.",
        "Zet het CMS-adres gelijk (WordPress: site-URL onder Instellingen of WP Toolkit).",
      ]),
      h2("Controleren"),
      ul([
        "<code>http://</code> moet 301 naar <code>https://</code> geven.",
        "De niet-voorkeurshost moet naar de voorkeurshost.",
        "Geen mixed content in de browserconsole.",
      ]),
      tip("Wijzig niet tegelijk DNS, SSL én canonical. Eerst DNS, dan certificaat, dan redirect."),
      outro("Let’s Encrypt; mixed content voorkom je in het CMS; domeinalias."),
    ].join("\n"),

  "tz-pl-suspend-site": () =>
    [
      p(
        `Een site <strong>uitschakelen (suspend)</strong> in Plesk zet de website offline zonder bestanden of databases te wissen. Handig bij onderhoud, wanbetaling van een resellerklant of een tijdelijke park-pagina.`,
      ),
      h2("Stappen"),
      ol([
        "Open Websites &amp; Domeinen en kies het domein.",
        "Kies <strong>Uitschakelen</strong> / Suspend (niet Verwijderen).",
        "Bezoekers zien een standaard Plesk-onderhoudspagina of jouw eigen suspend-pagina.",
        "E-mail van hetzelfde abonnement blijft vaak werken — controleer dat als mail tijdens onderhoud door moet.",
      ]),
      h2("Weer live"),
      ul([
        "Kies Activeren / Enable op hetzelfde domein.",
        "Test HTTPS en de homepage; caches (CDN, WP) zo nodig legen.",
      ]),
      warn("Verwijderen wist vhosts en vaak data. Suspend is de veilige pauze; verwijderen alleen mét backup."),
      outro("Website kopiëren; backups; klantabonnement opschorten als reseller."),
    ].join("\n"),

  "tz-pl-copy-staging": () =>
    [
      p(
        `Plesk kan een website <strong>kopiëren</strong> naar een ander domein of subdomein. Zo test je updates op staging zonder de livesite te raken. Voor WordPress is WordPress Toolkit vaak nauwkeuriger (URL’s in de database).`,
      ),
      h2("Website kopiëren"),
      ol([
        "Maak het doeldomein of -subdomein eerst aan (lege site).",
        "Bron-site → <strong>Website kopiëren</strong> (of Copy in Hostinginstellingen).",
        "Kies of database meekomt. Bij PHP-apps is dat bijna altijd nodig.",
        "Pas na de kopie configuratie aan: databasecredentials, <code>wp-config.php</code>, .env, hard-coded URL’s.",
        "Vraag SSL aan op staging en blokkeer indexatie (noindex of HTTP-auth).",
      ]),
      h2("WordPress"),
      ul([
        "Gebruik <strong>Klonen</strong> in WordPress Toolkit i.p.v. kale bestandskopie — Toolkit herschrijft URL’s.",
        "Zet staging op een subdomein (<code>staging.voorbeeld.nl</code>) met eigen database.",
      ]),
      warn("Kopieën verdubbelen schijfgebruik. Ruim oude staging-sites op als ze niet meer nodig zijn."),
      outro("WordPress Toolkit klonen; hoofdmap wijzigen; resourcegebruik."),
    ].join("\n"),

  "tz-pl-mail-forwarders": () =>
    [
      p(
        `Een <strong>forwarder</strong> of mail-alias stuurt berichten van één adres door naar een ander. Handig voor <code>info@</code> → een echte mailbox, niet als vervanging van een volledige mailbox als je zelf wilt antwoorden.`,
      ),
      h2("Stappen"),
      ol([
        "Open <strong>Mail</strong> in het juiste abonnement/domein.",
        "Kies E-mailalias of Doorsturen bij het adres.",
        "Vul het doeladres in (interne mailbox of extern).",
        "Test vanaf een extern account (niet vanaf hetzelfde domein).",
      ]),
      h2("Let op"),
      ul([
        "Keten-forwarders (A→B→C) verhogen spamscore en loops.",
        "Doorsturen naar Gmail/Outlook kan SPF/DMARC breken; beter: mailbox + IMAP, of “send as” in de client.",
        "Quota telt op de brónmailbox als die bestaat; een kale alias heeft geen eigen opslag.",
      ]),
      outro("Mailboxquota; SPF/DKIM; IMAP-instellingen."),
    ].join("\n"),

  "tz-pl-spf-dkim-dmarc": () =>
    [
      p(
        `<strong>SPF, DKIM en DMARC</strong> vertellen ontvangende servers dat jouw Plesk-mailserver namens het domein mag verzenden. Zonder deze records belandt uitgaande mail in spam, óók als SMTP klopt.`,
      ),
      h2("In Plesk"),
      ol([
        "Mail → <strong>Mailinstellingen</strong> voor het domein.",
        "Schakel DKIM-ondertekening in (Plesk zet het TXT-record in de zone als DNS in Plesk staat).",
        "Open DNS-instellingen: controleer SPF (<code>v=spf1</code> met de include/ip van deze server).",
        "Voeg een DMARC-record toe, bijvoorbeeld <code>v=DMARC1; p=none; rua=mailto:dmarc@jouwdomein.nl</code> om eerst te monitoren.",
        "Als DNS extern draait (Cloudflare e.d.): kopieer de TXT-records 1-op-1; Plesk-zone is dan niet leidend.",
      ]),
      h2("Na wijziging"),
      ul([
        "Wacht op DNS-propagatie (vaak minuten, soms uren).",
        "Verstuur een testmail naar een externe provider en bekijk de headers.",
        "Verhoog DMARC van <code>p=none</code> naar <code>quarantine</code> pas als de rapporten schoon zijn.",
      ]),
      warn("Meerdere SPF-records op hetzelfde domein is ongeldig. Merge ze tot één TXT."),
      outro("DNS-records beheren; IMAP/SMTP; uitgaande mail en spamfilter."),
    ].join("\n"),

  "tz-pl-mailbox-quota": () =>
    [
      p(
        `Elke mailbox in Plesk heeft een <strong>quota</strong>. Is de box vol, dan weigert SMTP nieuwe berichten en lijkt “mail niet aan te komen”. Dat is geen DNS-probleem.`,
      ),
      h2("Controleren"),
      ol([
        "Mail → overzicht: gebruikte MB t.o.v. limiet per adres.",
        "Webmail: verwijder grote mappen (Verzonden, Spam, Prullenbak).",
        "IMAP-client: compacteer/expunge zodat de server écht ruimte vrijgeeft.",
      ]),
      h2("Oplossen"),
      ul([
        "Verhoog de mailboxquota in Plesk als het abonnement nog ruimte heeft.",
        "Verhoog niet blindly de abonnementsschijf zonder de mailboxlimiet — die zijn vaak gescheiden.",
        "Archivar grote mappen lokaal (Outlook/Apple Mail) en leeg daarna de serverkopie.",
      ]),
      tip("Catch-all vult mailboxen extra snel. Zet catch-all uit als je het niet bewust gebruikt."),
      outro("Resourcegebruik; spamfilter; e-mailaccount aanmaken."),
    ].join("\n"),

  "tz-pl-spamfilter": () =>
    [
      p(
        `Plesk filtert inkomende spam meestal met <strong>SpamAssassin</strong> (en optioneel extra regels). Te streng = gemiste facturen; te soepel = volle inbox.`,
      ),
      h2("Stappen"),
      ol([
        "Mail → kies het adres → <strong>Spamfilter</strong>.",
        "Zet het filter aan. Kies of spam in een map Spam belandt of wordt verwijderd (map is veiliger).",
        "Pas de score aan in kleine stappen; test een week.",
        "Whitelist adressen van boekhouding, leveranciers en newsletters die je wél wilt.",
        "Blacklist alleen hardnekkige bronnen — geen hele TLD’s “voor de zekerheid”.",
      ]),
      h2("Serverbreed (VPS/admin)"),
      ul([
        "Tools &amp; Settings → Spamfilter voor globale drempels.",
        "Combineer met SPF/DKIM; een filter alleen lost geen vervalste afzenders op.",
      ]),
      warn("Serverbrede wijzigingen raken alle mailboxen. Overleg met TripleZero iT op een managed VPS."),
      outro("SPF/DKIM/DMARC; mailboxquota; webmail."),
    ].join("\n"),

  "tz-pl-imap-smtp": () =>
    [
      p(
        `Outlook, Apple Mail en Thunderbird praten met Plesk via <strong>IMAP</strong> (lezen) en <strong>SMTP</strong> (verzenden). Foute host, poort of SSL geeft “kan server niet bereiken” — dat is zelden het wachtwoord van Plesk zelf.`,
      ),
      h2("Standaardwaarden"),
      ul([
        "Inkomende server (IMAP): <code>mail.jouwdomein.nl</code> of de hostname uit de welkomstmail, poort <strong>993</strong>, SSL/TLS.",
        "Uitgaande server (SMTP): dezelfde host, poort <strong>465</strong> (SSL) of <strong>587</strong> (STARTTLS).",
        "Gebruikersnaam: het volledige e-mailadres, niet alleen het deel vóór @.",
        "Wachtwoord: het mailboxwachtwoord uit Plesk Mail, niet het panel-wachtwoord.",
      ]),
      h2("Problemen"),
      ol([
        "Certificaatwaarschuwing → gebruik de hostname die op het mailcertificaat staat, of installeer SSL voor webmail/mail in Plesk.",
        "SMTP geweigerd buiten het wifi-netwerk → ISP blokkeert poort 25; gebruik 465/587.",
        "Alleen intern werkt het → MX/A-records of firewall; check DNS en SPF.",
      ]),
      tip("POP3 (110/995) haalt mail van de server af. IMAP houdt alles gesynchroniseerd — kies IMAP tenzij je een bewuste reden hebt."),
      outro("Webmail; mail verhuizen; SPF/DKIM."),
    ].join("\n"),

  "tz-pl-ssl-custom": () =>
    [
      p(
        `Een <strong>betaald of eigen certificaat</strong> (OV/EV of van een andere CA) upload je in Plesk als certificate, private key en eventueel CA-bundle. Let’s Encrypt blijft het standaardpad voor gewone sites.`,
      ),
      h2("Stappen"),
      ol([
        "Websites &amp; Domeinen → SSL/TLS-certificaten → <strong>Certificaat toevoegen</strong>.",
        "Plak of upload de private key, het certificaat en de intermediate/CA-chain.",
        "Koppel het certificaat aan het domein (Hostinginstellingen → certificaat kiezen).",
        "Forceer HTTPS als dat nog niet aanstaat.",
        "Test op de live hostname (niet alleen op IP).",
      ]),
      h2("Valkuilen"),
      ul([
        "Key en certificaat horen bij elkaar; een mismatch weigert Plesk of browsers.",
        "Zonder intermediate chain zien mobiele browsers vaak een fout, desktop niet. Upload de bundle.",
        "Na upload: old Let’s Encrypt-certificaat mag je laten staan, maar niet als actief certificaat voor die vhost.",
      ]),
      outro("Let’s Encrypt; wildcard; SSL-vernieuwing faalt."),
    ].join("\n"),

  "tz-pl-ssl-wildcard": () =>
    [
      p(
        `Een <strong>wildcard Let’s Encrypt</strong> (<code>*.voorbeeld.nl</code>) dekt alle subdomeinen. Plesk vraagt daarvoor <strong>DNS-validatie</strong> (TXT), niet alleen HTTP-bestanden in de document root.`,
      ),
      h2("Stappen"),
      ol([
        "SSL/TLS-certificaten → Let’s Encrypt → vink wildcard aan.",
        "Plesk toont een TXT-record (<code>_acme-challenge</code>). Zet dat in de zone die écht autoritatief is.",
        "Als DNS in Plesk staat, kan Plesk het record zelf zetten. Bij Cloudflare/externe DNS: handmatig kopiëren.",
        "Wacht tot de TXT wereldwijd zichtbaar is, ronden daarna de uitgifte af.",
        "Koppel het wildcard-certificaat aan de sites die het moeten gebruiken.",
      ]),
      tip("Apex (<code>voorbeeld.nl</code>) zit niet in <code>*.voorbeeld.nl</code>. Plesk vraagt meestal beide namen in één certificaat aan."),
      warn("HTTP-validatie werkt niet voor wildcard. Zonder werkende DNS-API of handmatige TXT faalt de aanvraag."),
      outro("SSL-vernieuwing; subdomeinen; DNS-records."),
    ].join("\n"),

  "tz-pl-ssl-renew-fail": () =>
    [
      p(
        `Let’s Encrypt vernieuwt in Plesk automatisch. Faalt dat, dan zie je waarschuwingen of een verlopen slotje. Oorzaak is bijna altijd bereikbaarheid, DNS of een te vroeg gewijzigde document root.`,
      ),
      h2("Checklist"),
      ol([
        "Domein lost op naar dit Plesk-IP (A/AAAA). CDN/proxy (oranje wolk) kan HTTP-01 blokkeren.",
        "Poort 80 moet het acme-challenge-bestand kunnen serveren, ook als je HTTPS forceert.",
        "Document root mag niet zijn verhuisd zonder dat de challenge-map bereikbaar blijft.",
        "Geen CAA-record dat Let’s Encrypt uitsluit, tenzij je <code>letsencrypt.org</code> toestaat.",
        "Wildcard: TXT-record en nameservers nog geldig; DNS-plugin/token niet verlopen.",
      ]),
      h2("Opnieuw proberen"),
      ul([
        "SSL/TLS → Let’s Encrypt opnieuw uitgeven voor het betreffende domein.",
        "Bekijk de taak in Tools &amp; Settings → Geplande taken / log als de knop faalt.",
        "Blijft het stuk: ticket naar TripleZero iT met de exacte ACME-fouttekst.",
      ]),
      outro("Let’s Encrypt installeren; panel-SSL op 8443; DNS-records."),
    ].join("\n"),

  "tz-pl-fail2ban": () =>
    [
      p(
        `<strong>Fail2Ban</strong> in Plesk blokkeert IP’s die brute-force uitvoeren op SSH, Plesk (8443), FTP, mail of WordPress-login. Op shared hosting staat dit serverbreed; op een VPS beheer je jails zelf.`,
      ),
      h2("Wat het doet"),
      ul([
        "Te veel mislukte logins → tijdelijke ban (firewalldrop).",
        "Jails per dienst: ssh, plesk-panel, ftp, mail, wordpress (als geconfigureerd).",
      ]),
      h2("Jezelf gebanned"),
      ol([
        "Herken het: timeout op 8443 of SSH vanaf één netwerk, elders wél bereikbaar.",
        "VPS: unban via Plesk Tools &amp; Settings → IP-adresblokkering / Fail2Ban, of vraag TripleZero iT.",
        "Shared/reseller: alleen TripleZero iT kan de ban opheffen — stuur je publieke IP mee.",
        "Zet daarna 2FA aan en stop met wachtwoordgokken.",
      ]),
      warn("Whitelist niet je hele kantoor-range “voor altijd” zonder noodzaak. Liever VPN of vast IP + 2FA."),
      outro("2FA; inloggen 8443; website beveiligen."),
    ].join("\n"),

  "tz-pl-password-protect": () =>
    [
      p(
        `Een map <strong>beveiligen met een wachtwoord</strong> (HTTP-auth) houdt staging, phpMyAdmin-shortcuts of interne tools weg van het open internet. Dit is géén vervanging van CMS-logins of SSL.`,
      ),
      h2("Stappen"),
      ol([
        "Websites &amp; Domeinen → <strong>Wachtwoordbeveiligde mappen</strong> (Protected Directories).",
        "Kies de map relatief tot de document root (bijvoorbeeld <code>/staging</code>).",
        "Voeg een gebruiker + wachtwoord toe (los van Plesk-panelgebruikers).",
        "Test in een privévenster: de browser moet om credentials vragen.",
      ]),
      h2("Let op"),
      ul([
        "WordPress in een beveiligde map + eigen wp-login is dubbel: handig voor staging, lastig voor cron/WP-CLI als die HTTP nodig heeft.",
        "API-callbacks (webhooks, Let’s Encrypt HTTP-01) falen als je de hele root beveiligt. Beveilig een submap, niet <code>/</code> van de livesite.",
      ]),
      outro("Staging kopiëren; Fail2Ban; File Manager."),
    ].join("\n"),

  "tz-pl-ftp-sftp": () =>
    [
      p(
        `Voor uploads naast de File Manager maak je in Plesk een <strong>FTP-</strong> of <strong>SFTP-account</strong>. SFTP (via SSH) is veiliger; klassieke FTP stuur je alleen over FTPS.`,
      ),
      h2("Stappen"),
      ol([
        "Websites &amp; Domeinen → FTP-toegang → <strong>FTP-account toevoegen</strong>.",
        "Kies een eigen gebruiker, sterk wachtwoord en de home-map (niet hoger dan de site-root tenzij nodig).",
        "Verbind in FileZilla/Cyberduck: host = hostname of domein, gebruiker = de FTP-naam die Plesk toont.",
        "Voorkeur: protocol SFTP poort 22, of FTP met expliciete TLS poort 21.",
      ]),
      h2("Rechten"),
      ul([
        "Geef developers een eigen account; deel niet het systeem- of Plesk-admin-account.",
        "Trek toegang in als een project stopt.",
        "Mislukte connecties: Fail2Ban, verkeerde home-map of TLS-verplichting in de client uit.",
      ]),
      tip("Op veel TripleZero iT-servers is kale FTP (poort 21 zonder TLS) geweigerd. Zet “FTP over TLS” aan in de client."),
      outro("File Manager; CHMOD; Fail2Ban."),
    ].join("\n"),

  "tz-pl-phpmyadmin": () =>
    [
      p(
        `<strong>phpMyAdmin</strong> in Plesk opent de MySQL/MariaDB-database van het abonnement. Gebruik het voor import/export en gerichte queries — niet als dagelijkse WordPress-editor.`,
      ),
      h2("Openen"),
      ol([
        "Databases → kies de database → <strong>phpMyAdmin</strong>.",
        "Je bent ingelogd als de databasegebruiker die bij die DB hoort.",
      ]),
      h2("Exporteren"),
      ul([
        "Export → snel of aangepast (gzip bij grotere dumps).",
        "Bewaar de dump buiten de document root.",
      ]),
      h2("Importeren"),
      ol([
        "Maak een backup van de huidige DB voordat je overschrijft.",
        "Import → kies het SQL/zip-bestand. Time-outs bij grote dumps: splitten of via ticket/TripleZero iT op de server importeren.",
        "WordPress: na import search-replace van URL’s als het domein anders is (of gebruik WP Toolkit-kloon).",
      ]),
      warn("Verwijder geen systeemtabelen en wijzig geen gebruikersrechten “om te testen”. Eén DROP te veel maakt de site plat."),
      outro("Database aanmaken; WordPress Toolkit klonen; backups."),
    ].join("\n"),

  "tz-pl-chmod": () =>
    [
      p(
        `Bestandsrechten (<strong>CHMOD</strong>) in de Plesk File Manager bepalen wie mag lezen of schrijven. Te ruim (777) is een hack-magneet; te strak (000) maakt de site wit.`,
      ),
      h2("Veilige uitgangspunten"),
      ul([
        "Mappen: <code>755</code>. Bestanden: <code>644</code>.",
        "wp-config.php en .env: strakker (<code>600</code> of <code>640</code>), nooit wereld-schrijfbaar.",
        "Uploads-map van WordPress: schrijfbaar voor de webserver, niet 777 “voor de zekerheid”.",
      ]),
      h2("In de File Manager"),
      ol([
        "Selecteer bestand of map → Rechten wijzigen / Change Permissions.",
        "Pas het getal of de vinkjes aan. Recursief alleen als je bewust de hele boom wilt.",
        "Test de site en één media-upload.",
      ]),
      warn("777 op de hele public_html is geen oplossing voor een plugin-fout. Zoek de échte schrijfbare map of het user/group-probleem."),
      outro("File Manager; FTP/SFTP; WordPress Toolkit beveiligingsscan."),
    ].join("\n"),

  "tz-pl-wp-toolkit-updates": () =>
    [
      p(
        `<strong>WordPress Toolkit</strong> in Plesk toont core, thema’s en plugins plus een beveiligingsscan. Updates via Toolkit zijn overzichtelijker dan twintig losse WP-adminklikken — maar test ze niet eerst op live als de site omzet draait.`,
      ),
      h2("Updates"),
      ol([
        "Open WordPress in het abonnement (Toolkit-kaart op het domein).",
        "Bekijk beschikbare updates. Kies handmatig of onderhoudsvenster, niet alles blind auto op productie.",
        "Maak eerst een Toolkit-backup of kloon naar staging.",
        "Voer updates uit en klik de homepage, checkout en login na.",
      ]),
      h2("Beveiligingsscan"),
      ul([
        "Draai de scan: wp-debug uit, keys, XML-RPC, admin-user, pingbacks, etc.",
        "Pas “kritiek” toe als je de impact snapt. Sommige hardenings breken plugins (XML-RPC, REST).",
        "Houd WP, PHP-versie en Toolkit zelf bij — een oude core + open XML-RPC is een klassieke combo.",
      ]),
      tip("Smart updates (indien beschikbaar) vergelijken screenshots; ze vervangen geen echte kliktest op formulieren en betaalplugins."),
      outro("WordPress installeren; staging klonen; PHP-versie."),
    ].join("\n"),

  "tz-pl-wp-toolkit-clone": () =>
    [
      p(
        `Toolkit <strong>Klonen</strong> kopieert een WordPress-site naar een ander domein of subdomein en herschrijft URL’s in de database. Dat is betrouwbaarder dan zip + SQL met de hand.`,
      ),
      h2("Stappen"),
      ol([
        "Maak het doel (subdomein of extra domein) aan en wacht tot DNS/SSL klopt.",
        "WordPress Toolkit op de bron → <strong>Klonen</strong>.",
        "Kies het doel. Toolkit maakt database + bestanden aan.",
        "Zet op staging: noindex, andere wachtwoorden, geen live betaalgateway.",
        "Na testen: <strong>Synchroniseren</strong> (data of files) terug naar live — kies bewust wat overschreven mag worden.",
      ]),
      h2("Valkuilen"),
      ul([
        "Cron, object-cache en search-replace van serialized PHP kunnen struikelen; controleer permalinks en WooCommerce-URL’s.",
        "Klonen verdubbelt schijf. Verwijder dode staging-kopieën.",
        "Synchroniseren live ← staging kan bestellingen overschrijven. Sync bij webshops vooral code, niet blindly de database.",
      ]),
      outro("Website kopiëren (niet-WP); backups; phpMyAdmin."),
    ].join("\n"),

  "tz-pl-php-ini": () =>
    [
      p(
        `Per abonnement of domein pas je in Plesk <strong>PHP-instellingen</strong> aan: <code>memory_limit</code>, <code>upload_max_filesize</code>, <code>max_execution_time</code>. Dat is iets anders dan alleen de PHP-versie wisselen.`,
      ),
      h2("Stappen"),
      ol([
        "Websites &amp; Domeinen → <strong>PHP-instellingen</strong> (of Hostinginstellingen → PHP).",
        "Zet memory_limit bijvoorbeeld op 256M of 512M voor zware WP/WooCommerce — niet meteen 2G.",
        "upload_max_filesize én post_max_size moeten allebei groot genoeg zijn (post ≥ upload).",
        "Bewaar. Nieuwe PHP-FPM-workers starten automatisch; een harde restart is zelden nodig.",
      ]),
      h2("Als het niet pakt"),
      ul([
        "Een .user.ini of php.ini in de document root kan Plesk overschrijven of juist genegeerd worden afhankelijk van de handler.",
        "Reseller-plafonds: het service plan kan een maximum zetten dat jij niet mag overschrijden.",
        "Controleer met een phpinfo-bestand in de root (verwijder het daarna) of WP Site Health.",
      ]),
      warn("Onbeperkte execution time verbergt trage queries. Fix de plugin of cron, verhoog niet eindeloos."),
      outro("PHP-versie wijzigen; cronjobs; resourcegebruik."),
    ].join("\n"),

  "tz-pl-cron": () =>
    [
      p(
        `Een <strong>geplande taak</strong> (cron) in Plesk draait een commando of URL op een interval. WordPress-wp-cron in de browser is onbetrouwbaar; een echte cron is stabieler.`,
      ),
      h2("Stappen"),
      ol([
        "Websites &amp; Domeinen → <strong>Geplande taken</strong> (of Scheduled Tasks).",
        "Taak toevoegen: opdracht (CLI, bijvoorbeeld <code>php /pad/naar/wp-cron.php</code>) of URL ophalen.",
        "Kies de PHP-binary die bij de site hoort (zelfde versie als de vhost).",
        "Interval: bij WP meestal elke 5–15 minuten, niet elke minuut zonder reden.",
        "Voer nu uit en bekijk de output; een lege of HTML-foutpagina betekent een verkeerd pad.",
      ]),
      h2("Debug"),
      ul([
        "Dubbele crons (Plesk + wp-cron + plugin) veroorzaken dubbele mails of jobs. Zet <code>DISABLE_WP_CRON</code> als de servercron wp-cron.php aanroept.",
        "Rechten: de taak draait als abonnementsgebruiker, niet als root.",
        "Logs: taakgeschiedenis in Plesk of de mail die cron naar de systeemgebruiker stuurt.",
      ]),
      outro("PHP-instellingen; backups; logfiles."),
    ].join("\n"),

  "tz-pl-backup-fail": () =>
    [
      p(
        `Een <strong>geplande backup</strong> in Plesk faalt vaak door schijf vol, remote FTP die weigert, of een te groot abonnement binnen het venster. De livesite kan ondertussen prima werken — tot je écht moet restoren.`,
      ),
      h2("Checklist"),
      ol([
        "Tools &amp; Settings of abonnement → Backupbeheer → laatst mislukte taak openen (fouttekst).",
        "Schijf en inodes: lokale backup heeft minstens zoveel vrije ruimte als de data.",
        "Remote opslag (FTP/S3): credentials, passieve modus, TLS, quota op de remote.",
        "Uitsluiten van logs, cache en node_modules verkleint de dump.",
        "Overlap: twee full backups tegelijk op dezelfde schijf → plan verspreiden.",
      ]),
      h2("Na een geslaagde run"),
      ul([
        "Download of controleer één archief remote (niet alleen “taak groen”).",
        "Test jaarlijks een restore op een staging-domein.",
      ]),
      warn("TripleZero iT-snapshots op VPS zijn geen vervanging van een Plesk-abonnementbackup als je één site terug wilt zonder de hele VM."),
      outro("Websitebackup maken; één site terugzetten; resourcegebruik."),
    ].join("\n"),

  "tz-pl-restore-one-site": () =>
    [
      p(
        `Plesk kan <strong>één abonnement of domein</strong> terugzetten uit een backup. Kies je per ongeluk de hele server, dan overschrijf je andere klanten of sites. Dat is de duurste klik in Backupbeheer.`,
      ),
      h2("Stappen"),
      ol([
        "Backupbeheer → kies het archief (lokaal of remote).",
        "Herstellen → selecteer alleen het betreffende abonnement/domein, plus of mail/databases meegaan.",
        "Vink niet “alle configuratie” serverbreed aan tenzij je dat bewust wilt.",
        "Bevestig. Wacht tot de taak klaar is; sluit het tabblad niet in paniek.",
        "Test site, SSL en één mailbox. DNS niet wijzigen tijdens restore.",
      ]),
      h2("Partial restore"),
      ul([
        "Alleen bestanden: handig bij gehackte PHP, database blijft.",
        "Alleen database: handig bij kapotte WP na plugin; uploads blijven.",
        "WordPress Toolkit-backup is een extra, kleinere optie naast serverbackup.",
      ]),
      warn("Restore overschrijft live data van het gekozen object. Zet bij twijfel eerst een kopie/staging, of vraag TripleZero iT meekijken."),
      outro("Geplande backups; website kopiëren; phpMyAdmin export."),
    ].join("\n"),

  "tz-pl-plans-vs-subscriptions": () =>
    [
      p(
        `In Plesk is een <strong>service plan</strong> het sjabloon (schijf, PHP, mailboxen, rechten). Een <strong>subscription</strong> (abonnement) is de echte klantomgeving die aan dat plan hangt — of juist ontkoppeld is na een handmatige wijziging.`,
      ),
      h2("Verschil"),
      ul([
        "Plan wijzigen: nieuwe klanten en gekoppelde abonnementen nemen de nieuwe limieten over.",
        "Abonnement “unlocked” / custom: volgt het plan niet meer tot je het opnieuw koppelt.",
        "Add-on plans stapelen extra resources (schijf, sites) bovenop het basisplan.",
      ]),
      h2("Praktijk als reseller"),
      ol([
        "Maak plannen voor je pakketten (Start, Plus, …), niet per klant een uniek plan.",
        "Wijs bij Toevoegen account het juiste plan toe.",
        "Controleer na een upgrade of het abonnement nog synced is met het plan.",
      ]),
      tip("Als één klant “opeens” andere PHP-rechten heeft, staat het abonnement waarschijnlijk unlocked. Dat is geen bug in het plan."),
      outro("Hostingpakket aanmaken; account toevoegen; limieten wijzigen."),
    ].join("\n"),

  "tz-pl-reseller-suspend-limits": () =>
    [
      p(
        `Als reseller schort je een <strong>klantabonnement</strong> op of pas je limieten aan zonder het account te verwijderen. Suspend houdt data; verwijderen niet.`,
      ),
      h2("Opschorten"),
      ol([
        "Abonnementen of Klanten → kies het account.",
        "Onderbreken / Suspend. Sites tonen een onderbrekingspagina; mail kan meegaan afhankelijk van instellingen.",
        "Licht de klant in via jouw kanaal, niet via hun (nu dode) siteformulier.",
        "Activeren herstelt dezelfde document roots en databases.",
      ]),
      h2("Limieten wijzigen"),
      ul([
        "Upgrade door het service plan te wisselen (voorkeur) of tijdelijk custom resources.",
        "Schijf, aantal domeinen, mailboxen en uitgaande berichten per uur zijn de klassieke knoppen.",
        "Custom limieten unlocken het abonnement — documenteer dat intern.",
      ]),
      warn("Verwijder geen klant “om te testen”. Eerst backup, dan suspend, verwijderen alleen bij een afgerond offboardingproces."),
      outro("Service plans vs subscriptions; website suspenden; backups."),
    ].join("\n"),

  "tz-pl-reseller-extensions": () =>
    [
      p(
        `Plesk-extensies (<strong>WordPress Toolkit</strong>, Git, Let’s Encrypt, Imunify, …) zet je als reseller of admin aan per plan of per abonnement. Een klant zonder de extensie ziet de knop simpelweg niet.`,
      ),
      h2("Waar je het zet"),
      ol([
        "Service plans → het plan → tabblad <strong>Permissies</strong> of extra’s: vink WP Toolkit, Git, planning, enz. aan.",
        "Abonnementen die het plan volgen, krijgen de extra’s na opslaan.",
        "Extensions zelf installeren (catalogus) is admin/VPS-werk; op shared Plesk van TripleZero iT staat de set al klaar.",
      ]),
      h2("Veelgebruikte extra’s"),
      ul([
        "Let’s Encrypt: SSL-aanvraag in het klantpanel.",
        "WordPress Toolkit: installeren, klonen, scans.",
        "Git: deploy vanuit een repo naar de document root.",
        "Uit: voorkomt dat klanten serverbrede tools zien die jij niet ondersteunt.",
      ]),
      tip("Minder extensies per plan = minder supportvragen. Zet Git alleen aan bij pakketten waar je deploy-uitleg bij levert."),
      outro("WordPress Toolkit; Let’s Encrypt; service plans."),
    ].join("\n"),
};

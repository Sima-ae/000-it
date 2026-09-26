/**
 * Dutch kennisbank bodies for CyberPanel topics (TripleZero iT).
 * New articles use tz-cp-*; existing cp-* builders stay in build-body.ts.
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
    `Heb je na het volgen van deze stappen nog vragen? Neem contact op met TripleZero iT support via het ticketssysteem. Vermeld hostname, CyberPanel-URL en wat je precies ziet (foutmelding of screenshot).`,
    related
      ? `Gerelateerd: ${related}`
      : `Bekijk ook andere artikelen in CyberPanel over toegang, websites, e-mail, SSL, bestanden en OpenLiteSpeed.`,
  );
}

type Ctx = { title: string; topic: string };

export const cyberpanelTopicBuilders: Record<string, (ctx: Ctx) => string> = {
  "tz-cp-vs-other-panels": () =>
    [
      p(
        `<strong>CyberPanel</strong> is een webcontrolpanel gebouwd rond <strong>OpenLiteSpeed</strong>. Bij TripleZero iT gebruik je het voor websites, SSL, e-mail, databases en WordPress — vergelijkbaar in doel met DirectAdmin of Plesk, maar anders in UI en webserver.`,
      ),
      h2("Belangrijkste verschillen"),
      ul([
        "Webserver: OpenLiteSpeed (vaak met LiteSpeed Cache) i.p.v. Apache/Nginx als standaard.",
        "Panel-URL: meestal poort <code>8090</code>, niet de klassieke DA/Plesk-poorten.",
        "Terminologie: Websites, Child Domains, ACL — niet precies dezelfde labels als DA/Plesk.",
        "E-mail en DNS zitten in CyberPanel, maar DNS kan ook extern (Cloudflare e.d.).",
      ]),
      h2("Wanneer CyberPanel past"),
      ol([
        "Je wilt snelle OLS/LSCache-prestaties voor PHP/WordPress.",
        "Je server is opgeleverd met CyberPanel door TripleZero iT.",
        "Je team kent de CyberPanel-workflows (of wil die leren).",
      ]),
      tip("Volg altijd de CyberPanel-artikelen voor stappen — DirectAdmin-screenshots kloppen hier niet."),
      outro("Eerste stappen na oplevering; inloggen op CyberPanel."),
    ].join("\n"),

  "tz-cp-password-reset": () =>
    [
      p(
        `Een vergeten of gecompromitteerd CyberPanel-wachtwoord reset je <strong>veilig</strong> — niet via onbekende “resetlinks” op het internet.`,
      ),
      h2("Opties"),
      ul([
        "Websitegebruiker: admin kan het wachtwoord resetten in Users / websites.",
        "Admin-account: alleen via servertoegang of TripleZero iT-support (root/SSH), niet via gokken op poort 8090.",
        "Na reset: direct nieuw sterk wachtwoord + bij voorkeur 2FA.",
      ]),
      h2("Checklist na reset"),
      ol([
        "Log uit op alle apparaten waar mogelijk.",
        "Controleer of er geen onbekende ACL-gebruikers zijn aangemaakt.",
        "Controleer recente loginpogingen / firewall-blocks.",
      ]),
      warn("Deel nooit je admin-wachtwoord in chat of e-mail buiten het ticketssysteem."),
      outro("2FA inschakelen; websitegebruikers en ACL."),
    ].join("\n"),

  "tz-cp-2fa": () =>
    [
      p(
        `<strong>Twee-factorauthenticatie (2FA)</strong> in CyberPanel beperkt schade als een wachtwoord uitlekt. Activeer dit vooral op admin-accounts.`,
      ),
      h2("Stappen"),
      ol([
        "Log in op CyberPanel.",
        "Open je gebruikers-/beveiligingsinstellingen (2FA / TOTP).",
        "Scan de QR-code met een authenticator-app.",
        "Sla backupcodes veilig op (wachtwoordmanager).",
        "Test een keer uitloggen en opnieuw inloggen met 2FA.",
      ]),
      tip("Zonder backupcodes kun je jezelf buitensluiten — bewaar ze offline of in een kluis."),
      outro("Wachtwoord resetten; panel bereikbaar houden op 8090."),
    ].join("\n"),

  "tz-cp-users-acl": () =>
    [
      p(
        `Deel geen admin-login voor dagelijks werk. Maak <strong>websitegebruikers</strong> met beperkte ACL zodat elke site alleen eigen resources ziet.`,
      ),
      h2("Praktijk"),
      ul([
        "Admin: serverbreed, alleen voor jou of TripleZero iT-beheer.",
        "Website user: één of meerdere sites, e-mail, databases van die owner.",
        "Geef developers geen root/SSH tenzij strikt nodig.",
      ]),
      h2("Stappen"),
      ol([
        "Maak een gebruiker aan gekoppeld aan de website.",
        "Beperk ACL tot wat nodig is (geen onnodige serverfuncties).",
        "Geef die credentials door i.p.v. admin.",
        "Trek toegang in wanneer een project eindigt.",
      ]),
      outro("Eerste stappen na oplevering; resourcegebruik."),
    ].join("\n"),

  "tz-cp-panel-access": () =>
    [
      p(
        `CyberPanel bereik je meestal via <code>https://hostname:8090</code>. Stabiele toegang vraagt om juiste DNS, open firewallpoorten en geldig panel-SSL.`,
      ),
      h2("Checklist"),
      ul([
        "A/AAAA van de hostname wijst naar de server.",
        "Poort 8090 (TCP) open vanaf jouw IP of via VPN — niet onnodig wereldwijd zonder bescherming.",
        "Panel-SSL (Let’s Encrypt voor hostname) voorkomt browserwaarschuwingen.",
        "Bookmark de URL uit je welkomstmail van TripleZero iT.",
      ]),
      h2("Problemen"),
      ol([
        "Timeout → firewall of verkeerd IP.",
        "Certificaatfout → panel-SSL opnieuw uitgeven of hostname controleren.",
        "502/503 op panel → OpenLiteSpeed/CyberPanel-dienst; check logs of ticket.",
      ]),
      outro("Kan niet inloggen op 8090 / 503; firewall-poorten."),
    ].join("\n"),

  "tz-cp-resource-limits": () =>
    [
      p(
        `In CyberPanel zie je <strong>resourcegebruik</strong> (CPU, RAM, schijf, inodes) en limieten per pakket of website. Zo voorkom je “volle schijf”-verrassingen.`,
      ),
      h2("Wat te monitoren"),
      ul([
        "Schijfruimte en inodes (veel kleine bestanden = WordPress/cache).",
        "Bandbreedte indien getoond in je pakket.",
        "Aantal websites, mailboxen en databases t.o.v. limieten.",
      ]),
      h2("Als je tegen limieten zit"),
      ol([
        "Ruim backups, logs en cache op.",
        "Verwijder ongebruikte staging-sites.",
        "Vraag TripleZero iT om upgrade of schijfuitbreiding via ticket.",
      ]),
      outro("Schijfruimte en inodes; mislukte uploads."),
    ].join("\n"),

  "tz-cp-first-steps-tz": () =>
    [
      p(
        `Na oplevering van een CyberPanel-server bij TripleZero iT volg je een vaste checklist: toegang beveiligen, DNS, eerste site en monitoring.`,
      ),
      h2("Dag 1"),
      ol([
        "Log in via de welkomst-URL; wijzig admin-wachtwoord; zet 2FA aan.",
        "Controleer hostname, panel-SSL en poort 8090.",
        "Maak een websitegebruiker voor dagelijks werk.",
        "Zet nameservers of A-records voor je eerste domein.",
        "Maak de website aan, wacht op DNS, vraag Let’s Encrypt aan.",
      ]),
      h2("Daarna"),
      ul([
        "Plan backups en test één restore-oefening.",
        "Configureer SPF/DKIM als je mail op deze server gebruikt.",
        "Noteer supportcontact en serverlabel in je interne wiki.",
      ]),
      tip("Bewaar credentials alleen in een wachtwoordmanager — niet in gedeelde spreadsheets."),
      outro("Domein toevoegen; backups maken."),
    ].join("\n"),

  "tz-cp-alias-domains": () =>
    [
      p(
        `Een <strong>alias</strong> of parked domain wijst een extra domeinnaam naar dezelfde site-inhoud. Handig voor merkvarianten, niet voor volledig aparte sites.`,
      ),
      h2("Wanneer alias"),
      ul([
        "oldedomein.nl moet meeliften op nieuwdomein.nl.",
        "Je wilt één document root, één CMS.",
      ]),
      h2("Stappen"),
      ol([
        "Zorg dat DNS van het aliasdomein naar de server wijst.",
        "Voeg het alias/parked domain toe in CyberPanel bij de website.",
        "Vraag SSL aan voor het aliasdomein.",
        "Stel canonical/redirect in zodat zoekmachines één voorkeursdomein zien.",
      ]),
      warn("Een echte tweede website = Create Website / child domain, geen alias."),
      outro("WWW canonical; HTTPS forceren."),
    ].join("\n"),

  "tz-cp-document-root": () =>
    [
      p(
        `De <strong>document root</strong> is de map die OpenLiteSpeed als websitestartpunt serveert (vaak <code>public_html</code> onder de websitegebruiker). Verkeerde paden = lege of verkeerde site.`,
      ),
      h2("Begrijpen"),
      ul([
        "Upload index.php / index.html in de document root, niet één map te hoog.",
        "WordPress leeft meestal in public_html of een submap.",
        "Child domains hebben eigen roots onder de parent-structuur.",
      ]),
      h2("Controle"),
      ol([
        "Open File Manager en noteer het pad bij de website.",
        "Vergelijk met wat FTP/SFTP als home toont.",
        "Na migrate: update paden in config (wp-config, .env) indien nodig.",
      ]),
      outro("Deploy naar document root; File Manager."),
    ].join("\n"),

  "tz-cp-delete-site-safe": () =>
    [
      p(
        `Een website of child domain verwijderen in CyberPanel wist vhosts en vaak bestanden/databases. Doe dit alleen met <strong>backup</strong> en een checklist.`,
      ),
      h2("Voor verwijderen"),
      ol([
        "Maak een volledige backup (bestanden + database).",
        "Exporteer e-mail indien die op hetzelfde domein hangt.",
        "Noteer DNS die je later moet aanpassen.",
        "Zet de site eerst op suspend als je nog twijfelt.",
      ]),
      h2("Na verwijderen"),
      ul([
        "Controleer of DNS niet meer naar deze server hoeft.",
        "Ruim restanten in File Manager op als die blijven staan.",
        "Verwijder ongebruikte SSL/mailobjecten.",
      ]),
      warn("Verwijderen is zelden omkeerbaar zonder backup — vraag TripleZero iT bij twijfel."),
      outro("Backups; één website terugzetten."),
    ].join("\n"),

  "tz-cp-www-canonical": () =>
    [
      p(
        `Kies één canonical host (<strong>www</strong> of <strong>non-www</strong>) en forceer de andere via redirect. Zo voorkom je duplicate content en SSL-mismatches.`,
      ),
      h2("Stappen"),
      ol([
        "Zorg dat beide hostnames DNS naar de server hebben (A/AAAA of CNAME).",
        "SSL voor beide hostnames (of wildcard).",
        "Stel redirect in via CyberPanel rewrite/redirect of OLS rules.",
        "Zet canonical in CMS (WordPress-adres) gelijk aan de voorkeur.",
      ]),
      tip("Wijzig niet tegelijk DNS, SSL én canonical zonder te testen — doe het in die volgorde."),
      outro("HTTPS forceren; domein redirects."),
    ].join("\n"),

  "tz-cp-force-https": () =>
    [
      p(
        `Na een geslaagde Let’s Encrypt-uitgifte forceer je <strong>HTTPS</strong> zodat HTTP permanent doorverwijst. Zonder force blijven oude HTTP-links actief.`,
      ),
      h2("In CyberPanel"),
      ol([
        "Bevestig dat SSL voor het domein ‘issued’ is.",
        "Schakel HTTPS redirect / force SSL in bij de website of via rewrite.",
        "Test <code>http://</code> → moet 301/302 naar <code>https://</code> geven.",
        "Controleer mixed content in de browserconsole.",
      ]),
      outro("Mixed content; SSL-vernieuwing faalt."),
    ].join("\n"),

  "tz-cp-multi-sites": () =>
    [
      p(
        `Meerdere websites op één CyberPanel-server is normaal: elk domein krijgt eigen vhost, PHP-versie en idealiter eigen gebruiker.`,
      ),
      h2("Best practices"),
      ul([
        "Eén Create Website per echt project (niet alles onder één user tenzij bewust).",
        "Gescheiden databases en mailboxen per site.",
        "Monitor schijf/inodes — veel sites vullen sneller.",
        "Updates en backups per site plannen.",
      ]),
      h2("Valkuilen"),
      ul([
        "Gedeelde admin-login voor alle klanten.",
        "Eén PHP-versie forceren die niet bij alle CMS’en past.",
        "Vergeten SSL per nieuw domein.",
      ]),
      outro("Websitegebruikers ACL; resourcegebruik."),
    ].join("\n"),

  "tz-cp-suspend-site": () =>
    [
      p(
        `<strong>Suspend</strong> zet een website tijdelijk offline zonder alles te verwijderen — handig bij non-betaling, onderhoud of incidenten.`,
      ),
      h2("Gebruik"),
      ol([
        "Suspend via websitebeheer in CyberPanel.",
        "Controleer of bezoekers een onderhouds-/suspendpagina zien.",
        "E-mail op hetzelfde account kan ook geraakt worden — check beleid.",
        "Unsuspend na herstel; test HTTPS en homepage.",
      ]),
      tip("Voor gepland onderhoud kun je ook een maintenance-plugin in WordPress gebruiken i.p.v. volledige suspend."),
      outro("Verwijderen zonder dataverlies; backups."),
    ].join("\n"),

  "tz-cp-deploy-docroot": () =>
    [
      p(
        `Deploy naar de document root kan via <strong>File Manager</strong>, zip-upload, FTP/SFTP of Git. Kies de methode die past bij bestandsgrootte en frequentie.`,
      ),
      h2("Methoden"),
      ul([
        "Kleine wijzigingen: File Manager of SFTP.",
        "Volledige release: zip uploaden en uitpakken in public_html.",
        "DevOps: Git pull op de server (SSH) als TripleZero iT dat toestaat.",
      ]),
      h2("Veilig deployen"),
      ol([
        "Backup vóór overwrite.",
        "Upload eerst naar een staging-map, test, verplaats daarna.",
        "Zet juiste rechten na uitpakken.",
        "Leeg OLS/LSCache indien nodig.",
      ]),
      outro("Grote zip uitpakken; document root."),
    ].join("\n"),

  "tz-cp-spf-dkim-dmarc": () =>
    [
      p(
        `Zonder <strong>SPF, DKIM en DMARC</strong> belandt CyberPanel-mail sneller in spam. Stel records in vanuit het panel of kopieer ze naar externe DNS.`,
      ),
      h2("Stappen"),
      ol([
        "Genereer/activeer DKIM voor het domein in CyberPanel.",
        "Zet SPF (include van jouw mailhost) als TXT.",
        "Voeg DMARC toe (start met p=none, monitor, daarna aanscherpen).",
        "Wacht op DNS-propagatie; test met externe checkers.",
      ]),
      warn("Beheer je DNS bij Cloudflare/registrar: plak de records daar — niet alleen in een ongebruikte CyberPanel-zone."),
      outro("MX-records; nameservers vs externe DNS."),
    ].join("\n"),

  "tz-cp-webmail": () =>
    [
      p(
        `Webmail in CyberPanel (vaak Rainloop/SnappyMail of vergelijkbaar) opent via een webmail-URL. Inlogproblemen zijn meestal wachtwoord, SSL of mailboxstatus.`,
      ),
      h2("Checklist"),
      ul([
        "Juiste webmail-URL uit welkomstmail of panel.",
        "Volledig e-mailadres als gebruikersnaam.",
        "Mailbox niet over quota / niet disabled.",
        "Browsercache of privévenster bij rare redirects.",
      ]),
      h2("Blijft het mislukken"),
      ol([
        "Reset mailboxwachtwoord in CyberPanel.",
        "Test IMAP in een desktopclient met dezelfde credentials.",
        "Controleer SSL voor mail/webmail.",
        "Open een ticket met fouttekst en tijdstip.",
      ]),
      outro("Mailboxquota; SSL voor webmail."),
    ].join("\n"),

  "tz-cp-mail-forwarders": () =>
    [
      p(
        `<strong>Forwarders en aliases</strong> sturen mail door zonder volle mailbox — handig voor info@ → persoonlijke inbox.`,
      ),
      h2("Aanmaken"),
      ol([
        "Ga naar Email → Forwarders / Aliases.",
        "Kies bronadres op jouw domein.",
        "Vul bestemmingsadres in (intern of extern).",
        "Test met een mail van een extern account.",
      ]),
      tip("Combineer forwarders spaarzaam met catch-all — dat vergroot spamrisico."),
      outro("Catch-all; SPF/DKIM."),
    ].join("\n"),

  "tz-cp-mailbox-quota": () =>
    [
      p(
        `Een <strong>volle mailbox</strong> weigert nieuwe mail. In CyberPanel verhoog je quota of ruim je op.`,
      ),
      h2("Oplossen"),
      ol([
        "Bekijk quota per mailbox in Email-beheer.",
        "Verwijder grote bijlagen / oude mappen via webmail of IMAP.",
        "Verhoog quota binnen pakketlimieten.",
        "Informeer gebruikers bij structureel tekort — of upgrade.",
      ]),
      outro("Uitgaande mail queue; resourcegebruik."),
    ].join("\n"),

  "tz-cp-mail-queue": () =>
    [
      p(
        `Komt uitgaande mail niet aan, kijk naar de <strong>mailqueue</strong>, SMTP-authenticatie, DNS (SPF/DKIM) en of poort 25/587 geblokkeerd is.`,
      ),
      h2("Checks"),
      ul([
        "Verstuur via webmail én via SMTP-client (poort 587 + auth).",
        "Controleer bounce-meldingen en queue in CyberPanel/servermail.",
        "SPF/DKIM/DMARC en MX kloppen voor het From-domein.",
        "Geen IP-reputatieblokkade (recente spam/compromis).",
      ]),
      h2("Actie"),
      ol([
        "Reset wachtwoord bij vermoeden van misbruik.",
        "Pauzeer verdachte scripts/plugins die mail sturen.",
        "Ticket bij TripleZero iT met Message-ID en tijdstip.",
      ]),
      outro("SPF/DKIM/DMARC; brute-force/malware."),
    ].join("\n"),

  "tz-cp-catchall": () =>
    [
      p(
        `Een <strong>catch-all</strong> vangt alle onbekende adressen @jouwdomein. Handig zelden — meestal een spammagneet.`,
      ),
      h2("Wanneer wel"),
      ul([
        "Tijdelijke migratie waarbij oude adressen nog aankomen.",
        "Zeer gecontroleerde interne domeinen.",
      ]),
      h2("Wanneer niet"),
      ul([
        "Publieke marketingdomeinen.",
        "Als je al last hebt van spam/backscatter.",
      ]),
      tip("Gebruik liever expliciete aliases/forwarders voor bekende adressen."),
      outro("Forwarders; mailboxquota."),
    ].join("\n"),

  "tz-cp-nameservers": () =>
    [
      p(
        `Je kunt DNS op <strong>CyberPanel-nameservers</strong> laten draaien of bij een externe provider. Kies één bron van waarheid — nooit half-half zonder plan.`,
      ),
      h2("CyberPanel NS"),
      ul([
        "Zones beheer je in het panel (PowerDNS).",
        "Geschikt als TripleZero iT NS heeft geleverd en je alles centraal wilt.",
      ]),
      h2("Externe DNS"),
      ul([
        "Cloudflare/registrar blijft authoritative.",
        "Kopieer A/AAAA/MX/TXT/DKIM handmatig vanuit CyberPanel-hints.",
        "LE-validatie moet het juiste A-record raken.",
      ]),
      warn("Wissel niet van nameservers tijdens actieve SSL- of mailproblemen zonder checklist."),
      outro("DNS-propagatie; MX-records."),
    ].join("\n"),

  "tz-cp-mx-records": () =>
    [
      p(
        `<strong>MX-records</strong> bepalen waar mail voor je domein naartoe gaat. Verkeerde MX = mail bij de verkeerde host of complete stilte.`,
      ),
      h2("Stappen"),
      ol([
        "Bepaal of mail op deze CyberPanel-server hoort of bij Microsoft 365/Google.",
        "Zet MX op de juiste prioriteit en hostnaam.",
        "Voeg SPF passend bij die keuze toe.",
        "Test met externe MX-lookup en stuur een proefmail.",
      ]),
      tip("Bij mix (web op CP, mail extern) mogen MX níet naar de webserver wijzen."),
      outro("SPF/DKIM; nameservers."),
    ].join("\n"),

  "tz-cp-dns-propagation": () =>
    [
      p(
        `Na DNS-wijzigingen in CyberPanel of elders duurt <strong>propagatie</strong> tot TTL verlopen is. Test vanaf meerdere resolvers voordat je SSL forceert.`,
      ),
      h2("Controle"),
      ul([
        "Gebruik dig/nslookup tegen 1.1.1.1 en 8.8.8.8.",
        "Vergelijk met wat CyberPanel/zone toont.",
        "Controleer zowel apex (@) als www.",
      ]),
      h2("Tips"),
      ol([
        "Verlaag TTL vóór een geplande migratie.",
        "Wacht na NS-wijziging langer dan na één A-record.",
        "Vraag LE pas aan als publieke lookup het nieuwe IP toont.",
      ]),
      outro("SSL-vernieuwing faalt; domein toevoegen."),
    ].join("\n"),

  "tz-cp-ssl-renew-fail": () =>
    [
      p(
        `Let’s Encrypt-<strong>vernieuwing</strong> faalt meestal door DNS, poort 80, verkeerde vhost of rate limits — niet door “SSL is kapot”.`,
      ),
      h2("Oorzaken"),
      ul([
        "A-record wijst niet (meer) naar deze server.",
        "HTTP-01 challenge geblokkeerd (firewall, redirect-loop, maintenance).",
        "Domein verwijderd/suspended in CyberPanel.",
        "Te veel mislukte pogingen (LE rate limit).",
      ]),
      h2("Oplossen"),
      ol([
        "Fix DNS en bereikbaarheid op poort 80/443.",
        "Force HTTPS tijdelijk uit tijdens challenge indien nodig.",
        "Issue opnieuw in SSL-menu; lees de fouttekst.",
        "Ticket met volledige LE-fout als het blijft misgaan.",
      ]),
      outro("Wildcard LE; panel-SSL op 8090."),
    ].join("\n"),

  "tz-cp-ssl-wildcard": () =>
    [
      p(
        `Een <strong>wildcard</strong> Let’s Encrypt (<code>*.domein.nl</code>) dekt subdomeinen, maar vraagt vaak DNS-01 (TXT) i.p.v. alleen HTTP-validatie.`,
      ),
      h2("Aandachtspunten"),
      ul([
        "Je moet een TXT-record kunnen zetten op de authoritative DNS.",
        "Apex (+ www) heeft alsnog aparte dekking of apart cert.",
        "Automatische vernieuwing moet DNS-API of handmatige TXT aankunnen.",
      ]),
      h2("Praktijk bij TripleZero iT"),
      ol([
        "Controleer of jouw CyberPanel-build wildcard/DNS-01 ondersteunt.",
        "Zet de gevraagde TXT, wacht op propagatie, voltooi issue.",
        "Test een willekeurig subdomein op HTTPS.",
      ]),
      outro("Custom SSL; subdomeinen."),
    ].join("\n"),

  "tz-cp-ssl-custom": () =>
    [
      p(
        `Voor OV/EV of corporate certs <strong>upload</strong> je certificate + private key (+ chain) in CyberPanel in plaats van Let’s Encrypt.`,
      ),
      h2("Stappen"),
      ol([
        "Genereer CSR indien de CA dat eist (of gebruik geleverde key).",
        "Ontvang certificaat en intermediate/chain.",
        "Upload in SSL → custom / hostname selecteren.",
        "Herlaad OpenLiteSpeed indien nodig; test SSL Labs of browser.",
      ]),
      warn("Plak nooit private keys in tickets of chat — gebruik beveiligd uploadkanaal."),
      outro("SSL voor mail; HTTPS forceren."),
    ].join("\n"),

  "tz-cp-ssl-mail": () =>
    [
      p(
        `Webmail en IMAP/SMTP hebben <strong>geldig SSL</strong> nodig op de mailhostnaam (vaak serverhostname of mail.domein.nl).`,
      ),
      h2("Checklist"),
      ul([
        "DNS van mailhost wijst naar de server.",
        "Certificaat dekt die exacte hostname.",
        "Clients gebruiken SSL/TLS op 993/465 of STARTTLS op 587.",
      ]),
      tip("Mismatch ‘certificate for andere naam’ → verkeerde host in de client of ontbrekend cert."),
      outro("Webmail; Let’s Encrypt installeren."),
    ].join("\n"),

  "tz-cp-mixed-content": () =>
    [
      p(
        `Na HTTPS blijven <strong>mixed content</strong>-waarschuwingen als CSS/JS/afbeeldingen hard gecodeerd als <code>http://</code> staan.`,
      ),
      h2("Oplossen"),
      ol([
        "Force HTTPS op serverniveau.",
        "Zet site-URL in CMS naar https.",
        "Zoek/vervang http-assets in database (voorzichtig, met backup).",
        "Controleer CDN/externe embeds op https.",
      ]),
      outro("HTTPS forceren; LiteSpeed Cache."),
    ].join("\n"),

  "tz-cp-firewall-ports": () =>
    [
      p(
        `Firewallregels in CyberPanel (CSF/vergelijkbaar) openen poorten voor web, mail en panel — <strong>niet</strong> alles “ALLOW ALL”.`,
      ),
      h2("Veilig openen"),
      ul([
        "80/443 voor websites.",
        "8090 voor panel — bij voorkeur beperkt tot kantoor-IP’s.",
        "21/22 of SFTP alleen als nodig; 22 met key-auth.",
        "Mailpoorten 25/465/587/993 volgens je mailgebruik.",
      ]),
      h2("Procedure"),
      ol([
        "Noteer waarom je een poort opent.",
        "Open alleen TCP/UDP die nodig is.",
        "Test de dienst; herlaad firewall.",
        "Sluit tijdelijke poorten weer.",
      ]),
      outro("Brute-force; 8090-toegang."),
    ].join("\n"),

  "tz-cp-modsec-false-positive": () =>
    [
      p(
        `<strong>ModSecurity</strong> kan legitieme admin-acties (WP-admin, API’s) blokkeren. Schakel regels gericht uit — niet de hele WAF permanent.`,
      ),
      h2("Aanpak"),
      ol([
        "Lees de ModSec/audit-log: welke rule-ID?",
        "Reproduceer het request.",
        "Disable die rule voor die vhost/tijdelijk.",
        "Test opnieuw; documenteer de uitzondering.",
      ]),
      warn("Hele ModSecurity uitzetten is een noodmaatregel, geen standaard."),
      outro("Firewall; malware-check."),
    ].join("\n"),

  "tz-cp-bruteforce": () =>
    [
      p(
        `CyberPanel/firewall blokkeert vaak <strong>brute-force</strong> op wp-login en panel-logins. Zie je jezelf geblokkeerd, whitelist je IP in plaats van de bescherming uit te zetten.`,
      ),
      h2("Signalen"),
      ul([
        "Tijdelijke ban na veel foute logins.",
        "Hoge 404/401 in logs op wp-login.php / xmlrpc.php.",
      ]),
      h2("Maatregelen"),
      ol([
        "Sterke wachtwoorden + 2FA op panel.",
        "Beperk xmlrpc / gebruik login-hardening in WordPress.",
        "Whitelist kantoor-IP’s in firewall.",
        "Scan op malware bij succesvolle verdachte logins.",
      ]),
      outro("2FA; malware; ModSecurity."),
    ].join("\n"),

  "tz-cp-malware": () =>
    [
      p(
        `Verdachte PHP-files, spamzenders of vreemde cronjobs wijzen op <strong>compromittering</strong>. Isoleren → backup van clean state → herstel.`,
      ),
      h2("Eerste respons"),
      ol([
        "Suspend of maintenance als de site actief misbruikt wordt.",
        "Wijzig alle wachtwoorden (panel, FTP, WP-admin, database).",
        "Inspecteer recent gewijzigde bestanden in File Manager.",
        "Herstel core/CMS vanuit schone bron + database-check.",
        "Draai opnieuw SSL/mail-checks; monitor queue.",
      ]),
      tip(`Bij twijfel: ticket bij TripleZero iT — stuur geen malware-zips naar willekeurige inboxen.`),
      outro("Backups; brute-force; CHMOD."),
    ].join("\n"),

  "tz-cp-phpmyadmin": () =>
    [
      p(
        `<strong>phpMyAdmin</strong> in CyberPanel laat je databases bekijken, importeren en exporteren. Werk altijd met backups bij destructieve queries.`,
      ),
      h2("Stappen"),
      ol([
        "Open Databases → phpMyAdmin (of de knop bij de DB).",
        "Selecteer de database van de website.",
        "Export: SQL-dump downloaden vóór grote wijzigingen.",
        "Import: .sql uploaden; let op max upload size.",
      ]),
      warn("Drop table / lege database = site down. Geen experimenten op productie zonder restoreplan."),
      outro("Databasegebruikers; DB-only backup."),
    ].join("\n"),

  "tz-cp-mysql-users-remote": () =>
    [
      p(
        `Databasegebruikers in CyberPanel hebben rechten op specifieke DB’s. <strong>Remote MySQL</strong> open je alleen met IP-restrictie — nooit % voor productie zonder noodzaak.`,
      ),
      h2("Lokaal"),
      ul([
        "App verbindt meestal naar localhost / 127.0.0.1.",
        "Gebruiker alleen grants op eigen database.",
      ]),
      h2("Remote"),
      ol([
        "Sta remote host toe voor één kantoor-IP.",
        "Gebruik sterke wachtwoorden en TLS indien beschikbaar.",
        "Sluit remote weer na de taak.",
      ]),
      outro("phpMyAdmin; firewall-poorten."),
    ].join("\n"),

  "tz-cp-disk-inodes": () =>
    [
      p(
        `Uploads falen vaak door volle <strong>schijf</strong> of <strong>inode</strong>-limiet (te veel kleine bestanden), niet door een “kapotte” File Manager.`,
      ),
      h2("Diagnose"),
      ul([
        "Bekijk disk/inode-gebruik in CyberPanel of resource-overzicht.",
        "Typische boosdoeners: cache, backups, mail, node_modules, oude logs.",
      ]),
      h2("Opruimen"),
      ol([
        "Verwijder oude backupsets die je niet meer nodig hebt.",
        "Leeg caches (LSCache, CMS-cache).",
        "Ruim spammailboxen op.",
        "Vraag upgrade bij structureel tekort.",
      ]),
      outro("Resourcegebruik; grote zip; mislukte uploads."),
    ].join("\n"),

  "tz-cp-chmod": () =>
    [
      p(
        `Via File Manager zet je <strong>CHMOD</strong>. Te open rechten (777) zijn een securityrisico; te strak maakt uploads kapot.`,
      ),
      h2("Richtlijnen"),
      ul([
        "Mappen vaak 755; bestanden 644.",
        "wp-config.php strakker (bijv. 600) indien van toepassing.",
        "Geen 777 op hele trees “om het even te fixen”.",
      ]),
      h2("Procedure"),
      ol([
        "Selecteer bestand/map in File Manager.",
        "Pas rechten toe; test de functie (upload, plugin-install).",
        "Documenteer afwijkingen.",
      ]),
      outro("Malware; File Manager; SFTP."),
    ].join("\n"),

  "tz-cp-unzip-large": () =>
    [
      p(
        `Grote zip-archieven in CyberPanel kunnen <strong>timeouts</strong> geven. Splitten, SFTP of CLI is dan betrouwbaarder.`,
      ),
      h2("Aanpak"),
      ol([
        "Upload via SFTP i.p.v. browser als de zip groot is.",
        "Pak uit in File Manager; bij timeout: kleinere archieven.",
        "Controleer schijfruimte vóór uitpakken (zip + unpacked).",
        "Zet rechten na extract.",
      ]),
      tip("Vermijd het uitpakken van complete node_modules-zips op shared resources."),
      outro("Deploy docroot; disk/inodes."),
    ].join("\n"),

  "tz-cp-wp-reinstall": () =>
    [
      p(
        `WordPress via CyberPanel <strong>herstellen</strong> kan zonder meteen content te wissen: core-bestanden vernieuwen, database behouden, of schone install naast backup.`,
      ),
      h2("Scenario’s"),
      ul([
        "Core corrupt: herstel WP-files, houd wp-content + DB.",
        "Gehackt: clean core + scan plugins/themes + DB-cleanup.",
        "Kapotte install: restore backup i.p.v. opnieuw “Install WordPress” over live data.",
      ]),
      h2("Veilige volgorde"),
      ol([
        "Volledige backup (files + DB).",
        "Noteer table-prefix en wp-config credentials.",
        "Herstel of herinstalleer volgens scenario.",
        "Log in, permalinks opslaan, cache legen.",
      ]),
      warn("‘Install WordPress’ over een bestaande map kan wp-config/content overschrijven — lees de installeropties."),
      outro("WordPress installeren; malware; restore één site."),
    ].join("\n"),

  "tz-cp-sftp-keys": () =>
    [
      p(
        `<strong>SFTP met sleutels</strong> is veiliger dan wachtwoord-FTP. Gebruik SFTP waar mogelijk; beperk plain FTP.`,
      ),
      h2("Stappen"),
      ol([
        "Maak/gebruik een FTP-account in CyberPanel met juiste home (docroot).",
        "Genereer een SSH-key pair lokaal.",
        "Plaats de public key volgens serverbeleid (authorized_keys) of vraag TripleZero iT.",
        "Verbind met FileZilla/VS Code via SFTP (poort 22).",
      ]),
      tip("Schakel anonieme FTP nooit in; sluit poort 21 als je alleen SFTP gebruikt."),
      outro("FTP/SFTP instellen; firewall-poorten."),
    ].join("\n"),

  "tz-cp-db-backup-only": () =>
    [
      p(
        `Soms wil je alleen de <strong>database</strong> veiligstellen (sneller dan een volle sitebackup) vóór contentwijzigingen.`,
      ),
      h2("Methodes"),
      ul([
        "Export via phpMyAdmin (SQL).",
        "Database-onderdeel van CyberPanel-backup indien selectief beschikbaar.",
        "CLI mysqldump via SSH als je managed toegang hebt.",
      ]),
      h2("Goede gewoonte"),
      ol([
        "Dump downloaden en off-site bewaren.",
        "Bestandsbackup apart plannen — DB alleen dekt geen uploads.",
        "Test af en toe een import op staging.",
      ]),
      outro("phpMyAdmin; geplande backups; restore één site."),
    ].join("\n"),

  "tz-cp-lscache": () =>
    [
      p(
        `<strong>LiteSpeed Cache</strong> (LSCache) werkt optimaal op OpenLiteSpeed/CyberPanel en versnelt WordPress sterk als correct geconfigureerd.`,
      ),
      h2("Activeren"),
      ol([
        "Installeer de LiteSpeed Cache-plugin in WordPress.",
        "Bevestig dat de server OLS/LSWS is (CyberPanel standaard).",
        "Schakel page cache in; start met defaults.",
        "Sluit winkelwagen/account-pagina’s uit indien WooCommerce.",
        "Purge cache na deploy.",
      ]),
      tip("Bij rare layout na login: cache-variaties / exclude logged-in users controleren."),
      outro("OpenLiteSpeed basics; rewrite/htaccess."),
    ].join("\n"),

  "tz-cp-rewrite-htaccess": () =>
    [
      p(
        `OpenLiteSpeed leest veel <strong>.htaccess</strong>-rewrite regels, maar niet alles 1-op-1 zoals Apache. Test permalinks en custom redirects na wijzigingen.`,
      ),
      h2("Praktijk"),
      ul([
        "WordPress-permalinks: sla opnieuw op onder Instellingen → Permalinks.",
        "Complexere Apache-only directives kunnen in OLS context/rewrite horen.",
        "Redirects liever centraal (CyberPanel redirect) dan rommelige htaccess-stapels.",
      ]),
      h2("Debug"),
      ol([
        "Reproduceer 404 vs redirect-loop.",
        "Bekijk error-log van de vhost.",
        "Tijdelijk vereenvoudig .htaccess om de boosdoener te vinden.",
      ]),
      outro("Logs; OLS herstarten; domein redirects."),
    ].join("\n"),

  "tz-cp-ols-restart": () =>
    [
      p(
        `Na config- of SSL-wijzigingen kan een <strong>graceful restart</strong> van OpenLiteSpeed nodig zijn. Doe dit gecontroleerd — niet als paniekreflex bij elke 404.`,
      ),
      h2("Wanneer"),
      ul([
        "Nieuwe SSL werkt niet tot reload.",
        "Listener/vhost-config gewijzigd.",
        "Support vraagt om graceful restart na fix.",
      ]),
      h2("Hoe"),
      ol([
        "Gebruik de restart/reload-optie in CyberPanel indien aanwezig.",
        "Of vraag TripleZero iT om graceful restart via ticket.",
        "Test homepage + panel URL daarna.",
      ]),
      warn("Hard kill van processen zonder graceful kan actieve requests afbreken."),
      outro("503/508; logs."),
    ].join("\n"),

  "tz-cp-logs": () =>
    [
      p(
        `Error- en access-logs in CyberPanel/OLS vertellen waarom een site 500 geeft of welke IP brute-forcet. Zoek op tijdstip van het incident.`,
      ),
      h2("Vinden"),
      ul([
        "Website → Logs / Error Log in CyberPanel.",
        "File Manager: logpaden onder de vhost indien getoond.",
        "PHP errors vs OLS errors onderscheiden.",
      ]),
      h2("Lezen"),
      ol([
        "Filter op timestamp rond de fout.",
        "Noteer rule-ID (ModSec) of PHP stacktrace.",
        "Voeg relevante regels toe aan je supportticket.",
      ]),
      outro("ModSecurity; 503/508; PHP-extensies."),
    ].join("\n"),

  "tz-cp-php-ext-ini": () =>
    [
      p(
        `Per website kies je in CyberPanel niet alleen de <strong>PHP-versie</strong>, maar vaak ook extensies en php.ini-waarden (memory_limit, upload_max_filesize).`,
      ),
      h2("Stappen"),
      ol([
        "Open de PHP-instellingen van de website.",
        "Schakel benodigde extensies in (bijv. intl, imagick) — niet alles blind.",
        "Verhoog upload/memory alleen zoveel als nodig.",
        "Test de applicatie; check error-log bij fatal errors.",
      ]),
      tip("Na PHP-upgrade: controleer deprecated plugins vóór je memory eindeloos verhoogt."),
      outro("PHP-versie wijzigen; cron debug."),
    ].join("\n"),

  "tz-cp-cron-debug": () =>
    [
      p(
        `Een cronjob die <strong>faalt of dubbel draait</strong> veroorzaakt dubbele mails, locks of lege jobs. Debug met schema, user en output-logging.`,
      ),
      h2("Checklist"),
      ul([
        "Juiste schedule (minuten/uren) en timezone.",
        "Pad naar PHP-binary komt overeen met site-PHP.",
        "Geen dubbele WP-cron + server-cron zonder disable WP-Cron.",
        "Schrijf output naar een logbestand voor fouten.",
      ]),
      h2("Actie"),
      ol([
        "Draai het commando handmatig via SSH/terminal indien beschikbaar.",
        "Vergelijk met CyberPanel Cron-lijst — verwijder duplicaten.",
        "Fix rechten op scripts.",
      ]),
      outro("Cronjobs instellen; logs."),
    ].join("\n"),

  "tz-cp-backup-fail": () =>
    [
      p(
        `Geplande backups in CyberPanel falen door schijfruimte, permissies, timeouts of volle remote targets. Gebruik een vaste checklist.`,
      ),
      h2("Checklist"),
      ol([
        "Vrije schijf/inodes voldoende voor de backupset.",
        "Backupjob nog enabled en schedule correct.",
        "Bestemmingspad schrijfbaar (lokaal/remote).",
        "Geen overlapping van te zware jobs op hetzelfde tijdstip.",
        "Lees de backup-log/foutmelding letterlijk.",
      ]),
      tip("Test maandelijks een restore — een groene ‘success’ zonder restoretest is schijnzekerheid."),
      outro("Restore één site; disk/inodes; backups maken."),
    ].join("\n"),

  "tz-cp-restore-one-site": () =>
    [
      p(
        `Zet <strong>één website</strong> terug zonder andere vhosts te overschrijven: selectieve restore van files + database van die owner.`,
      ),
      h2("Stappen"),
      ol([
        "Identificeer de juiste backupset (datum + sitenaam).",
        "Suspend of maintenance op die site tijdens restore.",
        "Restore alleen die website/user — niet ‘hele server’ tenzij bedoeld.",
        "Importeer bijbehorende database.",
        "Test HTTPS, login en kritieke formulieren.",
      ]),
      warn("Verkeerde backup over de verkeerde user is destructief — dubbelcheck namen."),
      outro("Backups maken; delete site safe; DB-only backup."),
    ].join("\n"),

  "tz-cp-8090-503": () =>
    [
      p(
        `Niet kunnen inloggen op <strong>poort 8090</strong> of <strong>503/508</strong> op OpenLiteSpeed wijst op firewall, SSL, resource limits of vastgelopen workers — zelden “het internet ligt plat”.`,
      ),
      h2("Poort 8090"),
      ul([
        "Juiste hostname/IP en https://",
        "Firewall staat 8090 toe vanaf jouw IP.",
        "Panel-dienst draait; panel-SSL niet kapot in een redirect-lus.",
      ]),
      h2("503 / 508"),
      ul([
        "Tijdelijke overbelasting of connection limit.",
        "Vastgelopen PHP/OLS workers — graceful restart.",
        "Schijf vol → schrijven faalt.",
        "ModSec/firewall die requests droppen.",
      ]),
      h2("Actie"),
      ol([
        "Check resourcegebruik en logs op tijdstip.",
        "Test site vanaf ander netwerk/IP.",
        "Graceful OLS-restart indien veilig.",
        "Ticket bij TripleZero iT met URL, tijdstip en foutcode.",
      ]),
      outro("Panel-toegang; OLS herstarten; firewall; logs."),
    ].join("\n"),
};

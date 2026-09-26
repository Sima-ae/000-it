/**
 * Original TripleZero iT kennisbank bodies for topics that existed at a
 * competitor knowledge base but were missing here. Written in our own words —
 * never a verbatim copy, never competitor brand names.
 */
const BRAND = "TripleZero iT";

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
  return `<aside class="kb-callout kb-callout-tip"><p><strong>Tip:</strong> ${t}</p></aside>`;
}
function warn(t: string) {
  return `<aside class="kb-callout kb-callout-warn"><p><strong>Let op:</strong> ${t}</p></aside>`;
}
function outro(related?: string) {
  return p(
    `Kom je er na deze stappen niet uit? Open een ticket bij TripleZero iT via het klantenpanel. Vermeld je domeinnaam of VPS-hostname, het tijdstip en wat je al geprobeerd hebt.`,
    related
      ? `Gerelateerd: ${related}`
      : `Bekijk ook andere handleidingen in deze kennisbank over hosting, e-mail, DNS en beveiliging.`,
  );
}

function intro(title: string, lead: string, extra?: string) {
  return p(
    `In deze handleiding van TripleZero iT behandelen we <strong>${title}</strong>. ${lead}`,
    extra ||
      `We schrijven vanuit de werkwijze in ons klantenpanel en de control panels die bij jouw pakket horen (DirectAdmin, CyberPanel of Plesk). Volg de stappen in volgorde en test na elke wijziging.`,
  );
}

function familyFromTopic(topic: string) {
  const parts = topic.split("-");
  return parts[1] || "host";
}

function keywordBlocks(title: string, topic: string): string[] {
  const lower = `${title} ${topic}`.toLowerCase();
  const blocks: string[] = [];

  if (/\brdp\b|remote desktop/.test(lower)) {
    blocks.push(
      h2("RDP in het kort"),
      p(
        `Remote Desktop Protocol is de standaard manier om een Windows-VPS grafisch te bedienen. Je verbindt vanaf je computer met het publieke IP van de server op poort 3389 (of een door jou gewijzigde poort).`,
        `Gebruik bij voorkeur een sterk administratorwachtwoord, beperk RDP tot jouw IP via de firewall en overweeg een VPN als je vaak vanaf wisselende netwerken werkt.`,
      ),
      ol([
        "Noteer het IPv4-adres van de VPS in het klantenpanel.",
        "Open op Windows ‘Verbinding met extern bureaublad’ (mstsc). Op Mac gebruik je Microsoft Remote Desktop.",
        "Vul het IP in, kies de gebruiker (vaak Administrator) en het wachtwoord uit je welkomstmail.",
        "Accepteer het certificaat/waarschuwing de eerste keer als de naam niet overeenkomt met een publiek certificaat.",
        "Controleer in Windows Firewall dat RDP is toegestaan en dat de VPS niet in ‘sleep’ staat.",
      ]),
      warn(
        "Zet RDP nooit wagenwijd open naar de hele wereld zonder extra beveiliging. Brute-force op poort 3389 is dagelijkse kost.",
      ),
    );
  }
  if (/\bssh\b|rsa keys|console|novnc/.test(lower)) {
    blocks.push(
      h2("Toegang tot de server"),
      p(
        `Op Linux werk je meestal via SSH (poort 22) of via de browserconsole in het klantenpanel. De console is bedoeld voor noodgevallen: netwerk stuk, SSH-configuratie fout, of rootwachtwoord resetten.`,
        `Sleutels (ed25519 of RSA) zijn veiliger dan wachtwoorden. Zet wachtwoordlogin uit zodra je sleutel werkt.`,
      ),
    );
  }
  if (/snapshot|back-?up|acronis/.test(lower)) {
    blocks.push(
      h2("Back-ups en terugzetten"),
      p(
        `Een snapshot is een momentopname van de schijf van je VPS; een hostingbackup is meestal een kopie van websitebestanden, databases en e-mail. Kies de methode die bij het product past.`,
        `Zet nooit een oude backup terug over een live shop zonder eerst een verse kopie te maken. Test herstel op een subdomein of staging waar dat kan.`,
      ),
    );
  }
  if (/fail2ban|centos|firewall|brute.?force|ddos/.test(lower)) {
    blocks.push(
      h2("Aanvalsvlak verkleinen"),
      p(
        `Beperk open poorten tot wat je écht nodig hebt, houd het besturingssysteem bijgewerkt en monitor auth-logs. Fail2Ban blokkeert herhaalde mislukte logins automatisch.`,
        `DDoS-mitigatie op netwerkniveau zit bij TripleZero iT op de infrastructuur; applicatie-DDoS (trage requests, XML-RPC, login-spam) moet je in de website of WAF aanpakken.`,
      ),
    );
  }
  if (/iis|windows vps|application pool|bindings|mssql|web.config/.test(lower)) {
    blocks.push(
      h2("Windows-server aandachtspunten"),
      p(
        `Op Windows regel je sites in IIS: een site, een application pool (identiteit en .NET/PHP-versie) en bindings (hostname + poort 80/443). Verkeerde bindings zijn de nummer-één reden dat “de site niet opent”.`,
        `MSSQL Express is geschikt voor kleinere databases; plan schijf- en geheugengebruik en maak SQL-backups los van de VPS-snapshot.`,
      ),
    );
  }
  if (/exchange|microsoft 365|office 365|outlook web|owa|tenant|teams|onedrive/.test(lower)) {
    blocks.push(
      h2("Microsoft 365 in combinatie met je domein"),
      p(
        `Koppel je domein in het Microsoft-beheercentrum en zet de MX-, SPF-, DKIM- en autodiscover-records in DNS bij TripleZero iT. Zolang MX nog naar onze mailservers wijst, blijft mail in de oude mailbox binnenkomen.`,
        `Licenties, gebruikers en gedeelde postvakken beheer je in Microsoft; facturatie en koppeling van het abonnement lopen via je TripleZero iT-klantenpanel als je het product bij ons afneemt.`,
      ),
    );
  }
  if (/\bssl\b|https|hsts|csr|sha2|let.?s encrypt/.test(lower)) {
    blocks.push(
      h2("Certificaatketen controleren"),
      p(
        `Een geldig certificaat dekt de hostnamen die bezoekers intypen (apex én www, plus eventuele subdomeinen). Forceer HTTPS en HSTS pas als de keten klopt in de browser en via een SSL-check.`,
        `Let’s Encrypt vernieuwt automatisch in DirectAdmin, CyberPanel en Plesk zolang poort 80 bereikbaar is. Een CSR gebruik je voor betaalde OV/EV-certificaten.`,
      ),
    );
  }
  if (/\b(a record|aaaa|cname|mx record|srv |soa |caa |tlsa |ptr |nameserver|dnssec|premium dns)\b/.test(lower) || /records$/.test(lower)) {
    blocks.push(
      h2("DNS wijzigen zonder downtime"),
      p(
        `Pas één recordtype per keer aan, verlaag TTL een dag van tevoren als je een migratie plant, en controleer met <code>dig</code> of een online lookup vanaf een ander netwerk.`,
        `CNAME mag niet op de apex (@) tenzij je ALIAS/ANAME hebt. MX heeft altijd een prioriteit. CAA beperkt welke CA’s een certificaat mogen uitgeven.`,
      ),
    );
  }
  if (/thunderbird|apple mail|outlook|gmail|webmail|imap|smtp|spoofing|uurlimiet|catch/.test(lower)) {
    blocks.push(
      h2("Mailclients en aflevering"),
      p(
        `Standaardinstellingen bij TripleZero iT: IMAP 993, SMTP 587 met STARTTLS of 465 met SSL, gebruikersnaam is het volledige e-mailadres. Webmail is de referentie: werkt die wel, dan ligt het probleem in de client.`,
        `Spoofing bestrijd je met SPF, DKIM en DMARC — niet met alleen een spamfilter. Bulkmail hoort via een gespecialiseerde verzenddienst, niet via de mailbox van je website.`,
      ),
    );
  }
  if (/permalink|widget|toolkit|wordpress/.test(lower)) {
    blocks.push(
      h2("WordPress zonder verrassingen"),
      p(
        `Werk core, thema en plugins bij op een moment dat je de site kunt testen. Permalinks opnieuw opslaan na een verhuizing of HTTPS-switch. Widgets (of blokken in het site-editor-thema) horen bij het actieve thema.`,
        `WordPress Toolkit in Plesk bundelt updates, beveiligingsscans en kopieën — handig, maar maak alsnog je eigen backup voordat je massaal-updates draait.`,
      ),
    );
  }
  if (/incasso|factuur|betaling|upgrade|downgrade|klantnummer|overlijden|reseller/.test(lower)) {
    blocks.push(
      h2("Account en facturatie"),
      p(
        `In het klantenpanel van TripleZero iT zie je openstaande posten, betaalmethoden en je klantnummer. Mislukte incasso’s leiden tot een herinnering; reageer daarop voordat diensten worden beperkt.`,
        `Upgrades gaan meestal per eerstvolgende termijn in; downgrades kunnen pas als het verbruik binnen het kleinere pakket past.`,
      ),
    );
  }
  if (/403|500|404|http-status|wit scherm|werkt niet/.test(lower)) {
    blocks.push(
      h2("Foutcodes lezen"),
      p(
        `403 = de server weigert toegang (rechten, hotlink, IP-blokkade, ontbrekende index). 404 = het pad bestaat niet (verkeerde document root, permalinks, ontbrekend bestand). 500 = de applicatie of .htaccess crasht — kijk in error_log.`,
        `Een wit scherm bij WordPress is vaak een fatale PHP-fout; schakel tijdelijk WP_DEBUG in op staging, nooit langdurig op productie.`,
      ),
    );
  }
  if (/joomla|magento|drupal|prestashop/.test(lower)) {
    blocks.push(
      h2("CMS naast WordPress"),
      p(
        `Joomla, Drupal, PrestaShop en Magento installeer je via Installatron of handmatig (bestanden + database + configuratie). Elke stack heeft zijn eigen updatekanaal — plan die updates net zo serieus als bij WordPress.`,
        `Zet na installatie de maprechten strak, verwijder installatiebestanden en forceer HTTPS.`,
      ),
    );
  }
  if (/websitebouwer|visuele editor|favicon|google tag manager/.test(lower)) {
    blocks.push(
      h2("Website bouwen en meten"),
      p(
        `Een visuele editor is handig voor landingspagina’s; koppel het domein via DNS en een SSL-certificaat voordat je de site deelt. Een favicon plaats je in het thema of via Site Identity.`,
        `Google Tag Manager laad je ná cookietoestemming. Test in GTM-preview of tags alleen vuren wanneer het mag.`,
      ),
    );
  }

  return blocks;
}

const familyLead: Record<string, { lead: string; steps: string[]; related: string }> = {
  vps: {
    lead: "Een VPS is een eigen virtuele server: jij bepaalt het besturingssysteem, de firewall en wat er draait. Dat geeft vrijheid, maar ook onderhoud.",
    steps: [
      "Open het klantenpanel van TripleZero iT en kies de VPS (status, IP, console).",
      "Controleer of de machine draait. Start of herstart alleen als er geen snapshot bezig is.",
      "Log in via SSH (Linux) of RDP (Windows), of gebruik de noVNC-console bij netwerkproblemen.",
      "Voer de wijziging uit die bij dit artikel hoort en noteer de oude instelling.",
      "Test vanaf een ander netwerk: ping, HTTP/HTTPS, mailpoorten of RDP/SSH — wat van toepassing is.",
    ],
    related: "artikelen over snapshots, firewall, DNS naar de VPS en managed versus unmanaged.",
  },
  win: {
    lead: "Windows-VPS’en beheer je via RDP en IIS. Hostnamen, certificaten en application pools moeten bij elkaar passen, anders blijft de site op het verkeerde IP of zonder HTTPS hangen.",
    steps: [
      "Maak RDP-verbinding met het IP uit het klantenpanel.",
      "Open IIS Manager en controleer Sites, Bindings en Application Pools.",
      "Zet DNS A/AAAA van het domein naar dit IP voordat je een certificaat aanvraagt.",
      "Pas de instelling uit dit artikel toe en recycle de application pool.",
      "Test in een privévenster en via een SSL-check.",
    ],
    related: "RDP, IIS, SQL Server en SSL op Windows.",
  },
  ms: {
    lead: "Microsoft 365 (Exchange Online, Teams, OneDrive) draait in de tenant van Microsoft. Wij helpen je met licenties, DNS-koppeling en migratie vanaf IMAP of onze mailboxen.",
    steps: [
      "Controleer in het klantenpanel of de Microsoft-licentie actief is.",
      "Voeg in het Microsoft-beheercentrum je domein toe en kies de DNS-records die Microsoft toont.",
      "Zet die records in DNS-beheer bij TripleZero iT (MX, TXT/SPF, CNAME autodiscover, DKIM).",
      "Wacht op verificatie (vaak minuten, soms tot 24 uur) en maak daarna gebruikers of gedeelde postvakken aan.",
      "Stel Outlook of OWA in en verstuur een testmail naar een extern adres.",
    ],
    related: "DNS (MX/SPF/DKIM) en e-mailinstellingen in Outlook.",
  },
  ssl: {
    lead: "HTTPS is de standaard. Bij shared hosting activeer je Let’s Encrypt in het control panel; op een VPS of voor OV/EV volg je CSR en validatie.",
    steps: [
      "Controleer of DNS al naar de juiste server wijst.",
      "Kies Let’s Encrypt voor standaard domeinvalidatie, of een betaald certificaat als je bedrijfsgegevens in het certificaat wilt.",
      "Vraag het certificaat aan in DirectAdmin, CyberPanel, Plesk of via een CSR op de VPS.",
      "Forceer HTTPS (redirect) en test www én non-www.",
      "Optioneel: HSTS inschakelen nádat alles groen is.",
    ],
    related: "Let’s Encrypt in DirectAdmin/Plesk en HSTS.",
  },
  dns: {
    lead: "DNS vertelt het internet waar je website, mail en extra diensten wonen. Kleine typefouten in een record hebben grote gevolgen.",
    steps: [
      "Open DNS-beheer in het klantenpanel of je control panel.",
      "Zoek het bestaande record van dit type; wijzig of voeg toe, maar dupliceer geen tegenstrijdige waarden.",
      "Sla op en wacht tot de TTL is verstreken (vaak 300–3600 seconden).",
      "Controleer met een DNS-lookup vanaf een ander netwerk of via vliegtuigmodus/mobiele hotspot.",
      "Test de dienst (website, mail, autodiscover) pas daarna.",
    ],
    related: "SPF, DKIM, DMARC en nameservers.",
  },
  tld: {
    lead: "Elke extensie heeft eigen registratieregels, WHOIS-privacy, verhuisperiode en soms extra documentatie. Hieronder de praktische kant voor klanten van TripleZero iT.",
    steps: [
      "Zoek de extensie in de shop of in je klantenpanel onder domeinen.",
      "Controleer houdergegevens; sommige registries eisen een lokaal adres of extra validatie.",
      "Zet DNS of nameservers naar de omgeving waar de website/mail moet draaien.",
      "Lock het domein tegen onbedoelde verhuizing zodra alles werkt.",
      "Zet automatische verlenging aan als je het domein wilt houden.",
    ],
    related: "verhuizen, autorisatiecode en WHOIS.",
  },
  email: {
    lead: "E-mailproblemen zitten bijna altijd in DNS, authenticatie van de client, of een volle mailbox — zelden in ‘de server is stuk’ zonder logregel.",
    steps: [
      "Test in webmail: ontvangen én verzenden.",
      "Vergelijk de clientinstellingen met de gegevens in deze kennisbank (IMAP/SMTP, poorten, SSL).",
      "Controleer schijfquota, spamfolder en of het wachtwoord recent is gewijzigd.",
      "Kijk naar SPF/DKIM als derden je mail weigeren of als spam markeren.",
      "Pas daarna de specifieke oplossing uit dit artikel toe.",
    ],
    related: "webmail, SPF/DKIM/DMARC en spamfilter.",
  },
  wp: {
    lead: "WordPress is flexibel, maar updates, permalinks en extra gebruikers vragen een vaste routine zodat de site niet ‘stukgaat na een klik’.",
    steps: [
      "Maak een backup (bestanden + database) via Installatron, JetBackup of je control panel.",
      "Log in op /wp-admin met een beheerderaccount.",
      "Voer de wijziging uit (gebruiker, widget, permalink, toolkit-update).",
      "Wis object- en paginacache en test een paar belangrijke pagina’s.",
      "Controleer formulieren en — bij een webshop — de checkout.",
    ],
    related: "WordPress-installatie, beveiliging en snelheid.",
  },
  admin: {
    lead: "Bestellen, betalen, machtigingen en houdergegevens regel je in het klantenpanel. Dat is de bron van waarheid voor wie een product ‘heeft’.",
    steps: [
      "Log in op het klantenpanel van TripleZero iT (wachtwoord resetten kan vanaf het inlogscherm).",
      "Open het product of de factuur waar het om gaat.",
      "Voer de wijziging door en bevestig eventuele e-mailverificatie.",
      "Controleer of de status in het overzicht klopt (actief, in behandeling, opgezegd).",
      "Download de factuur of bevestigingsmail voor je administratie.",
    ],
    related: "facturen, extra gebruikers en opzeggen.",
  },
  host: {
    lead: "Shared hosting deelt resources maar geeft je een volledig website- + mailpakket. De meeste ‘mijn site doet het niet’-meldingen los je met DNS, document root of PHP-logs op.",
    steps: [
      "Open het control panel en selecteer het juiste domein.",
      "Controleer of de site-bestanden in de verwachte map staan (vaak public_html).",
      "Bekijk error_log, .htaccess en PHP-versie.",
      "Test of een eenvoudig HTML-bestand wél opent — dan ligt het aan de applicatie, niet aan DNS.",
      "Pas de gerichte fix uit dit artikel toe en test opnieuw.",
    ],
    related: "FTP, PHP-versie, SSL en backups.",
  },
  sec: {
    lead: "Beveiliging is lagen: updates, unieke wachtwoorden, 2FA, minder open poorten en monitoring. Eén zwakke login maakt de rest nutteloos.",
    steps: [
      "Inventariseer welke diensten bereikbaar zijn (web, mail, SSH, RDP, databases).",
      "Werk software bij en verwijder ongebruikte accounts.",
      "Zet 2FA aan op klantenpanel en control panel.",
      "Beperk toegang (IP-allowlist of VPN) voor beheerpoorten.",
      "Controleer logs op herhaalde mislukte logins.",
    ],
    related: "SSL, Wordfence, phishing en VPS-firewall.",
  },
  cms: {
    lead: "Naast WordPress hosten we andere PHP-applicaties. De rode draad is hetzelfde: bestanden, database, configuratie, HTTPS, updates.",
    steps: [
      "Kies Installatron of een handmatige installatie in een lege directory.",
      "Maak een database + gebruiker aan en bewaar de gegevens in een password manager.",
      "Rond de webinstaller af en verwijder de install-map.",
      "Zet SSL aan en werk .htaccess/nginx-regels bij volgens de CMS-documentatie.",
      "Plan updates en backups.",
    ],
    related: "Installatron, databases en PHP-versie.",
  },
  builder: {
    lead: "Met de visuele websitebouwer van TripleZero iT (of Brizy op WordPress-hosting) zet je pagina’s live zonder te programmeren. DNS en SSL blijven jouw verantwoordelijkheid.",
    steps: [
      "Koppel het domein aan het hostingpakket of de bouwer.",
      "Wacht tot DNS wijst en activeer SSL.",
      "Bouw de homepage, contactpagina en eventuele webshop-pagina’s.",
      "Stel een favicon, titel en meta-beschrijving in.",
      "Publiceer en test op telefoon én desktop.",
    ],
    related: "domein koppelen, SSL en WordPress.",
  },
  support: {
    lead: "Goede support begint bij een duidelijk plaatje: screenshot, URL, tijdstip en wat je al deed. Deze extra artikelen helpen je dat zelf voor te bereiden.",
    steps: [
      "Reproduceer het probleem in een privévenster.",
      "Maak een screenshot of korte opname van de fout.",
      "Noteer browser, apparaat en of het op 4G ook gebeurt.",
      "Zoek in deze kennisbank op de foutmelding.",
      "Open anders een ticket met die bijlagen.",
    ],
    related: "tickets, live chat en TeamViewer.",
  },
  plesk: {
    lead: "Plesk bundelt sites, mail, DNS en extra gebruikers. Kies altijd het juiste abonnement voordat je iets wijzigt.",
    steps: [
      "Log in op Plesk via de URL uit je welkomstmail.",
      "Selecteer het domein of de reseller-klant.",
      "Open het onderdeel dat bij dit artikel hoort (Bestanden, Logs, Mail, Gebruikers).",
      "Voer de wijziging door en controleer de log als iets faalt.",
      "Test de website of mailbox.",
    ],
    related: "Plesk-inloggen, WordPress in Plesk en backups.",
  },
  da: {
    lead: "DirectAdmin is het panel op veel van onze shared en reseller-omgevingen. CustomBuild, SNI en filemanager-rechten horen bij serverbeheer — op shared hosting zijn die deels al voor je ingesteld.",
    steps: [
      "Log in op DirectAdmin en kies het juiste gebruikersniveau (admin, reseller of user).",
      "Selecteer het domein.",
      "Voer de handeling uit die dit artikel beschrijft.",
      "Wacht tot taken in de queue klaar zijn (SSL, CustomBuild).",
      "Test het resultaat.",
    ],
    related: "DirectAdmin-domeinen, e-mail en SSL.",
  },
};

function tldExtra(title: string): string[] {
  const m = title.match(/\.([a-z0-9.]+)/i);
  if (!m) return [];
  const ext = m[1].toLowerCase();
  const notes: Record<string, string> = {
    nl: "SIDN beheert .nl. Verhuizen kan met een autorisatiecode; na opzeggen volgt een quarantaineperiode waarin alleen de oorspronkelijke houder kan heractiveren.",
    com: ".com valt onder een generieke registry. WHOIS-privacy is meestal beschikbaar. Verhuizen duurt tot vijf dagen als de lock en auth-code kloppen.",
    eu: ".eu vereist een EU/EER-houderschap. Controleer of je organisatie of woonadres voldoet voordat je registreert of verhuist.",
    be: "DNS Belgium beheert .be. Houdergegevens moeten kloppen; bij verhuizing speelt de transfercode van de huidige registrar.",
    de: "DENIC is streng op houdergegevens. Een admin-c in Duitsland is niet meer verplicht, maar onjuiste WHOIS leidt tot queries van de registry.",
    fr: "AFNIC kan extra checks doen. Sommige registraties vragen een Franse nexus; wij geven dat aan tijdens de bestelling.",
    "co.uk": "Nominet werkt met UK-registrantregels. Een verhuizing (IPS-tag) verloopt anders dan een EPP-code bij .com.",
    uk: "Nominet: controleer of je de juiste tag/transferprocedure volgt.",
    nu: ".nu heeft specifieke renew- en transferregels; start ruim voor de expiratiedatum.",
    info: ".info is een generieke TLD; lock en auth-code zijn de belangrijkste transferchecks.",
    biz: ".biz is vergelijkbaar met andere gTLD’s; let op de 60-dagen-lock na een houderwijziging.",
    es: ".es kan extra identificatie vragen. Houd je NIF/paspoortgegevens bij de hand bij validatie.",
    tv: ".tv is populair voor media; prijzen en renewals wijken af van .com.",
    xxx: ".xxx is een gesponsorde TLD met extra beleid rond content en sunrise/claims-historie.",
    tel: ".tel was oorspronkelijk een directory-TLD; controleer of de huidige registry-eisen nog bij jouw gebruik passen.",
  };
  const note = notes[ext] || `De extensie .${ext} heeft eigen registrybeleid. Wij zetten de eisen in de shop en in je bestelbevestiging.`;
  return [
    h2(`Specifiek voor .${ext}`),
    p(note, `Bij TripleZero iT registreer, verleng en verhuis je de extensie vanuit het klantenpanel. DNS beheer je op dezelfde plek als je andere domeinen, tenzij je eigen nameservers gebruikt.`),
  ];
}

function dnsTypeExtra(title: string): string[] {
  const map: [RegExp, string, string][] = [
    [/aaaa/i, "AAAA", "Een AAAA-record koppelt een hostnaam aan een IPv6-adres. Zet hem naast (niet in plaats van) een A-record als je dual-stack wilt. Verkeerde AAAA is een veelvoorkomende ‘site werkt op 4G niet’-oorzaak."],
    [/\ba records?\b|^a records/i, "A", "Een A-record wijst een naam naar IPv4. De apex (@) en www hebben vaak allebei een A, of www is een CNAME naar de apex."],
    [/cname/i, "CNAME", "Een CNAME is een alias naar een andere hostnaam. Gebruik hem voor www, autodiscover of CDN-doelen — niet naast andere records op dezelfde naam."],
    [/mx records/i, "MX", "MX vertelt waar e-mail bezorgd moet worden. Lagere prioriteit (bijvoorbeeld 10) gaat vóór 20. Verander MX niet tijdens kantooruren zonder een mailmigratieplan."],
    [/srv /i, "SRV", "SRV wijst diensten (SIP, XMPP, Microsoft autodiscover-varianten) naar host + poort. De vorm is _service._proto.naam."],
    [/soa /i, "SOA", "SOA beschrijft de zone: primary nameserver, hostmaster-mail, serienummer en timers. Op shared hosting raak je SOA zelden handmatig aan."],
    [/caa /i, "CAA", "CAA beperkt welke certificate authorities certificaten mogen uitgeven. Let’s Encrypt heeft issue \"letsencrypt.org\" nodig als je CAA strak zet."],
    [/tlsa /i, "TLSA", "TLSA (DANE) koppelt TLS-certificaten aan DNSSEC. Alleen zinvol als de zone écht DNSSEC-signed is en de mail- of webserver meedoet."],
    [/ptr |reverse dns/i, "PTR", "Reverse DNS koppelt een IP terug naar een hostname. Belangrijk voor uitgaande mail op een VPS: veel filters wantrouwen een IP zonder PTR."],
    [/nameserver/i, "NS", "NS-records bepalen welke nameservers autoritatief zijn. Wijzig ze alleen als je DNS écht ergens anders wilt hosten — mail en website hangen ervan af."],
    [/dnssec/i, "DNSSEC", "DNSSEC ondertekent records zodat ze niet onderweg te vervalsen zijn. Activeer het in het klantenpanel en controleer of DS bij de registry staat."],
    [/premium dns/i, "Premium DNS", "Premium DNS voegt extra anycast, DDoS-weerbaarheid en snellere anycast-resolvers toe. Je zone blijft dezelfde records houden, maar op een robuuster anycast-netwerk."],
  ];
  for (const [rx, name, text] of map) {
    if (rx.test(title)) {
      return [h2(`Wat ${name} doet`), p(text)];
    }
  }
  return [];
}

export function buildGapArticleHtml(title: string, topic: string): string {
  const family = familyFromTopic(topic);
  const conf = familyLead[family] || familyLead.host;
  const extras = [
    ...keywordBlocks(title, topic),
    ...(family === "tld" ? tldExtra(title) : []),
    ...(family === "dns" ? dnsTypeExtra(title) : []),
  ];

  return [
    intro(title, conf.lead),
    h2("Voorbereiding"),
    ul([
      `Inlog voor het TripleZero iT klantenpanel.`,
      "Toegang tot DirectAdmin, CyberPanel, Plesk of de VPS-console — afhankelijk van je product.",
      "Een actuele backup of snapshot als je iets structureels wijzigt.",
      "De exacte hostname of het IP waarop je gaat testen.",
    ]),
    h2("Stappen"),
    ol(conf.steps),
    ...extras,
    h2("Controleren of het gelukt is"),
    ul([
      "Werkt de dienst vanaf een ander netwerk of 4G (geen oude DNS-cache)?",
      "Zie je in logs geen nieuwe 4xx/5xx of auth-fouten?",
      "Klopt de tijd: DNS-TTL, Microsoft-verificatie of SSL-uitgifte kan minuten duren.",
    ]),
    h3("Als het nog misgaat"),
    p(
      `Zet de vorige waarde terug als de wijziging duidelijk de boosdoener is. Noteer foutteksten letterlijk (geen parafrase). Stuur in een ticket naar TripleZero iT mee: product, domein/IP, timestamp en screenshot.`,
    ),
    tip(
      "Wijzig niet DNS, SSL en applicatie tegelijk. Isoleer de laag: eerst naamresolutie, dan certificaat, dan de app.",
    ),
    outro(conf.related),
  ].join("\n");
}

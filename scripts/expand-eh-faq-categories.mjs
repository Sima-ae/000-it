/**
 * Split webhosting into domeinen + webhosting + email-dns for Extra Hosting FAQ.
 * Updates nl.json and en.json in place (preserves other categories).
 *
 * Usage: node scripts/expand-eh-faq-categories.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "src/content/faq-i18n");

const NL = {
  domeinen: {
    id: "domeinen",
    title: "Domeinen",
    items: [
      {
        id: "dom-1",
        question: "Wat is een domeinnaam?",
        answer:
          "Een domeinnaam is het adres waarmee bezoekers jullie website vinden (bijvoorbeeld voorbeeld.nl). Het hoort bij DNS-records die naar jullie hosting of e-mail wijzen. Meer lezen: [Domeinnaamregistratie](/kennisbank/domeinnamen/domeinnaamregistratie) · [Domeinen bestellen](/domeinen).",
      },
      {
        id: "dom-2",
        question: "Hoe registreer ik een domeinnaam bij jullie?",
        answer:
          "Zoek de gewenste naam op de domeinpagina, kies de extensie en rond af via de shop. Na registratie beheer je DNS, nameservers en facturen in je account. Meer lezen: [Domeinen](/domeinen) · [Registratiehandleiding](/kennisbank/domeinnamen/domeinnaamregistratie) · [Shop](/shop).",
      },
      {
        id: "dom-3",
        question: "Kan ik mijn domein naar jullie verhuizen?",
        answer:
          "Ja. Vraag bij de huidige registrar een autorisatiecode (EPP) aan, hef een eventuele transfer-lock op en start de verhuizing bij ons. Daarna zetten we DNS en nameservers goed. Meer lezen: [Domein verhuizen](/kennisbank/domeinnamen/domeinnaam-verhuizen) · [Autorisatiecode](/kennisbank/domeinnamen/wat-is-een-autorisatiecode) · [Domeinen](/domeinen).",
      },
      {
        id: "dom-4",
        question: "Wat is een autorisatiecode (EPP/Auth-code)?",
        answer:
          "Dat is een eenmalige code van je huidige registrar waarmee je een domeintransfer veilig start. Zonder geldige code kan de verhuizing niet doorgaan. Meer lezen: [Wat is een autorisatiecode?](/kennisbank/domeinnamen/wat-is-een-autorisatiecode) · [Domein verhuizen](/kennisbank/domeinnamen/domeinnaam-verhuizen).",
      },
      {
        id: "dom-5",
        question: "Wat is een transfer-lock of registrar-lock?",
        answer:
          "Een lock voorkomt ongewenste verhuizingen. Voor een transfer moet je die vaak eerst uitzetten bij de huidige provider. Daarna kun je de verhuizing bij ons starten. Meer lezen: [Domein verhuizen](/kennisbank/domeinnamen/domeinnaam-verhuizen) · [Support](/contact).",
      },
      {
        id: "dom-6",
        question: "Kan ik een domein kopen zonder hosting?",
        answer:
          "Ja. Je kunt alleen een domein registreren of verhuizen en later hosting of e-mail toevoegen. DNS kun je ondertussen al beheren of doorsturen. Meer lezen: [Domein zonder hosting](/kennisbank/domeinnamen/domeinnaam-kopen-zonder-hosting) · [Domeinen](/domeinen).",
      },
      {
        id: "dom-7",
        question: "Welke extensies (.nl, .com, …) kan ik registreren?",
        answer:
          "We ondersteunen gangbare TLD’s zoals .nl en .com plus veel internationale extensies. Beschikbaarheid en prijs zie je direct in de domeinzoeker. Meer lezen: [Domeinen](/domeinen) · [Registratie](/kennisbank/domeinnamen/domeinnaamregistratie).",
      },
      {
        id: "dom-8",
        question: "Hoe verleng ik mijn domeinnaam?",
        answer:
          "Verlenging loopt via facturen en je klantenportaal; automatische verlenging is vaak beschikbaar. Houd betaalgegevens actueel om expiratie te voorkomen. Meer lezen: [Facturen](/kennisbank/crm-klantenpanel/hoe-download-of-raadpleeg-ik-factuurdetails) · [Factuurgegevens](/kennisbank/crm-klantenpanel/hoe-wijzig-ik-mijn-factuurgegevens-en-betaalmethode).",
      },
      {
        id: "dom-9",
        question: "Wat zijn premium domeinnamen?",
        answer:
          "Premium namen zijn korte of populaire domeinen met een hogere aanschafprijs, vaak via een aftermarket. Beschikbaarheid en voorwaarden verschillen per extensie. Meer lezen: [Premium domeinen](/kennisbank/domeinnamen/premium-domeinnamen) · [Domeinen](/domeinen).",
      },
      {
        id: "dom-10",
        question: "Kan ik mijn domein anoniem registreren (Protect ID)?",
        answer:
          "Waar de registry het toelaat, kun je privacy/Protect ID overwegen. Regels verschillen per extensie — .nl heeft bijvoorbeeld eigen kaders. Meer lezen: [Protect ID](/kennisbank/domeinnamen/protect-id-domein-anoniem-registreren).",
      },
      {
        id: "dom-11",
        question: "Mijn domein staat in quarantaine — wat nu?",
        answer:
          "Na opheffing kan een domein in quarantaine staan. Afhankelijk van de registry kun je het vaak nog terugactiveren tegen kosten; wacht daar niet te lang mee. Meer lezen: [Domein uit quarantaine](/kennisbank/domeinnamen/domein-quarantaine-halen) · [Contact](/contact).",
      },
      {
        id: "dom-12",
        question: "Mijn nieuwe domeinnaam werkt nog niet — wat nu?",
        answer:
          "Meestal is het DNS-propagatie, ontbrekende A/MX-records of nameservers die nog niet zijn bijgewerkt. Controleer records en geef TTL’s de tijd om te verlopen. Meer lezen: [Nieuw domein werkt niet](/kennisbank/domeinnamen/mijn-nieuwe-domeinnaam-werkt-niet) · [DNS beheren](/kennisbank/domeinnamen/dns-records-beheren).",
      },
      {
        id: "dom-13",
        question: "Hoe koppel ik een domein aan mijn hostingpakket?",
        answer:
          "Voeg het domein toe in je panel of account en wijs DNS (A-record of nameservers) naar de hosting. Wij helpen bij de eerste koppeling na bestelling. Meer lezen: [Domein koppelen aan pakket](/kennisbank/domeinnamen/domeinnaam-koppelen-aan-een-pakket) · [DNS beheren](/kennisbank/domeinnamen/dns-records-beheren).",
      },
      {
        id: "dom-14",
        question: "Kan ik een domein doorsturen (forwarding)?",
        answer:
          "Ja. Domeinforwarding stuurt bezoekers door naar een andere URL — handig voor merknamen zonder aparte site. DNS en redirects stemmen we af op jullie setup. Meer lezen: [Domein doorsturen](/kennisbank/domeinnamen/domeinnaam-doorsturen) · [Domeinen](/domeinen).",
      },
      {
        id: "dom-15",
        question: "Hoe wijzig ik nameservers van mijn domein?",
        answer:
          "In het DNS-/domeinbeheer kies je onze nameservers of externe (bijv. CDN). Propagatie kan enkele uren tot een dag duren. Meer lezen: [Nameservers beheren](/kennisbank/domeinnamen/nameservers-beheren) · [DNS beheren](/kennisbank/domeinnamen/dns-records-beheren).",
      },
      {
        id: "dom-16",
        question: "Wat kost een domeinnaam?",
        answer:
          "Prijzen verschillen per extensie en periode; de domeinzoeker toont actuele registratie- en verlengprijzen. Premium namen hebben een aparte prijs. Meer lezen: [Domeinen](/domeinen) · [Shop](/shop).",
      },
      {
        id: "dom-17",
        question: "Moet ik hosting en domein bij dezelfde provider hebben?",
        answer:
          "Nee, maar het is praktischer: DNS, SSL, e-mail en support zitten dan bij één partij. Je kunt ook alleen DNS bij ons houden en elders hosten. Meer lezen: [Domein zonder hosting](/kennisbank/domeinnamen/domeinnaam-kopen-zonder-hosting) · [Hosting](/diensten/categorie/hosting).",
      },
      {
        id: "dom-18",
        question: "Kan ik meerdere domeinen op één account beheren?",
        answer:
          "Ja. Extra domeinen registreer of verhuis je en koppelt ze als addon, park of doorverwijzing — binnen de limieten van je hostingpakket. Meer lezen: [Domeinen](/domeinen) · [Hostingpakket kiezen](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket).",
      },
      {
        id: "dom-19",
        question: "Wat gebeurt er als mijn domein verloopt?",
        answer:
          "Na expiratie volgt vaak een grace- of quarantaineperiode waarin herstel nog mogelijk is, daarna kan iemand anders het claimen. Verleng op tijd via facturen. Meer lezen: [Quarantaine](/kennisbank/domeinnamen/domein-quarantaine-halen) · [Contact](/contact).",
      },
      {
        id: "dom-20",
        question: "Waar bestel of beheer ik domeinen?",
        answer:
          "Registreren en verhuizen doe je via de domeinpagina of shop; beheer (DNS, facturen, verlenging) zit in het klantenportaal. Meer lezen: [Domeinen](/domeinen) · [Shop](/shop) · [Account](/dashboard).",
      },
    ],
  },
  webhosting: {
    id: "webhosting",
    title: "Webhosting",
    items: [
      {
        id: "host-1",
        question: "Welke hosting bieden jullie?",
        answer:
          "We bieden shared hosting, cloud hosting, WordPress hosting en VPS — plus domeinregistratie. Kies op traffic, stack en groeiverwachting. Meer lezen: [Shared hosting](/diensten/shared-hosting) · [Cloud hosting](/diensten/cloud-hosting) · [WordPress hosting](/diensten/wordpress-hosting) · [VPS](/diensten/vps-hosting).",
      },
      {
        id: "host-2",
        question: "Wat is het verschil tussen shared, cloud, WordPress en VPS?",
        answer:
          "Shared is voordelig voor kleinere sites. Cloud geeft meer resources en schaalbaarheid, volledig beheerd. WordPress hosting is geoptimaliseerd voor WP. VPS geeft meer controle voor zwaardere loads. Meer lezen: [Verschillen uitgelegd](/kennisbank/hosting/hoe-kies-ik-tussen-shared-hosting-wordpress-hosting-en-vps) · [Shared-plannen](/kennisbank/hosting/wat-is-shared-hosting-basic-plus-en-business) · [VPS-plannen](/kennisbank/hosting/wat-is-vps-hosting-basic-plus-en-business).",
      },
      {
        id: "host-3",
        question: "Wat is cloud hosting bij jullie?",
        answer:
          "Cloud hosting geeft meer resources en schaalbaarheid dan klassieke shared, terwijl wij het beheer blijven doen. Ideaal wanneer shared krap wordt maar full VPS nog niet nodig is. Meer lezen: [Cloud hosting](/diensten/cloud-hosting) · [Hosting kiezen](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket).",
      },
      {
        id: "host-4",
        question: "Zit SSL bij hosting?",
        answer:
          "Ja. SSL is standaard in onze relevante hostingplannen, zodat sites op HTTPS draaien. Meer lezen: [Wat is SSL?](/kennisbank/beveiliging/wat-is-ssl-en-waarom-heb-je-het-nodig) · [Let's Encrypt installeren](/kennisbank/hosting/hoe-installeer-ik-een-gratis-lets-encrypt-ssl-certificaat).",
      },
      {
        id: "host-5",
        question: "Kunnen jullie mijn site migreren naar jullie hosting?",
        answer:
          "Ja. We doen backup, migratie, DNS-cutover, SSL en smoke tests, met minimale downtime. Meer lezen: [Website of e-mail verhuizen](/kennisbank/hosting/website-of-e-mail-verhuizen-regelen-wij-voor-je) · [WordPress verhuizen](/kennisbank/domeinnamen/wordpress-website-verhuizen).",
      },
      {
        id: "host-6",
        question: "Hoe werken backups op hosting?",
        answer:
          "Dat hangt van het plan af: eenvoudige of geautomatiseerde backups. Extra off-site retentie is mogelijk. Meer lezen: [JetBackup](/kennisbank/directadmin/wat-is-jetbackup-en-waar-gebruik-ik-het-voor) · [Backup in DirectAdmin](/kennisbank/directadmin/backup-maken-en-terugzetten-directadmin).",
      },
      {
        id: "host-7",
        question: "Wat als ik meer traffic krijg?",
        answer:
          "Dan schalen we naar Plus, Business, cloud of VPS en optimaliseren we caching en CDN, zodat de site de groei aankan. Meer lezen: [Wanneer naar VPS?](/kennisbank/hosting/wanneer-stap-ik-over-van-shared-naar-vps) · [CDN](/kennisbank/cdn-performance-cloudflare/wat-een-cdn-doet-voor-je-website).",
      },
      {
        id: "host-8",
        question: "Hoe veilig is jullie hosting?",
        answer:
          "We werken met firewall, SSL, updates, monitoring en hardening. Extra security-lagen zijn beschikbaar waar nodig. Meer lezen: [SSL](/kennisbank/beveiliging/wat-is-ssl-en-waarom-heb-je-het-nodig) · [2FA in DirectAdmin](/kennisbank/directadmin/2fa-instellen-in-directadmin).",
      },
      {
        id: "host-9",
        question: "Kan ik later van shared naar VPS?",
        answer:
          "Ja. We plannen de migratie samen, inclusief tests en rollback, zodat de overstap gecontroleerd verloopt. Meer lezen: [Shared naar VPS](/kennisbank/hosting/wanneer-stap-ik-over-van-shared-naar-vps) · [VPS hosting](/diensten/vps-hosting).",
      },
      {
        id: "host-10",
        question: "Ondersteunen jullie CDN?",
        answer:
          "Ja, waar relevant — vaak zit er een gratis CDN in WP-hostingplannen — voor snellere globale delivery. Meer lezen: [Wat doet een CDN?](/kennisbank/cdn-performance-cloudflare/wat-een-cdn-doet-voor-je-website) · [WordPress hosting](/diensten/wordpress-hosting).",
      },
      {
        id: "host-11",
        question: "Wat is jullie uptime-aanpak?",
        answer:
          "We monitoren, reageren snel bij incidenten en communiceren duidelijk bij onderhoudsvensters, zodat jullie weten wat er speelt. Statusupdates vind je op de statuspagina. Meer lezen: [Statuspage](/statuspage) · [Contact](/contact).",
      },
      {
        id: "host-12",
        question: "Hoe kies ik het juiste hostingplan?",
        answer:
          "Op basis van traffic, stack (WordPress of maatwerk), resources en groei. We adviseren eerlijk — we verkopen niet over. Meer lezen: [Juiste hostingpakket kiezen](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket) · [Shared vs WP vs VPS](/kennisbank/hosting/hoe-kies-ik-tussen-shared-hosting-wordpress-hosting-en-vps).",
      },
      {
        id: "host-13",
        question: "Waar zie ik hostingprijzen?",
        answer:
          "Op de hostingdienstpagina’s en in de shop, met maand- of jaaropties waar van toepassing. Meer lezen: [Shared](/diensten/shared-hosting) · [Cloud](/diensten/cloud-hosting) · [WordPress](/diensten/wordpress-hosting) · [VPS](/diensten/vps-hosting) · [Shop](/shop).",
      },
      {
        id: "host-14",
        question: "Heb ik SSH-toegang op mijn hosting?",
        answer:
          "Dat hangt van het pakket af. Op veel plannen is SSH beschikbaar of aan te vragen; op VPS heb je doorgaans volledige toegang. Meer lezen: [SSH-toegang](/kennisbank/hosting/heb-ik-ssh-toegang-op-mijn-hosting) · [VPS](/diensten/vps-hosting).",
      },
      {
        id: "host-15",
        question: "Hoe installeer ik WordPress op jullie hosting?",
        answer:
          "Via het control panel (bijv. DirectAdmin/Installatron) of handmatig. We hebben een stapsgewijze handleiding. Meer lezen: [WordPress installeren](/kennisbank/wordpress/handleiding-wordpress-installeren) · [WordPress hosting](/diensten/wordpress-hosting).",
      },
      {
        id: "host-16",
        question: "Wat zijn inodes en waarom raakt mijn pakket “vol”?",
        answer:
          "Inodes tellen bestanden/mappen, niet alleen GB’s. Veel kleine cache- of mailbestanden kunnen de limiet raken terwijl schijfruimte nog vrij lijkt. Meer lezen: [Inodes](/kennisbank/hosting/inodes-en-inode-limieten) · [Opslag en verkeer](/kennisbank/hosting/onbeperkte-opslag-en-dataverkeer).",
      },
      {
        id: "host-17",
        question: "Wat betekent “onbeperkte” opslag of dataverkeer?",
        answer:
          "“Onbeperkt” volgt fair-use: normaal websitegebruik is prima; misbruik of extreme loads kunnen we beperken om het platform stabiel te houden. Meer lezen: [Opslag en verkeer](/kennisbank/hosting/onbeperkte-opslag-en-dataverkeer).",
      },
      {
        id: "host-18",
        question: "Wat is het verschil tussen shared, VPS en dedicated?",
        answer:
          "Shared deelt resources; VPS isoleert meer CPU/RAM; dedicated is een hele server. Kies op traffic, controlebehoefte en budget. Meer lezen: [Dedicated vs VPS vs shared](/kennisbank/infrastructuur-servers/verschil-tussen-dedicated-vps-en-shared-hosting) · [Shared/WP/VPS](/kennisbank/hosting/hoe-kies-ik-tussen-shared-hosting-wordpress-hosting-en-vps).",
      },
      {
        id: "host-19",
        question: "Hoe werk ik met DirectAdmin?",
        answer:
          "DirectAdmin is het control panel voor e-mail, DNS, databases, backups en installs. Log in met je panelgegevens; 2FA raden we sterk aan. Meer lezen: [2FA in DirectAdmin](/kennisbank/directadmin/2fa-instellen-in-directadmin) · [Backups](/kennisbank/directadmin/backup-maken-en-terugzetten-directadmin).",
      },
      {
        id: "host-20",
        question: "Bieden jullie object cache voor WordPress?",
        answer:
          "Op geschikte plannen ondersteunen we persistent object cache om database-queries te verminderen en sneller te laden. Meer lezen: [Object cache](/kennisbank/hosting/persistent-object-cache-in-wordpress) · [WordPress hosting](/diensten/wordpress-hosting).",
      },
      {
        id: "host-21",
        question: "Hoe verleng of betaal ik hosting?",
        answer:
          "Via het klantenpanel en facturen; automatische verlenging is vaak beschikbaar. Houd factuurgegevens actueel om onderbreking te voorkomen. Meer lezen: [Factuurgegevens](/kennisbank/crm-klantenpanel/hoe-wijzig-ik-mijn-factuurgegevens-en-betaalmethode) · [Facturen bekijken](/kennisbank/crm-klantenpanel/hoe-download-of-raadpleeg-ik-factuurdetails).",
      },
      {
        id: "host-22",
        question: "Kan ik meerdere domeinen op één hosting zetten?",
        answer:
          "Vaak ja, via addon- of park-domeinen — afhankelijk van je pakketlimieten. Wij helpen bij koppeling en DNS. Meer lezen: [Hosting kiezen](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket) · [Domein koppelen](/kennisbank/domeinnamen/domeinnaam-koppelen-aan-een-pakket).",
      },
      {
        id: "host-23",
        question: "Hoe veilig is inloggen op mijn hostingpanel?",
        answer:
          "Gebruik een sterk wachtwoord en schakel 2FA in. Deel geen panel-logins via onveilige kanalen. Meer lezen: [2FA DirectAdmin](/kennisbank/directadmin/2fa-instellen-in-directadmin) · [Login kwijt](/kennisbank/crm-klantenpanel/logingegevens-klantenpanel-kwijt).",
      },
      {
        id: "host-24",
        question: "Wat is WordPress hosting precies?",
        answer:
          "WordPress hosting is geoptimaliseerd voor WP: snellere PHP/stack, vaak CDN en eenvoudigere installs/updates dan generieke shared. Meer lezen: [WP-hostingplannen](/kennisbank/hosting/wat-is-wordpress-hosting-basic-plus-en-pro) · [WordPress hosting](/diensten/wordpress-hosting).",
      },
      {
        id: "host-25",
        question: "Waar bestel ik hosting direct?",
        answer:
          "In de shop of via de hostingcategorieën Shared, Cloud, WordPress en VPS. Na bestelling ontvang je toegang tot panel en facturen. Meer lezen: [Shop](/shop) · [Hosting overzicht](/diensten/categorie/hosting).",
      },
    ],
  },
  "email-dns": {
    id: "email-dns",
    title: "E-mail en DNS",
    items: [
      {
        id: "mail-1",
        question: "Bieden jullie e-mail bij domeinen of hosting?",
        answer:
          "Dat hangt van het pakket en de setup af. We adviseren betrouwbare mailoplossingen en zetten DNS goed (SPF, DKIM en DMARC). Meer lezen: [E-mail op eigen domein](/kennisbank/e-mail/e-mailadres-eigen-domein-wordpress) · [SPF-record](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam).",
      },
      {
        id: "mail-2",
        question: "Wat zijn SPF, DKIM en DMARC?",
        answer:
          "Het zijn DNS-records die e-mailauthenticatie regelen en spoofing/spam verminderen. Zonder correcte records belandt mail vaker in spam. Meer lezen: [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam) · [DKIM](/kennisbank/domeinnamen/dkim-record-toevoegen-aan-dns-domeinnaam) · [DMARC](/kennisbank/domeinnamen/hoe-kan-ik-een-dmarc-record-toevoegen).",
      },
      {
        id: "mail-3",
        question: "Hoe beheer ik DNS-records?",
        answer:
          "Via het DNS-beheer van je domein of hostingpanel zet je A, AAAA, CNAME, MX en TXT-records. Wij helpen bij migraties en mail-auth. Meer lezen: [DNS beheren](/kennisbank/domeinnamen/dns-records-beheren) · [DNSSEC](/kennisbank/domeinnamen/wat-is-dnssec-en-hoe-voeg-ik-het-toe-aan-mijn-domein).",
      },
      {
        id: "mail-4",
        question: "Helpen jullie DNS-problemen oplossen?",
        answer:
          "Ja. We lossen records, propagatie, mail-auth en domeinkoppelingen op tot DNS weer klopt. Meer lezen: [DNS-records beheren](/kennisbank/domeinnamen/dns-records-beheren) · [Propagatie en TTL](/kennisbank/foutmeldingen-troubleshooting/dns-propagatie-ttl-en-caches-legen).",
      },
      {
        id: "mail-5",
        question: "Wat is DNSSEC?",
        answer:
          "DNSSEC ondertekent DNS-antwoorden zodat manipulatie moeilijker wordt. We kunnen het activeren waar jouw TLD en setup dat ondersteunen. Meer lezen: [DNSSEC uitleg](/kennisbank/domeinnamen/wat-is-dnssec-en-hoe-voeg-ik-het-toe-aan-mijn-domein).",
      },
      {
        id: "mail-6",
        question: "Hoe zet ik e-mail op mijn telefoon?",
        answer:
          "Gebruik IMAP/SMTP-gegevens uit je panel. Voor Android (en vergelijkbaar op iOS) staan de stappen in de kennisbank. Meer lezen: [E-mail op Android](/kennisbank/e-mail/e-mail-instellen-op-android) · [E-mail bij eigen domein](/kennisbank/e-mail/e-mailadres-eigen-domein-wordpress).",
      },
      {
        id: "mail-7",
        question: "Wat als e-mail plotseling stopt met werken?",
        answer:
          "Check DNS (MX/SPF/DKIM/DMARC), mailboxquota en of providers mail blokkeren. Wij helpen de keten doormeten. Meer lezen: [E-mailproblemen](/kennisbank/hosting/problemen-met-e-mail-website) · [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam).",
      },
      {
        id: "mail-8",
        question: "Hoe werken nameservers?",
        answer:
          "Nameservers bepalen welk DNS-systeem jouw domein bedient. Wijzig je ze, dan moet je A/MX/TXT-records opnieuw goed zetten bij de nieuwe DNS-host. Meer lezen: [Nameservers beheren](/kennisbank/domeinnamen/nameservers-beheren) · [DNS beheren](/kennisbank/domeinnamen/dns-records-beheren).",
      },
      {
        id: "mail-9",
        question: "Hoe lang duurt DNS-propagatie?",
        answer:
          "Vaak minuten tot enkele uren; soms tot 24–48 uur door TTL’s en caches. Verlaag TTL’s vóór een migratie om sneller om te schakelen. Meer lezen: [Propagatie en TTL](/kennisbank/foutmeldingen-troubleshooting/dns-propagatie-ttl-en-caches-legen) · [Nieuw domein werkt niet](/kennisbank/domeinnamen/mijn-nieuwe-domeinnaam-werkt-niet).",
      },
      {
        id: "mail-10",
        question: "Kan ik e-mail doorsturen naar een ander adres?",
        answer:
          "Ja. Forwarders sturen inkomende mail door naar Gmail, Microsoft 365 of een ander mailboxadres — handig naast of in plaats van een volle mailbox. Meer lezen: [E-mail doorsturen](/kennisbank/e-mail/email-doorsturen-naar-mailadres).",
      },
      {
        id: "mail-11",
        question: "Kan ik mijn domein koppelen aan Microsoft 365?",
        answer:
          "Ja. Je zet MX- en authenticatierecords (SPF/DKIM/DMARC) volgens Microsoft’s instructies; wij helpen de DNS-kant. Meer lezen: [Domein aan Microsoft 365](/kennisbank/domeinnamen/domeinnaam-koppelen-aan-microsoft-365) · [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam).",
      },
      {
        id: "mail-12",
        question: "Waarom belandt mijn mail in spam?",
        answer:
          "Vaak ontbreken of conflicteren SPF/DKIM/DMARC, of de IP/reputatie is zwak. We controleren DNS-auth en verzendgedrag. Meer lezen: [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam) · [DKIM](/kennisbank/domeinnamen/dkim-record-toevoegen-aan-dns-domeinnaam) · [DMARC](/kennisbank/domeinnamen/hoe-kan-ik-een-dmarc-record-toevoegen).",
      },
      {
        id: "mail-13",
        question: "Wat is een MX-record?",
        answer:
          "Een MX-record vertelt het internet welke mailserver e-mail voor jouw domein mag ontvangen. Zonder correcte MX komt er geen mail binnen. Meer lezen: [DNS beheren](/kennisbank/domeinnamen/dns-records-beheren) · [E-mailproblemen](/kennisbank/hosting/problemen-met-e-mail-website).",
      },
      {
        id: "mail-14",
        question: "Kan ik webmail gebruiken?",
        answer:
          "Ja, via de webmail-URL van je hostingpanel kun je mail in de browser lezen en versturen — naast IMAP op telefoon of Outlook. Meer lezen: [E-mail instellen](/kennisbank/e-mail/e-mail-instellen-op-android) · [Contact](/contact).",
      },
      {
        id: "mail-15",
        question: "Moet DNS bij jullie staan als hosting elders is?",
        answer:
          "Nee. Je kunt DNS bij ons of elders houden, zolang A/MX/TXT naar de juiste diensten wijzen. Consistent beheer voorkomt fouten bij migraties. Meer lezen: [DNS beheren](/kennisbank/domeinnamen/dns-records-beheren) · [Nameservers](/kennisbank/domeinnamen/nameservers-beheren).",
      },
    ],
  },
};

const EN = {
  domeinen: {
    id: "domeinen",
    title: "Domains",
    items: [
      {
        id: "dom-1",
        question: "What is a domain name?",
        answer:
          "A domain name is the address visitors use to find your website (for example example.com). It ties into DNS records that point to your hosting or email. Read more: [Domain registration](/kennisbank/domeinnamen/domeinnaamregistratie) · [Order domains](/domeinen).",
      },
      {
        id: "dom-2",
        question: "How do I register a domain name with you?",
        answer:
          "Search the name on the domains page, pick an extension and complete checkout in the shop. After registration you manage DNS, nameservers and invoices in your account. Read more: [Domains](/domeinen) · [Registration guide](/kennisbank/domeinnamen/domeinnaamregistratie) · [Shop](/shop).",
      },
      {
        id: "dom-3",
        question: "Can I transfer my domain to you?",
        answer:
          "Yes. Request an authorisation (EPP) code from your current registrar, unlock any transfer lock, then start the transfer with us. After that we set DNS and nameservers correctly. Read more: [Transfer a domain](/kennisbank/domeinnamen/domeinnaam-verhuizen) · [Authorisation code](/kennisbank/domeinnamen/wat-is-een-autorisatiecode) · [Domains](/domeinen).",
      },
      {
        id: "dom-4",
        question: "What is an authorisation code (EPP/Auth code)?",
        answer:
          "It is a one-time code from your current registrar that securely starts a domain transfer. Without a valid code the transfer cannot proceed. Read more: [What is an authorisation code?](/kennisbank/domeinnamen/wat-is-een-autorisatiecode) · [Transfer a domain](/kennisbank/domeinnamen/domeinnaam-verhuizen).",
      },
      {
        id: "dom-5",
        question: "What is a transfer lock or registrar lock?",
        answer:
          "A lock prevents unwanted transfers. For a move you often need to turn it off at the current provider first, then start the transfer with us. Read more: [Transfer a domain](/kennisbank/domeinnamen/domeinnaam-verhuizen) · [Support](/contact).",
      },
      {
        id: "dom-6",
        question: "Can I buy a domain without hosting?",
        answer:
          "Yes. You can register or transfer only a domain and add hosting or email later. You can already manage or forward DNS in the meantime. Read more: [Domain without hosting](/kennisbank/domeinnamen/domeinnaam-kopen-zonder-hosting) · [Domains](/domeinen).",
      },
      {
        id: "dom-7",
        question: "Which extensions (.nl, .com, …) can I register?",
        answer:
          "We support common TLDs such as .nl and .com plus many international extensions. Availability and price show instantly in the domain search. Read more: [Domains](/domeinen) · [Registration](/kennisbank/domeinnamen/domeinnaamregistratie).",
      },
      {
        id: "dom-8",
        question: "How do I renew my domain name?",
        answer:
          "Renewal runs through invoices and your client portal; automatic renewal is often available. Keep payment details up to date to avoid expiry. Read more: [Invoices](/kennisbank/crm-klantenpanel/hoe-download-of-raadpleeg-ik-factuurdetails) · [Billing details](/kennisbank/crm-klantenpanel/hoe-wijzig-ik-mijn-factuurgegevens-en-betaalmethode).",
      },
      {
        id: "dom-9",
        question: "What are premium domain names?",
        answer:
          "Premium names are short or popular domains with a higher purchase price, often via an aftermarket. Availability and terms differ by extension. Read more: [Premium domains](/kennisbank/domeinnamen/premium-domeinnamen) · [Domains](/domeinen).",
      },
      {
        id: "dom-10",
        question: "Can I register my domain anonymously (Protect ID)?",
        answer:
          "Where the registry allows it, you can consider privacy/Protect ID. Rules differ by extension — .nl, for example, has its own framework. Read more: [Protect ID](/kennisbank/domeinnamen/protect-id-domein-anoniem-registreren).",
      },
      {
        id: "dom-11",
        question: "My domain is in quarantine — what now?",
        answer:
          "After deletion a domain can enter quarantine. Depending on the registry you can often reactivate it for a fee; do not wait too long. Read more: [Domain out of quarantine](/kennisbank/domeinnamen/domein-quarantaine-halen) · [Contact](/contact).",
      },
      {
        id: "dom-12",
        question: "My new domain name does not work yet — what now?",
        answer:
          "Usually it is DNS propagation, missing A/MX records, or nameservers that are not updated yet. Check records and allow TTLs to expire. Read more: [New domain not working](/kennisbank/domeinnamen/mijn-nieuwe-domeinnaam-werkt-niet) · [Manage DNS](/kennisbank/domeinnamen/dns-records-beheren).",
      },
      {
        id: "dom-13",
        question: "How do I connect a domain to my hosting plan?",
        answer:
          "Add the domain in your panel or account and point DNS (A record or nameservers) to the hosting. We help with the first connection after order. Read more: [Connect domain to plan](/kennisbank/domeinnamen/domeinnaam-koppelen-aan-een-pakket) · [Manage DNS](/kennisbank/domeinnamen/dns-records-beheren).",
      },
      {
        id: "dom-14",
        question: "Can I forward a domain?",
        answer:
          "Yes. Domain forwarding sends visitors to another URL — useful for brand names without a separate site. We align DNS and redirects with your setup. Read more: [Forward a domain](/kennisbank/domeinnamen/domeinnaam-doorsturen) · [Domains](/domeinen).",
      },
      {
        id: "dom-15",
        question: "How do I change nameservers for my domain?",
        answer:
          "In DNS/domain management you choose our nameservers or external ones (for example a CDN). Propagation can take hours up to a day. Read more: [Manage nameservers](/kennisbank/domeinnamen/nameservers-beheren) · [Manage DNS](/kennisbank/domeinnamen/dns-records-beheren).",
      },
      {
        id: "dom-16",
        question: "What does a domain name cost?",
        answer:
          "Prices differ by extension and period; the domain search shows current registration and renewal prices. Premium names have a separate price. Read more: [Domains](/domeinen) · [Shop](/shop).",
      },
      {
        id: "dom-17",
        question: "Do hosting and domain need to be with the same provider?",
        answer:
          "No, but it is simpler: DNS, SSL, email and support then sit with one party. You can also keep only DNS with us and host elsewhere. Read more: [Domain without hosting](/kennisbank/domeinnamen/domeinnaam-kopen-zonder-hosting) · [Hosting](/diensten/categorie/hosting).",
      },
      {
        id: "dom-18",
        question: "Can I manage multiple domains on one account?",
        answer:
          "Yes. Extra domains can be registered or transferred and linked as addon, parked or forwarded — within your hosting plan limits. Read more: [Domains](/domeinen) · [Choose a hosting plan](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket).",
      },
      {
        id: "dom-19",
        question: "What happens if my domain expires?",
        answer:
          "After expiry there is often a grace or quarantine period where recovery is still possible; afterwards someone else may claim it. Renew on time via invoices. Read more: [Quarantine](/kennisbank/domeinnamen/domein-quarantaine-halen) · [Contact](/contact).",
      },
      {
        id: "dom-20",
        question: "Where do I order or manage domains?",
        answer:
          "Register and transfer via the domains page or shop; management (DNS, invoices, renewal) lives in the client portal. Read more: [Domains](/domeinen) · [Shop](/shop) · [Account](/dashboard).",
      },
    ],
  },
  webhosting: {
    id: "webhosting",
    title: "Web hosting",
    items: [
      {
        id: "host-1",
        question: "Which hosting do you offer?",
        answer:
          "We offer shared hosting, cloud hosting, WordPress hosting and VPS — plus domain registration. Choose based on traffic, stack and growth. Read more: [Shared hosting](/diensten/shared-hosting) · [Cloud hosting](/diensten/cloud-hosting) · [WordPress hosting](/diensten/wordpress-hosting) · [VPS](/diensten/vps-hosting).",
      },
      {
        id: "host-2",
        question: "What is the difference between shared, cloud, WordPress and VPS?",
        answer:
          "Shared is cost-effective for smaller sites. Cloud gives more resources and scalability, fully managed. WordPress hosting is optimised for WP. VPS gives more control for heavier loads. Read more: [Differences explained](/kennisbank/hosting/hoe-kies-ik-tussen-shared-hosting-wordpress-hosting-en-vps) · [Shared plans](/kennisbank/hosting/wat-is-shared-hosting-basic-plus-en-business) · [VPS plans](/kennisbank/hosting/wat-is-vps-hosting-basic-plus-en-business).",
      },
      {
        id: "host-3",
        question: "What is cloud hosting with you?",
        answer:
          "Cloud hosting gives more resources and scalability than classic shared, while we keep managing it. Ideal when shared gets tight but full VPS is not needed yet. Read more: [Cloud hosting](/diensten/cloud-hosting) · [Choose hosting](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket).",
      },
      {
        id: "host-4",
        question: "Is SSL included with hosting?",
        answer:
          "Yes. SSL is standard in our relevant hosting plans so sites run on HTTPS. Read more: [What is SSL?](/kennisbank/beveiliging/wat-is-ssl-en-waarom-heb-je-het-nodig) · [Install Let's Encrypt](/kennisbank/hosting/hoe-installeer-ik-een-gratis-lets-encrypt-ssl-certificaat).",
      },
      {
        id: "host-5",
        question: "Can you migrate my site to your hosting?",
        answer:
          "Yes. We handle backup, migration, DNS cutover, SSL and smoke tests, with minimal downtime. Read more: [Migrate website or email](/kennisbank/hosting/website-of-e-mail-verhuizen-regelen-wij-voor-je) · [Migrate WordPress](/kennisbank/domeinnamen/wordpress-website-verhuizen).",
      },
      {
        id: "host-6",
        question: "How do backups work on hosting?",
        answer:
          "That depends on the plan: simple or automated backups. Extra off-site retention is available. Read more: [JetBackup](/kennisbank/directadmin/wat-is-jetbackup-en-waar-gebruik-ik-het-voor) · [Backup in DirectAdmin](/kennisbank/directadmin/backup-maken-en-terugzetten-directadmin).",
      },
      {
        id: "host-7",
        question: "What if I get more traffic?",
        answer:
          "Then we scale to Plus, Business, cloud or VPS and optimise caching and CDN so the site can handle growth. Read more: [When to move to VPS?](/kennisbank/hosting/wanneer-stap-ik-over-van-shared-naar-vps) · [CDN](/kennisbank/cdn-performance-cloudflare/wat-een-cdn-doet-voor-je-website).",
      },
      {
        id: "host-8",
        question: "How secure is your hosting?",
        answer:
          "We use firewall, SSL, updates, monitoring and hardening. Extra security layers are available where needed. Read more: [SSL](/kennisbank/beveiliging/wat-is-ssl-en-waarom-heb-je-het-nodig) · [2FA in DirectAdmin](/kennisbank/directadmin/2fa-instellen-in-directadmin).",
      },
      {
        id: "host-9",
        question: "Can I move from shared to VPS later?",
        answer:
          "Yes. We plan the migration together, including tests and rollback, so the switch stays controlled. Read more: [Shared to VPS](/kennisbank/hosting/wanneer-stap-ik-over-van-shared-naar-vps) · [VPS hosting](/diensten/vps-hosting).",
      },
      {
        id: "host-10",
        question: "Do you support CDN?",
        answer:
          "Yes, where relevant — often a free CDN is included in WP hosting plans — for faster global delivery. Read more: [What does a CDN do?](/kennisbank/cdn-performance-cloudflare/wat-een-cdn-doet-voor-je-website) · [WordPress hosting](/diensten/wordpress-hosting).",
      },
      {
        id: "host-11",
        question: "What is your uptime approach?",
        answer:
          "We monitor, respond quickly to incidents and communicate clearly around maintenance windows so you know what is happening. Status updates are on the status page. Read more: [Status page](/statuspage) · [Contact](/contact).",
      },
      {
        id: "host-12",
        question: "How do I choose the right hosting plan?",
        answer:
          "Based on traffic, stack (WordPress or custom), resources and growth. We advise honestly — we do not oversell. Read more: [Choose the right hosting plan](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket) · [Shared vs WP vs VPS](/kennisbank/hosting/hoe-kies-ik-tussen-shared-hosting-wordpress-hosting-en-vps).",
      },
      {
        id: "host-13",
        question: "Where can I see hosting prices?",
        answer:
          "On the hosting service pages and in the shop, with monthly or yearly options where applicable. Read more: [Shared](/diensten/shared-hosting) · [Cloud](/diensten/cloud-hosting) · [WordPress](/diensten/wordpress-hosting) · [VPS](/diensten/vps-hosting) · [Shop](/shop).",
      },
      {
        id: "host-14",
        question: "Do I get SSH access on my hosting?",
        answer:
          "That depends on the plan. On many plans SSH is available or can be requested; on VPS you typically get full access. Read more: [SSH access](/kennisbank/hosting/heb-ik-ssh-toegang-op-mijn-hosting) · [VPS](/diensten/vps-hosting).",
      },
      {
        id: "host-15",
        question: "How do I install WordPress on your hosting?",
        answer:
          "Via the control panel (for example DirectAdmin/Installatron) or manually. We have a step-by-step guide. Read more: [Install WordPress](/kennisbank/wordpress/handleiding-wordpress-installeren) · [WordPress hosting](/diensten/wordpress-hosting).",
      },
      {
        id: "host-16",
        question: "What are inodes and why does my plan look “full”?",
        answer:
          "Inodes count files/folders, not only GB. Many small cache or mail files can hit the limit while disk space still looks free. Read more: [Inodes](/kennisbank/hosting/inodes-en-inode-limieten) · [Storage and traffic](/kennisbank/hosting/onbeperkte-opslag-en-dataverkeer).",
      },
      {
        id: "host-17",
        question: "What does “unlimited” storage or traffic mean?",
        answer:
          "“Unlimited” follows fair use: normal website use is fine; abuse or extreme loads may be limited to keep the platform stable. Read more: [Storage and traffic](/kennisbank/hosting/onbeperkte-opslag-en-dataverkeer).",
      },
      {
        id: "host-18",
        question: "What is the difference between shared, VPS and dedicated?",
        answer:
          "Shared shares resources; VPS isolates more CPU/RAM; dedicated is a whole server. Choose by traffic, control needs and budget. Read more: [Dedicated vs VPS vs shared](/kennisbank/infrastructuur-servers/verschil-tussen-dedicated-vps-en-shared-hosting) · [Shared/WP/VPS](/kennisbank/hosting/hoe-kies-ik-tussen-shared-hosting-wordpress-hosting-en-vps).",
      },
      {
        id: "host-19",
        question: "How do I work with DirectAdmin?",
        answer:
          "DirectAdmin is the control panel for email, DNS, databases, backups and installs. Log in with your panel credentials; we strongly recommend 2FA. Read more: [2FA in DirectAdmin](/kennisbank/directadmin/2fa-instellen-in-directadmin) · [Backups](/kennisbank/directadmin/backup-maken-en-terugzetten-directadmin).",
      },
      {
        id: "host-20",
        question: "Do you offer object cache for WordPress?",
        answer:
          "On suitable plans we support persistent object cache to reduce database queries and load faster. Read more: [Object cache](/kennisbank/hosting/persistent-object-cache-in-wordpress) · [WordPress hosting](/diensten/wordpress-hosting).",
      },
      {
        id: "host-21",
        question: "How do I renew or pay for hosting?",
        answer:
          "Via the client portal and invoices; automatic renewal is often available. Keep billing details current to avoid interruption. Read more: [Billing details](/kennisbank/crm-klantenpanel/hoe-wijzig-ik-mijn-factuurgegevens-en-betaalmethode) · [View invoices](/kennisbank/crm-klantenpanel/hoe-download-of-raadpleeg-ik-factuurdetails).",
      },
      {
        id: "host-22",
        question: "Can I put multiple domains on one hosting plan?",
        answer:
          "Often yes, via addon or parked domains — depending on plan limits. We help with connection and DNS. Read more: [Choose hosting](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket) · [Connect domain](/kennisbank/domeinnamen/domeinnaam-koppelen-aan-een-pakket).",
      },
      {
        id: "host-23",
        question: "How secure is logging in to my hosting panel?",
        answer:
          "Use a strong password and enable 2FA. Do not share panel logins over insecure channels. Read more: [2FA DirectAdmin](/kennisbank/directadmin/2fa-instellen-in-directadmin) · [Lost login](/kennisbank/crm-klantenpanel/logingegevens-klantenpanel-kwijt).",
      },
      {
        id: "host-24",
        question: "What is WordPress hosting exactly?",
        answer:
          "WordPress hosting is optimised for WP: faster PHP/stack, often CDN and simpler installs/updates than generic shared. Read more: [WP hosting plans](/kennisbank/hosting/wat-is-wordpress-hosting-basic-plus-en-pro) · [WordPress hosting](/diensten/wordpress-hosting).",
      },
      {
        id: "host-25",
        question: "Where do I order hosting directly?",
        answer:
          "In the shop or via the Shared, Cloud, WordPress and VPS hosting categories. After order you get panel and invoice access. Read more: [Shop](/shop) · [Hosting overview](/diensten/categorie/hosting).",
      },
    ],
  },
  "email-dns": {
    id: "email-dns",
    title: "Email and DNS",
    items: [
      {
        id: "mail-1",
        question: "Do you offer email with domains or hosting?",
        answer:
          "That depends on the package and setup. We advise reliable mail solutions and set DNS correctly (SPF, DKIM and DMARC). Read more: [Email on your own domain](/kennisbank/e-mail/e-mailadres-eigen-domein-wordpress) · [SPF record](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam).",
      },
      {
        id: "mail-2",
        question: "What are SPF, DKIM and DMARC?",
        answer:
          "They are DNS records that handle email authentication and reduce spoofing/spam. Without correct records, mail more often lands in spam. Read more: [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam) · [DKIM](/kennisbank/domeinnamen/dkim-record-toevoegen-aan-dns-domeinnaam) · [DMARC](/kennisbank/domeinnamen/hoe-kan-ik-een-dmarc-record-toevoegen).",
      },
      {
        id: "mail-3",
        question: "How do I manage DNS records?",
        answer:
          "Via DNS management for your domain or hosting panel you set A, AAAA, CNAME, MX and TXT records. We help with migrations and mail auth. Read more: [Manage DNS](/kennisbank/domeinnamen/dns-records-beheren) · [DNSSEC](/kennisbank/domeinnamen/wat-is-dnssec-en-hoe-voeg-ik-het-toe-aan-mijn-domein).",
      },
      {
        id: "mail-4",
        question: "Do you help solve DNS problems?",
        answer:
          "Yes. We fix records, propagation, mail auth and domain connections until DNS is correct again. Read more: [Manage DNS records](/kennisbank/domeinnamen/dns-records-beheren) · [Propagation and TTL](/kennisbank/foutmeldingen-troubleshooting/dns-propagatie-ttl-en-caches-legen).",
      },
      {
        id: "mail-5",
        question: "What is DNSSEC?",
        answer:
          "DNSSEC signs DNS answers so manipulation is harder. We can enable it where your TLD and setup support it. Read more: [DNSSEC explained](/kennisbank/domeinnamen/wat-is-dnssec-en-hoe-voeg-ik-het-toe-aan-mijn-domein).",
      },
      {
        id: "mail-6",
        question: "How do I set up email on my phone?",
        answer:
          "Use IMAP/SMTP details from your panel. For Android (and similarly on iOS) the steps are in the knowledge base. Read more: [Email on Android](/kennisbank/e-mail/e-mail-instellen-op-android) · [Email on your own domain](/kennisbank/e-mail/e-mailadres-eigen-domein-wordpress).",
      },
      {
        id: "mail-7",
        question: "What if email suddenly stops working?",
        answer:
          "Check DNS (MX/SPF/DKIM/DMARC), mailbox quota and whether providers are blocking mail. We help trace the full chain. Read more: [Email problems](/kennisbank/hosting/problemen-met-e-mail-website) · [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam).",
      },
      {
        id: "mail-8",
        question: "How do nameservers work?",
        answer:
          "Nameservers determine which DNS system serves your domain. If you change them, you must set A/MX/TXT records correctly again at the new DNS host. Read more: [Manage nameservers](/kennisbank/domeinnamen/nameservers-beheren) · [Manage DNS](/kennisbank/domeinnamen/dns-records-beheren).",
      },
      {
        id: "mail-9",
        question: "How long does DNS propagation take?",
        answer:
          "Often minutes to a few hours; sometimes up to 24–48 hours because of TTLs and caches. Lower TTLs before a migration to switch faster. Read more: [Propagation and TTL](/kennisbank/foutmeldingen-troubleshooting/dns-propagatie-ttl-en-caches-legen) · [New domain not working](/kennisbank/domeinnamen/mijn-nieuwe-domeinnaam-werkt-niet).",
      },
      {
        id: "mail-10",
        question: "Can I forward email to another address?",
        answer:
          "Yes. Forwarders send incoming mail to Gmail, Microsoft 365 or another mailbox — useful alongside or instead of a full mailbox. Read more: [Forward email](/kennisbank/e-mail/email-doorsturen-naar-mailadres).",
      },
      {
        id: "mail-11",
        question: "Can I connect my domain to Microsoft 365?",
        answer:
          "Yes. You set MX and authentication records (SPF/DKIM/DMARC) per Microsoft’s instructions; we help on the DNS side. Read more: [Domain to Microsoft 365](/kennisbank/domeinnamen/domeinnaam-koppelen-aan-microsoft-365) · [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam).",
      },
      {
        id: "mail-12",
        question: "Why does my mail end up in spam?",
        answer:
          "Often SPF/DKIM/DMARC are missing or conflicting, or IP/reputation is weak. We check DNS auth and sending behaviour. Read more: [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam) · [DKIM](/kennisbank/domeinnamen/dkim-record-toevoegen-aan-dns-domeinnaam) · [DMARC](/kennisbank/domeinnamen/hoe-kan-ik-een-dmarc-record-toevoegen).",
      },
      {
        id: "mail-13",
        question: "What is an MX record?",
        answer:
          "An MX record tells the internet which mail server may receive email for your domain. Without a correct MX, no mail arrives. Read more: [Manage DNS](/kennisbank/domeinnamen/dns-records-beheren) · [Email problems](/kennisbank/hosting/problemen-met-e-mail-website).",
      },
      {
        id: "mail-14",
        question: "Can I use webmail?",
        answer:
          "Yes, via the webmail URL of your hosting panel you can read and send mail in the browser — alongside IMAP on phone or Outlook. Read more: [Set up email](/kennisbank/e-mail/e-mail-instellen-op-android) · [Contact](/contact).",
      },
      {
        id: "mail-15",
        question: "Does DNS need to be with you if hosting is elsewhere?",
        answer:
          "No. You can keep DNS with us or elsewhere, as long as A/MX/TXT point to the right services. Consistent management prevents migration mistakes. Read more: [Manage DNS](/kennisbank/domeinnamen/dns-records-beheren) · [Nameservers](/kennisbank/domeinnamen/nameservers-beheren).",
      },
    ],
  },
};

function apply(locale, cats) {
  const path = join(DIR, `${locale}.json`);
  const pack = JSON.parse(readFileSync(path, "utf8"));
  const idx = pack.categories.findIndex((c) => c.id === "webhosting");
  if (idx < 0) throw new Error(`${locale}: webhosting category not found`);
  pack.categories.splice(idx, 1, cats.domeinen, cats.webhosting, cats["email-dns"]);
  writeFileSync(path, `${JSON.stringify(pack, null, 2)}\n`);
  const eh = ["domeinen", "webhosting", "email-dns", "support"].map((id) => {
    const c = pack.categories.find((x) => x.id === id);
    return `${id}:${c?.items.length ?? 0}`;
  });
  console.log(`wrote ${locale}:`, eh.join(", "));
}

apply("nl", NL);
apply("en", EN);
console.log("Done.");

/**
 * Generates original Dutch HTML knowledge-base articles for TripleZero iT.
 * Content is topic-driven — not copied from third-party hosts.
 */
import { buildGapArticleHtml } from "./gap-bodies";
import { agentTopicBuilders } from "./agent-bodies";
import { aeoGeoSeoTopicBuilders } from "./aeo-geo-seo-bodies";
import { aiScanTopicBuilders } from "./ai-scan-bodies";
import { bloggenTopicBuilders } from "./bloggen-bodies";
import { cyberpanelTopicBuilders } from "./cyberpanel-bodies";
import {
  directadminExcerptsNl,
  directadminTopicBuilders,
} from "./directadmin-bodies";
import {
  qualityRemainingExcerptsNl,
  qualityRemainingTopicBuilders,
} from "./quality-remaining-bodies";
import {
  qualityW2ExcerptsNl,
  qualityW2TopicBuilders,
} from "./quality-w2-bodies";
import { qualityPackExcerptsNl } from "./quality-pack-excerpts";
import {
  qualityTopicExcerptsNl,
  qualityTopicBuilders,
} from "./quality-topic-bodies";
import { microsoftTopicBuilders } from "./microsoft-bodies";
import { pleskTopicBuilders } from "./plesk-bodies";
import { veiligOnlineTopicBuilders } from "./veilig-online-bodies";
import { webdesignTopicBuilders } from "./webdesign-bodies";
import { aiIntegratieTopicBuilders } from "./ai-integratie-bodies";
import { analyticsCroTopicBuilders } from "./analytics-cro-bodies";
import { ecommerceTopicBuilders } from "./ecommerce-bodies";
import { cdnPerformanceTopicBuilders } from "./cdn-performance-bodies";
import { thickenTopicBuilders } from "./thicken-bodies";
import { infraTopicBuilders } from "./infra-bodies";
import { troubleshootingTopicBuilders } from "./troubleshooting-bodies";
import { privacyComplianceTopicBuilders } from "./privacy-compliance-bodies";
import { vergelijkingenTopicBuilders } from "./vergelijkingen-bodies";
import { wave2ThickenTopicBuilders } from "./wave2-thicken-bodies";
import { wave2RewriteTopicBuilders } from "./wave2-rewrite-bodies";

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
    `Heb je na het volgen van deze stappen nog vragen? Neem contact op met ${BRAND} support via het ticketssysteem of e-mail. Vermeld altijd je domeinnaam en een duidelijke omschrijving van het probleem, zodat we sneller kunnen helpen.`,
    related
      ? `Gerelateerd: ${related}`
      : `Bekijk ook andere artikelen in de kennisbank voor aanvullende uitleg over hosting, e-mail en beveiliging.`,
  );
}

type Ctx = { title: string; topic: string };

const topicBuilders: Record<string, (ctx: Ctx) => string> = {
  spf: () =>
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
      h2("DKIM activeren bij TripleZero iT"),
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
        `Log in met de admin- of websitegebruiker-gegevens die ${BRAND} heeft verstrekt.`,
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

  "tz-aiscan-what": () =>
    [
      p(
        `De AI-scan van ${BRAND} geeft een snelle indicatie van hoe jouw website scoort op AEO, GEO, SEO, Performance en AI Readiness. Je start de scan op de pagina <code>/ai-scan</code> met je website-URL.`,
        `Het is geen vervanging van een volledig optimalisatietraject, maar wel een helder startpunt om prioriteiten te zetten.`,
      ),
      h2("Wat de scan oplevert"),
      ul([
        "Scores per dimensie zodat je in één oogopslag ziet waar je staat.",
        "Inzicht om het gesprek met support of een specialist gerichter te maken.",
        "Geschiedenis in je account onder SEO-analyse (ingelogde klanten).",
      ]),
      warn(
        "Beschouw de AI-scan als indicatie. Voor een uitgebreid rapport en implementatie kun je contact opnemen of een pakket met AEO/GEO/SEO kiezen.",
      ),
      outro("Artikelen over scores lezen en vervolgstappen in de categorie AI-scan."),
    ].join("\n"),

  "tz-aiscan-start": () =>
    [
      p(
        `Je start een AI-scan zonder technische installatie: open <strong>AI-scan</strong> in het menu of ga naar <code>/{jouw-taal}/ai-scan</code>.`,
      ),
      h2("Stappen"),
      ol([
        "Vul de volledige website-URL in (inclusief https://).",
        "Optioneel: bedrijfsnaam en doelen, zodat we context hebben bij vervolgvragen.",
        "Start de scan en wacht tot de status op voltooid staat.",
        "Bekijk de scores en noteer de laagste dimensies als eerstvolgende verbeterpunten.",
      ]),
      tip("Gebruik de canonieke domein-URL (apex of www) die bezoekers ook zien, niet een staging-link."),
      outro(),
    ].join("\n"),

  "tz-aiscan-scores": () =>
    [
      p(
        `Na een AI-scan zie je typisch deze scores: <strong>AEO</strong>, <strong>GEO (lokaal)</strong>, <strong>SEO</strong>, <strong>Performance</strong> en <strong>AI Readiness</strong>. Hogere scores betekenen een sterkere basis; lage scores wijzen op prioriteiten.`,
      ),
      h2("Hoe je scores leest"),
      ul([
        "AEO — hoe goed je content antwoordklaar is voor AI- en antwoordengines.",
        "GEO — lokale vindbaarheid (regio, Maps, lokale relevantie).",
        "SEO — klassieke on-page en technische vindbaarheid.",
        "Performance — laadtijd en technische snelheidsindicatie.",
        "AI Readiness — of je site klaar is om AI-gedreven zichtbaarheid te ondersteunen.",
      ]),
      tip("Verbeter eerst de laagste score die het meest bijdraagt aan je businessdoel (lokaal bedrijf → GEO; contentmerk → AEO/SEO)."),
      outro(),
    ].join("\n"),

  "tz-aiscan-aeo-low": () =>
    [
      p(
        `Een lage AEO-score betekent vaak dat antwoorden, FAQ’s, duidelijke entities of structured data ontbreken. Antwoordengines kunnen je content dan minder goed gebruiken.`,
      ),
      h2("Praktische verbeteringen"),
      ol([
        "Voeg FAQ-secties toe die echte klantvragen beantwoorden.",
        "Maak pagina’s duidelijker over wie/wat/waar (bedrijf, dienst, locatie).",
        "Gebruik logische koppen (H2/H3) en korte, feitelijke antwoorden.",
        "Overweeg structured data (FAQ/Organization) waar relevant.",
        `Plan AEO-optimalisatie via ${BRAND} als je structureel wilt groeien.`,
      ]),
      outro(),
    ].join("\n"),

  "tz-aiscan-geo-low": () =>
    [
      p(
        `Een lage GEO-score wijst op zwakke lokale signalen: inconsistente NAP-gegevens, beperkte locatiepagina’s of een onderbenut Google Business Profile.`,
      ),
      h2("Lokale checklist"),
      ul([
        "Eén consistente bedrijfsnaam, adres en telefoon overal.",
        "Locatiepagina’s of duidelijke vestigingsinfo op de site.",
        "Google Business Profile volledig en actueel.",
        "Lokale landingspagina’s voor belangrijke steden/regio’s indien relevant.",
      ]),
      outro(),
    ].join("\n"),

  "tz-aiscan-seo-low": () =>
    [
      p(
        `Een lage SEO-score wijst vaak op titles/meta’s, interne links, indexeerbaarheid of technische basisproblemen.`,
      ),
      h2("Snelste winst"),
      ol([
        "Unieke title-tags en meta descriptions per belangrijke pagina.",
        "Duidelijke interne links van hub naar dienstenpagina’s.",
        "HTTPS, snelle laadtijd en mobielvriendelijke layout.",
        "Sitemap en robots.txt controleren.",
        "Overweeg SEO-optimalisatie of een pakket met SEO basic/plus.",
      ]),
      outro(),
    ].join("\n"),

  "tz-aiscan-readiness": () =>
    [
      p(
        `AI Readiness geeft aan hoe goed je site is voorbereid op AI-gedreven zoek- en antwoordervaringen: structuur, duidelijkheid, technische basis en contentkwaliteit.`,
      ),
      p(
        `Verbeter readiness door heldere dienstbeschrijvingen, actuele content, goede performance en door AEO/GEO/SEO in samenhang aan te pakken — precies waar ${BRAND}-pakketten op inzetten.`,
      ),
      outro(),
    ].join("\n"),

  "tz-aiscan-history": () =>
    [
      p(
        `Ingelogde klanten vinden eerdere scans onder <strong>SEO-analyse</strong> in het dashboard (<code>/seo-analysis</code>). Daar zie je AEO/GEO/SEO-labels en kun je opnieuw naar de AI-scan.`,
      ),
      h2("Tips"),
      ul([
        "Vergelijk scores over tijd na grotere content- of technische wijzigingen.",
        "Deel een screenshot of scan-ID in een ticket voor snellere hulp.",
      ]),
      outro(),
    ].join("\n"),

  "tz-aiscan-vs-full": () =>
    [
      p(
        `De AI-scan is een snelle indicatie. Een volledig AEO-, GEO- of SEO-traject omvat analyse, prioritering, implementatie en nazorg — via dienstenpagina’s of pakketten met AEO/GEO/SEO basic of plus.`,
      ),
      ul([
        "Scan → inzicht en prioriteiten.",
        "Dienst/pakket → uitvoering en structurele verbetering.",
        "Dashboard → voortgang en agents waar van toepassing.",
      ]),
      outro(),
    ].join("\n"),

  "tz-aiscan-next": () =>
    [
      p(`Na je AI-scan bij ${BRAND} is dit een bewezen volgorde:`),
      ol([
        "Noteer de twee laagste scores die je omzet of leads raken.",
        "Los snelle technische issues op (HTTPS, 404’s, trage homepage).",
        "Verbeter content voor AEO/SEO of lokale signalen voor GEO.",
        "Open een ticket of maak een afspraak voor een gericht plan.",
        "Overweeg Business of Extra Growth als je AEO/GEO/SEO + AI-agents structureel wilt.",
      ]),
      outro(),
    ].join("\n"),

  "tz-aeo-what": () =>
    [
      p(
        `AEO (Answer Engine Optimization) optimaliseert content zodat antwoordengines en AI-systemen jouw antwoorden betrouwbaar kunnen gebruiken — naast klassieke zoekresultaten.`,
      ),
      p(
        `Bij ${BRAND} betekent AEO o.a. antwoordklare content, FAQ’s, entity-clarity en structured data, in samenhang met SEO en GEO. Dienstpagina: <code>/diensten/aeo-optimization</code>.`,
      ),
      outro(),
    ].join("\n"),

  "tz-geo-what": () =>
    [
      p(
        `GEO (Geographic SEO) versterkt lokale vindbaarheid: Maps, local pack, Google Business Profile, NAP-consistentie en locatiepagina’s.`,
      ),
      p(
        `Relevant voor bedrijven met een regio, vestiging of lokale dienstverlening. Dienstpagina: <code>/diensten/geo-optimization</code>.`,
      ),
      outro(),
    ].join("\n"),

  "tz-seo-what": () =>
    [
      p(
        `Klassieke SEO bij ${BRAND} omvat technische basis, on-page optimalisatie, structuur en waar nodig off-page/lokale/e-commerce SEO. Losse SEO-optimalisatie is ook via de shop beschikbaar.`,
      ),
      p(`Dienst: <code>/diensten/seo-optimization</code>.`),
      outro(),
    ].join("\n"),

  "tz-aeo-geo-seo-together": () =>
    [
      p(
        `AEO, GEO en SEO versterken elkaar: SEO zorgt voor technische en inhoudelijke vindbaarheid, GEO voor lokale relevantie, AEO voor antwoordklare weergave in AI-contexten.`,
      ),
      tip(`Pakketten van ${BRAND} combineren deze lagen als basic of plus, zodat je niet in silo's werkt.`),
      outro(),
    ].join("\n"),

  "tz-aeo-content": () =>
    [
      p(`Voor AEO schrijf je content die vragen direct, feitelijk en gestructureerd beantwoordt.`),
      ol([
        "Inventariseer klantvragen (support, sales, search console).",
        "Maak FAQ-blokken met korte antwoorden bovenaan lange pagina’s.",
        "Gebruik consistente namen voor producten/diensten (entities).",
        "Voeg waar zinvol FAQ- of Organization-schema toe.",
        "Houd content actueel; verouderde feiten schaden vertrouwen.",
      ]),
      outro(),
    ].join("\n"),

  "tz-geo-local": () =>
    [
      p(`Lokale vindbaarheid begint bij consistentie en volledigheid.`),
      ul([
        "Google Business Profile: categorieën, uren, foto’s, berichten.",
        "NAP gelijk op website, directories en socials.",
        "Locatie- of regio-landingspagina’s met unieke content.",
        "Reviews beleidmatig en integer verzamelen.",
      ]),
      outro(),
    ].join("\n"),

  "tz-seo-order": () =>
    [
      p(
        `Je kunt SEO starten via de dienstenpagina, via contact/afspraak, of via de shop (SEO-optimalisatie als losse dienst). In Business/Extra Growth zit AEO/GEO/SEO basic of plus al in het pakket.`,
      ),
      ol([
        "Bepaal of je een losse SEO-klus of doorlopend pakket nodig hebt.",
        "Bestel in de shop of open een ticket met je domein en doelen.",
        "Lever toegang tot Search Console/Analytics waar gevraagd.",
      ]),
      outro(),
    ].join("\n"),

  "tz-aeo-basic-plus": () =>
    [
      p(
        `In het <strong>Business</strong>-pakket zit AEO/GEO/SEO op basic-niveau. <strong>Extra Growth</strong> bevat AEO/GEO/SEO plus — diepere optimalisatie en meer ruimte voor groei, naast 2 AI-agents in plaats van 1.`,
      ),
      tip("Twijfel je tussen basic en plus: kijk naar concurrentie in je regio en of lokale + antwoordgedreven zichtbaarheid kritiek is voor omzet."),
      outro(),
    ].join("\n"),

  "tz-aeo-measure": () =>
    [
      p(`Meet resultaat met een mix van signalen:`),
      ul([
        "Organische posities en klikken (Search Console).",
        "Lokale acties (bel/route/website) vanuit Maps/GBP.",
        "Conversies op landingspagina’s.",
        "Herhaalde AI-scans als indicatieve trend — niet als enige KPI.",
      ]),
      outro(),
    ].join("\n"),

  "tz-aeo-mistakes": () =>
    [
      p(`Veelgemaakte fouten die SEO én AEO/GEO schaden:`),
      ul([
        "Dubbele of dunne locatiepagina’s.",
        "Tegenstrijdige NAP-gegevens.",
        "Keyword stuffing zonder duidelijke antwoorden.",
        "Trage of niet-mobiele pagina’s.",
        "Meerdere SEO-plugins die elkaar tegenspreken.",
      ]),
      outro(),
    ].join("\n"),

  "tz-shop-business-growth": () =>
    [
      p(
        `Beide pakketten van ${BRAND} combineren domein, hosting, website/shop, AI-scanner, AEO/GEO/SEO en support. Het verschil zit vooral in AI-agents en diepte van AEO/GEO/SEO.`,
      ),
      ul([
        "<strong>Business</strong> — 1 AI-agent, AEO/GEO/SEO basic, vanaf €39,95/maand incl. 21% btw.",
        "<strong>Extra Growth</strong> — 2 AI-agents, AEO/GEO/SEO plus, vanaf €64,95/maand incl. 21% btw (featured).",
      ]),
      p(`Jaarbetaling: 10% korting (12 × maandprijs × 0,9).`),
      outro(),
    ].join("\n"),

  "tz-shop-business": () =>
    [
      p(`Het Business-pakket bevat o.a.:`),
      ul([
        "1× domein (.COM / .EU / .NL)",
        "1× webhosting",
        "1× shop/website",
        "1× AI-agent",
        "AI-scanner",
        "AEO/GEO/SEO basic",
        "Premium support en 24/7 monitoring",
      ]),
      p(`Prijsindicatie: €39,95 per maand incl. btw. Bestellen via de shop.`),
      outro(),
    ].join("\n"),

  "tz-shop-growth": () =>
    [
      p(`Extra Growth bouwt voort op Business met meer AI-capaciteit en sterkere zichtbaarheid:`),
      ul([
        "Zelfde basis (domein, hosting, shop/website, AI-scanner, support, monitoring)",
        "2× AI-agents",
        "AEO/GEO/SEO plus",
      ]),
      p(`Prijsindicatie: €64,95 per maand incl. btw.`),
      outro(),
    ].join("\n"),

  "tz-shop-order": () =>
    [
      p(`Bestellen doe je op <code>/shop</code> of de productpagina van het pakket.`),
      ol([
        "Kies Business of Extra Growth (en maand/jaar indien aangeboden).",
        "Voeg toe aan winkelwagen en ga naar checkout.",
        "Vul naam, e-mail en optioneel bedrijfsnaam in.",
        "Betaal via Stripe (o.a. iDEAL, Bancontact, kaart, SEPA, Klarna, PayPal).",
        `Na succes zie je de success-pagina; daarna volgt opstart/contact vanuit ${BRAND}.`,
      ]),
      outro(),
    ].join("\n"),

  "tz-shop-checkout": () =>
    [
      p(
        `De checkout van ${BRAND} loopt via Stripe Checkout (eenmalige betaling). Je ziet een specificatie met bedragen excl. btw, btw en totaal incl. btw.`,
      ),
      tip("Gebruik het e-mailadres waarmee je ook je klantaccount wilt koppelen, zodat facturen en berichten kloppen."),
      outro(),
    ].join("\n"),

  "tz-shop-vat": () =>
    [
      p(
        `Shopprijzen bij ${BRAND} zijn <strong>inclusief 21% btw</strong>. In de checkout en op documentatie zie je de uitsplitsing excl./btw/incl. voor transparantie.`,
      ),
      p(`Zakelijke vragen over factuurgegevens regel je in het CRM/klantenpanel of via een ticket.`),
      outro(),
    ].join("\n"),

  "tz-shop-yearly": () =>
    [
      p(
        `Bij jaarbetaling geldt 10% korting: maandprijs × 12 × 0,9. Voor Business is dat ongeveer €431,46/jaar; voor Extra Growth ongeveer €701,46/jaar (incl. btw, afronding kan licht verschillen).`,
      ),
      outro(),
    ].join("\n"),

  "tz-shop-after": () =>
    [
      p(`Na een geslaagde betaling:`),
      ol([
        "Je landt op de success-pagina van de shop.",
        "Je ontvangt bevestiging per e-mail.",
        `${BRAND} start provisioning (domein/hosting/site/agents naar gelang pakket).`,
        "Je gebruikt daarna dashboard, CRM, tickets en AI-scan voor vervolg.",
      ]),
      outro(),
    ].join("\n"),

  "tz-shop-addons": () =>
    [
      p(
        `Naast pakketten verkoopt de shop losse diensten (o.a. hosting-SKU’s, WordPress-diensten, SEO-optimalisatie). Die kun je combineren met een pakket wanneer je extra capaciteit of een eenmalig project nodig hebt.`,
      ),
      outro(),
    ].join("\n"),

  "tz-shop-enterprise": () =>
    [
      p(
        `Enterprise is bedoeld voor maatwerk zonder vaste shopprijs. Neem contact op of maak een afspraak wanneer je meerdere merken, complexe AI-integraties of custom SLA’s nodig hebt.`,
      ),
      outro(),
    ].join("\n"),

  "tz-host-choose": () =>
    [
      p(`Kies hosting op basis van verkeer, technische eisen en beheer:`),
      ul([
        "<strong>Shared</strong> — voordelig voor kleinere sites; resources gedeeld.",
        "<strong>WordPress hosting</strong> — geoptimaliseerd voor WordPress (bezoekerslimieten, CDN/SSL in hogere tiers).",
        "<strong>VPS</strong> — vaste cores/SSD, meer controle en headroom bij groei.",
      ]),
      tip("Onzeker? Start met WordPress hosting als je WP draait; kies VPS bij structureel hoge load of custom stacks."),
      outro(),
    ].join("\n"),

  "tz-host-shared": () =>
    [
      p(`Shared hosting bij ${BRAND} (indicatieve shoptiers):`),
      ul([
        "Basic — o.a. tot 3 sites / circa 20 GB",
        "Plus — ruimere limieten (onbeperkt in marketingcopy waar van toepassing)",
        "Business — meer opslag (o.a. 50 GB) en extra’s zoals cloud storage afhankelijk van SKU",
      ]),
      p(`Exacte limieten staan op de productpagina in de shop.`),
      outro(),
    ].join("\n"),

  "tz-host-wp": () =>
    [
      p(
        `WordPress hosting Basic / Plus / Pro is afgestemd op WordPress-verkeer, SSL/CDN en beheercomfort. Pro (Business-SKU) biedt de meeste headroom.`,
      ),
      outro(),
    ].join("\n"),

  "tz-host-vps": () =>
    [
      p(
        `VPS Basic / Plus / Business schalen in cores en SSD (RAID 10). Kies VPS bij hogere concurrentie, custom software of wanneer shared te krap wordt.`,
      ),
      outro(),
    ].join("\n"),

  "tz-host-upgrade": () =>
    [
      p(`Signalen om te upgraden naar VPS:`),
      ul([
        "Structureel hoge CPU/RAM of 503-fouten bij pieken",
        "Zwaardere webshop of veel gelijktijdige gebruikers",
        "Behoefte aan eigen serverconfiguratie",
      ]),
      p(`Open een ticket met je domein en resourcegrafieken; ${BRAND} helpt bij de migratiekeuze.`),
      outro(),
    ].join("\n"),

  "tz-host-in-plan": () =>
    [
      p(
        `Business/Extra Growth bevatten webhosting als onderdeel van het totaalpakket. Losse shared/WP/VPS-SKU’s in de shop zijn voor wie alleen hosting nodig heeft of wil bijschalen buiten het pakket.`,
      ),
      outro(),
    ].join("\n"),

  "tz-chat-what": () =>
    [
      p(
        `Op publieke pagina’s van ${BRAND} staat een live-chatwidget. Die is verborgen op login- en dashboard-/CRM-schermen, zodat je daar het ticketportaal gebruikt.`,
      ),
      outro(),
    ].join("\n"),

  "tz-chat-start": () =>
    [
      p(`Als gast start je chat met naam en e-mail. Daarna stel je je vraag in de chatmodus of kies je expliciet voor een nieuw ticket.`),
      tip("Gebruik een bereikbaar e-mailadres; chatgesprekken worden gekoppeld aan een ticketregistratie."),
      outro(),
    ].join("\n"),

  "tz-chat-to-ticket": () =>
    [
      p(
        `Live chat wordt server-side als ticket geregistreerd (bron: CHAT). Zo blijft de geschiedenis bewaard en kun je later verder in <code>/crm/tickets</code>.`,
      ),
      outro(),
    ].join("\n"),

  "tz-ticket-open": () =>
    [
      p(`Ingelogde klanten openen tickets via <strong>CRM → Tickets</strong> (of snelkoppeling vanaf het dashboard).`),
      ol([
        "Ga naar Tickets.",
        "Maak een nieuw ticket met duidelijk onderwerp.",
        "Beschrijf het probleem, domein, tijdstip en eventuele foutmelding.",
        "Verstuur; status start doorgaans als Open.",
      ]),
      outro(),
    ].join("\n"),

  "tz-ticket-status": () =>
    [
      p(`Statussen die je kunt tegenkomen:`),
      ul([
        "OPEN — nieuw / wacht op opvolging",
        "IN_PROGRESS — in behandeling",
        "WAITING — wacht op jouw antwoord of externe info",
        "RESOLVED — opgelost",
        "CLOSED — afgesloten",
      ]),
      outro(),
    ].join("\n"),

  "tz-ticket-reply": () =>
    [
      p(
        `Open het ticket en plaats een antwoord in de berichtenfeed. Het portaal vernieuwt regelmatig (polling), zodat nieuwe staff-antwoorden zichtbaar worden zonder de pagina te herladen.`,
      ),
      outro(),
    ].join("\n"),

  "tz-ticket-list": () =>
    [
      p(`Alle tickets staan onder <code>/crm/tickets</code>. Filter op status en open het juiste gesprek om verder te gaan waar live chat of een eerdere melding stopte.`),
      outro(),
    ].join("\n"),

  "tz-support-channels": () =>
    [
      p(`Kies het juiste kanaal:`),
      ul([
        "Live chat — korte vragen tijdens bezoek aan de site",
        "Ticket — storingen, accountzaken, technische diepgang",
        "Belafspraak / contact — strategie, complexe trajecten",
        "Kennisbank — self-service stappenplannen",
      ]),
      outro(),
    ].join("\n"),

  "tz-agents-what": () =>
    [
      p(
        `AI-agents zijn digitale helpers in je ${BRAND}-account die taken ondersteunen binnen je pakket (bijv. marketing- of zichtbaarheidsgerelateerde workflows). Je beheert ze onder <code>/ai-agents</code>.`,
      ),
      outro(),
    ].join("\n"),

  "tz-agents-quota": () =>
    [
      p(`Indicatie binnen de shoppakketten:`),
      ul([
        "Business — 1 AI-agent",
        "Extra Growth — 2 AI-agents",
      ]),
      p(`Heb je meer nodig, bespreek opschaling via support of Enterprise.`),
      outro(),
    ].join("\n"),

  "tz-agents-open": () =>
    [
      p(`Log in en open <strong>AI-agents</strong> in het dashboard-menu, of ga naar <code>/ai-agents</code>. Je ziet alleen agents binnen jouw account (eigen scope).`),
      outro(),
    ].join("\n"),

  "tz-agents-control": () =>
    [
      p(`Per agent kun je typisch:`),
      ul([
        "Start — status RUNNING",
        "Pause — status PAUSED",
        "Idle — status IDLE",
      ]),
      tip("Pauzeer agents tijdens groot onderhoud of migraties om conflicterende taken te voorkomen."),
      outro(),
    ].join("\n"),

  "tz-agents-status": () =>
    [
      p(`Statusuitleg:`),
      ul([
        "RUNNING — actief taken aan het uitvoeren/beschikbaar",
        "PAUSED — tijdelijk gestopt",
        "IDLE — geen actieve run",
      ]),
      p(`Je ziet ook type en voltooide taken in de lijstweergave.`),
      outro(),
    ].join("\n"),

  "tz-agents-empty": () =>
    [
      p(
        `Zie je “Nog geen agents”? Dan zijn ze nog niet provisioned, of je pakket bevat ze (nog) niet. Open een ticket met je bestelling/pakketnaam; ${BRAND} koppelt agents aan je account.`,
      ),
      outro(),
    ].join("\n"),

  "tz-agents-use": () =>
    [
      p(
        `AI-agents passen bij doorlopende zichtbaarheid en marketing naast AEO/GEO/SEO. Gebruik ze als aanvulling op content- en lokale strategie — niet als vervanging van technische SEO-fixes.`,
      ),
      outro(),
    ].join("\n"),

  "tz-crm-dashboard": () =>
    [
      p(
        `Het CRM-overzicht (<code>/crm</code>) toont open tickets, facturen, ongelezen berichten en projecten — met snelle CTA’s om bijvoorbeeld een ticket te openen.`,
      ),
      outro(),
    ].join("\n"),

  "tz-crm-invoices-view": () =>
    [
      p(
        `Facturen vind je onder <strong>CRM → Facturen</strong>. Als klant bekijk je facturen die aan je account/e-mail gekoppeld zijn; aanmaken doet staff.`,
      ),
      outro(),
    ].join("\n"),

  "tz-crm-invoices-detail": () =>
    [
      p(`Open een factuur voor details en status. Vragen over betaling of gegevens? Stuur een ticket of bericht via CRM-berichten.`),
      outro(),
    ].join("\n"),

  "tz-crm-messages": () =>
    [
      p(
        `Onder <strong>Berichten</strong> lees je je inbox en stel je berichten op naar het juiste teamlid. Dit is bedoeld voor accountcommunicatie naast tickets.`,
      ),
      outro(),
    ].join("\n"),

  "tz-crm-unread": () =>
    [
      p(`Het CRM-overzicht toont ongelezen berichten. Werk ze bij zodat deadlines en opleveringen niet blijven liggen.`),
      outro(),
    ].join("\n"),

  "tz-crm-projects-create": () =>
    [
      p(
        `Projecten beheer je via <code>/projects</code>. Je kunt projecten aanmaken met types zoals website, SEO, ads of AI-integratie — afhankelijk van wat je samen met ${BRAND} draait.`,
      ),
      outro(),
    ].join("\n"),

  "tz-crm-projects-status": () =>
    [
      p(`Open een project voor detailstatus en opvolging. Gebruik berichten of tickets voor blokkades die snelle actie nodig hebben.`),
      outro(),
    ].join("\n"),

  "tz-crm-quicklinks": () =>
    [
      p(`Vanaf het klant-dashboard heb je snelle links naar o.a. projecten, tickets, CRM, SEO-analyse, AI-scan en AI-agents — zodat je niet hoeft te zoeken.`),
      outro(),
    ].join("\n"),

  "tz-crm-classic-vs-new": () =>
    [
      p(
        `Klassieke klantenpanel-taken (DNS, WHOIS, opzeggen, autorisatiecodes) blijven relevant voor domeinbeheer. Het moderne CRM voegt tickets, facturen, berichten, projecten en AI-tools toe in één portaal.`,
      ),
      outro(),
    ].join("\n"),

  "tz-crm-support-fast": () =>
    [
      p(`Snelste route voor storingen:`),
      ol([
        "Open CRM → Tickets (of dashboard-CTA).",
        "Vermeld domein, tijdstip en fout.",
        "Voeg screenshots toe indien mogelijk.",
        "Kies chat alleen voor korte vragen tijdens browsen.",
      ]),
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
  if (/cname|a-record|dnssec|nameserver|mx-record|txt-record|zone/.test(lower)) {
    focusBlocks.push(
      h2("DNS-records in de praktijk"),
      p(
        `Open DNS-beheer in het klantenpanel of DirectAdmin/CyberPanel/Plesk. Wijzig één record tegelijk, noteer de oude waarde, en wacht op propagatie voordat je concludeert dat iets mislukte.`,
        `Voor CNAME geldt: gebruik geen CNAME op de apex (@) tenzij je provider ALIAS/ANAME ondersteunt. A-records wijzen naar een IPv4-adres; AAAA naar IPv6.`,
      ),
    );
  }
  if (/woocommerce|webshop|seo|analytics|cookie|gdpr|avg|page.?builder|meertalig|staging/.test(lower)) {
    focusBlocks.push(
      h2("WordPress-uitbreidingen"),
      p(
        `Installeer plugins bij voorkeur vanuit de officiële repository of betrouwbare vendors. Test op staging, maak een backup en controleer na activatie formulieren, checkout en caching.`,
        `Voor SEO, cookies (AVG) en analytics: plaats tracking pas ná toestemming waar wetgeving dat vereist, en vermijd overlappende SEO-plugins.`,
      ),
    );
  }
  if (/ddos|firewall|csp|sql.?inject|sftp|chmod|brute.?force|malware|phishing|vpn|wachtwoord/.test(lower)) {
    focusBlocks.push(
      h2("Hardening checklist"),
      ul([
        "Werk software bij en verwijder ongebruikte plugins/thema’s.",
        "Gebruik unieke sterke wachtwoorden en 2FA waar beschikbaar.",
        "Beperk admin-URL’s, XML-RPC en onnodige poorten.",
        "Monitor logs en reageer snel op verdachte pieken in verkeer of CPU.",
      ]),
    );
  }
  if (/factuur|ticket|klantenpanel|belafspraak|support.?tijd|nieuwsbrief/.test(lower)) {
    focusBlocks.push(
      h2("Klantenservice en accountbeheer"),
      p(
        `In het TripleZero iT klantenpanel regel je facturen, betaalmethoden, tickets en accountinstellingen. Vermeld altijd je klantnummer of domeinnaam in tickets voor snellere opvolging.`,
        `Supporttijden en belafspraken staan in je welkomstmail en op de contactpagina; voor spoed bij uitval: ticket met impact en tijdstip van de storing.`,
      ),
    );
  }
  if (/plesk/.test(lower)) {
    focusBlocks.push(
      h2("Werken in Plesk"),
      p(
        `Log in via de Plesk-URL uit je welkomstmail. Selecteer het juiste abonnement/abonnementdomein voordat je e-mail, databases of DNS wijzigt. Reseller-accounts zien meerdere klantaccounts — werk nooit in het verkeerde subscription.`,
      ),
    );
  }
  if (/ai-scan|aeo|geo|seo-analyse|ai-agent|business-pakket|extra growth|checkout|btw|ticket|live.?chat|crm|factuur|vps/.test(lower) || topic.startsWith("tz-")) {
    focusBlocks.push(
      h2("TripleZero iT-platform"),
      p(
        `Deze handleiding hoort bij het ${BRAND}-platform: shop/pakketten, AI-scan, AEO/GEO/SEO, AI-agents, CRM (facturen, berichten, projecten) en tickets/live chat. Gebruik altijd de menu’s in je ingelogde dashboard voor actuele schermen.`,
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

function englishGenericBody({ title, topic }: Ctx): string {
  const panel = /cyberpanel/i.test(topic)
    ? "CyberPanel"
    : /plesk/i.test(topic)
      ? "Plesk"
      : "DirectAdmin";

  return [
    p(
      `This ${BRAND} knowledge-base article explains: <strong>${title}</strong>. We cover the goal, preparation and a clear workflow you can follow step by step.`,
      `This guide is written for ${BRAND} customers and assumes common setups on shared hosting, reseller environments and control panels such as DirectAdmin, CyberPanel and Plesk.`,
    ),
    h2("What you need"),
    ul([
      `Access to ${panel} or the ${BRAND} client panel.`,
      "Your domain name and any login or mailbox credentials.",
      "An up-to-date browser and, where relevant, FTP/SSH access.",
      "Preferably a recent backup before you make structural changes.",
    ]),
    h2("Step-by-step approach"),
    ol([
      `Sign in to the correct panel at ${BRAND} and select the domain or account the change applies to.`,
      "Confirm you are in the right environment (production versus test) and note the current settings.",
      `Carry out the action that matches “${title}”. Work carefully and avoid changing multiple critical options at once.`,
      "Save your changes and test the result: website, email or DNS — depending on the topic.",
      "Document what you changed so you can roll back later or help support resolve issues faster.",
    ]),
    h2("Deeper explanation"),
    p(
      `The topic “${title}” often touches multiple layers: DNS, web server, mail server, application (for example WordPress) and account limits. Issues usually appear when one layer changes without checking the others.`,
      `At ${BRAND} we recommend verifying that DNS points to the correct nameservers first, then reviewing control-panel settings, and only then changing application settings (plugins, themes, .htaccess).`,
    ),
    h3("Checklist afterwards"),
    ul([
      "Does the website work over HTTP and HTTPS without certificate errors?",
      "Do test emails arrive and avoid the spam folder?",
      "Are limits (disk, inodes, bandwidth) still within your plan?",
      "Are there no unintended redirects, firewall blocks or PHP errors in the logs?",
    ]),
    h2("Common pitfalls"),
    ul([
      "DNS propagation: changes are not visible everywhere immediately.",
      "Wrong domain or user selected in a reseller environment.",
      "Cache (browser, CDN, LiteSpeed/OpenLiteSpeed, WordPress plugins) showing old content.",
      "Missing folder permissions or an incorrect document root.",
    ]),
    `<aside class="kb-callout kb-callout-tip"><p><strong>Tip:</strong> Take a backup via DirectAdmin, CyberPanel, JetBackup or Installatron before risky steps so you can restore a working state quickly.</p></aside>`,
    `<aside class="kb-callout kb-callout-warn"><p><strong>Note:</strong> Never reuse passwords across services. Enable 2FA on the client panel and control panel wherever possible.</p></aside>`,
    h2("When to contact support"),
    p(
      `If you are stuck after these steps — for example with persistent mail errors, SSL issues or an unreachable site — open a ticket with ${BRAND}. Include the domain name, time, error message (screenshot or exact text) and what you already tried.`,
    ),
    p(
      `Still have questions after following these steps? Contact ${BRAND} support via the ticket system or email. Always mention your domain name and a clear description of the issue so we can help faster.`,
      `Also browse other articles in the knowledge base for additional guidance on hosting, email and security.`,
    ),
  ].join("\n");
}

export function buildArticleHtml(
  title: string,
  topic: string,
  locale: string = "nl",
): string {
  const ctx = { title, topic };
  if (locale !== "nl") {
    return englishGenericBody(ctx);
  }
  // Topic-sense / strict bodies override when present (incl. explain/compare without fake stappen).
  // Hand-crafted DirectAdmin builders apply only when no qualityTopic entry exists.
  const topicSenseBuilder = qualityTopicBuilders[topic];
  if (topicSenseBuilder) return topicSenseBuilder(ctx);
  const daBuilder = directadminTopicBuilders[topic];
  if (daBuilder) return daBuilder(ctx);
  const qualityBuilder = qualityRemainingTopicBuilders[topic];
  if (qualityBuilder) return qualityBuilder(ctx);
  const qualityW2Builder = qualityW2TopicBuilders[topic];
  if (qualityW2Builder) return qualityW2Builder(ctx);
  if (topic.startsWith("gap-")) {
    return buildGapArticleHtml(title, topic);
  }
  const builder =
    topicBuilders[topic] ||
    agentTopicBuilders[topic] ||
    aeoGeoSeoTopicBuilders[topic] ||
    aiScanTopicBuilders[topic] ||
    bloggenTopicBuilders[topic] ||
    cyberpanelTopicBuilders[topic] ||
    microsoftTopicBuilders[topic] ||
    pleskTopicBuilders[topic] ||
    veiligOnlineTopicBuilders[topic] ||
    webdesignTopicBuilders[topic] ||
    aiIntegratieTopicBuilders[topic] ||
    analyticsCroTopicBuilders[topic] ||
    ecommerceTopicBuilders[topic] ||
    cdnPerformanceTopicBuilders[topic] ||
    thickenTopicBuilders[topic] ||
    infraTopicBuilders[topic] ||
    troubleshootingTopicBuilders[topic] ||
    privacyComplianceTopicBuilders[topic] ||
    vergelijkingenTopicBuilders[topic] ||
    wave2ThickenTopicBuilders[topic] ||
    wave2RewriteTopicBuilders[topic];
  if (builder) return builder(ctx);
  return genericBody(ctx);
}

export function buildExcerpt(
  title: string,
  locale: string = "nl",
  topic?: string,
): string {
  if (locale === "nl" && topic && directadminExcerptsNl[topic]) {
    return directadminExcerptsNl[topic];
  }
  if (locale === "nl" && topic && qualityTopicExcerptsNl[topic]) {
    return qualityTopicExcerptsNl[topic];
  }
  if (locale === "nl" && topic && qualityRemainingExcerptsNl[topic]) {
    return qualityRemainingExcerptsNl[topic];
  }
  if (locale === "nl" && topic && qualityW2ExcerptsNl[topic]) {
    return qualityW2ExcerptsNl[topic];
  }
  if (locale === "nl" && topic && qualityPackExcerptsNl[topic]) {
    return qualityPackExcerptsNl[topic];
  }
  const topicLabel = title.replace(/\?$/, "").trim();
  if (locale !== "nl") {
    return `${topicLabel}. Step-by-step explanation, key checks and tips for a stable configuration.`;
  }
  return `${topicLabel}: praktische handleiding van TripleZero iT met stappen, controles en wanneer je support inschakelt.`;
}

/**
 * Dutch kennisbank bodies for AI-scan topics (TripleZero iT free readiness scan).
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
    `Heb je na het volgen van deze stappen nog vragen? Neem contact op met TripleZero iT support via het ticketssysteem of via het contactformulier na je scan. Vermeld je website-URL en scores, zodat we sneller kunnen helpen.`,
    related
      ? `Gerelateerd: ${related}`
      : `Bekijk ook andere artikelen in de categorie AI-scan voor scores, verbeteringen en oplossingen.`,
  );
}

type Ctx = { title: string; topic: string };

export const aiScanTopicBuilders: Record<string, (ctx: Ctx) => string> = {
  "tz-aiscan-free-what": () =>
    [
      p(
        `De AI-scan op <code>/ai-scan</code> is bij TripleZero iT gratis te starten: je vult een website-URL in en krijgt een scorekaart over AEO, GEO (lokaal), SEO, Performance en AI Readiness.`,
        `Je krijgt geen volledige implementatie of doorlopend traject “gratis” — wel een heldere baseline en een startpunt voor gesprek of vervolgstappen.`,
      ),
      h2("Wat je precies krijgt"),
      ul([
        "Scores per dimensie (indicatief, geen rankinggarantie).",
        "Inzicht om prioriteiten te zetten (waar eerst aan werken).",
        "Optioneel: direct contact over de resultaten via het formulier na de scan.",
        "Ingelogde klanten: geschiedenis onder SEO-analyse in het dashboard.",
      ]),
      h2("Wat je niet automatisch krijgt"),
      ul([
        "Geen volledige content- of technische implementatie.",
        "Geen garantie op klikken, leads of AI-citaties.",
        "Geen vervanging van AEO/GEO/SEO basic of plus in een pakket.",
      ]),
      tip(
        "Business- en Extra Growth-pakketten bevatten de AI-scanner als onderdeel van het platform — naast AEO/GEO/SEO en AI-agents.",
      ),
      outro("Pakketten met AI-scanner; AI-scan versus volledig traject."),
    ].join("\n"),

  "tz-aiscan-which-url": () =>
    [
      p(
        `Scan altijd de URL die bezoekers en zoekmachines écht zien. Verkeerde URL’s geven misleidende scores.`,
      ),
      h2("Aanbevolen"),
      ol([
        "Gebruik de canonieke productie-URL, inclusief <code>https://</code>.",
        "Kies apex (<code>voorbeeld.nl</code>) of www — precies zoals je redirect/canonical is ingesteld.",
        "Vermijd staging, preview, IP-adressen of tijdelijke ontwikkelomgevingen.",
        "Scan geen loginpagina’s of wachtwoordbeveiligde omgevingen als je de publieke site wilt meten.",
      ]),
      warn(
        "Een staging-site kan technisch “gezond” lijken terwijl productie trager is of andere content heeft. Scan productie voor beslissingen.",
      ),
      tip("Twijfel je tussen www en non-www? Open beide in de browser: welke redirect wint, die scan je."),
      outro("Hoe start ik een AI-scan; scan mislukt of blijft hangen."),
    ].join("\n"),

  "tz-aiscan-company-goals": () =>
    [
      p(
        `Bedrijfsnaam en doelen zijn optioneel bij de AI-scan, maar helpen bij context: wie je bent, wat je wilt verbeteren en hoe TripleZero iT een vervolggesprek kan voeren.`,
      ),
      h2("Waarom het nuttig is"),
      ul([
        "Duidelijker contactbericht na de scan (URL + scores + jouw doelen).",
        "Betere prioritering: lokaal leads winnen vraagt andere focus dan landelijke contentautoriteit.",
        "Minder heen-en-weer in tickets of intakes.",
      ]),
      h2("Voorbeelden van doelen"),
      ul([
        "Meer lokale aanvragen in regio X.",
        "Beter zichtbaar in AI-antwoorden op dienstvragen.",
        "Technische basis verbeteren voor een redesign.",
        "Baseline voor een klant (bureau) vóór een traject.",
      ]),
      tip("Eén zin over je primaire doel is genoeg — geen lang businessplan."),
      outro("Contact over scanresultaten; scorekaart lokaal versus landelijk."),
    ].join("\n"),

  "tz-aiscan-how-often": () =>
    [
      p(
        `Herhaal een AI-scan wanneer er iets wezenlijks verandert — of periodiek als je actief aan vindbaarheid werkt. Te vaak scannen zonder wijzigingen levert weinig nieuwe inzichten.`,
      ),
      h2("Goede momenten"),
      ul([
        "Na een website-lancering of redesign.",
        "Na grote content- of structuurwijzigingen (diensten, FAQ, locatiepagina’s).",
        "Voor en na een AEO/GEO/SEO-sprint.",
        "Bij de start van campagnes of nieuwe markten.",
      ]),
      h2("Richtlijn"),
      ul([
        "Actieve merken: bijvoorbeeld elk kwartaal, of na elke grotere release.",
        "Stabiele sites: bij wijzigingen of als je scores al een tijd niet hebt gecheckt.",
        "Vergelijk scores als trend — niet als enige KPI.",
      ]),
      tip("Noteer scan-datum en wat je tussentijds hebt gewijzigd, zodat verbetering of daling verklaarbaar is."),
      outro("Meten na aanpassingen; eerdere scans in SEO-analyse."),
    ].join("\n"),

  "tz-aiscan-perf-low": () =>
    [
      p(
        `Een lage Performance-score in de AI-scan wijst op een zwakke technische snelheids- of UX-indicatie: trage laadtijd, zware pagina’s of problemen die ook SEO en AI Readiness kunnen drukken.`,
      ),
      h2("Praktische verbeteringen"),
      ol([
        "Comprimeer en resize afbeeldingen; gebruik moderne formaten waar mogelijk.",
        "Beperk zware scripts, ongebruikte plugins en blocking resources op de homepage.",
        "Controleer hosting, caching (server/CDN/WordPress) en HTTPS-redirects.",
        "Test mobiel: veel bezoekers en rankingsignalen beginnen daar.",
        "Los kritieke fouten op (404’s, trage TTFB) voordat je content optimaliseert.",
      ]),
      warn(
        "Performance is een indicatie in de AI-scan, geen volledige lab-run zoals een dedicated PageSpeed-audit. Gebruik het als prioriteitssignaal.",
      ),
      outro("Lage SEO-score; snelle fixes na een AI-scan."),
    ].join("\n"),

  "tz-aiscan-prioritize": () =>
    [
      p(
        `Als meerdere scores laag zijn, werk je niet alles tegelijk af. Kies wat het dichtst bij je businessdoel ligt en wat snel technische risico’s wegneemt.`,
      ),
      h2("Prioriteitsregel"),
      ol([
        "Fix blockers eerst: HTTPS, bereikbaarheid, ernstige performance of indexeerbaarheid.",
        "Koppel scores aan je doel: lokaal bedrijf → GEO; antwoordzichtbaarheid → AEO; klassieke organische groei → SEO.",
        "Pak daarna AI Readiness als samenhangende score (structuur + content + techniek).",
        "Plan structureel werk via AEO/GEO/SEO-dienst of pakket — scan blijft je meetpunt.",
      ]),
      h2("Voorbeeld"),
      ul([
        "Lokale installateur met lage GEO én Performance → eerst snelheid/basis, dan NAP/Maps/locatiepagina’s.",
        "SaaS met lage AEO én SEO → FAQ/entity-clarity + titles/interne links, daarna dieper traject.",
      ]),
      tip("Noteer maximaal twee “eerst”-scores. Meer dan dat versnippert focus."),
      outro("Vervolgstappen na AI-scan; kiezen tussen AEO/GEO/SEO-optimalisatie."),
    ].join("\n"),

  "tz-aiscan-seo-vs-readiness": () =>
    [
      p(
        `SEO-score en AI Readiness overlappen deels, maar meten iets anders. SEO kijkt vooral naar klassieke vindbaarheid; AI Readiness naar of je site klaar is voor AI-gedreven zoek- en antwoordervaringen.`,
      ),
      h2("SEO-score (indicatief)"),
      ul([
        "Titles, meta’s, structuur, crawlbaarheid, on-page duidelijkheid.",
        "Technische basis die klassieke zoekmachines nodig hebben.",
      ]),
      h2("AI Readiness (indicatief)"),
      ul([
        "Of content antwoordklaar en helder is (wie/wat/waar).",
        "Of structuur, performance en AEO/GEO/SEO samen AI-zichtbaarheid ondersteunen.",
        "Of je site “begrijpelijk” is voor extractie en samenvatting door AI-systemen.",
      ]),
      tip(
        "Een redelijke SEO-score met lage AI Readiness komt vaak voor: klassieke on-page is oké, maar FAQ’s, entities of antwoordstructuur ontbreken.",
      ),
      outro("Wat is AI Readiness; lage AEO-score verbeteren."),
    ].join("\n"),

  "tz-aiscan-local-vs-national": () =>
    [
      p(
        `Dezelfde scorekaart betekent iets anders voor een lokaal bedrijf dan voor een landelijk of online merk. Lees scores altijd tegen je markt.`,
      ),
      h2("Lokaal bedrijf"),
      ul([
        "GEO weegt zwaar: NAP, Google Business Profile, locatiepagina’s, lokale intent.",
        "AEO helpt bij “wie in mijn buurt / beste X in regio Y”-vragen.",
        "Performance en SEO blijven nodig, maar GEO-gaten raken leads sneller.",
      ]),
      h2("Landelijk / digitaal merk"),
      ul([
        "SEO en AEO wegen zwaarder: topical authority, FAQ’s, entity-clarity.",
        "GEO kan lager zijn zonder dat dat “fout” is — tenzij je regio’s of vestigingen bedient.",
        "AI Readiness toont of je content klaar is voor AI-antwoorden op landelijke vragen.",
      ]),
      tip("Vul bij de scan je doelen in (lokaal vs landelijk) zodat vervolgadvies scherper is."),
      outro("Lage GEO-score; prioriteren bij meerdere lage scores."),
    ].join("\n"),

  "tz-aiscan-quick-wins": () =>
    [
      p(
        `Na een AI-scan wil je vaak snel resultaat zien. Focus op fixes die weinig afhankelijkheden hebben en meerdere scores tegelijk kunnen tillen.`,
      ),
      h2("Snelle winst (vaak binnen dagen)"),
      ol([
        "Unieke title + meta per belangrijke pagina.",
        "FAQ-blokken met echte klantvragen en korte, feitelijke antwoorden.",
        "Consistente bedrijfsnaam, adres en telefoon (NAP) op site en directories.",
        "Afbeeldingen verkleinen en caching controleren (Performance).",
        "Duidelijke “wie wij zijn / wat we doen / waar” op homepage en diensten.",
      ]),
      h2("Bewaar voor het traject"),
      ul([
        "Grote contentarchitectuur of nieuwe locatiehubs.",
        "Diepe technische migraties of volledige redesign.",
        "Doorlopende agent-workflows en AEO/GEO/SEO-plus implementatie.",
      ]),
      tip("Herhaal de scan na de snelle fixes — niet na elke tipregel."),
      outro("Vervolgstappen; Performance verbeteren."),
    ].join("\n"),

  "tz-aiscan-improve-readiness": () =>
    [
      p(
        `AI Readiness verbeteren betekent je site begrijpelijker, sneller en antwoordklaarder maken — niet “meer AI-tekst” zonder structuur.`,
      ),
      h2("Concrete acties"),
      ol([
        "Schrijf dienst- en productpagina’s in heldere taal: probleem, oplossing, voor wie, waar.",
        "Voeg FAQ’s toe die matchen met hoe klanten vragen stellen (ook in AI-chats).",
        "Versterk entity-signalen: Organisatie, contact, vestiging, merknamen consistent.",
        "Verbeter performance en mobiele UX — trage sites remmen readiness.",
        "Stem AEO, GEO en SEO af: één backlog, geen losse silo’s.",
      ]),
      tip(
        `Pakketten van TripleZero iT combineren AI-scanner met AEO/GEO/SEO basic of plus — ideaal als readiness structureel omhoog moet.`,
      ),
      outro("Wat is AI Readiness; AI-scan versus volledig traject."),
    ].join("\n"),

  "tz-aiscan-measure-after": () =>
    [
      p(
        `Meten na aanpassingen: herhaal de AI-scan op dezelfde canonieke URL en vergelijk scores over tijd. Combineer dat met Search Console, analytics en (lokaal) Maps-inzichten.`,
      ),
      h2("Werkwijze"),
      ol([
        "Noteer baseline: datum, URL, vijf scores.",
        "Voer een begrensde set wijzigingen door (niet alles tegelijk).",
        "Wacht tot caches/CDN/DNS zijn bijgewerkt; test de live site.",
        "Scan opnieuw en noteer delta’s per dimensie.",
        "Beoordeel business-impact: leads, calls, organic sessions — niet alleen scores.",
      ]),
      warn(
        "Scores zijn indicatief. Kleine schommelingen zijn normaal; kijk naar richting na echte wijzigingen.",
      ),
      tip("Ingelogde klanten bewaren historie onder SEO-analyse — handig voor tickets en reviews."),
      outro("Hoe vaak scannen; eerdere scans in het dashboard."),
    ].join("\n"),

  "tz-aiscan-homepage-vs-services": () =>
    [
      p(
        `De AI-scan start vanaf de URL die je invoert (vaak de homepage). Een sterke homepage met zwakke diensten- of locatiepagina’s komt vaak voor: de scorekaart weerspiegelt vooral die start-URL en algemene signalen.`,
      ),
      h2("Wat je moet doen"),
      ol([
        "Scan (of bekijk handmatig) ook belangrijke landingspagina’s: diensten, steden, product.",
        "Geef dienstenpagina’s eigen titles, H1, FAQ en duidelijke entities.",
        "Link intern van homepage → diensten → contact/aanvraag.",
        "Voor lokale diensten: per regio of vestiging voldoende unieke content.",
        "Plan contentwerk op de pagina’s die leads opleveren — niet alleen de homepage.",
      ]),
      tip(
        "Noem in je contactbericht na de scan welke URL’s commercieel het belangrijkst zijn.",
      ),
      outro("Snelle fixes; AEO/GEO/SEO kiezen na de scan."),
    ].join("\n"),

  "tz-aiscan-contact-results": () =>
    [
      p(
        `Na je AI-scan kun je bij TripleZero iT contact opnemen over de resultaten via het contactformulier op de resultatensectie, of later via tickets/support in je account.`,
      ),
      h2("Zo doe je dat efficiënt"),
      ol([
        "Gebruik na de scan de knop/optie om contact op te nemen — scores en URL worden vaak al vooringevuld.",
        "Of open een ticket en plak URL + scores (AEO, GEO, SEO, Performance, AI Readiness).",
        "Vermeld je doel (lokaal, landelijk, redesign, bureau-klant) en wat je al hebt geprobeerd.",
        "Voeg scan-datum of verwijzing naar SEO-analyse toe als je ingelogd bent.",
      ]),
      tip("Hoe concreter je vraag (bijv. “lage GEO, regio Utrecht”), hoe sneller een gericht voorstel."),
      outro("Vervolgstappen; resultaten delen met collega’s."),
    ].join("\n"),

  "tz-aiscan-scan-fail": () =>
    [
      p(
        `Als de AI-scan mislukt of blijft hangen, ligt het vaak aan de URL, bereikbaarheid van de site, of een tijdelijke netwerk-/serverfout — niet meteen aan “slechte SEO”.`,
      ),
      h2("Checklist"),
      ol([
        "Controleer of de URL geldig is (<code>https://</code>, geen typo).",
        "Open de URL in een privévenster: laadt de site zonder VPN/login?",
        "Vermijd staging of IP-URL’s; probeer de canonieke productie-URL.",
        "Wacht even en start opnieuw; tijdelijke timeouts komen voor.",
        "Werkt het nog niet: noteer tijdstip, URL en foutmelding en contacteer support.",
      ]),
      warn(
        "Sites die firewalls, bot-blocks of geo-restricties hebben, kunnen moeilijker te scannen zijn. Whitelist of tijdelijk soepeler beleid kan nodig zijn.",
      ),
      outro("Welke URL invoeren; contact over resultaten."),
    ].join("\n"),

  "tz-aiscan-multiple-sites": () =>
    [
      p(
        `Je kunt meerdere websites scannen door steeds een andere URL in te voeren. Handig voor vestigingen, merken in een groep, of een snelle concurrentie-indicatie — met kanttekeningen.`,
      ),
      h2("Praktisch"),
      ul([
        "Scan één URL per run; bewaar of noteer scores per domein.",
        "Vergelijk alleen eerlijk: zelfde type pagina (homepage vs homepage).",
        "Concurrentiescans zijn indicatief — je ziet geen hun Search Console-data.",
        "Ingelogde klanten: historie van jouw scans staat onder SEO-analyse.",
      ]),
      tip(
        "Voor bureaus: scan klant-baseline vóór het traject en herhaal na sprints met dezelfde URL-conventie.",
      ),
      outro("Geschikt voor bureaus; meten na aanpassingen."),
    ].join("\n"),

  "tz-aiscan-share-results": () =>
    [
      p(
        `Deel AI-scanresultaten met collega’s of specialisten door URL, scores en context vast te leggen. Er is geen “magische export” nodig om bruikbaar samen te werken.`,
      ),
      h2("Wat je deelt"),
      ul([
        "Gescande URL en datum.",
        "De vijf scores (AEO, GEO, SEO, Performance, AI Readiness).",
        "Jouw doelen en de twee laagste scores die je wilt aanpakken.",
        "Eventueel screenshot van de resultatensectie.",
        "Voor klanten met account: verwijzing naar SEO-analyse in het dashboard.",
      ]),
      tip(
        "Gebruik het contactformulier na de scan: dat vult URL en scores al in voor TripleZero iT.",
      ),
      outro("Contact over resultaten; eerdere scans in dashboard."),
    ].join("\n"),

  "tz-aiscan-packages": () =>
    [
      p(
        `De AI-scanner zit in de shoppakketten van TripleZero iT naast domein, hosting, website/shop, AEO/GEO/SEO en support. De gratis scan op <code>/ai-scan</code> blijft beschikbaar als startpunt.`,
      ),
      h2("Pakketten (indicatie)"),
      ul([
        "Business — o.a. AI-scanner, 1 AI-agent, AEO/GEO/SEO basic.",
        "Extra Growth — o.a. AI-scanner, 2 AI-agents, AEO/GEO/SEO plus.",
      ]),
      p(
        `Het verschil tussen pakketten zit vooral in diepte van AEO/GEO/SEO en het aantal agents — niet in “wel of geen scanner”.`,
      ),
      tip("Na een gratis scan kun je upgraden naar uitvoering via pakket of losse AEO/GEO/SEO-diensten."),
      outro("AI-scan versus traject; agents samen met AI-scan."),
    ].join("\n"),

  "tz-aiscan-choose-service": () =>
    [
      p(
        `Na je AI-scan kies je de dienst die de laagste, business-relevante score het best adresseert — of een gecombineerd traject als scores samenhangen.`,
      ),
      h2("Keuzehulp"),
      ul([
        "Lage AEO → AEO-optimalisatie (antwoordklare content, FAQ, entities, structured data).",
        "Lage GEO → GEO-optimalisatie (Maps, NAP, lokale pagina’s, Google Business Profile).",
        "Lage SEO → SEO-optimalisatie (on-page, techniek, interne links, crawlbaarheid).",
        "Lage Performance → technische/performance-fixes (vaak naast SEO).",
        "Lage AI Readiness → vaak combinatie AEO + SEO (+ GEO als lokaal relevant).",
      ]),
      tip(
        "Twijfel je? Open contact met URL + scores: TripleZero iT helpt prioriteren voordat je een volledig traject start.",
      ),
      outro("Versus volledig traject; prioriteren bij meerdere lage scores."),
    ].join("\n"),

  "tz-aiscan-before-launch": () =>
    [
      p(
        `Gebruik de AI-scan als baseline vóór lancering of redesign, en opnieuw na go-live. Zo zie je of de nieuwe site klaar is voor zoek- én AI-zichtbaarheid — niet alleen “mooi en live”.`,
      ),
      h2("Aanbevolen momenten"),
      ol([
        "Oude site scannen (baseline) vóór de migratie.",
        "Staging alleen gebruiken voor interne checks — beslissingen op productie-URL.",
        "Direct na launch de canonieke URL scannen.",
        "Na content- en redirect-stabilisatie opnieuw scannen (vaak 1–2 weken later).",
      ]),
      warn(
        "Vergeet redirects, canonicals en Google Business/NAP niet bij redesigns — GEO en SEO dalen daar vaak het eerst.",
      ),
      outro("Welke URL invoeren; meten na aanpassingen."),
    ].join("\n"),

  "tz-aiscan-agencies": () =>
    [
      p(
        `Ja: de AI-scan is geschikt voor bureaus die snel een baseline willen voor klanten — AEO, GEO, SEO, Performance en AI Readiness in één scorekaart.`,
      ),
      h2("Hoe bureaus hem inzetten"),
      ul([
        "Intake: scan klant-URL vóór het voorstel.",
        "Kick-off: prioriteiten delen met klant (twee laagste scores + doel).",
        "Sprints: herhaal scans na oplevering van fixes.",
        "Upsell: koppel scan-bevindingen aan AEO/GEO/SEO of een TripleZero iT-pakket.",
      ]),
      tip(
        "Spreek met de klant af welke canonieke URL je scant (www/apex) zodat rapportages vergelijkbaar blijven.",
      ),
      outro("Meerdere sites scannen; pakketten met AI-scanner."),
    ].join("\n"),
};

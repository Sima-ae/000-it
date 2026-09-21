/**
 * Dutch kennisbank bodies for AEO / GEO / SEO topics (TripleZero iT).
 */
const BRAND = "TripleZero iT";

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
    `Heb je na het volgen van deze stappen nog vragen? Neem contact op met ${BRAND} support via het ticketssysteem of plan een afspraak. Vermeld je domein, doelen (AEO, GEO en/of SEO) en eventuele AI-scanresultaten.`,
    related
      ? `Gerelateerd: ${related}`
      : `Bekijk ook andere artikelen in AEO, GEO en SEO voor trajecten, content en metingen.`,
  );
}

type Ctx = { title: string; topic: string };

export const aeoGeoSeoTopicBuilders: Record<string, (ctx: Ctx) => string> = {
  "tz-aeo-engines-overviews": () =>
    [
      p(
        `Antwoordengines en AI-overviews vatten antwoorden samen uit meerdere bronnen. Jouw site wordt sneller gebruikt als content <strong>duidelijk, feitelijk en gestructureerd</strong> is — precies waar AEO bij ${BRAND} op inzet.`,
      ),
      h2("Wat dit betekent voor je site"),
      ul([
        "Klassieke blauwe links verdwijnen niet; AI-antwoorden komen er vaak bij.",
        "Korte, directe antwoorden bovenaan een pagina helpen machines én mensen.",
        "Consistentie in namen (diensten, merken, locaties) verhoogt betrouwbaarheid.",
      ]),
      h2("Praktische stappen"),
      ol([
        "Inventariseer de topvragen van klanten en search.",
        "Zet FAQ-blokken met één vraag → één kort antwoord.",
        "Koppel die antwoorden aan diepere secties op dezelfde pagina.",
        "Controleer of structured data (waar zinvol) klopt en valideert.",
        "Herhaal een AI-scan als indicatie — geen garantie op citaties.",
      ]),
      tip("AEO vervangt SEO niet: technische vindbaarheid blijft de basis."),
      outro("Entity-clarity; structured data voor AEO."),
    ].join("\n"),

  "tz-aeo-citations": () =>
    [
      p(
        `Citaties of vermeldingen in AI-antwoorden zijn <strong>niet afdwingbaar</strong>. Wel kun je de kans vergroten door betrouwbare, unieke en goed gestructureerde content.`,
      ),
      h2("Signalen die helpen"),
      ul([
        "Originele uitleg (niet alleen herschreven concurrentietekst).",
        "Duidelijke auteurschap/organisatie en actuele data.",
        "FAQ’s en HowTo’s die vragen letterlijk beantwoorden.",
        "Externe consistentie: NAP, socials, directories.",
      ]),
      h2("Wat je niet moet doen"),
      ul([
        "Keyword stuffing of nep-FAQ’s.",
        "Massale dunne pagina’s in de hoop “genoemd” te worden.",
        "Beloven van “garantie op AI-citaties” — dat kan niemand hard maken.",
      ]),
      warn("Meet citaties als bonusindicator, niet als enige KPI."),
      outro("AEO-content actueel houden; KPI’s per laag."),
    ].join("\n"),

  "tz-aeo-entity-clarity": () =>
    [
      p(
        `<strong>Entity-clarity</strong> betekent dat mensen én machines eenduidig begrijpen wie je bent, wat je levert en waar je actief bent. Zonder die helderheid faalt AEO sneller dan klassieke SEO.`,
      ),
      h2("Maak entities expliciet"),
      ul([
        "Eén officiële bedrijfsnaam en schrijfwijze.",
        "Diensten met vaste labels (niet elke pagina een andere synoniemsoep).",
        "Locaties/regio’s consistent met GEO/NAP.",
        "Producten of pakketten met herkenbare namen (Business, Extra Growth, …).",
      ]),
      h2("Checklist"),
      ol([
        "Schrijf een “Over ons”-blok met kernfeiten.",
        "Herhaal die feiten niet tegenstrijdig op landingspagina’s.",
        "Gebruik Organization/LocalBusiness-schema waar passend.",
        "Audit maandelijks op verouderde claims.",
      ]),
      outro("Structured data; dienstenpagina’s zonder stuffing."),
    ].join("\n"),

  "tz-aeo-structured-data": () =>
    [
      p(
        `Structured data (schema) helpt zoek- en antwoordsystemen context te lezen. Bij AEO zijn vooral <strong>FAQ</strong>, <strong>HowTo</strong> en <strong>Organization</strong> (of LocalBusiness) vaak relevant.`,
      ),
      h2("Wat wanneer"),
      ul([
        "FAQ — veelgestelde klantvragen met korte antwoorden.",
        "HowTo — echte stappenprocessen (niet elke blog forceren).",
        "Organization — wie je bent; LocalBusiness bij fysieke of lokale dienst.",
      ]),
      h2(`Implementatie bij ${BRAND}`),
      ol([
        "Kies schema dat bij de pagina-inhoud past (geen lege FAQ).",
        "Valideer in een schema-tester vóór livegang.",
        "Houd JSON-LD in sync met zichtbare tekst.",
        "Combineer met on-page SEO (titles, headings, interne links).",
      ]),
      tip("Dienstpagina AEO-optimalisatie: <code>/diensten/aeo-optimization</code>."),
      outro("Content voor antwoordengines; go-live checklist."),
    ].join("\n"),

  "tz-aeo-service-pages": () =>
    [
      p(
        `Dienstenpagina’s scoren beter voor AEO én SEO als ze <strong>eerst een antwoord geven</strong>, daarna diepgang — zonder keyword stuffing.`,
      ),
      h2("Structuur die werkt"),
      ol([
        "H1 met de dienst in mensentaal.",
        "Korte definitie / voor wie / resultaat in de eerste alinea.",
        "FAQ of “Veelgestelde vragen” met echte klanttaal.",
        "Bewijs: proces, scope, wat niet inbegrepen is.",
        "Duidelijke CTA (contact, scan, pakket).",
      ]),
      h2("Vermijd"),
      ul([
        "Herhaling van hetzelfde keyword in elke zin.",
        "Vage claims zonder context (“nummer 1 overal”).",
        "Dubbele dienstenpagina’s die elkaar kannibaliseren.",
      ]),
      outro("Entity-clarity; contentkalender."),
    ].join("\n"),

  "tz-aeo-keep-fresh": () =>
    [
      p(
        `Verouderde prijzen, uren, productnamen of wetgeving maken AI-antwoorden <strong>onbetrouwbaar</strong>. AEO vraagt om een onderhoudsritme.`,
      ),
      h2("Onderhoudsritme"),
      ul([
        "Maandelijks: FAQ’s en dienstenpagina’s op feiten checken.",
        "Per release: schema en meta’s meenemen in de review.",
        "Na pakketwijziging: teksten over basic/plus/pro bijwerken.",
      ]),
      h2("Signalen dat content “rot”"),
      ol([
        "Support krijgt vragen die de site al “beantwoordt” met verkeerde info.",
        "Search Console toont dalende queries op ooit sterke FAQ’s.",
        "AI-scan AEO-score daalt terwijl SEO stabiel blijft.",
      ]),
      tip("Plan contentupdates in hetzelfde ticket/project als SEO-nazorg."),
      outro("Kwartaalaudit; thin/AI-content risico’s."),
    ].join("\n"),

  "tz-aeo-b2b-b2c": () =>
    [
      p(
        `AEO voor <strong>B2B</strong> en <strong>B2C</strong> deelt techniek, maar verschilt in vraagtypes, bewijs en koopreis.`,
      ),
      h2("B2B-accent"),
      ul([
        "Vragen over proces, compliance, integratie, ROI, implementatietijd.",
        "Case-achtige uitleg en duidelijke scopegrenzen.",
        "Langere overweging — content moet decision-makers bedienen.",
      ]),
      h2("B2C-accent"),
      ul([
        "Kortere “hoe/wat/waar”-vragen en lokale intentie (vaak + GEO).",
        "Snelle antwoorden + sterke CTA’s.",
        "Reviews en vertrouwenssignalen zichtbaar houden.",
      ]),
      outro("GEO voor service areas; dienstenpagina’s schrijven."),
    ].join("\n"),

  "tz-aeo-dienst-traject": () =>
    [
      p(
        `De dienst <strong>AEO-optimalisatie</strong> (<code>/diensten/aeo-optimization</code>) past in een doorlopend ${BRAND}-traject: meten → prioriteren → content/schema → nazorg.`,
      ),
      h2("Typische plaats in het traject"),
      ol([
        "AI-scan of intake als startpunt.",
        "AEO-focus op FAQ’s, entities en antwoordklare dienstenpagina’s.",
        "Afstemming met SEO (techniek/index) en eventueel GEO.",
        "Herhaalmeting en contentonderhoud.",
      ]),
      h2("Wanneer losse AEO-dienst"),
      ul([
        "Je hebt al technische SEO op orde.",
        "Je wilt gericht antwoordklare content versterken.",
        "Pakket basic is te smal voor je concurrentie — overweeg plus/pro of losse dienst.",
      ]),
      outro("Verschil AEO/GEO/SEO-diensten; kickoff-flow."),
    ].join("\n"),

  "tz-geo-vs-local-seo": () =>
    [
      p(
        `Bij ${BRAND} gebruiken we <strong>GEO (Geographic SEO)</strong> voor lokale en regionale vindbaarheid. “Local SEO” in de markt betekent vaak hetzelfde cluster — Maps, GBP, NAP, locatiecontent — maar GEO is onze productterm naast AEO en klassieke SEO.`,
      ),
      h2("Overlap"),
      ul([
        "Google Business Profile en reviews.",
        "NAP-consistentie.",
        "Lokale landingspagina’s en “near me”-intentie.",
      ]),
      h2("Hoe wij het positioneren"),
      ul([
        "GEO = lokale laag in AI-scan en pakketten.",
        "Dienst: <code>/diensten/geo-optimization</code>.",
        "Altijd in samenhang met SEO (techniek) en waar relevant AEO.",
      ]),
      outro("GBP stap voor stap; GEO-dienst per regio."),
    ].join("\n"),

  "tz-geo-gbp-steps": () =>
    [
      p(
        `Google Business Profile (GBP) is vaak de snelste GEO-winst. Optimaliseer het <strong>volledig en consistent</strong> met je website.`,
      ),
      h2("Stappenplan"),
      ol([
        "Claim/verifieer het juiste profiel.",
        "Kies primaire + secundaire categorieën die bij je diensten passen.",
        "Vul NAP, uren, service areas en attributen in.",
        "Voeg foto’s, producten/diensten en regelmatige updates toe.",
        "Stem website-URL en NAP exact af op je site.",
        "Monitor vragen, reviews en insights.",
      ]),
      warn("Maak geen nepreviews of misleidende categorieën — dat schaadt vertrouwen en kan sanctions opleveren."),
      tip("Dienst GEO: <code>/diensten/geo-optimization</code>."),
      outro("Reviews integer; multi-vestiging."),
    ].join("\n"),

  "tz-geo-reviews": () =>
    [
      p(
        `Reviews versterken GEO, maar alleen als je <strong>richtlijnen respecteert</strong>: geen gekochte of geforceerde nep-reviews.`,
      ),
      h2("Wel doen"),
      ul([
        "Vraag tevreden klanten op een neutraal moment om feedback.",
        "Maak reageren makkelijk (link naar GBP).",
        "Beantwoord reviews professioneel, ook kritiek.",
      ]),
      h2("Niet doen"),
      ul([
        "Korting in ruil voor 5 sterren.",
        "Reviews schrijven over jezelf of via nepaccounts.",
        "Alleen positieve reviews tonen en kritiek wissen waar dat niet mag.",
      ]),
      outro("GBP optimaliseren; plotselinge verkeersdaling."),
    ].join("\n"),

  "tz-geo-location-pages": () =>
    [
      p(
        `Locatiepagina’s werken alleen als ze <strong>uniek en nuttig</strong> zijn. Gekopieerde stadsteksten schaden SEO én GEO.`,
      ),
      h2("Wat uniek maakt"),
      ul([
        "Lokale diensten, cases of bereikbaarheid die echt kloppen.",
        "Eigen foto’s / route-info / openingscontext.",
        "Duidelijke NAP en embedded map waar relevant.",
        "Interne links naar landelijke dienstenpagina’s.",
      ]),
      h2("Vermijd"),
      ol([
        "Honderden stadspagina’s met één zin verschil.",
        "Keyword in H1 plakken zonder lokale inhoud.",
        "Tegenstrijdige adressen tussen pagina’s.",
      ]),
      outro("Near-me content; multi-vestiging."),
    ].join("\n"),

  "tz-geo-service-area": () =>
    [
      p(
        `Dienstverleners zonder winkel (loodgieter, IT-support, coaches) optimaliseren GEO via <strong>service areas</strong>, niet alleen een pin op de kaart.`,
      ),
      h2("Aanpak"),
      ul([
        "GBP als service-area business instellen waar van toepassing.",
        "Regio’s op de site benoemen die je echt bedient.",
        "Geen nep-adres verzinnen “voor SEO”.",
        "Content over werkwijze op locatie / remote / belafspraak.",
      ]),
      tip("Combineer met AEO-FAQ’s zoals “Werken jullie in [regio]?” met eerlijke antwoorden."),
      outro("GEO-dienst regio; near-me content."),
    ].join("\n"),

  "tz-geo-multi-location": () =>
    [
      p(
        `Meerdere vestigingen vragen om <strong>strakke structuur</strong>: één bron van waarheid voor NAP en duidelijke pagina’s per locatie.`,
      ),
      h2("Organisatie"),
      ol([
        "Lijst vestigingen met adres, uren, telefoon, GBP-link.",
        "Eén locatiepagina per vestiging (unieke content).",
        "Hub-pagina “Vestigingen” met interne links.",
        "Hreflang/canonicals alleen als meertalig/internationaal relevant.",
        "Reviews per vestiging niet door elkaar halen.",
      ]),
      warn("Deel geen GBP tussen vestigingen die gescheiden moeten zijn."),
      outro("Unieke locatiepagina’s; GBP stappen."),
    ].join("\n"),

  "tz-geo-near-me-content": () =>
    [
      p(
        `“Near me”- en regiozoekopdrachten vragen om content die <strong>lokale intentie</strong> serieus neemt — zonder spamstadjes.`,
      ),
      h2("Contentideeën"),
      ul([
        "Duidelijke service area + reistijd/werkwijze.",
        "Lokale FAQ’s (“Kom je ook ’s avonds in [regio]?”).",
        "Landingspagina’s per échte regio, niet per postcodefantasie.",
        "Schema LocalBusiness waar passend.",
      ]),
      h2("Meet"),
      ol([
        "GBP-acties (bel, route, website).",
        "Lokale queries in Search Console.",
        "Conversies op regio-landingspagina’s.",
      ]),
      outro("KPI’s per laag; GEO vs local SEO."),
    ].join("\n"),

  "tz-geo-dienst-regio": () =>
    [
      p(
        `GEO-optimalisatie bij ${BRAND} (<code>/diensten/geo-optimization</code>) koppelt je <strong>regio of stad</strong> aan GBP, NAP, locatiecontent en meetbare lokale acties.`,
      ),
      h2("Wat we typisch aanpakken"),
      ul([
        "GBP-compleetheid en categorieën.",
        "Website-NAP en locatiestructuur.",
        "Lokale content zonder duplicates.",
        "Afstemming met SEO-techniek en eventueel AEO-FAQ’s.",
      ]),
      h2("Jouw input"),
      ol([
        "Regio’s die je echt bedient.",
        "Toegang tot GBP (of uitnodiging).",
        "Actuele adressen/uren.",
        "Doelen: belafspraken, bezoeken, leads.",
      ]),
      outro("Toegang leveren; kickoff-flow."),
    ].join("\n"),

  "tz-seo-technical": () =>
    [
      p(
        `Technische SEO bij ${BRAND} gaat over <strong>crawlbaarheid, indexatie en sitemaps</strong> — de basis onder AEO en GEO.`,
      ),
      h2("Kernonderdelen"),
      ul([
        "Robots.txt en geen per ongeluk geblokkeerde belangrijke paden.",
        "XML-sitemap die live, canonieke URL’s bevat.",
        "Schone statuscodes (geen soft-404-chaos).",
        "HTTPS, redirects en canonicals op orde.",
      ]),
      h2("Werkwijze"),
      ol([
        "Check Search Console op dekking/indexatie.",
        "Crawl steekproef van templates (home, dienst, blog, locatie).",
        "Los blokkades en dubbele URL-varianten op.",
        "Herhaal na grote releases.",
      ]),
      tip("Dienst SEO: <code>/diensten/seo-optimization</code>."),
      outro("Indexatieproblemen; Core Web Vitals."),
    ].join("\n"),

  "tz-seo-onpage-meta": () =>
    [
      p(
        `Titles, meta descriptions en headings sturen klikgedrag en topic-clarity. Optimaliseer ze <strong>uniek per template</strong>.`,
      ),
      h2("Richtlijnen"),
      ul([
        "Title: primaire intentie + merk waar passend, geen stuffing.",
        "Meta description: uitnodigend, eerlijk, CTA-achtig.",
        "Eén H1; H2/H3 volgen de inhoudslogica (ook voor AEO-FAQ’s).",
      ]),
      h2("Checklist"),
      ol([
        "Export of steekproef van indexeerbare URL’s.",
        "Vind duplicaten en herschrijf.",
        "Stem af op zoekintentie (informatief vs transactioneel).",
        "Test CTR na updates in Search Console.",
      ]),
      outro("Interne linking; WordPress SEO."),
    ].join("\n"),

  "tz-seo-cwv": () =>
    [
      p(
        `Core Web Vitals (LCP, INP, CLS) beïnvloeden UX en kunnen SEO-signalen raken. Optimaliseer <strong>gericht</strong> — niet tot de site onbruikbaar is.`,
      ),
      h2("Veilige verbeteringen"),
      ul([
        "Afbeeldingen comprimeren en juiste formaten.",
        "Onnodige scripts/plugins beperken.",
        "Fonts en layout-shift aanpakken.",
        "Caching/CDN waar je hosting dat toelaat.",
      ]),
      warn("Gooi niet alle marketingpixels weg zonder meetplan; balanceer performance en tracking."),
      outro("Mobile-first UX; technische SEO."),
    ].join("\n"),

  "tz-seo-internal-links": () =>
    [
      p(
        `Interne links bouwen <strong>silo’s of topic clusters</strong>: hub-pagina’s + supporting content. Dat helpt SEO én AEO-navigatie.`,
      ),
      h2("Bouwplan"),
      ol([
        "Kies 3–7 kernonderwerpen (diensten/regio’s).",
        "Maak of verbeter een hub per onderwerp.",
        "Link vanuit blogs/FAQ’s met beschrijvende ankers.",
        "Vermijd orphan pages zonder inkomende interne links.",
      ]),
      tip("Combineer met contentkalender zodat nieuwe stukken meteen in de cluster hangen."),
      outro("Contentkalender; on-page meta."),
    ].join("\n"),

  "tz-seo-indexation": () =>
    [
      p(
        `Indexatieproblemen zie je meestal eerst in <strong>Google Search Console</strong>. Los oorzaak op, forceer niet blind “verzoek tot indexering” als enige actie.`,
      ),
      h2("Diagnose"),
      ul([
        "Uitgesloten door noindex/robots?",
        "Soft 404 of lege template?",
        "Canonieke wijst elders?",
        "Dubbele parameters/filters (webshop)?",
      ]),
      h2("Acties"),
      ol([
        "Fix de oorzaak op de site.",
        "Controleer sitemap.",
        "Vraag herindexatie voor sleutel-URL’s.",
        "Monitor dekking de dagen erna.",
      ]),
      outro("Technische SEO; traffic drop."),
    ].join("\n"),

  "tz-seo-wordpress": () =>
    [
      p(
        `Op WordPress doe je zelf de basis; ${BRAND} helpt met traject, techniek en AEO/GEO/SEO-diepte. Eén SEO-plugin is genoeg — niet drie.`,
      ),
      h2("Zelf"),
      ul([
        "Titles/meta’s invullen.",
        "Goede permalinks en interne links.",
        "Images met alt waar zinvol.",
        "Updates/backups (of via hostingafspraken).",
      ]),
      h2(BRAND),
      ul([
        "Technische audit en indexatie.",
        "Content/AEO-structuur en lokale pagina’s.",
        "Pakkettraject basic/plus/pro of losse SEO-dienst.",
      ]),
      warn("Conflicterende SEO-plugins veroorzaken dubbele schema’s en meta-chaos."),
      outro("Webshop-SEO; losse SEO naast pakket."),
    ].join("\n"),

  "tz-seo-ecommerce": () =>
    [
      p(
        `Webshop-SEO draait om <strong>categorieën, producten en filters</strong> zonder index-explosie van dunne varianten.`,
      ),
      h2("Prioriteiten"),
      ul([
        "Unieke categoriesteksten (geen lege grids).",
        "Producttitels en descriptions met echte USP’s.",
        "Faceted navigation: indexeer alleen wat je wilt.",
        "Canonicals op sorteer/filter-URL’s.",
      ]),
      h2("GEO/AEO-hoek"),
      ol([
        "Lokale afhaal/bezorg-info waar relevant (GEO).",
        "FAQ over verzending/retour (AEO).",
        "Meet conversies naast rankings.",
      ]),
      outro("Canonicals/hreflang; Core Web Vitals."),
    ].join("\n"),

  "tz-seo-mobile-ux": () =>
    [
      p(
        `Mobile-first indexing maakt <strong>mobiele UX</strong> leidend. Trage of onbruikbare mobiele pagina’s raken SEO-resultaten én conversie.`,
      ),
      h2("Checkpunten"),
      ul([
        "Tap-targets en leesbare fonts.",
        "Geen content die alleen op desktop zichtbaar is terwijl die geïndexeerd moet worden.",
        "Sticky bars die CLS veroorzaken beperken.",
        "Formulieren en CTA’s mobiel testen.",
      ]),
      outro("CWV; go-live checklist."),
    ].join("\n"),

  "tz-seo-canonical-hreflang": () =>
    [
      p(
        `Canonicals voorkomen dubbele signalen; <strong>hreflang</strong> helpt meertalige/regionale sites de juiste taalversie te tonen.`,
      ),
      h2("Canonicals"),
      ul([
        "Elke indexeerbare pagina wijst naar de voorkeurs-URL.",
        "Parameters/sorteer-URL’s canonicaliseren naar de hoofdversie.",
      ]),
      h2("Hreflang"),
      ul([
        "Alleen inzetten bij echte taal/regio-varianten.",
        "Wederkerige links tussen taalversies.",
        "x-default waar passend.",
      ]),
      warn("Verkeerde hreflang is erger dan geen hreflang — test grondig."),
      outro("Technische SEO; multi-vestiging."),
    ].join("\n"),

  "tz-seo-dienst-vs-pakket": () =>
    [
      p(
        `Losse <strong>SEO-optimalisatie</strong> in de shop/diensten past naast of in plaats van AEO/GEO/SEO in een pakket — afhankelijk van scope.`,
      ),
      h2("Kies losse SEO-dienst als"),
      ul([
        "Je een gerichte technische of on-page klus nodig hebt.",
        "Je hosting elders hebt maar SEO bij ${BRAND} wilt.",
        "Je pakket al loopt en een extra SEO-sprint nodig is.",
      ]),
      h2("Kies pakkettraject als"),
      ul([
        "Je AEO + GEO + SEO in samenhang wilt (basic/plus/pro).",
        "Je AI-scan, agents en doorlopende groei combineert.",
      ]),
      tip("Shop/diensten: <code>/diensten/seo-optimization</code> en pakketten in de shop."),
      outro("Basic vs plus vs pro; losse dienst vs pakket."),
    ].join("\n"),

  "tz-aeo-pro-vs-plus": () =>
    [
      p(
        `In pakketten: <strong>basic</strong> (Business), <strong>plus</strong> (Extra Growth), <strong>pro</strong> (Enterprise). Pro is dieper/maatwerk dan plus.`,
      ),
      h2("Plus (Extra Growth)"),
      ul([
        "Diepere AEO/GEO/SEO dan basic.",
        "Meer ruimte voor groei naast 2 AI-agents.",
      ]),
      h2("Pro (Enterprise)"),
      ul([
        "Hoogste diepgang en schaal (multi-merk/regio).",
        "Maatwerkprioriteiten via Enterprise-contact.",
        "Past bij complexe sites of zware concurrentie.",
      ]),
      outro("Losse diensten vs pakket; prioriteiten bij alle scores laag."),
    ].join("\n"),

  "tz-aeo-loose-vs-package": () =>
    [
      p(
        `Soms is een <strong>losse AEO-, GEO- of SEO-dienst</strong> beter; soms een pakket. Kies op scope, niet op buzzwords.`,
      ),
      h2("Losse dienst"),
      ul([
        "Eén laag dominant (alleen lokaal, alleen techniek, alleen AEO-content).",
        "Tijdelijke sprint met duidelijk opleverpunt.",
      ]),
      h2("Pakket"),
      ul([
        "Doorlopende samenhang AEO+GEO+SEO.",
        "Combinatie met hosting, scan en agents.",
      ]),
      ol([
        "Doe een AI-scan of intake.",
        "Benoem de laagste score die omzet raakt.",
        "Kies dienst of pakketniveau (basic/plus/pro).",
        "Plan kickoff en toegang.",
      ]),
      outro("Dienstverschillen; toegang leveren."),
    ].join("\n"),

  "tz-aeo-access-handover": () =>
    [
      p(
        `Voor een AEO/GEO/SEO-traject heeft ${BRAND} vaak toegang nodig tot meet- en publicatietools. Lever dit <strong>veilig en minimaal</strong>.`,
      ),
      h2("Typisch gevraagd"),
      ul([
        "Google Search Console (eigenaar of voldoende rechten).",
        "Analytics (leesrechten).",
        "CMS/WordPress of staging waar content wijzigt.",
        "GBP-managersrechten voor GEO.",
      ]),
      h2("Tips"),
      ol([
        "Gebruik uitnodigingen i.p.v. wachtwoord delen.",
        "Documenteer wat je hebt gedeeld in het ticket.",
        "Trek tijdelijke rechten in na afronding indien gewenst.",
      ]),
      warn("Deel nooit payment- of hosting-rootcredentials tenzij expliciet nodig en beveiligd."),
      outro("Kickoff-flow; teamrechten elders in kennisbank."),
    ].join("\n"),

  "tz-aeo-kickoff-flow": () =>
    [
      p(
        `Na kickoff volgt een vast ritme: <strong>planning → opleveringen → feedback</strong>. Zo blijft AEO/GEO/SEO voorspelbaar.`,
      ),
      h2("Wat je mag verwachten"),
      ol([
        "Doelen en prioriteiten vastleggen (op basis van scan/intake).",
        "Backlog per laag (AEO/GEO/SEO).",
        "Opleveringen in reviewbare batches.",
        "Feedbackronde met jouw goedkeuring waar content live gaat.",
        "Nazorg/meting volgens afspraak.",
      ]),
      tip("Houd één aanspreekpunt aan jouw kant voor snellere feedback."),
      outro("Scan + ongoing; KPI’s."),
    ].join("\n"),

  "tz-aeo-scan-plus-ongoing": () =>
    [
      p(
        `De <strong>AI-scan</strong> is een momentopname. Een traject implementeert verbeteringen; doorlopende optimalisatie houdt winst vast.`,
      ),
      h2("Drie lagen"),
      ul([
        "Scan — scores en snelle prioriteiten (<code>/ai-scan</code>, historie in <code>/seo-analysis</code>).",
        "Traject — implementatie AEO/GEO/SEO (dienst of pakket).",
        "Ongoing — contentonderhoud, lokale updates, technische checks.",
      ]),
      h2("Aanbevolen volgorde"),
      ol([
        "Scan starten en scores lezen.",
        "Prioriteit kiezen (omzet eerst).",
        "Traject of losse dienst starten.",
        "Periodiek herscannen als trend — niet als enige KPI.",
      ]),
      outro("Scan vs volledig traject; kwartaalaudit."),
    ].join("\n"),

  "tz-aeo-priority-all-low": () =>
    [
      p(
        `Scoren AEO, GEO én SEO laag? Doe niet alles tegelijk. Kies de laag die het snelst aan <strong>omzet of leads</strong> raakt.`,
      ),
      h2("Beslisboom (eenvoudig)"),
      ul([
        "Lokale dienstverlener → GEO eerst (GBP/NAP), dan SEO-techniek.",
        "Content/merk of B2B-expertise → AEO+content, parallel technische SEO-fixes.",
        "Webshop met indexchaos → SEO-technisch/filters eerst.",
      ]),
      h2("Praktijk"),
      ol([
        "Pak top 3 issues uit de scan.",
        "Plan 2–4 weken focus op één laag.",
        "Meet, herscan, schakel naar laag 2.",
      ]),
      outro("KPI’s; losse dienst vs pakket."),
    ].join("\n"),

  "tz-aeo-dienst-differences": () =>
    [
      p(
        `${BRAND} biedt aparte diensten: <strong>AEO-</strong>, <strong>GEO-</strong> en <strong>SEO-optimalisatie</strong>. Ze overlappen in analyse, maar verschillen in focus.`,
      ),
      h2("Verschil"),
      ul([
        "AEO — antwoordklare content, entities, schema/FAQ’s (<code>/diensten/aeo-optimization</code>).",
        "GEO — lokaal/GBP/NAP/locatiepagina’s (<code>/diensten/geo-optimization</code>).",
        "SEO — techniek, on-page, structuur, indexatie (<code>/diensten/seo-optimization</code>).",
      ]),
      tip("In pakketten zitten lagen gecombineerd (basic/plus/pro); losse diensten zijn gericht."),
      outro("Samenhang AEO/GEO/SEO; pakketniveaus."),
    ].join("\n"),

  "tz-aeo-content-calendar": () =>
    [
      p(
        `Een contentkalender die AEO, GEO en SEO voedt, plant niet alleen blogs — maar <strong>antwoorden, lokale updates en clusterstukken</strong>.`,
      ),
      h2("Mix per maand"),
      ul([
        "1–2 AEO-FAQ’s of dienstantwoorden.",
        "1 lokale update (GBP-bericht of regio-content) als GEO speelt.",
        "1 clusterartikel met interne links naar hubs.",
        "Technische/SEO-fixes buiten de kalender in een aparte backlog.",
      ]),
      h2("Ritme"),
      ol([
        "Kies thema’s uit Search Console + klantvragen.",
        "Plan publicatie en interne links.",
        "Review feiten (AEO-frisheid).",
        "Meet queries en conversies.",
      ]),
      outro("Interne linking; thin/AI-content."),
    ].join("\n"),

  "tz-aeo-kpis-by-layer": () =>
    [
      p(
        `Elke laag heeft eigen KPI’s. Mix ze niet tot één “SEO-score” als enige waarheid.`,
      ),
      h2("AEO"),
      ul([
        "Zichtbaarheid van FAQ’s/antwoordblokken in search.",
        "Kwalitatieve checks op AI-antwoorden (steekproef).",
        "Supportvragen die dalen omdat de site antwoordt.",
      ]),
      h2("GEO"),
      ul([
        "GBP-acties (bel, route, website).",
        "Lokale pack-zichtbaarheid / lokale queries.",
      ]),
      h2("SEO"),
      ul([
        "Impressies/klikken in Search Console.",
        "Indexdekking en Core Web Vitals.",
        "Organische landingsconversies.",
      ]),
      outro("GSC + Analytics; resultaat meten (bestaand artikel)."),
    ].join("\n"),

  "tz-aeo-gsc-analytics": () =>
    [
      p(
        `Search Console toont zoekvraag en indexatie; Analytics toont gedrag en conversie. In een ${BRAND}-traject gebruik je ze <strong>samen</strong>.`,
      ),
      h2("Search Console"),
      ul([
        "Queries, pagina’s, dekking, ervaring.",
        "Technische uitsluitingen en sitemapstatus.",
      ]),
      h2("Analytics"),
      ul([
        "Landingspagina’s en conversiepaden.",
        "Lokale campagnes of organic segmenten.",
      ]),
      h2("Samen"),
      ol([
        "Vind winnende queries in GSC.",
        "Check of die landings converteren in Analytics.",
        "Optimaliseer content (AEO) of techniek (SEO) of lokaal (GEO).",
        "Deel exports in je traject-ticket.",
      ]),
      outro("Toegang leveren; traffic drop."),
    ].join("\n"),

  "tz-aeo-quarterly-audit": () =>
    [
      p(
        `Een kwartaalaudit voorkomt stille regressies: plugins, contentrot, GBP-veroudering of indexproblemen.`,
      ),
      h2("Auditchecklist"),
      ol([
        "AI-scan of vergelijkbare scores als trend.",
        "Search Console dekking + CWV.",
        "Steekproef titles/FAQ’s/schema.",
        "GBP-uren/foto’s/categorieën.",
        "NAP-consistentie site ↔ directories.",
        "Backlog bijwerken en prioriteren.",
      ]),
      tip("Plan de audit vast in je CRM-project of agenda."),
      outro("Content fris houden; go-live checklist."),
    ].join("\n"),

  "tz-aeo-traffic-drop": () =>
    [
      p(
        `Bij een plotselinge daling in organisch of lokaal verkeer: eerst <strong>diagnosticeren</strong>, dan paniek-optimaliseren.`,
      ),
      h2("Eerste 24 uur"),
      ol([
        "Check of de site bereikbaar is (DNS/SSL/hosting).",
        "Search Console: handmatige actie, dekking, ervaring.",
        "Recente releases/plugin-updates terugzoeken.",
        "GBP geschorst of gewijzigd?",
      ]),
      h2("Daarna"),
      ul([
        "Vergelijk queries/pagina’s week-over-week.",
        "Herstel noindex/canonical-fouten.",
        "Open een ticket bij ${BRAND} met tijdstip, screenshots en wijzigingen.",
      ]),
      outro("Indexatie; supportgegevens in tickets."),
    ].join("\n"),

  "tz-aeo-thin-ai-content": () =>
    [
      p(
        `Thin content en onbewerkte AI-teksten schaden AEO én SEO: weinig unieke waarde, zwakke entities, risico op wantrouwen.`,
      ),
      h2("Risico’s"),
      ul([
        "Generieke antwoorden die elke concurrent ook heeft.",
        "Feitelijke fouten in AI-antwoorden over jouw diensten.",
        "Massale stadspagina’s zonder lokale diepgang.",
      ]),
      h2("Werkwijze"),
      ol([
        "AI mag drafts voorstellen — jij of ${BRAND} reviewt feiten en merkstem.",
        "Publiceer alleen pagina’s met unieke toegevoegde waarde.",
        "Koppel content aan echte klantvragen en data.",
      ]),
      warn("“Meer pagina’s” is geen strategie als kwaliteit ontbreekt."),
      outro("Contentkalender; dienstenpagina’s schrijven."),
    ].join("\n"),

  "tz-aeo-golive-checklist": () =>
    [
      p(
        `Vóór go-live van een site of grote release: check AEO, GEO en SEO zodat je niet meteen zichtbaarheid of lokale leads misloopt.`,
      ),
      h2("SEO"),
      ul([
        "HTTPS, redirects, sitemap, robots.",
        "Titles/H1 op kernpagina’s.",
        "Search Console-property + sitemap ingediend.",
      ]),
      h2("AEO"),
      ul([
        "FAQ’s met korte antwoorden op dienstenpagina’s.",
        "Schema valide waar gebruikt.",
        "Geen verouderde claims.",
      ]),
      h2("GEO"),
      ul([
        "NAP gelijk aan GBP.",
        "GBP-categorieën/uren/URL correct.",
        "Locatiepagina’s uniek (indien van toepassing).",
      ]),
      tip("Draai na livegang een AI-scan als baseline voor het traject."),
      outro("Kwartaalaudit; kickoff-flow."),
    ].join("\n"),
};

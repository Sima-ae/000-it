/**
 * Dutch kennisbank bodies for Bloggen topics (TripleZero iT).
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
    `Heb je na het volgen van deze stappen nog vragen? Neem contact op met TripleZero iT support via het ticketssysteem of plan een afspraak. Vermeld je domein, blogplatform en wat je wilt bereiken.`,
    related
      ? `Gerelateerd: ${related}`
      : `Bekijk ook andere artikelen in Bloggen over starten, schrijven, vormgeving, groei en beheer.`,
  );
}

type Ctx = { title: string; topic: string };

export const bloggenTopicBuilders: Record<string, (ctx: Ctx) => string> = {
  "tz-blog-platform-choice": () =>
    [
      p(
        `De keuze tussen <strong>WordPress.org</strong>, <strong>WordPress.com</strong> en <strong>Blogger</strong> bepaalt je vrijheid, kosten en groeiruimte. Bij TripleZero iT hosten we vooral zelfstandige WordPress-sites op een eigen domein.`,
      ),
      h2("Kort vergeleken"),
      ul([
        "WordPress.org — volle controle, plugins/thema’s, eigen hosting (bijv. bij ons).",
        "WordPress.com — sneller starten, minder technische zorg, beperkingen op lagere plannen.",
        "Blogger — gratis en eenvoudig, minder professioneel en minder uitbreidbaar.",
      ]),
      h2("Wanneer wat kiezen"),
      ol([
        "Wil je plugins, WooCommerce of maatwerk → WordPress.org.",
        "Wil je minimaal onderhoud en een eenvoudige site → WordPress.com kan volstaan.",
        "Wil je alleen even testen of hobbyen → Blogger of een concept-site.",
        "Plan je merk, SEO en e-mail op eigen domein → start meteen op .org of migreer vroeg.",
      ]),
      tip("Kies het platform voor de komende 2–3 jaar, niet alleen voor de eerste week."),
      outro("Starten op WordPress bij TripleZero iT; professioneel bloggen op eigen domein."),
    ].join("\n"),

  "tz-blog-start-wp-tz": () =>
    [
      p(
        `Een blog op WordPress bij TripleZero iT combineert een eigen domein, snelle hosting en backups. Zo kun je schrijven zonder meteen in serverbeheer te verdwalen.`,
      ),
      h2("Voorbereiding"),
      ul([
        "Domeinnaam (nieuw of bestaande) en SSL.",
        "Hostingpakket met PHP en database.",
        "Doel van de blog (leads, expertise, nieuws) in één zin.",
      ]),
      h2("Stappen"),
      ol([
        "Activeer WordPress via het paneel of laat ons installeren.",
        "Stel permalinks in (bijv. /%postname%/) vóór je veel publiceert.",
        "Kies een licht thema gericht op lezen, niet op flashy homepage-blokken.",
        "Maak categorieën aan die bij je onderwerpen passen.",
        "Schrijf 2–3 startposts zodat het archief niet leeg oogt.",
      ]),
      tip("Zet meteen een werkende contact- of nieuwsbriefoptie klaar — later is lastiger."),
      outro("Blogplatform kiezen; Gutenberg efficiënt gebruiken."),
    ].join("\n"),

  "tz-blog-start-blogger": () =>
    [
      p(
        `Blogger is een snelle manier om te starten. Later kun je een <strong>eigen domein</strong> koppelen of migreren naar WordPress wanneer je meer controle nodig hebt.`,
      ),
      h2("Starten op Blogger"),
      ol([
        "Maak een Google-account en een nieuwe blog aan.",
        "Kies een eenvoudig thema en vaste URL-structuur.",
        "Publiceer consistent — zo bouw je gewoonte en content.",
      ]),
      h2("Eigen domein later"),
      ul([
        "Registreer het domein (bij TripleZero iT) en volg de DNS/CNAME-stappen van Blogger.",
        "Houd oude Blogger-URL’s in de gaten; plan redirects bij een eventuele verhuizing.",
        "Exporteer posts regelmatig als backup.",
      ]),
      warn("Blogger beperkt plugins en geavanceerde SEO. Groei je serieus, plan een WordPress-migratie."),
      outro("Domein aan Blogger koppelen; blog verhuizen zonder SEO-schade."),
    ].join("\n"),

  "tz-blog-needs-own-domain": () =>
    [
      p(
        `Professioneel bloggen op een <strong>eigen domein</strong> vraagt meer dan alleen posts: merk, e-mail, SSL, backups en een heldere publicatieworkflow.`,
      ),
      h2("Basischecklist"),
      ul([
        "Domein + SSL (HTTPS).",
        "Hosting met WordPress (of vergelijkbaar CMS).",
        "Werkende e-mail op @jouwdomein.nl.",
        "Back-upplan en updatestrategie.",
        "Analytics / Search Console voor meting.",
      ]),
      h2("Inhoudelijk"),
      ol([
        "Definieer doelgroep en 3–5 kernthema’s.",
        "Afspraak over publicatiefrequentie (realistisch).",
        "Huisstijl: logo, kleuren, typografie — consistent in posts.",
        "Juridisch: privacy, cookies, eventuele disclaimer bij affiliates.",
      ]),
      tip(`Bij TripleZero iT kun je domein, hosting en e-mail in één traject regelen.`),
      outro("Blog starten op WordPress; e-maillijst opbouwen."),
    ].join("\n"),

  "tz-blog-migrate-seo-safe": () =>
    [
      p(
        `Een blogverhuizing (posts + media) mag <strong>geen SEO-schade</strong> veroorzaken. Dat lukt met inventarisatie, 301-redirects en een controle op indexatie.`,
      ),
      h2("Voor de verhuizing"),
      ol([
        "Exporteer content (WordPress XML of platform-export) en media.",
        "Inventariseer populaire URL’s (Search Console, analytics).",
        "Kies de nieuwe permalinkstructuur en houd die zo dicht mogelijk bij de oude.",
      ]),
      h2("Tijdens en na"),
      ul([
        "Zet 301-redirects van oud → nieuw (post voor post of via regels).",
        "Update interne links en canonicals.",
        "Dien de nieuwe sitemap in en monitor 404’s twee weken.",
        "Controleer of afbeeldingen laden (paden, CDN, uploads-map).",
      ]),
      warn("Nooit tegelijk van domein, CMS én URL-structuur wisselen zonder redirectplan."),
      outro("Multisite vs aparte installatie; maandelijks blogonderhoud."),
    ].join("\n"),

  "tz-blog-multisite-vs-separate": () =>
    [
      p(
        `Meerdere blogs? Dan kies je tussen <strong>WordPress Multisite</strong> of <strong>aparte installaties</strong>. De verkeerde keuze maakt updates en beveiliging zwaarder.`,
      ),
      h2("Multisite past als"),
      ul([
        "Je één beheerdersteam hebt en gedeelde plugins/thema’s wilt.",
        "Sites sterk op elkaar lijken (merkenfamilie, regio’s).",
        "Je comfortabel bent met netwerkbeheer en subtiele beperkingen per site.",
      ]),
      h2("Aparte installaties passen als"),
      ul([
        "Sites verschillende plugins, klanten of beveiligingsniveaus hebben.",
        "Je onafhankelijk wilt updaten of migreren.",
        "Eén site mag de andere niet platleggen bij een fout.",
      ]),
      tip(`Twijfel je? Start met aparte installaties bij TripleZero iT; Multisite is moeilijker terug te draaien.`),
      outro("Starten op WordPress; veilige thema- en plugin-updates."),
    ].join("\n"),

  "tz-blog-write-structure": () =>
    [
      p(
        `Een sterke blogpost heeft een <strong>duidelijke structuur</strong>: belofte in de intro, scannable body, en een conclusie met volgende stap.`,
      ),
      h2("Opbouw die werkt"),
      ol([
        "Intro (3–5 zinnen): probleem + wat de lezer leert.",
        "Kernsecties met H2/H3 — één idee per sectie.",
        "Voorbeelden of stappen waar relevant.",
        "Conclusie: samenvatting + CTA (ticket, scan, contact).",
        "Optioneel: korte FAQ onderaan.",
      ]),
      h2("Schrijftips"),
      ul([
        "Eerste zin moet nut beloven, geen opsmuk.",
        "Korte alinea’s; vermijd jargon zonder uitleg.",
        "Één primaire boodschap per post.",
      ]),
      tip("Schrijf de conclusie en CTA al vóór je de middellange secties afmaakt."),
      outro("Redactionele checklist; titles en meta descriptions."),
    ].join("\n"),

  "tz-blog-gutenberg": () =>
    [
      p(
        `De <strong>blok-editor (Gutenberg)</strong> is ideaal voor blogs: koppen, lijsten, afbeeldingen en CTA’s als herbruikbare blokken.`,
      ),
      h2("Efficiënt werken"),
      ul([
        "Gebruik Heading-blokken voor H2/H3 — niet vetgedrukte paragrafen als ‘kop’.",
        "Groepeer herhalende layouts in herbruikbare blokken of patronen.",
        "List-blokken voor stappen; Quote alleen spaarzaam.",
        "Preview op mobiel vóór publiceren.",
      ]),
      h2("Valkuilen"),
      ul([
        "Te veel kolommen of cover-blokken die de leesflow breken.",
        "Ingesloten HTML die thema-updates breekt.",
        "Vergeten uitgelichte afbeelding en excerpt.",
      ]),
      outro("Typografie en layout; custom CSS veilig gebruiken."),
    ].join("\n"),

  "tz-blog-draft-schedule-publish": () =>
    [
      p(
        `Van concept naar live post: een vaste workflow voorkomt half afgemaakte artikelen en “per ongeluk gepubliceerd”.`,
      ),
      h2("Workflow"),
      ol([
        "Concept: ruwe tekst + bronnen, status Concept.",
        "Redactie: feiten, links, afbeeldingen, SEO-titel.",
        "Inplannen: datum/tijd of handmatig publiceren.",
        "Na publicatie: social/nieuwsbrief en interne links bijwerken.",
      ]),
      h2("Rollen"),
      ul([
        "Schrijver levert concept; redacteur publiceert.",
        "Gebruik WordPress-revisies bij meerdere editors.",
        "Noteer geplande posts in één kalender (niet alleen in iemands hoofd).",
      ]),
      tip("Plan publicatie buiten piekuren als caching of CDN warm moet worden."),
      outro("Redactionele checklist; nieuwsbriefworkflow."),
    ].join("\n"),

  "tz-blog-categories-tags": () =>
    [
      p(
        `<strong>Categorieën</strong> zijn je hoofdmappen; <strong>tags</strong> zijn fijne labels. Te veel van beide maakt het archief onbruikbaar.`,
      ),
      h2("Praktische regels"),
      ul([
        "Houd 5–12 categorieën; merge dunne categorieën.",
        "Eén primaire categorie per post (eventueel één secundaire).",
        "Tags alleen als ze herbruikbaar zijn (niet unieke posttitels).",
        "Geen categorie én tag met exact dezelfde naam.",
      ]),
      h2("Archief"),
      ol([
        "Controleer categoriepagina’s op lege of dunne archieven.",
        "Schrijf een korte introtekst op belangrijke categorieën.",
        "Link vanuit navigatie alleen naar stabiele categorieën.",
      ]),
      outro("Interne links en topic clusters; overzichtelijke blogpagina."),
    ].join("\n"),

  "tz-blog-permalinks-slugs": () =>
    [
      p(
        `URL-slugs en permalinks moeten <strong>blijvend</strong> zijn. Veranderen na publicatie kost redirects en linkwaarde.`,
      ),
      h2("Goede slugs"),
      ul([
        "Kort, leesbaar, zonder stopwoorden waar mogelijk.",
        "Geen datums in de URL tenzij je dat bewust wilt.",
        "Geen keyword-stuffing of eindeloze streepjes.",
      ]),
      h2("Permalinks in WordPress"),
      ol([
        "Stel vroeg /%postname%/ of een vergelijkbare structuur in.",
        "Wijzig een live slug alleen met 301-redirect.",
        "Vermijd jaar/maand in de structuur als content evergreen moet blijven.",
      ]),
      warn("Site-brede permalinkwijziging zonder redirectplugin of serverregels = massale 404’s."),
      outro("Blog verhuizen zonder SEO-schade; oude posts hergebruiken."),
    ].join("\n"),

  "tz-blog-internal-clusters": () =>
    [
      p(
        `<strong>Topic clusters</strong> verbinden blogposts via interne links: één pilaarpagina met satellietartikelen.`,
      ),
      h2("Zo bouw je clusters"),
      ol([
        "Kies een kernthema (bijv. ‘blog starten’ of ‘WordPress beheer’).",
        "Schrijf of markeer één hub-artikel.",
        "Link vanuit satellieten naar de hub en terug met contextuele ankers.",
        "Vermijd alleen ‘lees ook’-blokken zonder inhoudelijke zin.",
      ]),
      h2("Onderhoud"),
      ul([
        "Bij een nieuwe post: 2–3 relevante interne links toevoegen.",
        "Periodiek doodlopende links controleren.",
        "Clusters niet forceren tussen ongerelateerde onderwerpen.",
      ]),
      tip("Clusters helpen lezers én zoekmachines — niet alleen SEO-scores."),
      outro("SEO van één blogpost; contentkalender AEO/GEO/SEO."),
    ].join("\n"),

  "tz-blog-post-seo": () =>
    [
      p(
        `Eén blogpost optimaliseren betekent: intentie matchen, heldere koppen en natuurlijke taal — <strong>geen keyword stuffing</strong>.`,
      ),
      h2("Per post"),
      ul([
        "Eén primaire zoekintentie (informational of commercial).",
        "Titel en H1 die de belofte dekken.",
        "Antwoord vroeg in de tekst; details daarna.",
        "Interne links naar cluster + externe bronnen waar nuttig.",
        "Alt-tekst op betekenisvolle afbeeldingen.",
      ]),
      h2("Vermijd"),
      ul([
        "Herhalen van hetzelfde keyword in elke alinea.",
        "Dunne posts die alleen bestaan om een term te ‘dekken’.",
        "Misleidende titles die niet matchen met de inhoud.",
      ]),
      outro("Titles en meta; featured snippets en FAQ."),
    ].join("\n"),

  "tz-blog-faq-snippets": () =>
    [
      p(
        `FAQ-blokken en featured-snippet-stijl antwoorden helpen soms in zoekresultaten — maar alleen als de vragen <strong>echt</strong> bij de post horen.`,
      ),
      h2("Wanneer wel"),
      ul([
        "De post beantwoordt concrete hoe-/wat-vragen.",
        "Je hebt korte, feitelijke antwoorden (40–60 woorden) plus diepere secties.",
        "Structured data (FAQ) klopt met zichtbare content.",
      ]),
      h2("Wanneer niet"),
      ul([
        "FAQ’s die alleen keywords herhalen.",
        "Elke post een FAQ forceren terwijl er geen vragen zijn.",
        "Antwoorden die contradicties met de rest van de pagina geven.",
      ]),
      tip("Voor AEO/GEO/SEO-trajecten: zie ook de artikelen onder AEO, GEO en SEO."),
      outro("SEO van één blogpost; AI-scan scores lezen."),
    ].join("\n"),

  "tz-blog-titles-meta": () =>
    [
      p(
        `Titles en meta descriptions bepalen of iemand <strong>klikken</strong> — niet alleen of je ‘rankt’.`,
      ),
      h2("Title"),
      ul([
        "Belofte + specificiteit (voor wie / wat / resultaat).",
        "Ruimte houden voor merknaam als dat past.",
        "Geen ALL CAPS of clickbait dat de post niet waarmaakt.",
      ]),
      h2("Meta description"),
      ol([
        "1–2 zinnen met voordeel en CTA-sfeer.",
        "Uniek per post; niet de first paragraph kopiëren als die saai is.",
        "Test of de kernboodschap ook zonder HTML leesbaar is.",
      ]),
      outro("Sterke blogpoststructuur; redactionele checklist."),
    ].join("\n"),

  "tz-blog-authors-bylines": () =>
    [
      p(
        `Gastbloggen en meerdere auteurs vragen om duidelijke <strong>bylines, bio’s en rechten</strong> — voor lezers én zoekmachines.`,
      ),
      h2("Afspraken"),
      ul([
        "Vast auteursprofiel in WordPress (naam, foto, korte bio).",
        "Gastposts: wie mag herschrijven, wie publiceert, wie eigendom houdt.",
        "Link naar auteurspagina’s alleen als die echt content hebben.",
      ]),
      h2("Kwaliteit"),
      ol([
        "Gastposts redigeren op feiten, tone of voice en SEO.",
        "Geen pure linkruil zonder waarde voor de lezer.",
        "Vermeld sponsored of affiliate waar verplicht.",
      ]),
      outro("Monetisatie en vermeldingen; redactionele checklist."),
    ].join("\n"),

  "tz-blog-update-repurpose": () =>
    [
      p(
        `Oude posts updaten of hergebruiken bespaart werk — zolang je <strong>duplicate content</strong> en dode URL’s vermijdt.`,
      ),
      h2("Veilige updates"),
      ul([
        "Houd de URL; update inhoud en datum alleen als substantieel.",
        "Bij opsplitsen of samenvoegen: 301’s en canonieke URL vastleggen.",
        "Verwijder verouderde claims en screenshots.",
      ]),
      h2("Hergebruik"),
      ol([
        "Maak een samenvatting of checklist-pagina die naar het origineel linkt.",
        "Hergebruik niet 1:1 op meerdere URL’s.",
        "Noteer in je kalender wanneer evergreen-stukken opnieuw gecheckt worden.",
      ]),
      outro("Permalinks en slugs; interne clusters."),
    ].join("\n"),

  "tz-blog-editorial-checklist": () =>
    [
      p(
        `Een korte <strong>redactionele checklist</strong> vóór publicatie voorkomt broken links, foute feiten en posts zonder CTA.`,
      ),
      h2("Checklist"),
      ol([
        "Feiten, prijzen en productnamen gecontroleerd.",
        "Interne en externe links werken; ankertekst is zinvol.",
        "Afbeeldingen: formaat, alt-tekst, rechten.",
        "Title, meta, slug en uitgelichte afbeelding gezet.",
        "CTA of volgende stap aanwezig (ticket, contact, gerelateerd artikel).",
        "Mobiele preview gelezen.",
      ]),
      tip("Bewaar de checklist als herbruikbaar blok of document voor het team."),
      outro("Concept → publiceren; afbeeldingen optimaliseren."),
    ].join("\n"),

  "tz-blog-theme-choice": () =>
    [
      p(
        `Een blogthema moet <strong>leesbaarheid en snelheid</strong> dienen — niet alleen een mooie homepage.`,
      ),
      h2("Selectiecriteria"),
      ul([
        "Goede single-post template (breedte, typografie, gerelateerde posts).",
        "Lichtgewicht: weinig demo-import en pagebuilder-afhankelijkheid.",
        "Regelmatige updates en WP-compatibiliteit.",
        "Toegankelijke navigatie naar archief/categorieën.",
      ]),
      h2("Vermijd"),
      ul([
        "Thema’s die elke post als landingspagina forceren.",
        "Zware animaties die Core Web Vitals breken.",
        "Child themes zonder documentatie als je geen developer hebt.",
      ]),
      outro("Typografie en layout; custom CSS."),
    ].join("\n"),

  "tz-blog-typography-layout": () =>
    [
      p(
        `Lange artikelen vragen om <strong>rustige typografie</strong>: regelafstand, max-breedte en contrast.`,
      ),
      h2("Instellingen die helpen"),
      ul([
        "Leesbreedte rond 60–75 tekens per regel.",
        "Voldoende witruimte tussen H2-secties.",
        "Donkere tekst op lichte achtergrond (of omgekeerd met echt contrast).",
        "Vermijd te veel fontvarianten.",
      ]),
      h2("Layout"),
      ol([
        "Sidebar alleen als die de leesflow niet onderbreekt.",
        "Sticky TOC kan helpen bij lange posts — spaarzaam.",
        "Test dark mode / systeemvoorkeuren als je thema dat support.",
      ]),
      outro("Dark mode en embeds; thema kiezen."),
    ].join("\n"),

  "tz-blog-featured-image": () =>
    [
      p(
        `De <strong>uitgelichte afbeelding</strong> (featured image) verschijnt in archieven, social shares en soms in zoekresultaten. Zonder beeld oogt het blog onaf.`,
      ),
      h2("Waarom belangrijk"),
      ul([
        "Herkenbaarheid in overzichten en RSS.",
        "Open Graph / social previews.",
        "Visuele consistentie van je merk.",
      ]),
      h2("Praktijk"),
      ol([
        "Stel een vast formaat-beleid (bijv. 1200×630).",
        "Gebruik geen tekst-in-beeld die onleesbaar wordt in thumbnails.",
        "Controleer of het thema de image correct bijsnijdt.",
      ]),
      tip("Upload altijd vóór publiceren — niet ‘later nog even’."),
      outro("Afbeeldingen optimaliseren; social delen."),
    ].join("\n"),

  "tz-blog-image-optimize": () =>
    [
      p(
        `Zware afbeeldingen maken blogs traag. Optimaliseer <strong>formaat, alt-tekst en lazy load</strong> zonder kwaliteit weg te gooien.`,
      ),
      h2("Checklist"),
      ul([
        "Juiste afmetingen vóór upload (niet 4000px voor een contentbreedte van 800).",
        "WebP/JPEG met redelijke compressie.",
        "Alt-tekst beschrijft de inhoud; decoratieve beelden mogen leeg of markering ‘decoratief’.",
        "Lazy load aan (standaard in moderne WP) — hero/featured soms uitgezonderd.",
      ]),
      warn("Bulk-plugins die alles ‘optimaliseren’ kunnen metadata of kwaliteit ongewenst strippen — test eerst."),
      outro("Video/podcast embeds; site versnellen."),
    ].join("\n"),

  "tz-blog-archive-page": () =>
    [
      p(
        `Een overzichtelijke <strong>blogpagina</strong> (archief, grid of lijst) helpt bezoekers oudere posts te vinden.`,
      ),
      h2("Keuzes"),
      ul([
        "Lijst — beter voor tekstgerichte merken.",
        "Grid — sterker bij visuele featured images.",
        "Filters op categorie alleen als je genoeg volume hebt.",
      ]),
      h2("Inrichten"),
      ol([
        "Stel ‘Berichtenpagina’ in onder Instellingen → Lezen.",
        "Toon excerpt + lees meer, niet de volle post.",
        "Paginate; vermijd oneindig scroll zonder toegankelijkheid.",
      ]),
      outro("Categorieën vs tags; uitgelichte afbeelding."),
    ].join("\n"),

  "tz-blog-embeds-readability": () =>
    [
      p(
        `Dark mode, embeds en media kunnen de <strong>leeservaring breken</strong> als contrast, autofocus of cookies niet kloppen.`,
      ),
      h2("Risico’s"),
      ul([
        "Embeds met witte achtergrond in dark mode.",
        "Autoplay video/audio.",
        "Te veel social widgets die de kolom versmallen.",
        "Cookie-banners die de eerste alinea bedekken.",
      ]),
      h2("Mitigatie"),
      ol([
        "Test posts in light én dark (als beschikbaar).",
        "Gebruik native WP-embeds of lichte oEmbed.",
        "Plaats zware media onder de vouw of achter een klik.",
      ]),
      outro("Video/podcast embeds; typografie."),
    ].join("\n"),

  "tz-blog-video-podcast-embeds": () =>
    [
      p(
        `Video- en podcast-embeds verrijken posts, maar kunnen <strong>LCP en TBT</strong> verknoeien als je alles hard laadt.`,
      ),
      h2("Best practices"),
      ul([
        "Eén primaire embed per post tenzij nodig.",
        "Facade/placeholder: laad speler na klik.",
        "Host zware bestanden niet onnodig op dezelfde shared hosting.",
        "Transcript of samenvatting voor toegankelijkheid en SEO.",
      ]),
      tip("Meet vóór/na met PageSpeed of je AI-scan Performance-score."),
      outro("Afbeeldingen optimaliseren; WordPress versnellen."),
    ].join("\n"),

  "tz-blog-custom-css": () =>
    [
      p(
        `Custom CSS voor bloglayout kan — als je <strong>klein, specifiek en omkeerbaar</strong> werkt.`,
      ),
      h2("Veilig"),
      ul([
        "Extra witruimte, max-width, font-size op .entry-content.",
        "Child theme of Customizer Additional CSS — niet core-bestanden.",
        "Documenteer wat je wijzigde.",
      ]),
      h2("Onveilig / riskant"),
      ul([
        "Display:none op hele blokken die SEO-content verbergen.",
        "CSS die plugins/admin breekt.",
        "!important-oorlog zonder test op mobiel.",
      ]),
      warn(`Bij twijfel: ticket bij TripleZero iT in plaats van live te ‘fixen’ op productie.`),
      outro("Thema kiezen; white screen na publiceren."),
    ].join("\n"),

  "tz-blog-email-list": () =>
    [
      p(
        `Een e-maillijst vanuit je blog bouwt je eigen bereik — met <strong>echte opt-in</strong>, geen verborgen pre-checks.`,
      ),
      h2("Opzetten"),
      ol([
        "Kies een tool (newsletter provider) met double opt-in waar nodig.",
        "Plaats een formulier onder posts + één vaste pagina.",
        "Beloof frequentie en inhoud; houd je eraan.",
        "Koppel bedankpagina of bevestigingsmail.",
      ]),
      h2("Anti-spam"),
      ul([
        "Geen gekochte lijsten.",
        "Eenvoudige honeypot/CAPTCHA bij openbare formulieren.",
        "Uitschrijven moet één klik zijn.",
      ]),
      outro("Nieuwsbriefworkflow; contactformulier."),
    ].join("\n"),

  "tz-blog-social-sharing": () =>
    [
      p(
        `Nieuwe posts delen kan <strong>handmatig of semi-automatisch</strong>. Volledige auto-post overal leidt vaak tot spammy feeds.`,
      ),
      h2("Handmatig (aanbevolen start)"),
      ul([
        "Korte teaser + link + passende afbeelding.",
        "Pas toon aan per kanaal (LinkedIn ≠ Instagram).",
        "Plan 1–2 herinneringsposts voor evergreen content.",
      ]),
      h2("Automatisering"),
      ol([
        "RSS-naar-social alleen voor kanalen die dat verdragen.",
        "Controleer Open Graph-tags (titel, image).",
        "Monitor of auto-posts niet dubbel publiceren.",
      ]),
      outro("Uitgelichte afbeelding; meet blogresultaat."),
    ].join("\n"),

  "tz-blog-rss-sitemaps": () =>
    [
      p(
        `RSS, sitemaps en Search Console zorgen dat <strong>nieuwe posts vindbaar</strong> blijven bij lezers en crawlers.`,
      ),
      h2("Checklist"),
      ul([
        "XML-sitemap bevat posts en wordt bijgewerkt na publicatie.",
        "RSS-feed werkt (/feed/) voor abonnees en tools.",
        "Geen noindex op berichten of categorieën per ongeluk.",
        "Canonicals wijzen naar de juiste URL.",
      ]),
      h2("Na publicatie"),
      ol([
        "Sitemap in Search Console (eenmalig + bij grote wijzigingen).",
        "Controleer URL-inspectie bij belangrijke lanceringen.",
        "Fix 404’s en soft-404 archieven.",
      ]),
      outro("GSC en Analytics koppelen; permalinks."),
    ].join("\n"),

  "tz-blog-comment-policy": () =>
    [
      p(
        `Een helder <strong>commentbeleid</strong> stimuleert discussie en houdt spam en toxiciteit buiten.`,
      ),
      h2("Beleid"),
      ul([
        "Moderatie voor eerste comment van nieuwe gebruikers.",
        "Geen links-dumps, haat of off-topic promo.",
        "Antwoord binnen een redelijke termijn op serieuze vragen.",
      ]),
      h2("Techniek"),
      ol([
        "Akismet of vergelijkbare spamfilter.",
        "Sluit comments op oude posts als spam explodeert.",
        "Overweeg een community elders (forum) bij hoog volume.",
      ]),
      tip("Zie ook het artikel over comments die als spam worden gezien."),
      outro("Comments vastgelopen; spam en veiligheid."),
    ].join("\n"),

  "tz-blog-measure-results": () =>
    [
      p(
        `Meet of je blog resultaat oplevert met een <strong>kleine set KPI’s</strong>: verkeer, engagement en leads — niet alleen ‘likes’.`,
      ),
      h2("Kernmetrics"),
      ul([
        "Sessies/gebruikers naar blog en landings vanuit posts.",
        "Tijd op pagina / scroll (indicatie van lezen).",
        "Conversies: formulier, nieuwsbrief, ticket, belafspraak.",
        "Zoekvragen en landings in Search Console.",
      ]),
      h2("Ritme"),
      ol([
        "Maandelijks: top posts en dalers.",
        "Kwartaal: welke clusters groeien.",
        "Stop of herschrijf posts die structureel nul opleveren.",
      ]),
      outro("GSC/Analytics; monetisatie."),
    ].join("\n"),

  "tz-blog-monetization": () =>
    [
      p(
        `Monetisatie via affiliates of sponsored posts mag — mits je <strong>transparant vermeldt</strong> wat betaald of gesponsord is.`,
      ),
      h2("Vormen"),
      ul([
        "Affiliate links met disclosure.",
        "Sponsored posts / partnerships.",
        "Eigen diensten soft-promoten (CTA naar TripleZero iT-aanbod).",
      ]),
      h2("Regels"),
      ol([
        "Vermeld duidelijk wanneer er een belangenconflict is.",
        "Behoud redactionele kwaliteit — verkoop geen trust.",
        "Check juridische eisen voor jouw markt (reclamecodes).",
      ]),
      warn("Verborgen affiliate-netwerken schaden merk en kunnen platforms straffen."),
      outro("Auteurs en bylines; e-maillijst."),
    ].join("\n"),

  "tz-blog-gsc-analytics": () =>
    [
      p(
        `Koppel je blog aan <strong>Google Search Console</strong> en <strong>Analytics</strong> om indexatie en gedrag te zien.`,
      ),
      h2("Search Console"),
      ol([
        "Verifieer het domein (DNS of HTML-tag).",
        "Dien de sitemap in.",
        "Monitor dekking, ervaring en zoekvragen.",
      ]),
      h2("Analytics"),
      ul([
        "Gebruik een privacyvriendelijke setup / consent waar verplicht.",
        "Markeer belangrijke events (nieuwsbrief, contact).",
        "Filter interne hits als het team veel test.",
      ]),
      tip(`Bij hosting bij TripleZero iT helpen we vaak met DNS-verificatie via ticket.`),
      outro("RSS en sitemaps; blogresultaat meten."),
    ].join("\n"),

  "tz-blog-newsletter-workflow": () =>
    [
      p(
        `Een eenvoudige workflow: <strong>publiceren → nieuwsbrief</strong> houdt abonnees warm zonder elke week een losse campagne te verzinnen.`,
      ),
      h2("Workflow"),
      ol([
        "Post is live en checklist-afgerond.",
        "Neem titel, excerpt en link over in de nieuwsbrieftool.",
        "Voeg 1–2 zinnen context toe (waarom nu relevant).",
        "Verstuur of plan; archiveer de campagne.",
      ]),
      h2("Tips"),
      ul([
        "Niet élke micro-update mailen — voorkom afmeldingen.",
        "Segment alleen als je volume en relevantie hebt.",
        "Meet open/klik, maar optimaliseer op landingsconversie.",
      ]),
      outro("E-maillijst opbouwen; social delen."),
    ].join("\n"),

  "tz-blog-comments-list-stuck": () =>
    [
      p(
        `Als reacties of het berichtenoverzicht in WordPress <strong>vastlopen</strong>, is het vaak een plugin-, geheugen- of database-issue — niet ‘kapotte content’.`,
      ),
      h2("Eerste checks"),
      ol([
        "Probeer veilige modus / alle plugins uit (staging bij voorkeur).",
        "Wissel tijdelijk naar een standaardthema.",
        "Verhoog geheugenlimiet alleen als logs dat suggereren.",
        "Controleer browserconsole en server error logs.",
      ]),
      h2("Daarna"),
      ul([
        "Grote commenttabellen: opruimen/spam verwijderen.",
        "Conflict met pagebuilders of security-plugins.",
        "Ticket bij TripleZero iT met tijdstip, URL en recente wijzigingen.",
      ]),
      outro("White screen na publiceren; maandelijks onderhoud."),
    ].join("\n"),

  "tz-blog-restore-post": () =>
    [
      p(
        `Een per ongeluk verwijderde of overschreven blogpost is vaak te herstellen via <strong>prullenbak, revisies of backup</strong>.`,
      ),
      h2("Stappen"),
      ol([
        "Berichten → Prullenbak: herstellen indien aanwezig.",
        "Revisies in de editor: eerdere versie terugzetten.",
        "Hostbacking / TripleZero iT-backup: database + uploads terugzetten (zorgvuldig).",
        "Als alleen tekst weg is: lokale concepten, e-mail, Notion/Docs.",
      ]),
      warn("Overschrijf niet blind een hele database als alleen één post weg is — vraag support om een gerichte restore."),
      outro("Media-library problemen; backups."),
    ].join("\n"),

  "tz-blog-media-library-issues": () =>
    [
      p(
        `Mislukte uploads of een ‘lege’ mediabibliotheek wijzen vaak op <strong>rechten, schijfruimte of padproblemen</strong>.`,
      ),
      h2("Controles"),
      ul([
        "Schijfquota en inode-limieten in hostingpanel.",
        "Map wp-content/uploads schrijfrechten.",
        "Max upload size / post size in PHP.",
        "CDN of offload-plugin die URL’s breekt.",
      ]),
      h2("Wat je kunt doen"),
      ol([
        "Upload een klein JPG ter test.",
        "Controleer of bestanden wél via FTP/SFTP staan maar niet in de library (DB vs files).",
        "Regenereer thumbnails alleen met een bewezen tool.",
        "Open een ticket met foutmelding uit het netwerk-tabblad.",
      ]),
      outro("Afbeeldingen optimaliseren; blogpost herstellen."),
    ].join("\n"),

  "tz-blog-safe-updates": () =>
    [
      p(
        `Thema- en plugin-updates plan je zodat de blog <strong>niet platgaat</strong> tijdens kantooruren of campagnes.`,
      ),
      h2("Aanpak"),
      ol([
        "Backup of snapshot vóór updates.",
        "Lees changelogs van kritieke plugins.",
        "Update eerst op staging of buiten piek.",
        "Test één key post + checkout/formulier indien aanwezig.",
        "Pas daarna productie bij.",
      ]),
      h2("Regels"),
      ul([
        "Niet twintig plugins tegelijk ‘blind’ updaten.",
        "Verwijder inactieve plugins in plaats van ze jaren te laten liggen.",
        "Major theme-updates apart van contentpublicaties plannen.",
      ]),
      outro("Website down na update; maandelijks onderhoud."),
    ].join("\n"),

  "tz-blog-wsod-after-publish": () =>
    [
      p(
        `Een <strong>white screen</strong> of 500-fout na publiceren komt vaak door een kapot blok, te zware shortcode of PHP-fout in een plugin — niet door ‘het internet’.`,
      ),
      h2("Direct"),
      ol([
        "Open de post in de admin (als dat nog kan) en zet terug naar concept.",
        "Activeer WP_DEBUG_LOG op staging of vraag logs bij TripleZero iT.",
        "Deactiveer recent toegevoegde plugins/blokken.",
        "Herstel vanuit revisie of backup als de site hard down is.",
      ]),
      h2("Preventie"),
      ul([
        "Geen ongeteste HTML/PHP in posts.",
        "Vermijd verouderde shortcodes van verwijderde plugins.",
        "Publiceer grote layoutwijzigingen eerst als concept-preview.",
      ]),
      outro("Kritieke fout WordPress; comments/lijst vastgelopen."),
    ].join("\n"),

  "tz-blog-monthly-checklist": () =>
    [
      p(
        `Maandelijks blogonderhoud bij TripleZero iT houdt content, techniek en meting in sync — zonder elke week brandjes te blussen.`,
      ),
      h2("Content"),
      ul([
        "Verouderde posts updaten of noindexen.",
        "Broken links en outdated screenshots.",
        "Redactionele backlog en publicatiekalender bijwerken.",
      ]),
      h2("Techniek"),
      ol([
        "Backups gecontroleerd (restore-test periodiek).",
        "Plugins/thema/core volgens safe-updateplan.",
        "Spamcomments en gebruikers opruimen.",
        "Snelheid: zware media en ongebruikte plugins.",
      ]),
      h2("Meting"),
      ul([
        "Search Console: dekking en dalers.",
        "Top posts vs doelen (leads/nieuwsbrief).",
        "Ticket openen bij structurele fouten of hacksignalen.",
      ]),
      tip("Koppel deze checklist aan je hosting- of Business-onderhoudspakket."),
      outro("Veilige updates; blogresultaat meten."),
    ].join("\n"),
};

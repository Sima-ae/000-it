/**
 * Dutch kennisbank bodies for AI-agents topics (TripleZero iT dashboard agents).
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
    `Heb je na het volgen van deze stappen nog vragen? Neem contact op met TripleZero iT support via het ticketssysteem. Vermeld je pakketnaam, agenttype en status, zodat we sneller kunnen helpen.`,
    related
      ? `Gerelateerd: ${related}`
      : `Bekijk ook andere artikelen in de categorie AI-agents voor beheer, pakketten en workflows.`,
  );
}

type Ctx = { title: string; topic: string };

function typeArticle(opts: {
  typeLabel: string;
  typeCode: string;
  intro: string;
  does: string[];
  when: string[];
  not: string[];
  related: string;
}) {
  return () =>
    [
      p(
        `De <strong>${opts.typeLabel}</strong> (<code>${opts.typeCode}</code>) is een van de AI-agenttypen in je TripleZero iT-dashboard onder <code>/ai-agents</code>. ${opts.intro}`,
      ),
      h2("Wat deze agent doet"),
      ul(opts.does),
      h2("Wanneer je deze agent inzet"),
      ul(opts.when),
      h2("Wat deze agent niet vervangt"),
      ul(opts.not),
      h2("Zo beheert u de agent"),
      ol([
        "Log in en open <strong>AI-agents</strong> in het dashboard.",
        `Zoek de kaart met type ${opts.typeLabel} (of de naam die bij dit type hoort).`,
        "Kies <strong>Start</strong> (RUNNING), <strong>Pause</strong> (PAUSED) of <strong>Idle</strong> (IDLE).",
        "Controleer daarna “Tasks completed” en of de status klopt met wat je verwacht.",
      ]),
      tip(
        "Combineer agentwerk met een AI-scan of AEO/GEO/SEO-traject: agents ondersteunen doorlopend werk, scans geven een momentopname.",
      ),
      outro(opts.related),
    ].join("\n");
}

export const agentTopicBuilders: Record<string, (ctx: Ctx) => string> = {
  "tz-agents-seo-type": typeArticle({
    typeLabel: "SEO-agent",
    typeCode: "SEO_AGENT",
    intro:
      "Deze agent ondersteunt vindbaarheid: klassieke SEO én signalen die meewerken voor AEO en lokale GEO.",
    does: [
      "Helpt bij doorlopende SEO-taken binnen je workspace (prioriteiten, checks, opvolging).",
      "Past bij content- en technische verbeterpunten die uit scans of trajecten komen.",
      "Werkt naast — niet in plaats van — handmatige SEO-fixes en specialistisch advies.",
    ],
    when: [
      "Je wilt structureel aan vindbaarheid werken binnen je pakket.",
      "Je hebt al een AI-scan of SEO-basis en wilt doorlopende ondersteuning.",
      "Je Business- of Extra Growth-pakket bevat minstens één agent-slot voor SEO.",
    ],
    not: [
      "Geen garantie op rankings of klikken.",
      "Geen vervanging van DNS-, hosting- of WordPress-fixes.",
      "Geen volledige vervanging van een AEO/GEO/SEO-plus- of pro-traject.",
    ],
    related: "SEO-agent bij AEO/GEO/SEO; AI-scan samen met agents.",
  }),

  "tz-agents-content-type": typeArticle({
    typeLabel: "content-agent",
    typeCode: "CONTENT_AGENT",
    intro:
      "Deze agent ondersteunt teksten en pagina’s: blogs, landingspagina’s, FAQ’s en gerelateerde contentworkflows.",
    does: [
      "Ondersteunt contentplanning en uitwerking binnen je account.",
      "Past bij blogs, landingspagina’s en FAQ’s die je zichtbaarheid versterken.",
      "Helpt om consistent te publiceren zonder alles handmatig te herhalen.",
    ],
    when: [
      "Je publiceert regelmatig of wilt een contentritme opbouwen.",
      "Je combineert content met SEO- of research-agents.",
      "Je hebt heldere onderwerpen en een doelgroep (zzp, MKB, lokale dienst).",
    ],
    not: [
      "Geen eindredactie of juridische review van claims.",
      "Geen automatische publicatie naar externe CMS’en zonder jouw controle.",
      "Geen vervanging van merkstem en productkennis die alleen jij hebt.",
    ],
    related: "Content-agents bij blogs en FAQ’s; research + content combineren.",
  }),

  "tz-agents-social-type": typeArticle({
    typeLabel: "social-agent",
    typeCode: "SOCIAL_AGENT",
    intro:
      "Deze agent ondersteunt social media: posts, ritme en afstemming met je marketingboodschap.",
    does: [
      "Helpt bij social-taken en opvolging binnen je workspace.",
      "Past bij kanalen waar je al aanwezig bent (of wilt starten).",
      "Werkt goed samen met ads- en content-agents in één workflow.",
    ],
    when: [
      "Je wilt regelmaat op social zonder alles ad hoc te doen.",
      "Je koppelt social aan campagnes of content die je al maakt.",
      "Je Extra Growth- of Enterprise-pakket biedt ruimte voor een tweede agent.",
    ],
    not: [
      "Geen belofte van viraliteit of volgersgroei.",
      "Geen vervanging van community-management bij klachten of crises.",
      "Geen automatische posten naar alle netwerken zonder jouw goedkeuring.",
    ],
    related: "Social- en ads-workflow; weekplanning met agents.",
  }),

  "tz-agents-ads-type": typeArticle({
    typeLabel: "ads-agent",
    typeCode: "ADS_AGENT",
    intro:
      "Deze agent ondersteunt campagnewerk: structuur, checks en opvolging rond advertenties.",
    does: [
      "Ondersteunt ads-gerelateerde taken in je dashboard.",
      "Past bij campagnes die je al runt of wilt voorbereiden.",
      "Helpt om ads, social en landingspagina’s beter op elkaar af te stemmen.",
    ],
    when: [
      "Je investeert in betaalde zichtbaarheid en wilt agent-ondersteuning.",
      "Je combineert ads met een sterke landingspagina en tracking.",
      "Je hebt budgetdiscipline: agents vervangen geen mediabudget.",
    ],
    not: [
      "Geen beheer van Google Ads-/Meta-accounts zonder jouw toegang en goedkeuring.",
      "Geen garantie op ROAS of conversies.",
      "Geen vervanging van conversie-tracking of privacy-instellingen op de site.",
    ],
    related: "Social + ads als marketingworkflow; e-commerce met agents.",
  }),

  "tz-agents-analytics-type": typeArticle({
    typeLabel: "analytics-agent",
    typeCode: "ANALYTICS_AGENT",
    intro:
      "Deze agent helpt om data te duiden: trends, aandachtspunten en opvolgacties naast je dashboards.",
    does: [
      "Ondersteunt analytics-taken binnen je workspace.",
      "Past bij het interpreteren van resultaten uit scans, SEO en campagnes.",
      "Helpt prioriteiten te stellen op basis van signalen in plaats van onderbuik.",
    ],
    when: [
      "Je hebt meetpunten (AI-scan, analytics, campagneresultaten) maar te weinig tijd om te duiden.",
      "Je wilt wekelijks of maandelijks een vaste reviewritme.",
      "Je combineert analytics met SEO- of ads-agents.",
    ],
    not: [
      "Geen vervanging van Google Analytics / Search Console-setup.",
      "Geen privacy- of AVG-advies op maat.",
      "Geen automatische wijziging van live campagnes zonder jouw actie.",
    ],
    related: "Resultaten meten van AI-agents; AI-scan samen gebruiken.",
  }),

  "tz-agents-chatbot-type": typeArticle({
    typeLabel: "chatbot-agent",
    typeCode: "CHATBOT_AGENT",
    intro:
      "Deze agent ondersteunt gesprekken en antwoorden in een support- of websitecontext — naast live chat en tickets.",
    does: [
      "Helpt bij chatbot-gerelateerde taken in je account.",
      "Past bij veelgestelde vragen en eerste lijn-antwoorden.",
      "Werkt samen met tickets wanneer een mens moet overnemen.",
    ],
    when: [
      "Je krijgt herhaaldelijke vragen die je wilt standaardiseren.",
      "Je wilt Agent 000 / live chat aanvullen met agentwerk in het dashboard.",
      "Je hebt duidelijke FAQ’s en een escalatiepad naar support.",
    ],
    not: [
      "Geen vervanging van spoed-support bij storingen.",
      "Geen juridisch bindende antwoorden over contracten of SLA’s.",
      "Niet hetzelfde als Agent 000 in de publieke chatwidget — zie het verschil-artikel.",
    ],
    related: "Chatbot naast live chat en tickets; verschil met Agent 000.",
  }),

  "tz-agents-research-type": typeArticle({
    typeLabel: "research-agent",
    typeCode: "RESEARCH_AGENT",
    intro:
      "Deze agent ondersteunt marktonderzoek: concurrentie, onderwerpen, kansen en input voor content of diensten.",
    does: [
      "Ondersteunt research-taken binnen je workspace.",
      "Past bij nieuwe diensten, niches of contentclusters.",
      "Levert input die je daarna met een content- of SEO-agent verder uitwerkt.",
    ],
    when: [
      "Je verkent een nieuwe markt of dienst.",
      "Je wilt onderwerpen valideren vóór je veel content schrijft.",
      "Je combineert research met content in Extra Growth of Enterprise.",
    ],
    not: [
      "Geen juridisch of financieel due diligence-rapport.",
      "Geen vervanging van klantinterviews of verkoopgesprekken.",
      "Geen garantie dat een niche commercieel rendabel is.",
    ],
    related: "Research + content combineren; eerste agenttype in Business.",
  }),

  "tz-agents-first-business": () =>
    [
      p(
        `In het <strong>Business</strong>-pakket krijg je <strong>1× AI-agent</strong>. Kies daarom het type dat het snelst bijdraagt aan jouw doel — niet “alles tegelijk”.`,
      ),
      h2("Aanbevolen startkeuzes"),
      ul([
        "<strong>SEO-agent</strong> — als vindbaarheid en AEO/GEO/SEO je kern zijn.",
        "<strong>Content-agent</strong> — als je vooral teksten, blogs of landingspagina’s moet leveren.",
        "<strong>Chatbot-agent</strong> — als supportvragen je tijd opslokken.",
        "<strong>Research-agent</strong> — als je nog markt of aanbod scherp moet krijgen.",
      ]),
      h2("Zo maak je de keuze"),
      ol([
        "Schrijf één hoofddoel voor de komende 90 dagen (bijv. meer organisch verkeer of minder herhaalvragen).",
        "Koppel dat doel aan één agenttype hierboven.",
        "Start de agent via <code>/ai-agents</code> en plan wekelijks 15 minuten review.",
        "Upgrade pas naar Extra Growth (2 agents) als één type structureel te smal voelt.",
      ]),
      tip(
        "Doe eerst een AI-scan: de scores helpen om te kiezen tussen SEO-, content- of analytics-focus.",
      ),
      outro("Upgrade naar Extra Growth; agenttypen overzicht."),
    ].join("\n"),

  "tz-agents-pair-growth": () =>
    [
      p(
        `In <strong>Extra Growth</strong> heb je <strong>2× AI-agents</strong>. Kies een duo dat elkaar versterkt in plaats van twee losse eilandjes.`,
      ),
      h2("Sterke combinaties"),
      ul([
        "<strong>SEO + content</strong> — vindbaarheid én pagina’s die scoren.",
        "<strong>Research + content</strong> — eerst onderwerpen valideren, dan schrijven.",
        "<strong>Social + ads</strong> — betaald en organisch op één boodschap.",
        "<strong>Analytics + SEO</strong> — meten en bijsturen op zichtbaarheid.",
        "<strong>Chatbot + content</strong> — FAQ’s uit chat naar content tillen.",
      ]),
      h2("Combinaties die meestal minder slim zijn"),
      ul([
        "Twee pure research-achtige rollen zonder uitvoerende agent.",
        "Ads + social zonder landingspagina of content om verkeer op te vangen.",
        "Alles op chatbot terwijl je site technisch of SEO-matig achterloopt.",
      ]),
      warn(
        "Start niet beide agents tegelijk op MAXIMUM tijdens een migratie of grote site-wijziging — pauzeer bij onderhoud.",
      ),
      outro("Veilig meerdere agents; weekplanning."),
    ].join("\n"),

  "tz-agents-one-type": () =>
    [
      p(
        `In het TripleZero iT-dashboard heeft elke AI-agent <strong>één type</strong> (bijvoorbeeld <code>SEO_AGENT</code> of <code>CONTENT_AGENT</code>). Eén agentkaart is dus niet tegelijk SEO én ads.`,
      ),
      h2("Wat dat betekent"),
      ul([
        "Het type bepaalt de rol van die agent in je workspace.",
        "Wil je twee rollen? Gebruik twee agent-slots (Extra Growth of Enterprise).",
        "Taken (<code>Task</code>) kunnen aan een agent hangen, maar het agenttype blijft vast.",
      ]),
      h2("Praktisch advies"),
      ol([
        "Kies per slot één duidelijke rol.",
        "Gebruik projecten in het CRM om werk te groeperen zonder het type te “mixen”.",
        "Documenteer in je weekplanning welke agent welk doel dient.",
      ]),
      tip(
        "Namen in het overzicht helpen herkennen (“SEO – webshop”, “Content – blog”) — het type blijft leidend.",
      ),
      outro("Agenttypen; herkennen in het overzicht."),
    ].join("\n"),

  "tz-agents-status-error-completed": () =>
    [
      p(
        `Naast RUNNING, PAUSED en IDLE bestaan ook <strong>ERROR</strong> en <strong>COMPLETED</strong>. Die statussen tonen dat een run is mislukt of (tijdelijk) is afgerond.`,
      ),
      h2("ERROR"),
      ul([
        "De agent kon de laatste actie niet normaal afronden.",
        "Start niet blind opnieuw: noteer tijdstip, agentnaam/type en wat je net deed.",
        "Probeer Idle → Start opnieuw na een korte pauze; blijft ERROR? Open een ticket.",
      ]),
      h2("COMPLETED"),
      ul([
        "Een run of taakreeks is afgerond volgens de agentstatus.",
        "Controleer “Tasks completed” en of het verwachte resultaat zichtbaar is in je project of content.",
        "Zet daarna Idle of start opnieuw als je een nieuwe cyclus wilt.",
      ]),
      warn(
        "ERROR is geen “gewoon idle”. Negeer herhaalde ERROR-statussen niet — die wijzen op configuratie- of platformproblemen.",
      ),
      outro("Agent op ERROR; supportgegevens bij agentproblemen."),
    ].join("\n"),

  "tz-agents-tasks-completed": () =>
    [
      p(
        `Op elke agentkaart zie je <strong>Tasks completed</strong>: een teller van afgeronde taken die aan die agent gekoppeld zijn.`,
      ),
      h2("Hoe je de teller leest"),
      ul([
        "Stijgt de teller tijdens RUNNING? De agent verwerkt werk.",
        "Blijft de teller stil terwijl status RUNNING is? Controleer of er taken zijn en of er een blokkade is.",
        "De teller is een voortgangssignaal — geen KPI voor omzet of rankings.",
      ]),
      h2("Wat je zelf doet"),
      ol([
        "Open <code>/ai-agents</code> en noteer de teller vóór je start.",
        "Laat de agent een redelijke periode draaien (niet seconden).",
        "Vergelijk de teller en status na je reviewmoment.",
        "Koppel inzichten aan je weekdoelen (content gepubliceerd, checks gedaan, etc.).",
      ]),
      tip(
        "Combineer de teller met projectstatus in het CRM voor een completer beeld.",
      ),
      outro("Taken niet toenemen; resultaten meten."),
    ].join("\n"),

  "tz-agents-link-project": () =>
    [
      p(
        `AI-agents kunnen aan een <strong>project</strong> in je TripleZero iT-omgeving hangen. Zo blijft agentwerk zichtbaar naast website-, SEO- of ads-projecten in het CRM.`,
      ),
      h2("Waarom koppelen"),
      ul([
        "Overzicht: welke agent hoort bij welk traject.",
        "Samenwerking: support en jij praten over hetzelfde project.",
        "Prioriteit: Idle/Pause per project tijdens onderhoud.",
      ]),
      h2("Aanpak"),
      ol([
        "Maak of open een project in het CRM (website, SEO, ads, AI).",
        "Open <code>/ai-agents</code> en controleer of de agent bij jouw account hoort.",
        "Stem met support af als een agent nog niet aan het juiste project hangt — provisioning gebeurt vaak vanuit je pakket.",
        "Gebruik duidelijke agentnamen die naar het project verwijzen.",
      ]),
      warn(
        "Wijzig niet zelf databasevelden; projectkoppelingen lopen via het platform en support.",
      ),
      outro("Projecten in CRM; veilig meerdere agents."),
    ].join("\n"),

  "tz-agents-rename-recognize": () =>
    [
      p(
        `In het AI-agents-overzicht zie je per kaart een <strong>naam</strong>, <strong>type</strong>, <strong>status</strong> en taken-teller. Goede namen maken beheer sneller — vooral met 2+ agents.`,
      ),
      h2("Herkennen zonder verwarring"),
      ul([
        "Kijk eerst naar type (SEO, content, social, …).",
        "Gebruik de statusbadge om RUNNING/PAUSED/IDLE te zien.",
        "Gebruik de naam om context te geven (“SEO – shop”, “Content – blog Q2”).",
      ]),
      h2("Naamgeving — best practice"),
      ol([
        "Begin met het doel of kanaal.",
        "Voeg eventueel de markt of site toe (één account, meerdere merken).",
        "Vermijd alleen “Agent 1” of generieke labels.",
        "Vraag support om een hernoeming als je zelf geen naamveld ziet in de UI.",
      ]),
      tip(
        "Houd namen kort genoeg voor de kaartweergave op mobiel.",
      ),
      outro("Meerdere typen; teamrechten."),
    ].join("\n"),

  "tz-agents-paused-vs-idle": () =>
    [
      p(
        `<strong>PAUSED</strong> en <strong>IDLE</strong> lijken allebei “niet actief”, maar je gebruikt ze anders.`,
      ),
      h2("PAUSED"),
      ul([
        "Tijdelijke stop: je wilt zo terug starten.",
        "Geschikt bij korte onderhoudsvensters of campagnestops.",
        "Signaleert: “stond aan, bewust gepauzeerd”.",
      ]),
      h2("IDLE"),
      ul([
        "Geen actieve run; basis-/ruststand.",
        "Geschikt als je de agent voorlopig niet inzet.",
        "Handig na COMPLETED of als je opschoont in het overzicht.",
      ]),
      h2("Kies zo"),
      ol([
        "Korte onderbreking (uren/dagen) → PAUSED.",
        "Langere pauze of geen planning → IDLE.",
        "Storing vermoeden → eerst Idle, dan diagnose, daarna pas Start.",
      ]),
      outro("RUNNING pauzeren; migratie veilig."),
    ].join("\n"),

  "tz-agents-pause-running": () =>
    [
      p(
        `Als je een agent met status <strong>RUNNING</strong> op <strong>Pause</strong> zet, stopt de actieve run zo snel als het platform dat toelaat. Lopende seconden-taken kunnen nog afronden; nieuwe taken starten niet.`,
      ),
      h2("Wat je ziet"),
      ul([
        "Statusbadge wisselt naar PAUSED.",
        "Tasks completed blijft staan op de laatste stand.",
        "Je kunt later opnieuw Start kiezen om verder te gaan.",
      ]),
      h2("Wanneer pauzeren"),
      ul([
        "Website- of DNS-migratie.",
        "Grote contentrelease waarbij je conflicten wilt vermijden.",
        "Campagne die je bewust stillegt.",
      ]),
      tip(
        "Noteer waarom je pauzeerde (ticket of notitie) zodat je team weet wanneer je weer mag starten.",
      ),
      outro("PAUSED versus IDLE; migratieconflicten voorkomen."),
    ].join("\n"),

  "tz-agents-last-active": () =>
    [
      p(
        `Agents hebben een <strong>last active</strong>-moment (laatst actief). Dat helpt om te zien of een agent recent echt werk deed of al lang stilstaat.`,
      ),
      h2("Hoe gebruiken"),
      ul([
        "RUNNING + recent actief → waarschijnlijk bezig.",
        "RUNNING + lang niet actief → controleer taken/ERROR.",
        "IDLE + oud tijdstip → agent staat bewust of per ongeluk stil.",
      ]),
      h2("Checklist"),
      ol([
        "Open <code>/ai-agents</code>.",
        "Vergelijk status, last active en Tasks completed.",
        "Start of pauzeer bewust op basis van je weekplan.",
        "Bij twijfel: ticket met screenshot van de kaart.",
      ]),
      outro("Tasks completed; agent start niet."),
    ].join("\n"),

  "tz-agents-multi-safe": () =>
    [
      p(
        `Met meerdere AI-agents (Extra Growth of Enterprise) voorkom je conflicten door rollen, timing en onderhoud te scheiden.`,
      ),
      h2("Regels die werken"),
      ul([
        "Eén eigenaar per week (wie mag Start/Pause).",
        "Geen twee agents die dezelfde live pagina’s tegelijk “pushen” zonder afspraak.",
        "Pauzeer alle agents bij DNS-/hostingmigraties.",
        "Koppel agents aan projecten zodat scope duidelijk is.",
      ]),
      h2("Weekritme"),
      ol([
        "Maandag: statuscheck van alle kaarten.",
        "Dinsdag–donderdag: RUNNING alleen voor geplande agents.",
        "Vrijdag: review Tasks completed + resultaten.",
        "Voor onderhoud: alles naar PAUSED of IDLE.",
      ]),
      warn(
        "Enterprise “onbeperkt” betekent niet “alles tegelijk op RUNNING zonder plan”.",
      ),
      outro("Weekplanning; migratie veilig."),
    ].join("\n"),

  "tz-agents-after-order": () =>
    [
      p(
        `Na een geslaagde shopbestelling (Business, Extra Growth of Enterprise) worden AI-agents <strong>provisioned</strong> op je account. Dat is niet altijd instant zichtbaar.`,
      ),
      h2("Stappen na bestellen"),
      ol([
        "Rond checkout af en bewaar de bevestiging.",
        "Log uit/in of ververs het dashboard.",
        "Open <code>/ai-agents</code>.",
        "Zie je agents? Controleer type en zet Idle tot je klaar bent om te starten.",
        "Zie je niets? Wacht kort en open een ticket met ordernummer/pakketnaam.",
      ]),
      tip(
        "Snelle links op het dashboard wijzen ook naar AI-agents — handig om te bevestigen dat je menu-item bestaat.",
      ),
      outro("Geen agents in dashboard; quota Business vs Extra Growth."),
    ].join("\n"),

  "tz-agents-upgrade-growth": () =>
    [
      p(
        `Van <strong>Business (1 agent)</strong> naar <strong>Extra Growth (2 agents)</strong> upgrade je via de shop of support. Daarna volgt provisioning van het extra slot.`,
      ),
      h2("Upgrade-pad"),
      ol([
        "Kies Extra Growth in de shop of vraag een pakketwijziging aan.",
        "Rond betaling/bevestiging af.",
        "Controleer in <code>/ai-agents</code> of een tweede kaart verschijnt.",
        "Kies bewust het tweede type (zie combinatie-artikel).",
        "Start niet beide agents blind tijdens onderhoud.",
      ]),
      h2("Na de upgrade"),
      ul([
        "Documenteer welke agent welk doel heeft.",
        "Update je weekplanning.",
        "Informeer teamleden die mee mogen starten/pauzeren.",
      ]),
      outro("Eerste agent in Business; duo in Extra Growth."),
    ].join("\n"),

  "tz-agents-enterprise-unlimited": () =>
    [
      p(
        `In <strong>Enterprise</strong> staat “onbeperkt AI-agents”. Dat betekent ruim voldoende slots voor je organisatie — niet dat je zonder governance alles op RUNNING zet.`,
      ),
      h2("Wat onbeperkt wél betekent"),
      ul([
        "Schalen over merken, regio’s of teams.",
        "Meerdere typen parallel (SEO, content, ads, …).",
        "Maatwerk-afspraken via contact/Enterprise-traject.",
      ]),
      h2("Wat je toch regelt"),
      ul([
        "Eigenaarschap per agent.",
        "Pauzebeleid bij releases.",
        "Meetkaders zodat agents aan doelen blijven hangen.",
      ]),
      tip(
        "Vraag bij Enterprise-contact om een agent-matrix: type × merk × eigenaar.",
      ),
      outro("Teamrechten; veilig meerdere agents."),
    ].join("\n"),

  "tz-agents-buy-extra": () =>
    [
      p(
        `Standaard zitten AI-agents in de pakketten (1 / 2 / onbeperkt). Een losse agent “erbij” zonder pakketcontext is niet altijd een shopklik — vaak is opschalen via pakket of Enterprise de route.`,
      ),
      h2("Opties"),
      ul([
        "Upgrade Business → Extra Growth voor een tweede slot.",
        "Enterprise of maatwerk via contact voor meer capaciteit.",
        "Losse diensten in de shop dekken niet altijd een extra agent-slot — check producttekst of support.",
      ]),
      h2("Zo vraag je het aan"),
      ol([
        "Noteer je huidige pakket en hoeveel agents je ziet.",
        "Beschrijf welk type je nodig hebt en waarom.",
        "Open een ticket of gebruik Enterprise-contact.",
        "Wacht op provisioning vóór je processen omgooit.",
      ]),
      outro("Upgrade Extra Growth; Enterprise onbeperkt."),
    ].join("\n"),

  "tz-agents-team-permissions": () =>
    [
      p(
        `AI-agents horen bij het account/workspace. Niet elke medewerker mag zomaar Start/Pause — dat hangt af van rollen en wie toegang heeft tot het dashboard.`,
      ),
      h2("Praktische afspraken"),
      ul([
        "Bepaal 1–2 personen die agents mogen wijzigen.",
        "Deel Idle/Pause-beleid bij releases.",
        "Gebruik tickets voor wijzigingen als je geen gedeelde login wilt.",
      ]),
      h2("Als iemand geen agents ziet"),
      ol([
        "Controleer of die gebruiker is ingelogd op het juiste account.",
        "Controleer of het pakket agents bevat.",
        "Vraag de accountbeheerder of support om toegang/rol.",
      ]),
      warn(
        "Deel geen wachtwoorden; werk met juiste gebruikers en rollen in het klantenpanel.",
      ),
      outro("Agents na bestelling; supportgegevens."),
    ].join("\n"),

  "tz-agents-vs-agent000": () =>
    [
      p(
        `<strong>AI-agents</strong> in <code>/ai-agents</code> zijn workspace-helpers gekoppeld aan je pakket (SEO, content, social, …). <strong>Agent 000</strong> is de virtuele assistent in de live chat op de site die FAQ en kennisbank doorzoekt.`,
      ),
      h2("Verschillen"),
      ul([
        "Dashboard-agents: Start/Pause/Idle, type, Tasks completed.",
        "Agent 000: chatgesprekken, links naar FAQ/kennisbank, doorverwijzing naar ticket of afspraak.",
        "Agents = doorlopend werk in je account; Agent 000 = hulp tijdens een bezoek of vraag.",
      ]),
      h2("Wanneer wat"),
      ul([
        "Campagne of SEO-ritme → dashboard-agent.",
        "“Hoe werkt X bij TripleZero iT?” → Agent 000 of kennisbank.",
        "Storing of accountzaak → ticket, niet alleen een agent op Start.",
      ]),
      tip(
        "De chatbot-agent in het dashboard is weer iets anders dan Agent 000: die hoort bij je pakket-workspace.",
      ),
      outro("Chatbot-agent; live chat en tickets."),
    ].join("\n"),

  "tz-agents-with-scan": () =>
    [
      p(
        `De <strong>AI-scan</strong> geeft scores (AEO, GEO, SEO, Performance, AI Readiness). AI-agents helpen daarna met doorlopende opvolging. Eerst meten, dan agent inzetten.`,
      ),
      h2("Aanbevolen volgorde"),
      ol([
        "Start een AI-scan op je URL.",
        "Lees de scores en kies 1–2 prioriteiten.",
        "Kies het passende agenttype (vaak SEO, content of analytics).",
        "Start de agent en plan een review na de scan-opvolging.",
        "Herhaal de scan later om vooruitgang te zien — agents vervangen de scan niet.",
      ]),
      h2("Valkuilen"),
      ul([
        "Agent starten zonder scan of doel.",
        "Alleen scannen en nooit opvolgen.",
        "Scanresultaten verwarren met agent-status RUNNING.",
      ]),
      outro("SEO-agent en AEO/GEO; resultaten meten."),
    ].join("\n"),

  "tz-agents-seo-aeo-geo": () =>
    [
      p(
        `De SEO-agent ondersteunt doorlopend werk rond <strong>klassieke SEO</strong>, en helpt je trajecten voor <strong>AEO</strong> (antwoordengines) en <strong>GEO</strong> (lokale vindbaarheid) vol te houden.`,
      ),
      h2("Hoe het samenhangt"),
      ul([
        "Scan/traject bepaalt de backlog.",
        "SEO-agent helpt bij continue opvolging in je workspace.",
        "Content-agent kan pagina’s en FAQ’s leveren die AEO voeden.",
      ]),
      h2("Concrete inzet"),
      ol([
        "Zet AEO/GEO/SEO-prioriteiten uit je scan of plus-traject op een rij.",
        "Start de SEO-agent voor doorlopende ondersteuning.",
        "Koppel contenttaken voor entities, FAQ en lokale pagina’s.",
        "Meet maandelijks: rankings, lokale pack, zichtbaarheid in antwoordvormen.",
      ]),
      warn(
        "Agents zijn geen vervanging van technische fixes (snelheid, indexatie, structured data-implementatie).",
      ),
      outro("AI-scan + agents; content-agents voor FAQ’s."),
    ].join("\n"),

  "tz-agents-content-pages": () =>
    [
      p(
        `Content-agents helpen bij <strong>blogs</strong>, <strong>landingspagina’s</strong> en <strong>FAQ’s</strong> — formats die zowel bezoekers als AEO/SEO raken.`,
      ),
      h2("Inzet per format"),
      ul([
        "Blogs — expertise en thematische clusters.",
        "Landingspagina’s — aanbod en conversie, afgestemd op ads/SEO.",
        "FAQ’s — korte antwoorden die ook antwoordengines helpen.",
      ]),
      h2("Werkwijze"),
      ol([
        "Kies een cluster of dienst.",
        "Start de content-agent volgens je weekplan.",
        "Review teksten op merkstem en feiten.",
        "Publiceer en meet (verkeer, vragen in chat, conversies).",
      ]),
      tip(
        "Gebruik research-agent eerst als je onderwerpen nog niet scherp hebt.",
      ),
      outro("Research + content; e-commerce."),
    ].join("\n"),

  "tz-agents-social-ads-flow": () =>
    [
      p(
        `Social- en ads-agents werken het sterkst als <strong>één marketingworkflow</strong>: dezelfde boodschap, landingspagina en meetpunten.`,
      ),
      h2("Workflow"),
      ol([
        "Bepaal één campagneboodschap en URL.",
        "Zet content/landingspagina klaar.",
        "Start social-agent voor organische ondersteuning.",
        "Start ads-agent voor betaalde ondersteuning (binnen budget).",
        "Review samen: creatives, CTR-signalen, landingsconversie.",
      ]),
      h2("Afstemming"),
      ul([
        "Zelfde UTM-discipline.",
        "Niet tegelijk tegenstrijdige claims.",
        "Pauzeer beide bij site-onderhoud.",
      ]),
      outro("Ads-type; weekplanning."),
    ].join("\n"),

  "tz-agents-measure-results": () =>
    [
      p(
        `AI-agents meten zichzelf niet als omzet. Jij koppelt <strong>Tasks completed</strong> en status aan businessmetrics.`,
      ),
      h2("Meetlagen"),
      ul([
        "Agentlaag — status, last active, tasks completed.",
        "Kanaallaag — verkeer, leads, chatvragen, campagneresultaten.",
        "Businesslaag — offertes, orders, afspraken.",
      ]),
      h2("Eenvoudig ritme"),
      ol([
        "Kies 1–3 KPI’s per agent.",
        "Review wekelijks 15 minuten.",
        "Herhaal AI-scan of Search Console-check maandelijks.",
        "Stop of wissel type als er 4 weken geen beweging is én geen blokkade.",
      ]),
      tip(
        "Schrijf KPI’s op in het project in het CRM — dan blijft het team aligned.",
      ),
      outro("Analytics-agent; geschikte taken."),
    ].join("\n"),

  "tz-agents-suitable-tasks": () =>
    [
      p(
        `Niet alles hoort bij een AI-agent. Gebruik agents voor <strong>herhaalbaar, scoped werk</strong>; houd kritieke of eenmalige beslissingen bij mensen.`,
      ),
      h2("Wel geschikt"),
      ul([
        "Doorlopende SEO- of contentopvolging.",
        "Research voor onderwerpclusters.",
        "Social/ads-ondersteuning binnen een campagne.",
        "Eerste lijn FAQ-patronen (chatbot-agent) met escalatie.",
      ]),
      h2("Niet geschikt"),
      ul([
        "DNS-wijzigingen, SSL-noodreparaties, serverreboots.",
        "Juridische of financiële toezeggingen aan klanten.",
        "Crisiscommunicatie zonder menselijke review.",
        "Toegang tot wachtwoorden of betaalgegevens “even regelen”.",
      ]),
      outro("Veilig meerdere agents; support bij problemen."),
    ].join("\n"),

  "tz-agents-research-content": () =>
    [
      p(
        `Voor nieuwe diensten werkt het duo <strong>research-agent → content-agent</strong>: eerst valideren, dan publiceren.`,
      ),
      h2("Stappen"),
      ol([
        "Start research-agent met een duidelijke vraag (markt, concurrentie, zoektermen).",
        "Selecteer 3–5 onderwerpen die bij jouw aanbod passen.",
        "Start content-agent om outlines/pagina’s/FAQ’s uit te werken.",
        "Review feiten en beloftes.",
        "Publiceer en meet; voed SEO-agent voor vindbaarheid.",
      ]),
      tip(
        "In Business (1 slot) doe je dit sequentieel: eerst research-cyclus, dan wissel/focus naar content via support of upgrade.",
      ),
      outro("Eerste agent Business; content-pagina’s."),
    ].join("\n"),

  "tz-agents-chatbot-support": () =>
    [
      p(
        `De chatbot-agent vult <strong>live chat</strong> en <strong>tickets</strong> aan: standaardvragen afhandelen, complexe zaken escaleren.`,
      ),
      h2("Samenwerking"),
      ul([
        "Chatbot-agent — herhaalvragen en gating.",
        "Live chat / Agent 000 — snelle sitehulp en kennisbanklinks.",
        "Tickets — storingen, account, diepgang.",
      ]),
      h2("Inrichting"),
      ol([
        "Inventariseer top 10 vragen.",
        "Zorg dat kennisbank/FAQ up-to-date is.",
        "Start chatbot-agent volgens planning.",
        "Escalatieregel: bij account/betaling/storing → ticket.",
      ]),
      outro("Verschil Agent 000; supportkanalen."),
    ].join("\n"),

  "tz-agents-ecommerce": () =>
    [
      p(
        `Voor een <strong>webshop</strong> helpen AI-agents bij zichtbaarheid, content en campagnes — niet bij orderpicking of payment-gateways.`,
      ),
      h2("Nuttige typen"),
      ul([
        "SEO-agent — categorie- en productvindbaarheid.",
        "Content-agent — gidsen, FAQ, landingspagina’s.",
        "Ads/social — traffic naar product- of collectiepagina’s.",
        "Analytics — duiden van funnel-signalen.",
      ]),
      h2("Randvoorwaarden"),
      ul([
        "Snelle, veilige checkout (technisch op orde).",
        "Duidelijke productdata en voorraad.",
        "Tracking/privacy correct vóór zware ads.",
      ]),
      warn(
        "Pauzeer marketing-agents bij shopmigratie of betaalproblemen.",
      ),
      outro("Social+ads workflow; migratie veilig."),
    ].join("\n"),

  "tz-agents-week-planning": () =>
    [
      p(
        `Voor zzp’ers en MKB werkt een <strong>vaste weekplanning</strong> beter dan agents permanent op RUNNING zonder review.`,
      ),
      h2("Voorbeeldweek"),
      ul([
        "<strong>Ma</strong> — statuscheck, Idle/Pause opruimen, 1 doel kiezen.",
        "<strong>Di–Do</strong> — geplande agent(s) op RUNNING; korte tussencheck.",
        "<strong>Vr</strong> — Tasks completed + KPI’s; notities in CRM-project.",
        "<strong>Weekend/onderhoud</strong> — PAUSED of IDLE.",
      ]),
      h2("Tips"),
      ol([
        "Blokkeer 15–30 minuten in je agenda.",
        "Eén hoofddoel per week per agent.",
        "Combineer met maandelijkse AI-scan.",
        "Escalatiepad klaarzetten (tickettemplate).",
      ]),
      outro("Resultaten meten; veilig multi-agent."),
    ].join("\n"),

  "tz-agents-stuck-error": () =>
    [
      p(
        `Blijft een AI-agent op <strong>ERROR</strong>, dan is opnieuw starten alleen zinvol na een korte diagnose.`,
      ),
      h2("Directe stappen"),
      ol([
        "Noteer agentnaam, type, tijdstip en laatste actie.",
        "Zet de agent op Idle.",
        "Controleer of er een storing/onderhoud of siteprobleem speelt.",
        "Probeer één keer Start.",
        "Blijft ERROR → ticket met screenshot van de kaart.",
      ]),
      h2("Niet doen"),
      ul([
        "Spamklikken op Start.",
        "Tegelijk andere kritieke DNS/hostingwijzigingen doorvoeren.",
        "Aannemen dat ERROR “normaal idle” is.",
      ]),
      outro("ERROR/COMPLETED uitleg; supportgegevens."),
    ].join("\n"),

  "tz-agents-wont-start": () =>
    [
      p(
        `Blijft een agent op <strong>IDLE</strong> terwijl je Start verwacht, dan is er vaak een rechten-, provisioning- of UI-issue.`,
      ),
      h2("Checklist"),
      ol([
        "Ververs de pagina en controleer of je knop Start beschikbaar is.",
        "Controleer of je pakket überhaupt agents bevat.",
        "Controleer of een andere gebruiker/pauzebeleid de agent Idle houdt.",
        "Kijk of de agent niet meteen naar ERROR springt.",
        "Open een ticket als Start geen statuswijziging geeft.",
      ]),
      tip(
        "Test in een privéventer: soms cache of een oude sessie.",
      ),
      outro("Geen agents zichtbaar; teamrechten."),
    ].join("\n"),

  "tz-agents-no-task-growth": () =>
    [
      p(
        `Status <strong>RUNNING</strong> zonder stijgende <strong>Tasks completed</strong> kan normaal kort zijn — of wijzen op ontbrekende taken / een vastloper.`,
      ),
      h2("Onderzoek"),
      ol([
        "Wacht een redelijke periode (niet alleen seconden).",
        "Vergelijk last active.",
        "Controleer of er werk/projectscope is.",
        "Pauzeer en start één keer opnieuw.",
        "Bij aanhoudende stilstand: ticket met vóór/na-screenshot van de teller.",
      ]),
      h2("Mogelijke oorzaken"),
      ul([
        "Nog geen taken gekoppeld.",
        "Agent wacht op input of externe blokkade.",
        "Tijdelijke platformvertraging.",
      ]),
      outro("Tasks completed; ERROR-status."),
    ].join("\n"),

  "tz-agents-quota-mismatch": () =>
    [
      p(
        `Zie je <strong>meer agents dan je pakket</strong> of juist <strong>te weinig</strong>, dan klopt provisioning of pakketstatus niet met wat je verwacht.`,
      ),
      h2("Te weinig"),
      ul([
        "Business → verwacht 1; Extra Growth → 2; Enterprise → meer.",
        "Net geüpgraded? Wacht op provisioning of ticket met order.",
        "Verkeerd account/login?",
      ]),
      h2("Te veel"),
      ul([
        "Mogelijk restanten van een eerder pakket of test — meld aan support.",
        "Start niet extra agents “omdat ze er staan” zonder plan.",
        "Vraag welke slots bij je huidige contract horen.",
      ]),
      outro("Agents na bestelling; upgrade Growth."),
    ].join("\n"),

  "tz-agents-migration-safe": () =>
    [
      p(
        `Tijdens <strong>migratie of onderhoud</strong> (DNS, hosting, shop, WordPress) voorkom je conflicten door agents tijdelijk stil te zetten.`,
      ),
      h2("Checklist migratie"),
      ol([
        "Zet alle relevante agents op PAUSED of IDLE vóór de cut-over.",
        "Voer migratie/DNS/SSL uit en test de site.",
        "Herstart alleen agents die bij de nieuwe omgeving horen.",
        "Controleer landings-URL’s voor ads/social.",
        "Monitor 24–48 uur op ERROR of rare taskgroei.",
      ]),
      warn(
        "Ads- of social-agents op een oude URL tijdens migratie verspillen budget en verwarren metingen.",
      ),
      outro("RUNNING pauzeren; e-commerce."),
    ].join("\n"),

  "tz-agents-support-info": () =>
    [
      p(
        `Bij een AI-agentprobleem helpt een compleet ticket TripleZero iT support sneller. Stuur feiten, geen alleen “het werkt niet”.`,
      ),
      h2("Stuur altijd mee"),
      ul([
        "Pakketnaam (Business / Extra Growth / Enterprise) en order- of klantreferentie.",
        "Agentnaam, type (SEO_AGENT, …) en status.",
        "Screenshot van de agentkaart (status + Tasks completed).",
        "Tijdstip (tijdzone) van het probleem.",
        "Wat je al probeerde (Idle/Start/Pause).",
        "Of het speelde tijdens migratie, release of campagne.",
      ]),
      h2("Optioneel nuttig"),
      ul([
        "Projectnaam in CRM.",
        "AI-scan-ID of datum van laatste scan.",
        "Browser/apparaat als de knoppen niet reageren.",
      ]),
      tip(
        "Eén ticket per incident; voeg updates als reply toe in plaats van nieuwe tickets.",
      ),
      outro("ERROR blijft staan; teamrechten."),
    ].join("\n"),
};

import { loadFaqPack } from "@/content/faq-i18n/load";
import { EXTRA_HOSTING_FAQ_CATEGORY_IDS } from "@/lib/brand/hosting-only-content";
import { replaceTripleZeroDeep, isExtraHostingSurface } from "@/lib/brand/public-name";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqCategory = {
  id: string;
  title: string;
  items: FaqItem[];
};

export type FaqContent = {
  title: string;
  subtitle: string;
  categories: FaqCategory[];
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
};

function q(id: string, question: string, answer: string): FaqItem {
  return { id, question, answer };
}

const nl: FaqContent = {
  title: "Veelgestelde vragen",
  subtitle: "Vragen en antwoorden — van AI, AEO, GEO en SEO tot design, domeinen, hosting, account, shop, marketing en support.",
  ctaTitle: "Nog hulp nodig?",
  ctaText: "Staat jullie vraag er niet tussen? Neem contact op — we reageren zo snel mogelijk.",
  ctaButton: "Neem contact op",
  categories: [
    {
      id: "algemeen",
      title: "Algemeen",
      items: [
        q("alg-1", "Wat doet TripleZero iT precies?", "TripleZero iT combineert webdesign, WordPress beheer, digital marketing, zoekzichtbaarheid (AEO, GEO/lokaal en SEO), design en hosting. We helpen merken sneller gevonden te worden, betere websites te bouwen en meetbaar te groeien. Meer lezen: [Over ons](/over-ons) · [Diensten](/diensten)."),
        q("alg-2", "Hoe begin ik met TripleZero iT?", "Neem contact op of plan een afspraak. We doen een korte intake, kijken naar doelen en stack, en stellen daarna een concreet voorstel op met planning en KPI’s. Meer lezen: [Afspraak plannen](/afspraak) · [Contact](/contact)."),
        q("alg-3", "Voor welke bedrijven werken jullie?", "We werken voor MKB, scale-ups, e-commerce, agencies en internationale merken. Dat kan naast een bestaand team, of als full-service partner."),
        q("alg-4", "Werken jullie alleen in Nederland?", "Nee. We bedienen klanten in Azië, Europa, de VAE en de USA, met Nederlandstalige én Engelstalige trajecten."),
        q("alg-5", "Hoe verloopt een typisch traject?", "Een traject loopt meestal zo: intake → audit of scan → plan → uitvoering in sprints → meting → optimalisatie. Jullie krijgen duidelijke milestones en rapportage, zodat altijd helder is waar we staan."),
        q("alg-6", "Kan ik meerdere diensten combineren?", "Ja. Veel klanten combineren bijvoorbeeld webdesign + SEO + ads, of WordPress-onderhoud + hosting + security. We stemmen de mix af op jullie doelen en budget."),
        q("alg-7", "Hoe snel kunnen jullie starten?", "Dat hangt af van onze capaciteit, maar na akkoord starten we vaak binnen enkele werkdagen. Spoedtrajecten — zoals bugs, malware of downtime — pakken we met voorrang op, zodat we daar zo snel mogelijk mee aan de slag kunnen."),
        q("alg-8", "Werken jullie remote of on-site?", "We werken primair remote, met duidelijke communicatie via mail, chat en calls. On-site is op verzoek bespreekbaar als het project dat nodig maakt."),
        q("alg-9", "Hoe communiceert het team de voortgang?", "We houden jullie op de hoogte via vaste updates, tickets of een dashboard waar dat relevant is, plus sprint- of maandrapporten met acties en resultaten."),
        q("alg-10", "Wat hebben jullie nodig om te starten?", "Om te starten hebben we toegang tot website en hosting (als dat nodig is), jullie doelen, merkrichtlijnen, analytics-accounts en eventuele bestaande tools. Ontbreekt er iets, dan helpen we dat eerst op orde te krijgen."),
        q("alg-11", "Zijn jullie diensten geschikt voor startups?", "Ja. We schalen van lean landingspagina’s en AI-scans tot volledige groei-setups, zodat de aanpak meegroeit wanneer jullie groeien."),
        q("alg-12", "Hoe zit het met eigendom van werk en accounts?", "Jullie domein, content, code-repositories en ad-accounts blijven van jullie. Bij oplevering leveren we de bestanden en documentatie over, zodat alles netjes in eigen beheer blijft."),
        q("alg-13", "Kunnen jullie bestaande leveranciers overnemen of samenwerken?", "Ja. We werken soepel naast developers, marketeers of agencies, of we nemen onderhoud en optimalisatie over zonder het bestaande werk onnodig overhoop te halen."),
        q("alg-14", "Wat is Agent 000 (de chatassistent)?", "Agent 000 is onze digitale assistent op de site en in supportflows. Hij beantwoordt veelgestelde vragen, wijst naar kennisbankartikelen en kan je doorverwijzen naar live chat, een ticket of een afspraak wanneer menselijke hulp beter past. Meer lezen: [Digitale assistent](/kennisbank/support/digitale-assistent-triplezero-it-hosting) · [Chat, ticket of belafspraak](/kennisbank/support/chat-versus-ticket-versus-belafspraak-wat-kies-ik-wanneer)."),
        q("alg-15", "Hoe plan ik een afspraak of belafspraak?", "Via de pagina Afspraak kies je een moment dat past. Voor snelle vragen kun je ook live chat of een ticket gebruiken; een belafspraak is handig bij complexere trajecten of intakes. Meer lezen: [Afspraak](/afspraak) · [Belafspraak uitgelegd](/kennisbank/support/hoe-werkt-de-belafspraak-bij-triplezero-it-hosting)."),
        q("alg-16", "Waar zie ik de status van jullie diensten?", "Op de statuspage tonen we incidenten en onderhoud rond hosting en gerelateerde diensten, zodat je snel ziet of er iets speelt. Meer lezen: [Statuspage](/statuspage)."),
        q("alg-17", "Hebben jullie een kennisbank?", "Ja. In de kennisbank staan handleidingen over domeinen, DNS, e-mail, hosting, WordPress, AI-scan, security en meer — met stapsgewijze uitleg. Meer lezen: [Kennisbank](/kennisbank)."),
        q("alg-18", "Hoe gaan jullie om met privacy en cookies?", "We werken AVG-bewust: privacyteksten, toestemming bij formulieren en cookiebanners/consent mode waar tracking nodig is. Voor WordPress helpen we met een correcte cookie-setup. Meer lezen: [Cookiebanner in WordPress](/kennisbank/wordpress/hoe-voeg-ik-een-gdpr-avg-cookiebanner-toe-in-wordpress) · [Consent mode](/kennisbank/analytics-conversie-toegankelijkheid/consent-mode-en-cookiebanners-correct-koppelen) · [Privacy bij formulieren](/kennisbank/webdesign-en-maatwerk/privacytekst-en-toestemming-bij-leadformulieren)."),
        q("alg-19", "Waar vind ik jullie nieuws en updates?", "Op de nieuwspagina publiceren we updates over producten, security en tips. Voor technische storingen kijk je op de statuspage. Meer lezen: [Nieuws](/nieuws) · [Statuspage](/statuspage)."),
        q("alg-20", "Wat kost het om met jullie te werken?", "Dat hangt af van de mix: hosting en shopproducten hebben vaste prijzen; design, SEO, ads en retainers volgen na intake. In de shop zie je pakketten; voor maatwerk krijg je een voorstel. Meer lezen: [Shop](/shop) · [Contact](/contact)."),
        q("alg-21", "Kunnen jullie ook alleen consulting of audit doen?", "Ja. Audits, AI-scans, technische reviews en sparringsessies kunnen los van een full-service traject. Daarna kun je zelf uitvoeren of ons laten doorpakken. Meer lezen: [AI-scan](/ai-scan) · [Diensten](/diensten)."),
      ],
    },
    {
      id: "ai",
      title: "AI",
      items: [
        q("ai-1", "Wat is een AI-scan bij TripleZero iT?", "Een AI-readiness scan beoordeelt hoe goed jullie site vindbaar is voor klassieke zoekmachines, AI-antwoorden én lokale of geografische zoekresultaten (AEO, GEO, SEO en de technische basis). Meer lezen: [Wat is de AI-scan?](/kennisbank/ai-scan/wat-is-de-ai-scan-van-triplezero-it-hosting) · [AI-scan starten](/ai-scan)."),
        q("ai-2", "Wat meet de AI-scan precies?", "De scan meet onder meer AEO-signalen, GEO/lokale vindbaarheid, SEO-fundamentals, contentstructuur, performance-indicaties en AI-readiness. Jullie krijgen scores én concrete verbeterpunten. Meer lezen: [Scores uitleggen](/kennisbank/ai-scan/hoe-lees-ik-de-ai-scan-scores-aeo-geo-seo-performance-en-ai-readiness)."),
        q("ai-3", "Hoe vaak moet ik een AI-scan doen?", "Minimaal bij grote sitewijzigingen of campagnes. Voor actieve merken adviseren we periodieke scans, bijvoorbeeld elk kwartaal, zodat jullie zichtbaar blijven in zoek- én AI-resultaten. Meer lezen: [AI-scan starten](/kennisbank/ai-scan/hoe-start-ik-een-ai-scan-op-mijn-website)."),
        q("ai-4", "Helpt AI alleen bij content?", "Nee. AI raakt ook technische vindbaarheid, structured data, interne linking, FAQ-blokken en de manier waarop merkinformatie wordt samengevat in AI-antwoorden."),
        q("ai-5", "Kunnen jullie AI in onze workflow integreren?", "Ja. We kunnen AI inzetten voor content-assistentie, automatisering, chatbot- of ticketflows, data-koppelingen en maatwerk-API’s rond AI-tools."),
        q("ai-6", "Vervangt AI jullie strategisch werk?", "Nee. AI versnelt analyse en productie, maar strategie, merktoon en conversiebeslissingen blijven menselijk en meetbaar."),
        q("ai-7", "Is AI-content veilig voor SEO?", "Alleen met menselijke review, unieke inzichten en E-E-A-T. We vermijden dunne, generieke teksten die rankings schaden."),
        q("ai-8", "Wat is AI-readiness voor mijn merk?", "Dat is de mate waarin jullie site, content en data zo zijn ingericht dat AI-systemen jullie correct kunnen citeren, aanbevelen en uitleggen. Meer lezen: [AI-readiness in de scan](/kennisbank/ai-scan/hoe-lees-ik-de-ai-scan-scores-aeo-geo-seo-performance-en-ai-readiness)."),
        q("ai-9", "Kunnen jullie AI-agents in het dashboard inzetten?", "Ja. In het klantportaal zien jullie AI-agents voor onder meer SEO, content, social en ads — inclusief status en taken. Meer lezen: [Wat zijn AI-agents?](/kennisbank/ai-agents/wat-zijn-ai-agents-bij-triplezero-it-hosting) · [Agents in je account](/kennisbank/ai-agents/hoe-open-ik-het-ai-agents-overzicht-in-mijn-account)."),
        q("ai-10", "Werken jullie met ChatGPT, Claude of andere tools?", "We kiezen tools per use-case. Belangrijk is governance: bronnen, factcheck, merkrichtlijnen en privacy, zodat AI-inzet betrouwbaar blijft."),
        q("ai-11", "Helpt AI bij supporttickets?", "Ja, voor triaging en snellere antwoorden. Complexe of gevoelige cases escaleren we altijd naar een menselijke medewerker."),
        q("ai-12", "Wat kost een AI-traject?", "Dat loopt van een gratis of instap AI-scan tot maandelijkse AI- en marketing-retainers. Na de intake krijgen jullie een helder voorstel."),
        q("ai-13", "Hoe meet ik ROI van AI-initiatieven?", "Via KPI’s zoals traffic, leads, time-saved, content-output, ticket-resolutie en conversie. Die meten we vooraf in het plan, zodat resultaat zichtbaar blijft."),
        q("ai-14", "Hoe start ik een AI-scan op mijn website?", "Ga naar de AI-scan, voer je URL in en start de analyse. Je krijgt scores voor AEO, GEO, SEO, performance en AI-readiness plus verbeterpunten. Meer lezen: [AI-scan starten](/kennisbank/ai-scan/hoe-start-ik-een-ai-scan-op-mijn-website) · [AI-scan pagina](/ai-scan)."),
        q("ai-15", "Hoe lees ik de AI-scan scores?", "Elke score toont hoe sterk je staat op dat vlak; lage scores komen met concrete tips. Gebruik de scan als prioriteitenlijst, niet als eenmalige “report card”. Meer lezen: [Scores uitleggen](/kennisbank/ai-scan/hoe-lees-ik-de-ai-scan-scores-aeo-geo-seo-performance-en-ai-readiness) · [Vervolgstappen](/kennisbank/ai-scan/welke-vervolgstappen-zet-ik-na-mijn-ai-scan)."),
        q("ai-16", "Wat is het verschil tussen een AI-scan en een volledig AEO/GEO/SEO-traject?", "De scan is een snelle diagnose. Een traject voert verbeteringen door: content, structured data, technische SEO, lokale signalen en meting over tijd. Meer lezen: [Scan versus traject](/kennisbank/ai-scan/ai-scan-versus-een-volledig-aeo-geo-seo-traject-wat-is-het-verschil) · [SEO starten](/kennisbank/aeo-geo-seo/hoe-bestel-of-start-ik-seo-optimalisatie-via-triplezero-it-hosting)."),
        q("ai-17", "Waar vind ik eerdere AI-scans in mijn account?", "Ingelogde klanten zien eerdere scans en analyses in het dashboard (SEO-analyse), zodat je voortgang kunt vergelijken. Meer lezen: [AI-scan](/kennisbank/ai-scan/wat-is-de-ai-scan-van-triplezero-it-hosting) · [Account / dashboard](/dashboard)."),
        q("ai-18", "Wat doe ik na een lage AEO- of GEO-score?", "Prioriteer FAQ’s, entities, structured data (AEO) en Google Business Profile / NAP / lokale landingspagina’s (GEO). We helpen die roadmap omzetten in uitvoering. Meer lezen: [Scores](/kennisbank/ai-scan/hoe-lees-ik-de-ai-scan-scores-aeo-geo-seo-performance-en-ai-readiness) · [Lokale vindbaarheid](/kennisbank/aeo-geo-seo/hoe-verbeter-ik-mijn-lokale-vindbaarheid-google-business-profile-en-nap)."),
        q("ai-19", "Hoe werken AI-agents in het klantportaal?", "AI-agents ondersteunen taken rond SEO, content, social of ads. Je opent het overzicht in je account, ziet status en kunt agents starten of pauzeren volgens je pakket. Meer lezen: [Wat zijn AI-agents?](/kennisbank/ai-agents/wat-zijn-ai-agents-bij-triplezero-it-hosting) · [Agents openen](/kennisbank/ai-agents/hoe-open-ik-het-ai-agents-overzicht-in-mijn-account)."),
        q("ai-20", "Is de AI-scan gratis?", "Er is een toegankelijke instap via de AI-scan pagina; diepere analyses en trajecten vallen onder diensten of retainers. Na de scan zie je meteen of een vervolg zinvol is. Meer lezen: [AI-scan](/ai-scan) · [Wat is de AI-scan?](/kennisbank/ai-scan/wat-is-de-ai-scan-van-triplezero-it-hosting)."),
        q("ai-21", "Helpt Agent 000 ook met AI- en SEO-vragen?", "Ja. Agent 000 gebruikt FAQ en kennisbank om AEO/GEO/SEO- en AI-scanvragen te beantwoorden en linkt door naar de juiste artikelen of een menselijke opvolging. Meer lezen: [Digitale assistent](/kennisbank/support/digitale-assistent-triplezero-it-hosting) · [FAQ](/faq)."),
      ],
    },
    {
      id: "aeo-geo-seo",
      title: "AEO, GEO en SEO",
      items: [
        q("seo-1", "Wat is het verschil tussen AEO, GEO en SEO?", "AEO (Answer Engine Optimization) richt zich op AI-antwoorden. GEO (Geographic Search Engine Optimization) versterkt lokale en regionale vindbaarheid in Maps, local packs en locatiegericht zoeken. SEO optimaliseert voor klassieke zoekmachines. Meer lezen: [Hoe AEO, GEO en SEO samenhangen](/kennisbank/aeo-geo-seo/hoe-hangen-aeo-geo-en-seo-samen) · [Wat is AEO?](/kennisbank/aeo-geo-seo/wat-is-aeo-answer-engine-optimization)."),
        q("seo-2", "Waarom is AEO/GEO nu belangrijk?", "Steeds meer zoekers krijgen antwoorden via AI én zoeken lokaal (“bij mij in de buurt”). Zonder AEO missen jullie AI-citaties; zonder GEO missen jullie lokale leads — ook als klassieke SEO goed is. Meer lezen: [Wat is GEO?](/kennisbank/aeo-geo-seo/wat-is-geo-geographic-seo-en-voor-wie-is-het-relevant)."),
        q("seo-3", "Hoe starten jullie een SEO-traject?", "We starten met een technische audit, keyword- en intent-onderzoek, een contentgap-analyse en een prioriteitenroadmap die gekoppeld is aan jullie business-KPI’s. Meer lezen: [SEO starten](/kennisbank/aeo-geo-seo/hoe-bestel-of-start-ik-seo-optimalisatie-via-triplezero-it-hosting)."),
        q("seo-4", "Hoe lang duurt het voor SEO-resultaten zichtbaar zijn?", "Technische wins kunnen snel zichtbaar zijn. Organische groei bouwt meestal over weken tot maanden, afhankelijk van concurrentie en hoe consequent we uitvoeren."),
        q("seo-5", "Doen jullie ook lokale SEO?", "Ja. We werken aan Google Business Profile, lokale landingspagina’s, NAP-consistentie, reviews en lokale contentclusters, zodat jullie beter gevonden worden in de regio. Meer lezen: [Lokale vindbaarheid verbeteren](/kennisbank/aeo-geo-seo/hoe-verbeter-ik-mijn-lokale-vindbaarheid-google-business-profile-en-nap)."),
        q("seo-6", "Wat is technical SEO bij jullie?", "Technical SEO dekt crawlability, indexatie, Core Web Vitals, structured data, sitemap en robots, canonicals, interne linking en foutopsporing — alles wat zoekmachines nodig hebben om de site goed te begrijpen."),
        q("seo-7", "Helpen jullie met content voor SEO?", "Ja. We maken briefings, outlines, blogs, landingspagina’s en FAQ’s die zoekintentie matchen én AI-vriendelijk gestructureerd zijn."),
        q("seo-8", "Wat is E-E-A-T en waarom telt het?", "E-E-A-T staat voor Experience, Expertise, Authoritativeness en Trust. Sterke E-E-A-T helpt rankings én de geloofwaardigheid van jullie merk in AI-samenvattingen."),
        q("seo-9", "Doen jullie linkbuilding?", "Ja, ethisch en relevant: digitale PR, partnerships en content assets. Spammy linkschema’s doen we niet."),
        q("seo-10", "Kunnen jullie bestaande SEO-schade herstellen?", "Ja. We herstellen schade na updates, toxic links, indexatieproblemen of content-cannibalization, en zetten daarna een schone groeilijn uit."),
        q("seo-11", "Hoe rapporteren jullie SEO-voortgang?", "Maandelijks of per sprint rapporteren we rankings, traffic, conversies, technische issues en next actions, zodat duidelijk is wat we gedaan hebben en wat volgt."),
        q("seo-12", "Werkt SEO voor e-commerce?", "Zeker. We optimaliseren product- en category-SEO, faceted navigation, reviews, structured data en content hubs rond koopintentie."),
        q("seo-13", "Is SEO een eenmalig project of doorlopend?", "De beste resultaten komen uit doorlopende optimalisatie. Eenmalige audits helpen, maar concurrentie staat niet stil — daarom blijven we meten en bijsturen."),
        q("seo-14", "Helpen jullie met internationale SEO?", "Ja. We regelen hreflang, marktonderzoek per land of taal, contentlokalisatie en technische multi-locale setups."),
        q("seo-15", "Wat is AEO precies?", "AEO (Answer Engine Optimization) maakt content zo dat AI-antwoorden en antwoordengines je merk correct kunnen citeren: duidelijke FAQ’s, entities en structured data. Meer lezen: [Wat is AEO?](/kennisbank/aeo-geo-seo/wat-is-aeo-answer-engine-optimization) · [AEO, GEO en SEO](/kennisbank/aeo-geo-seo/hoe-hangen-aeo-geo-en-seo-samen)."),
        q("seo-16", "Wat is GEO (geographic SEO)?", "GEO versterkt lokale en regionale vindbaarheid — Maps, local packs en locatiegericht zoeken — via GBP, NAP-consistentie en lokale content. Meer lezen: [Wat is GEO?](/kennisbank/aeo-geo-seo/wat-is-geo-geographic-seo-en-voor-wie-is-het-relevant) · [Lokale vindbaarheid](/kennisbank/aeo-geo-seo/hoe-verbeter-ik-mijn-lokale-vindbaarheid-google-business-profile-en-nap)."),
        q("seo-17", "Hoe bestel of start ik SEO-optimalisatie?", "Start met een AI-scan of audit, daarna een voorstel met prioriteiten. Je kunt SEO ook via shop/diensten of retainer combineren met content en tech. Meer lezen: [SEO starten](/kennisbank/aeo-geo-seo/hoe-bestel-of-start-ik-seo-optimalisatie-via-triplezero-it-hosting) · [AI-scan](/ai-scan)."),
        q("seo-18", "Helpen jullie met structured data en FAQ-schema?", "Ja. We zetten relevante schema’s (FAQ, Organization, LocalBusiness, producten) en structureren content zodat zoekmachines én AI je beter begrijpen. Meer lezen: [AEO uitleg](/kennisbank/aeo-geo-seo/wat-is-aeo-answer-engine-optimization) · [AI-scan scores](/kennisbank/ai-scan/hoe-lees-ik-de-ai-scan-scores-aeo-geo-seo-performance-en-ai-readiness)."),
        q("seo-19", "Wat doen jullie aan Core Web Vitals?", "We meten LCP, INP en CLS, lossen zware assets, hosting/caching en theme-problemen op, en koppelen dat aan CDN waar zinvol. Meer lezen: [CDN](/kennisbank/cdn-performance-cloudflare/wat-een-cdn-doet-voor-je-website) · [Hosting kiezen](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket)."),
        q("seo-20", "Kunnen jullie SEO combineren met hosting en WordPress-care?", "Ja. Stabiele hosting, updates en performance vormen de basis; SEO bouwt daarop. Veel klanten combineren WP-care + hosting + doorlopende SEO. Meer lezen: [Hosting](/diensten/categorie/hosting) · [SEO starten](/kennisbank/aeo-geo-seo/hoe-bestel-of-start-ik-seo-optimalisatie-via-triplezero-it-hosting)."),
      ],
    },
    {
      id: "adverteren",
      title: "Adverteren",
      items: [
        q("ads-1", "Welke advertentiekanalen ondersteunen jullie?", "We ondersteunen Google Ads, Meta (Facebook/Instagram), LinkedIn, en waar relevant YouTube of retargeting — afgestemd op funnel en budget."),
        q("ads-2", "Hoe bepalen jullie het juiste advertentiebudget?", "We bepalen het budget op basis van doelen (leads of sales), CAC-doel, marktprijzen en een testfase. We starten lean en schalen wat werkt."),
        q("ads-3", "Wat is jullie aanpak voor Google Ads?", "We zetten een heldere accountstructuur neer, mappen zoekintentie, voegen negatieve keywords toe, checken landingpage-fit, richten conversietracking in en optimaliseren wekelijks."),
        q("ads-4", "Kunnen jullie Meta Ads voor e-commerce draaien?", "Ja. We draaien catalogus- en retargetingcampagnes, testen creatives en audiences, en sturen bij om ROAS te verbeteren."),
        q("ads-5", "Hoe meten jullie advertentie-succes?", "We meten conversies, CPA/CAC, ROAS, leadkwaliteit en pipeline — niet alleen klikken. Zo sturen we op resultaat in plaats van op volume."),
        q("ads-6", "Wat als tracking niet klopt?", "Dan fixen we tagging (GTM, GA4 en pixels), consent mode waar nodig, en server-side opties voor betrouwbaardere data."),
        q("ads-7", "Doen jullie ook B2B LinkedIn Ads?", "Ja. We werken met scherpe targeting, leadgen-forms of landingspagina’s en content die decision-makers aanspreekt."),
        q("ads-8", "Hoe snel zie ik resultaat uit ads?", "Verkeer kan direct binnenkomen. Stabiele CPA of ROAS vraagt meestal 2 tot 6 weken leertijd en creatieve iteratie."),
        q("ads-9", "Maken jullie ook ads-creatives?", "Ja. We maken copy, visuals en testvarianten. Design en media-creatie kunnen we meenemen, zodat campagnes niet op creatives hoeven te wachten."),
        q("ads-10", "Kunnen ads en SEO elkaar versterken?", "Absoluut. Zoekdata uit ads voedt SEO; sterke organische pagina’s verlagen CPA en verhogen de Quality Score."),
        q("ads-11", "Beheren jullie bestaande ad-accounts?", "Ja. We auditen, herstructureren en optimaliseren zonder onnodig opnieuw te beginnen."),
        q("ads-12", "Hoe voorkomen jullie verspild ad-budget?", "We voorkomen verspilling met negatieve keywords, audience exclusions, budget caps, geofencing, frequency control en het snel stopzetten van underperformers."),
        q("ads-13", "Is remarketing nog relevant?", "Ja, mits privacy-compliant en met sterke creatives en offers. Het blijft vaak de efficiëntste laag in de funnel."),
        q("ads-14", "Helpen jullie met consent mode en cookiebanners voor ads?", "Ja. Zonder correcte consent en tagging is advertentiemeting onbetrouwbaar. We koppelen banners, GTM/GA4 en pixels netjes. Meer lezen: [Consent mode](/kennisbank/analytics-conversie-toegankelijkheid/consent-mode-en-cookiebanners-correct-koppelen) · [Cookiebanner WordPress](/kennisbank/wordpress/hoe-voeg-ik-een-gdpr-avg-cookiebanner-toe-in-wordpress)."),
        q("ads-15", "Kunnen jullie landingspagina’s voor campagnes bouwen?", "Ja — snelle landingspagina’s of WordPress-pagina’s afgestemd op zoekintentie, met tracking en CRO-basics. Meer lezen: [Diensten](/diensten) · [Shop](/shop)."),
        q("ads-16", "Hoe voorkomen jullie verspild adbudget?", "Strakke accountstructuur, negatieve keywords, audience-uitsluitingen, landingpage-fit en wekelijkse optimalisatie op CPA/ROAS — niet op klikken alleen."),
        q("ads-17", "Werken ads goed samen met AEO/SEO?", "Ja. Ads leveren snelle data en traffic; SEO/AEO bouwen duurzame zichtbaarheid. Insights uit keywords en creatives voeden content en landingspagina’s. Meer lezen: [AEO, GEO en SEO](/kennisbank/aeo-geo-seo/hoe-hangen-aeo-geo-en-seo-samen)."),
      ],
    },
    {
      id: "design",
      title: "Design",
      items: [
        q("des-1", "Welke design-diensten bieden jullie?", "We bieden logo’s, merkidentiteit, visitekaartjes, briefpapier, flyers, posters, stickers, magazines of brochures en digitale visuals."),
        q("des-2", "In welke tools werken jullie?", "We werken in Adobe Photoshop, Illustrator en InDesign, zodat bestanden drukkerij-klaar en professioneel uitwisselbaar zijn."),
        q("des-3", "Leveren jullie drukklare bestanden?", "Ja. We leveren CMYK, bleed, snijmerken en de juiste PDF/X-export waar nodig, plus screen-varianten voor digitaal gebruik."),
        q("des-4", "Hoe verloopt een logotraject?", "Een logotraject loopt van briefing naar concepten, daarna feedbackrondes, en eindigt met finale vectorbestanden (SVG/PDF/AI) en basisrichtlijnen."),
        q("des-5", "Kunnen jullie ons bestaande merk updaten?", "Ja. We refreshen logo, kleur, typografie en toepassingen zonder de herkenning te breken."),
        q("des-6", "Maken jullie ook social templates?", "Ja. We maken consistente templates voor posts, stories en ads, zodat jullie team snel en herkenbaar kan publiceren."),
        q("des-7", "Wat is het verschil tussen digitaal en print design?", "Print vraagt kleurruimte, resolutie en snijmarges; digitaal vraagt scherpte op schermen en snelle laadtijden. Wij leveren beide correct, afgestemd op het kanaal."),
        q("des-8", "Kunnen jullie magazines of brochures opmaken?", "Ja. We maken meerpagina-layouts in InDesign met grid, stijlen en prepress-checks, klaar voor druk of digitale verspreiding."),
        q("des-9", "Helpen jullie met drukwerk?", "Ja. We ontwerpen én kunnen drukken in kleine of grote oplages — van visitekaartjes en stickers tot flyers, posters en brochures — met proofs en afstemming tot aan levering."),
        q("des-10", "Hoeveel feedbackrondes zitten erin?", "Meestal zitten er 2 tot 3 gestructureerde rondes in. Extra rondes zijn mogelijk in overleg."),
        q("des-11", "Krijgen we bronbestanden?", "Ja, binnen de afgesproken oplevering. Dat kan AI, PSD of INDD zijn, of een export pack — afhankelijk van wat we hebben afgesproken."),
        q("des-12", "Kunnen design en webdesign samen lopen?", "Ja. Merkdesign en UI-systemen stemmen we af, zodat print en website één geheel vormen."),
        q("des-13", "Waar vind ik meer over Design?", "Meer informatie staat op /design (alle design-diensten) en /grafisch-design voor Grafisch Design."),
        q("des-14", "Leveren jullie ook design systemen en componentbibliotheken?", "Ja, voor merken die consistent willen schalen: tokens, componenten en documentatie zodat marketing en product dezelfde taal spreken."),
        q("des-15", "Kunnen jullie bestaande merkstijl digitaliseren?", "Ja. We vertalen print of incomplete brand guidelines naar webklare kleuren, typografie, UI-kit en templates."),
        q("des-16", "Doen jullie UX-research of alleen visueel design?", "Beide. Waar nodig starten we met interviews, funnelanalyse of heatmaps; daarna UI. Zo ontwerpen we op gedrag, niet alleen op smaak."),
        q("des-17", "Kunnen jullie social templates en ad creatives ontwerpen?", "Ja — carrousels, thumbnails, stories en adsets die aansluiten op jullie merk en campagnedoelen. Meer lezen: [Diensten](/diensten)."),
      ],
    },
    {
      id: "marketing",
      title: "Marketing",
      items: [
        q("mkt-1", "Welke marketingdiensten bieden jullie?", "We bieden AEO/GEO/SEO, content, social, ads, e-commerce groei, product listing, community management en data entry."),
        q("mkt-2", "Hoe maken jullie een marketingstrategie?", "We bouwen een strategie rond doelen, audience, positionering, kanalenmix, contentpijplijn en KPI’s — pragmatisch en uitvoerbaar, niet alleen op papier."),
        q("mkt-3", "Wat is full-funnel marketing bij jullie?", "Full-funnel loopt van awareness (content en ads) via overweging (cases en SEO) tot conversie (landingspagina’s en CRM) en daarna retentie, zodat elk stadium een duidelijke rol heeft."),
        q("mkt-4", "Helpen jullie met positionering?", "Ja. Heldere positionering voorkomt versnipperde campagnes en zwakke conversie."),
        q("mkt-5", "Kunnen jullie content writing leveren?", "Ja. We schrijven blogs, website copy, newsletters, landingspagina’s en sales copy — SEO- én conversiegericht."),
        q("mkt-6", "Doen jullie e-commerce marketing?", "Ja. We werken aan productfeeds, listing quality, CRO, ads en SEO voor categorieën en producten."),
        q("mkt-7", "Wat is CRO?", "CRO is Conversion Rate Optimization: het verbeteren van pagina’s, funnels en UX zodat meer bezoekers converteren."),
        q("mkt-8", "Hoe rapporteren jullie marketingresultaten?", "We rapporteren via dashboards of rapporten met traffic, leads, sales, CPA/ROAS en learnings per kanaal, inclusief wat we daarna doen."),
        q("mkt-9", "Werken jullie met ons interne marketingteam?", "Ja. We kunnen uitvoeren, sparren of een specialistisch deel overnemen, bijvoorbeeld alleen SEO of alleen ads."),
        q("mkt-10", "Hoe snel starten jullie campagnes?", "Na tracking en setup gaan campagnes vaak binnen 1 tot 2 weken live. Contenttrajecten lopen daar parallel aan, zodat creatives en pagina’s op tijd klaarstaan."),
        q("mkt-11", "Helpen jullie met e-mailmarketing?", "Ja. We maken flows, nieuwsbrieven en copy. Integratie met CRM of e-commerce is mogelijk."),
        q("mkt-12", "Is marketing een maandcontract?", "Retainers zijn gebruikelijk voor doorlopende groei. Projecten zoals een audit, redesign of launch kunnen eenmalig."),
        q("mkt-13", "Hoe voorkomen jullie “busy marketing” zonder resultaat?", "Elke activiteit hangt aan KPI’s. Underperforming tactieken stoppen we of verbeteren we met data, zodat budget naar wat werkt gaat."),
        q("mkt-14", "Wat zit er typisch in een marketingretainer?", "Een mix van strategie, content of SEO, campagnes, rapportage en experimenten — afgestemd op KPI’s. Scope en uren leggen we vast zodat prioriteiten helder blijven. Meer lezen: [Shop](/shop) · [Contact](/contact)."),
        q("mkt-15", "Helpen jullie met positionering en messaging?", "Ja. Heldere positionering, value props en pagina-copy zorgen dat ads, SEO en sales dezelfde boodschap uitdragen."),
        q("mkt-16", "Meten jullie marketing aan pipeline, niet alleen traffic?", "Waar mogelijk wel: leads, SQL’s, revenue of assisted conversions. Traffic zonder kwaliteit sturen we bij of stoppen we."),
        q("mkt-17", "Kunnen jullie marketing stack en tracking opschonen?", "Ja — GTM, GA4, pixels, CRM-koppelingen en consent. Schone data is de basis voor goede beslissingen. Meer lezen: [Consent mode](/kennisbank/analytics-conversie-toegankelijkheid/consent-mode-en-cookiebanners-correct-koppelen)."),
      ],
    },
    {
      id: "social-media",
      title: "Social Media",
      items: [
        q("soc-1", "Welke social kanalen beheren jullie?", "We beheren vooral LinkedIn, Instagram en Facebook, en waar relevant X of TikTok — op basis van audience, niet van hype."),
        q("soc-2", "Wat zit er in social media management?", "Social media management omvat strategie, contentkalender, creatie en scheduling, community replies, rapportage en doorlopende optimalisatie."),
        q("soc-3", "Maken jullie ook de visuals en video’s?", "Ja, via media creation: stilstaand beeld, carrousels, short-form video en templates."),
        q("soc-4", "Hoe vaak posten jullie?", "Dat hangt af van kanaal en doelen. Typisch posten we 3 tot 5 keer per week per kernkanaal, met kwaliteit boven volume."),
        q("soc-5", "Helpen jullie met community management?", "Ja. We doen moderatie, reacties, DM’s en reputatiezorg volgens de afgesproken tone-of-voice."),
        q("soc-6", "Kunnen social en ads gecombineerd worden?", "Ja. Organische content voedt ads-creatives; ads schalen wat organisch aanslaat."),
        q("soc-7", "Hoe meten jullie social succes?", "We meten bereik, engagement, click-outs, leads en assisted conversions — niet alleen likes. Zo zien we wat écht bijdraagt aan groei."),
        q("soc-8", "Werken jullie met influencers?", "Op verzoek wel: selectie, briefing en tracking. We focussen op fit en meetbare outcomes, niet op bereik alleen."),
        q("soc-9", "Kunnen jullie crisiscommunicatie ondersteunen?", "Ja. We werken met snelle response-protocollen en stemmen af met jullie team, zodat reacties consistent en onder controle blijven."),
        q("soc-10", "Helpen jullie LinkedIn voor B2B thought leadership?", "Ja. We maken persoonlijke én company content, carrousels, cases en employee advocacy, zodat expertise zichtbaar wordt."),
        q("soc-11", "Leveren jullie een contentkalender?", "Ja. We leveren een maand- of kwartaalplanning met thema’s, formats en deadlines."),
        q("soc-12", "Wat als we al een social manager hebben?", "Dan kunnen we specialiseren in creatives, ads of strategie, of piekperiodes ondersteunen zonder het bestaande team te vervangen."),
        q("soc-13", "Hoe snel zien we groei op social?", "Consistentie telt. Significante groei vraagt meestal weken tot maanden; met ads-support gaat het vaak sneller."),
        q("soc-14", "Helpen jullie met social proof en reviews?", "Ja. We plannen review-requests, cases en UGC-achtige formats die vertrouwen opbouwen — zonder nepengagement."),
        q("soc-15", "Kunnen jullie employee advocacy opzetten?", "Ja, vooral op LinkedIn: eenvoudige guidelines, templates en een ritme zodat het team zichtbaar expertise deelt."),
        q("soc-16", "Hoe koppelen jullie social aan de website en shop?", "Via UTM’s, landingspagina’s, productlinks en retargeting. Social is een kanaal in de funnel, geen eiland. Meer lezen: [Shop](/shop)."),
      ],
    },
    {
      id: "account-portaal",
      title: "Account en portaal",
      items: [
        q("acc-1", "Hoe log ik in op het klantenportaal?", "Ga naar account/login en gebruik het e-mailadres van je klantaccount. Ben je gegevens kwijt, gebruik wachtwoord reset of neem contact op. Meer lezen: [Account](/dashboard) · [Login kwijt](/kennisbank/crm-klantenpanel/logingegevens-klantenpanel-kwijt)."),
        q("acc-2", "Wat zie ik in mijn dashboard?", "Afhankelijk van je diensten: tickets, projecten, facturen, AI-scan/agents en snelle links naar support. Meer lezen: [AI-agents in account](/kennisbank/ai-agents/hoe-open-ik-het-ai-agents-overzicht-in-mijn-account) · [Ticket aanmaken](/kennisbank/support/hoe-maak-ik-een-support-ticket-aan-in-het-klantenpanel)."),
        q("acc-3", "Ik ben mijn logingegevens kwijt — wat nu?", "Gebruik “wachtwoord vergeten” of volg de kennisbankstappen voor het klantenpanel. Lukt het niet, open een ticket via een bekend contactadres. Meer lezen: [Logingegevens kwijt](/kennisbank/crm-klantenpanel/logingegevens-klantenpanel-kwijt)."),
        q("acc-4", "Hoe open ik een ticket vanuit het portaal?", "In het klantenpanel kies je support/tickets, beschrijf je probleem en voeg bewijs toe (URL, screenshots). Meer lezen: [Ticket aanmaken](/kennisbank/support/hoe-maak-ik-een-support-ticket-aan-in-het-klantenpanel) · [Ticket via panel](/kennisbank/support/hoe-stel-ik-een-ticket-in-voor-support-via-het-klantenpanel)."),
        q("acc-5", "Waar vind ik mijn facturen?", "In het portaal onder facturatie/billing kun je facturen bekijken en downloaden. Meer lezen: [Facturen raadplegen](/kennisbank/crm-klantenpanel/hoe-download-of-raadpleeg-ik-factuurdetails)."),
        q("acc-6", "Hoe wijzig ik factuurgegevens of betaalmethode?", "Pas bedrijfsnaam, BTW-nummer en betaalmethode aan in je accountinstellingen zodat nieuwe facturen kloppen. Meer lezen: [Factuurgegevens wijzigen](/kennisbank/crm-klantenpanel/hoe-wijzig-ik-mijn-factuurgegevens-en-betaalmethode)."),
        q("acc-7", "Kunnen collega’s ook toegang krijgen?", "Ja, met accountrollen (client, manager, admin) zodat meerdere teamleden tickets of projecten kunnen volgen zonder alles te delen."),
        q("acc-8", "Zijn AI-scan en AI-agents gekoppeld aan mijn account?", "Ja. Scans en agents horen bij je klantaccount zodat historie en rechten bewaard blijven. Meer lezen: [AI-agents](/kennisbank/ai-agents/wat-zijn-ai-agents-bij-triplezero-it-hosting) · [AI-scan](/kennisbank/ai-scan/wat-is-de-ai-scan-van-triplezero-it-hosting)."),
        q("acc-9", "Hoe veilig is mijn klantaccount?", "Gebruik unieke wachtwoorden en 2FA waar beschikbaar (ook op hostingpanels). Deel geen sessies op gedeelde computers. Meer lezen: [2FA DirectAdmin](/kennisbank/directadmin/2fa-instellen-in-directadmin)."),
        q("acc-10", "Kan ik projectstatus en deliverables volgen?", "Waar projecten in het portaal staan, zie je status en communicatie. Anders houden we je via tickets of sprintupdates op de hoogte."),
        q("acc-11", "Hoe koppel ik diensten uit de shop aan mijn account?", "Na checkout horen orders bij je account; provisioning (hosting, domein) volgt automatisch of via onboarding door support. Meer lezen: [Shop](/shop)."),
        q("acc-12", "Waar stel ik notificaties of voorkeuren in?", "In accountinstellingen beheer je profiel- en waar beschikbaar notificatievoorkeuren. Voor factuurmails hou je je e-mailadres actueel."),
      ],
    },
    {
      id: "shop-bestellen",
      title: "Shop en bestellen",
      items: [
        q("shop-1", "Wat kan ik in de shop bestellen?", "Hostingpakketten, domeinen, care/support-producten en andere diensten die we online aanbieden. Maatwerk offertes lopen via contact. Meer lezen: [Shop](/shop) · [Hosting](/diensten/categorie/hosting)."),
        q("shop-2", "Hoe werkt de winkelwagen en checkout?", "Voeg producten toe, controleer periode (maand/jaar) en rond af via checkout. Daarna ontvang je bevestiging en toegang tot je account. Meer lezen: [Winkelwagen](/shop/cart)."),
        q("shop-3", "Zijn prijzen inclusief of exclusief btw?", "In de shop tonen we prijzen volgens de getoonde btw-context (vaak incl. voor consumentenflows). Op de factuur staat btw netto uitgesplitst voor zakelijke klanten."),
        q("shop-4", "Kan ik maandelijks of jaarlijks betalen?", "Veel hosting- en care-producten hebben maand- en jaaropties. Jaarlijks is vaak voordeliger; details staan per productkaart."),
        q("shop-5", "Welke betaalmethoden accepteren jullie?", "Gangbare online methoden via de checkout (afhankelijk van regio). Voor enterprise-facturen kunnen we facturatie op rekening afspreken via contact."),
        q("shop-6", "Krijg ik meteen toegang na betaling?", "Voor standaard hosting/domeinproducten volgt provisioning snel na succesvolle betaling. Bij custom diensten plant support de kick-off."),
        q("shop-7", "Kan ik later upgraden van pakket?", "Ja. Van shared naar cloud/VPS of van Basic naar Plus/Business kan met migratieplanning. Meer lezen: [Shared naar VPS](/kennisbank/hosting/wanneer-stap-ik-over-van-shared-naar-vps) · [Pakket kiezen](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket)."),
        q("shop-8", "Hoe combineer ik shopproducten met maatwerk?", "Bestel hosting/care online en plan design, SEO of ads via intake. We bundelen facturatie en account waar mogelijk. Meer lezen: [Contact](/contact)."),
        q("shop-9", "Wat als mijn bestelling niet aankomt of vastloopt?", "Check je mail (inclusief spam) en het portaal. Blijft het stil, open een ticket of mail support met ordernummer. Meer lezen: [Contact](/contact) · [Tickets](/kennisbank/support/hoe-maak-ik-een-support-ticket-aan-in-het-klantenpanel)."),
        q("shop-10", "Kan ik een domein en hosting in één order bestellen?", "Ja, dat is de gebruikelijke flow: domein + hosting in de winkelwagen, daarna DNS-koppeling. Meer lezen: [Domeinen](/domeinen) · [Shop](/shop)."),
        q("shop-11", "Zijn er pakketten voor WordPress Care?", "Ja. Care-pakketten dekken updates, monitoring en onderhoud — los of naast hosting. Meer lezen: [Shop](/shop)."),
        q("shop-12", "Hoe annuleer of wijzig ik een bestelling?", "Direct na order via support; daarna gelden opzeg- en wijzigingsvoorwaarden per product. We helpen migratie of export als je stopt. Meer lezen: [Contact](/contact)."),
      ],
    },
    {
      id: "support",
      title: "Support",
      items: [
        q("sup-1", "Welke support bieden jullie?", "We bieden WordPress beheer, maatwerk website-support, tickets en live chat, onderhoud, security, performance en incident response. Meer lezen: [Contact met support](/kennisbank/support/hoe-neem-ik-contact-op-met-de-support-van-triplezero-it-hosting) · [Chat, ticket of belafspraak](/kennisbank/support/chat-versus-ticket-versus-belafspraak-wat-kies-ik-wanneer)."),
        q("sup-2", "Hoe bereik ik support?", "Via contact, een afspraak, tickets in het dashboard of live chat op de site. Spoedcases markeren we als prioriteit. Meer lezen: [Contact](/contact) · [Ticket aanmaken](/kennisbank/support/hoe-maak-ik-een-support-ticket-aan-in-het-klantenpanel) · [Belafspraak](/kennisbank/support/hoe-werkt-de-belafspraak-bij-triplezero-it-hosting)."),
        q("sup-3", "Wat is jullie responstijd?", "We mikken op een snelle eerste response, vaak binnen één werkdag. Bij kritieke downtime reageren we sneller. De exacte SLA’s staan in de supportpakketten."),
        q("sup-4", "Bieden jullie 24/7 monitoring?", "Ja, in relevante support- en hostingpakketten: monitoring, backups en alerts, zodat problemen eerder zichtbaar zijn. Meer lezen: [Backups bij downtime](/kennisbank/support/mijn-site-doet-het-niet-meer-hebben-jullie-een-backup)."),
        q("sup-5", "Kunnen jullie malware verwijderen?", "Ja — zowel op WordPress als op maatwerk stacks — inclusief harden en nazorg, zodat de site schoon én beter beschermd terugkomt."),
        q("sup-6", "Doen jullie WordPress-updates voor ons?", "Ja, via “Onderhoud en updates”: core, plugins en themes, met backup en checks voordat en nadat we updaten. Meer lezen: [Site down na WP-update](/kennisbank/hosting/website-down-na-update-wordpress)."),
        q("sup-7", "Helpen jullie bij hostingproblemen?", "Ja. We diagnosticeren, migrieren of optimaliseren hosting, VPS en domeinen tot de site weer stabiel draait. Meer lezen: [Website of e-mail verhuizen](/kennisbank/hosting/website-of-e-mail-verhuizen-regelen-wij-voor-je)."),
        q("sup-8", "Wat als mijn site platligt?", "Meld het als spoed. We herstellen waar mogelijk via backups, server checks en een hotfix, en houden jullie tussentijds op de hoogte van de status. Meer lezen: [Backups](/kennisbank/support/mijn-site-doet-het-niet-meer-hebben-jullie-een-backup) · [Zelf checken vóór support](/kennisbank/support/wat-kan-ik-zelf-doen-voordat-ik-contact-opneem-met-support)."),
        q("sup-9", "Is er een klantportaal?", "Ja. Ingelogde klanten zien dashboard, tickets, projecten en waar relevant CRM of facturen. Meer lezen: [Ticket via klantenpanel](/kennisbank/support/hoe-stel-ik-een-ticket-in-voor-support-via-het-klantenpanel) · [Login kwijt?](/kennisbank/crm-klantenpanel/logingegevens-klantenpanel-kwijt)."),
        q("sup-10", "Kunnen meerdere teamleden tickets openen?", "Ja, afhankelijk van de accountrollen (client, manager of admin)."),
        q("sup-11", "Wat zit er in Basic/Standard/Premium support?", "Hogere pakketten dekken meer sites, snellere opvolging en bredere dekking (updates, malware, speed, SEO). De details staan op de supportpagina’s."),
        q("sup-12", "Helpen jullie ook bij niet-technische vragen?", "Ja, over diensten, facturatie en account. Hoe diep we technisch meegaan hangt af van jullie pakket."),
        q("sup-13", "Kan ik support later upgraden?", "Ja. Jullie kunnen opschalen wanneer verkeer, risico of teambehoefte groeit."),
        q("sup-14", "Wat is het verschil tussen chat, ticket en belafspraak?", "Chat is snel voor korte vragen; tickets zijn beter voor technische cases met logs en opvolging; een belafspraak past bij intake of complexe uitleg. Meer lezen: [Chat versus ticket versus belafspraak](/kennisbank/support/chat-versus-ticket-versus-belafspraak-wat-kies-ik-wanneer)."),
        q("sup-15", "Hoe maak ik een supportticket aan?", "Log in op het klantenpanel en open een ticket met duidelijke URL, stappen en screenshots. Hoe beter de info, hoe sneller we kunnen helpen. Meer lezen: [Ticket aanmaken](/kennisbank/support/hoe-maak-ik-een-support-ticket-aan-in-het-klantenpanel) · [Ticket via panel](/kennisbank/support/hoe-stel-ik-een-ticket-in-voor-support-via-het-klantenpanel)."),
        q("sup-16", "Hebben jullie backups als mijn site platligt?", "Ja, afhankelijk van je hosting- of supportpakket. Bij downtime herstellen we waar mogelijk vanuit backups en onderzoeken we de oorzaak. Meer lezen: [Backups bij downtime](/kennisbank/support/mijn-site-doet-het-niet-meer-hebben-jullie-een-backup) · [JetBackup](/kennisbank/directadmin/wat-is-jetbackup-en-waar-gebruik-ik-het-voor)."),
        q("sup-17", "Wat kan ik zelf checken voordat ik support bel?", "Check statuspage, DNS-propagatie, recente updates, schijfruimte en of de fout reproduceerbaar is. Dat versnelt de diagnose. Meer lezen: [Zelf doen vóór support](/kennisbank/support/wat-kan-ik-zelf-doen-voordat-ik-contact-opneem-met-support) · [Statuspage](/statuspage)."),
        q("sup-18", "Hoe werkt live chat op de site?", "Open live chat via de chatknop. Agent 000 helpt eerst met FAQ/kennisbank; bij complexere of urgente zaken schakelen we door naar een medewerker. Meer lezen: [Digitale assistent](/kennisbank/support/digitale-assistent-triplezero-it-hosting) · [Contact](/contact)."),
        q("sup-19", "Helpen jullie bij een kritieke WordPress-fout?", "Ja. We diagnosticeren white screens, kritieke PHP-fouten en plugin-conflicten, met backup en gerichte fix. Meer lezen: [Kritieke fout WordPress](/kennisbank/wordpress/kritieke-fout-wordpress) · [Down na update](/kennisbank/hosting/website-down-na-update-wordpress)."),
        q("sup-20", "Kunnen jullie remote meekijken (TeamViewer e.d.)?", "Waar nodig en met toestemming wel, voor desktop- of panelproblemen. Voor de meeste hostingzaken volstaat toegang tot panel, DNS of WordPress. Meer lezen: [Contact support](/kennisbank/support/hoe-neem-ik-contact-op-met-de-support-van-triplezero-it-hosting)."),
        q("sup-21", "Hoe zeg ik een abonnement of dienst op?", "Opzeggen kan via het klantenpanel of support; let op opzegtermijnen in je overeenkomst. We helpen data/export en DNS-overdracht netjes afronden. Meer lezen: [Contact](/contact) · [Account](/dashboard)."),
        q("sup-22", "Bieden jullie WordPress Care / onderhoudspakketten?", "Ja. Updates, backups, security-checks en performance vallen onder care-pakketten — ideaal naast hosting. Meer lezen: [Shop](/shop) · [WordPress installeren](/kennisbank/wordpress/handleiding-wordpress-installeren)."),
        q("sup-23", "Wat als e-mail plotseling stopt met werken?", "Check DNS (MX/SPF/DKIM/DMARC), mailboxquota en of Microsoft of providers mail blokkeren. Wij helpen de keten doormeten. Meer lezen: [E-mailproblemen](/kennisbank/hosting/problemen-met-e-mail-website) · [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam)."),
      ],
    },
    {
      id: "webdesign",
      title: "Webdesign",
      items: [
        q("web-1", "Bouwen jullie alleen WordPress-sites?", "Nee. Naast WordPress doen we maatwerk webdesign in HTML/CSS/JS, PHP en Next.js — los van de WordPress-diensten. Meer lezen: [WordPress installeren](/kennisbank/wordpress/handleiding-wordpress-installeren) · [Diensten](/diensten)."),
        q("web-2", "Wat houdt Website Support in?", "Website Support dekt ontwerp, development, onderhoud, security, performance, backups of migratie en API-integraties voor custom stacks."),
        q("web-3", "Kunnen jullie een bestaande site redesignen?", "Ja. We doen een UX/UI-refresh, conversieverbetering en technische modernisering, zonder alles weg te gooien als dat niet nodig is."),
        q("web-4", "Werken jullie met Next.js?", "Ja. Next.js is ideaal voor snelle, SEO-klare marketing sites en dashboards."),
        q("web-5", "Doen jullie ook PHP-applicaties?", "Ja. We bouwen portals en API’s, moderniseren legacy en harden performance en security."),
        q("web-6", "Hoe zorgen jullie voor mobiele websites?", "We ontwerpen mobile-first, bouwen responsive layouts en testen op gangbare devices en browsers, zodat de site overal goed werkt."),
        q("web-7", "Is toegankelijkheid (a11y) inbegrepen?", "We bouwen met toegankelijke basispraktijken. Strengere WCAG-trajecten kunnen we als extra scope opnemen."),
        q("web-8", "Kunnen jullie CMS-opties bieden zonder WordPress?", "Ja. Dat kan een headless CMS, custom admin of een statische setup zijn — afhankelijk van jullie team en wensen."),
        q("web-9", "Hoe lang duurt een webdesigntraject?", "Landingspagina’s duren meestal enkele weken; grotere sites of apps lopen in sprints over meerdere weken. De planning volgt na de intake."),
        q("web-10", "Regelen jullie ook copy en SEO bij launch?", "Ja, in combinatie met content- en SEO-diensten, zodat de site meteen vindbaar en conversiegericht live gaat."),
        q("web-11", "Wat met performance na launch?", "We optimaliseren Core Web Vitals, caching of CDN en monitoring. Nazorg loopt daarna via onderhoudspakketten. Meer lezen: [Wat doet een CDN?](/kennisbank/cdn-performance-cloudflare/wat-een-cdn-doet-voor-je-website)."),
        q("web-12", "Kunnen jullie API’s koppelen (CRM, betalingen, AI)?", "Ja. We bouwen integraties met nette foutafhandeling, logging en documentatie."),
        q("web-13", "Hoe leveren jullie code op?", "Waar mogelijk leveren we via repository en deploy pipeline, met environments (staging en production) en een duidelijke handover."),
        q("web-14", "Helpen jullie met conversie-optimalisatie op de site?", "Ja. We doen A/B-tests, UX-verbeteringen, formulieren, CTA’s en page speed, zodat meer bezoekers converteren."),
        q("web-15", "Bouwen jullie ook webshops?", "Ja, van marketing-sites met checkout-integraties tot e-commerce op WordPress of maatwerk. Scope, betalingen en fulfillment stemmen we af in de intake. Meer lezen: [Diensten](/diensten) · [Shop](/shop)."),
        q("web-16", "Hoe gaan jullie om met privacyteksten op sites?", "We adviseren en implementeren privacy- en toestemmingsflows bij formulieren en banners, afgestemd op jullie jurist waar nodig. Meer lezen: [Privacy bij formulieren](/kennisbank/webdesign-en-maatwerk/privacytekst-en-toestemming-bij-leadformulieren) · [Cookiebanner](/kennisbank/wordpress/hoe-voeg-ik-een-gdpr-avg-cookiebanner-toe-in-wordpress)."),
        q("web-17", "Leveren jullie staging-omgevingen?", "Ja, waar relevant: staging voor reviews en tests, daarna gecontroleerde deploy naar productie."),
        q("web-18", "Kunnen jullie een bestaande WordPress-site overnemen en verbeteren?", "Ja — audit, updates, security, snelheid, UX en SEO, zonder onnodig vanaf nul te bouwen. Meer lezen: [WP verhuizen](/kennisbank/domeinnamen/wordpress-website-verhuizen) · [Kritieke fouten](/kennisbank/wordpress/kritieke-fout-wordpress)."),
        q("web-19", "Hoe zit het met HTTP naar HTTPS na oplevering?", "Sites gaan standaard op HTTPS. Bij migraties forceren we HTTPS en lossen we mixed-content op. Meer lezen: [HTTP naar HTTPS in WordPress](/kennisbank/wordpress/wordpress-url-omzetten-van-http-naar-https) · [SSL](/kennisbank/beveiliging/wat-is-ssl-en-waarom-heb-je-het-nodig)."),
      ],
    },
    {
      id: "domeinen",
      title: "Domeinen",
      items: [
        q("dom-1", "Wat is een domeinnaam?", "Een domeinnaam is het adres waarmee bezoekers jullie website vinden (bijvoorbeeld voorbeeld.nl). Het hoort bij DNS-records die naar jullie hosting of e-mail wijzen. Meer lezen: [Domeinnaamregistratie](/kennisbank/domeinnamen/domeinnaamregistratie) · [Domeinen bestellen](/domeinen)."),
        q("dom-2", "Hoe registreer ik een domeinnaam bij jullie?", "Zoek de gewenste naam op de domeinpagina, kies de extensie en rond af via de shop. Na registratie beheer je DNS, nameservers en facturen in je account. Meer lezen: [Domeinen](/domeinen) · [Registratiehandleiding](/kennisbank/domeinnamen/domeinnaamregistratie) · [Shop](/shop)."),
        q("dom-3", "Kan ik mijn domein naar jullie verhuizen?", "Ja. Vraag bij de huidige registrar een autorisatiecode (EPP) aan, hef een eventuele transfer-lock op en start de verhuizing bij ons. Daarna zetten we DNS en nameservers goed. Meer lezen: [Domein verhuizen](/kennisbank/domeinnamen/domeinnaam-verhuizen) · [Autorisatiecode](/kennisbank/domeinnamen/wat-is-een-autorisatiecode) · [Domeinen](/domeinen)."),
        q("dom-4", "Wat is een autorisatiecode (EPP/Auth-code)?", "Dat is een eenmalige code van je huidige registrar waarmee je een domeintransfer veilig start. Zonder geldige code kan de verhuizing niet doorgaan. Meer lezen: [Wat is een autorisatiecode?](/kennisbank/domeinnamen/wat-is-een-autorisatiecode) · [Domein verhuizen](/kennisbank/domeinnamen/domeinnaam-verhuizen)."),
        q("dom-5", "Wat is een transfer-lock of registrar-lock?", "Een lock voorkomt ongewenste verhuizingen. Voor een transfer moet je die vaak eerst uitzetten bij de huidige provider. Daarna kun je de verhuizing bij ons starten. Meer lezen: [Domein verhuizen](/kennisbank/domeinnamen/domeinnaam-verhuizen) · [Support](/contact)."),
        q("dom-6", "Kan ik een domein kopen zonder hosting?", "Ja. Je kunt alleen een domein registreren of verhuizen en later hosting of e-mail toevoegen. DNS kun je ondertussen al beheren of doorsturen. Meer lezen: [Domein zonder hosting](/kennisbank/domeinnamen/domeinnaam-kopen-zonder-hosting) · [Domeinen](/domeinen)."),
        q("dom-7", "Welke extensies (.nl, .com, …) kan ik registreren?", "We ondersteunen gangbare TLD’s zoals .nl en .com plus veel internationale extensies. Beschikbaarheid en prijs zie je direct in de domeinzoeker. Meer lezen: [Domeinen](/domeinen) · [Registratie](/kennisbank/domeinnamen/domeinnaamregistratie)."),
        q("dom-8", "Hoe verleng ik mijn domeinnaam?", "Verlenging loopt via facturen en je klantenportaal; automatische verlenging is vaak beschikbaar. Houd betaalgegevens actueel om expiratie te voorkomen. Meer lezen: [Facturen](/kennisbank/crm-klantenpanel/hoe-download-of-raadpleeg-ik-factuurdetails) · [Factuurgegevens](/kennisbank/crm-klantenpanel/hoe-wijzig-ik-mijn-factuurgegevens-en-betaalmethode)."),
        q("dom-9", "Wat zijn premium domeinnamen?", "Premium namen zijn korte of populaire domeinen met een hogere aanschafprijs, vaak via een aftermarket. Beschikbaarheid en voorwaarden verschillen per extensie. Meer lezen: [Premium domeinen](/kennisbank/domeinnamen/premium-domeinnamen) · [Domeinen](/domeinen)."),
        q("dom-10", "Kan ik mijn domein anoniem registreren (Protect ID)?", "Waar de registry het toelaat, kun je privacy/Protect ID overwegen. Regels verschillen per extensie — .nl heeft bijvoorbeeld eigen kaders. Meer lezen: [Protect ID](/kennisbank/domeinnamen/protect-id-domein-anoniem-registreren)."),
        q("dom-11", "Mijn domein staat in quarantaine — wat nu?", "Na opheffing kan een domein in quarantaine staan. Afhankelijk van de registry kun je het vaak nog terugactiveren tegen kosten; wacht daar niet te lang mee. Meer lezen: [Domein uit quarantaine](/kennisbank/domeinnamen/domein-quarantaine-halen) · [Contact](/contact)."),
        q("dom-12", "Mijn nieuwe domeinnaam werkt nog niet — wat nu?", "Meestal is het DNS-propagatie, ontbrekende A/MX-records of nameservers die nog niet zijn bijgewerkt. Controleer records en geef TTL’s de tijd om te verlopen. Meer lezen: [Nieuw domein werkt niet](/kennisbank/domeinnamen/mijn-nieuwe-domeinnaam-werkt-niet) · [DNS beheren](/kennisbank/domeinnamen/dns-records-beheren)."),
        q("dom-13", "Hoe koppel ik een domein aan mijn hostingpakket?", "Voeg het domein toe in je panel of account en wijs DNS (A-record of nameservers) naar de hosting. Wij helpen bij de eerste koppeling na bestelling. Meer lezen: [Domein koppelen aan pakket](/kennisbank/domeinnamen/domeinnaam-koppelen-aan-een-pakket) · [DNS beheren](/kennisbank/domeinnamen/dns-records-beheren)."),
        q("dom-14", "Kan ik een domein doorsturen (forwarding)?", "Ja. Domeinforwarding stuurt bezoekers door naar een andere URL — handig voor merknamen zonder aparte site. DNS en redirects stemmen we af op jullie setup. Meer lezen: [Domein doorsturen](/kennisbank/domeinnamen/domeinnaam-doorsturen) · [Domeinen](/domeinen)."),
        q("dom-15", "Hoe wijzig ik nameservers van mijn domein?", "In het DNS-/domeinbeheer kies je onze nameservers of externe (bijv. CDN). Propagatie kan enkele uren tot een dag duren. Meer lezen: [Nameservers beheren](/kennisbank/domeinnamen/nameservers-beheren) · [DNS beheren](/kennisbank/domeinnamen/dns-records-beheren)."),
        q("dom-16", "Wat kost een domeinnaam?", "Prijzen verschillen per extensie en periode; de domeinzoeker toont actuele registratie- en verlengprijzen. Premium namen hebben een aparte prijs. Meer lezen: [Domeinen](/domeinen) · [Shop](/shop)."),
        q("dom-17", "Moet ik hosting en domein bij dezelfde provider hebben?", "Nee, maar het is praktischer: DNS, SSL, e-mail en support zitten dan bij één partij. Je kunt ook alleen DNS bij ons houden en elders hosten. Meer lezen: [Domein zonder hosting](/kennisbank/domeinnamen/domeinnaam-kopen-zonder-hosting) · [Hosting](/diensten/categorie/hosting)."),
        q("dom-18", "Kan ik meerdere domeinen op één account beheren?", "Ja. Extra domeinen registreer of verhuis je en koppelt ze als addon, park of doorverwijzing — binnen de limieten van je hostingpakket. Meer lezen: [Domeinen](/domeinen) · [Hostingpakket kiezen](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket)."),
        q("dom-19", "Wat gebeurt er als mijn domein verloopt?", "Na expiratie volgt vaak een grace- of quarantaineperiode waarin herstel nog mogelijk is, daarna kan iemand anders het claimen. Verleng op tijd via facturen. Meer lezen: [Quarantaine](/kennisbank/domeinnamen/domein-quarantaine-halen) · [Contact](/contact)."),
        q("dom-20", "Waar bestel of beheer ik domeinen?", "Registreren en verhuizen doe je via de domeinpagina of shop; beheer (DNS, facturen, verlenging) zit in het klantenportaal. Meer lezen: [Domeinen](/domeinen) · [Shop](/shop) · [Account](/dashboard)."),
      ],
    },
    {
      id: "webhosting",
      title: "Webhosting",
      items: [
        q("host-1", "Welke hosting bieden jullie?", "We bieden shared hosting, cloud hosting, WordPress hosting en VPS — plus domeinregistratie. Kies op traffic, stack en groeiverwachting. Meer lezen: [Shared hosting](/diensten/shared-hosting) · [Cloud hosting](/diensten/cloud-hosting) · [WordPress hosting](/diensten/wordpress-hosting) · [VPS](/diensten/vps-hosting)."),
        q("host-2", "Wat is het verschil tussen shared, cloud, WordPress en VPS?", "Shared is voordelig voor kleinere sites. Cloud geeft meer resources en schaalbaarheid, volledig beheerd. WordPress hosting is geoptimaliseerd voor WP. VPS geeft meer controle voor zwaardere loads. Meer lezen: [Verschillen uitgelegd](/kennisbank/hosting/hoe-kies-ik-tussen-shared-hosting-wordpress-hosting-en-vps) · [Shared-plannen](/kennisbank/hosting/wat-is-shared-hosting-basic-plus-en-business) · [VPS-plannen](/kennisbank/hosting/wat-is-vps-hosting-basic-plus-en-business)."),
        q("host-3", "Wat is cloud hosting bij jullie?", "Cloud hosting geeft meer resources en schaalbaarheid dan klassieke shared, terwijl wij het beheer blijven doen. Ideaal wanneer shared krap wordt maar full VPS nog niet nodig is. Meer lezen: [Cloud hosting](/diensten/cloud-hosting) · [Hosting kiezen](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket)."),
        q("host-4", "Zit SSL bij hosting?", "Ja. SSL is standaard in onze relevante hostingplannen, zodat sites op HTTPS draaien. Meer lezen: [Wat is SSL?](/kennisbank/beveiliging/wat-is-ssl-en-waarom-heb-je-het-nodig) · [Let's Encrypt installeren](/kennisbank/hosting/hoe-installeer-ik-een-gratis-lets-encrypt-ssl-certificaat)."),
        q("host-5", "Kunnen jullie mijn site migreren naar jullie hosting?", "Ja. We doen backup, migratie, DNS-cutover, SSL en smoke tests, met minimale downtime. Meer lezen: [Website of e-mail verhuizen](/kennisbank/hosting/website-of-e-mail-verhuizen-regelen-wij-voor-je) · [WordPress verhuizen](/kennisbank/domeinnamen/wordpress-website-verhuizen)."),
        q("host-6", "Hoe werken backups op hosting?", "Dat hangt van het plan af: eenvoudige of geautomatiseerde backups. Extra off-site retentie is mogelijk. Meer lezen: [JetBackup](/kennisbank/directadmin/wat-is-jetbackup-en-waar-gebruik-ik-het-voor) · [Backup in DirectAdmin](/kennisbank/directadmin/backup-maken-en-terugzetten-directadmin)."),
        q("host-7", "Wat als ik meer traffic krijg?", "Dan schalen we naar Plus, Business, cloud of VPS en optimaliseren we caching en CDN, zodat de site de groei aankan. Meer lezen: [Wanneer naar VPS?](/kennisbank/hosting/wanneer-stap-ik-over-van-shared-naar-vps) · [CDN](/kennisbank/cdn-performance-cloudflare/wat-een-cdn-doet-voor-je-website)."),
        q("host-8", "Hoe veilig is jullie hosting?", "We werken met firewall, SSL, updates, monitoring en hardening. Extra security-lagen zijn beschikbaar waar nodig. Meer lezen: [SSL](/kennisbank/beveiliging/wat-is-ssl-en-waarom-heb-je-het-nodig) · [2FA in DirectAdmin](/kennisbank/directadmin/2fa-instellen-in-directadmin)."),
        q("host-9", "Kan ik later van shared naar VPS?", "Ja. We plannen de migratie samen, inclusief tests en rollback, zodat de overstap gecontroleerd verloopt. Meer lezen: [Shared naar VPS](/kennisbank/hosting/wanneer-stap-ik-over-van-shared-naar-vps) · [VPS hosting](/diensten/vps-hosting)."),
        q("host-10", "Ondersteunen jullie CDN?", "Ja, waar relevant — vaak zit er een gratis CDN in WP-hostingplannen — voor snellere globale delivery. Meer lezen: [Wat doet een CDN?](/kennisbank/cdn-performance-cloudflare/wat-een-cdn-doet-voor-je-website) · [WordPress hosting](/diensten/wordpress-hosting)."),
        q("host-11", "Wat is jullie uptime-aanpak?", "We monitoren, reageren snel bij incidenten en communiceren duidelijk bij onderhoudsvensters, zodat jullie weten wat er speelt. Statusupdates vind je op de statuspagina. Meer lezen: [Statuspage](/statuspage) · [Contact](/contact)."),
        q("host-12", "Hoe kies ik het juiste hostingplan?", "Op basis van traffic, stack (WordPress of maatwerk), resources en groei. We adviseren eerlijk — we verkopen niet over. Meer lezen: [Juiste hostingpakket kiezen](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket) · [Shared vs WP vs VPS](/kennisbank/hosting/hoe-kies-ik-tussen-shared-hosting-wordpress-hosting-en-vps)."),
        q("host-13", "Waar zie ik hostingprijzen?", "Op de hostingdienstpagina’s en in de shop, met maand- of jaaropties waar van toepassing. Meer lezen: [Shared](/diensten/shared-hosting) · [Cloud](/diensten/cloud-hosting) · [WordPress](/diensten/wordpress-hosting) · [VPS](/diensten/vps-hosting) · [Shop](/shop)."),
        q("host-14", "Heb ik SSH-toegang op mijn hosting?", "Dat hangt van het pakket af. Op veel plannen is SSH beschikbaar of aan te vragen; op VPS heb je doorgaans volledige toegang. Meer lezen: [SSH-toegang](/kennisbank/hosting/heb-ik-ssh-toegang-op-mijn-hosting) · [VPS](/diensten/vps-hosting)."),
        q("host-15", "Hoe installeer ik WordPress op jullie hosting?", "Via het control panel (bijv. DirectAdmin/Installatron) of handmatig. We hebben een stapsgewijze handleiding. Meer lezen: [WordPress installeren](/kennisbank/wordpress/handleiding-wordpress-installeren) · [WordPress hosting](/diensten/wordpress-hosting)."),
        q("host-16", "Wat zijn inodes en waarom raakt mijn pakket “vol”?", "Inodes tellen bestanden/mappen, niet alleen GB’s. Veel kleine cache- of mailbestanden kunnen de limiet raken terwijl schijfruimte nog vrij lijkt. Meer lezen: [Inodes](/kennisbank/hosting/inodes-en-inode-limieten) · [Opslag en verkeer](/kennisbank/hosting/onbeperkte-opslag-en-dataverkeer)."),
        q("host-17", "Wat betekent “onbeperkte” opslag of dataverkeer?", "“Onbeperkt” volgt fair-use: normaal websitegebruik is prima; misbruik of extreme loads kunnen we beperken om het platform stabiel te houden. Meer lezen: [Opslag en verkeer](/kennisbank/hosting/onbeperkte-opslag-en-dataverkeer)."),
        q("host-18", "Wat is het verschil tussen shared, VPS en dedicated?", "Shared deelt resources; VPS isoleert meer CPU/RAM; dedicated is een hele server. Kies op traffic, controlebehoefte en budget. Meer lezen: [Dedicated vs VPS vs shared](/kennisbank/infrastructuur-servers/verschil-tussen-dedicated-vps-en-shared-hosting) · [Shared/WP/VPS](/kennisbank/hosting/hoe-kies-ik-tussen-shared-hosting-wordpress-hosting-en-vps)."),
        q("host-19", "Hoe werk ik met DirectAdmin?", "DirectAdmin is het control panel voor e-mail, DNS, databases, backups en installs. Log in met je panelgegevens; 2FA raden we sterk aan. Meer lezen: [2FA in DirectAdmin](/kennisbank/directadmin/2fa-instellen-in-directadmin) · [Backups](/kennisbank/directadmin/backup-maken-en-terugzetten-directadmin)."),
        q("host-20", "Bieden jullie object cache voor WordPress?", "Op geschikte plannen ondersteunen we persistent object cache om database-queries te verminderen en sneller te laden. Meer lezen: [Object cache](/kennisbank/hosting/persistent-object-cache-in-wordpress) · [WordPress hosting](/diensten/wordpress-hosting)."),
        q("host-21", "Hoe verleng of betaal ik hosting?", "Via het klantenpanel en facturen; automatische verlenging is vaak beschikbaar. Houd factuurgegevens actueel om onderbreking te voorkomen. Meer lezen: [Factuurgegevens](/kennisbank/crm-klantenpanel/hoe-wijzig-ik-mijn-factuurgegevens-en-betaalmethode) · [Facturen bekijken](/kennisbank/crm-klantenpanel/hoe-download-of-raadpleeg-ik-factuurdetails)."),
        q("host-22", "Kan ik meerdere domeinen op één hosting zetten?", "Vaak ja, via addon- of park-domeinen — afhankelijk van je pakketlimieten. Wij helpen bij koppeling en DNS. Meer lezen: [Hosting kiezen](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket) · [Domein koppelen](/kennisbank/domeinnamen/domeinnaam-koppelen-aan-een-pakket)."),
        q("host-23", "Hoe veilig is inloggen op mijn hostingpanel?", "Gebruik een sterk wachtwoord en schakel 2FA in. Deel geen panel-logins via onveilige kanalen. Meer lezen: [2FA DirectAdmin](/kennisbank/directadmin/2fa-instellen-in-directadmin) · [Login kwijt](/kennisbank/crm-klantenpanel/logingegevens-klantenpanel-kwijt)."),
        q("host-24", "Wat is WordPress hosting precies?", "WordPress hosting is geoptimaliseerd voor WP: snellere PHP/stack, vaak CDN en eenvoudigere installs/updates dan generieke shared. Meer lezen: [WP-hostingplannen](/kennisbank/hosting/wat-is-wordpress-hosting-basic-plus-en-pro) · [WordPress hosting](/diensten/wordpress-hosting)."),
        q("host-25", "Waar bestel ik hosting direct?", "In de shop of via de hostingcategorieën Shared, Cloud, WordPress en VPS. Na bestelling ontvang je toegang tot panel en facturen. Meer lezen: [Shop](/shop) · [Hosting overzicht](/diensten/categorie/hosting)."),
      ],
    },
    {
      id: "email-dns",
      title: "E-mail en DNS",
      items: [
        q("mail-1", "Bieden jullie e-mail bij domeinen of hosting?", "Dat hangt van het pakket en de setup af. We adviseren betrouwbare mailoplossingen en zetten DNS goed (SPF, DKIM en DMARC). Meer lezen: [E-mail op eigen domein](/kennisbank/e-mail/e-mailadres-eigen-domein-wordpress) · [SPF-record](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam)."),
        q("mail-2", "Wat zijn SPF, DKIM en DMARC?", "Het zijn DNS-records die e-mailauthenticatie regelen en spoofing/spam verminderen. Zonder correcte records belandt mail vaker in spam. Meer lezen: [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam) · [DKIM](/kennisbank/domeinnamen/dkim-record-toevoegen-aan-dns-domeinnaam) · [DMARC](/kennisbank/domeinnamen/hoe-kan-ik-een-dmarc-record-toevoegen)."),
        q("mail-3", "Hoe beheer ik DNS-records?", "Via het DNS-beheer van je domein of hostingpanel zet je A, AAAA, CNAME, MX en TXT-records. Wij helpen bij migraties en mail-auth. Meer lezen: [DNS beheren](/kennisbank/domeinnamen/dns-records-beheren) · [DNSSEC](/kennisbank/domeinnamen/wat-is-dnssec-en-hoe-voeg-ik-het-toe-aan-mijn-domein)."),
        q("mail-4", "Helpen jullie DNS-problemen oplossen?", "Ja. We lossen records, propagatie, mail-auth en domeinkoppelingen op tot DNS weer klopt. Meer lezen: [DNS-records beheren](/kennisbank/domeinnamen/dns-records-beheren) · [Propagatie en TTL](/kennisbank/foutmeldingen-troubleshooting/dns-propagatie-ttl-en-caches-legen)."),
        q("mail-5", "Wat is DNSSEC?", "DNSSEC ondertekent DNS-antwoorden zodat manipulatie moeilijker wordt. We kunnen het activeren waar jouw TLD en setup dat ondersteunen. Meer lezen: [DNSSEC uitleg](/kennisbank/domeinnamen/wat-is-dnssec-en-hoe-voeg-ik-het-toe-aan-mijn-domein)."),
        q("mail-6", "Hoe zet ik e-mail op mijn telefoon?", "Gebruik IMAP/SMTP-gegevens uit je panel. Voor Android (en vergelijkbaar op iOS) staan de stappen in de kennisbank. Meer lezen: [E-mail op Android](/kennisbank/e-mail/e-mail-instellen-op-android) · [E-mail bij eigen domein](/kennisbank/e-mail/e-mailadres-eigen-domein-wordpress)."),
        q("mail-7", "Wat als e-mail plotseling stopt met werken?", "Check DNS (MX/SPF/DKIM/DMARC), mailboxquota en of providers mail blokkeren. Wij helpen de keten doormeten. Meer lezen: [E-mailproblemen](/kennisbank/hosting/problemen-met-e-mail-website) · [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam)."),
        q("mail-8", "Hoe werken nameservers?", "Nameservers bepalen welk DNS-systeem jouw domein bedient. Wijzig je ze, dan moet je A/MX/TXT-records opnieuw goed zetten bij de nieuwe DNS-host. Meer lezen: [Nameservers beheren](/kennisbank/domeinnamen/nameservers-beheren) · [DNS beheren](/kennisbank/domeinnamen/dns-records-beheren)."),
        q("mail-9", "Hoe lang duurt DNS-propagatie?", "Vaak minuten tot enkele uren; soms tot 24–48 uur door TTL’s en caches. Verlaag TTL’s vóór een migratie om sneller om te schakelen. Meer lezen: [Propagatie en TTL](/kennisbank/foutmeldingen-troubleshooting/dns-propagatie-ttl-en-caches-legen) · [Nieuw domein werkt niet](/kennisbank/domeinnamen/mijn-nieuwe-domeinnaam-werkt-niet)."),
        q("mail-10", "Kan ik e-mail doorsturen naar een ander adres?", "Ja. Forwarders sturen inkomende mail door naar Gmail, Microsoft 365 of een ander mailboxadres — handig naast of in plaats van een volle mailbox. Meer lezen: [E-mail doorsturen](/kennisbank/e-mail/email-doorsturen-naar-mailadres)."),
        q("mail-11", "Kan ik mijn domein koppelen aan Microsoft 365?", "Ja. Je zet MX- en authenticatierecords (SPF/DKIM/DMARC) volgens Microsoft’s instructies; wij helpen de DNS-kant. Meer lezen: [Domein aan Microsoft 365](/kennisbank/domeinnamen/domeinnaam-koppelen-aan-microsoft-365) · [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam)."),
        q("mail-12", "Waarom belandt mijn mail in spam?", "Vaak ontbreken of conflicteren SPF/DKIM/DMARC, of de IP/reputatie is zwak. We controleren DNS-auth en verzendgedrag. Meer lezen: [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam) · [DKIM](/kennisbank/domeinnamen/dkim-record-toevoegen-aan-dns-domeinnaam) · [DMARC](/kennisbank/domeinnamen/hoe-kan-ik-een-dmarc-record-toevoegen)."),
        q("mail-13", "Wat is een MX-record?", "Een MX-record vertelt het internet welke mailserver e-mail voor jouw domein mag ontvangen. Zonder correcte MX komt er geen mail binnen. Meer lezen: [DNS beheren](/kennisbank/domeinnamen/dns-records-beheren) · [E-mailproblemen](/kennisbank/hosting/problemen-met-e-mail-website)."),
        q("mail-14", "Kan ik webmail gebruiken?", "Ja, via de webmail-URL van je hostingpanel kun je mail in de browser lezen en versturen — naast IMAP op telefoon of Outlook. Meer lezen: [E-mail instellen](/kennisbank/e-mail/e-mail-instellen-op-android) · [Contact](/contact)."),
        q("mail-15", "Moet DNS bij jullie staan als hosting elders is?", "Nee. Je kunt DNS bij ons of elders houden, zolang A/MX/TXT naar de juiste diensten wijzen. Consistent beheer voorkomt fouten bij migraties. Meer lezen: [DNS beheren](/kennisbank/domeinnamen/dns-records-beheren) · [Nameservers](/kennisbank/domeinnamen/nameservers-beheren)."),
      ],
    }

  ],
};

const en: FaqContent = {
  title: "Frequently asked questions",
  subtitle: "Questions and answers — from AI, AEO, GEO and SEO to design, domains, hosting, account, shop, marketing and support. With links to the knowledge base.",
  ctaTitle: "Still need help?",
  ctaText: "Can't find your question? Contact us — we'll get back to you as soon as possible.",
  ctaButton: "Contact us",
  categories: [
    {
      id: "general",
      title: "General",
      items: [
        q("gen-1", "What exactly does TripleZero iT do?", "TripleZero iT combines web design, WordPress management, digital marketing, search visibility (AEO, GEO/local and SEO), design and hosting. We help brands get found faster, build better websites and grow measurably. Read more: [About us](/over-ons) · [Services](/diensten)."),
        q("gen-2", "How do I get started with TripleZero iT?", "Contact us or schedule an appointment. We do a short intake, look at goals and stack, and then draw up a concrete proposal with planning and KPIs. Read more: [Schedule appointment](/afspraak) · [Contact](/contact)."),
        q("gen-3", "Which companies do you work for?", "We work for SMEs, scale-ups, e-commerce, agencies and international brands. This can be done alongside an existing team, or as a full-service partner."),
        q("gen-4", "Do you only work in the Netherlands?", "No. We serve customers in Asia, Europe, the UAE and the USA, with Dutch and English-language processes."),
        q("gen-5", "What is a typical process like?", "A process usually runs like this: intake → audit or scan → plan → implementation in sprints → measurement → optimization. You will receive clear milestones and reporting, so that it is always clear where we stand."),
        q("gen-6", "Can I combine multiple services?", "Yes. For example, many customers combine web design + SEO + ads, or WordPress maintenance + hosting + security. We tailor the mix to your goals and budget."),
        q("gen-7", "How quickly can you start?", "That depends on our capacity, but once approved we often start within a few working days. We tackle urgent issues — such as bugs, malware or downtime — as a priority, so that we can get started on them as quickly as possible."),
        q("gen-8", "Do you work remotely or on-site?", "We work primarily remotely, with clear communication via email, chat and calls. On-site can be discussed upon request if the project requires it."),
        q("gen-9", "How does the team communicate progress?", "We keep you informed via regular updates, tickets or a dashboard where relevant, plus sprint or monthly reports with actions and results."),
        q("gen-10", "What do you need to get started?", "To get started, we have access to website and hosting (if necessary), your goals, brand guidelines, analytics accounts and any existing tools. If something is missing, we will help you get it in order first."),
        q("gen-11", "Are your services suitable for startups?", "Yes. We scale from lean landing pages and AI scans to full growth setups, so that the approach evolves as you grow."),
        q("gen-12", "What about ownership of work and accounts?", "Your domain, content, code repositories and ad accounts remain yours. Upon delivery, we hand over the files and documentation, so that everything remains neatly managed in-house."),
        q("gen-13", "Can you acquire or collaborate with existing suppliers?", "Yes. We work smoothly alongside developers, marketers or agencies, or we take over maintenance and optimization without unnecessarily disrupting existing work."),
        q("gen-14", "What is Agent 000 (the chat assistant)?", "Agent 000 is our digital assistant on the site and in support flows. He answers frequently asked questions, points to knowledge base articles and can refer you to live chat, a ticket or an appointment when human help is more appropriate. Read more: [Digital assistant](/kennisbank/support/digitale-assistent-triplezero-it-hosting) · [Chat, ticket or call appointment](/kennisbank/support/chat-versus-ticket-versus-belafspraak-wat-kies-ik-wanneer)."),
        q("gen-15", "How do I schedule an appointment or call?", "You can choose a time that suits you via the Appointment page. For quick questions you can also use live chat or a ticket; a telephone appointment is useful for more complex processes or intakes. Read more: [Appointment](/afspraak) · [Call appointment explained](/kennisbank/support/hoe-werkt-de-belafspraak-bij-triplezero-it-hosting)."),
        q("gen-16", "Where can I see the status of your services?", "On the status page we show incidents and maintenance regarding hosting and related services, so that you can quickly see if something is going on. Read more: [Statuspage](/statuspage)."),
        q("gen-17", "Do you have a knowledge base?", "Yes. The knowledge base contains manuals about domains, DNS, email, hosting, WordPress, AI scan, security and more — with step-by-step explanations. Read more: [Knowledge base](/kennisbank)."),
        q("gen-18", "How do you deal with privacy and cookies?", "We work GDPR-conscious: privacy texts, consent for forms and cookie banners/consent mode where tracking is necessary. For WordPress we help with a correct cookie setup. Read more: [Cookie banner in WordPress](/kennisbank/wordpress/hoe-voeg-ik-een-gdpr-avg-cookiebanner-toe-in-wordpress) · [Consent mode](/kennisbank/analytics-conversie-toegankelijkheid/consent-mode-en-cookiebanners-correct-koppelen) · [Privacy with forms](/kennisbank/webdesign-en-maatwerk/privacytekst-en-toestemming-bij-leadformulieren)."),
        q("gen-19", "Where can I find your news and updates?", "On the news page we publish updates about products, security and tips. For technical malfunctions, check the status page. Read more: [News](/nieuws) · [Statuspage](/statuspage)."),
        q("gen-20", "What does it cost to work with you?", "That depends on the mix: hosting and shopping products have fixed prices; design, SEO, ads and retainers follow after intake. In the shop you see packages; you will receive a proposal for customization. Read more: [Shop](/shop) · [Contact](/contact)."),
        q("gen-21", "Can you also only do consulting or auditing?", "Yes. Audits, AI scans, technical reviews and sparring sessions can be done separately from a full-service process. You can then do it yourself or let us take care of it. Read more: [AI scan](/ai-scan) · [Services](/diensten)."),
      ],
    },
    {
      id: "ai",
      title: "AI",
      items: [
        q("ai-1", "What is an AI scan at TripleZero iT?", "An AI readiness scan assesses how easy your site is to find for traditional search engines, AI answers and local or geographical search results (AEO, GEO, SEO and the technical basis). Read more: [What is the AI ​​scan?](/kennisbank/ai-scan/wat-is-de-ai-scan-van-triplezero-it-hosting) · [Start AI scan](/ai-scan)."),
        q("ai-2", "What exactly does the AI ​​scan measure?", "The scan measures, among other things, AEO signals, GEO/local findability, SEO fundamentals, content structure, performance indications and AI readiness. You will receive scores and concrete points for improvement. Read more: [Explain scores](/kennisbank/ai-scan/hoe-lees-ik-de-ai-scan-scores-aeo-geo-seo-performance-en-ai-readiness)."),
        q("ai-3", "How often should I do an AI scan?", "At least for major site changes or campaigns. For active brands, we recommend periodic scans, for example every quarter, so that you remain visible in search and AI results. Read more: [Start AI scan](/kennisbank/ai-scan/hoe-start-ik-een-ai-scan-op-mijn-website)."),
        q("ai-4", "Does AI only help with content?", "No. AI also affects technical findability, structured data, internal linking, FAQ blocks and the way brand information is summarized in AI answers."),
        q("ai-5", "Can you integrate AI into our workflow?", "Yes. We can use AI for content assistance, automation, chatbot or ticket flows, data connections and custom APIs around AI tools."),
        q("ai-6", "Will AI replace your strategic work?", "No. AI accelerates analysis and production, but strategy, brand tone and conversion decisions remain human and measurable."),
        q("ai-7", "Is AI content safe for SEO?", "Only with human review, unique insights and E-E-A-T. We avoid thin, generic texts that harm rankings."),
        q("ai-8", "What is AI readiness for my brand?", "That is the extent to which your site, content and data are designed in such a way that AI systems can quote, recommend and explain you correctly. Read more: [AI readiness in the scan](/kennisbank/ai-scan/hoe-lees-ik-de-ai-scan-scores-aeo-geo-seo-performance-en-ai-readiness)."),
        q("ai-9", "Can you deploy AI agents in the dashboard?", "Yes. In the customer portal you will see AI agents for SEO, content, social and ads, including status and tasks. Read more: [What are AI agents?](/kennisbank/ai-agents/wat-zijn-ai-agents-bij-triplezero-it-hosting) · [Agents in your account](/kennisbank/ai-agents/hoe-open-ik-het-ai-agents-overzicht-in-mijn-account)."),
        q("ai-10", "Do you work with ChatGPT, Claude or other tools?", "We choose tools per use case. Governance is important: sources, fact checking, brand guidelines and privacy, so that AI use remains reliable."),
        q("ai-11", "Does AI help with support tickets?", "Yes, for triaging and faster responses. We always escalate complex or sensitive cases to a human employee."),
        q("ai-12", "What does an AI process cost?", "This ranges from a free or entry-level AI scan to monthly AI and marketing retainers. After the intake you will receive a clear proposal."),
        q("ai-13", "How do I measure ROI from AI initiatives?", "Via KPIs such as traffic, leads, time saved, content output, ticket resolution and conversion. We measure this in advance in the plan, so that results remain visible."),
        q("ai-14", "How do I start an AI scan on my website?", "Go to the AI ​​scan, enter your URL and start the analysis. You get scores for AEO, GEO, SEO, performance and AI readiness plus points for improvement. Read more: [Start AI scan](/kennisbank/ai-scan/hoe-start-ik-een-ai-scan-op-mijn-website) · [AI scan page](/ai-scan)."),
        q("ai-15", "How do I read the AI ​​scan scores?", "Each score shows how strong you are in that area; low scores come with concrete tips. Use the scan as a priority list, not as a one-time “report card”. Read more: [Explain scores](/kennisbank/ai-scan/hoe-lees-ik-de-ai-scan-scores-aeo-geo-seo-performance-en-ai-readiness) · [Next steps](/kennisbank/ai-scan/welke-vervolgstappen-zet-ik-na-mijn-ai-scan)."),
        q("ai-16", "What is the difference between an AI scan and a complete AEO/GEO/SEO process?", "The scan is a quick diagnosis. A process implements improvements: content, structured data, technical SEO, local signals and measurement over time. Read more: [Scan versus process](/kennisbank/ai-scan/ai-scan-versus-een-volledig-aeo-geo-seo-traject-wat-is-het-verschil) · [Start SEO](/kennisbank/aeo-geo-seo/hoe-bestel-of-start-ik-seo-optimalisatie-via-triplezero-it-hosting)."),
        q("ai-17", "Where can I find previous AI scans in my account?", "Logged in customers see previous scans and analyzes in the dashboard (SEO analysis), so you can compare progress. Read more: [AI scan](/kennisbank/ai-scan/wat-is-de-ai-scan-van-triplezero-it-hosting) · [Account / dashboard](/dashboard)."),
        q("ai-18", "What do I do after a low AEO or GEO score?", "Prioritize FAQs, entities, structured data (AEO) and Google Business Profile / NAP / local landing pages (GEO). We help translate that roadmap into implementation. Read more: [Scores](/kennisbank/ai-scan/hoe-lees-ik-de-ai-scan-scores-aeo-geo-seo-performance-en-ai-readiness) · [Local Discoverability](/kennisbank/aeo-geo-seo/hoe-verbeter-ik-mijn-lokale-vindbaarheid-google-business-profile-en-nap)."),
        q("ai-19", "How do AI agents work in the customer portal?", "AI agents support tasks related to SEO, content, social or ads. You open the overview in your account, see status and can start or pause agents according to your package. Read more: [What are AI agents?](/kennisbank/ai-agents/wat-zijn-ai-agents-bij-triplezero-it-hosting) · [Open agents](/kennisbank/ai-agents/hoe-open-ik-het-ai-agents-overzicht-in-mijn-account)."),
        q("ai-20", "Is the AI ​​scan free?", "There is an accessible entry via the AI ​​scan page; deeper analyzes and processes fall under services or retainers. After the scan you will immediately see whether a follow-up is useful. Read more: [AI scan](/ai-scan) · [What is the AI ​​scan?](/kennisbank/ai-scan/wat-is-de-ai-scan-van-triplezero-it-hosting)."),
        q("ai-21", "Does Agent 000 also help with AI and SEO questions?", "Yes. Agent 000 uses FAQ and knowledge base to answer AEO/GEO/SEO and AI scan questions and links to the right articles or human follow-up. Read more: [Digital Assistant](/kennisbank/support/digitale-assistent-triplezero-it-hosting) · [FAQ](/faq)."),
      ],
    },
    {
      id: "aeo-geo-seo",
      title: "AEO, GEO and SEO",
      items: [
        q("seo-1", "What is the difference between AEO, GEO and SEO?", "AEO (Answer Engine Optimization) focuses on AI answers. GEO (Geographic Search Engine Optimization) strengthens local and regional findability in Maps, local packs and location-based search. SEO optimizes for classic search engines. Read more: [How AEO, GEO and SEO are related](/kennisbank/aeo-geo-seo/hoe-hangen-aeo-geo-en-seo-samen) · [What is AEO?](/kennisbank/aeo-geo-seo/wat-is-aeo-answer-engine-optimization)."),
        q("seo-2", "Why is AEO/GEO important now?", "More and more searchers are getting answers via AI and searching locally (“near me”). Without AEO you will miss AI citations; without GEO you miss local leads — even if classic SEO is good. Read more: [What is GEO?](/kennisbank/aeo-geo-seo/wat-is-geo-geographic-seo-en-voor-wie-is-het-relevant)."),
        q("seo-3", "How do you start an SEO process?", "We start with a technical audit, keyword and intent research, a content gap analysis and a priority roadmap that is linked to your business KPIs. Read more: [Start SEO](/kennisbank/aeo-geo-seo/hoe-bestel-of-start-ik-seo-optimalisatie-via-triplezero-it-hosting)."),
        q("seo-4", "How long does it take for SEO results to appear?", "Technical wins can be visible quickly. Organic growth usually builds over weeks to months depending on competition and how consistently we execute."),
        q("seo-5", "Do you also do local SEO?", "Yes. We are working on Google Business Profile, local landing pages, NAP consistency, reviews and local content clusters, so that you can be found better in the region. Read more: [Improve local discoverability](/kennisbank/aeo-geo-seo/hoe-verbeter-ik-mijn-lokale-vindbaarheid-google-business-profile-en-nap)."),
        q("seo-6", "What is technical SEO for you?", "Technical SEO covers crawlability, indexing, Core Web Vitals, structured data, sitemap and robots, canonicals, internal linking and debugging — everything search engines need to properly understand the site."),
        q("seo-7", "Do you help with content for SEO?", "Yes. We create briefings, outlines, blogs, landing pages and FAQs that match search intent and are structured in an AI-friendly manner."),
        q("seo-8", "What is E-E-A-T and why does it matter?", "E-E-A-T stands for Experience, Expertise, Authoritativeness and Trust. Strong E-E-A-T helps rankings and the credibility of your brand in AI summaries."),
        q("seo-9", "Do you do link building?", "Yes, ethical and relevant: digital PR, partnerships and content assets. We do not do spammy link schemes."),
        q("seo-10", "Can you repair existing SEO damage?", "Yes. We repair damage after updates, toxic links, indexation problems or content cannibalization, and then set a clean growth line."),
        q("seo-11", "How do you report SEO progress?", "Monthly or per sprint we report rankings, traffic, conversions, technical issues and next actions, so that it is clear what we have done and what will follow."),
        q("seo-12", "Does SEO work for ecommerce?", "Certainly. We optimize product and category SEO, faceted navigation, reviews, structured data and content hubs around purchasing intent."),
        q("seo-13", "Is SEO a one-time project or ongoing?", "The best results come from continuous optimization. One-off audits help, but competition does not stand still — that is why we continue to measure and adjust."),
        q("seo-14", "Do you help with international SEO?", "Yes. We arrange hreflang, market research by country or language, content localization and technical multi-local setups."),
        q("seo-15", "What exactly is AEO?", "AEO (Answer Engine Optimization) creates content so that AI answers and answer engines can correctly quote your brand: clear FAQs, entities and structured data. Read more: [What is AEO?](/kennisbank/aeo-geo-seo/wat-is-aeo-answer-engine-optimization) · [AEO, GEO and SEO](/kennisbank/aeo-geo-seo/hoe-hangen-aeo-geo-en-seo-samen)."),
        q("seo-16", "What is GEO (geographic SEO)?", "GEO strengthens local and regional discoverability — Maps, local packs and location-based search — through GBP, NAP consistency and local content. Read more: [What is GEO?](/kennisbank/aeo-geo-seo/wat-is-geo-geographic-seo-en-voor-wie-is-het-relevant) · [Local discoverability](/kennisbank/aeo-geo-seo/hoe-verbeter-ik-mijn-lokale-vindbaarheid-google-business-profile-en-nap)."),
        q("seo-17", "How do I order or start SEO optimization?", "Start with an AI scan or audit, then a proposal with priorities. You can also combine SEO with content and tech via shop/services or retainer. Read more: [Start SEO](/kennisbank/aeo-geo-seo/hoe-bestel-of-start-ik-seo-optimalisatie-via-triplezero-it-hosting) · [AI Scan](/ai-scan)."),
        q("seo-18", "Can you help with structured data and FAQ schedule?", "Yes. We create relevant diagrams (FAQ, Organization, LocalBusiness, products) and structure content so that search engines and AI understand you better. Read more: [AEO explanation](/kennisbank/aeo-geo-seo/wat-is-aeo-answer-engine-optimization) · [AI scan scores](/kennisbank/ai-scan/hoe-lees-ik-de-ai-scan-scores-aeo-geo-seo-performance-en-ai-readiness)."),
        q("seo-19", "What are you doing about Core Web Vitals?", "We measure LCP, INP and CLS, solve heavy assets, hosting/caching and theme problems, and link this to CDN where useful. Read more: [CDN](/kennisbank/cdn-performance-cloudflare/wat-een-cdn-doet-voor-je-website) · [Choose Hosting](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket)."),
        q("seo-20", "Can you combine SEO with hosting and WordPress care?", "Yes. Stable hosting, updates and performance form the basis; SEO builds on that. Many customers combine WP-care + hosting + ongoing SEO. Read more: [Hosting](/diensten/categorie/hosting) · [Start SEO](/kennisbank/aeo-geo-seo/hoe-bestel-of-start-ik-seo-optimalisatie-via-triplezero-it-hosting)."),
      ],
    },
    {
      id: "advertising",
      title: "Advertising",
      items: [
        q("ads-1", "Which advertising channels do you support?", "We support Google Ads, Meta (Facebook/Instagram), LinkedIn, and where relevant YouTube or retargeting — tailored to funnel and budget."),
        q("ads-2", "How do you determine the right advertising budget?", "We determine the budget based on goals (leads or sales), CAC target, market prices and a test phase. We start lean and scale what works."),
        q("ads-3", "What is your approach to Google Ads?", "We set up a clear account structure, map search intent, add negative keywords, check landing page fit, set up conversion tracking and optimize weekly."),
        q("ads-4", "Can you run Meta Ads for e-commerce?", "Yes. We run catalog and retargeting campaigns, test creatives and audiences, and make adjustments to improve ROAS."),
        q("ads-5", "How do you measure advertising success?", "We measure conversions, CPA/CAC, ROAS, lead quality and pipeline — not just clicks. This way we focus on results instead of volume."),
        q("ads-6", "What if tracking is wrong?", "Then we fix tagging (GTM, GA4 and pixels), consent mode where necessary, and server-side options for more reliable data."),
        q("ads-7", "Do you also do B2B LinkedIn Ads?", "Yes. We work with sharp targeting, lead gen forms or landing pages and content that appeals to decision-makers."),
        q("ads-8", "How quickly do I see results from ads?", "Traffic can enter directly. Stable CPA or ROAS usually requires 2 to 6 weeks of learning time and creative iteration."),
        q("ads-9", "Do you also make ads creatives?", "Yes. We create copy, visuals and test variants. We can include design and media creation, so that campaigns do not have to wait for creatives."),
        q("ads-10", "Can ads and SEO reinforce each other?", "Absolute. Search data from ads fuels SEO; strong organic pages reduce CPA and increase the Quality Score."),
        q("ads-11", "Do you manage existing ad accounts?", "Yes. We audit, restructure and optimize without unnecessarily starting over."),
        q("ads-12", "How do you prevent wasted ad budget?", "We prevent waste with negative keywords, audience exclusions, budget caps, geofencing, frequency control and quickly stopping underperformers."),
        q("ads-13", "Is remarketing still relevant?", "Yes, provided it is privacy-compliant and with strong creatives and offerings. It often remains the most efficient layer in the funnel."),
        q("ads-14", "Do you help with consent mode and cookie banners for ads?", "Yes. Without correct consent and tagging, ad measurement is unreliable. We neatly link banners, GTM/GA4 and pixels. Read more: [Consent mode](/kennisbank/analytics-conversie-toegankelijkheid/consent-mode-en-cookiebanners-correct-koppelen) · [Cookie banner WordPress](/kennisbank/wordpress/hoe-voeg-ik-een-gdpr-avg-cookiebanner-toe-in-wordpress)."),
        q("ads-15", "Can you build landing pages for campaigns?", "Yes — fast landing pages or WordPress pages tailored to search intent, with tracking and CRO basics. Read more: [Services](/diensten) · [Shop](/shop)."),
        q("ads-16", "How do you prevent wasted advertising budget?", "Tight account structure, negative keywords, audience exclusions, landing page fit and weekly optimization on CPA/ROAS — not just clicks."),
        q("ads-17", "Do ads work well with AEO/SEO?", "Yes. Ads deliver fast data and traffic; SEO/AEO build sustainable visibility. Insights from keywords and creatives fuel content and landing pages. Read more: [AEO, GEO and SEO](/kennisbank/aeo-geo-seo/hoe-hangen-aeo-geo-en-seo-samen)."),
      ],
    },
    {
      id: "design",
      title: "Design",
      items: [
        q("des-1", "What design services do you offer?", "We offer logos, brand identity, business cards, stationery, flyers, posters, stickers, magazines or brochures and digital visuals."),
        q("des-2", "What tools do you work in?", "We work in Adobe Photoshop, Illustrator and InDesign, so that files are printer-ready and professionally interchangeable."),
        q("des-3", "Do you supply print-ready files?", "Yes. We supply CMYK, bleed, cut marks and the correct PDF/X export where necessary, plus screen variants for digital use."),
        q("des-4", "How does a logo process work?", "A logo process runs from briefing to concepts, then feedback rounds, and ends with final vector files (SVG/PDF/AI) and basic guidelines."),
        q("des-5", "Can you update our existing brand?", "Yes. We refresh logo, color, typography and applications without breaking recognition."),
        q("des-6", "Do you also make social templates?", "Yes. We create consistent templates for posts, stories and ads, so that your team can publish quickly and recognisably."),
        q("des-7", "What is the difference between digital and print design?", "Print requires color space, resolution and cutting margins; digital requires sharpness on screens and fast loading times. We deliver both correctly, tailored to the channel."),
        q("des-8", "Can you create magazines or brochures?", "Yes. We create multi-page layouts in InDesign with grid, styles and prepress checks, ready for print or digital distribution."),
        q("des-9", "Do you help with printing?", "Yes. We design and can print in small or large quantities — from business cards and stickers to flyers, posters and brochures — with proofs and coordination until delivery."),
        q("des-10", "How many feedback rounds are there?", "Usually there are 2 to 3 structured rounds. Additional rounds are possible in consultation."),
        q("des-11", "Do we get source files?", "Yes, within the agreed delivery time. This could be AI, PSD or INDD, or an export pack — depending on what we have agreed."),
        q("des-12", "Can design and web design run together?", "Yes. We coordinate brand design and UI systems so that print and website form one whole."),
        q("des-13", "Where can I find more about Design?", "More information can be found at /design (all design services) and /graphic-design for Graphic Design."),
        q("des-14", "Do you also supply design systems and component libraries?", "Yes, for brands that want to scale consistently: tokens, components and documentation so that marketing and product speak the same language."),
        q("des-15", "Can you digitize existing brand style?", "Yes. We translate print or incomplete brand guidelines into web-ready colors, typography, UI kit and templates."),
        q("des-16", "Do you do UX research or just visual design?", "Both. Where necessary, we start with interviews, funnel analysis or heat maps; then UI. This way we design based on behavior, not just on taste."),
        q("des-17", "Can you design social templates and ad creatives?", "Yes — carousels, thumbnails, stories and adsets that match your brand and campaign goals. Read more: [Services](/diensten)."),
      ],
    },
    {
      id: "marketing",
      title: "Marketing",
      items: [
        q("mkt-1", "What marketing services do you offer?", "We offer AEO/GEO/SEO, content, social, ads, e-commerce growth, product listing, community management and data entry."),
        q("mkt-2", "How do you create a marketing strategy?", "We build a strategy around goals, audience, positioning, channel mix, content pipeline and KPIs — pragmatic and actionable, not just on paper."),
        q("mkt-3", "What is full-funnel marketing for you?", "Full-funnel runs from awareness (content and ads) via consideration (cases and SEO) to conversion (landing pages and CRM) and then retention, so that each stage has a clear role."),
        q("mkt-4", "Do you help with positioning?", "Yes. Clear positioning prevents fragmented campaigns and weak conversion."),
        q("mkt-5", "Can you provide content writing?", "Yes. We write blogs, website copy, newsletters, landing pages and sales copy — SEO and conversion-oriented."),
        q("mkt-6", "Do you do e-commerce marketing?", "Yes. We work on product feeds, listing quality, CRO, ads and SEO for categories and products."),
        q("mkt-7", "What is CRO?", "CRO is Conversion Rate Optimization: improving pages, funnels and UX so that more visitors convert."),
        q("mkt-8", "How do you report marketing results?", "We report via dashboards or reports with traffic, leads, sales, CPA/ROAS and learnings per channel, including what we do next."),
        q("mkt-9", "Do you work with our internal marketing team?", "Yes. We can implement, sparring or take over a specialist part, for example only SEO or only ads."),
        q("mkt-10", "How quickly do your campaigns start?", "After tracking and setup, campaigns often go live within 1 to 2 weeks. Content processes run parallel to this, so that creatives and pages are ready on time."),
        q("mkt-11", "Do you help with email marketing?", "Yes. We create flows, newsletters and copy. Integration with CRM or e-commerce is possible."),
        q("mkt-12", "Is marketing a monthly contract?", "Retainers are common for continued growth. Projects such as an audit, redesign or launch can be done once."),
        q("mkt-13", "How do you prevent “busy marketing” without results?", "Every activity is linked to KPIs. We stop underperforming tactics or improve them with data, so that the budget goes to what works."),
        q("mkt-14", "What is typically included in a marketing retainer?", "A mix of strategy, content or SEO, campaigns, reporting and experiments — tailored to KPIs. We record the scope and hours so that priorities remain clear. Read more: [Shop](/shop) · [Contact](/contact)."),
        q("mkt-15", "Do you help with positioning and messaging?", "Yes. Clear positioning, value props and page copy ensure that ads, SEO and sales convey the same message."),
        q("mkt-16", "Do you measure marketing by pipeline, not just traffic?", "Where possible: leads, SQLs, revenue or assisted conversions. We adjust or stop traffic without quality."),
        q("mkt-17", "Can you clean up marketing stack and tracking?", "Yes — GTM, GA4, pixels, CRM links and consent. Clean data is the basis for good decisions. Read more: [Consent mode](/kennisbank/analytics-conversie-toegankelijkheid/consent-mode-en-cookiebanners-correct-koppelen)."),
      ],
    },
    {
      id: "social-media",
      title: "Social Media",
      items: [
        q("soc-1", "Which social channels do you manage?", "We mainly manage LinkedIn, Instagram and Facebook, and where relevant X or TikTok — based on audience, not hype."),
        q("soc-2", "What is included in social media management?", "Social media management includes strategy, content calendar, creation and scheduling, community replies, reporting and ongoing optimization."),
        q("soc-3", "Do you also make the visuals and videos?", "Yes, via media creation: still images, carousels, short-form video and templates."),
        q("soc-4", "How often do you post?", "That depends on channel and goals. Typically we post 3 to 5 times per week per core channel, with quality over volume."),
        q("soc-5", "Do you help with community management?", "Yes. We do moderation, responses, DMs and reputation care according to the agreed tone of voice."),
        q("soc-6", "Can social and ads be combined?", "Yes. Organic content fuels ads creatives; ads scale what resonates organically."),
        q("soc-7", "How do you measure social success?", "We measure reach, engagement, click-outs, leads and assisted conversions — not just likes. This way we see what really contributes to growth."),
        q("soc-8", "Do you work with influencers?", "On request: selection, briefing and tracking. We focus on fit and measurable outcomes, not on reach alone."),
        q("soc-9", "Can you support crisis communication?", "Yes. We work with rapid response protocols and coordinate with your team so that responses remain consistent and under control."),
        q("soc-10", "Do you help LinkedIn for B2B thought leadership?", "Yes. We create personal and company content, carousels, cases and employee advocacy, so that expertise becomes visible."),
        q("soc-11", "Do you provide a content calendar?", "Yes. We provide a monthly or quarterly planning with themes, formats and deadlines."),
        q("soc-12", "What if we already have a social manager?", "We can then specialize in creatives, ads or strategy, or support peak periods without replacing the existing team."),
        q("soc-13", "How quickly do we see growth on social?", "Consistency counts. Significant growth usually takes weeks to months; with ads support it is often faster."),
        q("soc-14", "Do you help with social proof and reviews?", "Yes. We plan review requests, cases and UGC-like formats that build trust — without fake engagement."),
        q("soc-15", "Can you set up employee advocacy?", "Yes, especially on LinkedIn: simple guidelines, templates and a rhythm so that the team visibly shares expertise."),
        q("soc-16", "How do you link social to the website and shop?", "Via UTMs, landing pages, product links and retargeting. Social is a channel in the funnel, not an island. Read more: [Shop](/shop)."),
      ],
    },
    {
      id: "account-portaal",
      title: "Account and portal",
      items: [
        q("acc-1", "How do I log in to the customer portal?", "Go to account/login and use the email address of your customer account. If you have lost data, use password reset or contact us. Read more: [Account](/dashboard) · [Lost login](/kennisbank/crm-klantenpanel/logingegevens-klantenpanel-kwijt)."),
        q("acc-2", "What do I see in my dashboard?", "Depending on your services: tickets, projects, invoices, AI scan/agents and quick links to support. Read more: [AI agents in account](/kennisbank/ai-agents/hoe-open-ik-het-ai-agents-overzicht-in-mijn-account) · [Create ticket](/kennisbank/support/hoe-maak-ik-een-support-ticket-aan-in-het-klantenpanel)."),
        q("acc-3", "I have lost my login details — what now?", "Use “forgot your password” or follow the knowledge base steps for the customer panel. If that doesn't work, open a ticket via a known contact address. Read more: [Lost login details](/kennisbank/crm-klantenpanel/logingegevens-klantenpanel-kwijt)."),
        q("acc-4", "How do I open a ticket from the portal?", "In the customer panel, choose support/tickets, describe your problem and add evidence (URL, screenshots). Read more: [Create ticket](/kennisbank/support/hoe-maak-ik-een-support-ticket-aan-in-het-klantenpanel) · [Ticket via panel](/kennisbank/support/hoe-stel-ik-een-ticket-in-voor-support-via-het-klantenpanel)."),
        q("acc-5", "Where can I find my invoices?", "You can view and download invoices in the portal under invoicing/billing. Read more: [Consult invoices](/kennisbank/crm-klantenpanel/hoe-download-of-raadpleeg-ik-factuurdetails)."),
        q("acc-6", "How do I change billing information or payment method?", "Adjust company name, VAT number and payment method in your account settings so that new invoices are correct. Read more: [Change invoice details](/kennisbank/crm-klantenpanel/hoe-wijzig-ik-mijn-factuurgegevens-en-betaalmethode)."),
        q("acc-7", "Can colleagues also have access?", "Yes, with account roles (client, manager, admin) so multiple team members can track tickets or projects without sharing everything."),
        q("acc-8", "Are AI scan and AI agents linked to my account?", "Yes. Scans and agents belong to your customer account so that history and rights are retained. Read more: [AI agents](/kennisbank/ai-agents/wat-zijn-ai-agents-bij-triplezero-it-hosting) · [AI scan](/kennisbank/ai-scan/wat-is-de-ai-scan-van-triplezero-it-hosting)."),
        q("acc-9", "How secure is my customer account?", "Use unique passwords and 2FA where available (including on hosting panels). Don't share sessions on shared computers. Read more: [2FA DirectAdmin](/kennisbank/directadmin/2fa-instellen-in-directadmin)."),
        q("acc-10", "Can I track project status and deliverables?", "Where projects are listed in the portal, you can see status and communication. Otherwise, we will keep you informed via tickets or sprint updates."),
        q("acc-11", "How do I link services from the shop to my account?", "After checkout, orders belong to your account; provisioning (hosting, domain) follows automatically or via onboarding by support. Read more: [Shop](/shop)."),
        q("acc-12", "Where do I set notifications or preferences?", "In account settings you manage profile and where available notification preferences. For invoice emails, keep your email address current."),
      ],
    },
    {
      id: "shop-bestellen",
      title: "Shop and ordering",
      items: [
        q("shop-1", "What can I order in the shop?", "Hosting packages, domains, care/support products and other services that we offer online. Customized quotes are made via contact. Read more: [Shop](/shop) · [Hosting](/diensten/categorie/hosting)."),
        q("shop-2", "How does the shopping cart and checkout work?", "Add products, check period (month/year) and complete via checkout. You will then receive confirmation and access to your account. Read more: [Shopping cart](/shop/cart)."),
        q("shop-3", "Are prices inclusive or exclusive of VAT?", "In the shop we show prices according to the VAT context shown (often incl. for consumer flows). The invoice contains a net VAT breakdown for business customers."),
        q("shop-4", "Can I pay monthly or annually?", "Many hosting and care products have monthly and annual options. Annually is often cheaper; details are per product card."),
        q("shop-5", "Which payment methods do you accept?", "Common online methods via checkout (depending on region). For enterprise invoices we can arrange invoicing on account via contact."),
        q("shop-6", "Do I get immediate access after payment?", "For standard hosting/domain products, provisioning follows quickly after successful payment. For custom services, support plans the kick-off."),
        q("shop-7", "Can I upgrade packages later?", "Yes. From shared to cloud/VPS or from Basic to Plus/Business is possible with migration planning. Read more: [Shared to VPS](/kennisbank/hosting/wanneer-stap-ik-over-van-shared-naar-vps) · [Choose package](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket)."),
        q("shop-8", "How do I combine shop products with customization?", "Order hosting/care online and plan design, SEO or ads via intake. We bundle invoicing and account where possible. Read more: [Contact](/contact)."),
        q("shop-9", "What if my order does not arrive or is stuck?", "Check your email (including spam) and the portal. If it remains silent, open a ticket or email support with order number. Read more: [Contact](/contact) · [Tickets](/kennisbank/support/hoe-maak-ik-een-support-ticket-aan-in-het-klantenpanel)."),
        q("shop-10", "Can I order a domain and hosting in one order?", "Yes, that's the usual flow: domain + hosting in the shopping cart, then DNS connection. Read more: [Domains](/domeinen) · [Shop](/shop)."),
        q("shop-11", "Are there packages for WordPress Care?", "Yes. Care packages cover updates, monitoring and maintenance — separately or in addition to hosting. Read more: [Shop](/shop)."),
        q("shop-12", "How do I cancel or change an order?", "Immediately after ordering via support; After that, cancellation and change conditions apply per product. We help migration or export if you stop. Read more: [Contact](/contact)."),
      ],
    },
    {
      id: "support",
      title: "Support",
      items: [
        q("sup-1", "What support do you offer?", "We offer WordPress management, custom website support, tickets and live chat, maintenance, security, performance and incident response. Read more: [Contact support](/kennisbank/support/hoe-neem-ik-contact-op-met-de-support-van-triplezero-it-hosting) · [Chat, ticket or call appointment](/kennisbank/support/chat-versus-ticket-versus-belafspraak-wat-kies-ik-wanneer)."),
        q("sup-2", "How do I reach support?", "Via contact, an appointment, tickets in the dashboard or live chat on the site. We mark emergency cases as priorities. Read more: [Contact](/contact) · [Create ticket](/kennisbank/support/hoe-maak-ik-een-support-ticket-aan-in-het-klantenpanel) · [Call appointment](/kennisbank/support/hoe-werkt-de-belafspraak-bij-triplezero-it-hosting)."),
        q("sup-3", "What is your response time?", "We aim for a quick initial response, often within one working day. We respond faster in critical downtime. The exact SLAs are stated in the support packages."),
        q("sup-4", "Do you offer 24/7 monitoring?", "Yes, in relevant support and hosting packages: monitoring, backups and alerts, so that problems are visible earlier. Read more: [Downtime backups](/kennisbank/support/mijn-site-doet-het-niet-meer-hebben-jullie-een-backup)."),
        q("sup-5", "Can you remove malware?", "Yes — both on WordPress and on custom stacks — including hardening and aftercare, so that the site comes back clean and better protected."),
        q("sup-6", "Do you do WordPress updates for us?", "Yes, via “Maintenance and updates”: core, plugins and themes, with backup and checks before and after we update. Read more: [Site down after WP update](/kennisbank/hosting/website-down-na-update-wordpress)."),
        q("sup-7", "Do you help with hosting problems?", "Yes. We diagnose, migrate or optimize hosting, VPS and domains until the site is running stable again. Read more: [Move website or email](/kennisbank/hosting/website-of-e-mail-verhuizen-regelen-wij-voor-je)."),
        q("sup-8", "What if my site is down?", "Report it as an emergency. We restore where possible via backups, server checks and a hotfix, and keep you informed of the status in the meantime. Read more: [Backups](/kennisbank/support/mijn-site-doet-het-niet-meer-hebben-jullie-een-backup) · [Check yourself before support](/kennisbank/support/wat-kan-ik-zelf-doen-voordat-ik-contact-opneem-met-support)."),
        q("sup-9", "Is there a customer portal?", "Yes. Logged in customers see dashboard, tickets, projects and where relevant CRM or invoices. Read more: [Ticket via customer panel](/kennisbank/support/hoe-stel-ik-een-ticket-in-voor-support-via-het-klantenpanel) · [Lost login?](/kennisbank/crm-klantenpanel/logingegevens-klantenpanel-kwijt)."),
        q("sup-10", "Can multiple team members open tickets?", "Yes, depending on the account roles (client, manager or admin)."),
        q("sup-11", "What is included in Basic/Standard/Premium support?", "Higher packages cover more sites, faster follow-up and broader coverage (updates, malware, speed, SEO). The details are on the support pages."),
        q("sup-12", "Do you also help with non-technical questions?", "Yes, about services, billing and account. How far we go technically depends on your package."),
        q("sup-13", "Can I upgrade support later?", "Yes. You can scale up as traffic, risk or team needs grow."),
        q("sup-14", "What is the difference between chat, ticket and call appointment?", "Chat is fast for short questions; tickets are better for technical cases with logs and follow-up; a telephone appointment is suitable for an intake or complex explanation. Read more: [Chat versus ticket versus call appointment](/kennisbank/support/chat-versus-ticket-versus-belafspraak-wat-kies-ik-wanneer)."),
        q("sup-15", "How do I create a support ticket?", "Log in to the customer panel and open a ticket with clear URL, steps and screenshots. The better the information, the faster we can help. Read more: [Create ticket](/kennisbank/support/hoe-maak-ik-een-support-ticket-aan-in-het-klantenpanel) · [Ticket via panel](/kennisbank/support/hoe-stel-ik-een-ticket-in-voor-support-via-het-klantenpanel)."),
        q("sup-16", "Do you have backups if my site goes down?", "Yes, depending on your hosting or support package. In the event of downtime, we restore from backups where possible and investigate the cause. Read more: [Downtime backups](/kennisbank/support/mijn-site-doet-het-niet-meer-hebben-jullie-een-backup) · [JetBackup](/kennisbank/directadmin/wat-is-jetbackup-en-waar-gebruik-ik-het-voor)."),
        q("sup-17", "What can I check myself before calling support?", "Check status page, DNS propagation, recent updates, disk space and whether the error is reproducible. That speeds up the diagnosis. Read more: [Do it yourself before support](/kennisbank/support/wat-kan-ik-zelf-doen-voordat-ik-contact-opneem-met-support) · [Statuspage](/statuspage)."),
        q("sup-18", "How does live chat work on the site?", "Open live chat via the chat button. Agent 000 first helps with FAQ/knowledge base; For more complex or urgent matters, we refer you to an employee. Read more: [Digital Assistant](/kennisbank/support/digitale-assistent-triplezero-it-hosting) · [Contact](/contact)."),
        q("sup-19", "Can you help with a critical WordPress error?", "Yes. We diagnose white screens, critical PHP errors and plugin conflicts, with backup and targeted fix. Read more: [Critical Error WordPress](/kennisbank/wordpress/kritieke-fout-wordpress) · [Down after update](/kennisbank/hosting/website-down-na-update-wordpress)."),
        q("sup-20", "Can you watch remotely (TeamViewer, etc.)?", "Where necessary and with permission, for desktop or panel problems. For most hosting matters, access to panel, DNS or WordPress is sufficient. Read more: [Contact support](/kennisbank/support/hoe-neem-ik-contact-op-met-de-support-van-triplezero-it-hosting)."),
        q("sup-21", "How do I cancel a subscription or service?", "You can cancel via the customer panel or support; pay attention to notice periods in your agreement. We help you complete data/export and DNS transfer neatly. Read more: [Contact](/contact) · [Account](/dashboard)."),
        q("sup-22", "Do you offer WordPress Care / maintenance packages?", "Yes. Updates, backups, security checks and performance are included in care packages — ideal in addition to hosting. Read more: [Shop](/shop) · [Install WordPress](/kennisbank/wordpress/handleiding-wordpress-installeren)."),
        q("sup-23", "What if email suddenly stops working?", "Check DNS (MX/SPF/DKIM/DMARC), mailbox quota and whether Microsoft or providers are blocking mail. We help measure the chain. Read more: [Email Problems](/kennisbank/hosting/problemen-met-e-mail-website) · [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam)."),
      ],
    },
    {
      id: "webdesign",
      title: "Web design",
      items: [
        q("web-1", "Do you only build WordPress sites?", "No. In addition to WordPress, we do custom web design in HTML/CSS/JS, PHP and Next.js — separate from the WordPress services. Read more: [Install WordPress](/kennisbank/wordpress/handleiding-wordpress-installeren) · [Services](/diensten)."),
        q("web-2", "What does Website Support entail?", "Website Support covers design, development, maintenance, security, performance, backups or migration and API integrations for custom stacks."),
        q("web-3", "Can you redesign an existing site?", "Yes. We do a UX/UI refresh, conversion improvement and technical modernization, without throwing everything away if not necessary."),
        q("web-4", "Do you work with Next.js?", "Yes. Next.js is ideal for fast, SEO-ready marketing sites and dashboards."),
        q("web-5", "Do you also do PHP applications?", "Yes. We build portals and APIs, modernize legacy and harden performance and security."),
        q("web-6", "How do you ensure mobile websites?", "We design mobile-first, build responsive layouts and test on common devices and browsers, so that the site works well everywhere."),
        q("web-7", "Is accessibility (a11y) included?", "We build with accessible basic practices. We can include stricter WCAG processes as an additional scope."),
        q("web-8", "Can you offer CMS options without WordPress?", "Yes. This can be a headless CMS, custom admin or a static setup — depending on your team and wishes."),
        q("web-9", "How long does a web design process take?", "Landing pages usually take several weeks; larger sites or apps run in sprints over several weeks. The planning follows after the intake."),
        q("web-10", "Do you also arrange copy and SEO at launch?", "Yes, in combination with content and SEO services, so that the site goes live immediately in a searchable and conversion-oriented manner."),
        q("web-11", "What about performance after launch?", "We optimize Core Web Vitals, caching or CDN and monitoring. Aftercare then runs through maintenance packages. Read more: [What does a CDN do?](/kennisbank/cdn-performance-cloudflare/wat-een-cdn-doet-voor-je-website)."),
        q("web-12", "Can you connect APIs (CRM, payments, AI)?", "Yes. We build integrations with clean error handling, logging and documentation."),
        q("web-13", "How do you deliver code?", "Where possible we deliver via repository and deploy pipeline, with environments (staging and production) and a clear handover."),
        q("web-14", "Do you help with conversion optimization on the site?", "Yes. We do A/B testing, UX improvements, forms, CTAs and page speed, so that more visitors convert."),
        q("web-15", "Do you also build web shops?", "Yes, from marketing sites with checkout integrations to e-commerce on WordPress or customization. We coordinate scope, payments and fulfillment during the intake. Read more: [Services](/diensten) · [Shop](/shop)."),
        q("web-16", "How do you deal with privacy texts on sites?", "We advise and implement privacy and consent flows for forms and banners, tailored to your lawyer where necessary. Read more: [Privacy with forms](/kennisbank/webdesign-en-maatwerk/privacytekst-en-toestemming-bij-leadformulieren) · [Cookie banner](/kennisbank/wordpress/hoe-voeg-ik-een-gdpr-avg-cookiebanner-toe-in-wordpress)."),
        q("web-17", "Do you provide staging environments?", "Yes, where relevant: staging for reviews and tests, then controlled deployment to production."),
        q("web-18", "Can you take over and improve an existing WordPress site?", "Yes — audit, updates, security, speed, UX and SEO, without unnecessarily building from scratch. Read more: [WP move](/kennisbank/domeinnamen/wordpress-website-verhuizen) · [Critical errors](/kennisbank/wordpress/kritieke-fout-wordpress)."),
        q("web-19", "What about HTTP to HTTPS after delivery?", "Sites default to HTTPS. During migrations we force HTTPS and resolve mixed content. Read more: [HTTP to HTTPS in WordPress](/kennisbank/wordpress/wordpress-url-omzetten-van-http-naar-https) · [SSL](/kennisbank/beveiliging/wat-is-ssl-en-waarom-heb-je-het-nodig)."),
      ],
    },
    {
      id: "domeinen",
      title: "Domains",
      items: [
        q("dom-1", "What is a domain name?", "A domain name is the address visitors use to find your website (for example example.com). It ties into DNS records that point to your hosting or email. Read more: [Domain registration](/kennisbank/domeinnamen/domeinnaamregistratie) · [Order domains](/domeinen)."),
        q("dom-2", "How do I register a domain name with you?", "Search the name on the domains page, pick an extension and complete checkout in the shop. After registration you manage DNS, nameservers and invoices in your account. Read more: [Domains](/domeinen) · [Registration guide](/kennisbank/domeinnamen/domeinnaamregistratie) · [Shop](/shop)."),
        q("dom-3", "Can I transfer my domain to you?", "Yes. Request an authorisation (EPP) code from your current registrar, unlock any transfer lock, then start the transfer with us. After that we set DNS and nameservers correctly. Read more: [Transfer a domain](/kennisbank/domeinnamen/domeinnaam-verhuizen) · [Authorisation code](/kennisbank/domeinnamen/wat-is-een-autorisatiecode) · [Domains](/domeinen)."),
        q("dom-4", "What is an authorisation code (EPP/Auth code)?", "It is a one-time code from your current registrar that securely starts a domain transfer. Without a valid code the transfer cannot proceed. Read more: [What is an authorisation code?](/kennisbank/domeinnamen/wat-is-een-autorisatiecode) · [Transfer a domain](/kennisbank/domeinnamen/domeinnaam-verhuizen)."),
        q("dom-5", "What is a transfer lock or registrar lock?", "A lock prevents unwanted transfers. For a move you often need to turn it off at the current provider first, then start the transfer with us. Read more: [Transfer a domain](/kennisbank/domeinnamen/domeinnaam-verhuizen) · [Support](/contact)."),
        q("dom-6", "Can I buy a domain without hosting?", "Yes. You can register or transfer only a domain and add hosting or email later. You can already manage or forward DNS in the meantime. Read more: [Domain without hosting](/kennisbank/domeinnamen/domeinnaam-kopen-zonder-hosting) · [Domains](/domeinen)."),
        q("dom-7", "Which extensions (.nl, .com, …) can I register?", "We support common TLDs such as .nl and .com plus many international extensions. Availability and price show instantly in the domain search. Read more: [Domains](/domeinen) · [Registration](/kennisbank/domeinnamen/domeinnaamregistratie)."),
        q("dom-8", "How do I renew my domain name?", "Renewal runs through invoices and your client portal; automatic renewal is often available. Keep payment details up to date to avoid expiry. Read more: [Invoices](/kennisbank/crm-klantenpanel/hoe-download-of-raadpleeg-ik-factuurdetails) · [Billing details](/kennisbank/crm-klantenpanel/hoe-wijzig-ik-mijn-factuurgegevens-en-betaalmethode)."),
        q("dom-9", "What are premium domain names?", "Premium names are short or popular domains with a higher purchase price, often via an aftermarket. Availability and terms differ by extension. Read more: [Premium domains](/kennisbank/domeinnamen/premium-domeinnamen) · [Domains](/domeinen)."),
        q("dom-10", "Can I register my domain anonymously (Protect ID)?", "Where the registry allows it, you can consider privacy/Protect ID. Rules differ by extension — .nl, for example, has its own framework. Read more: [Protect ID](/kennisbank/domeinnamen/protect-id-domein-anoniem-registreren)."),
        q("dom-11", "My domain is in quarantine — what now?", "After deletion a domain can enter quarantine. Depending on the registry you can often reactivate it for a fee; do not wait too long. Read more: [Domain out of quarantine](/kennisbank/domeinnamen/domein-quarantaine-halen) · [Contact](/contact)."),
        q("dom-12", "My new domain name does not work yet — what now?", "Usually it is DNS propagation, missing A/MX records, or nameservers that are not updated yet. Check records and allow TTLs to expire. Read more: [New domain not working](/kennisbank/domeinnamen/mijn-nieuwe-domeinnaam-werkt-niet) · [Manage DNS](/kennisbank/domeinnamen/dns-records-beheren)."),
        q("dom-13", "How do I connect a domain to my hosting plan?", "Add the domain in your panel or account and point DNS (A record or nameservers) to the hosting. We help with the first connection after order. Read more: [Connect domain to plan](/kennisbank/domeinnamen/domeinnaam-koppelen-aan-een-pakket) · [Manage DNS](/kennisbank/domeinnamen/dns-records-beheren)."),
        q("dom-14", "Can I forward a domain?", "Yes. Domain forwarding sends visitors to another URL — useful for brand names without a separate site. We align DNS and redirects with your setup. Read more: [Forward a domain](/kennisbank/domeinnamen/domeinnaam-doorsturen) · [Domains](/domeinen)."),
        q("dom-15", "How do I change nameservers for my domain?", "In DNS/domain management you choose our nameservers or external ones (for example a CDN). Propagation can take hours up to a day. Read more: [Manage nameservers](/kennisbank/domeinnamen/nameservers-beheren) · [Manage DNS](/kennisbank/domeinnamen/dns-records-beheren)."),
        q("dom-16", "What does a domain name cost?", "Prices differ by extension and period; the domain search shows current registration and renewal prices. Premium names have a separate price. Read more: [Domains](/domeinen) · [Shop](/shop)."),
        q("dom-17", "Do hosting and domain need to be with the same provider?", "No, but it is simpler: DNS, SSL, email and support then sit with one party. You can also keep only DNS with us and host elsewhere. Read more: [Domain without hosting](/kennisbank/domeinnamen/domeinnaam-kopen-zonder-hosting) · [Hosting](/diensten/categorie/hosting)."),
        q("dom-18", "Can I manage multiple domains on one account?", "Yes. Extra domains can be registered or transferred and linked as addon, parked or forwarded — within your hosting plan limits. Read more: [Domains](/domeinen) · [Choose a hosting plan](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket)."),
        q("dom-19", "What happens if my domain expires?", "After expiry there is often a grace or quarantine period where recovery is still possible; afterwards someone else may claim it. Renew on time via invoices. Read more: [Quarantine](/kennisbank/domeinnamen/domein-quarantaine-halen) · [Contact](/contact)."),
        q("dom-20", "Where do I order or manage domains?", "Register and transfer via the domains page or shop; management (DNS, invoices, renewal) lives in the client portal. Read more: [Domains](/domeinen) · [Shop](/shop) · [Account](/dashboard)."),
      ],
    },
    {
      id: "webhosting",
      title: "Web hosting",
      items: [
        q("host-1", "Which hosting do you offer?", "We offer shared hosting, cloud hosting, WordPress hosting and VPS — plus domain registration. Choose based on traffic, stack and growth. Read more: [Shared hosting](/diensten/shared-hosting) · [Cloud hosting](/diensten/cloud-hosting) · [WordPress hosting](/diensten/wordpress-hosting) · [VPS](/diensten/vps-hosting)."),
        q("host-2", "What is the difference between shared, cloud, WordPress and VPS?", "Shared is cost-effective for smaller sites. Cloud gives more resources and scalability, fully managed. WordPress hosting is optimised for WP. VPS gives more control for heavier loads. Read more: [Differences explained](/kennisbank/hosting/hoe-kies-ik-tussen-shared-hosting-wordpress-hosting-en-vps) · [Shared plans](/kennisbank/hosting/wat-is-shared-hosting-basic-plus-en-business) · [VPS plans](/kennisbank/hosting/wat-is-vps-hosting-basic-plus-en-business)."),
        q("host-3", "What is cloud hosting with you?", "Cloud hosting gives more resources and scalability than classic shared, while we keep managing it. Ideal when shared gets tight but full VPS is not needed yet. Read more: [Cloud hosting](/diensten/cloud-hosting) · [Choose hosting](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket)."),
        q("host-4", "Is SSL included with hosting?", "Yes. SSL is standard in our relevant hosting plans so sites run on HTTPS. Read more: [What is SSL?](/kennisbank/beveiliging/wat-is-ssl-en-waarom-heb-je-het-nodig) · [Install Let's Encrypt](/kennisbank/hosting/hoe-installeer-ik-een-gratis-lets-encrypt-ssl-certificaat)."),
        q("host-5", "Can you migrate my site to your hosting?", "Yes. We handle backup, migration, DNS cutover, SSL and smoke tests, with minimal downtime. Read more: [Migrate website or email](/kennisbank/hosting/website-of-e-mail-verhuizen-regelen-wij-voor-je) · [Migrate WordPress](/kennisbank/domeinnamen/wordpress-website-verhuizen)."),
        q("host-6", "How do backups work on hosting?", "That depends on the plan: simple or automated backups. Extra off-site retention is available. Read more: [JetBackup](/kennisbank/directadmin/wat-is-jetbackup-en-waar-gebruik-ik-het-voor) · [Backup in DirectAdmin](/kennisbank/directadmin/backup-maken-en-terugzetten-directadmin)."),
        q("host-7", "What if I get more traffic?", "Then we scale to Plus, Business, cloud or VPS and optimise caching and CDN so the site can handle growth. Read more: [When to move to VPS?](/kennisbank/hosting/wanneer-stap-ik-over-van-shared-naar-vps) · [CDN](/kennisbank/cdn-performance-cloudflare/wat-een-cdn-doet-voor-je-website)."),
        q("host-8", "How secure is your hosting?", "We use firewall, SSL, updates, monitoring and hardening. Extra security layers are available where needed. Read more: [SSL](/kennisbank/beveiliging/wat-is-ssl-en-waarom-heb-je-het-nodig) · [2FA in DirectAdmin](/kennisbank/directadmin/2fa-instellen-in-directadmin)."),
        q("host-9", "Can I move from shared to VPS later?", "Yes. We plan the migration together, including tests and rollback, so the switch stays controlled. Read more: [Shared to VPS](/kennisbank/hosting/wanneer-stap-ik-over-van-shared-naar-vps) · [VPS hosting](/diensten/vps-hosting)."),
        q("host-10", "Do you support CDN?", "Yes, where relevant — often a free CDN is included in WP hosting plans — for faster global delivery. Read more: [What does a CDN do?](/kennisbank/cdn-performance-cloudflare/wat-een-cdn-doet-voor-je-website) · [WordPress hosting](/diensten/wordpress-hosting)."),
        q("host-11", "What is your uptime approach?", "We monitor, respond quickly to incidents and communicate clearly around maintenance windows so you know what is happening. Status updates are on the status page. Read more: [Status page](/statuspage) · [Contact](/contact)."),
        q("host-12", "How do I choose the right hosting plan?", "Based on traffic, stack (WordPress or custom), resources and growth. We advise honestly — we do not oversell. Read more: [Choose the right hosting plan](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket) · [Shared vs WP vs VPS](/kennisbank/hosting/hoe-kies-ik-tussen-shared-hosting-wordpress-hosting-en-vps)."),
        q("host-13", "Where can I see hosting prices?", "On the hosting service pages and in the shop, with monthly or yearly options where applicable. Read more: [Shared](/diensten/shared-hosting) · [Cloud](/diensten/cloud-hosting) · [WordPress](/diensten/wordpress-hosting) · [VPS](/diensten/vps-hosting) · [Shop](/shop)."),
        q("host-14", "Do I get SSH access on my hosting?", "That depends on the plan. On many plans SSH is available or can be requested; on VPS you typically get full access. Read more: [SSH access](/kennisbank/hosting/heb-ik-ssh-toegang-op-mijn-hosting) · [VPS](/diensten/vps-hosting)."),
        q("host-15", "How do I install WordPress on your hosting?", "Via the control panel (for example DirectAdmin/Installatron) or manually. We have a step-by-step guide. Read more: [Install WordPress](/kennisbank/wordpress/handleiding-wordpress-installeren) · [WordPress hosting](/diensten/wordpress-hosting)."),
        q("host-16", "What are inodes and why does my plan look “full”?", "Inodes count files/folders, not only GB. Many small cache or mail files can hit the limit while disk space still looks free. Read more: [Inodes](/kennisbank/hosting/inodes-en-inode-limieten) · [Storage and traffic](/kennisbank/hosting/onbeperkte-opslag-en-dataverkeer)."),
        q("host-17", "What does “unlimited” storage or traffic mean?", "“Unlimited” follows fair use: normal website use is fine; abuse or extreme loads may be limited to keep the platform stable. Read more: [Storage and traffic](/kennisbank/hosting/onbeperkte-opslag-en-dataverkeer)."),
        q("host-18", "What is the difference between shared, VPS and dedicated?", "Shared shares resources; VPS isolates more CPU/RAM; dedicated is a whole server. Choose by traffic, control needs and budget. Read more: [Dedicated vs VPS vs shared](/kennisbank/infrastructuur-servers/verschil-tussen-dedicated-vps-en-shared-hosting) · [Shared/WP/VPS](/kennisbank/hosting/hoe-kies-ik-tussen-shared-hosting-wordpress-hosting-en-vps)."),
        q("host-19", "How do I work with DirectAdmin?", "DirectAdmin is the control panel for email, DNS, databases, backups and installs. Log in with your panel credentials; we strongly recommend 2FA. Read more: [2FA in DirectAdmin](/kennisbank/directadmin/2fa-instellen-in-directadmin) · [Backups](/kennisbank/directadmin/backup-maken-en-terugzetten-directadmin)."),
        q("host-20", "Do you offer object cache for WordPress?", "On suitable plans we support persistent object cache to reduce database queries and load faster. Read more: [Object cache](/kennisbank/hosting/persistent-object-cache-in-wordpress) · [WordPress hosting](/diensten/wordpress-hosting)."),
        q("host-21", "How do I renew or pay for hosting?", "Via the client portal and invoices; automatic renewal is often available. Keep billing details current to avoid interruption. Read more: [Billing details](/kennisbank/crm-klantenpanel/hoe-wijzig-ik-mijn-factuurgegevens-en-betaalmethode) · [View invoices](/kennisbank/crm-klantenpanel/hoe-download-of-raadpleeg-ik-factuurdetails)."),
        q("host-22", "Can I put multiple domains on one hosting plan?", "Often yes, via addon or parked domains — depending on plan limits. We help with connection and DNS. Read more: [Choose hosting](/kennisbank/hosting/hoe-kies-ik-het-juiste-hostingpakket) · [Connect domain](/kennisbank/domeinnamen/domeinnaam-koppelen-aan-een-pakket)."),
        q("host-23", "How secure is logging in to my hosting panel?", "Use a strong password and enable 2FA. Do not share panel logins over insecure channels. Read more: [2FA DirectAdmin](/kennisbank/directadmin/2fa-instellen-in-directadmin) · [Lost login](/kennisbank/crm-klantenpanel/logingegevens-klantenpanel-kwijt)."),
        q("host-24", "What is WordPress hosting exactly?", "WordPress hosting is optimised for WP: faster PHP/stack, often CDN and simpler installs/updates than generic shared. Read more: [WP hosting plans](/kennisbank/hosting/wat-is-wordpress-hosting-basic-plus-en-pro) · [WordPress hosting](/diensten/wordpress-hosting)."),
        q("host-25", "Where do I order hosting directly?", "In the shop or via the Shared, Cloud, WordPress and VPS hosting categories. After order you get panel and invoice access. Read more: [Shop](/shop) · [Hosting overview](/diensten/categorie/hosting)."),
      ],
    },
    {
      id: "email-dns",
      title: "Email and DNS",
      items: [
        q("mail-1", "Do you offer email with domains or hosting?", "That depends on the package and setup. We advise reliable mail solutions and set DNS correctly (SPF, DKIM and DMARC). Read more: [Email on your own domain](/kennisbank/e-mail/e-mailadres-eigen-domein-wordpress) · [SPF record](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam)."),
        q("mail-2", "What are SPF, DKIM and DMARC?", "They are DNS records that handle email authentication and reduce spoofing/spam. Without correct records, mail more often lands in spam. Read more: [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam) · [DKIM](/kennisbank/domeinnamen/dkim-record-toevoegen-aan-dns-domeinnaam) · [DMARC](/kennisbank/domeinnamen/hoe-kan-ik-een-dmarc-record-toevoegen)."),
        q("mail-3", "How do I manage DNS records?", "Via DNS management for your domain or hosting panel you set A, AAAA, CNAME, MX and TXT records. We help with migrations and mail auth. Read more: [Manage DNS](/kennisbank/domeinnamen/dns-records-beheren) · [DNSSEC](/kennisbank/domeinnamen/wat-is-dnssec-en-hoe-voeg-ik-het-toe-aan-mijn-domein)."),
        q("mail-4", "Do you help solve DNS problems?", "Yes. We fix records, propagation, mail auth and domain connections until DNS is correct again. Read more: [Manage DNS records](/kennisbank/domeinnamen/dns-records-beheren) · [Propagation and TTL](/kennisbank/foutmeldingen-troubleshooting/dns-propagatie-ttl-en-caches-legen)."),
        q("mail-5", "What is DNSSEC?", "DNSSEC signs DNS answers so manipulation is harder. We can enable it where your TLD and setup support it. Read more: [DNSSEC explained](/kennisbank/domeinnamen/wat-is-dnssec-en-hoe-voeg-ik-het-toe-aan-mijn-domein)."),
        q("mail-6", "How do I set up email on my phone?", "Use IMAP/SMTP details from your panel. For Android (and similarly on iOS) the steps are in the knowledge base. Read more: [Email on Android](/kennisbank/e-mail/e-mail-instellen-op-android) · [Email on your own domain](/kennisbank/e-mail/e-mailadres-eigen-domein-wordpress)."),
        q("mail-7", "What if email suddenly stops working?", "Check DNS (MX/SPF/DKIM/DMARC), mailbox quota and whether providers are blocking mail. We help trace the full chain. Read more: [Email problems](/kennisbank/hosting/problemen-met-e-mail-website) · [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam)."),
        q("mail-8", "How do nameservers work?", "Nameservers determine which DNS system serves your domain. If you change them, you must set A/MX/TXT records correctly again at the new DNS host. Read more: [Manage nameservers](/kennisbank/domeinnamen/nameservers-beheren) · [Manage DNS](/kennisbank/domeinnamen/dns-records-beheren)."),
        q("mail-9", "How long does DNS propagation take?", "Often minutes to a few hours; sometimes up to 24–48 hours because of TTLs and caches. Lower TTLs before a migration to switch faster. Read more: [Propagation and TTL](/kennisbank/foutmeldingen-troubleshooting/dns-propagatie-ttl-en-caches-legen) · [New domain not working](/kennisbank/domeinnamen/mijn-nieuwe-domeinnaam-werkt-niet)."),
        q("mail-10", "Can I forward email to another address?", "Yes. Forwarders send incoming mail to Gmail, Microsoft 365 or another mailbox — useful alongside or instead of a full mailbox. Read more: [Forward email](/kennisbank/e-mail/email-doorsturen-naar-mailadres)."),
        q("mail-11", "Can I connect my domain to Microsoft 365?", "Yes. You set MX and authentication records (SPF/DKIM/DMARC) per Microsoft’s instructions; we help on the DNS side. Read more: [Domain to Microsoft 365](/kennisbank/domeinnamen/domeinnaam-koppelen-aan-microsoft-365) · [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam)."),
        q("mail-12", "Why does my mail end up in spam?", "Often SPF/DKIM/DMARC are missing or conflicting, or IP/reputation is weak. We check DNS auth and sending behaviour. Read more: [SPF](/kennisbank/domeinnamen/spf-record-voor-je-domeinnaam) · [DKIM](/kennisbank/domeinnamen/dkim-record-toevoegen-aan-dns-domeinnaam) · [DMARC](/kennisbank/domeinnamen/hoe-kan-ik-een-dmarc-record-toevoegen)."),
        q("mail-13", "What is an MX record?", "An MX record tells the internet which mail server may receive email for your domain. Without a correct MX, no mail arrives. Read more: [Manage DNS](/kennisbank/domeinnamen/dns-records-beheren) · [Email problems](/kennisbank/hosting/problemen-met-e-mail-website)."),
        q("mail-14", "Can I use webmail?", "Yes, via the webmail URL of your hosting panel you can read and send mail in the browser — alongside IMAP on phone or Outlook. Read more: [Set up email](/kennisbank/e-mail/e-mail-instellen-op-android) · [Contact](/contact)."),
        q("mail-15", "Does DNS need to be with you if hosting is elsewhere?", "No. You can keep DNS with us or elsewhere, as long as A/MX/TXT point to the right services. Consistent management prevents migration mistakes. Read more: [Manage DNS](/kennisbank/domeinnamen/dns-records-beheren) · [Nameservers](/kennisbank/domeinnamen/nameservers-beheren)."),
      ],
    }

  ],
};

export function getFaqContent(
  locale: string,
  opts?: { hostingOnly?: boolean },
): FaqContent {
  const pack = loadFaqPack(locale);
  const base: FaqContent = pack
    ? {
        title: pack.title,
        subtitle: pack.subtitle,
        ctaTitle: pack.ctaTitle,
        ctaText: pack.ctaText,
        ctaButton: pack.ctaButton,
        categories: pack.categories.map((category) => ({
          id: category.id,
          title: category.title,
          items: category.items.map((item) => ({
            id: item.id,
            question: item.question,
            answer: item.answer,
          })),
        })),
      }
    : locale === "nl"
      ? nl
      : en;

  if (!opts?.hostingOnly) {
    return isExtraHostingSurface()
      ? replaceTripleZeroDeep(base, { locale })
      : base;
  }

  const hostingMetaByLocale: Record<string, { title: string; subtitle: string }> = {
    nl: {
      title: "Veelgestelde vragen",
      subtitle:
        "Vragen en antwoorden over domeinnamen, DNS, e-mail, shared hosting, cloud hosting, WordPress hosting, VPS en support.",
    },
    en: {
      title: "Frequently asked questions",
      subtitle:
        "Questions and answers about domain names, DNS, email, shared hosting, cloud hosting, WordPress hosting, VPS and support.",
    },
    de: {
      title: "Häufig gestellte Fragen",
      subtitle:
        "Fragen und Antworten zu Domainnamen, DNS, E-Mail, Shared Hosting, Cloud Hosting, WordPress Hosting, VPS und Support.",
    },
    fr: {
      title: "Questions fréquentes",
      subtitle:
        "Questions et réponses sur les noms de domaine, le DNS, l'e-mail, l'hébergement mutualisé, cloud, WordPress, VPS et le support.",
    },
    es: {
      title: "Preguntas frecuentes",
      subtitle:
        "Preguntas y respuestas sobre nombres de dominio, DNS, correo electrónico, hosting compartido, cloud, WordPress, VPS y soporte.",
    },
    pt: {
      title: "Perguntas frequentes",
      subtitle:
        "Perguntas e respostas sobre nomes de domínio, DNS, e-mail, hosting partilhado, cloud, WordPress, VPS e suporte.",
    },
    it: {
      title: "Domande frequenti",
      subtitle:
        "Domande e risposte su nomi di dominio, DNS, e-mail, hosting condiviso, cloud, WordPress, VPS e supporto.",
    },
    pl: {
      title: "Najczęściej zadawane pytania",
      subtitle:
        "Pytania i odpowiedzi o nazwy domen, DNS, e-mail, hosting współdzielony, cloud, WordPress, VPS i wsparcie.",
    },
    cs: {
      title: "Často kladené otázky",
      subtitle:
        "Otázky a odpovědi o doménách, DNS, e-mailu, shared hostingu, cloudu, WordPress hostingu, VPS a podpoře.",
    },
    sk: {
      title: "Často kladené otázky",
      subtitle:
        "Otázky a odpovede o doménach, DNS, e-maile, shared hostingu, cloude, WordPress hostingu, VPS a podpore.",
    },
    hu: {
      title: "Gyakran ismételt kérdések",
      subtitle:
        "Kérdések és válaszok domainnevekről, DNS-ről, e-mailről, shared hostingról, cloudról, WordPress hostingról, VPS-ről és supportól.",
    },
    ro: {
      title: "Întrebări frecvente",
      subtitle:
        "Întrebări și răspunsuri despre nume de domeniu, DNS, e-mail, shared hosting, cloud, WordPress, VPS și asistență.",
    },
    bg: {
      title: "Често задавани въпроси",
      subtitle:
        "Въпроси и отговори за домейни, DNS, имейл, споделен хостинг, cloud, WordPress хостинг, VPS и поддръжка.",
    },
    hr: {
      title: "Često postavljana pitanja",
      subtitle:
        "Pitanja i odgovori o nazivima domena, DNS-u, e-pošti, shared hostingu, cloudu, WordPress hostingu, VPS-u i podršci.",
    },
    sr: {
      title: "Често постављана питања",
      subtitle:
        "Питања и одговори о називима домена, DNS-у, е-пошти, shared хостингу, cloud-у, WordPress хостингу, VPS-у и подршци.",
    },
    bs: {
      title: "Često postavljana pitanja",
      subtitle:
        "Pitanja i odgovori o nazivima domena, DNS-u, e-pošti, shared hostingu, cloudu, WordPress hostingu, VPS-u i podršci.",
    },
    cnr: {
      title: "Често постављана питања",
      subtitle:
        "Питања и одговори о називима домена, DNS-у, е-пошти, shared хостингу, cloud-у, WordPress хостингу, VPS-у и подршци.",
    },
    sq: {
      title: "Pyetjet e shpeshta",
      subtitle:
        "Pyetje dhe përgjigje rreth emrave të domain-eve, DNS, email, shared hosting, cloud, WordPress hosting, VPS dhe mbështetjes.",
    },
    mk: {
      title: "Често поставувани прашања",
      subtitle:
        "Прашања и одговори за имиња на домени, DNS, е-пошта, shared хостинг, cloud, WordPress хостинг, VPS и поддршка.",
    },
    lt: {
      title: "Dažnai užduodami klausimai",
      subtitle:
        "Klausimai ir atsakymai apie domenų vardus, DNS, el. paštą, shared hostingą, cloud, WordPress hostingą, VPS ir palaikymą.",
    },
    da: {
      title: "Ofte stillede spørgsmål",
      subtitle:
        "Spørgsmål og svar om domænenavne, DNS, e-mail, shared hosting, cloud hosting, WordPress hosting, VPS og support.",
    },
    sv: {
      title: "Vanliga frågor",
      subtitle:
        "Frågor och svar om domännamn, DNS, e-post, shared hosting, cloud hosting, WordPress hosting, VPS och support.",
    },
    no: {
      title: "Ofte stilte spørsmål",
      subtitle:
        "Spørsmål og svar om domenenavn, DNS, e-post, shared hosting, cloud hosting, WordPress hosting, VPS og support.",
    },
    fi: {
      title: "Usein kysytyt kysymykset",
      subtitle:
        "Kysymyksiä ja vastauksia verkkotunnuksista, DNS:stä, sähköpostista, shared-hostingista, cloudista, WordPress-hostingista, VPS:stä ja tuesta.",
    },
    uk: {
      title: "Часті запитання",
      subtitle:
        "Запитання та відповіді про доменні імена, DNS, електронну пошту, shared hosting, cloud, WordPress hosting, VPS і підтримку.",
    },
    ru: {
      title: "Часто задаваемые вопросы",
      subtitle:
        "Вопросы и ответы о доменных именах, DNS, электронной почте, shared hosting, cloud, WordPress hosting, VPS и поддержке.",
    },
    tr: {
      title: "Sıkça sorulan sorular",
      subtitle:
        "Alan adları, DNS, e-posta, shared hosting, cloud hosting, WordPress hosting, VPS ve destek hakkında sorular ve yanıtlar.",
    },
    el: {
      title: "Συχνές ερωτήσεις",
      subtitle:
        "Ερωτήσεις και απαντήσεις για ονόματα τομέα, DNS, email, shared hosting, cloud, WordPress hosting, VPS και υποστήριξη.",
    },
    ar: {
      title: "الأسئلة الشائعة",
      subtitle:
        "أسئلة وأجوبة حول أسماء النطاقات وDNS والبريد الإلكتروني والاستضافة المشتركة والسحابة وWordPress وVPS والدعم.",
    },
    he: {
      title: "שאלות נפוצות",
      subtitle:
        "שאלות ותשובות על שמות דומיין, DNS, דוא״ל, shared hosting, cloud, WordPress hosting, VPS ותמיכה.",
    },
    hy: {
      title: "Հաճախակի տրվող հարցեր",
      subtitle:
        "Հարցեր և պատասխաններ դոմեյնների, DNS-ի, էլ. փոստի, shared hosting-ի, cloud-ի, WordPress hosting-ի, VPS-ի և աջակցության մասին.",
    },
    ka: {
      title: "ხშირად დასმული კითხვები",
      subtitle:
        "კითხვები და პასუხები დომენების, DNS-ის, ელფოსტის, shared hosting-ის, cloud-ის, WordPress hosting-ის, VPS-ისა და მხარდაჭერის შესახებ.",
    },
    az: {
      title: "Tez-tez verilən suallar",
      subtitle:
        "Domen adları, DNS, e-poçt, shared hosting, cloud, WordPress hosting, VPS və dəstək haqqında suallar və cavablar.",
    },
    zh: {
      title: "常见问题",
      subtitle:
        "关于域名、DNS、电子邮件、共享托管、云托管、WordPress 托管、VPS 和支持的问题与解答。",
    },
    ja: {
      title: "よくある質問",
      subtitle:
        "ドメイン名、DNS、メール、共有ホスティング、クラウド、WordPress ホスティング、VPS、サポートに関する質問と回答。",
    },
    bn: {
      title: "প্রায়শই জিজ্ঞাসিত প্রশ্ন",
      subtitle:
        "ডোমেইন নাম, DNS, ইমেইল, শেয়ার্ড হোস্টিং, ক্লাউড, WordPress হোস্টিং, VPS ও সাপোর্ট সম্পর্কে প্রশ্নোত্তর।",
    },
    hi: {
      title: "अक्सर पूछे जाने वाले प्रश्न",
      subtitle:
        "डोमेन नाम, DNS, ईमेल, शेयर्ड होस्टिंग, क्लाउड, WordPress होस्टिंग, VPS और सपोर्ट पर प्रश्न और उत्तर।",
    },
    mr: {
      title: "सारखे विचारले जाणारे प्रश्न",
      subtitle:
        "डोमेन नावे, DNS, ईमेल, शेअर्ड होस्टिंग, क्लाउड, WordPress होस्टिंग, VPS आणि सपोर्टबाबत प्रश्नोत्तरे.",
    },
    pa: {
      title: "ਅਕਸਰ ਪੁੱਛੇ ਜਾਣ ਵਾਲੇ ਸਵਾਲ",
      subtitle:
        "ਡੋਮੇਨ ਨਾਮ, DNS, ਈਮੇਲ, ਸ਼ੇਅਰਡ ਹੋਸਟਿੰਗ, ਕਲਾਉਡ, WordPress ਹੋਸਟਿੰਗ, VPS ਅਤੇ ਸਹਾਇਤਾ ਬਾਰੇ ਸਵਾਲ ਅਤੇ ਜਵਾਬ।",
    },
    te: {
      title: "తరచుగా అడిగే ప్రశ్నలు",
      subtitle:
        "డొమైన్ పేర్లు, DNS, ఇమెయిల్, షేర్డ్ హోస్టింగ్, క్లౌడ్, WordPress హోస్టింగ్, VPS మరియు సపోర్ట్ గురించి ప్రశ్నలు మరియు సమాధానాలు.",
    },
    ur: {
      title: "اکثر پوچھے گئے سوالات",
      subtitle:
        "ڈومین نام، DNS، ای میل، شیئرڈ ہوسٹنگ، کلاؤڈ، WordPress ہوسٹنگ، VPS اور سپورٹ کے بارے میں سوالات اور جوابات۔",
    },
    ps: {
      title: "ډېرې پوښتل شوې پوښتنې",
      subtitle:
        "د ډومین نومونو، DNS، برېښنالیک، شریک هاسټینګ، کلاوډ، WordPress هاسټینګ، VPS او ملاتړ په اړه پوښتنې او ځوابونه.",
    },
  };
  const hostingMeta =
    hostingMetaByLocale[locale] || hostingMetaByLocale.en;
  const supportKeep = new Set([
    "sup-2",
    "sup-3",
    "sup-4",
    "sup-7",
    "sup-8",
    "sup-9",
    "sup-12",
    "sup-13",
    "sup-14",
    "sup-15",
    "sup-16",
    "sup-17",
  ]);
  const hostingCategoryOrder = ["domeinen", "webhosting", "email-dns", "support"];
  const categories = base.categories
    .filter((category) => EXTRA_HOSTING_FAQ_CATEGORY_IDS.has(category.id))
    .map((category) => {
      if (category.id === "support") {
        return {
          ...category,
          items: category.items.filter((item) => supportKeep.has(item.id)),
        };
      }
      return category;
    })
    .sort(
      (a, b) =>
        hostingCategoryOrder.indexOf(a.id) - hostingCategoryOrder.indexOf(b.id),
    );

  const hostingFaq = {
    ...base,
    title: hostingMeta.title,
    subtitle: hostingMeta.subtitle,
    categories,
  };
  return isExtraHostingSurface()
    ? replaceTripleZeroDeep(hostingFaq, { locale })
    : hostingFaq;
}

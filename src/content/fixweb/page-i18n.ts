import { getLocalizedCopySync } from "@/lib/localized-copy-cache";
import pageI18nPack from "@/content/fixweb/page-i18n-pack.json";

export type PageBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export type PageI18n = {
  title: string;
  subtitle: string;
  blocks: PageBlock[];
};

function h(text: string): PageBlock {
  return { type: "heading", text };
}
function p(text: string): PageBlock {
  return { type: "paragraph", text };
}
function l(items: string[]): PageBlock {
  return { type: "list", items };
}

export const pageI18n: Record<string, { nl: PageI18n; en: PageI18n }> = {
  "wordpress-support": {
    nl: {
      title: "WordPress Support",
      subtitle:
        "Professionele monitoring, updates, backups en technische zorg voor uw WordPress-websites — met vaste pakketten die passen bij één of meerdere sites.",
      blocks: [
        h("Waarom WordPress Support?"),
        p(
          "Een WordPress-site vraagt continue aandacht: updates, beveiliging, backups en snelle hulp bij fouten. TripleZero iT neemt die zorg over, zodat u zich kunt richten op content en groei.",
        ),
        h("Wat zit er in onze supportpakketten?"),
        l([
          "24/7 monitoring en snelle respons bij problemen",
          "Dagelijkse backups van bestanden en database",
          "WordPress-core- en plugin-updates met controles",
          "Websitefouten herstellen",
          "Malwareverwijdering en beveiligingsmaatregelen",
          "Snelheids- en SEO-optimalisatie (afhankelijk van pakket)",
        ]),
        h("Kies het pakket dat bij u past"),
        p(
          "Basic is ideaal voor één website. Standard dekt twee sites met extra performancezorg. Premium ondersteunt meerdere websites inclusief SEO-aandacht. Jaarabonnementen bieden vaak een aantrekkelijke besparing.",
        ),
        h("Zo werken wij"),
        p(
          "Wij starten met een korte intake, zetten monitoring en backups klaar en werken volgens een vaste cadans. U weet altijd wat er is gedaan en wanneer er actie nodig is.",
        ),
      ],
    },
    en: {
      title: "WordPress Support",
      subtitle:
        "Professional monitoring, updates, backups and technical care for your WordPress websites — with fixed packages for one or multiple sites.",
      blocks: [
        h("Why WordPress Support?"),
        p(
          "WordPress needs ongoing attention: updates, security, backups and fast help when something breaks. TripleZero iT takes that care off your plate so you can focus on content and growth.",
        ),
        h("What’s included"),
        l([
          "24/7 monitoring and fast response when issues appear",
          "Daily backups of files and database",
          "WordPress core and plugin updates with checks",
          "Fix website errors",
          "Malware removal and security measures",
          "Speed and SEO optimization (depending on package)",
        ]),
        h("Choose the right package"),
        p(
          "Basic suits a single website. Standard covers two sites with extra performance care. Premium supports multiple websites including SEO attention. Yearly plans often offer attractive savings.",
        ),
        h("How we work"),
        p(
          "We start with a short intake, set up monitoring and backups, and follow a clear cadence. You always know what was done and when action is needed.",
        ),
      ],
    },
  },

  "digital-marketing": {
    nl: {
      title: "Digital Marketing",
      subtitle:
        "Versterk uw online bereik met gerichte digital marketing: van SEO en content tot campagnes die meetbare resultaten opleveren.",
      blocks: [
        h("Groei met een duidelijke marketingaanpak"),
        p(
          "In een druk digitaal landschap wilt u zichtbaar zijn bij de juiste doelgroep. TripleZero iT helpt u met strategieën die merkbekendheid, verkeer en conversies versterken — zonder ruis.",
        ),
        h("Onze diensten"),
        l([
          "Zoekmachineoptimalisatie (SEO) en technische vindbaarheid",
          "Contentmarketing en zoekwoordgerichte pagina’s",
          "Campagnebegeleiding en conversiegerichte landingspagina’s",
          "Analytics, tracking en rapportage",
          "Lokale zichtbaarheid en Google Business-profielen",
        ]),
        h("Wat u van ons mag verwachten"),
        p(
          "Wij starten met doelen en uitgangssituatie, kiezen daarna de kanalen die écht bijdragen en sturen bij op basis van data. U krijgt heldere updates en prioriteiten in plaats van vage beloftes.",
        ),
        h("Van strategie naar verbetering"),
        p(
          "Na een intake brengen we doelgroep, concurrentie, bestaande kanalen en meetpunten in kaart. Vervolgens vertalen we de grootste kansen naar een haalbare planning en evalueren we periodiek welke inspanningen meer bereik, kwalitatief verkeer of aanvragen opleveren.",
        ),
        h("Voor wie"),
        p(
          "Ideaal voor mkb, webshops en dienstverleners die hun online acquisitie willen professionaliseren met een partner die ook technisch meedenkt.",
        ),
        h("Neem contact op"),
      ],
    },
    en: {
      title: "Digital Marketing",
      subtitle:
        "Grow your online reach with focused digital marketing — from SEO and content to campaigns that deliver measurable results.",
      blocks: [
        h("Grow with a clear marketing approach"),
        p(
          "In a crowded digital landscape you need visibility with the right audience. TripleZero iT helps you build strategies that improve brand awareness, traffic and conversions — without the noise.",
        ),
        h("Our services"),
        l([
          "Search engine optimization (SEO) and technical findability",
          "Content marketing and keyword-focused pages",
          "Campaign guidance and conversion-focused landing pages",
          "Analytics, tracking and reporting",
          "Local visibility and Google Business profiles",
        ]),
        h("What to expect"),
        p(
          "We start from your goals and current baseline, then choose channels that actually contribute and adjust based on data. You get clear updates and priorities instead of vague promises.",
        ),
        h("From strategy to improvement"),
        p(
          "After an intake, we map your audience, competitors, existing channels and measurement points. We then turn the strongest opportunities into a practical plan and periodically review which efforts create more reach, qualified traffic or enquiries.",
        ),
        h("Who it’s for"),
        p(
          "Ideal for SMEs, online stores and service businesses that want professional online acquisition with a partner who also understands the technical side.",
        ),
        h("Contact us"),
      ],
    },
  },

  "content-writing": {
    nl: {
      title: "Content Writing",
      subtitle:
        "Professionele teksten die uw merk versterken, bezoekers boeien en bijdragen aan betere vindbaarheid en conversie.",
      blocks: [
        h("Content die werkt voor uw merk"),
        p(
          "Sterke content trekt aandacht, bouwt autoriteit op en ondersteunt SEO. TripleZero iT schrijft teksten die passen bij uw tone of voice en doelgroep — helder, overtuigend en bruikbaar.",
        ),
        h("Wat wij schrijven"),
        l([
          "Blogartikelen en kenniscontent",
          "Websitepagina’s en landingspagina’s",
          "Product- en dienstbeschrijvingen",
          "Nieuwsbrieven en campagnecopy",
          "SEO-teksten met natuurlijke zoekwoordintegratie",
        ]),
        h("Onze werkwijze"),
        p(
          "Na een korte briefing over doelen, doelgroep en merkstijl leveren wij concepten die u kunt reviewen. Feedback verwerken wij snel, zodat publicatie soepel verloopt.",
        ),
        h("Resultaatgericht"),
        p(
          "Wij schrijven niet voor de woordenteller, maar voor lezers én zoekmachines: duidelijke structuur, sterke koppen en een boodschap die tot actie aanzet.",
        ),
        h("Van briefing tot publicatie"),
        p(
          "We stemmen onderwerp, zoekintentie, gewenste actie en publicatiemoment af voordat we schrijven. Na uw review verwerken we gerichte feedback en leveren we tekst die eenvoudig in uw CMS, nieuwsbrief of campagne kan worden geplaatst.",
        ),
        h("Wat het oplevert"),
        p(
          "U bouwt een herkenbare contentbasis op die vragen van prospects beantwoordt, uw expertise onderbouwt en commerciële pagina’s ondersteunt. Daardoor ontstaat er meer samenhang tussen zichtbaarheid, vertrouwen en conversie.",
        ),
        h("Contact"),
      ],
    },
    en: {
      title: "Content Writing",
      subtitle:
        "Professional copy that strengthens your brand, engages visitors and supports better findability and conversion.",
      blocks: [
        h("Content that works for your brand"),
        p(
          "Strong content earns attention, builds authority and supports SEO. TripleZero iT writes copy that matches your tone of voice and audience — clear, persuasive and practical.",
        ),
        h("What we write"),
        l([
          "Blog articles and knowledge content",
          "Website pages and landing pages",
          "Product and service descriptions",
          "Newsletters and campaign copy",
          "SEO copy with natural keyword integration",
        ]),
        h("How we work"),
        p(
          "After a short briefing on goals, audience and brand style, we deliver drafts for review. Feedback is handled quickly so publishing stays smooth.",
        ),
        h("Results first"),
        p(
          "We write for readers and search engines: clear structure, strong headings and a message that encourages action — not filler for a word count.",
        ),
        h("From briefing to publishing"),
        p(
          "Before writing, we align on the topic, search intent, desired action and publication moment. After your review, we incorporate focused feedback and deliver copy that is ready for your CMS, newsletter or campaign.",
        ),
        h("What it delivers"),
        p(
          "You build a consistent content foundation that answers prospect questions, demonstrates expertise and supports commercial pages. The result is a stronger connection between visibility, trust and conversion.",
        ),
        h("Contact"),
      ],
    },
  },

  "social-media-management": {
    nl: {
      title: "Social Media Management",
      subtitle:
        "Bouw een consistente social media-aanwezigheid met strategie, content en community-aandacht die bij uw merk past.",
      blocks: [
        h("Social media met focus"),
        p(
          "Social platforms zijn krachtig voor bekendheid en klantcontact — mits er een plan is. TripleZero iT helpt u met strategie, contentplanning en beheer zodat uw kanalen professioneel en herkenbaar blijven.",
        ),
        h("Wat wij doen"),
        l([
          "Social mediastrategie en positionering",
          "Contentkalender en publicatieplanning",
          "Creatie van posts, visuals en korte updates",
          "Community-reacties en engagement",
          "Rapportage over bereik, interactie en inzichten",
        ]),
        h("Consistent en merkwaardig"),
        p(
          "Wij bewaken tone of voice, frequentie en kwaliteit. U voorkomt stilte op kanalen én toevallige posts zonder richting.",
        ),
        h("Van planning naar publicatie"),
        p(
          "We begin with your objectives, audiences and available brand material. From there, we create a workable content calendar, prepare posts for approval where needed and publish according to an agreed cadence.",
        ),
        h("Inzicht dat helpt bijsturen"),
        p(
          "Periodieke rapportage maakt zichtbaar welke formats, onderwerpen en momenten resoneren. Die inzichten gebruiken we om content en inzet verder te verfijnen, met aandacht voor bereik, betrokkenheid en relevante gesprekken.",
        ),
        h("Voor merken die willen groeien"),
        p(
          "Geschikt voor bedrijven die social media serieus willen inzetten zonder een volledig intern team op te bouwen.",
        ),
        h("Start vandaag"),
      ],
    },
    en: {
      title: "Social Media Management",
      subtitle:
        "Build a consistent social presence with strategy, content and community care that fits your brand.",
      blocks: [
        h("Social media with focus"),
        p(
          "Social platforms are powerful for awareness and customer contact — when there is a plan. TripleZero iT helps with strategy, content planning and management so your channels stay professional and recognizable.",
        ),
        h("What we do"),
        l([
          "Social media strategy and positioning",
          "Content calendar and publishing schedule",
          "Creation of posts, visuals and short updates",
          "Community replies and engagement",
          "Reporting on reach, interaction and insights",
        ]),
        h("Consistent and on-brand"),
        p(
          "We protect tone of voice, cadence and quality. You avoid silent channels and random posts without direction.",
        ),
        h("From plan to publication"),
        p(
          "We begin with your objectives, audiences and available brand material. From there, we create a workable content calendar, prepare posts for approval where needed and publish to an agreed cadence.",
        ),
        h("Insight that guides improvement"),
        p(
          "Regular reporting reveals which formats, topics and moments resonate. We use those insights to refine content and activity with attention to reach, engagement and meaningful conversations.",
        ),
        h("For brands that want to grow"),
        p(
          "Ideal for businesses that want serious social media without building a full in-house team.",
        ),
        h("Get started"),
      ],
    },
  },

  "media-creation": {
    nl: {
      title: "Media Creatie",
      subtitle:
        "Professionele media voor een sterkere merkuitstraling: van visuals en banners tot video en audio die uw boodschap laten landen.",
      blocks: [
        h("Media die aandacht trekt"),
        p(
          "Goede beelden en geluid maken het verschil tussen scrollen en blijven kijken. TripleZero iT creëert media die past bij uw merk en inzetbaar is op website, social en campagnes.",
        ),
        h("Onze media-oplossingen"),
        l([
          "Grafisch ontwerp voor web en social",
          "Logo-ondersteuning en merkvisuals",
          "Social media banners en campagnemateriaal",
          "Promotionele video’s en korte clips",
          "Voice-overs en audioproductie",
        ]),
        h("Praktisch en merkgericht"),
        p(
          "Wij werken vanuit uw doelen en bestaande huisstijl (of helpen die te versterken). Leveringen zijn klaar voor gebruik in de kanalen die u écht inzet.",
        ),
        h("Van idee naar bruikbaar bestand"),
        p(
          "We bepalen eerst doel, doelgroep, boodschap en benodigde formaten. Daarna werken we concepten uit, stemmen we de richting met u af en ronden we de gekozen uitwerking zorgvuldig af voor digitale of campagne-inzet.",
        ),
        h("Consistent op ieder contactmoment"),
        p(
          "Door media op elkaar en op uw merkverhaal af te stemmen, ontstaat een professionele uitstraling die sneller herkenning oproept. U beschikt over assets die uw team direct kan gebruiken en opnieuw kan inzetten.",
        ),
        h("Samenwerking"),
        p(
          "U levert briefing en voorbeelden; wij komen met concepten, verwerken feedback en leveren bestanden in de juiste formaten.",
        ),
        h("Contact"),
      ],
    },
    en: {
      title: "Media Creation",
      subtitle:
        "Professional media for a stronger brand presence — from visuals and banners to video and audio that carry your message.",
      blocks: [
        h("Media that earns attention"),
        p(
          "Strong visuals and audio turn scrolling into engagement. TripleZero iT creates media that fits your brand and works across website, social and campaigns.",
        ),
        h("Our media solutions"),
        l([
          "Graphic design for web and social",
          "Logo support and brand visuals",
          "Social banners and campaign assets",
          "Promotional videos and short clips",
          "Voice-overs and audio production",
        ]),
        h("Practical and on-brand"),
        p(
          "We work from your goals and existing brand style (or help strengthen it). Deliverables are ready for the channels you actually use.",
        ),
        h("From idea to usable asset"),
        p(
          "We first define the objective, audience, message and required formats. Then we develop concepts, align the direction with you and carefully finish the selected work for digital or campaign use.",
        ),
        h("Consistency at every touchpoint"),
        p(
          "By aligning media with each other and with your brand story, you create a professional presence that is easier to recognise. Your team receives assets it can use immediately and reuse with confidence.",
        ),
        h("Collaboration"),
        p(
          "You provide briefing and examples; we return concepts, process feedback and deliver files in the right formats.",
        ),
        h("Contact"),
      ],
    },
  },

  "e-commerce": {
    nl: {
      title: "E-commerce",
      subtitle:
        "Bouw, optimaliseer en groei uw webshop met e-commerceoplossingen die verkoop, gebruiksgemak en schaalbaarheid combineren.",
      blocks: [
        h("Online verkopen met een stevige basis"),
        p(
          "Een succesvolle webshop vraagt meer dan een mooie etalage. TripleZero iT helpt u bij ontwikkeling, optimalisatie en doorontwikkeling van e-commerceplatforms — van eerste setup tot groei.",
        ),
        h("Wat wij bieden"),
        l([
          "E-commerce website-ontwikkeling en redesign",
          "Productcatalogus, categorieën en checkoutflows",
          "Integraties met betalingen, verzending en tools",
          "Performance-, UX- en conversieverbeteringen",
          "Onderhoud, security en technische support",
        ]),
        h("Gericht op resultaat"),
        p(
          "Wij kijken naar klantreis, laadtijd, mobiele ervaring en betrouwbaarheid van bestelprocessen. Kleine fricties in checkout of productpagina’s kunnen groot verschil maken in omzet.",
        ),
        h("Onze aanpak"),
        p(
          "We starten met uw assortiment, processen, doelgroepen en huidige techniek. Daarna prioriteren we verbeteringen, bouwen of configureren we in overzichtelijke stappen en testen we de belangrijkste klantpaden vóór livegang.",
        ),
        h("Klaar voor beheer en groei"),
        p(
          "U krijgt een webshop die niet alleen prettig verkoopt, maar ook beheersbaar blijft voor uw team. Heldere structuur, betrouwbare integraties en ruimte voor nieuwe producten, markten of campagnes maken doorgroeien eenvoudiger.",
        ),
        h("Voor nieuwe en bestaande shops"),
        p(
          "Of u nu start of een bestaande shop wilt verbeteren: wij werken pragmatisch, met duidelijke mijlpalen en ruimte voor uw merkwensen.",
        ),
        h("Neem contact op"),
      ],
    },
    en: {
      title: "E-commerce",
      subtitle:
        "Build, optimize and grow your online store with e-commerce solutions that combine sales, usability and scalability.",
      blocks: [
        h("Sell online on a solid foundation"),
        p(
          "A successful store needs more than a pretty storefront. TripleZero iT helps you develop, optimize and evolve e-commerce platforms — from first setup to growth.",
        ),
        h("What we offer"),
        l([
          "E-commerce website development and redesign",
          "Product catalog, categories and checkout flows",
          "Integrations for payments, shipping and tools",
          "Performance, UX and conversion improvements",
          "Maintenance, security and technical support",
        ]),
        h("Focused on results"),
        p(
          "We look at customer journey, load time, mobile experience and checkout reliability. Small friction in product pages or checkout can make a large difference in revenue.",
        ),
        h("Our approach"),
        p(
          "We start with your assortment, processes, audiences and current technology. We then prioritise improvements, build or configure in clear stages and test the most important customer paths before launch.",
        ),
        h("Ready to manage and grow"),
        p(
          "You receive a store that is built not only to sell well, but also to remain manageable for your team. Clear structure, reliable integrations and room for new products, markets or campaigns make growth easier.",
        ),
        h("For new and existing stores"),
        p(
          "Whether you are starting fresh or improving an existing shop, we work pragmatically with clear milestones and room for your brand requirements.",
        ),
        h("Contact us"),
      ],
    },
  },

  "product-listing": {
    nl: {
      title: "Product Listing",
      subtitle:
        "Optimaliseer productvermeldingen voor meer zichtbaarheid, duidelijkheid en conversie op WooCommerce, Shopify en andere platforms.",
      blocks: [
        h("Producten die gevonden én gekozen worden"),
        p(
          "Sterke productlistings maken het verschil tussen scrollen en bestellen. TripleZero iT zorgt voor accurate, aantrekkelijke en goed gestructureerde productinformatie.",
        ),
        h("Onze listingdiensten"),
        l([
          "Productupload en catalogusopbouw",
          "Titels, beschrijvingen en specificaties",
          "Afbeeldingen, attributen en varianten",
          "Categorie- en filterstructuur",
          "Optimalisatie voor vindbaarheid en conversie",
        ]),
        h("Platformexpertise"),
        p(
          "Wij werken onder meer met WooCommerce, Shopify, Joomla en Magento. U krijgt consistente listings die aansluiten op de regels en mogelijkheden van uw platform.",
        ),
        h("Kwaliteit boven volume"),
        p(
          "Wij focussen op volledigheid, leesbaarheid en zoekintentie — zodat shoppers sneller begrijpen wat u aanbiedt en waarom het past.",
        ),
        h("Een gecontroleerd listingproces"),
        p(
          "We agree the required fields, source data, naming conventions and quality checks in advance. Per productgroep werken we gestructureerd, controleren we varianten en attributen en signaleren we ontbrekende of tegenstrijdige informatie.",
        ),
        h("Meer vertrouwen in de productpagina"),
        p(
          "Consistente, complete informatie vermindert twijfel bij shoppers en beperkt fouten in uw catalogus. Dat ondersteunt filters, interne zoekfuncties, vindbaarheid en een overtuigender aankoopbesluit.",
        ),
        h("Contact"),
      ],
    },
    en: {
      title: "Product Listing",
      subtitle:
        "Optimize product listings for better visibility, clarity and conversion on WooCommerce, Shopify and other platforms.",
      blocks: [
        h("Products that get found — and chosen"),
        p(
          "Strong product listings turn browsing into orders. TripleZero iT delivers accurate, compelling and well-structured product information.",
        ),
        h("Our listing services"),
        l([
          "Product upload and catalog setup",
          "Titles, descriptions and specifications",
          "Images, attributes and variants",
          "Category and filter structure",
          "Optimization for findability and conversion",
        ]),
        h("Platform expertise"),
        p(
          "We work with platforms including WooCommerce, Shopify, Joomla and Magento. You get consistent listings that match each platform’s rules and capabilities.",
        ),
        h("Quality over volume"),
        p(
          "We focus on completeness, readability and search intent — so shoppers quickly understand what you offer and why it fits.",
        ),
        h("A controlled listing process"),
        p(
          "We agree the required fields, source data, naming conventions and quality checks upfront. For each product group, we work systematically, verify variants and attributes, and flag missing or conflicting information.",
        ),
        h("More confidence on every product page"),
        p(
          "Consistent, complete information reduces shopper uncertainty and catalog errors. It supports filters, on-site search, discoverability and a more convincing purchase decision.",
        ),
        h("Contact"),
      ],
    },
  },

  "community-management": {
    nl: {
      title: "Community Management",
      subtitle:
        "Bouw en verzorg een betrokken community met actieve moderatie, gesprekken en merkwaardige interactie op uw kanalen.",
      blocks: [
        h("Van volgers naar ambassadeurs"),
        p(
          "Een community groeit door luisteren, reageren en consistent aanwezig zijn. TripleZero iT beheert interacties zodat uw merk warm, betrouwbaar en herkenbaar blijft.",
        ),
        h("Wat community management inhoudt"),
        l([
          "Moderatie van comments en berichten",
          "Snelle, merkwaardige antwoorden",
          "Activeren van gesprekken en engagement",
          "Signaleren van kansen en klachten",
          "Samenwerking met social- en supportteams",
        ]),
        h("Positieve merkervaring"),
        p(
          "Wij bewaken toon, snelheid en kwaliteit van reacties. Klanten voelen zich gehoord — en kritiek wordt professioneel opgepakt voordat het escaleert.",
        ),
        h("Heldere afspraken, snelle opvolging"),
        p(
          "Samen bepalen we welke kanalen, reactietijden, onderwerpen en escalaties van toepassing zijn. We leggen veelgestelde vragen en merktaal vast, zodat reacties consistent blijven en gevoelige cases tijdig bij de juiste persoon terechtkomen.",
        ),
        h("Wat u terugziet"),
        p(
          "U krijgt zicht op terugkerende vragen, sentiment en signalen uit uw community. Zo verbetert u niet alleen de dagelijkse interactie, maar ook content, service en productcommunicatie op basis van wat uw doelgroep echt bespreekt.",
        ),
        h("Voor merken met actieve kanalen"),
        p(
          "Geschikt wanneer u social media, forums of communitygroepen serieus wilt onderhouden zonder alles zelf te hoeven bewaken.",
        ),
        h("Neem contact op"),
      ],
    },
    en: {
      title: "Community Management",
      subtitle:
        "Build and nurture an engaged community with active moderation, conversation and on-brand interaction across your channels.",
      blocks: [
        h("From followers to advocates"),
        p(
          "Communities grow when brands listen, reply and show up consistently. TripleZero iT manages interactions so your brand stays warm, reliable and recognizable.",
        ),
        h("What community management includes"),
        l([
          "Moderation of comments and messages",
          "Fast, on-brand replies",
          "Sparking conversation and engagement",
          "Flagging opportunities and complaints",
          "Coordination with social and support teams",
        ]),
        h("A positive brand experience"),
        p(
          "We protect tone, speed and reply quality. Customers feel heard — and criticism is handled professionally before it escalates.",
        ),
        h("Clear agreements, prompt follow-up"),
        p(
          "Together, we define the relevant channels, response times, topics and escalation paths. We document frequent questions and brand language so replies stay consistent and sensitive cases reach the right person in time.",
        ),
        h("What you gain from it"),
        p(
          "You gain visibility into recurring questions, sentiment and signals from your community. That helps improve not just daily interaction, but also your content, service and product communication based on what your audience actually discusses.",
        ),
        h("For brands with active channels"),
        p(
          "Ideal when you want to maintain social channels, forums or community groups without watching every thread yourself.",
        ),
        h("Contact us"),
      ],
    },
  },

  "data-entry": {
    nl: {
      title: "Data Entry",
      subtitle:
        "Accurate en efficiënte data-invoer zodat uw systemen, catalogi en administratie schoon, volledig en bruikbaar blijven.",
      blocks: [
        h("Data die u kunt vertrouwen"),
        p(
          "Rommelige of incomplete data remt processen en rapportages. TripleZero iT verzorgt professionele data-invoer met aandacht voor precisie, consistentie en doorlooptijd.",
        ),
        h("Onze diensten"),
        l([
          "Handmatige invoer vanuit documenten of scans",
          "Catalogus- en productdatabeheer",
          "Opschonen, normaliseren en controleren van records",
          "Migratie-ondersteuning tussen systemen",
          "Periodieke updates en bulkcorrecties",
        ]),
        h("Nauwkeurig en veilig"),
        p(
          "Wij werken met duidelijke afspraken over formaten, validatie en privacy. U ontvangt nette datasets die direct inzetbaar zijn in uw tools of webshop.",
        ),
        h("Een beheersbaar invoerproces"),
        p(
          "We starten met een voorbeeldbestand en concrete invoerregels voor velden, brondata en uitzonderingen. Tijdens de uitvoering voeren we controles uit op volledigheid en afwijkingen, zodat u grip houdt op voortgang en kwaliteit.",
        ),
        h("Operationele rust"),
        p(
          "Correcte, uniforme data voorkomt herstelwerk en maakt uw systemen betrouwbaarder voor collega’s en klanten. Uw team kan sneller rapporteren, publiceren en beslissen zonder steeds records te hoeven nalopen.",
        ),
        h("Voor bedrijven die schaal nodig hebben"),
        p(
          "Ideaal wanneer u pieken wilt opvangen of structureel datawerk wilt uitbesteden zonder interne capaciteit te belasten.",
        ),
        h("Contact"),
      ],
    },
    en: {
      title: "Data Entry",
      subtitle:
        "Accurate, efficient data entry so your systems, catalogs and administration stay clean, complete and usable.",
      blocks: [
        h("Data you can trust"),
        p(
          "Messy or incomplete data slows processes and reporting. TripleZero iT provides professional data entry with a focus on precision, consistency and turnaround.",
        ),
        h("Our services"),
        l([
          "Manual entry from documents or scans",
          "Catalog and product data management",
          "Cleaning, normalizing and validating records",
          "Migration support between systems",
          "Periodic updates and bulk corrections",
        ]),
        h("Accurate and careful"),
        p(
          "We work with clear agreements on formats, validation and privacy. You receive tidy datasets ready for your tools or store.",
        ),
        h("A manageable entry process"),
        p(
          "We start with a sample file and clear entry rules for fields, source data and exceptions. During delivery, we check completeness and anomalies so you retain visibility of progress and quality.",
        ),
        h("Operational confidence"),
        p(
          "Correct, uniform data reduces rework and makes systems more reliable for colleagues and customers. Your team can report, publish and decide faster without repeatedly checking records.",
        ),
        h("For teams that need scale"),
        p(
          "Ideal when you need to absorb peaks or outsource ongoing data work without overloading internal capacity.",
        ),
        h("Contact"),
      ],
    },
  },

  "web-hosting": {
    nl: {
      title: "Web Hosting",
      subtitle:
        "Betrouwbare hosting bij TripleZero iT: kies shared, WordPress of VPS — plus domeinregistratie vanaf scherpe tarieven.",
      blocks: [
        h("Hosting die bij uw site past"),
        p(
          "Of u een eenvoudige website, een WordPress-site of een veeleisende applicatie runt: de juiste hosting bepaalt snelheid, stabiliteit en groeiruimte. TripleZero iT biedt duidelijke hostinglijnen zodat u snel de juiste keuze maakt.",
        ),
        h("Onze hostingopties"),
        l([
          "Shared Hosting — betaalbaar en compleet voor kleinere sites",
          "WordPress Hosting — geoptimaliseerd voor WordPress-prestaties",
          "VPS Hosting — meer resources en controle voor groeiende projecten",
          "Domeinregistratie — vind en registreer uw domeinnaam",
        ]),
        h("Wat u mag verwachten"),
        p(
          "U krijgt moderne resources, SSL waar van toepassing, support en backups afhankelijk van het plan. Wij helpen u graag kiezen op basis van verkeer, techniek en budget.",
        ),
        h("Domeinen"),
        p(
          "Registreer een domein vanaf scherpe starttarieven en koppel het eenvoudig aan uw hosting. Zo houdt u merk, e-mail en website bij één partner.",
        ),
        h("Advies nodig?"),
      ],
    },
    en: {
      title: "Web Hosting",
      subtitle:
        "Reliable hosting with TripleZero iT: choose shared, WordPress or VPS — plus domain registration at competitive rates.",
      blocks: [
        h("Hosting that fits your site"),
        p(
          "Whether you run a simple site, a WordPress project or a demanding application, the right hosting shapes speed, stability and room to grow. TripleZero iT offers clear hosting lines so you can choose with confidence.",
        ),
        h("Our hosting options"),
        l([
          "Shared Hosting — affordable and complete for smaller sites",
          "WordPress Hosting — optimized for WordPress performance",
          "VPS Hosting — more resources and control for growing projects",
          "Domain registration — find and register your domain name",
        ]),
        h("What to expect"),
        p(
          "You get modern resources, SSL where applicable, support and backups depending on the plan. We are happy to help you choose based on traffic, stack and budget.",
        ),
        h("Domains"),
        p(
          "Register a domain at competitive starting rates and connect it easily to your hosting — keeping brand, email and website with one partner.",
        ),
        h("Need advice?"),
      ],
    },
  },

  "shared-hosting": {
    nl: {
      title: "Shared Hosting",
      subtitle:
        "Betaalbare shared hosting met SSD, mailboxen, website builder, AI-tools, backups en 24/7 support — ideaal om snel online te gaan.",
      blocks: [
        h("Shared Hosting van TripleZero iT"),
        p(
          "Shared Hosting is een kostenefficiënte basis voor blogs, bedrijfssites en kleinere projecten. U deelt serverresources slim, terwijl essentiële features standaard meegaan.",
        ),
        h("Plannen in het kort"),
        l([
          "Basic — 3 websites, 20 GB SSD, 30 mailboxen",
          "Plus — onbeperkt websites, onbeperkt SSD, onbeperkt mailboxen",
          "Business — onbeperkt websites, 50 GB SSD, cloud storage",
        ]),
        h("Inbegrepen features"),
        l([
          "Website builder en AI-tools",
          "24/7 support",
          "AutoBackup (en bij Business ook cloud storage)",
        ]),
        h("Voor wie is shared hosting geschikt?"),
        p(
          "Perfect als u betrouwbaar wilt starten zonder overbodige complexiteit. Groeit uw verkeer of wilt u meer controle, dan kijkt u naar WordPress- of VPS-hosting.",
        ),
        h("Snel en overzichtelijk aan de slag"),
        p(
          "Kies het plan op basis van het aantal websites, benodigde opslag en e-mailgebruik. Daarna koppelt u uw domein, zet u uw website of builder klaar en richt u mailboxen in. TripleZero iT helpt wanneer u bij de inrichting ondersteuning nodig heeft.",
        ),
        h("Een praktische basis voor uw online aanwezigheid"),
        p(
          "U krijgt de essentiële voorzieningen voor een professionele website op één plek: opslag, e-mail, backups en hulp wanneer dat nodig is. Dat houdt de technische basis overzichtelijk terwijl uw organisatie online zichtbaar wordt.",
        ),
        h("Bestellen of advies"),
      ],
    },
    en: {
      title: "Shared Hosting",
      subtitle:
        "Affordable shared hosting with SSD, mailboxes, website builder, AI tools, backups and 24/7 support — ideal for getting online fast.",
      blocks: [
        h("Shared Hosting from TripleZero iT"),
        p(
          "Shared Hosting is a cost-effective foundation for blogs, business sites and smaller projects. You share server resources efficiently while essential features come standard.",
        ),
        h("Plans at a glance"),
        l([
          "Basic — 3 websites, 20 GB SSD, 30 mailboxes",
          "Plus — unlimited websites, unmetered SSD, unlimited mailboxes",
          "Business — unlimited websites, 50 GB SSD, cloud storage",
        ]),
        h("Included features"),
        l([
          "Website builder and AI tools",
          "24/7 support",
          "AutoBackup (and cloud storage on Business)",
        ]),
        h("Who is shared hosting for?"),
        p(
          "Perfect when you want a reliable start without unnecessary complexity. If traffic grows or you need more control, look at WordPress or VPS hosting.",
        ),
        h("Get online quickly and clearly"),
        p(
          "Choose a plan based on the number of websites, required storage and email use. Then connect your domain, set up your website or builder and configure mailboxes. TripleZero iT can help when you need support with the setup.",
        ),
        h("A practical base for your online presence"),
        p(
          "You get the essentials for a professional website in one place: storage, email, backups and help when needed. This keeps the technical foundation clear while your organisation becomes visible online.",
        ),
        h("Order or get advice"),
      ],
    },
  },

  "wordpress-hosting": {
    nl: {
      title: "WordPress Hosting",
      subtitle:
        "Hosting die is afgestemd op WordPress: snelle SSD-opslag, CDN, SSL, backups en support — van starter tot high-traffic.",
      blocks: [
        h("WordPress Hosting met focus op prestaties"),
        p(
          "WordPress verdient een omgeving die is ingericht op snelheid, updates en veiligheid. TripleZero iT biedt WordPress Hosting met resources die meegroeien met uw verkeer.",
        ),
        h("Plannen"),
        l([
          "Basic — 10 GB SSD, tot 50k bezoekers/maand, gratis CDN & SSL",
          "Plus — 50 GB SSD, tot 200k bezoekers/maand, meer CPU/RAM, Brizy",
          "Pro — 100 GB SSD, tot 500k bezoekers/maand, 99,9% uptime-garantie",
        ]),
        h("Waarom WordPress Hosting?"),
        p(
          "U krijgt een stack die is geoptimaliseerd voor WordPress-workloads, met eenvoudige backups en 24/7 support. Minder gedoe, meer focus op content en conversie.",
        ),
        h("Schaal wanneer u klaar bent"),
        p(
          "Start lean en upgrade wanneer bezoek en resourcebehoefte toenemen. Jaarlijkse betaling kan aantrekkelijke korting opleveren op het eerste jaar.",
        ),
        h("Zo maken we de overstap eenvoudig"),
        p(
          "We bekijken uw huidige website, verwacht verkeer, plugins en benodigde functionaliteit. Op basis daarvan kiest u een passend plan en plannen we de inrichting of migratie zorgvuldig, met aandacht voor bereikbaarheid en een gecontroleerde livegang.",
        ),
        h("Meer ruimte voor groei"),
        p(
          "Een passende WordPress-omgeving ondersteunt een snelle gebruikerservaring en een stabiele basis voor campagnes, content en conversie. U kunt opschalen zodra uw website meer bezoekers of capaciteit vraagt.",
        ),
        h("Hulp bij kiezen"),
      ],
    },
    en: {
      title: "WordPress Hosting",
      subtitle:
        "Hosting tailored for WordPress: fast SSD storage, CDN, SSL, backups and support — from starter sites to high traffic.",
      blocks: [
        h("WordPress Hosting focused on performance"),
        p(
          "WordPress deserves an environment built for speed, updates and security. TripleZero iT offers WordPress Hosting with resources that scale with your traffic.",
        ),
        h("Plans"),
        l([
          "Basic — 10 GB SSD, up to 50k visitors/month, free CDN & SSL",
          "Plus — 50 GB SSD, up to 200k visitors/month, more CPU/RAM, Brizy",
          "Pro — 100 GB SSD, up to 500k visitors/month, 99.9% uptime guarantee",
        ]),
        h("Why WordPress Hosting?"),
        p(
          "You get a stack optimized for WordPress workloads, with easy backups and 24/7 support. Less ops overhead, more focus on content and conversion.",
        ),
        h("Scale when you are ready"),
        p(
          "Start lean and upgrade when visitors and resource needs grow. Yearly billing can offer attractive first-year savings.",
        ),
        h("Making the move straightforward"),
        p(
          "We review your current website, expected traffic, plugins and required functionality. From there, you choose a suitable plan and we carefully schedule the setup or migration, with attention to availability and a controlled launch.",
        ),
        h("More room to grow"),
        p(
          "A suitable WordPress environment supports a fast user experience and a stable foundation for campaigns, content and conversion. You can scale when your website needs more visitors or capacity.",
        ),
        h("Need help choosing?"),
      ],
    },
  },

  "vps-hosting": {
    nl: {
      title: "VPS Hosting",
      subtitle:
        "Meer power en controle met VPS: dedicated resources, SSD RAID 10 en schaalbare CPU/RAM/bandbreedte voor groeiende projecten.",
      blocks: [
        h("VPS wanneer shared niet meer volstaat"),
        p(
          "Een Virtual Private Server geeft u gereserveerde resources in een flexibele omgeving. TripleZero iT biedt VPS-hosting voor sites en applicaties die meer prestatie en isolatie nodig hebben.",
        ),
        h("Onze VPS-plannen"),
        l([
          "Basic — 2 CPU-cores, 2 GB RAM, 40 GB SSD RAID 10, 1000 GB bandbreedte",
          "Plus — 4 CPU-cores, 6 GB RAM, 120 GB SSD RAID 10, 3000 GB bandbreedte",
          "Business — 8 CPU-cores, 12 GB RAM, 240 GB SSD RAID 10, 6000 GB bandbreedte",
        ]),
        h("Voor wie is VPS geschikt?"),
        p(
          "Voor groeiende websites, maatwerkapplicaties, hogere trafficpieken of situaties waarin u meer controle wilt over de serveromgeving.",
        ),
        h("Betrouwbare basis"),
        p(
          "SSD RAID 10 en duidelijke resourcegrenzen geven voorspelbare prestaties. U schaalt omhoog wanneer uw project dat vraagt.",
        ),
        h("Van behoefte naar serverconfiguratie"),
        p(
          "We bespreken uw applicatie, verwachte belasting, opslag, beveiliging en gewenste beheerniveau. Daarmee kiest u geen capaciteit op gevoel, maar een VPS-plan dat aansluit op de technische eisen van vandaag en de volgende groeifase.",
        ),
        h("Controle voor bedrijfskritische workloads"),
        p(
          "Met gereserveerde capaciteit creëert u meer rust voor veeleisende websites en applicaties. Uw omgeving kan zich beter aanpassen aan pieken, nieuwe functionaliteit en veranderende prestaties zonder direct van platform te hoeven wisselen.",
        ),
        h("Advies"),
      ],
    },
    en: {
      title: "VPS Hosting",
      subtitle:
        "More power and control with VPS: dedicated resources, SSD RAID 10 and scalable CPU/RAM/bandwidth for growing projects.",
      blocks: [
        h("VPS when shared is no longer enough"),
        p(
          "A Virtual Private Server gives you reserved resources in a flexible environment. TripleZero iT offers VPS hosting for sites and applications that need more performance and isolation.",
        ),
        h("Our VPS plans"),
        l([
          "Basic — 2 CPU cores, 2 GB RAM, 40 GB SSD RAID 10, 1000 GB bandwidth",
          "Plus — 4 CPU cores, 6 GB RAM, 120 GB SSD RAID 10, 3000 GB bandwidth",
          "Business — 8 CPU cores, 12 GB RAM, 240 GB SSD RAID 10, 6000 GB bandwidth",
        ]),
        h("Who is VPS for?"),
        p(
          "For growing websites, custom applications, higher traffic peaks or situations where you want more control over the server environment.",
        ),
        h("A reliable foundation"),
        p(
          "SSD RAID 10 and clear resource limits deliver predictable performance. Scale up when your project needs it.",
        ),
        h("From needs to server configuration"),
        p(
          "We discuss your application, expected load, storage, security and preferred level of management. This lets you choose capacity based on today’s technical requirements and the next growth phase, rather than guesswork.",
        ),
        h("Control for business-critical workloads"),
        p(
          "Reserved capacity gives demanding websites and applications more headroom. Your environment can adapt more easily to peaks, new functionality and changing performance needs without an immediate platform move.",
        ),
        h("Advice"),
      ],
    },
  },

  domains: {
    nl: {
      title: "Domeinen",
      subtitle:
        "Registreer uw domeinnaam scherp en koppel hem eenvoudig aan hosting, e-mail en uw merk bij TripleZero iT.",
      blocks: [
        h("Uw digitale adres begint hier"),
        p(
          "Een sterke domeinnaam is de basis van uw online identiteit. Bij TripleZero iT registreert u domeinen vanaf aantrekkelijke starttarieven en houdt u merk, site en mail overzichtelijk bij elkaar.",
        ),
        h("Wat wij bieden"),
        l([
          "Domeinregistratie voor populaire extensies",
          "Eenvoudige koppeling met hosting",
          "DNS-beheer en doorverwijzingen",
          "Ondersteuning bij keuze en setup",
        ]),
        h("Waarom bij ons registreren?"),
        p(
          "U voorkomt versnippering tussen meerdere leveranciers. Hosting, domein en support zitten bij één partner: TripleZero iT.",
        ),
        h("De juiste keuze voor uw merk"),
        p(
          "We helpen u kijken naar herkenbaarheid, doelgroep, markten en toekomstige uitbreiding. Een passende extensie ondersteunt een duidelijke, professionele uitstraling en voorkomt dat u later onnodig moet wijzigen.",
        ),
        h("Van registratie tot verbinding"),
        p(
          "Na registratie begeleiden we desgewenst de DNS-instellingen, koppeling met hosting en e-mailconfiguratie. Zo wordt uw domein niet alleen vastgelegd, maar ook correct ingezet voor uw website en zakelijke communicatie.",
        ),
        h("Aan de slag"),
      ],
    },
    en: {
      title: "Domains",
      subtitle:
        "Register your domain competitively and connect it easily to hosting, email and your brand with TripleZero iT.",
      blocks: [
        h("Your digital address starts here"),
        p(
          "A strong domain name is the foundation of your online identity. With TripleZero iT you register domains at attractive starting rates and keep brand, site and mail together.",
        ),
        h("What we offer"),
        l([
          "Domain registration for popular extensions",
          "Easy connection to hosting",
          "DNS management and redirects",
          "Support with choice and setup",
        ]),
        h("Why register with us?"),
        p(
          "You avoid splitting providers. Hosting, domain and support stay with one partner: TripleZero iT.",
        ),
        h("The right choice for your brand"),
        p(
          "We can help you assess recognition, audience, markets and future expansion. The right extension supports a clear, professional identity and avoids an unnecessary change later.",
        ),
        h("From registration to connection"),
        p(
          "After registration, we can help with DNS settings, hosting connection and email configuration. Your domain is therefore not only registered, but correctly put to work for your website and business communication.",
        ),
        h("Get started"),
      ],
    },
  },
};

export function getPageI18n(slug: string, locale: string): PageI18n | null {
  const entry = pageI18n[slug];
  if (!entry) return null;
  if (locale === "nl") return entry.nl;
  if (locale === "en") return entry.en;
  const fromPack = (pageI18nPack as Record<string, Record<string, PageI18n>>)[locale]?.[
    slug
  ];
  if (fromPack?.title && Array.isArray(fromPack.blocks)) return fromPack;
  const overlay = getLocalizedCopySync<PageI18n>("page", slug, locale);
  if (overlay?.title && Array.isArray(overlay.blocks)) return overlay;
  return entry.en;
}

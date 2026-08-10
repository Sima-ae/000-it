export type ProductI18n = {
  name?: string;
  shortDescription: string;
  description?: string; // optional; if missing, shortDescription is enough for lean hosting cards
};

export const productI18n: Record<string, { nl: ProductI18n; en: ProductI18n }> = {
  "basic-support": {
    nl: {
      name: "Basic Support",
      shortDescription: `Wat kunt u verwachten?
– 1 website
– 24/7 monitoring & support
– Dagelijkse backups
– WordPress & plugin updates
– Websitefouten herstellen
– Malware verwijderen & beveiliging`,
      description: `Basic Support is er voor ondernemers met één WordPress-website die een betrouwbare technische basis willen zonder zelf elk probleem te hoeven oplossen.

Wij monitoren uw site dag en nacht, maken dagelijkse back-ups en houden WordPress en plugins actueel. Ook lossen we fouten op, verwijderen we malware en passen we praktische beveiligingsmaatregelen toe om uw website beschikbaar en beschermd te houden.

TripleZero iT pakt incidenten zorgvuldig aan, controleert de werking na herstel en helpt risico’s voor te blijven. Zo kunt u zich richten op uw onderneming terwijl wij de technische continuïteit bewaken.

Wilt u weten of Basic Support bij uw website past? Neem contact op via info@000-it.com of bezoek 000-it.com.`,
    },
    en: {
      name: "Basic Support",
      shortDescription: `What can you expect?
– 1 website
– 24/7 monitoring & support
– Daily backups
– WordPress & plugin updates
– Fix website errors
– Malware removal & security`,
      description: `Basic Support is for businesses with one WordPress website that want a dependable technical foundation without having to resolve every issue themselves.

We monitor your site around the clock, create daily backups and keep WordPress and plugins current. We also fix errors, remove malware and apply practical security measures to keep your website available and protected.

TripleZero iT handles incidents carefully, verifies the site after recovery and helps reduce future risk. You can focus on your business while we look after its technical continuity.

Would you like to see whether Basic Support fits your website? Contact info@000-it.com or visit 000-it.com.`,
    },
  },

  "standard-support": {
    nl: {
      name: "Standard Support",
      shortDescription: `Wat kunt u verwachten?
– 2 websites
– 24/7 monitoring & support
– Dagelijkse backups
– WordPress & plugin updates
– Websitefouten herstellen
– Malware verwijderen & beveiliging
– Snelheid optimaliseren`,
      description: `Standard Support is geschikt voor organisaties met maximaal twee WordPress-websites die naast dagelijks onderhoud ook aandacht voor snelheid en continuïteit nodig hebben.

U krijgt 24/7 monitoring, dagelijkse back-ups, updates, foutoplossing, malwareverwijdering en beveiliging. Wij optimaliseren daarnaast caching, afbeeldingen en code waar dat de prestaties van uw websites verbetert.

TripleZero iT werkt proactief: we signaleren aandachtspunten, pakken technische problemen gericht aan en houden uw websites stabiel voor bezoekers en beheerders.

Bespreek uw websites met ons via info@000-it.com of kijk op 000-it.com.`,
    },
    en: {
      name: "Standard Support",
      shortDescription: `What can you expect?
– 2 websites
– 24/7 monitoring & support
– Daily backups
– WordPress & plugin updates
– Fix website errors
– Malware removal & security
– Speed optimization`,
      description: `Standard Support suits organisations with up to two WordPress websites that need everyday maintenance as well as attention to speed and continuity.

You receive 24/7 monitoring, daily backups, updates, error resolution, malware removal and security care. We also optimise caching, images and code where it improves your websites’ performance.

TripleZero iT works proactively: we flag issues, resolve technical problems with focus and keep your websites stable for visitors and administrators.

Discuss your websites with us at info@000-it.com or visit 000-it.com.`,
    },
  },

  "premium-support": {
    nl: {
      name: "Premium Support",
      shortDescription: `Wat kunt u verwachten?
– 3-5 websites
– 24/7 monitoring & support
– Dagelijkse backups
– WordPress & plugin updates
– Websitefouten herstellen
– Malware verwijderen & beveiliging
– Snelheid optimaliseren
– SEO optimalisatie`,
      description: `Premium Support is voor groeiende organisaties met drie tot vijf WordPress-websites die één partner zoeken voor onderhoud, beveiliging, prestaties en online zichtbaarheid.

Naast 24/7 monitoring, back-ups, updates, foutoplossing en malwareverwijdering verbeteren we laadtijden en verzorgen we praktische SEO-optimalisaties. Daarmee krijgen uw websites een sterke, consistente basis voor bezoekers én zoekmachines.

TripleZero iT bewaakt uw omgeving proactief en vertaalt technische werkzaamheden naar heldere verbeteringen, zodat u grip houdt terwijl wij het dagelijkse beheer verzorgen.

Klaar voor complete WordPress-zorg? Mail info@000-it.com of bezoek 000-it.com.`,
    },
    en: {
      name: "Premium Support",
      shortDescription: `What can you expect?
– 3-5 websites
– 24/7 monitoring & support
– Daily backups
– WordPress & plugin updates
– Fix website errors
– Malware removal & security
– Speed optimization
– SEO optimization`,
      description: `Premium Support is for growing organisations with three to five WordPress websites that want one partner for maintenance, security, performance and online visibility.

Alongside 24/7 monitoring, backups, updates, error resolution and malware removal, we improve load times and deliver practical SEO optimisation. This gives your websites a strong, consistent foundation for visitors and search engines.

TripleZero iT monitors your environment proactively and turns technical work into clear improvements, so you retain control while we handle day-to-day care.

Ready for complete WordPress care? Email info@000-it.com or visit 000-it.com.`,
    },
  },

  "seo-optimization": {
    nl: {
      name: "SEO-optimalisatie",
      shortDescription: `Wat kunt u verwachten?
– Volledige automatische + handmatige backup
– SEO-prestatie-audit
– On-page, technische, off-page, lokale en e-commerce SEO
– Analytics en rapportage
– Gratis support gedurende 7 dagen`,
      description: `Versterk uw online zichtbaarheid met professionele SEO-optimalisatie van TripleZero iT. Goede SEO verhoogt organisch verkeer, zoekposities en de kwaliteit van bezoekers die uw website bereiken.

Wij combineren een duidelijke prestatie-audit met gerichte acties: on-page optimalisatie, technische SEO, off-page signalen, lokale vindbaarheid en — indien relevant — e-commerce SEO voor product- en categorietrajecten.

U ontvangt inzichtelijke rapportage over voortgang en prioriteiten, zodat u weet wat er is gedaan en wat de volgende stap is. Na oplevering krijgt u 7 dagen gratis support voor vragen over de uitgevoerde werkzaamheden.

Neem contact op via info@000-it.com of bezoek 000-it.com om uw SEO-doelen te bespreken.`,
    },
    en: {
      name: "SEO Optimization",
      shortDescription: `What can you expect?
– A complete automatic + manual backup
– SEO performance audit
– On-page, technical, off-page, local and e-commerce SEO
– Analytics and reporting
– Free support for 7 days`,
      description: `Improve your search visibility with professional SEO Optimization from TripleZero iT. Strong SEO helps you earn organic traffic, better rankings and more relevant visitors.

We start with a performance audit, then deliver focused work across on-page SEO, technical foundations, off-page signals, local visibility and — where relevant — e-commerce SEO for product and category journeys.

You receive clear reporting on progress and priorities, so you always know what changed and what comes next. After delivery you get 7 days of free support for questions about the completed work.

Contact us at info@000-it.com or visit 000-it.com to discuss your SEO goals.`,
    },
  },

  "shared-hosting-basic": {
    nl: {
      name: "Shared Hosting Basic",
      shortDescription: `– 3 Websites
– 20 GB SSD
– 30 Mailboxen
– Website Builder
– AI Tools
– 24/7 Support
– AutoBackup`,
      description: `Shared Hosting Basic is ideaal voor starters, zelfstandigen en kleine teams die een professionele thuisbasis voor maximaal drie websites zoeken.

U beschikt over 20 GB SSD-opslag, 30 mailboxen, een websitebouwer, AI-tools en automatische back-ups. Zo heeft u de essentiële ruimte en hulpmiddelen om uw online aanwezigheid betrouwbaar op te bouwen.

TripleZero iT zorgt voor een stabiele hostingomgeving en 24/7 support wanneer u hulp nodig heeft. U houdt het eenvoudig, terwijl uw websites en e-mail professioneel blijven draaien.

Wilt u starten met betrouwbare hosting? Mail info@000-it.com of bezoek 000-it.com.`,
    },
    en: {
      name: "Shared Hosting Basic",
      shortDescription: `– 3 Websites
– 20 GB SSD
– 30 Mailboxes
– Website Builder
– AI Tools
– 24/7 Support
– AutoBackup`,
      description: `Shared Hosting Basic is ideal for startups, independent professionals and small teams that need a professional home for up to three websites.

You receive 20 GB SSD storage, 30 mailboxes, a website builder, AI tools and automated backups. It provides the essential space and tools to build a dependable online presence.

TripleZero iT provides a stable hosting environment and 24/7 support whenever you need help. You keep things simple while your websites and email continue to run professionally.

Ready to get started with reliable hosting? Email info@000-it.com or visit 000-it.com.`,
    },
  },

  "shared-hosting-plus": {
    nl: {
      name: "Shared Hosting Plus",
      shortDescription: `– Onbeperkt Websites
– Onbeperkt SSD
– Onbeperkt Mailboxen
– Website Builder
– AI Tools
– 24/7 Support
– AutoBackup`,
      description: `Shared Hosting Plus is gemaakt voor ondernemers en groeiende teams die meerdere websites en mailboxen zonder krappe limieten willen beheren.

Met onbeperkte websites, SSD-opslag en mailboxen, plus een websitebouwer, AI-tools en AutoBackup, krijgt u de flexibiliteit om nieuwe projecten en communicatie eenvoudig toe te voegen.

TripleZero iT levert een toegankelijke, betrouwbare hostingbasis met 24/7 support. Zo groeit uw digitale omgeving mee zonder dat u het dagelijkse beheer ingewikkeld maakt.

Bespreek uw hostingbehoefte via info@000-it.com of 000-it.com.`,
    },
    en: {
      name: "Shared Hosting Plus",
      shortDescription: `– Unlimited Websites
– Unmetered SSD
– Unlimited Mailboxes
– Website Builder
– AI Tools
– 24/7 Support
– AutoBackup`,
      description: `Shared Hosting Plus is built for entrepreneurs and growing teams that want to manage multiple websites and mailboxes without restrictive limits.

With unlimited websites, SSD storage and mailboxes, plus a website builder, AI tools and AutoBackup, you have the flexibility to add projects and communication as you grow.

TripleZero iT delivers an accessible, dependable hosting foundation with 24/7 support. Your digital environment can expand without making daily administration complicated.

Discuss your hosting needs at info@000-it.com or 000-it.com.`,
    },
  },

  "shared-hosting-business": {
    nl: {
      name: "Shared Hosting Business",
      shortDescription: `– Onbeperkt Websites
– 50 GB SSD
– Onbeperkt Mailboxen
– Website Builder
– AI Tools
– 24/7 Support
– AutoBackup & Cloud Storage`,
      description: `Shared Hosting Business past bij organisaties die meerdere websites, e-mail en bestanden centraal en professioneel willen onderbrengen.

U krijgt onbeperkte websites en mailboxen, 50 GB SSD-opslag, een websitebouwer, AI-tools en AutoBackup met cloudopslag. Dat combineert ruimte voor uw dagelijkse werk met extra zekerheid voor belangrijke data.

TripleZero iT biedt een stabiele omgeving en 24/7 support als uw organisatie vragen heeft of hulp nodig heeft. Zo houdt u uw online infrastructuur overzichtelijk en klaar voor groei.

Neem contact op via info@000-it.com of ontdek meer op 000-it.com.`,
    },
    en: {
      name: "Shared Hosting Business",
      shortDescription: `– Unlimited Websites
– 50 GB SSD
– Unlimited Mailboxes
– Website Builder
– AI Tools
– 24/7 Support
– AutoBackup & Cloud Storage`,
      description: `Shared Hosting Business fits organisations that want to host multiple websites, email and files centrally and professionally.

You receive unlimited websites and mailboxes, 50 GB SSD storage, a website builder, AI tools and AutoBackup with cloud storage. It combines room for daily operations with added reassurance for important data.

TripleZero iT provides a stable environment and 24/7 support whenever your organisation needs assistance. Keep your online infrastructure organised and ready to grow.

Contact info@000-it.com or learn more at 000-it.com.`,
    },
  },

  "vps-hosting-basic": {
    nl: {
      name: "VPS Hosting Basic",
      shortDescription: `– 2 CPU-cores
– 2 GB RAM
– 40 GB SSD RAID 10
– 1000 GB bandbreedte`,
      description: `VPS Hosting Basic is geschikt voor ontwikkelaars, kleine applicaties en websites die meer controle en voorspelbare resources nodig hebben dan shared hosting biedt.

Met 2 CPU-cores, 2 GB RAM, 40 GB SSD RAID 10-opslag en 1000 GB bandbreedte krijgt u een solide virtuele server voor lichte tot gemiddelde workloads.

TripleZero iT helpt u met een betrouwbare infrastructuurbasis, zodat u kunt focussen op uw applicatie, website of ontwikkelomgeving. U schaalt door wanneer uw vraag toeneemt.

Wilt u uw VPS-vereisten bespreken? Mail info@000-it.com of bezoek 000-it.com.`,
    },
    en: {
      name: "VPS Hosting Basic",
      shortDescription: `– 2 CPU cores
– 2 GB RAM
– 40 GB SSD RAID 10
– 1000 GB bandwidth`,
      description: `VPS Hosting Basic is suited to developers, small applications and websites that need more control and predictable resources than shared hosting provides.

With 2 CPU cores, 2 GB RAM, 40 GB SSD RAID 10 storage and 1000 GB bandwidth, you get a solid virtual server for light to moderate workloads.

TripleZero iT gives you a dependable infrastructure foundation, so you can focus on your application, website or development environment. Scale up when demand grows.

Want to discuss your VPS requirements? Email info@000-it.com or visit 000-it.com.`,
    },
  },

  "vps-hosting-plus": {
    nl: {
      name: "VPS Hosting Plus",
      shortDescription: `– 4 CPU-cores
– 6 GB RAM
– 120 GB SSD RAID 10
– 3000 GB bandbreedte`,
      description: `VPS Hosting Plus is voor groeiende webprojecten, zakelijke applicaties en ontwikkelteams die extra capaciteit en consistente prestaties nodig hebben.

De server combineert 4 CPU-cores en 6 GB RAM met 120 GB SSD RAID 10-opslag en 3000 GB bandbreedte. Daarmee is er ruimte voor zwaardere workloads, meerdere services of toenemend verkeer.

TripleZero iT levert een betrouwbare VPS-basis waarop u uw omgeving naar eigen behoefte kunt inrichten. Zo krijgt u de flexibiliteit van een virtuele server met een professionele partner dichtbij.

Neem contact op via info@000-it.com of 000-it.com voor advies.`,
    },
    en: {
      name: "VPS Hosting Plus",
      shortDescription: `– 4 CPU cores
– 6 GB RAM
– 120 GB SSD RAID 10
– 3000 GB bandwidth`,
      description: `VPS Hosting Plus is for growing web projects, business applications and development teams that need additional capacity and consistent performance.

The server combines 4 CPU cores and 6 GB RAM with 120 GB SSD RAID 10 storage and 3000 GB bandwidth. This leaves room for heavier workloads, multiple services or increasing traffic.

TripleZero iT delivers a dependable VPS foundation that you can configure around your needs. Gain the flexibility of a virtual server with a professional partner close by.

Contact info@000-it.com or visit 000-it.com for advice.`,
    },
  },

  "vps-hosting-business": {
    nl: {
      name: "VPS Hosting Business",
      shortDescription: `– 8 CPU-cores
– 12 GB RAM
– 240 GB SSD RAID 10
– 6000 GB bandbreedte`,
      description: `VPS Hosting Business is ontworpen voor bedrijfskritische websites, veeleisende applicaties en organisaties die ruime capaciteit en stabiele prestaties verwachten.

Met 8 CPU-cores, 12 GB RAM, 240 GB SSD RAID 10-opslag en 6000 GB bandbreedte biedt dit pakket een krachtige basis voor intensieve workloads, meerdere omgevingen en hogere bezoekersaantallen.

TripleZero iT helpt u een betrouwbare infrastructuur neer te zetten die met uw ambities meebeweegt. U houdt de controle over uw VPS, met een deskundige partij bereikbaar voor ondersteuning.

Vraag advies aan via info@000-it.com of bezoek 000-it.com.`,
    },
    en: {
      name: "VPS Hosting Business",
      shortDescription: `– 8 CPU cores
– 12 GB RAM
– 240 GB SSD RAID 10
– 6000 GB bandwidth`,
      description: `VPS Hosting Business is designed for business-critical websites, demanding applications and organisations that expect ample capacity and stable performance.

With 8 CPU cores, 12 GB RAM, 240 GB SSD RAID 10 storage and 6000 GB bandwidth, this plan provides a powerful base for intensive workloads, multiple environments and higher visitor volumes.

TripleZero iT helps you build dependable infrastructure that moves with your ambitions. You retain control of your VPS, with an experienced team available for support.

Request advice at info@000-it.com or visit 000-it.com.`,
    },
  },

  "wordpress-hosting-basic": {
    nl: {
      name: "WordPress Hosting Basic",
      shortDescription: `– 10 GB SSD
– 50k bezoekers/maand
– Gratis CDN
– Gratis SSL
– 24/7 Support
– Eenvoudige backups`,
      description: `WordPress Hosting Basic is een slimme keuze voor starters en kleine bedrijven die hun WordPress-website snel, veilig en professioneel online willen houden.

U krijgt 10 GB SSD-opslag, capaciteit voor circa 50.000 bezoekers per maand, een gratis CDN en SSL-certificaat. Eenvoudige back-ups en 24/7 support helpen u om met vertrouwen te publiceren en uw site te beheren.

TripleZero iT biedt de technische basis waarop uw WordPress-site stabiel kan presteren, zodat u tijd overhoudt voor uw content, klanten en onderneming.

Start uw WordPress-project via info@000-it.com of 000-it.com.`,
    },
    en: {
      name: "WordPress Hosting Basic",
      shortDescription: `– 10 GB SSD
– 50k visitors/month
– Free CDN
– Free SSL
– 24/7 Support
– Easy Backups`,
      description: `WordPress Hosting Basic is a smart choice for startups and small businesses that want to keep their WordPress website fast, secure and professional online.

You receive 10 GB SSD storage, capacity for around 50,000 visitors per month, a free CDN and SSL certificate. Easy backups and 24/7 support help you publish and manage your site with confidence.

TripleZero iT provides the technical foundation your WordPress site needs to perform reliably, giving you more time for content, customers and your business.

Start your WordPress project at info@000-it.com or 000-it.com.`,
    },
  },

  "wordpress-hosting-plus": {
    nl: {
      name: "WordPress Hosting Plus",
      shortDescription: `– 50 GB SSD
– 200k bezoekers/maand
– 1,5× meer CPU
– 1,5× meer RAM
– Gratis CDN
– Gratis SSL
– 24/7 Support
– Eenvoudige backups
– Gratis Brizy Site Builder (NIEUW)`,
      description: `WordPress Hosting Plus is bedoeld voor groeiende bedrijven, campagnes en contentrijke websites die meer ruimte en rekenkracht nodig hebben.

Met 50 GB SSD-opslag, capaciteit voor circa 200.000 bezoekers per maand en 1,5× meer CPU en RAM kan uw site comfortabel meegroeien. Gratis CDN, SSL, back-ups, 24/7 support en Brizy Site Builder maken bouwen en beheren eenvoudiger.

TripleZero iT levert een krachtige WordPress-omgeving die prestaties en gebruiksgemak combineert. Zo blijft uw website snel en betrouwbaar terwijl uw bereik groeit.

Wilt u doorgroeien met WordPress? Neem contact op via info@000-it.com of 000-it.com.`,
    },
    en: {
      name: "WordPress Hosting Plus",
      shortDescription: `– 50 GB SSD
– 200k visitors/month
– 1.5x more CPU
– 1.5x more RAM
– Free CDN
– Free SSL
– 24/7 Support
– Easy Backups
– Free Brizy Site Builder (NEW)`,
      description: `WordPress Hosting Plus is designed for growing businesses, campaigns and content-rich websites that need more room and processing power.

With 50 GB SSD storage, capacity for around 200,000 visitors per month and 1.5x more CPU and RAM, your site can grow comfortably. A free CDN, SSL, backups, 24/7 support and Brizy Site Builder make building and managing easier.

TripleZero iT delivers a powerful WordPress environment that combines performance with ease of use. Your website stays fast and dependable as your reach expands.

Ready to grow with WordPress? Contact info@000-it.com or visit 000-it.com.`,
    },
  },

  "wordpress-hosting-business": {
    nl: {
      name: "WordPress Hosting Pro",
      shortDescription: `– 100 GB SSD
– 500k bezoekers/maand
– 2,0× meer CPU
– 2,0× meer RAM
– 99,9% uptime-garantie
– Gratis CDN
– Gratis SSL
– 24/7 Support
– Eenvoudige backups
– Gratis Brizy Site Builder (NIEUW)`,
      description: `WordPress Hosting Pro is voor ambitieuze organisaties, drukbezochte websites en zakelijke teams die maximale WordPress-capaciteit en continuïteit verwachten.

U krijgt 100 GB SSD-opslag, capaciteit voor circa 500.000 bezoekers per maand en 2,0× meer CPU en RAM. De 99,9% uptime-garantie, gratis CDN en SSL, back-ups, 24/7 support en Brizy Site Builder ondersteunen een professionele online operatie.

TripleZero iT biedt een robuuste hostingomgeving waarin snelheid, bereikbaarheid en schaalbaarheid centraal staan. Zo kan uw WordPress-site ook onder hogere belasting betrouwbaar blijven presteren.

Bespreek uw professionele hosting via info@000-it.com of 000-it.com.`,
    },
    en: {
      name: "WordPress Hosting Pro",
      shortDescription: `– 100 GB SSD
– 500k visitors/month
– 2.0x more CPU
– 2.0x more RAM
– 99.9% uptime guarantee
– Free CDN
– Free SSL
– 24/7 Support
– Easy Backups
– Free Brizy Site Builder (NEW)`,
      description: `WordPress Hosting Pro is for ambitious organisations, high-traffic websites and business teams that expect maximum WordPress capacity and continuity.

You receive 100 GB SSD storage, capacity for around 500,000 visitors per month and 2.0x more CPU and RAM. The 99.9% uptime guarantee, free CDN and SSL, backups, 24/7 support and Brizy Site Builder support a professional online operation.

TripleZero iT provides a robust hosting environment focused on speed, availability and scalability. Your WordPress site can keep performing reliably even under greater load.

Discuss your professional hosting at info@000-it.com or 000-it.com.`,
    },
  },

  "wordpress-backup-hosting-migration": {
    nl: {
      name: "Back-ups en migratie",
      shortDescription: `Wat kunt u verwachten?
– Volledige automatische + handmatige backup
– Migratie naar nieuwe webhosting
– Setup van de nieuwe hostingomgeving
– Gratis support gedurende 7 dagen`,
      description: `Bescherm uw WordPress-website en verhuis zorgeloos met de backup- en migratieservice van TripleZero iT. Of u nu van host wisselt, een plan upgrade of gewoon een betrouwbare backup wilt: wij zorgen voor een veilige overstap zonder onnodige downtime.

Wij maken een volledige backup van bestanden, database, thema’s, plugins en media. Daarna migreren wij uw site naar de nieuwe omgeving, controleren we compatibiliteit en zetten we essentiële hostinginstellingen correct klaar.

Na oplevering krijgt u 7 dagen gratis support voor vragen over backup, herstel of de migratie. Zo blijft uw site integer, bereikbaar en klaar voor verder groeien.

Neem contact op via info@000-it.com of bezoek 000-it.com.`,
    },
    en: {
      name: "Backups and Migration",
      shortDescription: `What can you expect?
– A complete automatic + manual backup
– Migration to a new web hosting
– Setup for new web hosting
– Free support for 7 days`,
      description: `Protect your WordPress site and move with confidence using TripleZero iT backup and hosting migration. Whether you are changing hosts, upgrading your plan or simply need a reliable backup, we keep the transition calm and controlled.

We create a full backup of files, database, themes, plugins and media. Then we migrate your site, verify compatibility and set up key hosting configuration so everything works in the new environment.

After delivery you receive 7 days of free support for questions about backup, restore or migration. Your site stays intact, reachable and ready to grow.

Contact us at info@000-it.com or visit 000-it.com.`,
    },
  },

  "wordpress-error-fix": {
    nl: {
      name: "Bugs en fouten herstellen",
      shortDescription: `WordPress-bugs of -fouten herstellen, met focus op prestaties, beveiliging, updates en stabiliteit.

Wij helpen bij veelvoorkomende problemen en best practices zodat uw WordPress-website weer optimaal werkt voor u, ontwikkelaars en bezoekers.`,
      description: `WordPress is krachtig, maar foutmeldingen, pluginconflicten of thema-problemen kunnen uw site snel verstoren. TripleZero iT herstelt WordPress-fouten snel en gericht, zodat downtime beperkt blijft en functionaliteit terugkeert.

Wij diagnosticeren de oorzaak — van white screens en HTTP-fouten tot databaseproblemen — en lossen het structureel op. Daarna controleren wij kritieke flows zoals login, formulieren en (indien van toepassing) checkout.

U krijgt een duidelijke aanpak en praktische aanbevelingen om herhaling te voorkomen. Zo blijft uw online aanwezigheid stabiel en professioneel.

Vragen? Mail info@000-it.com of bezoek 000-it.com.`,
    },
    en: {
      name: "Fix Bugs and Errors",
      shortDescription: `WordPress bug and error fixing for performance, security, updates and stability.

We resolve common issues and apply best practices so your WordPress site works reliably for owners, developers and visitors.`,
      description: `WordPress is powerful, but error messages, plugin conflicts or theme problems can disrupt your site quickly. TripleZero iT diagnoses and fixes WordPress errors with a clear focus on restoring functionality and limiting downtime.

We investigate root causes — from white screens and HTTP errors to database issues — then apply a durable fix. Critical flows such as login, forms and checkout (when relevant) are checked before handoff.

You receive practical recommendations to reduce recurrence, so your online presence stays stable and professional.

Questions? Email info@000-it.com or visit 000-it.com.`,
    },
  },

  "wordpress-malware-removal": {
    nl: {
      name: "Malware verwijderen",
      shortDescription: `Wat kunt u verwachten?
– Een schone, werkende WordPress-site
– Verwijderen van gedetecteerde malware en redirects
– Oorzaak opsporen en herstellen
– Backup vóór en na de opschoning

Na een succesvolle opschoning ontvangt u ook instructies om malware in de toekomst te voorkomen.`,
      description: `Bescherm uw WordPress-website tegen kwaadaardige dreigingen met malwareverwijdering van TripleZero iT. Malware schaadt beveiliging, reputatie en uptime — wij focussen op snelle detectie, grondige opschoning en herstel.

Wij scannen bestanden, database en kwetsbare onderdelen, verwijderen malware en ongewenste redirects, en herstellen waar nodig gecompromitteerde onderdelen. Voor en na de schoonmaak maken wij een backup.

Na afronding ontvangt u preventietips zodat uw site beter bestand is tegen herinfectie. Zo kunt u weer veilig verder met uw bedrijf.

Contact: info@000-it.com · 000-it.com.`,
    },
    en: {
      name: "Malware Removal",
      shortDescription: `What can you expect?
– A clean, working WordPress site
– Removal of detected malware and redirects
– Finding and fixing the source of the problem
– Backup before and after the cleanup

After a successful cleanup, we also provide guidance on how to prevent malware in the future.`,
      description: `Protect your WordPress website from malicious threats with TripleZero iT malware removal. Infections damage security, reputation and uptime — we focus on detection, thorough cleanup and recovery.

We scan files, databases and vulnerable components, remove malware and unwanted redirects, and repair compromised parts where needed. Backups are taken before and after cleanup.

You also receive prevention guidance to reduce the chance of reinfection, so you can return to running your business with confidence.

Contact: info@000-it.com · 000-it.com.`,
    },
  },

  "wordpress-plugin-theme-installation": {
    nl: {
      name: "WordPress plugin- / theme-installatie",
      shortDescription: `Wat kunt u verwachten?
– Volledige automatische + handmatige backup
– Compatibiliteitscontroles
– Installatie van de gewenste plugin of het gewenste thema
– Gratis support gedurende 7 dagen`,
      description: `Laat TripleZero iT uw WordPress-plugins en -thema’s professioneel installeren. De juiste uitbreidingen verbeteren functionaliteit en uitstraling — maar een verkeerde installatie kan conflicten of downtime veroorzaken.

Wij maken eerst een backup, controleren compatibiliteit en installeren daarna de gewenste plugin of het gewenste thema. Basisconfiguratie en een snelle werkingstest horen erbij, zodat alles stabiel meedraait.

Na oplevering krijgt u 7 dagen gratis support voor vragen over de installatie. Zo blijft uw site veilig, overzichtelijk en klaar voor gebruik.

Neem contact op via info@000-it.com of bezoek 000-it.com.`,
    },
    en: {
      name: "WordPress Plugin / Theme Installation",
      shortDescription: `What can you expect?
– A complete automatic + manual backup
– Compatibility checks
– Installation of your desired plugin or theme
– Free support for 7 days`,
      description: `Let TripleZero iT install WordPress plugins and themes professionally. The right extensions improve features and design — but a careless install can cause conflicts or downtime.

We back up first, check compatibility, then install your chosen plugin or theme. Basic configuration and a quick functional check are included so everything runs cleanly together.

After delivery you get 7 days of free support for questions about the installation. Your site stays safe, tidy and ready to use.

Contact us at info@000-it.com or visit 000-it.com.`,
    },
  },

  "wordpress-security": {
    nl: {
      name: "Firewall, beveiliging & SSL",
      shortDescription: `Wat kunt u verwachten?
– Volledige automatische + handmatige backup
– Installatie van Wordfence Basic of Premium
– Geavanceerde beveiligingsaudit
– Malware- en dreigingsbescherming
– Firewall- en brute-forcebescherming
– Regelmatige updates en patches
– SSL-certificaatinstallatie
– Gebruikersrechtenbeheer
– Gratis support gedurende 7 dagen`,
      description: `Bescherm uw WordPress-website met de beveiligingsservice van TripleZero iT. Wij versterken uw site tegen hacks, malware en misbruik met een praktische, goed gecontroleerde aanpak.

Na een backup voeren wij een beveiligingsaudit uit, installeren we Wordfence (Basic of Premium), zetten we firewall- en brute-forcebescherming klaar en verzorgen we SSL waar nodig. Ook gebruikersrechten en updates krijgen aandacht, zodat kwetsbaarheden minder kans krijgen.

U ontvangt 7 dagen gratis support na oplevering. Zo blijft uw data, reputatie en bedrijfscontinuïteit beter beschermd.

Contact: info@000-it.com · 000-it.com.`,
    },
    en: {
      name: "Firewall, Security & SSL",
      shortDescription: `What can you expect?
– A complete automatic + manual backup
– Installation of Wordfence Basic or Premium
– Advanced security audit
– Malware and threat protection
– Firewall and brute-force protection
– Regular updates and patching
– SSL certificate installation
– User access management
– Free support for 7 days`,
      description: `Safeguard your WordPress website with TripleZero iT security services. We harden your site against hacks, malware and abuse with a practical, carefully controlled approach.

After a backup we run a security audit, install Wordfence (Basic or Premium), configure firewall and brute-force protection, and set up SSL where needed. User access and patching are reviewed so vulnerabilities have less room to grow.

You receive 7 days of free support after delivery — keeping your data, reputation and continuity better protected.

Contact: info@000-it.com · 000-it.com.`,
    },
  },

  "wordpress-speed-optimization": {
    nl: {
      name: "WordPress snelheidsoptimalisatie",
      shortDescription: `Wat kunt u verwachten?
– Volledige automatische + handmatige backup
– Websiteprestatie-audit
– Optimalisatie van code, database, afbeeldingen, plugins, thema en hosting
– Caching-oplossingen
– Gratis support gedurende 7 dagen`,
      description: `Website snelheid is bepalend voor gebruikerservaring, zoekposities en conversie. TripleZero iT optimaliseert WordPress-sites zodat bezoekers sneller laden en minder afhaken.

Wij starten met een prestatie-audit en verbeteren daarna knelpunten in code, database, afbeeldingen, plugins, thema en hostingconfiguratie. Caching en gerichte optimalisaties brengen meetbare winst in laadtijd.

Na oplevering krijgt u 7 dagen gratis support voor vragen over de uitgevoerde optimalisatie. Zo blijft uw site sneller, soepeler en professioneler.

Neem contact op via info@000-it.com of bezoek 000-it.com.`,
    },
    en: {
      name: "WordPress Speed Optimization",
      shortDescription: `What can you expect?
– A complete automatic + manual backup
– Website performance audit
– Code, database, images, plugins, theme and web hosting optimization
– Caching solutions
– Free support for 7 days`,
      description: `Website speed shapes user experience, search performance and conversions. TripleZero iT optimizes WordPress sites so visitors load faster and bounce less.

We start with a performance audit, then improve bottlenecks across code, database, images, plugins, theme and hosting configuration. Caching and targeted tuning deliver measurable load-time gains.

After delivery you get 7 days of free support for questions about the optimization work — keeping your site faster, smoother and more professional.

Contact us at info@000-it.com or visit 000-it.com.`,
    },
  },
};

export function getProductI18n(slug: string, locale: string): ProductI18n | null {
  const entry = productI18n[slug];
  if (!entry) return null;
  return locale === "en" ? entry.en : entry.nl;
}

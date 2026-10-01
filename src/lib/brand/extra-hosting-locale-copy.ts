import ehLocalePacks from "@/content/brand/eh-locale-packs.json";

/**
 * Extra Hosting UI copy for locales other than nl and en.
 * Unknown locales fall back to English so hosting pages never keep AI/scan copy.
 */

type CopyKey =
  | "hero.title"
  | "hero.subtitle"
  | "hero.introTitleLine1"
  | "hero.introTitleLine2"
  | "hero.introSubtitle"
  | "hero.ctaServices"
  | "hero.ctaContact"
  | "hero.ctaDomains"
  | "hero.ctaScanTitle"
  | "hero.ctaBannerText"
  | "hero.ctaHeroTitle"
  | "hero.ctaScan"
  | "hero.serversTitle"
  | "hero.serversOnline"
  | "hero.domainsReady"
  | "hero.bullet1"
  | "hero.bullet2"
  | "hero.bullet3"
  | "faq.q1"
  | "faq.a1"
  | "faq.q2"
  | "faq.a2"
  | "faq.q3"
  | "faq.a3"
  | "services.title"
  | "services.subtitle"
  | "services.viewAll"
  | "kennisbank.subtitle"
  | "kennisbank.illustrationFooter"
  | "kennisbank.ctaBody"
  | "agent000.role"
  | "agent000.intro"
  | "agent000.relatedProducts"
  | "agent000.actionDomainRegister"
  | "agent000.actionDomainTransfer"
  | "agent000.actionDomainRenew"
  | "liveChat.emptyChat"
  | "footer.tagline"
  | "nav.aiScan"
  | "nav.services"
  | "shop.plans"
  | "shop.services"
  | "about.title"
  | "about.heroSubtitle"
  | "about.viewServices"
  | "about.missionText"
  | "about.visionText"
  | "about.philosophy"
  | "about.philosophyText"
  | "about.storyLead"
  | "about.storyP1"
  | "about.storyP2"
  | "about.storyP3"
  | "about.approach1Desc"
  | "about.approach2Desc"
  | "about.approach3Desc"
  | "about.approach4Desc"
  | "about.whatWeDoSubtitle"
  | "about.allServicesArrow"
  | "about.serveText"
  | "about.why2Desc"
  | "about.readySubtitle";

type LocaleCopy = Record<CopyKey, string>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

const en: LocaleCopy = {
  "hero.title": "Domains and web hosting — fast, stable and fairly priced",
  "hero.subtitle":
    "Register your domain and choose shared, cloud, WordPress or VPS hosting with {name}.",
  "hero.introTitleLine1": "Domains and hosting",
  "hero.introTitleLine2": "with {name}",
  "hero.introSubtitle":
    "Register your domain and choose shared, cloud, WordPress or VPS hosting — fast, stable and fairly priced.",
  "hero.ctaServices": "View all hosting plans",
  "hero.ctaContact": "Click here to contact us",
  "hero.ctaDomains": "Search a domain",
  "hero.ctaScanTitle": "Need a domain or hosting?",
  "hero.ctaBannerText":
    "We're happy to answer all your questions about domain names, DNS, email and web hosting.",
  "hero.ctaHeroTitle": "Need a domain or hosting?",
  "hero.ctaScan": "View hosting",
  "hero.serversTitle": "Make a choice",
  "hero.serversOnline": "Servers online",
  "hero.domainsReady": "Domains live",
  "hero.bullet1": "Domains, DNS and email — clear and reliable.",
  "hero.bullet2": "Shared, cloud, WordPress and VPS hosting.",
  "hero.bullet3": "Support in English and Dutch.",
  "faq.q1": "Who is {name}?",
  "faq.a1":
    "{name} focuses on domains, DNS, email and web hosting: shared, cloud, WordPress and VPS — including registration, transfers and migrations. See our FAQ and knowledge base for step-by-step answers.",
  "faq.q2": "Which hosting plans do you offer?",
  "faq.a2":
    "Shared, cloud, WordPress and VPS — choose by traffic and growth. Every plan has clear resources, SSL and support. Details and pricing are on the hosting pages and in the full FAQ.",
  "faq.q3": "Can I upgrade later or transfer a domain?",
  "faq.a3":
    "Yes. You can upgrade later (for example shared → cloud/VPS) and register or transfer domains. We help with DNS, email authentication and migration — more in the FAQ and knowledge base.",
  "services.title": "Hosting",
  "services.subtitle":
    "Domains, shared, cloud, WordPress and VPS — everything for a stable online foundation.",
  "services.viewAll": "View all hosting plans",
  "kennisbank.subtitle":
    "Guides on domain names, DNS, email, shared hosting, cloud, WordPress, VPS, control panels and security.",
  "kennisbank.illustrationFooter": "{name} knowledge base",
  "kennisbank.ctaBody":
    "Can't find what you need? Contact {name} support — we're happy to help.",
  "agent000.role": "Virtual FAQ and knowledge-base assistant",
  "agent000.intro":
    "Ask me about domains, DNS, email or hosting. I search our FAQ and knowledge base and help with contact or a ticket.",
  "agent000.relatedProducts": "Hosting & domains",
  "agent000.actionDomainRegister": "Register a domain",
  "agent000.actionDomainTransfer": "Transfer a domain",
  "agent000.actionDomainRenew": "Renew a domain",
  "liveChat.emptyChat":
    "Ask about domains, DNS, email or hosting — we help with answers, plans and tickets.",
  "footer.tagline":
    "Domain registration / transfer, email, shared web hosting, cloud, WordPress and VPS — ready for a stable online foundation.",
  "nav.aiScan": "Domains",
  "nav.services": "Hosting",
  "shop.plans": "Hosting plans",
  "shop.services": "Hosting products",
  "about.title": "Who is {name}?",
  "about.heroSubtitle":
    "{name} provides domain names and web hosting — shared, cloud, WordPress and VPS — with support for registration, DNS, email and migrations. A reliable partner for a stable online foundation.",
  "about.viewServices": "View hosting",
  "about.missionText":
    "Help businesses with reliable domains and web hosting: fast, stable, fairly priced and with support when needed.",
  "about.visionText":
    "The right hosting choice for every website — clear, scalable and without unnecessary complexity.",
  "about.philosophy": "The {name} approach",
  "about.philosophyText":
    "Clear plans, honest advice and a stable technical foundation — so you can focus on your website and visitors.",
  "about.storyLead":
    "{name} is your partner for domains and hosting — from first registration to migration and growth.",
  "about.storyP1":
    "We offer shared hosting, cloud hosting, WordPress hosting and VPS, plus domain registration and DNS help. That keeps your site reachable, secure and ready to grow.",
  "about.storyP2":
    "Whether you need a new domain, a move, SSL, email or more resources: we explain what matters and help you take the next step.",
  "about.storyP3":
    "We support customers in multiple languages and countries, with a focus on fast response and clear communication.",
  "about.approach1Desc":
    "Map goals, traffic and technical needs: which hosting plan fits, and what DNS or email setup is required.",
  "about.approach2Desc":
    "Set up hosting, domain and DNS — or run a controlled migration with minimal downtime.",
  "about.approach3Desc":
    "We check reachability, SSL, mail auth and performance before you go live or scale up.",
  "about.approach4Desc":
    "Grow with your traffic: upgrades, backups and support when you need more capacity.",
  "about.whatWeDoSubtitle": "One partner for domains, hosting and related support.",
  "about.allServicesArrow": "All hosting →",
  "about.serveText":
    "For SMBs, startups and freelancers who want a reliable domain and hosting without an in-house IT team. You get clear plans, honest advice and support when you need it.",
  "about.why2Desc":
    "Domain, DNS, email and hosting reinforce each other with one partner instead of separate vendors.",
  "about.readySubtitle":
    "Search a domain, choose a hosting plan or contact us — we're happy to help pick the right setup.",
};

const de: LocaleCopy = {
  "hero.title": "Domains und Webhosting — schnell, stabil und fair bepreist",
  "hero.subtitle":
    "Registrieren Sie Ihre Domain und wählen Sie Shared-, Cloud-, WordPress- oder VPS-Hosting bei {name}.",
  "hero.introTitleLine1": "Domains und Hosting",
  "hero.introTitleLine2": "mit {name}",
  "hero.introSubtitle":
    "Registrieren Sie Ihre Domain und wählen Sie Shared-, Cloud-, WordPress- oder VPS-Hosting — schnell, stabil und fair bepreist.",
  "hero.ctaServices": "Alle Hosting-Tarife ansehen",
  "hero.ctaContact": "Hier klicken, um uns zu kontaktieren",
  "hero.ctaDomains": "Domain suchen",
  "hero.ctaScanTitle": "Domain oder Hosting gesucht?",
  "hero.ctaBannerText":
    "Wir beantworten gern alle Ihre Fragen zu Domainnamen, DNS, E-Mail und Webhosting.",
  "hero.ctaHeroTitle": "Domain oder Hosting gesucht?",
  "hero.ctaScan": "Hosting ansehen",
  "hero.serversTitle": "Treffen Sie eine Wahl",
  "hero.serversOnline": "Server online",
  "hero.domainsReady": "Domains live",
  "hero.bullet1": "Domains, DNS und E-Mail — klar und zuverlässig.",
  "hero.bullet2": "Shared-, Cloud-, WordPress- und VPS-Hosting.",
  "hero.bullet3": "Support auf Englisch und Niederländisch.",
  "faq.q1": "Wer ist {name}?",
  "faq.a1":
    "{name} konzentriert sich auf Domainnamen und Webhosting: Shared, Cloud, WordPress und VPS — mit Support bei Registrierung, DNS, E-Mail und Migrationen.",
  "faq.q2": "Welche Hosting-Tarife bieten Sie an?",
  "faq.a2":
    "Wählen Sie Shared Hosting, Cloud Hosting, WordPress Hosting oder VPS. Jeder Tarif hat klare Ressourcen, SSL und Support — Sie wählen nach Traffic und Wachstum.",
  "faq.q3": "Kann ich später upgraden oder eine Domain umziehen?",
  "faq.a3":
    "Ja. Sie können später auf einen höheren Tarif wechseln und Domains registrieren oder umziehen. Wir helfen bei DNS-Einrichtung und Migration.",
  "services.title": "Hosting",
  "services.subtitle":
    "Domains, Shared, Cloud, WordPress und VPS — alles für eine stabile Online-Basis.",
  "services.viewAll": "Alle Hosting-Tarife ansehen",
  "kennisbank.subtitle":
    "Anleitungen zu Domainnamen, DNS, E-Mail, Shared Hosting, Cloud, WordPress, VPS, Control Panels und Sicherheit.",
  "kennisbank.illustrationFooter": "{name} Wissensdatenbank",
  "kennisbank.ctaBody":
    "Nicht gefunden, was Sie suchen? Kontaktieren Sie den {name}-Support — wir helfen gern.",
  "agent000.role": "Virtueller FAQ- und Wissensdatenbank-Assistent",
  "agent000.intro":
    "Fragen Sie mich zu Domains, DNS, E-Mail oder Hosting. Ich durchsuche FAQ und Wissensdatenbank und helfe bei Kontakt oder einem Ticket.",
  "agent000.relatedProducts": "Hosting & Domains",
  "agent000.actionDomainRegister": "Domain registrieren",
  "agent000.actionDomainTransfer": "Domain umziehen",
  "agent000.actionDomainRenew": "Domain verlängern",
  "liveChat.emptyChat":
    "Fragen Sie zu Domains, DNS, E-Mail oder Hosting — wir helfen mit Antworten, Tarifen und Tickets.",
  "footer.tagline":
    "Domainregistrierung und -umzug, E-Mail, Shared Webhosting, Cloud, WordPress und VPS — bereit für eine stabile Online-Basis.",
  "nav.aiScan": "Domains",
  "nav.services": "Hosting",
  "shop.plans": "Hosting-Tarife",
  "shop.services": "Hosting-Produkte",
  "about.title": "Wer ist {name}?",
  "about.heroSubtitle":
    "{name} bietet Domainnamen und Webhosting — Shared, Cloud, WordPress und VPS — mit Support bei Registrierung, DNS, E-Mail und Migrationen. Ein verlässlicher Partner für eine stabile Online-Basis.",
  "about.viewServices": "Hosting ansehen",
  "about.missionText":
    "Unternehmen mit zuverlässigen Domains und Webhosting helfen: schnell, stabil, fair bepreist und mit Support, wenn er gebraucht wird.",
  "about.visionText":
    "Die richtige Hosting-Wahl für jede Website — klar, skalierbar und ohne unnötige Komplexität.",
  "about.philosophy": "Der {name}-Ansatz",
  "about.philosophyText":
    "Klare Tarife, ehrliche Beratung und eine stabile technische Basis — damit Sie sich auf Ihre Website und Besucher konzentrieren können.",
  "about.storyLead":
    "{name} ist Ihr Partner für Domains und Hosting — von der ersten Registrierung bis zu Migration und Wachstum.",
  "about.storyP1":
    "Wir bieten Shared Hosting, Cloud Hosting, WordPress Hosting und VPS sowie Domainregistrierung und DNS-Hilfe. So bleibt Ihre Website erreichbar, sicher und bereit zu wachsen.",
  "about.storyP2":
    "Ob neue Domain, Umzug, SSL, E-Mail oder mehr Ressourcen: wir erklären, worauf es ankommt, und helfen beim nächsten Schritt.",
  "about.storyP3":
    "Wir unterstützen Kunden in mehreren Sprachen und Ländern, mit Fokus auf schnelle Reaktion und klare Kommunikation.",
  "about.approach1Desc":
    "Ziele, Traffic und technische Anforderungen klären: welcher Hosting-Tarif passt und welches DNS- oder E-Mail-Setup nötig ist.",
  "about.approach2Desc":
    "Hosting, Domain und DNS einrichten — oder eine kontrollierte Migration mit minimaler Ausfallzeit durchführen.",
  "about.approach3Desc":
    "Erreichbarkeit, SSL, Mail-Authentifizierung und Performance prüfen wir, bevor Sie live gehen oder skalieren.",
  "about.approach4Desc":
    "Mit Ihrem Traffic mitwachsen: Upgrades, Backups und Support, wenn Sie mehr Kapazität brauchen.",
  "about.whatWeDoSubtitle": "Ein Partner für Domains, Hosting und den zugehörigen Support.",
  "about.allServicesArrow": "Alles Hosting →",
  "about.serveText":
    "Für KMU, Start-ups und Freiberufler, die eine zuverlässige Domain und Hosting ohne eigenes IT-Team wollen. Sie erhalten klare Tarife, ehrliche Beratung und Support, wenn Sie ihn brauchen.",
  "about.why2Desc":
    "Domain, DNS, E-Mail und Hosting verstärken sich bei einem Partner, statt über getrennte Anbieter.",
  "about.readySubtitle":
    "Domain suchen, Hosting-Tarif wählen oder uns kontaktieren — wir helfen gern bei der passenden Einrichtung.",
};

const fr: LocaleCopy = {
  "hero.title": "Noms de domaine et hébergement web — rapide, stable et à prix juste",
  "hero.subtitle":
    "Enregistrez votre domaine et choisissez un hébergement mutualisé, cloud, WordPress ou VPS avec {name}.",
  "hero.introTitleLine1": "Domaines et hébergement",
  "hero.introTitleLine2": "avec {name}",
  "hero.introSubtitle":
    "Enregistrez votre domaine et choisissez un hébergement mutualisé, cloud, WordPress ou VPS — rapide, stable et à prix juste.",
  "hero.ctaServices": "Voir toutes les offres d'hébergement",
  "hero.ctaContact": "Cliquez ici pour nous contacter",
  "hero.ctaDomains": "Rechercher un domaine",
  "hero.ctaScanTitle": "Besoin d'un domaine ou d'un hébergement ?",
  "hero.ctaBannerText":
    "Nous répondons volontiers à toutes vos questions sur les noms de domaine, le DNS, l'e-mail et l'hébergement web.",
  "hero.ctaHeroTitle": "Besoin d'un domaine ou d'un hébergement ?",
  "hero.ctaScan": "Voir l'hébergement",
  "hero.serversTitle": "Faites votre choix",
  "hero.serversOnline": "Serveurs en ligne",
  "hero.domainsReady": "Domaines en ligne",
  "hero.bullet1": "Domaines, DNS et e-mail — clairs et fiables.",
  "hero.bullet2": "Hébergement mutualisé, cloud, WordPress et VPS.",
  "hero.bullet3": "Support en anglais et en néerlandais.",
  "faq.q1": "Qui est {name} ?",
  "faq.a1":
    "{name} se concentre sur les noms de domaine et l'hébergement web : mutualisé, cloud, WordPress et VPS — avec un support pour l'enregistrement, le DNS, l'e-mail et les migrations.",
  "faq.q2": "Quelles offres d'hébergement proposez-vous ?",
  "faq.a2":
    "Choisissez l'hébergement mutualisé, cloud, WordPress ou VPS. Chaque offre a des ressources claires, le SSL et le support — vous choisissez selon le trafic et la croissance.",
  "faq.q3": "Puis-je évoluer plus tard ou transférer un domaine ?",
  "faq.a3":
    "Oui. Vous pouvez passer plus tard à une offre supérieure et enregistrer ou transférer des domaines. Nous aidons pour le DNS et la migration.",
  "services.title": "Hébergement",
  "services.subtitle":
    "Domaines, mutualisé, cloud, WordPress et VPS — tout pour une base en ligne stable.",
  "services.viewAll": "Voir toutes les offres d'hébergement",
  "kennisbank.subtitle":
    "Guides sur les noms de domaine, le DNS, l'e-mail, l'hébergement mutualisé, le cloud, WordPress, les VPS, les panneaux de contrôle et la sécurité.",
  "kennisbank.illustrationFooter": "Base de connaissances {name}",
  "kennisbank.ctaBody":
    "Vous ne trouvez pas ce qu'il vous faut ? Contactez le support {name} — nous sommes là pour vous aider.",
  "agent000.role": "Assistant virtuel FAQ et base de connaissances",
  "agent000.intro":
    "Posez-moi une question sur les domaines, le DNS, l'e-mail ou l'hébergement. Je cherche dans la FAQ et la base de connaissances et j'aide pour un contact ou un ticket.",
  "agent000.relatedProducts": "Hébergement et domaines",
  "agent000.actionDomainRegister": "Enregistrer un domaine",
  "agent000.actionDomainTransfer": "Transférer un domaine",
  "agent000.actionDomainRenew": "Renouveler un domaine",
  "liveChat.emptyChat":
    "Posez une question sur les domaines, le DNS, l'e-mail ou l'hébergement — nous aidons avec les réponses, les offres et les tickets.",
  "footer.tagline":
    "Enregistrement et transfert de domaine, e-mail, hébergement mutualisé, cloud, WordPress et VPS — prêts pour une base en ligne stable.",
  "nav.aiScan": "Domaines",
  "nav.services": "Hébergement",
  "shop.plans": "Offres d'hébergement",
  "shop.services": "Produits d'hébergement",
  "about.title": "Qui est {name} ?",
  "about.heroSubtitle":
    "{name} fournit des noms de domaine et de l'hébergement web — mutualisé, cloud, WordPress et VPS — avec un support pour l'enregistrement, le DNS, l'e-mail et les migrations. Un partenaire fiable pour une base en ligne stable.",
  "about.viewServices": "Voir l'hébergement",
  "about.missionText":
    "Aider les entreprises avec des domaines et un hébergement web fiables : rapides, stables, à prix juste et avec du support quand il le faut.",
  "about.visionText":
    "Le bon choix d'hébergement pour chaque site — clair, évolutif et sans complexité inutile.",
  "about.philosophy": "L'approche {name}",
  "about.philosophyText":
    "Des offres claires, des conseils honnêtes et une base technique stable — pour que vous vous concentriez sur votre site et vos visiteurs.",
  "about.storyLead":
    "{name} est votre partenaire pour les domaines et l'hébergement — du premier enregistrement à la migration et à la croissance.",
  "about.storyP1":
    "Nous proposons l'hébergement mutualisé, cloud, WordPress et VPS, ainsi que l'enregistrement de domaine et l'aide DNS. Votre site reste joignable, sécurisé et prêt à grandir.",
  "about.storyP2":
    "Nouveau domaine, transfert, SSL, e-mail ou plus de ressources : nous expliquons ce qui compte et vous aidons à passer à l'étape suivante.",
  "about.storyP3":
    "Nous accompagnons des clients dans plusieurs langues et pays, avec une réponse rapide et une communication claire.",
  "about.approach1Desc":
    "Clarifier objectifs, trafic et besoins techniques : quelle offre convient, et quelle configuration DNS ou e-mail est nécessaire.",
  "about.approach2Desc":
    "Mettre en place l'hébergement, le domaine et le DNS — ou mener une migration contrôlée avec un minimum d'interruption.",
  "about.approach3Desc":
    "Nous vérifions la joignabilité, le SSL, l'authentification e-mail et les performances avant la mise en ligne ou la montée en charge.",
  "about.approach4Desc":
    "Grandir avec votre trafic : mises à niveau, sauvegardes et support lorsque vous avez besoin de plus de capacité.",
  "about.whatWeDoSubtitle": "Un seul partenaire pour les domaines, l'hébergement et le support associé.",
  "about.allServicesArrow": "Tout l'hébergement →",
  "about.serveText":
    "Pour les PME, les startups et les indépendants qui veulent un domaine et un hébergement fiables sans équipe informatique interne. Vous obtenez des offres claires, des conseils honnêtes et du support quand vous en avez besoin.",
  "about.why2Desc":
    "Domaine, DNS, e-mail et hébergement se renforcent chez un seul partenaire, plutôt que chez des fournisseurs séparés.",
  "about.readySubtitle":
    "Recherchez un domaine, choisissez une offre ou contactez-nous — nous vous aidons à trouver la bonne configuration.",
};

const es: LocaleCopy = {
  "hero.title": "Dominios y hosting web — rápido, estable y a un precio justo",
  "hero.subtitle":
    "Registre su dominio y elija hosting compartido, cloud, WordPress o VPS con {name}.",
  "hero.introTitleLine1": "Dominios y hosting",
  "hero.introTitleLine2": "con {name}",
  "hero.introSubtitle":
    "Registre su dominio y elija hosting compartido, cloud, WordPress o VPS — rápido, estable y a un precio justo.",
  "hero.ctaServices": "Ver todos los planes de hosting",
  "hero.ctaContact": "Haga clic aquí para contactarnos",
  "hero.ctaDomains": "Buscar un dominio",
  "hero.ctaScanTitle": "¿Necesita un dominio o hosting?",
  "hero.ctaBannerText":
    "Respondemos con gusto todas sus preguntas sobre nombres de dominio, DNS, correo y hosting web.",
  "hero.ctaHeroTitle": "¿Necesita un dominio o hosting?",
  "hero.ctaScan": "Ver hosting",
  "hero.serversTitle": "Elija una opción",
  "hero.serversOnline": "Servidores en línea",
  "hero.domainsReady": "Dominios activos",
  "hero.bullet1": "Dominios, DNS y correo — claros y fiables.",
  "hero.bullet2": "Hosting compartido, cloud, WordPress y VPS.",
  "hero.bullet3": "Soporte en inglés y neerlandés.",
  "faq.q1": "¿Quién es {name}?",
  "faq.a1":
    "{name} se centra en nombres de dominio y hosting web: compartido, cloud, WordPress y VPS — con soporte para el registro, DNS, correo y migraciones.",
  "faq.q2": "¿Qué planes de hosting ofrecen?",
  "faq.a2":
    "Elija hosting compartido, cloud, WordPress o VPS. Cada plan tiene recursos claros, SSL y soporte — usted elige según el tráfico y el crecimiento.",
  "faq.q3": "¿Puedo ampliar más adelante o transferir un dominio?",
  "faq.a3":
    "Sí. Puede pasar más adelante a un plan superior y registrar o transferir dominios. Ayudamos con la configuración DNS y la migración.",
  "services.title": "Hosting",
  "services.subtitle":
    "Dominios, compartido, cloud, WordPress y VPS — todo para una base online estable.",
  "services.viewAll": "Ver todos los planes de hosting",
  "kennisbank.subtitle":
    "Guías sobre nombres de dominio, DNS, correo, hosting compartido, cloud, WordPress, VPS, paneles de control y seguridad.",
  "kennisbank.illustrationFooter": "Base de conocimientos de {name}",
  "kennisbank.ctaBody":
    "¿No encuentra lo que busca? Contacte con el soporte de {name} — estaremos encantados de ayudar.",
  "agent000.role": "Asistente virtual de FAQ y base de conocimientos",
  "agent000.intro":
    "Pregúnteme sobre dominios, DNS, correo o hosting. Busco en la FAQ y la base de conocimientos y ayudo con el contacto o un ticket.",
  "agent000.relatedProducts": "Hosting y dominios",
  "agent000.actionDomainRegister": "Registrar un dominio",
  "agent000.actionDomainTransfer": "Transferir un dominio",
  "agent000.actionDomainRenew": "Renovar un dominio",
  "liveChat.emptyChat":
    "Pregunte sobre dominios, DNS, correo o hosting — ayudamos con respuestas, planes y tickets.",
  "footer.tagline":
    "Registro y transferencia de dominios, correo, hosting compartido, cloud, WordPress y VPS — listos para una base online estable.",
  "nav.aiScan": "Dominios",
  "nav.services": "Hosting",
  "shop.plans": "Planes de hosting",
  "shop.services": "Productos de hosting",
  "about.title": "¿Quién es {name}?",
  "about.heroSubtitle":
    "{name} ofrece nombres de dominio y hosting web — compartido, cloud, WordPress y VPS — con soporte para el registro, DNS, correo y migraciones. Un socio fiable para una base online estable.",
  "about.viewServices": "Ver hosting",
  "about.missionText":
    "Ayudar a las empresas con dominios y hosting web fiables: rápidos, estables, a un precio justo y con soporte cuando hace falta.",
  "about.visionText":
    "La elección de hosting adecuada para cada sitio — clara, escalable y sin complejidad innecesaria.",
  "about.philosophy": "El enfoque de {name}",
  "about.philosophyText":
    "Planes claros, consejo honesto y una base técnica estable — para que usted se centre en su sitio y sus visitantes.",
  "about.storyLead":
    "{name} es su socio para dominios y hosting — desde el primer registro hasta la migración y el crecimiento.",
  "about.storyP1":
    "Ofrecemos hosting compartido, cloud, WordPress y VPS, además de registro de dominios y ayuda con DNS. Así su sitio sigue accesible, seguro y listo para crecer.",
  "about.storyP2":
    "Ya sea un dominio nuevo, un traslado, SSL, correo o más recursos: explicamos lo que importa y le ayudamos a dar el siguiente paso.",
  "about.storyP3":
    "Acompañamos a clientes en varios idiomas y países, con respuesta rápida y comunicación clara.",
  "about.approach1Desc":
    "Aclarar objetivos, tráfico y necesidades técnicas: qué plan encaja y qué configuración de DNS o correo hace falta.",
  "about.approach2Desc":
    "Configurar hosting, dominio y DNS — o realizar una migración controlada con el mínimo de inactividad.",
  "about.approach3Desc":
    "Comprobamos accesibilidad, SSL, autenticación de correo y rendimiento antes de publicar o ampliar.",
  "about.approach4Desc":
    "Crecer con su tráfico: ampliaciones, copias de seguridad y soporte cuando necesite más capacidad.",
  "about.whatWeDoSubtitle": "Un solo socio para dominios, hosting y el soporte relacionado.",
  "about.allServicesArrow": "Todo el hosting →",
  "about.serveText":
    "Para pymes, startups y autónomos que quieren un dominio y un hosting fiables sin un equipo de TI interno. Obtiene planes claros, consejo honesto y soporte cuando lo necesita.",
  "about.why2Desc":
    "Dominio, DNS, correo y hosting se refuerzan con un solo socio, en lugar de proveedores separados.",
  "about.readySubtitle":
    "Busque un dominio, elija un plan o contáctenos — le ayudamos a elegir la configuración adecuada.",
};

const pt: LocaleCopy = {
  "hero.title": "Domínios e hospedagem web — rápida, estável e com preço justo",
  "hero.subtitle":
    "Registre seu domínio e escolha hospedagem compartilhada, cloud, WordPress ou VPS com {name}.",
  "hero.introTitleLine1": "Domínios e hospedagem",
  "hero.introTitleLine2": "com {name}",
  "hero.introSubtitle":
    "Registre seu domínio e escolha hospedagem compartilhada, cloud, WordPress ou VPS — rápida, estável e com preço justo.",
  "hero.ctaServices": "Ver todos os planos de hospedagem",
  "hero.ctaContact": "Clique aqui para falar conosco",
  "hero.ctaDomains": "Buscar um domínio",
  "hero.ctaScanTitle": "Precisa de um domínio ou de hospedagem?",
  "hero.ctaBannerText":
    "Respondemos com prazer a todas as suas perguntas sobre nomes de domínio, DNS, e-mail e hospedagem web.",
  "hero.ctaHeroTitle": "Precisa de um domínio ou de hospedagem?",
  "hero.ctaScan": "Ver hospedagem",
  "hero.serversTitle": "Faça uma escolha",
  "hero.serversOnline": "Servidores online",
  "hero.domainsReady": "Domínios no ar",
  "hero.bullet1": "Domínios, DNS e e-mail — claros e confiáveis.",
  "hero.bullet2": "Hospedagem compartilhada, cloud, WordPress e VPS.",
  "hero.bullet3": "Suporte em inglês e holandês.",
  "faq.q1": "Quem é {name}?",
  "faq.a1":
    "{name} concentra-se em nomes de domínio e hospedagem web: compartilhada, cloud, WordPress e VPS — com suporte para registro, DNS, e-mail e migrações.",
  "faq.q2": "Quais planos de hospedagem vocês oferecem?",
  "faq.a2":
    "Escolha hospedagem compartilhada, cloud, WordPress ou VPS. Cada plano tem recursos claros, SSL e suporte — você escolhe conforme o tráfego e o crescimento.",
  "faq.q3": "Posso fazer upgrade depois ou transferir um domínio?",
  "faq.a3":
    "Sim. Você pode passar depois para um plano maior e registrar ou transferir domínios. Ajudamos com DNS e migração.",
  "services.title": "Hospedagem",
  "services.subtitle":
    "Domínios, compartilhada, cloud, WordPress e VPS — tudo para uma base online estável.",
  "services.viewAll": "Ver todos os planos de hospedagem",
  "kennisbank.subtitle":
    "Guias sobre nomes de domínio, DNS, e-mail, hospedagem compartilhada, cloud, WordPress, VPS, painéis de controle e segurança.",
  "kennisbank.illustrationFooter": "Base de conhecimento {name}",
  "kennisbank.ctaBody":
    "Não encontrou o que precisa? Fale com o suporte da {name} — teremos prazer em ajudar.",
  "agent000.role": "Assistente virtual de FAQ e base de conhecimento",
  "agent000.intro":
    "Pergunte sobre domínios, DNS, e-mail ou hospedagem. Eu busco na FAQ e na base de conhecimento e ajudo com contato ou um ticket.",
  "agent000.relatedProducts": "Hospedagem e domínios",
  "agent000.actionDomainRegister": "Registrar um domínio",
  "agent000.actionDomainTransfer": "Transferir um domínio",
  "agent000.actionDomainRenew": "Renovar um domínio",
  "liveChat.emptyChat":
    "Pergunte sobre domínios, DNS, e-mail ou hospedagem — ajudamos com respostas, planos e tickets.",
  "footer.tagline":
    "Registro e transferência de domínio, e-mail, hospedagem compartilhada, cloud, WordPress e VPS — prontos para uma base online estável.",
  "nav.aiScan": "Domínios",
  "nav.services": "Hospedagem",
  "shop.plans": "Planos de hospedagem",
  "shop.services": "Produtos de hospedagem",
  "about.title": "Quem é {name}?",
  "about.heroSubtitle":
    "{name} oferece nomes de domínio e hospedagem web — compartilhada, cloud, WordPress e VPS — com suporte para registro, DNS, e-mail e migrações. Uma parceira confiável para uma base online estável.",
  "about.viewServices": "Ver hospedagem",
  "about.missionText":
    "Ajudar empresas com domínios e hospedagem web confiáveis: rápidos, estáveis, com preço justo e suporte quando necessário.",
  "about.visionText":
    "A escolha de hospedagem certa para cada site — clara, escalável e sem complexidade desnecessária.",
  "about.philosophy": "A abordagem {name}",
  "about.philosophyText":
    "Planos claros, conselho honesto e uma base técnica estável — para você focar no seu site e nos visitantes.",
  "about.storyLead":
    "{name} é sua parceira para domínios e hospedagem — do primeiro registro à migração e ao crescimento.",
  "about.storyP1":
    "Oferecemos hospedagem compartilhada, cloud, WordPress e VPS, além de registro de domínio e ajuda com DNS. Assim o seu site permanece acessível, seguro e pronto para crescer.",
  "about.storyP2":
    "Seja um domínio novo, uma transferência, SSL, e-mail ou mais recursos: explicamos o que importa e ajudamos no próximo passo.",
  "about.storyP3":
    "Apoiamos clientes em vários idiomas e países, com resposta rápida e comunicação clara.",
  "about.approach1Desc":
    "Mapear objetivos, tráfego e necessidades técnicas: qual plano serve e qual configuração de DNS ou e-mail é necessária.",
  "about.approach2Desc":
    "Configurar hospedagem, domínio e DNS — ou fazer uma migração controlada com o mínimo de indisponibilidade.",
  "about.approach3Desc":
    "Verificamos acessibilidade, SSL, autenticação de e-mail e desempenho antes de publicar ou ampliar.",
  "about.approach4Desc":
    "Crescer com o seu tráfego: upgrades, backups e suporte quando você precisar de mais capacidade.",
  "about.whatWeDoSubtitle": "Uma parceira para domínios, hospedagem e o suporte relacionado.",
  "about.allServicesArrow": "Toda a hospedagem →",
  "about.serveText":
    "Para PMEs, startups e freelancers que querem um domínio e uma hospedagem confiáveis sem uma equipe de TI interna. Você recebe planos claros, conselho honesto e suporte quando precisa.",
  "about.why2Desc":
    "Domínio, DNS, e-mail e hospedagem se reforçam com uma única parceira, em vez de fornecedores separados.",
  "about.readySubtitle":
    "Busque um domínio, escolha um plano ou fale conosco — ajudamos a montar a configuração certa.",
};

const it: LocaleCopy = {
  "hero.title": "Domini e hosting web — veloce, stabile e a un prezzo equo",
  "hero.subtitle":
    "Registra il tuo dominio e scegli hosting condiviso, cloud, WordPress o VPS con {name}.",
  "hero.introTitleLine1": "Domini e hosting",
  "hero.introTitleLine2": "con {name}",
  "hero.introSubtitle":
    "Registra il tuo dominio e scegli hosting condiviso, cloud, WordPress o VPS — veloce, stabile e a un prezzo equo.",
  "hero.ctaServices": "Vedi tutti i piani di hosting",
  "hero.ctaContact": "Clicca qui per contattarci",
  "hero.ctaDomains": "Cerca un dominio",
  "hero.ctaScanTitle": "Ti serve un dominio o un hosting?",
  "hero.ctaBannerText":
    "Rispondiamo volentieri a tutte le tue domande su nomi di dominio, DNS, e-mail e hosting web.",
  "hero.ctaHeroTitle": "Ti serve un dominio o un hosting?",
  "hero.ctaScan": "Vedi l'hosting",
  "hero.serversTitle": "Fai una scelta",
  "hero.serversOnline": "Server online",
  "hero.domainsReady": "Domini attivi",
  "hero.bullet1": "Domini, DNS ed e-mail — chiari e affidabili.",
  "hero.bullet2": "Hosting condiviso, cloud, WordPress e VPS.",
  "hero.bullet3": "Supporto in inglese e olandese.",
  "faq.q1": "Chi è {name}?",
  "faq.a1":
    "{name} si concentra su nomi di dominio e hosting web: condiviso, cloud, WordPress e VPS — con supporto per registrazione, DNS, e-mail e migrazioni.",
  "faq.q2": "Quali piani di hosting offrite?",
  "faq.a2":
    "Scegli hosting condiviso, cloud, WordPress o VPS. Ogni piano ha risorse chiare, SSL e supporto — scegli in base a traffico e crescita.",
  "faq.q3": "Posso fare upgrade più avanti o trasferire un dominio?",
  "faq.a3":
    "Sì. Puoi passare più avanti a un piano superiore e registrare o trasferire domini. Ti aiutiamo con DNS e migrazione.",
  "services.title": "Hosting",
  "services.subtitle":
    "Domini, condiviso, cloud, WordPress e VPS — tutto per una base online stabile.",
  "services.viewAll": "Vedi tutti i piani di hosting",
  "kennisbank.subtitle":
    "Guide su nomi di dominio, DNS, e-mail, hosting condiviso, cloud, WordPress, VPS, pannelli di controllo e sicurezza.",
  "kennisbank.illustrationFooter": "Knowledge base {name}",
  "kennisbank.ctaBody":
    "Non trovi quello che cerchi? Contatta il supporto {name} — siamo felici di aiutarti.",
  "agent000.role": "Assistente virtuale per FAQ e knowledge base",
  "agent000.intro":
    "Chiedimi di domini, DNS, e-mail o hosting. Cerco nella FAQ e nella knowledge base e aiuto con un contatto o un ticket.",
  "agent000.relatedProducts": "Hosting e domini",
  "agent000.actionDomainRegister": "Registra un dominio",
  "agent000.actionDomainTransfer": "Trasferisci un dominio",
  "agent000.actionDomainRenew": "Rinnova un dominio",
  "liveChat.emptyChat":
    "Chiedi di domini, DNS, e-mail o hosting — aiutiamo con risposte, piani e ticket.",
  "footer.tagline":
    "Registrazione e trasferimento di domini, e-mail, hosting condiviso, cloud, WordPress e VPS — pronti per una base online stabile.",
  "nav.aiScan": "Domini",
  "nav.services": "Hosting",
  "shop.plans": "Piani di hosting",
  "shop.services": "Prodotti di hosting",
  "about.title": "Chi è {name}?",
  "about.heroSubtitle":
    "{name} fornisce nomi di dominio e hosting web — condiviso, cloud, WordPress e VPS — con supporto per registrazione, DNS, e-mail e migrazioni. Un partner affidabile per una base online stabile.",
  "about.viewServices": "Vedi l'hosting",
  "about.missionText":
    "Aiutare le aziende con domini e hosting web affidabili: veloci, stabili, a un prezzo equo e con supporto quando serve.",
  "about.visionText":
    "La scelta di hosting giusta per ogni sito — chiara, scalabile e senza complessità inutile.",
  "about.philosophy": "L'approccio {name}",
  "about.philosophyText":
    "Piani chiari, consigli onesti e una base tecnica stabile — così puoi concentrarti sul sito e sui visitatori.",
  "about.storyLead":
    "{name} è il tuo partner per domini e hosting — dalla prima registrazione alla migrazione e alla crescita.",
  "about.storyP1":
    "Offriamo hosting condiviso, cloud, WordPress e VPS, più registrazione domini e aiuto DNS. Il tuo sito resta raggiungibile, sicuro e pronto a crescere.",
  "about.storyP2":
    "Che ti serva un nuovo dominio, un trasferimento, SSL, e-mail o più risorse: spieghiamo ciò che conta e ti aiutiamo nel passo successivo.",
  "about.storyP3":
    "Supportiamo clienti in più lingue e paesi, con risposta rapida e comunicazione chiara.",
  "about.approach1Desc":
    "Chiarire obiettivi, traffico ed esigenze tecniche: quale piano è adatto e quale configurazione DNS o e-mail serve.",
  "about.approach2Desc":
    "Configurare hosting, dominio e DNS — oppure eseguire una migrazione controllata con il minimo downtime.",
  "about.approach3Desc":
    "Verifichiamo raggiungibilità, SSL, autenticazione e-mail e prestazioni prima della pubblicazione o della crescita.",
  "about.approach4Desc":
    "Crescere con il traffico: upgrade, backup e supporto quando ti serve più capacità.",
  "about.whatWeDoSubtitle": "Un solo partner per domini, hosting e il supporto collegato.",
  "about.allServicesArrow": "Tutto l'hosting →",
  "about.serveText":
    "Per PMI, startup e freelance che vogliono un dominio e un hosting affidabili senza un team IT interno. Ottieni piani chiari, consigli onesti e supporto quando ti serve.",
  "about.why2Desc":
    "Dominio, DNS, e-mail e hosting si rafforzano con un solo partner, invece di fornitori separati.",
  "about.readySubtitle":
    "Cerca un dominio, scegli un piano o contattaci — ti aiutiamo a trovare la configurazione giusta.",
};

const pl: LocaleCopy = {
  "hero.title": "Domeny i hosting — szybko, stabilnie i w uczciwej cenie",
  "hero.subtitle":
    "Zarejestruj domenę i wybierz hosting współdzielony, cloud, WordPress lub VPS w {name}.",
  "hero.introTitleLine1": "Domeny i hosting",
  "hero.introTitleLine2": "z {name}",
  "hero.introSubtitle":
    "Zarejestruj domenę i wybierz hosting współdzielony, cloud, WordPress lub VPS — szybko, stabilnie i w uczciwej cenie.",
  "hero.ctaServices": "Zobacz wszystkie plany hostingu",
  "hero.ctaContact": "Kliknij tutaj, aby się z nami skontaktować",
  "hero.ctaDomains": "Wyszukaj domenę",
  "hero.ctaScanTitle": "Potrzebujesz domeny lub hostingu?",
  "hero.ctaBannerText":
    "Chętnie odpowiemy na wszystkie pytania o nazwy domen, DNS, e-mail i hosting.",
  "hero.ctaHeroTitle": "Potrzebujesz domeny lub hostingu?",
  "hero.ctaScan": "Zobacz hosting",
  "hero.serversTitle": "Wybierz opcję",
  "hero.serversOnline": "Serwery online",
  "hero.domainsReady": "Domeny aktywne",
  "hero.bullet1": "Domeny, DNS i e-mail — jasno i niezawodnie.",
  "hero.bullet2": "Hosting współdzielony, cloud, WordPress i VPS.",
  "hero.bullet3": "Wsparcie po angielsku i niderlandzku.",
  "faq.q1": "Kim jest {name}?",
  "faq.a1":
    "{name} skupia się na nazwach domen i hostingu: współdzielonym, cloud, WordPress i VPS — ze wsparciem przy rejestracji, DNS, e-mailu i migracjach.",
  "faq.q2": "Jakie plany hostingu oferujecie?",
  "faq.a2":
    "Wybierz hosting współdzielony, cloud, WordPress lub VPS. Każdy plan ma jasne zasoby, SSL i wsparcie — dobierasz go do ruchu i wzrostu.",
  "faq.q3": "Czy mogę później zmienić plan lub przenieść domenę?",
  "faq.a3":
    "Tak. Możesz później przejść na wyższy plan oraz rejestrować lub przenosić domeny. Pomagamy przy DNS i migracji.",
  "services.title": "Hosting",
  "services.subtitle":
    "Domeny, hosting współdzielony, cloud, WordPress i VPS — wszystko na stabilną podstawę online.",
  "services.viewAll": "Zobacz wszystkie plany hostingu",
  "kennisbank.subtitle":
    "Poradniki o nazwach domen, DNS, e-mailu, hostingu współdzielonym, cloud, WordPress, VPS, panelach i bezpieczeństwie.",
  "kennisbank.illustrationFooter": "Baza wiedzy {name}",
  "kennisbank.ctaBody":
    "Nie znalazłeś tego, czego szukasz? Skontaktuj się ze wsparciem {name} — chętnie pomożemy.",
  "agent000.role": "Wirtualny asystent FAQ i bazy wiedzy",
  "agent000.intro":
    "Zapytaj mnie o domeny, DNS, e-mail lub hosting. Szukam w FAQ i bazie wiedzy i pomagam przy kontakcie lub zgłoszeniu.",
  "agent000.relatedProducts": "Hosting i domeny",
  "agent000.actionDomainRegister": "Zarejestruj domenę",
  "agent000.actionDomainTransfer": "Przenieś domenę",
  "agent000.actionDomainRenew": "Odnów domenę",
  "liveChat.emptyChat":
    "Zapytaj o domeny, DNS, e-mail lub hosting — pomożemy z odpowiedziami, planami i zgłoszeniami.",
  "footer.tagline":
    "Rejestracja i transfer domen, e-mail, hosting współdzielony, cloud, WordPress i VPS — gotowe na stabilną podstawę online.",
  "nav.aiScan": "Domeny",
  "nav.services": "Hosting",
  "shop.plans": "Plany hostingu",
  "shop.services": "Produkty hostingowe",
  "about.title": "Kim jest {name}?",
  "about.heroSubtitle":
    "{name} dostarcza nazwy domen i hosting — współdzielony, cloud, WordPress i VPS — ze wsparciem przy rejestracji, DNS, e-mailu i migracjach. Niezawodny partner na stabilną podstawę online.",
  "about.viewServices": "Zobacz hosting",
  "about.missionText":
    "Pomagać firmom w niezawodnych domenach i hostingu: szybko, stabilnie, w uczciwej cenie i ze wsparciem, gdy jest potrzebne.",
  "about.visionText":
    "Właściwy hosting dla każdej strony — jasny, skalowalny i bez zbędnej złożoności.",
  "about.philosophy": "Podejście {name}",
  "about.philosophyText":
    "Jasne plany, uczciwa rada i stabilna podstawa techniczna — żebyś mógł skupić się na stronie i odwiedzających.",
  "about.storyLead":
    "{name} jest partnerem w domenach i hostingu — od pierwszej rejestracji po migrację i wzrost.",
  "about.storyP1":
    "Oferujemy hosting współdzielony, cloud, WordPress i VPS oraz rejestrację domen i pomoc przy DNS. Dzięki temu strona pozostaje dostępna, bezpieczna i gotowa na wzrost.",
  "about.storyP2":
    "Nowa domena, przeniesienie, SSL, e-mail czy więcej zasobów: wyjaśniamy, co jest ważne, i pomagamy w kolejnym kroku.",
  "about.storyP3":
    "Wspieramy klientów w wielu językach i krajach, z naciskiem na szybką odpowiedź i jasną komunikację.",
  "about.approach1Desc":
    "Ustalić cele, ruch i potrzeby techniczne: który plan pasuje i jaka konfiguracja DNS lub e-mail jest potrzebna.",
  "about.approach2Desc":
    "Skonfigurować hosting, domenę i DNS — albo przeprowadzić kontrolowaną migrację z minimalnym przestojem.",
  "about.approach3Desc":
    "Sprawdzamy dostępność, SSL, uwierzytelnianie poczty i wydajność, zanim ruszysz lub zwiększysz skalę.",
  "about.approach4Desc":
    "Rosnąć razem z ruchem: wyższe plany, kopie zapasowe i wsparcie, gdy potrzebujesz więcej mocy.",
  "about.whatWeDoSubtitle": "Jeden partner od domen, hostingu i powiązanego wsparcia.",
  "about.allServicesArrow": "Cały hosting →",
  "about.serveText":
    "Dla MŚP, startupów i freelancerów, którzy chcą niezawodnej domeny i hostingu bez własnego zespołu IT. Dostajesz jasne plany, uczciwą radę i wsparcie, gdy go potrzebujesz.",
  "about.why2Desc":
    "Domena, DNS, e-mail i hosting wzmacniają się u jednego partnera, zamiast u osobnych dostawców.",
  "about.readySubtitle":
    "Wyszukaj domenę, wybierz plan lub napisz do nas — chętnie pomożemy dobrać właściwą konfigurację.",
};

const cs: LocaleCopy = {
  "hero.title": "Domény a webhosting — rychle, stabilně a za férovou cenu",
  "hero.subtitle":
    "Zaregistrujte doménu a vyberte si sdílený, cloud, WordPress nebo VPS hosting u {name}.",
  "hero.introTitleLine1": "Domény a hosting",
  "hero.introTitleLine2": "s {name}",
  "hero.introSubtitle":
    "Zaregistrujte doménu a vyberte si sdílený, cloud, WordPress nebo VPS hosting — rychle, stabilně a za férovou cenu.",
  "hero.ctaServices": "Zobrazit všechny hostingové tarify",
  "hero.ctaContact": "Klikněte sem a kontaktujte nás",
  "hero.ctaDomains": "Vyhledat doménu",
  "hero.ctaScanTitle": "Potřebujete doménu nebo hosting?",
  "hero.ctaBannerText":
    "Rádi odpovíme na všechny otázky k doménám, DNS, e-mailu a webhostingu.",
  "hero.ctaHeroTitle": "Potřebujete doménu nebo hosting?",
  "hero.ctaScan": "Zobrazit hosting",
  "hero.serversTitle": "Vyberte si",
  "hero.serversOnline": "Servery online",
  "hero.domainsReady": "Domény aktivní",
  "hero.bullet1": "Domény, DNS a e-mail — jasně a spolehlivě.",
  "hero.bullet2": "Sdílený, cloud, WordPress a VPS hosting.",
  "hero.bullet3": "Podpora v angličtině a nizozemštině.",
  "faq.q1": "Kdo je {name}?",
  "faq.a1":
    "{name} se soustředí na domény a webhosting: sdílený, cloud, WordPress a VPS — s podporou registrace, DNS, e-mailu a migrací.",
  "faq.q2": "Jaké hostingové tarify nabízíte?",
  "faq.a2":
    "Vyberte si sdílený hosting, cloud hosting, WordPress hosting nebo VPS. Každý tarif má jasné prostředky, SSL a podporu — volíte podle provozu a růstu.",
  "faq.q3": "Mohu později přejít na vyšší tarif nebo převést doménu?",
  "faq.a3":
    "Ano. Později můžete přejít na vyšší tarif a domény registrovat nebo převést. Pomůžeme s DNS a migrací.",
  "services.title": "Hosting",
  "services.subtitle":
    "Domény, sdílený hosting, cloud, WordPress a VPS — vše pro stabilní online základ.",
  "services.viewAll": "Zobrazit všechny hostingové tarify",
  "kennisbank.subtitle":
    "Návody k doménám, DNS, e-mailu, sdílenému hostingu, cloudu, WordPressu, VPS, ovládacím panelům a zabezpečení.",
  "kennisbank.illustrationFooter": "Znalostní báze {name}",
  "kennisbank.ctaBody":
    "Nenašli jste, co hledáte? Kontaktujte podporu {name} — rádi pomůžeme.",
  "agent000.role": "Virtuální asistent FAQ a znalostní báze",
  "agent000.intro":
    "Zeptejte se mě na domény, DNS, e-mail nebo hosting. Hledám ve FAQ a znalostní bázi a pomůžu s kontaktem nebo tiketem.",
  "agent000.relatedProducts": "Hosting a domény",
  "agent000.actionDomainRegister": "Registrovat doménu",
  "agent000.actionDomainTransfer": "Převést doménu",
  "agent000.actionDomainRenew": "Prodloužit doménu",
  "liveChat.emptyChat":
    "Zeptejte se na domény, DNS, e-mail nebo hosting — pomůžeme s odpověďmi, tarify a tikety.",
  "footer.tagline":
    "Registrace a převod domén, e-mail, sdílený webhosting, cloud, WordPress a VPS — připraveno pro stabilní online základ.",
  "nav.aiScan": "Domény",
  "nav.services": "Hosting",
  "shop.plans": "Hostingové tarify",
  "shop.services": "Hostingové produkty",
  "about.title": "Kdo je {name}?",
  "about.heroSubtitle":
    "{name} poskytuje domény a webhosting — sdílený, cloud, WordPress a VPS — s podporou registrace, DNS, e-mailu a migrací. Spolehlivý partner pro stabilní online základ.",
  "about.viewServices": "Zobrazit hosting",
  "about.missionText":
    "Pomáhat firmám se spolehlivými doménami a webhostingem: rychle, stabilně, za férovou cenu a s podporou, když je potřeba.",
  "about.visionText":
    "Správná volba hostingu pro každý web — jasná, škálovatelná a bez zbytečné složitosti.",
  "about.philosophy": "Přístup {name}",
  "about.philosophyText":
    "Jasné tarify, upřímné rady a stabilní technický základ — abyste se mohli soustředit na web a návštěvníky.",
  "about.storyLead":
    "{name} je váš partner pro domény a hosting — od první registrace po migraci a růst.",
  "about.storyP1":
    "Nabízíme sdílený hosting, cloud hosting, WordPress hosting a VPS a také registraci domén a pomoc s DNS. Web tak zůstane dostupný, zabezpečený a připravený růst.",
  "about.storyP2":
    "Ať jde o novou doménu, převod, SSL, e-mail nebo více prostředků: vysvětlíme, na čem záleží, a pomůžeme s dalším krokem.",
  "about.storyP3":
    "Podporujeme zákazníky ve více jazycích a zemích, s důrazem na rychlou odezvu a jasnou komunikaci.",
  "about.approach1Desc":
    "Ujasnit cíle, provoz a technické potřeby: který tarif sedí a jaké nastavení DNS nebo e-mailu je potřeba.",
  "about.approach2Desc":
    "Nastavit hosting, doménu a DNS — nebo provést řízenou migraci s minimálním výpadkem.",
  "about.approach3Desc":
    "Před spuštěním nebo navýšením kontrolujeme dostupnost, SSL, ověření pošty a výkon.",
  "about.approach4Desc":
    "Růst s provozem: vyšší tarify, zálohy a podpora, když potřebujete větší kapacitu.",
  "about.whatWeDoSubtitle": "Jeden partner pro domény, hosting a související podporu.",
  "about.allServicesArrow": "Veškerý hosting →",
  "about.serveText":
    "Pro malé a střední firmy, startupy a freelancery, kteří chtějí spolehlivou doménu a hosting bez vlastního IT týmu. Dostanete jasné tarify, upřímné rady a podporu, když ji potřebujete.",
  "about.why2Desc":
    "Doména, DNS, e-mail a hosting se u jednoho partnera posilují, místo oddělených dodavatelů.",
  "about.readySubtitle":
    "Vyhledejte doménu, vyberte tarif nebo nás kontaktujte — rádi pomůžeme s vhodným nastavením.",
};

const sk: LocaleCopy = {
  "hero.title": "Domény a webhosting — rýchlo, stabilne a za férovú cenu",
  "hero.subtitle":
    "Zaregistrujte doménu a vyberte si zdieľaný, cloud, WordPress alebo VPS hosting u {name}.",
  "hero.introTitleLine1": "Domény a hosting",
  "hero.introTitleLine2": "s {name}",
  "hero.introSubtitle":
    "Zaregistrujte doménu a vyberte si zdieľaný, cloud, WordPress alebo VPS hosting — rýchlo, stabilne a za férovú cenu.",
  "hero.ctaServices": "Zobraziť všetky hostingové tarify",
  "hero.ctaContact": "Kliknite sem a kontaktujte nás",
  "hero.ctaDomains": "Vyhľadať doménu",
  "hero.ctaScanTitle": "Potrebujete doménu alebo hosting?",
  "hero.ctaBannerText":
    "Radi odpovieme na všetky otázky o doménach, DNS, e-maile a webhostingu.",
  "hero.ctaHeroTitle": "Potrebujete doménu alebo hosting?",
  "hero.ctaScan": "Zobraziť hosting",
  "hero.serversTitle": "Vyberte si",
  "hero.serversOnline": "Servery online",
  "hero.domainsReady": "Domény aktívne",
  "hero.bullet1": "Domény, DNS a e-mail — jasne a spoľahlivo.",
  "hero.bullet2": "Zdieľaný, cloud, WordPress a VPS hosting.",
  "hero.bullet3": "Podpora v angličtine a holandčine.",
  "faq.q1": "Kto je {name}?",
  "faq.a1":
    "{name} sa sústreďuje na domény a webhosting: zdieľaný, cloud, WordPress a VPS — s podporou registrácie, DNS, e-mailu a migrácií.",
  "faq.q2": "Aké hostingové tarify ponúkate?",
  "faq.a2":
    "Vyberte si zdieľaný hosting, cloud hosting, WordPress hosting alebo VPS. Každý tarif má jasné prostriedky, SSL a podporu — volíte podľa prevádzky a rastu.",
  "faq.q3": "Môžem neskôr prejsť na vyšší tarif alebo previesť doménu?",
  "faq.a3":
    "Áno. Neskôr môžete prejsť na vyšší tarif a domény registrovať alebo previesť. Pomôžeme s DNS a migráciou.",
  "services.title": "Hosting",
  "services.subtitle":
    "Domény, zdieľaný hosting, cloud, WordPress a VPS — všetko pre stabilný online základ.",
  "services.viewAll": "Zobraziť všetky hostingové tarify",
  "kennisbank.subtitle":
    "Návody k doménam, DNS, e-mailu, zdieľanému hostingu, cloudu, WordPressu, VPS, ovládacím panelom a zabezpečeniu.",
  "kennisbank.illustrationFooter": "Znalostná báza {name}",
  "kennisbank.ctaBody":
    "Nenašli ste, čo hľadáte? Kontaktujte podporu {name} — radi pomôžeme.",
  "agent000.role": "Virtuálny asistent FAQ a znalostnej bázy",
  "agent000.intro":
    "Opýtajte sa ma na domény, DNS, e-mail alebo hosting. Hľadám vo FAQ a znalostnej báze a pomôžem s kontaktom alebo tiketom.",
  "agent000.relatedProducts": "Hosting a domény",
  "agent000.actionDomainRegister": "Registrovať doménu",
  "agent000.actionDomainTransfer": "Previesť doménu",
  "agent000.actionDomainRenew": "Predĺžiť doménu",
  "liveChat.emptyChat":
    "Opýtajte sa na domény, DNS, e-mail alebo hosting — pomôžeme s odpoveďami, tarifmi a tiketmi.",
  "footer.tagline":
    "Registrácia a prevod domén, e-mail, zdieľaný webhosting, cloud, WordPress a VPS — pripravené na stabilný online základ.",
  "nav.aiScan": "Domény",
  "nav.services": "Hosting",
  "shop.plans": "Hostingové tarify",
  "shop.services": "Hostingové produkty",
  "about.title": "Kto je {name}?",
  "about.heroSubtitle":
    "{name} poskytuje domény a webhosting — zdieľaný, cloud, WordPress a VPS — s podporou registrácie, DNS, e-mailu a migrácií. Spoľahlivý partner pre stabilný online základ.",
  "about.viewServices": "Zobraziť hosting",
  "about.missionText":
    "Pomáhať firmám so spoľahlivými doménami a webhostingom: rýchlo, stabilne, za férovú cenu a s podporou, keď je potrebná.",
  "about.visionText":
    "Správna voľba hostingu pre každý web — jasná, škálovateľná a bez zbytočnej zložitosti.",
  "about.philosophy": "Prístup {name}",
  "about.philosophyText":
    "Jasné tarify, úprimné rady a stabilný technický základ — aby ste sa mohli sústrediť na web a návštevníkov.",
  "about.storyLead":
    "{name} je váš partner pre domény a hosting — od prvej registrácie po migráciu a rast.",
  "about.storyP1":
    "Ponúkame zdieľaný hosting, cloud hosting, WordPress hosting a VPS aj registráciu domén a pomoc s DNS. Web tak zostane dostupný, zabezpečený a pripravený rásť.",
  "about.storyP2":
    "Či ide o novú doménu, prevod, SSL, e-mail alebo viac prostriedkov: vysvetlíme, na čom záleží, a pomôžeme s ďalším krokom.",
  "about.storyP3":
    "Podporujeme zákazníkov vo viacerých jazykoch a krajinách, s dôrazom na rýchlu odozvu a jasnú komunikáciu.",
  "about.approach1Desc":
    "Ujasniť ciele, prevádzku a technické potreby: ktorý tarif sedí a aké nastavenie DNS alebo e-mailu je potrebné.",
  "about.approach2Desc":
    "Nastaviť hosting, doménu a DNS — alebo vykonať riadenú migráciu s minimálnym výpadkom.",
  "about.approach3Desc":
    "Pred spustením alebo navýšením kontrolujeme dostupnosť, SSL, overenie pošty a výkon.",
  "about.approach4Desc":
    "Rásť s prevádzkou: vyššie tarify, zálohy a podpora, keď potrebujete väčšiu kapacitu.",
  "about.whatWeDoSubtitle": "Jeden partner pre domény, hosting a súvisiacu podporu.",
  "about.allServicesArrow": "Všetok hosting →",
  "about.serveText":
    "Pre malé a stredné firmy, startupy a freelancerov, ktorí chcú spoľahlivú doménu a hosting bez vlastného IT tímu. Dostanete jasné tarify, úprimné rady a podporu, keď ju potrebujete.",
  "about.why2Desc":
    "Doména, DNS, e-mail a hosting sa u jedného partnera posilňujú, namiesto oddelených dodávateľov.",
  "about.readySubtitle":
    "Vyhľadajte doménu, vyberte tarif alebo nás kontaktujte — radi pomôžeme s vhodným nastavením.",
};

const LOCALE_COPY: Record<string, LocaleCopy> = {
  en,
  de,
  fr,
  es,
  pt,
  it,
  pl,
  cs,
  sk,
  ...(ehLocalePacks as Record<string, LocaleCopy>),
};

function fill(value: string, name: string): string {
  return value.includes("{name}") ? value.replaceAll("{name}", name) : value;
}

/** Overlay domains/hosting copy for one non-Dutch, non-English locale. */
export function applyExtraHostingLocale(
  out: Record<string, unknown>,
  locale: string,
  name: string,
): void {
  const copy = LOCALE_COPY[locale] ?? LOCALE_COPY.en;
  const grouped: Record<string, Record<string, string>> = {};

  for (const [path, raw] of Object.entries(copy)) {
    const dot = path.indexOf(".");
    const section = path.slice(0, dot);
    const key = path.slice(dot + 1);
    (grouped[section] ??= {})[key] = fill(raw, name);
  }

  Object.assign(grouped.hero, {
    rackShared: "Shared",
    rackCloud: "Cloud",
    rackWordpress: "WordPress",
    rackVps: "VPS",
    serversSubtitle: "Shared · Cloud · WordPress · VPS",
  });
  grouped.kennisbank.brandEyebrow = name;
  grouped.liveChat.subtitle = name;
  grouped.liveChat.powered = `Agent 000 · ${name}`;

  for (const [section, values] of Object.entries(grouped)) {
    const current = isPlainObject(out[section])
      ? { ...(out[section] as Record<string, string>) }
      : {};
    out[section] = { ...current, ...values };
  }
}

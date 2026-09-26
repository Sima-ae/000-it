/**
 * Locale → English title helpers + category translations for kennisbank seed/UI.
 * Article bodies: NL (primary) + EN (fallback for all other locales).
 */
import { SUBCATEGORY_I18N } from "./subcategory-i18n";

/** Catch-all subcategory for leftover articles (display names in every site locale). */
export const OVERIGE_I18N: Record<string, { name: string; description: string }> = {
  en: {
    name: "Other",
    description: "Remaining articles in this category that do not belong to a specific topic.",
  },
  de: {
    name: "Sonstiges",
    description: "Weitere Artikel in dieser Kategorie, die zu keinem spezifischen Thema gehören.",
  },
  fr: {
    name: "Autres",
    description: "Articles restants dans cette catégorie qui n'appartiennent à aucun sujet spécifique.",
  },
  es: {
    name: "Otros",
    description: "Artículos restantes de esta categoría que no pertenecen a un tema concreto.",
  },
  pt: {
    name: "Outros",
    description: "Artigos restantes nesta categoria que não pertencem a um tema específico.",
  },
  it: {
    name: "Altri",
    description: "Articoli restanti in questa categoria che non appartengono a un argomento specifico.",
  },
  el: {
    name: "Άλλα",
    description: "Τα υπόλοιπα άρθρα αυτής της κατηγορίας που δεν ανήκουν σε συγκεκριμένο θέμα.",
  },
  pl: {
    name: "Pozostałe",
    description: "Pozostałe artykuły w tej kategorii, które nie należą do konkretnego tematu.",
  },
  cs: {
    name: "Ostatní",
    description: "Zbývající články v této kategorii, které nepatří ke konkrétnímu tématu.",
  },
  sk: {
    name: "Ostatné",
    description: "Zostávajúce články v tejto kategórii, ktoré nepatria ku konkrétnej téme.",
  },
  hu: {
    name: "Egyéb",
    description: "A kategória fennmaradó cikkei, amelyek nem tartoznak egy adott témához.",
  },
  ro: {
    name: "Altele",
    description: "Articolele rămase din această categorie care nu aparțin unui subiect anume.",
  },
  bg: {
    name: "Други",
    description: "Останалите статии в тази категория, които не принадлежат към конкретна тема.",
  },
  hr: {
    name: "Ostalo",
    description: "Preostali članci u ovoj kategoriji koji ne spadaju u određenu temu.",
  },
  sr: {
    name: "Остало",
    description: "Преостали чланци у овој категорији који не припадају одређеној теми.",
  },
  bs: {
    name: "Ostalo",
    description: "Preostali članci u ovoj kategoriji koji ne spadaju u određenu temu.",
  },
  cnr: {
    name: "Ostalo",
    description: "Preostali članci u ovoj kategoriji koji ne spadaju u određenu temu.",
  },
  sq: {
    name: "Të tjera",
    description: "Artikujt e mbetur në këtë kategori që nuk i përkasin një teme të caktuar.",
  },
  mk: {
    name: "Останато",
    description: "Останатите статии во оваа категорија што не припаѓаат на конкретна тема.",
  },
  lt: {
    name: "Kiti",
    description: "Likusieji šios kategorijos straipsniai, nepriskirti konkrečiai temai.",
  },
  da: {
    name: "Øvrige",
    description: "Øvrige artikler i denne kategori, der ikke hører til et bestemt emne.",
  },
  sv: {
    name: "Övrigt",
    description: "Övriga artiklar i den här kategorin som inte hör till ett specifikt ämne.",
  },
  no: {
    name: "Øvrige",
    description: "Øvrige artikler i denne kategorien som ikke hører til et bestemt emne.",
  },
  fi: {
    name: "Muut",
    description: "Muut tämän kategorian artikkelit, jotka eivät kuulu tiettyyn aiheeseen.",
  },
  uk: {
    name: "Інше",
    description: "Інші статті цієї категорії, які не належать до конкретної теми.",
  },
  ru: {
    name: "Прочее",
    description: "Остальные статьи этой категории, которые не относятся к конкретной теме.",
  },
  tr: {
    name: "Diğer",
    description: "Bu kategoride belirli bir konuya girmeyen kalan makaleler.",
  },
  he: {
    name: "אחר",
    description: "המאמרים הנותרים בקטגוריה זו שאינם שייכים לנושא מסוים.",
  },
  ar: {
    name: "أخرى",
    description: "المقالات المتبقية في هذه الفئة التي لا تنتمي إلى موضوع محدد.",
  },
  ka: {
    name: "სხვა",
    description: "ამ კატეგორიის დარჩენილი სტატიები, რომლებიც კონკრეტულ თემას არ მიეკუთვნება.",
  },
  hy: {
    name: "Այլ",
    description: "Այս կատեգորիայի մնացած հոդվածները, որոնք որևէ կոնկրետ թեմայի չեն պատկանում։",
  },
  az: {
    name: "Digər",
    description: "Bu kateqoriyada konkret mövzuya düşməyən qalan məqalələr.",
  },
  zh: {
    name: "其他",
    description: "本分类中不属于特定主题的其余文章。",
  },
  ja: {
    name: "その他",
    description: "このカテゴリで特定のテーマに属さない残りの記事。",
  },
};

export function isOverigeCategorySlug(slug: string) {
  return slug.endsWith("-overige");
}

export const CATEGORY_I18N: Record<
  string,
  Record<string, { name: string; description: string }>
> = {
  domeinnamen: {
    en: {
      name: "Domain names",
      description:
        "Domain registration, DNS, locks, SIDN and redirects at TripleZero iT.",
    },
    de: {
      name: "Domainnamen",
      description:
        "Domainregistrierung, DNS, Sperren, SIDN und Weiterleitungen bei TripleZero iT.",
    },
    fr: {
      name: "Noms de domaine",
      description:
        "Enregistrement de domaine, DNS, verrous, SIDN et redirections chez TripleZero iT.",
    },
    es: {
      name: "Nombres de dominio",
      description:
        "Registro de dominios, DNS, bloqueos, SIDN y redirecciones en TripleZero iT.",
    },
    pt: {
      name: "Nomes de domínio",
      description:
        "Registo de domínio, DNS, bloqueios, SIDN e redirecionamentos na TripleZero iT.",
    },
    it: {
      name: "Nomi di dominio",
      description:
        "Registrazione domini, DNS, lock, SIDN e redirect su TripleZero iT.",
    },
  },
  bloggen: {
    en: {
      name: "Blogging",
      description: "Starting and managing blogs on WordPress, Blogger and custom domains.",
    },
    de: {
      name: "Bloggen",
      description: "Blogs auf WordPress, Blogger und eigenen Domains starten und verwalten.",
    },
    fr: {
      name: "Blogging",
      description: "Créer et gérer des blogs sur WordPress, Blogger et domaines personnalisés.",
    },
    es: {
      name: "Blogs",
      description: "Crear y gestionar blogs en WordPress, Blogger y dominios propios.",
    },
    pt: {
      name: "Blogging",
      description: "Iniciar e gerir blogs no WordPress, Blogger e domínios próprios.",
    },
    it: {
      name: "Blog",
      description: "Avviare e gestire blog su WordPress, Blogger e domini personalizzati.",
    },
  },
  hosting: {
    en: {
      name: "Hosting",
      description: "Storage, bandwidth, FTP, PHP, Installatron and hosting plans.",
    },
    de: {
      name: "Hosting",
      description: "Speicher, Bandbreite, FTP, PHP, Installatron und Hosting-Pakete.",
    },
    fr: {
      name: "Hébergement",
      description: "Stockage, bande passante, FTP, PHP, Installatron et forfaits d'hébergement.",
    },
    es: {
      name: "Alojamiento",
      description: "Almacenamiento, ancho de banda, FTP, PHP, Installatron y planes de hosting.",
    },
    pt: {
      name: "Alojamento",
      description: "Armazenamento, largura de banda, FTP, PHP, Installatron e planos de hosting.",
    },
    it: {
      name: "Hosting",
      description: "Spazio, banda, FTP, PHP, Installatron e pacchetti hosting.",
    },
  },
  "e-mail": {
    en: {
      name: "Email",
      description: "Mailboxes, webmail, clients, spam filters and email authentication.",
    },
    de: {
      name: "E-Mail",
      description: "Postfächer, Webmail, Clients, Spamfilter und E-Mail-Authentifizierung.",
    },
    fr: {
      name: "E-mail",
      description: "Boîtes mail, webmail, clients, filtres anti-spam et authentification e-mail.",
    },
    es: {
      name: "Correo electrónico",
      description: "Buzones, webmail, clientes, filtros antispam y autenticación de correo.",
    },
    pt: {
      name: "E-mail",
      description: "Caixas de correio, webmail, clientes, filtros de spam e autenticação de e-mail.",
    },
    it: {
      name: "E-mail",
      description: "Caselle, webmail, client, filtri spam e autenticazione e-mail.",
    },
  },
  directadmin: {
    en: {
      name: "DirectAdmin control panel",
      description: "DirectAdmin guides: domains, email, databases, backups and more.",
    },
    de: {
      name: "DirectAdmin Control Panel",
      description: "DirectAdmin-Anleitungen: Domains, E-Mail, Datenbanken, Backups und mehr.",
    },
    fr: {
      name: "Panneau DirectAdmin",
      description: "Guides DirectAdmin : domaines, e-mail, bases de données, sauvegardes et plus.",
    },
    es: {
      name: "Panel DirectAdmin",
      description: "Guías DirectAdmin: dominios, correo, bases de datos, copias de seguridad y más.",
    },
    pt: {
      name: "Painel DirectAdmin",
      description: "Guias DirectAdmin: domínios, e-mail, bases de dados, backups e mais.",
    },
    it: {
      name: "Pannello DirectAdmin",
      description: "Guide DirectAdmin: domini, e-mail, database, backup e altro.",
    },
  },
  cyberpanel: {
    en: {
      name: "CyberPanel",
      description: "Guides for CyberPanel, OpenLiteSpeed and related tasks.",
    },
    de: {
      name: "CyberPanel",
      description: "Anleitungen für CyberPanel, OpenLiteSpeed und verwandte Aufgaben.",
    },
    fr: {
      name: "CyberPanel",
      description: "Guides pour CyberPanel, OpenLiteSpeed et tâches associées.",
    },
    es: {
      name: "CyberPanel",
      description: "Guías de CyberPanel, OpenLiteSpeed y tareas relacionadas.",
    },
    pt: {
      name: "CyberPanel",
      description: "Guias para CyberPanel, OpenLiteSpeed e tarefas relacionadas.",
    },
    it: {
      name: "CyberPanel",
      description: "Guide per CyberPanel, OpenLiteSpeed e attività correlate.",
    },
  },
  beveiliging: {
    en: {
      name: "Security",
      description: "SSL, firewalls, Wordfence and preventing hacks — including the SSL certificates and firewall subcategories.",
    },
    de: {
      name: "Sicherheit",
      description: "SSL, Firewalls, Wordfence, Hacks vermeiden und Kontosicherheit.",
    },
    fr: {
      name: "Sécurité",
      description: "SSL, pare-feu, Wordfence, prévention des piratages et sécurité des comptes.",
    },
    es: {
      name: "Seguridad",
      description: "SSL, firewalls, Wordfence, prevención de hacks y seguridad de cuentas.",
    },
    pt: {
      name: "Segurança",
      description: "SSL, firewalls, Wordfence, prevenção de hacks e segurança de contas.",
    },
    it: {
      name: "Sicurezza",
      description: "SSL, firewall, Wordfence, prevenzione hack e sicurezza account.",
    },
  },
  "crm-klantenpanel": {
    en: {
      name: "CRM and client panel",
      description: "Invoices, tickets, projects and account settings in the TripleZero client panel.",
    },
    de: {
      name: "CRM und Kundenpanel",
      description: "Rechnungen, Tickets, Projekte und Kontoeinstellungen im TripleZero-Kundenpanel.",
    },
    fr: {
      name: "CRM et panneau client",
      description: "Factures, tickets, projets et paramètres de compte dans le panneau client TripleZero.",
    },
    es: {
      name: "CRM y panel de cliente",
      description: "Facturas, tickets, proyectos y ajustes de cuenta en el panel de cliente TripleZero.",
    },
    pt: {
      name: "CRM e painel do cliente",
      description: "Faturas, tickets, projetos e definições de conta no painel de cliente TripleZero.",
    },
    it: {
      name: "CRM e pannello cliente",
      description: "Fatture, ticket, progetti e impostazioni account nel pannello cliente TripleZero.",
    },
  },
  wordpress: {
    en: {
      name: "WordPress",
      description: "Install, update, secure and optimize WordPress at TripleZero iT.",
    },
    de: {
      name: "WordPress",
      description: "WordPress installieren, aktualisieren, absichern und optimieren bei TripleZero iT.",
    },
    fr: {
      name: "WordPress",
      description: "Installer, mettre à jour, sécuriser et optimiser WordPress chez TripleZero iT.",
    },
    es: {
      name: "WordPress",
      description: "Instalar, actualizar, proteger y optimizar WordPress en TripleZero iT.",
    },
    pt: {
      name: "WordPress",
      description: "Instalar, atualizar, proteger e otimizar WordPress na TripleZero iT.",
    },
    it: {
      name: "WordPress",
      description: "Installare, aggiornare, proteggere e ottimizzare WordPress su TripleZero iT.",
    },
  },
  "veilig-online": {
    en: {
      name: "Stay safe online",
      description: "Phishing, passwords, 2FA and safe online habits for hosting customers.",
    },
    de: {
      name: "Sicher online",
      description: "Phishing, Passwörter, 2FA und sichere Online-Gewohnheiten für Hosting-Kunden.",
    },
    fr: {
      name: "Rester en sécurité en ligne",
      description: "Hameçonnage, mots de passe, 2FA et bonnes pratiques pour les clients d'hébergement.",
    },
    es: {
      name: "Seguridad en línea",
      description: "Phishing, contraseñas, 2FA y hábitos seguros para clientes de hosting.",
    },
    pt: {
      name: "Segurança online",
      description: "Phishing, palavras-passe, 2FA e hábitos seguros para clientes de hosting.",
    },
    it: {
      name: "Sicurezza online",
      description: "Phishing, password, 2FA e abitudini sicure per clienti hosting.",
    },
  },
  support: {
    en: {
      name: "Support",
      description: "Tickets, live chat, appointments and how to get help from TripleZero iT.",
    },
    de: {
      name: "Support",
      description: "Tickets, Live-Chat, Termine und Hilfe von TripleZero iT.",
    },
    fr: {
      name: "Support",
      description: "Tickets, chat en direct, rendez-vous et aide TripleZero iT.",
    },
    es: {
      name: "Soporte",
      description: "Tickets, chat en vivo, citas y cómo obtener ayuda de TripleZero iT.",
    },
    pt: {
      name: "Suporte",
      description: "Tickets, chat ao vivo, marcações e como obter ajuda da TripleZero iT.",
    },
    it: {
      name: "Supporto",
      description: "Ticket, live chat, appuntamenti e come ottenere aiuto da TripleZero iT.",
    },
  },
  plesk: {
    en: {
      name: "Plesk",
      description:
        "Working with Plesk: login, websites, email, SSL, databases, WordPress Toolkit, reseller and VPS.",
    },
    de: {
      name: "Plesk",
      description:
        "Arbeiten mit Plesk: Login, Websites, E-Mail, SSL, Datenbanken, WordPress Toolkit, Reseller und VPS.",
    },
    fr: {
      name: "Plesk",
      description:
        "Travailler avec Plesk : connexion, sites, e-mail, SSL, bases de données, WordPress Toolkit, revendeur et VPS.",
    },
    es: {
      name: "Plesk",
      description:
        "Trabajar con Plesk: acceso, sitios, correo, SSL, bases de datos, WordPress Toolkit, reseller y VPS.",
    },
    pt: {
      name: "Plesk",
      description:
        "Trabalhar com Plesk: login, sites, e-mail, SSL, bases de dados, WordPress Toolkit, reseller e VPS.",
    },
    it: {
      name: "Plesk",
      description:
        "Lavorare con Plesk: accesso, siti, e-mail, SSL, database, WordPress Toolkit, reseller e VPS.",
    },
  },
  "ai-scan": {
    en: {
      name: "AI scan",
      description: "Free AI scan scores, reports and next steps on the TripleZero platform.",
    },
    de: {
      name: "AI-Scan",
      description: "Kostenlose AI-Scan-Scores, Berichte und nächste Schritte auf der TripleZero-Plattform.",
    },
    fr: {
      name: "Analyse AI",
      description: "Scores d'analyse AI gratuits, rapports et prochaines étapes sur la plateforme TripleZero.",
    },
    es: {
      name: "Escaneo AI",
      description: "Puntuaciones del escaneo AI gratuito, informes y siguientes pasos en TripleZero.",
    },
    pt: {
      name: "Scan AI",
      description: "Pontuações do scan AI gratuito, relatórios e próximos passos na plataforma TripleZero.",
    },
    it: {
      name: "Scansione AI",
      description: "Punteggi scansione AI gratuita, report e passi successivi sulla piattaforma TripleZero.",
    },
  },
  "aeo-geo-seo": {
    en: {
      name: "AEO · GEO · SEO",
      description: "Visibility in AI search, local GEO and classic SEO with TripleZero iT.",
    },
    de: {
      name: "AEO · GEO · SEO",
      description: "Sichtbarkeit in AI-Suche, lokalem GEO und klassischem SEO mit TripleZero iT.",
    },
    fr: {
      name: "AEO · GEO · SEO",
      description: "Visibilité dans la recherche AI, GEO local et SEO classique avec TripleZero iT.",
    },
    es: {
      name: "AEO · GEO · SEO",
      description: "Visibilidad en búsqueda AI, GEO local y SEO clásico con TripleZero iT.",
    },
    pt: {
      name: "AEO · GEO · SEO",
      description: "Visibilidade em pesquisa AI, GEO local e SEO clássico com TripleZero iT.",
    },
    it: {
      name: "AEO · GEO · SEO",
      description: "Visibilità nella ricerca AI, GEO locale e SEO classico con TripleZero iT.",
    },
  },
  "ai-agents": {
    en: {
      name: "AI agents",
      description: "Using and managing AI agents in your TripleZero iT workspace.",
    },
    de: {
      name: "AI-Agenten",
      description: "AI-Agenten in Ihrem TripleZero iT-Arbeitsbereich nutzen und verwalten.",
    },
    fr: {
      name: "Agents AI",
      description: "Utiliser et gérer les agents AI dans votre espace TripleZero iT.",
    },
    es: {
      name: "Agentes AI",
      description: "Usar y gestionar agentes AI en su espacio TripleZero iT.",
    },
    pt: {
      name: "Agentes AI",
      description: "Usar e gerir agentes AI no seu espaço TripleZero iT.",
    },
    it: {
      name: "Agenti AI",
      description: "Usare e gestire agenti AI nel tuo spazio TripleZero iT.",
    },
  },
  "shop-en-pakketten": {
    en: {
      name: "Shop & plans",
      description: "Business and Extra Growth plans, checkout, VAT and ordering at TripleZero iT.",
    },
    de: {
      name: "Shop & Pakete",
      description: "Business- und Extra-Growth-Pakete, Checkout, MwSt. und Bestellung bei TripleZero iT.",
    },
    fr: {
      name: "Boutique & forfaits",
      description: "Forfaits Business et Extra Growth, paiement, TVA et commande chez TripleZero iT.",
    },
    es: {
      name: "Tienda y planes",
      description: "Planes Business y Extra Growth, checkout, IVA y pedidos en TripleZero iT.",
    },
    pt: {
      name: "Loja e planos",
      description: "Planos Business e Extra Growth, checkout, IVA e encomendas na TripleZero iT.",
    },
    it: {
      name: "Shop e pacchetti",
      description: "Piani Business ed Extra Growth, checkout, IVA e ordini su TripleZero iT.",
    },
  },
  microsoft: {
    en: {
      name: "Microsoft 365",
      description:
        "Microsoft 365, Exchange Online, Teams, OneDrive and Outlook via TripleZero iT.",
    },
    de: {
      name: "Microsoft 365",
      description:
        "Microsoft 365, Exchange Online, Teams, OneDrive und Outlook über TripleZero iT.",
    },
    fr: {
      name: "Microsoft 365",
      description:
        "Microsoft 365, Exchange Online, Teams, OneDrive et Outlook via TripleZero iT.",
    },
    es: {
      name: "Microsoft 365",
      description:
        "Microsoft 365, Exchange Online, Teams, OneDrive y Outlook a través de TripleZero iT.",
    },
    pt: {
      name: "Microsoft 365",
      description:
        "Microsoft 365, Exchange Online, Teams, OneDrive e Outlook via TripleZero iT.",
    },
    it: {
      name: "Microsoft 365",
      description:
        "Microsoft 365, Exchange Online, Teams, OneDrive e Outlook tramite TripleZero iT.",
    },
  },
  vps: {
    en: {
      name: "VPS",
      description:
        "Start and secure your VPS, snapshots, SSH/RDP, managed and unmanaged at TripleZero iT.",
    },
    de: {
      name: "VPS",
      description:
        "VPS starten und absichern, Snapshots, SSH/RDP, managed und unmanaged bei TripleZero iT.",
    },
    fr: {
      name: "VPS",
      description:
        "Démarrer et sécuriser votre VPS, snapshots, SSH/RDP, managé et non managé chez TripleZero iT.",
    },
    es: {
      name: "VPS",
      description:
        "Arrancar y proteger tu VPS, instantáneas, SSH/RDP, gestionado y no gestionado en TripleZero iT.",
    },
    pt: {
      name: "VPS",
      description:
        "Iniciar e proteger o VPS, snapshots, SSH/RDP, gerido e não gerido na TripleZero iT.",
    },
    it: {
      name: "VPS",
      description:
        "Avviare e proteggere il VPS, snapshot, SSH/RDP, managed e unmanaged su TripleZero iT.",
    },
  },
  "ssl-certificaten": {
    en: {
      name: "SSL certificates",
      description:
        "Let’s Encrypt, paid certificates, CSR, HSTS and HTTPS at TripleZero iT.",
    },
    de: {
      name: "SSL-Zertifikate",
      description:
        "Let’s Encrypt, kostenpflichtige Zertifikate, CSR, HSTS und HTTPS bei TripleZero iT.",
    },
    fr: {
      name: "Certificats SSL",
      description:
        "Let’s Encrypt, certificats payants, CSR, HSTS et HTTPS chez TripleZero iT.",
    },
    es: {
      name: "Certificados SSL",
      description:
        "Let’s Encrypt, certificados de pago, CSR, HSTS y HTTPS en TripleZero iT.",
    },
    pt: {
      name: "Certificados SSL",
      description:
        "Let’s Encrypt, certificados pagos, CSR, HSTS e HTTPS na TripleZero iT.",
    },
    it: {
      name: "Certificati SSL",
      description:
        "Let’s Encrypt, certificati a pagamento, CSR, HSTS e HTTPS su TripleZero iT.",
    },
  },
  "webdesign-en-maatwerk": {
    en: {
      name: "Web design & custom builds",
      description:
        "Next.js, PHP, HTML/CSS, landing pages and maintenance for custom sites at TripleZero iT.",
    },
    de: {
      name: "Web design & custom builds",
      description:
        "Next.js, PHP, HTML/CSS, landing pages and maintenance for custom sites at TripleZero iT.",
    },
    fr: {
      name: "Web design & custom builds",
      description:
        "Next.js, PHP, HTML/CSS, landing pages and maintenance for custom sites at TripleZero iT.",
    },
    es: {
      name: "Web design & custom builds",
      description:
        "Next.js, PHP, HTML/CSS, landing pages and maintenance for custom sites at TripleZero iT.",
    },
    pt: {
      name: "Web design & custom builds",
      description:
        "Next.js, PHP, HTML/CSS, landing pages and maintenance for custom sites at TripleZero iT.",
    },
    it: {
      name: "Web design & custom builds",
      description:
        "Next.js, PHP, HTML/CSS, landing pages and maintenance for custom sites at TripleZero iT.",
    },
  },
  "ai-integratie-automatisering": {
    en: {
      name: "AI integration & automation",
      description:
        "LLMs, chatbots, n8n/Zapier, APIs, webhooks and AI strategy alongside your hosting and website.",
    },
    de: {
      name: "AI integration & automation",
      description:
        "LLMs, chatbots, n8n/Zapier, APIs, webhooks and AI strategy alongside your hosting and website.",
    },
    fr: {
      name: "AI integration & automation",
      description:
        "LLMs, chatbots, n8n/Zapier, APIs, webhooks and AI strategy alongside your hosting and website.",
    },
    es: {
      name: "AI integration & automation",
      description:
        "LLMs, chatbots, n8n/Zapier, APIs, webhooks and AI strategy alongside your hosting and website.",
    },
    pt: {
      name: "AI integration & automation",
      description:
        "LLMs, chatbots, n8n/Zapier, APIs, webhooks and AI strategy alongside your hosting and website.",
    },
    it: {
      name: "AI integration & automation",
      description:
        "LLMs, chatbots, n8n/Zapier, APIs, webhooks and AI strategy alongside your hosting and website.",
    },
  },
  "analytics-conversie-toegankelijkheid": {
    en: {
      name: "Analytics, conversion & accessibility",
      description:
        "GTM, Matomo, CRO, Core Web Vitals, WCAG and structured data for measurable growth.",
    },
    de: {
      name: "Analytics, conversion & accessibility",
      description:
        "GTM, Matomo, CRO, Core Web Vitals, WCAG and structured data for measurable growth.",
    },
    fr: {
      name: "Analytics, conversion & accessibility",
      description:
        "GTM, Matomo, CRO, Core Web Vitals, WCAG and structured data for measurable growth.",
    },
    es: {
      name: "Analytics, conversion & accessibility",
      description:
        "GTM, Matomo, CRO, Core Web Vitals, WCAG and structured data for measurable growth.",
    },
    pt: {
      name: "Analytics, conversion & accessibility",
      description:
        "GTM, Matomo, CRO, Core Web Vitals, WCAG and structured data for measurable growth.",
    },
    it: {
      name: "Analytics, conversion & accessibility",
      description:
        "GTM, Matomo, CRO, Core Web Vitals, WCAG and structured data for measurable growth.",
    },
  },
  "e-commerce-webshops": {
    en: {
      name: "E-commerce & online stores",
      description:
        "WooCommerce, Mollie/iDEAL, product feeds, performance and store security.",
    },
    de: {
      name: "E-commerce & online stores",
      description:
        "WooCommerce, Mollie/iDEAL, product feeds, performance and store security.",
    },
    fr: {
      name: "E-commerce & online stores",
      description:
        "WooCommerce, Mollie/iDEAL, product feeds, performance and store security.",
    },
    es: {
      name: "E-commerce & online stores",
      description:
        "WooCommerce, Mollie/iDEAL, product feeds, performance and store security.",
    },
    pt: {
      name: "E-commerce & online stores",
      description:
        "WooCommerce, Mollie/iDEAL, product feeds, performance and store security.",
    },
    it: {
      name: "E-commerce & online stores",
      description:
        "WooCommerce, Mollie/iDEAL, product feeds, performance and store security.",
    },
  },
  "cdn-performance-cloudflare": {
    en: {
      name: "CDN, performance & Cloudflare",
      description:
        "CDN, Cloudflare, caching, images and speed for sites at TripleZero iT.",
    },
    de: {
      name: "CDN, performance & Cloudflare",
      description:
        "CDN, Cloudflare, caching, images and speed for sites at TripleZero iT.",
    },
    fr: {
      name: "CDN, performance & Cloudflare",
      description:
        "CDN, Cloudflare, caching, images and speed for sites at TripleZero iT.",
    },
    es: {
      name: "CDN, performance & Cloudflare",
      description:
        "CDN, Cloudflare, caching, images and speed for sites at TripleZero iT.",
    },
    pt: {
      name: "CDN, performance & Cloudflare",
      description:
        "CDN, Cloudflare, caching, images and speed for sites at TripleZero iT.",
    },
    it: {
      name: "CDN, performance & Cloudflare",
      description:
        "CDN, Cloudflare, caching, images and speed for sites at TripleZero iT.",
    },
  },

  "infrastructuur-servers": {
    en: {
      name: "Infrastructure & servers",
      description:
        "Dedicated concepts, rescue, Docker, apps on VPS, VPN and network hardening at TripleZero iT.",
    },
    de: {
      name: "Infrastructure & servers",
      description:
        "Dedicated concepts, rescue, Docker, apps on VPS, VPN and network hardening at TripleZero iT.",
    },
    fr: {
      name: "Infrastructure & servers",
      description:
        "Dedicated concepts, rescue, Docker, apps on VPS, VPN and network hardening at TripleZero iT.",
    },
    es: {
      name: "Infrastructure & servers",
      description:
        "Dedicated concepts, rescue, Docker, apps on VPS, VPN and network hardening at TripleZero iT.",
    },
    pt: {
      name: "Infrastructure & servers",
      description:
        "Dedicated concepts, rescue, Docker, apps on VPS, VPN and network hardening at TripleZero iT.",
    },
    it: {
      name: "Infrastructure & servers",
      description:
        "Dedicated concepts, rescue, Docker, apps on VPS, VPN and network hardening at TripleZero iT.",
    },
  },
  "foutmeldingen-troubleshooting": {
    en: {
      name: "Errors & troubleshooting",
      description:
        "HTTP codes, mail delivery, DNS/SSL, databases and performance incidents.",
    },
    de: {
      name: "Errors & troubleshooting",
      description:
        "HTTP codes, mail delivery, DNS/SSL, databases and performance incidents.",
    },
    fr: {
      name: "Errors & troubleshooting",
      description:
        "HTTP codes, mail delivery, DNS/SSL, databases and performance incidents.",
    },
    es: {
      name: "Errors & troubleshooting",
      description:
        "HTTP codes, mail delivery, DNS/SSL, databases and performance incidents.",
    },
    pt: {
      name: "Errors & troubleshooting",
      description:
        "HTTP codes, mail delivery, DNS/SSL, databases and performance incidents.",
    },
    it: {
      name: "Errors & troubleshooting",
      description:
        "HTTP codes, mail delivery, DNS/SSL, databases and performance incidents.",
    },
  },
  "privacy-juridisch-compliance": {
    en: {
      name: "Privacy, legal & compliance",
      description:
        "GDPR/AVG, cookies, webshop rules, required pages and EU tooling — educational, not legal advice.",
    },
    de: {
      name: "Privacy, legal & compliance",
      description:
        "GDPR/AVG, cookies, webshop rules, required pages and EU tooling — educational, not legal advice.",
    },
    fr: {
      name: "Privacy, legal & compliance",
      description:
        "GDPR/AVG, cookies, webshop rules, required pages and EU tooling — educational, not legal advice.",
    },
    es: {
      name: "Privacy, legal & compliance",
      description:
        "GDPR/AVG, cookies, webshop rules, required pages and EU tooling — educational, not legal advice.",
    },
    pt: {
      name: "Privacy, legal & compliance",
      description:
        "GDPR/AVG, cookies, webshop rules, required pages and EU tooling — educational, not legal advice.",
    },
    it: {
      name: "Privacy, legal & compliance",
      description:
        "GDPR/AVG, cookies, webshop rules, required pages and EU tooling — educational, not legal advice.",
    },
  },
  "vergelijkingen-keuzehulp": {
    en: {
      name: "Comparisons & decision guides",
      description:
        "Platform, hosting, payments and builder choices with clear SMB criteria.",
    },
    de: {
      name: "Comparisons & decision guides",
      description:
        "Platform, hosting, payments and builder choices with clear SMB criteria.",
    },
    fr: {
      name: "Comparisons & decision guides",
      description:
        "Platform, hosting, payments and builder choices with clear SMB criteria.",
    },
    es: {
      name: "Comparisons & decision guides",
      description:
        "Platform, hosting, payments and builder choices with clear SMB criteria.",
    },
    pt: {
      name: "Comparisons & decision guides",
      description:
        "Platform, hosting, payments and builder choices with clear SMB criteria.",
    },
    it: {
      name: "Comparisons & decision guides",
      description:
        "Platform, hosting, payments and builder choices with clear SMB criteria.",
    },
  },

  ...SUBCATEGORY_I18N,
};

/** Prefer locale → en → first available for category copy. */
export function categoryCopy(
  slug: string,
  locale: string,
  fallbackNl: { name: string; description: string },
): { name: string; description: string } {
  if (locale === "nl") return fallbackNl;
  if (isOverigeCategorySlug(slug)) {
    return OVERIGE_I18N[locale] || OVERIGE_I18N.en || fallbackNl;
  }
  const row = CATEGORY_I18N[slug];
  if (!row) return fallbackNl;
  return row[locale] || row.en || fallbackNl;
}

const SLUG_GLOSSARY: Record<string, string> = {
  een: "a",
  het: "the",
  de: "the",
  van: "of",
  voor: "for",
  jouw: "your",
  je: "your",
  mijn: "my",
  met: "with",
  zonder: "without",
  naar: "to",
  in: "in",
  op: "on",
  als: "as",
  of: "or",
  en: "and",
  hoe: "how",
  kan: "can",
  ik: "i",
  wat: "what",
  waarom: "why",
  waar: "where",
  wanneer: "when",
  nieuw: "new",
  nieuwe: "new",
  toevoegen: "add",
  verwijderen: "remove",
  wijzigen: "change",
  instellen: "set up",
  activeren: "activate",
  deactiveren: "deactivate",
  configureren: "configure",
  controleren: "check",
  herstellen: "restore",
  maken: "create",
  aanmaken: "create",
  beheren: "manage",
  gebruiken: "use",
  werken: "work",
  werkt: "works",
  niet: "not",
  geen: "no",
  wel: "does",
  domein: "domain",
  domeinen: "domains",
  domeinnaam: "domain name",
  domeinnamen: "domain names",
  hosting: "hosting",
  website: "website",
  websites: "websites",
  e: "e",
  mail: "mail",
  email: "email",
  mailbox: "mailbox",
  mailboxen: "mailboxes",
  webmail: "webmail",
  wachtwoord: "password",
  wachtwoorden: "passwords",
  account: "account",
  accounts: "accounts",
  gebruiker: "user",
  gebruikers: "users",
  database: "database",
  databases: "databases",
  backup: "backup",
  backups: "backups",
  certificaat: "certificate",
  certificaten: "certificates",
  ssl: "SSL",
  dns: "DNS",
  record: "record",
  records: "records",
  redirect: "redirect",
  forward: "forward",
  reseller: "reseller",
  klantenpanel: "client panel",
  ticket: "ticket",
  tickets: "tickets",
  support: "support",
  beveiliging: "security",
  firewall: "firewall",
  spam: "spam",
  filter: "filter",
  php: "PHP",
  ftp: "FTP",
  ssh: "SSH",
  wordpress: "WordPress",
  plugin: "plugin",
  plugins: "plugins",
  thema: "theme",
  update: "update",
  updates: "updates",
  installeren: "install",
  installatie: "installation",
  probleem: "problem",
  problemen: "problems",
  fout: "error",
  foutmelding: "error message",
  uitleg: "explanation",
  stappen: "steps",
  handleiding: "guide",
  abonnement: "subscription",
  dienst: "service",
  diensten: "services",
  opheffen: "cancel",
  opzeggen: "cancel",
  betalen: "pay",
  factuur: "invoice",
  facturen: "invoices",
  pakket: "plan",
  pakketten: "plans",
  shop: "shop",
  checkout: "checkout",
  btw: "VAT",
  scan: "scan",
  agent: "agent",
  agents: "agents",
  analyse: "analysis",
  score: "score",
  scores: "scores",
  rapport: "report",
  seo: "SEO",
  aeo: "AEO",
  geo: "GEO",
  directadmin: "DirectAdmin",
  cyberpanel: "CyberPanel",
  plesk: "Plesk",
  openlitespeed: "OpenLiteSpeed",
  sidn: "SIDN",
  quarantine: "quarantine",
  quarantaine: "quarantine",
  lock: "lock",
  gelockt: "locked",
  trustee: "trustee",
  anoniem: "anonymous",
  registreren: "register",
  bescherm: "protect",
  beschermen: "protect",
  control: "control",
  meta: "meta",
  tag: "tag",
  url: "URL",
  koppelen: "connect",
  meerdere: "multiple",
  dezelfde: "the same",
  terug: "back",
  vinden: "find",
  staat: "is",
  halen: "remove",
  uit: "from",
  nl: ".nl",
  two: "2",
  fa: "FA",
  "2fa": "2FA",
  tfa: "2FA",
  aan: "to",
  spf: "SPF",
  dkim: "DKIM",
  dmarc: "DMARC",
  crm: "CRM",
  ai: "AI",
  triplezero: "TripleZero",
  it: "iT",
};

/** @deprecated Broken word-by-word mixer — do not use for content. Kept only so repair-kennisbank can detect old glossary titles. */
export function englishTitleFromSlug(slug: string, dutchTitle: string): string {
  const parts = slug.split("-").filter(Boolean);
  if (!parts.length) return dutchTitle;
  const words = parts.map((w) => {
    const key = w.toLowerCase();
    if (SLUG_GLOSSARY[key]) return SLUG_GLOSSARY[key];
    if (/^\d+$/.test(key)) return key;
    if (key.length <= 3 && key === key.toUpperCase()) return key;
    return key;
  });
  let s = words.join(" ").replace(/\s+/g, " ").trim();
  s = s.replace(/\bi\b/g, "I");
  s = s.charAt(0).toUpperCase() + s.slice(1);
  // Light cleanup
  s = s
    .replace(/\bSsl\b/g, "SSL")
    .replace(/\bDns\b/g, "DNS")
    .replace(/\bPhp\b/g, "PHP")
    .replace(/\bFtp\b/g, "FTP")
    .replace(/\bSsh\b/g, "SSH")
    .replace(/\bSeo\b/g, "SEO")
    .replace(/\bAeo\b/g, "AEO")
    .replace(/\bGeo\b/g, "GEO")
    .replace(/\bAi\b/g, "AI")
    .replace(/\bUrl\b/g, "URL")
    .replace(/\b2 fa\b/gi, "2FA")
    .replace(/\bWordpress\b/g, "WordPress")
    .replace(/\bDirectadmin\b/g, "DirectAdmin")
    .replace(/\bCyberpanel\b/g, "CyberPanel")
    .replace(/\bPlesk\b/g, "Plesk")
    .replace(/\bTriplezero\b/g, "TripleZero");
  return s;
}

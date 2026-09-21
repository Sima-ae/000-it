/**
 * Locale → English title helpers + category translations for kennisbank seed/UI.
 * Article bodies: NL (primary) + EN (fallback for all other locales).
 */
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
      description: "SSL, firewalls, Wordfence, preventing hacks and account security.",
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
      description: "Working with Plesk: domains, email, databases and subscriptions.",
    },
    de: {
      name: "Plesk",
      description: "Arbeiten mit Plesk: Domains, E-Mail, Datenbanken und Abonnements.",
    },
    fr: {
      name: "Plesk",
      description: "Travailler avec Plesk : domaines, e-mail, bases de données et abonnements.",
    },
    es: {
      name: "Plesk",
      description: "Trabajar con Plesk: dominios, correo, bases de datos y suscripciones.",
    },
    pt: {
      name: "Plesk",
      description: "Trabalhar com Plesk: domínios, e-mail, bases de dados e subscrições.",
    },
    it: {
      name: "Plesk",
      description: "Lavorare con Plesk: domini, e-mail, database e abbonamenti.",
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
};

/** Prefer locale → en → first available for category copy. */
export function categoryCopy(
  slug: string,
  locale: string,
  fallbackNl: { name: string; description: string },
): { name: string; description: string } {
  const row = CATEGORY_I18N[slug];
  if (!row) return fallbackNl;
  if (locale === "nl") return fallbackNl;
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

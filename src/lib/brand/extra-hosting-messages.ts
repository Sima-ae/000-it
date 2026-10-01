import { EXTRA_HOSTING_PUBLIC_NAME, replaceTripleZeroDeep } from "@/lib/brand/public-name";
import { applyExtraHostingLocale } from "@/lib/brand/extra-hosting-locale-copy";
import { BRANDS } from "@/lib/brand/config";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asStringRecord(value: unknown): Record<string, string> {
  return isPlainObject(value) ? { ...(value as Record<string, string>) } : {};
}

/**
 * Extra Hosting copy: domains/hosting only — no AI, scans, or other services.
 * Applied in i18n request config (server getTranslations) and locale layout (client).
 */
export function applyExtraHostingMessages<T>(
  messages: T,
  locale: string,
): T {
  const isNl = locale === "nl";
  const out = { ...(messages as Record<string, unknown>) };
  const name = EXTRA_HOSTING_PUBLIC_NAME;

  out.brand = name;

  if (locale !== "nl" && locale !== "en") {
    applyExtraHostingLocale(out, locale, name);
    return replaceTripleZeroDeep(out, { locale }) as T;
  }

  const hero = asStringRecord(out.hero);
  if (isNl) {
    hero.title = "Domeinen en webhosting — snel, stabiel en scherp geprijsd";
    hero.subtitle = `Registreer je domein en kies shared, cloud, WordPress of VPS hosting bij ${name}.`;
    hero.introTitleLine1 = "Domeinen en hosting";
    hero.introTitleLine2 = `met ${name}`;
    hero.introSubtitle =
      "Registreer je gewenste domeinnaam en kies voor Shared, Cloud, WordPress of VPS hosting — snel, stabiel en scherp geprijsd.";
    hero.ctaServices = "Bekijk alle hosting plannen";
    hero.ctaContact = "Contact opnemen";
    hero.ctaDomains = "Zoek een domein";
    hero.ctaScanTitle = "Hulp nodig?";
    hero.ctaBannerText =
      "Wij beantwoorden graag al jouw vragen over een domeinnaam registreren / verhuizen, DNS, e-mail en webhosting.";
    hero.ctaHeroTitle = "Hulp nodig?";
    hero.ctaScan = "Bekijk hosting";
    hero.serversTitle = "Maak een keuze";
    hero.serversSubtitle = "Shared · Cloud · WordPress · VPS";
    hero.rackShared = "Shared";
    hero.rackCloud = "Cloud";
    hero.rackWordpress = "WordPress";
    hero.rackVps = "VPS";
    hero.serversOnline = "Servers online";
    hero.domainsReady = "Domeinen live";
    hero.bullet1 = "Domeinen, DNS en e-mail — duidelijk en betrouwbaar.";
    hero.bullet2 = "Shared, cloud, WordPress en VPS hosting.";
    hero.bullet3 = "Support in het Nederlands en Engels.";
  } else {
    hero.title = "Domains and web hosting — fast, stable and fairly priced";
    hero.subtitle = `Register your domain and choose shared, cloud, WordPress or VPS hosting with ${name}.`;
    hero.introTitleLine1 = "Domains and hosting";
    hero.introTitleLine2 = `with ${name}`;
    hero.introSubtitle =
      "Register your domain and choose shared, cloud, WordPress or VPS hosting — fast, stable and fairly priced.";
    hero.ctaServices = "View all hosting plans";
    hero.ctaContact = "Click here to contact us";
    hero.ctaDomains = "Search a domain";
    hero.ctaScanTitle = "Need a domain or hosting?";
    hero.ctaBannerText =
      "We’re happy to answer all your questions about domain names, DNS, email and web hosting.";
    hero.ctaHeroTitle = "Need a domain or hosting?";
    hero.ctaScan = "View hosting";
    hero.serversTitle = "Make a choice";
    hero.serversSubtitle = "Shared · Cloud · WordPress · VPS";
    hero.rackShared = "Shared";
    hero.rackCloud = "Cloud";
    hero.rackWordpress = "WordPress";
    hero.rackVps = "VPS";
    hero.serversOnline = "Servers online";
    hero.domainsReady = "Domains live";
    hero.bullet1 = "Domains, DNS and email — clear and reliable.";
    hero.bullet2 = "Shared, cloud, WordPress and VPS hosting.";
    hero.bullet3 = "Support in English and Dutch.";
  }
  out.hero = hero;

  const faq = asStringRecord(out.faq);
  if (isNl) {
    faq.q1 = `Wie is ${name}?`;
    faq.a1 = `${name} is gericht op domeinnamen, DNS, e-mail en webhosting: shared, cloud, WordPress en VPS — inclusief registratie, verhuizing en migraties. Bekijk ook onze FAQ en kennisbank voor stapsgewijze antwoorden.`;
    faq.q2 = "Welke hostingplannen hebben jullie?";
    faq.a2 =
      "Shared, cloud, WordPress en VPS — kies op traffic en groei. Elk plan heeft duidelijke resources, SSL en support. Details en prijzen staan op de hostingpagina’s en in de uitgebreide FAQ.";
    faq.q3 = "Kan ik later upgraden of een domein verhuizen?";
    faq.a3 =
      "Ja. Je kunt later upgraden (bijvoorbeeld shared → cloud/VPS) en domeinen registreren of verhuizen. We helpen bij DNS, e-mailauthenticatie en migratie — meer in de FAQ en kennisbank.";
  } else {
    faq.q1 = `Who is ${name}?`;
    faq.a1 = `${name} focuses on domains, DNS, email and web hosting: shared, cloud, WordPress and VPS — including registration, transfers and migrations. See our FAQ and knowledge base for step-by-step answers.`;
    faq.q2 = "Which hosting plans do you offer?";
    faq.a2 =
      "Shared, cloud, WordPress and VPS — choose by traffic and growth. Every plan has clear resources, SSL and support. Details and pricing are on the hosting pages and in the full FAQ.";
    faq.q3 = "Can I upgrade later or transfer a domain?";
    faq.a3 =
      "Yes. You can upgrade later (for example shared → cloud/VPS) and register or transfer domains. We help with DNS, email authentication and migration — more in the FAQ and knowledge base.";
  }
  out.faq = faq;

  const services = asStringRecord(out.services);
  if (isNl) {
    services.title = "Hosting";
    services.subtitle =
      "Domeinnamen registreren / verhuizen, e-mail, gedeelde webhosting, cloud, WordPress en VPS — gereed voor een stabiele online basis.";
    services.viewAll = "Bekijk alle hosting plannen";
  } else {
    services.title = "Hosting";
    services.subtitle =
      "Domains, shared, cloud, WordPress and VPS — everything for a stable online foundation.";
    services.viewAll = "View all hosting plans";
  }
  out.services = services;

  const kennisbank = asStringRecord(out.kennisbank);
  if (isNl) {
    kennisbank.subtitle =
      "Handleidingen over domeinnamen, DNS, e-mail, shared hosting, cloud, WordPress, VPS, control panels en beveiliging.";
    kennisbank.brandEyebrow = name;
    kennisbank.illustrationFooter = `${name} kennisbank`;
    kennisbank.ctaBody = `Niet gevonden wat je zoekt? Neem contact op met ${name} support — we helpen graag verder.`;
  } else {
    kennisbank.subtitle =
      "Guides on domain names, DNS, email, shared hosting, cloud, WordPress, VPS, control panels and security.";
    kennisbank.brandEyebrow = name;
    kennisbank.illustrationFooter = `${name} knowledge base`;
    kennisbank.ctaBody = `Can’t find what you need? Contact ${name} support — we’re happy to help.`;
  }
  out.kennisbank = kennisbank;

  const agent000 = asStringRecord(out.agent000);
  if (isNl) {
    agent000.role = "Virtuele FAQ- en kennisbankassistent";
    agent000.intro = `Stel mij een vraag over domeinen, DNS, e-mail of hosting. Ik zoek in onze FAQ en kennisbank en help bij contact of een ticket.`;
    agent000.relatedProducts = "Hosting & domeinen";
    agent000.actionDomainRegister = "Domein registreren";
    agent000.actionDomainTransfer = "Domein verhuizen";
    agent000.actionDomainRenew = "Domein verlengen";
  } else {
    agent000.role = "Virtual FAQ and knowledge-base assistant";
    agent000.intro = `Ask me about domains, DNS, email or hosting. I search our FAQ and knowledge base and help with contact or a ticket.`;
    agent000.relatedProducts = "Hosting & domains";
    agent000.actionDomainRegister = "Register a domain";
    agent000.actionDomainTransfer = "Transfer a domain";
    agent000.actionDomainRenew = "Renew a domain";
  }
  out.agent000 = agent000;

  const liveChat = asStringRecord(out.liveChat);
  liveChat.subtitle = name;
  liveChat.powered = `Agent 000 · ${name}`;
  if (isNl) {
    liveChat.emptyChat =
      "Stel een vraag over domeinen, DNS, e-mail of hosting — we helpen met antwoorden, plannen en tickets.";
  } else {
    liveChat.emptyChat =
      "Ask about domains, DNS, email or hosting — we help with answers, plans and tickets.";
  }
  out.liveChat = liveChat;

  const footer = asStringRecord(out.footer);
  footer.tagline = isNl
    ? BRANDS.extrahosting.tagline.nl
    : BRANDS.extrahosting.tagline.en;
  out.footer = footer;

  const nav = asStringRecord(out.nav);
  if (isNl) {
    nav.aiScan = "Domeinen";
    nav.services = "Hosting";
  } else {
    nav.aiScan = "Domains";
    nav.services = "Hosting";
  }
  out.nav = nav;

  const shop = asStringRecord(out.shop);
  if (isNl) {
    shop.plans = "Hostingplannen";
    shop.services = "Hostingproducten";
  } else {
    shop.plans = "Hosting plans";
    shop.services = "Hosting products";
  }
  out.shop = shop;

  const about = asStringRecord(out.about);
  if (isNl) {
    about.title = `Wie is ${name}?`;
    about.heroSubtitle = `${name} levert domeinnamen en webhosting — shared, cloud, WordPress en VPS — met support bij registratie, DNS, e-mail en migraties. Een betrouwbare partner voor een stabiele online basis.`;
    about.viewServices = "Bekijk hosting";
    about.missionText =
      "Ondernemers helpen met betrouwbare domeinen en webhosting: snel, stabiel, scherp geprijsd en met support wanneer dat nodig is.";
    about.visionText =
      "Voor elke website de juiste hostingkeuze — helder, schaalbaar en zonder onnodige complexiteit.";
    about.philosophy = `De ${name}-aanpak`;
    about.philosophyText =
      "Duidelijke plannen, eerlijk advies en een stabiele technische basis — zodat jij kunt focussen op jouw website en bezoekers.";
    about.storyLead = `${name} is jouw partner voor domeinen en hosting — van eerste registratie tot migratie en groei.`;
    about.storyP1 =
      "Wij bieden shared hosting, cloud hosting, WordPress hosting en VPS, plus domeinregistratie en DNS-hulp. Zo blijft jouw site bereikbaar, veilig en klaar om te groeien.";
    about.storyP2 =
      "Of het nu gaat om een nieuw domein, een verhuizing, SSL, e-mail of opschalen naar meer resources: we leggen uit wat er speelt en helpen je gericht verder.";
    about.storyP3 =
      "We ondersteunen klanten in meerdere talen en landen, met focus op snelle response en duidelijke communicatie.";
    about.approach1Desc =
      "Doelen, verkeer en technische eisen in kaart: welk hostingplan past, en wat moet er met DNS of e-mail.";
    about.approach2Desc =
      "Inrichting van hosting, domein en DNS — of een gecontroleerde migratie met minimale downtime.";
    about.approach3Desc =
      "Bereikbaarheid, SSL, mail-auth en performance controleren we voordat je live gaat of opschaalt.";
    about.approach4Desc =
      "Meegroeien met jouw traffic: upgraden, backups en support wanneer je meer capaciteit nodig hebt.";
    about.whatWeDoSubtitle =
      "Eén partner voor domeinen, hosting en gerelateerde support.";
    about.allServicesArrow = "Alle hosting →";
    about.serveText =
      "Voor MKB, startups en zzp’ers die een betrouwbaar domein en hosting willen zonder een intern IT-team. Je krijgt duidelijke plannen, eerlijk advies en support wanneer je het nodig hebt.";
    about.why2Desc =
      "Domein, DNS, e-mail en hosting versterken elkaar bij één partner in plaats van losse leveranciers.";
    about.readySubtitle =
      "Zoek een domein, kies een hostingplan of neem contact op — we denken graag mee over de beste setup.";
  } else {
    about.title = `Who is ${name}?`;
    about.heroSubtitle = `${name} provides domain names and web hosting — shared, cloud, WordPress and VPS — with support for registration, DNS, email and migrations. A reliable partner for a stable online foundation.`;
    about.viewServices = "View hosting";
    about.missionText =
      "Help businesses with reliable domains and web hosting: fast, stable, fairly priced and with support when needed.";
    about.visionText =
      "The right hosting choice for every website — clear, scalable and without unnecessary complexity.";
    about.philosophy = `The ${name} approach`;
    about.philosophyText =
      "Clear plans, honest advice and a stable technical foundation — so you can focus on your website and visitors.";
    about.storyLead = `${name} is your partner for domains and hosting — from first registration to migration and growth.`;
    about.storyP1 =
      "We offer shared hosting, cloud hosting, WordPress hosting and VPS, plus domain registration and DNS help. That keeps your site reachable, secure and ready to grow.";
    about.storyP2 =
      "Whether you need a new domain, a move, SSL, email or more resources: we explain what matters and help you take the next step.";
    about.storyP3 =
      "We support customers in multiple languages and countries, with a focus on fast response and clear communication.";
    about.approach1Desc =
      "Map goals, traffic and technical needs: which hosting plan fits, and what DNS or email setup is required.";
    about.approach2Desc =
      "Set up hosting, domain and DNS — or run a controlled migration with minimal downtime.";
    about.approach3Desc =
      "We check reachability, SSL, mail auth and performance before you go live or scale up.";
    about.approach4Desc =
      "Grow with your traffic: upgrades, backups and support when you need more capacity.";
    about.whatWeDoSubtitle =
      "One partner for domains, hosting and related support.";
    about.allServicesArrow = "All hosting →";
    about.serveText =
      "For SMBs, startups and freelancers who want a reliable domain and hosting without an in-house IT team. You get clear plans, honest advice and support when you need it.";
    about.why2Desc =
      "Domain, DNS, email and hosting reinforce each other with one partner instead of separate vendors.";
    about.readySubtitle =
      "Search a domain, choose a hosting plan or contact us — we’re happy to help pick the right setup.";
  }
  out.about = about;

  return replaceTripleZeroDeep(out, { locale }) as T;
}

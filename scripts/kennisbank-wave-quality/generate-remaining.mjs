import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const cat = JSON.parse(fs.readFileSync(path.join(ROOT, "prisma/kennisbank/catalog.json"), "utf8"));

// Load existing "quality" topic keys (non-weak packs including DA)
const weakFiles = new Set([
  "thicken-bodies.ts",
  "wave2-thicken-bodies.ts",
  "wave2-rewrite-bodies.ts",
  "ecommerce-bodies.ts",
  "privacy-compliance-bodies.ts",
  "gap-bodies.ts",
]);
const qualityKeys = new Set();
const allKeys = new Set();
for (const f of fs.readdirSync(path.join(ROOT, "prisma/kennisbank"))) {
  if (!f.endsWith("-bodies.ts") && f !== "build-body.ts" && f !== "gap-bodies.ts") continue;
  const s = fs.readFileSync(path.join(ROOT, "prisma/kennisbank", f), "utf8");
  for (const m of s.matchAll(/^\s+"([^"]+)":\s*/gm)) {
    allKeys.add(m[1]);
    if (!weakFiles.has(f)) qualityKeys.add(m[1]);
  }
}
const da = fs.readFileSync(path.join(ROOT, "prisma/kennisbank/directadmin-bodies.ts"), "utf8");
const exBlock = da.slice(da.indexOf("directadminExcerptsNl"), da.indexOf("directadminTopicBuilders"));
for (const m of exBlock.matchAll(/^\s+"([^"]+)":/gm)) qualityKeys.add(m[1]);

/** Articles that need a quality rewrite */
const need = [];
for (const a of cat.articles) {
  const isDa = a.categories?.includes("directadmin") && qualityKeys.has(a.topic);
  if (isDa) continue;
  if (qualityKeys.has(a.topic)) continue;
  need.push(a);
}

// Count topic usage among ALL articles to detect collisions
const topicUsers = new Map();
for (const a of cat.articles) {
  if (!topicUsers.has(a.topic)) topicUsers.set(a.topic, []);
  topicUsers.get(a.topic).push(a.slug);
}

function uniqueTopic(slug) {
  const base = `qr-${slug}`.slice(0, 72);
  return base;
}

/** Category playbooks: menu labels + prep + keyword hooks */
const playbooks = {
  "e-mail": {
    panel: "webmail, DirectAdmin/CyberPanel/Plesk e-mail of Microsoft 365",
    prep: ["Mailboxadres en wachtwoord", "Toegang tot DNS of control panel indien nodig", "Apparaat of client die je wilt instellen"],
    menus: ["E-mail Accounts", "Webmail (Roundcube)", "DNS/MX/SPF/DKIM", "Spamfilter"],
  },
  domeinnamen: {
    panel: "klantenpanel (domeinbeheer) of DNS-zone",
    prep: ["Domeinnaam", "Toegang tot registrar/DNS", "Doel (website, mail, doorverwijzing)"],
    menus: ["Domeinbeheer", "DNS-zone", "Nameservers", "WHOIS/Contact"],
  },
  hosting: {
    panel: "DirectAdmin, CyberPanel of Plesk via TripleZero iT",
    prep: ["Hostinglogin", "Domein", "Recente backup bij risicovolle stappen"],
    menus: ["File Manager", "FTP", "PHP-versie", "SSL", "Backups"],
  },
  "e-commerce-webshops": {
    panel: "WooCommerce / WordPress admin + hostingpanel",
    prep: ["wp-admin toegang", "Staging indien mogelijk", "Backup vóór checkout/betaalwijzigingen"],
    menus: ["WooCommerce → Instellingen", "Producten", "Betalingen", "Verzending"],
  },
  "privacy-juridisch-compliance": {
    panel: "website + documentatie (educatief, geen juridisch advies)",
    prep: ["Overzicht van formulieren/tools die persoonsgegevens verwerken", "Huidige privacy-/cookieteksten"],
    menus: ["Privacyverklaring", "Cookiekeuze", "Formulieren", "Hostingregio"],
  },
  vps: {
    panel: "klantenpanel (VPS) + SSH/RDP/console",
    prep: ["VPS-IP en credentials", "Snapshot/backup", "Onderhoudsvenster"],
    menus: ["Start/Stop", "Console", "Firewall", "Snapshots"],
  },
  beveiliging: {
    panel: "hostingpanel + WordPress/security-plugins waar relevant",
    prep: ["Admin-toegang", "Backup", "Overzicht open poorten/plugins"],
    menus: ["SSL", "Firewall/WAF", "2FA", "Malware-scan"],
  },
  wordpress: {
    panel: "WordPress admin + Installatron/hostingpanel",
    prep: ["wp-admin", "Backup", "FTP/File Manager voor noodgevallen"],
    menus: ["Dashboard → Updates", "Plugins", "Media", "Instellingen"],
  },
  "crm-klantenpanel": {
    panel: "TripleZero iT klantenpanel",
    prep: ["Login of resetlink", "Klantnummer/domein bij tickets"],
    menus: ["Dashboard", "Facturen", "Tickets", "Account/2FA"],
  },
  "veilig-online": {
    panel: "je apparaten, accounts en browser (educatief)",
    prep: ["Apparaten die je gebruikt", "Wachtwoordmanager indien beschikbaar"],
    menus: ["Accountbeveiliging", "Updates", "Netwerkinstellingen"],
  },
  microsoft: {
    panel: "Microsoft 365 admin center / Outlook / TripleZero klantenpanel",
    prep: ["Tenant- of mailboxlogin", "DNS-toegang voor domein", "Licentieoverzicht"],
    menus: ["Exchange admin", "Users", "DNS (MX/TXT)", "Outlook"],
  },
  plesk: {
    panel: "Plesk (poort 8443)",
    prep: ["Plesk-URL en login", "Juiste subscription", "Backup"],
    menus: ["Websites & Domains", "Mail", "Databases", "SSL/TLS", "WordPress Toolkit"],
  },
  support: {
    panel: "klantenpanel tickets / live chat / belafspraak",
    prep: ["Domein of VPS-hostname", "Fouttekst/tijdstip", "Wat je al probeerde"],
    menus: ["Tickets", "Productoverzicht", "Remote support-tools"],
  },
  bloggen: {
    panel: "WordPress of blogplatform + hosting",
    prep: ["Sitelogin", "Backup vóór migratie/update"],
    menus: ["Berichten", "Thema", "Plugins", "Hosting File Manager"],
  },
  "cdn-performance-cloudflare": {
    panel: "CDN/Cloudflare + origin hosting",
    prep: ["CDN-login", "Origin-IP/host", "Cache-strategie"],
    menus: ["DNS", "Caching", "SSL/TLS", "Speed"],
  },
  "ssl-certificaten": {
    panel: "hostingpanel SSL of TripleZero SSL-product",
    prep: ["Domein met correcte DNS", "Validatiemethode"],
    menus: ["SSL Certificates", "Force HTTPS", "CSR/Validatie"],
  },
  "ai-scan": {
    panel: "TripleZero iT AI-scan in het dashboard",
    prep: ["Ingelogd klantenpanel", "URL om te scannen"],
    menus: ["AI-scan starten", "Scores", "Historie", "Aanbevelingen"],
  },
  "shop-en-pakketten": {
    panel: "TripleZero iT shop / klantenpanel producten",
    prep: ["Account", "Huidig pakket"],
    menus: ["Shop", "Productdetails", "Upgrade/downgrade"],
  },
  "ai-agents": {
    panel: "TripleZero iT AI-agents in het dashboard",
    prep: ["Actief pakket met agent-slots", "Ingelogd dashboard"],
    menus: ["Agents", "Start/Pauze", "Output/logs"],
  },
  "aeo-geo-seo": {
    panel: "website CMS + Search Console / AI-scan",
    prep: ["CMS-toegang", "Doelzoekwoorden/locatie"],
    menus: ["Content", "Structured data", "Lokale landingspagina’s"],
  },
};

function pickPlaybook(cats) {
  for (const c of cats) if (playbooks[c]) return { key: c, ...playbooks[c] };
  return {
    key: cats[0] || "algemeen",
    panel: "TripleZero iT klantenpanel en bijbehorende diensten",
    prep: ["Toegang tot de relevante omgeving", "Domein of productnaam", "Backup bij risicovolle stappen"],
    menus: ["Dashboard", "Productinstellingen", "Support/tickets"],
  };
}

function keywords(title, slug) {
  return `${title} ${slug}`.toLowerCase();
}

function specializedSteps(title, slug, pb) {
  const k = keywords(title, slug);
  const steps = [];
  // Email clients
  if (/outlook|iphone|android|mac|thunderbird|mailclient/.test(k)) {
    steps.push(
      "Open de mailapp en kies account toevoegen (IMAP).",
      "Host: gebruik de mailserver uit je welkomstmail of panel (vaak mail.jouwdomein.nl of serverhostname).",
      "Gebruikersnaam = volledig e-mailadres; wachtwoord = mailboxwachtwoord.",
      "IMAP poort 993 SSL; SMTP poort 465 of 587 met authenticatie.",
      "Test ontvangen én verzenden.",
    );
  } else if (/spf|dkim|dmarc|mx|dns|nameserver|whois|sidn|tld|transfer|auth.?code|quarantaine|lock/.test(k)) {
    steps.push(
      `Open DNS- of domeinbeheer in het ${pb.panel}.`,
      "Noteer de huidige records (screenshot of export) vóór je wijzigt.",
      `Voer de wijziging uit die past bij “${title}” — één record of instelling tegelijk.`,
      "Zet TTL desgewenst tijdelijk lager, sla op, wacht op propagatie.",
      "Controleer met dig/nslookup of een online DNS-checker vanaf een extern netwerk.",
    );
  } else if (/ssl|https|lets.?encrypt|certificaat|hsts|sha2/.test(k)) {
    steps.push(
      "Controleer dat DNS naar de juiste server wijst.",
      "Open SSL/TLS in je control panel of SSL-product.",
      "Vraag of activeer het certificaat (Let’s Encrypt of besteld cert).",
      "Schakel Force HTTPS / redirect in wanneer het cert geldig is.",
      "Test https:// in een privévenster en check de keten/vervaldatum.",
    );
  } else if (/wordpress|woocommerce|plugin|thema|wp-/.test(k) || pb.key === "wordpress" || pb.key === "e-commerce-webshops" || pb.key === "bloggen") {
    steps.push(
      "Maak een backup (Installatron/hosting/JetBackup) of werk op staging.",
      "Log in op wp-admin en open het relevante menu (Plugins, WooCommerce, Media, Updates).",
      `Pas de instelling of content aan die hoort bij “${title}”.`,
      "Sla op en purge caches (plugin, CDN, servercache).",
      "Test de kritieke flow (home, formulier, checkout) op desktop en mobiel.",
    );
  } else if (/vps|ssh|rdp|firewall|snapshot|windows|linux|cve|mssql|iis|application.?pool/.test(k) || pb.key === "vps") {
    steps.push(
      "Open het VPS-product in het klantenpanel; noteer IP en status.",
      "Maak een snapshot/backup indien beschikbaar.",
      "Gebruik console/SSH/RDP voor de wijziging die dit onderwerp vraagt.",
      "Pas firewall/poorten spaarzaam aan en documenteer wat je opent.",
      "Verifieer dienstbereikbaarheid vanaf een tweede netwerk.",
    );
  } else if (/plesk/.test(k) || pb.key === "plesk") {
    steps.push(
      "Log in op Plesk (poort 8443) en selecteer de juiste subscription.",
      `Open het menu dat past bij “${title}” (Websites & Domains, Mail, Databases, SSL/TLS, WordPress Toolkit).`,
      "Voer de wijziging uit en bevestig.",
      "Test de site of mailbox buiten Plesk.",
    );
  } else if (/ticket|support|teamviewer|belafspraak|remote/.test(k) || pb.key === "support") {
    steps.push(
      "Log in op het TripleZero iT klantenpanel.",
      "Open Tickets (of start een belafspraak als dat het onderwerp is).",
      "Vermeld domein/VPS, tijdstip, fouttekst en stappen die je al deed.",
      "Voeg screenshots toe indien nuttig.",
      "Reageer op follow-upvragen in hetzelfde ticket.",
    );
  } else if (/factuur|betaal|2fa|klantenpanel|login|wachtwoord/.test(k) && pb.key === "crm-klantenpanel") {
    steps.push(
      "Ga naar het TripleZero iT klantenpanel-login.",
      "Gebruik wachtwoord reset of 2FA-setup onder Account indien van toepassing.",
      `Open het onderdeel voor “${title}” (facturen, betaalmethode, gebruikers, tickets).`,
      "Sla wijzigingen op en controleer bevestigingsmail of status.",
    );
  } else if (/phishing|wifi|virus|wachtwoord|social.?engineering|veilig/.test(k) || pb.key === "veilig-online") {
    steps.push(
      "Inventariseer welke accounts/apparaten geraakt zijn.",
      "Werk OS/browser/apps bij.",
      "Zet unieke wachtwoorden + 2FA aan via een wachtwoordmanager.",
      `Pas de concrete maatregel toe die hoort bij “${title}”.`,
      "Controleer of verdachte sessies/apparaten zijn afgemeld.",
    );
  } else if (/microsoft|exchange|onedrive|teams|m365|outlook/.test(k) || pb.key === "microsoft") {
    steps.push(
      "Log in op het Microsoft 365-beheercentrum of Outlook zoals het onderwerp vraagt.",
      "Controleer licenties en gebruikersstatus.",
      "Voor mail/domein: verifieer MX/SPF/DKIM in DNS.",
      `Voer de configuratie uit voor “${title}”.`,
      "Test met een proefmailbox of client.",
    );
  } else if (/cloudflare|cdn|cache|redis|brotli|http\/?3|litespeed/.test(k) || pb.key === "cdn-performance-cloudflare") {
    steps.push(
      "Open CDN/Cloudflare én je origin-hosting.",
      "Zet een onderhouds-/testpad klaar en noteer huidige cache-TTL.",
      `Pas de performance-instelling toe voor “${title}”.`,
      "Purge relevante cache en test TTFB/LCP op een kritieke URL.",
      "Rollback cache-regels als de site stale content toont.",
    );
  } else if (/ai-?scan|score|aeo|geo|seo/.test(k) && (pb.key === "ai-scan" || pb.key === "aeo-geo-seo")) {
    steps.push(
      "Log in op het TripleZero iT dashboard.",
      "Open AI-scan of het SEO/AEO-onderdeel.",
      `Voer de actie uit voor “${title}” (nieuwe scan, historie, contentaanpassing).`,
      "Noteer scores en prioriteer 1–3 verbeteringen.",
      "Herhaal de meting na wijzigingen.",
    );
  } else if (/agent/.test(k) || pb.key === "ai-agents") {
    steps.push(
      "Open AI-agents in het dashboard.",
      "Controleer slot/status (running/paused).",
      `Pas de agentinstelling of workflow toe die hoort bij “${title}”.`,
      "Bekijk output/logs op fouten.",
      "Pauzeer de agent als output onbruikbaar is en open desnoods een ticket.",
    );
  } else if (/avg|privacy|cookie|dpi|verwerk|bewaar|consent/.test(k) || pb.key === "privacy-juridisch-compliance") {
    steps.push(
      "Inventariseer welke persoonsgegevens je verzamelt (forms, analytics, shop).",
      `Werk beleid/teksten/processen bij in lijn met “${title}” (educatief kader).`,
      "Beperk velden en bewaartermijnen waar mogelijk (dataminimalisatie).",
      "Documenteer tools/verwerkers en waar data staat (EU/buiten EER).",
      "Laat juridisch na waar nodig — dit is geen maatwerkadvies.",
    );
  } else if (/shop|pakket|business|growth|affiliate|downgrade|upgrade|fair.?use/.test(k) || pb.key === "shop-en-pakketten") {
    steps.push(
      "Open de shop of je product in het klantenpanel.",
      "Vergelijk limieten (sites, support, features) met je behoefte.",
      `Voer de keuze of wijziging uit voor “${title}”.`,
      "Controleer factuur/bevestiging en actieve diensten.",
    );
  } else {
    steps.push(
      `Log in op ${pb.panel}.`,
      `Open het relevante menu (bijv. ${pb.menus.slice(0, 3).join(", ")}).`,
      `Voer gericht de configuratie uit voor “${title}” — wijzig niet meerdere kritieke opties tegelijk.`,
      "Sla op en test het resultaat buiten het panel (browser, mailclient of DNS-check).",
      "Documenteer wat je wijzigde (datum, oude vs. nieuwe waarde).",
    );
  }
  return steps;
}

function specializedChecks(title, slug) {
  const k = keywords(title, slug);
  if (/mail|outlook|imap|smtp|spf|dkim/.test(k)) {
    return ["Testmail komt aan en wordt verzonden", "Headers tonen verwachte auth-resultaten waar relevant", "Geen onbedoelde forward-loops"];
  }
  if (/ssl|https/.test(k)) {
    return ["Hangslot zonder fout", "HTTP redirected naar HTTPS indien bedoeld", "Certificaat dekt www én apex indien nodig"];
  }
  if (/wordpress|woocommerce|checkout/.test(k)) {
    return ["Pagina laadt zonder critical error", "Formulier/checkout-test geslaagd", "Caches tonen verse content"];
  }
  if (/vps|ssh|rdp/.test(k)) {
    return ["Dienst bereikbaar op verwachte poort", "Firewallregel klopt", "Snapshot beschikbaar als rollback"];
  }
  return ["Verwachte UI-status zichtbaar", "Gedrag geverifieerd vanaf tweede netwerk/apparaat", "Geen regressie op gerelateerde diensten"];
}

function specializedWarn(title, slug, pb) {
  const k = keywords(title, slug);
  if (/dns|nameserver|transfer/.test(k)) return "DNS-wijzigingen kunnen e-mail en website tijdelijk raken — plan propagatie.";
  if (/ssl/.test(k)) return "Forceer HTTPS pas ná geldig certificaat, anders ontstaat een onbereikbare site.";
  if (/wachtwoord|password|2fa/.test(k)) return "Deel geheimen nooit buiten het ticketsysteem; gebruik een wachtwoordmanager.";
  if (/vps|firewall|rdp/.test(k)) return "Open poorten zo smal mogelijk; brute-force op RDP/SSH is dagelijkse realiteit.";
  if (pb.key === "privacy-juridisch-compliance") return "Educatief kader — geen juridisch advies op maat. Schakel een jurist in bij twijfel.";
  if (/woocommerce|betaling|checkout/.test(k)) return "Wijzig betaal- of btw-instellingen niet zonder rollback en testorder.";
  return "Maak bij twijfel eerst een backup en wijzig productie niet tijdens piekuren.";
}

function specializedTip(title, slug) {
  const k = keywords(title, slug);
  if (/mail/.test(k)) return "Werkt webmail wél en je app niet, dan ligt de oorzaak in de clientinstellingen.";
  if (/wordpress|plugin/.test(k)) return "Schakel bij debuggen tijdelijk caching uit en noteer pluginversies.";
  if (/dns/.test(k)) return "Vergelijk dig vanaf 4G met je kantoornetwerk om lokale cache uit te sluiten.";
  return "Vermeld in tickets altijd product, domein/IP, tijdstip en letterlijke fouttekst.";
}

function excerptFor(title, pb) {
  const short = title.replace(/\?$/, "").trim();
  const focus = pb.menus[0] || "je TripleZero iT-omgeving";
  return `${short}: concrete stappen in ${focus}, met controlepunten en wanneer je TripleZero iT support inschakelt.`;
}

function escapeTs(s) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

const articles = {}; // topic -> {excerpt, title, slug, cat}
const catalogRemap = []; // {slug, from, to}

for (const a of need) {
  const users = topicUsers.get(a.topic) || [a.slug];
  let topic = a.topic;
  // Remap if shared OR if topic is gap-* (family filler)
  if (users.length > 1 || String(a.topic).startsWith("gap-") || String(a.topic).startsWith("tz-th-") || String(a.topic).startsWith("tz-w2-th-") || String(a.topic).startsWith("tz-w2-rw-") || String(a.topic).startsWith("tz-ec-") || String(a.topic).startsWith("tz-w2-priv-")) {
    // For unique tz-ec etc that aren't shared, still rewrite under SAME topic key to override weak builder
    if (users.length > 1 || String(a.topic).startsWith("gap-")) {
      topic = uniqueTopic(a.slug);
      if (topic !== a.topic) catalogRemap.push({ slug: a.slug, from: a.topic, to: topic });
    }
  }
  // Avoid colliding qr topics
  if (articles[topic] && articles[topic].slug !== a.slug) {
    topic = uniqueTopic(a.slug + "-" + a.categories[0]);
    catalogRemap.push({ slug: a.slug, from: a.topic, to: topic });
  }
  const pb = pickPlaybook(a.categories || []);
  articles[topic] = {
    excerpt: excerptFor(a.title, pb),
    title: a.title,
    slug: a.slug,
    cat: a.categories?.[0],
    pb,
  };
}

console.log("need", need.length, "builders", Object.keys(articles).length, "remaps", catalogRemap.length);

// Apply remaps to catalog
const remapBySlug = new Map(catalogRemap.map((r) => [r.slug, r.to]));
let changed = 0;
for (const a of cat.articles) {
  if (remapBySlug.has(a.slug)) {
    a.topic = remapBySlug.get(a.slug);
    changed++;
  }
}
fs.writeFileSync(path.join(ROOT, "prisma/kennisbank/catalog.json"), JSON.stringify(cat, null, 2) + "\n");
console.log("catalog topics updated", changed);

// Emit TypeScript
let out = `/**
 * Quality NL bodies for kennisbank articles outside the DirectAdmin wave.
 * Overrides weak gap/thicken/ecommerce/privacy templates with topic-specific how-tos.
 */
const BRAND = "TripleZero iT";

function p(...paras: string[]) {
  return paras.map((t) => \`<p>\${t}</p>\`).join("\\n");
}
function h2(t: string) {
  return \`<h2>\${t}</h2>\`;
}
function ol(items: string[]) {
  return \`<ol>\\n\${items.map((i) => \`  <li>\${i}</li>\`).join("\\n")}\\n</ol>\`;
}
function ul(items: string[]) {
  return \`<ul>\\n\${items.map((i) => \`  <li>\${i}</li>\`).join("\\n")}\\n</ul>\`;
}
function tip(t: string) {
  return \`<aside class="kb-callout kb-callout-tip"><p><strong>Tip:</strong> \${t}</p></aside>\`;
}
function warn(t: string) {
  return \`<aside class="kb-callout kb-callout-warn"><p><strong>Let op:</strong> \${t}</p></aside>\`;
}
function outro(related?: string) {
  return p(
    \`Kom je er na deze stappen niet uit? Open een ticket bij \${BRAND} via het klantenpanel. Vermeld product, domein of hostname, tijdstip en wat je al probeerde.\`,
    related
      ? \`Gerelateerd: \${related}.\`
      : \`Bekijk ook andere artikelen in deze kennisbank voor DNS, e-mail, hosting en beveiliging.\`,
  );
}

type Ctx = { title: string; topic: string };

export const qualityRemainingExcerptsNl: Record<string, string> = {
`;

for (const [topic, meta] of Object.entries(articles)) {
  out += `  ${JSON.stringify(topic)}: ${JSON.stringify(meta.excerpt)},\n`;
}
out += `};

export const qualityRemainingTopicBuilders: Record<string, (ctx: Ctx) => string> = {\n`;

for (const [topic, meta] of Object.entries(articles)) {
  const pb = meta.pb;
  const steps = specializedSteps(meta.title, meta.slug, pb);
  const checks = specializedChecks(meta.title, meta.slug, pb);
  const w = specializedWarn(meta.title, meta.slug, pb);
  const t = specializedTip(meta.title, meta.slug, pb);
  const intro1 = `In deze handleiding van \${BRAND} leggen we uit: <strong>${escapeTs(meta.title)}</strong>. Je werkt in ${escapeTs(pb.panel)}.`;
  const intro2 = `Doel: een werkbare, controleerbare aanpak met duidelijke menu’s en verificatie.`;
  out += `  ${JSON.stringify(topic)}: () => [
    p(\`${intro1}\`, \`${intro2}\`),
    h2("Voorbereiding"),
    ul(${JSON.stringify(pb.prep)}),
    h2("Stappen"),
    ol(${JSON.stringify(steps)}),
    h2("Controleren"),
    ul(${JSON.stringify(checks)}),
    tip(\`${escapeTs(t)}\`),
    warn(\`${escapeTs(w)}\`),
    outro(${JSON.stringify(pb.menus.slice(0, 3).join("; "))}),
  ].join("\\n"),\n\n`;
}
out += `};\n`;

const outPath = path.join(ROOT, "prisma/kennisbank/quality-remaining-bodies.ts");
fs.writeFileSync(outPath, out);
console.log("wrote", outPath, "bytes", out.length);

const slugs = need.map((a) => ({
  slug: a.slug,
  title: a.title,
  topic: remapBySlug.get(a.slug) || a.topic,
  categories: a.categories,
}));
fs.writeFileSync(
  path.join(ROOT, "scripts/kennisbank-wave-quality/remaining-articles.json"),
  JSON.stringify(slugs, null, 2) + "\n",
);
console.log("slugs file", slugs.length);

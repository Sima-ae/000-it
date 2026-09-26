/**
 * Quality rewrite for remaining Wave-2 filler bodies:
 * tz-w2-infra / tz-w2-ts / tz-w2-vgl (infrastructuur, troubleshooting, vergelijkingen).
 * Also emits unique NL excerpts for every catalog topic still on the generic excerpt.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const cat = JSON.parse(
  fs.readFileSync(path.join(ROOT, "prisma/kennisbank/catalog.json"), "utf8"),
);

/** Detect which articles still build filler HTML by importing build logic via dynamic check later —
 *  here we target known weak topic prefixes that live in infra/troubleshooting/vergelijkingen packs. */
const WEAK_PREFIXES = ["tz-w2-infra-", "tz-w2-ts-", "tz-w2-vgl-"];

const need = cat.articles.filter((a) =>
  WEAK_PREFIXES.some((p) => String(a.topic).startsWith(p)),
);

console.log("weak-prefix articles", need.length);

const playbooks = {
  "infrastructuur-servers": {
    panel: "klantenpanel (VPS/dedicated) + console/IPMI + SSH waar van toepassing",
    prep: [
      "Productnaam en hostname/IP",
      "Snapshot of offsite-backup vóór risicovolle stappen",
      "Onderhoudsvenster en rollbackplan",
    ],
    menus: ["VPS/Server", "Console/IPMI", "Snapshots", "Firewall", "Netwerk"],
  },
  "foutmeldingen-troubleshooting": {
    panel: "hostingpanel, VPS-console of WordPress/logs — afhankelijk van de fout",
    prep: [
      "Letterlijke fouttekst / HTTP-status / tijdstip (timezone)",
      "Recente wijzigingen (DNS, plugin, deploy, firewall)",
      "Backup of staging indien beschikbaar",
    ],
    menus: ["Error-logs", "DNS/SSL", "File Manager", "Firewall", "Tickets"],
  },
  "vergelijkingen-keuzehulp": {
    panel: "TripleZero iT shop / klantenpanel + huidige eisenlijst",
    prep: [
      "Budget en groeiverwachting",
      "Technische eisen (PHP, e-mail, compliance, teamvaardigheden)",
      "Migratiebereidheid en downtime-tolerantie",
    ],
    menus: ["Shop/pakketten", "Feature-matrix", "Migratie/support"],
  },
};

function pickPlaybook(cats) {
  for (const c of cats || []) {
    if (playbooks[c]) return { key: c, ...playbooks[c] };
  }
  return {
    key: "algemeen",
    panel: "TripleZero iT klantenpanel en bijbehorende diensten",
    prep: ["Toegang tot de relevante omgeving", "Domein of hostname", "Backup bij risicovolle stappen"],
    menus: ["Dashboard", "Productinstellingen", "Support/tickets"],
  };
}

function kw(title, slug) {
  return `${title} ${slug}`.toLowerCase();
}

function infraSteps(title, slug) {
  const k = kw(title, slug);
  if (/dedicated|shared|vps|burstable|colocation|resources/.test(k)) {
    return [
      "Inventariseer workload: CPU/RAM-pieken, disk I/O, root-toegang en compliance.",
      "Vergelijk shared hosting, VPS en dedicated op isolatie, schaalbaarheid en beheerlast.",
      `Kies de variant die past bij “${title}” — documenteer waarom (niet alleen prijs).`,
      "Controleer in het klantenpanel of resources, snapshots en supportniveau matchen.",
      "Plan migratie of resize met DNS TTL-verlaging en een rollbackmoment.",
    ];
  }
  if (/ipmi|ilo|idrac|bmc|kvm|remote.?console|out.?of.?band|virtual.?media|iso/.test(k)) {
    return [
      "Open out-of-band/console alleen via VPN of een beperkt beheernetwerk.",
      "Wijzig standaard BMC-wachtwoorden; schakel onnodige interfaces uit.",
      `Voer de console- of virtual-media-actie uit voor “${title}”.`,
      "Verifieer dat OS-netwerk weer bereikbaar is na de sessie.",
      "Documenteer BMC-IP, credentials-beheerder en isolatieregels.",
    ];
  }
  if (/raid|smart|firmware|nvme|sata|dwpd|bonding|nic|monitoring/.test(k)) {
    return [
      "Lees huidige hardwarestatus (SMART, RAID-controller, NIC-bonding) vóór wijzigingen.",
      "Plan firmware/driver-updates buiten piekuren met rollbackmedia klaar.",
      `Pas de configuratie toe die hoort bij “${title}”.`,
      "Controleer alerts/monitoring na de wijziging (disk, temp, link-status).",
      "Noteer serienummers/firmwareversies voor supporttickets.",
    ];
  }
  if (/rescue|fsck|grub|fstab|rootwachtwoord|lock.?out|kernel|snapshot|backup|disaster|rto|rpo|3-2-1/.test(k)) {
    return [
      "Activeer rescue/console alleen als de machine niet normaal bereikbaar is; maak eerst een snapshot indien mogelijk.",
      "Monteer schijven read-only tenzij je bewust schrijft (fsck, fstab, keys).",
      `Voer de herstelstap uit voor “${title}” — één wijziging, daarna reboot-test.`,
      "Valideer boot, netwerk en kritieke diensten (web, SSH, database).",
      "Schrijf een korte post-mortem: oorzaak, fix, preventie.",
    ];
  }
  return [
    "Open het serverproduct in het TripleZero iT klantenpanel en noteer status/IP.",
    "Maak een snapshot of bevestig een recente backup.",
    `Voer gericht de infrastructuurstap uit voor “${title}”.`,
    "Verifieer bereikbaarheid vanaf een tweede netwerk en check logs.",
    "Documenteer wijziging, tijdstip en rollbackpad.",
  ];
}

function tsSteps(title, slug) {
  const k = kw(title, slug);
  if (/401|403|404|500|502|503|504|http/.test(k)) {
    return [
      "Reproduceer de statuscode in een privévenster; noteer URL, methode en tijdstip.",
      "Check DNS/SSL, daarna webserver/proxy-logs rond dat tijdstip.",
      "Controleer permissies, .htaccess/nginx-regels, WAF/firewall en applicatiecache.",
      `Pas de gerichte fix toe voor “${title}” (auth, pad, upstream of resource).`,
      "Herlaad zonder cache en bevestig dat gerelateerde URL’s niet regresseren.",
    ];
  }
  if (/ssl|cert|mixed.?content|tls|https/.test(k)) {
    return [
      "Controleer certificaatketen en vervaldatum (extern + op de server).",
      "Vergelijk of apex/www en aliases gedekt zijn.",
      `Los “${title}” op via panel-SSL of correcte redirects — Force HTTPS pas ná geldig cert.`,
      "Purge CDN/proxy-cache en test mixed content in DevTools.",
    ];
  }
  if (/dns|mx|spf|propag|timeout|connect/.test(k)) {
    return [
      "Vergelijk dig/nslookup vanaf kantoor én 4G/externe resolver.",
      "Noteer TTL en recente zonewijzigingen.",
      `Corrigeer het record of de service-instelling voor “${title}”.`,
      "Wacht propagatie af of verlaag TTL voor de volgende wijziging.",
    ];
  }
  if (/mail|smtp|imap|spam|bounce/.test(k)) {
    return [
      "Test webmail versus client om te splitsen (server vs. client).",
      "Controleer MX/SPF/DKIM/DMARC en mailboxquota.",
      `Pas de mailfix toe voor “${title}”.`,
      "Verstuur/ontvang een proefmail en bewaar headers bij twijfel.",
    ];
  }
  if (/wordpress|plugin|wsod|critical.?error|database/.test(k)) {
    return [
      "Zet een backup klaar; schakel caching tijdelijk uit.",
      "Activeer debug/log of rename verdachte plugins via File Manager/SSH.",
      `Herstel de fout die past bij “${title}”.`,
      "Test wp-admin + frontend; purge caches.",
    ];
  }
  return [
    "Reproduceer het probleem en noteer exacte fouttekst/tijdstip.",
    "Isoleer recente wijzigingen (deploy, DNS, panel, plugin).",
    `Pas de troubleshootingstap toe voor “${title}”.`,
    "Verifieer fix vanaf een tweede netwerk/apparaat.",
    "Documenteer root cause voor herhaling voorkomen.",
  ];
}

function vglSteps(title, slug) {
  const k = kw(title, slug);
  if (/woocommerce|shopify|prestashop|magento|wix|squarespace/.test(k)) {
    return [
      "Noteer eisen: catalogusgrootte, betalingen, btw, meertaligheid, teamkennis.",
      "Vergelijk total cost of ownership (licenties, hosting, plugins, agency).",
      `Beoordeel “${title}” op migratiepad, SEO-URL’s en checkout-controle.`,
      "Kies een pilot (staging) vóór productie-omzet.",
      "Plan DNS/mail/cutover met TripleZero iT support indien nodig.",
    ];
  }
  if (/wordpress|drupal|joomla|ghost|webflow/.test(k)) {
    return [
      "Inventariseer contenttype, redacteuren en integraties.",
      "Vergelijk hostingbehoefte, security-onderhoud en plugin-ecosysteem.",
      `Maak de keuze voor “${title}” expliciet: build vs. buy vs. managed.`,
      "Valideer met een content-pilot en performancebudget.",
    ];
  }
  if (/vps|dedicated|shared|cloud|hosting/.test(k)) {
    return [
      "Meet huidige resourcegebruik en piekpatronen.",
      "Vergelijk isolatie, root-toegang, SLA en backupopties.",
      `Selecteer het platform dat “${title}” het beste dekt zonder overkill.`,
      "Bereken migratie-inspanning en DNS-cutover.",
    ];
  }
  if (/plesk|cpanel|directadmin|cyberpanel/.test(k)) {
    return [
      "Lijst benodigde panel-features (mail, WP toolkit, reseller, API).",
      "Vergelijk beheerlast voor jouw team.",
      `Kies het panel-scenario voor “${title}” en test op staging/VPS indien mogelijk.`,
      "Documenteer login-URL’s, backups en 2FA-beleid.",
    ];
  }
  return [
    "Schrijf 5–7 must-have criteria (niet alleen features).",
    "Score de opties op kosten, risico, lock-in en support.",
    `Trek een conclusie voor “${title}” met expliciete trade-offs.`,
    "Valideer met een kleine proof-of-concept vóór full cutover.",
  ];
}

function stepsFor(a, pb) {
  if (pb.key === "infrastructuur-servers" || String(a.topic).startsWith("tz-w2-infra-")) {
    return infraSteps(a.title, a.slug);
  }
  if (pb.key === "foutmeldingen-troubleshooting" || String(a.topic).startsWith("tz-w2-ts-")) {
    return tsSteps(a.title, a.slug);
  }
  if (pb.key === "vergelijkingen-keuzehulp" || String(a.topic).startsWith("tz-w2-vgl-")) {
    return vglSteps(a.title, a.slug);
  }
  return infraSteps(a.title, a.slug);
}

function checksFor(a, pb) {
  if (pb.key === "vergelijkingen-keuzehulp") {
    return [
      "Criteria en keuze zijn schriftelijk vastgelegd",
      "Pilot/staging gepland of uitgevoerd",
      "Migratie- en DNS-risico’s benoemd",
    ];
  }
  if (pb.key === "foutmeldingen-troubleshooting") {
    return [
      "Fout is reproduceerbaar opgelost of duidelijk begrensd",
      "Logs tonen geen nieuwe errors rond de fix",
      "Gerelateerde flows (home, login, checkout, mail) getest",
    ];
  }
  return [
    "Snapshot/backup beschikbaar als rollback",
    "Dienst bereikbaar op verwachte poorten",
    "Monitoring/alerts gecontroleerd na wijziging",
  ];
}

function warnFor(a, pb) {
  if (pb.key === "foutmeldingen-troubleshooting") {
    return "Wijzig niet tegelijk DNS, firewall én applicatiecode — isoleer de oorzaak eerst.";
  }
  if (pb.key === "vergelijkingen-keuzehulp") {
    return "Keuzehulp is educatief: valideer altijd met jouw data, licenties en migratiepad.";
  }
  return "Out-of-band en rescue-acties kunnen disk/netwerk raken — werk spaarzaam en met snapshot.";
}

function tipFor(a, pb) {
  if (pb.key === "foutmeldingen-troubleshooting") {
    return "Plak in tickets de letterlijke fout, URL, tijdstip en wat je al uitsloot.";
  }
  if (pb.key === "vergelijkingen-keuzehulp") {
    return "Laat price-only beslissingen links liggen: TCO en beheerlast wegen zwaarder na 12 maanden.";
  }
  return "Noteer BMC/console- en OS-credentials gescheiden; deel ze nooit in open tickets.";
}

function excerptFor(title, pb) {
  const short = title.replace(/\?$/, "").trim();
  const focus = pb.menus[0] || "je TripleZero iT-omgeving";
  return `${short}: concrete stappen in ${focus}, met controlepunten en wanneer je TripleZero iT support inschakelt.`;
}

function escapeTs(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

const articles = {};
for (const a of need) {
  const pb = pickPlaybook(a.categories || []);
  articles[a.topic] = {
    title: a.title,
    slug: a.slug,
    pb,
    excerpt: excerptFor(a.title, pb),
    steps: stepsFor(a, pb),
    checks: checksFor(a, pb),
    warn: warnFor(a, pb),
    tip: tipFor(a, pb),
  };
}

console.log("builders", Object.keys(articles).length);

let out = `/**
 * Quality NL bodies for remaining Wave-2 filler topics (infra / troubleshooting / vergelijkingen).
 * Overrides weak howto templates that contained “Voer de stappen uit die bij …”.
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
      : \`Bekijk ook andere artikelen over infrastructuur, troubleshooting en hostingkeuzes.\`,
  );
}

type Ctx = { title: string; topic: string };

export const qualityW2ExcerptsNl: Record<string, string> = {
`;

for (const [topic, meta] of Object.entries(articles)) {
  out += `  ${JSON.stringify(topic)}: ${JSON.stringify(meta.excerpt)},\n`;
}
out += `};

export const qualityW2TopicBuilders: Record<string, (ctx: Ctx) => string> = {\n`;

for (const [topic, meta] of Object.entries(articles)) {
  const pb = meta.pb;
  const intro1 = `In deze handleiding van \${BRAND} leggen we uit: <strong>${escapeTs(meta.title)}</strong>. Je werkt in ${escapeTs(pb.panel)}.`;
  const intro2 = `We geven een concrete aanpak met voorbereiding, gerichte stappen en duidelijke controles.`;
  out += `  ${JSON.stringify(topic)}: () => [
    p(\`${intro1}\`, \`${intro2}\`),
    h2("Voorbereiding"),
    ul(${JSON.stringify(pb.prep)}),
    h2("Stappen"),
    ol(${JSON.stringify(meta.steps)}),
    h2("Controleren"),
    ul(${JSON.stringify(meta.checks)}),
    tip(\`${escapeTs(meta.tip)}\`),
    warn(\`${escapeTs(meta.warn)}\`),
    outro(${JSON.stringify(pb.menus.slice(0, 3).join("; "))}),
  ].join("\\n"),\n\n`;
}
out += `};\n`;

const outPath = path.join(ROOT, "prisma/kennisbank/quality-w2-bodies.ts");
fs.writeFileSync(outPath, out);
console.log("wrote", outPath, "bytes", out.length);

fs.writeFileSync(
  path.join(ROOT, "scripts/kennisbank-wave-quality/w2-filler-articles.json"),
  JSON.stringify(
    need.map((a) => ({
      slug: a.slug,
      title: a.title,
      topic: a.topic,
      categories: a.categories,
    })),
    null,
    2,
  ) + "\n",
);

// Excerpts for ALL topics missing DA / QR / W2 custom excerpts — pack map
const existingExcerptTopics = new Set(Object.keys(articles));
// Pull QR + DA keys from files
for (const f of ["quality-remaining-bodies.ts", "directadmin-bodies.ts"]) {
  const s = fs.readFileSync(path.join(ROOT, "prisma/kennisbank", f), "utf8");
  const block =
    f === "directadmin-bodies.ts"
      ? s.slice(s.indexOf("directadminExcerptsNl"), s.indexOf("directadminTopicBuilders"))
      : s.slice(s.indexOf("qualityRemainingExcerptsNl"), s.indexOf("qualityRemainingTopicBuilders"));
  for (const m of block.matchAll(/^\s+"([^"]+)":/gm)) existingExcerptTopics.add(m[1]);
}

const packExcerpt = {};
const catFocus = {
  "e-mail": "E-mail Accounts",
  domeinnamen: "Domeinbeheer",
  hosting: "File Manager",
  wordpress: "wp-admin",
  vps: "VPS-console",
  beveiliging: "SSL/Firewall",
  plesk: "Plesk",
  microsoft: "Microsoft 365",
  "crm-klantenpanel": "Klantenpanel",
  support: "Tickets",
  bloggen: "Berichten",
  "cdn-performance-cloudflare": "CDN/Caching",
  "ssl-certificaten": "SSL",
  "ai-scan": "AI-scan",
  "ai-agents": "AI-agents",
  "aeo-geo-seo": "SEO/AEO",
  "shop-en-pakketten": "Shop",
  "e-commerce-webshops": "WooCommerce",
  "privacy-juridisch-compliance": "Privacy",
  "veilig-online": "Accountbeveiliging",
  "infrastructuur-servers": "VPS/Server",
  "foutmeldingen-troubleshooting": "Error-logs",
  "vergelijkingen-keuzehulp": "Keuzehulp",
  cyberpanel: "CyberPanel",
  directadmin: "DirectAdmin",
  "webdesign-development": "Development",
  "ai-integratie": "AI-integratie",
  "analytics-cro": "Analytics",
};

let missingEx = 0;
for (const a of cat.articles) {
  if (existingExcerptTopics.has(a.topic)) continue;
  if (packExcerpt[a.topic]) continue;
  const focus =
    (a.categories || []).map((c) => catFocus[c]).find(Boolean) || "je TripleZero iT-omgeving";
  const short = a.title.replace(/\?$/, "").trim();
  packExcerpt[a.topic] =
    `${short}: praktische handleiding in ${focus}, met stappen, controles en wanneer je TripleZero iT support inschakelt.`;
  missingEx++;
}

let exOut = `/**
 * Unique NL excerpts for kennisbank topics that previously fell back to the generic phrase.
 */
export const qualityPackExcerptsNl: Record<string, string> = {\n`;
for (const [topic, ex] of Object.entries(packExcerpt)) {
  exOut += `  ${JSON.stringify(topic)}: ${JSON.stringify(ex)},\n`;
}
exOut += `};\n`;
const exPath = path.join(ROOT, "prisma/kennisbank/quality-pack-excerpts.ts");
fs.writeFileSync(exPath, exOut);
console.log("wrote pack excerpts", missingEx, "→", exPath);

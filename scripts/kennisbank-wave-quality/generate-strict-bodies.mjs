/**
 * Strict kennisbank body generator.
 * - No title-plug lines ("Focus deze sessie…", "die hoort bij “Title”")
 * - Conceptual/compare articles: explain structure WITHOUT <h2>Stappen</h2>
 * - How-to articles: subject-specific steps (slug packs + keyword packs)
 * - Brand inlined as "TripleZero iT" (never ${BRAND} in plain strings)
 */
import fs from "node:fs";
import path from "node:path";
import { webdesignSlugPacks, BRAND_NAME } from "./topic-specific-packs.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const cat = JSON.parse(fs.readFileSync(path.join(ROOT, "prisma/kennisbank/catalog.json"), "utf8"));
const B = BRAND_NAME;
const SLUG = webdesignSlugPacks();

/** Topics owned by hand-crafted packs — skip unless they fail conceptual/howto rules later */
const keepTopicFiles = [
  "directadmin-bodies.ts",
  "cyberpanel-bodies.ts",
  "plesk-bodies.ts",
  "microsoft-bodies.ts",
  "veilig-online-bodies.ts",
  "bloggen-bodies.ts",
  "ai-scan-bodies.ts",
  "agent-bodies.ts",
  "aeo-geo-seo-bodies.ts",
];
const keepTopics = new Set();
for (const f of keepTopicFiles) {
  const s = fs.readFileSync(path.join(ROOT, "prisma/kennisbank", f), "utf8");
  for (const m of s.matchAll(/^\s+"([^"]+)":\s*(?:\(|async)/gm)) keepTopics.add(m[1]);
  for (const m of s.matchAll(/^\s+"([^"]+)":\s*\(\)\s*=>/gm)) keepTopics.add(m[1]);
}

function esc(s) {
  return String(s);
}

function kof(a) {
  return `${a.title} ${a.slug} ${(a.categories || []).join(" ")}`.toLowerCase();
}

function has(k, re) {
  return re.test(k);
}

function modeOf(a) {
  const t = a.title.toLowerCase();
  const cats = a.categories || [];
  if (cats.includes("vergelijkingen-keuzehulp") || /\bversus\b|\bvs\.?\b|vergelijk|keuzehulp|of .* kiezen/.test(t)) {
    return "compare";
  }
  // Pure explain: definition / why / when — not "X begrijpen" how-tos
  if (
    /^(wat is|wat zijn|waarom|wanneer)\b/.test(t) ||
    /\buitgelegd\b|\bbegrippen uitgelegd\b|\bcriteria voor\b/.test(t) ||
    /\bverschil tussen\b|\bverschillen tussen\b|^verschil\b/.test(t)
  ) {
    return "explain";
  }
  if (cats.includes("foutmeldingen-troubleshooting") || /\b(401|403|404|500|502|503|504)\b|foutmelding|oplossen|werkt niet/.test(t)) {
    return "troubleshoot";
  }
  return "howto";
}

function excerpt(title, kind) {
  const short = title.replace(/\?$/, "").trim();
  if (kind === "compare") {
    return `${short}: keuzehulp van ${B} met criteria, trade-offs en wanneer welke optie past.`;
  }
  if (kind === "explain") {
    return `${short}: duidelijke uitleg van ${B} — begrippen, wanneer het telt en valkuilen.`;
  }
  if (kind === "troubleshoot") {
    return `${short}: gerichte diagnose en fix-stappen van ${B}, met controles.`;
  }
  return `${short}: concrete handleiding van ${B} met voorbereiding, stappen en controles.`;
}

function packExplain(a) {
  const title = a.title;
  const k = kof(a);
  const points = explainPoints(a, k);
  return {
    mode: "explain",
    excerpt: excerpt(title, "explain"),
    intro: [
      `<strong>${esc(title)}</strong> — uitleg, geen generiek klikpad. We zetten het onderwerp in de praktijk van hosting, web en support bij ${B}.`,
      points.lead,
    ],
    sections: [
      { h: "Wat je moet weten", items: points.know },
      { h: "Wanneer dit telt", items: points.when },
      { h: "Veelgemaakte misverstanden", items: points.myths },
    ],
    tip: points.tip,
    warn: points.warn,
    related: points.related,
  };
}

function explainPoints(a, k) {
  const title = a.title;
  if (has(k, /wifi|openbaar|netwerk/)) {
    return {
      lead: "Openbare netwerken zijn handig, maar verkeer en captive portals zijn makkelijker te misbruiken dan thuis.",
      know: [
        "Aanvallers op hetzelfde netwerk kunnen onversleuteld verkeer afluisteren.",
        "Nep-hotspots imiteren hotel/café-namen.",
        "VPN versleutelt je tunnel; HTTPS beschermt per site — beide hebben een rol.",
      ],
      when: [
        "Bankieren of admin-panels op reis: bij voorkeur mobiele hotspot of VPN.",
        "Korte browse-sessies: blijf bij HTTPS-sites en vermijd software-updates via onbekende wifi.",
      ],
      myths: [
        "“Ik heb antivirus, dus wifi is veilig” — dekt netwerk-afluisteren niet.",
        "“VPN maakt alle sites vertrouwd” — phishing blijft phishing.",
      ],
      tip: "Zet automatische verbinding met bekende open netwerken uit op je laptop/telefoon.",
      warn: "Voer geen panelwachtwoorden in op open wifi zonder VPN.",
      related: "VPN; 2FA; phishing",
    };
  }
  if (has(k, /wordpress.?onderhoud|waarom.*onderhoud/)) {
    return {
      lead: "WordPress zonder onderhoud wordt een security- en performanceprobleem — niet omdat WP “slecht” is, maar omdat plugins/thema’s verouderen.",
      know: [
        "Core, plugins en thema’s krijgen security-patches.",
        "Verouderde PHP-versies blokkeren updates.",
        "Backups zonder restore-test geven schijnzekerheid.",
      ],
      when: [
        "Elke site met login, forms of webshop: maandelijks patchritme.",
        "Na een hack: onderhoud + hardening is onderdeel van herstel.",
      ],
      myths: [
        "“De site is klaar, dus klaar” — software is niet static.",
        "“Auto-update alles” zonder staging kan productie breken.",
      ],
      tip: "Koppel onderhoud aan een vast moment + staging waar mogelijk.",
      warn: "Updaten zonder backup is het grootste risico.",
      related: "Backups; staging; Wordfence",
    };
  }
  if (has(k, /roundcube|webmail/)) {
    return {
      lead: "Roundcube en Webmail Pro zijn beide browserclients op dezelfde mailbox — verschillen zitten in UI, features en filters, niet in je IMAP-data.",
      know: [
        "Je mail staat op de server; de webmail is een schil.",
        "Filters/handtekeningen kunnen per client anders werken.",
        "Problemen in één webmail betekenen niet per se serveruitval.",
      ],
      when: [
        "Kies de client die jouw filters/kalender het best ondersteunt.",
        "Voor troubleshooting: test altijd beide + een desktopclient.",
      ],
      myths: [
        "“Mail is weg in Roundcube” — vaak alleen een map/weergave-issue.",
      ],
      tip: "Noteer welke webmail je standaard gebruikt in supporttickets.",
      warn: "Verwijder geen mappen in de ene client zonder te checken wat de server toont.",
      related: "IMAP; webmail toegang; spamfilter",
    };
  }
  // generic explain using title nouns
  return {
    lead: `Dit artikel legt uit wat “${esc(title)}” inhoudt en hoe je het duidt in een ${B}-omgeving — zonder een nep-stappenplan.`,
    know: [
      `De kern van “${esc(title)}” is begrip vóór actie: verkeerde aannames leiden tot verkeerde fixes.`,
      "Noteer je huidige setup (product, domein, stack) zodat uitleg vertaalt naar jouw situatie.",
      "Onderscheid symptoom (wat je ziet) van oorzaak (config, DNS, code, policy).",
    ],
    when: [
      "Bij keuzes of architectuurvragen: eerst dit kader, daarna pas wijzigingen.",
      "Bij twijfel over impact op mail, SEO of checkout: check gerelateerde artikelen of open een ticket.",
    ],
    myths: [
      "Elke kennisbankpagina heeft een stappenlijst nodig — uitlegonderwerpen niet.",
      "Wat bij een concurrent werkt, past 1:1 op jouw DNS/panel/stack.",
    ],
    tip: `Vat in één zin samen wat “${esc(title)}” voor jouw project betekent vóór je iets wijzigt.`,
    warn: "Geen juridisch of compliance-advies op maat — schakel specialisten in waar nodig.",
    related: "Tickets; backups; monitoring",
  };
}

function packCompare(a) {
  const title = a.title;
  const sides = compareSides(a);
  return {
    mode: "compare",
    excerpt: excerpt(title, "compare"),
    intro: [
      `<strong>${esc(title)}</strong> — keuzehulp met criteria en trade-offs. Geen “winnaar voor iedereen”.`,
      sides.lead,
    ],
    sections: [
      { h: "Vergelijk op deze criteria", items: sides.criteria },
      { h: "Kies A als…", items: sides.chooseA },
      { h: "Kies B als…", items: sides.chooseB },
      { h: "Valkuilen", items: sides.pitfalls },
    ],
    tip: sides.tip,
    warn: sides.warn,
    related: sides.related,
  };
}

function compareSides(a) {
  const title = a.title;
  // Try to split versus
  const vs = title.split(/\bversus\b|\bvs\.?\b|\bof\b/i).map((s) => s.replace(/[:?-]/g, " ").trim()).filter(Boolean);
  const aName = vs[0] || "optie A";
  const bName = vs[1] || "optie B";
  return {
    lead: `We zetten ${esc(aName)} en ${esc(bName)} naast elkaar op TCO, beheerlast, lock-in en fit bij ${B}-hosting/trajecten.`,
    criteria: [
      "Totale kosten over 12–24 maanden (licenties, hosting, uren).",
      "Skills in je team (wie moet het beheren?).",
      "Migratiepad en downtime-risico.",
      "Security/compliance en supportniveau.",
      "Schaal: piekverkeer, integraties, meertaligheid.",
    ],
    chooseA: [
      `${esc(aName)} past als je eisen dicht bij die stack liggen en je team die al kent.`,
      "Kies A bij lagere lock-in of betere controle over data/code als dat je prioriteit is.",
    ],
    chooseB: [
      `${esc(bName)} past als time-to-value of managed features zwaarder wegen dan maximale controle.`,
      "Kies B als TCO inclusief beheer lager uitvalt ondanks hogere licentie.",
    ],
    pitfalls: [
      "Alleen feature-matrices vergelijken zonder beheerkosten.",
      "Big-bang migratie zonder URL-/data-mapping.",
      "Keuze op onderbuik tijdens een incident.",
    ],
    tip: "Schrijf 5 must-haves vóór je demo’s inplant — dat voorkomt tool-shopping.",
    warn: "Educatief kader: valideer met jouw cijfers, licenties en juridische eisen.",
    related: "Migratie; hostingkeuze; TCO",
  };
}

function packTroubleshoot(a) {
  const title = a.title;
  const k = kof(a);
  const code = (k.match(/\b(401|403|404|500|502|503|504)\b/) || [])[0];
  const steps = code
    ? [
        `Reproduceer HTTP ${code} in een privévenster; noteer URL, methode en tijdstip (timezone).`,
        "Check DNS/SSL en CDN/WAF-events rond dat tijdstip.",
        "Lees web/PHP/Node error-logs op de origin.",
        `Isoleer de ${code}-oorzaak (auth, permissies, upstream, pad, plugin) en pas één fix toe.`,
        "Herstest zonder cache; controleer sibling-URL’s.",
      ]
    : [
        "Schrijf symptoom + letterlijke fouttekst op.",
        "Bepaal sinds wanneer en welke changes (DNS, deploy, plugin, DNS TTL).",
        "Isoleer: ander netwerk, andere browser, staging vs productie.",
        `Pas één gerichte fix toe die logisch volgt uit “${esc(title)}”.`,
        "Valideer en documenteer root cause.",
      ];
  return {
    mode: "troubleshoot",
    excerpt: excerpt(title, "troubleshoot"),
    intro: [
      `<strong>${esc(title)}</strong> — troubleshooting: eerst reproduceren en isoleren, dan pas wijzigen.`,
      "Meerdere tegelijk wijzigingen maken de oorzaak onvindbaar.",
    ],
    prep: ["Letterlijke fout/HAR/tijdstip", "Recente changes", "Backup of staging indien beschikbaar"],
    why: [
      "Zonder reproductie fix je symptomen.",
      "Logs + timeline verkorten mean-time-to-fix.",
      "Regressies op sibling-flows zijn vaak erger dan de eerste fout.",
    ],
    steps,
    checks: ["Probleem weg of begrensd", "Geen nieuwe errors in logs", "Kritieke flows OK"],
    tip: "Plak fout + timestamp in je TripleZero iT-ticket.",
    warn: "Wijzig niet tegelijk DNS, firewall en applicatiecode.",
    related: "Logs; WAF; backups",
  };
}

function packHowtoFromSlugOrKeywords(a) {
  if (SLUG[a.slug]) {
    const s = SLUG[a.slug];
    return {
      mode: "howto",
      excerpt: excerpt(a.title, "howto"),
      intro: s.intro,
      prep: s.prep || ["Toegang tot code/panel", "Staging of backup", "Notitie van huidige waarden"],
      why: s.why,
      steps: s.steps,
      checks: s.checks,
      tip: s.tip,
      warn: s.warn,
      related: s.related,
    };
  }
  return packHowtoKeywords(a);
}

function packHowtoKeywords(a) {
  const title = a.title;
  const k = kof(a);
  const cats = a.categories || [];

  // Reuse rich next/html/cdn/email packs by importing logic inline via keyword branches
  if (cats.includes("nextjs-en-react") || has(k, /\bnext\.?js\b|\breact\b/)) {
    return nextHowto(a, k);
  }
  if (cats.includes("html-css-js")) {
    return htmlHowto(a, k);
  }
  if (cats.includes("landingspaginas")) {
    return landingHowto(a);
  }
  if (cats.includes("onderhoud-maatwerk") || cats.includes("php-maatwerk") || cats.includes("php-en-scripts")) {
    return maintainHowto(a);
  }
  if (has(k, /\bspf\b|\bdkim\b|\bdmarc\b|\bmx\b/) || cats.includes("domeinnamen") || cats.includes("e-mail")) {
    return mailDnsHowto(a, k);
  }
  if (cats.includes("cdn-performance-cloudflare") || has(k, /\bcloudflare\b|\bcdn\b/)) {
    return cdnHowto(a);
  }
  if (cats.includes("wordpress") || cats.includes("e-commerce-webshops") || cats.includes("wordpress-onderhoud") || has(k, /wordpress|woocommerce/)) {
    return wpHowto(a);
  }
  if (cats.includes("vps") || cats.includes("infrastructuur-servers") || has(k, /\bvps\b|\bdedicated\b|\brescue\b/)) {
    return vpsHowto(a);
  }
  if (cats.includes("plesk") || cats.includes("cyberpanel") || cats.includes("plesk-php-vps") || has(k, /\bplesk\b|cyberpanel/)) {
    return panelHowto(a, k);
  }
  if (cats.includes("crm-klantenpanel") || cats.includes("support")) {
    return crmHowto(a);
  }
  if (cats.includes("ai-integratie-automatisering")) {
    return aiHowto(a);
  }
  if (cats.includes("analytics-conversie-toegankelijkheid")) {
    return analyticsHowto(a);
  }
  if (cats.includes("privacy-juridisch-compliance")) {
    return privacyHowto(a);
  }
  if (cats.includes("beveiliging") || cats.includes("ssl-certificaten") || cats.includes("hosting")) {
    return hostingHowto(a, k);
  }

  // Generic howto — still no title-plug sentence
  return {
    mode: "howto",
    excerpt: excerpt(title, "howto"),
    intro: [
      `<strong>${esc(title)}</strong> — praktische handleiding bij ${B}.`,
      "We beschrijven voorbereiding, gerichte acties en controles voor dit onderwerp.",
    ],
    prep: ["Product/domein/hostname", "Toegang tot de juiste omgeving", "Backup bij risicovolle stappen"],
    why: [
      "Kleine, gecontroleerde wijzigingen zijn makkelijker terug te draaien.",
      "Documentatie versnelt support.",
      "Verificatie vanaf een tweede netwerk vangt cache-illusies.",
    ],
    steps: [
      "Verzamel context: product, URL/hostname en recente changes.",
      "Werk op staging of maak een backup.",
      "Open het relevante panel-, DNS-, CMS- of codescherm voor dit onderwerp.",
      "Voer de kleinste wijziging door die het doel bereikt; bewaar de oude waarde.",
      "Test buiten de beheeromgeving en noteer het resultaat.",
    ],
    checks: ["Doelgedrag zichtbaar", "Geen regressie elders", "Rollback nog mogelijk"],
    tip: "Vermeld in tickets fouttekst, tijdstip en wat je al probeerde.",
    warn: "Wijzig niet meerdere kritieke systemen tegelijk.",
    related: "Backups; tickets; monitoring",
  };
}

function nextHowto(a, k) {
  const title = a.title;
  if (has(k, /api.?route|route.?handler/)) {
    return {
      mode: "howto",
      excerpt: excerpt(title, "howto"),
      intro: [
        `<strong>API Route Handlers</strong> in Next.js App Router: <code>app/api/.../route.ts</code> met GET/POST — server-side, niet in de browserbundle.`,
      ],
      prep: ["App Router repo", "Staging", "Auth-model (session/HMAC/API key)"],
      why: ["Ongeauthente endpoints zijn writable backdoors.", "Zware queries per request maken TTFB slecht."],
      steps: [
        "Maak `app/api/<pad>/route.ts` en exporteer alleen benodigde methodes.",
        "Valideer input (schema); parse `request.json()` / searchParams.",
        "Check auth vóór side effects; secrets alleen in server-env.",
        "Return `NextResponse.json` met correcte statuscodes.",
        "Test met curl op staging; monitor logs op de VPS.",
      ],
      checks: ["Happy path OK", "401/400 gedekt", "Geen secrets in responses"],
      tip: "Houd handlers dun; business logic in libs.",
      warn: "Open CORS alleen bewust.",
      related: "Server Actions; env; logging",
    };
  }
  if (has(k, /revalidate|caching|datacache/)) {
    return {
      mode: "howto",
      excerpt: excerpt(title, "howto"),
      intro: [`<strong>${esc(title)}</strong> — Next.js datacache, revalidatePath/Tag en CDN-lagen op ${B}-VPS.`],
      prep: ["Welke routes static/dynamic mogen", "CDN-purge rechten", "Staging"],
      why: ["Alles dynamic is traag/duur.", "CDN + Node-cache vereisen beide een purge-strategie."],
      steps: [
        "Markeer marketing vs account/checkout routes.",
        "Gebruik `fetch(..., { next: { revalidate, tags } })` waar passend.",
        "Trigger `revalidateTag`/`revalidatePath` vanuit webhook/handler na content-updates.",
        "Stem HTML cache-headers af op CDN (of bypass HTML).",
        "Verifieer vers content in incognito + via CDN-URL.",
      ],
      checks: ["Statische pages snel", "Na revalidate binnen seconden vers", "Geen private data in shared cache"],
      tip: "Tags per contenttype i.p.v. alleen tijd.",
      warn: "Purge beide lagen.",
      related: "CDN; deploy; ISR",
    };
  }
  if (has(k, /i18n|locale|meertal|internationale/)) {
    return {
      mode: "howto",
      excerpt: excerpt(title, "howto"),
      intro: [`<strong>${esc(title)}</strong> — locale-routing, dictionaries en hreflang in App Router.`],
      prep: ["Locales + default", "Path vs subdomain strategie", "Repo toegang"],
      why: ["Verkeerde locale-URL’s geven duplicate content.", "Brede middleware breekt assets/API."],
      steps: [
        "Kies path-prefix; documenteer default locale.",
        "Zet routes onder `app/[locale]/...`.",
        "Middleware: locale detect + exclude `_next`/api.",
        "Metadata `alternates.languages` per pagina.",
        "Test language switcher op deep links.",
      ],
      checks: ["Deep links per locale", "Switcher behoudt pad", "Assets niet omgebogen"],
      tip: "Purge CDN per locale-URL.",
      warn: "Hardcode geen locale in client fetches.",
      related: "Middleware; SEO metadata",
    };
  }
  // default next howto without title plug
  return {
    mode: "howto",
    excerpt: excerpt(title, "howto"),
    intro: [
      `<strong>${esc(title)}</strong> — Next.js/React bij ${B}: App Router, build en hosting.`,
      "Werk op een branch/staging en verifieer met `next build`.",
    ],
    prep: ["Node-major gelijk aan productie", "Staging-URL", "Env-bestand zonder secrets in git"],
    why: [
      "Frameworkkeuzes raken SEO en performance.",
      "Zonder staging zie je regressies pas live.",
    ],
    steps: [
      "Zoek de relevante `app/`- of `pages/`-modules voor dit onderwerp.",
      "Reproduceer lokaal met dezelfde Node-major (`next dev`).",
      "Pas minimale code/config toe; commit in kleine stappen.",
      "Draai `next build` en fix type/lintfouten.",
      "Verifieer op staging (desktop + mobiel) en deploy daarna.",
    ],
    checks: ["Build groen", "Staging = verwachting", "Geen nieuwe server errors"],
    tip: "Noteer Next- en Node-versie in tickets.",
    warn: "Geen routing/cache-experimenten eerst op productie.",
    related: "Deploy; env; caching",
  };
}

function htmlHowto(a, k) {
  const title = a.title;
  if (has(k, /animatie|animation|motion/)) {
    return {
      mode: "howto",
      excerpt: excerpt(title, "howto"),
      intro: [
        `<strong>${esc(title)}</strong> — animeer met compositor-vriendelijke properties en respecteer reduced motion.`,
      ],
      prep: ["DevTools Performance", "Lijst van huidige animaties", "Staging/static preview"],
      why: ["Layout-properties janken scroll/INP.", "Reduced-motion negeren sluit gebruikers buiten."],
      steps: [
        "Inventariseer CSS/JS-animaties (AOS/GSAP/eigen).",
        "Vervang waar mogelijk `top/left/width` door `transform`/`opacity`.",
        "Beperk `will-change`; nooit op tientallen nodes permanent.",
        "Voeg `@media (prefers-reduced-motion: reduce)` toe.",
        "Meet FPS/Lighthouse op een mid-range mobiel preset.",
      ],
      checks: ["Geen scroll-jank", "Reduced motion schakelt effecten uit", "INP niet slechter"],
      tip: "Eén sterke micro-interactie wint van vijf tegelijk.",
      warn: "Zware Lottie/autoplay video boven de vouw slaat LCP kapot.",
      related: "CWV; responsive; dark mode",
    };
  }
  return {
    mode: "howto",
    excerpt: excerpt(title, "howto"),
    intro: [`<strong>${esc(title)}</strong> — HTML/CSS/JS zonder onnodige frameworks.`],
    prep: ["Editor/repo", "Browsers om te testen", "Deploy-pad naar webroot"],
    why: ["Progressive enhancement houdt content bereikbaar.", "Semantiek helpt SEO/a11y."],
    steps: [
      "Open de relevante HTML/CSS/JS-bestanden.",
      "Pas markup/CSS/JS toe die dit onderwerp vraagt.",
      "Test desktop + smal viewport.",
      "Check Lighthouse accessibility/performance.",
      "Deploy build/static output naar de webroot bij TripleZero iT.",
    ],
    checks: ["Geen console errors", "Mobiel bruikbaar", "Geen layout thrashing"],
    tip: "Native HTML-features schelen libraries.",
    warn: "Test niet alleen op desktop-breedte.",
    related: "Assets; static hosten; forms",
  };
}

function landingHowto(a) {
  const title = a.title;
  return {
    mode: "howto",
    excerpt: excerpt(title, "howto"),
    intro: [`<strong>${esc(title)}</strong> — landingspagina met één doel, snelle load en meetbare CTA.`],
    prep: ["Primaire CTA + KPI", "Mobiel testdevice", "Analytics/UTM plan"],
    why: ["Te veel CTA’s verlagen conversie.", "Trage heroes verspillen ad-budget."],
    steps: [
      "Definieer één primaire CTA en succesmetric.",
      "Zet belofte + CTA boven de vouw op mobiel.",
      "Voeg trust/social proof toe vóór het formulier.",
      "Koppel tracking/UTM’s en test submit.",
      "Meet conversie na release; wijzig één factor per experiment.",
    ],
    checks: ["CTA duidelijk op 390px", "Form/event werkt", "LCP acceptabel"],
    tip: "Herhaal CTA na social proof.",
    warn: "Geen full-screen pop-up bij eerste paint.",
    related: "UTM; speed; friction",
  };
}

function maintainHowto(a) {
  const title = a.title;
  return {
    mode: "howto",
    excerpt: excerpt(title, "howto"),
    intro: [`<strong>${esc(title)}</strong> — onderhoud/maatwerk met staging, monitoring en rollback.`],
    prep: ["Onderhoudsvenster", "Staging of backup", "Owner + escalatie"],
    why: ["Ad-hoc hotfixes zonder plan herhalen incidenten.", "Zonder monitoring merk je degradatie te laat."],
    steps: [
      "Bepaal impact en rollbackpad.",
      "Voer wijziging eerst op staging uit (of met snapshot).",
      "Deploy/pas config toe buiten piekuren waar mogelijk.",
      "Monitor errors/uptime 30–60 minuten.",
      "Documenteer in changelog/runbook.",
    ],
    checks: ["Staging/prod OK", "Monitoring groen", "Docs bijgewerkt"],
    tip: "Reserveer vaste capaciteit voor dependency/security updates.",
    warn: "Geen prod-fix zonder rollback.",
    related: "Backups; staging; SLA",
  };
}

function mailDnsHowto(a, k) {
  const title = a.title;
  if (has(k, /\bspf\b/)) {
    return {
      mode: "howto",
      excerpt: excerpt(title, "howto"),
      intro: ["<strong>SPF</strong> is één TXT-record dat verzendbronnen autoriseert. Dubbele SPF-TXT’s maken het kapot."],
      prep: ["Lijst verzendbronnen", "DNS-toegang", "Huidige TXT-export"],
      why: ["Zonder SPF stijgt spoof-risico.", "Te veel includes raken de 10-lookup limiet."],
      steps: [
        "Inventariseer alle senders (hostingmail, M365, ESP).",
        "Zorg voor precies één `v=spf1 ...` TXT op apex.",
        "Voeg includes/ip4 toe; verwijder dode bronnen.",
        "Publiceer; verifieer met dig vanaf extern netwerk.",
        "Stuur proefmail en check Authentication-Results.",
      ],
      checks: ["Eén SPF-record", "Lookups ≤ 10", "Legitieme mail pass"],
      tip: "Flatten alleen bij limietproblemen.",
      warn: "Verwijder geen actieve ESP-includes.",
      related: "DKIM; DMARC; MX",
    };
  }
  if (has(k, /imap|smtp|outlook|iphone|android|mailclient/)) {
    return {
      mode: "howto",
      excerpt: excerpt(title, "howto"),
      intro: [`<strong>${esc(title)}</strong> — IMAP/SMTP uit je TripleZero iT-oplevering.`],
      prep: ["Mailbox + wachtwoord", "Serverhost uit welkomstmail", "Client"],
      why: ["Verkeerde poorten breken verzenden.", "Username is meestal het volledige adres."],
      steps: [
        "Haal IMAP 993/SSL en SMTP 465/587 uit panel/welkomstmail.",
        "Account toevoegen als IMAP; user = volledig adres.",
        "SMTP-auth aan met dezelfde credentials.",
        "Test ontvangen én verzenden; isolatie via webmail.",
      ],
      checks: ["Webmail werkt", "Client send/receive OK", "Geen cert-waarschuwing op juiste host"],
      tip: "Webmail OK + client niet ⇒ clientconfig.",
      warn: "Geen plain IMAP op publieke netwerken.",
      related: "Webmail; SPF; wachtwoord",
    };
  }
  return {
    mode: "howto",
    excerpt: excerpt(title, "howto"),
    intro: [`<strong>${esc(title)}</strong> — DNS/mailwijzigingen één record tegelijk.`],
    prep: ["Zone-export/screenshot", "DNS-toegang", "TTL-plan"],
    why: ["DNS-fouten raken site en mail.", "Lokale cache misleidt troubleshooting."],
    steps: [
      "Export huidige zone.",
      "Pas het benodigde recordtype toe (A/MX/TXT/CNAME).",
      "Verlaag TTL tijdelijk bij kritieke cuts.",
      "Controleer met dig vanaf 4G én kantoor.",
      "Test site/mail na propagatie.",
    ],
    checks: ["Externe lookup klopt", "Mail/site OK", "Geen dubbele conflicten"],
    tip: "Vergelijk twee resolvers.",
    warn: "Nameserver-wijzigingen plannen — langere propagatie.",
    related: "SPF; SSL; lock",
  };
}

function cdnHowto(a) {
  const title = a.title;
  return {
    mode: "howto",
    excerpt: excerpt(title, "howto"),
    intro: [`<strong>${esc(title)}</strong> — edge/origin, cache-regels en meetbare snelheid.`],
    prep: ["CDN-login", "Origin-host", "Huidige cache headers"],
    why: ["Verkeerde HTML-TTL toont stale content.", "Alles bypassen vernietigt CDN-winst."],
    steps: [
      "Scheid asset-cache (lang + hash) van HTML (kort/bypass).",
      "Zet rules voor admin/api/checkout excludes.",
      "Pas de CDN/origin-instelling voor dit onderwerp toe.",
      "Purge gericht; verifieer `cf-cache-status` of equivalent.",
      "Meet TTFB/LCP vóór/na.",
    ],
    checks: ["Assets HIT", "Private pages niet shared-cache", "Geen broken assets"],
    tip: "Documenteer rulesets met screenshots.",
    warn: "MX nooit proxied.",
    related: "Purge; SSL modes; CWV",
  };
}

function wpHowto(a) {
  const title = a.title;
  return {
    mode: "howto",
    excerpt: excerpt(title, "howto"),
    intro: [`<strong>${esc(title)}</strong> — WordPress/WooCommerce via wp-admin + hostingpanel.`],
    prep: ["wp-admin", "Backup/staging", "Cache-plugins inventaris"],
    why: ["Blind updaten zonder backup = downtime.", "Cache kan oude fouten tonen."],
    steps: [
      "Maak backup (files + DB) of gebruik staging.",
      "Open het juiste wp-admin menu voor dit onderwerp.",
      "Voer de wijziging door; noteer oude waarde.",
      "Purge page/object/CDN cache.",
      "Test frontend + kritieke flows (form/checkout).",
    ],
    checks: ["Geen critical error", "Wijziging zichtbaar", "Checkout/form OK indien relevant"],
    tip: "Isoleer pluginconflicten door tijdelijk default theme.",
    warn: "Geen live betaalwijzigingen zonder testorder.",
    related: "Backups; staging; caching",
  };
}

function vpsHowto(a) {
  const title = a.title;
  return {
    mode: "howto",
    excerpt: excerpt(title, "howto"),
    intro: [`<strong>${esc(title)}</strong> — VPS/serverwerk met snapshot en console-toegang.`],
    prep: ["IP/hostname", "Snapshot", "Console in klantenpanel"],
    why: ["Firewallfouten locken je buiten.", "Zonder snapshot is rollback lastig."],
    steps: [
      "Maak snapshot/backup vóór schrijvende acties.",
      "Houd panel-console open naast SSH.",
      "Voer de serveractie voor dit onderwerp uit.",
      "Verifieer diensten vanaf een tweede netwerk.",
      "Documenteer change + monitoring-check.",
    ],
    checks: ["Dienst bereikbaar", "Snapshot nog beschikbaar", "Geen onbedoelde open poorten"],
    tip: "Bij lock-out: console eerst, niet meer gokken met rules.",
    warn: "BMC/IPMI niet met default wachtwoord op internet.",
    related: "Firewall; rescue; monitoring",
  };
}

function panelHowto(a, k) {
  const title = a.title;
  const panel = has(k, /cyberpanel/) ? "CyberPanel" : "Plesk";
  return {
    mode: "howto",
    excerpt: excerpt(title, "howto"),
    intro: [`<strong>${esc(title)}</strong> — ${panel}: altijd eerst het juiste domein/abonnement selecteren.`],
    prep: [`${panel}-URL/login`, "Juiste subscription", "Backup"],
    why: ["Verkeerde site selecteren wijzigt de verkeerde klant.", "Backup vóór mail/DNS/SSL."],
    steps: [
      `Log in op ${panel} en kies het juiste domein.`,
      "Open de module die bij dit onderwerp hoort (Mail, DNS, SSL, Files, DB, WP).",
      "Voer de wijziging door en bevestig.",
      "Test buiten het panel (browser/mail/dig).",
    ],
    checks: ["Juiste domein geraakt", "Test OK", "Geen side effects"],
    tip: "Reseller: dubbelcheck klant-subscription.",
    warn: "Geen DNS/mail delete zonder export.",
    related: "Backups; SSL; mail",
  };
}

function crmHowto(a) {
  const title = a.title;
  return {
    mode: "howto",
    excerpt: excerpt(title, "howto"),
    intro: [`<strong>${esc(title)}</strong> — TripleZero iT klantenpanel / support.`],
    prep: ["Login", "Product/domein paraat", "2FA-app indien actief"],
    why: ["Incomplete tickets kosten rondes.", "Accountwijzigingen raken facturatie/toegang."],
    steps: [
      "Log in op het klantenpanel.",
      "Open het juiste onderdeel (facturen, tickets, 2FA, producten).",
      "Voer de actie door en bevestig.",
      "Controleer status/mailbevestiging.",
    ],
    checks: ["Status klopt in panel", "Bevestiging ontvangen waar relevant"],
    tip: "Eén onderwerp per ticket.",
    warn: "Geen wachtwoorden in screenshots.",
    related: "2FA; tickets; products",
  };
}

function aiHowto(a) {
  const title = a.title;
  return {
    mode: "howto",
    excerpt: excerpt(title, "howto"),
    intro: [`<strong>${esc(title)}</strong> — AI/automatisering: secrets server-side, meetbare output, kill-switch.`],
    prep: ["Staging keys", "Flow-diagram", "Owner"],
    why: ["Automation zonder monitoring faalt stil.", "Lekke secrets zijn fataal."],
    steps: [
      "Definieer input/output en succesmetric.",
      "Bouw MVP op staging met minimale scopes.",
      "Voeg logging, retries en auth (HMAC) toe.",
      "Monitor errors/kosten eerste week.",
      "Documenteer runbook + kill-switch.",
    ],
    checks: ["Happy path 1×", "Ongeldige auth geweigerd", "Alerts aan"],
    tip: "Versioneer prompts/flows als code.",
    warn: "Geen productie zonder rollback.",
    related: "Webhooks; privacy; monitoring",
  };
}

function analyticsHowto(a) {
  const title = a.title;
  return {
    mode: "howto",
    excerpt: excerpt(title, "howto"),
    intro: [`<strong>${esc(title)}</strong> — meting/CRO/a11y: consent-first en verifieerbaar.`],
    prep: ["CMP/GTM toegang", "Doel-KPI", "Debug tools"],
    why: ["Tags vóór consent schenden beleid.", "Vuile data stuurt verkeerde besluiten."],
    steps: [
      "Inventariseer tags/events en consent-categorieën.",
      "Implementeer de meting of UX-fix voor dit onderwerp.",
      "Debug met GTM preview / GA4 DebugView / a11y tools.",
      "Controleer opt-out pad.",
      "Monitor KPI 1–2 weken.",
    ],
    checks: ["Events na consent", "Opt-out blokkeert marketing", "Geen PII in hits"],
    tip: "Eén hypothese per experiment.",
    warn: "Geen e-mailadressen in event parameters.",
    related: "Consent; CWV; privacy",
  };
}

function privacyHowto(a) {
  const title = a.title;
  return {
    mode: "howto",
    excerpt: excerpt(title, "howto"),
    intro: [
      `<strong>${esc(title)}</strong> — educatief privacy/compliance-kader (geen juridisch advies op maat).`,
    ],
    prep: ["Lijst verwerkingen/tools", "Huidige teksten", "Hostingregio"],
    why: ["Onduidelijke verwerkingen geven klachtrisico.", "Dataminimalisatie verlaagt impact."],
    steps: [
      "Inventariseer persoonsgegevensstromen.",
      "Werk teksten/processen bij in lijn met dit onderwerp.",
      "Beperk velden/bewaartermijnen waar mogelijk.",
      "Documenteer verwerkers.",
      "Laat juridisch reviewen bij twijfel.",
    ],
    checks: ["Teksten bereikbaar", "Praktijk = policy", "Owners bekend"],
    tip: "Houd een verwerkerslijst bij.",
    warn: "Geen vervanging voor advocaat/FG.",
    related: "Cookie banner; security; tickets",
  };
}

function hostingHowto(a, k) {
  const title = a.title;
  if (has(k, /ssl|https|lets.?encrypt|certificaat/)) {
    return {
      mode: "howto",
      excerpt: excerpt(title, "howto"),
      intro: [`<strong>${esc(title)}</strong> — certificaten en HTTPS op hosting.`],
      prep: ["DNS naar juiste server", "Panel SSL-toegang"],
      why: ["Force HTTPS vóór geldig cert = downtime.", "Vergeten aliases geven warnings."],
      steps: [
        "Check DNS wijst correct.",
        "Issue/renew cert (Let’s Encrypt of gekocht).",
        "Dek apex + www indien nodig.",
        "Force HTTPS pas ná geldige keten.",
        "Test in incognito + SSL-checker.",
      ],
      checks: ["Hangslot OK", "Geen mixed content", "Auto-renew actief"],
      tip: "Monitor expiry-mails.",
      warn: "HSTS preload alleen met blijvende HTTPS-zekerheid.",
      related: "DNS; CDN SSL; redirects",
    };
  }
  return {
    mode: "howto",
    excerpt: excerpt(title, "howto"),
    intro: [`<strong>${esc(title)}</strong> — hostingpanel-acties bij TripleZero iT.`],
    prep: ["Panel-login", "Juiste domein", "Backup bij risico"],
    why: ["Wijzigingen raken alle sites op het account.", "Backup scheelt restore-tijd."],
    steps: [
      "Log in en selecteer het juiste domein.",
      "Open Files/FTP/PHP/SSL/Backups/Cron zoals dit onderwerp vraagt.",
      "Voer de wijziging door; noteer oude waarde.",
      "Test site/mail; purge cache indien nodig.",
    ],
    checks: ["Gedrag OK", "Geen error_log spike", "Backup beschikbaar"],
    tip: "Werk op kopie/staging waar kan.",
    warn: "Geen directory-deletes zonder restoreplan.",
    related: "Backups; SSL; DNS",
  };
}

// dead reference guard

/** One concrete step derived from title tokens — keeps siblings from sharing identical lists. */
function titleSpecificStep(a) {
  const k = kof(a);
  const pairs = [
    [/quarantaine/, "Controleer de SIDN-quarantainestatus en welke herstelstappen Domeinbeheer toont."],
    [/whois/, "Werk WHOIS-contactgegevens bij en bevestig verificatiemails van de registry."],
    [/auth.?code|autorisatie/, "Vraag of kopieer de autorisatiecode (EPP) in Domeinbeheer vóór een verhuizing."],
    [/nameserver|naamserver/, "Zet de nameservers naar de waarden uit je hosting/DNS-product en verifieer met dig NS."],
    [/propag/, "Houd rekening met TTL/propagatie; vergelijk dig vanaf kantoor én 4G."],
    [/forward|redirect|meta.?tag/, "Kies 301/302 of meta-refresh bewust; test apex én www."],
    [/lock|registrar.?lock|transfer.?lock/, "Schakel transfer-lock alleen uit als je echt gaat verhuizen; zet hem daarna weer aan."],
    [/trustee/, "Controleer of de TLD een local trustee vereist en of die via TripleZero iT geregeld is."],
    [/sidn/, "Vergelijk je registrar-gegevens met SIDN WHOIS; TripleZero iT kan als reseller anders tonen dan verwacht."],
    [/wordpress\.com|wpcom/, "Zet DNS/nameservers of A/CNAME volgens de wordpress.com-koppelinstructies."],
    [/blogger/, "Zet de Google-domeinstappen (A/CNAME/TXT) exact over en wacht op Google-verificatie."],
    [/weebly/, "Exporteer content waar mogelijk en plan DNS-cutover na de nieuwe site live staat."],
    [/dmarc/, "Publiceer _dmarc TXT eerst met p=none + rua; verhoog policy pas na schone reports."],
    [/dkim/, "Activeer DKIM in het mailpanel en plaats de selector TXT in DNS."],
    [/spf/, "Zorg voor precies één v=spf1 TXT; verwijder dubbele SPF-records."],
    [/mx/, "Zet MX naar de mailserver uit je productdocumentatie; verwijder verouderde MX-hosts."],
    [/back.?up|backup/, "Maak of download een recente backup (files + database) vóór je verdergaat."],
    [/ssl|lets.?encrypt|certificaat|https/, "Issue/renew het certificaat en forceer HTTPS pas ná een geldige keten."],
    [/ssh/, "Gebruik SFTP/SSH-gegevens uit het panel; test login vóór file-operaties."],
    [/ftp|filezilla/, "Verbind met FTPS/SFTP; land in de juiste webroot (public_html/domain dir)."],
    [/php.?versie|php-versie|phpinfo|memory_limit|opcache/, "Stel de PHP-optie per domein in het panel in en herlaad de site."],
    [/cron/, "Plan de cron in het panel of crontab; test één run en check output/logs."],
    [/firewall|fail2ban|modsec|waf/, "Pas de regel spaarzaam toe en houd console/panel-toegang open tegen lock-out."],
    [/2fa|tweefactor|authenticator/, "Activeer TOTP, bewaar backupcodes offline en test herlogin."],
    [/wordfence|malware|hack/, "Scan/isoleer, herstel uit clean backup en roteer alle wachtwoorden."],
    [/woocommerce|checkout|winkelwagen|mollie|ideal/, "Werk op staging; test een order inclusief betaalstatus en e-mails."],
    [/permalink/, "Sla permalinks opnieuw op en test oude URL’s op 301/404."],
    [/plugin|thema|theme|update/, "Update één component tegelijk na backup; test wp-admin + frontend."],
    [/cdn|cloudflare|purge|cache.?rule/, "Pas cache/purge-regels toe en verifieer cache-status headers."],
    [/revalidate|isr|datacache/, "Trigger revalidatePath/Tag of TTL-update en controleer verse HTML."],
    [/middleware/, "Beperk de matcher; exclude _next/static en API waar nodig."],
    [/i18n|locale|meertal/, "Zet locale-prefix/middleware en test deep links per taal."],
    [/animatie|animation|motion/, "Beperk animaties tot transform/opacity en respecteer prefers-reduced-motion."],
    [/dark.?mode|color.?scheme/, "Zet tokens voor light/dark en test contrast (WCAG)."],
    [/landing|cta|utm|heatmap|exit.?intent/, "Houd één primaire CTA; meet events/UTM’s na wijziging."],
    [/staging|rollback|deploy|release/, "Deploy eerst naar staging; houd vorige artifact klaar voor rollback."],
    [/monitor|uptime|ssl.?expir/, "Zet checks/alerts op HTTPS en cert-expiry; test een alert."],
    [/snapshot|rescue|ipmi|raid/, "Maak snapshot; gebruik console/rescue spaarzaam en documenteer."],
    [/401|403|404|500|502|503|504/, "Isoleer statuscode via logs/WAF/proxy vóór je config wijzigt."],
    [/avg|privacy|cookie|consent|gdpr/, "Inventariseer verwerkingen; pas teksten/consent aan (educatief kader)."],
    [/n8n|webhook|automatisering|zapier/, "Bouw de flow op staging met HMAC/auth en idempotency."],
    [/llm|chatbot|prompt|openai/, "Ground antwoorden, zet rate limits en human handoff."],
    [/ga4|gtm|matomo|lcp|cls|inp|wcag/, "Meet/debug met de juiste tool en respecteer consent."],
    [/plesk/, "Selecteer de juiste subscription in Plesk vóór je de module opent."],
    [/cyberpanel/, "Log in op CyberPanel (8090) en kies de juiste website/user."],
    [/directadmin/, "Log in op DirectAdmin en open het juiste Account/Domain-menu."],
    [/ticket|support|belafspraak/, "Open een ticket met domein, tijdstip, fouttekst en reeds geprobeerde stappen."],
    [/factuur|betaalmethode|invoice/, "Controleer factuur/betaalmethode in het klantenpanel en de bevestigingsmail."],
  ];
  const parts = String(a.slug).split("-").filter((w) => w.length > 3 && !["voor","naar","met","zijn","deze","geen","jullie","triplezero","hosting","hoe","wat","welke"].includes(w));
  const angle = parts.slice(0, 4).join(" ");
  for (const [re, step] of pairs) {
    if (re.test(k)) return `${step} (context: ${angle})`;
  }
  return `Concrete check voor dit artikel (${angle}): leg vast wat je wijzigde, test het resultaat buiten het panel en noteer tijdstip + URL/hostname.`;
}

function withUniqueStep(a, pack) {
  if (!pack || pack.mode === "explain" || pack.mode === "compare") return pack;
  const extra = titleSpecificStep(a);
  const steps = [...(pack.steps || [])];
  // insert as second step when possible
  if (steps.length >= 2) steps.splice(1, 0, extra);
  else steps.push(extra);
  // dedupe exact
  pack.steps = steps.filter((s, i, arr) => arr.indexOf(s) === i).slice(0, 9);
  return pack;
}

function build(a) {
  const mode = modeOf(a);
  if (mode === "explain") return packExplain(a);
  if (mode === "compare") return packCompare(a);
  if (mode === "troubleshoot") return withUniqueStep(a, packTroubleshoot(a));
  return withUniqueStep(a, packHowtoFromSlugOrKeywords(a));
}

function emitHtml(p) {
  // Returns JS object fields for TS emitter
  return p;
}

const articles = {};
let stats = { explain: 0, compare: 0, troubleshoot: 0, howto: 0, skippedKeep: 0 };

for (const a of cat.articles) {
  const mode = modeOf(a);
  // Keep hand-crafted howto packs; still override conceptual/compare so they lose fake stappen.
  if (keepTopics.has(a.topic) && !SLUG[a.slug] && mode === "howto") {
    stats.skippedKeep++;
    continue;
  }
  const p = emitHtml(build(a));
  stats[p.mode] = (stats[p.mode] || 0) + 1;
  articles[a.topic] = { ...p, title: a.title, slug: a.slug };
}

console.log("generated", Object.keys(articles).length, stats, "keepTopics", keepTopics.size);

let out = `/**
 * Strict NL kennisbank bodies — explain/compare without fake stappen; howto unique per subject.
 * Generated by scripts/kennisbank-wave-quality/generate-strict-bodies.mjs
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
    \`Kom je er niet uit? Open een ticket bij TripleZero iT via het klantenpanel. Vermeld product, domein/hostname, tijdstip en wat je al probeerde.\`,
    related ? \`Gerelateerd: \${related}.\` : \`Bekijk ook andere artikelen in deze kennisbank.\`,
  );
}

type Ctx = { title: string; topic: string };

export const qualityTopicExcerptsNl: Record<string, string> = {
`;

for (const [topic, meta] of Object.entries(articles)) {
  out += `  ${JSON.stringify(topic)}: ${JSON.stringify(meta.excerpt)},\n`;
}
out += `};

export const qualityTopicBuilders: Record<string, (ctx: Ctx) => string> = {\n`;

for (const [topic, meta] of Object.entries(articles)) {
  if (meta.mode === "explain" || meta.mode === "compare") {
    const sections = meta.sections
      .map(
        (sec) =>
          `    h2(${JSON.stringify(sec.h)}),\n    ul(${JSON.stringify(sec.items)}),`,
      )
      .join("\n");
    out += `  ${JSON.stringify(topic)}: () => [
    p(${meta.intro.map((s) => JSON.stringify(s)).join(", ")}),
${sections}
    tip(${JSON.stringify(meta.tip)}),
    warn(${JSON.stringify(meta.warn)}),
    outro(${JSON.stringify(meta.related)}),
  ].join("\\n"),\n\n`;
  } else {
    out += `  ${JSON.stringify(topic)}: () => [
    p(${meta.intro.map((s) => JSON.stringify(s)).join(", ")}),
    h2("Waarom dit belangrijk is"),
    ul(${JSON.stringify(meta.why)}),
    h2("Voorbereiding"),
    ul(${JSON.stringify(meta.prep)}),
    h2("Stappen"),
    ol(${JSON.stringify(meta.steps)}),
    h2("Controleren"),
    ul(${JSON.stringify(meta.checks)}),
    tip(${JSON.stringify(meta.tip)}),
    warn(${JSON.stringify(meta.warn)}),
    outro(${JSON.stringify(meta.related)}),
  ].join("\\n"),\n\n`;
  }
}
out += `};\n`;

const outPath = path.join(ROOT, "prisma/kennisbank/quality-topic-bodies.ts");
fs.writeFileSync(outPath, out);
console.log("wrote", outPath, "bytes", out.length);

fs.writeFileSync(
  path.join(ROOT, "scripts/kennisbank-wave-quality/strict-articles.json"),
  JSON.stringify(
    Object.values(articles).map((a) => ({ slug: a.slug, topic: Object.keys(articles).find((t) => articles[t] === a), mode: a.mode, title: a.title })),
    null,
    2,
  ),
);
// better slug list
fs.writeFileSync(
  path.join(ROOT, "scripts/kennisbank-wave-quality/strict-slugs.json"),
  JSON.stringify(
    cat.articles.filter((a) => articles[a.topic]).map((a) => ({ slug: a.slug })),
    null,
    2,
  ),
);
console.log("slugs", cat.articles.filter((a) => articles[a.topic]).length);

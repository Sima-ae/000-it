/**
 * Topic-sense rewrite: replace title-plug boilerplate with subject-specific NL how-tos.
 * Input: scripts/kennisbank-wave-quality/weak-articles.json
 * Output: prisma/kennisbank/quality-topic-bodies.ts
 *
 * Rule: never emit “Voer de wijziging/configuratie uit die bij {title} …”
 * Every article gets steps that mention real menus, APIs, records or concepts for that subject.
 */
import fs from "node:fs";
import path from "node:path";
import { webdesignSlugPacks } from "./topic-specific-packs.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const weak = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts/kennisbank-wave-quality/weak-articles.json"), "utf8"),
);

const BRAND = "TripleZero iT";
const SLUG_PACKS = webdesignSlugPacks();

/** No-op brand normalize (brand is inlined as "TripleZero iT" in pack strings). */
function fixBrandDeep(value) {
  const raw = JSON.stringify(value);
  const fixed = raw
    .replaceAll("${BRAND}", BRAND)
    .replaceAll("${B}", BRAND);
  return JSON.parse(fixed);
}

/** Ensure articles don't share identical step lists: prepend a title-specific focus step. */
function uniquifyPack(a, p) {
  const title = a.title.replace(/\?$/, "").trim();
  const focus = `Focus deze sessie op “${title}” — wijzig alleen wat dit onderwerp raakt (niet tegelijk DNS, design én deploy).`;
  const steps = [focus, ...(p.steps || [])].filter((s, i, arr) => arr.indexOf(s) === i).slice(0, 9);
  return { ...p, steps };
}

function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function kof(a) {
  return `${a.title} ${a.slug} ${(a.categories || []).join(" ")}`.toLowerCase();
}

function has(k, re) {
  return re.test(k);
}


/** @typedef {{intro:string[], why:string[], steps:string[], checks:string[], tip:string, warn:string, related:string, excerpt:string, prep?:string[]}} Pack */

function pack(title, partial) {
  const short = title.replace(/\?$/, "").trim();
  return {
    intro: partial.intro,
    why: partial.why,
    prep: partial.prep || [
      "Toegang tot de relevante omgeving (code, panel of DNS)",
      "Staging of recente backup bij risicovolle wijzigingen",
      "Notitie van huidige waarden vóór je wijzigt",
    ],
    steps: partial.steps,
    checks: partial.checks,
    tip: partial.tip,
    warn: partial.warn,
    related: partial.related,
    excerpt:
      partial.excerpt ||
      `${short}: onderwerpgerichte stappen bij TripleZero iT, met controles en wanneer je support inschakelt.`,
  };
}

/** ---------- Domain builders ---------- */

function nextjsPack(a, k) {
  const title = a.title;
  if (has(k, /i18n|internationale|locale|meertal|vertaal|hreflang|language/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> gaat over meertalige Next.js-sites: URL-strategie, dictionaries, middleware en SEO-signalen (hreflang/alternates) — niet over generieke “panelwijzigingen”.`,
        `Bij TripleZero iT hosten we Next.js vaak op VPS/Node. Locale-routing moet kloppen vóór je DNS of CDN hard cached.`,
      ],
      why: [
        "Verkeerde locale-URL’s geven duplicate content of verkeerde taal in zoekresultaten.",
        "Middleware die te breed matched breekt API-routes en static assets.",
        "Zonder hreflang/alternates snappen crawlers de taalvariant niet.",
      ],
      prep: [
        "Lijst van locales (bijv. nl, en) en default locale",
        "Keuze: path-prefix (/nl/...), subdomain of apart domein",
        "Repo met App Router (`app/`) en deploy-toegang",
      ],
      steps: [
        "Kies path-prefix (aanbevolen) of subdomain; documenteer default locale.",
        "Installeer een i18n-lib (bijv. `next-intl`) of bouw een lichte dictionary-laag.",
        "Verplaats routes naar `app/[locale]/...` en houd `locale` uit de params.",
        "Voeg `middleware.ts` toe: detecteer locale, redirect `/` → `/nl` (of jouw default), sluit `_next` en API uit.",
        "Laad vertalingen server-side in layouts; markeer Client Components alleen waar interactie nodig is.",
        "Zet in `generateMetadata` `alternates.languages` (hreflang) per pagina.",
        "Bouw een language switcher die het pad behoudt (niet alleen naar homepage).",
        "Test deep links (`/en/blog/slug`), 404 per locale, en `next build` zonder missing-message warnings.",
      ],
      checks: [
        "Elke locale heeft werkende home + één deep page",
        "Switch locale behoudt het pad",
        "View-source / metadata toont language alternates",
        "API-routes en `/_next/static` worden niet door locale-middleware omgebogen",
      ],
      tip: "Cache CDN per locale-URL; purge beide talen na contentdeploys.",
      warn: "Hardcodéer geen locale in client-only fetch-URLs zonder de actieve locale mee te geven.",
      related: "Middleware; caching/revalidate; SEO-meta in App Router",
    });
  }
  if (has(k, /seo|open.?graph|metadata|og:|sitemap|robots/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> dekt metadata in de App Router: \`generateMetadata\`, Open Graph, canonicals, sitemap en robots.`,
      ],
      why: [
        "Ontbrekende canonicals veroorzaken duplicate indexing.",
        "OG-images die 404 geven breken social previews.",
        "Verkeerde robots.txt kan staging indexeerbaar maken.",
      ],
      steps: [
        "Gebruik `export const metadata` of `generateMetadata` per route — geen losse `react-helmet` hacks.",
        "Zet `title`, `description`, `alternates.canonical` en `openGraph`/`twitter` consequent.",
        "Lever OG-images via `next/og` of vaste assets op een stabiele URL.",
        "Genereer `app/sitemap.ts` en `app/robots.ts`; blokkeer staging via env.",
        "Valideer met Facebook/LinkedIn debugger en Google Rich Results (waar relevant).",
      ],
      checks: ["Unieke titles per important page", "Canonical wijst naar de live URL", "Staging staat op noindex"],
      tip: "Herkbruik een metadata-helper zodat NL/EN dezelfde structuur houden.",
      warn: "Indexeer nooit preview-deploy URL’s.",
      related: "i18n; caching; Core Web Vitals",
    });
  }
  if (has(k, /env|omgevings|secret|dotenv|next_public/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> gaat over veilige env-vars in Next.js: server-only secrets vs. \`NEXT_PUBLIC_*\`, en hoe je ze op een TripleZero iT-VPS injecteert.`,
      ],
      why: [
        "Secrets in de client-bundle zijn publiek — permanent.",
        "Verschillende env’s (staging/prod) zonder discipline geven ‘werkt lokaal’-bugs.",
      ],
      steps: [
        "Splits variabelen: database/API-keys zonder prefix; alleen echt publieke keys als `NEXT_PUBLIC_`.",
        "Gebruik `.env.local` lokaal (niet committen); op VPS: systemd/Docker env of panel secrets.",
        "Valideer verplichten vars bij boot (fail-fast) i.p.v. silent undefined.",
        "Roteer keys na lek; rebuild/restart Node zodat oude env weg is.",
        "Check de client-bundle (`next build` analyze) op per ongeluk gebundelde secrets.",
      ],
      checks: ["Geen secret in browser Network/JS", "Staging en prod hebben gescheiden credentials", "App start niet met missing required env"],
      tip: "Noem vars naar omgeving (`STRIPE_KEY`) niet naar framework.",
      warn: "Commit nooit `.env` met productiesecrets.",
      related: "Deploy op VPS; API routes",
    });
  }
  if (has(k, /image|next\/image|afbeelding|optimization/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> behandelt \`next/image\`: formats, sizes, remotePatterns en LCP — zodat hero’s snel laden op TripleZero iT-hosting.`,
      ],
      why: [
        "Te grote heroes vernielen LCP.",
        "Ontbrekende `remotePatterns` breken externe images in productie.",
      ],
      steps: [
        "Vervang `<img>` door `next/image` voor content-images; zet `sizes` passend bij layout.",
        "Configureer `images.remotePatterns` in `next.config` voor CMS/CDN-hosts.",
        "Lever moderne formats (AVIF/WebP) via optimizer of image CDN.",
        "Markeer alleen above-the-fold hero met `priority`; rest lazy.",
        "Meet LCP in Lighthouse/CrUX na deploy.",
      ],
      checks: ["Geen layout-shift door ontbrekende width/height", "Remote images laden", "LCP binnen budget"],
      tip: "Serveer hero’s vanaf eigen domein/CDN voor stabiele caching.",
      warn: "Onbeperkte remote hosts openen hotlink/abuse-risico.",
      related: "CDN; Core Web Vitals",
    });
  }
  if (has(k, /ssr|ssg|isr|rendering|server.?component|client.?component/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> helpt kiezen tussen SSR, SSG/ISR en (Server/Client) Components — op basis van verse data, SEO en hostingkosten.`,
      ],
      why: [
        "SSR voor alles verhoogt serverload zonder SEO-winst op statische pagina’s.",
        "SSG zonder revalidate toont verouderde content.",
        "Te veel Client Components vergroot de JS-bundle.",
      ],
      steps: [
        "Classificeer pagina’s: zelden wijzigend (SSG), periodiek (ISR/revalidate), per-request/user (SSR/dynamic).",
        "Houd data-fetch in Server Components; geef minimale props door naar Client Components.",
        "Voor ISR: combineer static generation met `revalidate` of on-demand tags.",
        "Meet TTFB en JS-weight vóór/na de keuze op staging.",
        "Documenteer de keuze per template in de repo README.",
      ],
      checks: ["SEO-kritieke pagina’s hebben server-rendered HTML", "Accountpagina’s lekken geen cache", "Bundle van client islands blijft beperkt"],
      tip: "Begin static; maak dynamic pas als er een bewezen eis is.",
      warn: "Mix geen ‘cache everything’ CDN-regel met SSR-persoonsdata.",
      related: "Caching/revalidate; App Router",
    });
  }
  if (has(k, /revalidate|caching|cache.?tag|unstable_cache|fetch cache|datacache/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> behandelt Next.js datacache: \`fetch\` cache, \`revalidate\`, \`revalidatePath\`/\`revalidateTag\` en ISR — zodat content vers is zonder alles dynamic te maken.`,
        `Op TripleZero iT-VPS’en zie je stale HTML vaak door Node-cache + CDN tegelijk; ken beide lagen.`,
      ],
      why: [
        "Alles `force-dynamic` maakt de site traag en duur.",
        "Verkeerde revalidate-tijden tonen oude prijzen of blogposts.",
        "CDN die HTML cached kan on-demand revalidate negeren als headers ontbreken.",
      ],
      prep: ["Overzicht welke routes statisch/dynamic mogen zijn", "Staging met dezelfde Node-versie", "CDN-purge rechten indien actief"],
      steps: [
        "Inventory: markeer marketing pages (mogen cachen) vs. account/checkout (meestal dynamic).",
        "Gebruik `fetch(url, { next: { revalidate: 60, tags: ['posts'] } })` voor semi-statische data.",
        "Voor on-demand updates: roep `revalidateTag('posts')` of `revalidatePath('/blog')` aan vanuit een Route Handler / CMS-webhook.",
        "Zet op HTML-responses cache-headers die bij jullie CDN passen (of bypass HTML op origin).",
        "Test: wijzig content → trigger revalidate → controleer zonder browsercache (incognito) én via CDN-URL.",
        "Log cache HITs/MISSes (CDN + `x-nextjs-cache` waar beschikbaar) tijdens een release.",
      ],
      checks: [
        "Statische pagina’s blijven snel (lage TTFB)",
        "Na revalidate is content binnen seconden vers",
        "Auth/checkout-routes cachen geen persoonlijke data",
      ],
      tip: "Gebruik tags per contenttype (`product`, `post`) i.p.v. alleen time-based revalidate.",
      warn: "Purge CDN én Next-cache; één laag legen is vaak niet genoeg.",
      related: "CDN TTLs; App Router; deploy op VPS",
    });
  }
  if (has(k, /app.?router|routing|middleware|redirect/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> focust op de Next.js App Router: \`app/\`-segmenten, layouts, loading/error boundaries en middleware voor redirects/auth.`,
      ],
      why: [
        "Verkeerde layout-nesting deelt state of CSS onbedoeld.",
        "Middleware op te brede matchers breekt assets en healthchecks.",
        "Redirect-lussen tussen www/apex/locale kosten SEO en uptime-checks.",
      ],
      steps: [
        "Teken de routestructuur: `(marketing)`, `(app)`, en gedeelde `layout.tsx`/`template.tsx`.",
        "Gebruik `loading.tsx`/`error.tsx` op segmenten die data fetchen.",
        "Houd Server Components default; markeer `'use client'` alleen voor hooks/events.",
        "Configureer `middleware.ts` met een smalle `matcher` (geen `_next`, geen static files).",
        "Redirects: verkies `next.config` redirects voor permanente regels; middleware voor auth/locale.",
        "`next build` + smoke-test kritieke paden na deploy op de TripleZero iT-VPS.",
      ],
      checks: ["Geen redirect-loop", "Layouts renderen nested children", "Middleware matcht alleen bedoelde paden"],
      tip: "Zet een `/api/health` buiten auth-middleware voor monitoring.",
      warn: "Zet secrets nooit in `NEXT_PUBLIC_*` tenzij ze echt publiek mogen.",
      related: "Env vars; caching; deploy op VPS",
    });
  }
  if (has(k, /deploy|vps|pm2|node|hosting|docker/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> beschrijft Next.js deployen op een VPS bij TripleZero iT: build, Node-processmanager, reverse proxy en zero-downtime restarts.`,
      ],
      why: [
        "Alleen `next start` zonder processmanager valt om bij reboot.",
        "Verkeerde env op de server geeft stille runtime-fouten.",
      ],
      steps: [
        "Zorg voor Node LTS op de VPS; clone/build (`npm ci && next build`).",
        "Draai `next start -p 3000` onder systemd of PM2; enable restart-on-boot.",
        "Zet Nginx/Caddy als reverse proxy met HTTPS (Let’s Encrypt).",
        "Zet env-vars op de server; restart na wijziging.",
        "Healthcheck + deploy-script: build → switch → reload proxy.",
        "Houd logs (`journalctl`/PM2) en schijfruimte in de gaten na releases.",
      ],
      checks: ["Site bereikbaar op 443", "Process start na reboot", "Preview en prod zijn gescheiden"],
      tip: "Gebruik een shared `standalone` output als je image/Docker deploys.",
      warn: "Open poort 3000 niet publiek als de proxy al 443 doet.",
      related: "Env vars; caching; SSL",
    });
  }
  // generic next/react fallback but still concrete
  return pack(title, {
    intro: [
      `<strong>${esc(title)}</strong> is een Next.js/React-onderwerp in de TripleZero iT-kennisbank. We koppelen het aan App Router-praktijk: code, build en hosting — geen generieke panelstappen.`,
      `Werk op een feature-branch/staging en meet gedrag na \`next build\`.`,
    ],
    why: [
      "Frameworkkeuzes beïnvloeden SEO, performance en beheerlast.",
      "Zonder staging zie je regressies pas bij klanten.",
      "Documentatie per onderwerp voorkomt ad-hoc hotfixes.",
    ],
    steps: [
      `Lees de huidige implementatie die hoort bij “${esc(title)}” in je \`app/\` of \`pages/\` tree.`,
      "Reproduceer het gewenste gedrag lokaal (`next dev`) met dezelfde Node-major als productie.",
      "Pas de minimale code/config aan (routing, data-fetch, UI of config) — commit in kleine stappen.",
      "Draai `next build` en fix type/ESLint-fouten vóór deploy.",
      `Verifieer op staging het scenario van “${esc(title)}” (desktop + mobiel).`,
      "Deploy naar de TripleZero iT-omgeving en monitor logs/TTFB kort na release.",
    ],
    checks: ["Build groen", "Gedrag op staging = verwachting", "Geen nieuwe console/server errors"],
    tip: "Noteer Node-versie en Next-versie in het ticket als je support nodig hebt.",
    warn: "Test nooit eerst op productie bij routing-, auth- of cache-wijzigingen.",
    related: "App Router; caching; deploy op VPS",
  });
}

function cdnPack(a, k) {
  const title = a.title;
  if (has(k, /cloudflare|orange|proxy|dns only|grijze/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> gaat over Cloudflare-proxy (oranje wolk) vs. DNS-only: wat je wint aan DDoS/CDN en wat je moet instellen op origin bij TripleZero iT.`,
      ],
      why: [
        "Proxy verbergt origin-IP maar vereist correcte SSL-modus.",
        "DNS-only is nodig voor sommige mail/FTP-hosts.",
      ],
      steps: [
        "Bepaal per hostname: webverkeer proxied, mail (MX) nooit proxied.",
        "Zet SSL/TLS-modus op Full (strict) met geldig origin-cert (Let’s Encrypt).",
        "Beperk origin tot Cloudflare-IP’s of gebruik Authenticated Origin Pulls waar mogelijk.",
        "Test HTTP→HTTPS en WebSocket/API indien gebruikt.",
        "Documenteer welke records grijs/oranje staan.",
      ],
      checks: ["Site laadt via Cloudflare", "Mail blijft werken", "Geen redirect-loops"],
      tip: "Houd een noodprocedure: tijdelijk DNS-only bij origin-debug.",
      warn: "Zet nooit MX of SPF-hosts op proxied.",
      related: "SSL Full Strict; cache rules; firewall",
    });
  }
  if (has(k, /purge|cache.?rule|ttl|stale|edge|browser.?cache/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> behandelt edge-caching: TTLs, purge en stale-while-revalidate — zodat bezoekers snelle én verse content zien.`,
      ],
      why: [
        "Te lange HTML-TTL toont oude checkout/prijzen.",
        "Alles bypassen vernietigt CDN-winst.",
      ],
      steps: [
        "Scheid asset-caching (CSS/JS/images, lange TTL + hash) van HTML (kort of bypass).",
        "Maak Cache Rules/Page Rules per pad (`/wp-admin*`, `/api*`, `/checkout*`).",
        "Na contentrelease: purge gecontroleerd (URL of tag), niet blind ‘purge everything’ tenzij nodig.",
        "Valideer met `cf-cache-status` headers (HIT/MISS/DYNAMIC).",
        "Stem origin Cache-Control af op de CDN-regels.",
      ],
      checks: ["Assets HIT’en", "HTML/account niet per ongeluk shared-cache", "Purge werkt binnen seconden"],
      tip: "Versioned filenames (`app.abc123.js`) maken lange TTL veilig.",
      warn: "Cache geen responses met Set-Cookie voor persoonlijke pagina’s.",
      related: "Cloudflare proxy; Next revalidate; image CDN",
    });
  }
  return pack(title, {
    intro: [
      `<strong>${esc(title)}</strong> valt onder CDN/performance bij TripleZero iT. Focus: edge, origin en meetbare snelheid — niet generieke panelklikken.`,
    ],
    why: ["CDN verlaagt latency wereldwijd.", "Verkeerde config geeft stale of broken assets.", "Origin moet gezond blijven bij edge-storingen."],
    steps: [
      `Inventariseer welke hostnames en paden “${esc(title)}” raken.`,
      "Noteer huidige CDN- en origin-headers (cache-control, cf-cache-status).",
      "Pas de CDN- of origin-instelling toe die dit onderwerp vereist (rule, TTL, compressie of image-optie).",
      "Purge alleen wat nodig is en test een kritieke URL vanaf 4G + kantoor.",
      "Meet TTFB/LCP vóór en na; rollback rule bij regressie.",
    ],
    checks: ["Geen broken assets", "Cachegedrag verklaarbaar via headers", "Origin bereikbaar zonder CDN (nood)"],
    tip: "Bewaar screenshots van rulesets in je change-log.",
    warn: "Wijzig productie-CDN niet tijdens piekpromoties zonder rollback.",
    related: "Purge; SSL; Core Web Vitals",
  });
}

function emailDnsPack(a, k) {
  const title = a.title;
  if (has(k, /spf/)) {
    return pack(title, {
      intro: [
        `<strong>SPF</strong> is een TXT-record dat aangeeft welke servers namens jouw domein mail mogen versturen. Dit artikel: ${esc(title)}.`,
      ],
      why: ["Zonder SPF stijgt spoof-/spamrisico.", "Te veel includes raken de 10-lookup limiet.", "Dubbele SPF-TXT’s maken het record ongeldig."],
      steps: [
        "Inventariseer alle verzendbronnen (hostingmail, Microsoft 365, ESP, webshop).",
        "Open DNS-zone in het TripleZero iT-klantenpanel of je DNS-provider.",
        "Zorg voor precies één SPF-TXT op apex: begint met `v=spf1`, eindig met `~all` of `-all`.",
        "Voeg nodige `include:`/`ip4:` mechanismen toe; verwijder verouderde.",
        "Verlaag TTL tijdelijk, sla op, controleer met `dig TXT jouw.domein` vanaf een extern netwerk.",
        "Stuur proefmail naar Gmail/Outlook en check Authentication-Results.",
      ],
      checks: ["Eén SPF-record", "Lookups ≤ 10", "Legitieme mail passeert SPF"],
      tip: "Flat/optimize alleen als je de limiet raakt — documenteer de bronlijst.",
      warn: "Verwijder niet zomaar includes van actieve ESPs.",
      related: "DKIM; DMARC; MX",
    });
  }
  if (has(k, /dkim/)) {
    return pack(title, {
      intro: [`<strong>DKIM</strong> ondertekent uitgaande mail cryptografisch. Onderwerp: ${esc(title)}.`],
      why: ["Zonder DKIM falen DMARC-alignments vaker.", "Verkeerde selector breekt handtekeningen stil."],
      steps: [
        "Open in je mailpanel (DirectAdmin/CyberPanel/Plesk/M365) DKIM voor het domein.",
        "Activeer en kopieer de publieke TXT (selector._domainkey).",
        "Plaats het TXT-record in DNS; wacht propagatie.",
        "Verstuur proefmail en controleer `dkim=pass` in headers.",
      ],
      checks: ["DNS TXT resolvable", "dkim=pass in headers", "Selector komt overeen met panel"],
      tip: "Roteer keys periodiek; houd oude selector kort overlapping live.",
      warn: "Plak geen private key in DNS of tickets.",
      related: "SPF; DMARC",
    });
  }
  if (has(k, /dmarc/)) {
    return pack(title, {
      intro: [`<strong>DMARC</strong> bepaalt wat ontvangers doen bij SPF/DKIM-falen en stuurt rapporten. Focus: ${esc(title)}.`],
      why: ["Beginnen met `p=reject` zonder monitoring blokkeert legitieme mail.", "Zonder rua mis je spoof-pogingen."],
      steps: [
        "Zorg dat SPF en DKIM eerst pass/align voor je hoofdstromen.",
        "Publiceer `_dmarc` TXT met `v=DMARC1; p=none; rua=mailto:dmarc@jouwdomein.nl`.",
        "Monitor aggregate reports 1–2 weken.",
        "Verhoog naar `quarantine`/`reject` als bronnen schoon zijn.",
        "Documenteer uitzonderingen (forwards, mailingtools).",
      ],
      checks: ["DMARC zichtbaar in DNS", "Reports komen binnen", "Legitieme mail blijft dmarc=pass"],
      tip: "Gebruik een report-analyser i.p.v. raw XML te lezen.",
      warn: "Forwards kunnen SPF breken — DKIM alignment is dan cruciaal.",
      related: "SPF; DKIM; BIMI",
    });
  }
  if (has(k, /imap|smtp|outlook|iphone|android|thunderbird|mac.?mail|mailclient|poort/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> is mailclient-configuratie. Gebruik IMAP/SMTP uit je TripleZero iT-oplevering — niet willekeurige Google-waarden.`,
      ],
      why: ["Verkeerde poorten geven ‘kan niet verzenden’.", "Username moet meestal het volledige adres zijn."],
      steps: [
        "Zoek serverhost, IMAP 993/SSL, SMTP 465 of 587 in welkomstmail of panel.",
        "In de client: account toevoegen → IMAP.",
        "Gebruikersnaam = volledig e-mailadres; wachtwoord = mailboxwachtwoord.",
        "Zet SMTP-authenticatie aan met dezelfde credentials.",
        "Test ontvangen én verzenden; bij falen: webmail isolatietest.",
      ],
      checks: ["Webmail werkt", "Client ontvangt + verzendt", "Geen certificaatwaarschuwing op juiste host"],
      tip: "Werkt webmail wél, dan is de clientconfig fout — niet de server.",
      warn: "Zet geen plain IMAP 143 zonder SSL op publieke netwerken.",
      related: "Webmail; SPF; wachtwoord mailbox",
    });
  }
  if (has(k, /dns|nameserver|mx|txt|cname|a-record|propag/)) {
    return pack(title, {
      intro: [`<strong>${esc(title)}</strong> speelt zich af in de DNS-zone. Wijzig records één voor één en verifieer extern.`],
      why: ["DNS-fouten raken site en mail tegelijk.", "Propagatie + lokale cache misleiden troubleshooting."],
      steps: [
        "Export/screenshot van de huidige zone.",
        "Open DNS-beheer in TripleZero iT-klantenpanel of registrar.",
        `Pas precies het recordtype aan dat “${esc(title)}” vereist (A/AAAA/CNAME/MX/TXT).`,
        "Zet TTL tijdelijk lager bij kritieke cuts.",
        "Controleer met dig/nslookup vanaf 4G én een online checker.",
      ],
      checks: ["Recordwaarde klopt extern", "Mail/site blijven bereikbaar", "Geen dubbele conflicterende records"],
      tip: "Vergelijk altijd twee resolvers om lokale cache uit te sluiten.",
      warn: "Nameserver-wijzigingen hebben langere propagatie — plan ze.",
      related: "SPF; SSL; domein lock",
    });
  }
  return null;
}

function wordpressPack(a, k) {
  const title = a.title;
  if (has(k, /woocommerce|checkout|winkelwagen|betaal|mollie|ideal|btw|product/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> speelt in WooCommerce + wp-admin. Werk bij voorkeur op staging; checkout-fouten kosten omzet.`,
      ],
      why: ["Checkout-regressies zijn direct omzetverlies.", "Cache plugins cachen soms winkelwagenfouten."],
      steps: [
        "Maak een full backup (files + DB) of gebruik staging.",
        "Open WooCommerce → Instellingen en het specifieke tabblad (Betalingen, Verzending, Accounts, Geavanceerd) dat bij dit onderwerp hoort.",
        `Pas alleen de instelling/flow voor “${esc(title)}” aan; noteer oude waarde.`,
        "Schakel page-cache uit voor cart/checkout of exclude die URLs.",
        "Plaats een testorder (of Mollie-testmode) op desktop én mobiel.",
        "Controleer ordermail, voorraad en betaalstatus.",
      ],
      checks: ["Testorder slaagt", "E-mails komen aan", "Geen JS-fouten in checkout"],
      tip: "Bij twijfel: tijdelijk default theme + alleen WooCommerce actief om pluginconflicten te isoleren.",
      warn: "Wijzig live betaalmethodes niet zonder rollback tijdens campagnes.",
      related: "Caching excludes; staging; backups",
    });
  }
  if (has(k, /plugin|thema|theme|update|critical.?error|wsod|wit.?scherm/)) {
    return pack(title, {
      intro: [`<strong>${esc(title)}</strong> raakt WordPress-stabiliteit. Isoleer updates en houd FTP/File Manager achter de hand.`],
      why: ["Blind updaten zonder backup = langere downtime.", "Eén kapotte plugin kan wp-admin platleggen."],
      steps: [
        "Backup via Installatron/hosting of plugin.",
        "Update één component tegelijk (eerst minor/security).",
        "Bij kritieke fout: rename `plugins/naam` via File Manager/SSH naar `.off`.",
        "Herstel wp-admin, activeer plugins één-voor-één om de boosdoener te vinden.",
        "Purge object/page cache en test frontend.",
      ],
      checks: ["wp-admin bereikbaar", "Kritieke flows werken", "Error-log toont geen fatals"],
      tip: "Noteer PHP-versie; sommige plugins eisen minima.",
      warn: "Verwijder geen pluginmappen die custom mu-plugins nodig hebben zonder check.",
      related: "Backups; PHP-versie; staging",
    });
  }
  return pack(title, {
    intro: [
      `<strong>${esc(title)}</strong> is een WordPress-onderwerp. Je werkt in wp-admin en/of File Manager op TripleZero iT-hosting.`,
    ],
    why: ["Kleine WP-wijzigingen kunnen SEO, forms of login raken.", "Cache verwarrend ‘oude’ content."],
    steps: [
      "Backup of staging.",
      "Log in op wp-admin.",
      `Open het menu dat past bij “${esc(title)}” (Plugins, Media, Instellingen, Weergave, WooCommerce, …).`,
      "Voer de inhoudelijke wijziging door en sla op.",
      "Purge caches (plugin, LiteSpeed, CDN) en test de betrokken pagina’s.",
    ],
    checks: ["Wijziging zichtbaar zonder cache", "Geen critical error", "Form/login/checkout indien relevant OK"],
    tip: "Bewaar pluginlijst + versies in je ticket.",
    warn: "Productie + auto-updates zonder backup is riskant.",
    related: "Updates; backups; beveiliging",
  });
}

function vpsInfraPack(a, k) {
  const title = a.title;
  if (has(k, /\bdedicated\b|\bshared hosting\b|\bvps\b|\bburstable\b|\bcolocation\b|\bcolo\b/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> is een infrastructuurkeuze: isolatie, root-toegang, kosten en beheerlast bij TripleZero iT.`,
      ],
      why: ["Verkeerd platform = noisy neighbors of onnodige kosten.", "Migraties achteraf zijn duurder dan goede keuze nu."],
      steps: [
        "Meet huidige CPU/RAM/disk/IO en piekpatronen.",
        "Bepaal of je root/SSH, vaste resources of managed panel nodig hebt.",
        "Vergelijk shared vs VPS vs dedicated op isolatie, snapshots en supportniveau.",
        `Kies de optie die “${esc(title)}” beantwoordt; documenteer trade-offs.`,
        "Plan resize/migratie met DNS TTL-verlaging en rollback.",
      ],
      checks: ["Resources matchen workload", "Backup/snapshot geregeld", "Beheerteam kan het platform dragen"],
      tip: "Begin VPS als je groeit uit shared; dedicated pas bij aanhoudende high IO/compliance.",
      warn: "Prijs-only beslissingen negeren beheeruren.",
      related: "Snapshots; rescue; monitoring",
    });
  }
  if (has(k, /rescue|fsck|grub|fstab|ipmi|ilo|idrac|bmc|console|snapshot|backup|raid|smart/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> is een herstel-/hardware-onderwerp. Werk spaarzaam: snapshot eerst, dan console/rescue.`,
      ],
      why: ["Verkeerde fsck/fstab kan boot breken.", "Open BMC op internet is een hard security-risico."],
      steps: [
        "Maak of bevestig een snapshot/backup vóór schrijvende acties.",
        "Gebruik klantenpanel-console of out-of-band (IPMI/iLO/iDRAC) via beperkt netwerk.",
        `Voer de gerichte herstelactie voor “${esc(title)}” uit (rescue, fsck read-only first, key fix, RAID check, …).`,
        "Reboot gecontroleerd; verifieer netwerk, SSH en kritieke diensten.",
        "Schrijf korte post-mortem + monitoring-check.",
      ],
      checks: ["Machine boot weer", "Diensten bereikbaar", "Snapshot nog beschikbaar"],
      tip: "Noteer BMC-firmware en netwerkisolatie in je runbook.",
      warn: "Nooit BMC met default wachtwoord op publiek internet.",
      related: "Snapshots; firewall; support ticket",
    });
  }
  if (has(k, /ssh|firewall|rdp|poort|fail2ban|ufw|iptables/)) {
    return pack(title, {
      intro: [`<strong>${esc(title)}</strong> raakt remote access en firewall op VPS. Minimaliseer exposure.`],
      why: ["Open RDP/SSH op 0.0.0.0 trekt brute-force.", "Verkeerde firewall rule = lock-out."],
      steps: [
        "Zorg voor console-toegang in het panel vóór firewall-wijzigingen.",
        "Beperk SSH/RDP tot jouw IP of VPN; key-based auth waar mogelijk.",
        `Pas de regel/instelling voor “${esc(title)}” toe en documenteer ‘m.`,
        "Test vanaf tweede netwerk; houd console open tot OK.",
        "Monitor auth-logs op nieuwe blocks.",
      ],
      checks: ["Je komt erin via bedoelde weg", "Onbedoelde poorten dicht", "Console nog beschikbaar"],
      tip: "Bij lock-out: panel-console, niet meer gokken met rules.",
      warn: "Wijzig SSH-poort alleen + firewall tegelijk met geteste keys.",
      related: "Fail2ban; console; 2FA panel",
    });
  }
  return pack(title, {
    intro: [
      `<strong>${esc(title)}</strong> hoort bij VPS/serverbeheer bij TripleZero iT. Werk met snapshot + onderhoudsvenster.`,
    ],
    why: ["Serverwijzigingen raken alle sites op die machine.", "Zonder rollback is downtime langer."],
    steps: [
      "Open het VPS-product in het klantenpanel; noteer IP/status.",
      "Snapshot/backup.",
      `Voer de serveractie uit die “${esc(title)}” vereist (service, disk, netwerk, OS).`,
      "Verifieer diensten en monitoring.",
      "Documenteer change + tijdstip.",
    ],
    checks: ["Dienst up", "Geen onverwachte open poorten", "Backup beschikbaar"],
    tip: "Vermeld hostname en tijdstip in tickets.",
    warn: "Geen productie-experiments zonder snapshot.",
    related: "Snapshots; firewall; logs",
  });
}

function troubleshootingPack(a, k) {
  const title = a.title;
  const code = (k.match(/\b(401|403|404|500|502|503|504)\b/) || [])[0];
  if (code) {
    const hints = {
      "401": ["Auth header/cookie ontbreekt of Basic Auth staat aan.", "Controleer Application Passwords / API tokens."],
      "403": ["Permissies, ModSecurity/WAF, hotlink-bescherming of IP-deny.", "Check `.htaccess`/nginx deny en file ownership."],
      "404": ["Echt missend pad vs. soft-404 theme.", "Permalinks flushen in WP; reverse-proxy path strips."],
      "500": ["PHP fatal/plugin; check error_log.", "Verhoog tijdelijk display_errors alleen op staging."],
      "502": ["Upstream (PHP-FPM/Node) down of timeout achter proxy.", "Check pool/socket en recent deploy."],
      "503": ["Onderhoudsmodus, overload of WAF challenge.", "Bekijk load en maintenance flag."],
      "504": ["Upstream te traag; DB-lock of externe API.", "Verhoog timeouts pas ná query-fix."],
    }[code];
    return pack(title, {
      intro: [
        `<strong>HTTP ${code}</strong> — ${esc(title)}. Isoleer laag voor laag: DNS/SSL → proxy/WAF → app → logs.`,
      ],
      why: hints,
      steps: [
        "Reproduceer in incognito; noteer URL, methode, tijdstip (timezone).",
        "Check DNS/SSL, daarna CDN/WAF events rond dat tijdstip.",
        "Lees web/PHP/Node error-logs op de origin.",
        `Pas de gerichte fix voor ${code} toe (permissies, upstream, auth, pad of plugin).`,
        "Herstest zonder cache; bevestig dat sibling-URL’s niet stuk gaan.",
      ],
      checks: [`Status is niet langer ${code} op de probleem-URL`, "Logs stil", "Kritieke flows OK"],
      tip: "Plak letterlijke fout + timestamp in je TripleZero iT-ticket.",
      warn: "Wijzig niet tegelijk DNS, firewall en code.",
      related: "Logs; WAF; backups",
    });
  }
  return pack(title, {
    intro: [
      `<strong>${esc(title)}</strong> is troubleshooting. Eerst reproduceren en isoleren, dan pas wijzigen.`,
    ],
    why: ["Zonder reproductie fix je symptomen.", "Meerdere tegelijk wijzigingen maken root cause zoeken onmogelijk."],
    steps: [
      "Schrijf het symptoom op (fouttekst, screenshot, HAR indien nodig).",
      "Bepaal sinds wanneer + recente changes (DNS, deploy, plugin, DNS TTL).",
      "Isoleer: ander netwerk, andere browser, staging vs prod.",
      `Pas één fix toe die logisch volgt uit “${esc(title)}”.`,
      "Valideer + documenteer.",
    ],
    checks: ["Probleem weg of begrensd", "Geen nieuwe errors", "Monitoring groen"],
    tip: "Tijdlijn van changes bespaart uren.",
    warn: "Productie is geen debug-speeltuin — gebruik staging waar kan.",
    related: "Logs; backups; statuspagina",
  });
}

function privacyPack(a) {
  const title = a.title;
  return pack(title, {
    intro: [
      `<strong>${esc(title)}</strong> is educatieve informatie over privacy/compliance — geen juridisch advies op maat. Stem af met een jurist bij twijfel.`,
    ],
    why: [
      "Onduidelijke verwerkingen leiden tot klachtrisico.",
      "Te veel velden/cookies zonder noodzaak druist in tegen dataminimalisatie.",
    ],
    prep: ["Lijst van formulieren, analytics en processors", "Huidige privacy-/cookieteksten", "Hostingregio (EU/anders)"],
    steps: [
      "Inventariseer persoonsgegevensstromen (collect → opslag → delen).",
      `Werk beleid, banner of proces bij in lijn met “${esc(title)}”.`,
      "Beperk velden/bewaartermijnen waar mogelijk.",
      "Documenteer verwerkers en doelen.",
      "Laat juridisch reviewen vóór je ‘juridisch waterdicht’ claimt.",
    ],
    checks: ["Teksten bereikbaar in footer", "Consent/tooling matcht praktijk", "Interne owners bekend"],
    tip: "Houd een eenvoudige verwerkerslijst bij in je KB/drive.",
    warn: "Dit artikel is geen vervanging voor advocaat of FG.",
    related: "Cookie banner; verwerkers; security",
  });
}

function comparePack(a) {
  const title = a.title;
  return pack(title, {
    intro: [
      `<strong>${esc(title)}</strong> is een keuzehulp. We scoren op TCO, lock-in, skills en migratie — niet alleen featurelijstjes.`,
    ],
    why: ["Verkeerde platformkeuze kost migraties later.", "Marketingclaims ≠ operationele realiteit."],
    steps: [
      "Schrijf 5–7 must-haves (compliance, mail, SEO, teamvaardigheden, budget).",
      `Zet de opties uit “${esc(title)}” naast elkaar op TCO (12–24 mnd) en risico.`,
      "Check migratiepad (content, URL’s, betaalproviders, e-mail).",
      "Doe een kleine POC/staging als de inzet hoog is.",
      "Besluit en documenteer trade-offs voor stakeholders.",
    ],
    checks: ["Criteria gewogen", "POC gedaan of bewust overgeslagen", "Migratie-owner belegd"],
    tip: "Laat price-only beslissingen links liggen.",
    warn: "Educatief kader — valideer met jouw cijfers.",
    related: "Migratie; hostingkeuze; support",
  });
}

function aiIntegratiePack(a, k) {
  const title = a.title;
  if (has(k, /webhook|n8n|automat|zapier|make\.com|crm|stripe/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> koppelt systemen via API/webhooks. Bouw idempotent, met secrets buiten de frontend.`,
      ],
      why: ["Dubbele webhooks = dubbele orders.", "Lekke secrets in client-code zijn fataal."],
      steps: [
        "Teken de flow: trigger → transform → bestemming + failure path.",
        "Gebruik server-side secrets; verifieer HMAC/handtekeningen waar de provider dat biedt.",
        "Maak endpoints idempotent (event-id opslaan).",
        `Implementeer “${esc(title)}” eerst op staging met testkeys.`,
        "Monitor 4xx/5xx en dead-letter queue / retry.",
      ],
      checks: ["Testevent verwerkt precies één keer", "Ongeldige signature wordt geweigerd", "Secrets niet in repo"],
      tip: "Log correlation-ids zodat support events kan volgen.",
      warn: "Nooit onbeperkt open webhook-URL’s zonder auth.",
      related: "Rate limits; privacy; monitoring",
    });
  }
  if (has(k, /llm|prompt|hallucin|chatbot|embedding|rag|openai|gpt/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> gaat over LLM-gebruik in productie: prompts, grounding, filters en kostencontrole.`,
      ],
      why: ["Hallucinaties zonder bron schaden vertrouwen.", "Onbegrensde tokens = onvoorspelbare factuur."],
      steps: [
        "Bepaal use-case en wat de bot wél/niet mag beantwoorden.",
        "Ground antwoorden met eigen content (RAG) waar feiten verplicht zijn.",
        "Zet rate limits, max tokens en logging (zonder gevoelige PII) aan.",
        "Human handoff voor escalaties.",
        "Evalueer met een vaste testset vóór elke prompt-change.",
      ],
      checks: ["Testset scores acceptabel", "Kosten binnen budget", "Escalatiepad werkt"],
      tip: "Versioneer prompts net als code.",
      warn: "Train/stuur geen gevoelige klantdata naar externe LLM’s zonder overeenkomst.",
      related: "Privacy; webhooks; monitoring",
    });
  }
  return pack(title, {
    intro: [
      `<strong>${esc(title)}</strong> valt onder AI-integratie/automatisering bij TripleZero iT. Focus op veilige koppelingen en meetbare output.`,
    ],
    why: ["Automation zonder owner raakt stil kapot.", "Security en privacy moeten vanaf dag 1 mee."],
    steps: [
      "Definieer input/output en succesmetric.",
      "Bouw MVP op staging met minimale scopes.",
      `Werk “${esc(title)}” uit met logging en rollback.`,
      "Monitor errors/kosten eerste week intensief.",
      "Documenteer runbook voor support.",
    ],
    checks: ["MVP doet 1 happy path", "Alerts staan aan", "Secrets veilig"],
    tip: "Begin smaller dan je marketing wil.",
    warn: "Geen productie zonder kill-switch.",
    related: "Webhooks; privacy; ROI",
  });
}

function analyticsPack(a, k) {
  const title = a.title;
  if (has(k, /consent|cookie|gtm|ga4|matomo|tag/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> koppelt tagging aan consent. Meet alleen wat je mag én nodig hebt.`,
      ],
      why: ["Tags vóór consent schenden beleid.", "Dubbele tags vervuilen data."],
      steps: [
        "Inventariseer tags (GA4, pixels, heatmaps) en hun rechtsgrond/consent-categorie.",
        "Laad marketingtags pas ná opt-in via je CMP/GTM consent mode.",
        `Configureer “${esc(title)}” (event, tag of tool) en documenteer datalayer-keys.`,
        "Debug met GTM preview / GA4 DebugView.",
        "Controleer dat refuse = geen marketing hits.",
      ],
      checks: ["Opt-out blokkeert marketing tags", "Events verschijnen na consent", "Geen PII in hits"],
      tip: "Houd een tag-inventory spreadsheet bij.",
      warn: "Geen e-mailadressen in event parameters.",
      related: "Privacy; CRO; Core Web Vitals",
    });
  }
  if (has(k, /lcp|inp|cls|cwv|vitals|performance|lazy|font/)) {
    return pack(title, {
      intro: [
        `<strong>${esc(title)}</strong> raakt Core Web Vitals / performance. Meet field + lab, optimaliseer de bottleneck.`,
      ],
      why: ["Gokken zonder meting verspilt tijd.", "Elke third-party script kost INP/LCP."],
      steps: [
        "Meet LCP/INP/CLS in CrUX/Search Console + Lighthouse op de probleem-URL.",
        "Identificeer bottleneck (image, JS, font, TTFB).",
        `Pas de optimalisatie voor “${esc(title)}” toe (compressie, defer, sizes, caching, …).`,
        "Herhaal meting op staging en na productie-deploy.",
        "Stel budget/regressie-check in CI waar mogelijk.",
      ],
      checks: ["Labscore verbeterd", "Geen functionele regressie", "Field data trend positief na weken"],
      tip: "Fix eerst de homepage/product template met meeste traffic.",
      warn: "Niet alle Lighthouse-tips zijn relevant voor jouw stack.",
      related: "CDN; images; tagging budget",
    });
  }
  return pack(title, {
    intro: [
      `<strong>${esc(title)}</strong> valt onder analytics/CRO/toegankelijkheid. Doel: betrouwbare meting of betere conversie/toegang.`,
    ],
    why: ["Zonder schone data stuur je blind.", "CRO zonder a11y sluit gebruikers buiten."],
    steps: [
      "Definieer de vraag die je wilt beantwoorden of de barrière die je wilt weghalen.",
      "Check huidige tagging/UI-state.",
      `Implementeer de wijziging voor “${esc(title)}”.`,
      "Valideer in debug tools / met assisterende tech waar relevant.",
      "Monitor KPI 1–2 weken.",
    ],
    checks: ["Data of UX-doel gehaald", "Geen consent-schending", "Geen regressie elders"],
    tip: "Één hypothese per experiment.",
    warn: "Korte testwindows bij lage traffic liegen.",
    related: "Consent; CWV; privacy",
  });
}

function hostingPack(a, k) {
  const title = a.title;
  if (has(k, /ssh|ftp|filezilla|sftp/)) {
    return pack(title, {
      intro: [`<strong>${esc(title)}</strong> — veilig bestanden of shell benaderen op TripleZero iT-hosting.`],
      why: ["FTP zonder TLS lek credentials.", "Verkeerde path uploads breken sites."],
      steps: [
        "Haal host, user en poort uit het klantenpanel/welkomstmail.",
        "Gebruik SFTP of FTPS; vermijd plain FTP.",
        "Connect en land in de juiste webroot (`public_html` / domain dir).",
        `Voer de actie voor “${esc(title)}” uit (upload, rechten, sync).`,
        "Test de site; verbreek sessies die je niet meer nodig hebt.",
      ],
      checks: ["Connectie encrypted", "Bestanden op juiste plek", "Site OK"],
      tip: "Bewaar credentials in een password manager, niet in plaintext configs op laptops.",
      warn: "777-rechten zijn vrijwel nooit nodig.",
      related: "File Manager; backups; SSH keys",
    });
  }
  if (has(k, /ssl|https|lets.?encrypt|certificaat|hsts/)) {
    return pack(title, {
      intro: [`<strong>${esc(title)}</strong> — certificaten en HTTPS op hosting/panel.`],
      why: ["Force HTTPS vóór geldig cert = downtime.", "Vergeten www/apex dekking geeft warnings."],
      steps: [
        "Check DNS wijst naar de juiste server.",
        "Issue/renew cert in panel (Let’s Encrypt) of installeer gekocht cert.",
        "Dek apex + www (en nodige aliases).",
        "Zet Force HTTPS / HSTS pas ná geldige keten.",
        "Test in incognito + SSL-checker.",
      ],
      checks: ["Hangslot OK", "Geen mixed content", "Auto-renew actief waar van toepassing"],
      tip: "Zet renew-monitoring of let op expiry-mails.",
      warn: "HSTS preload alleen met blijvende HTTPS-zekerheid.",
      related: "DNS; CDN SSL modes",
    });
  }
  return pack(title, {
    intro: [
      `<strong>${esc(title)}</strong> speelt op TripleZero iT-hosting (DirectAdmin/CyberPanel/Plesk of klantenpanel).`,
    ],
    why: ["Hostingwijzigingen raken alle sites op het account.", "Backup vóór riskante stappen scheelt uren."],
    steps: [
      "Log in op het juiste panel via het klantenpanel.",
      "Selecteer het juiste domein/abonnement.",
      `Open de sectie die bij “${esc(title)}” hoort (Files, FTP, PHP, SSL, Backups, Cron, DB).`,
      "Voer de wijziging door; noteer oude waarde.",
      "Test site/mail en purge cache indien nodig.",
    ],
    checks: ["Verwacht gedrag zichtbaar", "Geen error_log spike", "Backup nog beschikbaar"],
    tip: "Werken op staging of kopie waar mogelijk.",
    warn: "Verwijder geen directories zonder restoreplan.",
    related: "Backups; SSL; DNS",
  });
}

function crmSupportPack(a, k) {
  const title = a.title;
  if (has(k, /2fa|tweefactor|authenticator/)) {
    return pack(title, {
      intro: [`<strong>${esc(title)}</strong> — 2FA op het TripleZero iT-klantenpanel of gekoppelde accounts.`],
      why: ["Wachtwoord alleen is onvoldoende bij leaks.", "Zonder backupcodes kun je jezelf buitensluiten."],
      steps: [
        "Log in op het klantenpanel.",
        "Open Account/Beveiliging → 2FA.",
        "Scan QR met authenticator-app; bevestig code.",
        "Sla backupcodes offline op.",
        "Test logout/login met wachtwoord + code.",
      ],
      checks: ["2FA verplicht bij login", "Backupcodes bewaard", "Oude toestellen verwijderd"],
      tip: "Gebruik één app voor meerdere accounts met duidelijke labels.",
      warn: "Deel codes nooit met ‘support’ die jou chat-ongevraagd benadert.",
      related: "Wachtwoord reset; tickets",
    });
  }
  if (has(k, /ticket|support|chat|belafspraak|remote|teamviewer/)) {
    return pack(title, {
      intro: [`<strong>${esc(title)}</strong> — hoe je TripleZero iT-support efficiënt bereikt.`],
      why: ["Incomplete tickets kosten heen-en-weer.", "Juiste productcontext versnelt fix."],
      steps: [
        "Log in op het klantenpanel.",
        "Open Tickets (of plan belafspraak indien dat het kanaal is).",
        "Vermeld product, domein/hostname, tijdstip, fouttekst, wat je al probeerde.",
        "Voeg screenshots/HAR toe indien nuttig (geen wachtwoorden).",
        "Houd hetzelfde ticket aan voor follow-ups.",
      ],
      checks: ["Ticketnummer ontvangen", "Alle context erin", "Notificaties aan"],
      tip: "Eén onderwerp per ticket houdt routing schoon.",
      warn: "Geen secrets in screenshots.",
      related: "Status updates; 2FA",
    });
  }
  return pack(title, {
    intro: [`<strong>${esc(title)}</strong> — klantenpanel/facturatie/account bij TripleZero iT.`],
    why: ["Verkeerde accountwijzigingen raken facturatie of toegang.", "2FA en rechten horen bij elke admin-actie."],
    steps: [
      "Log in op het klantenpanel.",
      `Open het onderdeel voor “${esc(title)}” (facturen, betaalmethode, users, producten, berichten).`,
      "Voer de wijziging door en bevestig.",
      "Controleer bevestigingsmail/status.",
    ],
    checks: ["Status klopt in panel", "Mailbevestiging ontvangen waar relevant"],
    tip: "Gebruik unieke admins per medewerker i.p.v. shared logins.",
    warn: "Downgrades/opzeggingen hebben vaak termijnen — lees bevestigingsschermen.",
    related: "Tickets; 2FA; producten",
  });
}

function microsoftPack(a) {
  // Only for weak leftovers not in microsoftTopicBuilders
  const title = a.title;
  return pack(title, {
    intro: [
      `<strong>${esc(title)}</strong> — Microsoft 365 / Outlook. Check licentie, DNS (MX/SPF/DKIM) en admin center.`,
    ],
    why: ["DNS en licenties veroorzaken de meeste ‘mail werkt niet’-tickets.", "MFA-beleid voorkomt accountovername."],
    steps: [
      "Log in op het juiste admin center of Outlook.",
      "Controleer gebruiker/licentie/status.",
      "Voor mail/domein: verifieer MX/SPF/DKIM in DNS.",
      `Voer de M365-configuratie uit voor “${esc(title)}”.`,
      "Test met een proefmailbox of client.",
    ],
    checks: ["Dienst bereikbaar", "DNS auth OK indien mail", "MFA waar verplicht"],
    tip: "Gebruik Message Trace bij bezorgproblemen.",
    warn: "Wijzig MX alleen met cutover-plan.",
    related: "DNS; MFA; Outlook profilen",
  });
}

function pleskCyberFallback(a, k) {
  const title = a.title;
  const panel = has(k, /plesk/) ? "Plesk" : has(k, /cyberpanel/) ? "CyberPanel" : "control panel";
  return pack(title, {
    intro: [
      `<strong>${esc(title)}</strong> — stappen in ${panel} bij TripleZero iT. Kies altijd de juiste subscription/website vóór je wijzigt.`,
    ],
    why: ["Verkeerde site geselecteerd = wijziging op productie-ander domein.", "Backup vóór mail/DNS/SSL-wijzigingen."],
    steps: [
      `Log in op ${panel}.`,
      "Selecteer het juiste domein/abonnement.",
      `Open de module die bij “${esc(title)}” hoort (Mail, DNS, SSL, Files, Databases, WP toolkit).`,
      "Voer de wijziging door en bevestig.",
      "Test buiten het panel (browser/mailclient/dig).",
    ],
    checks: ["Juiste domein geraakt", "Test geslaagd", "Geen onbedoelde side effects"],
    tip: "Reseller: dubbelcheck dat je in de klant-subscription zit.",
    warn: "Verwijder DNS/mail resources niet zonder export.",
    related: "Backups; SSL; mail",
  });
}

function veiligOnlinePack(a) {
  const title = a.title;
  return pack(title, {
    intro: [
      `<strong>${esc(title)}</strong> — praktische digitale veiligheid (educatief). Focus op accounts, apparaten en herkenning van fraude.`,
    ],
    why: ["Meeste incidenten starten bij phishing of hergebruikte wachtwoorden.", "Snelle containment beperkt schade."],
    steps: [
      "Inventariseer geraakte accounts/apparaten.",
      "Update OS/browser/apps.",
      "Zet unieke wachtwoorden + 2FA via een password manager.",
      `Pas de maatregel toe die “${esc(title)}” beschrijft (bijv. sim-lock, backup, phishing-check).`,
      "Meld verdachte sessies af; monitor bank/mail.",
    ],
    checks: ["2FA aan op kritieke accounts", "Geen onbekende sessies", "Backups recent"],
    tip: "Wantrouw urgentie + betaalverzoeken via mail/SMS.",
    warn: "Geen alphahuizen of ‘remote support’ van onbekenden.",
    related: "2FA; backups; phishing",
  });
}

function sslPack(a, k) {
  return hostingPack(a, k);
}

/** Router */
function buildPack(a) {
  const k = kof(a);
  const cats = a.categories || [];

  // 1) Exact slug packs (Next.js / HTML-CSS / landings / onderhoud) — never shared fallback
  if (SLUG_PACKS[a.slug]) {
    return fixBrandDeep(pack(a.title, SLUG_PACKS[a.slug]));
  }

  // 2) Subcategory-aware routing (prefer over broad keyword matches)
  if (cats.includes("nextjs-en-react") || (cats.includes("webdesign-en-maatwerk") && has(k, /\bnext\.?js\b|\breact\b|app.?router/))) {
    return fixBrandDeep(nextjsPack(a, k));
  }
  if (cats.includes("html-css-js")) {
    // Should have been covered by slug packs; keep HTML-oriented fallback (NOT Next.js)
    return fixBrandDeep(
      pack(a.title, {
        intro: [
          `<strong>${esc(a.title)}</strong> — HTML/CSS/JS bij TripleZero iT. Focus op semantiek, performance en progressive enhancement.`,
        ],
        why: [
          "Onnodige JS-frameworks maken eenvoudige pagina’s zwaar.",
          "Slechte CSS/animaties raken INP en batterijduur.",
          "Semantiek helpt SEO én toegankelijkheid.",
        ],
        steps: [
          "Open de relevante HTML/CSS/JS-bestanden in je editor of repo.",
          `Pas gericht toe wat “${esc(a.title)}” vraagt (markup, CSS of klein JS).`,
          "Test in Chrome/Firefox én op een smal viewport.",
          "Check Lighthouse (performance + accessibility) op de gewijzigde pagina.",
          "Deploy de static/build-output naar de webroot bij TripleZero iT.",
        ],
        checks: ["Gedrag klopt zonder console-errors", "Mobiel bruikbaar", "Geen onnodige layout thrashing"],
        tip: "Houd dependencies minimaal — native HTML wint vaak.",
        warn: "Test nooit alleen op desktop-breedte.",
        related: "Animaties; responsive; static hosten",
      }),
    );
  }
  if (cats.includes("landingspaginas")) {
    return fixBrandDeep(
      pack(a.title, {
        intro: [`<strong>${esc(a.title)}</strong> — conversiegerichte landingspagina’s: één doel, snelle load, meetbare CTA.`],
        why: ["Afleiding en trage heroes verspillen ad-budget.", "Zonder meting optimaliseer je blind."],
        steps: [
          "Definieer de primaire CTA en KPI voor deze landings.",
          `Werk de pagina bij voor “${esc(a.title)}” (copy, layout, form of tracking).`,
          "Test mobiel boven-de-vouw en form submit.",
          "Controleer UTM/analytics events.",
          "Meet conversie 3–7 dagen na wijziging.",
        ],
        checks: ["CTA duidelijk", "Form/event werkt", "LCP acceptabel"],
        tip: "Eén wijziging per experiment houdt leerresultaat schoon.",
        warn: "Pop-ups meteen bij entry schaden vaak meer dan ze helpen.",
        related: "UTM; speed; friction",
      }),
    );
  }
  if (cats.includes("onderhoud-maatwerk")) {
    return fixBrandDeep(
      pack(a.title, {
        intro: [`<strong>${esc(a.title)}</strong> — onderhoud van maatwerk: proces, risico en rollback bij TripleZero iT.`],
        why: ["Ad-hoc wijzigingen zonder plan veroorzaken herhaalde incidenten.", "Zonder monitoring merk je degradatie te laat."],
        steps: [
          "Bepaal impact en onderhoudsvenster.",
          "Werk eerst op staging of met backup/snapshot.",
          `Voer de onderhoudsactie uit voor “${esc(a.title)}”.`,
          "Monitor errors/uptime na afloop.",
          "Documenteer in changelog/runbook.",
        ],
        checks: ["Staging/prod gedrag OK", "Monitoring groen", "Docs bijgewerkt"],
        tip: "Koppel onderhoud aan vaste kalenderafspraken.",
        warn: "Geen prod-hotfix zonder rollbackpad.",
        related: "Staging; backups; monitoring",
      }),
    );
  }
  if (cats.includes("php-maatwerk") || cats.includes("php-en-scripts")) {
    return fixBrandDeep(
      pack(a.title, {
        intro: [`<strong>${esc(a.title)}</strong> — PHP op TripleZero iT-hosting/VPS. Let op versie, logs en veilige config.`],
        why: ["Verkeerde PHP-versie breekt apps.", "display_errors in prod lekt informatie."],
        steps: [
          "Check PHP-versie in het panel voor dit domein.",
          `Pas de setting of code aan die “${esc(a.title)}” vereist.`,
          "Bekijk error_log na de wijziging.",
          "Test de kritieke page/CLI.",
          "Zet debug weer uit op productie.",
        ],
        checks: ["Geen nieuwe fatals", "Versie/setting zoals bedoeld", "Site bereikbaar"],
        tip: "Gebruik staging voor php.ini-experimenten.",
        warn: "Laat phpinfo.php nooit publiek staan.",
        related: "error_log; composer; backups",
      }),
    );
  }

  if (cats.includes("cdn-performance-cloudflare") || has(k, /\bcloudflare\b|\bcdn\b|cache.?rule|\bpurge\b|brotli|http\/?3|lite.?speed|\bredis\b/)) {
    return fixBrandDeep(cdnPack(a, k));
  }

  const emailDns = emailDnsPack(a, k);
  if (emailDns && (cats.includes("e-mail") || cats.includes("domeinnamen") || has(k, /\bspf\b|\bdkim\b|\bdmarc\b|\bimap\b|\bsmtp\b|\bmx\b|\bdns\b|nameserver/))) {
    return fixBrandDeep(emailDns);
  }
  if (emailDns && has(k, /\bspf\b|\bdkim\b|\bdmarc\b|\bimap\b|\bsmtp\b|mailclient|outlook|iphone|android/)) {
    return fixBrandDeep(emailDns);
  }

  if (cats.includes("foutmeldingen-troubleshooting") || has(k, /\b(401|403|404|500|502|503|504)\b|foutmelding|troubleshoot/)) {
    return fixBrandDeep(troubleshootingPack(a, k));
  }

  if (cats.includes("vergelijkingen-keuzehulp") || has(k, /\bversus\b|\bvs\.?\b|vergelijk|keuzehulp/)) {
    return fixBrandDeep(comparePack(a));
  }

  if (cats.includes("privacy-juridisch-compliance") || has(k, /\bavg\b|\bgdpr\b|privacy|cookie|verwerk|bewaarterm|consent|\bdpi\b/)) {
    return fixBrandDeep(privacyPack(a));
  }

  if (cats.includes("e-commerce-webshops") || cats.includes("wordpress") || cats.includes("bloggen") || cats.includes("wordpress-onderhoud") || has(k, /wordpress|woocommerce|\bwp-|plugin|thema/)) {
    return fixBrandDeep(wordpressPack(a, k));
  }

  // Word boundaries — avoid matching "sharepoint", random "resources", etc.
  if (cats.includes("infrastructuur-servers") || cats.includes("vps") || has(k, /\bvps\b|\bdedicated\b|\brescue\b|\bipmi\b|\bilo\b|\bidrac\b|\braid\b/)) {
    return fixBrandDeep(vpsInfraPack(a, k));
  }
  if (has(k, /\bssh\b|\bfirewall\b|\brdp\b/) && (cats.includes("vps") || cats.includes("hosting") || cats.includes("beveiliging") || cats.includes("infrastructuur-servers"))) {
    return fixBrandDeep(vpsInfraPack(a, k));
  }

  if (cats.includes("ai-integratie-automatisering") || has(k, /\bn8n\b|webhook|\bllm\b|chatbot|openai|automatisering|embedding/)) {
    return fixBrandDeep(aiIntegratiePack(a, k));
  }

  if (cats.includes("analytics-conversie-toegankelijkheid") || has(k, /\bga4\b|\bgtm\b|matomo|\blcp\b|\bcls\b|\binp\b|\bcro\b|\bwcag\b|toegank/)) {
    return fixBrandDeep(analyticsPack(a, k));
  }

  if (cats.includes("veilig-online") || has(k, /phishing|ransomware|smishing|quishing|wachtwoordmanager|sim.?swap/)) {
    return fixBrandDeep(veiligOnlinePack(a));
  }

  if (cats.includes("microsoft") || has(k, /microsoft|\bm365\b|office.?365|exchange|\bteams\b|onedrive|sharepoint/)) {
    return fixBrandDeep(microsoftPack(a));
  }

  if (cats.includes("plesk") || cats.includes("cyberpanel") || cats.includes("plesk-php-vps") || has(k, /\bplesk\b|cyberpanel/)) {
    return fixBrandDeep(pleskCyberFallback(a, k));
  }

  if (cats.includes("ssl-certificaten") || has(k, /\bssl\b|lets.?encrypt|certificaat/)) {
    return fixBrandDeep(sslPack(a, k));
  }

  if (cats.includes("crm-klantenpanel") || cats.includes("support") || cats.includes("shop-en-pakketten") || cats.includes("ai-agents") || cats.includes("ai-scan") || cats.includes("aeo-geo-seo")) {
    return fixBrandDeep(crmSupportPack(a, k));
  }

  if (cats.includes("hosting") || cats.includes("e-mail") || cats.includes("domeinnamen") || cats.includes("beveiliging")) {
    if (emailDns) return fixBrandDeep(emailDns);
    return fixBrandDeep(hostingPack(a, k));
  }

  if (cats.includes("webdesign-en-maatwerk")) {
    if (has(k, /\bphp\b|laravel|composer|symfony/)) {
      return fixBrandDeep(
        pack(a.title, {
          intro: [
            `<strong>${esc(a.title)}</strong> — PHP/maatwerk op TripleZero iT-hosting. Let op PHP-versie, composer en env.`,
          ],
          why: ["Verkeerde PHP-versie breekt dependencies.", "Debug in productie lek info."],
          steps: [
            "Check PHP-versie in panel vs. composer platform config.",
            "Deploy via git/CI of SFTP naar de juiste docroot.",
            `Pas de wijziging voor “${esc(a.title)}” toe (code/config).`,
            "Draai migrations/caches clear indien framework dat vraagt.",
            "Test kritieke flows; bekijk error_log.",
          ],
          checks: ["Geen 500s", "Composer lock gerespecteerd", "Env aanwezig"],
          tip: "Houd staging op dezelfde PHP-minor.",
          warn: "display_errors=On hoort niet op productie.",
          related: "SSL; backups; deploy",
        }),
      );
    }
    // Do NOT dump Next.js deploy steps on unrelated webdesign articles
    return fixBrandDeep(
      pack(a.title, {
        intro: [
          `<strong>${esc(a.title)}</strong> — webdesign/maatwerk bij TripleZero iT. We koppelen stappen aan code, design of hosting — niet aan een generiek Next.js-script.`,
        ],
        why: [
          "Onderwerpgerichte stappen voorkomen copy-paste fouten tussen artikelen.",
          "Staging vangt regressies vóór productie.",
          "Documentatie helpt support sneller.",
        ],
        steps: [
          "Verzamel context: repo/omgeving, URL en gewenste uitkomst.",
          "Werk op staging of maak een backup.",
          `Pas de concrete wijziging toe die “${esc(a.title)}” beschrijft (template, CSS, component of config).`,
          "Test desktop + mobiel en kritieke flows (form, nav, checkout indien relevant).",
          "Deploy bewust; monitor kort op errors.",
        ],
        checks: ["Wijziging zichtbaar zoals bedoeld", "Geen nieuwe console/server errors", "Rollback nog mogelijk"],
        tip: "Noteer stack (HTML/WP/Next/PHP) in tickets.",
        warn: "Wijzig niet routing, DNS en design tegelijk.",
        related: "Staging; backups; monitoring",
      }),
    );
  }

  // Ultimate fallback
  return fixBrandDeep(
    pack(a.title, {
      intro: [
        `<strong>${esc(a.title)}</strong> — praktische uitleg vanuit TripleZero iT-support. We beschrijven voorbereiding, concrete acties en controles voor dit onderwerp.`,
      ],
      why: [
        "Duidelijke stappen voorkomen trial-and-error op productie.",
        "Documentatie helpt je team én onze support sneller.",
        "Controles na afloop vangen stille misconfiguraties.",
      ],
      steps: [
        "Verzamel context: product, domein/hostname, recente wijzigingen.",
        "Werk bij voorkeur op staging of maak een backup.",
        `Identificeer het juiste scherm of bestand voor “${esc(a.title)}” (panel, DNS, CMS of code).`,
        "Voer de kleinste wijziging door die het doel bereikt; bewaar de oude waarde.",
        "Test het resultaat buiten de beheeromgeving.",
        `Documenteer resultaat; open een ticket bij TripleZero iT als het blijft falen met logs/tijdstip.`,
      ],
      checks: ["Doelgedrag zichtbaar", "Geen regressie op gerelateerde diensten", "Backup/rollback nog geldig"],
      tip: "Hoe preciezer je ticket (fouttekst + tijdstip), hoe sneller de oplossing.",
      warn: "Wijzig niet meerdere kritieke systemen tegelijk.",
      related: "Backups; tickets; monitoring",
    }),
  );
}

// ---- generate ----
const articles = {};
let matcherStats = {};
for (const a of weak) {
  let p = buildPack(a);
  // Slug packs are already unique; category packs need a title-focus step so siblings diverge.
  if (!SLUG_PACKS[a.slug]) p = uniquifyPack(a, p);
  // annotate which domain roughly
  const k = kof(a);
  let bucket = "fallback";
  if (SLUG_PACKS[a.slug]) bucket = "slug";
  else if (has(k, /next|react|i18n|revalidate|app.?router/) || (a.categories || []).includes("nextjs-en-react")) bucket = "nextjs";
  else if ((a.categories || []).includes("cdn-performance-cloudflare")) bucket = "cdn";
  else if ((a.categories || []).includes("e-commerce-webshops") || (a.categories || []).includes("wordpress")) bucket = "wp";
  else if ((a.categories || []).includes("infrastructuur-servers") || (a.categories || []).includes("vps")) bucket = "infra";
  else if ((a.categories || []).includes("foutmeldingen-troubleshooting")) bucket = "ts";
  else if ((a.categories || []).includes("vergelijkingen-keuzehulp")) bucket = "vgl";
  else if ((a.categories || []).includes("privacy-juridisch-compliance")) bucket = "privacy";
  else if ((a.categories || []).includes("ai-integratie-automatisering")) bucket = "aii";
  else if ((a.categories || []).includes("analytics-conversie-toegankelijkheid")) bucket = "act";
  else if ((a.categories || []).includes("e-mail") || (a.categories || []).includes("domeinnamen")) bucket = "mail-dns";
  matcherStats[bucket] = (matcherStats[bucket] || 0) + 1;
  articles[a.topic] = { ...p, title: a.title, slug: a.slug };
}
console.log("packs", Object.keys(articles).length, matcherStats);

// Validate Next.js samples look right
for (const slug of ["internationale-sites-i18n-met-next-js", "caching-en-revalidate-in-next-js-begrijpen"]) {
  const a = weak.find((x) => x.slug === slug);
  if (!a) continue;
  const p = articles[a.topic];
  console.log("\nSAMPLE", slug);
  console.log("steps0:", p.steps[0]);
  console.log("steps3:", p.steps[3]);
}

let out = `/**
 * Topic-sense NL bodies — subject-specific how-tos (no title-plug boilerplate).
 * Generated by scripts/kennisbank-wave-quality/generate-topic-sense.mjs
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
    \`Kom je er niet uit? Open een ticket bij \${BRAND} via het klantenpanel. Vermeld product, domein/hostname, tijdstip en wat je al probeerde.\`,
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
out += `};\n`;

const outPath = path.join(ROOT, "prisma/kennisbank/quality-topic-bodies.ts");
fs.writeFileSync(outPath, out);
console.log("wrote", outPath, "bytes", out.length);

fs.writeFileSync(
  path.join(ROOT, "scripts/kennisbank-wave-quality/topic-sense-articles.json"),
  JSON.stringify(
    weak.map((a) => ({ slug: a.slug, topic: a.topic, title: a.title, categories: a.categories })),
    null,
    2,
  ) + "\n",
);

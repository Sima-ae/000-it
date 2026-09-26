#!/usr/bin/env python3
"""Generate Wave-1 kennisbank catalog entries + dedicated body modules (~450 arts)."""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CATALOG = ROOT / "prisma/kennisbank/catalog.json"
BODIES_DIR = ROOT / "prisma/kennisbank"
I18N_PATCH = ROOT / "scripts/kennisbank-wave1/i18n-patch.json"

BRAND = "TripleZero iT"


def slugify(title: str) -> str:
    s = title.lower()
    for a, b in [
        ("ë", "e"), ("é", "e"), ("è", "e"), ("ï", "i"), ("ö", "o"),
        ("ü", "u"), ("á", "a"), ("ó", "o"), ("’", ""), ("'", ""),
        ("–", "-"), ("—", "-"),
    ]:
        s = s.replace(a, b)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:88]


def make_topic(prefix: str, title: str) -> str:
    base = slugify(title)[:42].strip("-")
    h = hashlib.md5(title.encode()).hexdigest()[:5]
    return f"{prefix}-{base}-{h}"


NEW_CATEGORIES: list[tuple[str, str, str, str | None]] = [
    ("webdesign-en-maatwerk", "Webdesign en maatwerk",
     "Next.js, PHP, HTML/CSS, landingspagina’s en onderhoud van maatwerk websites bij TripleZero iT.", None),
    ("ai-integratie-automatisering", "AI-integratie en automatisering",
     "LLM’s, chatbots, n8n/Zapier, API’s, webhooks en AI-strategie naast je hosting en website.", None),
    ("analytics-conversie-toegankelijkheid", "Analytics, conversie en toegankelijkheid",
     "GTM, Matomo, CRO, Core Web Vitals, WCAG en structured data voor meetbare groei.", None),
    ("e-commerce-webshops", "E-commerce en webshops",
     "WooCommerce, Mollie/iDEAL, productfeeds, performance en webshopbeveiliging.", None),
    ("cdn-performance-cloudflare", "CDN, performance en Cloudflare",
     "CDN, Cloudflare, caching, afbeeldingen en snelheid voor sites bij TripleZero iT.", None),
    ("nextjs-en-react", "Next.js en React",
     "App Router, SSR/SSG, server components en SEO-klare React-apps.", "webdesign-en-maatwerk"),
    ("php-maatwerk", "PHP-maatwerk",
     "PHP-portals, API-backends en maatwerk applicaties.", "webdesign-en-maatwerk"),
    ("html-css-js", "HTML, CSS en JavaScript",
     "Slanke front-end builds zonder zwaar CMS.", "webdesign-en-maatwerk"),
    ("landingspaginas", "Landingspagina’s",
     "Conversiegerichte landingspagina’s, structuur en A/B-testen.", "webdesign-en-maatwerk"),
    ("onderhoud-maatwerk", "Onderhoud maatwerk",
     "Updates, monitoring en doorontwikkeling na livegang.", "webdesign-en-maatwerk"),
    ("llm-en-chatbots", "LLM’s en chatbots",
     "ChatGPT/Claude-integraties, sitebots en veilige prompts.", "ai-integratie-automatisering"),
    ("workflows-n8n-zapier", "Workflows n8n en Zapier",
     "Automatisering tussen tools, CRM en website.", "ai-integratie-automatisering"),
    ("api-webhooks", "API’s en webhooks",
     "Koppelingen, webhooks, auth en foutafhandeling.", "ai-integratie-automatisering"),
    ("ai-content-strategie", "AI-contentstrategie",
     "Contentkalenders, merkstijl en AI-ondersteund schrijven.", "ai-integratie-automatisering"),
    ("ai-consultancy", "AI-consultancy",
     "Strategie, use-cases en implementatieadvies.", "ai-integratie-automatisering"),
    ("analytics-gtm-matomo", "Analytics, GTM en Matomo",
     "Meting, tags, privacyvriendelijke analytics.", "analytics-conversie-toegankelijkheid"),
    ("conversie-optimalisatie", "Conversie-optimalisatie",
     "CRO, funnels, CTA’s en A/B-testen.", "analytics-conversie-toegankelijkheid"),
    ("core-web-vitals", "Core Web Vitals",
     "LCP, INP, CLS en snelheidsverbeteringen.", "analytics-conversie-toegankelijkheid"),
    ("toegankelijkheid-wcag", "Toegankelijkheid (WCAG)",
     "WCAG, toetsenbord, contrast en screenreaders.", "analytics-conversie-toegankelijkheid"),
    ("structured-data-schema", "Structured data (schema)",
     "JSON-LD, FAQ, HowTo, Product en Organization.", "analytics-conversie-toegankelijkheid"),
    ("woocommerce-diepte", "WooCommerce diepte",
     "Catalogus, checkout, voorraad en extensies.", "e-commerce-webshops"),
    ("betalingen-mollie-ideal", "Betalingen Mollie en iDEAL",
     "Mollie, iDEAL, creditcard en terugbetalingen.", "e-commerce-webshops"),
    ("productfeed-seo", "Productfeeds en SEO",
     "Feeds, rich results en product-SEO.", "e-commerce-webshops"),
    ("webshop-performance", "Webshop-performance",
     "Snelheid, caching en schaalbaarheid van shops.", "e-commerce-webshops"),
    ("webshop-beveiliging", "Webshop-beveiliging",
     "PCI-praxis, fraudetectie en hardening.", "e-commerce-webshops"),
    ("cdn-basics", "CDN-basics",
     "Wat een CDN doet en wanneer je het inzet.", "cdn-performance-cloudflare"),
    ("cloudflare-dns-proxy", "Cloudflare DNS en proxy",
     "Proxy, DNS, SSL-modes en firewallregels.", "cdn-performance-cloudflare"),
    ("caching-strategie", "Caching-strategie",
     "Browser-, edge- en applicatiecache.", "cdn-performance-cloudflare"),
    ("image-performance", "Afbeeldingsperformance",
     "WebP/AVIF, lazy load en responsive images.", "cdn-performance-cloudflare"),
]

# module key -> topic prefix
MODULE_OF = {
    "webdesign-en-maatwerk": "webdesign",
    "nextjs-en-react": "webdesign",
    "php-maatwerk": "webdesign",
    "html-css-js": "webdesign",
    "landingspaginas": "webdesign",
    "onderhoud-maatwerk": "webdesign",
    "ai-integratie-automatisering": "ai-integratie",
    "llm-en-chatbots": "ai-integratie",
    "workflows-n8n-zapier": "ai-integratie",
    "api-webhooks": "ai-integratie",
    "ai-content-strategie": "ai-integratie",
    "ai-consultancy": "ai-integratie",
    "analytics-conversie-toegankelijkheid": "analytics-cro",
    "analytics-gtm-matomo": "analytics-cro",
    "conversie-optimalisatie": "analytics-cro",
    "core-web-vitals": "analytics-cro",
    "toegankelijkheid-wcag": "analytics-cro",
    "structured-data-schema": "analytics-cro",
    "e-commerce-webshops": "ecommerce",
    "woocommerce-diepte": "ecommerce",
    "betalingen-mollie-ideal": "ecommerce",
    "productfeed-seo": "ecommerce",
    "webshop-performance": "ecommerce",
    "webshop-beveiliging": "ecommerce",
    "cdn-performance-cloudflare": "cdn-performance",
    "cdn-basics": "cdn-performance",
    "cloudflare-dns-proxy": "cdn-performance",
    "caching-strategie": "cdn-performance",
    "image-performance": "cdn-performance",
}

PREFIX = {
    "webdesign": "tz-wd",
    "ai-integratie": "tz-aii",
    "analytics-cro": "tz-act",
    "ecommerce": "tz-ec",
    "cdn-performance": "tz-cdn",
    "thicken": "tz-th",
}

# Related outro hints per sub
RELATED = {
    "nextjs-en-react": "SSR/SSG, hosting op VPS en SEO-meta in Next.js",
    "php-maatwerk": "PHP-beveiliging, cronjobs en API-backends",
    "html-css-js": "statische sites, assets en consent",
    "landingspaginas": "CRO, UTM’s en landingspagina-structuur",
    "onderhoud-maatwerk": "monitoring, staging en dependency-updates",
    "llm-en-chatbots": "RAG, privacy en human handoff",
    "workflows-n8n-zapier": "webhooks, geheimen en foutafhandeling",
    "api-webhooks": "HMAC, retries en API-auth",
    "ai-content-strategie": "merkstem, FAQ’s en redactieproces",
    "ai-consultancy": "pilots, AVG en roadmap",
    "analytics-gtm-matomo": "consent, tags en privacyvriendelijke meting",
    "conversie-optimalisatie": "funnels, CTA’s en A/B-testen",
    "core-web-vitals": "LCP, INP, CLS en caching",
    "toegankelijkheid-wcag": "contrast, toetsenbord en ARIA",
    "structured-data-schema": "FAQ, Product en Organization schema",
    "woocommerce-diepte": "catalogus, checkout en voorraad",
    "betalingen-mollie-ideal": "iDEAL, webhooks en terugbetalingen",
    "productfeed-seo": "feeds, rich results en producttitels",
    "webshop-performance": "caching, afbeeldingen en database",
    "webshop-beveiliging": "hardening, 2FA en fraudedetectie",
    "cdn-basics": "CDN-voordelen en origin-setup",
    "cloudflare-dns-proxy": "proxy, SSL-modes en DNS",
    "caching-strategie": "edge cache, purge en TTLs",
    "image-performance": "WebP/AVIF en lazy loading",
}


def expand_titles(base: list[str], need: int, seed: str) -> list[str]:
    """Pad a title list to `need` with numbered variants that stay unique."""
    out = list(base)
    i = 1
    while len(out) < need:
        src = base[(i - 1) % len(base)]
        # Create practical angle variants
        angles = [
            f"{src}: checklist voor MKB",
            f"{src}: veelgemaakte fouten",
            f"{src}: stappenplan voor beginners",
            f"Praktijkcase: {src[0].lower()}{src[1:]}",
            f"{src} — tips van TripleZero iT",
            f"Probleemoplossing: {src[0].lower()}{src[1:]}",
            f"{src} in productie",
            f"{src}: wat je vóór livegang checkt",
        ]
        cand = angles[(i - 1) % len(angles)]
        if i > len(angles):
            cand = f"{src} ({seed}-{i})"
        if cand not in out:
            out.append(cand)
        i += 1
        if i > 500:
            break
    return out[:need]


TITLE_BANKS: dict[str, list[str]] = {
    "nextjs-en-react": [
        "Next.js App Router uitleggen voor je TripleZero iT-project",
        "SSR versus SSG versus ISR: welke rendering kies je?",
        "Server Components en Client Components correct scheiden",
        "SEO-meta en Open Graph in Next.js App Router",
        "Omgevingsvariabelen veilig gebruiken in Next.js",
        "Next.js deployen op een VPS bij TripleZero iT",
        "Image Optimization en next/image in productie",
        "Middleware voor redirects, auth en locale-routing",
        "API-routes en Route Handlers in Next.js",
        "Foutpagina’s en loading states professioneel inrichten",
        "Caching en revalidate in Next.js begrijpen",
        "Internationale sites (i18n) met Next.js",
        "React Server Actions veilig inzetten",
        "Performance: bundle size en dynamic imports",
        "Next.js verbinden met een bestaande WordPress-backend",
        "HTTPS, domein en reverse proxy voor Next.js",
        "Logging en monitoring voor een Next.js-app",
        "Database-connecties vanuit Next.js (Prisma/MySQL)",
        "Formulieren en validatie in React/Next.js",
        "Migreren van Pages Router naar App Router",
    ],
    "php-maatwerk": [
        "PHP-maatwerk: wanneer een CMS niet genoeg is",
        "Een PHP-portal veilig hosten bij TripleZero iT",
        "Composer en dependencies op shared hosting of VPS",
        "PHP-versie kiezen voor maatwerk applicaties",
        "API-backends in PHP: REST-principes",
        "Authenticatie en sessies in PHP-apps",
        "Bestandsuploads veilig verwerken in PHP",
        "Cronjobs voor PHP-taken in DirectAdmin of CyberPanel",
        "Database-migrations en backups voor PHP-projecten",
        "Foutlogging en display_errors uitzetten in productie",
        "PHP-FPM pools en performance-tuning",
        "Beveiliging: SQL-injection en XSS voorkomen",
        "Mail versturen vanuit PHP via SMTP van TripleZero iT",
        "Rate limiting en CAPTCHA bij PHP-formulieren",
        "CLI-scripts en worker-processen op een VPS",
        "PHP en MySQL: connection pooling en timeouts",
        "Structuur van een maintainable PHP-codebase",
        "Updates en dependency audits voor PHP-apps",
    ],
    "html-css-js": [
        "Een lichte HTML/CSS/JS-site hosten zonder CMS",
        "Semantische HTML voor SEO en toegankelijkheid",
        "CSS-architectuur: utility classes versus componenten",
        "Responsive design: breakpoints die in de praktijk werken",
        "JavaScript progressief toevoegen zonder frameworks",
        "Formulieren valideren met native HTML5 en JS",
        "Favicon, manifest en PWA-basics voor statische sites",
        "Build tools: wanneer Vite of esbuild zinvol is",
        "Assets organiseren: CSS, JS en afbeeldingen",
        "Dark mode en prefers-color-scheme",
        "Animaties die performance niet kapotmaken",
        "CDN voor statische assets bij TripleZero iT",
        "Contactformulier koppelen aan e-mail of webhook",
        "Cookie-banner en consent op een static site",
        "Sitemap en robots.txt voor HTML-sites",
    ],
    "landingspaginas": [
        "Structuur van een conversiegerichte landingspagina",
        "Headline, subkop en CTA: hiërarchie die converteert",
        "Social proof en trustsignalen op landingspagina’s",
        "Landingspagina versus homepage: wanneer wat",
        "A/B-testen van landingspagina’s: opzet en valkuilen",
        "Snelheid van landingspagina’s meten en verbeteren",
        "Formulierlengte en friction verminderen",
        "UTM-parameters en campagnelandingspagina’s",
        "Mobiele landingspagina’s: boven-de-vouw prioriteiten",
        "Privacytekst en toestemming bij leadformulieren",
        "Meertalige landingspagina’s zonder dubbele content",
        "Landingspagina koppelen aan CRM of nieuwsbrief",
        "Heatmaps en scroll depth interpreteren",
        "Exit-intent en pop-ups: wanneer wel of niet",
        "Designsystemen hergebruiken op landingspagina’s",
        "Landingspagina’s hosten naast WordPress of Next.js",
        "Schema.org voor landingspagina’s (Offer, FAQ)",
        "Remarketing-landingspagina’s consistent houden",
    ],
    "onderhoud-maatwerk": [
        "Onderhoudsplan na livegang van een maatwerk site",
        "Dependency-updates zonder downtime plannen",
        "Monitoring: uptime, SSL en error rates",
        "Staging-omgeving gebruiken voor veilige releases",
        "Rollback-strategie bij mislukte deployments",
        "Documentatie bijhouden voor opvolgers en support",
        "Performance-regressies na updates voorkomen",
        "Security patches prioriteren voor maatwerk code",
        "Backup-ritme voor applicatie én database",
        "Change log en release notes voor stakeholders",
        "SLA’s en responstijden bij TripleZero iT-support",
        "Technische schuld systematisch aflossen",
        "Feature flags voor geleidelijke uitrol",
        "Logrotatie en schijfruimte op VPS-apps",
        "Jaarlijkse security review van maatwerk",
        "Content updates vs code updates scheiden",
        "Toegang en rechten voor developers en klanten",
        "Migratiepad wanneer het CMS of framework veroudert",
        "Kosten van onderhoud versus nieuwbouw",
    ],
    "llm-en-chatbots": [
        "Chatbot op je website: use-cases die echt helpen",
        "LLM-integratie veilig opzetten (geen geheimen in de frontend)",
        "Prompting voor klantenservice-bots bij TripleZero iT",
        "Hallucinaties beperken: grounding met kennisbank en FAQ",
        "ChatGPT of Claude via API koppelen aan je site",
        "Rate limits, kosten en tokenbudget bewaken",
        "Privacy: welke klantdata mag naar een LLM",
        "Human handoff: van bot naar ticket of chat",
        "Meertalige chatbots voor NL en EN",
        "Inhoudsfilters en veilige system prompts",
        "Embedding + retrieval (RAG) voor bedrijfskennis",
        "Widget-inbedding zonder performance te schaden",
        "Logging van gesprekken: AVG en retentie",
        "Evalueren van botkwaliteit met testvragen",
        "Chatbot versus Agent 000: wanneer wat",
        "Offline fallbacks als de LLM-API down is",
    ],
    "workflows-n8n-zapier": [
        "n8n versus Zapier: keuzehulp voor MKB",
        "Eerste Zapier-workflow: leadformulier naar e-mail",
        "n8n self-hosten op een VPS bij TripleZero iT",
        "Webhooks ontvangen en valideren in workflows",
        "CRM synchroniseren met website-aanvragen",
        "Foutafhandeling en retries in automatisering",
        "Geheimen en API-keys veilig opslaan in n8n",
        "Planning: cron-triggers versus event-triggers",
        "Data mapping tussen apps (velden transformeren)",
        "Automatische factuurherinneringen opzetten",
        "Social posts plannen via automatisering",
        "Backup van workflow-definities",
        "Rate limits van externe API’s respecteren",
        "Audittrail: wie wijzigde welke workflow",
        "Van no-code naar code nodes wanneer nodig",
        "Kosten en fair-use van SaaS-automatisering",
    ],
    "api-webhooks": [
        "Wat is een webhook en wanneer gebruik je die?",
        "HMAC-handtekeningen verifiëren op inkomende webhooks",
        "Idempotency: dubbele webhook-events voorkomen",
        "REST API-authenticatie: API keys versus OAuth",
        "Timeouts, retries en backoff ontwerpen",
        "Webhook endpoints beveiligen achter HTTPS",
        "Logging en debugging van mislukte callbacks",
        "Stripe- of Mollie-webhooks correct afhandelen",
        "Versionering van je publieke API",
        "CORS en browser-aanroepen: wanneer wel/niet",
        "Rate limiting aan de serverkant",
        "OpenAPI/Swagger documentatie bijhouden",
        "Sandbox versus productie endpoints",
        "Payload-grootte en payload-validatie",
        "Async jobs na een webhook starten",
        "Monitoring van webhook success rates",
    ],
    "ai-content-strategie": [
        "AI-contentstrategie: merkstem behouden",
        "Contentkalender maken met AI-ondersteuning",
        "Redactieproces: mens blijft eindverantwoordelijk",
        "AI voor blogoutlines versus volledige teksten",
        "Feiten checken na AI-gegenereerde content",
        "Interne linking plannen met AI-hulp",
        "FAQ’s genereren én valideren voor AEO",
        "Meertalige content: eerst NL/EN goed krijgen",
        "Duplicate content voorkomen bij AI-schrijven",
        "Beeldprompts en alt-teksten consistent houden",
        "Content briefs schrijven die AI bruikbaar maken",
        "KPI’s voor AI-ondersteunde content",
        "Juridische disclaimers en claims vermijden",
        "Hergebruik van kennisbankartikelen in marketing",
        "AI voor social captions zonder spammy toon",
        "Editorial guidelines documenteren voor je team",
    ],
    "ai-consultancy": [
        "AI-consultancy: van idee naar haalbare use-case",
        "Quick wins versus strategische AI-projecten",
        "Risico’s: privacy, IP en leveranciersafhankelijkheid",
        "ROI van AI-projecten realistisch inschatten",
        "Change management: team meenemen in AI-adoptie",
        "Tooling stack kiezen zonder vendor lock-in",
        "Pilot draaien: succescriteria vooraf vastleggen",
        "Data readiness: wat moet je eerst opruimen",
        "AI-beleid (acceptable use) voor je organisatie",
        "Koppeling AI-scan resultaten aan trajectkeuze",
        "Bouwen versus kopen van AI-oplossingen",
        "Security review van AI-integraties",
        "Roadmap 90 dagen: scan, pilot, opschalen",
        "Stakeholders alignen: marketing, IT en directie",
        "Naleving AVG bij AI-verwerking van klantdata",
        "Nazorg en optimalisatie na go-live",
    ],
    "analytics-gtm-matomo": [
        "Google Tag Manager: basiscontainer opzetten",
        "Matomo als privacyvriendelijk alternatief",
        "Consent Mode en cookiebanners correct koppelen",
        "Events meten: clicks, forms en downloads",
        "Enhanced conversions versus basis e-commerce events",
        "Server-side tagging: wanneer zinvol",
        "Debuggen met GTM Preview en Tag Assistant",
        "Cross-domain tracking voor landingspagina + shop",
        "DataLayer ontwerpen die marketeers begrijpen",
        "PII uit tags houden (AVG)",
        "Looker Studio of exports: rapportages delen",
        "SPA’s en Next.js: pageviews correct meten",
        "Uitfaseren van verouderde Universal Analytics-restanten",
        "Doelen en conversies definiëren in Matomo",
        "Tag governance: wie mag wat publiceren",
        "Default consent state voor NL-bezoekers",
    ],
    "conversie-optimalisatie": [
        "CRO-basis: hypothese vóór je iets wijzigt",
        "Funnelanalyse: waar haken bezoekers af?",
        "CTA-teksten testen zonder designchaos",
        "Formulieroptimalisatie: velden schrappen",
        "Social proof plaatsen zonder nep-reviews",
        "Prijsweergave en ankerprijzen ethisch inzetten",
        "Mobiele conversie: duimvriendelijke UI",
        "Paginasnelheid als conversiefactor",
        "Trust badges en betaallogo’s bij checkout",
        "Microcopy die twijfel wegneemt",
        "Segmentatie: niet iedereen dezelfde CRO-test",
        "Statistische significantie begrijpen",
        "Kwalitatief onderzoek: interviews naast cijfers",
        "Checkout abandon: e-mailherstel ethisch",
        "Landing-to-offer alignment",
        "CRO-roadmap koppelen aan AI-scan scores",
    ],
    "core-web-vitals": [
        "LCP verbeteren: hero-afbeeldingen en fonts",
        "INP verbeteren: zware JavaScript vermijden",
        "CLS voorkomen: afmetingen reserveren",
        "Field data versus lab data (CrUX/PageSpeed)",
        "Critical CSS en above-the-fold strategie",
        "Third-party scripts die vitals breken",
        "Font-display en font swapping beheersen",
        "Server response time (TTFB) verlagen",
        "WordPress-plugins die vitals schaden",
        "Next.js en Core Web Vitals: checklist",
        "Afbeeldingformaten kiezen voor LCP",
        "Lazy load: wat je juist niet lazy laadt",
        "CDN en vitals: edge dichterbij de gebruiker",
        "Meten in Search Console en PageSpeed Insights",
        "Prioriteiten: mobile-first voor rankings",
        "Budget voor JS-kilobytes afspreken met developers",
    ],
    "toegankelijkheid-wcag": [
        "WCAG 2.2: wat MKB-minimaal moet regelen",
        "Kleurcontrast controleren en fixen",
        "Toetsenbordnavigatie en focus states",
        "Alt-teksten die écht beschrijven",
        "Formulierlabels en foutmeldingen toegankelijk",
        "ARIA: wanneer wel en wanneer niet",
        "Video’s: ondertiteling en transcript",
        "Skip links en landmarks",
        "Screenreader-testen zonder expert te zijn",
        "Toegankelijke PDF’s en downloads",
        "Motion en prefers-reduced-motion",
        "Captcha’s toegankelijk houden",
        "Taalattribuut en meertalige pagina’s",
        "Componentbibliotheken auditen op a11y",
        "Juridische context NL: toegankelijkheidseisen",
        "Doorlopende a11y in je releaseproces",
    ],
    "structured-data-schema": [
        "JSON-LD toevoegen zonder de layout te breken",
        "Organization en LocalBusiness schema",
        "FAQ-schema dat bij zichtbare content past",
        "HowTo-schema: alleen bij echte stappen",
        "Product- en Offer-schema voor webshops",
        "BreadcrumbList voor betere navigatie",
        "Article-schema voor nieuws en blogs",
        "Review-schema: richtlijnen respecteren",
        "Validatie met Rich Results Test",
        "Meerdere schema-blokken op één pagina",
        "Structured data en AEO: antwoorden markeren",
        "Fouten: lege FAQ’s en misleading markup",
        "CMS-plugins versus handmatige JSON-LD",
        "Schema bijhouden na redesigns",
        "Speakable en experimental types: voorzichtig",
        "Koppeling NAP-consistentie met LocalBusiness",
    ],
    "woocommerce-diepte": [
        "WooCommerce catalogusstructuur: categorieën en tags",
        "Productvariaties en attributen correct instellen",
        "Voorraadbeheer en backorders",
        "Checkout-velden minimaliseren",
        "Verzendzones en tarieven in NL/EU",
        "Belastingen en btw-instellingen",
        "WooCommerce e-mails personaliseren",
        "Coupons en kortingsregels zonder chaos",
        "Gastcheckout versus accounts",
        "Multisite of meerdere shops: aandachtspunten",
        "REST API van WooCommerce beveiligen",
        "Blocks versus classic checkout",
        "Productgalerijen en zoom performance",
        "Abonnementen en terugkerende betalingen",
        "Migratie van Magento/PrestaShop naar WooCommerce",
        "Staging-shop veilig testen met echte plugins",
    ],
    "betalingen-mollie-ideal": [
        "Mollie koppelen aan WooCommerce",
        "iDEAL als standaard betaalmethode in NL",
        "Creditcard en Apple Pay via Mollie",
        "Webhook-URL’s en statusupdates controleren",
        "Terugbetalingen en chargebacks afhandelen",
        "Testmodus versus live keys",
        "Meerdere websites op één Mollie-account",
        "Valuta’s en EU-klanten",
        "Foutmelding ‘betaling mislukt’: diagnose",
        "PCI-scope verkleinen met hosted checkout",
        "Facturen en betaalbewijzen naar klanten",
        "Abonnementsbetalingen via Mollie",
        "Security: keys nooit in de frontend",
        "Rapportages aansluiten op boekhouding",
        "3-D Secure en frauderegels",
        "Alternatieven: Stripe naast Mollie",
    ],
    "productfeed-seo": [
        "Productfeed opzetten voor Google Merchant",
        "Titels en beschrijvingen voor product-SEO",
        "GTIN, MPN en merkvelden verplicht maken",
        "Afbeeldingen in feeds: eisen en valkuilen",
        "Voorraad en prijs synchroon houden",
        "Localized feeds voor NL en EN",
        "Structured data Product naast de feed",
        "Categorie-mapping naar Google taxonomy",
        "Feed-fouten in Merchant Center oplossen",
        "Vergelijkingssites en affiliate feeds",
        "Faceted navigation zonder SEO-schade",
        "Canonieke URL’s voor productvarianten",
        "Dunne productpagina’s verrijken",
        "Schema AggregateOffer bij prijsranges",
        "Performance impact van feed-plugins",
        "Interne links van categorie naar bestsellers",
    ],
    "webshop-performance": [
        "Webshop-snelheid: database queries optimaliseren",
        "Object caching (Redis) voor WooCommerce",
        "Full-page cache en cart-excepties",
        "Afbeeldingen en productgalerijen comprimeren",
        "Onnodige plugins inventariseren en verwijderen",
        "Checkout asynchroon houden",
        "CDN voor productmedia",
        "PHP workers en concurrency bij pieken",
        "Search en filters die de DB niet platleggen",
        "Critical path CSS voor shop-templates",
        "Lazy load onder-de-vouw producten",
        "Staging loadtesten voor campagnes",
        "Cart fragments en AJAX overhead",
        "Hostingkeuze: shared versus VPS voor shops",
        "Monitoring tijdens Black Friday-pieken",
        "Query Monitor gebruiken zonder productie te vertragen",
    ],
    "webshop-beveiliging": [
        "Webshop hardening: admin-URL en rechten",
        "2FA voor winkelbeheerders",
        "Malware-scans na verdachte orders",
        "Brute-force op wp-login beperken",
        "File permissions en uploads directory",
        "Fraudulent orders herkennen",
        "Security headers voor checkout-pagina’s",
        "SSL overal forceren inclusief assets",
        "Plugin-kwetsbaarheden patchen",
        "WAF/Cloudflare regels voor admin-paden",
        "Backups vóór elke shop-update",
        "Klantaccounts: wachtwoordbeleid",
        "Logins van developers tijdelijk maken",
        "PCI-DSS awareness voor MKB-shops",
        "Incident response: shop offline zetten",
        "Audit van betaalplugins en webhooks",
    ],
    "cdn-basics": [
        "Wat een CDN doet voor je website",
        "Origin versus edge: begrippen uitgelegd",
        "Wanneer een CDN wél en niet helpt",
        "CDN kiezen naast hosting bij TripleZero iT",
        "Statische assets via CDN serveren",
        "TTL’s begrijpen en instellen",
        "Cache hit ratio verbeteren",
        "Geolocatie en latency meten",
        "CDN en cookies: let op wat je cached",
        "HTTPS op de edge correct configureren",
        "Failover: origin bereikbaar houden",
        "Kostenmodellen van CDN-verkeer",
        "CDN voor API’s: caching-regels",
        "Purge strategie na contentupdates",
        "Multi-CDN: meestal overkill voor MKB",
        "CDN logs gebruiken bij incidenten",
    ],
    "cloudflare-dns-proxy": [
        "Cloudflare DNS naast TripleZero iT nameservers",
        "Oranje wolk (proxy) versus DNS-only",
        "SSL/TLS-modes: Flexible, Full, Full (strict)",
        "Authenticated Origin Pulls uitleg",
        "Firewall rules voor admin en wp-login",
        "Bot Fight Mode en echte gebruikers",
        "Page Rules versus Cache Rules",
        "E-mail (MX) niet per ongeluk proxien",
        "Always Use HTTPS en HSTS in Cloudflare",
        "IP allowlist voor RDP/SSH achter Cloudflare",
        "Workers: wanneer wél inzetten",
        "Development Mode tijdens deployments",
        "Analytics in Cloudflare interpreteren",
        "Problemen met WebSockets of API’s",
        "DNSSEC en Cloudflare",
        "Migreren van alleen-DNS naar proxied setup",
    ],
    "caching-strategie": [
        "Browsercache: Cache-Control headers",
        "Edge cache versus origin cache",
        "Purge on publish voor WordPress",
        "Cache bypass voor winkelwagen en account",
        "Stale-while-revalidate begrijpen",
        "HTML cachen: risico’s en voordelen",
        "Querystrings en cache keys",
        "CDN cache + LiteSpeed/OpenLiteSpeed",
        "API-responses cachen met korte TTL",
        "Authenticated pages nooit publiek cachen",
        "Warm-up na purge bij campagnes",
        "Versioned assets (hash in filename)",
        "Debuggen: waarom zie ik oude content?",
        "Cache hiërarchie documenteren voor je team",
        "Next.js fetch cache versus CDN cache",
        "Negatieve caching (404’s) beperken",
    ],
    "image-performance": [
        "WebP en AVIF: formaten kiezen",
        "Responsive images met srcset",
        "Lazy loading correct toepassen",
        "Hero-image: niet lazy en wel gecomprimeerd",
        "CMS-uploads automatisch verkleinen",
        "CDN image resizing versus vooraf exporteren",
        "Art direction: andere crop op mobiel",
        "SVG voor iconen, raster voor foto’s",
        "Exif-data strippen voor privacy en bytes",
        "LCP-element voorselecteren (fetchpriority)",
        "Galleries: placeholders tegen CLS",
        "WordPress media library opruimen",
        "Next.js Image component best practices",
        "Background images versus <img>",
        "Animatie-GIF’s vervangen door video",
        "Budget: maximale kilobytes per pagina",
    ],
}

# Quotas for new-category articles (~360)
SUB_QUOTAS = {
    "nextjs-en-react": 20,
    "php-maatwerk": 18,
    "html-css-js": 15,
    "landingspaginas": 18,
    "onderhoud-maatwerk": 19,
    "llm-en-chatbots": 16,
    "workflows-n8n-zapier": 16,
    "api-webhooks": 16,
    "ai-content-strategie": 16,
    "ai-consultancy": 16,
    "analytics-gtm-matomo": 16,
    "conversie-optimalisatie": 16,
    "core-web-vitals": 16,
    "toegankelijkheid-wcag": 16,
    "structured-data-schema": 16,
    "woocommerce-diepte": 16,
    "betalingen-mollie-ideal": 16,
    "productfeed-seo": 16,
    "webshop-performance": 16,
    "webshop-beveiliging": 16,
    "cdn-basics": 14,
    "cloudflare-dns-proxy": 14,
    "caching-strategie": 14,
    "image-performance": 14,
}

# Thickening existing categories (~90)
THICKEN: list[tuple[str, str, list[str], list[str]]] = [
    # (topic_prefix_suffix, title, categories, related)
    ("ftp", "FileZilla verbinden met je hostingaccount",
     ["hosting", "ftp-en-bestanden"], "FTP-accounts, CHMOD en File Manager"),
    ("ftp", "FTP-account aanmaken in DirectAdmin",
     ["hosting", "ftp-en-bestanden", "directadmin"], "FTP-rechten en beveiliging"),
    ("ftp", "FTP-account aanmaken in CyberPanel",
     ["hosting", "ftp-en-bestanden", "cyberpanel"], "SFTP en bestandsrechten"),
    ("ftp", "SFTP gebruiken in plaats van plain FTP",
     ["hosting", "ftp-en-bestanden", "beveiliging"], "SSH-sleutels en poorten"),
    ("ftp", "Bestandsrechten (CHMOD) veilig instellen",
     ["hosting", "ftp-en-bestanden", "beveiliging"], "File Manager en uploads"),
    ("ftp", "Grote bestanden uploaden zonder timeout",
     ["hosting", "ftp-en-bestanden"], "Opslaglimieten en compressie"),
    ("ftp", "Verborgen bestanden (.htaccess) bewerken via FTP",
     ["hosting", "ftp-en-bestanden"], "Backups vóór wijzigingen"),
    ("ftp", "FTP-toegang intrekken voor oud personeel",
     ["hosting", "ftp-en-bestanden", "beveiliging"], "Accountbeheer en 2FA"),
    ("php", "PHP-versie wijzigen per domein",
     ["hosting", "php-en-scripts"], "phpinfo en compatibiliteit"),
    ("php", "phpinfo veilig bekijken en weer uitzetten",
     ["hosting", "php-en-scripts", "beveiliging"], "PHP-instellingen"),
    ("php", "Cronjob toevoegen voor onderhoudsscripts",
     ["hosting", "php-en-scripts"], "Logs en e-mailoutput van cron"),
    ("php", "memory_limit en max_execution_time verhogen",
     ["hosting", "php-en-scripts"], "Wanneer VPS nodig is"),
    ("php", "Installatron: applicatie updaten",
     ["hosting", "php-en-scripts", "wordpress"], "Backups vóór updates"),
    ("php", "PHP-fouten in error_log vinden",
     ["hosting", "php-en-scripts"], "display_errors uitzetten"),
    ("php", "Composer op shared hosting: beperkingen",
     ["hosting", "php-en-scripts"], "VPS als alternatief"),
    ("php", "Opcache inschakelen voor snellere PHP",
     ["hosting", "php-en-scripts"], "Performance en restarts"),
    ("disk", "Schijfruimte vrijmaken: logs en backups",
     ["hosting", "opslag-en-verkeer"], "Inodes en mailquota"),
    ("disk", "Inode-limiet bereikt: wat nu?",
     ["hosting", "opslag-en-verkeer"], "Kleine bestanden opruimen"),
    ("disk", "Dataverkeer pieken onderzoeken",
     ["hosting", "opslag-en-verkeer"], "CDN en hotlinking"),
    ("disk", "Mailopslag die je hosting vol laat lopen",
     ["hosting", "opslag-en-verkeer", "e-mail"], "Mailboxquota"),
    ("disk", "Upgrade naar groter hostingpakket plannen",
     ["hosting", "opslag-en-verkeer", "shop-en-pakketten", "hostingpakketten"],
     "Business-pakketten"),
    ("xfer", "Domein verhuizen met autorisatiecode",
     ["domeinnamen", "domein-verhuizen"], "Lock en quarantaine"),
    ("xfer", "Domeinlock uitzetten vóór transfer",
     ["domeinnamen", "domein-verhuizen"], "Auth-code aanvragen"),
    ("xfer", "Quarantaineperiode na .nl-verhuizing",
     ["domeinnamen", "domein-verhuizen"], "SIDN-regels"),
    ("xfer", "DNS behouden tijdens domeinverhuizing",
     ["domeinnamen", "domein-verhuizen", "dns-records"], "TTL verlagen"),
    ("xfer", "E-mail draaiende houden tijdens transfer",
     ["domeinnamen", "domein-verhuizen", "e-mail"], "MX ongewijzigd laten"),
    ("xfer", "Mislukte transfer: veelvoorkomende oorzaken",
     ["domeinnamen", "domein-verhuizen"], "WHOIS en openstaande facturen"),
    ("xfer", "Domein overdragen naar andere houder",
     ["domeinnamen", "domein-verhuizen", "domein-registratie"], "Houdergegevens"),
    ("dns", "CAA-record toevoegen voor SSL-issuers",
     ["domeinnamen", "dns-records", "ssl-certificaten"], "Let’s Encrypt"),
    ("dns", "SRV-records voor Microsoft 365 of VoIP",
     ["domeinnamen", "dns-records", "microsoft"], "Autodiscover"),
    ("dns", "TTL strategisch verlagen vóór migratie",
     ["domeinnamen", "dns-records"], "Propagatie"),
    ("dns", "DNSSEC inschakelen en DS-records",
     ["domeinnamen", "dns-records", "beveiliging"], "Nameservers"),
    ("dns", "Split-horizon DNS: wanneer relevant",
     ["domeinnamen", "dns-records"], "Interne versus publieke records"),
    ("ms", "Teams gasttoegang veilig instellen",
     ["microsoft", "microsoft-teams"], "Externe sharing"),
    ("ms", "Teams vergaderbeleid en lobby",
     ["microsoft", "microsoft-teams"], "Beveiligingsdefaults"),
    ("ms", "Teams bestanden in SharePoint beheren",
     ["microsoft", "microsoft-teams", "microsoft-onedrive"], "Quota"),
    ("ms", "Conditional Access basics voor M365",
     ["microsoft", "microsoft-beveiliging"], "2FA en risico"),
    ("ms", "Suspicious sign-in alerts opvolgen",
     ["microsoft", "microsoft-beveiliging"], "Wachtwoord reset"),
    ("ms", "Adminrollen minimaliseren in Entra ID",
     ["microsoft", "microsoft-beveiliging"], "Least privilege"),
    ("ms", "Passkeys en wachtwoordloze login in M365",
     ["microsoft", "microsoft-beveiliging"], "2FA-alternatieven"),
    ("ms", "Eenmalige toegang voor externe consultants",
     ["microsoft", "microsoft-beveiliging", "microsoft-overige"], "Gastaccounts"),
    ("vo", "Basis cyberhygiëne voor ondernemers",
     ["veilig-online", "veilig-online-basis", "beveiliging"], "2FA en updates"),
    ("vo", "Phishing herkennen in 60 seconden",
     ["veilig-online", "veilig-online-phishing", "beveiliging"], "Linkinspectie"),
    ("vo", "AVG: dataminimalisatie in de praktijk",
     ["veilig-online", "veilig-online-privacy", "beveiliging"], "Retentiebeleid"),
    ("vo", "Verwerkersovereenkomsten: wanneer nodig",
     ["veilig-online", "veilig-online-privacy"], "Leveranciers"),
    ("vo", "VPN kiezen voor openbare wifi",
     ["veilig-online", "veilig-online-netwerk", "beveiliging"], "Routerbeveiliging"),
    ("vo", "Thuisrouter firmware en wachtwoord",
     ["veilig-online", "veilig-online-netwerk"], "WPA3"),
    ("vo", "Passkeys uitleggen aan niet-technische collega’s",
     ["veilig-online", "veilig-online-wachtwoorden", "beveiliging"], "2FA"),
    ("vo", "Wachtwoordmanager rollen uit in een klein team",
     ["veilig-online", "veilig-online-wachtwoorden"], "Shared vaults"),
    ("scan", "Eerste AI-scan starten: wat invullen",
     ["ai-scan", "ai-scan-starten"], "Scores begrijpen"),
    ("scan", "AI-scan historie vergelijken over tijd",
     ["ai-scan", "ai-scan-dashboard"], "Verbeteracties"),
    ("scan", "Lage technische score: snelle fixes",
     ["ai-scan", "ai-scan-scores", "ai-scan-verbeteren"], "Hosting en SSL"),
    ("scan", "Lage content-score verbeteren",
     ["ai-scan", "ai-scan-scores", "ai-scan-verbeteren", "aeo-geo-seo"],
     "FAQ en structuur"),
    ("scan", "Van scan naar AEO/GEO/SEO-traject",
     ["ai-scan", "ai-scan-oplossingen", "aeo-geo-seo"], "Pakketkeuze"),
    ("scan", "Scan delen met je marketingbureau",
     ["ai-scan", "ai-scan-dashboard"], "Export en privacy"),
    ("ag", "Agentstatus RUNNING versus PAUSED",
     ["ai-agents", "ai-agents-beheer"], "Taken en logs"),
    ("ag", "Geen agent-slot beschikbaar: wat nu",
     ["ai-agents", "ai-agents-pakketten", "shop-en-pakketten"], "Upgrade"),
    ("ag", "Agent levert geen output: checklist",
     ["ai-agents", "ai-agents-problemen"], "Rechten en limieten"),
    ("ag", "Meerdere agenttypen combineren",
     ["ai-agents", "ai-agents-workflows", "ai-agents-types"], "SEO + content"),
    ("pl", "Plesk reseller: klantabonnement aanmaken",
     ["plesk", "plesk-reseller"], "Resources en limieten"),
    ("pl", "Plesk reseller: white-label merkinstellingen",
     ["plesk", "plesk-reseller"], "Branding"),
    ("pl", "Plesk SSL via Let’s Encrypt vernieuwen",
     ["plesk", "plesk-ssl-beveiliging", "ssl-certificaten"], "HTTPS forceren"),
    ("shop", "Hostingpakket kiezen: checklist",
     ["shop-en-pakketten", "hostingpakketten"], "Opslag en mail"),
    ("shop", "Business-pakket: wat zit erin",
     ["shop-en-pakketten", "business-pakketten"], "Agents en trajecten"),
    ("shop", "Extra Growth versus Business vergelijken",
     ["shop-en-pakketten", "business-pakketten"], "ROI"),
    ("crm", "Wachtwoord vergeten voor klantenpanel",
     ["crm-klantenpanel", "account-en-inloggen"], "2FA herstel"),
    ("crm", "2FA inschakelen op je TripleZero-account",
     ["crm-klantenpanel", "account-en-inloggen", "beveiliging"], "Backup codes"),
    ("crm", "Facturen downloaden en btw-check",
     ["crm-klantenpanel", "facturen-en-betalen", "betalen-en-btw"], "Betaalstatus"),
    ("wp", "Elementor: basispagina bouwen",
     ["wordpress", "wordpress-overige", "bloggen"], "Performance"),
    ("wp", "Elementor en caching: conflicten vermijden",
     ["wordpress", "wordpress-onderhoud"], "CDN en purge"),
    ("wp", "Gutenberg-blokken herbruikbaar maken",
     ["wordpress", "wordpress-overige"], "Patterns"),
    ("wp", "WordPress migreren naar TripleZero iT",
     ["wordpress", "wordpress-installatie", "hosting"], "DNS en SSL"),
    ("wp", "Search Replace na domeinwijziging",
     ["wordpress", "wordpress-onderhoud"], "Serialisatie"),
    ("aeo", "E-commerce SEO: categoriepagina’s",
     ["aeo-geo-seo", "seo-klassiek", "e-commerce-webshops"], "Faceted nav"),
    ("aeo", "Productpagina’s schrijven voor AEO",
     ["aeo-geo-seo", "aeo-antwoordengines", "e-commerce-webshops"], "FAQ"),
    ("aeo", "Lokale landingspagina’s zonder doorway-spam",
     ["aeo-geo-seo", "geo-lokaal"], "NAP-consistentie"),
    ("aeo", "Answer-engine voorbeelden meten in de praktijk",
     ["aeo-geo-seo", "aeo-geo-seo-resultaten"], "KPI’s"),
]


def parent_of(sub: str) -> str | None:
    for slug, _n, _d, parent in NEW_CATEGORIES:
        if slug == sub:
            return parent
    return None


def lead_for(sub: str, title: str) -> str:
    leads = {
        "nextjs-en-react": f"Next.js is het standaard React-framework voor moderne sites bij {BRAND}. Dit artikel legt uit: {title}.",
        "php-maatwerk": f"PHP-maatwerk past wanneer WordPress te beperkt is. We behandelen: {title}.",
        "html-css-js": f"Lichte front-ends blijven snel en onderhoudbaar. Focus: {title}.",
        "landingspaginas": f"Landingspagina’s moeten één doel dienen. We werken uit: {title}.",
        "onderhoud-maatwerk": f"Na livegang begint het echte werk. Onderwerp: {title}.",
        "llm-en-chatbots": f"LLM’s en chatbots helpen alleen met goede grounding en privacy. Onderwerp: {title}.",
        "workflows-n8n-zapier": f"Automatisering bespaart tijd als fouten en geheimen goed geregeld zijn. Focus: {title}.",
        "api-webhooks": f"API’s en webhooks koppelen systemen betrouwbaar. We behandelen: {title}.",
        "ai-content-strategie": f"AI versnelt content, mensen bewaken kwaliteit. Onderwerp: {title}.",
        "ai-consultancy": f"AI-advies begint bij haalbare use-cases. Focus: {title}.",
        "analytics-gtm-matomo": f"Zonder nette meting stuur je blind. We leggen uit: {title}.",
        "conversie-optimalisatie": f"CRO is hypothese-gedreven verbeteren. Onderwerp: {title}.",
        "core-web-vitals": f"Snelheid is UX én SEO. We behandelen: {title}.",
        "toegankelijkheid-wcag": f"Toegankelijkheid is kwaliteit voor iedereen. Focus: {title}.",
        "structured-data-schema": f"Schema helpt machines je content te begrijpen. Onderwerp: {title}.",
        "woocommerce-diepte": f"WooCommerce schaalt met goede basisinstellingen. We werken uit: {title}.",
        "betalingen-mollie-ideal": f"Betalingen moeten betrouwbaar én compliant zijn. Focus: {title}.",
        "productfeed-seo": f"Feeds en on-page SEO versterken elkaar. Onderwerp: {title}.",
        "webshop-performance": f"Trage shops verkopen minder. We behandelen: {title}.",
        "webshop-beveiliging": f"Webshops zijn een populair doelwit. Focus: {title}.",
        "cdn-basics": f"Een CDN brengt content dichter bij bezoekers. Onderwerp: {title}.",
        "cloudflare-dns-proxy": f"Cloudflare verandert DNS én edge-gedrag. We leggen uit: {title}.",
        "caching-strategie": f"Caching is krachtig maar makkelijk fout. Focus: {title}.",
        "image-performance": f"Afbeeldingen domineren vaak LCP. Onderwerp: {title}.",
    }
    return leads.get(sub, f"In dit artikel van {BRAND} behandelen we: {title}.")


def why_steps_pitfalls(sub: str, title: str) -> tuple[list[str], list[str], list[str], str, str]:
    """Return why[], steps[], pitfalls[], tip, warn — varied by sub + title hash."""
    h = int(hashlib.md5(title.encode()).hexdigest()[:8], 16)
    why_sets = {
        "nextjs-en-react": [
            "Duidelijke rendering-keuzes voorkomen SEO- en performanceproblemen.",
            "Scheiding server/client houdt bundles klein.",
            "Goede env- en deploy-discipline voorkomt lekken van secrets.",
        ],
        "php-maatwerk": [
            "Maatwerk PHP geeft controle over data en processen.",
            "Hostinglimieten (CPU, memory) bepalen of shared genoeg is.",
            "Beveiliging moet vanaf dag één in de code zitten.",
        ],
        "landingspaginas": [
            "Eén boodschap per pagina verhoogt conversie.",
            "Snelheid en mobiliteit zijn onderdeel van CRO.",
            "Meting zonder consent schendt privacy én data.",
        ],
        "llm-en-chatbots": [
            "Zonder grounding verzint een bot antwoorden.",
            "API-keys horen nooit in de browser.",
            "Menselijke overdracht houdt klanten tevreden.",
        ],
        "analytics-gtm-matomo": [
            "Tags zonder consent zijn riskant in de EU.",
            "Een nette dataLayer voorkomt chaos later.",
            "Debuggen vóór publish spaart foute rapportages.",
        ],
        "woocommerce-diepte": [
            "Catalogusstructuur bepaalt vindbaarheid en UX.",
            "Checkout-friction kost omzet.",
            "Testen op staging voorkomt live-incidenten.",
        ],
        "cdn-basics": [
            "Edge-caching verlaagt latency wereldwijd.",
            "Verkeerde TTLs geven stale content.",
            "Origin moet bereikbaar blijven bij CDN-storingen.",
        ],
    }
    default_why = [
        f"Dit onderwerp komt vaak terug bij klanten van {BRAND}.",
        "Een vaste werkwijze voorkomt ad-hoc fouten.",
        "Documentatie helpt support sneller mee te kijken.",
    ]
    why = why_sets.get(sub, default_why)

    steps = [
        f"Bepaal het doel van “{title}” en noteer de huidige situatie (screenshot of settings).",
        f"Zorg dat je toegang hebt tot het klantenpanel van {BRAND} en eventueel VPS, CMS of CDN.",
        "Maak waar relevant een backup of werk eerst op staging.",
        f"Voer de wijziging uit die bij “{title}” hoort — één kritieke stap tegelijk.",
        "Test het resultaat op desktop én mobiel, en controleer logs of analytics indien van toepassing.",
        "Documenteer wat je wijzigde (datum, wie, rollback-plan).",
    ]
    # rotate an extra specialized step
    extras = [
        "Controleer DNS en SSL als de wijziging publieke URL’s raakt.",
        "Purge caches (CDN, LiteSpeed, WordPress, browser) na content- of codewijzigingen.",
        "Valideer met een tweede browser of incognitovenster.",
        "Informeer stakeholders als de wijziging conversie of checkout raakt.",
        "Plan een follow-up check na 24–48 uur (propagatie, indexatie of betalingen).",
    ]
    steps.insert(4, extras[h % len(extras)])

    pitfalls = [
        "Te veel tegelijk wijzigen waardoor oorzaak zoeken onmogelijk wordt.",
        "Secrets of API-keys in frontend-code of publieke repo’s zetten.",
        "Caches vergeten te legen en denken dat de fix niet werkt.",
        "Productie gebruiken als enige testomgeving.",
    ]
    if "cloudflare" in title.lower() or sub.startswith("cloudflare"):
        pitfalls.append("MX-records per ongeluk proxied zetten waardoor mail stokt.")
    if "mollie" in title.lower() or "ideal" in title.lower():
        pitfalls.append("Testkeys in productie laten staan.")
    if "wcag" in title.lower() or "toegank" in title.lower():
        pitfalls.append("Alleen automatische scanners vertrouwen zonder handmatige check.")

    tip = f"Bewaar bij {BRAND} tickets altijd domeinnaam, omgeving (staging/productie) en tijdstip van de wijziging."
    warn = "Wijzig nooit DNS, betaalconfiguratie of auth zonder rollback-plan en recente backup."
    return why, steps, pitfalls, tip, warn


def build_articles() -> list[dict]:
    articles: list[dict] = []
    seen_slugs: set[str] = set()
    seen_topics: set[str] = set()

    # Load existing to avoid collisions
    existing = json.loads(CATALOG.read_text())
    for a in existing["articles"]:
        seen_slugs.add(a["slug"])
        seen_topics.add(a["topic"])

    for sub, need in SUB_QUOTAS.items():
        parent = parent_of(sub)
        assert parent, sub
        module = MODULE_OF[sub]
        prefix = PREFIX[module]
        titles = expand_titles(TITLE_BANKS[sub], need, sub)
        for title in titles:
            slug = slugify(title)
            if slug in seen_slugs:
                slug = f"{slug}-{hashlib.md5(title.encode()).hexdigest()[:4]}"
            topic = make_topic(prefix, title)
            while topic in seen_topics:
                topic = f"{topic}x"
            seen_slugs.add(slug)
            seen_topics.add(topic)
            why, steps, pitfalls, tip, warn = why_steps_pitfalls(sub, title)
            articles.append({
                "slug": slug,
                "title": title,
                "categories": [parent, sub],
                "topic": topic,
                "module": module,
                "lead": lead_for(sub, title),
                "why": why,
                "steps": steps,
                "pitfalls": pitfalls,
                "tip": tip,
                "warn": warn,
                "related": RELATED.get(sub, "gerelateerde kennisbankartikelen"),
            })

    for key, title, cats, related in THICKEN:
        module = "thicken"
        prefix = PREFIX[module]
        slug = slugify(title)
        if slug in seen_slugs:
            slug = f"{slug}-{hashlib.md5(title.encode()).hexdigest()[:4]}"
        topic = make_topic(f"{prefix}-{key}", title)
        while topic in seen_topics:
            topic = f"{topic}x"
        seen_slugs.add(slug)
        seen_topics.add(topic)
        sub = cats[1] if len(cats) > 1 else cats[0]
        why, steps, pitfalls, tip, warn = why_steps_pitfalls(sub, title)
        articles.append({
            "slug": slug,
            "title": title,
            "categories": cats,
            "topic": topic,
            "module": module,
            "lead": f"In deze handleiding van {BRAND} gaan we dieper in op: {title}.",
            "why": why,
            "steps": steps,
            "pitfalls": pitfalls,
            "tip": tip,
            "warn": warn,
            "related": related,
        })

    return articles


def ts_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")


def emit_body_module(module: str, export_name: str, arts: list[dict]) -> str:
    related_default = {
        "webdesign": "webdesign, Next.js en onderhoud",
        "ai-integratie": "AI-integratie, automatisering en API’s",
        "analytics-cro": "analytics, CRO en toegankelijkheid",
        "ecommerce": "webshops, betalingen en performance",
        "cdn-performance": "CDN, Cloudflare en caching",
        "thicken": "hosting, DNS, beveiliging en support",
    }[module]

    lines = [
        f'/**',
        f' * Dutch kennisbank bodies — Wave 1 ({module}) for TripleZero iT.',
        f' * Generated by scripts/kennisbank-wave1/generate_wave1.py — curated specs per topic.',
        f' */',
        f'const BRAND = "TripleZero iT";',
        f'',
        f'function p(...paras: string[]) {{',
        f'  return paras.map((t) => `<p>${{t}}</p>`).join("\\n");',
        f'}}',
        f'function h2(t: string) {{',
        f'  return `<h2>${{t}}</h2>`;',
        f'}}',
        f'function ol(items: string[]) {{',
        f'  return `<ol>\\n${{items.map((i) => `  <li>${{i}}</li>`).join("\\n")}}\\n</ol>`;',
        f'}}',
        f'function ul(items: string[]) {{',
        f'  return `<ul>\\n${{items.map((i) => `  <li>${{i}}</li>`).join("\\n")}}\\n</ul>`;',
        f'}}',
        f'function tip(t: string) {{',
        f'  return `<aside class="kb-callout kb-callout-tip"><p><strong>Tip:</strong> ${{t}}</p></aside>`;',
        f'}}',
        f'function warn(t: string) {{',
        f'  return `<aside class="kb-callout kb-callout-warn"><p><strong>Let op:</strong> ${{t}}</p></aside>`;',
        f'}}',
        f'function outro(related?: string) {{',
        f'  return p(',
        f'    `Heb je na het volgen van deze stappen nog vragen? Neem contact op met ${{BRAND}} support via het ticketssysteem of plan een afspraak.`,',
        f'    related',
        f'      ? `Gerelateerd: ${{related}}`',
        f'      : `Bekijk ook andere artikelen over {related_default}.`,',
        f'  );',
        f'}}',
        f'',
        f'type Ctx = {{ title: string; topic: string }};',
        f'',
        f'type Spec = {{',
        f'  lead: string;',
        f'  why: string[];',
        f'  steps: string[];',
        f'  pitfalls: string[];',
        f'  tip: string;',
        f'  warn: string;',
        f'  related: string;',
        f'}};',
        f'',
        f'function howto(title: string, spec: Spec): string {{',
        f'  return [',
        f'    p(spec.lead, `We schrijven vanuit de praktijk bij ${{BRAND}}: hosting, VPS, control panels en trajecten die bij jouw pakket passen.`),',
        f'    h2("Waarom dit belangrijk is"),',
        f'    ul(spec.why),',
        f'    h2(`Stappenplan: ${{title}}`),',
        f'    ol(spec.steps),',
        f'    h2("Veelgemaakte fouten"),',
        f'    ul(spec.pitfalls),',
        f'    tip(spec.tip),',
        f'    warn(spec.warn),',
        f'    outro(spec.related),',
        f'  ].join("\\n");',
        f'}}',
        f'',
        f'const specs: Record<string, Spec> = {{',
    ]

    for a in arts:
        topic = a["topic"]
        lines.append(f'  "{topic}": {{')
        lines.append(f'    lead: `{ts_escape(a["lead"])}`,')
        lines.append(f'    why: {json.dumps(a["why"], ensure_ascii=False)},')
        lines.append(f'    steps: {json.dumps(a["steps"], ensure_ascii=False)},')
        lines.append(f'    pitfalls: {json.dumps(a["pitfalls"], ensure_ascii=False)},')
        lines.append(f'    tip: `{ts_escape(a["tip"])}`,')
        lines.append(f'    warn: `{ts_escape(a["warn"])}`,')
        lines.append(f'    related: `{ts_escape(a["related"])}`,')
        lines.append(f'  }},')

    lines += [
        f'}};',
        f'',
        f'export const {export_name}: Record<string, (ctx: Ctx) => string> = Object.fromEntries(',
        f'  Object.keys(specs).map((topic) => [',
        f'    topic,',
        f'    (ctx: Ctx) => howto(ctx.title, specs[topic]),',
        f'  ]),',
        f');',
        f'',
    ]
    return "\n".join(lines)


def category_i18n_patch() -> dict:
    """EN (+ other locales minimal EN-based) for new categories."""
    data = {
        "webdesign-en-maatwerk": {
            "en": {"name": "Web design & custom builds",
                   "description": "Next.js, PHP, HTML/CSS, landing pages and maintenance for custom sites at TripleZero iT."},
        },
        "ai-integratie-automatisering": {
            "en": {"name": "AI integration & automation",
                   "description": "LLMs, chatbots, n8n/Zapier, APIs, webhooks and AI strategy alongside your hosting and website."},
        },
        "analytics-conversie-toegankelijkheid": {
            "en": {"name": "Analytics, conversion & accessibility",
                   "description": "GTM, Matomo, CRO, Core Web Vitals, WCAG and structured data for measurable growth."},
        },
        "e-commerce-webshops": {
            "en": {"name": "E-commerce & online stores",
                   "description": "WooCommerce, Mollie/iDEAL, product feeds, performance and store security."},
        },
        "cdn-performance-cloudflare": {
            "en": {"name": "CDN, performance & Cloudflare",
                   "description": "CDN, Cloudflare, caching, images and speed for sites at TripleZero iT."},
        },
        "nextjs-en-react": {
            "en": {"name": "Next.js and React",
                   "description": "App Router, SSR/SSG, server components and SEO-ready React apps."},
        },
        "php-maatwerk": {
            "en": {"name": "Custom PHP",
                   "description": "PHP portals, API backends and custom applications."},
        },
        "html-css-js": {
            "en": {"name": "HTML, CSS and JavaScript",
                   "description": "Lean front-end builds without a heavy CMS."},
        },
        "landingspaginas": {
            "en": {"name": "Landing pages",
                   "description": "Conversion-focused landing pages, structure and A/B testing."},
        },
        "onderhoud-maatwerk": {
            "en": {"name": "Custom site maintenance",
                   "description": "Updates, monitoring and iteration after go-live."},
        },
        "llm-en-chatbots": {
            "en": {"name": "LLMs and chatbots",
                   "description": "ChatGPT/Claude integrations, site bots and safe prompts."},
        },
        "workflows-n8n-zapier": {
            "en": {"name": "n8n and Zapier workflows",
                   "description": "Automation between tools, CRM and website."},
        },
        "api-webhooks": {
            "en": {"name": "APIs and webhooks",
                   "description": "Integrations, webhooks, auth and error handling."},
        },
        "ai-content-strategie": {
            "en": {"name": "AI content strategy",
                   "description": "Content calendars, brand voice and AI-assisted writing."},
        },
        "ai-consultancy": {
            "en": {"name": "AI consultancy",
                   "description": "Strategy, use cases and implementation advice."},
        },
        "analytics-gtm-matomo": {
            "en": {"name": "Analytics, GTM and Matomo",
                   "description": "Measurement, tags and privacy-friendly analytics."},
        },
        "conversie-optimalisatie": {
            "en": {"name": "Conversion optimisation",
                   "description": "CRO, funnels, CTAs and A/B testing."},
        },
        "core-web-vitals": {
            "en": {"name": "Core Web Vitals",
                   "description": "LCP, INP, CLS and speed improvements."},
        },
        "toegankelijkheid-wcag": {
            "en": {"name": "Accessibility (WCAG)",
                   "description": "WCAG, keyboard, contrast and screen readers."},
        },
        "structured-data-schema": {
            "en": {"name": "Structured data (schema)",
                   "description": "JSON-LD, FAQ, HowTo, Product and Organization."},
        },
        "woocommerce-diepte": {
            "en": {"name": "WooCommerce deep dive",
                   "description": "Catalogue, checkout, inventory and extensions."},
        },
        "betalingen-mollie-ideal": {
            "en": {"name": "Mollie and iDEAL payments",
                   "description": "Mollie, iDEAL, cards and refunds."},
        },
        "productfeed-seo": {
            "en": {"name": "Product feeds and SEO",
                   "description": "Feeds, rich results and product SEO."},
        },
        "webshop-performance": {
            "en": {"name": "Store performance",
                   "description": "Speed, caching and scalability for shops."},
        },
        "webshop-beveiliging": {
            "en": {"name": "Store security",
                   "description": "PCI practice, fraud detection and hardening."},
        },
        "cdn-basics": {
            "en": {"name": "CDN basics",
                   "description": "What a CDN does and when to use one."},
        },
        "cloudflare-dns-proxy": {
            "en": {"name": "Cloudflare DNS and proxy",
                   "description": "Proxy, DNS, SSL modes and firewall rules."},
        },
        "caching-strategie": {
            "en": {"name": "Caching strategy",
                   "description": "Browser, edge and application cache."},
        },
        "image-performance": {
            "en": {"name": "Image performance",
                   "description": "WebP/AVIF, lazy load and responsive images."},
        },
    }
    # Fill de/fr/es/pt/it with EN copy as placeholder (seed categoryCopy pattern);
    # repair/translate later — plan is NL+EN first for articles; categories need rows.
    for slug, locales in data.items():
        en = locales["en"]
        for loc in ("de", "fr", "es", "pt", "it"):
            locales[loc] = {"name": en["name"], "description": en["description"]}
    return data


def main() -> None:
    arts = build_articles()
    print(f"Generated {len(arts)} articles")
    by_mod: dict[str, list] = {}
    for a in arts:
        by_mod.setdefault(a["module"], []).append(a)
    for m, items in by_mod.items():
        print(f"  module {m}: {len(items)}")

    # Merge catalog
    catalog = json.loads(CATALOG.read_text())
    existing_slugs = {a["slug"] for a in catalog["articles"]}
    existing_cat_slugs = {c[0] for c in catalog["categories"]}

    added_cats = 0
    for slug, name, desc, parent in NEW_CATEGORIES:
        if slug in existing_cat_slugs:
            continue
        row = [slug, name, desc] if parent is None else [slug, name, desc, parent]
        catalog["categories"].append(row)
        existing_cat_slugs.add(slug)
        added_cats += 1

    added_arts = 0
    catalog_arts = []
    for a in arts:
        if a["slug"] in existing_slugs:
            continue
        catalog_arts.append({
            "slug": a["slug"],
            "title": a["title"],
            "categories": a["categories"],
            "topic": a["topic"],
        })
        existing_slugs.add(a["slug"])
        added_arts += 1
    catalog["articles"].extend(catalog_arts)

    CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
    print(f"Catalog: +{added_cats} categories, +{added_arts} articles "
          f"(total cats={len(catalog['categories'])}, arts={len(catalog['articles'])})")

    # Body modules
    export_map = {
        "webdesign": ("webdesignTopicBuilders", "webdesign-bodies.ts"),
        "ai-integratie": ("aiIntegratieTopicBuilders", "ai-integratie-bodies.ts"),
        "analytics-cro": ("analyticsCroTopicBuilders", "analytics-cro-bodies.ts"),
        "ecommerce": ("ecommerceTopicBuilders", "ecommerce-bodies.ts"),
        "cdn-performance": ("cdnPerformanceTopicBuilders", "cdn-performance-bodies.ts"),
        "thicken": ("thickenTopicBuilders", "thicken-bodies.ts"),
    }
    for module, items in by_mod.items():
        export_name, filename = export_map[module]
        path = BODIES_DIR / filename
        path.write_text(emit_body_module(module, export_name, items))
        print(f"Wrote {path.relative_to(ROOT)} ({len(items)} topics)")

    # Save full specs for debugging / rebuild
    specs_path = ROOT / "scripts/kennisbank-wave1/wave1-articles.json"
    slim = [{k: a[k] for k in ("slug", "title", "categories", "topic", "module")} for a in arts]
    specs_path.write_text(json.dumps(slim, ensure_ascii=False, indent=2) + "\n")

    I18N_PATCH.write_text(json.dumps(category_i18n_patch(), ensure_ascii=False, indent=2) + "\n")
    print(f"Wrote {I18N_PATCH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

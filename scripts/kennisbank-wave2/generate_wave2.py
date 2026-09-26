#!/usr/bin/env python3
"""Generate Wave-2 kennisbank catalog + body modules (~460–500 arts, NL+EN specs)."""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CATALOG = ROOT / "prisma/kennisbank/catalog.json"
BODIES_DIR = ROOT / "prisma/kennisbank"
OUT = Path(__file__).resolve().parent
I18N_PATCH = OUT / "i18n-patch.json"
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
    base = slugify(title)[:40].strip("-")
    h = hashlib.md5(title.encode()).hexdigest()[:5]
    return f"{prefix}-{base}-{h}"


def expand_titles(base: list[str], need: int, seed: str) -> list[str]:
    out = list(base)
    i = 1
    angles = [
        ": checklist voor MKB",
        ": veelgemaakte fouten",
        ": stappenplan voor beginners",
        " — tips van TripleZero iT",
        " in productie",
        ": wat je vóór livegang checkt",
    ]
    while len(out) < need:
        src = base[(i - 1) % len(base)]
        if i <= len(angles) * len(base):
            cand = src + angles[(i - 1) % len(angles)]
            if cand.startswith("Praktijk"):
                pass
            if i % 8 == 0:
                cand = f"Praktijkcase: {src[0].lower()}{src[1:]}"
            elif i % 8 == 1 and i > 1:
                cand = f"Probleemoplossing: {src[0].lower()}{src[1:]}"
        else:
            cand = f"{src} ({seed}-{i})"
        if cand not in out:
            out.append(cand)
        i += 1
        if i > 800:
            break
    return out[:need]


NEW_CATEGORIES: list[tuple[str, str, str, str | None]] = [
    ("infrastructuur-servers", "Infrastructuur en servers",
     "Dedicated concepten, rescue, Docker, apps op VPS, VPN en netwerkhardening bij TripleZero iT.", None),
    ("foutmeldingen-troubleshooting", "Foutmeldingen en troubleshooting",
     "HTTP-foutcodes, mailaflevering, DNS/SSL, databases en performance-incidenten oplossen.", None),
    ("privacy-juridisch-compliance", "Privacy, juridisch en compliance",
     "AVG, cookies, webshopregels, verplichte pagina’s en EU-tooling — educatief, geen juridisch advies.", None),
    ("vergelijkingen-keuzehulp", "Vergelijkingen en keuzehulp",
     "Platform-, hosting-, betaal- en builderkeuzes met duidelijke criteria voor MKB.", None),
    # infra subs
    ("dedicated-en-remote-mgmt", "Dedicated en remote management",
     "Dedicated-concepten, IPMI/iLO/iDRAC en remote console (generiek voor VPS/dedicated).", "infrastructuur-servers"),
    ("rescue-recovery", "Rescue en recovery",
     "Rescue mode, netboot, wachtwoordreset en herstelscenario’s.", "infrastructuur-servers"),
    ("containers-docker", "Containers en Docker",
     "Docker op VPS, compose, volumes en veilige basisconfiguratie.", "infrastructuur-servers"),
    ("apps-op-vps", "Apps op VPS",
     "Node.js, Python, Git-deploy en process managers op je VPS.", "infrastructuur-servers"),
    ("vpn-netwerk", "VPN en netwerk",
     "WireGuard, UFW/firewalld, Fail2ban en netwerkhardening.", "infrastructuur-servers"),
    # troubleshooting subs
    ("http-foutcodes", "HTTP-foutcodes",
     "401, 403, 404, 500, 502 en 504: oorzaken en fixes.", "foutmeldingen-troubleshooting"),
    ("mail-aflevering-fouten", "Mailafleveringsfouten",
     "Blacklists, greylisting, bounces en SMTP-problemen.", "foutmeldingen-troubleshooting"),
    ("dns-ssl-fouten", "DNS- en SSL-fouten",
     "Propagatie, certificaatfouten, mixed content en HSTS.", "foutmeldingen-troubleshooting"),
    ("database-fouten", "Databasefouten",
     "Connecties, corruptie, MyISAM/InnoDB en import/export.", "foutmeldingen-troubleshooting"),
    ("performance-incidenten", "Performance-incidenten",
     "Traffic spikes, trage queries, CPU en schijf vol.", "foutmeldingen-troubleshooting"),
    # privacy subs
    ("avg-website", "AVG en websites",
     "Dataminimalisatie, verwerkers en praktische website-checks.", "privacy-juridisch-compliance"),
    ("cookies-consent", "Cookies en consent",
     "Wanneer een banner nodig is en Consent Mode.", "privacy-juridisch-compliance"),
    ("webshop-regels-nl", "Webshopregels NL/EU",
     "Herroeping, prijsvermelding en ACM-thema’s voor webshops.", "privacy-juridisch-compliance"),
    ("juridische-paginas", "Juridische pagina’s",
     "Privacy, cookies, voorwaarden: wat erin hoort (geen template-copy).", "privacy-juridisch-compliance"),
    ("eu-tooling", "EU-tooling en soevereiniteit",
     "Europese alternatieven en leveranciersrisico’s.", "privacy-juridisch-compliance"),
    # vergelijkingen subs
    ("platform-vergelijkingen", "Platformvergelijkingen",
     "WooCommerce, Shopify, PrestaShop en CMS-keuzes.", "vergelijkingen-keuzehulp"),
    ("hosting-keuze", "Hostingkeuze",
     "Shared, managed, VPS en wanneer wat past.", "vergelijkingen-keuzehulp"),
    ("betaalproviders", "Betaalproviders",
     "Mollie, Stripe en criteria voor NL-webshops.", "vergelijkingen-keuzehulp"),
    ("builders-cms", "Builders en CMS",
     "Elementor, Gutenberg, custom themes en websitebuilders.", "vergelijkingen-keuzehulp"),
]

MODULE_OF = {
    "infrastructuur-servers": "infra",
    "dedicated-en-remote-mgmt": "infra",
    "rescue-recovery": "infra",
    "containers-docker": "infra",
    "apps-op-vps": "infra",
    "vpn-netwerk": "infra",
    "foutmeldingen-troubleshooting": "troubleshooting",
    "http-foutcodes": "troubleshooting",
    "mail-aflevering-fouten": "troubleshooting",
    "dns-ssl-fouten": "troubleshooting",
    "database-fouten": "troubleshooting",
    "performance-incidenten": "troubleshooting",
    "privacy-juridisch-compliance": "privacy",
    "avg-website": "privacy",
    "cookies-consent": "privacy",
    "webshop-regels-nl": "privacy",
    "juridische-paginas": "privacy",
    "eu-tooling": "privacy",
    "vergelijkingen-keuzehulp": "vergelijkingen",
    "platform-vergelijkingen": "vergelijkingen",
    "hosting-keuze": "vergelijkingen",
    "betaalproviders": "vergelijkingen",
    "builders-cms": "vergelijkingen",
}

PREFIX = {
    "infra": "tz-w2-infra",
    "troubleshooting": "tz-w2-ts",
    "privacy": "tz-w2-priv",
    "vergelijkingen": "tz-w2-vgl",
    "thicken": "tz-w2-th",
    "rewrite": "tz-w2-rw",
}

RELATED = {
    "dedicated-en-remote-mgmt": "rescue mode, firewall en VPS-console",
    "rescue-recovery": "backups, snapshots en remote management",
    "containers-docker": "VPS-hardening en reverse proxy",
    "apps-op-vps": "Node/Python, Git-deploy en process managers",
    "vpn-netwerk": "WireGuard, UFW en Fail2ban",
    "http-foutcodes": "logs, .htaccess en PHP-fouten",
    "mail-aflevering-fouten": "SPF/DKIM/DMARC en blacklists",
    "dns-ssl-fouten": "DNS-propagatie en certificaten",
    "database-fouten": "export/import en InnoDB",
    "performance-incidenten": "caching, queries en traffic spikes",
    "avg-website": "cookies, verwerkers en dataminimalisatie",
    "cookies-consent": "Consent Mode en cookiebanners",
    "webshop-regels-nl": "herroeping en prijsvermelding",
    "juridische-paginas": "privacyverklaring en voorwaarden",
    "eu-tooling": "Europese alternatieven voor analytics en mail",
    "platform-vergelijkingen": "WooCommerce, Shopify en PrestaShop",
    "hosting-keuze": "shared, managed en VPS",
    "betaalproviders": "Mollie versus Stripe",
    "builders-cms": "Elementor, Gutenberg en custom",
}

SUB_QUOTAS = {
    "dedicated-en-remote-mgmt": 22,
    "rescue-recovery": 22,
    "containers-docker": 22,
    "apps-op-vps": 22,
    "vpn-netwerk": 22,
    "http-foutcodes": 20,
    "mail-aflevering-fouten": 20,
    "dns-ssl-fouten": 20,
    "database-fouten": 20,
    "performance-incidenten": 20,
    "avg-website": 16,
    "cookies-consent": 16,
    "webshop-regels-nl": 16,
    "juridische-paginas": 16,
    "eu-tooling": 16,
    "platform-vergelijkingen": 18,
    "hosting-keuze": 18,
    "betaalproviders": 18,
    "builders-cms": 18,
}

TITLE_BANKS: dict[str, list[str]] = {
    "dedicated-en-remote-mgmt": [
        "Wat is een dedicated server en wanneer kies je die?",
        "Verschil tussen dedicated, VPS en shared hosting",
        "Remote console: IPMI, iLO en iDRAC uitgelegd",
        "Veilig inloggen op een remote management interface",
        "ISO mounten via virtual media (conceptueel)",
        "Out-of-band management: waarom het telt bij storingen",
        "Hardware monitoring: SMART, temperatuur en alerts",
        "RAID-niveaus kiezen voor web- en databaseworkloads",
        "Firmware-updates plannen zonder lange downtime",
        "Netwerkkaarten, bonding en redundantie op servers",
        "KVM/IP-console gebruiken bij netwerkproblemen",
        "Dedicated resources versus burstable VPS",
        "Colocation versus dedicated hosting: keuzehulp",
        "Serverschijven: SATA, NVMe en endurance (DWPD)",
        "BMC-wachtwoorden en netwerkisolatie",
        "Documenteer je hardwareconfiguratie voor support",
    ],
    "rescue-recovery": [
        "Rescue mode: wanneer en hoe je hem inzet",
        "Rootwachtwoord resetten via rescue / single user",
        "Bestanden redden als de OS-schijf niet meer boot",
        "fstab-fouten repareren vanuit rescue",
        "Netwerk herstellen na verkeerde firewallregels",
        "Grub/bootloader problemen diagnosticeren",
        "Snapshot terugzetten versus full backup restore",
        "Disaster recovery: RTO en RPO bepalen",
        "3-2-1 backupstrategie voor VPS en hosting",
        "Testen van restores vóór je ze nodig hebt",
        "Corrupted filesystem check (fsck) veilig uitvoeren",
        "Data redden naar een tweede volume",
        "SSH-sleutels herstellen na lock-out",
        "Kernel panic: eerste triage stappen",
        "Communiceren met support tijdens een outage",
        "Nazorg: post-mortem na een herstelactie",
    ],
    "containers-docker": [
        "Docker op een TripleZero iT-VPS: veilige basis",
        "Docker Compose voor een simpele webstack",
        "Volumes en persistente data in containers",
        "Poorten publiceren zonder alles open te zetten",
        "Images updaten en vulnerability scans",
        "Logs van containers verzamelen en roteren",
        "Reverse proxy (Caddy/Nginx) vóór containers",
        "Resource limits: CPU en memory per container",
        "Secrets niet in Dockerfiles stoppen",
        "Multi-stage builds voor kleinere images",
        "Docker netwerken: bridge versus host",
        "Healthchecks en restart policies",
        "Backup van volumes naast applicatiecode",
        "Rootless Docker: wanneer overwegen",
        "Containers versus VM’s: keuzehulp voor MKB",
        "Opschonen: dangling images en build cache",
    ],
    "apps-op-vps": [
        "Node.js-app draaien met systemd of PM2",
        "Python (FastAPI/Django) deployen op een VPS",
        "Git-based deploy: pull, build, restart",
        "Omgevingsvariabelen veilig beheren op de server",
        "Process managers: PM2 versus systemd",
        "Zero-downtime restart van Node-processen",
        "Uvicorn/Gunicorn achter Nginx",
        "Cron versus systemd timers voor jobs",
        "Logrotatie voor app-logs",
        "Health endpoint en uptime monitoring",
        "Deploy keys en read-only Git-toegang",
        "Staging-VPS naast productie",
        "Firewall alleen poort 80/443 openbaar",
        "Swap en OOM-killer bij geheugenlekken",
        "Node version managers (nvm) in productie",
        "Python virtualenv en dependency pinning",
    ],
    "vpn-netwerk": [
        "WireGuard VPN opzetten op je VPS",
        "UFW basisregels voor webservers",
        "firewalld zones begrijpen",
        "Fail2ban jails tunen voor SSH en webmail",
        "SSH hardening: keys, AllowUsers, MaxAuthTries",
        "Poortscanning detecteren en reageren",
        "Private networking tussen servers",
        "Split-tunnel VPN voor remote teams",
        "DNS lekken via VPN voorkomen",
        "Rate limiting op SSH met Fail2ban",
        "nftables versus iptables: korte intro",
        "Geo-blocking: wanneer wel of niet",
        "OpenVPN versus WireGuard voor MKB",
        "Bastion host / jump host patroon",
        "Netwerkdiagram documenteren voor support",
        "Incident: verdachte outbound connecties",
    ],
    "http-foutcodes": [
        "HTTP 401 Unauthorized: oorzaken en fixes",
        "HTTP 403 Forbidden op je website oplossen",
        "HTTP 404: echte missers versus soft-404",
        "HTTP 500 Internal Server Error stapsgewijs",
        "HTTP 502 Bad Gateway diagnosticeren",
        "HTTP 504 Gateway Timeout: waar kijk je?",
        "HTTP 429 Too Many Requests en rate limits",
        "Mixed content na HTTPS-migratie",
        "Redirect loops (ERR_TOO_MANY_REDIRECTS)",
        "403 na verhuizing: rechten en ownership",
        "500 na plugin-update: recovery zonder paniek",
        "502 achter reverse proxy of CDN",
        "Custom error pages die helpen i.p.v. verwarren",
        "Logs lezen: access_log versus error_log",
        "PHP fatal errors omzetten naar bruikbare fixes",
        "Statuscodes meten in monitoring",
    ],
    "mail-aflevering-fouten": [
        "Blacklist: controleren en delisten",
        "Greylisting uitgelegd voor ondernemers",
        "Bouncecodes lezen (4xx versus 5xx)",
        "SMTP poorten 25, 465 en 587: wat wanneer",
        "Outbound mail rate limits begrijpen",
        "SPF flattening wanneer je te veel lookups hebt",
        "DMARC RUA/RUF-rapporten interpreteren",
        "BIMI voor merken: voorwaarden en DNS",
        "ARC: waarom forwards SPF kapotmaken",
        "Gmail als client voor je domeinmailbox",
        "IMAP-migratie tussen hosts (conceptueel)",
        "Catch-all: risico’s en alternatieven",
        "Shared mailbox versus alias versus forward",
        "Webmail filters die mail ‘kwijtraken’",
        "Autodiscover troubleshooting",
        "Submission versus open relay: het verschil",
    ],
    "dns-ssl-fouten": [
        "DNS propagatie: TTL en caches legen",
        "rDNS / PTR records voor mailservers",
        "DNSSEC troubleshooting bij validatiefouten",
        "CAA-policies strakker zetten",
        "SSL-fout: NET::ERR_CERT_COMMON_NAME_INVALID",
        "Let’s Encrypt authorization failed oplossen",
        "HSTS preload: wanneer je er klaar voor bent",
        "EV/OV versus DV certificaten",
        "CSR genereren met OpenSSL",
        "SNI en meerdere certificaten op één IP",
        "Wildcard SSL: DNS-01 validatie",
        "Certificate chain incomplete fixen",
        "TLS-versies en cipher suites updaten",
        "DNS alleen versus proxied (Cloudflare) conflicten",
        "Split-horizon DNS: valkuilen",
        "Nameserver-wijziging checklist",
    ],
    "database-fouten": [
        "Databaseconnectie geweigerd: checklist",
        "MyISAM naar InnoDB converteren",
        "Export en import van grote databases",
        "Table corruptie: repair versus restore",
        "Max connections bereikt: wat nu?",
        "Slow query log inschakelen en lezen",
        "Charset/collation mismatches (utf8mb4)",
        "Deadlocks in webshops herkennen",
        "Backup van DB los van files",
        "Replica lag (conceptueel) bij groei",
        "Plesk/DirectAdmin DB-gebruikersrechten",
        "SQL-dump veilig overzetten via SSH",
        "Schijf vol door binary logs",
        "Indexen die writes vertragen",
        "Staging-DB anonimiseren vóór delen",
        "MariaDB versus MySQL: praktische verschillen",
    ],
    "performance-incidenten": [
        "Traffic spike: diagnose in 15 minuten",
        "CPU 100%: processen vinden (top/htop)",
        "Schijf of inodes vol: spoedacties",
        "Trage TTFB: DNS, PHP of database?",
        "Redis object cache voor WordPress",
        "Memcached wanneer Redis niet past",
        "LiteSpeed Cache diep afstellen",
        "Third-party scripts die de site platleggen",
        "HTTP/3 en QUIC: wanneer het helpt",
        "Hotlink-protection tegen bandbreedtediefstal",
        "Cronjobs die ’s nachts alles vastzetten",
        "Opcache en PHP-FPM workers tunen",
        "N+1 queries in webshops",
        "CDN origin overload voorkomen",
        "Incidentcommunicatie naar klanten",
        "Post-incident: capacity planning",
    ],
    "avg-website": [
        "AVG-checklist voor je website (educatief)",
        "Dataminimalisatie in formulieren",
        "Verwerkersovereenkomsten: wanneer relevant",
        "Bewaartermijnen voor leads en logs",
        "Rechten van betrokkenen: inzage en verwijdering",
        "DPIA: wanneer overwegen (hoog niveau)",
        "Hosting buiten de EER: risico’s benoemen",
        "Logging zonder onnodige persoonsgegevens",
        "Toegang tot klantendata: least privilege",
        "Incidentmelding: procesklaar maken",
        "Nieuwsbrief: aantoonbare toestemming",
        "Analytics zonder cookies waar mogelijk",
        "Kindgerichte sites: extra aandachtspunten",
        "Documenteer je verwerkingen eenvoudig",
    ],
    "cookies-consent": [
        "Wanneer is een cookiebanner verplicht?",
        "Functionele versus tracking cookies",
        "Consent Mode v2 in het kort",
        "Cookiebanner die UX niet sloopt",
        "Third-party tags pas ná toestemming",
        "Local storage en consent",
        "CMP kiezen: criteria voor MKB",
        "Server-side tagging en privacy",
        "Matomo cookieless meten",
        "Google fonts self-hosten om requests te vermijden",
        "YouTube embeds privacyvriendelijk",
        "A/B-tools en consent",
        "Jaarlijkse cookie-audit",
        "Documenteer je cookiedoelen",
    ],
    "webshop-regels-nl": [
        "Herroepingsrecht: wat je duidelijk moet tonen",
        "Prijsvermelding en BTW op productpagina’s",
        "Bedrijfsgegevens in footer en impressum",
        "Betaalmethoden en consumentenvertrouwen",
        "Levertijden realistisch communiceren",
        "Klachtenafhandeling online shops",
        "Productreviews en misleiding vermijden",
        "Digitale producten versus fysieke goederen",
        "Geoblocking binnen de EU: aandachtspunten",
        "Duurzaamheidclaims: wees concreet",
        "B2B versus B2C checkout-verschillen",
        "Voorwaarden wijzigen: hoe communiceer je",
        "Bewijs van bestelling en ordermails",
        "ACM-thema’s volgen zonder paniek",
    ],
    "juridische-paginas": [
        "Welke juridische pagina’s hoort een site te hebben?",
        "Privacyverklaring: inhoudsopgave die klopt",
        "Cookiebeleid koppelen aan echte tags",
        "Algemene voorwaarden: scope en leesbaarheid",
        "Herroepingsformulier vindbaar maken",
        "Disclaimer: wat wel en niet zinvol is",
        "Accessibiliteitsverklaring (waar relevant)",
        "Meertalige juridische teksten consistent houden",
        "Versiebeheer van voorwaarden",
        "Links vanuit checkout naar voorwaarden",
        "Geen copy-paste van concurrenten",
        "Juridische review: wanneer inschakelen",
        "Contactgegevens consistent met KvK",
        "PDF-downloads van voorwaarden",
    ],
    "eu-tooling": [
        "Europese analytics-alternatieven overwegen",
        "E-mailproviders en datalocatie",
        "CLOUD Act: wat MKB moet snappen",
        "Vendor lock-in verminderen",
        "Self-host Matomo op je VPS",
        "Fonts en CDN’s binnen EU-keuzes",
        "AI-tools en bedrijfsgeheimen",
        "Exit-strategie bij SaaS-leveranciers",
        "Open-source stacks voor soevereiniteit",
        "DNS en registrar: spreid risico’s",
        "Backup bij een tweede provider",
        "Contractuele datalocatie-eisen",
        "Transparantie naar klanten over tooling",
        "Roadmap: eerst meten, dan migreren",
    ],
    "platform-vergelijkingen": [
        "WooCommerce versus Shopify: criteria voor NL",
        "WooCommerce versus PrestaShop",
        "WordPress versus Wix/Squarespace: eigenaarschap",
        "Headless commerce: wanneer zinvol",
        "Marketplace versus eigen webshop",
        "SaaS-CMS versus self-hosted CMS",
        "B2B-portals: maatwerk versus plugins",
        "Multi-store: één platform of meerdere",
        "App Store-kosten meenemen in TCO",
        "Migratiekosten realistisch inschatten",
        "SEO-controle: wie bezit de URL’s?",
        "Extensie-ecosysteem vergelijken",
        "Supportmodellen: ticket versus agency",
        "Keuze-matrix invullen met stakeholders",
        "Pilot: bewijs vóór big-bang migratie",
    ],
    "hosting-keuze": [
        "Shared versus managed WordPress hosting",
        "Wanneer is een VPS de betere keuze?",
        "Reseller versus unmanaged: wat je zelf doet",
        "Resources: CPU, RAM, inodes en traffic",
        "Uptime-SLA’s lezen zonder marketing",
        "Lokale support in het Nederlands",
        "Staging-omgeving als harde eis",
        "Backupretentie vergelijken",
        "E-mail op dezelfde host of apart?",
        "Schaalpad: shared → VPS → cluster",
        "Prijs per jaar inclusief SSL en backups",
        "Vendor lock-in bij proprietary panels",
        "Green hosting claims beoordelen",
        "Security-addons: Imunify, WAF, scans",
        "Beslisboom voor starters en agencies",
    ],
    "betaalproviders": [
        "Mollie versus Stripe voor Nederlandse shops",
        "iDEAL als default: conversie-impact",
        "Transactiekosten eerlijk vergelijken",
        "Payout-snelheid en cashflow",
        "Chargebacks en fraudetools",
        "Subscriptions en recurring billing",
        "Multi-currency voor EU-klanten",
        "PCI-scope verkleinen met hosted fields",
        "Webhook-betrouwbaarheid testen",
        "Sandbox versus live: checklist",
        "Privacy en datalocatie van PSP’s",
        "Apple Pay / Google Pay toevoegen",
        "Facturatie koppelen aan boekhouding",
        "Failover: tweede betaalprovider?",
        "Klantcommunicatie bij mislukte betaling",
    ],
    "builders-cms": [
        "Elementor versus Gutenberg: performance",
        "Custom theme versus pagebuilder",
        "Websitebuilders (Wix e.d.) versus WordPress",
        "Next.js versus WordPress voor content sites",
        "Low-code builders voor landingspagina’s",
        "Design system hergebruiken zonder builder-lock",
        "Toegankelijkheid in pagebuilders",
        "Updates en breaking changes bij builders",
        "Export/portabiliteit van content",
        "Agency-workflow: Figma naar CMS",
        "Block patterns als middenweg",
        "Pagebuilder-plugins die je site trager maken",
        "Headless CMS: extra complexiteit?",
        "Keuzehulp: snelheid, flexibiliteit, kosten",
        "Migreren van builder naar custom: stappen",
    ],
}

# Thicken existing categories (~160)
THICKEN: list[tuple[str, str, list[str], str]] = []

def add_thicken(key: str, title: str, cats: list[str], related: str) -> None:
    THICKEN.append((key, title, cats, related))


# E-mail advanced
for t, cats, rel in [
    ("BIMI DNS-records toevoegen voor je merklogo in mail", ["e-mail", "spam-en-veiligheid", "dns-records"], "DMARC en logo-vereisten"),
    ("ARC begrijpen bij doorgestuurde mail", ["e-mail", "spam-en-veiligheid"], "SPF en forwards"),
    ("SPF flattening wanneer je de lookup-limiet raakt", ["e-mail", "dns-records", "spam-en-veiligheid"], "SPF basis"),
    ("DMARC aggregate reports (RUA) lezen", ["e-mail", "spam-en-veiligheid"], "DMARC policy"),
    ("DMARC failure reports (RUF) veilig gebruiken", ["e-mail", "spam-en-veiligheid"], "Privacy in reports"),
    ("Greylisting: vertraging of spamfilter?", ["e-mail", "spam-en-veiligheid"], "Bouncegedrag"),
    ("SMTP 587 submission correct instellen", ["e-mail", "e-mail-instellen"], "Poorten en SSL"),
    ("Poort 25 outbound geblokkeerd: wat nu?", ["e-mail", "mail-aflevering-fouten"], "Submission poorten"),
    ("Gmail koppelen als client aan je hostingmailbox", ["e-mail", "e-mail-instellen"], "IMAP/SMTP"),
    ("IMAP-mailbox migreren zonder mailverlies", ["e-mail", "mailbox-beheer"], "Backup van mail"),
    ("Alias versus forward versus catch-all", ["e-mail", "mailbox-beheer"], "Spamrisico’s"),
    ("Webmail zoekindex en filters die mail verbergen", ["e-mail", "webmail"], "Mappen en regels"),
    ("Autodiscover records controleren", ["e-mail", "dns-records", "microsoft-mail"], "CNAME/SRV"),
    ("Outbound rate limiting bij gedeelde IP’s", ["e-mail", "spam-en-veiligheid"], "Reputation"),
    ("Shared mailbox in Roundcube of Outlook", ["e-mail", "mailbox-beheer", "webmail"], "Rechten"),
    ("CalDAV/CardDAV conceptueel naast IMAP", ["e-mail", "e-mail-instellen"], "Clients"),
]:
    add_thicken("mail", t, cats, rel)

# WordPress
for t, cats, rel in [
    ("WP-CLI: WordPress beheren via de terminal", ["wordpress", "wordpress-onderhoud", "vps"], "SSH en backups"),
    ("WordPress.org versus WordPress.com", ["wordpress", "wordpress-installatie"], "Hostingkeuze"),
    ("Excerpts instellen voor SEO en overzichten", ["wordpress", "bloggen", "seo-klassiek"], "Themes"),
    ("Permalinks veilig wijzigen zonder 404-chaos", ["wordpress", "wordpress-onderhoud"], "Redirects"),
    ("Gravity Forms: basisformulier en notificaties", ["wordpress", "wordpress-overige"], "Spamprotectie"),
    ("Staging naar live: checklist zonder dataverlies", ["wordpress", "wordpress-onderhoud", "hosting"], "DNS en cache"),
    ("WordPress Multisite: wanneer wel of niet", ["wordpress", "wordpress-installatie"], "Domeinmapping"),
    ("WP-Cron uitschakelen en echte cron gebruiken", ["wordpress", "php-en-scripts", "wordpress-onderhoud"], "Cronjobs"),
    ("XML-RPC uitschakelen of beperken", ["wordpress", "wordpress-beveiliging", "beveiliging"], "Brute force"),
    ("User enumeration blokkeren", ["wordpress", "wordpress-beveiliging"], "REST API"),
    ("Hacked WordPress: diep herstelplan", ["wordpress", "wordpress-beveiliging", "beveiliging"], "Malware en backups"),
    ("object-cache.php drop-in voor Redis", ["wordpress", "wordpress-onderhoud", "cdn-performance-cloudflare"], "Object cache"),
    ("WP_DEBUG veilig gebruiken op staging", ["wordpress", "wordpress-onderhoud"], "Logs"),
    ("REST API harden zonder de site te breken", ["wordpress", "wordpress-beveiliging"], "Applicatie-wachtwoorden"),
    ("File integrity monitoring voor WP-core", ["wordpress", "wordpress-beveiliging"], "Updates"),
    ("Gutenberg patterns herbruikbaar maken", ["wordpress", "wordpress-overige"], "Design system"),
    ("Elementor performance: widgets en assets", ["wordpress", "wordpress-onderhoud"], "Caching"),
    ("reCAPTCHA op WordPress-formulieren", ["wordpress", "wordpress-beveiliging"], "Spam"),
    ("WordPress.org vs .com: updates en plugins", ["wordpress", "wordpress-installatie"], "Eigenaarschap"),
    ("Media library opruimen zonder broken links", ["wordpress", "wordpress-onderhoud"], "Uploads"),
]:
    add_thicken("wp", t, cats, rel)

# Security / SSL
for t, cats, rel in [
    ("EV en OV certificaten: wanneer zinvol", ["beveiliging", "ssl-certificaten"], "DV en Let’s Encrypt"),
    ("CSR genereren en certificaat installeren", ["beveiliging", "ssl-certificaten"], "OpenSSL"),
    ("HSTS preload checklist", ["beveiliging", "ssl-certificaten"], "HTTPS forceren"),
    ("Security headers: CSP, XFO, Referrer-Policy", ["beveiliging", "firewall-en-hacks"], "CDN headers"),
    ("Content-Security-Policy voor WordPress", ["beveiliging", "wordpress-beveiliging"], "Inline scripts"),
    ("WAF-regels tunen zonder false positives", ["beveiliging", "firewall-en-hacks", "cdn-performance-cloudflare"], "Cloudflare"),
    ("Imunify/malware-scans interpreteren", ["beveiliging", "wordpress-beveiliging"], "Quarantaine"),
    ("3-2-1 backups in de praktijk", ["beveiliging", "hosting", "vps"], "Restores testen"),
    ("RTO en RPO uitleggen aan stakeholders", ["beveiliging", "support", "vps"], "DR-plan"),
    ("Incident response playbook voor je site", ["beveiliging", "support"], "Communicatie"),
    ("Passkeys voor website-logins", ["beveiliging", "veilig-online-wachtwoorden"], "2FA"),
    ("Have I Been Pwned: lekchecks voor teams", ["beveiliging", "veilig-online-wachtwoorden"], "Password managers"),
    ("ModSecurity false positives debuggen", ["beveiliging", "firewall-en-hacks"], "Logs"),
    ("DDoS: eerste mitigatiestappen", ["beveiliging", "cdn-performance-cloudflare"], "CDN/proxy"),
    ("SSH brute-force stoppen", ["beveiliging", "vps", "linux-vps"], "Fail2ban"),
    ("JetBackup restore-scenario’s", ["beveiliging", "hosting", "directadmin"], "Bestanden + DB"),
]:
    add_thicken("sec", t, cats, rel)

# DNS
for t, cats, rel in [
    ("PTR / rDNS aanvragen voor je mail-IP", ["domeinnamen", "dns-records", "e-mail"], "Blacklists"),
    ("Geavanceerde CAA-policies per issuer", ["domeinnamen", "dns-records", "ssl-certificaten"], "Let’s Encrypt"),
    ("DNSSEC storingen na nameserver-wissel", ["domeinnamen", "dns-records", "beveiliging"], "DS-records"),
    ("AAAA (IPv6) naast A-records", ["domeinnamen", "dns-records", "hosting"], "Dual-stack"),
    ("SRV-records troubleshooten", ["domeinnamen", "dns-records", "microsoft"], "Autodiscover"),
    ("DNS load balancing met meerdere A-records", ["domeinnamen", "dns-records"], "TTL"),
    ("Interne docs: DNS change window", ["domeinnamen", "dns-records", "support"], "Communicatie"),
    ("NXDOMAIN versus SERVFAIL onderscheiden", ["domeinnamen", "dns-records"], "Debugging"),
]:
    add_thicken("dns", t, cats, rel)

# CRM / shop admin
for t, cats, rel in [
    ("Fair use en dataverkeer: wat betekent het?", ["shop-en-pakketten", "hostingpakketten", "opslag-en-verkeer"], "Upgraden"),
    ("Dienst opzeggen: opzegtermijn en exports", ["crm-klantenpanel", "shop-en-pakketten"], "Backups meenemen"),
    ("Automatische incasso mislukt: checklist", ["crm-klantenpanel", "facturen-en-betalen", "betalen-en-btw"], "Betaalgegevens"),
    ("Affiliateprogramma: tracking en commissies", ["shop-en-pakketten", "crm-klantenpanel"], "Voorwaarden"),
    ("Factuuradres wijzigen vóór BTW-periode", ["crm-klantenpanel", "facturen-en-betalen"], "KvK-gegevens"),
    ("Extra contactpersoon toevoegen aan account", ["crm-klantenpanel", "account-en-inloggen"], "Rechten"),
    ("Downgrade van pakket: waar let je op?", ["shop-en-pakketten", "hostingpakketten"], "Limieten"),
    ("Offerte naar bestelling in het klantenpanel", ["crm-klantenpanel", "shop-en-pakketten"], "Betaling"),
]:
    add_thicken("crm", t, cats, rel)

# CDN / performance
for t, cats, rel in [
    ("Redis als object cache naast page cache", ["cdn-performance-cloudflare", "caching-strategie", "wordpress"], "Purge"),
    ("Memcached voor sessies en cache", ["cdn-performance-cloudflare", "caching-strategie", "vps"], "Apps op VPS"),
    ("LiteSpeed Cache: ESI en login-excepties", ["cdn-performance-cloudflare", "caching-strategie", "wordpress"], "CyberPanel/OLS"),
    ("HTTP/3 inschakelen achter CDN", ["cdn-performance-cloudflare", "cdn-basics"], "Clientsupport"),
    ("Third-party script budget afdwingen", ["cdn-performance-cloudflare", "core-web-vitals", "analytics-gtm-matomo"], "Consent"),
    ("Image CDN resizing versus vooraf exporteren", ["cdn-performance-cloudflare", "image-performance"], "CLS"),
    ("Brotli versus Gzip op origin", ["cdn-performance-cloudflare", "caching-strategie"], "CDN"),
    ("Early Hints (103) conceptueel", ["cdn-performance-cloudflare", "core-web-vitals"], "Browsers"),
]:
    add_thicken("cdn", t, cats, rel)

# E-commerce deepen
for t, cats, rel in [
    ("WooCommerce HPOS: wat verandert er?", ["e-commerce-webshops", "woocommerce-diepte"], "Updates"),
    ("Mollie subscriptions voor lidmaatschappen", ["e-commerce-webshops", "betalingen-mollie-ideal"], "Webhooks"),
    ("WooCommerce Blocks checkout optimaliseren", ["e-commerce-webshops", "woocommerce-diepte"], "Conversie"),
    ("B2B-prijzen in WooCommerce", ["e-commerce-webshops", "woocommerce-diepte"], "Rollen"),
    ("Meertalige webshop zonder duplicate content", ["e-commerce-webshops", "productfeed-seo", "aeo-geo-seo"], "hreflang"),
    ("Abandoned cart e-mails ethisch inzetten", ["e-commerce-webshops", "conversie-optimalisatie"], "Consent"),
    ("Voorraad en backorders helder communiceren", ["e-commerce-webshops", "woocommerce-diepte"], "Checkout"),
    ("iDEAL QR en mobile checkout", ["e-commerce-webshops", "betalingen-mollie-ideal"], "Conversie"),
    ("Productvarianten en SEO: één URL-strategie", ["e-commerce-webshops", "productfeed-seo"], "Canonicals"),
    ("Retourproces voor webshops technisch ondersteunen", ["e-commerce-webshops", "webshop-regels-nl"], "Orderstatus"),
    ("BTW-tarieven per land in WooCommerce", ["e-commerce-webshops", "betalingen-mollie-ideal"], "EU-shops"),
    ("Voorraadfeeds synchroniseren met Magazijn", ["e-commerce-webshops", "woocommerce-diepte"], "API’s"),
    ("Checkout fields minimaliseren zonder dataverlies", ["e-commerce-webshops", "conversie-optimalisatie"], "UX"),
    ("Frauderegels bij hoge AOV-bestellingen", ["e-commerce-webshops", "webshop-beveiliging"], "PSP"),
    ("Pakketpunten en verzendplugins vergelijken", ["e-commerce-webshops", "woocommerce-diepte"], "Checkout"),
    ("Gift cards en tegoeden veilig verwerken", ["e-commerce-webshops", "betalingen-mollie-ideal"], "Boekhouding"),
    ("Pre-order flows zonder voorraadchaos", ["e-commerce-webshops", "woocommerce-diepte"], "Communicatie"),
    ("Marketplace-feeds naast eigen shop", ["e-commerce-webshops", "productfeed-seo"], "Kanalen"),
    ("WooCommerce REST API-keys roteren", ["e-commerce-webshops", "webshop-beveiliging"], "Integraties"),
    ("Performance budget voor productpagina’s", ["e-commerce-webshops", "webshop-performance"], "CWV"),
]:
    add_thicken("ec", t, cats, rel)

assert len(THICKEN) >= 90, len(THICKEN)

# ~40 gap rewrites: map existing gap topics to better builders (keep slug, change topic)
REWRITE_SLUG_TOPICS: list[tuple[str, str, str]] = []  # filled in main from catalog


def parent_of(sub: str) -> str | None:
    for slug, _n, _d, parent in NEW_CATEGORIES:
        if slug == sub:
            return parent
    return None


def lead_for(sub: str, title: str) -> str:
    leads = {
        "dedicated-en-remote-mgmt": f"Infrastructuurkeuzes bepalen uptime. We behandelen: {title}.",
        "rescue-recovery": f"Herstel begint met koude rust en goede backups. Focus: {title}.",
        "containers-docker": f"Containers versnellen deploys als je ze veilig inricht. Onderwerp: {title}.",
        "apps-op-vps": f"Apps op VPS vragen om process managers en monitoring. We leggen uit: {title}.",
        "vpn-netwerk": f"Netwerkhardening houdt aanvallers buiten. Focus: {title}.",
        "http-foutcodes": f"Statuscodes vertellen wáár het stuk is. Onderwerp: {title}.",
        "mail-aflevering-fouten": f"Mailproblemen zitten vaak in DNS of reputation. We behandelen: {title}.",
        "dns-ssl-fouten": f"DNS en TLS raken elkaar snel. Focus: {title}.",
        "database-fouten": f"Databasefouten eisen voorzichtige stappen. Onderwerp: {title}.",
        "performance-incidenten": f"Performance-incidenten vragen triage. We werken uit: {title}.",
        "avg-website": f"Privacy is proces + techniek. Educatief over: {title}.",
        "cookies-consent": f"Consent hoort bij nette meting. Focus: {title}.",
        "webshop-regels-nl": f"Webshopregels beschermen consumenten. Onderwerp: {title}.",
        "juridische-paginas": f"Juridische pagina’s moeten kloppen met de praktijk. We behandelen: {title}.",
        "eu-tooling": f"Toolingkeuzes raken soevereiniteit. Focus: {title}.",
        "platform-vergelijkingen": f"Vergelijk op criteria, niet op marketing. Onderwerp: {title}.",
        "hosting-keuze": f"Hostingkeuze volgt workload. We leggen uit: {title}.",
        "betaalproviders": f"PSP’s verschillen in kosten én privacy. Focus: {title}.",
        "builders-cms": f"Builders versus custom: trade-offs. Onderwerp: {title}.",
    }
    return leads.get(sub, f"In dit artikel van {BRAND} behandelen we: {title}.")


def why_steps(sub: str, title: str) -> tuple[list[str], list[str], list[str], str, str]:
    h = int(hashlib.md5(title.encode()).hexdigest()[:8], 16)
    why = [
        f"Dit onderwerp komt terug in supporttickets bij {BRAND}.",
        "Een vaste werkwijze voorkomt ad-hoc fouten onder druk.",
        "Duidelijke documentatie helpt je team en onze support sneller.",
    ]
    steps = [
        f"Bepaal het doel van “{title}” en noteer de huidige situatie.",
        f"Log in op het klantenpanel van {BRAND} en open de juiste omgeving (hosting, VPS, DNS of shop).",
        "Maak een backup of werk op staging als de wijziging riskant is.",
        f"Voer de stappen uit die bij “{title}” horen — één kritieke wijziging tegelijk.",
        "Test het resultaat (site, mail, DNS of checkout) vanaf een tweede netwerk.",
        "Documenteer wat je wijzigde en plan een follow-up check.",
    ]
    extras = [
        "Controleer logs (web, mail, auth) op het tijdstip van het probleem.",
        "Purge caches (CDN, LiteSpeed, WordPress, browser) na fixes.",
        "Valideer SSL en DNS met een externe lookup.",
        "Informeer stakeholders als checkout of mail geraakt wordt.",
    ]
    steps.insert(4, extras[h % len(extras)])
    pitfalls = [
        "Te veel tegelijk wijzigen.",
        "Secrets in frontend of tickets plakken.",
        "Caches vergeten te legen.",
        "Productie als enige testomgeving gebruiken.",
    ]
    tip = f"Vermeld in tickets bij {BRAND} altijd domein, tijdstip (timezone) en wat je al probeerde."
    warn = "Dit is praktische educatie, geen juridisch of compliance-advies op maat."
    if sub.startswith("avg") or sub.startswith("jurid") or sub.startswith("webshop-regels") or sub.startswith("cookies"):
        warn = "Educatief overzicht — geen juridisch advies. Schakel bij twijfel een jurist in."
    return why, steps, pitfalls, tip, warn


def title_en(nl: str) -> str:
    # Prefer readable English; keep brand names
    repl = [
        (r"^Praktijkcase:\s*", "Case study: "),
        (r"^Probleemoplossing:\s*", "Troubleshooting: "),
        (r": checklist voor MKB$", ": SMB checklist"),
        (r": veelgemaakte fouten$", ": common mistakes"),
        (r": stappenplan voor beginners$", ": beginner guide"),
        (r" — tips van TripleZero iT$", " — tips from TripleZero iT"),
        (r" in productie$", " in production"),
        (r": wat je vóór livegang checkt$", ": pre-go-live checks"),
        (r"\buitgelegd\b", "explained"),
        (r"\buitleggen\b", "explain"),
        (r"\bwanneer\b", "when"),
        (r"\bwat is\b", "what is"),
        (r"\bwat betekent\b", "what does"),
        (r"\bhoe\b", "how"),
        (r"\bwaarom\b", "why"),
        (r"\bversus\b", "vs"),
        (r"\ben\b", "and"),
        (r"\bvoor\b", "for"),
        (r"\bmet\b", "with"),
        (r"\bzonder\b", "without"),
        (r"\bopzetten\b", "set up"),
        (r"\binstellen\b", "configure"),
        (r"\boplossen\b", "fix"),
        (r"\bkiezen\b", "choose"),
        (r"\bbeveiligen\b", "secure"),
        (r"\bverbeteren\b", "improve"),
        (r"\bbruikbaar\b", "usable"),
        (r"\bstappenplan\b", "step-by-step guide"),
        (r"\bhandleiding\b", "guide"),
        (r"\bfoutmeldingen\b", "error messages"),
        (r"\bwebsite\b", "website"),
        (r"\bwebshop\b", "online store"),
        (r"\bhosting\b", "hosting"),
        (r"\bdatabase\b", "database"),
        (r"\bbackups\b", "backups"),
        (r"\bveilig\b", "safely"),
        (r"\bin de praktijk\b", "in practice"),
        (r"\bvan je\b", "of your"),
        (r"\bje\b", "your"),
        (r"\bde\b", "the"),
        (r"\bhet\b", "the"),
        (r"\been\b", "a"),
        (r"\bvan\b", "of"),
        (r"\bnaar\b", "to"),
        (r"\bop\b", "on"),
        (r"\bbij\b", "at"),
    ]
    s = nl
    for pat, rep in repl:
        s = re.sub(pat, rep, s, flags=re.I)
    s = s.strip()
    return (s[0].upper() + s[1:]) if s else nl


def build_articles() -> list[dict]:
    articles: list[dict] = []
    seen_slugs: set[str] = set()
    seen_topics: set[str] = set()
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
            why, steps, pitfalls, tip, warn = why_steps(sub, title)
            articles.append({
                "slug": slug,
                "title": title,
                "titleEn": title_en(title),
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
        why, steps, pitfalls, tip, warn = why_steps(sub, title)
        articles.append({
            "slug": slug,
            "title": title,
            "titleEn": title_en(title),
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


def pick_rewrites(existing_articles: list[dict], n: int = 40) -> list[dict]:
    """Upgrade existing gap-* articles to curated rewrite topics (same slug)."""
    gaps = [a for a in existing_articles if str(a.get("topic", "")).startswith("gap-")]
    # Prefer themes matching competitor gaps
    prefer = ("http", "403", "404", "500", "blacklist", "backup", "redirect", "ssl", "dns", "spam", "ftp", "php", "mysql", "vps", "firewall")
    scored = []
    for a in gaps:
        s = (a["slug"] + " " + a["title"]).lower()
        score = sum(1 for p in prefer if p in s)
        scored.append((score, a))
    scored.sort(key=lambda x: (-x[0], x[1]["slug"]))
    chosen = [a for _, a in scored[:n]]
    out = []
    for a in chosen:
        title = a["title"]
        topic = make_topic(PREFIX["rewrite"], title + a["slug"])
        why, steps, pitfalls, tip, warn = why_steps("http-foutcodes", title)
        out.append({
            "slug": a["slug"],  # keep
            "title": title,
            "titleEn": title_en(title),
            "categories": a["categories"],
            "topic": topic,
            "module": "rewrite",
            "lead": f"Bijgewerkte handleiding van {BRAND}: {title}. Geschreven in eigen woorden, praktischer dan een generieke gap-tekst.",
            "why": why,
            "steps": steps,
            "pitfalls": pitfalls,
            "tip": tip,
            "warn": warn,
            "related": "troubleshooting en hosting",
            "rewrite": True,
        })
    return out


def ts_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")


def emit_body_module(module: str, export_name: str, arts: list[dict]) -> str:
    related_default = {
        "infra": "infrastructuur, VPS en netwerk",
        "troubleshooting": "foutmeldingen en incident response",
        "privacy": "privacy, cookies en compliance",
        "vergelijkingen": "keuzehulp en vergelijkingen",
        "thicken": "e-mail, WordPress, DNS en beveiliging",
        "rewrite": "verbeterde troubleshooting-artikelen",
    }[module]
    lines = [
        f"/**",
        f" * Dutch kennisbank bodies — Wave 2 ({module}) for TripleZero iT.",
        f" * Generated by scripts/kennisbank-wave2/generate_wave2.py — original content, not scraped.",
        f" */",
        f'const BRAND = "TripleZero iT";',
        f"",
        f"function p(...paras: string[]) {{",
        f"  return paras.map((t) => `<p>${{t}}</p>`).join(\"\\n\");",
        f"}}",
        f"function h2(t: string) {{",
        f"  return `<h2>${{t}}</h2>`;",
        f"}}",
        f"function ol(items: string[]) {{",
        f"  return `<ol>\\n${{items.map((i) => `  <li>${{i}}</li>`).join(\"\\n\")}}\\n</ol>`;",
        f"}}",
        f"function ul(items: string[]) {{",
        f"  return `<ul>\\n${{items.map((i) => `  <li>${{i}}</li>`).join(\"\\n\")}}\\n</ul>`;",
        f"}}",
        f"function tip(t: string) {{",
        f"  return `<aside class=\"kb-callout kb-callout-tip\"><p><strong>Tip:</strong> ${{t}}</p></aside>`;",
        f"}}",
        f"function warn(t: string) {{",
        f"  return `<aside class=\"kb-callout kb-callout-warn\"><p><strong>Let op:</strong> ${{t}}</p></aside>`;",
        f"}}",
        f"function outro(related?: string) {{",
        f"  return p(",
        f"    `Heb je na het volgen van deze stappen nog vragen? Neem contact op met ${{BRAND}} support via het ticketssysteem.`,",
        f"    related ? `Gerelateerd: ${{related}}` : `Bekijk ook andere artikelen over {related_default}.`,",
        f"  );",
        f"}}",
        f"",
        f"type Ctx = {{ title: string; topic: string }};",
        f"type Spec = {{ lead: string; why: string[]; steps: string[]; pitfalls: string[]; tip: string; warn: string; related: string }};",
        f"",
        f"function howto(title: string, spec: Spec): string {{",
        f"  return [",
        f"    p(spec.lead, `We schrijven vanuit de praktijk bij ${{BRAND}}: hosting, VPS, control panels en het klantenpanel.`),",
        f'    h2("Waarom dit belangrijk is"),',
        f"    ul(spec.why),",
        f"    h2(`Stappenplan: ${{title}}`),",
        f"    ol(spec.steps),",
        f'    h2("Veelgemaakte fouten"),',
        f"    ul(spec.pitfalls),",
        f"    tip(spec.tip),",
        f"    warn(spec.warn),",
        f"    outro(spec.related),",
        f'  ].join("\\n");',
        f"}}",
        f"",
        f"const specs: Record<string, Spec> = {{",
    ]
    for a in arts:
        lines.append(f'  "{a["topic"]}": {{')
        lines.append(f'    lead: `{ts_escape(a["lead"])}`,')
        lines.append(f"    why: {json.dumps(a['why'], ensure_ascii=False)},")
        lines.append(f"    steps: {json.dumps(a['steps'], ensure_ascii=False)},")
        lines.append(f"    pitfalls: {json.dumps(a['pitfalls'], ensure_ascii=False)},")
        lines.append(f'    tip: `{ts_escape(a["tip"])}`,')
        lines.append(f'    warn: `{ts_escape(a["warn"])}`,')
        lines.append(f'    related: `{ts_escape(a["related"])}`,')
        lines.append("  },")
    lines += [
        "};",
        "",
        f"export const {export_name}: Record<string, (ctx: Ctx) => string> = Object.fromEntries(",
        "  Object.keys(specs).map((topic) => [",
        "    topic,",
        "    (ctx: Ctx) => howto(ctx.title, specs[topic]),",
        "  ]),",
        ");",
        "",
    ]
    return "\n".join(lines)


def category_i18n_patch() -> dict:
    data = {
        "infrastructuur-servers": {
            "en": {"name": "Infrastructure & servers",
                   "description": "Dedicated concepts, rescue, Docker, apps on VPS, VPN and network hardening at TripleZero iT."},
        },
        "foutmeldingen-troubleshooting": {
            "en": {"name": "Errors & troubleshooting",
                   "description": "HTTP codes, mail delivery, DNS/SSL, databases and performance incidents."},
        },
        "privacy-juridisch-compliance": {
            "en": {"name": "Privacy, legal & compliance",
                   "description": "GDPR/AVG, cookies, webshop rules, required pages and EU tooling — educational, not legal advice."},
        },
        "vergelijkingen-keuzehulp": {
            "en": {"name": "Comparisons & decision guides",
                   "description": "Platform, hosting, payments and builder choices with clear SMB criteria."},
        },
        "dedicated-en-remote-mgmt": {
            "en": {"name": "Dedicated & remote management",
                   "description": "Dedicated concepts, IPMI/iLO/iDRAC and remote console basics."},
        },
        "rescue-recovery": {
            "en": {"name": "Rescue & recovery",
                   "description": "Rescue mode, netboot, password reset and recovery scenarios."},
        },
        "containers-docker": {
            "en": {"name": "Containers & Docker",
                   "description": "Docker on VPS, Compose, volumes and safe defaults."},
        },
        "apps-op-vps": {
            "en": {"name": "Apps on VPS",
                   "description": "Node.js, Python, Git deploy and process managers."},
        },
        "vpn-netwerk": {
            "en": {"name": "VPN & networking",
                   "description": "WireGuard, UFW/firewalld, Fail2ban and hardening."},
        },
        "http-foutcodes": {
            "en": {"name": "HTTP status codes",
                   "description": "401, 403, 404, 500, 502 and 504 causes and fixes."},
        },
        "mail-aflevering-fouten": {
            "en": {"name": "Mail delivery issues",
                   "description": "Blacklists, greylisting, bounces and SMTP problems."},
        },
        "dns-ssl-fouten": {
            "en": {"name": "DNS & SSL errors",
                   "description": "Propagation, certificate errors, mixed content and HSTS."},
        },
        "database-fouten": {
            "en": {"name": "Database errors",
                   "description": "Connections, corruption, MyISAM/InnoDB and import/export."},
        },
        "performance-incidenten": {
            "en": {"name": "Performance incidents",
                   "description": "Traffic spikes, slow queries, CPU and full disks."},
        },
        "avg-website": {
            "en": {"name": "GDPR/AVG for websites",
                   "description": "Minimisation, processors and practical website checks."},
        },
        "cookies-consent": {
            "en": {"name": "Cookies & consent",
                   "description": "When a banner is needed and Consent Mode."},
        },
        "webshop-regels-nl": {
            "en": {"name": "NL/EU webshop rules",
                   "description": "Withdrawal, pricing display and consumer themes."},
        },
        "juridische-paginas": {
            "en": {"name": "Legal pages",
                   "description": "Privacy, cookies, terms: what belongs (no copied templates)."},
        },
        "eu-tooling": {
            "en": {"name": "EU tooling & sovereignty",
                   "description": "European alternatives and vendor risk."},
        },
        "platform-vergelijkingen": {
            "en": {"name": "Platform comparisons",
                   "description": "WooCommerce, Shopify, PrestaShop and CMS choices."},
        },
        "hosting-keuze": {
            "en": {"name": "Hosting choices",
                   "description": "Shared, managed, VPS and when each fits."},
        },
        "betaalproviders": {
            "en": {"name": "Payment providers",
                   "description": "Mollie, Stripe and criteria for NL stores."},
        },
        "builders-cms": {
            "en": {"name": "Builders & CMS",
                   "description": "Elementor, Gutenberg, custom themes and site builders."},
        },
    }
    for slug, locales in data.items():
        en = locales["en"]
        for loc in ("de", "fr", "es", "pt", "it"):
            locales[loc] = {"name": en["name"], "description": en["description"]}
    return data


def main() -> None:
    catalog = json.loads(CATALOG.read_text())
    arts = build_articles()
    rewrites = pick_rewrites(catalog["articles"], 40)
    print(f"new={len(arts)} rewrites={len(rewrites)} thicken={len(THICKEN)}")

    by_mod: dict[str, list] = {}
    for a in arts + rewrites:
        by_mod.setdefault(a["module"], []).append(a)

    existing_slugs = {a["slug"] for a in catalog["articles"]}
    existing_cat = {c[0] for c in catalog["categories"]}
    slug_to_idx = {a["slug"]: i for i, a in enumerate(catalog["articles"])}

    added_cats = 0
    for slug, name, desc, parent in NEW_CATEGORIES:
        if slug in existing_cat:
            continue
        row = [slug, name, desc] if parent is None else [slug, name, desc, parent]
        catalog["categories"].append(row)
        existing_cat.add(slug)
        added_cats += 1

    added_arts = 0
    for a in arts:
        if a["slug"] in existing_slugs:
            continue
        catalog["articles"].append({
            "slug": a["slug"],
            "title": a["title"],
            "categories": a["categories"],
            "topic": a["topic"],
        })
        existing_slugs.add(a["slug"])
        added_arts += 1

    rewritten = 0
    for a in rewrites:
        i = slug_to_idx.get(a["slug"])
        if i is None:
            continue
        catalog["articles"][i]["topic"] = a["topic"]
        rewritten += 1

    CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
    print(f"Catalog +{added_cats} cats, +{added_arts} arts, rewritten={rewritten} "
          f"(total cats={len(catalog['categories'])}, arts={len(catalog['articles'])})")

    export_map = {
        "infra": ("infraTopicBuilders", "infra-bodies.ts"),
        "troubleshooting": ("troubleshootingTopicBuilders", "troubleshooting-bodies.ts"),
        "privacy": ("privacyComplianceTopicBuilders", "privacy-compliance-bodies.ts"),
        "vergelijkingen": ("vergelijkingenTopicBuilders", "vergelijkingen-bodies.ts"),
        "thicken": ("wave2ThickenTopicBuilders", "wave2-thicken-bodies.ts"),
        "rewrite": ("wave2RewriteTopicBuilders", "wave2-rewrite-bodies.ts"),
    }
    for module, items in by_mod.items():
        export_name, filename = export_map[module]
        path = BODIES_DIR / filename
        path.write_text(emit_body_module(module, export_name, items))
        print(f"Wrote {filename} ({len(items)})")

    slim = [{
        "slug": a["slug"],
        "title": a["title"],
        "titleEn": a.get("titleEn", a["title"]),
        "categories": a["categories"],
        "topic": a["topic"],
        "module": a["module"],
        "rewrite": bool(a.get("rewrite")),
    } for a in arts + rewrites]
    (OUT / "wave2-articles.json").write_text(json.dumps(slim, ensure_ascii=False, indent=2) + "\n")
    I18N_PATCH.write_text(json.dumps(category_i18n_patch(), ensure_ascii=False, indent=2) + "\n")
    print(f"Wrote wave2-articles.json ({len(slim)})")


if __name__ == "__main__":
    main()

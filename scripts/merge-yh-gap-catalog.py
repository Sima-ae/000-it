#!/usr/bin/env python3
"""Merge missing Yourhosting kennisbank topics into our catalog (original titles, our brand)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path("/Users/pro/Desktop/000-it")
CATALOG = ROOT / "prisma/kennisbank/catalog.json"
MISSING = Path("/tmp/yh-kb/true-missing.json")

SKIP_SLUGS = {
    "privacybeleid",
    "verwerkersovereenkomst",
    "web-deploy-bij-vevida",
    "f%e2%80%91secure-antivirus-op-een-windows-computer",
    "f-secure-antivirus-op-een-windows-computer",
    "advertentie-op-domeinnaam-bij-yourhosting",
}

TITLE_FIXES = [
    (r"(?i)handleiding:\s*instellingen beheren in yourwebsite", "Instellingen beheren in de websitebouwer"),
    (r"(?i)handleiding:\s*je website maken met yourwebsite", "Een website maken met de visuele editor"),
    (r"(?i)webshop maken in yourwebsite", "Een webshop maken in de websitebouwer"),
    (r"(?i)wat is yourwebsite van yourhosting\??", "Wat is de visuele websitebouwer van TripleZero iT?"),
    (r"(?i)herroepingsknop instellen in yourwebshop", "Herroepingsknop instellen in je webshop"),
    (r"(?i)wordpress smart start bij yourhosting", "WordPress snelstart bij TripleZero iT"),
    (r"(?i)wordpress onderhouden( bij yourhosting)?", "WordPress onderhouden bij TripleZero iT"),
    (r"(?i)inloggen op managed vps bij yourhosting", "Inloggen op een managed VPS bij TripleZero iT"),
    (r"(?i)managed vps beheren bij yourhosting", "Een managed VPS beheren bij TripleZero iT"),
    (r"(?i)server side includes gebruiken bij yourhosting", "Server Side Includes (SSI) gebruiken"),
    (r"(?i)software voor de applicatie vps yourhosting", "Software voor een applicatie-VPS bij TripleZero iT"),
    (r"(?i)de outlook web app bij yourhosting", "De Outlook Web App (OWA) gebruiken"),
    (r"(?i)microsoft 365 mail van yourhosting toevoegen in outlook", "Microsoft 365-mail toevoegen in Outlook"),
    (r"(?i)onedrive bij yourhosting", "Aan de slag met OneDrive"),
    (r"(?i)klantaccount activeren in mijn yourhosting", "Klantaccount activeren in het klantenpanel"),
    (r"(?i)mijn yourhosting\s*-\s*functies uitgelegd", "Functies van het klantenpanel uitgelegd"),
    (r"(?i)ssl-certificaat bestellen en beheren via mijn yourhosting", "SSL-certificaat bestellen en beheren via het klantenpanel"),
    (r"(?i)mijn yourhosting", "het klantenpanel"),
    (r"(?i)\byourwebsite\b", "de websitebouwer"),
    (r"(?i)\byourwebshop\b", "je webshop"),
    (r"(?i)\byourhosting\b", "TripleZero iT"),
    (r"(?i)your hosting", "TripleZero iT"),
]


def rewrite_title(title: str) -> str:
    t = title.strip()
    for rx, repl in TITLE_FIXES:
        t = re.sub(rx, repl, t)
    t = re.sub(r"\s+", " ", t).strip()
    t = t.replace("TripleZero iT iT", "TripleZero iT")
    return t


def rewrite_slug(slug: str, used: set[str]) -> str:
    s = (
        slug.replace("yourhosting", "triplezero-it")
        .replace("yourwebsite", "websitebouwer")
        .replace("yourwebshop", "webshop")
        .replace("mijn-yourhosting", "klantenpanel")
        .replace("mijn-triplezero-it", "klantenpanel")
    )
    s = re.sub(r"%e2%80%91", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    if s == "database-aanmaken":
        s = "mysql-database-aanmaken-in-het-control-panel"
    base = s
    i = 2
    while s in used:
        s = f"{base}-{i}"
        i += 1
    return s


def family_for(title: str, slug: str, cats: list[str], tops: list[str]) -> str:
    blob = f"{title} {slug} {' '.join(cats)} {' '.join(tops)}".lower()
    if any(x in blob for x in ["windows-server", "windows vps", "iis ", "application pool", "mssql", "web.config", "bindings"]):
        return "win"
    if "vps" in blob or "novnc" in blob or "fail2ban" in blob or "rdp" in blob:
        return "vps"
    if any(x in blob for x in ["microsoft", "exchange", "onedrive", "teams", "outlook web"]):
        return "ms"
    if "ssl" in blob or "hsts" in blob or "sha2" in blob or "csr" in blob:
        return "ssl"
    if re.search(r"alles over \.[a-z]|informatie over \.xxx|\.tel-domein|\.co\.uk-domein", blob):
        return "tld"
    if any(x in blob for x in ["a records", "aaaa", "cname", "mx records", "srv ", "soa ", "caa ", "tlsa", "dnssec", "premium dns", "nameserver", "reverse dns"]):
        return "dns"
    if "domeinnamen" in blob or "domein" in blob:
        if any(x in blob for x in ["verhuis", "registreer", "tld", "extensie", "houder", "taxatie", "premium domein", "sedo", "quarantaine", "local presence"]):
            return "tld" if re.search(r"\.[a-z]{2,}", title.lower()) else "dns"
        return "dns"
    if any(x in blob for x in ["e-mail", "webmail", "imap", "smtp", "spoof", "thunderbird", "mailbox", "postvak", "spam"]):
        return "email"
    if "wordpress" in blob:
        return "wp"
    if any(x in blob for x in ["incasso", "factuur", "betaling", "upgrade", "downgrade", "klantnummer", "overlijden", "reseller", "klantomgeving", "klantaccount", "korting"]):
        return "admin"
    if any(x in blob for x in ["websitebouwer", "visuele editor", "website laten maken", "website-maken"]):
        return "builder"
    if any(x in blob for x in ["joomla", "magento", "drupal", "prestashop"]):
        return "cms"
    if "plesk" in blob:
        return "plesk"
    if "directadmin" in blob or "direct-admin" in blob:
        return "da"
    if any(x in blob for x in ["ddos", "brute-force", "phishing", "scam", "fraude", "wachtwoord", "patchman", "hotlink"]):
        return "sec"
    if any(x in blob for x in ["screenshot", "begrip", "browser", "iso", "klacht", "kwaliteit", "privemodus", "pep "]):
        return "support"
    return "host"


def map_categories(title: str, slug: str, yh_cats: list[str], family: str) -> list[str]:
    blob = f"{title} {slug} {' '.join(yh_cats)}".lower()
    out: list[str] = []

    def add(c: str):
        if c not in out:
            out.append(c)

    if family == "ms" or "microsoft" in blob:
        add("microsoft")
    if family in {"vps", "win"} or "vps" in blob:
        add("vps")
    if family == "ssl" or "ssl" in blob or "hsts" in blob:
        add("ssl-certificaten")
        add("beveiliging")
    if family == "wp" or "wordpress" in blob:
        add("wordpress")
    if family == "plesk" or "plesk" in blob:
        add("plesk")
    if family == "da" or "directadmin" in blob or "direct-admin" in blob:
        add("directadmin")
    if family == "email" or any(x in blob for x in ["e-mail", "webmail", "imap", "smtp", "mailbox"]):
        add("e-mail")
    if family in {"dns", "tld"} or "domein" in blob or "dns" in blob:
        add("domeinnamen")
    if family == "admin":
        add("crm-klantenpanel")
        if any(x in blob for x in ["bestel", "upgrade", "downgrade", "korting"]):
            add("shop-en-pakketten")
    if family == "sec" or any(x in blob for x in ["phishing", "scam", "fraude", "wachtwoord", "ddos"]):
        add("veilig-online")
        add("beveiliging")
    if family == "support":
        add("support")
    if family == "builder":
        add("hosting")
        add("wordpress")
    if family == "cms":
        add("hosting")
        add("bloggen")
    if family == "host":
        add("hosting")
    if family == "wp":
        add("bloggen")

    if not out:
        add("hosting")
    return out[:3]


NEW_CATEGORIES = [
    [
        "microsoft",
        "Microsoft 365",
        "Microsoft 365, Exchange Online, Teams, OneDrive en Outlook koppelen via TripleZero iT.",
    ],
    [
        "vps",
        "VPS",
        "VPS starten en beveiligen, snapshots, SSH/RDP, managed en unmanaged bij TripleZero iT.",
    ],
    [
        "ssl-certificaten",
        "SSL-certificaten",
        "Let’s Encrypt, betaalde certificaten, CSR, HSTS en HTTPS bij TripleZero iT.",
    ],
]


def main():
    catalog = json.loads(CATALOG.read_text())
    missing = json.loads(MISSING.read_text())
    used_slugs = {a["slug"] for a in catalog["articles"]}
    used_titles = {a["title"].lower() for a in catalog["articles"]}

    existing_cat_slugs = {c[0] for c in catalog["categories"]}
    for cat in NEW_CATEGORIES:
        if cat[0] not in existing_cat_slugs:
            catalog["categories"].append(cat)

    added = []
    skipped = 0
    for row in missing:
        slug0 = row["slug"]
        if slug0 in SKIP_SLUGS:
            skipped += 1
            continue
        title = rewrite_title(row["title"])
        if "yourhost" in title.lower() or "your website" in title.lower():
            title = re.sub(r"(?i)yourhosting|your hosting", "TripleZero iT", title)
        slug = rewrite_slug(slug0, used_slugs)
        if title.lower() in used_titles:
            skipped += 1
            continue
        family = family_for(title, slug, row.get("cats") or [], row.get("tops") or [])
        cats = map_categories(title, slug, row.get("cats") or [], family)
        topic = f"gap-{family}"
        article = {
            "slug": slug,
            "title": title,
            "categories": cats,
            "topic": topic,
        }
        catalog["articles"].append(article)
        used_slugs.add(slug)
        used_titles.add(title.lower())
        added.append(article)

    CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
    print(f"categories={len(catalog['categories'])} articles={len(catalog['articles'])} added={len(added)} skipped={skipped}")
    from collections import Counter
    print("families", Counter(a["topic"] for a in added).most_common())
    print("new cats", [a["categories"] for a in added[:5]])


if __name__ == "__main__":
    main()

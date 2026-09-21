#!/usr/bin/env python3
"""Create popular kennisbank subcategories (≥4 articles on a subject)."""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

CATALOG = Path("/Users/pro/Desktop/000-it/prisma/kennisbank/catalog.json")

# slug, NL name, NL description, parent, match regex (title + slug)
# Order within a parent is exclusive first-match.
SUBS: list[tuple[str, str, str, str, str]] = [
    (
        "dns-records",
        "DNS-records",
        "A, AAAA, CNAME, MX, SPF, DKIM, DMARC, nameservers en DNSSEC bij TripleZero iT.",
        "domeinnamen",
        r"\b(spf|dkim|dmarc|dnssec|cname|a-record|aaaa|mx-record|\bmx\b|srv |soa |caa |tlsa|ptr |nameserver|dns record|dns-record|premium dns|reverse dns|waar kan ik dns)\b",
    ),
    (
        "domein-verhuizen",
        "Domein verhuizen",
        "Verhuizen, autorisatiecode, quarantaine, lock en overdracht van domeinen.",
        "domeinnamen",
        r"verhuis|transfer|autorisatiecode|quarantaine|overdragen|gelockt|domain lock",
    ),
    (
        "domein-registratie",
        "Domeinregistratie",
        "Registreren, WHOIS, houdergegevens, extensies en SIDN-regels voor je domein.",
        "domeinnamen",
        r"registreer|registratie|whois|houder|trustee|anoniem|local presence|validatiemail|taxatie|premium domein|alles over \.|informatie over \.|extensie",
    ),
    (
        "webmail",
        "Webmail",
        "Inloggen, Roundcube, Webmail Pro, mappen, handtekeningen en webmail-problemen.",
        "e-mail",
        r"webmail|roundcube",
    ),
    (
        "e-mail-instellen",
        "E-mail instellen",
        "Mailbox koppelen in Outlook, Apple Mail, Gmail, Thunderbird, iPhone en Android.",
        "e-mail",
        r"instellen.*(outlook|iphone|android|ipad|gmail|apple|thunderbird|mac)|e-mail instellen|mail instellen|mailadres toevoegen aan mailprogramma|gegevens om mail|imap|pop3",
    ),
    (
        "spam-en-veiligheid",
        "Spam en e-mailveiligheid",
        "Spamfilters, spoofing, phishingmails en aflevering in de spambox.",
        "e-mail",
        r"spam|spoof|phishingmail|backscatter|spamassassin|spamfilter",
    ),
    (
        "mailbox-beheer",
        "Mailbox beheren",
        "Aanmaken, quota, wachtwoord, doorsturen, catch-all en automatisch antwoord.",
        "e-mail",
        r"quota|wachtwoord van e-mail|e-mailadres aanmaken|mailbox|postvak|catch-all|doorsturen|out of office|automatisch antwoord|handtekening",
    ),
    (
        "php-en-scripts",
        "PHP en scripts",
        "PHP-versie, cronjobs, phpinfo en Installatron op je hostingpakket.",
        "hosting",
        r"\bphp\b|cronjob|phpinfo|installatron",
    ),
    (
        "ftp-en-bestanden",
        "FTP en bestanden",
        "FileZilla, FTP-accounts, rechten (CHMOD) en bestanden uploaden of verwijderen.",
        "hosting",
        r"\bftp\b|filezilla|chmod|bestandsrechten|file manager|bestanden uploaden|mappenlijst",
    ),
    (
        "opslag-en-verkeer",
        "Opslag en dataverkeer",
        "Schijfruimte, inodes, bandbreedte en wat je kunt doen als het pakket vol raakt.",
        "hosting",
        r"opslag|schijf|inode|bandbreedte|dataverkeer|pakket.*vol",
    ),
    (
        "wordpress-beveiliging",
        "WordPress-beveiliging",
        "Wordfence, hacks voorkomen, XML-RPC uitzetten en een gehackte site herstellen.",
        "wordpress",
        r"wordfence|xml-rpc|xmlrpc|wordpress.*(hack|beveil)|gehackt|website beschermen tegen hacks",
    ),
    (
        "wordpress-installatie",
        "WordPress installeren",
        "WordPress zetten via Installatron, Toolkit of een snelstart, en een site toevoegen of verwijderen.",
        "wordpress",
        r"installeer|installeren|installatron|toolkit|snelstart|wordpress.org|wordpress.com",
    ),
    (
        "wordpress-onderhoud",
        "WordPress onderhouden",
        "Updates, permalinks, widgets, extra gebruikers en backups in het dashboard.",
        "wordpress",
        r"update|updaten|onderhoud|permalink|widget|extra gebruikers|backup plugin",
    ),
    (
        "windows-vps",
        "Windows VPS",
        "IIS, RDP, application pools, bindings, MSSQL en sites op een Windows-server.",
        "vps",
        r"windows|iis|rdp|mssql|application pool|bindings|web.config",
    ),
    (
        "linux-vps",
        "Linux VPS",
        "SSH, Fail2Ban, console, CentOS/CloudLinux en kernel-updates op je Linux-VPS.",
        "vps",
        r"ssh|fail2ban|centos|linux|console|novnc|root wachtwoord|cloudlinux",
    ),
    (
        "vps-beheer",
        "VPS beheren",
        "Starten en stoppen, snapshots, IP-adressen, managed versus unmanaged.",
        "vps",
        r"starten of stoppen|snapshot|managed|unmanaged|cpu cores|ip-adressen beheren",
    ),
    (
        "facturen-en-betalen",
        "Facturen en betalen",
        "Facturen bekijken, incasso, openstaande posten en betaalmethoden in het klantenpanel.",
        "crm-klantenpanel",
        r"factuur|facturen|incasso|betaling|btw|klantnummer",
    ),
    (
        "tickets-en-berichten",
        "Tickets en berichten",
        "Supporttickets, CRM-berichten en de status van je aanvragen.",
        "crm-klantenpanel",
        r"ticket|bericht|inbox",
    ),
    (
        "account-en-inloggen",
        "Account en inloggen",
        "Inloggen, 2FA, wachtwoord en extra gebruikers op je klantenpanel.",
        "crm-klantenpanel",
        r"inlog|wachtwoord|2fa|tweestaps|tweefactor|gebruiker toevoegen|account activeren|mijn gegevens",
    ),
    (
        "tickets-en-chat",
        "Tickets, chat en belafspraak",
        "Live chat, tickets en belafspraken bij TripleZero iT support.",
        "support",
        r"ticket|live.?chat|belafspraak|\bchat\b",
    ),
    (
        "betalen-en-btw",
        "Betalen en btw",
        "Checkout, btw, incasso, korting en wat er na een betaling gebeurt.",
        "shop-en-pakketten",
        r"btw|betaling|checkout|incasso|korting|factuur",
    ),
    (
        "hostingpakketten",
        "Hostingpakketten",
        "Shared, WordPress-hosting en VPS: Basic, Plus, Pro/Business, upgraden en downgraden.",
        "shop-en-pakketten",
        r"shared hosting|wordpress hosting|vps hosting|hosting basic|upgrade|downgrade",
    ),
    (
        "business-pakketten",
        "Business-pakketten",
        "Business, Extra Growth, Enterprise en wat er in welk pakket zit.",
        "shop-en-pakketten",
        r"business-pakket|extra growth|\bbusiness\b|enterprise",
    ),
    (
        "firewall-en-hacks",
        "Firewall en hacks",
        "Firewalls, brute-force, DDoS, hotlink-protectie en wat je doet bij een hack.",
        "beveiliging",
        r"firewall|hack|ddos|brute.?force|hotlink|man-in-the-middle",
    ),
    (
        "directadmin-e-mail",
        "E-mail in DirectAdmin",
        "Mailboxen, spamfilter, quota en webmail vanuit DirectAdmin.",
        "directadmin",
        r"e-mail|mailbox|spam|webmail|quota|catch-all",
    ),
    (
        "directadmin-wordpress",
        "WordPress in DirectAdmin",
        "Installatron, WordPress-updates, backups en multisite in DirectAdmin.",
        "directadmin",
        r"wordpress|installatron",
    ),
    (
        "microsoft-mail",
        "Microsoft-mail",
        "Exchange Online, Outlook, OWA en Microsoft 365-mailboxen koppelen.",
        "microsoft",
        r"exchange|outlook|\bowa\b|gedeelde postvak|microsoft 365 mail|imap mail verhuizen",
    ),
]


def blob(art: dict) -> str:
    return f"{art['title']} {art['slug']}"


def main() -> None:
    data = json.loads(CATALOG.read_text())
    parent_of: dict[str, str | None] = {}
    children_of: dict[str, list[str]] = defaultdict(list)
    for row in data["categories"]:
        slug = row[0]
        parent = row[3] if len(row) > 3 else None
        parent_of[slug] = parent
        if parent:
            children_of[parent].append(slug)

    by_parent: dict[str, list[tuple[str, str, str, str]]] = defaultdict(list)
    for slug, name, desc, parent, rx in SUBS:
        by_parent[parent].append((slug, name, desc, rx))

    assignments: dict[str, list[dict]] = defaultdict(list)
    for art in data["articles"]:
        cats = set(art["categories"])
        for parent, candidates in by_parent.items():
            if parent not in cats:
                continue
            existing_child = next(
                (c for c in children_of.get(parent, []) if c in cats),
                None,
            )
            if existing_child:
                assignments[existing_child].append(art)
                continue
            for slug, _name, _desc, rx in candidates:
                if re.search(rx, blob(art), re.I):
                    assignments[slug].append(art)
                    break

    existing = {row[0] for row in data["categories"]}
    skipped = []
    added = []
    for slug, name, desc, parent, _rx in SUBS:
        hits = assignments.get(slug, [])
        if len(hits) < 4:
            skipped.append((slug, len(hits), parent))
            continue
        if slug not in existing:
            data["categories"].append([slug, name, desc, parent])
            existing.add(slug)
            children_of[parent].append(slug)
            added.append((slug, len(hits), parent))
        tagged = 0
        for art in hits:
            if slug not in art["categories"]:
                art["categories"].append(slug)
                tagged += 1
        print(f"OK  {slug:28} parent={parent:22} hits={len(hits):3} newly_tagged={tagged}")

    # Catch-all: leftover parent articles that did not match a 4+ subject bucket.
    overige_added = []
    for parent in sorted(children_of):
        real_children = [c for c in children_of[parent] if not c.endswith("-overige")]
        if not real_children:
            continue
        leftover_slug = f"{parent}-overige"
        leftover_arts: list[dict] = []
        for art in data["articles"]:
            cats = set(art["categories"])
            if parent not in cats:
                continue
            if any(c in cats for c in real_children):
                continue
            leftover_arts.append(art)
        if not leftover_arts:
            continue
        parent_name = next((row[1] for row in data["categories"] if row[0] == parent), parent)
        name = "Overige"
        desc = f"Overige artikelen in {parent_name} die niet onder een specifiek onderwerp vallen."
        if leftover_slug not in existing:
            data["categories"].append([leftover_slug, name, desc, parent])
            existing.add(leftover_slug)
            children_of[parent].append(leftover_slug)
            overige_added.append((leftover_slug, len(leftover_arts)))
        tagged = 0
        for art in leftover_arts:
            if leftover_slug not in art["categories"]:
                art["categories"].append(leftover_slug)
                tagged += 1
        print(f"OV  {leftover_slug:28} leftover={len(leftover_arts):3} newly_tagged={tagged}")

    CATALOG.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"\nadded categories: {len(added)}")
    print(f"added overige: {len(overige_added)}")
    print("skipped (<4):")
    for row in skipped:
        print(f"  {row}")
    print("total categories", len(data["categories"]))


if __name__ == "__main__":
    main()

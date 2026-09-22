#!/usr/bin/env python3
"""Add 30 unique Microsoft 365 kennisbank articles + subject subcategories; retag existing 22."""
from __future__ import annotations

import json
from pathlib import Path

CATALOG = Path("/Users/pro/Desktop/000-it/prisma/kennisbank/catalog.json")

# New subject subs only (mail + overige already exist)
SUBS = [
    (
        "microsoft-teams",
        "Teams",
        "Vergaderen, kanalen, gasten en bestanden delen in Microsoft Teams.",
        "microsoft",
    ),
    (
        "microsoft-onedrive",
        "OneDrive en SharePoint",
        "Synchronisatie, delen, opslag, versies en SharePoint-teamsites.",
        "microsoft",
    ),
    (
        "microsoft-beheer",
        "Tenant, licenties en beheer",
        "Licenties, gebruikers, DNS, domein, migratie en offboarding in Microsoft 365.",
        "microsoft",
    ),
    (
        "microsoft-beveiliging",
        "Beveiliging en accounts",
        "MFA, inloggen, phishing, wachtwoorden en accountbeveiliging in Microsoft 365.",
        "microsoft",
    ),
]

# All subject children under microsoft (for orphan checks)
ALL_CHILDREN = [
    "microsoft-mail",
    "microsoft-teams",
    "microsoft-onedrive",
    "microsoft-beheer",
    "microsoft-beveiliging",
    "microsoft-overige",
]

# title, slug, topic, subcategory, extra categories
ARTICLES: list[tuple[str, str, str, str, list[str]]] = [
    # Microsoft-mail (6)
    (
        "Alias of proxy-adres toevoegen aan een Microsoft 365-mailbox",
        "alias-toevoegen-microsoft-365-mailbox",
        "tz-m365-alias-mailbox",
        "microsoft-mail",
        ["e-mail"],
    ),
    (
        "Distributiegroep of Microsoft 365-groep aanmaken",
        "distributiegroep-of-microsoft-365-groep-aanmaken",
        "tz-m365-distributiegroep",
        "microsoft-mail",
        ["e-mail"],
    ),
    (
        "Agenda delen in Outlook met Microsoft 365",
        "agenda-delen-in-outlook-microsoft-365",
        "tz-m365-agenda-delen",
        "microsoft-mail",
        [],
    ),
    (
        "Automatisch antwoord (Out of Office) in Exchange Online",
        "automatisch-antwoord-out-of-office-exchange-online",
        "tz-m365-out-of-office",
        "microsoft-mail",
        ["e-mail"],
    ),
    (
        "E-mail doorsturen vanuit Exchange Online",
        "e-mail-doorsturen-exchange-online",
        "tz-m365-mail-doorsturen",
        "microsoft-mail",
        ["e-mail"],
    ),
    (
        "Outlook-profiel en Autodiscover-problemen oplossen",
        "outlook-profiel-en-autodiscover-problemen-oplossen",
        "tz-m365-autodiscover-outlook",
        "microsoft-mail",
        ["e-mail"],
    ),
    # Teams (5)
    (
        "Microsoft Teams installeren op desktop en telefoon",
        "microsoft-teams-installeren-desktop-en-telefoon",
        "tz-m365-teams-installeren",
        "microsoft-teams",
        [],
    ),
    (
        "Vergadering plannen en starten in Teams",
        "vergadering-plannen-en-starten-in-teams",
        "tz-m365-teams-vergadering",
        "microsoft-teams",
        [],
    ),
    (
        "Gastgebruikers uitnodigen in Microsoft Teams",
        "gastgebruikers-uitnodigen-in-microsoft-teams",
        "tz-m365-teams-gasten",
        "microsoft-teams",
        [],
    ),
    (
        "Bestanden delen via Teams-kanalen",
        "bestanden-delen-via-teams-kanalen",
        "tz-m365-teams-bestanden",
        "microsoft-teams",
        [],
    ),
    (
        "Teams-meldingen en beschikbaarheid beheren",
        "teams-meldingen-en-beschikbaarheid-beheren",
        "tz-m365-teams-meldingen",
        "microsoft-teams",
        [],
    ),
    # OneDrive en SharePoint (6)
    (
        "Verschil tussen OneDrive en SharePoint",
        "verschil-onedrive-en-sharepoint",
        "tz-m365-onedrive-vs-sharepoint",
        "microsoft-onedrive",
        [],
    ),
    (
        "Bestanden veilig delen met externe personen via OneDrive",
        "bestanden-delen-externe-personen-onedrive",
        "tz-m365-onedrive-extern-delen",
        "microsoft-onedrive",
        [],
    ),
    (
        "OneDrive-synchronisatieproblemen oplossen",
        "onedrive-synchronisatieproblemen-oplossen",
        "tz-m365-onedrive-sync",
        "microsoft-onedrive",
        [],
    ),
    (
        "Bestanden herstellen met versiegeschiedenis of prullenbak",
        "bestanden-herstellen-onedrive-versiegeschiedenis",
        "tz-m365-onedrive-herstellen",
        "microsoft-onedrive",
        [],
    ),
    (
        "Wat te doen als OneDrive-opslag vol is",
        "onedrive-opslag-vol",
        "tz-m365-onedrive-opslag-vol",
        "microsoft-onedrive",
        [],
    ),
    (
        "Een SharePoint-teamsite aanmaken en rechten geven",
        "sharepoint-teamsite-aanmaken-en-rechten",
        "tz-m365-sharepoint-teamsite",
        "microsoft-onedrive",
        [],
    ),
    # Tenant, licenties en beheer (7)
    (
        "Welk Microsoft 365-abonnement past bij mijn bedrijf?",
        "welk-microsoft-365-abonnement-past-bij-mijn-bedrijf",
        "tz-m365-abonnement-keuze",
        "microsoft-beheer",
        [],
    ),
    (
        "Licentie toewijzen of intrekken aan een gebruiker",
        "licentie-toewijzen-of-intrekken-microsoft-365",
        "tz-m365-licentie-toewijzen",
        "microsoft-beheer",
        [],
    ),
    (
        "Rollen in Microsoft 365: global admin versus gebruiker",
        "rollen-global-admin-versus-gebruiker",
        "tz-m365-rollen-admin",
        "microsoft-beheer",
        [],
    ),
    (
        "DNS-records voor Microsoft 365 controleren (MX, SPF, DKIM, Autodiscover)",
        "dns-records-microsoft-365-controleren",
        "tz-m365-dns-controleren",
        "microsoft-beheer",
        ["domeinnamen"],
    ),
    (
        "Gebruiker offboarden: mailbox en OneDrive overdragen",
        "gebruiker-offboarden-mailbox-onedrive-overdragen",
        "tz-m365-offboarding",
        "microsoft-beheer",
        [],
    ),
    (
        "IMAP-mailboxen migreren naar Exchange Online",
        "imap-mailboxen-migreren-naar-exchange-online",
        "tz-m365-imap-migratie",
        "microsoft-beheer",
        ["e-mail"],
    ),
    (
        "Microsoft 365 Apps (Office) installeren op Windows en Mac",
        "microsoft-365-apps-installeren-windows-en-mac",
        "tz-m365-apps-installeren",
        "microsoft-beheer",
        [],
    ),
    # Beveiliging en accounts (5)
    (
        "Multifactorauthenticatie (MFA) inschakelen voor Microsoft 365",
        "mfa-inschakelen-microsoft-365",
        "tz-m365-mfa-inschakelen",
        "microsoft-beveiliging",
        ["beveiliging"],
    ),
    (
        "Microsoft Authenticator koppelen aan je account",
        "microsoft-authenticator-koppelen",
        "tz-m365-authenticator",
        "microsoft-beveiliging",
        ["beveiliging"],
    ),
    (
        "Wachtwoord resetten of self-service wachtwoordherstel",
        "wachtwoord-resetten-microsoft-365",
        "tz-m365-wachtwoord-reset",
        "microsoft-beveiliging",
        ["beveiliging"],
    ),
    (
        "Verdachte inlogpogingen en geblokkeerde accounts",
        "verdachte-inlogpogingen-microsoft-365",
        "tz-m365-verdachte-login",
        "microsoft-beveiliging",
        ["beveiliging"],
    ),
    (
        "Phishingmails herkennen in Outlook en Microsoft 365",
        "phishingmails-herkennen-outlook-microsoft-365",
        "tz-m365-phishing",
        "microsoft-beveiliging",
        ["beveiliging", "e-mail"],
    ),
    # Overige (1)
    (
        "Microsoft 365-servicestatus en storingen controleren",
        "microsoft-365-servicestatus-en-storingen",
        "tz-m365-servicestatus",
        "microsoft-overige",
        [],
    ),
]

# Existing articles → move out of microsoft-overige into subject subcategory
RETAG: dict[str, str] = {
    "hoe-werkt-microsoft-teams": "microsoft-teams",
    "onedrive-installeren": "microsoft-onedrive",
    "onedrive-bij-triplezero-it": "microsoft-onedrive",
    "faq-en-support-onedrive": "microsoft-onedrive",
    "aan-de-slag-met-microsoft": "microsoft-beheer",
    "microsoft-onderdelen-uitgelegd": "microsoft-beheer",
    "microsoft-licentie-bestellen-en-beheren": "microsoft-beheer",
    "microsoft-gebruikers-beheren": "microsoft-beheer",
    "microsoft-365-tenant-importeren": "microsoft-beheer",
    "migreren-naar-microsoft-365": "microsoft-beheer",
    "domeinnaam-koppelen-aan-microsoft-365": "microsoft-beheer",
    "beveiliging-en-privacy-microsoft-data": "microsoft-beveiliging",
    "imicrosoft-inloggen-wachtwoordbeheer": "microsoft-beveiliging",
    # stay in overige (explicit no-op for clarity — script leaves them)
    # "storing-oplossen-in-microsoft"
    # "microsoft-sql-server-databases"
    # "access-database-converteren-naar-microsoft-sql"
}


def main() -> None:
    data = json.loads(CATALOG.read_text())
    existing_slugs = {row[0] for row in data["categories"]}
    existing_articles = {a["slug"] for a in data["articles"]}

    for slug, name, desc, parent in SUBS:
        if slug not in existing_slugs:
            data["categories"].append([slug, name, desc, parent])
            existing_slugs.add(slug)
            print(f"CAT + {slug}")
        else:
            print(f"CAT = {slug} (exists)")

    added = 0
    for title, slug, topic, sub, extra in ARTICLES:
        if slug in existing_articles:
            print(f"ART = {slug} (exists)")
            continue
        cats = ["microsoft", sub, *extra]
        seen: set[str] = set()
        deduped: list[str] = []
        for c in cats:
            if c not in seen:
                seen.add(c)
                deduped.append(c)
        data["articles"].append(
            {"slug": slug, "title": title, "categories": deduped, "topic": topic}
        )
        existing_articles.add(slug)
        added += 1
        print(f"ART + {slug}")

    for art in data["articles"]:
        target = RETAG.get(art["slug"])
        if not target:
            continue
        cats = art["categories"]
        if "microsoft-overige" in cats:
            cats.remove("microsoft-overige")
            print(f"TAG - {art['slug']} ← microsoft-overige")
        if target not in cats:
            cats.append(target)
            print(f"TAG + {art['slug']} → {target}")

    ms_arts = [a for a in data["articles"] if "microsoft" in a.get("categories", [])]
    orphans = [
        a
        for a in ms_arts
        if not any(c in a["categories"] for c in ALL_CHILDREN)
    ]
    by_sub = {s: 0 for s in ALL_CHILDREN}
    for a in ms_arts:
        for s in ALL_CHILDREN:
            if s in a["categories"]:
                by_sub[s] += 1

    CATALOG.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"\nadded articles: {added}")
    print(f"microsoft total: {len(ms_arts)}")
    print(f"orphans: {len(orphans)}")
    for s, n in by_sub.items():
        print(f"  {s}: {n}")
    print(f"sum buckets: {sum(by_sub.values())}")
    print(f"total articles: {len(data['articles'])}")
    print(f"total categories: {len(data['categories'])}")
    if orphans:
        for o in orphans:
            print(" ORPHAN", o["slug"], o["categories"])
        raise SystemExit(1)
    if len(ms_arts) != 52 or sum(by_sub.values()) != 52:
        raise SystemExit(
            f"Expected 52 articles/tags, got {len(ms_arts)}/{sum(by_sub.values())}"
        )
    expected = {
        "microsoft-mail": 12,
        "microsoft-teams": 6,
        "microsoft-onedrive": 9,
        "microsoft-beheer": 14,
        "microsoft-beveiliging": 7,
        "microsoft-overige": 4,
    }
    for s, n in expected.items():
        if by_sub[s] != n:
            raise SystemExit(f"Expected {s}={n}, got {by_sub[s]}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Add 32 unique Plesk kennisbank articles + 7 subject subcategories; retag existing 25."""
from __future__ import annotations

import json
from pathlib import Path

CATALOG = Path("/Users/pro/Desktop/000-it/prisma/kennisbank/catalog.json")

PARENT_DESCRIPTION = (
    "Werken met Plesk: inloggen, websites, e-mail, SSL, databases, "
    "WordPress Toolkit, reseller en VPS."
)

SUBS = [
    (
        "plesk-starten",
        "Starten en toegang",
        "Inloggen, 2FA, extra gebruikers, panel-URL/poort 8443 en limieten.",
        "plesk",
    ),
    (
        "plesk-websites",
        "Websites en domeinen",
        "Domeinen, aliases, redirects, subdomeinen, staging en document roots.",
        "plesk",
    ),
    (
        "plesk-email-dns",
        "E-mail en DNS",
        "Mailboxen, SPF/DKIM, webmail, spamfilter, zones en MX-records.",
        "plesk",
    ),
    (
        "plesk-ssl-beveiliging",
        "SSL en beveiliging",
        "Let’s Encrypt, custom SSL, Fail2Ban, mapbeveiliging en brute-force.",
        "plesk",
    ),
    (
        "plesk-bestanden-wordpress",
        "Bestanden, databases en WordPress",
        "File Manager, FTP/SFTP, phpMyAdmin en WordPress Toolkit.",
        "plesk",
    ),
    (
        "plesk-php-vps",
        "PHP, backups en VPS",
        "PHP, cron, backups, logs, services, licentie en updates.",
        "plesk",
    ),
    (
        "plesk-reseller",
        "Reseller en abonnementen",
        "Service plans, klantaccounts, limieten en extensies.",
        "plesk",
    ),
]

# title, slug, topic, subcategory, extra categories
ARTICLES: list[tuple[str, str, str, str, list[str]]] = [
    (
        "Plesk-wachtwoord veilig resetten",
        "plesk-wachtwoord-veilig-resetten",
        "tz-pl-password-reset",
        "plesk-starten",
        [],
    ),
    (
        "Twee-factorauthenticatie (2FA) inschakelen in Plesk",
        "twee-factorauthenticatie-2fa-inschakelen-in-plesk",
        "tz-pl-2fa",
        "plesk-starten",
        ["beveiliging"],
    ),
    (
        "Eerste stappen na oplevering van een Plesk-server bij TripleZero iT",
        "eerste-stappen-na-oplevering-van-een-plesk-server-bij-triplezero-it",
        "tz-pl-first-steps",
        "plesk-starten",
        [],
    ),
    (
        "Inloggen lukt niet: poort 8443, hostname en panel-SSL",
        "inloggen-lukt-niet-poort-8443-hostname-en-panel-ssl",
        "tz-pl-login-8443",
        "plesk-starten",
        ["ssl-certificaten"],
    ),
    (
        "Resourcegebruik en abonnementslimieten bekijken in Plesk",
        "resourcegebruik-en-abonnementslimieten-bekijken-in-plesk",
        "tz-pl-resource-limits",
        "plesk-starten",
        [],
    ),
    (
        "Subdomein aanmaken in Plesk",
        "subdomein-aanmaken-in-plesk",
        "tz-pl-subdomain",
        "plesk-websites",
        ["domeinnamen"],
    ),
    (
        "Domeinalias of parked domain toevoegen in Plesk",
        "domeinalias-of-parked-domain-toevoegen-in-plesk",
        "tz-pl-domain-alias",
        "plesk-websites",
        ["domeinnamen"],
    ),
    (
        "WWW- en HTTPS-redirects instellen in Plesk",
        "www-en-https-redirects-instellen-in-plesk",
        "tz-pl-www-https-redirects",
        "plesk-websites",
        ["ssl-certificaten"],
    ),
    (
        "Een website tijdelijk uitschakelen (suspend) in Plesk",
        "een-website-tijdelijk-uitschakelen-suspend-in-plesk",
        "tz-pl-suspend-site",
        "plesk-websites",
        [],
    ),
    (
        "Website kopiëren of een staging-omgeving maken in Plesk",
        "website-kopieren-of-een-staging-omgeving-maken-in-plesk",
        "tz-pl-copy-staging",
        "plesk-websites",
        [],
    ),
    (
        "E-mailforwarders en aliases aanmaken in Plesk",
        "e-mailforwarders-en-aliases-aanmaken-in-plesk",
        "tz-pl-mail-forwarders",
        "plesk-email-dns",
        ["e-mail"],
    ),
    (
        "SPF, DKIM en DMARC instellen vanuit Plesk",
        "spf-dkim-en-dmarc-instellen-vanuit-plesk",
        "tz-pl-spf-dkim-dmarc",
        "plesk-email-dns",
        ["e-mail"],
    ),
    (
        "Mailboxquota en volle mailboxen in Plesk",
        "mailboxquota-en-volle-mailboxen-in-plesk",
        "tz-pl-mailbox-quota",
        "plesk-email-dns",
        ["e-mail"],
    ),
    (
        "Spamfilter instellen in Plesk",
        "spamfilter-instellen-in-plesk",
        "tz-pl-spamfilter",
        "plesk-email-dns",
        ["e-mail"],
    ),
    (
        "IMAP- en SMTP-instellingen voor Outlook en Apple Mail vanuit Plesk",
        "imap-en-smtp-instellingen-voor-outlook-en-apple-mail-vanuit-plesk",
        "tz-pl-imap-smtp",
        "plesk-email-dns",
        ["e-mail"],
    ),
    (
        "Eigen SSL-certificaat uploaden in Plesk",
        "eigen-ssl-certificaat-uploaden-in-plesk",
        "tz-pl-ssl-custom",
        "plesk-ssl-beveiliging",
        ["ssl-certificaten"],
    ),
    (
        "Wildcard Let’s Encrypt aanvragen in Plesk",
        "wildcard-lets-encrypt-aanvragen-in-plesk",
        "tz-pl-ssl-wildcard",
        "plesk-ssl-beveiliging",
        ["ssl-certificaten"],
    ),
    (
        "SSL-vernieuwing faalt in Plesk: oorzaken en oplossing",
        "ssl-vernieuwing-faalt-in-plesk-oorzaken-en-oplossing",
        "tz-pl-ssl-renew-fail",
        "plesk-ssl-beveiliging",
        ["ssl-certificaten"],
    ),
    (
        "Fail2Ban in Plesk: brute-force tegenhouden",
        "fail2ban-in-plesk-brute-force-tegenhouden",
        "tz-pl-fail2ban",
        "plesk-ssl-beveiliging",
        ["beveiliging"],
    ),
    (
        "Map beveiligen met een wachtwoord in Plesk",
        "map-beveiligen-met-een-wachtwoord-in-plesk",
        "tz-pl-password-protect",
        "plesk-ssl-beveiliging",
        ["beveiliging"],
    ),
    (
        "Extra FTP- of SFTP-account aanmaken in Plesk",
        "extra-ftp-of-sftp-account-aanmaken-in-plesk",
        "tz-pl-ftp-sftp",
        "plesk-bestanden-wordpress",
        [],
    ),
    (
        "phpMyAdmin: databases importeren of exporteren in Plesk",
        "phpmyadmin-databases-importeren-of-exporteren-in-plesk",
        "tz-pl-phpmyadmin",
        "plesk-bestanden-wordpress",
        [],
    ),
    (
        "Bestandsrechten (CHMOD) veilig zetten via de Plesk File Manager",
        "bestandsrechten-chmod-veilig-zetten-via-de-plesk-file-manager",
        "tz-pl-chmod",
        "plesk-bestanden-wordpress",
        [],
    ),
    (
        "WordPress Toolkit: updates en beveiligingsscan in Plesk",
        "wordpress-toolkit-updates-en-beveiligingsscan-in-plesk",
        "tz-pl-wp-toolkit-updates",
        "plesk-bestanden-wordpress",
        ["wordpress"],
    ),
    (
        "WordPress klonen of staging via WordPress Toolkit in Plesk",
        "wordpress-klonen-of-staging-via-wordpress-toolkit-in-plesk",
        "tz-pl-wp-toolkit-clone",
        "plesk-bestanden-wordpress",
        ["wordpress"],
    ),
    (
        "PHP-instellingen (memory_limit, uploadgrootte) aanpassen in Plesk",
        "php-instellingen-memory-limit-uploadgrootte-aanpassen-in-plesk",
        "tz-pl-php-ini",
        "plesk-php-vps",
        [],
    ),
    (
        "Cronjobs instellen in Plesk",
        "cronjobs-instellen-in-plesk",
        "tz-pl-cron",
        "plesk-php-vps",
        [],
    ),
    (
        "Geplande backups falen in Plesk: checklist",
        "geplande-backups-falen-in-plesk-checklist",
        "tz-pl-backup-fail",
        "plesk-php-vps",
        [],
    ),
    (
        "Eén website terugzetten zonder andere sites te overschrijven in Plesk",
        "een-website-terugzetten-zonder-andere-sites-te-overschrijven-in-plesk",
        "tz-pl-restore-one-site",
        "plesk-php-vps",
        [],
    ),
    (
        "Service plans versus subscriptions in Plesk",
        "service-plans-versus-subscriptions-in-plesk",
        "tz-pl-plans-vs-subscriptions",
        "plesk-reseller",
        [],
    ),
    (
        "Klantabonnement opschorten of limieten wijzigen als reseller",
        "klantabonnement-opschorten-of-limieten-wijzigen-als-reseller",
        "tz-pl-reseller-suspend-limits",
        "plesk-reseller",
        [],
    ),
    (
        "Plesk-extensies beheren voor je klanten (WP Toolkit, Git, Let’s Encrypt)",
        "plesk-extensies-beheren-voor-je-klanten-wp-toolkit-git-lets-encrypt",
        "tz-pl-reseller-extensions",
        "plesk-reseller",
        [],
    ),
]

RETAG = {
    "wat-is-plesk-en-hoe-log-ik-in": ["plesk-starten"],
    "overzicht-menu-items-in-plesk": ["plesk-starten"],
    "gebruikers-beheren-in-plesk": ["plesk-starten"],
    "hoe-voeg-ik-een-domein-toe-in-plesk": ["plesk-websites"],
    "hoe-verplaats-ik-een-website-naar-een-ander-domein-in-plesk": ["plesk-websites"],
    "hoofdmap-van-een-website-wijzigen-in-plesk": ["plesk-websites"],
    "verplaatsen-domein-naar-een-ander-account-in-plesk": ["plesk-websites"],
    "hoe-maak-ik-een-e-mailaccount-aan-in-plesk": ["plesk-email-dns"],
    "hoe-beheer-ik-dns-records-in-plesk": ["plesk-email-dns"],
    "webmail-applicatie-instellen-in-plesk": ["plesk-email-dns"],
    "mailserver-configuratie-voor-plesk": ["plesk-email-dns"],
    "mail-verhuizen-via-plesk": ["plesk-email-dns"],
    "hoe-installeer-ik-een-gratis-lets-encrypt-ssl-certificaat-in-plesk": [
        "plesk-ssl-beveiliging"
    ],
    "hoe-beveilig-ik-mijn-website-in-plesk": ["plesk-ssl-beveiliging"],
    "bestandsbeheer-in-plesk": ["plesk-bestanden-wordpress"],
    "hoe-maak-ik-een-database-aan-in-plesk": ["plesk-bestanden-wordpress"],
    "hoe-installeer-ik-wordpress-in-plesk": ["plesk-bestanden-wordpress"],
    "hoe-wijzig-ik-de-php-versie-in-plesk": ["plesk-php-vps"],
    "hoe-maak-ik-een-back-up-van-mijn-website-in-plesk": ["plesk-php-vps"],
    "logfiles-bekijken-in-plesk": ["plesk-php-vps"],
    "vps-service-management-beheren-in-plesk": ["plesk-php-vps"],
    "plesk-updaten-op-je-vps": ["plesk-php-vps"],
    "handmatig-een-nieuwe-plesk-licentie-installeren": ["plesk-php-vps"],
    "een-hostingpakket-aanmaken-in-plesk-als-reseller": ["plesk-reseller"],
    "toevoegen-account-in-plesk-onder-resellerpakket": ["plesk-reseller"],
}

EXPECTED = {
    "plesk-starten": 8,
    "plesk-websites": 9,
    "plesk-email-dns": 10,
    "plesk-ssl-beveiliging": 7,
    "plesk-bestanden-wordpress": 8,
    "plesk-php-vps": 10,
    "plesk-reseller": 5,
}


def main() -> None:
    data = json.loads(CATALOG.read_text())
    existing_slugs = {row[0] for row in data["categories"]}
    existing_articles = {a["slug"] for a in data["articles"]}

    for row in data["categories"]:
        if row[0] == "plesk" and row[2] != PARENT_DESCRIPTION:
            row[2] = PARENT_DESCRIPTION
            print("CAT ~ plesk description updated")

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
        cats = ["plesk", sub, *extra]
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
        tags = RETAG.get(art["slug"])
        if not tags:
            continue
        for tag in tags:
            if tag not in art["categories"]:
                art["categories"].append(tag)
                print(f"TAG + {art['slug']} → {tag}")

    real_children = [s for s, *_ in SUBS]
    pl_arts = [a for a in data["articles"] if "plesk" in a.get("categories", [])]
    orphans = [
        a
        for a in pl_arts
        if not any(c in a["categories"] for c in real_children)
    ]
    by_sub = {s: 0 for s in real_children}
    for a in pl_arts:
        for s in real_children:
            if s in a["categories"]:
                by_sub[s] += 1

    CATALOG.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"\nadded articles: {added}")
    print(f"plesk total: {len(pl_arts)}")
    print(f"orphans: {len(orphans)}")
    for s, n in by_sub.items():
        print(f"  {s}: {n}")
    print(f"sum buckets: {sum(by_sub.values())}")
    if orphans:
        for o in orphans:
            print(" ORPHAN", o["slug"], o["categories"])
        raise SystemExit(1)
    if by_sub != EXPECTED or len(pl_arts) != 57:
        raise SystemExit(f"Expected {EXPECTED} / 57, got {by_sub} / {len(pl_arts)}")
    if added not in (0, 32):
        raise SystemExit(f"Expected 32 new articles or 0 on re-run, added {added}")


if __name__ == "__main__":
    main()

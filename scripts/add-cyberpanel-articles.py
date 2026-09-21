#!/usr/bin/env python3
"""Add 50 unique CyberPanel kennisbank articles + subject subcategories; retag existing 18."""
from __future__ import annotations

import json
from pathlib import Path

CATALOG = Path("/Users/pro/Desktop/000-it/prisma/kennisbank/catalog.json")

SUBS = [
    (
        "cyberpanel-starten",
        "Starten en toegang",
        "Inloggen, 2FA, gebruikers/ACL, panel-URL/poort 8090 en limieten.",
        "cyberpanel",
    ),
    (
        "cyberpanel-websites",
        "Websites en domeinen",
        "Websites, aliases, redirects, subdomeinen, migratie en document roots.",
        "cyberpanel",
    ),
    (
        "cyberpanel-email-dns",
        "E-mail en DNS",
        "Mailboxen, SPF/DKIM, webmail, mailqueue, zones en MX-records.",
        "cyberpanel",
    ),
    (
        "cyberpanel-ssl-beveiliging",
        "SSL en beveiliging",
        "Let’s Encrypt, custom SSL, firewall, ModSecurity en brute-force.",
        "cyberpanel",
    ),
    (
        "cyberpanel-bestanden-databases",
        "Bestanden, FTP en databases",
        "File Manager, rechten, MySQL/phpMyAdmin en WordPress via CyberPanel.",
        "cyberpanel",
    ),
    (
        "cyberpanel-php-ols",
        "PHP, OpenLiteSpeed, backups en problemen",
        "PHP, OLS, cache, cron, backups en veelvoorkomende fouten.",
        "cyberpanel",
    ),
]

# title, slug, topic, subcategory, extra categories
ARTICLES: list[tuple[str, str, str, str, list[str]]] = [
    (
        "Wat is CyberPanel en hoe verschilt het van DirectAdmin of Plesk?",
        "wat-is-cyberpanel-en-hoe-verschilt-het-van-directadmin-of-plesk",
        "tz-cp-vs-other-panels",
        "cyberpanel-starten",
        [],
    ),
    (
        "Hoe reset ik mijn CyberPanel-wachtwoord veilig?",
        "hoe-reset-ik-mijn-cyberpanel-wachtwoord-veilig",
        "tz-cp-password-reset",
        "cyberpanel-starten",
        [],
    ),
    (
        "Twee-factorauthenticatie (2FA) inschakelen in CyberPanel",
        "twee-factorauthenticatie-2fa-inschakelen-in-cyberpanel",
        "tz-cp-2fa",
        "cyberpanel-starten",
        ["beveiliging"],
    ),
    (
        "Websitegebruikers en ACL: rechten beperken zonder admin te delen",
        "websitegebruikers-en-acl-rechten-beperken-zonder-admin-te-delen",
        "tz-cp-users-acl",
        "cyberpanel-starten",
        [],
    ),
    (
        "Poort 8090, hostname en panel-SSL: hoe bereik ik CyberPanel betrouwbaar?",
        "poort-8090-hostname-en-panel-ssl-hoe-bereik-ik-cyberpanel-betrouwbaar",
        "tz-cp-panel-access",
        "cyberpanel-starten",
        ["ssl-certificaten"],
    ),
    (
        "Resourcegebruik en pakketlimieten bekijken in CyberPanel",
        "resourcegebruik-en-pakketlimieten-bekijken-in-cyberpanel",
        "tz-cp-resource-limits",
        "cyberpanel-starten",
        [],
    ),
    (
        "Eerste stappen na oplevering van een CyberPanel-server bij TripleZero iT",
        "eerste-stappen-na-oplevering-van-een-cyberpanel-server-bij-triplezero-it",
        "tz-cp-first-steps-tz",
        "cyberpanel-starten",
        [],
    ),
    (
        "Alias- of parked domains toevoegen in CyberPanel",
        "alias-of-parked-domains-toevoegen-in-cyberpanel",
        "tz-cp-alias-domains",
        "cyberpanel-websites",
        ["domeinnamen"],
    ),
    (
        "Document root en websitepaden begrijpen in CyberPanel",
        "document-root-en-websitepaden-begrijpen-in-cyberpanel",
        "tz-cp-document-root",
        "cyberpanel-websites",
        [],
    ),
    (
        "Website of child domain verwijderen zonder dataverlies",
        "website-of-child-domain-verwijderen-zonder-dataverlies",
        "tz-cp-delete-site-safe",
        "cyberpanel-websites",
        [],
    ),
    (
        "WWW naar non-WWW (of omgekeerd) forceren in CyberPanel",
        "www-naar-non-www-of-omgekeerd-forceren-in-cyberpanel",
        "tz-cp-www-canonical",
        "cyberpanel-websites",
        [],
    ),
    (
        "HTTPS forceren na SSL-uitgifte in CyberPanel",
        "https-forceren-na-ssl-uitgifte-in-cyberpanel",
        "tz-cp-force-https",
        "cyberpanel-websites",
        ["ssl-certificaten"],
    ),
    (
        "Meerdere websites op één CyberPanel-server beheren",
        "meerdere-websites-op-een-cyberpanel-server-beheren",
        "tz-cp-multi-sites",
        "cyberpanel-websites",
        [],
    ),
    (
        "Een website tijdelijk uitschakelen (suspend) in CyberPanel",
        "een-website-tijdelijk-uitschakelen-suspend-in-cyberpanel",
        "tz-cp-suspend-site",
        "cyberpanel-websites",
        [],
    ),
    (
        "Bestanden deployen naar de document root (upload, zip, Git) via CyberPanel",
        "bestanden-deployen-naar-document-root-upload-zip-git-via-cyberpanel",
        "tz-cp-deploy-docroot",
        "cyberpanel-websites",
        [],
    ),
    (
        "SPF, DKIM en DMARC instellen vanuit CyberPanel",
        "spf-dkim-en-dmarc-instellen-vanuit-cyberpanel",
        "tz-cp-spf-dkim-dmarc",
        "cyberpanel-email-dns",
        ["e-mail"],
    ),
    (
        "Webmail openen en inlogproblemen oplossen in CyberPanel",
        "webmail-openen-en-inlogproblemen-oplossen-in-cyberpanel",
        "tz-cp-webmail",
        "cyberpanel-email-dns",
        ["e-mail"],
    ),
    (
        "E-mailforwarders en aliases aanmaken in CyberPanel",
        "e-mailforwarders-en-aliases-aanmaken-in-cyberpanel",
        "tz-cp-mail-forwarders",
        "cyberpanel-email-dns",
        ["e-mail"],
    ),
    (
        "Mailboxquota en volle mailboxen in CyberPanel",
        "mailboxquota-en-volle-mailboxen-in-cyberpanel",
        "tz-cp-mailbox-quota",
        "cyberpanel-email-dns",
        ["e-mail"],
    ),
    (
        "Uitgaande mail komt niet aan: queue en SMTP-checks in CyberPanel",
        "uitgaande-mail-komt-niet-aan-queue-en-smtp-checks-in-cyberpanel",
        "tz-cp-mail-queue",
        "cyberpanel-email-dns",
        ["e-mail"],
    ),
    (
        "Catch-all mailbox: wanneer wel of niet in CyberPanel",
        "catch-all-mailbox-wanneer-wel-of-niet-in-cyberpanel",
        "tz-cp-catchall",
        "cyberpanel-email-dns",
        ["e-mail"],
    ),
    (
        "Nameservers van CyberPanel gebruiken versus externe DNS",
        "nameservers-van-cyberpanel-gebruiken-versus-externe-dns",
        "tz-cp-nameservers",
        "cyberpanel-email-dns",
        ["domeinnamen"],
    ),
    (
        "MX- en mailrecords correct zetten in CyberPanel DNS",
        "mx-en-mailrecords-correct-zetten-in-cyberpanel-dns",
        "tz-cp-mx-records",
        "cyberpanel-email-dns",
        ["e-mail", "domeinnamen"],
    ),
    (
        "DNS-propagatie controleren na wijzigingen in CyberPanel",
        "dns-propagatie-controleren-na-wijzigingen-in-cyberpanel",
        "tz-cp-dns-propagation",
        "cyberpanel-email-dns",
        ["domeinnamen"],
    ),
    (
        "SSL-vernieuwing faalt in CyberPanel: oorzaken en oplossing",
        "ssl-vernieuwing-faalt-in-cyberpanel-oorzaken-en-oplossing",
        "tz-cp-ssl-renew-fail",
        "cyberpanel-ssl-beveiliging",
        ["ssl-certificaten"],
    ),
    (
        "Wildcard Let’s Encrypt aanvragen in CyberPanel",
        "wildcard-lets-encrypt-aanvragen-in-cyberpanel",
        "tz-cp-ssl-wildcard",
        "cyberpanel-ssl-beveiliging",
        ["ssl-certificaten"],
    ),
    (
        "Eigen (custom) SSL-certificaat uploaden in CyberPanel",
        "eigen-custom-ssl-certificaat-uploaden-in-cyberpanel",
        "tz-cp-ssl-custom",
        "cyberpanel-ssl-beveiliging",
        ["ssl-certificaten"],
    ),
    (
        "SSL voor webmail en mailverkeer in CyberPanel",
        "ssl-voor-webmail-en-mailverkeer-in-cyberpanel",
        "tz-cp-ssl-mail",
        "cyberpanel-ssl-beveiliging",
        ["ssl-certificaten", "e-mail"],
    ),
    (
        "Mixed content (HTTP op HTTPS) oplossen na CyberPanel-SSL",
        "mixed-content-http-op-https-oplossen-na-cyberpanel-ssl",
        "tz-cp-mixed-content",
        "cyberpanel-ssl-beveiliging",
        ["ssl-certificaten"],
    ),
    (
        "Firewall-poorten openen in CyberPanel zonder de server onveilig te maken",
        "firewall-poorten-openen-in-cyberpanel-zonder-server-onveilig",
        "tz-cp-firewall-ports",
        "cyberpanel-ssl-beveiliging",
        ["beveiliging"],
    ),
    (
        "ModSecurity false positives: regels tijdelijk uitzetten per site",
        "modsecurity-false-positives-regels-tijdelijk-uitzetten-per-site",
        "tz-cp-modsec-false-positive",
        "cyberpanel-ssl-beveiliging",
        ["beveiliging"],
    ),
    (
        "Brute-force op wp-login of het panel: wat doet CyberPanel?",
        "brute-force-op-wp-login-of-het-panel-wat-doet-cyberpanel",
        "tz-cp-bruteforce",
        "cyberpanel-ssl-beveiliging",
        ["beveiliging", "wordpress"],
    ),
    (
        "Verdachte bestanden of malware: controleren en herstellen via CyberPanel",
        "verdachte-bestanden-of-malware-controleren-en-herstellen-via-cyberpanel",
        "tz-cp-malware",
        "cyberpanel-ssl-beveiliging",
        ["beveiliging"],
    ),
    (
        "phpMyAdmin openen en databases importeren of exporteren in CyberPanel",
        "phpmyadmin-openen-en-databases-importeren-of-exporteren-in-cyberpanel",
        "tz-cp-phpmyadmin",
        "cyberpanel-bestanden-databases",
        [],
    ),
    (
        "Databasegebruikers, rechten en remote MySQL in CyberPanel",
        "databasegebruikers-rechten-en-remote-mysql-in-cyberpanel",
        "tz-cp-mysql-users-remote",
        "cyberpanel-bestanden-databases",
        [],
    ),
    (
        "Schijfruimte, inodes en mislukte uploads in CyberPanel",
        "schijfruimte-inodes-en-mislukte-uploads-in-cyberpanel",
        "tz-cp-disk-inodes",
        "cyberpanel-bestanden-databases",
        [],
    ),
    (
        "Bestandsrechten (CHMOD) veilig zetten via de File Manager",
        "bestandsrechten-chmod-veilig-zetten-via-de-file-manager",
        "tz-cp-chmod",
        "cyberpanel-bestanden-databases",
        [],
    ),
    (
        "Grote zip-archieven uitpakken in CyberPanel zonder timeouts",
        "grote-zip-archieven-uitpakken-in-cyberpanel-zonder-timeouts",
        "tz-cp-unzip-large",
        "cyberpanel-bestanden-databases",
        [],
    ),
    (
        "WordPress herinstalleren of herstellen via CyberPanel zonder alles te wissen",
        "wordpress-herinstalleren-of-herstellen-via-cyberpanel-zonder-alles-te-wissen",
        "tz-cp-wp-reinstall",
        "cyberpanel-bestanden-databases",
        ["wordpress"],
    ),
    (
        "SFTP-sleutels en veiligere file-toegang naast FTP in CyberPanel",
        "sftp-sleutels-en-veiligere-file-toegang-naast-ftp-in-cyberpanel",
        "tz-cp-sftp-keys",
        "cyberpanel-bestanden-databases",
        ["beveiliging"],
    ),
    (
        "Database backup los van volledige websitebackup in CyberPanel",
        "database-backup-los-van-volledige-websitebackup-in-cyberpanel",
        "tz-cp-db-backup-only",
        "cyberpanel-bestanden-databases",
        [],
    ),
    (
        "LiteSpeed Cache voor WordPress activeren via CyberPanel / OpenLiteSpeed",
        "litespeed-cache-voor-wordpress-activeren-via-cyberpanel-openlitespeed",
        "tz-cp-lscache",
        "cyberpanel-php-ols",
        ["wordpress"],
    ),
    (
        "Rewrite rules en .htaccess-gedrag onder OpenLiteSpeed in CyberPanel",
        "rewrite-rules-en-htaccess-gedrag-onder-openlitespeed-in-cyberpanel",
        "tz-cp-rewrite-htaccess",
        "cyberpanel-php-ols",
        [],
    ),
    (
        "OpenLiteSpeed herstarten (graceful) vanuit CyberPanel",
        "openlitespeed-herstarten-graceful-vanuit-cyberpanel",
        "tz-cp-ols-restart",
        "cyberpanel-php-ols",
        [],
    ),
    (
        "Error- en access-logs vinden en lezen in CyberPanel",
        "error-en-access-logs-vinden-en-lezen-in-cyberpanel",
        "tz-cp-logs",
        "cyberpanel-php-ols",
        [],
    ),
    (
        "PHP-extensies en php.ini per site aanpassen in CyberPanel",
        "php-extensies-en-php-ini-per-site-aanpassen-in-cyberpanel",
        "tz-cp-php-ext-ini",
        "cyberpanel-php-ols",
        [],
    ),
    (
        "Cronjob faalt of draait dubbel: debuggen in CyberPanel",
        "cronjob-faalt-of-draait-dubbel-debuggen-in-cyberpanel",
        "tz-cp-cron-debug",
        "cyberpanel-php-ols",
        [],
    ),
    (
        "Geplande backups falen in CyberPanel: checklist",
        "geplande-backups-falen-in-cyberpanel-checklist",
        "tz-cp-backup-fail",
        "cyberpanel-php-ols",
        [],
    ),
    (
        "Eén website terugzetten zonder andere sites te overschrijven",
        "een-website-terugzetten-zonder-andere-sites-te-overschrijven",
        "tz-cp-restore-one-site",
        "cyberpanel-php-ols",
        [],
    ),
    (
        "Kan niet inloggen op poort 8090 of krijg 503/508 op OpenLiteSpeed",
        "kan-niet-inloggen-op-poort-8090-of-krijg-503-508-op-openlitespeed",
        "tz-cp-8090-503",
        "cyberpanel-php-ols",
        [],
    ),
]

RETAG = {
    "inloggen-op-cyberpanel": ["cyberpanel-starten"],
    "domein-toevoegen-in-cyberpanel": ["cyberpanel-websites"],
    "subdomeinen-aanmaken-in-cyberpanel": ["cyberpanel-websites"],
    "domein-redirects-instellen-in-cyberpanel": ["cyberpanel-websites"],
    "websites-verplaatsen-tussen-accounts-in-cyberpanel": ["cyberpanel-websites"],
    "e-mailaccounts-beheren-in-cyberpanel": ["cyberpanel-email-dns"],
    "dns-records-beheren-in-cyberpanel": ["cyberpanel-email-dns"],
    "lets-encrypt-ssl-installeren-in-cyberpanel": ["cyberpanel-ssl-beveiliging"],
    "firewall-en-modsecurity-in-cyberpanel": ["cyberpanel-ssl-beveiliging"],
    "file-manager-gebruiken-in-cyberpanel": ["cyberpanel-bestanden-databases"],
    "ftp-en-sftp-instellen-via-cyberpanel": ["cyberpanel-bestanden-databases"],
    "mysql-databases-aanmaken-in-cyberpanel": ["cyberpanel-bestanden-databases"],
    "wordpress-installeren-via-cyberpanel": ["cyberpanel-bestanden-databases"],
    "php-versie-wijzigen-in-cyberpanel": ["cyberpanel-php-ols"],
    "openlitespeed-basics-in-cyberpanel": ["cyberpanel-php-ols"],
    "cronjobs-instellen-in-cyberpanel": ["cyberpanel-php-ols"],
    "backups-maken-en-terugzetten-in-cyberpanel": ["cyberpanel-php-ols"],
    "problemen-oplossen-in-cyberpanel": ["cyberpanel-php-ols"],
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
        cats = ["cyberpanel", sub, *extra]
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
    cp_arts = [a for a in data["articles"] if "cyberpanel" in a.get("categories", [])]
    orphans = [
        a
        for a in cp_arts
        if not any(c in a["categories"] for c in real_children)
    ]
    by_sub = {s: 0 for s in real_children}
    for a in cp_arts:
        for s in real_children:
            if s in a["categories"]:
                by_sub[s] += 1

    CATALOG.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"\nadded articles: {added}")
    print(f"cyberpanel total: {len(cp_arts)}")
    print(f"orphans: {len(orphans)}")
    for s, n in by_sub.items():
        print(f"  {s}: {n}")
    print(f"sum buckets: {sum(by_sub.values())}")
    if orphans:
        for o in orphans:
            print(" ORPHAN", o["slug"], o["categories"])
        raise SystemExit(1)
    expected = {
        "cyberpanel-starten": 8,
        "cyberpanel-websites": 12,
        "cyberpanel-email-dns": 11,
        "cyberpanel-ssl-beveiliging": 11,
        "cyberpanel-bestanden-databases": 12,
        "cyberpanel-php-ols": 14,
    }
    if by_sub != expected or len(cp_arts) != 68:
        raise SystemExit(f"Expected {expected} / 68, got {by_sub} / {len(cp_arts)}")
    if added != 50 and added != 0:
        # allow 0 on re-run
        if added < 50 and any(
            t[1] not in {a["slug"] for a in data["articles"]} for t in ARTICLES
        ):
            raise SystemExit(f"Expected 50 new articles, added {added}")


if __name__ == "__main__":
    main()

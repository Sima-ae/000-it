#!/usr/bin/env python3
"""Add 20 unique Veilig Online kennisbank articles + 6 subject subcategories; retag existing 31."""
from __future__ import annotations

import json
from pathlib import Path

CATALOG = Path("/Users/pro/Desktop/000-it/prisma/kennisbank/catalog.json")

PARENT_DESCRIPTION = (
    "Bewust veilig internetten: phishing, wachtwoorden, malware, wifi, VPN, "
    "privacy en gezin — inclusief de subcategorieën Basis, Phishing, "
    "Wachtwoorden, Malware, Netwerk en Privacy."
)

SUBS = [
    (
        "veilig-online-basis",
        "Basis en bewustwording",
        "Waarom veilig online belangrijk is, algemene tips en fraude-overzicht.",
        "veilig-online",
    ),
    (
        "veilig-online-phishing",
        "Phishing en oplichting",
        "Phishing, nepwebsites, social engineering, smishing, scams en fraude.",
        "veilig-online",
    ),
    (
        "veilig-online-wachtwoorden",
        "Wachtwoorden en accounts",
        "Wachtwoorden, 2FA, accountbeveiliging, login en herstel.",
        "veilig-online",
    ),
    (
        "veilig-online-malware",
        "Malware en apparaten",
        "Virussen, malware, ransomware, updates, downloads en apparaatbeveiliging.",
        "veilig-online",
    ),
    (
        "veilig-online-netwerk",
        "Netwerk, wifi en VPN",
        "Openbare wifi, routerbeveiliging, VPN, MITM, brute-force en DDoS.",
        "veilig-online",
    ),
    (
        "veilig-online-privacy",
        "Privacy, gegevens en gezin",
        "Datalekken, kinderen online, social privacy, winkelen en identiteit.",
        "veilig-online",
    ),
]

# title, slug, topic, subcategory, extra categories
ARTICLES: list[tuple[str, str, str, str, list[str]]] = [
    (
        "Twee-factorauthenticatie (2FA) inschakelen voor je online accounts",
        "twee-factorauthenticatie-2fa-inschakelen-online-accounts",
        "tz-vo-2fa",
        "veilig-online-wachtwoorden",
        ["beveiliging"],
    ),
    (
        "Smishing: phishing via sms en WhatsApp herkennen",
        "smishing-phishing-via-sms-en-whatsapp-herkennen",
        "tz-vo-smishing",
        "veilig-online-phishing",
        ["beveiliging"],
    ),
    (
        "CEO-fraude en factuurfraude herkennen",
        "ceo-fraude-en-factuurfraude-herkennen",
        "tz-vo-ceo-fraude",
        "veilig-online-phishing",
        ["beveiliging"],
    ),
    (
        "QR-code phishing (quishing) herkennen",
        "qr-code-phishing-quishing-herkennen",
        "tz-vo-quishing",
        "veilig-online-phishing",
        ["beveiliging"],
    ),
    (
        "Nep-helpdesk en tech support-scams herkennen",
        "nep-helpdesk-en-tech-support-scams-herkennen",
        "tz-vo-tech-support-scam",
        "veilig-online-phishing",
        ["beveiliging"],
    ),
    (
        "Deepfake- en voice-scams herkennen",
        "deepfake-en-voice-scams-herkennen",
        "tz-vo-deepfake",
        "veilig-online-phishing",
        ["beveiliging"],
    ),
    (
        "Een wachtwoordmanager kiezen en veilig gebruiken",
        "wachtwoordmanager-kiezen-en-veilig-gebruiken",
        "tz-vo-password-manager",
        "veilig-online-wachtwoorden",
        ["beveiliging"],
    ),
    (
        "Account terugkrijgen na een hack",
        "account-terugkrijgen-na-een-hack",
        "tz-vo-account-recovery",
        "veilig-online-wachtwoorden",
        ["beveiliging"],
    ),
    (
        "SIM-swap fraude voorkomen",
        "sim-swap-fraude-voorkomen",
        "tz-vo-sim-swap",
        "veilig-online-wachtwoorden",
        ["beveiliging"],
    ),
    (
        "Ransomware herkennen en wat te doen bij een infectie",
        "ransomware-herkennen-en-wat-te-doen",
        "tz-vo-ransomware",
        "veilig-online-malware",
        ["beveiliging"],
    ),
    (
        "Veilig bestanden downloaden en bijlagen openen",
        "veilig-bestanden-downloaden-en-bijlagen-openen",
        "tz-vo-safe-downloads",
        "veilig-online-malware",
        ["beveiliging"],
    ),
    (
        "Browseruitbreidingen veilig kiezen en controleren",
        "browseruitbreidingen-veilig-kiezen-en-controleren",
        "tz-vo-browser-extensions",
        "veilig-online-malware",
        ["beveiliging"],
    ),
    (
        "Software-updates: waarom ze essentieel zijn voor je veiligheid",
        "software-updates-essentieel-voor-veiligheid",
        "tz-vo-software-updates",
        "veilig-online-malware",
        ["beveiliging"],
    ),
    (
        "Wat betekent het slotje (HTTPS) in de browser?",
        "wat-betekent-het-slotje-https-in-de-browser",
        "tz-vo-https-slotje",
        "veilig-online-basis",
        ["beveiliging", "ssl-certificaten"],
    ),
    (
        "Back-ups als beveiligingsmaatregel",
        "back-ups-als-beveiligingsmaatregel",
        "tz-vo-backups-security",
        "veilig-online-basis",
        ["beveiliging", "support"],
    ),
    (
        "Veilig online winkelen: waar let je op?",
        "veilig-online-winkelen-waar-let-je-op",
        "tz-vo-online-shopping",
        "veilig-online-privacy",
        ["beveiliging"],
    ),
    (
        "Identiteitsdiefstal herkennen en melden",
        "identiteitsdiefstal-herkennen-en-melden",
        "tz-vo-identity-theft",
        "veilig-online-privacy",
        ["beveiliging"],
    ),
    (
        "Privacy-instellingen op social media controleren",
        "privacy-instellingen-op-social-media-controleren",
        "tz-vo-social-privacy",
        "veilig-online-privacy",
        ["beveiliging"],
    ),
    (
        "IoT en slimme apparaten beveiligen thuis",
        "iot-en-slimme-apparaten-beveiligen-thuis",
        "tz-vo-iot",
        "veilig-online-netwerk",
        ["beveiliging"],
    ),
    (
        "Smartphone beveiligen: vergrendeling, apps en toestemmingen",
        "smartphone-beveiligen-vergrendeling-apps-toestemmingen",
        "tz-vo-smartphone",
        "veilig-online-malware",
        ["beveiliging"],
    ),
]

RETAG: dict[str, str] = {
    # basis
    "tips-voor-veilig-internetten-veilig-online": "veilig-online-basis",
    "waarom-is-het-belangrijk-om-veilig-online-te-zijn": "veilig-online-basis",
    "fraude-voorkomen": "veilig-online-basis",
    # phishing
    "hoe-herken-ik-een-phising-e-mail": "veilig-online-phishing",
    "hoe-herken-ik-een-nep-website-en-voorkom-ik-phishing": "veilig-online-phishing",
    "social-engineering-veilig-online": "veilig-online-phishing",
    "wat-is-social-engineering-en-hoe-bescherm-ik-me-ertegen": "veilig-online-phishing",
    "scammers-actief-met-nepmails": "veilig-online-phishing",
    # wachtwoorden
    "hoe-maak-ik-een-sterk-wachtwoord-en-bewaar-ik-het-veilig": "veilig-online-wachtwoorden",
    "hoe-stel-ik-een-sterk-wachtwoord-in-en-bewaar-ik-het-veilig": "veilig-online-wachtwoorden",
    "veilige-wachtwoorden-maken": "veilig-online-wachtwoorden",
    "hoe-bescherm-ik-mijn-online-accounts-tegen-hackers": "veilig-online-wachtwoorden",
    "wachtwoorden-veilig-versturen-met-pep": "veilig-online-wachtwoorden",
    "wachtwoord-kopieren-uit-browser-of-tool": "veilig-online-wachtwoorden",
    "nieuw-e-mailwachtwoord-instellen": "veilig-online-wachtwoorden",
    "directadmin-wachtwoord-aanpassen": "veilig-online-wachtwoorden",
    "root-wachtwoord-herstellen-vps": "veilig-online-wachtwoorden",
    "inloggen-op-je-klantomgeving": "veilig-online-wachtwoorden",
    "imicrosoft-inloggen-wachtwoordbeheer": "veilig-online-wachtwoorden",
    # malware
    "virussen-veilig-online": "veilig-online-malware",
    "hoe-herken-en-voorkom-ik-een-malware-infectie": "veilig-online-malware",
    "patchman": "veilig-online-malware",
    "hotlink-protection": "veilig-online-malware",
    "een-eigen-url-shortener-hoe-doe-ik-dat": "veilig-online-malware",
    # netwerk
    "wat-zijn-de-risicos-van-een-openbaar-wifi-netwerk": "veilig-online-netwerk",
    "hoe-beveilig-ik-mijn-netwerk-en-router": "veilig-online-netwerk",
    "hoe-gebruik-ik-een-vpn-voor-een-veilige-internetverbinding": "veilig-online-netwerk",
    "brute-force-aanval-en-man-in-the-middle-aanval": "veilig-online-netwerk",
    "alles-over-ddos-aanvallen": "veilig-online-netwerk",
    # privacy
    "hoe-bescherm-ik-mijn-kinderen-online": "veilig-online-privacy",
    "hoe-bescherm-ik-mijn-gegevens-bij-een-datalek": "veilig-online-privacy",
}

EXPECTED = {
    "veilig-online-basis": 5,
    "veilig-online-phishing": 10,
    "veilig-online-wachtwoorden": 15,
    "veilig-online-malware": 10,
    "veilig-online-netwerk": 6,
    "veilig-online-privacy": 5,
}


def main() -> None:
    data = json.loads(CATALOG.read_text())
    existing_slugs = {row[0] for row in data["categories"]}
    existing_articles = {a["slug"] for a in data["articles"]}

    for row in data["categories"]:
        if row[0] == "veilig-online" and row[2] != PARENT_DESCRIPTION:
            row[2] = PARENT_DESCRIPTION
            print("CAT ~ veilig-online description updated")

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
        cats = ["veilig-online", sub, *extra]
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

    real_children = [s for s, *_ in SUBS]
    for art in data["articles"]:
        target = RETAG.get(art["slug"])
        if not target:
            continue
        cats = art["categories"]
        for child in real_children:
            if child in cats and child != target:
                cats.remove(child)
                print(f"TAG - {art['slug']} ← {child}")
        if target not in cats:
            cats.append(target)
            print(f"TAG + {art['slug']} → {target}")
        if "veilig-online" not in cats:
            cats.insert(0, "veilig-online")
            print(f"TAG + {art['slug']} → veilig-online")

    vo_arts = [
        a for a in data["articles"] if "veilig-online" in a.get("categories", [])
    ]
    orphans = [
        a
        for a in vo_arts
        if not any(c in a["categories"] for c in real_children)
    ]
    by_sub = {s: 0 for s in real_children}
    multi = []
    for a in vo_arts:
        hits = [s for s in real_children if s in a["categories"]]
        if len(hits) > 1:
            multi.append((a["slug"], hits))
        for s in hits:
            by_sub[s] += 1

    CATALOG.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"\nadded articles: {added}")
    print(f"veilig-online total: {len(vo_arts)}")
    print(f"orphans: {len(orphans)}")
    for s, n in by_sub.items():
        print(f"  {s}: {n}")
    print(f"sum buckets: {sum(by_sub.values())}")
    if orphans:
        for o in orphans:
            print(" ORPHAN", o["slug"], o["categories"])
        raise SystemExit(1)
    if multi:
        for slug, hits in multi:
            print(" MULTI", slug, hits)
        raise SystemExit(1)
    if by_sub != EXPECTED or len(vo_arts) != 51:
        raise SystemExit(f"Expected {EXPECTED} / 51, got {by_sub} / {len(vo_arts)}")
    if added not in (0, 20):
        raise SystemExit(f"Expected 20 new articles or 0 on re-run, added {added}")


if __name__ == "__main__":
    main()

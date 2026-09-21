#!/usr/bin/env python3
"""Add 20 unique AI-scan kennisbank articles + subject subcategories; retag existing 12."""
from __future__ import annotations

import json
from pathlib import Path

CATALOG = Path("/Users/pro/Desktop/000-it/prisma/kennisbank/catalog.json")

SUBS = [
    (
        "ai-scan-starten",
        "Starten en basis",
        "Wat de AI-scan is, hoe je start, URL-keuze, gratis gebruik en hoe vaak je scant.",
        "ai-scan",
    ),
    (
        "ai-scan-scores",
        "Scores begrijpen",
        "Scorekaart lezen: AEO, GEO, SEO, Performance, AI Readiness en prioriteiten.",
        "ai-scan",
    ),
    (
        "ai-scan-verbeteren",
        "Scores verbeteren",
        "Lage scores aanpakken, snelle fixes en meten na wijzigingen.",
        "ai-scan",
    ),
    (
        "ai-scan-dashboard",
        "Dashboard en historie",
        "Eerdere scans, SEO-analyse, contact over resultaten en scanproblemen.",
        "ai-scan",
    ),
    (
        "ai-scan-oplossingen",
        "Oplossingen en trajecten",
        "Pakketten, AEO/GEO/SEO-diensten, agents, redesign en bureau-gebruik.",
        "ai-scan",
    ),
]

# title, slug, topic, subcategory, extra categories
ARTICLES: list[tuple[str, str, str, str, list[str]]] = [
    (
        "Is de AI-scan gratis en wat krijg ik precies?",
        "is-de-ai-scan-gratis-en-wat-krijg-ik-precies",
        "tz-aiscan-free-what",
        "ai-scan-starten",
        [],
    ),
    (
        "Welke URL moet ik invoeren bij de AI-scan (www, apex of staging)?",
        "welke-url-moet-ik-invoeren-bij-de-ai-scan-www-apex-of-staging",
        "tz-aiscan-which-url",
        "ai-scan-starten",
        [],
    ),
    (
        "Waarom bedrijfsnaam en doelen bij de AI-scan invullen?",
        "waarom-bedrijfsnaam-en-doelen-bij-de-ai-scan-invullen",
        "tz-aiscan-company-goals",
        "ai-scan-starten",
        [],
    ),
    (
        "Hoe vaak moet ik een AI-scan herhalen?",
        "hoe-vaak-moet-ik-een-ai-scan-herhalen",
        "tz-aiscan-how-often",
        "ai-scan-starten",
        [],
    ),
    (
        "Wat betekent een lage Performance-score en hoe verbeter ik die?",
        "wat-betekent-een-lage-performance-score-en-hoe-verbeter-ik-die",
        "tz-aiscan-perf-low",
        "ai-scan-verbeteren",
        [],
    ),
    (
        "Hoe prioriteer ik als meerdere AI-scan scores laag zijn?",
        "hoe-prioriteer-ik-als-meerdere-ai-scan-scores-laag-zijn",
        "tz-aiscan-prioritize",
        "ai-scan-scores",
        [],
    ),
    (
        "Wat is het verschil tussen de SEO-score en AI Readiness?",
        "wat-is-het-verschil-tussen-de-seo-score-en-ai-readiness",
        "tz-aiscan-seo-vs-readiness",
        "ai-scan-scores",
        ["aeo-geo-seo"],
    ),
    (
        "Hoe lees ik mijn scorekaart als lokaal bedrijf versus landelijk merk?",
        "hoe-lees-ik-mijn-scorekaart-als-lokaal-bedrijf-versus-landelijk-merk",
        "tz-aiscan-local-vs-national",
        "ai-scan-scores",
        [],
    ),
    (
        "Welke snelle fixes leveren het snelst scorewinst op na een AI-scan?",
        "welke-snelle-fixes-leveren-het-snelst-scorewinst-op-na-een-ai-scan",
        "tz-aiscan-quick-wins",
        "ai-scan-verbeteren",
        [],
    ),
    (
        "Hoe verbeter ik AI Readiness concreet na mijn scan?",
        "hoe-verbeter-ik-ai-readiness-concreet-na-mijn-scan",
        "tz-aiscan-improve-readiness",
        "ai-scan-verbeteren",
        [],
    ),
    (
        "Hoe meet ik of mijn website beter scoort na aanpassingen?",
        "hoe-meet-ik-of-mijn-website-beter-scoort-na-aanpassingen",
        "tz-aiscan-measure-after",
        "ai-scan-verbeteren",
        [],
    ),
    (
        "Wat doe ik als alleen mijn homepage goed scoort, maar dienstenpagina’s niet?",
        "wat-doe-ik-als-alleen-mijn-homepage-goed-scoort-maar-dienstenpaginas-niet",
        "tz-aiscan-homepage-vs-services",
        "ai-scan-verbeteren",
        [],
    ),
    (
        "Hoe contacteer ik TripleZero iT over mijn AI-scanresultaten?",
        "hoe-contacteer-ik-triplezero-it-over-mijn-ai-scanresultaten",
        "tz-aiscan-contact-results",
        "ai-scan-dashboard",
        ["support"],
    ),
    (
        "Wat doe ik als de AI-scan mislukt of blijft hangen?",
        "wat-doe-ik-als-de-ai-scan-mislukt-of-blijft-hangen",
        "tz-aiscan-scan-fail",
        "ai-scan-dashboard",
        [],
    ),
    (
        "Kan ik meerdere websites of concurrenten scannen?",
        "kan-ik-meerdere-websites-of-concurrenten-scannen",
        "tz-aiscan-multiple-sites",
        "ai-scan-dashboard",
        [],
    ),
    (
        "Hoe deel ik mijn AI-scanresultaten met een collega of specialist?",
        "hoe-deel-ik-mijn-ai-scanresultaten-met-een-collega-of-specialist",
        "tz-aiscan-share-results",
        "ai-scan-dashboard",
        [],
    ),
    (
        "Welke TripleZero-pakketten bevatten de AI-scanner?",
        "welke-triplezero-pakketten-bevatten-de-ai-scanner",
        "tz-aiscan-packages",
        "ai-scan-oplossingen",
        ["shop-en-pakketten"],
    ),
    (
        "Wanneer kies ik AEO-, GEO- of SEO-optimalisatie na mijn scan?",
        "wanneer-kies-ik-aeo-geo-of-seo-optimalisatie-na-mijn-scan",
        "tz-aiscan-choose-service",
        "ai-scan-oplossingen",
        ["aeo-geo-seo"],
    ),
    (
        "Hoe gebruik ik de AI-scan vóór een website-lancering of redesign?",
        "hoe-gebruik-ik-de-ai-scan-voor-een-website-lancering-of-redesign",
        "tz-aiscan-before-launch",
        "ai-scan-oplossingen",
        [],
    ),
    (
        "Is de AI-scan geschikt voor bureaus en hun klanten?",
        "is-de-ai-scan-geschikt-voor-bureaus-en-hun-klanten",
        "tz-aiscan-agencies",
        "ai-scan-oplossingen",
        [],
    ),
]

# Existing articles → subcategory tags
RETAG: dict[str, list[str]] = {
    "wat-is-de-ai-scan-van-triplezero-it-hosting": ["ai-scan-starten"],
    "hoe-start-ik-een-ai-scan-op-mijn-website": ["ai-scan-starten"],
    "hoe-lees-ik-de-ai-scan-scores-aeo-geo-seo-performance-en-ai-readiness": [
        "ai-scan-scores"
    ],
    "wat-is-ai-readiness-in-de-scan-en-waarom-is-dat-belangrijk": ["ai-scan-scores"],
    "wat-betekenen-een-lage-aeo-score-en-hoe-verbeter-ik-die": ["ai-scan-verbeteren"],
    "wat-betekenen-een-lage-geo-score-en-hoe-verbeter-ik-lokale-vindbaarheid": [
        "ai-scan-verbeteren"
    ],
    "wat-betekenen-een-lage-seo-score-en-hoe-verbeter-ik-die": ["ai-scan-verbeteren"],
    "welke-vervolgstappen-zet-ik-na-mijn-ai-scan": ["ai-scan-verbeteren"],
    "waar-vind-ik-mijn-eerdere-ai-scans-in-het-dashboard-seo-analyse": [
        "ai-scan-dashboard"
    ],
    "welke-snelle-links-heeft-mijn-dashboard-tickets-crm-ai-scan-agents": [
        "ai-scan-dashboard"
    ],
    "ai-scan-versus-een-volledig-aeo-geo-seo-traject-wat-is-het-verschil": [
        "ai-scan-oplossingen"
    ],
    "hoe-gebruik-ik-ai-agents-samen-met-de-ai-scan": ["ai-scan-oplossingen"],
    "hoe-combineer-ik-ai-scan-traject-en-doorlopende-optimalisatie": [
        "ai-scan-oplossingen"
    ],
    "hoe-kies-ik-prioriteiten-als-aeo-geo-en-seo-tegelijk-laag-scoren": [
        "ai-scan-scores"
    ],
}


def main() -> None:
    data = json.loads(CATALOG.read_text())
    existing_slugs = {c[0] for c in data["categories"]}
    existing_articles = {a["slug"] for a in data["articles"]}

    for slug, name, desc, parent in SUBS:
        if slug in existing_slugs:
            print(f"CAT = {slug} (exists)")
            continue
        data["categories"].append([slug, name, desc, parent])
        existing_slugs.add(slug)
        print(f"CAT + {slug}")

    added = 0
    for title, slug, topic, sub, extra in ARTICLES:
        if slug in existing_articles:
            print(f"ART = {slug} (exists)")
            continue
        cats = ["ai-scan", sub, *extra]
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
        extra_tags = RETAG.get(art["slug"])
        if not extra_tags:
            continue
        for tag in extra_tags:
            if tag not in art["categories"]:
                art["categories"].append(tag)
                print(f"TAG + {art['slug']} → {tag}")

    # Leftovers under ai-scan without a real subject sub
    real_children = {s for s, *_ in SUBS}
    leftover_slug = "ai-scan-overige"
    leftover: list[dict] = []
    for art in data["articles"]:
        cats = set(art["categories"])
        if "ai-scan" not in cats:
            continue
        if any(c in cats for c in real_children):
            continue
        leftover.append(art)
    if leftover:
        if leftover_slug not in existing_slugs:
            data["categories"].append(
                [
                    leftover_slug,
                    "Overige",
                    "Overige artikelen over de AI-scan die niet onder een specifiek onderwerp vallen.",
                    "ai-scan",
                ]
            )
            print(f"CAT + {leftover_slug}")
        for art in leftover:
            if leftover_slug not in art["categories"]:
                art["categories"].append(leftover_slug)
        print(f"OV  {leftover_slug} leftover={len(leftover)}")
    else:
        print("OV  none")

    CATALOG.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"\nadded articles: {added}")
    print(f"total articles: {len(data['articles'])}")
    print(f"total categories: {len(data['categories'])}")


if __name__ == "__main__":
    main()

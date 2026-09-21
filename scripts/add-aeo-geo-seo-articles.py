#!/usr/bin/env python3
"""Add 40 unique AEO/GEO/SEO kennisbank articles + subject subcategories; retag existing 17."""
from __future__ import annotations

import json
from pathlib import Path

CATALOG = Path("/Users/pro/Desktop/000-it/prisma/kennisbank/catalog.json")

SUBS = [
    (
        "aeo-antwoordengines",
        "AEO (antwoordengines)",
        "Answer Engine Optimization: citaties, FAQ’s, entities en antwoordklare content bij TripleZero iT.",
        "aeo-geo-seo",
    ),
    (
        "geo-lokaal",
        "GEO (lokaal)",
        "Lokale vindbaarheid: Google Business Profile, NAP, Maps, locatiepagina’s en service areas.",
        "aeo-geo-seo",
    ),
    (
        "seo-klassiek",
        "SEO (klassiek)",
        "Technische SEO, on-page, indexatie, Core Web Vitals, WordPress en webshop-SEO.",
        "aeo-geo-seo",
    ),
    (
        "aeo-geo-seo-trajecten",
        "Trajecten en pakketten",
        "Basic, plus en pro; bestellen; AI-scan versus volledig traject; AEO-, GEO- en SEO-diensten.",
        "aeo-geo-seo",
    ),
    (
        "aeo-geo-seo-resultaten",
        "Content, meten en fouten",
        "Contentkalender, KPI’s, audits, regressies en veelgemaakte AEO/GEO/SEO-problemen.",
        "aeo-geo-seo",
    ),
]

# title, slug, topic, subcategory, extra categories
ARTICLES: list[tuple[str, str, str, str, list[str]]] = [
    (
        "Hoe werken antwoordengines en AI-overviews met mijn website?",
        "hoe-werken-antwoordengines-en-ai-overviews-met-mijn-website",
        "tz-aeo-engines-overviews",
        "aeo-antwoordengines",
        [],
    ),
    (
        "Hoe krijg ik citaties of vermeldingen in AI-antwoorden?",
        "hoe-krijg-ik-citaties-of-vermeldingen-in-ai-antwoorden",
        "tz-aeo-citations",
        "aeo-antwoordengines",
        [],
    ),
    (
        "Wat is entity-clarity en waarom is dat cruciaal voor AEO?",
        "wat-is-entity-clarity-en-waarom-is-dat-cruciaal-voor-aeo",
        "tz-aeo-entity-clarity",
        "aeo-antwoordengines",
        [],
    ),
    (
        "Welke structured data helpt het meest bij AEO (FAQ, HowTo, Organization)?",
        "welke-structured-data-helpt-het-meest-bij-aeo-faq-howto-organization",
        "tz-aeo-structured-data",
        "aeo-antwoordengines",
        [],
    ),
    (
        "Hoe schrijf ik dienstenpagina’s die antwoorden geven zonder keyword stuffing?",
        "hoe-schrijf-ik-dienstenpaginas-die-antwoorden-geven-zonder-keyword-stuffing",
        "tz-aeo-service-pages",
        "aeo-antwoordengines",
        [],
    ),
    (
        "Hoe houd ik AEO-content actueel zodat antwoorden betrouwbaar blijven?",
        "hoe-houd-ik-aeo-content-actueel-zodat-antwoorden-betrouwbaar-blijven",
        "tz-aeo-keep-fresh",
        "aeo-antwoordengines",
        [],
    ),
    (
        "AEO voor B2B versus B2C: wat verschilt er in aanpak?",
        "aeo-voor-b2b-versus-b2c-wat-verschilt-er-in-aanpak",
        "tz-aeo-b2b-b2c",
        "aeo-antwoordengines",
        [],
    ),
    (
        "Hoe past AEO-optimalisatie van TripleZero iT in een doorlopend traject?",
        "hoe-past-aeo-optimalisatie-van-triplezero-it-in-een-doorlopend-traject",
        "tz-aeo-dienst-traject",
        "aeo-antwoordengines",
        [],
    ),
    (
        "Wat is het verschil tussen GEO en “local SEO” bij TripleZero iT?",
        "wat-is-het-verschil-tussen-geo-en-local-seo-bij-triplezero-it",
        "tz-geo-vs-local-seo",
        "geo-lokaal",
        [],
    ),
    (
        "Hoe optimaliseer ik Google Business Profile stap voor stap?",
        "hoe-optimaliseer-ik-google-business-profile-stap-voor-stap",
        "tz-geo-gbp-steps",
        "geo-lokaal",
        [],
    ),
    (
        "Hoe ga ik om met reviews zonder richtlijnen te schenden?",
        "hoe-ga-ik-om-met-reviews-zonder-richtlijnen-te-schenden",
        "tz-geo-reviews",
        "geo-lokaal",
        [],
    ),
    (
        "Hoe maak ik unieke locatiepagina’s zonder duplicate content?",
        "hoe-maak-ik-unieke-locatiepaginas-zonder-duplicate-content",
        "tz-geo-location-pages",
        "geo-lokaal",
        [],
    ),
    (
        "GEO voor dienstverleners zonder fysieke winkel (service area)?",
        "geo-voor-dienstverleners-zonder-fysieke-winkel-service-area",
        "tz-geo-service-area",
        "geo-lokaal",
        [],
    ),
    (
        "Meerdere vestigingen: hoe organiseer ik GEO zonder chaos?",
        "meerdere-vestigingen-hoe-organiseer-ik-geo-zonder-chaos",
        "tz-geo-multi-location",
        "geo-lokaal",
        [],
    ),
    (
        "Hoe gebruik ik “near me”- en regiozoekopdrachten in mijn content?",
        "hoe-gebruik-ik-near-me-en-regiozoekopdrachten-in-mijn-content",
        "tz-geo-near-me-content",
        "geo-lokaal",
        [],
    ),
    (
        "Hoe past GEO-optimalisatie van TripleZero iT bij mijn regio of stad?",
        "hoe-past-geo-optimalisatie-van-triplezero-it-bij-mijn-regio-of-stad",
        "tz-geo-dienst-regio",
        "geo-lokaal",
        [],
    ),
    (
        "Wat hoort bij technische SEO bij TripleZero iT (crawl, index, sitemap)?",
        "wat-hoort-bij-technische-seo-bij-triplezero-it-crawl-index-sitemap",
        "tz-seo-technical",
        "seo-klassiek",
        [],
    ),
    (
        "Hoe optimaliseer ik titles, meta descriptions en headings correct?",
        "hoe-optimaliseer-ik-titles-meta-descriptions-en-headings-correct",
        "tz-seo-onpage-meta",
        "seo-klassiek",
        [],
    ),
    (
        "Hoe verbeter ik Core Web Vitals zonder de site kapot te optimaliseren?",
        "hoe-verbeter-ik-core-web-vitals-zonder-de-site-kapot-te-optimaliseren",
        "tz-seo-cwv",
        "seo-klassiek",
        [],
    ),
    (
        "Interne linking: hoe bouw ik een sterke silo of topic cluster?",
        "interne-linking-hoe-bouw-ik-een-sterke-silo-of-topic-cluster",
        "tz-seo-internal-links",
        "seo-klassiek",
        [],
    ),
    (
        "Hoe voorkom of los ik indexatieproblemen op (Search Console)?",
        "hoe-voorkom-of-los-ik-indexatieproblemen-op-search-console",
        "tz-seo-indexation",
        "seo-klassiek",
        [],
    ),
    (
        "SEO voor WordPress: wat doe je zelf en wat doet TripleZero iT?",
        "seo-voor-wordpress-wat-doe-je-zelf-en-wat-doet-triplezero-it",
        "tz-seo-wordpress",
        "seo-klassiek",
        ["wordpress"],
    ),
    (
        "SEO voor webshops: categorieën, productpagina’s en filters",
        "seo-voor-webshops-categorien-productpaginas-en-filters",
        "tz-seo-ecommerce",
        "seo-klassiek",
        [],
    ),
    (
        "Mobile-first en UX: hoe beïnvloeden ze SEO-resultaten?",
        "mobile-first-en-ux-hoe-beinvloeden-ze-seo-resultaten",
        "tz-seo-mobile-ux",
        "seo-klassiek",
        [],
    ),
    (
        "Canonicals, hreflang en meertalige sites: wat moet je weten?",
        "canonicals-hreflang-en-meertalige-sites-wat-moet-je-weten",
        "tz-seo-canonical-hreflang",
        "seo-klassiek",
        [],
    ),
    (
        "Hoe past SEO-optimalisatie (losse dienst) naast een pakkettraject?",
        "hoe-past-seo-optimalisatie-losse-dienst-naast-een-pakkettraject",
        "tz-seo-dienst-vs-pakket",
        "seo-klassiek",
        ["shop-en-pakketten"],
    ),
    (
        "Wat zit er in AEO/GEO/SEO pro (Enterprise) versus plus?",
        "wat-zit-er-in-aeo-geo-seo-pro-enterprise-versus-plus",
        "tz-aeo-pro-vs-plus",
        "aeo-geo-seo-trajecten",
        ["shop-en-pakketten"],
    ),
    (
        "Wanneer kies ik een losse AEO-, GEO- of SEO-dienst in plaats van een pakket?",
        "wanneer-kies-ik-een-losse-aeo-geo-of-seo-dienst-in-plaats-van-een-pakket",
        "tz-aeo-loose-vs-package",
        "aeo-geo-seo-trajecten",
        ["shop-en-pakketten"],
    ),
    (
        "Hoe lever ik toegang aan TripleZero iT voor een AEO/GEO/SEO-traject?",
        "hoe-lever-ik-toegang-aan-triplezero-it-voor-een-aeo-geo-seo-traject",
        "tz-aeo-access-handover",
        "aeo-geo-seo-trajecten",
        [],
    ),
    (
        "Wat gebeurt er na kickoff: planning, opleveringen en feedbackrondes?",
        "wat-gebeurt-er-na-kickoff-planning-opleveringen-en-feedbackrondes",
        "tz-aeo-kickoff-flow",
        "aeo-geo-seo-trajecten",
        [],
    ),
    (
        "Hoe combineer ik AI-scan, traject en doorlopende optimalisatie?",
        "hoe-combineer-ik-ai-scan-traject-en-doorlopende-optimalisatie",
        "tz-aeo-scan-plus-ongoing",
        "aeo-geo-seo-trajecten",
        ["ai-scan"],
    ),
    (
        "Hoe kies ik prioriteiten als AEO, GEO én SEO tegelijk laag scoren?",
        "hoe-kies-ik-prioriteiten-als-aeo-geo-en-seo-tegelijk-laag-scoren",
        "tz-aeo-priority-all-low",
        "aeo-geo-seo-trajecten",
        ["ai-scan"],
    ),
    (
        "Wat is het verschil tussen de diensten AEO-, GEO- en SEO-optimalisatie?",
        "wat-is-het-verschil-tussen-de-diensten-aeo-geo-en-seo-optimalisatie",
        "tz-aeo-dienst-differences",
        "aeo-geo-seo-trajecten",
        [],
    ),
    (
        "Hoe bouw ik een contentkalender die AEO, GEO en SEO tegelijk voedt?",
        "hoe-bouw-ik-een-contentkalender-die-aeo-geo-en-seo-tegelijk-voedt",
        "tz-aeo-content-calendar",
        "aeo-geo-seo-resultaten",
        ["bloggen"],
    ),
    (
        "Welke KPI’s horen bij AEO versus GEO versus SEO?",
        "welke-kpis-horen-bij-aeo-versus-geo-versus-seo",
        "tz-aeo-kpis-by-layer",
        "aeo-geo-seo-resultaten",
        [],
    ),
    (
        "Hoe gebruik ik Search Console en Analytics samen in een TripleZero-traject?",
        "hoe-gebruik-ik-search-console-en-analytics-samen-in-een-triplezero-traject",
        "tz-aeo-gsc-analytics",
        "aeo-geo-seo-resultaten",
        [],
    ),
    (
        "Hoe audit ik mijn site elk kwartaal op AEO/GEO/SEO-regressies?",
        "hoe-audit-ik-mijn-site-elk-kwartaal-op-aeo-geo-seo-regressies",
        "tz-aeo-quarterly-audit",
        "aeo-geo-seo-resultaten",
        [],
    ),
    (
        "Wat doe ik bij een plotselinge daling in organisch of lokaal verkeer?",
        "wat-doe-ik-bij-een-plotselinge-daling-in-organisch-of-lokaal-verkeer",
        "tz-aeo-traffic-drop",
        "aeo-geo-seo-resultaten",
        [],
    ),
    (
        "Thin content en AI-gegenereerde teksten: risico’s voor AEO en SEO",
        "thin-content-en-ai-gegenereerde-teksten-risicos-voor-aeo-en-seo",
        "tz-aeo-thin-ai-content",
        "aeo-geo-seo-resultaten",
        [],
    ),
    (
        "Checklist vóór go-live: AEO, GEO en SEO gereed voor lancering",
        "checklist-voor-go-live-aeo-geo-en-seo-gereed-voor-lancering",
        "tz-aeo-golive-checklist",
        "aeo-geo-seo-resultaten",
        [],
    ),
]

# Existing aeo-geo-seo articles → subject subcategory
RETAG = {
    "wat-is-aeo-answer-engine-optimization": ["aeo-antwoordengines"],
    "hoe-bereid-ik-mijn-content-voor-op-antwoordengines-faq-entities-structured-data": [
        "aeo-antwoordengines"
    ],
    "wat-betekenen-een-lage-aeo-score-en-hoe-verbeter-ik-die": ["aeo-antwoordengines"],
    "wat-is-geo-geographic-seo-en-voor-wie-is-het-relevant": ["geo-lokaal"],
    "hoe-verbeter-ik-mijn-lokale-vindbaarheid-google-business-profile-en-nap": ["geo-lokaal"],
    "wat-betekenen-een-lage-geo-score-en-hoe-verbeter-ik-lokale-vindbaarheid": ["geo-lokaal"],
    "wat-is-klassieke-seo-en-hoe-werkt-triplezero-it-hosting-daarmee": ["seo-klassiek"],
    "wat-betekenen-een-lage-seo-score-en-hoe-verbeter-ik-die": ["seo-klassiek"],
    "hoe-bestel-of-start-ik-seo-optimalisatie-via-triplezero-it-hosting": ["seo-klassiek"],
    "hoe-hangen-aeo-geo-en-seo-samen": ["aeo-geo-seo-trajecten"],
    "ai-scan-versus-een-volledig-aeo-geo-seo-traject-wat-is-het-verschil": [
        "aeo-geo-seo-trajecten"
    ],
    "wat-zit-er-in-aeo-geo-seo-basic-versus-plus-in-de-pakketten": ["aeo-geo-seo-trajecten"],
    "hoe-passen-ai-agents-bij-aeo-geo-seo-en-marketing": ["aeo-geo-seo-trajecten"],
    "hoe-ondersteunt-de-seo-agent-aeo-geo-en-klassieke-seo": ["aeo-geo-seo-trajecten"],
    "hoe-lees-ik-de-ai-scan-scores-aeo-geo-seo-performance-en-ai-readiness": [
        "aeo-geo-seo-resultaten"
    ],
    "hoe-meet-ik-of-aeo-geo-of-seo-werk-resultaat-oplevert": ["aeo-geo-seo-resultaten"],
    "veelgemaakte-fouten-bij-seo-die-ook-aeo-en-geo-schaden": ["aeo-geo-seo-resultaten"],
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
        cats = ["aeo-geo-seo", sub, *extra]
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
    aeo_arts = [a for a in data["articles"] if "aeo-geo-seo" in a.get("categories", [])]
    orphans = [
        a
        for a in aeo_arts
        if not any(c in a["categories"] for c in real_children)
    ]
    by_sub = {s: 0 for s in real_children}
    for a in aeo_arts:
        for s in real_children:
            if s in a["categories"]:
                by_sub[s] += 1

    CATALOG.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"\nadded articles: {added}")
    print(f"aeo-geo-seo total: {len(aeo_arts)}")
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
    if len(aeo_arts) != 57 or sum(by_sub.values()) != 57:
        raise SystemExit(f"Expected 57 articles/tags, got {len(aeo_arts)}/{sum(by_sub.values())}")


if __name__ == "__main__":
    main()

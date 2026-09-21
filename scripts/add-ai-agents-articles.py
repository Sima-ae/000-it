#!/usr/bin/env python3
"""Add 40 unique AI-agents kennisbank articles + subject subcategories."""
from __future__ import annotations

import json
from pathlib import Path

CATALOG = Path("/Users/pro/Desktop/000-it/prisma/kennisbank/catalog.json")

SUBS = [
    (
        "ai-agents-types",
        "Agenttypen",
        "SEO-, content-, social-, ads-, analytics-, chatbot- en research-agents bij TripleZero iT.",
        "ai-agents",
    ),
    (
        "ai-agents-beheer",
        "Beheer en status",
        "Statussen, taken, projectkoppeling en veilig meerdere agents beheren.",
        "ai-agents",
    ),
    (
        "ai-agents-pakketten",
        "Pakketten en toegang",
        "Quota, upgrades, provisioning en wie agents mag starten of pauzeren.",
        "ai-agents",
    ),
    (
        "ai-agents-workflows",
        "Workflows en resultaten",
        "Agents combineren met AI-scan, SEO, marketing en meetbare resultaten.",
        "ai-agents",
    ),
    (
        "ai-agents-problemen",
        "Problemen oplossen",
        "ERROR-status, agents die niet starten, conflicten en supportgegevens.",
        "ai-agents",
    ),
]

# title, slug, topic, subcategory, extra categories (optional)
ARTICLES: list[tuple[str, str, str, str, list[str]]] = [
    (
        "Wat doet de SEO-agent bij TripleZero iT?",
        "wat-doet-de-seo-agent-bij-triplezero-it",
        "tz-agents-seo-type",
        "ai-agents-types",
        [],
    ),
    (
        "Wat doet de content-agent en wanneer zet ik die in?",
        "wat-doet-de-content-agent-en-wanneer-zet-ik-die-in",
        "tz-agents-content-type",
        "ai-agents-types",
        [],
    ),
    (
        "Wat doet de social-agent voor mijn kanalen?",
        "wat-doet-de-social-agent-voor-mijn-kanalen",
        "tz-agents-social-type",
        "ai-agents-types",
        [],
    ),
    (
        "Wat doet de ads-agent bij campagnes?",
        "wat-doet-de-ads-agent-bij-campagnes",
        "tz-agents-ads-type",
        "ai-agents-types",
        [],
    ),
    (
        "Wat doet de analytics-agent met mijn data?",
        "wat-doet-de-analytics-agent-met-mijn-data",
        "tz-agents-analytics-type",
        "ai-agents-types",
        [],
    ),
    (
        "Wat doet de chatbot-agent op mijn website of in support?",
        "wat-doet-de-chatbot-agent-op-mijn-website-of-in-support",
        "tz-agents-chatbot-type",
        "ai-agents-types",
        [],
    ),
    (
        "Wat doet de research-agent bij marktonderzoek?",
        "wat-doet-de-research-agent-bij-marktonderzoek",
        "tz-agents-research-type",
        "ai-agents-types",
        [],
    ),
    (
        "Welk agenttype kies ik als eerste in Business (1 agent)?",
        "welk-agenttype-kies-ik-als-eerste-in-business-1-agent",
        "tz-agents-first-business",
        "ai-agents-types",
        ["shop-en-pakketten"],
    ),
    (
        "Welke twee agenttypen combineer ik het best in Extra Growth?",
        "welke-twee-agenttypen-combineer-ik-het-best-in-extra-growth",
        "tz-agents-pair-growth",
        "ai-agents-types",
        ["shop-en-pakketten"],
    ),
    (
        "Kan één agent meerdere typen tegelijk zijn?",
        "kan-een-agent-meerdere-typen-tegelijk-zijn",
        "tz-agents-one-type",
        "ai-agents-types",
        [],
    ),
    (
        "Wat betekenen de statussen ERROR en COMPLETED bij AI-agents?",
        "wat-betekenen-de-statussen-error-en-completed-bij-ai-agents",
        "tz-agents-status-error-completed",
        "ai-agents-beheer",
        [],
    ),
    (
        "Wat betekent “Tasks completed” bij een AI-agent?",
        "wat-betekent-tasks-completed-bij-een-ai-agent",
        "tz-agents-tasks-completed",
        "ai-agents-beheer",
        [],
    ),
    (
        "Hoe koppel ik een AI-agent aan een project?",
        "hoe-koppel-ik-een-ai-agent-aan-een-project",
        "tz-agents-link-project",
        "ai-agents-beheer",
        ["crm-klantenpanel"],
    ),
    (
        "Hoe hernoem of herken ik mijn AI-agents in het overzicht?",
        "hoe-hernoem-of-herken-ik-mijn-ai-agents-in-het-overzicht",
        "tz-agents-rename-recognize",
        "ai-agents-beheer",
        [],
    ),
    (
        "Wanneer zet ik een agent op PAUSED versus IDLE?",
        "wanneer-zet-ik-een-agent-op-paused-versus-idle",
        "tz-agents-paused-vs-idle",
        "ai-agents-beheer",
        [],
    ),
    (
        "Wat gebeurt er als ik een RUNNING agent pauzer?",
        "wat-gebeurt-er-als-ik-een-running-agent-pauzer",
        "tz-agents-pause-running",
        "ai-agents-beheer",
        [],
    ),
    (
        "Hoe zie ik wanneer een agent voor het laatst actief was?",
        "hoe-zie-ik-wanneer-een-agent-voor-het-laatst-actief-was",
        "tz-agents-last-active",
        "ai-agents-beheer",
        [],
    ),
    (
        "Hoe werk ik veilig met meerdere agents tegelijk zonder conflicten?",
        "hoe-werk-ik-veilig-met-meerdere-agents-tegelijk-zonder-conflicten",
        "tz-agents-multi-safe",
        "ai-agents-beheer",
        [],
    ),
    (
        "Hoe krijg ik AI-agents in mijn account na het bestellen van een pakket?",
        "hoe-krijg-ik-ai-agents-in-mijn-account-na-het-bestellen-van-een-pakket",
        "tz-agents-after-order",
        "ai-agents-pakketten",
        ["shop-en-pakketten"],
    ),
    (
        "Hoe upgrade ik van 1 naar 2 AI-agents (Business → Extra Growth)?",
        "hoe-upgrade-ik-van-1-naar-2-ai-agents-business-extra-growth",
        "tz-agents-upgrade-growth",
        "ai-agents-pakketten",
        ["shop-en-pakketten", "business-pakketten"],
    ),
    (
        "Wat betekent “onbeperkt AI-agents” in Enterprise?",
        "wat-betekent-onbeperkt-ai-agents-in-enterprise",
        "tz-agents-enterprise-unlimited",
        "ai-agents-pakketten",
        ["shop-en-pakketten"],
    ),
    (
        "Kan ik losse AI-agents bijbestellen zonder pakketwisseling?",
        "kan-ik-losse-ai-agents-bijbestellen-zonder-pakketwisseling",
        "tz-agents-buy-extra",
        "ai-agents-pakketten",
        ["shop-en-pakketten"],
    ),
    (
        "Wie mag AI-agents starten of pauzeren in mijn teamaccount?",
        "wie-mag-ai-agents-starten-of-pauzeren-in-mijn-teamaccount",
        "tz-agents-team-permissions",
        "ai-agents-pakketten",
        ["crm-klantenpanel"],
    ),
    (
        "Wat is het verschil tussen AI-agents in het dashboard en Agent 000 in de chat?",
        "verschil-ai-agents-dashboard-en-agent-000-chat",
        "tz-agents-vs-agent000",
        "ai-agents-pakketten",
        [],
    ),
    (
        "Hoe gebruik ik AI-agents samen met de AI-scan?",
        "hoe-gebruik-ik-ai-agents-samen-met-de-ai-scan",
        "tz-agents-with-scan",
        "ai-agents-workflows",
        ["ai-scan"],
    ),
    (
        "Hoe ondersteunt de SEO-agent AEO, GEO en klassieke SEO?",
        "hoe-ondersteunt-de-seo-agent-aeo-geo-en-klassieke-seo",
        "tz-agents-seo-aeo-geo",
        "ai-agents-workflows",
        ["aeo-geo-seo"],
    ),
    (
        "Hoe helpen content-agents bij blogs, landingspagina’s en FAQ’s?",
        "hoe-helpen-content-agents-bij-blogs-landingspaginas-en-faqs",
        "tz-agents-content-pages",
        "ai-agents-workflows",
        ["bloggen"],
    ),
    (
        "Hoe zet ik social- en ads-agents in als één marketingworkflow?",
        "hoe-zet-ik-social-en-ads-agents-in-als-een-marketingworkflow",
        "tz-agents-social-ads-flow",
        "ai-agents-workflows",
        [],
    ),
    (
        "Hoe meet ik of mijn AI-agents resultaat opleveren?",
        "hoe-meet-ik-of-mijn-ai-agents-resultaat-opleveren",
        "tz-agents-measure-results",
        "ai-agents-workflows",
        [],
    ),
    (
        "Welke taken zijn geschikt voor agents en welke niet?",
        "welke-taken-zijn-geschikt-voor-agents-en-welke-niet",
        "tz-agents-suitable-tasks",
        "ai-agents-workflows",
        [],
    ),
    (
        "Hoe combineer ik research-agent en content-agent voor nieuwe diensten?",
        "hoe-combineer-ik-research-agent-en-content-agent-voor-nieuwe-diensten",
        "tz-agents-research-content",
        "ai-agents-workflows",
        [],
    ),
    (
        "Hoe gebruik ik de chatbot-agent naast live chat en tickets?",
        "hoe-gebruik-ik-de-chatbot-agent-naast-live-chat-en-tickets",
        "tz-agents-chatbot-support",
        "ai-agents-workflows",
        ["support"],
    ),
    (
        "Hoe passen AI-agents bij e-commerce of een webshop?",
        "hoe-passen-ai-agents-bij-e-commerce-of-een-webshop",
        "tz-agents-ecommerce",
        "ai-agents-workflows",
        [],
    ),
    (
        "Beste praktijken: weekplanning met AI-agents voor zzp’ers en MKB",
        "beste-praktijken-weekplanning-met-ai-agents-voor-zzp-en-mkb",
        "tz-agents-week-planning",
        "ai-agents-workflows",
        [],
    ),
    (
        "Wat doe ik als een AI-agent op ERROR blijft staan?",
        "wat-doe-ik-als-een-ai-agent-op-error-blijft-staan",
        "tz-agents-stuck-error",
        "ai-agents-problemen",
        [],
    ),
    (
        "Waarom start mijn AI-agent niet (blijft IDLE)?",
        "waarom-start-mijn-ai-agent-niet-blijft-idle",
        "tz-agents-wont-start",
        "ai-agents-problemen",
        [],
    ),
    (
        "Wat doe ik als taken niet toenemen bij een RUNNING agent?",
        "wat-doe-ik-als-taken-niet-toenemen-bij-een-running-agent",
        "tz-agents-no-task-growth",
        "ai-agents-problemen",
        [],
    ),
    (
        "Wat als ik meer agents zie dan mijn pakket toestaat — of juist te weinig?",
        "wat-als-ik-meer-of-te-weinig-agents-zie-dan-mijn-pakket",
        "tz-agents-quota-mismatch",
        "ai-agents-problemen",
        ["shop-en-pakketten"],
    ),
    (
        "Hoe voorkom ik dat agents tijdens migratie of onderhoud conflicteren?",
        "hoe-voorkom-ik-dat-agents-tijdens-migratie-of-onderhoud-conflicteren",
        "tz-agents-migration-safe",
        "ai-agents-problemen",
        [],
    ),
    (
        "Welke gegevens stuur ik naar support bij een AI-agentprobleem?",
        "welke-gegevens-stuur-ik-naar-support-bij-een-ai-agentprobleem",
        "tz-agents-support-info",
        "ai-agents-problemen",
        ["support"],
    ),
]


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
        cats = ["ai-agents", sub, *extra]
        seen: set[str] = set()
        deduped: list[str] = []
        for c in cats:
            if c not in seen:
                seen.add(c)
                deduped.append(c)
        cats = deduped
        data["articles"].append(
            {"slug": slug, "title": title, "categories": cats, "topic": topic}
        )
        existing_articles.add(slug)
        added += 1
        print(f"ART + {slug}")

    # Tag existing ai-agents articles into beheer/pakketten/workflows where sensible
    RETAG = {
        "wat-zijn-ai-agents-bij-triplezero-it-hosting": ["ai-agents-types"],
        "hoeveel-ai-agents-krijg-ik-in-business-versus-extra-growth": ["ai-agents-pakketten"],
        "hoe-open-ik-het-ai-agents-overzicht-in-mijn-account": ["ai-agents-beheer"],
        "hoe-start-pauzeer-of-zet-ik-een-ai-agent-op-idle": ["ai-agents-beheer"],
        "wat-betekenen-de-statussen-running-paused-en-idle": ["ai-agents-beheer"],
        "wat-doe-ik-als-ik-nog-geen-ai-agents-zie-in-mijn-dashboard": ["ai-agents-problemen"],
        "hoe-passen-ai-agents-bij-aeo-geo-seo-en-marketing": ["ai-agents-workflows"],
        "welke-snelle-links-heeft-mijn-dashboard-tickets-crm-ai-scan-agents": ["ai-agents-beheer"],
    }
    for art in data["articles"]:
        extra_tags = RETAG.get(art["slug"])
        if not extra_tags:
            continue
        for tag in extra_tags:
            if tag not in art["categories"]:
                art["categories"].append(tag)

    # Overige leftovers for ai-agents parent
    real_children = [s for s, *_ in SUBS]
    leftover_slug = "ai-agents-overige"
    leftover: list[dict] = []
    for art in data["articles"]:
        cats = set(art["categories"])
        if "ai-agents" not in cats:
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
                    "Overige artikelen over AI-agents die niet onder een specifiek onderwerp vallen.",
                    "ai-agents",
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

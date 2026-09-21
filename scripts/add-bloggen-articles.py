#!/usr/bin/env python3
"""Add 40 unique Bloggen kennisbank articles + subject subcategories; retag existing 24."""
from __future__ import annotations

import json
from pathlib import Path

CATALOG = Path("/Users/pro/Desktop/000-it/prisma/kennisbank/catalog.json")

SUBS = [
    (
        "bloggen-starten",
        "Starten en platformen",
        "WordPress.org, WordPress.com, Blogger, eigen domein, migratie en hostingkeuze.",
        "bloggen",
    ),
    (
        "bloggen-schrijven",
        "Schrijven en publiceren",
        "Blogposts schrijven, editor, planning, SEO van posts, categorieën en tags.",
        "bloggen",
    ),
    (
        "bloggen-vormgeving",
        "Vormgeving en media",
        "Thema’s, afbeeldingen, uitgelichte media, layout en leesbaarheid.",
        "bloggen",
    ),
    (
        "bloggen-groei",
        "Groei en bereik",
        "Comments, nieuwsbrief, social, monetisatie, formulieren en meetbaarheid.",
        "bloggen",
    ),
    (
        "bloggen-beheer",
        "Beheer en problemen",
        "Updates, spam, backups, performance, fouten en maandelijks onderhoud.",
        "bloggen",
    ),
]

ARTICLES: list[tuple[str, str, str, str, list[str]]] = [
    (
        "Welk blogplatform kies ik: WordPress.org, WordPress.com of Blogger?",
        "welk-blogplatform-kies-ik-wordpress-org-wordpress-com-of-blogger",
        "tz-blog-platform-choice",
        "bloggen-starten",
        [],
    ),
    (
        "Hoe start ik een blog op WordPress bij TripleZero iT?",
        "hoe-start-ik-een-blog-op-wordpress-bij-triplezero-it",
        "tz-blog-start-wp-tz",
        "bloggen-starten",
        ["wordpress"],
    ),
    (
        "Hoe start ik een blog op Blogger en koppel ik later een eigen domein?",
        "hoe-start-ik-een-blog-op-blogger-en-koppel-ik-later-een-eigen-domein",
        "tz-blog-start-blogger",
        "bloggen-starten",
        ["domeinnamen"],
    ),
    (
        "Wat heb ik nodig om professioneel te bloggen op een eigen domein?",
        "wat-heb-ik-nodig-om-professioneel-te-bloggen-op-een-eigen-domein",
        "tz-blog-needs-own-domain",
        "bloggen-starten",
        ["domeinnamen"],
    ),
    (
        "Hoe verhuis ik mijn bestaande blog (posts en media) zonder SEO-schade?",
        "hoe-verhuis-ik-mijn-bestaande-blog-posts-en-media-zonder-seo-schade",
        "tz-blog-migrate-seo-safe",
        "bloggen-starten",
        ["wordpress"],
    ),
    (
        "Multisite of aparte installatie: wat past bij meerdere blogs?",
        "multisite-of-aparte-installatie-wat-past-bij-meerdere-blogs",
        "tz-blog-multisite-vs-separate",
        "bloggen-starten",
        ["wordpress"],
    ),
    (
        "Hoe schrijf ik een sterke blogpost (structuur, intro, conclusie)?",
        "hoe-schrijf-ik-een-sterke-blogpost-structuur-intro-conclusie",
        "tz-blog-write-structure",
        "bloggen-schrijven",
        [],
    ),
    (
        "Hoe gebruik ik de WordPress-blok-editor (Gutenberg) efficiënt voor blogs?",
        "hoe-gebruik-ik-de-wordpress-blok-editor-gutenberg-efficient-voor-blogs",
        "tz-blog-gutenberg",
        "bloggen-schrijven",
        ["wordpress"],
    ),
    (
        "Concepten, concepten inplannen en publiceren: hoe werkt de workflow?",
        "concepten-inplannen-en-publiceren-hoe-werkt-de-workflow",
        "tz-blog-draft-schedule-publish",
        "bloggen-schrijven",
        ["wordpress"],
    ),
    (
        "Categorieën versus tags: hoe organiseer ik mijn blogarchief?",
        "categorien-versus-tags-hoe-organiseer-ik-mijn-blogarchief",
        "tz-blog-categories-tags",
        "bloggen-schrijven",
        [],
    ),
    (
        "Hoe kies ik URL-slugs en permalinks die blijvend werken?",
        "hoe-kies-ik-url-slugs-en-permalinks-die-blijvend-werken",
        "tz-blog-permalinks-slugs",
        "bloggen-schrijven",
        ["wordpress"],
    ),
    (
        "Interne links tussen blogposts: hoe bouw ik topic clusters?",
        "interne-links-tussen-blogposts-hoe-bouw-ik-topic-clusters",
        "tz-blog-internal-clusters",
        "bloggen-schrijven",
        [],
    ),
    (
        "Hoe optimaliseer ik één blogpost voor zoeken zonder keyword stuffing?",
        "hoe-optimaliseer-ik-een-blogpost-voor-zoeken-zonder-keyword-stuffing",
        "tz-blog-post-seo",
        "bloggen-schrijven",
        [],
    ),
    (
        "Featured snippets en FAQ-blokken in blogposts: wanneer wel/niet?",
        "featured-snippets-en-faq-blokken-in-blogposts-wanneer-wel-niet",
        "tz-blog-faq-snippets",
        "bloggen-schrijven",
        ["aeo-geo-seo"],
    ),
    (
        "Hoe schrijf ik titles en meta descriptions die meer klikken opleveren?",
        "hoe-schrijf-ik-titles-en-meta-descriptions-die-meer-klikken-opleveren",
        "tz-blog-titles-meta",
        "bloggen-schrijven",
        [],
    ),
    (
        "Gastbloggen en auteurs: hoe regel ik bylines en bio’s?",
        "gastbloggen-en-auteurs-hoe-regel-ik-bylines-en-bios",
        "tz-blog-authors-bylines",
        "bloggen-schrijven",
        [],
    ),
    (
        "Hoe hergebruik ik oude posts (updates, redirects) zonder duplicate content?",
        "hoe-hergebruik-ik-oude-posts-updates-redirects-zonder-duplicate-content",
        "tz-blog-update-repurpose",
        "bloggen-schrijven",
        [],
    ),
    (
        "Redactionele checklist vóór publicatie (feiten, links, afbeeldingen, CTA)",
        "redactionele-checklist-voor-publicatie-feiten-links-afbeeldingen-cta",
        "tz-blog-editorial-checklist",
        "bloggen-schrijven",
        [],
    ),
    (
        "Hoe kies ik een WordPress-thema dat geschikt is om te bloggen?",
        "hoe-kies-ik-een-wordpress-thema-dat-geschikt-is-om-te-bloggen",
        "tz-blog-theme-choice",
        "bloggen-vormgeving",
        ["wordpress"],
    ),
    (
        "Hoe stel ik een leesbare typografie en layout in voor lange artikelen?",
        "hoe-stel-ik-een-leesbare-typografie-en-layout-in-voor-lange-artikelen",
        "tz-blog-typography-layout",
        "bloggen-vormgeving",
        [],
    ),
    (
        "Hoe voeg ik een uitgelichte afbeelding toe en waarom is die belangrijk?",
        "hoe-voeg-ik-een-uitgelichte-afbeelding-toe-en-waarom-is-die-belangrijk",
        "tz-blog-featured-image",
        "bloggen-vormgeving",
        ["wordpress"],
    ),
    (
        "Afbeeldingen optimaliseren voor blogs (formaat, alt-tekst, lazy load)",
        "afbeeldingen-optimaliseren-voor-blogs-formaat-alt-tekst-lazy-load",
        "tz-blog-image-optimize",
        "bloggen-vormgeving",
        [],
    ),
    (
        "Hoe maak ik een overzichtelijke blogpagina (archief, grid of lijst)?",
        "hoe-maak-ik-een-overzichtelijke-blogpagina-archief-grid-of-lijst",
        "tz-blog-archive-page",
        "bloggen-vormgeving",
        ["wordpress"],
    ),
    (
        "Dark mode, embeds en media: wat breekt de leeservaring?",
        "dark-mode-embeds-en-media-wat-breekt-de-leeservaring",
        "tz-blog-embeds-readability",
        "bloggen-vormgeving",
        [],
    ),
    (
        "Hoe voeg ik video of podcast-embeds toe zonder de site traag te maken?",
        "hoe-voeg-ik-video-of-podcast-embeds-toe-zonder-de-site-traag-te-maken",
        "tz-blog-video-podcast-embeds",
        "bloggen-vormgeving",
        [],
    ),
    (
        "Custom CSS voor bloglayout: wat mag je veilig zelf doen?",
        "custom-css-voor-bloglayout-wat-mag-je-veilig-zelf-doen",
        "tz-blog-custom-css",
        "bloggen-vormgeving",
        ["wordpress"],
    ),
    (
        "Hoe bouw ik een e-maillijst vanuit mijn blog (opt-in zonder spam)?",
        "hoe-bouw-ik-een-emaillijst-vanuit-mijn-blog-opt-in-zonder-spam",
        "tz-blog-email-list",
        "bloggen-groei",
        [],
    ),
    (
        "Hoe deel ik nieuwe posts automatisch of handmatig op social media?",
        "hoe-deel-ik-nieuwe-posts-automatisch-of-handmatig-op-social-media",
        "tz-blog-social-sharing",
        "bloggen-groei",
        [],
    ),
    (
        "RSS, sitemaps en indexatie: hoe blijven nieuwe posts vindbaar?",
        "rss-sitemaps-en-indexatie-hoe-blijven-nieuwe-posts-vindbaar",
        "tz-blog-rss-sitemaps",
        "bloggen-groei",
        [],
    ),
    (
        "Commentbeleid: hoe stimuleer ik discussie en houd ik spam weg?",
        "commentbeleid-hoe-stimuleer-ik-discussie-en-houd-ik-spam-weg",
        "tz-blog-comment-policy",
        "bloggen-groei",
        [],
    ),
    (
        "Hoe meet ik of mijn blog resultaat oplevert (verkeer, leads, tijd op pagina)?",
        "hoe-meet-ik-of-mijn-blog-resultaat-oplevert-verkeer-leads-tijd",
        "tz-blog-measure-results",
        "bloggen-groei",
        [],
    ),
    (
        "Monetisatie van een blog: affiliates, sponsored posts en wat je moet vermelden",
        "monetisatie-van-een-blog-affiliates-sponsored-posts-vermelding",
        "tz-blog-monetization",
        "bloggen-groei",
        [],
    ),
    (
        "Hoe koppel ik mijn blog aan Google Search Console en Analytics?",
        "hoe-koppel-ik-mijn-blog-aan-google-search-console-en-analytics",
        "tz-blog-gsc-analytics",
        "bloggen-groei",
        [],
    ),
    (
        "Nieuwsbrief na elk artikel: hoe zet ik een eenvoudige workflow op?",
        "nieuwsbrief-na-elk-artikel-hoe-zet-ik-een-eenvoudige-workflow-op",
        "tz-blog-newsletter-workflow",
        "bloggen-groei",
        [],
    ),
    (
        "Wat doe ik als reacties of het berichtenoverzicht in WordPress vastlopen?",
        "wat-doe-ik-als-reacties-of-berichtenoverzicht-in-wordpress-vastlopen",
        "tz-blog-comments-list-stuck",
        "bloggen-beheer",
        ["wordpress"],
    ),
    (
        "Hoe herstel ik een blogpost die per ongeluk is verwijderd of overschreven?",
        "hoe-herstel-ik-een-blogpost-die-per-ongeluk-is-verwijderd-of-overschreven",
        "tz-blog-restore-post",
        "bloggen-beheer",
        ["wordpress"],
    ),
    (
        "Wat als media-uploads falen of de mediabibliotheek leeg lijkt?",
        "wat-als-media-uploads-falen-of-de-mediabibliotheek-leeg-lijkt",
        "tz-blog-media-library-issues",
        "bloggen-beheer",
        ["wordpress"],
    ),
    (
        "Hoe plan ik updates van thema en plugins zonder de blog plat te leggen?",
        "hoe-plan-ik-updates-van-thema-en-plugins-zonder-de-blog-plat-te-leggen",
        "tz-blog-safe-updates",
        "bloggen-beheer",
        ["wordpress"],
    ),
    (
        "Wat doe ik bij “white screen” of 500-fout na het publiceren van een post?",
        "wat-doe-ik-bij-white-screen-of-500-fout-na-publiceren-van-een-post",
        "tz-blog-wsod-after-publish",
        "bloggen-beheer",
        ["wordpress"],
    ),
    (
        "Checklist maandelijks blogonderhoud bij TripleZero iT",
        "checklist-maandelijks-blogonderhoud-bij-triplezero-it",
        "tz-blog-monthly-checklist",
        "bloggen-beheer",
        [],
    ),
]

RETAG = {
    "bloggen-op-eigen-domein-wordpress-en-blogger": ["bloggen-starten"],
    "wat-is-het-verschil-tussen-wordpress-com-en-wordpress-org": ["bloggen-starten"],
    "ik-wil-overstappen-van-wordpress-com-naar-wordpress-org": ["bloggen-starten"],
    "hoe-koppel-ik-een-domein-aan-blogger": ["bloggen-starten"],
    "hoe-koppel-ik-een-domein-aan-wordpress-com": ["bloggen-starten"],
    "e-mailadres-eigen-domein-wordpress": ["bloggen-starten"],
    "overstappen-van-weebly-naar-wordpress": ["bloggen-starten"],
    "hoe-kies-ik-de-juiste-wordpress-hosting": ["bloggen-starten"],
    "handleiding-wordpress-installeren": ["bloggen-starten"],
    "hoe-bouw-ik-een-contentkalender-die-aeo-geo-en-seo-tegelijk-voedt": [
        "bloggen-schrijven"
    ],
    "hoe-helpen-content-agents-bij-blogs-landingspaginas-en-faqs": ["bloggen-schrijven"],
    "hoe-optimaliseer-ik-mijn-wordpress-site-voor-seo": ["bloggen-schrijven"],
    "hoe-voeg-ik-een-contactformulier-toe-aan-mijn-wordpress-site": ["bloggen-groei"],
    "hoe-voeg-ik-een-webshop-toe-aan-wordpress-met-woocommerce": ["bloggen-groei"],
    "hoe-voeg-ik-een-webshop-toe-aan-mijn-wordpress-site-woocommerce": ["bloggen-groei"],
    "hoe-beveilig-ik-mijn-wordpress-website": ["bloggen-beheer"],
    "hoe-voorkom-ik-dat-mijn-wordpress-website-wordt-gehackt": ["bloggen-beheer"],
    "hoe-maak-ik-een-back-up-van-mijn-wordpress-website": ["bloggen-beheer"],
    "hoe-versnel-ik-mijn-wordpress-website": ["bloggen-beheer"],
    "comments-worden-als-spam-gezien": ["bloggen-beheer"],
    "kritieke-fout-wordpress": ["bloggen-beheer"],
    "website-down-na-update-wordpress": ["bloggen-beheer"],
    "joomla-updaten": ["bloggen-beheer"],
    # Counts as existing Beheer (plan table 9); migration ops stay with onderhoud.
    "hoe-verplaats-ik-mijn-wordpress-website-naar-triplezero-it-hosting": [
        "bloggen-beheer"
    ],
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
        cats = ["bloggen", sub, *extra]
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
    blog_arts = [a for a in data["articles"] if "bloggen" in a.get("categories", [])]
    orphans = [
        a
        for a in blog_arts
        if not any(c in a["categories"] for c in real_children)
    ]
    by_sub = {s: 0 for s in real_children}
    for a in blog_arts:
        for s in real_children:
            if s in a["categories"]:
                by_sub[s] += 1

    CATALOG.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"\nadded articles: {added}")
    print(f"bloggen total: {len(blog_arts)}")
    print(f"orphans: {len(orphans)}")
    for s, n in by_sub.items():
        print(f"  {s}: {n}")
    print(f"sum buckets: {sum(by_sub.values())}")
    if orphans:
        for o in orphans:
            print(" ORPHAN", o["slug"], o["categories"])
        raise SystemExit(1)
    if len(blog_arts) != 64 or sum(by_sub.values()) != 64:
        raise SystemExit(
            f"Expected 64 articles/tags, got {len(blog_arts)}/{sum(by_sub.values())}"
        )


if __name__ == "__main__":
    main()

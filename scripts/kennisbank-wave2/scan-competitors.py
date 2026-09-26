#!/usr/bin/env python3
"""Wave-2 competitor topic inventory (URLs/slugs only — never article bodies)."""
from __future__ import annotations

import json
import re
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
CATALOG = ROOT / "prisma/kennisbank/catalog.json"
UA = {"User-Agent": "Mozilla/5.0 (compatible; TripleZeroKBResearch/1.0)"}

SOURCES = {
    "yourhosting": ("https://www.yourhosting.nl/sitemap.xml", ["/kennisbank/"]),
    "weboke": ("https://www.weboke.nl/sitemap.xml", ["/kennisbank/"]),
    "nlhosting": ("https://www.nlhosting.nl/sitemap.xml", ["/kennisbank/"]),
    "wiwi": ("https://wiwi.nl/sitemap.xml", ["/kennisbank/"]),
    "hostnet": ("https://www.hostnet.nl/sitemap.xml", ["/academy/"]),
    "cloud86": ("https://support.cloud86.io/hc/sitemap.xml", ["/hc/nl/articles/", "/hc/nl/sections/"]),
    "wphandleiding": ("https://wphandleiding.nl/sitemap.xml", ["/kennisbank/"]),
}


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read().decode("utf-8", errors="replace")


def all_locs(sm_url: str, max_children: int = 80) -> list[str]:
    try:
        xml = fetch(sm_url)
    except Exception as e:
        print(f"[warn] sitemap fail {sm_url}: {e}")
        return []
    locs = re.findall(r"<loc>([^<]+)</loc>", xml)
    children = [u for u in locs if "sitemap" in u.lower()]
    out = list(locs)
    for c in children[:max_children]:
        try:
            out.extend(re.findall(r"<loc>([^<]+)</loc>", fetch(c)))
        except Exception as e:
            print(f"[warn] child fail {c}: {e}")
    return sorted(set(out))


def slug_from_url(url: str) -> str:
    last = unquote(url.rstrip("/").split("/")[-1])
    m = re.match(r"\d+-(.+)", last)
    return (m.group(1) if m else last).lower()


def main() -> None:
    topics: list[dict] = []
    by_source: dict[str, int] = {}

    for name, (sm, patterns) in SOURCES.items():
        urls = all_locs(sm)
        matched = [
            u.split("?")[0].rstrip("/")
            for u in urls
            if any(p in u.lower() for p in patterns)
        ]
        by_source[name] = len(matched)
        for u in matched:
            parts = u.replace("https://", "").replace("http://", "").split("/")
            path = "/".join(parts[1:])
            topics.append(
                {
                    "source": name,
                    "url": u,
                    "slug": slug_from_url(u),
                    "path": path,
                }
            )
        print(f"[scan] {name}: {len(matched)}")

    # HostMyWebsite + Leaseweb index (best-effort; may 429)
    for name, url in [
        ("hostmywebsite", "https://hostmywebsite.nl/kennisbank"),
        ("leaseweb", "https://kb.leaseweb.com"),
        ("hostnet-index", "https://www.hostnet.nl/academy"),
    ]:
        try:
            html = fetch(url)
            hrefs = re.findall(r'href="([^"]+)"', html)
            for h in hrefs:
                if not h.startswith("http"):
                    continue
                if name == "hostmywebsite" and "/kennisbank/" in h and h.count("/") >= 4:
                    topics.append(
                        {
                            "source": "hostmywebsite",
                            "url": h.split("?")[0].rstrip("/"),
                            "slug": slug_from_url(h),
                            "path": h,
                        }
                    )
                if name == "leaseweb" and ("kb.leaseweb.com" in h) and h.count("/") >= 3:
                    topics.append(
                        {
                            "source": "leaseweb",
                            "url": h.split("?")[0].rstrip("/"),
                            "slug": slug_from_url(h),
                            "path": h,
                        }
                    )
                if name == "hostnet-index" and "/academy/" in h and h.count("/") >= 4:
                    topics.append(
                        {
                            "source": "hostnet",
                            "url": h.split("?")[0].rstrip("/"),
                            "slug": slug_from_url(h),
                            "path": h,
                        }
                    )
            print(f"[scan] {name} index ok")
        except Exception as e:
            print(f"[warn] {name}: {e}")

    # Dedupe by source+slug
    seen = set()
    uniq = []
    for t in topics:
        key = (t["source"], t["slug"])
        if key in seen or not t["slug"] or t["slug"] in ("kennisbank", "academy", "nl"):
            continue
        seen.add(key)
        uniq.append(t)

    catalog = json.loads(CATALOG.read_text())
    our_blob = " ".join(
        (a["title"] + " " + a["slug"]).lower() for a in catalog["articles"]
    )
    our_slugs = {a["slug"] for a in catalog["articles"]}

    gap_themes = [
        "docker", "kubernetes", "wp-cli", "wireguard", "openvpn", "proxmox",
        "raid", "rdns", "ptr", "bimi", "arc", "spf-flatten", "greylist",
        "http-401", "http-403", "http-404", "http-500", "http-502", "http-504",
        "imunify", "jetbackup", "node.js", "nodejs", "python", "rescue",
        "ipmi", "ilo", "idrac", "wildcard-ssl", "hsts-preload", "csp",
        "memcached", "redis", "multisite", "gravity-forms", "excerpt",
        "permalink", "shopify", "prestashop", "avg-checklist", "cookie-banner",
        "fair-use", "opzeggen", "incasso", "blacklist", "myisam", "innodb",
        "staging", "fail2ban", "firewalld", "ufw", "logrotate", "rto", "rpo",
        "http3", "quic", "passkey", "hibp", "have-i-been-pwned",
    ]

    missing_themes = []
    for theme in gap_themes:
        token = theme.replace("-", " ")
        if theme not in our_blob and token not in our_blob:
            missing_themes.append(theme)

    # Competitor slugs not obviously covered
    uncovered = []
    for t in uniq:
        s = t["slug"].replace("-", " ")
        tokens = [w for w in re.split(r"[^a-z0-9]+", s) if len(w) > 3]
        if not tokens:
            continue
        hits = sum(1 for w in tokens if w in our_blob)
        if hits / len(tokens) < 0.35 and t["slug"] not in our_slugs:
            uncovered.append(t)

    report = {
        "catalogArticles": len(catalog["articles"]),
        "catalogCategories": len(catalog["categories"]),
        "bySource": by_source,
        "competitorTopics": len(uniq),
        "missingThemes": missing_themes,
        "uncoveredSample": uncovered[:200],
        "uncoveredCount": len(uncovered),
    }

    (OUT / "competitor-topics.json").write_text(
        json.dumps(uniq, ensure_ascii=False, indent=2) + "\n"
    )
    (OUT / "wave2-gap-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    )
    print(
        f"[done] topics={len(uniq)} missingThemes={len(missing_themes)} "
        f"uncovered≈{len(uncovered)} → wave2-gap-report.json"
    )


if __name__ == "__main__":
    main()

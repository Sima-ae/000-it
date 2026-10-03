/**
 * Offline gap check: YourHosting flat filter taxonomy vs our catalog tree.
 * Run: npx tsx scripts/audit-yh-kennisbank-gap.ts
 */
import catalog from "../prisma/kennisbank/catalog.json";
import { EXTRA_HOSTING_KENNISBANK_CATEGORY_SLUGS } from "../src/lib/brand/hosting-only-content";

/** Filters scraped from https://www.yourhosting.nl/kennisbank/ (Algolia panel). */
const YH_FILTERS: { name: string; count: number; ourSlugs: string[] }[] = [
  {
    name: "Hosting & website",
    count: 158,
    ourSlugs: ["hosting", "wordpress", "cyberpanel", "plesk", "directadmin"],
  },
  {
    name: "Domeinnamen & DNS",
    count: 65,
    ourSlugs: ["domeinnamen", "dns-records", "domein-verhuizen", "domein-registratie"],
  },
  {
    name: "E-mail",
    count: 64,
    ourSlugs: ["e-mail", "e-mail-instellen", "webmail", "spam-en-veiligheid"],
  },
  {
    name: "Bestellen & administratief",
    count: 53,
    ourSlugs: ["crm-klantenpanel", "shop-en-pakketten", "support"],
  },
  {
    name: "Microsoft",
    count: 26,
    ourSlugs: ["microsoft"],
  },
  {
    name: "Overige vragen",
    count: 25,
    ourSlugs: ["support", "veilig-online", "foutmeldingen-troubleshooting"],
  },
  {
    name: "WordPress",
    count: 19,
    ourSlugs: ["wordpress"],
  },
  {
    name: "SSL-certificaten",
    count: 9,
    ourSlugs: ["ssl-certificaten", "beveiliging"],
  },
  {
    name: "Meest bekeken",
    count: 6,
    ourSlugs: [],
  },
];

type CatRow = string[] | { slug: string; name?: string; parent?: string | null };

function catSlug(row: CatRow): string {
  return Array.isArray(row) ? row[0] : row.slug;
}

function main() {
  const cats = (catalog as { categories: CatRow[] }).categories || [];
  const arts = (
    catalog as { articles: { slug: string; title: string; categories: string[] }[] }
  ).articles || [];
  const catSet = new Set(cats.map(catSlug));
  const artByCat = new Map<string, number>();
  for (const a of arts) {
    for (const c of a.categories || []) {
      artByCat.set(c, (artByCat.get(c) || 0) + 1);
    }
  }

  console.log("YourHosting filters (~425 articles) vs our catalog\n");
  console.log(
    `Ours: ${cats.length} categories, ${arts.length} articles (catalog.json)\n`,
  );

  for (const yh of YH_FILTERS) {
    const matched = yh.ourSlugs.filter((s) => catSet.has(s));
    const missing = yh.ourSlugs.filter((s) => !catSet.has(s));
    const oursCount = matched.reduce((n, s) => n + (artByCat.get(s) || 0), 0);
    console.log(
      `YH ${yh.name} (${yh.count}) → our linked cats ~${oursCount} arts | matched ${matched.join(", ") || "—"}`,
    );
    if (missing.length) console.log(`  missing slugs: ${missing.join(", ")}`);
  }

  console.log("\nExtra Hosting allowlist top-level:");
  for (const slug of [...EXTRA_HOSTING_KENNISBANK_CATEGORY_SLUGS].sort()) {
    console.log(`  - ${slug}${catSet.has(slug) ? "" : " (NOT IN CATALOG)"}`);
  }

  const popular = [
    "hoe-kom-ik-bij-mijn-webmail",
    "wachtwoord-van-e-mailadres-wijzigen",
    "domeinnaam-doorsturen",
    "dns-records-beheren",
    "mailadres-toevoegen-aan-mailprogramma",
  ];
  console.log("\nPopular deep-link targets:");
  for (const slug of popular) {
    const hit = arts.find((a) => a.slug === slug);
    console.log(`  ${hit ? "OK" : "MISS"} ${slug}`);
  }
}

main();

import { writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const arts = await p.kennisbankArticle.findMany({
    select: {
      slug: true,
      translations: { select: { locale: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  const missingEn = arts
    .filter((a) => !a.translations.some((t) => t.locale === "en"))
    .map((a) => a.slug);
  writeFileSync(
    "scripts/kennisbank-missing-en.json",
    JSON.stringify(missingEn, null, 2) + "\n",
  );
  console.log("missing EN:", missingEn.length);

  // Articles that have EN but lack most other locales
  const locales = [
    "fr", "de", "es", "pt", "it", "el", "pl", "cs", "sk", "hu", "ro", "bg",
    "hr", "sr", "bs", "cnr", "sq", "mk", "lt", "da", "sv", "no", "fi", "uk",
    "ru", "tr", "he", "ar", "ka", "hy", "az", "zh", "ja",
  ];
  let needOther = 0;
  for (const a of arts) {
    const have = new Set(a.translations.map((t) => t.locale));
    if (!have.has("en") && !have.has("nl")) continue;
    const missing = locales.filter((l) => !have.has(l));
    if (missing.length > 0) needOther += 1;
  }
  console.log("articles needing at least 1 other locale:", needOther);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await p.$disconnect();
  });

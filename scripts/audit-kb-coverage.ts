import { prisma } from "../src/lib/prisma";
import { enabledLanguages } from "../src/i18n/languages";

async function main() {
  const locales = enabledLanguages().map((l) => l.code);
  const cats = await prisma.kennisbankCategory.count();
  const arts = await prisma.kennisbankArticle.count();
  const catTr = await prisma.kennisbankCategoryTranslation.groupBy({
    by: ["locale"],
    _count: true,
  });
  const artTr = await prisma.kennisbankArticleTranslation.groupBy({
    by: ["locale"],
    _count: true,
  });
  console.log("DB ok cats", cats, "arts", arts);
  let catGaps = 0;
  let artGaps = 0;
  for (const loc of locales) {
    const c = catTr.find((r) => r.locale === loc)?._count ?? 0;
    const a = artTr.find((r) => r.locale === loc)?._count ?? 0;
    if (c !== cats || a !== arts) {
      console.log(loc, "cat", `${c}/${cats}`, "art", `${a}/${arts}`);
      if (c !== cats) catGaps += 1;
      if (a !== arts) artGaps += 1;
    }
  }
  console.log("locales with category gaps", catGaps);
  console.log("locales with article gaps", artGaps);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

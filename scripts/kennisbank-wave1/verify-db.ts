import { prisma } from "../../src/lib/prisma";

async function main() {
  const tops = [
    "webdesign-en-maatwerk",
    "ai-integratie-automatisering",
    "analytics-conversie-toegankelijkheid",
    "e-commerce-webshops",
    "cdn-performance-cloudflare",
  ];
  for (const slug of tops) {
    const cat = await prisma.kennisbankCategory.findUnique({
      where: { slug },
      include: {
        translations: { where: { locale: "nl" } },
        _count: { select: { articles: true } },
        children: {
          select: { slug: true, _count: { select: { articles: true } } },
        },
      },
    });
    console.log(
      slug,
      "arts",
      cat?._count.articles,
      "subs",
      cat?.children.length,
      "name",
      cat?.translations[0]?.name,
    );
  }
  const total = await prisma.kennisbankArticle.count();
  const withEn = await prisma.kennisbankArticleTranslation.count({
    where: { locale: "en" },
  });
  const withNl = await prisma.kennisbankArticleTranslation.count({
    where: { locale: "nl" },
  });
  console.log({ totalArticles: total, nlRows: withNl, enRows: withEn });
  const sample = await prisma.kennisbankArticle.findFirst({
    where: { slug: "next-js-app-router-uitleggen-voor-je-triplezero-it-project" },
    include: {
      translations: {
        where: { locale: { in: ["nl", "en"] } },
        select: { locale: true, title: true, bodyHtml: true },
      },
    },
  });
  console.log(
    "sample",
    sample?.slug,
    sample?.translations.map((t) => ({
      locale: t.locale,
      title: t.title,
      bodyLen: t.bodyHtml.length,
    })),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

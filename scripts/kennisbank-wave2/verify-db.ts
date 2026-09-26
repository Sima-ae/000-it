#!/usr/bin/env tsx
import { prisma } from "../../src/lib/prisma";

async function main() {
  const tops = [
    "infrastructuur-servers",
    "foutmeldingen-troubleshooting",
    "privacy-juridisch-compliance",
    "vergelijkingen-keuzehulp",
  ];
  for (const slug of tops) {
    const cat = await prisma.kennisbankCategory.findUnique({
      where: { slug },
      include: {
        translations: { where: { locale: { in: ["nl", "en"] } } },
        _count: { select: { articles: true } },
        children: { select: { slug: true } },
      },
    });
    console.log(
      slug,
      "arts",
      cat?._count.articles,
      "subs",
      cat?.children.length,
      "nl",
      cat?.translations.find((t) => t.locale === "nl")?.name,
      "en",
      cat?.translations.find((t) => t.locale === "en")?.name,
    );
  }
  const total = await prisma.kennisbankArticle.count();
  const nl = await prisma.kennisbankArticleTranslation.count({
    where: { locale: "nl" },
  });
  const en = await prisma.kennisbankArticleTranslation.count({
    where: { locale: "en" },
  });
  console.log({ totalArticles: total, nlRows: nl, enRows: en });

  const sample = await prisma.kennisbankArticle.findFirst({
    where: { slug: "wat-is-een-dedicated-server-en-wanneer-kies-je-die" },
    include: {
      translations: {
        where: { locale: { in: ["nl", "en"] } },
        select: { locale: true, title: true, bodyHtml: true },
      },
    },
  });
  console.log(
    "sample",
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

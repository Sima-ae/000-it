import { prisma } from "../src/lib/prisma";

async function main() {
  const cats = await prisma.kennisbankCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
    select: {
      slug: true,
      nameNl: true,
      parentSlug: true,
      sortOrder: true,
      _count: { select: { articles: true } },
    },
  });
  // parent relation might be parentId - check schema
  console.log("count", cats.length);
  console.log(JSON.stringify(cats.slice(0, 5), null, 2));
}
main().finally(() => prisma.$disconnect());

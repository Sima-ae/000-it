/**
 * Rename Dutch shop title for wordpress-error-fix.
 *   npx tsx scripts/rename-bugs-title.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const NAME_NL = "Bugs en errors verhelpen";

async function main() {
  const result = await prisma.shopCatalogProduct.updateMany({
    where: { slug: "wordpress-error-fix" },
    data: { nameNl: NAME_NL },
  });
  console.log(`updated ${result.count} row(s) → ${NAME_NL}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

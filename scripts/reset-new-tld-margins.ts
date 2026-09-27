/**
 * One-shot: set markup for non-core TLDs to 0 fixed + 20%.
 * Core/seeded TLDs (nl, com, eu, …) keep their curated markups.
 *
 *   npx tsx scripts/reset-new-tld-margins.ts
 */
import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { prisma } from "../src/lib/prisma";
import { CORE_DOMAIN_TLDS } from "../src/lib/domains/sync-prices";

async function main() {
  const result = await prisma.domainProduct.updateMany({
    where: { tld: { notIn: [...CORE_DOMAIN_TLDS] } },
    data: {
      markupFixedCents: 0,
      markupPercent: 20,
    },
  });
  console.log(
    JSON.stringify(
      {
        updated: result.count,
        keptCore: CORE_DOMAIN_TLDS.length,
        markup: { fixedCents: 0, percent: 20 },
      },
      null,
      2,
    ),
  );
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

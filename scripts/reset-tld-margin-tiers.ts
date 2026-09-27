/**
 * Enforce tiered domain margins: fixed €0 + % from buy-price brackets.
 *
 *   npx tsx scripts/reset-tld-margin-tiers.ts
 */
import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { prisma } from "../src/lib/prisma";
import { markupPercentForBuyPriceCents } from "../src/lib/domains/pricing";

async function main() {
  const products = await prisma.domainProduct.findMany({
    select: { id: true, tld: true, basePriceInCents: true },
  });

  let updated = 0;
  for (const p of products) {
    const markupPercent = markupPercentForBuyPriceCents(p.basePriceInCents);
    await prisma.domainProduct.update({
      where: { id: p.id },
      data: {
        markupFixedCents: 0,
        markupPercent,
      },
    });
    updated += 1;
  }

  console.log(
    JSON.stringify(
      {
        updated,
        rule: "fixedCents=0, percent=tier(buyPrice)",
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

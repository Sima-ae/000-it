import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { syncDomainPricesFromNamecheap } from "../src/lib/domains/sync-prices";
import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await syncDomainPricesFromNamecheap();
  const count = await prisma.domainProduct.count();
  const withRenew = await prisma.domainProduct.count({
    where: { renewBasePriceInCents: { gt: 0 } },
  });
  console.log(JSON.stringify({ ...result, dbCount: count, withRenew }, null, 2));
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

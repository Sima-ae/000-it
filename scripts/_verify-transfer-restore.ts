import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });
import { prisma } from "../src/lib/prisma";
import {
  markupPercentForBuyPriceCents,
  sellPriceCents,
  renewSellPriceCents,
  transferSellPriceCents,
  restoreSellPriceCents,
} from "../src/lib/domains/pricing";

async function main() {
  const samples = await prisma.domainProduct.findMany({
    where: {
      tld: { in: ["com", "nl", "net", "org", "be", "abogado", "amsterdam"] },
    },
    orderBy: { tld: "asc" },
  });
  const totals = {
    total: await prisma.domainProduct.count(),
    manual: await prisma.domainProduct.count({
      where: { manualPricing: true },
    }),
    sync: await prisma.domainProduct.count({
      where: { manualPricing: false },
    }),
    withTransfer: await prisma.domainProduct.count({
      where: { transferBasePriceInCents: { gt: 0 } },
    }),
    withRestore: await prisma.domainProduct.count({
      where: { restoreBasePriceInCents: { gt: 0 } },
    }),
    syncMissingTransfer: await prisma.domainProduct.count({
      where: { manualPricing: false, transferBasePriceInCents: 0 },
    }),
    syncMissingRestore: await prisma.domainProduct.count({
      where: { manualPricing: false, restoreBasePriceInCents: 0 },
    }),
  };
  const out = samples.map((p) => ({
    tld: p.tld,
    manual: p.manualPricing,
    buy: (p.basePriceInCents / 100).toFixed(2),
    renew: (p.renewBasePriceInCents / 100).toFixed(2),
    transfer: (p.transferBasePriceInCents / 100).toFixed(2),
    restore: (p.restoreBasePriceInCents / 100).toFixed(2),
    sell: (sellPriceCents(p) / 100).toFixed(2),
    renewSell: (renewSellPriceCents(p) / 100).toFixed(2),
    transferSell: (transferSellPriceCents(p) / 100).toFixed(2),
    restoreSell: (restoreSellPriceCents(p) / 100).toFixed(2),
    transferPct: markupPercentForBuyPriceCents(p.transferBasePriceInCents),
  }));
  console.log(JSON.stringify({ totals, out }, null, 2));
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sellPriceCents,
  renewSellPriceCents,
  effectiveSellPriceCents,
  formatEuroFromCents,
  hasOfferPrice,
} from "@/lib/domains/pricing";
import { sortByTldPopularity } from "@/lib/domains/tld-order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.domainProduct.findMany({
    where: { isActive: true },
    orderBy: { tld: "asc" },
  });

  const mapped = rows.map((p) => {
    const listPriceInCents = sellPriceCents(p);
    const priceInCents = effectiveSellPriceCents(p);
    const renewPriceInCents = renewSellPriceCents(p);
    const onOffer = hasOfferPrice(p);
    return {
      tld: p.tld,
      priceInCents,
      priceLabel: formatEuroFromCents(priceInCents),
      listPriceInCents,
      listPriceLabel: formatEuroFromCents(listPriceInCents),
      offerPriceInCents: onOffer ? priceInCents : null,
      onOffer,
      renewPriceInCents: renewPriceInCents > 0 ? renewPriceInCents : null,
      renewPriceLabel:
        renewPriceInCents > 0 ? formatEuroFromCents(renewPriceInCents) : null,
      basePriceInCents: p.basePriceInCents,
      renewBasePriceInCents: p.renewBasePriceInCents,
    };
  });

  return NextResponse.json(sortByTldPopularity(mapped));
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sellPriceCents, formatEuroFromCents } from "@/lib/domains/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.domainProduct.findMany({
    where: { isActive: true },
    orderBy: { tld: "asc" },
  });

  return NextResponse.json(
    rows.map((p) => {
      const priceInCents = sellPriceCents(p);
      return {
        tld: p.tld,
        priceInCents,
        priceLabel: formatEuroFromCents(priceInCents),
        basePriceInCents: p.basePriceInCents,
      };
    }),
  );
}

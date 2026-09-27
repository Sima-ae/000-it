import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import {
  sellPriceCents,
  renewSellPriceCents,
  effectiveSellPriceCents,
  markupPercentForBuyPriceCents,
} from "@/lib/domains/pricing";

export const dynamic = "force-dynamic";

const upsertSchema = z.object({
  tld: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9-]+$/i)
    .transform((v) => v.toLowerCase().replace(/^\./, "")),
  /** Accepted for backwards compatibility; always forced to 0. */
  markupFixedCents: z.number().int().nonnegative().max(1_000_000).optional(),
  /** Accepted for backwards compatibility; overwritten from buy-price tiers. */
  markupPercent: z.number().nonnegative().max(500).optional(),
  isActive: z.boolean().default(true),
  basePriceInCents: z.number().int().positive().max(10_000_000).optional(),
  renewBasePriceInCents: z.number().int().nonnegative().max(10_000_000).optional(),
  offerPriceInCents: z
    .number()
    .int()
    .positive()
    .max(10_000_000)
    .nullable()
    .optional(),
});

function withPrices<
  T extends Parameters<typeof sellPriceCents>[0] & {
    renewBasePriceInCents?: number;
    basePriceInCents: number;
  },
>(p: T) {
  const list = sellPriceCents(p);
  const effective = effectiveSellPriceCents(p);
  const tierPercent = markupPercentForBuyPriceCents(p.basePriceInCents);
  return {
    ...p,
    markupFixedCents: 0,
    markupPercent: tierPercent,
    sellPriceInCents: list,
    effectiveSellPriceInCents: effective,
    renewSellPriceInCents: renewSellPriceCents({
      renewBasePriceInCents: p.renewBasePriceInCents ?? 0,
    }),
  };
}

export async function GET() {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const rows = await prisma.domainProduct.findMany({ orderBy: { tld: "asc" } });
  return NextResponse.json(rows.map((p) => withPrices(p)));
}

export async function POST(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const parsed = upsertSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const existing = await prisma.domainProduct.findUnique({
    where: { tld: data.tld },
  });
  const basePriceInCents =
    data.basePriceInCents ?? existing?.basePriceInCents ?? 1000;
  const renewBasePriceInCents =
    data.renewBasePriceInCents ??
    existing?.renewBasePriceInCents ??
    basePriceInCents;
  const markupPercent = markupPercentForBuyPriceCents(basePriceInCents);

  const item = await prisma.domainProduct.upsert({
    where: { tld: data.tld },
    create: {
      tld: data.tld,
      basePriceInCents,
      renewBasePriceInCents,
      markupFixedCents: 0,
      markupPercent,
      isActive: data.isActive,
      offerPriceInCents: data.offerPriceInCents ?? null,
    },
    update: {
      markupFixedCents: 0,
      markupPercent,
      isActive: data.isActive,
      ...(data.basePriceInCents != null
        ? { basePriceInCents: data.basePriceInCents }
        : {}),
      ...(data.renewBasePriceInCents != null
        ? { renewBasePriceInCents: data.renewBasePriceInCents }
        : {}),
      ...(data.offerPriceInCents !== undefined
        ? { offerPriceInCents: data.offerPriceInCents }
        : {}),
    },
  });

  return NextResponse.json(withPrices(item), { status: 201 });
}

export async function PATCH(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const body = await request.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const existing = await prisma.domainProduct.findUnique({
    where: { tld: data.tld },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const basePriceInCents = data.basePriceInCents ?? existing.basePriceInCents;

  const item = await prisma.domainProduct.update({
    where: { tld: data.tld },
    data: {
      markupFixedCents: 0,
      markupPercent: markupPercentForBuyPriceCents(basePriceInCents),
      isActive: data.isActive,
      ...(data.basePriceInCents != null
        ? { basePriceInCents: data.basePriceInCents }
        : {}),
      ...(data.renewBasePriceInCents != null
        ? { renewBasePriceInCents: data.renewBasePriceInCents }
        : {}),
      ...(data.offerPriceInCents !== undefined
        ? { offerPriceInCents: data.offerPriceInCents }
        : {}),
    },
  });

  return NextResponse.json(withPrices(item));
}

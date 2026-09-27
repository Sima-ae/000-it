import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { isSuperAdmin } from "@/lib/roles";
import {
  sellPriceCents,
  renewSellPriceCents,
  transferSellPriceCents,
  restoreSellPriceCents,
  effectiveSellPriceCents,
  markupPercentForBuyPriceCents,
} from "@/lib/domains/pricing";

export const dynamic = "force-dynamic";

const upsertSchema = z.object({
  tld: z
    .string()
    .min(2)
    .max(63)
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i,
    )
    .transform((v) => v.toLowerCase().replace(/^\./, "")),
  markupFixedCents: z.number().int().nonnegative().max(1_000_000).optional(),
  markupPercent: z.number().nonnegative().max(500).optional(),
  isActive: z.boolean().default(true),
  /** SUPER_ADMIN only — registration buy price (EUR cents). */
  basePriceInCents: z.number().int().positive().max(50_000_000).optional(),
  /** SUPER_ADMIN only — renew buy price (EUR cents). */
  renewBasePriceInCents: z
    .number()
    .int()
    .nonnegative()
    .max(50_000_000)
    .optional(),
  /** SUPER_ADMIN only — transfer-in buy price (EUR cents). */
  transferBasePriceInCents: z
    .number()
    .int()
    .nonnegative()
    .max(50_000_000)
    .optional(),
  /** SUPER_ADMIN only — restore / reactivate buy price (EUR cents). */
  restoreBasePriceInCents: z
    .number()
    .int()
    .nonnegative()
    .max(50_000_000)
    .optional(),
  /** SUPER_ADMIN only — lock prices against supplier sync. */
  manualPricing: z.boolean().optional(),
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
    transferBasePriceInCents?: number;
    restoreBasePriceInCents?: number;
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
    transferSellPriceInCents: transferSellPriceCents({
      transferBasePriceInCents: p.transferBasePriceInCents ?? 0,
    }),
    restoreSellPriceInCents: restoreSellPriceCents({
      restoreBasePriceInCents: p.restoreBasePriceInCents ?? 0,
    }),
  };
}

export async function GET() {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const rows = await prisma.domainProduct.findMany({ orderBy: { tld: "asc" } });
  return NextResponse.json(rows.map((p) => withPrices(p)));
}

/** Create / upsert TLD — SUPER_ADMIN only (manual catalog entries). */
export async function POST(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN"]);
  if (authResult.error) return authResult.error;

  const parsed = upsertSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  if (data.basePriceInCents == null) {
    return NextResponse.json(
      { error: "basePriceInCents is required when adding a TLD" },
      { status: 400 },
    );
  }

  const basePriceInCents = data.basePriceInCents;
  const renewBasePriceInCents =
    data.renewBasePriceInCents ?? data.basePriceInCents;
  const transferBasePriceInCents =
    data.transferBasePriceInCents ?? renewBasePriceInCents;
  const restoreBasePriceInCents = data.restoreBasePriceInCents ?? 0;
  const markupPercent = markupPercentForBuyPriceCents(basePriceInCents);

  const item = await prisma.domainProduct.upsert({
    where: { tld: data.tld },
    create: {
      tld: data.tld,
      basePriceInCents,
      renewBasePriceInCents,
      transferBasePriceInCents,
      restoreBasePriceInCents,
      markupFixedCents: 0,
      markupPercent,
      manualPricing: true,
      isActive: data.isActive,
      offerPriceInCents: data.offerPriceInCents ?? null,
    },
    update: {
      basePriceInCents,
      renewBasePriceInCents,
      transferBasePriceInCents,
      restoreBasePriceInCents,
      markupFixedCents: 0,
      markupPercent,
      manualPricing: true,
      isActive: data.isActive,
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
  const superAdmin = isSuperAdmin(authResult.session.user.role);
  const wantsPriceEdit =
    data.basePriceInCents != null ||
    data.renewBasePriceInCents != null ||
    data.transferBasePriceInCents != null ||
    data.restoreBasePriceInCents != null ||
    data.manualPricing != null;

  if (wantsPriceEdit && !superAdmin) {
    return NextResponse.json(
      { error: "Only SUPER_ADMIN may edit buy / renew / transfer / restore prices" },
      { status: 403 },
    );
  }

  const existing = await prisma.domainProduct.findUnique({
    where: { tld: data.tld },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const basePriceInCents = data.basePriceInCents ?? existing.basePriceInCents;

  const touchedSupplierPrices =
    data.basePriceInCents != null ||
    data.renewBasePriceInCents != null ||
    data.transferBasePriceInCents != null ||
    data.restoreBasePriceInCents != null;

  const manualPricing = superAdmin
    ? data.manualPricing != null
      ? data.manualPricing
      : touchedSupplierPrices
        ? true
        : existing.manualPricing
    : existing.manualPricing;

  const item = await prisma.domainProduct.update({
    where: { tld: data.tld },
    data: {
      markupFixedCents: 0,
      markupPercent: markupPercentForBuyPriceCents(basePriceInCents),
      isActive: data.isActive,
      ...(superAdmin && data.basePriceInCents != null
        ? { basePriceInCents: data.basePriceInCents }
        : {}),
      ...(superAdmin && data.renewBasePriceInCents != null
        ? { renewBasePriceInCents: data.renewBasePriceInCents }
        : {}),
      ...(superAdmin && data.transferBasePriceInCents != null
        ? { transferBasePriceInCents: data.transferBasePriceInCents }
        : {}),
      ...(superAdmin && data.restoreBasePriceInCents != null
        ? { restoreBasePriceInCents: data.restoreBasePriceInCents }
        : {}),
      ...(superAdmin ? { manualPricing } : {}),
      ...(data.offerPriceInCents !== undefined
        ? { offerPriceInCents: data.offerPriceInCents }
        : {}),
    },
  });

  return NextResponse.json(withPrices(item));
}

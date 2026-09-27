import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { sellPriceCents } from "@/lib/domains/pricing";

export const dynamic = "force-dynamic";

const upsertSchema = z.object({
  tld: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9-]+$/i)
    .transform((v) => v.toLowerCase().replace(/^\./, "")),
  markupFixedCents: z.number().int().nonnegative().max(1_000_000),
  markupPercent: z.number().nonnegative().max(500),
  isActive: z.boolean().default(true),
  basePriceInCents: z.number().int().positive().max(10_000_000).optional(),
});

export async function GET() {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const rows = await prisma.domainProduct.findMany({ orderBy: { tld: "asc" } });
  return NextResponse.json(
    rows.map((p) => ({
      ...p,
      sellPriceInCents: sellPriceCents(p),
    })),
  );
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
  const item = await prisma.domainProduct.upsert({
    where: { tld: data.tld },
    create: {
      tld: data.tld,
      basePriceInCents: data.basePriceInCents ?? 1000,
      markupFixedCents: data.markupFixedCents,
      markupPercent: data.markupPercent,
      isActive: data.isActive,
    },
    update: {
      markupFixedCents: data.markupFixedCents,
      markupPercent: data.markupPercent,
      isActive: data.isActive,
      ...(data.basePriceInCents != null
        ? { basePriceInCents: data.basePriceInCents }
        : {}),
    },
  });

  return NextResponse.json(
    { ...item, sellPriceInCents: sellPriceCents(item) },
    { status: 201 },
  );
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
  const existing = await prisma.domainProduct.findUnique({ where: { tld: data.tld } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const item = await prisma.domainProduct.update({
    where: { tld: data.tld },
    data: {
      markupFixedCents: data.markupFixedCents,
      markupPercent: data.markupPercent,
      isActive: data.isActive,
      ...(data.basePriceInCents != null
        ? { basePriceInCents: data.basePriceInCents }
        : {}),
    },
  });

  return NextResponse.json({ ...item, sellPriceInCents: sellPriceCents(item) });
}

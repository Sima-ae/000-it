import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { VAT_RATE, splitInclusiveVat } from "@/lib/shop/vat";

export const dynamic = "force-dynamic";

const itemSchema = z.object({
  productId: z.string().min(1).max(120).optional(),
  name: z.string().min(1).max(190),
  quantity: z.number().int().min(1).max(999),
  unitPriceIncl: z.number().min(0).max(1_000_000),
});

const createSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(190),
  company: z.string().max(190).optional().nullable(),
  locale: z.string().min(2).max(10).default("nl"),
  status: z.enum(["PENDING", "PAID", "FAILED", "CANCELLED"]).default("PENDING"),
  items: z.array(itemSchema).min(1).max(50),
});

function makeOrderNumber() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TZ-${stamp}-${rand}`;
}

function totalsFromItems(
  items: z.infer<typeof itemSchema>[],
  vatRate = VAT_RATE,
) {
  const totalIncl = Math.round(
    items.reduce((sum, item) => sum + item.unitPriceIncl * item.quantity, 0) *
      100,
  ) / 100;
  const { excl, vat, incl } = splitInclusiveVat(totalIncl, vatRate);
  return { subtotalExcl: excl, vatAmount: vat, totalIncl: incl, vatRate };
}

export async function GET() {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const orders = await prisma.shopOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const totals = totalsFromItems(data.items);

  const order = await prisma.shopOrder.create({
    data: {
      orderNumber: makeOrderNumber(),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      company: data.company?.trim() || null,
      locale: data.locale,
      currency: "EUR",
      status: data.status,
      subtotalExcl: totals.subtotalExcl,
      vatAmount: totals.vatAmount,
      totalIncl: totals.totalIncl,
      vatRate: totals.vatRate,
      userId: authResult.session.user.id,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId || `manual-${Date.now().toString(36)}`,
          name: item.name.trim(),
          quantity: item.quantity,
          unitPriceIncl: item.unitPriceIncl,
          vatRate: totals.vatRate,
        })),
      },
    },
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(order, { status: 201 });
}

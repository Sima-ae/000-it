import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { canDelete } from "@/lib/roles";
import { VAT_RATE, splitInclusiveVat } from "@/lib/shop/vat";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const itemSchema = z.object({
  productId: z.string().min(1).max(120).optional(),
  name: z.string().min(1).max(190),
  quantity: z.number().int().min(1).max(999),
  unitPriceIncl: z.number().min(0).max(1_000_000),
});

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().max(190).optional(),
  company: z.string().max(190).optional().nullable(),
  locale: z.string().min(2).max(10).optional(),
  status: z.enum(["PENDING", "PAID", "FAILED", "CANCELLED"]).optional(),
  items: z.array(itemSchema).min(1).max(50).optional(),
});

function totalsFromItems(
  items: z.infer<typeof itemSchema>[],
  vatRate = VAT_RATE,
) {
  const totalIncl =
    Math.round(
      items.reduce((sum, item) => sum + item.unitPriceIncl * item.quantity, 0) *
        100,
    ) / 100;
  const { excl, vat, incl } = splitInclusiveVat(totalIncl, vatRate);
  return { subtotalExcl: excl, vatAmount: vat, totalIncl: incl, vatRate };
}

export async function GET(_request: Request, { params }: Params) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const order = await prisma.shopOrder.findFirst({
    where: { OR: [{ id }, { orderNumber: id }] },
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(request: Request, { params }: Params) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const existing = await prisma.shopOrder.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const totals = data.items ? totalsFromItems(data.items) : null;

  const order = await prisma.$transaction(async (tx) => {
    if (data.items) {
      await tx.shopOrderItem.deleteMany({ where: { orderId: id } });
      await tx.shopOrderItem.createMany({
        data: data.items.map((item) => ({
          orderId: id,
          productId: item.productId || `manual-${Date.now().toString(36)}`,
          name: item.name.trim(),
          quantity: item.quantity,
          unitPriceIncl: item.unitPriceIncl,
          vatRate: totals?.vatRate ?? existing.vatRate,
        })),
      });
    }

    return tx.shopOrder.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.email !== undefined
          ? { email: data.email.trim().toLowerCase() }
          : {}),
        ...(data.company !== undefined
          ? { company: data.company?.trim() || null }
          : {}),
        ...(data.locale !== undefined ? { locale: data.locale } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(totals
          ? {
              subtotalExcl: totals.subtotalExcl,
              vatAmount: totals.vatAmount,
              totalIncl: totals.totalIncl,
              vatRate: totals.vatRate,
            }
          : {}),
      },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  });

  return NextResponse.json(order);
}

export async function DELETE(_request: Request, { params }: Params) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  if (!canDelete(authResult.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.shopOrder.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.shopOrder.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

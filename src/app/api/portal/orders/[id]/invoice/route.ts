import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { isStaffRole } from "@/lib/roles";
import { buildOrderInvoicePdf } from "@/lib/shop/invoice-pdf";
import {
  buildDomainOrderInvoiceDocument,
  buildShopOrderInvoiceDocument,
} from "@/lib/shop/order-invoice";

export const dynamic = "force-dynamic";

function ownsOrder(
  order: { userId: string | null; email: string },
  userId: string,
  email: string | null | undefined,
  staff: boolean,
) {
  if (staff) return true;
  if (order.userId && order.userId === userId) return true;
  const normalized = (email || "").trim().toLowerCase();
  if (normalized && order.email.trim().toLowerCase() === normalized) return true;
  return false;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireUser();
  if (error) return error;

  const { id } = await context.params;
  const type = new URL(request.url).searchParams.get("type");
  if (type !== "shop" && type !== "domain") {
    return NextResponse.json(
      { error: "Query type=shop|domain is required" },
      { status: 400 },
    );
  }

  const staff = isStaffRole(session.user.role);
  const userId = session.user.id;
  const email = session.user.email;

  if (type === "shop") {
    const order = await prisma.shopOrder.findUnique({
      where: { id },
      select: { id: true, userId: true, email: true, status: true, orderNumber: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!ownsOrder(order, userId, email, staff)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (order.status !== "PAID") {
      return NextResponse.json(
        { error: "Invoice available after payment" },
        { status: 400 },
      );
    }

    const built = await buildShopOrderInvoiceDocument({ orderId: order.id });
    if (!built.ok) {
      return NextResponse.json({ error: built.reason }, { status: 400 });
    }

    const pdf = await buildOrderInvoicePdf(built.document);
    const filename = `invoice-${built.document.invoiceNumber}.pdf`.replace(
      /[^\w.-]+/g,
      "_",
    );
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  const order = await prisma.domainOrder.findUnique({
    where: { id },
    select: { id: true, userId: true, email: true, status: true, orderNumber: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!ownsOrder(order, userId, email, staff)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // PENDING = unpaid; PAID / REGISTERED / FAILED may download
  if (order.status === "PENDING") {
    return NextResponse.json(
      { error: "Invoice available after payment" },
      { status: 400 },
    );
  }

  const built = await buildDomainOrderInvoiceDocument({ orderId: order.id });
  if (!built.ok) {
    return NextResponse.json({ error: built.reason }, { status: 400 });
  }

  const pdf = await buildOrderInvoicePdf(built.document);
  const filename = `invoice-${built.document.invoiceNumber}.pdf`.replace(
    /[^\w.-]+/g,
    "_",
  );
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

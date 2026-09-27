import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { isAdminRole, isStaffRole } from "@/lib/roles";
import { buildOrderInvoicePdf, type OrderInvoiceDocument } from "@/lib/shop/invoice-pdf";
import { normalizedClientEmail } from "@/lib/portal/scope";
import type { InvoiceLineItem } from "@/lib/crm/invoices";

export const dynamic = "force-dynamic";

function canAccessInvoice(
  role: string,
  userId: string,
  email: string | null | undefined,
  invoice: {
    createdById: string;
    deletedAt: Date | null;
    status: string;
    client: { email: string | null };
  },
) {
  if (invoice.deletedAt) return false;
  if (isAdminRole(role)) return true;
  if (isStaffRole(role)) return invoice.createdById === userId;
  if (invoice.status === "DRAFT") return false;
  const clientEmail = normalizedClientEmail(invoice.client.email);
  const sessionEmail = normalizedClientEmail(email);
  return Boolean(sessionEmail) && clientEmail === sessionEmail;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireUser();
  if (error) return error;

  const { id } = await context.params;
  const url = new URL(request.url);
  const localeParam = (url.searchParams.get("locale") || "en").toLowerCase();
  const locale = localeParam.split("-")[0] || "en";
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          name: true,
          company: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          country: true,
          vatNumber: true,
        },
      },
      project: { select: { name: true } },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    !canAccessInvoice(session.user.role, session.user.id, session.user.email, invoice)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const items = (Array.isArray(invoice.items) ? invoice.items : []) as InvoiceLineItem[];
  const taxRateFrac = Number(invoice.taxRate || 0) / 100;
  const lines = items.map((item) => {
    const qty = Number(item.qty) || 0;
    const unitExcl = Number(item.unitPrice) || 0;
    const lineExcl = qty * unitExcl;
    const lineVat = lineExcl * taxRateFrac;
    return {
      description: String(item.description || ""),
      quantity: qty,
      unitExcl,
      lineExcl,
      lineVat,
      lineIncl: lineExcl + lineVat,
    };
  });

  const addressLines = [
    invoice.client.address,
    [invoice.client.city, invoice.client.country].filter(Boolean).join(", ") || null,
  ].filter(Boolean) as string[];

  const document: OrderInvoiceDocument = {
    invoiceNumber: invoice.number,
    orderNumber: invoice.reference || invoice.number,
    locale,
    currency: invoice.currency || "EUR",
    taxRate: taxRateFrac,
    issueDate: invoice.issueDate,
    paidAt: invoice.status === "PAID" ? invoice.updatedAt : invoice.issueDate,
    paymentMethod: null,
    stripeSessionId: null,
    categoryLabel: invoice.project?.name
      ? `${invoice.project.name}`
      : invoice.number,
    customer: {
      name: invoice.client.name,
      company: invoice.client.company,
      email: invoice.client.email || "",
      phone: invoice.client.phone,
      addressLines,
      vatNumber: invoice.client.vatNumber,
    },
    lines,
    subtotalExcl: Number(invoice.subtotal) || 0,
    vatAmount: Number(invoice.taxAmount) || 0,
    totalIncl: Number(invoice.amount) || 0,
    notes: [invoice.paymentTerms, invoice.notes].filter(Boolean).join("\n") || null,
  };

  const pdf = await buildOrderInvoicePdf(document);
  const filename = `invoice-${invoice.number}.pdf`.replace(/[^\w.-]+/g, "_");

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

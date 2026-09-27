import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { isAdminRole, isStaffRole } from "@/lib/roles";
import { buildOrderInvoicePdf, type OrderInvoiceDocument } from "@/lib/shop/invoice-pdf";
import { normalizedClientEmail } from "@/lib/portal/scope";
import {
  computeInvoiceTotals,
  parseInvoiceItems,
  roundMoney,
} from "@/lib/crm/invoices";
import { getInvoiceCopy } from "@/content/invoice-i18n";
import { splitInclusiveVat } from "@/lib/shop/vat";

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
  const t = getInvoiceCopy(locale);
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

  const taxRatePct = Number(invoice.taxRate) || 0;
  const taxRateFrac = taxRatePct / 100;
  const fallbackDescription =
    invoice.reference?.trim() ||
    invoice.project?.name?.trim() ||
    invoice.notes?.trim()?.slice(0, 120) ||
    t.services;

  const storedAmount = Number(invoice.amount) || 0;
  const storedSubtotal = Number(invoice.subtotal) || 0;
  const storedTax = Number(invoice.taxAmount) || 0;
  const parsedItems = parseInvoiceItems(invoice.items);

  let lines: OrderInvoiceDocument["lines"];
  let subtotalExcl: number;
  let vatAmount: number;
  let totalIncl: number;

  if (parsedItems.length > 0) {
    const computed = computeInvoiceTotals(parsedItems, taxRatePct);
    lines = parsedItems.map((item) => {
      const qty = Number(item.qty) || 0;
      const unitExcl = Number(item.unitPrice) || 0;
      const lineExcl = roundMoney(qty * unitExcl);
      const lineVat = roundMoney(lineExcl * taxRateFrac);
      return {
        description: String(item.description || ""),
        quantity: qty,
        unitExcl,
        lineExcl,
        lineVat,
        lineIncl: roundMoney(lineExcl + lineVat),
      };
    });
    subtotalExcl = computed.subtotal;
    vatAmount = computed.taxAmount;
    totalIncl = computed.amount;
  } else if (storedSubtotal > 0 || storedAmount > 0) {
    // Recover visible regels + matching BTW from stored totals (incl. amount).
    const incl =
      storedAmount > 0
        ? storedAmount
        : roundMoney(storedSubtotal + storedTax);
    const split =
      taxRateFrac > 0
        ? splitInclusiveVat(incl, taxRateFrac)
        : { excl: incl, vat: 0, incl };
    lines = [
      {
        description: fallbackDescription,
        quantity: 1,
        unitExcl: split.excl,
        lineExcl: split.excl,
        lineVat: split.vat,
        lineIncl: split.incl,
      },
    ];
    subtotalExcl = split.excl;
    vatAmount = split.vat;
    totalIncl = split.incl;
  } else {
    lines = [];
    subtotalExcl = 0;
    vatAmount = 0;
    totalIncl = 0;
  }

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
    paymentMethod: invoice.paymentTerms || null,
    stripeSessionId: null,
    categoryLabel: invoice.project?.name || t.services,
    customer: {
      name: invoice.client.name,
      company: invoice.client.company,
      email: invoice.client.email || "",
      phone: invoice.client.phone,
      addressLines,
      vatNumber: invoice.client.vatNumber,
    },
    lines,
    subtotalExcl,
    vatAmount,
    totalIncl,
    notes: invoice.notes || null,
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

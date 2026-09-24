import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { canDelete, isAdminRole, isStaffRole } from "@/lib/roles";
import {
  computeInvoiceTotals,
  defaultDueDate,
  type InvoiceLineItem,
} from "@/lib/crm/invoices";

const lineItemSchema = z.object({
  description: z.string().min(1).max(500),
  qty: z.number().positive().max(100000),
  unitPrice: z.number().min(0).max(1_000_000),
});

const upsertSchema = z.object({
  clientId: z.string().min(1),
  projectId: z.string().optional().nullable(),
  currency: z.string().default("EUR"),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  issueDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  reference: z.string().max(120).optional().nullable(),
  paymentTerms: z.string().max(240).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  taxRate: z.number().min(0).max(100).optional(),
  items: z.array(lineItemSchema).min(1),
});

const patchSchema = upsertSchema.partial().extend({
  id: z.string().min(1),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]).optional(),
});

function invoiceScope(role: string, userId: string, email: string | null | undefined) {
  if (isAdminRole(role)) return {};
  if (isStaffRole(role)) return { createdById: userId };
  return { client: { email: email || "" } };
}

function normalizeItems(items: InvoiceLineItem[]) {
  return items.map((item) => ({
    description: item.description.trim(),
    qty: Number(item.qty),
    unitPrice: Number(item.unitPrice),
  }));
}

export async function GET(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const trash = new URL(request.url).searchParams.get("trash") === "1";
  if (trash && !canDelete(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      ...invoiceScope(session.user.role, session.user.id, session.user.email),
      deletedAt: trash ? { not: null } : null,
    },
    orderBy: trash ? { deletedAt: "desc" } : { createdAt: "desc" },
    include: {
      client: {
        select: {
          id: true,
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
      project: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    take: 200,
  });
  return NextResponse.json(invoices);
}

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;
  if (!isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = upsertSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { id: parsed.data.clientId } });
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const items = normalizeItems(parsed.data.items);
  const taxRate = parsed.data.taxRate ?? 21;
  const totals = computeInvoiceTotals(items, taxRate);
  const issueDate = parsed.data.issueDate ? new Date(parsed.data.issueDate) : new Date();
  const dueDate = parsed.data.dueDate
    ? new Date(parsed.data.dueDate)
    : defaultDueDate(issueDate);

  const year = issueDate.getFullYear();
  const count = await prisma.invoice.count({
    where: { number: { startsWith: `INV-${year}-` } },
  });
  const number = `INV-${year}-${String(count + 1).padStart(4, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      number,
      clientId: parsed.data.clientId,
      projectId: parsed.data.projectId || null,
      createdById: session.user.id,
      amount: totals.amount,
      subtotal: totals.subtotal,
      taxRate,
      taxAmount: totals.taxAmount,
      currency: parsed.data.currency || "EUR",
      status: parsed.data.status ?? "DRAFT",
      issueDate,
      dueDate,
      reference: parsed.data.reference || null,
      paymentTerms: parsed.data.paymentTerms || "14 dagen netto",
      notes: parsed.data.notes || null,
      items,
    },
    include: {
      client: {
        select: {
          id: true,
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
      project: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(invoice, { status: 201 });
}

export async function PATCH(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;
  if (!isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const action = String(body.action || "");

  if (action === "restore") {
    if (!canDelete(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const id = String(body.id || "");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { deletedAt: null },
    });
    return NextResponse.json(invoice);
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.invoice.findFirst({
    where: {
      id: parsed.data.id,
      deletedAt: null,
      ...invoiceScope(session.user.role, session.user.id, session.user.email),
    },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (parsed.data.status) data.status = parsed.data.status;
  if (parsed.data.clientId) data.clientId = parsed.data.clientId;
  if (parsed.data.projectId !== undefined) data.projectId = parsed.data.projectId || null;
  if (parsed.data.currency) data.currency = parsed.data.currency;
  if (parsed.data.reference !== undefined) data.reference = parsed.data.reference || null;
  if (parsed.data.paymentTerms !== undefined) data.paymentTerms = parsed.data.paymentTerms || null;
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes || null;
  if (parsed.data.issueDate) data.issueDate = new Date(parsed.data.issueDate);
  if (parsed.data.dueDate !== undefined) {
    data.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
  }

  if (parsed.data.items) {
    const items = normalizeItems(parsed.data.items);
    const taxRate = parsed.data.taxRate ?? existing.taxRate ?? 21;
    const totals = computeInvoiceTotals(items, taxRate);
    data.items = items;
    data.taxRate = taxRate;
    data.subtotal = totals.subtotal;
    data.taxAmount = totals.taxAmount;
    data.amount = totals.amount;
  } else if (parsed.data.taxRate != null) {
    const items = (Array.isArray(existing.items) ? existing.items : []) as InvoiceLineItem[];
    const totals = computeInvoiceTotals(items, parsed.data.taxRate);
    data.taxRate = parsed.data.taxRate;
    data.subtotal = totals.subtotal;
    data.taxAmount = totals.taxAmount;
    data.amount = totals.amount;
  }

  const invoice = await prisma.invoice.update({
    where: { id: existing.id },
    data,
    include: {
      client: {
        select: {
          id: true,
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
      project: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(invoice);
}

export async function DELETE(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;
  if (!canDelete(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const permanent = url.searchParams.get("permanent") === "1";
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (permanent) {
    if (!existing.deletedAt) {
      return NextResponse.json(
        { error: "Move the invoice to trash before permanent delete" },
        { status: 400 },
      );
    }
    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ ok: true, permanent: true });
  }

  await prisma.invoice.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ ok: true, trashed: true });
}

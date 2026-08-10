import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { canDelete, isAdminRole, isStaffRole } from "@/lib/roles";

const createSchema = z.object({
  clientId: z.string().min(1),
  projectId: z.string().optional().nullable(),
  amount: z.number().min(0),
  currency: z.string().default("EUR"),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  dueDate: z.string().optional().nullable(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        description: z.string(),
        qty: z.number().default(1),
        price: z.number(),
      }),
    )
    .optional(),
});

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  const staff = isStaffRole(session.user.role);
  const invoices = await prisma.invoice.findMany({
    where: staff
      ? isAdminRole(session.user.role)
        ? {}
        : { createdById: session.user.id }
      : { client: { email: session.user.email || "" } },
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, name: true, company: true, email: true } },
      project: { select: { id: true, name: true } },
    },
    take: 100,
  });
  return NextResponse.json(invoices);
}

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;
  if (!isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const count = await prisma.invoice.count();
  const number = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      number,
      clientId: parsed.data.clientId,
      projectId: parsed.data.projectId || null,
      createdById: session.user.id,
      amount: parsed.data.amount,
      currency: parsed.data.currency || "EUR",
      status: parsed.data.status ?? "DRAFT",
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      notes: parsed.data.notes,
      items: parsed.data.items ?? [],
    },
    include: {
      client: { select: { id: true, name: true, company: true, email: true } },
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
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      status: body.status,
      amount: body.amount,
      notes: body.notes,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
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
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

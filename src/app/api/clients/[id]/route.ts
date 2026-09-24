import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/api-auth";
import { canDelete, canEditAny, isStaffRole } from "@/lib/roles";

const schema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  vatNumber: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "LEAD", "LOST"]).optional(),
  isLead: z.boolean().optional(),
  leadSource: z.string().optional().nullable(),
  leadStatus: z
    .enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"])
    .optional()
    .nullable(),
  projectId: z.string().nullable().optional(),
  notes: z.string().optional().nullable(),
});

async function findClient(id: string, role: string, userId: string, email?: string | null) {
  if (isStaffRole(role)) {
    if (canEditAny(role)) return prisma.client.findUnique({ where: { id } });
    return prisma.client.findFirst({ where: { id, userId } });
  }
  return prisma.client.findFirst({
    where: { id, OR: [{ email: email || "" }, { userId }] },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireUser();
  if (error) return error;
  const { id } = await params;

  const base = await findClient(
    id,
    session.user.role,
    session.user.id,
    session.user.email,
  );
  if (!base) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, name: true, status: true, progress: true } },
      contacts: { orderBy: { isPrimary: "desc" } },
      tickets: {
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: {
          assignedTo: { select: { id: true, name: true } },
          _count: { select: { messages: true } },
        },
      },
      invoices: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      crmNotes: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { id: true, name: true } } },
      },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(client);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;
  const { id } = await params;

  const existing = await findClient(
    id,
    authResult.session.user.role,
    authResult.session.user.id,
  );
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const client = await prisma.client.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(client);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireRole(["SUPER_ADMIN"]);
  if (authResult.error) return authResult.error;
  if (!canDelete(authResult.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

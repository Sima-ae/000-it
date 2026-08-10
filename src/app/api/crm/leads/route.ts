import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { canDelete, isAdminRole, ownScope } from "@/lib/roles";

const patchSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"]).optional(),
  assignedToId: z.string().nullable().optional(),
});

export async function GET() {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const [formLeads, pipelineClients] = await Promise.all([
    prisma.contactLead.findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.client.findMany({
      where: {
        ...ownScope(authResult.session.user.role, authResult.session.user.id),
        isLead: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return NextResponse.json({ formLeads, pipelineClients });
}

export async function PATCH(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const lead = await prisma.contactLead.update({
    where: { id },
    data: parsed.data,
    include: { assignedTo: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(lead);
}

/** Convert contact lead → CRM client */
export async function POST(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const leadId = String(body.leadId || "");
  if (!leadId) return NextResponse.json({ error: "Missing leadId" }, { status: 400 });

  const lead = await prisma.contactLead.findUnique({ where: { id: leadId } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const client = await prisma.client.create({
    data: {
      name: lead.name,
      email: lead.email,
      company: lead.company,
      notes: lead.message,
      status: "LEAD",
      isLead: true,
      leadSource: lead.source || "CONTACT_FORM",
      leadStatus: "QUALIFIED",
      userId: authResult.session.user.id,
      contacts: {
        create: {
          name: lead.name,
          email: lead.email,
          isPrimary: true,
        },
      },
    },
  });

  await prisma.contactLead.update({
    where: { id: leadId },
    data: { status: "WON", convertedClientId: client.id },
  });

  return NextResponse.json(client, { status: 201 });
}

export async function DELETE(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN"]);
  if (authResult.error) return authResult.error;
  if (!canDelete(authResult.session.user.role) && !isAdminRole(authResult.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (!canDelete(authResult.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.contactLead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

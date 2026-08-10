import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { ownScope } from "@/lib/roles";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  vatNumber: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "LEAD", "LOST"]).optional(),
  isLead: z.boolean().optional(),
  leadSource: z.string().optional(),
  leadStatus: z
    .enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"])
    .optional(),
  projectId: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const leadsOnly = new URL(request.url).searchParams.get("leads") === "1";
  const scope = ownScope(authResult.session.user.role, authResult.session.user.id);
  const clients = await prisma.client.findMany({
    where: {
      ...scope,
      ...(leadsOnly ? { isLead: true } : { isLead: false }),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      project: { select: { id: true, name: true } },
      _count: { select: { tickets: true, invoices: true, contacts: true } },
    },
  });
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const isLead = parsed.data.isLead ?? parsed.data.status === "LEAD";
  const client = await prisma.client.create({
    data: {
      ...parsed.data,
      status: parsed.data.status ?? (isLead ? "LEAD" : "ACTIVE"),
      isLead,
      userId: authResult.session.user.id,
      contacts: {
        create: {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          isPrimary: true,
        },
      },
    },
  });

  await prisma.activity.create({
    data: {
      type: "CLIENT_ADDED",
      description: `${isLead ? "Lead" : "Client"} added: ${client.name}`,
      userId: authResult.session.user.id,
      projectId: client.projectId ?? undefined,
    },
  });

  return NextResponse.json(client, { status: 201 });
}

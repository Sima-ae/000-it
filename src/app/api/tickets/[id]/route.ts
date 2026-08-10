import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canDelete, isStaffRole } from "@/lib/roles";
import { canAccessTicket } from "@/lib/support";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  subject: z.string().min(2).max(160).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assignedToId: z.string().nullable().optional(),
  clientId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  ticketType: z.string().max(80).optional().nullable(),
  guestToken: z.string().optional(),
});

const ticketInclude = {
  user: { select: { id: true, name: true, email: true } },
  assignedTo: { select: { id: true, name: true, email: true } },
  client: { select: { id: true, name: true, company: true, email: true } },
  project: { select: { id: true, name: true } },
  messages: {
    orderBy: { createdAt: "asc" as const },
    include: { sender: { select: { id: true, name: true, role: true } } },
  },
  notes: {
    orderBy: { createdAt: "desc" as const },
    take: 10,
    include: { user: { select: { id: true, name: true } } },
  },
};

export async function GET(request: Request, { params }: Params) {
  const session = await auth();
  const { id } = await params;
  const guestToken = new URL(request.url).searchParams.get("token");

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: ticketInclude,
  });

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowed = canAccessTicket({
    role: session?.user?.role,
    userId: session?.user?.id,
    ticketUserId: ticket.userId,
    guestToken: ticket.guestToken,
    providedGuestToken: guestToken,
  });

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { guestToken: _token, ...safe } = ticket;
  return NextResponse.json({
    ...safe,
    guestToken: guestToken && ticket.guestToken === guestToken ? ticket.guestToken : undefined,
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || !isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.supportTicket.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = parsed.data;
  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: {
      subject: data.subject,
      status: data.status,
      priority: data.priority,
      ticketType: data.ticketType === undefined ? undefined : data.ticketType,
      assignedToId: data.assignedToId === undefined ? undefined : data.assignedToId,
      clientId: data.clientId === undefined ? undefined : data.clientId,
      projectId: data.projectId === undefined ? undefined : data.projectId,
    },
    include: ticketInclude,
  });

  return NextResponse.json(ticket);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || !canDelete(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.supportTicket.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

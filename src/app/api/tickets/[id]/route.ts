import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canDelete, isStaffRole } from "@/lib/roles";
import { canAccessTicket } from "@/lib/support";
import { recordTicketEvent } from "@/lib/crm/ticket-events";
import { parseTicketTags } from "@/lib/crm/tickets";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  subject: z.string().min(2).max(160).optional(),
  description: z.string().max(10000).optional().nullable(),
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assignedToId: z.string().nullable().optional(),
  clientId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  ticketType: z.string().max(80).optional().nullable(),
  department: z.string().max(80).optional().nullable(),
  category: z.string().max(80).optional().nullable(),
  tags: z.array(z.string().min(1).max(40)).max(12).optional().nullable(),
  dueAt: z.string().datetime().optional().nullable(),
  favorite: z.boolean().optional(),
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
    take: 20,
    include: { user: { select: { id: true, name: true } } },
  },
  events: {
    orderBy: { createdAt: "desc" as const },
    take: 40,
    include: { actor: { select: { id: true, name: true, email: true } } },
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

  const { guestToken: ticketGuestToken, ...safe } = ticket;
  return NextResponse.json({
    ...safe,
    tags: parseTicketTags(ticket.tags),
    guestToken: guestToken && ticketGuestToken === guestToken ? ticketGuestToken : undefined,
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
  const events: {
    kind: string;
    message: string;
    payload?: Prisma.InputJsonValue;
  }[] = [];

  if (data.status && data.status !== existing.status) {
    events.push({
      kind: "STATUS_CHANGED",
      message: `Status changed from ${existing.status} to ${data.status}`,
      payload: { from: existing.status, to: data.status },
    });
  }
  if (data.priority && data.priority !== existing.priority) {
    events.push({
      kind: "PRIORITY_CHANGED",
      message: `Priority changed from ${existing.priority} to ${data.priority}`,
      payload: { from: existing.priority, to: data.priority },
    });
  }
  if (data.assignedToId !== undefined && data.assignedToId !== existing.assignedToId) {
    events.push({
      kind: "ASSIGNED",
      message: data.assignedToId
        ? "Ticket assignment updated"
        : "Ticket unassigned",
      payload: {
        from: existing.assignedToId ?? null,
        to: data.assignedToId ?? null,
      },
    });
  }
  if (data.clientId !== undefined && data.clientId !== existing.clientId) {
    events.push({
      kind: "CLIENT_LINKED",
      message: "Linked client updated",
      payload: {
        from: existing.clientId ?? null,
        to: data.clientId ?? null,
      },
    });
  }

  const resolvedAt =
    data.status === undefined
      ? undefined
      : data.status === "RESOLVED" || data.status === "CLOSED"
        ? existing.resolvedAt ?? new Date()
        : null;

  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: {
      subject: data.subject,
      description: data.description === undefined ? undefined : data.description,
      status: data.status,
      priority: data.priority,
      ticketType: data.ticketType === undefined ? undefined : data.ticketType,
      department: data.department === undefined ? undefined : data.department,
      category: data.category === undefined ? undefined : data.category,
      tags:
        data.tags === undefined
          ? undefined
          : data.tags === null
            ? []
            : parseTicketTags(data.tags),
      dueAt:
        data.dueAt === undefined
          ? undefined
          : data.dueAt
            ? new Date(data.dueAt)
            : null,
      favorite: data.favorite,
      assignedToId: data.assignedToId === undefined ? undefined : data.assignedToId,
      clientId: data.clientId === undefined ? undefined : data.clientId,
      projectId: data.projectId === undefined ? undefined : data.projectId,
      resolvedAt,
    },
    include: ticketInclude,
  });

  for (const event of events) {
    await recordTicketEvent({
      ticketId: id,
      actorId: session.user.id,
      kind: event.kind,
      message: event.message,
      payload: event.payload,
    });
  }

  return NextResponse.json({
    ...ticket,
    tags: parseTicketTags(ticket.tags),
  });
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

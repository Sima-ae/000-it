import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/roles";
import { newGuestToken } from "@/lib/support";

const createSchema = z.object({
  subject: z.string().min(2).max(160),
  message: z.string().min(1).max(5000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  source: z.enum(["CHAT", "DASHBOARD", "EMAIL"]).optional(),
  ticketType: z.string().max(80).optional(),
  guestName: z.string().min(1).max(120).optional(),
  guestEmail: z.string().email().optional(),
  clientId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where = isStaffRole(session.user.role)
    ? {}
    : { userId: session.user.id };

  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      client: { select: { id: true, name: true, company: true, email: true } },
      project: { select: { id: true, name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true, senderKind: true },
      },
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json(tickets);
}

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  const loggedIn = Boolean(session?.user?.id);
  const staff = isStaffRole(session?.user?.role);

  if (!loggedIn && (!data.guestName || !data.guestEmail)) {
    return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  }

  const isClientUser = loggedIn && !staff;
  const guestToken = !loggedIn ? newGuestToken() : null;
  const senderKind = staff ? "STAFF" : isClientUser ? "CLIENT" : "GUEST";
  const email = (data.guestEmail || session?.user?.email || "").toLowerCase();

  // Auto-link CRM client by email when possible
  let clientId = data.clientId || null;
  if (!clientId && email) {
    const matched = await prisma.client.findFirst({
      where: { email, isLead: false },
      orderBy: { updatedAt: "desc" },
    });
    clientId = matched?.id ?? null;
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      subject: data.subject,
      priority: data.priority ?? "MEDIUM",
      source: data.source ?? (isClientUser ? "DASHBOARD" : "CHAT"),
      ticketType: data.ticketType || "General",
      userId: isClientUser ? session!.user.id : null,
      clientId,
      projectId: data.projectId || null,
      guestName: data.guestName || session?.user?.name || null,
      guestEmail: data.guestEmail || session?.user?.email || null,
      guestToken,
      status: "OPEN",
      messages: {
        create: {
          body: data.message,
          senderId: session?.user?.id ?? null,
          senderKind,
        },
      },
    },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      client: { select: { id: true, name: true, company: true } },
      project: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ ...ticket, guestToken }, { status: 201 });
}

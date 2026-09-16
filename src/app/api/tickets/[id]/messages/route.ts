import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/roles";
import { canAccessTicket } from "@/lib/support";
import { buildAgentReply } from "@/lib/agent-000/ask";

type Params = { params: Promise<{ id: string }> };

const messageSchema = z.object({
  body: z.string().min(1).max(5000),
  guestToken: z.string().optional(),
  locale: z.string().optional(),
  /** Skip Agent 000 auto-reply (staff or explicit). */
  skipAgent: z.boolean().optional(),
});

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  const { id } = await params;
  const parsed = messageSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowed = canAccessTicket({
    role: session?.user?.role,
    userId: session?.user?.id,
    ticketUserId: ticket.userId,
    guestToken: ticket.guestToken,
    providedGuestToken: parsed.data.guestToken,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const staff = isStaffRole(session?.user?.role);
  const senderKind = staff
    ? "STAFF"
    : session?.user?.id
      ? "CLIENT"
      : "GUEST";

  const message = await prisma.ticketMessage.create({
    data: {
      ticketId: id,
      body: parsed.data.body,
      senderId: session?.user?.id ?? null,
      senderKind,
    },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });

  let agentMessage = null;
  if (!staff && !parsed.data.skipAgent && ticket.source === "CHAT") {
    const agent = buildAgentReply(parsed.data.locale || "en", parsed.data.body);
    agentMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        body: agent.answer,
        senderId: null,
        senderKind: "SYSTEM",
      },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });
  }

  await prisma.supportTicket.update({
    where: { id },
    data: {
      updatedAt: new Date(),
      status:
        ticket.status === "RESOLVED" || ticket.status === "CLOSED"
          ? "OPEN"
          : staff && ticket.status === "OPEN"
            ? "IN_PROGRESS"
            : ticket.status,
      assignedToId:
        staff && !ticket.assignedToId ? session!.user.id : ticket.assignedToId,
    },
  });

  return NextResponse.json(
    agentMessage ? { message, agentMessage } : message,
    { status: 201 },
  );
}

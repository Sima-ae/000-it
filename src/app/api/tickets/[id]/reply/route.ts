import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/roles";
import { recordTicketEvent } from "@/lib/crm/ticket-events";
import { isMailConfigured, sendMail } from "@/lib/mail";
import { isLiveChatSource, ticketKey } from "@/lib/crm/tickets";

type Params = { params: Promise<{ id: string }> };

const replySchema = z.object({
  body: z.string().min(1).max(8000),
  /** Force email even for chat (rare). Omit to use source defaults. */
  sendEmail: z.boolean().optional(),
});

function resolveRecipient(ticket: {
  guestEmail: string | null;
  client: { email: string | null } | null;
  user: { email: string } | null;
}) {
  return (
    ticket.guestEmail?.trim() ||
    ticket.client?.email?.trim() ||
    ticket.user?.email?.trim() ||
    ""
  );
}

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || !isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = replySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      client: { select: { email: true, name: true } },
      user: { select: { email: true, name: true } },
    },
  });
  if (!ticket) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isChat = isLiveChatSource(ticket.source);
  // Live chat replies appear in the visitor widget — do not email by default.
  // Formal tickets are answered by email.
  const shouldEmail =
    parsed.data.sendEmail !== undefined ? parsed.data.sendEmail : !isChat;

  const recipient = resolveRecipient(ticket);

  if (shouldEmail && !recipient) {
    return NextResponse.json(
      { error: "NO_EMAIL", message: "Ticket has no customer email address" },
      { status: 400 },
    );
  }

  let emailSent = false;
  let emailSkippedReason: string | null = null;

  if (shouldEmail) {
    if (!isMailConfigured()) {
      emailSkippedReason = "SMTP_NOT_CONFIGURED";
    } else {
      try {
        const key = ticketKey(ticket.id);
        const greetingName =
          ticket.guestName ||
          ticket.client?.name ||
          ticket.user?.name ||
          recipient;
        const text = [
          `Hello ${greetingName},`,
          "",
          parsed.data.body.trim(),
          "",
          `—`,
          `TripleZero iT Support`,
          `Ticket ${key}: ${ticket.subject}`,
        ].join("\n");

        await sendMail({
          to: recipient,
          subject: `Re: ${ticket.subject} (${key})`,
          text,
          replyTo: session.user.email || undefined,
        });
        emailSent = true;
      } catch (error) {
        console.error("[tickets/reply] email failed", error);
        return NextResponse.json(
          { error: "EMAIL_FAILED", message: "Could not send email" },
          { status: 502 },
        );
      }
    }
  }

  const message = await prisma.ticketMessage.create({
    data: {
      ticketId: id,
      body: parsed.data.body.trim(),
      senderId: session.user.id,
      senderKind: "STAFF",
    },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });

  await prisma.supportTicket.update({
    where: { id },
    data: {
      updatedAt: new Date(),
      status:
        ticket.status === "OPEN" || ticket.status === "WAITING"
          ? "IN_PROGRESS"
          : ticket.status,
      assignedToId: ticket.assignedToId || session.user.id,
      firstResponseAt: ticket.firstResponseAt || new Date(),
    },
  });

  await recordTicketEvent({
    ticketId: id,
    actorId: session.user.id,
    kind: isChat
      ? "CHAT_REPLY"
      : emailSent
        ? "REPLY_EMAILED"
        : "REPLY",
    message: isChat
      ? "Staff reply posted to live chat"
      : emailSent
        ? `Staff reply emailed to ${recipient}`
        : emailSkippedReason === "SMTP_NOT_CONFIGURED"
          ? "Staff reply saved (email skipped — SMTP not configured)"
          : "Staff reply saved",
    payload: {
      channel: isChat ? "CHAT" : "TICKET",
      emailSent,
      recipient: recipient || null,
      emailSkippedReason,
    },
  });

  return NextResponse.json({
    message,
    channel: isChat ? "CHAT" : "TICKET",
    emailSent,
    emailSkippedReason,
    recipient: recipient || null,
  });
}

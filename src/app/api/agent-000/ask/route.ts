import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAgentReply } from "@/lib/agent-000/ask";
import { canAccessTicket } from "@/lib/support";

export const runtime = "nodejs";

const bodySchema = z.object({
  locale: z.string().min(2).max(12).optional().default("en"),
  question: z.string().min(1).max(2000),
  faqId: z.string().min(1).max(80).optional(),
  ticketId: z.string().optional(),
  guestToken: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
    z.string().optional(),
  ),
  /** When true (default if ticketId set), persist SYSTEM reply on the ticket. */
  persist: z.boolean().optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { locale, question, ticketId, guestToken, faqId } = parsed.data;
  const persist = parsed.data.persist ?? Boolean(ticketId);
  const result = await buildAgentReply(
    locale,
    question,
    faqId ? { faqId } : undefined,
  );

  let systemMessageId: string | null = null;

  if (persist && ticketId) {
    const session = await auth();
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
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

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId,
        body: result.answer,
        senderId: null,
        senderKind: "SYSTEM",
      },
    });
    systemMessageId = message.id;
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });
  }

  return NextResponse.json({
    ...result,
    systemMessageId,
  });
}

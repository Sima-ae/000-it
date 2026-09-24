import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function recordTicketEvent(input: {
  ticketId: string;
  actorId?: string | null;
  kind: string;
  message: string;
  payload?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.ticketEvent.create({
      data: {
        ticketId: input.ticketId,
        actorId: input.actorId || null,
        kind: input.kind,
        message: input.message,
        payload: input.payload,
      },
    });
  } catch (error) {
    console.error("[ticket-event]", error);
  }
}

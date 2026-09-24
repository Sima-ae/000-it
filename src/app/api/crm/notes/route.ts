import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";

const createSchema = z.object({
  body: z.string().min(1).max(5000),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  ticketId: z.string().optional(),
});

export async function GET(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId") || undefined;
  const projectId = searchParams.get("projectId") || undefined;
  const ticketId = searchParams.get("ticketId") || undefined;

  const notes = await prisma.crmNote.findMany({
    where: { clientId, projectId, ticketId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true } } },
    take: 50,
  });
  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const note = await prisma.crmNote.create({
    data: {
      body: parsed.data.body,
      userId: authResult.session.user.id,
      clientId: parsed.data.clientId,
      projectId: parsed.data.projectId,
      ticketId: parsed.data.ticketId,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  if (parsed.data.ticketId) {
    const { recordTicketEvent } = await import("@/lib/crm/ticket-events");
    await recordTicketEvent({
      ticketId: parsed.data.ticketId,
      actorId: authResult.session.user.id,
      kind: "NOTE",
      message: "Internal note added",
    });
  }

  return NextResponse.json(note, { status: 201 });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

const createSchema = z.object({
  toUserId: z.string().min(1),
  subject: z.string().max(160).optional(),
  body: z.string().min(1).max(5000),
  parentId: z.string().optional(),
});

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  const messages = await prisma.crmMessage.findMany({
    where: {
      OR: [{ toUserId: session.user.id }, { fromUserId: session.user.id }],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      fromUser: { select: { id: true, name: true, email: true, role: true } },
      toUser: { select: { id: true, name: true, email: true, role: true } },
    },
  });
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const message = await prisma.crmMessage.create({
    data: {
      fromUserId: session.user.id,
      toUserId: parsed.data.toUserId,
      subject: parsed.data.subject,
      body: parsed.data.body,
      parentId: parsed.data.parentId,
    },
    include: {
      fromUser: { select: { id: true, name: true, email: true } },
      toUser: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json(message, { status: 201 });
}

export async function PATCH(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const id = String((await request.json()).id || "");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.crmMessage.findFirst({
    where: { id, toUserId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const message = await prisma.crmMessage.update({
    where: { id },
    data: { readAt: new Date() },
  });
  return NextResponse.json(message);
}

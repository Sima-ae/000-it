import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  industry: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "LEAD", "LOST"]).optional(),
  projectId: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { project: { select: { id: true, name: true } } },
  });
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: {
      ...parsed.data,
      status: parsed.data.status ?? "LEAD",
      userId: session.user.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: "CLIENT_ADDED",
      description: `Client added: ${client.name}`,
      userId: session.user.id,
      projectId: client.projectId ?? undefined,
    },
  });

  return NextResponse.json(client, { status: 201 });
}

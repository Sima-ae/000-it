import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { canEditAny } from "@/lib/roles";

const schema = z.object({
  status: z.enum(["IDLE", "RUNNING", "PAUSED", "ERROR", "COMPLETED"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireUser();
  if (error) return error;
  const { id } = await params;

  const existing = await prisma.aIAgent.findFirst({
    where: canEditAny(session.user.role)
      ? { id }
      : { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const agent = await prisma.aIAgent.update({
    where: { id },
    data: {
      status: parsed.data.status,
      lastActive: new Date(),
    },
  });

  await prisma.activity.create({
    data: {
      type: parsed.data.status === "RUNNING" ? "AGENT_STARTED" : "AGENT_COMPLETED",
      description: `Agent ${agent.name} → ${agent.status}`,
      userId: session.user.id,
      projectId: agent.projectId ?? undefined,
    },
  });

  return NextResponse.json(agent);
}

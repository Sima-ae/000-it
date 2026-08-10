import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { ownScope } from "@/lib/roles";

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  const agents = await prisma.aIAgent.findMany({
    where: ownScope(session.user.role, session.user.id),
    orderBy: { updatedAt: "desc" },
    include: { project: { select: { id: true, name: true } } },
  });
  return NextResponse.json(agents);
}

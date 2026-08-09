import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;
  const userId = session.user.id;

  const [projects, agents, tasks, scans, activities] = await Promise.all([
    prisma.project.count({ where: { userId } }),
    prisma.aIAgent.count({ where: { userId, status: "RUNNING" } }),
    prisma.task.count({ where: { project: { userId } } }),
    prisma.aIScan.count({ where: { userId } }),
    prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const recentProjects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });

  const agentList = await prisma.aIAgent.findMany({
    where: { userId },
    take: 8,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    stats: { projects, agents, tasks, scans },
    activities,
    recentProjects,
    agentList,
  });
}

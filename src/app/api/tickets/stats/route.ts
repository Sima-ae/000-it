import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { isStaffRole } from "@/lib/roles";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  const role = session.user.role;
  const staff = isStaffRole(role);
  const scope: Prisma.SupportTicketWhereInput = staff
    ? {}
    : { userId: session.user.id };

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const openWhere: Prisma.SupportTicketWhereInput = {
    ...scope,
    status: { in: ["OPEN", "IN_PROGRESS", "WAITING"] },
  };

  const [
    total,
    open,
    highPriority,
    unassigned,
    assignedToMe,
    chatSource,
    resolved,
    closed,
    overdue,
    byStatus,
    byPriority,
    byDepartment,
    byType,
    recent,
    historyRaw,
    clientsCount,
    contactsCount,
    firstResponses,
  ] = await Promise.all([
    prisma.supportTicket.count({ where: scope }),
    prisma.supportTicket.count({ where: openWhere }),
    prisma.supportTicket.count({
      where: { ...openWhere, priority: { in: ["HIGH", "URGENT"] } },
    }),
    staff
      ? prisma.supportTicket.count({
          where: { ...openWhere, assignedToId: null },
        })
      : Promise.resolve(0),
    staff
      ? prisma.supportTicket.count({
          where: { ...openWhere, assignedToId: session.user.id },
        })
      : Promise.resolve(0),
    prisma.supportTicket.count({ where: { ...scope, source: "CHAT" } }),
    prisma.supportTicket.count({ where: { ...scope, status: "RESOLVED" } }),
    prisma.supportTicket.count({ where: { ...scope, status: "CLOSED" } }),
    prisma.supportTicket.count({
      where: {
        ...openWhere,
        dueAt: { lt: now },
      },
    }),
    prisma.supportTicket.groupBy({
      by: ["status"],
      where: scope,
      _count: { _all: true },
    }),
    prisma.supportTicket.groupBy({
      by: ["priority"],
      where: scope,
      _count: { _all: true },
    }),
    prisma.supportTicket.groupBy({
      by: ["department"],
      where: scope,
      _count: { _all: true },
    }),
    prisma.supportTicket.groupBy({
      by: ["ticketType"],
      where: scope,
      _count: { _all: true },
    }),
    prisma.supportTicket.findMany({
      where: scope,
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        updatedAt: true,
        dueAt: true,
      },
    }),
    prisma.supportTicket.findMany({
      where: { ...scope, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    staff ? prisma.client.count({ where: { isLead: false } }) : Promise.resolve(0),
    staff
      ? prisma.client.count()
      : Promise.resolve(0),
    prisma.supportTicket.findMany({
      where: { ...scope, firstResponseAt: { not: null } },
      select: { createdAt: true, firstResponseAt: true },
      take: 200,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const historyMap = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    historyMap.set(monthKey(d), 0);
  }
  for (const row of historyRaw) {
    const key = monthKey(row.createdAt);
    if (historyMap.has(key)) historyMap.set(key, (historyMap.get(key) || 0) + 1);
  }

  let avgFirstResponseMins = 0;
  if (firstResponses.length) {
    const totalMins = firstResponses.reduce((sum, row) => {
      if (!row.firstResponseAt) return sum;
      return sum + (row.firstResponseAt.getTime() - row.createdAt.getTime()) / 60_000;
    }, 0);
    avgFirstResponseMins = Math.round(totalMins / firstResponses.length);
  }

  const newToday = await prisma.supportTicket.count({
    where: { ...scope, createdAt: { gte: startOfDay } },
  });

  return NextResponse.json({
    stats: {
      total,
      open,
      highPriority,
      unassigned,
      assignedToMe,
      chatSource,
      resolved,
      closed,
      overdue,
      newToday,
      avgFirstResponseMins,
      clientsCount,
      contactsCount,
    },
    byStatus: byStatus.map((row) => ({
      key: row.status,
      count: row._count._all,
    })),
    byPriority: byPriority.map((row) => ({
      key: row.priority,
      count: row._count._all,
    })),
    byDepartment: byDepartment
      .filter((row) => row.department)
      .map((row) => ({
        key: row.department as string,
        count: row._count._all,
      })),
    byType: byType
      .filter((row) => row.ticketType)
      .map((row) => ({
        key: row.ticketType as string,
        count: row._count._all,
      })),
    history: [...historyMap.entries()].map(([key, count]) => ({ key, count })),
    recent,
    ai: {
      active: true,
      classifications: chatSource,
      suggestions: Math.min(chatSource, open),
      autoClassify: true,
      features: ["Classification", "Responses", "Sentiment", "Knowledge"],
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import type { ActivityType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";

const ACTIVITY_TYPES = new Set<string>([
  "PROJECT_CREATED",
  "PROJECT_UPDATED",
  "TASK_COMPLETED",
  "AGENT_STARTED",
  "AGENT_COMPLETED",
  "CLIENT_ADDED",
  "SCAN_COMPLETED",
  "PAYMENT_RECEIVED",
]);

export async function GET(req: NextRequest) {
  const { error } = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize") || "25") || 25),
  );
  const q = (searchParams.get("q") || "").trim();
  const typeParam = (searchParams.get("type") || "").trim().toUpperCase();
  const type =
    typeParam && ACTIVITY_TYPES.has(typeParam)
      ? (typeParam as ActivityType)
      : undefined;

  const where: Prisma.ActivityWhereInput = {
    ...(type ? { type } : {}),
    ...(q
      ? {
          OR: [
            { description: { contains: q } },
            { user: { name: { contains: q } } },
            { user: { email: { contains: q } } },
            { project: { name: { contains: q } } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.activity.count({ where }),
    prisma.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        type: true,
        description: true,
        metadata: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

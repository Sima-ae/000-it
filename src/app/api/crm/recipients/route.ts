import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { isStaffRole } from "@/lib/roles";

/** Recipients for CRM messaging */
export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  if (isStaffRole(session.user.role)) {
    const users = await prisma.user.findMany({
      where: { id: { not: session.user.id } },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
      take: 200,
    });
    return NextResponse.json(users);
  }

  const staff = await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN", "MANAGER"] } },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
    take: 50,
  });
  return NextResponse.json(staff);
}

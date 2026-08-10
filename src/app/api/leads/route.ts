import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";

export async function GET() {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const leads = await prisma.contactLead.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(leads);
}

export async function DELETE(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN"]);
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.contactLead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

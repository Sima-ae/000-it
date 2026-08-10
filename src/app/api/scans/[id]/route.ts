import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { canDelete } from "@/lib/roles";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const authResult = await requireRole(["SUPER_ADMIN"]);
  if (authResult.error) return authResult.error;
  if (!canDelete(authResult.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.aIScan.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.aIScan.delete({ where: { id } });
  return NextResponse.json({ ok: true, id });
}

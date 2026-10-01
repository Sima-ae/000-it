import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const notifications = await prisma.opsNotification.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unread = notifications.filter((n) => !n.readAt).length;
  return NextResponse.json({ notifications, unread });
}

export async function PATCH(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  if (body.all) {
    await prisma.opsNotification.updateMany({
      where: { userId: auth.session.user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const n = await prisma.opsNotification.findFirst({
    where: { id, userId: auth.session.user.id },
  });
  if (!n) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.opsNotification.update({
    where: { id },
    data: { readAt: new Date() },
  });
  return NextResponse.json(updated);
}

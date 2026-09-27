import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api-auth";
import { isStaffRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { listAllDomains } from "@/lib/domains/namecheap";
import { upsertOwnedDomain } from "@/lib/domains/owned";

export const dynamic = "force-dynamic";

export async function GET() {
  const authResult = await requireUser();
  if (authResult.error) return authResult.error;

  const staff = isStaffRole(authResult.session.user.role);
  const domains = await prisma.ownedDomain.findMany({
    where: staff ? undefined : { userId: authResult.session.user.id },
    orderBy: { domainName: "asc" },
    include: staff
      ? { user: { select: { id: true, name: true, email: true } } }
      : undefined,
  });

  return NextResponse.json(domains);
}

const patchSchema = z.object({
  domainName: z.string().min(3).max(253),
  autoRenewEnabled: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const authResult = await requireUser();
  if (authResult.error) return authResult.error;

  const body = patchSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const domain = body.data.domainName.toLowerCase();
  const owned = await prisma.ownedDomain.findUnique({
    where: { domainName: domain },
  });
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const staff = isStaffRole(authResult.session.user.role);
  if (!staff && owned.userId !== authResult.session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.ownedDomain.update({
    where: { id: owned.id },
    data: {
      ...(body.data.autoRenewEnabled !== undefined
        ? { autoRenewEnabled: body.data.autoRenewEnabled }
        : {}),
    },
  });

  return NextResponse.json(updated);
}

/** Pull registrar account domains into inventory (staff only — never reassign client ownership). */
export async function POST() {
  const authResult = await requireUser();
  if (authResult.error) return authResult.error;

  if (!isStaffRole(authResult.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Namecheap getList is capped at 100/page — pull every page.
  const listed = await listAllDomains();
  if (!listed.ok) {
    return NextResponse.json(
      { error: listed.error || "Sync failed" },
      { status: 502 },
    );
  }

  const userId = authResult.session.user.id;
  let upserted = 0;
  for (const d of listed.domains) {
    if (!d.domainName) continue;
    let expiresAt: Date | null = null;
    if (d.expires) {
      const parsed = new Date(d.expires);
      if (!Number.isNaN(parsed.getTime())) expiresAt = parsed;
    }

    // Trust getList fields for bulk sync (lock/privacy/expiry). Per-domain
    // getInfo would timeout once the account grows past ~100 domains.
    await upsertOwnedDomain({
      domainName: d.domainName,
      userId,
      status: d.isExpired ? "EXPIRED" : "ACTIVE",
      expiresAt,
      autoRenewEnabled: d.autoRenew ?? false,
      registrarLocked: d.isLocked ?? true,
      whoisGuardEnabled: d.whoisGuard ?? false,
      namecheapId: d.id || null,
    });
    upserted += 1;
  }

  return NextResponse.json({
    ok: true,
    upserted,
    totalFromRegistrar: listed.totalItems,
    pagesFetched: listed.pages,
  });
}

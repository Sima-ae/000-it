import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDomainAccess } from "@/lib/domains/access";
import { prisma } from "@/lib/prisma";
import {
  disableWhoisGuard,
  enableWhoisGuard,
  getWhoisGuardList,
} from "@/lib/domains/namecheap";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ domain: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { domain: raw } = await ctx.params;
  const domain = decodeURIComponent(raw);
  const access = await requireDomainAccess(domain);
  if (access.error) return access.error;

  const list = await getWhoisGuardList();
  if (!list.ok) {
    return NextResponse.json(
      { error: list.error || "Failed to load WhoisGuard" },
      { status: 502 },
    );
  }
  const item = list.items.find((i) => i.domainName === domain.toLowerCase());
  return NextResponse.json({
    ok: true,
    enabled: item?.enabled ?? access.owned?.whoisGuardEnabled ?? false,
    whoisGuardId: item?.id || null,
  });
}

const putSchema = z.object({ enabled: z.boolean() });

export async function PUT(request: Request, ctx: Ctx) {
  const { domain: raw } = await ctx.params;
  const domain = decodeURIComponent(raw);
  const access = await requireDomainAccess(domain);
  if (access.error) return access.error;

  const body = putSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const list = await getWhoisGuardList();
  if (!list.ok) {
    return NextResponse.json(
      { error: list.error || "WhoisGuard list failed" },
      { status: 502 },
    );
  }
  const item = list.items.find((i) => i.domainName === domain.toLowerCase());
  if (!item?.id) {
    return NextResponse.json(
      {
        error:
          "No WhoisGuard subscription found for this domain at Namecheap",
      },
      { status: 400 },
    );
  }

  const result = body.data.enabled
    ? await enableWhoisGuard(item.id)
    : await disableWhoisGuard(item.id);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "WhoisGuard update failed" },
      { status: 502 },
    );
  }

  if (access.owned) {
    await prisma.ownedDomain.update({
      where: { id: access.owned.id },
      data: {
        whoisGuardEnabled: body.data.enabled,
        lastSyncedAt: new Date(),
      },
    });
  }

  return NextResponse.json({ ok: true, enabled: body.data.enabled });
}

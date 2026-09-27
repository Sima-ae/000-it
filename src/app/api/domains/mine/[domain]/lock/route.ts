import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDomainAccess } from "@/lib/domains/access";
import { prisma } from "@/lib/prisma";
import {
  getRegistrarLock,
  setRegistrarLock,
} from "@/lib/domains/namecheap";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ domain: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { domain: raw } = await ctx.params;
  const domain = decodeURIComponent(raw);
  const access = await requireDomainAccess(domain);
  if (access.error) return access.error;

  const result = await getRegistrarLock(domain);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Failed to load lock" },
      { status: 502 },
    );
  }
  return NextResponse.json(result);
}

const putSchema = z.object({ locked: z.boolean() });

export async function PUT(request: Request, ctx: Ctx) {
  const { domain: raw } = await ctx.params;
  const domain = decodeURIComponent(raw);
  const access = await requireDomainAccess(domain);
  if (access.error) return access.error;

  const body = putSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await setRegistrarLock(domain, body.data.locked);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Failed to update lock" },
      { status: 502 },
    );
  }

  if (access.owned) {
    await prisma.ownedDomain.update({
      where: { id: access.owned.id },
      data: { registrarLocked: body.data.locked, lastSyncedAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true, locked: body.data.locked });
}

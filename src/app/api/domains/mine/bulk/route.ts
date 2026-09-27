import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api-auth";
import { isStaffRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import {
  getDomainInfo,
  setRegistrarLock,
  enableWhoisGuard,
  disableWhoisGuard,
  getWhoisGuardList,
} from "@/lib/domains/namecheap";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  domainNames: z.array(z.string().min(3).max(253)).min(1).max(50),
  action: z.enum(["lock", "unlock", "privacy_on", "privacy_off", "sync"]),
});

export async function POST(request: Request) {
  const authResult = await requireUser();
  if (authResult.error) return authResult.error;

  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const staff = isStaffRole(authResult.session.user.role);
  const results: Array<{ domain: string; ok: boolean; error?: string }> = [];

  let whoisList: Awaited<ReturnType<typeof getWhoisGuardList>> | null = null;
  if (
    body.data.action === "privacy_on" ||
    body.data.action === "privacy_off"
  ) {
    whoisList = await getWhoisGuardList();
  }

  for (const raw of body.data.domainNames) {
    const domain = raw.toLowerCase();
    const owned = await prisma.ownedDomain.findUnique({
      where: { domainName: domain },
    });
    if (!owned || (!staff && owned.userId !== authResult.session.user.id)) {
      results.push({ domain, ok: false, error: "Not found or forbidden" });
      continue;
    }

    try {
      if (body.data.action === "lock" || body.data.action === "unlock") {
        const lock = body.data.action === "lock";
        const r = await setRegistrarLock(domain, lock);
        if (!r.ok) {
          results.push({ domain, ok: false, error: r.error });
          continue;
        }
        await prisma.ownedDomain.update({
          where: { id: owned.id },
          data: { registrarLocked: lock, lastSyncedAt: new Date() },
        });
        results.push({ domain, ok: true });
      } else if (
        body.data.action === "privacy_on" ||
        body.data.action === "privacy_off"
      ) {
        const item = whoisList?.items.find((i) => i.domainName === domain);
        if (!item?.id) {
          results.push({
            domain,
            ok: false,
            error: "No WhoisGuard id",
          });
          continue;
        }
        const enable = body.data.action === "privacy_on";
        const r = enable
          ? await enableWhoisGuard(item.id)
          : await disableWhoisGuard(item.id);
        if (!r.ok) {
          results.push({ domain, ok: false, error: r.error });
          continue;
        }
        await prisma.ownedDomain.update({
          where: { id: owned.id },
          data: { whoisGuardEnabled: enable, lastSyncedAt: new Date() },
        });
        results.push({ domain, ok: true });
      } else {
        const info = await getDomainInfo(domain);
        if (!info.ok || !info.info) {
          results.push({ domain, ok: false, error: info.error });
          continue;
        }
        let expiresAt: Date | null = null;
        if (info.info.expires) {
          const d = new Date(info.info.expires);
          if (!Number.isNaN(d.getTime())) expiresAt = d;
        }
        await prisma.ownedDomain.update({
          where: { id: owned.id },
          data: {
            registrarLocked: info.info.isLocked ?? owned.registrarLocked,
            whoisGuardEnabled: info.info.whoisGuard ?? owned.whoisGuardEnabled,
            expiresAt,
            namecheapId: info.info.id || owned.namecheapId,
            lastSyncedAt: new Date(),
          },
        });
        results.push({ domain, ok: true });
      }
    } catch (error) {
      results.push({
        domain,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return NextResponse.json({ results });
}

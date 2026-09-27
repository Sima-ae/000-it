import { prisma } from "@/lib/prisma";
import type { OwnedDomainStatus } from "@prisma/client";

export async function upsertOwnedDomain(input: {
  domainName: string;
  userId: string;
  status?: OwnedDomainStatus;
  expiresAt?: Date | null;
  autoRenewEnabled?: boolean;
  registrarLocked?: boolean;
  whoisGuardEnabled?: boolean;
  namecheapId?: string | null;
  yearsAdded?: number;
}) {
  const domainName = input.domainName.toLowerCase().trim();
  const tld = domainName.split(".").pop() || "";
  const existing = await prisma.ownedDomain.findUnique({
    where: { domainName },
  });

  let expiresAt = input.expiresAt;
  if (expiresAt === undefined && input.yearsAdded && input.yearsAdded > 0) {
    const base =
      existing?.expiresAt && existing.expiresAt.getTime() > Date.now()
        ? existing.expiresAt
        : new Date();
    expiresAt = new Date(
      base.getTime() + input.yearsAdded * 365.25 * 24 * 60 * 60 * 1000,
    );
  }

  return prisma.ownedDomain.upsert({
    where: { domainName },
    create: {
      domainName,
      tld,
      userId: input.userId,
      status: input.status || "ACTIVE",
      expiresAt: expiresAt ?? null,
      autoRenewEnabled: input.autoRenewEnabled ?? false,
      registrarLocked: input.registrarLocked ?? true,
      whoisGuardEnabled: input.whoisGuardEnabled ?? false,
      namecheapId: input.namecheapId ?? null,
      lastSyncedAt: new Date(),
    },
    update: {
      // Never steal ownership on sync/update — only claim unassigned rows.
      ...(existing?.userId ? {} : { userId: input.userId }),
      ...(input.status ? { status: input.status } : {}),
      ...(expiresAt !== undefined ? { expiresAt } : {}),
      ...(input.autoRenewEnabled !== undefined
        ? { autoRenewEnabled: input.autoRenewEnabled }
        : {}),
      ...(input.registrarLocked !== undefined
        ? { registrarLocked: input.registrarLocked }
        : {}),
      ...(input.whoisGuardEnabled !== undefined
        ? { whoisGuardEnabled: input.whoisGuardEnabled }
        : {}),
      ...(input.namecheapId !== undefined
        ? { namecheapId: input.namecheapId }
        : {}),
      lastSyncedAt: new Date(),
    },
  });
}

export function splitDomain(domainName: string): {
  sld: string;
  tld: string;
} {
  const parts = domainName.toLowerCase().trim().split(".");
  if (parts.length < 2) return { sld: domainName, tld: "" };
  const tld = parts.slice(1).join(".");
  const sld = parts[0] || "";
  return { sld, tld };
}

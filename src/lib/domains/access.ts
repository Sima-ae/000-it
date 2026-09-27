import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { requireUser } from "@/lib/api-auth";
import { isStaffRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export async function requireDomainAccess(domainName: string): Promise<
  | {
      session: Session;
      owned: Awaited<ReturnType<typeof prisma.ownedDomain.findUnique>>;
      error?: undefined;
    }
  | { session?: undefined; owned?: undefined; error: NextResponse }
> {
  const authResult = await requireUser();
  if (authResult.error) return authResult;

  const domain = domainName.toLowerCase().trim();
  const owned = await prisma.ownedDomain.findUnique({
    where: { domainName: domain },
  });

  if (!owned) {
    return {
      error: NextResponse.json({ error: "Domain not found" }, { status: 404 }),
    };
  }

  const staff = isStaffRole(authResult.session.user.role);
  if (!staff && owned.userId !== authResult.session.user.id) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session: authResult.session, owned };
}

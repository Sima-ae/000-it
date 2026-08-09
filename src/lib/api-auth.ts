import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import type { Role } from "@prisma/client";

export async function requireUser(): Promise<
  | { session: Session; error?: undefined }
  | { session?: undefined; error: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}

export async function requireRole(roles: Role[]) {
  const result = await requireUser();
  if (result.error) return result;
  if (!roles.includes(result.session.user.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return result;
}

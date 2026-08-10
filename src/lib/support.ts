import { createHash, randomBytes } from "crypto";
import type { Role } from "@prisma/client";
import { isStaffRole } from "@/lib/roles";

export function newGuestToken() {
  return randomBytes(24).toString("hex");
}

export function hashGuestToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function ticketListWhere(role: Role | string, userId: string) {
  if (isStaffRole(role)) return {};
  return { userId };
}

export function canAccessTicket(opts: {
  role?: string | null;
  userId?: string | null;
  ticketUserId?: string | null;
  guestToken?: string | null;
  providedGuestToken?: string | null;
}) {
  if (isStaffRole(opts.role)) return true;
  if (opts.userId && opts.ticketUserId && opts.userId === opts.ticketUserId) return true;
  if (
    opts.guestToken &&
    opts.providedGuestToken &&
    opts.guestToken === opts.providedGuestToken
  ) {
    return true;
  }
  return false;
}

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { syncDomainPricesFromNamecheap } from "@/lib/domains/sync-prices";
import { syncDomainPricesFromRegery } from "@/lib/domains/sync-regery-prices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Sync both suppliers, keeping sources strictly isolated. */
export async function POST() {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  try {
    const namecheap = await syncDomainPricesFromNamecheap();
    let regery: Awaited<ReturnType<typeof syncDomainPricesFromRegery>> | {
      ok: false;
      error: string;
    };
    try {
      regery = await syncDomainPricesFromRegery();
    } catch (error) {
      regery = {
        ok: false,
        error: error instanceof Error ? error.message : "Regery sync failed",
      };
    }
    return NextResponse.json({
      ok: true,
      namecheap,
      regery,
    });
  } catch (error) {
    console.error("[domains/admin/sync]", error);
    const message =
      error instanceof Error ? error.message : "Sync failed";
    const status = message.includes("NAMECHEAP_NOT_CONFIGURED") ? 503 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

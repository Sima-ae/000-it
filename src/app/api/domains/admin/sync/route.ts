import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { syncDomainPricesFromNamecheap } from "@/lib/domains/sync-prices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST() {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  try {
    const result = await syncDomainPricesFromNamecheap();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[domains/admin/sync]", error);
    const message =
      error instanceof Error ? error.message : "Sync failed";
    const status = message.includes("NAMECHEAP_NOT_CONFIGURED") ? 503 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

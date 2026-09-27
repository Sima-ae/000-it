import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { syncDomainPricesFromNamecheap } from "@/lib/domains/sync-prices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function authorized(request: Request, isStaff: boolean) {
  const secret = (process.env.CRON_SECRET || "").trim();
  const url = new URL(request.url);
  const q = url.searchParams.get("secret") || "";
  const authHeader = request.headers.get("authorization") || "";
  const bearer = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";
  if (secret && (q === secret || bearer === secret)) return true;
  return isStaff;
}

async function handle(request: Request) {
  const session = await auth();
  const staff = Boolean(session?.user && isAdminRole(session.user.role));
  if (!authorized(request, staff)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncDomainPricesFromNamecheap();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[cron/domain-prices]", error);
    const message =
      error instanceof Error ? error.message : "Sync failed";
    const status = message.includes("NAMECHEAP_NOT_CONFIGURED") ? 503 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

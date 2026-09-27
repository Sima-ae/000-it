import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { syncDomainPricesFromRegery } from "@/lib/domains/sync-regery-prices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

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
    const result = await syncDomainPricesFromRegery();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[cron/domain-prices-regery]", error);
    const message =
      error instanceof Error ? error.message : "Regery sync failed";
    const status = message.startsWith("REGERY_") ? 503 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

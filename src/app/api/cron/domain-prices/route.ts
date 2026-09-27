import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { getRegisterPricing, isNamecheapConfigured } from "@/lib/domains/namecheap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

async function usdToEurRate(): Promise<number> {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`FX HTTP ${res.status}`);
    const data = (await res.json()) as { rates?: { EUR?: number } };
    if (data.rates?.EUR) return data.rates.EUR;
  } catch (error) {
    console.warn("[cron/domain-prices] FX fallback", error);
  }
  return 0.92;
}

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

  if (!isNamecheapConfigured()) {
    return NextResponse.json(
      {
        error:
          "NAMECHEAP_NOT_CONFIGURED — set NAMECHEAP_USER and NAMECHEAP_API_KEY, then restart the app",
      },
      { status: 503 },
    );
  }

  try {
    const rate = await usdToEurRate();
    const pricing = await getRegisterPricing();
    let updated = 0;

    for (const row of pricing) {
      const existing = await prisma.domainProduct.findUnique({
        where: { tld: row.tld },
      });
      if (!existing) continue;
      const basePriceInCents = Math.max(1, Math.round(row.priceUsd * rate * 100));
      await prisma.domainProduct.update({
        where: { tld: row.tld },
        data: { basePriceInCents },
      });
      updated += 1;
    }

    return NextResponse.json({
      ok: true,
      updated,
      exchangeRateUsed: rate,
      pricedTlds: pricing.length,
    });
  } catch (error) {
    console.error("[cron/domain-prices]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

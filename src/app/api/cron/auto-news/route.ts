import { NextResponse } from "next/server";
import { runAutoNewsPublish } from "@/lib/auto-news/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function handle(request: Request) {
  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";
  const limitRaw = Number(url.searchParams.get("limit") || "6");
  const limit = Number.isFinite(limitRaw) ? limitRaw : 6;

  try {
    const result = await runAutoNewsPublish({ force, limit });
    return NextResponse.json(result, {
      status: result.ok || result.skipped ? 200 : 500,
    });
  } catch (error) {
    console.error("[cron/auto-news]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Auto-news failed",
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

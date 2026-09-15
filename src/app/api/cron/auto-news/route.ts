import { NextResponse } from "next/server";
import { runAutoNewsPublish } from "@/lib/auto-news/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 800;

async function handle(request: Request) {
  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";
  const ignoreDailyCap = url.searchParams.get("ignoreDailyCap") === "1";
  const dateRaw = (url.searchParams.get("date") || "").trim();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : undefined;
  const limitRaw = Number(url.searchParams.get("limit") || "3");
  const limit = Number.isFinite(limitRaw) ? limitRaw : 3;

  try {
    const result = await runAutoNewsPublish({
      force,
      ignoreDailyCap,
      date,
      limit,
    });
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

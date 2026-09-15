import { NextResponse } from "next/server";
import { backfillMissingNewsCovers } from "@/lib/news-covers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 240;

const PROXY_SAFE_DEADLINE_MS = 180_000;

let running = false;

async function handle(request: Request) {
  const url = new URL(request.url);
  const deadlineRaw = Number(url.searchParams.get("deadlineMs") || String(PROXY_SAFE_DEADLINE_MS));
  const deadlineMs = Math.max(
    5_000,
    Math.min(Number.isFinite(deadlineRaw) ? deadlineRaw : PROXY_SAFE_DEADLINE_MS, PROXY_SAFE_DEADLINE_MS),
  );

  if (running) {
    return NextResponse.json({
      ok: true,
      written: 0,
      skipped: 1,
      remaining: 1,
      details: ["already running"],
    });
  }

  running = true;
  try {
    const result = await backfillMissingNewsCovers({ deadlineMs, download: true });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[cron/news-covers]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "News cover backfill failed",
      },
      { status: 500 },
    );
  } finally {
    running = false;
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

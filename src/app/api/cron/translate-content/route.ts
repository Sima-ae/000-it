import { NextResponse } from "next/server";
import { runContentTranslationBackfill } from "@/lib/content-i18n-backfill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 800;

/** LiteSpeed/CyberPanel Connection Timeout defaults to 300s and then returns HTTP 500. */
const PROXY_SAFE_DEADLINE_MS = 210_000;

let running = false;

async function handle(request: Request) {
  const url = new URL(request.url);
  const kindsRaw = url.searchParams.get("kinds") || "";
  const kinds = kindsRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is "news" | "kennisbank" | "pages" | "ui" | "slugs" =>
      s === "news" ||
      s === "kennisbank" ||
      s === "pages" ||
      s === "ui" ||
      s === "slugs",
    );
  const deadlineRaw = Number(url.searchParams.get("deadlineMs") || String(PROXY_SAFE_DEADLINE_MS));
  const requested = Number.isFinite(deadlineRaw) ? deadlineRaw : PROXY_SAFE_DEADLINE_MS;
  const deadlineMs = Math.max(5_000, Math.min(requested, PROXY_SAFE_DEADLINE_MS));

  if (running) {
    return NextResponse.json({
      ok: true,
      written: 0,
      skipped: 1,
      failed: 0,
      remaining: 1,
      details: ["already running"],
    });
  }

  running = true;
  try {
    const result = await runContentTranslationBackfill({
      deadlineMs,
      kinds: kinds.length ? kinds : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[cron/translate-content]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Translate backfill failed",
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

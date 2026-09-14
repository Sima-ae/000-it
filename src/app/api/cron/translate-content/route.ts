import { NextResponse } from "next/server";
import { runContentTranslationBackfill } from "@/lib/content-i18n-backfill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 800;

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
  const deadlineRaw = Number(url.searchParams.get("deadlineMs") || "420000");
  const deadlineMs = Number.isFinite(deadlineRaw) ? deadlineRaw : 420_000;

  try {
    const result = await runContentTranslationBackfill({
      deadlineMs,
      kinds: kinds.length ? kinds : undefined,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (error) {
    console.error("[cron/translate-content]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Translate backfill failed",
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

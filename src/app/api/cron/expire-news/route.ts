import { NextResponse } from "next/server";
import { expireNewsPastRetention } from "@/lib/news-retention";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle() {
  try {
    const result = await expireNewsPastRetention();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[cron/expire-news]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Expire news failed",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return handle();
}

export async function POST() {
  return handle();
}

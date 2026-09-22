import { NextResponse } from "next/server";
import { rewriteBoilerplateNewsPosts } from "@/lib/auto-news/rewrite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 800;

async function handle(request: Request) {
  const url = new URL(request.url);
  const limitRaw = Number(url.searchParams.get("limit") || "40");
  const limit = Number.isFinite(limitRaw) ? limitRaw : 40;
  const includeShort = url.searchParams.get("includeShort") !== "0";

  try {
    const result = await rewriteBoilerplateNewsPosts({ limit, includeShort });
    return NextResponse.json(result, {
      status: result.ok ? 200 : 500,
    });
  } catch (error) {
    console.error("[cron/rewrite-news]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Rewrite news failed",
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

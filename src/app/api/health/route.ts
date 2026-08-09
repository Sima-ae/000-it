import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbOk = await pingDatabase();
    return NextResponse.json(
      { ok: dbOk, db: dbOk ? "up" : "down", service: "000-it" },
      { status: dbOk ? 200 : 503 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    return NextResponse.json(
      { ok: false, db: "down", service: "000-it", error: message },
      { status: 503 },
    );
  }
}

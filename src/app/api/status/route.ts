import { NextResponse } from "next/server";
import { loadStatusPagePayload } from "@/lib/statuspage/hostinger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const payload = await loadStatusPagePayload();
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      Pragma: "no-cache",
    },
  });
}

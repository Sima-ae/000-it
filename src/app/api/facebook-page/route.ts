import { NextResponse } from "next/server";
import { fetchFacebookPageStats } from "@/lib/facebook-page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const stats = await fetchFacebookPageStats();
  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

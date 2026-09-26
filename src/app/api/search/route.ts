import { NextResponse } from "next/server";
import { isSameSiteRequest } from "@/lib/anti-scrape";
import { searchSite } from "@/lib/site-search";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isSameSiteRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const locale = (searchParams.get("locale") || "nl").slice(0, 12);

  const result = await searchSite(locale, q);
  return NextResponse.json(result);
}

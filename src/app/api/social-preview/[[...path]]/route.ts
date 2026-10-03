import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  rawPathFromPreviewRequest,
  renderSocialPreviewHtml,
  resolveSocialPreview,
} from "@/lib/social-preview";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Tiny HTML shell for WhatsApp / Messenger / Facebook crawlers.
 * WhatsApp only reads the first ~5KB; Next.js puts fonts/scripts before OG tags,
 * so bots otherwise miss og:image/title. This response is small, with OG first.
 *
 * The public path is a path segment (`/api/social-preview/en/statuspage`), not a
 * query string — the production proxy drops rewrite query params.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  const rawPath = rawPathFromPreviewRequest({
    segments: path,
    header: request.headers.get("x-social-path"),
    query: request.nextUrl.searchParams.get("u"),
  });
  const preview = await resolveSocialPreview(rawPath);
  const html = renderSocialPreviewHtml(preview);

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=120, s-maxage=600",
      Vary: "User-Agent, Host",
      "X-Robots-Tag": "noindex",
    },
  });
}

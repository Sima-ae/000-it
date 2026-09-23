import { createReadStream, existsSync, statSync } from "node:fs";
import { join, normalize } from "node:path";
import { NextResponse } from "next/server";
import { Readable } from "node:stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

/**
 * Serve upload files from disk on every request.
 * Avoids Next.js production public-folder cache missing files written after boot
 * (auto-news covers, portfolio uploads, etc.).
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await context.params;
  const rel = parts.map((p) => decodeURIComponent(p)).join("/");
  if (!rel || rel.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const abs = normalize(join(process.cwd(), "public", "uploads", rel));
  const root = normalize(join(process.cwd(), "public", "uploads"));
  if (!abs.startsWith(root) || !existsSync(abs) || !statSync(abs).isFile()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = abs.slice(abs.lastIndexOf(".")).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  const { size } = statSync(abs);
  const stream = createReadStream(abs);
  return new NextResponse(Readable.toWeb(stream) as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": type,
      "Content-Length": String(size),
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

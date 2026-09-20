import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ensureNewsCoverImage,
  localNewsCoverPath,
} from "@/lib/auto-news/cover-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const post = await prisma.newsPost.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      title: true,
      industry: true,
      excerpt: true,
      tags: true,
      coverImage: true,
    },
  });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Prefer cached file; download:true upgrades weak SVG fallbacks to Pollinations covers.
  const coverImage = await ensureNewsCoverImage(
    {
      id: post.id,
      title: post.title,
      industry: post.industry,
      excerpt: post.excerpt,
      tags: Array.isArray(post.tags) ? post.tags.map(String) : [],
    },
    { download: true, retries: 2, delayMs: 800 },
  );

  if (post.coverImage !== coverImage) {
    await prisma.newsPost.update({
      where: { id: post.id },
      data: { coverImage },
    });
  }

  const rel = localNewsCoverPath(post.id).replace(/^\//, "");
  const abs = join(process.cwd(), "public", rel);
  const body = await readFile(abs);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

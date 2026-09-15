import { prisma } from "@/lib/prisma";
import {
  ensureNewsCoverImage,
  isCustomRemoteCover,
  type NewsCoverInput,
} from "@/lib/auto-news/cover-image";

function asTags(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export async function backfillMissingNewsCovers(opts?: {
  deadlineMs?: number;
  download?: boolean;
  limit?: number;
}) {
  const deadline = Date.now() + (opts?.deadlineMs ?? 180_000);
  const download = opts?.download !== false;
  const posts = await prisma.newsPost.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      title: true,
      industry: true,
      tags: true,
      excerpt: true,
      coverImage: true,
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: Math.max(1, opts?.limit ?? 400),
  });

  let written = 0;
  let skipped = 0;
  let remaining = 0;

  for (const [index, post] of posts.entries()) {
    if (Date.now() > deadline) {
      remaining = posts.length - index;
      break;
    }
    if (isCustomRemoteCover(post.coverImage)) {
      skipped += 1;
      continue;
    }

    const input: NewsCoverInput = {
      id: post.id,
      title: post.title,
      industry: post.industry,
      tags: asTags(post.tags),
      excerpt: post.excerpt,
    };
    const coverImage = await ensureNewsCoverImage(input, {
      download,
      retries: 3,
      delayMs: 1200,
    });
    if (post.coverImage !== coverImage) {
      await prisma.newsPost.update({
        where: { id: post.id },
        data: { coverImage },
      });
      written += 1;
    } else {
      skipped += 1;
    }
  }

  return {
    ok: true,
    written,
    skipped,
    remaining,
    total: posts.length,
  };
}

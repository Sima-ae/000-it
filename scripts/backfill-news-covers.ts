/**
 * Assign unique title-based covers to every news post.
 * Uses deterministic Pollinations URLs (unique per post id + title).
 * Optionally downloads local caches with --download.
 *
 *   npm run news:covers
 *   npm run news:covers -- --download
 */
import { prisma } from "../src/lib/prisma";
import {
  buildNewsCoverRemoteUrl,
  ensureNewsCoverImage,
} from "../src/lib/auto-news/cover-image";

async function main() {
  const download = process.argv.includes("--download");
  const force = process.argv.includes("--force");

  const posts = await prisma.newsPost.findMany({
    select: {
      id: true,
      title: true,
      industry: true,
      tags: true,
      excerpt: true,
      coverImage: true,
    },
    orderBy: [{ date: "asc" }, { id: "asc" }],
  });

  console.log(
    `Assigning unique covers for ${posts.length} posts (${download ? "download+cache" : "remote unique URLs"})…`,
  );

  let updated = 0;
  for (const [index, post] of posts.entries()) {
    const tags = Array.isArray(post.tags) ? post.tags.map(String) : [];
    const input = {
      id: post.id,
      title: post.title,
      industry: post.industry,
      tags,
      excerpt: post.excerpt,
    };

    const coverImage = download
      ? await ensureNewsCoverImage(input, { force, download: true })
      : buildNewsCoverRemoteUrl(input);

    if (post.coverImage !== coverImage) {
      await prisma.newsPost.update({
        where: { id: post.id },
        data: { coverImage },
      });
      updated += 1;
    }

    console.log(`[${index + 1}/${posts.length}] ${post.id}`);
  }

  const covers = await prisma.newsPost.findMany({ select: { id: true, coverImage: true } });
  const unique = new Set(covers.map((c) => c.coverImage || ""));
  const dups = covers.length - unique.size;
  console.log(JSON.stringify({ posts: covers.length, updated, uniqueCovers: unique.size, duplicateSlots: dups }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Assign unique covers to every news post and cache them under public/uploads/nieuws.
 *
 *   npm run news:covers
 *   npm run news:covers -- --force
 *   npm run news:covers -- --remote-only   (DB URLs only, not recommended)
 */
import { prisma } from "../src/lib/prisma";
import {
  buildNewsCoverRemoteUrl,
  ensureNewsCoverImage,
  localNewsCoverPath,
} from "../src/lib/auto-news/cover-image";

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const force = process.argv.includes("--force");
  const remoteOnly = process.argv.includes("--remote-only");

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
    orderBy: [{ date: "asc" }, { id: "asc" }],
  });

  console.log(
    `Assigning unique covers for ${posts.length} posts (${remoteOnly ? "remote URLs" : "local cache"})…`,
  );

  let updated = 0;
  let local = 0;
  for (const [index, post] of posts.entries()) {
    const tags = Array.isArray(post.tags) ? post.tags.map(String) : [];
    const input = {
      id: post.id,
      title: post.title,
      industry: post.industry,
      tags,
      excerpt: post.excerpt,
    };

    const coverImage = remoteOnly
      ? buildNewsCoverRemoteUrl(input)
      : await ensureNewsCoverImage(input, {
          force,
          download: true,
          retries: 5,
          delayMs: 2000,
        });

    if (coverImage.startsWith("/uploads/")) local += 1;

    if (post.coverImage !== coverImage) {
      await prisma.newsPost.update({
        where: { id: post.id },
        data: { coverImage },
      });
      updated += 1;
    }

    console.log(`[${index + 1}/${posts.length}] ${post.id} → ${coverImage}`);

    // Pace Pollinations to avoid 429 when downloading many covers.
    if (!remoteOnly) await sleep(1200);
  }

  const covers = await prisma.newsPost.findMany({ select: { id: true, coverImage: true } });
  const unique = new Set(covers.map((c) => c.coverImage || ""));
  const remoteLeft = covers.filter((c) => (c.coverImage || "").includes("pollinations")).length;
  console.log(
    JSON.stringify(
      {
        posts: covers.length,
        updated,
        local,
        uniqueCovers: unique.size,
        remoteLeft,
        expectedLocal: localNewsCoverPath("example"),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

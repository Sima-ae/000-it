/**
 * Repair auto-news posts that still contain raw arXiv/feed metadata
 * and (re)generate missing cover images from title + industry.
 *
 *   npm run news:repair
 *   npm run news:repair -- --force-covers
 */
import { prisma } from "../src/lib/prisma";
import { ensureNewsCoverImage } from "../src/lib/auto-news/cover-image";
import {
  cleanSourceSummary,
  generateBilingualNewsDraft,
  looksLikeRawFeedCopy,
} from "../src/lib/auto-news/generate";

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const forceCovers = process.argv.includes("--force-covers");

  const posts = await prisma.newsPost.findMany({
    where: {
      id: { startsWith: "auto-" },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 60,
  });

  console.log(`Checking ${posts.length} auto-news posts…`);

  let textFixed = 0;
  let coversFixed = 0;

  for (const [index, post] of posts.entries()) {
    const tags = Array.isArray(post.tags) ? post.tags.map(String) : [];
    const needsText =
      looksLikeRawFeedCopy(post.excerpt) ||
      looksLikeRawFeedCopy(post.excerptNl || "") ||
      looksLikeRawFeedCopy(post.description) ||
      looksLikeRawFeedCopy(post.descriptionNl || "");

    if (needsText) {
      try {
        const story = {
          title: post.title,
          url: post.projectUrl || `https://000-it.com/nieuws/${post.id}`,
          summary: cleanSourceSummary(
            // Prefer body without takeaway/lead if possible — fall back to full description
            post.description.replace(/^[\s\S]*?\n\n/, "").slice(0, 1200) ||
              post.excerpt,
          ),
          publishedAt: post.date,
          sourceId: tags.includes("arxiv-ai") ? "arxiv-ai" : "repair",
          sourceName: tags.includes("arxiv-ai") ? "arXiv cs.AI" : "AI News",
        };

        // If cleaning alone is enough, rebuild from cleaned excerpt/description without translate churn
        const cleanedExcerpt = cleanSourceSummary(post.excerpt);
        const cleanedDesc = cleanSourceSummary(post.description);
        const cleanedExcerptNl = cleanSourceSummary(post.excerptNl || "");
        const cleanedDescNl = cleanSourceSummary(post.descriptionNl || "");

        const stillBad =
          looksLikeRawFeedCopy(cleanedExcerpt) ||
          looksLikeRawFeedCopy(cleanedDesc) ||
          cleanedExcerpt.length < 40;

        if (stillBad && story.summary.length > 40) {
          const draft = await generateBilingualNewsDraft(story);
          await prisma.newsPost.update({
            where: { id: post.id },
            data: {
              excerpt: draft.excerpt,
              excerptNl: draft.excerptNl,
              description: draft.description,
              descriptionNl: draft.descriptionNl,
              industry: draft.industry || post.industry,
            },
          });
        } else {
          await prisma.newsPost.update({
            where: { id: post.id },
            data: {
              excerpt: cleanedExcerpt || post.excerpt,
              excerptNl: cleanedExcerptNl || post.excerptNl,
              description: cleanedDesc || post.description,
              descriptionNl: cleanedDescNl || post.descriptionNl,
            },
          });
        }
        textFixed += 1;
        console.log(`[${index + 1}] text fixed: ${post.id}`);
      } catch (error) {
        console.warn(
          `[${index + 1}] text repair failed: ${post.id}`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    const coverInput = {
      id: post.id,
      title: post.title,
      industry: post.industry,
      tags,
      excerpt: post.excerpt,
    };

    try {
      const coverImage = await ensureNewsCoverImage(coverInput, {
        force: forceCovers || !post.coverImage,
        download: true,
        retries: 4,
        delayMs: 1500,
      });
      if (post.coverImage !== coverImage) {
        await prisma.newsPost.update({
          where: { id: post.id },
          data: { coverImage },
        });
        coversFixed += 1;
        console.log(`[${index + 1}] cover fixed: ${post.id} → ${coverImage}`);
      } else if (forceCovers) {
        coversFixed += 1;
        console.log(`[${index + 1}] cover refreshed: ${post.id}`);
      }
    } catch (error) {
      console.warn(
        `[${index + 1}] cover failed: ${post.id}`,
        error instanceof Error ? error.message : error,
      );
    }

    await sleep(800);
  }

  console.log(
    JSON.stringify({ checked: posts.length, textFixed, coversFixed }, null, 2),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

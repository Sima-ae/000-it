/**
 * Repair auto-news posts that still contain raw arXiv/feed metadata
 * and (re)generate missing cover images from title + industry.
 *
 *   npm run news:repair
 *   npm run news:repair -- --force-covers
 *   npm run news:repair -- --takeaways
 *     → remove long "TripleZero iT takeaway…" / short source-check footers from descriptions
 *   npm run news:repair -- --closings
 *     → replace awkward “full timeline” closings with natural “full article” lines (+ all locales)
 *   npm run news:repair -- --truncations
 *     → remove “[…]” mid-sentence feed cuts so paragraphs end on a full stop
 *   npm run news:repair -- --rewrite-copy
 *     → rebuild bodies that still contain the shared boilerplate sentence
 *   npm run news:repair -- --rewrite-copy --limit=80
 *   npm run news:repair -- --takeaways --limit=100
 *   npm run news:repair -- --closings --limit=300
 *   npm run news:repair -- --truncations --limit=500
 */
import { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { ensureNewsCoverImage } from "../src/lib/auto-news/cover-image";
import {
  cleanSourceSummary,
  generateBilingualNewsDraft,
  looksLikeRawFeedCopy,
} from "../src/lib/auto-news/generate";
import { rewriteBoilerplateNewsPosts, repairAwkwardNewsClosings, repairTruncatedNewsBodies } from "../src/lib/auto-news/rewrite";
import {
  parseNewsTranslations,
  type NewsTranslationsMap,
} from "../src/lib/news-i18n";

const FOOTER_RE =
  /triplezero\s*it\s*takeaway|always check the original source|controleer altijd de originele bron|controlla sempre la fonte originale|ελ[εέ]γχετε πάντα|v[eé]rifiez toujours la source|pr[uü]fen sie immer|comprueba siempre la fuente|verifique sempre a fonte|siempre la fuente original/i;

function argFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

function argValue(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function stripFooter(text: string): string {
  const parts = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => !FOOTER_RE.test(p));
  return parts.join("\n\n").trim();
}

function needsFooterStrip(text: string | null | undefined) {
  if (!text) return false;
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .some((p) => FOOTER_RE.test(p));
}

async function repairTakeaways(limit: number) {
  const posts = await prisma.newsPost.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  console.log(`[takeaways] checking ${posts.length} posts…`);

  let fixed = 0;
  let skipped = 0;

  for (const [index, post] of posts.entries()) {
    const translations = parseNewsTranslations(post.translations);
    const needs =
      needsFooterStrip(post.description) ||
      needsFooterStrip(post.descriptionNl) ||
      Object.values(translations).some((copy) => needsFooterStrip(copy.description));

    if (!needs) {
      skipped += 1;
      continue;
    }

    const description = stripFooter(post.description);
    const descriptionNl = post.descriptionNl
      ? stripFooter(post.descriptionNl)
      : post.descriptionNl;

    const nextTranslations: NewsTranslationsMap = { ...translations };
    for (const [locale, copy] of Object.entries(translations)) {
      if (!needsFooterStrip(copy.description)) continue;
      nextTranslations[locale] = {
        ...copy,
        description: stripFooter(copy.description),
      };
    }
    if (descriptionNl && nextTranslations.nl) {
      nextTranslations.nl = {
        ...nextTranslations.nl,
        description: descriptionNl,
      };
    }

    await prisma.newsPost.update({
      where: { id: post.id },
      data: {
        description,
        descriptionNl,
        translations: nextTranslations as Prisma.InputJsonValue,
      },
    });
    fixed += 1;
    console.log(`[takeaways ${index + 1}/${posts.length}] fixed ${post.id}`);
  }

  console.log(JSON.stringify({ checked: posts.length, fixed, skipped }, null, 2));
}

async function main() {
  const forceCovers = argFlag("force-covers");
  const takeawaysOnly = argFlag("takeaways");
  const rewriteCopy = argFlag("rewrite-copy");
  const closingsOnly = argFlag("closings");
  const truncationsOnly = argFlag("truncations");
  const limit = Math.max(1, Number(argValue("limit") || "500") || 500);

  if (takeawaysOnly) {
    await repairTakeaways(limit);
    return;
  }

  if (closingsOnly) {
    const result = await repairAwkwardNewsClosings({ limit });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
    return;
  }

  if (truncationsOnly) {
    const result = await repairTruncatedNewsBodies({ limit });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
    return;
  }

  if (rewriteCopy) {
    const result = await rewriteBoilerplateNewsPosts({
      limit: Math.min(limit, 200),
      includeShort: true,
    });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
    return;
  }

  const posts = await prisma.newsPost.findMany({
    where: {
      id: { startsWith: "auto-" },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
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

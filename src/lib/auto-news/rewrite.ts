import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AUTO_NEWS_FEEDS } from "@/lib/auto-news/config";
import { findStoryByUrl, type NewsStory } from "@/lib/auto-news/fetch-stories";
import {
  cleanSourceSummary,
  generateBilingualNewsDraft,
  looksLikeBoilerplateCopy,
  looksLikeRawFeedCopy,
  sanitizeNewsDraft,
  stripBoilerplateCopy,
  buildClosingEn,
  buildClosingNl,
  formatPublishedDate,
  finishTruncatedCopy,
  isOutdatedClosingParagraph,
  setLastParagraph,
  sliceAtSentence,
} from "@/lib/auto-news/generate";
import type { NewsTranslationsMap } from "@/lib/news-i18n";
import { parseNewsTranslations } from "@/lib/news-i18n";
import { completeNewsTranslations } from "@/lib/news";
import { translateText } from "@/lib/google-translate";
import { routing } from "@/i18n/routing";

export type RewriteNewsOptions = {
  limit?: number;
  /** Also rewrite posts that are merely very short / repetitive with the lead. */
  includeShort?: boolean;
};

export type RewriteNewsResult = {
  ok: boolean;
  checked: number;
  rewritten: number;
  skipped: number;
  errors: string[];
};

const HOST_MATCHERS: Array<{ test: RegExp; id: string; name: string }> = [
  { test: /techcrunch/i, id: "techcrunch-ai", name: "TechCrunch AI" },
  { test: /theverge/i, id: "theverge-ai", name: "The Verge AI" },
  { test: /openai\.com/i, id: "openai", name: "OpenAI" },
  { test: /blog\.google/i, id: "google-ai", name: "Google AI Blog" },
  { test: /deepmind/i, id: "deepmind", name: "Google DeepMind" },
  { test: /anthropic/i, id: "anthropic", name: "Anthropic" },
  { test: /marktechpost/i, id: "marktechpost", name: "MarkTechPost" },
  { test: /artificialintelligence-news/i, id: "ai-news", name: "AI News" },
  { test: /technologyreview/i, id: "mit-tr-ai", name: "MIT Technology Review" },
  { test: /nvidia/i, id: "nvidia", name: "NVIDIA Technical Blog" },
  { test: /huggingface/i, id: "huggingface", name: "Hugging Face Blog" },
  { test: /microsoft\.com|azure\.microsoft/i, id: "azure", name: "Azure Blog" },
  { test: /lastweekin\.ai/i, id: "lastweekinai", name: "Last Week in AI" },
  { test: /wired\.com/i, id: "wired-ai", name: "Wired AI" },
];

function inferSourceFromPost(input: {
  projectUrl: string | null;
  tags: string[];
  description: string;
  descriptionNl: string | null;
}): { sourceId: string; sourceName: string } {
  for (const m of HOST_MATCHERS) {
    if (input.projectUrl && m.test.test(input.projectUrl)) {
      return { sourceId: m.id, sourceName: m.name };
    }
  }

  // Lead line: "TechCrunch AI published…" / "The Verge AI publiceerde…"
  const lead = `${input.descriptionNl || ""}\n${input.description}`.match(
    /^([A-Z][A-Za-z0-9 ./+-]{2,40}?)\s+(?:published|publiceerde|reports|reported|covered|highlighted)/m,
  );
  if (lead?.[1]) {
    const name = lead[1].trim();
    const known = AUTO_NEWS_FEEDS.find(
      (f) =>
        f.name.toLowerCase() === name.toLowerCase() ||
        name.toLowerCase().startsWith(f.name.toLowerCase()) ||
        f.name.toLowerCase().startsWith(name.toLowerCase()),
    );
    if (known) return { sourceId: known.id, sourceName: known.name };
    return { sourceId: "press", sourceName: name };
  }

  for (const feed of AUTO_NEWS_FEEDS) {
    const brand = feed.name.split(" ")[0];
    if (input.tags.some((t) => t.toLowerCase() === brand.toLowerCase())) {
      return { sourceId: feed.id, sourceName: feed.name };
    }
  }

  return { sourceId: "ai-press", sourceName: "AI industry press" };
}

/** Drop old lead + boilerplate so remaining text can seed a fresh draft. */
export function extractSummaryFromStoredDescription(description: string) {
  const text = stripBoilerplateCopy(cleanSourceSummary(description || ""));
  const paras = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => {
      if (
        /^(?:on\s+\d|new ai research|according to|fresh from|full details remain|for primary sourcing|readers who need|readers can open the full|you can read the full|the full article is available|a closer look at why|what builders)/i.test(
          p,
        )
      ) {
        return false;
      }
      if (
        /^(?:lezers die de volledige|lezers kunnen het volledige artikel|voor primaire bronnen|volledige details blijven)/i.test(
          p,
        )
      ) {
        return false;
      }
      if (
        /\b(published an update|publiceerde op|reports a notable|reported new developments|published a briefing|highlighted movement|flagged an ai)\b/i.test(
          p,
        )
      ) {
        return false;
      }
      if (
        /\b(for teams shipping|model watchers will|automation-heavy teams|creative and product teams|design and marketing|hardware-adjacent|security and platform|infrastructure and finance|industry shifts like this|the findings matter|if the approach holds|readers tracking research)\b/i.test(
          p,
        )
      ) {
        return false;
      }
      return p.length > 40;
    });

  return sliceAtSentence(cleanSourceSummary(paras.join("\n\n")), 2800);
}

function needsRewrite(
  post: {
    excerpt: string;
    excerptNl: string | null;
    description: string;
    descriptionNl: string | null;
  },
  includeShort: boolean,
) {
  const texts = [
    post.excerpt,
    post.excerptNl || "",
    post.description,
    post.descriptionNl || "",
  ];
  if (texts.some((t) => looksLikeBoilerplateCopy(t) || looksLikeRawFeedCopy(t))) {
    return true;
  }
  if (!includeShort) return false;

  const paras = (post.descriptionNl || post.description || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paras.length <= 2 && (post.description || "").length < 700) return true;

  const excerpt = (post.excerptNl || post.excerpt || "").trim();
  if (
    excerpt &&
    (post.descriptionNl || post.description || "").includes(excerpt) &&
    paras.length <= 3
  ) {
    return true;
  }
  return false;
}

async function buildStoryForPost(post: {
  id: string;
  title: string;
  projectUrl: string | null;
  date: string;
  tags: unknown;
  description: string;
  descriptionNl: string | null;
  excerpt: string;
}): Promise<NewsStory> {
  const tags = Array.isArray(post.tags) ? post.tags.map(String) : [];
  const inferred = inferSourceFromPost({
    projectUrl: post.projectUrl,
    tags,
    description: post.description,
    descriptionNl: post.descriptionNl,
  });

  if (post.projectUrl) {
    const live = await findStoryByUrl(post.projectUrl);
    if (live && live.summary.length >= 40) {
      return {
        ...live,
        title: post.title || live.title,
        sourceId: live.sourceId || inferred.sourceId,
        sourceName: live.sourceName || inferred.sourceName,
      };
    }
  }

  const summary =
    extractSummaryFromStoredDescription(post.description) ||
    extractSummaryFromStoredDescription(post.descriptionNl || "") ||
    cleanSourceSummary(post.excerpt);

  return {
    title: post.title,
    url: post.projectUrl || `https://000-it.com/nieuws/${post.id}`,
    summary,
    publishedAt: post.date,
    sourceId: inferred.sourceId,
    sourceName: inferred.sourceName,
  };
}

/**
 * Rebuild auto-news copy that still contains the old shared boilerplate sentence
 * (or other thin/repetitive templates).
 */
export async function rewriteBoilerplateNewsPosts(
  options: RewriteNewsOptions = {},
): Promise<RewriteNewsResult> {
  const limit = Math.min(Math.max(options.limit ?? 40, 1), 200);
  const includeShort = options.includeShort !== false;
  const result: RewriteNewsResult = {
    ok: true,
    checked: 0,
    rewritten: 0,
    skipped: 0,
    errors: [],
  };

  const posts = await prisma.newsPost.findMany({
    where: {
      deletedAt: null,
      id: { startsWith: "auto-" },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: Math.max(limit * 4, limit),
  });

  for (const post of posts) {
    if (result.rewritten >= limit) break;
    result.checked += 1;

    if (!needsRewrite(post, includeShort)) {
      result.skipped += 1;
      continue;
    }

    try {
      const story = await buildStoryForPost(post);
      if (!story.summary || story.summary.length < 40) {
        result.errors.push(`${post.id}: summary too short to rewrite`);
        continue;
      }

      const draft = sanitizeNewsDraft(await generateBilingualNewsDraft(story));
      if (
        looksLikeBoilerplateCopy(draft.description) ||
        looksLikeBoilerplateCopy(draft.descriptionNl) ||
        looksLikeRawFeedCopy(draft.description)
      ) {
        result.errors.push(`${post.id}: rewrite still unclean`);
        continue;
      }

      const translations: NewsTranslationsMap = {};
      if (draft.titleNl && draft.excerptNl && draft.descriptionNl) {
        translations.nl = {
          title: draft.titleNl,
          excerpt: draft.excerptNl,
          description: draft.descriptionNl,
        };
      }

      const existingTags = Array.isArray(post.tags) ? post.tags.map(String) : [];
      await prisma.newsPost.update({
        where: { id: post.id },
        data: {
          // Keep original titles — only refresh body copy.
          excerpt: draft.excerpt,
          excerptNl: draft.excerptNl || null,
          description: draft.description,
          descriptionNl: draft.descriptionNl || null,
          industry: draft.industry || post.industry,
          tags: Array.from(new Set([...existingTags, ...draft.tags])).slice(0, 8),
          translations: translations as Prisma.InputJsonValue,
        },
      });

      try {
        await completeNewsTranslations(post.id, { deadlineMs: 45_000 });
      } catch (error) {
        console.warn(
          "[rewrite-news] translate fill deferred",
          post.id,
          error instanceof Error ? error.message : error,
        );
      }

      result.rewritten += 1;
      console.log(`[rewrite-news] rewrote ${post.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push(`${post.id}: ${message}`);
      console.warn("[rewrite-news] failed", post.id, message);
    }
  }

  if (result.errors.length && !result.rewritten) result.ok = false;
  return result;
}

function lastParagraph(text: string | null | undefined) {
  const parts = (text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts[parts.length - 1] || "";
}

function looksLikeClosingParagraph(text: string) {
  const t = (text || "").trim();
  if (!t) return false;
  return (
    isOutdatedClosingParagraph(t) ||
    /bekijken via de onderstaande link\.?$/i.test(t) ||
    /via the link below\.?$/i.test(t) ||
    /volledige artikel/i.test(t) ||
    /full article/i.test(t)
  );
}

function needsClosingRepair(post: {
  description: string;
  descriptionNl: string | null;
  translations: unknown;
  expectedEn: string;
  expectedNl: string;
}) {
  const lastEn = lastParagraph(post.description);
  const lastNl = lastParagraph(post.descriptionNl);
  if (lastEn === post.expectedEn && lastNl === post.expectedNl) {
    // EN+NL already exact; still repair if a translated locale still has an old closer.
    const map = parseNewsTranslations(post.translations);
    return Object.entries(map).some(([locale, copy]) => {
      if (locale === "en" || locale === "nl") return false;
      return isOutdatedClosingParagraph(lastParagraph(copy.description));
    });
  }
  return looksLikeClosingParagraph(lastEn) || looksLikeClosingParagraph(lastNl);
}

/**
 * Replace awkward / intermediate closings with:
 * EN: "Readers can view the full article written by: {source} as of {date} via the link below."
 * NL: "Lezers kunnen het volledige artikel geschreven door: {source} vanaf {date} bekijken via de onderstaande link."
 * then re-translate the closer for every other locale.
 */
export async function repairAwkwardNewsClosings(
  options: RewriteNewsOptions = {},
): Promise<RewriteNewsResult> {
  const limit = Math.min(Math.max(options.limit ?? 250, 1), 500);
  const result: RewriteNewsResult = {
    ok: true,
    checked: 0,
    rewritten: 0,
    skipped: 0,
    errors: [],
  };

  const posts = await prisma.newsPost.findMany({
    where: {
      deletedAt: null,
      id: { startsWith: "auto-" },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  for (const post of posts) {
    result.checked += 1;

    try {
      const tags = Array.isArray(post.tags) ? post.tags.map(String) : [];
      const inferred = inferSourceFromPost({
        projectUrl: post.projectUrl,
        tags,
        description: post.description,
        descriptionNl: post.descriptionNl,
      });
      const publishedEn = formatPublishedDate(post.date, "en-GB");
      const publishedNl = formatPublishedDate(post.date, "nl-NL");
      const closingEn = buildClosingEn(inferred.sourceName, publishedEn);
      const closingNl = buildClosingNl(inferred.sourceName, publishedNl);

      if (
        !needsClosingRepair({
          description: post.description,
          descriptionNl: post.descriptionNl,
          translations: post.translations,
          expectedEn: closingEn,
          expectedNl: closingNl,
        })
      ) {
        result.skipped += 1;
        continue;
      }

      const description = setLastParagraph(post.description, closingEn);
      const descriptionNl = setLastParagraph(post.descriptionNl || "", closingNl);

      const translations = parseNewsTranslations(post.translations);
      translations.nl = {
        title: translations.nl?.title || post.titleNl || post.title,
        excerpt: translations.nl?.excerpt || post.excerptNl || post.excerpt,
        description: descriptionNl,
      };

      for (const locale of routing.locales) {
        if (locale === "en" || locale === "nl") continue;
        const copy = translations[locale];
        if (!copy?.description?.trim()) continue;
        const translated = await translateText(closingEn, locale, "en");
        const nextClosing =
          translated && translated.trim() && translated !== closingEn
            ? translated.trim()
            : closingEn;
        translations[locale] = {
          ...copy,
          description: setLastParagraph(copy.description, nextClosing),
        };
      }

      await prisma.newsPost.update({
        where: { id: post.id },
        data: {
          description,
          descriptionNl,
          translations: translations as Prisma.InputJsonValue,
        },
      });

      result.rewritten += 1;
      console.log(`[repair-closings] fixed ${post.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push(`${post.id}: ${message}`);
      console.warn("[repair-closings] failed", post.id, message);
    }
  }

  if (result.errors.length && !result.rewritten) result.ok = false;
  return result;
}

const TRUNCATION_RE = /\[\s*(?:\.{2,}|…)\s*\]/;

function hasTruncationMarker(text: string | null | undefined) {
  return TRUNCATION_RE.test(text || "");
}

/**
 * Remove "[…]" / "[...]" mid-sentence cuts from stored descriptions (all locales).
 * Keeps the last complete sentence instead of leaving a dangling ellipsis.
 */
export async function repairTruncatedNewsBodies(
  options: RewriteNewsOptions = {},
): Promise<RewriteNewsResult> {
  const limit = Math.min(Math.max(options.limit ?? 500, 1), 1000);
  const result: RewriteNewsResult = {
    ok: true,
    checked: 0,
    rewritten: 0,
    skipped: 0,
    errors: [],
  };

  const posts = await prisma.newsPost.findMany({
    where: {
      deletedAt: null,
      id: { startsWith: "auto-" },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  for (const post of posts) {
    result.checked += 1;
    const translations = parseNewsTranslations(post.translations);
    const needs =
      hasTruncationMarker(post.description) ||
      hasTruncationMarker(post.descriptionNl) ||
      Object.values(translations).some((copy) =>
        hasTruncationMarker(copy.description),
      );

    if (!needs) {
      result.skipped += 1;
      continue;
    }

    try {
      const description = finishTruncatedCopy(post.description);
      const descriptionNl = finishTruncatedCopy(post.descriptionNl || "");
      const nextTranslations: NewsTranslationsMap = { ...translations };

      if (nextTranslations.nl) {
        nextTranslations.nl = {
          ...nextTranslations.nl,
          description: finishTruncatedCopy(nextTranslations.nl.description),
        };
      } else if (descriptionNl) {
        nextTranslations.nl = {
          title: post.titleNl || post.title,
          excerpt: post.excerptNl || post.excerpt,
          description: descriptionNl,
        };
      }

      for (const [locale, copy] of Object.entries(nextTranslations)) {
        if (locale === "nl" || !copy?.description) continue;
        nextTranslations[locale] = {
          ...copy,
          description: finishTruncatedCopy(copy.description),
        };
      }

      await prisma.newsPost.update({
        where: { id: post.id },
        data: {
          description,
          descriptionNl: descriptionNl || null,
          translations: nextTranslations as Prisma.InputJsonValue,
        },
      });

      result.rewritten += 1;
      console.log(`[repair-truncations] fixed ${post.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push(`${post.id}: ${message}`);
      console.warn("[repair-truncations] failed", post.id, message);
    }
  }

  if (result.errors.length && !result.rewritten) result.ok = false;
  return result;
}

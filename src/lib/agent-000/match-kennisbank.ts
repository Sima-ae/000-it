import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  normalizeAgentText,
  tokenizeAgentText,
  tokenHitScore,
} from "@/lib/agent-000/text";

export type KennisbankMatch = {
  slug: string;
  title: string;
  categorySlug: string;
  topic: string;
  confidence: number;
};

type CatalogArticle = {
  slug: string;
  title: string;
  categories: string[];
  topic: string;
};

type Catalog = {
  categories: Array<[string, string, string]>;
  articles: CatalogArticle[];
};

let cached: Catalog | null = null;

function loadCatalog(): Catalog {
  if (cached) return cached;
  const path = join(process.cwd(), "prisma/kennisbank/catalog.json");
  cached = JSON.parse(readFileSync(path, "utf8")) as Catalog;
  return cached;
}

function scoreArticle(queryTokens: string[], article: CatalogArticle): number {
  if (!queryTokens.length) return 0;
  const titleNorm = normalizeAgentText(article.title);
  const topicNorm = normalizeAgentText(article.topic.replace(/-/g, " "));
  const slugNorm = normalizeAgentText(article.slug.replace(/-/g, " "));
  const catsNorm = normalizeAgentText(article.categories.join(" "));
  const titleTok = new Set(tokenizeAgentText(article.title));
  const topicTok = new Set(tokenizeAgentText(article.topic.replace(/-/g, " ")));
  const slugTok = new Set(tokenizeAgentText(article.slug.replace(/-/g, " ")));

  let score = 0;
  const joined = queryTokens.join(" ");
  if (joined.length > 5 && titleNorm.includes(joined)) score += 0.5;
  else if (joined.length > 5 && slugNorm.includes(joined)) score += 0.35;

  for (const t of queryTokens) {
    score += tokenHitScore(t, titleTok, titleNorm) * 1.2;
    score += tokenHitScore(t, topicTok, topicNorm) * 0.9;
    score += tokenHitScore(t, slugTok, slugNorm) * 0.7;
    if (catsNorm.includes(t)) score += 0.25;
  }

  return Math.min(1, score / (queryTokens.length * 1.35));
}

/** Keyword rank over the seeded kennisbank catalog (no DB). */
export function rankKennisbank(question: string, limit = 6): KennisbankMatch[] {
  const q = question.trim();
  if (q.length < 2) return [];
  const queryTokens = tokenizeAgentText(q);
  if (!queryTokens.length) return [];

  const catalog = loadCatalog();
  const scored: KennisbankMatch[] = [];
  for (const article of catalog.articles) {
    const confidence = scoreArticle(queryTokens, article);
    if (confidence < 0.18) continue;
    scored.push({
      slug: article.slug,
      title: article.title,
      categorySlug: article.categories[0] || "support",
      topic: article.topic,
      confidence,
    });
  }

  scored.sort((a, b) => b.confidence - a.confidence);
  return scored.slice(0, Math.max(1, limit));
}

export const KB_CONFIDENCE_HIT = 0.32;
export const KB_CONFIDENCE_STRONG = 0.48;

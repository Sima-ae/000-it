import { NextResponse } from "next/server";
import { isSameSiteRequest } from "@/lib/anti-scrape";
import {
  normalizeAgentText,
  tokenizeAgentText,
} from "@/lib/agent-000/text";
import { rankKennisbank } from "@/lib/agent-000/match-kennisbank";
import { listCategories, topLevelCategories } from "@/lib/kennisbank";

export const runtime = "nodejs";

const MAX_Q = 120;
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 40;

export async function GET(request: Request) {
  if (!isSameSiteRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().slice(0, MAX_Q);
  const locale = (searchParams.get("locale") || "nl").slice(0, 12);
  const preferCategory = (searchParams.get("category") || "").trim() || undefined;
  const limitRaw = Number(searchParams.get("limit") || DEFAULT_LIMIT);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(MAX_LIMIT, Math.max(1, Math.floor(limitRaw)))
    : DEFAULT_LIMIT;

  if (q.length < 2) {
    return NextResponse.json({
      query: q,
      articles: [],
      categories: [],
    });
  }

  const [ranked, allCategories] = await Promise.all([
    rankKennisbank(locale, q, preferCategory ? limit * 2 : limit),
    listCategories({ locale }),
  ]);

  const categoryBySlug = new Map(allCategories.map((c) => [c.slug, c]));
  const tokens = tokenizeAgentText(q);
  const needle = normalizeAgentText(q);

  const childOfPrefer = preferCategory
    ? new Set(
        allCategories
          .filter(
            (c) =>
              c.slug === preferCategory || c.parentSlug === preferCategory,
          )
          .map((c) => c.slug),
      )
    : null;

  const articles = ranked
    .map((hit) => {
      const cat = categoryBySlug.get(hit.categorySlug);
      const inPreferred = childOfPrefer
        ? childOfPrefer.has(hit.categorySlug)
        : false;
      return {
        slug: hit.slug,
        title: hit.title,
        excerpt: hit.excerpt,
        categorySlug: hit.categorySlug,
        categoryName: cat?.name || hit.categorySlug,
        confidence: hit.confidence,
        inPreferred,
      };
    })
    .sort((a, b) => {
      if (preferCategory && a.inPreferred !== b.inPreferred) {
        return a.inPreferred ? -1 : 1;
      }
      return b.confidence - a.confidence;
    })
    .slice(0, limit);

  const matchedCategorySlugs = new Set<string>();
  for (const cat of allCategories) {
    const hay = normalizeAgentText(
      `${cat.name} ${cat.description || ""} ${cat.slug.replace(/-/g, " ")}`,
    );
    const nameHit =
      (needle.length >= 2 && hay.includes(needle)) ||
      tokens.some((t) => t.length >= 2 && hay.includes(t));
    if (nameHit) matchedCategorySlugs.add(cat.slug);
  }
  // Surface categories that own strong article hits.
  for (const hit of articles.slice(0, 12)) {
    matchedCategorySlugs.add(hit.categorySlug);
    const parent = categoryBySlug.get(hit.categorySlug)?.parentSlug;
    if (parent) matchedCategorySlugs.add(parent);
  }

  const categories = topLevelCategories(allCategories)
    .filter((c) => {
      if (matchedCategorySlugs.has(c.slug)) return true;
      return c.children.some((ch) => matchedCategorySlugs.has(ch.slug));
    })
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      articleCount: c.articleCount,
    }))
    .slice(0, 12);

  return NextResponse.json({
    query: q,
    articles,
    categories,
  });
}

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import {
  normalizeAgentText,
  tokenizeAgentText,
  tokenHitScore,
} from "@/lib/agent-000/text";
import {
  buildArticleHtml,
  buildExcerpt,
} from "../../../prisma/kennisbank/build-body";

export type KennisbankMatch = {
  slug: string;
  title: string;
  categorySlug: string;
  topic: string;
  /** Short answer-ready text from excerpt / body (plain). */
  excerpt: string;
  confidence: number;
};

type IndexedArticle = {
  slug: string;
  title: string;
  categorySlug: string;
  categoryNames: string;
  categorySlugs: string;
  topic: string;
  excerpt: string;
  bodyPlain: string;
  titleNorm: string;
  excerptNorm: string;
  bodyNorm: string;
  titleTok: Set<string>;
  excerptTok: Set<string>;
  bodyTok: Set<string>;
};

type CatalogArticle = {
  slug: string;
  title: string;
  categories: string[];
  topic: string;
};

type Catalog = {
  categories: Array<[string, string, string] | [string, string, string, string]>;
  articles: CatalogArticle[];
};

const CACHE_TTL_MS = 10 * 60 * 1000;
const BODY_INDEX_CHARS = 12_000;

const cacheByLocale = new Map<
  string,
  { loadedAt: number; articles: IndexedArticle[] }
>();

function htmlToPlain(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function pickTranslation<T extends { locale: string }>(
  translations: T[],
  locale: string,
): T | undefined {
  const base = locale.toLowerCase().split("-")[0] || locale;
  return (
    translations.find((t) => t.locale === locale) ||
    translations.find((t) => t.locale === base) ||
    translations.find((t) => t.locale === "nl") ||
    translations.find((t) => t.locale === "en") ||
    translations[0]
  );
}

const CROSS_TAG_SLUGS = new Set([
  "beveiliging",
  "ssl-certificaten",
  "e-mail",
  "wordpress",
  "vps",
  "domeinnamen",
]);

/**
 * Pick a category slug that the article is actually tagged with
 * (required for /kennisbank/[category]/[slug] to resolve).
 * Prefer the parent subject over a child bucket or cross-tag.
 */
function pickCategorySlug(
  links: { slug: string; parentSlug: string | null }[],
): string {
  if (!links.length) return "support";
  const slugs = new Set(links.map((l) => l.slug));

  // Prefer known subject parents when the article is tagged with them
  for (const preferred of [
    "plesk",
    "cyberpanel",
    "directadmin",
    "hosting",
    "e-mail",
    "wordpress",
    "vps",
  ]) {
    if (slugs.has(preferred)) return preferred;
  }

  const withParentOnArticle = links.find(
    (l) => l.parentSlug && slugs.has(l.parentSlug),
  );
  if (withParentOnArticle?.parentSlug) return withParentOnArticle.parentSlug;

  const topLevel = links.find(
    (l) => !l.parentSlug && !CROSS_TAG_SLUGS.has(l.slug),
  );
  if (topLevel) return topLevel.slug;

  const nonCross = links.find((l) => !CROSS_TAG_SLUGS.has(l.slug));
  return nonCross?.slug || links[0].slug;
}

function answerSnippet(excerpt: string, bodyPlain: string, max = 420): string {
  const seed = (excerpt || bodyPlain || "").trim();
  if (!seed) return "";
  if (seed.length <= max) return seed;
  const cut = seed.slice(0, max);
  const lastStop = Math.max(
    cut.lastIndexOf(". "),
    cut.lastIndexOf("! "),
    cut.lastIndexOf("? "),
    cut.lastIndexOf("; "),
  );
  return `${(lastStop > 120 ? cut.slice(0, lastStop + 1) : cut).trim()}…`;
}

function scoreIndexed(queryTokens: string[], article: IndexedArticle): number {
  if (!queryTokens.length) return 0;

  const COMMON = new Set([
    "plesk",
    "directadmin",
    "cyberpanel",
    "wordpress",
    "hosting",
    "website",
    "domein",
    "server",
    "vps",
    "ssl",
    "email",
    "mail",
    "triplezero",
    "handleiding",
    "professionele",
    "configuratie",
    "stapsgewijze",
    "aan",
    "maak",
    "zetten",
    "zet",
    "via",
    "naar",
    "uit",
  ]);

  const joined = queryTokens.join(" ");
  let score = 0;
  let distinctiveHits = 0;
  let titleHits = 0;

  if (joined.length > 5 && article.titleNorm.includes(joined)) score += 0.7;
  else if (joined.length > 5 && article.excerptNorm.includes(joined)) score += 0.28;

  for (const t of queryTokens) {
    const weight = COMMON.has(t) ? 0.25 : 1;
    const titleHit = tokenHitScore(t, article.titleTok, article.titleNorm);
    const excerptHit = tokenHitScore(t, article.excerptTok, article.excerptNorm);
    const bodyHit = tokenHitScore(t, article.bodyTok, article.bodyNorm);
    const catHit =
      article.categorySlugs.includes(t) || article.categoryNames.includes(t)
        ? 1
        : 0;
    const topicNorm = normalizeAgentText(article.topic.replace(/-/g, " "));
    const topicHit = topicNorm.includes(t) ? 1 : 0;

    score += titleHit * 1.6 * weight;
    score += excerptHit * 0.7 * weight;
    score += Math.min(bodyHit, 1) * 0.35 * weight;
    score += catHit * 0.15 * weight;
    score += topicHit * 0.45 * weight;

    if (titleHit > 0) titleHits += 1;
    if (!COMMON.has(t) && (titleHit > 0 || excerptHit > 0.6 || bodyHit > 0.6)) {
      distinctiveHits += 1;
    }
  }

  const distinctive = queryTokens.filter((t) => !COMMON.has(t));
  if (distinctive.length && distinctiveHits === 0) {
    score *= 0.35;
  } else if (distinctive.length && titleHits === 0 && distinctiveHits > 0) {
    score *= 0.75;
  }

  // Normalize: keep headroom so perfect title+distinctive can beat “plesk-only”.
  const denom = queryTokens.length * 1.15 + distinctive.length * 0.35;
  return Math.min(1, score / Math.max(denom, 1));
}

function indexArticle(input: {
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  topic: string;
  categorySlug: string;
  categoryNames: string[];
  categorySlugs: string[];
}): IndexedArticle {
  const bodyPlain = htmlToPlain(input.bodyHtml).slice(0, BODY_INDEX_CHARS);
  const titleNorm = normalizeAgentText(input.title);
  const excerptNorm = normalizeAgentText(input.excerpt);
  const bodyNorm = normalizeAgentText(bodyPlain);
  return {
    slug: input.slug,
    title: input.title,
    categorySlug: input.categorySlug,
    categoryNames: normalizeAgentText(input.categoryNames.join(" ")),
    categorySlugs: normalizeAgentText(input.categorySlugs.join(" ").replace(/-/g, " ")),
    topic: input.topic,
    excerpt: answerSnippet(input.excerpt, bodyPlain),
    bodyPlain,
    titleNorm,
    excerptNorm,
    bodyNorm,
    titleTok: new Set(tokenizeAgentText(input.title)),
    excerptTok: new Set(tokenizeAgentText(input.excerpt)),
    bodyTok: new Set(tokenizeAgentText(bodyPlain)),
  };
}

async function loadFromDb(locale: string): Promise<IndexedArticle[]> {
  const rows = await prisma.kennisbankArticle.findMany({
    where: { published: true },
    include: {
      translations: true,
      categories: {
        include: {
          category: {
            include: {
              translations: true,
              parent: { select: { slug: true } },
            },
          },
        },
      },
    },
  });

  return rows.map((row) => {
    const tr = pickTranslation(row.translations, locale);
    const catLinks = row.categories.map((link) => ({
      slug: link.category.slug,
      parentSlug: link.category.parent?.slug ?? null,
      name:
        pickTranslation(link.category.translations, locale)?.name ||
        link.category.slug,
    }));
    return indexArticle({
      slug: row.slug,
      title: tr?.title || row.slug,
      excerpt: tr?.excerpt || "",
      bodyHtml: tr?.bodyHtml || "",
      topic: row.slug,
      categorySlug: pickCategorySlug(catLinks),
      categoryNames: catLinks.map((c) => c.name),
      categorySlugs: catLinks.map((c) => c.slug),
    });
  });
}

function loadCatalogFallback(locale: string): IndexedArticle[] {
  const path = join(process.cwd(), "prisma/kennisbank/catalog.json");
  const catalog = JSON.parse(readFileSync(path, "utf8")) as Catalog;
  const catParent = new Map<string, string | null>();
  for (const row of catalog.categories) {
    catParent.set(row[0], row[3] ?? null);
  }

  return catalog.articles.map((article) => {
    let bodyHtml = "";
    try {
      bodyHtml = buildArticleHtml(article.title, article.topic, "nl");
    } catch {
      bodyHtml = "";
    }
    const plain = htmlToPlain(bodyHtml);
    const excerpt =
      plain.slice(0, 280) ||
      buildExcerpt(article.title, locale.startsWith("nl") ? "nl" : "en");

    const links = article.categories.map((slug) => ({
      slug,
      parentSlug: catParent.get(slug) ?? null,
    }));

    return indexArticle({
      slug: article.slug,
      title: article.title,
      excerpt,
      bodyHtml,
      topic: article.topic,
      categorySlug: pickCategorySlug(links),
      categoryNames: article.categories,
      categorySlugs: article.categories,
    });
  });
}

async function getIndex(locale: string): Promise<IndexedArticle[]> {
  const key = locale.toLowerCase().split("-")[0] || "nl";
  const hit = cacheByLocale.get(key);
  if (hit && Date.now() - hit.loadedAt < CACHE_TTL_MS && hit.articles.length) {
    return hit.articles;
  }

  let articles: IndexedArticle[];
  try {
    articles = await loadFromDb(key);
    if (!articles.length) articles = loadCatalogFallback(key);
  } catch {
    // DB down / cold start: still answer from catalog + body builders.
    articles = loadCatalogFallback(key);
  }

  cacheByLocale.set(key, { loadedAt: Date.now(), articles });
  return articles;
}

/** Clear in-memory KB index (e.g. after seed). */
export function clearKennisbankAgentCache() {
  cacheByLocale.clear();
}

/**
 * Rank the full published kennisbank (title + excerpt + body) for a question.
 */
export async function rankKennisbank(
  locale: string,
  question: string,
  limit = 8,
): Promise<KennisbankMatch[]> {
  const q = question.trim();
  if (q.length < 2) return [];
  const queryTokens = tokenizeAgentText(q);
  if (!queryTokens.length) return [];

  const articles = await getIndex(locale);
  const scored: KennisbankMatch[] = [];
  for (const article of articles) {
    let confidence = scoreIndexed(queryTokens, article);
    if (confidence < 0.16) continue;

    // Panel preference baked into confidence so Plesk beats DirectAdmin when asked.
    const wanted = PANEL_TOKENS.filter((p) => queryTokens.includes(p));
    if (wanted.length) {
      const title = article.titleNorm;
      const cats = `${article.categorySlugs} ${article.categoryNames}`;
      let panelScore = 0;
      for (const p of wanted) {
        if (title.includes(p) || cats.includes(p)) panelScore += 1;
        for (const other of PANEL_TOKENS) {
          if (other !== p && (title.includes(other) || cats.includes(other))) {
            panelScore -= 1;
          }
        }
      }
      if (panelScore > 0) confidence = Math.min(1, confidence + 0.18);
      else if (panelScore < 0) confidence = Math.max(0, confidence - 0.18);
      else confidence = Math.max(0, confidence - 0.08);
    }

    scored.push({
      slug: article.slug,
      title: article.title,
      categorySlug: article.categorySlug,
      topic: article.topic,
      excerpt: article.excerpt,
      confidence,
    });
  }

  scored.sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return queryCoveredByTitle(queryTokens, b.title) - queryCoveredByTitle(queryTokens, a.title);
  });
  return scored.slice(0, Math.max(1, limit));
}

function queryCoveredByTitle(queryTokens: string[], title: string): number {
  if (!queryTokens.length) return 0;
  const titleTok = new Set(tokenizeAgentText(title));
  let hits = 0;
  for (const t of queryTokens) if (titleTok.has(t)) hits += 1;
  return hits / queryTokens.length;
}

const PANEL_TOKENS = ["plesk", "directadmin", "cyberpanel", "cpanel"] as const;

export const KB_CONFIDENCE_HIT = 0.3;
export const KB_CONFIDENCE_STRONG = 0.46;

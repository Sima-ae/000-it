import {
  normalizeAgentText,
  tokenizeAgentText,
  tokenHitScore,
} from "@/lib/agent-000/text";
import { rankKennisbank } from "@/lib/agent-000/match-kennisbank";
import { getFaqContent } from "@/content/faq";
import { staticPageSeo } from "@/content/seo/pages";
import {
  catalogGroupTitle,
  catalogServiceTitle,
} from "@/content/fixweb/catalog-title";
import {
  serviceCatalog,
  serviceGroupHref,
  serviceHref,
  sortedServiceGroups,
} from "@/content/fixweb/catalog";
import { localizedHref } from "@/i18n/pathnames";
import { listNewsPosts } from "@/lib/news";
import { listCategories } from "@/lib/kennisbank";
import type {
  SiteSearchHit,
  SiteSearchResult,
} from "@/lib/site-search-types";

export type {
  SiteSearchHit,
  SiteSearchKind,
  SiteSearchResult,
} from "@/lib/site-search-types";
export { siteSearchHasResults } from "@/lib/site-search-types";

const PER_SECTION = 8;

function scoreText(queryTokens: string[], needle: string, ...fields: string[]) {
  if (!queryTokens.length && !needle) return 0;
  const joined = fields.filter(Boolean).join(" \n ");
  const norm = normalizeAgentText(joined);
  if (!norm) return 0;

  let score = 0;
  if (needle.length >= 2 && norm.includes(needle)) {
    score += needle.length >= 6 ? 1.2 : 0.7;
  }

  const tokens = new Set(tokenizeAgentText(joined));
  for (const t of queryTokens) {
    score += tokenHitScore(t, tokens, norm);
  }

  // Prefer title-ish first field.
  const titleNorm = normalizeAgentText(fields[0] || "");
  if (titleNorm && needle.length >= 2 && titleNorm.includes(needle)) {
    score += 0.85;
  }

  return score;
}

function localeTitle(
  page: (typeof staticPageSeo)[number],
  locale: string,
): string {
  if (locale === "nl") return page.title.nl;
  return page.title.en;
}

function localeDescription(
  page: (typeof staticPageSeo)[number],
  locale: string,
): string {
  if (locale === "nl") return page.description.nl;
  return page.description.en;
}

function localeKeywords(
  page: (typeof staticPageSeo)[number],
  locale: string,
): string {
  const list = locale === "nl" ? page.keywords.nl : page.keywords.en;
  return list.join(" ");
}

function searchPages(locale: string, needle: string, tokens: string[]) {
  const hits: SiteSearchHit[] = [];
  for (const page of staticPageSeo) {
    // Skip raw service detail paths — covered by services section.
    if (page.path.startsWith("/diensten/") && page.path !== "/diensten") {
      continue;
    }
    const title = localeTitle(page, locale);
    const desc = localeDescription(page, locale);
    const score = scoreText(
      tokens,
      needle,
      title,
      desc,
      localeKeywords(page, locale),
      page.path,
    );
    if (score < 0.55) continue;
    hits.push({
      kind: "page",
      id: page.path,
      title,
      excerpt: desc,
      href: localizedHref(locale, page.path),
      score,
    });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, PER_SECTION);
}

function searchServices(locale: string, needle: string, tokens: string[]) {
  const hits: SiteSearchHit[] = [];

  for (const group of sortedServiceGroups(locale)) {
    const title = catalogGroupTitle(group.id, locale, group.title);
    const score = scoreText(tokens, needle, title, group.id, "categorie");
    if (score < 0.55) continue;
    hits.push({
      kind: "service",
      id: `group:${group.id}`,
      title,
      excerpt: "",
      href: serviceGroupHref(locale, group.id),
      meta: locale === "nl" ? "Categorie" : "Category",
      score: score + 0.1,
    });
  }

  for (const item of serviceCatalog) {
    const title = catalogServiceTitle(item.slug, locale, item.title);
    const summary =
      locale === "nl"
        ? item.summaryNl || item.summary || ""
        : item.summary || item.summaryNl || "";
    const score = scoreText(
      tokens,
      needle,
      title,
      summary,
      item.slug.replace(/-/g, " "),
      item.group,
    );
    if (score < 0.55) continue;
    hits.push({
      kind: "service",
      id: item.slug,
      title,
      excerpt: summary,
      href: serviceHref(locale, item),
      meta: catalogGroupTitle(item.group, locale, item.group),
      score,
    });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, PER_SECTION);
}

function searchFaq(locale: string, needle: string, tokens: string[]) {
  const content = getFaqContent(locale);
  const hits: SiteSearchHit[] = [];
  for (const category of content.categories) {
    for (const item of category.items) {
      const score = scoreText(
        tokens,
        needle,
        item.question,
        item.answer,
        category.title,
      );
      if (score < 0.7) continue;
      hits.push({
        kind: "faq",
        id: item.id,
        title: item.question,
        excerpt: item.answer.slice(0, 180),
        href: `${localizedHref(locale, "/faq")}#faq-item-${item.id}`,
        meta: category.title,
        score,
      });
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, PER_SECTION);
}

async function searchNews(locale: string, needle: string, tokens: string[]) {
  const posts = await listNewsPosts({ locale, all: false });
  const hits: SiteSearchHit[] = [];
  for (const post of posts) {
    const score = scoreText(
      tokens,
      needle,
      post.title,
      post.excerpt,
      post.industry || "",
      ...(post.tags || []),
    );
    if (score < 0.55) continue;
    hits.push({
      kind: "news",
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      href: localizedHref(locale, `/nieuws/${post.id}`),
      meta: post.industry || undefined,
      score,
    });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, PER_SECTION);
}

async function searchKennisbank(locale: string, q: string) {
  const [ranked, categories] = await Promise.all([
    rankKennisbank(locale, q, PER_SECTION),
    listCategories({ locale }).catch(() => []),
  ]);
  const nameBySlug = new Map(categories.map((c) => [c.slug, c.name]));
  return ranked.map((hit) => ({
    kind: "kennisbank" as const,
    id: hit.slug,
    title: hit.title,
    excerpt: hit.excerpt,
    href: localizedHref(
      locale,
      `/kennisbank/${hit.categorySlug}/${hit.slug}`,
    ),
    meta: nameBySlug.get(hit.categorySlug) || hit.categorySlug,
    score: hit.confidence,
  }));
}

export async function searchSite(
  locale: string,
  rawQuery: string,
): Promise<SiteSearchResult> {
  const query = rawQuery.trim().slice(0, 120);
  const empty: SiteSearchResult = {
    query,
    pages: [],
    services: [],
    kennisbank: [],
    news: [],
    faq: [],
  };
  if (query.length < 2) return empty;

  const needle = normalizeAgentText(query);
  const tokens = tokenizeAgentText(query);

  // DB-backed sections must not take down static pages/services/faq search.
  const [kennisbank, news] = await Promise.all([
    searchKennisbank(locale, query).catch((error) => {
      console.warn("[site-search] kennisbank unavailable", error);
      return [] as SiteSearchHit[];
    }),
    searchNews(locale, needle, tokens).catch((error) => {
      console.warn("[site-search] news unavailable", error);
      return [] as SiteSearchHit[];
    }),
  ]);

  return {
    query,
    pages: searchPages(locale, needle, tokens),
    services: searchServices(locale, needle, tokens),
    kennisbank,
    news,
    faq: searchFaq(locale, needle, tokens),
  };
}

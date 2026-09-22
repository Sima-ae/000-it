import { AUTO_NEWS_FEEDS } from "@/lib/auto-news/config";

export type NewsStory = {
  title: string;
  url: string;
  summary: string;
  publishedAt: string | null;
  sourceId: string;
  sourceName: string;
};

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Remove arXiv and similar feed preambles before ranking/drafting. */
export function scrubFeedSummary(summary: string) {
  const cleaned = summary
    .replace(/^arXiv:\s*[\w./-]+\s*/i, "")
    .replace(/(?:Announce\s*Type|Aankondigings?\s*type|Aankondigingstype)\s*:\s*[\w-]+\s*/gi, "")
    .replace(/^(?:Abstract|Samenvatting)\s*:\s*/i, "")
    .replace(/\bComments:\s*[^.]+\./gi, "")
    .replace(/\s+/g, " ")
    .trim();
  // Drop feed "[…]" tails so drafts never inherit mid-sentence cuts.
  return cleaned
    .replace(/\s*\[\s*(?:\.{2,}|…)\s*\]\s*$/u, "")
    .replace(/(?:\u2026|\.{3})\s*$/u, "")
    .trim();
}

function sliceFeedSummary(summary: string, max = 2800) {
  const cleaned = scrubFeedSummary(summary);
  if (cleaned.length <= max) {
    // Still drop an incomplete final sentence if a truncation mark sits mid-text.
    const markAt = cleaned.search(/\[\s*(?:\.{2,}|…)\s*\]/);
    if (markAt < 0) return cleaned;
    const before = cleaned.slice(0, markAt).trim();
    const stop = Math.max(before.lastIndexOf(". "), before.lastIndexOf("! "), before.lastIndexOf("? "));
    if (stop > 20) return before.slice(0, stop + 1).trim();
    return before.length > 12 ? `${before.replace(/[,:;–—\-|]\s*$/u, "").trim()}.` : before;
  }
  const window = cleaned.slice(0, max);
  const stop = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("! "),
    window.lastIndexOf("? "),
  );
  if (stop > Math.floor(max * 0.45)) return window.slice(0, stop + 1).trim();
  const space = window.lastIndexOf(" ");
  const cut = (space > 40 ? window.slice(0, space) : window).trim();
  return `${cut.replace(/[,:;–—\-|]\s*$/u, "")}.`;
}

function pickTag(block: string, tag: string) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = block.match(re);
  return match ? decodeXml(match[1]) : "";
}

function pickLink(block: string) {
  const atom = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  if (atom?.[1]) return atom[1].trim();
  const plain = pickTag(block, "link");
  if (plain) return plain;
  const guid = pickTag(block, "guid");
  if (guid.startsWith("http")) return guid;
  return "";
}

function parseFeed(xml: string, sourceId: string, sourceName: string): NewsStory[] {
  const chunks = xml.match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi) || [];
  return chunks
    .map((block) => {
      const title = pickTag(block, "title");
      const url = pickLink(block);
      const summary =
        pickTag(block, "description") ||
        pickTag(block, "summary") ||
        pickTag(block, "content") ||
        pickTag(block, "content:encoded");
      const publishedAt =
        pickTag(block, "pubDate") ||
        pickTag(block, "published") ||
        pickTag(block, "updated") ||
        null;
      if (!title || !url) return null;
      return {
        title,
        url,
        // Keep enough source text for multi-paragraph drafts.
        summary: sliceFeedSummary(summary, 2800),
        publishedAt,
        sourceId,
        sourceName,
      } satisfies NewsStory;
    })
    .filter((s): s is NewsStory => Boolean(s));
}

const AI_HINT =
  /\b(ai|artificial intelligence|gpt|claude|gemini|openai|anthropic|llm|agent|automation|workflow|midjourney|runway|sora|veo|flux|copilot|robotics|machine learning|deepseek|nvidia|model|neural|transformer|datacenter|data center)\b/i;

/**
 * Round-robin across sources so high-volume feeds do not crowd out others.
 * Within each source, stories stay newest-first.
 */
export function diversifyStories(ranked: NewsStory[], limit: number): NewsStory[] {
  if (limit <= 0 || ranked.length === 0) return [];

  const bySource = new Map<string, NewsStory[]>();
  for (const story of ranked) {
    const list = bySource.get(story.sourceId) || [];
    list.push(story);
    bySource.set(story.sourceId, list);
  }

  const sourceIds = Array.from(bySource.keys());
  const out: NewsStory[] = [];
  let cursor = 0;

  while (out.length < limit && sourceIds.length > 0) {
    const idx = cursor % sourceIds.length;
    const sourceId = sourceIds[idx];
    const list = bySource.get(sourceId) || [];
    if (!list.length) {
      sourceIds.splice(idx, 1);
      continue;
    }
    out.push(list.shift()!);
    cursor += 1;
  }

  return out;
}

export async function fetchRecentAiStories(limit = 24): Promise<NewsStory[]> {
  const collected: NewsStory[] = [];

  await Promise.all(
    AUTO_NEWS_FEEDS.map(async (feed) => {
      try {
        const res = await fetch(feed.url, {
          headers: {
            "User-Agent": "TripleZeroIT-AutoNews/1.0 (+https://000-it.com)",
            Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
          },
          signal: AbortSignal.timeout(20_000),
          cache: "no-store",
        });
        if (!res.ok) return;
        const xml = await res.text();
        collected.push(...parseFeed(xml, feed.id, feed.name));
      } catch (error) {
        console.warn(`[auto-news] feed failed: ${feed.id}`, error);
      }
    }),
  );

  const seen = new Set<string>();
  const ranked = collected
    .filter((story) => {
      const key = story.url.split("?")[0].toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      const blob = `${story.title} ${story.summary}`;
      return AI_HINT.test(blob) && story.summary.length >= 40;
    })
    .sort((a, b) => {
      const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return tb - ta;
    });

  // Pull a wider pool then diversify so callers get mixed sources.
  const pool = ranked.slice(0, Math.max(limit * 4, limit));
  return diversifyStories(pool, limit);
}

/** Match a story URL against the current feed pool (for rewrite/repair). */
export async function findStoryByUrl(url: string): Promise<NewsStory | null> {
  const target = url.split("?")[0].replace(/\/$/, "").toLowerCase();
  if (!target) return null;
  const stories = await fetchRecentAiStories(160);
  return (
    stories.find((s) => s.url.split("?")[0].replace(/\/$/, "").toLowerCase() === target) ||
    null
  );
}

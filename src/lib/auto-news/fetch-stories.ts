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
  return summary
    .replace(/^arXiv:\s*[\w./-]+\s*/i, "")
    .replace(/(?:Announce\s*Type|Aankondigings?\s*type|Aankondigingstype)\s*:\s*[\w-]+\s*/gi, "")
    .replace(/^(?:Abstract|Samenvatting)\s*:\s*/i, "")
    .replace(/\bComments:\s*[^.]+\./gi, "")
    .replace(/\s+/g, " ")
    .trim();
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
        summary: scrubFeedSummary(summary).slice(0, 1200),
        publishedAt,
        sourceId,
        sourceName,
      } satisfies NewsStory;
    })
    .filter((s): s is NewsStory => Boolean(s));
}

const AI_HINT =
  /\b(ai|artificial intelligence|gpt|claude|gemini|openai|anthropic|llm|agent|automation|workflow|midjourney|runway|sora|veo|flux|copilot|robotics|machine learning|deepseek|nvidia|model)\b/i;

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

  return ranked.slice(0, limit);
}

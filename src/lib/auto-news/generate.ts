import type { NewsStory } from "@/lib/auto-news/fetch-stories";
import { type NewsTranslationsMap } from "@/lib/news-i18n";
import { isAcceptableTranslation, translateText } from "@/lib/google-translate";

export type GeneratedNewsDraft = {
  title: string;
  titleNl: string;
  excerpt: string;
  excerptNl: string;
  description: string;
  descriptionNl: string;
  translations: NewsTranslationsMap;
  industry: string;
  tags: string[];
};

function cleanText(value: string) {
  return decodeHtmlEntities(value).replace(/\s+/g, " ").trim();
}

/** Decode common feed / HTML entities so titles never show &#8217; etc. */
export function decodeHtmlEntities(value: string) {
  if (!value) return "";
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, num) =>
      String.fromCodePoint(Number.parseInt(num, 10)),
    )
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&rsquo;/gi, "\u2019")
    .replace(/&lsquo;/gi, "\u2018")
    .replace(/&rdquo;/gi, "\u201D")
    .replace(/&ldquo;/gi, "\u201C")
    .replace(/&mdash;/gi, "\u2014")
    .replace(/&ndash;/gi, "\u2013");
}

/**
 * Strip arXiv / feed preambles so posts never show metadata junk.
 * Handles EN + NL variants, including spaced translations like "Aankondiging Type:".
 * Example removed: "arXiv:2608.07480v1 Aankondigingstype: nieuw Samenvatting:"
 * Example removed: "Aankondiging Type: nieuw"
 * Preserves paragraph breaks in longer article bodies.
 */
export function cleanSourceSummary(summary: string) {
  if (!summary) return "";

  const scrubChunk = (chunk: string) => {
    let text = chunk.replace(/[ \t]+/g, " ").trim();
    for (let i = 0; i < 8; i += 1) {
      const before = text;
      text = text
        // arXiv ids
        .replace(/^arXiv:\s*[\w./-]+\s*/i, "")
        .replace(/\barXiv:\s*[\w./-]+\s*/gi, (match, offset) =>
          offset < 100 ? "" : match,
        )
        // Announce Type / Aankondigingstype / "Aankondiging Type" (spaced NL translation)
        .replace(
          /^(?:Announce\s*Type|Aankondigings?\s*type|Aankondigingstype)\s*:\s*[\w-]+\s*/i,
          "",
        )
        .replace(
          /\b(?:Announce\s*Type|Aankondigings?\s*type|Aankondigingstype)\s*:\s*[\w-]+\s*/gi,
          (match, offset) => (offset < 160 ? "" : match),
        )
        // Abstract / Samenvatting labels
        .replace(/^(?:Abstract|Samenvatting)\s*:\s*/i, "")
        .replace(
          /\b(?:Abstract|Samenvatting)\s*:\s*/gi,
          (match, offset) => (offset < 180 ? "" : match),
        )
        .replace(/^Comments:\s*[^.]+\.\s*/i, "")
        .replace(/^Subjects?:\s*[^.]+\.\s*/i, "")
        .replace(/^MSC class:\s*[^.]+\.\s*/i, "")
        .replace(/[ \t]+/g, " ")
        .trim();
      if (text === before) break;
    }

    // Combined leftover block at the start
    text = text
      .replace(
        /^(?:arXiv:\s*[\w./-]+\s*)?(?:Announce\s*Type|Aankondigings?\s*type|Aankondigingstype)\s*:\s*[\w-]+\s*(?:Abstract|Samenvatting)\s*:\s*/i,
        "",
      )
      .replace(
        /^(?:Announce\s*Type|Aankondigings?\s*type|Aankondigingstype)\s*:\s*[\w-]+\s*/i,
        "",
      )
      .replace(/[ \t]+/g, " ")
      .trim();

    return text;
  };

  if (/\n\s*\n/.test(summary)) {
    return summary
      .split(/\n\s*\n/)
      .map((para) => scrubChunk(para))
      .filter(Boolean)
      .join("\n\n");
  }

  return scrubChunk(summary);
}

/** True when stored copy still contains raw arXiv / feed metadata junk. */
export function looksLikeRawFeedCopy(text: string) {
  return /arxiv:\s*[\w./-]+|announce\s*type\s*:|aankondigings?\s*type\s*:|aankondigingstype\s*:|\b(abstract|samenvatting)\s*:/i.test(
    text || "",
  );
}

function truncate(value: string, max: number) {
  const text = cleanText(value);
  if (text.length <= max) return text;
  const sliced = text.slice(0, max - 1);
  const cut = sliced.lastIndexOf(" ");
  return `${(cut > 40 ? sliced.slice(0, cut) : sliced).trim()}…`;
}

function paragraphize(summary: string) {
  const text = cleanSourceSummary(summary);
  if (!text) return [];
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 40);
  if (parts.length >= 2) return parts.slice(0, 4);
  if (text.length < 280) return [text];
  const mid = Math.floor(text.length / 2);
  const splitAt = text.lastIndexOf(" ", mid);
  if (splitAt > 80) {
    return [text.slice(0, splitAt).trim(), text.slice(splitAt).trim()];
  }
  return [text];
}

function inferIndustry(story: NewsStory) {
  const blob = `${story.title} ${story.summary}`.toLowerCase();
  if (/\b(video|sora|veo|runway|wan|seedance|clips?)\b/.test(blob)) return "AI / Video";
  if (/\b(image|midjourney|flux|imagen|dall-?e|diffusion)\b/.test(blob)) return "AI / Image";
  if (/\b(agent|workflow|automat|n8n|zapier|orchestr)\b/.test(blob)) return "AI / Automation";
  if (/\b(robot|embodied|hardware)\b/.test(blob)) return "AI / Robotics";
  if (/\b(security|cyber|mythos)\b/.test(blob)) return "AI / Security";
  if (/\b(api|model|gpt|claude|gemini|llm|openai|anthropic)\b/.test(blob)) return "AI / Models";
  return "AI / Industry";
}

function inferTags(story: NewsStory) {
  const blob = `${story.title} ${story.summary}`.toLowerCase();
  const tags = new Set<string>(["AI"]);
  if (blob.includes("openai") || blob.includes("gpt")) tags.add("OpenAI");
  if (blob.includes("google") || blob.includes("gemini")) tags.add("Google");
  if (blob.includes("anthropic") || blob.includes("claude")) tags.add("Anthropic");
  if (blob.includes("microsoft") || blob.includes("copilot") || blob.includes("azure")) {
    tags.add("Microsoft");
  }
  if (/\b(video|sora|veo|runway)\b/.test(blob)) tags.add("Video");
  if (/\b(image|midjourney|flux)\b/.test(blob)) tags.add("Image");
  if (/\b(agent|workflow|automat)\b/.test(blob)) tags.add("Automation");
  if (/\b(api|model|llm)\b/.test(blob)) tags.add("Models");
  if (story.sourceId === "arxiv-ai") tags.add("Research");
  tags.add(story.sourceName.split(" ")[0] || story.sourceId);
  return Array.from(tags).slice(0, 6);
}

function buildEnglishDraft(
  story: NewsStory,
): Omit<
  GeneratedNewsDraft,
  "titleNl" | "excerptNl" | "descriptionNl" | "translations"
> {
  const title = truncate(story.title, 140);
  const paragraphs = paragraphize(story.summary);
  const published = story.publishedAt
    ? (() => {
        const t = Date.parse(story.publishedAt);
        return Number.isFinite(t)
          ? new Date(t).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : null;
      })()
    : null;

  const isResearch = story.sourceId === "arxiv-ai" || /arxiv\.org/i.test(story.url);

  const lead = isResearch
    ? published
      ? `New AI research (${published}): ${title}.`
      : `New AI research worth following: ${title}.`
    : published
      ? `${story.sourceName} published an update on ${published} about ${title}.`
      : `${story.sourceName} reports a notable AI development: ${title}.`;

  const context = isResearch
    ? "The paper explores ideas that may influence how teams evaluate models, automation and AI-assisted workflows in the months ahead."
    : "The announcement matters for teams that rely on models, automation and digital production — especially around cost, tooling and delivery speed.";

  const body =
    paragraphs.length > 0
      ? paragraphs.join("\n\n")
      : `${story.sourceName} shared a new AI-industry update focused on practical developments for builders and operators.`;

  const description = [lead, context, body].join("\n\n");
  const excerptSource = paragraphs[0] || context;
  const excerpt = truncate(excerptSource, 220);

  return {
    title,
    excerpt,
    description,
    industry: inferIndustry(story),
    tags: inferTags(story),
  };
}

/**
 * Build EN source + Dutch (site default).
 * Other locales are filled after publish (see run.ts) so daily posting
 * is not blocked by translate rate limits.
 */
export async function generateBilingualNewsDraft(
  story: NewsStory,
): Promise<GeneratedNewsDraft> {
  const cleaned: NewsStory = {
    ...story,
    summary: cleanSourceSummary(story.summary),
  };
  if (!cleaned.summary || cleaned.summary.length < 40) {
    throw new Error(`Story summary too short after cleanup: ${story.url}`);
  }

  const en = buildEnglishDraft(cleaned);

  let titleNl = "";
  let excerptNl = "";
  let descriptionNl = "";
  // Soft-fail NL: still publish EN so a Translate outage cannot wipe a day.
  try {
    // Sequential to reduce Google Translate 429s
    titleNl = await translateText(en.title, "nl", "en");
    excerptNl = await translateText(en.excerpt, "nl", "en");
    descriptionNl = await translateText(en.description, "nl", "en");
  } catch (error) {
    console.warn(
      "[auto-news] Dutch translate failed — publishing EN fallback",
      error instanceof Error ? error.message : error,
    );
    titleNl = en.title;
    excerptNl = en.excerpt;
    descriptionNl = en.description;
  }

  const nlSeed = {
    title: titleNl,
    excerpt: excerptNl,
    description: descriptionNl,
  };
  if (
    !isAcceptableTranslation(en.title, nlSeed.title, "en", "nl") ||
    !isAcceptableTranslation(en.excerpt, nlSeed.excerpt, "en", "nl") ||
    !isAcceptableTranslation(en.description, nlSeed.description, "en", "nl")
  ) {
    console.warn(
      "[auto-news] Dutch quality check failed — using EN for NL fields",
      story.url,
    );
    nlSeed.title = en.title;
    nlSeed.excerpt = en.excerpt;
    nlSeed.description = en.description;
  }

  const draft = sanitizeNewsDraft({
    ...en,
    titleNl: nlSeed.title,
    excerptNl: nlSeed.excerpt,
    descriptionNl: nlSeed.description,
    translations: { nl: nlSeed },
  });

  if (
    looksLikeRawFeedCopy(draft.excerpt) ||
    looksLikeRawFeedCopy(draft.excerptNl) ||
    looksLikeRawFeedCopy(draft.description) ||
    looksLikeRawFeedCopy(draft.descriptionNl)
  ) {
    throw new Error(`Draft still contains feed metadata after sanitize: ${story.url}`);
  }

  return draft;
}

/** Final pass before DB insert — never persist arXiv/feed metadata junk. */
export function sanitizeNewsDraft(draft: GeneratedNewsDraft): GeneratedNewsDraft {
  const translations: NewsTranslationsMap = {};
  for (const [locale, copy] of Object.entries(draft.translations || {})) {
    translations[locale] = {
      title: cleanText(copy.title),
      excerpt: cleanSourceSummary(copy.excerpt),
      description: cleanSourceSummary(copy.description),
    };
  }

  return {
    ...draft,
    title: cleanText(draft.title),
    titleNl: cleanText(draft.titleNl),
    excerpt: cleanSourceSummary(draft.excerpt),
    excerptNl: cleanSourceSummary(draft.excerptNl),
    description: cleanSourceSummary(draft.description),
    descriptionNl: cleanSourceSummary(draft.descriptionNl),
    translations,
    industry: cleanText(draft.industry),
    tags: draft.tags
      .map((t) => cleanText(t))
      .filter((t) => t && !/^(auto-news|arxiv-ai)$/i.test(t))
      .slice(0, 6),
  };
}

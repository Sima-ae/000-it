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
 * Strip feed truncation markers ([…], [...], trailing …) and keep only complete
 * sentences so article bodies never end mid-thought with an ellipsis bracket.
 */
export function finishTruncatedCopy(text: string) {
  if (!text) return "";
  const TRUNC_MARK = /\[\s*(?:\.{2,}|…)\s*\]/;

  const fixPara = (para: string) => {
    let p = para.replace(/[ \t]+/g, " ").trim();
    if (!p) return "";

    if (TRUNC_MARK.test(p) || /(?:\u2026|\.{3})\s*$/u.test(p)) {
      const markAt = p.search(TRUNC_MARK);
      const before =
        markAt >= 0
          ? p.slice(0, markAt).trim()
          : p.replace(/(?:\u2026|\.{3})\s*$/u, "").trim();

      // Prefer dropping the incomplete trailing sentence.
      const stop = Math.max(
        before.lastIndexOf(". "),
        before.lastIndexOf("! "),
        before.lastIndexOf("? "),
      );
      if (stop > 20) {
        p = before.slice(0, stop + 1).trim();
      } else if (/[.!?]"?$/.test(before)) {
        p = before;
      } else if (before.length > 12) {
        p = `${before.replace(/[,:;–—\-|]\s*$/u, "").trim()}.`;
      } else {
        return "";
      }
    }

    // Hard length cuts sometimes leave dangling mid-sentence tails without a mark.
    if (p.length > 40 && !/[.!?]"?[)”']?\s*$/u.test(p) && /\.\s/.test(p)) {
      const stop = Math.max(p.lastIndexOf(". "), p.lastIndexOf("! "), p.lastIndexOf("? "));
      if (stop > 20) p = p.slice(0, stop + 1).trim();
    }

    return p;
  };

  if (/\n\s*\n/.test(text)) {
    return text
      .split(/\n\s*\n/)
      .map((para) => fixPara(para))
      .filter(Boolean)
      .join("\n\n");
  }

  return fixPara(text.replace(/\s+/g, " ").trim());
}

/** Cut long source text on a sentence boundary (never mid-word / mid-sentence). */
export function sliceAtSentence(text: string, max: number) {
  const cleaned = (text || "").trim();
  if (cleaned.length <= max) return cleaned;
  const window = cleaned.slice(0, max);
  const stop = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("! "),
    window.lastIndexOf("? "),
    window.lastIndexOf(".\n"),
  );
  if (stop > Math.floor(max * 0.45)) {
    return finishTruncatedCopy(window.slice(0, stop + 1).trim());
  }
  const space = window.lastIndexOf(" ");
  const cut = (space > 40 ? window.slice(0, space) : window).trim();
  return finishTruncatedCopy(`${cut.replace(/[,:;–—\-|]\s*$/u, "")}.`);
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

    return finishTruncatedCopy(text);
  };

  if (/\n\s*\n/.test(summary)) {
    return finishTruncatedCopy(
      summary
        .split(/\n\s*\n/)
        .map((para) => scrubChunk(para))
        .filter(Boolean)
        .join("\n\n"),
    );
  }

  return scrubChunk(summary);
}

/** True when stored copy still contains raw arXiv / feed metadata junk. */
export function looksLikeRawFeedCopy(text: string) {
  return /arxiv:\s*[\w./-]+|announce\s*type\s*:|aankondigings?\s*type\s*:|aankondigingstype\s*:|\b(abstract|samenvatting)\s*:/i.test(
    text || "",
  );
}

/** Old auto-news drafts reused one fixed implication sentence in almost every post. */
const BOILERPLATE_PATTERNS = [
  /The announcement matters for teams that rely on models, automation and digital production[^.]*\./gi,
  /De aankondiging is belangrijk voor teams die afhankelijk zijn van modellen, automatisering en digitale productie[^.]*\./gi,
  /The paper explores ideas that may influence how teams evaluate models, automation and AI-assisted workflows in the months ahead\./gi,
  /Het artikel onderzoekt ideeën die van invloed kunnen zijn op hoe teams modellen, automatisering en AI-ondersteunde workflows de komende maanden evalueren\./gi,
];

export function looksLikeBoilerplateCopy(text: string) {
  if (!text) return false;
  return BOILERPLATE_PATTERNS.some((re) => {
    re.lastIndex = 0;
    return re.test(text);
  });
}

export function stripBoilerplateCopy(text: string) {
  if (!text) return "";
  let out = text;
  for (const re of BOILERPLATE_PATTERNS) {
    out = out.replace(re, " ");
  }
  return out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
}

function truncate(value: string, max: number) {
  const text = cleanText(value);
  if (text.length <= max) return text;
  const sliced = text.slice(0, max - 1);
  const cut = sliced.lastIndexOf(" ");
  return `${(cut > 40 ? sliced.slice(0, cut) : sliced).trim()}…`;
}

function hashPick<T>(seed: string, items: readonly T[]): T {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // >>> 0 keeps the index non-negative (JS % can be negative for signed ints).
  return items[(h >>> 0) % items.length];
}

function paragraphize(summary: string) {
  const text = cleanSourceSummary(summary);
  if (!text) return [];
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 28);
  if (parts.length >= 2) {
    // Group short sentences into richer paragraphs (2–3 sentences each).
    const grouped: string[] = [];
    for (let i = 0; i < parts.length && grouped.length < 6; ) {
      const chunk = [parts[i]];
      i += 1;
      while (i < parts.length && chunk.join(" ").length < 220 && chunk.length < 3) {
        chunk.push(parts[i]);
        i += 1;
      }
      grouped.push(chunk.join(" "));
    }
    return grouped;
  }
  if (text.length < 320) return [text];
  const third = Math.floor(text.length / 3);
  const cuts = [third, third * 2]
    .map((at) => {
      const left = text.lastIndexOf(" ", at);
      return left > 80 ? left : at;
    })
    .filter((c, i, arr) => arr.indexOf(c) === i);
  if (cuts.length >= 2) {
    return [
      text.slice(0, cuts[0]).trim(),
      text.slice(cuts[0], cuts[1]).trim(),
      text.slice(cuts[1]).trim(),
    ].filter((p) => p.length > 40);
  }
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
  if (/\b(energy|water|datacenter|data center|grid|sustainab)\b/.test(blob)) {
    return "AI / Infrastructure";
  }
  if (/\b(api|model|gpt|claude|gemini|llm|openai|anthropic)\b/.test(blob)) return "AI / Models";
  return "AI / Industry";
}

function inferTags(story: NewsStory) {
  const blob = `${story.title} ${story.summary}`.toLowerCase();
  const tags = new Set<string>(["AI"]);
  if (blob.includes("openai") || blob.includes("gpt")) tags.add("OpenAI");
  if (blob.includes("google") || blob.includes("gemini") || blob.includes("deepmind")) {
    tags.add("Google");
  }
  if (blob.includes("anthropic") || blob.includes("claude")) tags.add("Anthropic");
  if (blob.includes("microsoft") || blob.includes("copilot") || blob.includes("azure")) {
    tags.add("Microsoft");
  }
  if (blob.includes("nvidia")) tags.add("NVIDIA");
  if (/\b(video|sora|veo|runway)\b/.test(blob)) tags.add("Video");
  if (/\b(image|midjourney|flux)\b/.test(blob)) tags.add("Image");
  if (/\b(agent|workflow|automat)\b/.test(blob)) tags.add("Automation");
  if (/\b(api|model|llm)\b/.test(blob)) tags.add("Models");
  if (story.sourceId === "arxiv-ai") tags.add("Research");
  const brand = story.sourceName.split(" ")[0] || story.sourceId;
  if (brand && !/^(auto|repair)$/i.test(brand)) tags.add(brand);
  return Array.from(tags).slice(0, 6);
}

function formatPublishedDate(iso: string | null, locale: "en-GB" | "nl-NL" = "en-GB") {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return new Date(t).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export { formatPublishedDate };

function topicHint(title: string) {
  const cleaned = truncate(title.replace(/[“”"']/g, ""), 110).replace(/\.*$/, "");
  return cleaned;
}

function quotedTopic(title: string) {
  return `“${topicHint(title)}”`;
}

function buildLead(story: NewsStory, _published: string | null, isResearch: boolean) {
  const topic = quotedTopic(story.title);
  // Never put the date in the opening line — keep a stable "source reported on …" form.
  if (isResearch) {
    return `New AI research explores ${topic}.`;
  }
  return `${story.sourceName} reported on ${topic}.`;
}

/** Canonical Dutch opening paired with English (skip awkward MT of the lead). */
export function buildLeadNl(sourceName: string, titleNl: string, isResearch: boolean) {
  const topic = quotedTopic(titleNl || "");
  if (isResearch) {
    return `Nieuw AI-onderzoek verkent ${topic}.`;
  }
  const src = (sourceName || "").trim() || "AI-pers";
  return `${src} rapporteerde over ${topic}.`;
}

/**
 * Strip dates from the opening paragraph and normalize to:
 * EN: "{source} reported on …"
 * NL: "{source} rapporteerde over …"
 */
export function normalizeLeadParagraph(text: string) {
  if (!text) return text;
  const parts = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return text.trim();

  let lead = parts[0]!;

  // Drop parenthetical dates: (21 september 2026)
  lead = lead.replace(/\s*\(\d{1,2}\s+[A-Za-zà-üÀ-Ü.]+\s+\d{4}\)\s*/gi, " ");

  // Drop "op/on 21 september 2026" anywhere in the lead
  lead = lead.replace(
    /\s*(?:op|on)\s+\d{1,2}\s+[A-Za-zà-üÀ-Ü.]+\s+\d{4}\b/gi,
    "",
  );

  // "Op/On DATE, …" already stripped date — also strip leftover leading Op/On
  lead = lead.replace(/^(?:Op|On)\s+/i, "");

  // EN variants → "{source} reported on {topic…}"
  lead = lead
    .replace(
      /^According to\s+(.+?),\s+attention is on\s+/i,
      "$1 reported on ",
    )
    .replace(
      /^(.+?)\s+published a briefing\s+(?:covering\s+)?/i,
      "$1 reported on ",
    )
    .replace(
      /^(.+?)\s+highlighted movement on\s+/i,
      "$1 reported on ",
    )
    .replace(
      /^(.+?)\s+reported new developments around\s+/i,
      "$1 reported on ",
    )
    .replace(
      /^(.+?)\s+reports a notable AI development:\s*/i,
      "$1 reported on ",
    )
    .replace(
      /^Fresh coverage from\s+(.+?)\s+centers on\s+/i,
      "$1 reported on ",
    )
    .replace(
      /^(.+?)\s+flagged an AI-industry update about\s+/i,
      "$1 reported on ",
    )
    .replace(/^(.+?)\s+reported on\s+/i, "$1 reported on ");

  // NL variants → "{source} rapporteerde over {topic…}"
  // Handle "Op DATE rapporteerde SOURCE …" before stripping the date alone.
  lead = lead
    .replace(
      /^(?:Op|On)\s+\d{1,2}\s+\S+\s+\d{4},?\s+rapporteerde\s+(.+?)\s+(?:nieuwe ontwikkelingen rond|over)\s+/i,
      "$1 rapporteerde over ",
    )
    .replace(
      /^(.+?)\s+publiceerde\s+(?:een briefing over|over)\s+/i,
      "$1 rapporteerde over ",
    )
    .replace(
      /^(.+?)\s+benadrukte\s+de beweging rond\s+/i,
      "$1 rapporteerde over ",
    )
    .replace(
      /^(.+?)\s+rapporteerde\s+nieuwe ontwikkelingen rond\s+/i,
      "$1 rapporteerde over ",
    )
    .replace(
      /^rapporteerde\s+(.+?)\s+nieuwe ontwikkelingen rond\s+/i,
      "$1 rapporteerde over ",
    )
    .replace(
      /^rapporteerde\s+(.+?)\s+over\s+/i,
      "$1 rapporteerde over ",
    )
    .replace(/^(.+?)\s+rapporteerde over\s+/i, "$1 rapporteerde over ");

  // Research EN/NL without date
  lead = lead
    .replace(
      /^New AI research(?: published| worth following)?(?: looks at| explores| focuses on)?\s+/i,
      "New AI research explores ",
    )
    .replace(
      /^A research update(?: from)?(?: focuses on)?\s+/i,
      "New AI research explores ",
    )
    .replace(
      /^Researchers outlined fresh findings(?: around)?\s+/i,
      "New AI research explores ",
    )
    .replace(
      /^A recent paper digs into\s+/i,
      "New AI research explores ",
    )
    .replace(
      /^Fresh research highlights progress on\s+/i,
      "New AI research explores ",
    )
    .replace(
      /^Nieuw AI-onderzoek(?: gepubliceerd)?(?: kijkt naar| verkent| richt zich op)?\s+/i,
      "Nieuw AI-onderzoek verkent ",
    );

  lead = lead.replace(/[ \t]{2,}/g, " ").trim();
  parts[0] = lead;
  return parts.join("\n\n");
}

function buildImplications(story: NewsStory, industry: string, isResearch: boolean) {
  const seed = `${story.title}|${story.sourceId}|${industry}`;

  if (isResearch) {
    return hashPick(seed, [
      "The findings matter for labs and product teams that need clearer signals before committing to a new evaluation stack.",
      "If the approach holds up, it could change how practitioners compare baselines, failure modes and deployment readiness.",
      "Readers tracking research-to-product transfer will watch whether follow-up work turns these ideas into reproducible tooling.",
    ]);
  }

  const byIndustry: Record<string, string[]> = {
    "AI / Models": [
      "For teams shipping on foundation models, the immediate checklist is evaluation cost, latency under load, and how quickly the change reaches production APIs.",
      "Model watchers will focus on pricing, rate limits and whether tooling keeps pace with the headline capabilities.",
      "Practically, this is less about hype and more about how fast builders can validate quality, safety and unit economics.",
    ],
    "AI / Automation": [
      "Automation-heavy teams should map where this lands in existing workflows — especially hand-offs, monitoring and rollback paths.",
      "The useful question is which repetitive steps become cheaper or safer once the update is in day-to-day tooling.",
      "Operators will care about reliability and observability as much as the feature list.",
    ],
    "AI / Video": [
      "Creative and product teams will weigh generation quality against turnaround time, licensing constraints and revision loops.",
      "For video pipelines, the bottleneck often shifts from rendering minutes to review capacity and brand consistency.",
      "Production leads should test whether the update cuts iteration cost without introducing brittle artifacts.",
    ],
    "AI / Image": [
      "Design and marketing teams will look at consistency, rights clearance and how well outputs fit existing brand systems.",
      "Image tooling only helps when review cycles shrink — not when teams spend longer cleaning up near-misses.",
      "The practical test is whether this improves first-pass quality for real briefs, not just demos.",
    ],
    "AI / Robotics": [
      "Hardware-adjacent AI moves tend to show up first as better perception, planning reliability or safer human-machine hand-offs.",
      "Teams in physical automation will watch deployment constraints: sensors, latency and failure recovery.",
      "Progress here is measured in field reliability, not just lab demos.",
    ],
    "AI / Security": [
      "Security and platform teams should treat this as a reminder to revisit threat models, access boundaries and model misuse paths.",
      "The update is most relevant where AI systems touch sensitive data, privileged tools or customer-facing automation.",
      "Defenders will care about auditability and how quickly controls can be tuned after the change.",
    ],
    "AI / Infrastructure": [
      "Infrastructure and finance owners will feel this first through energy, capacity planning and where workloads can legally run.",
      "Datacenter and cloud decisions increasingly sit next to model strategy — not after it.",
      "Expect knock-on effects on cost forecasts, location choices and long-term compute contracts.",
    ],
    "AI / Industry": [
      "Industry shifts like this usually reshape budgets and tooling choices before they rewrite product roadmaps.",
      "Teams that depend on AI delivery speed should note what changes for vendors, partners and internal build-vs-buy calls.",
      "The signal for operators is whether this reduces friction in shipping, compliance or supplier lock-in.",
    ],
  };

  const pool = byIndustry[industry] || byIndustry["AI / Industry"];
  return hashPick(seed, pool);
}

export function buildClosingEn(sourceName: string, published: string | null) {
  const src = (sourceName || "").trim() || "the original source";
  if (published) {
    return `Readers can view the full article written by: ${src} as of ${published} via the link below.`;
  }
  return `Readers can view the full article written by: ${src} via the link below.`;
}

function buildClosing(story: NewsStory, published: string | null) {
  return buildClosingEn(story.sourceName, published);
}

/** Dutch closing paired with English (avoids awkward MT of the closer). */
export function buildClosingNl(sourceName: string, published: string | null) {
  const src = (sourceName || "").trim() || "de originele bron";
  if (published) {
    return `Lezers kunnen het volledige artikel geschreven door: ${src} vanaf ${published} bekijken via de onderstaande link.`;
  }
  return `Lezers kunnen het volledige artikel geschreven door: ${src} bekijken via de onderstaande link.`;
}

/** Detect old / intermediate closings that should be replaced. */
export const AWKWARD_CLOSING_RE =
  /readers who need the full timeline|lezers die de volledige tijdlijn|for primary sourcing and quotes|voor primaire bronnen en citaten|full details remain in the original|volledige details (blijven|staan) in|for primary sourcing, open the linked|voor primaire bronnen,? open|the .+ report remains the best place for the complete context|het .+(-)?rapport blijft de beste plek|leser,? die (die )?vollst[aä]ndige|lecteurs qui ont besoin de la chronologie|lectores que necesitan la (cronolog[ií]a|l[ií]nea de tiempo)|czytelnicy,? którzy potrzebują pełnej|читатели,? которым нужна полная|readers can open the full article on|you can read the full article on|the full article is available on|lezers kunnen het volledige artikel op .+ openen/i;

const DESIRED_CLOSING_RE =
  /bekijken via de onderstaande link\.?$|via the link below\.?$/i;

export function isAwkwardClosingParagraph(text: string) {
  const t = (text || "").trim();
  if (!t) return false;
  if (DESIRED_CLOSING_RE.test(t)) return false;
  return AWKWARD_CLOSING_RE.test(t);
}

/** True when the last paragraph is a source-closer that is not yet the desired template. */
export function isOutdatedClosingParagraph(text: string) {
  const t = (text || "").trim();
  if (!t) return false;
  if (DESIRED_CLOSING_RE.test(t)) return false;
  return (
    isAwkwardClosingParagraph(t) ||
    /lezers kunnen het volledige artikel/i.test(t) ||
    /readers can (open|view|read) the full article/i.test(t) ||
    /the full article is available/i.test(t) ||
    /you can read the full article/i.test(t)
  );
}

export function replaceLastParagraph(text: string, nextClosing: string) {
  const parts = (text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return nextClosing.trim();
  if (!isAwkwardClosingParagraph(parts[parts.length - 1]!)) {
    return text.trim();
  }
  parts[parts.length - 1] = nextClosing.trim();
  return parts.join("\n\n");
}

/** Always rewrite the first paragraph (used when normalizing leads). */
export function setFirstParagraph(text: string, nextLead: string) {
  const parts = (text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return nextLead.trim();
  parts[0] = nextLead.trim();
  return parts.join("\n\n");
}

/** Always rewrite the final paragraph (used when repairing known-bad closings). */
export function setLastParagraph(text: string, nextClosing: string) {
  const parts = (text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return nextClosing.trim();
  parts[parts.length - 1] = nextClosing.trim();
  return parts.join("\n\n");
}

export function buildEnglishDraft(
  story: NewsStory,
): Omit<
  GeneratedNewsDraft,
  "titleNl" | "excerptNl" | "descriptionNl" | "translations"
> {
  const title = truncate(story.title, 140);
  const paragraphs = paragraphize(story.summary);
  const published = formatPublishedDate(story.publishedAt);
  const isResearch = story.sourceId === "arxiv-ai" || /arxiv\.org/i.test(story.url);
  const industry = inferIndustry(story);

  const lead = buildLead(story, published, isResearch);
  const implications = buildImplications(story, industry, isResearch);
  const closing = buildClosing(story, published);

  const body =
    paragraphs.length > 0
      ? paragraphs
      : [
          `${story.sourceName} shared a practical AI-industry update for builders and operators following ${topicHint(title)}.`,
        ];

  // Unique subtitle teaser — keep the full factual summary in the body.
  const excerpt = truncate(
    hashPick(`${story.url}|excerpt`, [
      `A closer look at today’s AI industry move from ${story.sourceName}.`,
      `${story.sourceName} covers a timely development for AI builders and operators.`,
      `What changed — and why teams following AI delivery should pay attention.`,
      `Fresh reporting from ${story.sourceName} on a notable shift in the AI stack.`,
      `Context for product, infrastructure and automation teams watching this space.`,
    ]),
    220,
  );

  const excerptNorm = cleanText(excerpt).toLowerCase();
  const descriptionParts: string[] = [];
  for (const part of [lead, ...body, implications, closing]) {
    const cleaned = cleanText(part);
    if (!cleaned) continue;
    if (cleaned.toLowerCase() === excerptNorm) continue;
    if (descriptionParts.some((p) => p.toLowerCase() === cleaned.toLowerCase())) {
      continue;
    }
    descriptionParts.push(cleaned);
  }

  const description = descriptionParts.join("\n\n");

  return {
    title,
    excerpt,
    description,
    industry,
    tags: inferTags(story),
  };
}

async function translateMultiline(text: string, target: string, source: string) {
  const parts = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return translateText(text, target, source);
  const translated: string[] = [];
  for (const part of parts) {
    translated.push(await translateText(part, target, source));
  }
  return translated.join("\n\n");
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
  // Retry Dutch hard — never seed English into NL fields (cron/create will resume).
  let lastNlError: unknown;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      titleNl = await translateText(en.title, "nl", "en");
      excerptNl = await translateText(en.excerpt, "nl", "en");
      descriptionNl = await translateMultiline(en.description, "nl", "en");
      if (
        isAcceptableTranslation(en.title, titleNl, "en", "nl") &&
        isAcceptableTranslation(en.excerpt, excerptNl, "en", "nl") &&
        isAcceptableTranslation(en.description, descriptionNl, "en", "nl")
      ) {
        lastNlError = null;
        break;
      }
      lastNlError = new Error("Dutch quality check failed");
      titleNl = "";
      excerptNl = "";
      descriptionNl = "";
    } catch (error) {
      lastNlError = error;
      titleNl = "";
      excerptNl = "";
      descriptionNl = "";
      const wait = 2_000 * 2 ** attempt;
      console.warn(
        `[auto-news] Dutch translate retry ${attempt + 1}/4 after ${Math.round(wait / 1000)}s`,
        error instanceof Error ? error.message : error,
      );
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  if (lastNlError) {
    console.warn(
      "[auto-news] Dutch translate deferred to post-publish fill",
      story.url,
      lastNlError instanceof Error ? lastNlError.message : lastNlError,
    );
  }

  const nlSeed = {
    title: titleNl,
    excerpt: excerptNl,
    description: descriptionNl,
  };

  // Keep a fixed Dutch lead ("{source} rapporteerde over …") — never leave dates in the opener.
  if (nlSeed.description && nlSeed.title) {
    const isResearch =
      cleaned.sourceId === "arxiv-ai" || /arxiv\.org/i.test(cleaned.url);
    nlSeed.description = setFirstParagraph(
      nlSeed.description,
      buildLeadNl(cleaned.sourceName, nlSeed.title, isResearch),
    );
  }

  const translations: NewsTranslationsMap = {};
  if (nlSeed.title && nlSeed.excerpt && nlSeed.description) {
    translations.nl = nlSeed;
  }

  const draft = sanitizeNewsDraft({
    ...en,
    description: normalizeLeadParagraph(en.description),
    titleNl: nlSeed.title,
    excerptNl: nlSeed.excerpt,
    descriptionNl: nlSeed.description,
    translations,
  });

  if (
    looksLikeRawFeedCopy(draft.excerpt) ||
    looksLikeRawFeedCopy(draft.description) ||
    (draft.excerptNl && looksLikeRawFeedCopy(draft.excerptNl)) ||
    (draft.descriptionNl && looksLikeRawFeedCopy(draft.descriptionNl))
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
      description: normalizeLeadParagraph(cleanSourceSummary(copy.description)),
    };
  }

  return {
    ...draft,
    title: cleanText(draft.title),
    titleNl: cleanText(draft.titleNl),
    excerpt: cleanSourceSummary(draft.excerpt),
    excerptNl: cleanSourceSummary(draft.excerptNl),
    description: normalizeLeadParagraph(cleanSourceSummary(draft.description)),
    descriptionNl: normalizeLeadParagraph(cleanSourceSummary(draft.descriptionNl)),
    translations,
    industry: cleanText(draft.industry),
    tags: draft.tags
      .map((t) => cleanText(t))
      .filter((t) => t && !/^(auto-news|arxiv-ai)$/i.test(t))
      .slice(0, 6),
  };
}

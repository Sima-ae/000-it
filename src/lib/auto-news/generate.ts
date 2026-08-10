import type { NewsStory } from "@/lib/auto-news/fetch-stories";

export type GeneratedNewsDraft = {
  title: string;
  titleNl: string;
  excerpt: string;
  excerptNl: string;
  description: string;
  descriptionNl: string;
  industry: string;
  tags: string[];
};

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, max: number) {
  const text = cleanText(value);
  if (text.length <= max) return text;
  const sliced = text.slice(0, max - 1);
  const cut = sliced.lastIndexOf(" ");
  return `${(cut > 40 ? sliced.slice(0, cut) : sliced).trim()}…`;
}

function paragraphize(summary: string) {
  const text = cleanText(summary);
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
  tags.add(story.sourceName.split(" ")[0] || story.sourceId);
  return Array.from(tags).slice(0, 6);
}

async function translateToNl(text: string): Promise<string> {
  const input = cleanText(text);
  if (!input) return "";

  // Chunk long bodies so free translate endpoints stay reliable
  const chunks: string[] = [];
  if (input.length <= 900) {
    chunks.push(input);
  } else {
    const paras = input.split(/\n\n+/);
    let buf = "";
    for (const para of paras) {
      if ((buf + "\n\n" + para).length > 900 && buf) {
        chunks.push(buf);
        buf = para;
      } else {
        buf = buf ? `${buf}\n\n${para}` : para;
      }
    }
    if (buf) chunks.push(buf);
  }

  const translated: string[] = [];
  for (const chunk of chunks) {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=nl&dt=t&q=" +
      encodeURIComponent(chunk);
    const res = await fetch(url, {
      headers: { "User-Agent": "TripleZeroIT-AutoNews/1.0" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      throw new Error(`Translate failed (${res.status})`);
    }
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
      throw new Error("Unexpected translate payload");
    }
    const piece = data[0]
      .map((row: unknown) => (Array.isArray(row) ? String(row[0] || "") : ""))
      .join("");
    translated.push(piece.trim());
  }

  return translated.join("\n\n").trim();
}

function buildEnglishDraft(story: NewsStory): Omit<GeneratedNewsDraft, "titleNl" | "excerptNl" | "descriptionNl"> {
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

  const lead = published
    ? `${story.sourceName} published an update on ${published}: ${title}.`
    : `${story.sourceName} reports: ${title}.`;

  const body =
    paragraphs.length > 0
      ? paragraphs.join("\n\n")
      : `${story.sourceName} shared a new AI-industry update. The announcement focuses on developments that matter for teams working with models, automation and digital production.`;

  const takeaway =
    "For agencies and product teams, the practical step is to verify how this affects cost, tooling and workflows — then update prompts, automations and publishing pipelines where needed. Always cross-check the original source before changing production systems.";

  const description = [lead, body, takeaway].join("\n\n");
  const excerpt = truncate(paragraphs[0] || lead, 220);

  return {
    title,
    excerpt,
    description,
    industry: inferIndustry(story),
    tags: inferTags(story),
  };
}

/** Build EN+NL posts from real RSS facts (no OpenAI key required). */
export async function generateBilingualNewsDraft(
  story: NewsStory,
): Promise<GeneratedNewsDraft> {
  const en = buildEnglishDraft(story);
  const [titleNl, excerptNl, descriptionNl] = await Promise.all([
    translateToNl(en.title),
    translateToNl(en.excerpt),
    translateToNl(en.description),
  ]);

  return {
    ...en,
    titleNl: titleNl || en.title,
    excerptNl: excerptNl || en.excerpt,
    descriptionNl: descriptionNl || en.description,
  };
}

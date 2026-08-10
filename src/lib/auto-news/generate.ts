import { z } from "zod";
import type { NewsStory } from "@/lib/auto-news/fetch-stories";

const generatedSchema = z.object({
  title: z.string().min(8).max(160),
  titleNl: z.string().min(8).max(160),
  excerpt: z.string().min(40).max(280),
  excerptNl: z.string().min(40).max(280),
  description: z.string().min(400),
  descriptionNl: z.string().min(400),
  industry: z.string().min(2).max(60),
  tags: z.array(z.string().min(1)).min(3).max(6),
});

export type GeneratedNewsDraft = z.infer<typeof generatedSchema>;

function extractJsonObject(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] || text).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Model did not return JSON");
  return JSON.parse(raw.slice(start, end + 1)) as unknown;
}

export async function generateBilingualNewsDraft(
  story: NewsStory,
): Promise<GeneratedNewsDraft> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const model = process.env.OPENAI_NEWS_MODEL?.trim() || "gpt-4o-mini";

  const system = [
    "You are a senior technology journalist for TripleZero iT (Dutch AI/web agency).",
    "Write factual blog posts ONLY from the provided source story. Do not invent numbers, dates, product names, or quotes.",
    "If a detail is missing, omit it rather than guessing.",
    "Return STRICT JSON with keys: title, titleNl, excerpt, excerptNl, description, descriptionNl, industry, tags.",
    "description and descriptionNl must be 3-5 short paragraphs separated by \\n\\n.",
    "Dutch must be natural professional Netherlands Dutch (not literal word-for-word).",
    "English must be clear professional EN.",
    "tags: 3-6 short topical tags.",
    "industry: short category like AI / Models, AI / Video, Automation, etc.",
  ].join(" ");

  const user = JSON.stringify(
    {
      sourceName: story.sourceName,
      sourceUrl: story.url,
      title: story.title,
      publishedAt: story.publishedAt,
      summary: story.summary,
    },
    null,
    2,
  );

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Create one bilingual news post JSON from this real source:\n${user}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenAI error ${res.status}: ${body.slice(0, 300)}`);
  }

  const payload = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty content");

  return generatedSchema.parse(extractJsonObject(content));
}

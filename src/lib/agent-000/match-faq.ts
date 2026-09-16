import { getFaqContent, type FaqItem } from "@/content/faq";

export type FaqMatch = {
  faqId: string;
  categoryId: string;
  question: string;
  answer: string;
  confidence: number;
};

const STOP = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "be",
  "to",
  "of",
  "in",
  "on",
  "for",
  "and",
  "or",
  "with",
  "how",
  "what",
  "when",
  "where",
  "why",
  "who",
  "do",
  "does",
  "did",
  "can",
  "could",
  "should",
  "would",
  "i",
  "you",
  "we",
  "my",
  "our",
  "your",
  "me",
  "de",
  "het",
  "een",
  "van",
  "en",
  "in",
  "op",
  "voor",
  "met",
  "is",
  "zijn",
  "was",
  "wordt",
  "hoe",
  "wat",
  "wanneer",
  "waar",
  "waarom",
  "wie",
  "kan",
  "kunnen",
  "ik",
  "jij",
  "u",
  "wij",
  "mijn",
  "uw",
  "ons",
]);

export function normalizeFaqText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text: string): string[] {
  return normalizeFaqText(text)
    .split(" ")
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function scoreItem(queryTokens: string[], item: FaqItem): number {
  if (!queryTokens.length) return 0;
  const qNorm = normalizeFaqText(item.question);
  const aNorm = normalizeFaqText(item.answer);
  const qTok = new Set(tokens(item.question));
  const aTok = new Set(tokens(item.answer));

  let hitQ = 0;
  let hitA = 0;
  let phraseBonus = 0;
  const joined = queryTokens.join(" ");
  if (joined.length > 6 && qNorm.includes(joined)) phraseBonus += 0.45;
  else if (joined.length > 6 && aNorm.includes(joined)) phraseBonus += 0.2;

  for (const t of queryTokens) {
    if (qTok.has(t)) hitQ += 1;
    else if (qNorm.includes(t)) hitQ += 0.6;
    if (aTok.has(t)) hitA += 0.35;
    else if (aNorm.includes(t)) hitA += 0.2;
  }

  const coverage = (hitQ + hitA) / queryTokens.length;
  // Prefer question hits
  const weighted = (hitQ * 1.4 + hitA * 0.5) / (queryTokens.length * 1.4);
  return Math.min(1, Math.max(coverage * 0.55 + weighted * 0.45 + phraseBonus, 0));
}

/**
 * Rank FAQ items for a free-text question. Confidence 0–1.
 */
export function matchFaq(locale: string, question: string): FaqMatch | null {
  const q = question.trim();
  if (q.length < 2) return null;

  const pack = getFaqContent(locale);
  const queryTokens = tokens(q);
  if (!queryTokens.length) return null;

  let best: FaqMatch | null = null;
  for (const category of pack.categories) {
    for (const item of category.items) {
      const confidence = scoreItem(queryTokens, item);
      if (!best || confidence > best.confidence) {
        best = {
          faqId: item.id,
          categoryId: category.id,
          question: item.question,
          answer: item.answer,
          confidence,
        };
      }
    }
  }

  return best;
}

/** Minimum confidence to treat as a solid FAQ hit. */
export const FAQ_CONFIDENCE_HIT = 0.28;
export const FAQ_CONFIDENCE_STRONG = 0.42;

import { getFaqContent, type FaqItem } from "@/content/faq";
import {
  normalizeAgentText,
  tokenizeAgentText,
  tokenHitScore,
} from "@/lib/agent-000/text";

export type FaqMatch = {
  faqId: string;
  categoryId: string;
  question: string;
  answer: string;
  confidence: number;
};

function scoreItem(queryTokens: string[], item: FaqItem): number {
  if (!queryTokens.length) return 0;
  const qNorm = normalizeAgentText(item.question);
  const aNorm = normalizeAgentText(item.answer);
  const qTok = new Set(tokenizeAgentText(item.question));
  const aTok = new Set(tokenizeAgentText(item.answer));

  let hitQ = 0;
  let hitA = 0;
  let phraseBonus = 0;
  const joined = queryTokens.join(" ");
  if (joined.length > 6 && qNorm.includes(joined)) phraseBonus += 0.45;
  else if (joined.length > 6 && aNorm.includes(joined)) phraseBonus += 0.2;

  for (const t of queryTokens) {
    hitQ += tokenHitScore(t, qTok, qNorm);
    hitA += tokenHitScore(t, aTok, aNorm) * 0.55;
  }

  const coverage = (hitQ + hitA) / queryTokens.length;
  const weighted = (hitQ * 1.4 + hitA * 0.5) / (queryTokens.length * 1.4);
  let score = Math.min(1, Math.max(coverage * 0.55 + weighted * 0.45 + phraseBonus, 0));

  // Prefer question hits; demote answer-only / partial-question keyword noise.
  const questionCoverage = hitQ / queryTokens.length;
  if (questionCoverage < 0.2) score *= 0.5;
  else if (questionCoverage < 0.45) score *= 0.78;
  else if (questionCoverage < 0.7) score *= 0.92;

  return score;
}

/**
 * Rank FAQ items for a free-text question. Confidence 0–1.
 */
export function rankFaq(
  locale: string,
  question: string,
  limit = 6,
): FaqMatch[] {
  const q = question.trim();
  if (q.length < 2) return [];

  const pack = getFaqContent(locale);
  const queryTokens = tokenizeAgentText(q);
  if (!queryTokens.length) return [];

  const scored: FaqMatch[] = [];
  for (const category of pack.categories) {
    for (const item of category.items) {
      const confidence = scoreItem(queryTokens, item);
      if (confidence < 0.12) continue;
      scored.push({
        faqId: item.id,
        categoryId: category.id,
        question: item.question,
        answer: item.answer,
        confidence,
      });
    }
  }

  scored.sort((a, b) => b.confidence - a.confidence);
  return scored.slice(0, Math.max(1, limit));
}

/** Best single FAQ match (legacy helper). */
export function matchFaq(locale: string, question: string): FaqMatch | null {
  return rankFaq(locale, question, 1)[0] ?? null;
}

export function getFaqById(locale: string, faqId: string): FaqMatch | null {
  const pack = getFaqContent(locale);
  for (const category of pack.categories) {
    const item = category.items.find((i) => i.id === faqId);
    if (item) {
      return {
        faqId: item.id,
        categoryId: category.id,
        question: item.question,
        answer: item.answer,
        confidence: 1,
      };
    }
  }
  return null;
}

/** Minimum confidence to treat as a solid FAQ hit. */
export const FAQ_CONFIDENCE_HIT = 0.28;
export const FAQ_CONFIDENCE_STRONG = 0.42;
/** Near-tie gap: if #2 is within this of #1, ask which topic. */
export const FAQ_CLARIFY_GAP = 0.09;

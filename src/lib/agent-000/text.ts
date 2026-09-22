/** Shared text helpers for Agent 000 retrieval. */

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
  "je",
  "u",
  "wij",
  "mijn",
  "jouw",
  "uw",
  "ons",
  "also",
  "about",
  "please",
  "graag",
  "alsjeblieft",
  "aub",
  "this",
  "that",
  "these",
  "those",
  "dit",
  "dat",
  "deze",
  "die",
]);

export function normalizeAgentText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeAgentText(text: string): string[] {
  return normalizeAgentText(text)
    .split(" ")
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/** Soft token match: exact, contains, or shared prefix (min 4 chars). */
export function tokenHitScore(needle: string, hayTokens: Set<string>, hayNorm: string): number {
  if (hayTokens.has(needle)) return 1;
  if (hayNorm.includes(needle)) return 0.65;
  if (needle.length >= 4) {
    for (const t of hayTokens) {
      if (t.length < 4) continue;
      if (t.startsWith(needle) || needle.startsWith(t)) return 0.45;
    }
  }
  return 0;
}

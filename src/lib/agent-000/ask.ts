import { localizedHref } from "@/i18n/pathnames";
import {
  FAQ_CLARIFY_GAP,
  FAQ_CONFIDENCE_HIT,
  FAQ_CONFIDENCE_STRONG,
  getFaqById,
  rankFaq,
  type FaqMatch,
} from "@/lib/agent-000/match-faq";
import {
  KB_CONFIDENCE_HIT,
  KB_CONFIDENCE_STRONG,
  rankKennisbank,
  type KennisbankMatch,
} from "@/lib/agent-000/match-kennisbank";
import { detectIntents, type AgentIntent } from "@/lib/agent-000/intents";
import { normalizeAgentText, tokenizeAgentText } from "@/lib/agent-000/text";

export type AgentAction = "open_ticket" | "book_appointment" | "contact";

export type AgentLink = {
  kind: "faq" | "kennisbank";
  title: string;
  href: string;
  faqId?: string;
  categoryId?: string;
  /** Re-ask this to lock in a single FAQ answer after clarify. */
  askQuestion?: string;
  confidence: number;
};

export type AgentAskResult = {
  answer: string;
  faqId: string | null;
  categoryId: string | null;
  matchedQuestion: string | null;
  confidence: number;
  actions: AgentAction[];
  intents: AgentIntent[];
  mode: "answer" | "clarify";
  links: AgentLink[];
};

export type BuildAgentReplyOptions = {
  /** Force a specific FAQ item (after visitor picks a clarify option). */
  faqId?: string;
};

function isNl(locale: string) {
  return locale.toLowerCase().startsWith("nl");
}

function greeting(locale: string) {
  return isNl(locale)
    ? "Hallo, ik ben Agent 000."
    : "Hi, I'm Agent 000.";
}

function lowConfidenceCopy(locale: string) {
  return isNl(locale)
    ? "Ik kan dit nog niet zeker beantwoorden vanuit onze FAQ of kennisbank. Je kunt hieronder gerelateerde onderwerpen bekijken, een ticket openen, een afspraak boeken, of contact opnemen — ons team helpt je verder."
    : "I'm not fully sure from our FAQ or knowledge base yet. You can browse related topics below, open a ticket, book an appointment, or contact us — our team will help.";
}

function escalateHint(locale: string) {
  return isNl(locale)
    ? "\n\nWil je liever een mens? Open een ticket of boek een afspraak."
    : "\n\nPrefer a human? Open a ticket or book an appointment.";
}

function clarifyCopy(locale: string) {
  return isNl(locale)
    ? "Ik vond meerdere relevante onderwerpen. Welke past het best bij wat je zoekt? Kies een optie hieronder — dan geef ik een gericht antwoord."
    : "I found several relevant topics. Which one matches what you're looking for? Pick an option below and I'll give a focused answer.";
}

function relatedIntro(locale: string) {
  return isNl(locale) ? "\n\nGerelateerd:" : "\n\nRelated:";
}

function faqDeepHref(locale: string, faqId: string) {
  return `${localizedHref(locale, "/faq")}#faq-item-${faqId}`;
}

function kbHref(locale: string, categorySlug: string, slug: string) {
  return localizedHref(locale, `/kennisbank/${categorySlug}/${slug}`);
}

function faqLink(locale: string, match: FaqMatch): AgentLink {
  return {
    kind: "faq",
    title: match.question,
    href: faqDeepHref(locale, match.faqId),
    faqId: match.faqId,
    categoryId: match.categoryId,
    askQuestion: match.question,
    confidence: match.confidence,
  };
}

function kbLink(locale: string, match: KennisbankMatch): AgentLink {
  return {
    kind: "kennisbank",
    title: match.title,
    href: kbHref(locale, match.categorySlug, match.slug),
    confidence: match.confidence,
  };
}

function formatLinksInAnswer(locale: string, links: AgentLink[]): string {
  if (!links.length) return "";
  const lines = links.map((link, i) => {
    const label =
      link.kind === "faq"
        ? isNl(locale)
          ? "FAQ"
          : "FAQ"
        : isNl(locale)
          ? "Kennisbank"
          : "Knowledge base";
    return `${i + 1}. [${label}] ${link.title}\n   ${link.href}`;
  });
  return `${relatedIntro(locale)}\n${lines.join("\n")}`;
}

function collectIntents(question: string) {
  const intents = detectIntents(question);
  const actions = new Set<AgentAction>();
  for (const intent of intents) {
    if (intent === "book_appointment") actions.add("book_appointment");
    if (intent === "open_ticket" || intent === "human") actions.add("open_ticket");
    if (intent === "contact") actions.add("contact");
  }
  return { intents, actions };
}

function uniqueLinks(links: AgentLink[], limit = 5): AgentLink[] {
  const seen = new Set<string>();
  const out: AgentLink[] = [];
  for (const link of links) {
    const key = `${link.kind}:${link.href}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(link);
    if (out.length >= limit) break;
  }
  return out;
}

const TOPIC_NOISE = new Set([
  "triplezero",
  "triple",
  "zero",
  "hosting",
  "website",
  "site",
  "web",
  "online",
  "service",
  "services",
  "diensten",
  "help",
  "support",
]);

function sharesTopic(seed: string, other: string): boolean {
  const a = tokenizeAgentText(seed).filter((t) => !TOPIC_NOISE.has(t) && t.length > 2);
  if (!a.length) return false;
  const b = new Set(tokenizeAgentText(other));
  let hits = 0;
  for (const t of a) if (b.has(t)) hits += 1;
  return hits >= 1;
}

function queryCoveredByQuestion(question: string, faqQuestion: string): number {
  const qTok = tokenizeAgentText(question);
  if (!qTok.length) return 0;
  const faqNorm = normalizeAgentText(faqQuestion);
  const faqTok = new Set(tokenizeAgentText(faqQuestion));
  let hits = 0;
  for (const t of qTok) {
    if (faqTok.has(t) || faqNorm.includes(t)) hits += 1;
  }
  return hits / qTok.length;
}

function relatedKbLinks(
  locale: string,
  seedText: string,
  kbHits: KennisbankMatch[],
  limit = 3,
): AgentLink[] {
  return kbHits
    .filter(
      (m) =>
        m.confidence >= KB_CONFIDENCE_HIT &&
        sharesTopic(seedText, `${m.title} ${m.topic} ${m.categorySlug}`),
    )
    .slice(0, limit)
    .map((m) => kbLink(locale, m));
}

/**
 * Build Agent 000 reply from FAQ + kennisbank keyword retrieval + intents.
 */
export function buildAgentReply(
  locale: string,
  question: string,
  opts?: BuildAgentReplyOptions,
): AgentAskResult {
  const { intents, actions } = collectIntents(question);

  if (opts?.faqId) {
    const forced = getFaqById(locale, opts.faqId);
    if (forced) {
      const kb = rankKennisbank(`${forced.question} ${question}`, 6);
      const links = uniqueLinks([
        faqLink(locale, forced),
        ...relatedKbLinks(locale, forced.question, kb, 3),
      ]);
      const answer = `${greeting(locale)} ${forced.answer}${formatLinksInAnswer(locale, links)}`;
      return {
        answer,
        faqId: forced.faqId,
        categoryId: forced.categoryId,
        matchedQuestion: forced.question,
        confidence: 1,
        actions: [...actions],
        intents,
        mode: "answer",
        links,
      };
    }
  }

  const faqHits = rankFaq(locale, question, 6);
  const kbHits = rankKennisbank(question, 6);
  const bestFaq = faqHits[0] ?? null;
  const secondFaq = faqHits[1] ?? null;
  const bestKb = kbHits[0] ?? null;
  const topConfidence = Math.max(bestFaq?.confidence ?? 0, bestKb?.confidence ?? 0);

  const faqStrong = (bestFaq?.confidence ?? 0) >= FAQ_CONFIDENCE_STRONG;
  const faqHit = (bestFaq?.confidence ?? 0) >= FAQ_CONFIDENCE_HIT;
  const kbStrong = (bestKb?.confidence ?? 0) >= KB_CONFIDENCE_STRONG;
  const kbHit = (bestKb?.confidence ?? 0) >= KB_CONFIDENCE_HIT;
  const faqQuestionCover = bestFaq
    ? queryCoveredByQuestion(question, bestFaq.question)
    : 0;
  const contentQueryTokens = tokenizeAgentText(question).filter(
    (t) => !TOPIC_NOISE.has(t),
  );
  const minCover =
    contentQueryTokens.length >= 2 ? 0.6 : faqStrong ? 0.25 : 0.45;
  const faqReliable =
    Boolean(bestFaq) && faqHit && faqQuestionCover >= minCover;

  const faqNearTie =
    faqReliable &&
    secondFaq &&
    bestFaq &&
    bestFaq.confidence - secondFaq.confidence < FAQ_CLARIFY_GAP &&
    secondFaq.confidence >= FAQ_CONFIDENCE_HIT;

  const multiKb =
    kbHit &&
    kbHits.filter((m) => m.confidence >= KB_CONFIDENCE_HIT).length >= 2 &&
    !faqStrong;

  const faqVsKbAmbiguous =
    faqHit &&
    kbHit &&
    bestFaq &&
    bestKb &&
    !faqStrong &&
    Math.abs(bestFaq.confidence - bestKb.confidence) < 0.12;

  // Ambiguous: several close FAQ hits, weak FAQ vs KB, or KB-only multi-hits.
  if (faqNearTie || faqVsKbAmbiguous || (multiKb && !faqReliable)) {
    const clarifyFaq = faqHits
      .filter((m) => m.confidence >= FAQ_CONFIDENCE_HIT)
      .slice(0, 4)
      .map((m) => faqLink(locale, m));
    const clarifyKb = kbHits
      .filter((m) => m.confidence >= KB_CONFIDENCE_HIT)
      .slice(0, 4)
      .map((m) => kbLink(locale, m));
    const links = uniqueLinks([...clarifyFaq, ...clarifyKb], 6);
    actions.add("open_ticket");
    actions.add("book_appointment");
    actions.add("contact");

    return {
      answer: `${greeting(locale)} ${clarifyCopy(locale)}${formatLinksInAnswer(locale, links)}`,
      faqId: null,
      categoryId: null,
      matchedQuestion: null,
      confidence: topConfidence,
      actions: [...actions],
      intents,
      mode: "clarify",
      links,
    };
  }

  // Strong / solid FAQ answer (question must cover the query)
  if (faqReliable && bestFaq) {
    const links = uniqueLinks(
      [
        faqLink(locale, bestFaq),
        ...relatedKbLinks(locale, `${bestFaq.question} ${question}`, kbHits, 3),
      ],
      5,
    );
    let answer = `${greeting(locale)} ${bestFaq.answer}`;
    answer += formatLinksInAnswer(locale, links);
    if (!faqStrong) {
      answer += escalateHint(locale);
      actions.add("open_ticket");
      actions.add("book_appointment");
    }
    if (intents.includes("book_appointment")) actions.add("book_appointment");

    return {
      answer,
      faqId: bestFaq.faqId,
      categoryId: bestFaq.categoryId,
      matchedQuestion: bestFaq.question,
      confidence: bestFaq.confidence,
      actions: [...actions],
      intents,
      mode: "answer",
      links,
    };
  }

  // KB-only strong hit (no FAQ)
  if (kbHit && bestKb) {
    const links = uniqueLinks(
      kbHits
        .filter((m) => m.confidence >= KB_CONFIDENCE_HIT)
        .slice(0, 4)
        .map((m) => kbLink(locale, m)),
      4,
    );
    const lead = isNl(locale)
      ? `Ik vond dit in onze kennisbank: “${bestKb.title}”. Open het artikel voor de volledige uitleg.`
      : `I found this in our knowledge base: “${bestKb.title}”. Open the article for the full guide.`;
    let answer = `${greeting(locale)} ${lead}${formatLinksInAnswer(locale, links)}`;
    if (!kbStrong) {
      answer += escalateHint(locale);
      actions.add("open_ticket");
      actions.add("book_appointment");
    }
    actions.add("contact");

    return {
      answer,
      faqId: null,
      categoryId: null,
      matchedQuestion: null,
      confidence: bestKb.confidence,
      actions: [...actions],
      intents,
      mode: links.length > 1 ? "clarify" : "answer",
      links,
    };
  }

  // Soft suggestions + escalate
  const softLinks = uniqueLinks(
    [
      ...faqHits.slice(0, 3).map((m) => faqLink(locale, m)),
      ...kbHits.slice(0, 3).map((m) => kbLink(locale, m)),
    ],
    5,
  );
  actions.add("open_ticket");
  actions.add("book_appointment");
  actions.add("contact");

  return {
    answer: `${greeting(locale)} ${lowConfidenceCopy(locale)}${formatLinksInAnswer(locale, softLinks)}`,
    faqId: null,
    categoryId: null,
    matchedQuestion: null,
    confidence: topConfidence,
    actions: [...actions],
    intents,
    mode: softLinks.length > 1 ? "clarify" : "answer",
    links: softLinks,
  };
}

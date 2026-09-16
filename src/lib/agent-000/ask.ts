import {
  FAQ_CONFIDENCE_HIT,
  FAQ_CONFIDENCE_STRONG,
  matchFaq,
} from "@/lib/agent-000/match-faq";
import { detectIntents, type AgentIntent } from "@/lib/agent-000/intents";

export type AgentAction = "open_ticket" | "book_appointment" | "contact";

export type AgentAskResult = {
  answer: string;
  faqId: string | null;
  categoryId: string | null;
  matchedQuestion: string | null;
  confidence: number;
  actions: AgentAction[];
  intents: AgentIntent[];
};

function greeting(locale: string) {
  const isNl = locale.toLowerCase().startsWith("nl");
  return isNl
    ? "Hallo, ik ben Agent 000."
    : "Hi, I'm Agent 000.";
}

function lowConfidenceCopy(locale: string) {
  const isNl = locale.toLowerCase().startsWith("nl");
  return isNl
    ? "Ik kan dit nog niet zeker beantwoorden vanuit onze FAQ. U kunt een ticket openen, een afspraak boeken, of contact opnemen — ons team helpt u verder."
    : "I'm not fully sure from our FAQ yet. You can open a ticket, book an appointment, or contact us — our team will help.";
}

function escalateHint(locale: string) {
  const isNl = locale.toLowerCase().startsWith("nl");
  return isNl
    ? "\n\nWil u liever een mens? Open een ticket of boek een afspraak."
    : "\n\nPrefer a human? Open a ticket or book an appointment.";
}

/**
 * Build Agent 000 reply from FAQ retrieval + intent detection.
 */
export function buildAgentReply(locale: string, question: string): AgentAskResult {
  const intents = detectIntents(question);
  const match = matchFaq(locale, question);
  const confidence = match?.confidence ?? 0;
  const actions = new Set<AgentAction>();

  for (const intent of intents) {
    if (intent === "book_appointment") actions.add("book_appointment");
    if (intent === "open_ticket" || intent === "human") actions.add("open_ticket");
    if (intent === "contact") actions.add("contact");
  }

  const strong = confidence >= FAQ_CONFIDENCE_STRONG;
  const hit = confidence >= FAQ_CONFIDENCE_HIT;

  if (hit && match) {
    let answer = `${greeting(locale)} ${match.answer}`;
    if (!strong) {
      answer += escalateHint(locale);
      actions.add("open_ticket");
      actions.add("book_appointment");
    }
    if (intents.includes("book_appointment")) actions.add("book_appointment");
    return {
      answer,
      faqId: match.faqId,
      categoryId: match.categoryId,
      matchedQuestion: match.question,
      confidence,
      actions: [...actions],
      intents,
    };
  }

  actions.add("open_ticket");
  actions.add("book_appointment");
  actions.add("contact");

  return {
    answer: `${greeting(locale)} ${lowConfidenceCopy(locale)}`,
    faqId: null,
    categoryId: null,
    matchedQuestion: null,
    confidence,
    actions: [...actions],
    intents,
  };
}

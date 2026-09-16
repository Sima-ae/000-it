import { normalizeAgentText } from "@/lib/agent-000/text";

export type AgentIntent = "book_appointment" | "open_ticket" | "contact" | "human";

const INTENT_PATTERNS: Array<{ intent: AgentIntent; re: RegExp }> = [
  {
    intent: "book_appointment",
    re: /\b(book|booking|appointment|schedule|call|meeting|afspraak|inplannen|plannen|boeken|gesprek)\b/i,
  },
  {
    intent: "open_ticket",
    re: /\b(ticket|support|helpdesk|issue|problem|bug|klacht|storing|downtime|urgente?|spoed)\b/i,
  },
  {
    intent: "human",
    re: /\b(human|person|agent|medewerker|mens|iemand|staff|advisor|adviseur|bellen)\b/i,
  },
  {
    intent: "contact",
    re: /\b(contact|email|mail|bereik|reach|whatsapp)\b/i,
  },
];

export function detectIntents(question: string): AgentIntent[] {
  const text = normalizeAgentText(question);
  const found = new Set<AgentIntent>();
  for (const { intent, re } of INTENT_PATTERNS) {
    if (re.test(text) || re.test(question)) found.add(intent);
  }
  return [...found];
}

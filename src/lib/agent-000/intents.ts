import { normalizeAgentText } from "@/lib/agent-000/text";

export type AgentIntent =
  | "book_appointment"
  | "open_ticket"
  | "contact"
  | "human"
  | "domain_register"
  | "domain_transfer"
  | "domain_renew";

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
  {
    intent: "domain_register",
    re: /\b(registreer|registreren|register|registration|nieuwe?\s+domein|new\s+domain|domein\s+kopen|buy\s+(a\s+)?domain|domain\s+search|domein\s+zoeken)\b/i,
  },
  {
    intent: "domain_transfer",
    re: /\b(verhuis|verhuizen|transfer|migrate|migratie|auth.?code|epp.?code|domein\s+overzetten)\b/i,
  },
  {
    intent: "domain_renew",
    re: /\b(verleng|verlengen|renew|renewal|verlenging|domain\s+renew|domein\s+verlengen|my.?domains|mijn.?domeinen)\b/i,
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

/** Broad domain/DNS intent for Extra Hosting CTAs (not only explicit register/transfer/renew). */
export function isDomainTopicQuery(question: string): boolean {
  return (
    /\b(domein|domeinen|domain|domains|tld|dns|nameserver|nameservers|whois)\b/i.test(
      question,
    ) ||
    detectIntents(question).some((i) =>
      i === "domain_register" || i === "domain_transfer" || i === "domain_renew",
    )
  );
}

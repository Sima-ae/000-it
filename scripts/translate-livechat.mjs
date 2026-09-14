/**
 * Translate LiveChat (+ embedded todo chrome) into messages liveChat namespace.
 * One job - do not run in parallel with other MT scripts.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_TARGET_LOCALES, translateText } from "./lib/translate.mjs";

const EN = {
  title: "Live chat",
  subtitle: "TripleZero iT support",
  online: "Online — we reply as soon as possible",
  teaser: "Need help? Chat with us.",
  emptyChat: "Ask a question. Our team will reply as soon as possible.",
  emptyTicket:
    "Describe your request — we'll open a ticket synced to your dashboard.",
  placeholder: "Type your message…",
  newTicket: "New ticket",
  name: "Name",
  email: "Email",
  subject: "Subject",
  subjectPh: "What is this about?",
  viewTickets: "View tickets",
  sendFailed: "Could not send",
  powered: "Helpdesk chat · TripleZero iT",
  tabChat: "Chat",
  tabTicket: "Ticket",
  openChat: "Open live chat",
  closeChat: "Close live chat",
  visitor: "visitor",
  subjectPrefix: "Live chat",
  todoTitle: "To-do list",
  todoViewAll: "View all",
  todoEmpty: "No to-dos yet.",
  todoPlaceholder: "New task…",
  todoAdd: "Add",
};

const NL = {
  title: "Live chat",
  subtitle: "TripleZero iT support",
  online: "Online — we antwoorden zo snel mogelijk",
  teaser: "Hulp nodig? Chat met ons.",
  emptyChat: "Stel uw vraag. Ons team antwoordt zo snel mogelijk.",
  emptyTicket:
    "Beschrijf uw vraag — we openen een ticket dat zichtbaar is in uw dashboard.",
  placeholder: "Typ uw bericht…",
  newTicket: "Nieuw ticket",
  name: "Naam",
  email: "E-mail",
  subject: "Onderwerp",
  subjectPh: "Waar gaat het over?",
  viewTickets: "Bekijk tickets",
  sendFailed: "Versturen mislukt",
  powered: "Helpdesk chat · TripleZero iT",
  tabChat: "Chat",
  tabTicket: "Ticket",
  openChat: "Open live chat",
  closeChat: "Sluit live chat",
  visitor: "bezoeker",
  subjectPrefix: "Live chat",
  todoTitle: "To-do lijst",
  todoViewAll: "Alles",
  todoEmpty: "Nog geen to-dos.",
  todoPlaceholder: "Nieuwe taak…",
  todoAdd: "Toevoegen",
};

async function packFor(locale) {
  if (locale === "en") return { ...EN };
  if (locale === "nl") return { ...NL };
  const out = {};
  for (const [k, v] of Object.entries(EN)) {
    out[k] = await translateText(v, locale, "en");
    process.stdout.write(".");
  }
  return out;
}

const locales = ["en", "nl", ...ALL_TARGET_LOCALES.filter((l) => l !== "nl")];

for (const locale of locales) {
  console.log(`\n=== liveChat ${locale} ===`);
  const msgPath = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(msgPath, "utf8"));
  data.liveChat = await packFor(locale);
  writeFileSync(msgPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`\nwrote liveChat ${locale}`);
}

console.log("done liveChat");

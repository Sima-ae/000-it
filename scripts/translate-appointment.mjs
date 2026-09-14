/**
 * Translate appointment UI + extras + payment prefs into messages + content packs.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ALL_TARGET_LOCALES, translateText } from "./lib/translate.mjs";

const EN_UI = {
  title: "Book an appointment",
  selectService: "Select the service you need:",
  service: "Service",
  selectAService: "Select a service",
  skipExtras: "You can also skip this step.",
  date: "Date",
  time: "Time",
  name: "Name",
  email: "Email",
  phoneOptional: "Phone (optional)",
  companyOptional: "Company (optional)",
  notesOptional: "Notes (optional)",
  summary: "Summary",
  extras: "Extras",
  when: "When",
  requestReceived: "Request received",
  back: "Back",
  next: "Next",
  submit: "Request appointment",
  toastSuccess: "Appointment requested",
  toastError: "Could not send — try again",
  stepService: "Service",
  stepExtras: "Extras",
  stepSchedule: "Schedule",
  stepDetails: "Details",
  stepConfirm: "Confirm",
};

const NL_UI = {
  title: "Boek een afspraak",
  selectService: "Selecteer de gewenste service:",
  service: "Dienst",
  selectAService: "Selecteer service",
  skipExtras: "U kunt deze stap ook overslaan.",
  date: "Datum",
  time: "Tijd",
  name: "Naam",
  email: "E-mail",
  phoneOptional: "Telefoon (optioneel)",
  companyOptional: "Bedrijf (optioneel)",
  notesOptional: "Toelichting (optioneel)",
  summary: "Samenvatting",
  extras: "Extra's",
  when: "Wanneer",
  requestReceived: "Aanvraag ontvangen",
  back: "Terug",
  next: "Volgende",
  submit: "Afspraak aanvragen",
  toastSuccess: "Afspraak aangevraagd",
  toastError: "Versturen mislukt — probeer opnieuw",
  stepService: "Dienst",
  stepExtras: "Extra's",
  stepSchedule: "Planning",
  stepDetails: "Gegevens",
  stepConfirm: "Bevestigen",
};

// Load EN extras/prefs from appointment.ts via hardcoding (stable source)
const EXTRAS_EN = [
  { id: "urgent", title: "Priority / urgent", description: "Same-day or next-business-day preference when available." },
  { id: "report", title: "Written report", description: "Summary of findings and next steps after the session." },
  { id: "multi-site", title: "Extra website / shop", description: "Include a second URL in the same appointment." },
  { id: "screen-share", title: "Screen-share deep dive", description: "Longer live walkthrough of your site or dashboard." },
  { id: "follow-up", title: "Follow-up call (15 min)", description: "Short check-in within 7 days after the appointment." },
];
const EXTRAS_NL = {
  urgent: { title: "Spoed / prioriteit", description: "Voorkeur voor vandaag of eerstvolgende werkdag indien beschikbaar." },
  report: { title: "Schriftelijk rapport", description: "Samenvatting van bevindingen en vervolgstappen na het gesprek." },
  "multi-site": { title: "Extra website / shop", description: "Neem een tweede URL mee in dezelfde afspraak." },
  "screen-share": { title: "Schermdeling deep-dive", description: "Uitgebreide live walkthrough van uw site of dashboard." },
  "follow-up": { title: "Vervolggesprek (15 min)", description: "Korte check-in binnen 7 dagen na de afspraak." },
};

const PREFS_EN = [
  { id: "none", title: "No payment now", description: "Strategy intake — we confirm by email first." },
  { id: "invoice", title: "Invoice later", description: "Receive an invoice after the appointment if we continue." },
  { id: "link", title: "Pay online", description: "Prefer a payment link if a paid session is agreed." },
];
const PREFS_NL = {
  none: { title: "Nu niet betalen", description: "Strategie-intake — we bevestigen eerst per e-mail." },
  invoice: { title: "Later factuur", description: "Ontvang een factuur na de afspraak als we doorgaan." },
  link: { title: "Online betalen", description: "Voorkeur voor een betaallink als een betaalde sessie is afgesproken." },
};

async function uiForLocale(locale) {
  if (locale === "en") return EN_UI;
  if (locale === "nl") return NL_UI;
  const out = {};
  for (const [k, v] of Object.entries(EN_UI)) {
    out[k] = await translateText(v, locale, "en");
  }
  return out;
}

async function packForLocale(locale) {
  if (locale === "en") {
    return {
      extras: Object.fromEntries(EXTRAS_EN.map((e) => [e.id, { title: e.title, description: e.description }])),
      prefs: Object.fromEntries(PREFS_EN.map((e) => [e.id, { title: e.title, description: e.description }])),
    };
  }
  if (locale === "nl") return { extras: EXTRAS_NL, prefs: PREFS_NL };
  const extras = {};
  for (const e of EXTRAS_EN) {
    extras[e.id] = {
      title: await translateText(e.title, locale, "en"),
      description: await translateText(e.description, locale, "en"),
    };
  }
  const prefs = {};
  for (const e of PREFS_EN) {
    prefs[e.id] = {
      title: await translateText(e.title, locale, "en"),
      description: await translateText(e.description, locale, "en"),
    };
  }
  return { extras, prefs };
}

const locales = ["en", "nl", ...ALL_TARGET_LOCALES.filter((l) => l !== "nl")];
const packs = {};

for (const locale of locales) {
  console.log(`\n=== appointment ${locale} ===`);
  const ui = await uiForLocale(locale);
  // patch messages
  const msgPath = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(msgPath, "utf8"));
  data.appointment = ui;
  writeFileSync(msgPath, `${JSON.stringify(data, null, 2)}\n`);
  packs[locale] = await packForLocale(locale);
  console.log(`wrote messages + pack ${locale}`);
}

writeFileSync(
  join("src/content/appointment-i18n.json"),
  `${JSON.stringify(packs, null, 2)}\n`,
);
console.log("done appointment-i18n.json");

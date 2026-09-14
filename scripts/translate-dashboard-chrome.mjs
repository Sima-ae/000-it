/**
 * Expand + translate dashboard chrome keys (hardcoded isNl leftovers).
 * Uses concurrent MT. Run after legal job finishes.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_TARGET_LOCALES, translateManyConcurrent } from "./lib/translate.mjs";

const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 10);

const EN_EXTRA = {
  goToLogin: "Go to login",
  retry: "Retry",
  sessionExpired: "Your session expired. Please sign in again.",
  loadFailed: "Dashboard could not be loaded. Check your database connection and try again.",
  crmLoadFailed: "CRM could not be loaded. Check your connection and try again.",
  invoicesOverview: "Invoices, messages and overview",
  noTicketsYet: "No tickets yet.",
  liveChatInbox: "Live chat & support inbox",
  clientHomeHint: "Your home for tickets and project updates.",
  projectCreated: "Project created",
  projectCreateFailed: "Failed to create project",
  name: "Name",
  type: "Type",
  create: "Create",
  newTask: "New task",
  taskPlaceholder: "What needs doing?",
  add: "Add",
  open: "Open",
  done: "Done",
  allClear: "All clear.",
  todosSubtitle: "Keep track of follow-ups and internal tasks.",
  topicRequired: "Enter a topic first",
  draftGenerated: "Draft generated",
  copied: "Copied",
  contentSubtitle: "Generate blog, ads, social, email or landing copy drafts.",
  generator: "Generator",
  topic: "Topic",
  topicPh: "e.g. AEO for e-commerce",
  audience: "Audience (optional)",
  audiencePh: "e.g. Benelux scale-ups",
  generateDraft: "Generate draft",
  copy: "Copy",
  output: "Output",
  outputPh: "Your draft appears here…",
  email: "Email",
  recentScans: "Recent scans",
  deleteScan: "Delete scan",
  deleteScanConfirm: "Permanently delete this scan?",
  deleteFailed: "Delete failed.",
  deleteAllConfirm: "Clear all recent scans? This cannot be undone.",
  deleteAllFailed: "Delete all failed.",
  working: "Working…",
  deleteAll: "Delete all",
  noScansYet:
    "No scans yet. Start with a free AI scan to generate AEO, GEO (local) and SEO scores.",
  seoStaffSubtitle: "Review AI readiness scans across clients and sites.",
  seoClientSubtitle: "Your AI readiness and SEO scan history.",
  clientDetailHint: "Client profile, projects and notes.",
};

const NL_EXTRA = {
  goToLogin: "Naar login",
  retry: "Opnieuw proberen",
  sessionExpired: "U sessie is verlopen. Log opnieuw in.",
  loadFailed:
    "Dashboard kon niet worden geladen. Controleer uw databaseverbinding en probeer opnieuw.",
  crmLoadFailed: "CRM kon niet worden geladen. Controleer uw verbinding en probeer opnieuw.",
  invoicesOverview: "Facturen, berichten en overzicht",
  noTicketsYet: "Nog geen tickets.",
  liveChatInbox: "Live chat & support inbox",
  clientHomeHint: "Uw startpunt voor tickets en projectupdates.",
  projectCreated: "Project aangemaakt",
  projectCreateFailed: "Aanmaken mislukt",
  name: "Naam",
  type: "Type",
  create: "Aanmaken",
  newTask: "Nieuwe taak",
  taskPlaceholder: "Wat moet er gebeuren?",
  add: "Toevoegen",
  open: "Open",
  done: "Afgerond",
  allClear: "Alles afgerond.",
  todosSubtitle: "Houd follow-ups en interne taken bij.",
  topicRequired: "Vul eerst een onderwerp in",
  draftGenerated: "Concept gegenereerd",
  copied: "Gekopieerd",
  contentSubtitle: "Genereer blog-, ads-, social-, e-mail- of landing-concepten.",
  generator: "Generator",
  topic: "Onderwerp",
  topicPh: "bijv. AEO voor e-commerce",
  audience: "Doelgroep (optioneel)",
  audiencePh: "bijv. scale-ups in Benelux",
  generateDraft: "Genereer concept",
  copy: "Kopieer",
  output: "Output",
  outputPh: "Uw concept verschijnt hier…",
  email: "E-mail",
  recentScans: "Recente scans",
  deleteScan: "Scan verwijderen",
  deleteScanConfirm: "Deze scan definitief verwijderen?",
  deleteFailed: "Verwijderen mislukt.",
  deleteAllConfirm: "Alle recente scans legen? Dit kan niet ongedaan worden gemaakt.",
  deleteAllFailed: "Alles verwijderen mislukt.",
  working: "Bezig…",
  deleteAll: "Alles legen",
  noScansYet:
    "Nog geen scans. Start met een gratis AI scan voor AEO, GEO (lokaal) en SEO scores.",
  seoStaffSubtitle: "Bekijk AI-readiness scans van clients en sites.",
  seoClientSubtitle: "Uw AI-readiness- en SEO-scangeschiedenis.",
  clientDetailHint: "Clientprofiel, projecten en notities.",
};

const keys = Object.keys(EN_EXTRA);
const locales = ["en", "nl", ...ALL_TARGET_LOCALES.filter((l) => l !== "nl")];

for (const locale of locales) {
  const msgPath = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(msgPath, "utf8"));
  data.dashboard = data.dashboard || {};

  if (locale === "en") {
    Object.assign(data.dashboard, EN_EXTRA);
  } else if (locale === "nl") {
    Object.assign(data.dashboard, NL_EXTRA);
  } else {
    const missing = keys.filter((k) => !data.dashboard[k] || data.dashboard[k] === EN_EXTRA[k]);
    if (!missing.length) {
      console.log(`dashboard ${locale} (cached)`);
      continue;
    }
    console.log(`dashboard ${locale} (${missing.length} keys)`);
    const vals = await translateManyConcurrent(
      missing.map((k) => EN_EXTRA[k]),
      locale,
      "en",
      { concurrency: CONCURRENCY },
    );
    missing.forEach((k, i) => {
      data.dashboard[k] = vals[i];
    });
  }

  writeFileSync(msgPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`wrote ${locale}`);
}

console.log("done dashboard chrome");

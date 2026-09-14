/**
 * Translate only appointment UI keys that still match English (fill gaps after expand).
 * Safe to run while other MT jobs are idle — uses disk cache.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_TARGET_LOCALES, translateText } from "./lib/translate.mjs";

const EN = {
  title: "Book an appointment",
  selectService: "Select the service you need:",
  service: "Service",
  selectAService: "Select a service",
  serviceFallback:
    "We'll schedule a focused call or remote session for this service.",
  optionalExtras: "Optional — add extras to your appointment:",
  skipExtras: "You can also skip this step.",
  pickDateTime: "Pick a preferred date and time (weekdays, CET):",
  date: "Date",
  time: "Time",
  enterDetails: "Enter your details so we can confirm the appointment:",
  name: "Name",
  email: "Email",
  phoneOptional: "Phone (optional)",
  companyOptional: "Company (optional)",
  notesOptional: "Notes (optional)",
  notesPlaceholder: "Website URL, urgency, what's going on…",
  choosePayment:
    "Choose how you'd like to pay. Online payment can follow via a secure link.",
  summary: "Summary",
  extras: "Extras",
  when: "When",
  none: "none",
  requestReceived: "Request received",
  thankYou:
    "Thanks! We'll confirm your appointment by email as soon as possible (usually within one business day).",
  back: "Back",
  next: "Next",
  submit: "Request appointment",
  confirm: "Confirm",
  sending: "Sending…",
  toastSuccess: "Appointment requested",
  toastError: "Could not send — try again",
  stepService: "Service",
  stepExtras: "Extras",
  stepTime: "Time",
  stepDetails: "Details",
  stepPayment: "Payment",
  stepDone: "Done",
  stepSchedule: "Schedule",
  stepConfirm: "Confirm",
  pageIntro:
    "Pick a service, date and time — we'll confirm your appointment by email.",
  allServicesCta: "Click here for all services!",
};

const locales = ALL_TARGET_LOCALES.filter((l) => l !== "nl");

for (const locale of locales) {
  const msgPath = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(msgPath, "utf8"));
  const ap = { ...(data.appointment || {}) };
  let changed = 0;
  for (const [key, en] of Object.entries(EN)) {
    const cur = ap[key];
    // Translate when missing or still English
    if (!cur || cur === en) {
      ap[key] = await translateText(en, locale, "en");
      changed++;
      process.stdout.write(`.`);
    }
  }
  data.appointment = ap;
  writeFileSync(msgPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`\nappointment gaps ${locale}: ${changed}`);
}

console.log("done appointment gap fill");

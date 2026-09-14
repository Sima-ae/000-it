/**
 * Translate locations page chrome + AI-scan contact dialog gaps.
 * One job - do not run in parallel with other MT scripts.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_TARGET_LOCALES, translateText } from "./lib/translate.mjs";

const LOC_EN = {
  title: "Locations",
  subtitle:
    "TripleZero iT supports businesses across the Netherlands and Belgium with AI integration, AEO, GEO, SEO, marketing and software. Pick your city for local details.",
};

const LOC_NL = {
  title: "Locaties",
  subtitle:
    "TripleZero iT ondersteunt bedrijven in heel Nederland en België met AI-integratie, AEO, GEO, SEO, marketing en software. Kies uw stad voor lokale informatie.",
};

const SCAN_EN = {
  resultsTitle: "AI scan results",
  contactTitle: "Contact about AI scan",
  contactDescription:
    "Leave your details — we'll help interpret the scores and outline a plan.",
  contactMessageLead:
    "Hi TripleZero iT,\n\nI've run an AI scan and would like to discuss the results.\n\nWebsite URL: {url}\n\nScores:\n{scores}\n\nQuestion / notes:\n",
};

const SCAN_NL = {
  resultsTitle: "AI-scan resultaten",
  contactTitle: "Contact over AI-scan",
  contactDescription:
    "Laat uw gegevens achter — we helpen u de scores te interpreteren en een plan op te stellen.",
  contactMessageLead:
    "Hallo TripleZero iT,\n\nIk heb een AI-scan gedaan en wil graag de resultaten bespreken.\n\nWebsite-URL: {url}\n\nScores:\n{scores}\n\nVraag / toelichting:\n",
};

async function translateObj(base, locale) {
  if (locale === "en") return { ...base };
  const out = {};
  for (const [k, v] of Object.entries(base)) {
    out[k] = await translateText(v, locale, "en");
    process.stdout.write(".");
  }
  return out;
}

const locales = ["en", "nl", ...ALL_TARGET_LOCALES.filter((l) => l !== "nl")];

for (const locale of locales) {
  console.log(`\n=== locations+aiScan ${locale} ===`);
  const msgPath = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(msgPath, "utf8"));

  if (locale === "nl") {
    data.locations = { ...LOC_NL };
    data.aiScan = { ...(data.aiScan || {}), ...SCAN_NL };
  } else if (locale === "en") {
    data.locations = { ...LOC_EN };
    data.aiScan = { ...(data.aiScan || {}), ...SCAN_EN };
  } else {
    data.locations = await translateObj(LOC_EN, locale);
    const scanGaps = {};
    for (const [k, v] of Object.entries(SCAN_EN)) {
      const cur = data.aiScan?.[k];
      if (!cur || cur === v) {
        scanGaps[k] = await translateText(v, locale, "en");
        process.stdout.write(".");
      } else {
        scanGaps[k] = cur;
      }
    }
    data.aiScan = { ...(data.aiScan || {}), ...scanGaps };
  }

  writeFileSync(msgPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`\nwrote ${locale}`);
}

console.log("done locations + aiScan gaps");

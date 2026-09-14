/**
 * Patch hero visual chrome keys into all message locales.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_TARGET_LOCALES, translateManyConcurrent } from "./lib/translate.mjs";

const EN = {
  aiReady: "AI Ready?",
  score: "Score",
  agentsActive: "Agents active",
  serversOnline: "Servers online",
};
const NL = {
  aiReady: "AI-ready?",
  score: "Score",
  agentsActive: "Agents actief",
  serversOnline: "Servers online",
};

const keys = Object.keys(EN);

for (const locale of ["en", "nl", ...ALL_TARGET_LOCALES.filter((l) => l !== "nl")]) {
  const p = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(p, "utf8"));
  data.hero = data.hero || {};
  if (locale === "en") Object.assign(data.hero, EN);
  else if (locale === "nl") Object.assign(data.hero, NL);
  else {
    const missing = keys.filter((k) => !data.hero[k] || data.hero[k] === EN[k]);
    if (missing.length) {
      const vals = await translateManyConcurrent(
        missing.map((k) => EN[k]),
        locale,
        "en",
        { concurrency: 1, delayMs: 500 },
      );
      missing.forEach((k, i) => {
        data.hero[k] = vals[i];
      });
      console.log(locale, missing.length);
    } else console.log(locale, "ok");
  }
  writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
}
console.log("done hero visual keys");

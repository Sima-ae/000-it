import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { translateManyConcurrent, ALL_TARGET_LOCALES } from "./lib/translate.mjs";

const EN = {
  dialogTitle: "Contact about {service}",
  dialogDesc:
    "Leave your details — we’ll reply quickly with a feasibility note and next steps.",
};
const NL = {
  dialogTitle: "Contact over {service}",
  dialogDesc:
    "Laat uw gegevens achter — we reageren snel met een haalbaarheidsadvies en vervolgstappen.",
};

for (const locale of ["en", "nl", ...ALL_TARGET_LOCALES.filter((l) => l !== "nl")]) {
  const p = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(p, "utf8"));
  data.inquiry = data.inquiry || {};
  if (locale === "en") Object.assign(data.inquiry, EN);
  else if (locale === "nl") Object.assign(data.inquiry, NL);
  else {
    const missing = Object.keys(EN).filter(
      (k) => !data.inquiry[k] || data.inquiry[k] === EN[k],
    );
    if (missing.length) {
      const vals = await translateManyConcurrent(
        missing.map((k) => EN[k]),
        locale,
        "en",
        { concurrency: 4 },
      );
      missing.forEach((k, i) => {
        data.inquiry[k] = vals[i];
      });
      console.log(locale, missing.length);
    } else console.log(locale, "ok");
  }
  writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
}
console.log("done inquiry dialog keys");

/**
 * Translate digital-design page chrome into messages digitalDesign namespace.
 * One job - do not run in parallel with other MT scripts.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_TARGET_LOCALES, translateText } from "./lib/translate.mjs";

const EN = {
  title: "Digital Design",
  subtitle:
    "Professional brand and print design: logos, business cards, flyers, stickers, magazines and posters — crafted in Photoshop, Illustrator and InDesign.",
  viewPortfolio: "View portfolio",
  whatWeDesign: "What we design",
  whatWeDesignSubtitle:
    "Every deliverable is print- or screen-ready, with a clean file structure for your printer or team.",
  learnMore: "Learn more",
  toolsTitle: "Tools that survive print",
  toolsSubtitle:
    "We work in the Adobe stack so your files open cleanly at any professional print shop.",
  ctaTitle: "Ready for a sharp brand image?",
  ctaSubtitle:
    "Book an intake. We'll lock formats, quantity and style direction — then deliver print-ready files.",
  startDesign: "Start with design",
  websiteSupport: "Website Support",
  blurbLogo: "Logos, color, type and guidelines that scale.",
  blurbCards: "Design and printing — small or large quantities.",
  blurbLetterhead: "Letterhead design and printing in small or large quantities.",
  blurbFlyers: "Flyer and poster design plus printing in small or large quantities.",
  blurbStickers: "Sticker design and printing — small batches or large runs.",
  blurbBrochures: "Brochure design plus printing in small or large quantities.",
};

const NL = {
  title: "Digital design",
  subtitle:
    "Professioneel beeldmerk- en printdesign: logo’s, visitekaartjes, flyers, stickers, magazines en posters — gemaakt in Photoshop, Illustrator en InDesign.",
  viewPortfolio: "Bekijk portfolio",
  whatWeDesign: "Wat we ontwerpen",
  whatWeDesignSubtitle:
    "Elk deliverable is drukklaar of screen-ready, met nette bestandsstructuur voor uw drukker of team.",
  learnMore: "Meer info",
  toolsTitle: "Gereedschap dat print overleeft",
  toolsSubtitle:
    "Wij werken in de Adobe-stack zodat uw bestanden openen bij elke professionele drukkerij.",
  ctaTitle: "Klaar voor een strak merkbeeld?",
  ctaSubtitle:
    "Plan een intake. We bepalen formaten, oplage en stijlrichting — daarna leveren we drukklare bestanden.",
  startDesign: "Start met design",
  websiteSupport: "Website support",
  blurbLogo: "Logo’s, kleur, typografie en merkrichtlijnen die schalen.",
  blurbCards: "Ontwerp én drukwerk — kleine of grote oplages.",
  blurbLetterhead: "Briefpapier-ontwerp én drukwerk in kleine of grote oplages.",
  blurbFlyers: "Flyer- en posterontwerp plus drukwerk in kleine of grote oplages.",
  blurbStickers: "Stickerontwerp en drukwerk — kleine batches of grote runs.",
  blurbBrochures: "Brochure-ontwerp plus drukwerk in kleine of grote oplages.",
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
  console.log(`\n=== digitalDesign ${locale} ===`);
  const msgPath = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(msgPath, "utf8"));
  data.digitalDesign = await packFor(locale);
  writeFileSync(msgPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`\nwrote digitalDesign ${locale}`);
}

console.log("done digital-design");

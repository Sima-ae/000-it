/**
 * Translate over-ons (about) page chrome + pillars into messages about namespace.
 * One job - do not run in parallel with other MT scripts.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_TARGET_LOCALES, translateText } from "./lib/translate.mjs";

const EN = {
  title: "About TripleZero iT",
  mission: "Mission",
  missionText: "Help businesses with practical AI growth systems.",
  vision: "Vision",
  visionText: "Develop the right solution(s) for every entrepreneur.",
  philosophy: "The TripleZero philosophy",
  philosophyText: "000: zero guesswork, zero shortfall and zero waste.",
  heroSubtitle:
    "AI-driven growth, WordPress support, hosting, SEO and marketing — one system for European businesses.",
  viewServices: "View services",
  whatWeDo: "What we do",
  whatWeDoSubtitle:
    "Practical services to make your website fast, secure and findable.",
  allServicesArrow: "All services →",
  storyTitle: "From good to great",
  storyP1:
    "With AI integration, AEO, GEO (local), SEO, performance, security and full-funnel marketing we keep your website smooth, protected and measurably growing.",
  storyP2:
    "Within 24 hours we handle bugs, malware, migrations or optimizations — so you can focus on your business.",
  readyTitle: "Ready to start?",
  readySubtitle: "Book a call or start with an AI scan of your website.",
  statResponse: "average response",
  statAvailable: "available",
  statMonitoring: "monitoring & support",
  pillarBugsTitle: "Fix Bugs and Errors",
  pillarBugsDesc:
    "Quick diagnosis and fixes so your site runs smoothly again.",
  pillarMalwareTitle: "Malware Removal",
  pillarMalwareDesc:
    "Deep analysis and malware removal so your site is clean again.",
  pillarSpeedTitle: "Performance & Speed",
  pillarSpeedDesc:
    "Load times under 2 seconds and Core Web Vitals optimized.",
  pillarBackupTitle: "Backups and Migration",
  pillarBackupDesc: "Safe backups and hosting migrations without downtime.",
  pillarDesignTitle: "Design & Customize",
  pillarDesignDesc: "Unique, responsive design tailored to your brand.",
  pillarDigitalTitle: "Digital Design",
  pillarDigitalDesc:
    "Logos, business cards, flyers, posters and print in Adobe.",
  pillarHostingTitle: "Web Hosting",
  pillarHostingDesc: "Fast, reliable hosting starting from € 21.96 per year.",
};

const NL = {
  title: "Over TripleZero iT",
  mission: "Missie",
  missionText: "Bedrijven helpen met praktische AI-groeisystemen.",
  vision: "Visie",
  visionText: "Voor elke ondernemer de juiste oplossing(en) ontwikkelen.",
  philosophy: "De TripleZero-filosofie",
  philosophyText: "000: zero giswerk, zero tekort en zero verspilling.",
  heroSubtitle:
    "AI-gedreven groei, WordPress support, hosting, SEO en marketing — één systeem voor Europese bedrijven.",
  viewServices: "Bekijk diensten",
  whatWeDo: "Wat wij doen",
  whatWeDoSubtitle:
    "Praktische diensten om uw website snel, veilig en vindbaar te maken.",
  allServicesArrow: "Alle diensten →",
  storyTitle: "Van goed naar beter",
  storyP1:
    "Met AI-integratie, AEO, GEO (lokaal), SEO, performance, security en full-funnel marketing zorgen we dat uw website soepel draait, beschermd blijft en meetbaar groeit.",
  storyP2:
    "Binnen 24 uur pakken we bugs, malware, migraties of optimalisaties op — zodat u zich kunt focussen op uw business.",
  readyTitle: "Klaar om te starten?",
  readySubtitle: "Plan een gesprek of start direct met een AI-scan van uw website.",
  statResponse: "gemiddelde response",
  statAvailable: "bereikbaar",
  statMonitoring: "monitoring en support",
  pillarBugsTitle: "Bugs en errors verhelpen",
  pillarBugsDesc:
    "Snelle diagnose en oplossing van fouten zodat uw site weer soepel draait.",
  pillarMalwareTitle: "Malware verwijderen",
  pillarMalwareDesc:
    "Diepe analyse en verwijderen van malware zodat uw site weer schoon en veilig is.",
  pillarSpeedTitle: "Performance en snelheid",
  pillarSpeedDesc: "Laadtijden onder 2 seconden en Core Web Vitals op orde.",
  pillarBackupTitle: "Backups en migratie",
  pillarBackupDesc: "Veilige backups en hosting-migraties zonder downtime.",
  pillarDesignTitle: "Design en customize",
  pillarDesignDesc: "Unieke, responsive designs die aansluiten op uw merk.",
  pillarDigitalTitle: "Digital design",
  pillarDigitalDesc: "Logo’s, visitekaartjes, flyers, posters en print in Adobe.",
  pillarHostingTitle: "Web hosting",
  pillarHostingDesc: "Snelle, betrouwbare hosting vanaf € 21,96 per jaar.",
};

async function aboutFor(locale) {
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
  console.log(`\n=== about ${locale} ===`);
  const msgPath = join("messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(msgPath, "utf8"));
  const prev = data.about || {};
  const next = await aboutFor(locale);
  // Keep human-tuned existing keys when they differ from EN boilerplate
  if (locale !== "en" && locale !== "nl") {
    for (const k of ["title", "mission", "missionText", "vision", "visionText", "philosophy", "philosophyText"]) {
      if (prev[k] && prev[k] !== EN[k]) next[k] = prev[k];
    }
  }
  data.about = next;
  writeFileSync(msgPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`\nwrote about ${locale}`);
}

console.log("done over-ons / about");

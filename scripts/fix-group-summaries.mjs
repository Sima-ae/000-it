/**
 * Fix Amnesty "AI" mistranslations + fill catalog groupSummaries for all locales.
 *   npx tsx scripts/fix-group-summaries.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { translateManyConcurrent, stripMtArtifacts } from "./lib/translate.mjs";

const catalogPath = "src/content/fixweb/catalog-i18n.json";
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));

if (catalog.groups?.ar?.ai) {
  catalog.groups.ar.ai = "AI";
  console.log("fixed catalog.groups.ar.ai → AI");
}

const faqPath = "src/content/faq-i18n/ar.json";
const faq = JSON.parse(readFileSync(faqPath, "utf8"));
for (const cat of faq.categories || []) {
  if (cat.id === "ai") {
    cat.title = "AI";
    console.log("fixed faq.categories.ai.title → AI");
  }
}
writeFileSync(faqPath, `${JSON.stringify(faq, null, 2)}\n`);

const groupSummariesEn = {
  ai: "Chatbots, workflows, AI in websites and shops, integration and AI consultancy.",
  optimization:
    "AEO, GEO, SEO, e-commerce SEO, copy, CRO, speed, analytics and accessibility — so your site is found and converts.",
  wordpress: "Maintenance, security, malware removal, speed, backups and WordPress support.",
  webdesign: "Custom websites, conversion, security, speed and Next.js development.",
  design: "Logos, branding, flyers, magazines, print and digital design.",
  marketing: "Content, social media, ads, e-commerce, media and community management.",
  hosting: "Web hosting, WordPress hosting, VPS and domains.",
};
const groupSummariesNl = {
  ai: "Chatbots, workflows, AI in websites en shops, integratie en AI-advies.",
  optimization:
    "AEO, GEO, SEO, e-commerce SEO, teksten, CRO, snelheid, analytics en toegankelijkheid — zodat je site gevonden wordt én converteert.",
  wordpress: "Onderhoud, security, malware, snelheid, backups en WordPress-support.",
  webdesign: "Maatwerk websites, conversie, security, snelheid en Next.js-ontwikkeling.",
  design: "Logo's, branding, flyers, magazines, drukwerk en digital design.",
  marketing: "Content, social media, ads, e-commerce, media en community management.",
  hosting: "Webhosting, WordPress-hosting, VPS en domeinen.",
};

catalog.groupSummaries = catalog.groupSummaries || {};
catalog.groupSummaries.en = { ...groupSummariesEn };
catalog.groupSummaries.nl = { ...groupSummariesNl };

const locales = Object.keys(catalog.groups || {}).filter((l) => l !== "en" && l !== "nl");
const keys = Object.keys(groupSummariesEn);
const texts = keys.map((k) => groupSummariesEn[k]);

for (const locale of locales) {
  const existing = catalog.groupSummaries[locale] || {};
  const needIdx = [];
  keys.forEach((k, i) => {
    if (!existing[k] || existing[k] === groupSummariesEn[k]) needIdx.push(i);
  });
  console.log(`groupSummaries ${locale}: need ${needIdx.length}`);
  const next = { ...existing };
  if (needIdx.length) {
    const vals = await translateManyConcurrent(
      needIdx.map((i) => texts[i]),
      locale,
      "en",
      { concurrency: 2, delayMs: 280 },
    );
    needIdx.forEach((i, j) => {
      const out = stripMtArtifacts(vals[j] || "");
      if (out && out !== texts[i] && !/amnesty|منظمة العفو|amnisti/i.test(out)) {
        next[keys[i]] = out;
      }
    });
  }
  for (const k of keys) if (!next[k]) next[k] = groupSummariesEn[k];
  catalog.groupSummaries[locale] = next;
}

writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log("done");

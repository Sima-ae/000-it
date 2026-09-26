/**
 * Strict quality audit of all kennisbank NL bodies.
 * Scores title-fit, uniqueness, boilerplate, and whether howto steps belong.
 */
import fs from "node:fs";
import path from "node:path";
import cat from "../../prisma/kennisbank/catalog.json";
import { buildArticleHtml, buildExcerpt } from "../../prisma/kennisbank/build-body.ts";

type Row = {
  slug: string;
  title: string;
  topic: string;
  categories: string[];
  flags: string[];
  score: number;
  stepCount: number;
  stepFingerprint: string;
};

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, " ")
    .split(/[\s/_-]+/)
    .filter(
      (t) =>
        t.length >= 4 &&
        ![
          "voor",
          "vanuit",
          "naar",
          "met",
          "zonder",
          "deze",
          "dit",
          "een",
          "het",
          "zijn",
          "wordt",
          "worden",
          "kunnen",
          "moeten",
          "jullie",
          "jouw",
          "triplezero",
          "handleiding",
          "stappen",
          "waarom",
          "belangrijk",
          "controleer",
          "voorbereiding",
        ].includes(t),
    );
}

function isConceptualTitle(title: string, cats: string[]): boolean {
  const t = title.toLowerCase();
  if (
    /^(wat is|wat zijn|wanneer|waarom|verschil|versus|vs\.?|vergelijk|keuzehulp|uitgelegd|begrijpen|criteria)/i.test(
      t,
    )
  )
    return true;
  if (/\bversus\b|\bvs\.?\b|vergeleken|keuzehulp|wanneer kies|wanneer wat/i.test(t)) return true;
  if ((cats || []).includes("vergelijkingen-keuzehulp")) return true;
  return false;
}

const stopWhy = [
  "dit onderwerp komt terug in supporttickets",
  "een vaste werkwijze voorkomt",
  "duidelijke documentatie helpt",
  "focus deze sessie op",
];

const badStep = [
  /voer de wijziging uit die bij/i,
  /voer gericht de configuratie uit/i,
  /bepaal het doel van [“"]/i,
  /reproduceer het gewenste gedrag lokaal/i,
  /pas de minimale code\/config aan/i,
  /identificeer het juiste scherm of bestand voor/i,
  /pas de concrete (maatregel|wijziging) (toe|aan) die/i,
  /\$\{BRAND\}/,
];

type CatalogArticle = {
  slug: string;
  title: string;
  topic: string;
  categories?: string[];
};

type Catalog = {
  articles: CatalogArticle[];
};

const catalog = cat as Catalog;

const rows: Row[] = [];
const fpCount = new Map<string, number>();

for (const a of catalog.articles) {
  const html = buildArticleHtml(a.title, a.topic, "nl");
  const ex = buildExcerpt(a.title, "nl", a.topic);
  const flags: string[] = [];
  let score = 100;

  const stepsMatch = html.match(/<h2>Stappen(?:plan:[^<]*)?<\/h2>\s*<ol>([\s\S]*?)<\/ol>/i);
  const stepItems = stepsMatch
    ? [...stepsMatch[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) =>
        m[1].replace(/<[^>]+>/g, "").trim(),
      )
    : [];
  const fp = stepItems.join(" || ").slice(0, 280);
  if (fp) fpCount.set(fp, (fpCount.get(fp) || 0) + 1);

  const titleTok = tokens(`${a.title} ${a.slug}`);
  const bodyTok = new Set(tokens(html.replace(/<[^>]+>/g, " ")));
  const overlap = titleTok.filter((t) => bodyTok.has(t));
  const overlapRatio = titleTok.length ? overlap.length / titleTok.length : 1;

  if (overlapRatio < 0.25) {
    flags.push("low_title_overlap");
    score -= 35;
  } else if (overlapRatio < 0.4) {
    flags.push("medium_title_overlap");
    score -= 15;
  }

  for (const re of badStep) {
    if (re.test(html)) {
      flags.push("boilerplate_step");
      score -= 40;
      break;
    }
  }

  if (stopWhy.some((s) => html.toLowerCase().includes(s))) {
    flags.push("generic_why_or_focus");
    score -= 20;
  }

  if (/Stapsgewijze uitleg, aandachtspunten/.test(ex)) {
    flags.push("generic_excerpt");
    score -= 10;
  }

  const titleEsc = a.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (
    new RegExp(
      `(die hoort bij|scenario van|Focus deze sessie op).{0,8}[“"]${titleEsc}`,
      "i",
    ).test(html)
  ) {
    flags.push("title_plug");
    score -= 25;
  }

  const cats: string[] = a.categories || [];
  const conceptual = isConceptualTitle(a.title, cats);
  if (conceptual && stepItems.length >= 5) {
    flags.push("conceptual_with_howto_steps");
    score -= 20;
  }

  if (cats.includes("html-css-js") && /next\s*dev|next\s*build|app\/api/i.test(html)) {
    flags.push("wrong_stack_next_on_html");
    score -= 40;
  }
  if (
    cats.includes("nextjs-en-react") &&
    stepItems.length &&
    !/(next|react|app\/|route|server|client|middleware|revalidate)/i.test(stepItems.join(" "))
  ) {
    flags.push("next_steps_missing_next_terms");
    score -= 20;
  }

  rows.push({
    slug: a.slug,
    title: a.title,
    topic: a.topic,
    categories: cats,
    flags,
    score: Math.max(0, score),
    stepCount: stepItems.length,
    stepFingerprint: fp,
  });
}

for (const r of rows) {
  if (!r.stepFingerprint) continue;
  const n = fpCount.get(r.stepFingerprint) || 0;
  if (n >= 5) {
    r.flags.push(`shared_steps_x${n}`);
    r.score = Math.max(0, r.score - Math.min(40, 10 + Math.floor(n / 5) * 5));
  } else if (n >= 3) {
    r.flags.push(`shared_steps_x${n}`);
    r.score = Math.max(0, r.score - 15);
  }
}

const fail = rows.filter((r) => r.score < 75 || r.flags.length > 0);
const hardFail = rows.filter((r) => r.score < 55);
const byFlag: Record<string, number> = {};
for (const r of fail) {
  for (const f of r.flags) {
    const k = f.replace(/_x\d+$/, "");
    byFlag[k] = (byFlag[k] || 0) + 1;
  }
}

const summary = {
  total: rows.length,
  passClean: rows.filter((r) => r.score >= 75 && r.flags.length === 0).length,
  failAny: fail.length,
  hardFail: hardFail.length,
  avgScore: Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length),
  byFlag,
  sharedFpGte5: [...fpCount.entries()].filter(([, n]) => n >= 5).length,
  conceptualWithSteps: rows.filter((r) => r.flags.includes("conceptual_with_howto_steps")).length,
};

const outDir = path.resolve("scripts/kennisbank-wave-quality");
fs.writeFileSync(
  path.join(outDir, "audit-1785.json"),
  JSON.stringify(
    {
      summary,
      fail: fail
        .sort((a, b) => a.score - b.score)
        .map(({ slug, title, topic, categories, flags, score, stepCount }) => ({
          slug,
          title,
          topic,
          categories,
          flags,
          score,
          stepCount,
        })),
    },
    null,
    2,
  ),
);

console.log(JSON.stringify(summary, null, 2));
console.log("\nWorst 20:");
for (const r of [...rows].sort((a, b) => a.score - b.score).slice(0, 20)) {
  console.log(r.score, r.slug, r.flags.join("|"));
}

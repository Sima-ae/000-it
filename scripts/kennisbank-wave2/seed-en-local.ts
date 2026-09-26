#!/usr/bin/env tsx
/**
 * Seed English translations for Wave-2 kennisbank articles (offline, no free MT).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "../../src/lib/prisma";
import { buildExcerpt } from "../../prisma/kennisbank/build-body";

type WaveRow = {
  slug: string;
  title: string;
  titleEn?: string;
  topic: string;
};

const BRAND = "TripleZero iT";

function englishHowto(title: string, topic: string): string {
  const area = topic.includes("infra")
    ? "infrastructure, VPS and networking"
    : topic.includes("-ts-") || topic.includes("rewrite")
      ? "errors and troubleshooting"
      : topic.includes("priv")
        ? "privacy, cookies and compliance"
        : topic.includes("vgl")
          ? "comparisons and decision guides"
          : "hosting, email, WordPress and security";

  return [
    `<p>This ${BRAND} knowledge-base article explains: <strong>${title}</strong>. We cover the goal, preparation and a clear workflow you can follow step by step.</p>`,
    `<p>Written for ${BRAND} customers working with hosting, VPS, control panels and the client panel — focused on ${area}.</p>`,
    `<h2>Why this matters</h2>`,
    `<ul>`,
    `  <li>A consistent process reduces outages and support back-and-forth.</li>`,
    `  <li>Security and backups should be considered before production changes.</li>`,
    `  <li>Measuring the result confirms the fix (site, mail, DNS or checkout).</li>`,
    `</ul>`,
    `<h2>Step-by-step: ${title}</h2>`,
    `<ol>`,
    `  <li>Define the goal of “${title}” and capture the current state.</li>`,
    `  <li>Sign in to the ${BRAND} client panel and open the related environment.</li>`,
    `  <li>Take a backup or work on staging when the change is risky.</li>`,
    `  <li>Apply the change for “${title}” — one critical step at a time.</li>`,
    `  <li>Purge caches if content or code changed; re-test from a second network.</li>`,
    `  <li>Document what changed (date, who, rollback plan).</li>`,
    `</ol>`,
    `<h2>Common mistakes</h2>`,
    `<ul>`,
    `  <li>Changing too many things at once.</li>`,
    `  <li>Putting secrets in frontend code or public tickets.</li>`,
    `  <li>Forgetting to purge caches.</li>`,
    `  <li>Using production as the only test environment.</li>`,
    `</ul>`,
    `<aside class="kb-callout kb-callout-tip"><p><strong>Tip:</strong> In ${BRAND} tickets, always include the domain, timezone-aware timestamp and what you already tried.</p></aside>`,
    `<aside class="kb-callout kb-callout-warn"><p><strong>Note:</strong> Educational guidance only — not personalised legal advice. Roll back DNS, payments or auth carefully.</p></aside>`,
    `<p>Still stuck? Contact ${BRAND} support via the ticket system.</p>`,
    `<p>Also browse related articles on ${area} in this knowledge base.</p>`,
  ].join("\n");
}

async function main() {
  const path = join(__dirname, "wave2-articles.json");
  const rows = JSON.parse(readFileSync(path, "utf8")) as WaveRow[];
  let fixed = 0;
  let missing = 0;

  for (const row of rows) {
    const article = await prisma.kennisbankArticle.findUnique({
      where: { slug: row.slug },
    });
    if (!article) {
      missing += 1;
      console.warn(`[missing] ${row.slug}`);
      continue;
    }
    const title = (row.titleEn || row.title).trim();
    const excerpt = buildExcerpt(title, "en");
    const bodyHtml = englishHowto(title, row.topic);
    const payload = {
      title,
      excerpt,
      bodyHtml,
      seoTitle: `${title} | TripleZero iT`,
      seoDescription: excerpt,
    };
    await prisma.kennisbankArticleTranslation.upsert({
      where: {
        articleId_locale: { articleId: article.id, locale: "en" },
      },
      create: { articleId: article.id, locale: "en", ...payload },
      update: payload,
    });
    fixed += 1;
    if (fixed % 50 === 0) console.log(`[en-local] ${fixed}/${rows.length}`);
  }

  console.log(`[en-local] done fixed=${fixed} missing=${missing} total=${rows.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

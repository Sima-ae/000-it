#!/usr/bin/env tsx
/**
 * Seed English translations for Wave-1 kennisbank articles without free MT.
 * Uses titleEn from wave1-articles.json + a professional English howto body.
 *
 * Optional later polish:
 *   npm run kennisbank:repair -- --en-only --force --slugs-file=scripts/kennisbank-wave1/wave1-articles.json
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
  related?: string;
};

const BRAND = "TripleZero iT";

function englishHowto(title: string, topic: string): string {
  const area = topic.startsWith("tz-wd")
    ? "web design and custom development"
    : topic.startsWith("tz-aii")
      ? "AI integration and automation"
      : topic.startsWith("tz-act")
        ? "analytics, conversion and accessibility"
        : topic.startsWith("tz-ec")
          ? "e-commerce and online stores"
          : topic.startsWith("tz-cdn")
            ? "CDN, performance and Cloudflare"
            : "hosting, DNS, security and account management";

  return [
    `<p>This ${BRAND} knowledge-base article explains: <strong>${title}</strong>. We cover the goal, preparation and a clear workflow you can follow step by step.</p>`,
    `<p>The guide is written for ${BRAND} customers and focuses on practical ${area} — including shared hosting, VPS, control panels and the client panel where relevant.</p>`,
    `<h2>Why this matters</h2>`,
    `<ul>`,
    `  <li>A consistent process reduces outages and support back-and-forth.</li>`,
    `  <li>Security and backups should be considered before production changes.</li>`,
    `  <li>Measuring the result (site, mail, checkout or Core Web Vitals) confirms the fix.</li>`,
    `</ul>`,
    `<h2>Step-by-step: ${title}</h2>`,
    `<ol>`,
    `  <li>Define the goal of “${title}” and capture the current state (screenshot or settings).</li>`,
    `  <li>Sign in to the ${BRAND} client panel and open the related VPS, CMS, CDN or shop environment.</li>`,
    `  <li>Take a backup or work on staging when the change is risky.</li>`,
    `  <li>Apply the change for “${title}” — one critical step at a time.</li>`,
    `  <li>Purge caches (CDN, LiteSpeed, WordPress, browser) if content or code changed.</li>`,
    `  <li>Test on desktop and mobile; check logs or analytics when applicable.</li>`,
    `  <li>Document what changed (date, who, rollback plan).</li>`,
    `</ol>`,
    `<h2>Common mistakes</h2>`,
    `<ul>`,
    `  <li>Changing too many things at once, making root-cause analysis impossible.</li>`,
    `  <li>Putting secrets or API keys in frontend code or public repositories.</li>`,
    `  <li>Forgetting to purge caches and assuming the fix did not work.</li>`,
    `  <li>Using production as the only test environment.</li>`,
    `</ul>`,
    `<aside class="kb-callout kb-callout-tip"><p><strong>Tip:</strong> In ${BRAND} tickets, always include the domain name, environment (staging/production) and the time of the change.</p></aside>`,
    `<aside class="kb-callout kb-callout-warn"><p><strong>Note:</strong> Never change DNS, payment configuration or authentication without a rollback plan and a recent backup.</p></aside>`,
    `<p>Still have questions after following these steps? Contact ${BRAND} support via the ticket system or book an appointment.</p>`,
    `<p>Also browse related articles on ${area} in this knowledge base.</p>`,
  ].join("\n");
}

async function main() {
  const path = join(__dirname, "wave1-articles.json");
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

  console.log(
    `[en-local] done fixed=${fixed} missing=${missing} total=${rows.length}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

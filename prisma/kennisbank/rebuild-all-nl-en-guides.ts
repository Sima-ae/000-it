#!/usr/bin/env tsx
/**
 * Rebuild ALL 1785 NL + EN bodies/excerpts with howto vs informational composer.
 * Keeps existing EN titles (already curated). Preserves NL catalog titles.
 *
 * Usage: npx tsx prisma/kennisbank/rebuild-all-nl-en-guides.ts
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ARTICLES_DIR, validateArticleFile } from "./load-article";
import { isTemplateFillerHtml, MIN_BODY_CHARS } from "./article-schema";
import type { KennisbankArticleFile } from "./article-schema";
import { buildHandwrittenUniqueGuide } from "./handwritten-unique-guide";
import { englishTitleFromDutch } from "./write-article";

type Catalog = {
  articles: { slug: string; title: string; categories: string[]; topic: string }[];
};

function plain(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function hasStepsSection(html: string) {
  return /<h2>\s*(Stappen|Steps)\s*<\/h2>/i.test(html);
}

function hasInfoShape(html: string) {
  return (
    /<h2>\s*(Wat het is|What it is|Hoe je vergelijkt|How to compare)\s*<\/h2>/i.test(
      html,
    ) && !hasStepsSection(html)
  );
}

const DUTCH_LEFTOVER =
  /\b(wachtwoord|handtekening|klantenpanel|klantomgeving|quarantaine|autorisatiecode|gelockt|licentie|handmatig|nieuwsbrief|landingspagina|gebruiker|toewijzen|intrekken|pakkettraject|vervolgstappen|overzicht|producten|diensten|aantoonbare|toestemming|trustsignalen|privacytekst|meertalige|dubbele|belafspraak|samenwerking|opleveringen|feedbackrondes|schijfruimte|betaling|korting|geslaagde|mislukte|maandelijkse|jaarlijkse|inloggen|uitloggen|instellingen|beheer|stappenplan|handleiding|uitleg|foutmelding|paneel|hostingpakket|e-mailadres|voorbereiding|stappen|controleren|toevoegen|verwijderen|aanpassen|inschakelen|uitschakelen|opzeggen|verhuizen|migreren|koppelen|doorsturen|afbeeldingen|vindbaarheid|certificering|kwetsbaarheid|formulieren|toegankelijkheid|herroepingsrecht|juridische|nazorg|doorlopende|optimalisatie|onderwerp)\b/i;

function main() {
  const catalog = JSON.parse(
    readFileSync(join(__dirname, "catalog.json"), "utf8"),
  ) as Catalog;

  let rebuilt = 0;
  let failed = 0;
  let infoCount = 0;
  let howtoCount = 0;
  const failures: string[] = [];
  const dutchLeft: string[] = [];
  const shapeMismatch: string[] = [];

  for (const article of catalog.articles) {
    const path = join(ARTICLES_DIR, `${article.slug}.json`);
    const file = JSON.parse(readFileSync(path, "utf8")) as KennisbankArticleFile;
    const nlTitle = (file.nl?.title || article.title).trim();
    const enTitle = (
      file.en?.title || englishTitleFromDutch(nlTitle, article.slug)
    ).trim();

    const guide = buildHandwrittenUniqueGuide(
      {
        slug: article.slug,
        title: nlTitle,
        topic: article.topic,
        categories: article.categories,
      },
      enTitle,
    );

    const next: KennisbankArticleFile = {
      ...file,
      slug: article.slug,
      topic: article.topic,
      nl: {
        ...file.nl,
        title: nlTitle,
        excerpt: guide.excerptNl,
        bodyHtml: guide.bodyNl,
        seoTitle: `${nlTitle} | TripleZero iT`,
        seoDescription: guide.excerptNl,
      },
      en: {
        ...file.en,
        title: enTitle,
        excerpt: guide.excerptEn,
        bodyHtml: guide.bodyEn,
        seoTitle: `${enTitle} | TripleZero iT`,
        seoDescription: guide.excerptEn,
      },
    };

    const nlPlain = plain(next.nl.bodyHtml);
    const enPlain = plain(next.en.bodyHtml);
    const isInfo =
      /uitleg over|plain-language explanation/i.test(guide.excerptNl) ||
      /uitleg over|plain-language explanation/i.test(guide.excerptEn);

    if (isInfo) {
      infoCount += 1;
      if (!hasInfoShape(next.nl.bodyHtml) || !hasInfoShape(next.en.bodyHtml)) {
        shapeMismatch.push(`${article.slug}: expected info shape`);
      }
      if (hasStepsSection(next.nl.bodyHtml) || hasStepsSection(next.en.bodyHtml)) {
        shapeMismatch.push(`${article.slug}: info has Steps`);
      }
    } else {
      howtoCount += 1;
      if (!hasStepsSection(next.nl.bodyHtml) || !hasStepsSection(next.en.bodyHtml)) {
        shapeMismatch.push(`${article.slug}: howto missing Steps`);
      }
    }

    if (
      isTemplateFillerHtml(next.nl.bodyHtml) ||
      isTemplateFillerHtml(next.en.bodyHtml) ||
      nlPlain.length < MIN_BODY_CHARS ||
      enPlain.length < MIN_BODY_CHARS
    ) {
      failed += 1;
      failures.push(`${article.slug}: filler/short`);
      continue;
    }

    const errors = validateArticleFile(next);
    if (errors.length) {
      failed += 1;
      failures.push(`${article.slug}: ${errors.join("; ")}`);
      continue;
    }

    if (DUTCH_LEFTOVER.test(`${next.en.excerpt}\n${enPlain}`)) {
      dutchLeft.push(article.slug);
    }

    writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
    rebuilt += 1;
    if (rebuilt % 250 === 0) {
      console.log(`[rebuild-all-nl-en] ${rebuilt}/${catalog.articles.length}`);
    }
  }

  const hashNl = new Map<string, string[]>();
  const hashEn = new Map<string, string[]>();
  for (const a of catalog.articles) {
    const file = JSON.parse(
      readFileSync(join(ARTICLES_DIR, `${a.slug}.json`), "utf8"),
    ) as KennisbankArticleFile;
    const norm = (html: string) =>
      html
        .replace(/“[^”]+”/g, "TITLE")
        .replace(/<strong>[^<]+<\/strong>/g, "FOCUS");
    const hn = createHash("sha1").update(norm(file.nl.bodyHtml)).digest("hex").slice(0, 16);
    const he = createHash("sha1").update(norm(file.en.bodyHtml)).digest("hex").slice(0, 16);
    (hashNl.get(hn) || hashNl.set(hn, []).get(hn)!).push(a.slug);
    (hashEn.get(he) || hashEn.set(he, []).get(he)!).push(a.slug);
  }

  const summary = {
    rebuilt,
    failed,
    infoCount,
    howtoCount,
    shapeMismatch: shapeMismatch.length,
    shapeMismatchSamples: shapeMismatch.slice(0, 15),
    dutchLeftoverFlagged: dutchLeft.length,
    dutchSamples: dutchLeft.slice(0, 20),
    nlUniqueShapes: hashNl.size,
    enUniqueShapes: hashEn.size,
    nlClustersGe4: [...hashNl.values()].filter((c) => c.length >= 4).length,
    enClustersGe4: [...hashEn.values()].filter((c) => c.length >= 4).length,
    failureSamples: failures.slice(0, 20),
  };
  console.log(JSON.stringify(summary, null, 2));
  if (failed || shapeMismatch.length) process.exit(1);
}

main();

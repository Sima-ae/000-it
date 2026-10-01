#!/usr/bin/env tsx
/**
 * Rebuild ALL EN bodies/excerpts from the handwritten composer.
 * Keeps existing (already-corrected) EN titles. NL untouched.
 *
 * Usage: npx tsx prisma/kennisbank/rebuild-en-bodies.ts
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ARTICLES_DIR, validateArticleFile } from "./load-article";
import { isTemplateFillerHtml, MIN_BODY_CHARS } from "./article-schema";
import type { KennisbankArticleFile } from "./article-schema";
import { buildHandwrittenUniqueGuide } from "./handwritten-unique-guide";

type Catalog = {
  articles: { slug: string; title: string; categories: string[]; topic: string }[];
};

function plain(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Dutch leftovers that must not remain in EN bodies/excerpts. */
const DUTCH_LEFTOVER =
  /\b(wachtwoord|handtekening|klantenpanel|klantomgeving|quarantaine|autorisatiecode|gelockt|licentie|handmatig|nieuwsbrief|landingspagina|gebruiker|toewijzen|intrekken|pakkettraject|vervolgstappen|overzicht|producten|diensten|aantoonbare|toestemming|trustsignalen|privacytekst|meertalige|dubbele|belafspraak|samenwerking|opleveringen|feedbackrondes|schijfruimte|betaling|korting|geslaagde|mislukte|maandelijkse|jaarlijkse|inloggen|uitloggen|instellingen|beheer|stappenplan|handleiding|uitleg|foutmelding|paneel|hostingpakket|e-mailadres|voorbereiding|stappen|controleren|toevoegen|verwijderen|aanpassen|inschakelen|uitschakelen|opzeggen|verhuizen|migreren|koppelen|doorsturen|afbeeldingen|vindbaarheid|certificering|kwetsbaarheid|formulieren|toegankelijkheid|herroepingsrecht|juridische|nazorg|doorlopende|optimalisatie|onderwerp)\b/i;

function main() {
  const catalog = JSON.parse(
    readFileSync(join(__dirname, "catalog.json"), "utf8"),
  ) as Catalog;

  let rebuilt = 0;
  let failed = 0;
  const failures: string[] = [];
  const dutchLeft: string[] = [];

  for (const article of catalog.articles) {
    const path = join(ARTICLES_DIR, `${article.slug}.json`);
    const file = JSON.parse(readFileSync(path, "utf8")) as KennisbankArticleFile;

    // Keep the already-corrected EN title; fall back to NL title only if missing.
    const enTitle = (file.en?.title || article.title).trim();
    const guide = buildHandwrittenUniqueGuide(
      {
        slug: article.slug,
        title: file.nl?.title || article.title,
        topic: article.topic,
        categories: article.categories,
      },
      enTitle,
    );

    const next: KennisbankArticleFile = {
      ...file,
      en: {
        ...file.en,
        title: enTitle,
        excerpt: guide.excerptEn,
        bodyHtml: guide.bodyEn,
        seoTitle: `${enTitle} | TripleZero iT`,
        seoDescription: guide.excerptEn,
      },
    };

    const bodyPlain = plain(next.en.bodyHtml);
    if (
      isTemplateFillerHtml(next.en.bodyHtml) ||
      bodyPlain.length < MIN_BODY_CHARS
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

    if (DUTCH_LEFTOVER.test(`${next.en.excerpt}\n${bodyPlain}`)) {
      dutchLeft.push(article.slug);
    }

    writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
    rebuilt += 1;
    if (rebuilt % 200 === 0) {
      console.log(`[rebuild-en-bodies] ${rebuilt}/${catalog.articles.length}`);
    }
  }

  // Uniqueness gate (ignore quoted title variance)
  const eg = new Map<string, string[]>();
  for (const a of catalog.articles) {
    const en =
      (JSON.parse(readFileSync(join(ARTICLES_DIR, `${a.slug}.json`), "utf8")) as KennisbankArticleFile)
        .en.bodyHtml || "";
    const h = createHash("sha1")
      .update(en.replace(/“[^”]+”/g, "TITLE").replace(/<strong>[^<]+<\/strong>/g, "FOCUS"))
      .digest("hex")
      .slice(0, 16);
    const list = eg.get(h) || [];
    list.push(a.slug);
    eg.set(h, list);
  }
  const clustersGe4 = [...eg.values()].filter((c) => c.length >= 4);

  console.log(
    JSON.stringify(
      {
        rebuilt,
        failed,
        dutchLeftoverFlagged: dutchLeft.length,
        enUniqueShapes: eg.size,
        enClustersGe4: clustersGe4.length,
        failureSamples: failures.slice(0, 20),
        dutchSamples: dutchLeft.slice(0, 30),
        clusterSamples: clustersGe4.slice(0, 5).map((c) => c.slice(0, 6)),
      },
      null,
      2,
    ),
  );

  if (failed) process.exit(1);
}

main();

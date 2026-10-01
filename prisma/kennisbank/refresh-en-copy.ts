#!/usr/bin/env tsx
/**
 * Refresh English titles + excerpts from the bilingual writer,
 * keeping curated articles and all NL bodies intact.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ARTICLES_DIR } from "./load-article";
import { writeArticle } from "./write-article";
import type { KennisbankArticleFile } from "./article-schema";
import { CURATED_ARTICLES } from "./curated-articles";
import { readFileSync as read } from "node:fs";

type Catalog = {
  articles: { slug: string; title: string; categories: string[]; topic: string }[];
};

function looksDutch(text: string): boolean {
  return /[àáäâèéëêìíïîòóöôùúüû]|(\b(aan|het|een|van|voor|met|naar|niet|jouw|mijn|wachtwoord|domeinnaam|e-mailadres|aanpassen|toevoegen|wijzigen|verwijderen|instellen|aanmaken|beheren|bestanden|afzenders|trefwoorden|afschermen|beveiligen|als|nieuw)\b)/i.test(
    text,
  );
}

function main() {
  const catalog = JSON.parse(
    read(join(__dirname, "catalog.json"), "utf8"),
  ) as Catalog;
  const bySlug = new Map(catalog.articles.map((a) => [a.slug, a]));
  const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".json"));
  let updated = 0;

  for (const fileName of files) {
    const path = join(ARTICLES_DIR, fileName);
    const raw = JSON.parse(readFileSync(path, "utf8")) as KennisbankArticleFile;
    if (CURATED_ARTICLES[raw.slug]) continue;
    const cat = bySlug.get(raw.slug);
    if (!cat) continue;

    const generated = writeArticle(cat);
    const titleDirty = looksDutch(raw.en.title);
    const excerptDirty = looksDutch(raw.en.excerpt);
    if (!titleDirty && !excerptDirty) continue;

    raw.en.title = generated.en.title;
    raw.en.excerpt = generated.en.excerpt;
    raw.en.seoTitle = generated.en.seoTitle;
    raw.en.seoDescription = generated.en.seoDescription;
    // Keep curated/hand-crafted EN bodies unless they still look Dutch
    if (looksDutch(raw.en.bodyHtml.slice(0, 400))) {
      raw.en.bodyHtml = generated.en.bodyHtml;
    }
    writeFileSync(path, `${JSON.stringify(raw, null, 2)}\n`);
    updated += 1;
  }
  console.log(`[refresh-en-copy] updated=${updated}`);
}

main();

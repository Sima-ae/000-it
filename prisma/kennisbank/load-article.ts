/**
 * Load curated article JSON from prisma/kennisbank/articles/{slug}.json
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { KennisbankArticleFile } from "./article-schema";
import {
  FILLER_PHRASES,
  MIN_BODY_CHARS,
  MIN_EXCERPT_CHARS,
} from "./article-schema";

export const ARTICLES_DIR = join(__dirname, "articles");

export function articleFilePath(slug: string): string {
  return join(ARTICLES_DIR, `${slug}.json`);
}

export function loadArticleFile(slug: string): KennisbankArticleFile | null {
  const path = articleFilePath(slug);
  if (!existsSync(path)) return null;
  const raw = JSON.parse(readFileSync(path, "utf8")) as KennisbankArticleFile;
  if (!raw?.slug || !raw.nl?.bodyHtml || !raw.en?.bodyHtml) return null;
  return raw;
}

export function listArticleSlugsOnDisk(): string[] {
  if (!existsSync(ARTICLES_DIR)) return [];
  return readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

export function findFillerHits(html: string): string[] {
  const hits: string[] = [];
  for (const phrase of FILLER_PHRASES) {
    if (html.includes(phrase)) hits.push(phrase);
  }
  return hits;
}

export function validateArticleFile(
  file: KennisbankArticleFile,
): string[] {
  const errors: string[] = [];
  for (const locale of ["nl", "en"] as const) {
    const block = file[locale];
    if (!block?.title?.trim()) errors.push(`${locale}: missing title`);
    if (!block?.excerpt || block.excerpt.trim().length < MIN_EXCERPT_CHARS) {
      errors.push(`${locale}: excerpt too short`);
    }
    if (!block?.bodyHtml || block.bodyHtml.trim().length < MIN_BODY_CHARS) {
      errors.push(`${locale}: body too short`);
    }
    if (block?.bodyHtml) {
      for (const hit of findFillerHits(block.bodyHtml)) {
        errors.push(`${locale}: filler phrase “${hit}”`);
      }
      if (block.excerpt) {
        for (const hit of findFillerHits(block.excerpt)) {
          errors.push(`${locale}: filler in excerpt “${hit}”`);
        }
      }
    }
  }
  return errors;
}

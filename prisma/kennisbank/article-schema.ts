/**
 * Per-article curated knowledge-base content (NL + EN).
 * One JSON file per catalog slug: prisma/kennisbank/articles/{slug}.json
 */

export type KennisbankArticleLocaleContent = {
  title: string;
  excerpt: string;
  bodyHtml: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type KennisbankArticleFile = {
  slug: string;
  topic: string;
  nl: KennisbankArticleLocaleContent;
  en: KennisbankArticleLocaleContent;
};

/** Phrases that mean the body is still filler/generic and must fail coverage. */
export const FILLER_PHRASES = [
  "Dit artikel legt uit wat",
  "Concrete check voor dit artikel",
  "nep-stappenplan",
  "zonder een nep-stappenplan",
  "open het juiste wp-admin menu voor dit onderwerp",
  "Open Files/FTP/PHP/SSL/Backups/Cron zoals dit onderwerp vraagt",
  "Professional TripleZero iT guide:",
  "knowledge-base article explains",
  "This article explains what “",
  "Carry out the action that matches",
  "Voer de handeling uit die past bij",
  "leg vast wat je wijzigde, test het resultaat buiten het panel",
  "Open het menu dat hoort bij",
  "Open the menu related to",
  "Zoek de instelling die bij",
  "Find the setting that matches",
  "In deze handleiding volg je de stappen om <strong>",
  "This guide walks you through setting up <strong>",
  "Dit artikel gaat over <strong>",
  "This article covers <strong>",
  "Deze long-form guide is geschreven voor",
  "This long-form guide is written for",
  "Signalen uit titel/topic",
  "Signals from title/topic",
  "Unieke aandachtspunten",
  "Unique checkpoints",
  "Artikelcheck",
  "Article check",
  "Interne classificatie",
  "Internal classification",
  "Open het scherm dat bij",
  "Open the screen that matches",
  "wat bij “",
  "whichever matches",
  "Open de module die bij",
  "Open the module that matches",
  "Voer de handeling voor",
  "Apply the change for “",
  "Bepaal het juiste oppervlak",
  "Pick the correct surface",
] as const;

export const MIN_BODY_CHARS = 280;
export const MIN_EXCERPT_CHARS = 40;

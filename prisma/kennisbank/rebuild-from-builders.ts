#!/usr/bin/env tsx
/**
 * Rebuild article JSON for category body packs that have real how-tos.
 * NL from topic builders; EN from bilingual writer.
 *
 * Usage:
 *   npx tsx prisma/kennisbank/rebuild-from-builders.ts --pack=cyberpanel
 *   npx tsx prisma/kennisbank/rebuild-from-builders.ts --all
 */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cyberpanelTopicBuilders } from "./cyberpanel-bodies";
import { pleskTopicBuilders } from "./plesk-bodies";
import { microsoftTopicBuilders } from "./microsoft-bodies";
import { bloggenTopicBuilders } from "./bloggen-bodies";
import { veiligOnlineTopicBuilders } from "./veilig-online-bodies";
import { webdesignTopicBuilders } from "./webdesign-bodies";
import { aiScanTopicBuilders } from "./ai-scan-bodies";
import { aeoGeoSeoTopicBuilders } from "./aeo-geo-seo-bodies";
import { agentTopicBuilders } from "./agent-bodies";
import { aiIntegratieTopicBuilders } from "./ai-integratie-bodies";
import { analyticsCroTopicBuilders } from "./analytics-cro-bodies";
import { ecommerceTopicBuilders } from "./ecommerce-bodies";
import { cdnPerformanceTopicBuilders } from "./cdn-performance-bodies";
import { infraTopicBuilders } from "./infra-bodies";
import { troubleshootingTopicBuilders } from "./troubleshooting-bodies";
import { privacyComplianceTopicBuilders } from "./privacy-compliance-bodies";
import { vergelijkingenTopicBuilders } from "./vergelijkingen-bodies";
import { ARTICLES_DIR, validateArticleFile } from "./load-article";
import { writeArticle, type CatalogArticle } from "./write-article";
import type { KennisbankArticleFile } from "./article-schema";
import { CURATED_ARTICLES } from "./curated-articles";

type Catalog = { articles: CatalogArticle[] };
type BuilderMap = Record<string, (ctx: { title: string; topic: string }) => string>;

const PACKS: Record<
  string,
  { builders: BuilderMap; categoryMatch: (cats: string[]) => boolean }
> = {
  cyberpanel: {
    builders: cyberpanelTopicBuilders,
    categoryMatch: (cats) =>
      cats.some((c) => c === "cyberpanel" || c.startsWith("cyberpanel-")),
  },
  plesk: {
    builders: pleskTopicBuilders,
    categoryMatch: (cats) =>
      cats.some((c) => c === "plesk" || c.startsWith("plesk-")),
  },
  microsoft: {
    builders: microsoftTopicBuilders,
    categoryMatch: (cats) =>
      cats.some((c) => c === "microsoft" || c.startsWith("microsoft-")),
  },
  bloggen: {
    builders: bloggenTopicBuilders,
    categoryMatch: (cats) =>
      cats.some((c) => c === "bloggen" || c.startsWith("bloggen-")),
  },
  "veilig-online": {
    builders: veiligOnlineTopicBuilders,
    categoryMatch: (cats) =>
      cats.some((c) => c === "veilig-online" || c.startsWith("veilig-online-")),
  },
  webdesign: {
    builders: webdesignTopicBuilders,
    categoryMatch: (cats) =>
      cats.some(
        (c) =>
          c === "webdesign-en-maatwerk" || c.startsWith("webdesign-en-maatwerk-"),
      ),
  },
  "ai-scan": {
    builders: aiScanTopicBuilders,
    categoryMatch: (cats) =>
      cats.some((c) => c === "ai-scan" || c.startsWith("ai-scan-")),
  },
  "aeo-geo-seo": {
    builders: aeoGeoSeoTopicBuilders,
    categoryMatch: (cats) =>
      cats.some((c) => c === "aeo-geo-seo" || c.startsWith("aeo-geo-seo-")),
  },
  "ai-agents": {
    builders: agentTopicBuilders,
    categoryMatch: (cats) =>
      cats.some((c) => c === "ai-agents" || c.startsWith("ai-agents-")),
  },
  "ai-integratie": {
    builders: aiIntegratieTopicBuilders,
    categoryMatch: (cats) =>
      cats.some(
        (c) =>
          c === "ai-integratie-automatisering" ||
          c.startsWith("ai-integratie-automatisering-"),
      ),
  },
  analytics: {
    builders: analyticsCroTopicBuilders,
    categoryMatch: (cats) =>
      cats.some(
        (c) =>
          c === "analytics-conversie-toegankelijkheid" ||
          c.startsWith("analytics-conversie-toegankelijkheid-"),
      ),
  },
  ecommerce: {
    builders: ecommerceTopicBuilders,
    categoryMatch: (cats) =>
      cats.some(
        (c) =>
          c === "e-commerce-webshops" || c.startsWith("e-commerce-webshops-"),
      ),
  },
  cdn: {
    builders: cdnPerformanceTopicBuilders,
    categoryMatch: (cats) =>
      cats.some(
        (c) =>
          c === "cdn-performance-cloudflare" ||
          c.startsWith("cdn-performance-cloudflare-"),
      ),
  },
  infra: {
    builders: infraTopicBuilders,
    categoryMatch: (cats) =>
      cats.some(
        (c) =>
          c === "infrastructuur-servers" ||
          c.startsWith("infrastructuur-servers-") ||
          c === "vps" ||
          c.startsWith("vps-"),
      ),
  },
  troubleshooting: {
    builders: troubleshootingTopicBuilders,
    categoryMatch: (cats) =>
      cats.some(
        (c) =>
          c === "foutmeldingen-troubleshooting" ||
          c.startsWith("foutmeldingen-troubleshooting-"),
      ),
  },
  privacy: {
    builders: privacyComplianceTopicBuilders,
    categoryMatch: (cats) =>
      cats.some(
        (c) =>
          c === "privacy-juridisch-compliance" ||
          c.startsWith("privacy-juridisch-compliance-"),
      ),
  },
  vergelijkingen: {
    builders: vergelijkingenTopicBuilders,
    categoryMatch: (cats) =>
      cats.some(
        (c) =>
          c === "vergelijkingen-keuzehulp" ||
          c.startsWith("vergelijkingen-keuzehulp-"),
      ),
  },
};

function argValue(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

function argFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

function rebuildPack(packName: string, catalog: Catalog) {
  const pack = PACKS[packName];
  if (!pack) throw new Error(`Unknown pack: ${packName}`);

  let written = 0;
  let fromBuilder = 0;

  for (const article of catalog.articles) {
    if (CURATED_ARTICLES[article.slug]) continue;
    if (!pack.categoryMatch(article.categories)) continue;

    const generated = writeArticle(article);
    const hasBuilder = Object.hasOwn(pack.builders, article.topic);
    const bodyNl = hasBuilder
      ? pack.builders[article.topic]({
          title: article.title,
          topic: article.topic,
        })
      : generated.nl.bodyHtml;

    // Skip obvious filler builders if they contain banned phrases
    const useNl =
      hasBuilder &&
      !/Concrete check voor dit artikel|Dit artikel legt uit wat|nep-stappenplan|Open Files\/FTP\/PHP\/SSL\/Backups\/Cron zoals dit onderwerp vraagt/.test(
        bodyNl,
      )
        ? bodyNl
        : generated.nl.bodyHtml;

    if (hasBuilder && useNl === bodyNl) fromBuilder += 1;

    const file: KennisbankArticleFile = {
      slug: article.slug,
      topic: article.topic,
      nl: {
        title: article.title,
        excerpt: generated.nl.excerpt,
        bodyHtml: useNl,
        seoTitle: `${article.title} | TripleZero iT`,
        seoDescription: generated.nl.excerpt,
      },
      en: generated.en,
    };

    const errors = validateArticleFile(file);
    if (errors.length) {
      writeFileSync(
        join(ARTICLES_DIR, `${article.slug}.json`),
        `${JSON.stringify(generated, null, 2)}\n`,
      );
    } else {
      writeFileSync(
        join(ARTICLES_DIR, `${article.slug}.json`),
        `${JSON.stringify(file, null, 2)}\n`,
      );
    }
    written += 1;
  }

  console.log(
    `[rebuild-from-builders] pack=${packName} written=${written} nlFromBuilder=${fromBuilder}`,
  );
}

function main() {
  const catalog = JSON.parse(
    readFileSync(join(__dirname, "catalog.json"), "utf8"),
  ) as Catalog;
  mkdirSync(ARTICLES_DIR, { recursive: true });

  if (argFlag("all")) {
    for (const name of Object.keys(PACKS)) rebuildPack(name, catalog);
    return;
  }
  const pack = argValue("pack");
  if (!pack) {
    console.error("Usage: --pack=cyberpanel|plesk|... or --all");
    process.exit(1);
  }
  rebuildPack(pack, catalog);
}

main();

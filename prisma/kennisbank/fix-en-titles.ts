#!/usr/bin/env tsx
/**
 * Fix EN article titles that still contain Dutch glossary leftovers.
 * Translates from NL title → EN via Google Translate; updates seoTitle too.
 * Bodies are left untouched.
 *
 * Usage: npx tsx --env-file=.env prisma/kennisbank/fix-en-titles.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ARTICLES_DIR } from "./load-article";
import type { KennisbankArticleFile } from "./article-schema";
import { translateText } from "../../src/lib/google-translate";

type Catalog = {
  articles: { slug: string; title: string; categories: string[]; topic: string }[];
};

const DUTCH_SIGNAL =
  /\b(de|het|een|van|voor|met|op|je|jouw|mijn|hoe|wat|waarom|welke|waar|kan|zijn|niet|ook|nog|als|dan|bij|naar|uit|over|door|via|te|tot|of|en|instellen|aanmaken|wijzigen|verwijderen|beheren|gebruiken|koppelen|herstellen|controleren|bekijken|blokkeren|activeren|aanpassen|inloggen|wachtwoord|handtekening|domeinnaam|domeinnamen|e-mailadres|postvak|klantenpanel|bescherm|kinderen|verifieren|inkomende|uitgaande|berichten|nieuwe|bestaande|volledige|juiste|eigen|gratis|veilig|snel|zonder|tegen|tussen|stappenplan|handleiding|uitleg|foutmelding|probleemoplossing|instellingen|gegevens|gebruikersnaam|certificaat|opslag|bandbreedte|factuur|abonnement|opzeggen|verhuizen|migratie|beveiliging|firewall|poortscanning|detecteren|reageren|toevoegen|wachtwoorden|resetten|terug|vinden|meerdere|dezelfde|opheffen|overstappen|bloggen|toegang|accountnaam|worden|gewijzigd|verkleinen|vergroten|vol|problemen|regelen|wij|verbruikt|ontvangen|mappenlijst|mislukt|hoge|bezoeken|bots|hoeveel|gebruikt|voorkomen|raakt|worden|verstuurd|vanuit|mailing|sturen|groot|adressenbestand|maar|verzenden|vanaf|foutmelding|serverfout|versturen|voorkom|versleutel|kopieren|ander|afschermen|beveiligen|gedetecteerd|onveilige|versie|gehackt|kunnen|jullie|oplossen|beschermen|hacks|heb|wil|naar|van|na)\b/i;

const BROKEN =
  /\bHow do I \w+ I (my|your)\b|\bI my\b|\bKan I\b|\bHeb I\b|\bI wil\b|\bI kan\b|\bConnect Kan\b|\bSign in to I\b|\bAlles about\b|\bnot terug\b|\bor dienst\b|\bworden gewijzigd\b/i;

function needsFix(enTitle: string): boolean {
  if (!enTitle?.trim()) return true;
  if (BROKEN.test(enTitle)) return true;
  if (DUTCH_SIGNAL.test(enTitle)) return true;
  return false;
}

function polishEnTitle(s: string): string {
  let out = s
    .replace(/\s+/g, " ")
    .replace(/\s+\?/g, "?")
    .replace(/\bspf\b/gi, "SPF")
    .replace(/\bdkim\b/gi, "DKIM")
    .replace(/\bdmarc\b/gi, "DMARC")
    .replace(/\bssl\b/gi, "SSL")
    .replace(/\bdns\b/gi, "DNS")
    .replace(/\bphp\b/gi, "PHP")
    .replace(/\bftp\b/gi, "FTP")
    .replace(/\bssh\b/gi, "SSH")
    .replace(/\bwordpress\b/gi, "WordPress")
    .replace(/\bdirectadmin\b/gi, "DirectAdmin")
    .replace(/\bcyberpanel\b/gi, "CyberPanel")
    .replace(/\bplesk\b/gi, "Plesk")
    .replace(/\bwoocommerce\b/gi, "WooCommerce")
    .replace(/\bfilezilla\b/gi, "FileZilla")
    .replace(/\broundcube\b/gi, "Roundcube")
    .replace(/\bteamviewer\b/gi, "TeamViewer")
    .replace(/\bmollie\b/gi, "Mollie")
    .replace(/\bcloudflare\b/gi, "Cloudflare")
    .replace(/\btriplezero it\b/gi, "TripleZero iT")
    .trim();
  if (!out) return out;
  out = out.charAt(0).toUpperCase() + out.slice(1);
  return out;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const catalog = JSON.parse(
    readFileSync(join(__dirname, "catalog.json"), "utf8"),
  ) as Catalog;

  let scanned = 0;
  let fixed = 0;
  let skipped = 0;
  let failed = 0;
  const stillBad: string[] = [];

  for (const article of catalog.articles) {
    scanned += 1;
    const path = join(ARTICLES_DIR, `${article.slug}.json`);
    const file = JSON.parse(readFileSync(path, "utf8")) as KennisbankArticleFile;
    const current = file.en?.title || "";
    if (!needsFix(current)) {
      skipped += 1;
      continue;
    }

    const nlTitle = (file.nl?.title || article.title).trim();
    try {
      let enTitle = await translateText(nlTitle, "en", "nl");
      enTitle = polishEnTitle(enTitle);
      // If MT still looks Dutch, try once more from slug-ish fallback
      if (needsFix(enTitle)) {
        await sleep(200);
        enTitle = polishEnTitle(await translateText(nlTitle, "en", "nl"));
      }

      file.en = {
        ...file.en,
        title: enTitle,
        seoTitle: `${enTitle} | TripleZero iT`,
      };
      // Keep excerpt/body; only refresh seoDescription if it mirrored old title awkwardly
      writeFileSync(path, `${JSON.stringify(file, null, 2)}\n`);
      fixed += 1;
      if (needsFix(enTitle)) stillBad.push(`${article.slug} => ${enTitle}`);
      if (fixed % 25 === 0) {
        console.log(`[fix-en-titles] fixed=${fixed} skipped=${skipped}`);
      }
      await sleep(180);
    } catch (e) {
      failed += 1;
      console.error(`[fail] ${article.slug}`, (e as Error).message || e);
      await sleep(500);
    }
  }

  console.log(
    `[fix-en-titles] scanned=${scanned} fixed=${fixed} skipped=${skipped} failed=${failed} stillFlagged=${stillBad.length}`,
  );
  if (stillBad.length) {
    console.log("still flagged samples:", stillBad.slice(0, 15));
  }
  if (failed) process.exit(1);
}

main();

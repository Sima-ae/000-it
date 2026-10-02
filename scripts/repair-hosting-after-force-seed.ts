/**
 * Repair hosting catalog after an accidental `shop:seed --force`.
 *
 * 1) Restores full plan names (Cloud / E-mail / VPS Start were shortened to
 *    "Basic" / "Start" / "Pro" by static product-i18n).
 * 2) Fixes inverted list/sale prices (force seed overwrote list prices but
 *    left admin discountPriceInclCents — so sale became higher than list).
 *
 * Safe to re-run. Does not touch specs (shortDescription) when already set.
 *
 *   npx tsx --env-file=.env scripts/repair-hosting-after-force-seed.ts
 */
import { prisma } from "../src/lib/prisma";

const FULL_NAMES: Record<string, { nl: string; en: string }> = {
  "cloud-hosting-start": {
    nl: "Cloud Hosting Start",
    en: "Cloud Hosting Start",
  },
  "cloud-hosting-basic": {
    nl: "Cloud Hosting Basic",
    en: "Cloud Hosting Basic",
  },
  "cloud-hosting-plus": {
    nl: "Cloud Hosting Plus",
    en: "Cloud Hosting Plus",
  },
  "email-hosting-basic": {
    nl: "E-mail Hosting Basic",
    en: "Email Hosting Basic",
  },
  "email-hosting-business": {
    nl: "E-mail Hosting Business",
    en: "Email Hosting Business",
  },
  "email-hosting-plus": {
    nl: "E-mail Hosting Plus",
    en: "Email Hosting Plus",
  },
  "vps-hosting-start": {
    nl: "VPS Hosting Start",
    en: "VPS Hosting Start",
  },
};

const SHORT_NAME_RE =
  /^(start|basic|plus|business|pro|cloud hosting start|cloud hosting basic|cloud hosting plus|e-?mail hosting basic|e-?mail hosting business|e-?mail hosting plus|vps hosting start)$/i;

async function main() {
  const rows = await prisma.shopCatalogProduct.findMany({
    where: {
      OR: [
        { slug: { startsWith: "shared-hosting-" } },
        { slug: { startsWith: "cloud-hosting-" } },
        { slug: { startsWith: "email-hosting-" } },
        { slug: { startsWith: "reseller-hosting-" } },
        { slug: { startsWith: "wordpress-hosting-" } },
        { slug: { startsWith: "vps-hosting-" } },
      ],
    },
  });

  let namesFixed = 0;
  let pricesSwapped = 0;

  for (const row of rows) {
    const patch: {
      nameNl?: string;
      nameEn?: string;
      priceInclCents?: number;
      discountPriceInclCents?: number | null;
    } = {};

    const full = FULL_NAMES[row.slug];
    if (full) {
      const nlShort = SHORT_NAME_RE.test(row.nameNl.trim());
      const enShort = SHORT_NAME_RE.test(row.nameEn.trim());
      if (nlShort && row.nameNl !== full.nl) {
        patch.nameNl = full.nl;
      }
      if (enShort && row.nameEn !== full.en) {
        patch.nameEn = full.en;
      }
    }

    const list = row.priceInclCents;
    const sale = row.discountPriceInclCents;
    if (
      typeof sale === "number" &&
      Number.isFinite(sale) &&
      sale > 0 &&
      sale >= list
    ) {
      // Force-seed overwrote list with the lower static price and left the
      // higher admin "discount" — swap back so sale < list again.
      patch.priceInclCents = sale;
      patch.discountPriceInclCents = list;
    }

    if (Object.keys(patch).length === 0) continue;

    await prisma.shopCatalogProduct.update({
      where: { id: row.id },
      data: patch,
    });

    if (patch.nameNl || patch.nameEn) {
      namesFixed += 1;
      console.log(
        "name",
        row.slug,
        "→",
        patch.nameNl || row.nameNl,
        "/",
        patch.nameEn || row.nameEn,
      );
    }
    if (patch.priceInclCents != null) {
      pricesSwapped += 1;
      console.log(
        "price",
        row.slug,
        `list €${(patch.priceInclCents / 100).toFixed(2)}`,
        `sale €${((patch.discountPriceInclCents ?? 0) / 100).toFixed(2)}`,
      );
    }
  }

  console.log(JSON.stringify({ namesFixed, pricesSwapped, total: rows.length }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

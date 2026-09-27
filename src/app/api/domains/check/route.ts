import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  checkDomains,
  isNamecheapConfigured,
  namecheapMissingEnv,
  premiumRegisterBuyUsd,
  premiumRenewBuyUsd,
  premiumTransferBuyUsd,
  type DomainCheckResult,
} from "@/lib/domains/namecheap";
import { checkDomainsForManualTlds } from "@/lib/domains/regery-availability";
import {
  sellPriceCents,
  renewSellPriceCents,
  transferSellPriceCents,
  restoreSellPriceCents,
  effectiveSellPriceCents,
  hasOfferPrice,
} from "@/lib/domains/pricing";
import { getUsdToEurRate } from "@/lib/domains/fx";
import { sellFromBuyUsd } from "@/lib/domains/premium-price";
import { compareTldsByPopularity } from "@/lib/domains/tld-order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function clientIp(request: Request) {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function allowRequest(ip: string) {
  const now = Date.now();
  const row = rateLimitMap.get(ip);
  if (row && now < row.resetTime) {
    if (row.count >= 60) return false;
    row.count += 1;
    return true;
  }
  rateLimitMap.set(ip, { count: 1, resetTime: now + 60_000 });
  return true;
}

const sldSchema = z
  .string()
  .min(1)
  .max(63)
  .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i);

const fqdnSchema = z
  .string()
  .min(3)
  .max(253)
  .regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,30}$/i);

export async function GET(request: Request) {
  const ip = clientIp(request);
  if (!allowRequest(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get("domain") || searchParams.get("q") || "").trim().toLowerCase();
  const tldsParam = (searchParams.get("tlds") || "").trim().toLowerCase();

  if (!raw) {
    return NextResponse.json({ error: "Missing domain" }, { status: 400 });
  }

  const activeProducts = await prisma.domainProduct.findMany({
    where: { isActive: true },
    orderBy: { tld: "asc" },
  });
  const priceByTld = new Map(
    activeProducts.map((p) => [p.tld, effectiveSellPriceCents(p)] as const),
  );
  const listPriceByTld = new Map(
    activeProducts.map((p) => [p.tld, sellPriceCents(p)] as const),
  );
  const offerByTld = new Map(
    activeProducts.map((p) => [p.tld, hasOfferPrice(p)] as const),
  );
  const renewByTld = new Map(
    activeProducts.map((p) => {
      const renew = renewSellPriceCents(p);
      return [p.tld, renew > 0 ? renew : null] as const;
    }),
  );
  const transferByTld = new Map(
    activeProducts.map((p) => {
      const transfer = transferSellPriceCents(p);
      return [p.tld, transfer > 0 ? transfer : null] as const;
    }),
  );
  const restoreByTld = new Map(
    activeProducts.map((p) => {
      const restore = restoreSellPriceCents(p);
      return [p.tld, restore > 0 ? restore : null] as const;
    }),
  );
  const manualByTld = new Map(
    activeProducts.map((p) => [p.tld, Boolean(p.manualPricing)] as const),
  );

  const sldFromFqdn = fqdnSchema.safeParse(raw).success
    ? raw.slice(0, raw.lastIndexOf("."))
    : null;
  const sld = (sldFromFqdn || (raw.includes(".") ? raw.split(".")[0] : raw))
    .toLowerCase()
    .trim();

  if (!sldSchema.safeParse(sld).success) {
    return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
  }

  const wanted = tldsParam
    ? tldsParam
        .split(",")
        .map((t) => t.replace(/^\./, "").trim())
        .filter(Boolean)
    : activeProducts.map((p) => p.tld);

  const pairs = wanted
    .filter((tld) => priceByTld.has(tld))
    .sort(compareTldsByPopularity)
    .slice(0, 80)
    .map((tld) => ({ domain: `${sld}.${tld}`, tld }));

  if (!pairs.length) {
    return NextResponse.json({ error: "No active TLDs to check" }, { status: 400 });
  }

  const namecheapPairs = pairs.filter((p) => !manualByTld.get(p.tld));
  const manualPairs = pairs.filter((p) => manualByTld.get(p.tld));

  if (namecheapPairs.length && !isNamecheapConfigured()) {
    const missing = namecheapMissingEnv();
    return NextResponse.json(
      {
        error: missing.length
          ? `Domain check unavailable — missing ${missing.join(", ")}. Restart the app after updating .env`
          : "Domain check is temporarily unavailable",
      },
      { status: 503 },
    );
  }

  try {
    const [ncChecked, manualChecked, fxRate] = await Promise.all([
      namecheapPairs.length
        ? checkDomains(namecheapPairs.map((p) => p.domain))
        : Promise.resolve([] as DomainCheckResult[]),
      manualPairs.length
        ? checkDomainsForManualTlds(manualPairs.map((p) => p.domain))
        : Promise.resolve([] as DomainCheckResult[]),
      getUsdToEurRate(),
    ]);

    const byDomain = new Map<string, DomainCheckResult>();
    for (const row of ncChecked) {
      byDomain.set(row.domain.toLowerCase(), row);
    }
    for (const row of manualChecked) {
      byDomain.set(row.domain.toLowerCase(), row);
    }

    const preferredTld = sldFromFqdn
      ? raw.slice(raw.lastIndexOf(".") + 1)
      : "";

    const results = pairs
      .map(({ domain, tld }) => {
        const row = byDomain.get(domain.toLowerCase());
        const catalogSell = priceByTld.get(tld) ?? null;
        const catalogList = listPriceByTld.get(tld) ?? null;
        const catalogRenew = renewByTld.get(tld) ?? null;
        const catalogTransfer = transferByTld.get(tld) ?? null;
        const catalogRestore = restoreByTld.get(tld) ?? null;
        const catalogOffer = offerByTld.get(tld) ?? false;

        const isPremium = Boolean(row?.isPremium);
        let priceInCents = catalogSell;
        let listPriceInCents = catalogList;
        let renewPriceInCents = catalogRenew;
        let transferPriceInCents = catalogTransfer;
        let restorePriceInCents = catalogRestore;
        let onOffer = catalogOffer;

        if (isPremium && row) {
          const regBuyUsd = premiumRegisterBuyUsd(row);
          const renewBuyUsd = premiumRenewBuyUsd(row);
          const transferBuyUsd = premiumTransferBuyUsd(row);
          const sell = sellFromBuyUsd(regBuyUsd, fxRate);
          const renewSell = sellFromBuyUsd(renewBuyUsd, fxRate);
          const transferSell = sellFromBuyUsd(transferBuyUsd, fxRate);
          // Never fall back to cheap catalog promo for premium names
          priceInCents = sell > 0 ? sell : null;
          listPriceInCents = priceInCents;
          renewPriceInCents = renewSell > 0 ? renewSell : priceInCents;
          transferPriceInCents =
            transferSell > 0 ? transferSell : renewPriceInCents;
          restorePriceInCents = catalogRestore;
          onOffer = false;
        }

        return {
          domain,
          available: Boolean(row?.available),
          isPremium,
          priceInCents,
          listPriceInCents,
          onOffer,
          renewPriceInCents,
          transferPriceInCents,
          restorePriceInCents,
          tld,
          source: manualByTld.get(tld) ? "regery" : "namecheap",
        };
      })
      .sort((a, b) => {
        if (preferredTld) {
          if (a.tld === preferredTld && b.tld !== preferredTld) return -1;
          if (b.tld === preferredTld && a.tld !== preferredTld) return 1;
        }
        return compareTldsByPopularity(a.tld, b.tld);
      });

    return NextResponse.json({ results, sld, fxRate });
  } catch (error) {
    console.error("[domains/check]", error);
    const message =
      error instanceof Error ? error.message : "Check failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

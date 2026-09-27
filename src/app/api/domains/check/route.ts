import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkDomains, isNamecheapConfigured, namecheapMissingEnv } from "@/lib/domains/namecheap";
import {
  sellPriceCents,
  renewSellPriceCents,
  effectiveSellPriceCents,
  hasOfferPrice,
} from "@/lib/domains/pricing";
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

  if (!isNamecheapConfigured()) {
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

  const sldFromFqdn = fqdnSchema.safeParse(raw).success
    ? raw.slice(0, raw.lastIndexOf("."))
    : null;
  const sld = (sldFromFqdn || (raw.includes(".") ? raw.split(".")[0] : raw))
    .toLowerCase()
    .trim();

  if (!sldSchema.safeParse(sld).success) {
    return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
  }

  // Always expand to active catalog TLDs so new DomainProduct rows are included.
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

  try {
    const checked = await checkDomains(pairs.map((p) => p.domain));
    const byDomain = new Map(
      checked.map((row) => [row.domain.toLowerCase(), row] as const),
    );
    const preferredTld = sldFromFqdn
      ? raw.slice(raw.lastIndexOf(".") + 1)
      : "";

    const results = pairs
      .map(({ domain, tld }) => {
        const row = byDomain.get(domain.toLowerCase());
        const priceInCents = priceByTld.get(tld) ?? null;
        const listPriceInCents = listPriceByTld.get(tld) ?? null;
        const onOffer = offerByTld.get(tld) ?? false;
        return {
          domain,
          available: Boolean(row?.available),
          priceInCents,
          listPriceInCents,
          onOffer,
          renewPriceInCents: renewByTld.get(tld) ?? null,
          tld,
        };
      })
      .sort((a, b) => {
        if (preferredTld) {
          if (a.tld === preferredTld && b.tld !== preferredTld) return -1;
          if (b.tld === preferredTld && a.tld !== preferredTld) return 1;
        }
        return compareTldsByPopularity(a.tld, b.tld);
      });

    return NextResponse.json({ results, sld });
  } catch (error) {
    console.error("[domains/check]", error);
    const message =
      error instanceof Error ? error.message : "Check failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

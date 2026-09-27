import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkDomains, isNamecheapConfigured } from "@/lib/domains/namecheap";
import { sellPriceCents } from "@/lib/domains/pricing";

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
    if (row.count >= 20) return false;
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
    return NextResponse.json(
      { error: "Domain check is temporarily unavailable" },
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
    activeProducts.map((p) => [p.tld, sellPriceCents(p)] as const),
  );

  let domains: string[] = [];
  if (fqdnSchema.safeParse(raw).success) {
    domains = [raw];
  } else {
    const sld = raw.includes(".") ? raw.split(".")[0] : raw;
    if (!sldSchema.safeParse(sld).success) {
      return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
    }
    const wanted = tldsParam
      ? tldsParam.split(",").map((t) => t.replace(/^\./, "").trim()).filter(Boolean)
      : activeProducts.map((p) => p.tld);
    domains = wanted
      .filter((tld) => priceByTld.has(tld))
      .slice(0, 12)
      .map((tld) => `${sld}.${tld}`);
  }

  if (!domains.length) {
    return NextResponse.json({ error: "No active TLDs to check" }, { status: 400 });
  }

  try {
    const checked = await checkDomains(domains);
    const results = checked.map((row) => {
      const tld = row.domain.split(".").pop() || "";
      return {
        domain: row.domain,
        available: row.available,
        priceInCents: priceByTld.get(tld) ?? null,
        tld,
      };
    });
    return NextResponse.json({ results });
  } catch (error) {
    console.error("[domains/check]", error);
    const message =
      error instanceof Error ? error.message : "Check failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

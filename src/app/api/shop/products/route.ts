import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import {
  asStringArray,
  eurosToCentsSafe,
  shopProductUpsertSchema,
  slugifyShop,
} from "@/lib/shop/admin";
import { mapDbShopProduct } from "@/lib/shop/catalog";
import {
  lineOfBusinessFromProduct,
  parseLineOfBusinessParam,
  isHostingSlug,
} from "@/lib/shop/line-of-business";
import { brandIdForHost, isDomainsHostingCatalog } from "@/lib/brand/config";

function hostingCatalogWhere() {
  return {
    OR: [
      { lineOfBusiness: "HOSTING" as const },
      { category: "hosting" },
      { slug: { startsWith: "shared-hosting-" } },
      { slug: { startsWith: "cloud-hosting-" } },
      { slug: { startsWith: "wordpress-hosting-" } },
      { slug: { startsWith: "vps-hosting-" } },
      { slug: "web-hosting" },
    ],
  };
}

function serviceCatalogWhere() {
  return {
    AND: [
      { NOT: hostingCatalogWhere() },
    ],
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "1";
  const lobParam = searchParams.get("lineOfBusiness");
  let lineFilter =
    lobParam === "SERVICE" || lobParam === "HOSTING"
      ? parseLineOfBusinessParam(lobParam)
      : null;

  // ExtraHosting public catalog: hosting SKUs only.
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  if (!all && isDomainsHostingCatalog(brandIdForHost(host))) {
    lineFilter = "HOSTING";
  }

  const lineWhere =
    lineFilter === "HOSTING"
      ? hostingCatalogWhere()
      : lineFilter === "SERVICE"
        ? serviceCatalogWhere()
        : undefined;

  // Public catalog (published only) — no auth required.
  if (!all) {
    const rows = await prisma.shopCatalogProduct.findMany({
      where: {
        published: true,
        ...(lineWhere ?? {}),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(rows.map(mapDbShopProduct));
  }

  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const rows = await prisma.shopCatalogProduct.findMany({
    where: lineWhere,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  // Re-tag known hosting SKUs so the admin UI matches slug intent.
  return NextResponse.json(
    rows.map((row) => {
      if (!isHostingSlug(row.slug) && row.category !== "hosting") return row;
      if (row.lineOfBusiness === "HOSTING") return row;
      return { ...row, lineOfBusiness: "HOSTING" as const };
    }),
  );
}

export async function POST(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = shopProductUpsertSchema.safeParse({
    ...body,
    tags: asStringArray(body.tags),
    priceIncl:
      typeof body.priceIncl === "number"
        ? body.priceIncl
        : Number(body.priceIncl),
    discountPriceIncl:
      body.discountPriceIncl === "" || body.discountPriceIncl == null
        ? null
        : typeof body.discountPriceIncl === "number"
          ? body.discountPriceIncl
          : Number(body.discountPriceIncl),
    checkoutMonths:
      body.checkoutMonths === "" || body.checkoutMonths == null
        ? null
        : Number(body.checkoutMonths),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  let slug = slugifyShop(data.slug || data.nameEn || data.nameNl);
  const slugClash = await prisma.shopCatalogProduct.findUnique({ where: { slug } });
  if (slugClash) slug = `${slug}-${Date.now().toString(36)}`;

  const sku = data.sku.trim().toUpperCase();
  const skuClash = await prisma.shopCatalogProduct.findUnique({ where: { sku } });
  if (skuClash) {
    return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
  }

  const billAsYearlyPackage = Boolean(data.billAsYearlyPackage);
  const checkoutMonths = billAsYearlyPackage
    ? data.checkoutMonths && data.checkoutMonths > 1
      ? data.checkoutMonths
      : 12
    : data.checkoutMonths || null;

  const lineOfBusiness =
    data.lineOfBusiness ||
    lineOfBusinessFromProduct({
      slug,
      category: data.category,
    });

  const item = await prisma.shopCatalogProduct.create({
    data: {
      sku,
      slug,
      type: data.type,
      nameNl: data.nameNl,
      nameEn: data.nameEn,
      shortDescriptionNl: data.shortDescriptionNl,
      shortDescriptionEn: data.shortDescriptionEn,
      descriptionNl: data.descriptionNl,
      descriptionEn: data.descriptionEn,
      priceInclCents: eurosToCentsSafe(data.priceIncl),
      discountPriceInclCents:
        data.discountPriceIncl != null
          ? eurosToCentsSafe(data.discountPriceIncl)
          : null,
      currency: "EUR",
      billingInterval: data.billingInterval,
      billAsYearlyPackage,
      checkoutMonths,
      category: data.category || null,
      lineOfBusiness,
      image: data.image || null,
      featured: data.featured ?? false,
      published: data.published ?? true,
      sortOrder: data.sortOrder ?? 0,
      planKey: data.planKey || null,
      tags: data.tags ?? [],
      createdById: authResult.session.user.id,
    },
  });

  try {
    const { clearServiceContentCaches } = await import("@/lib/fixweb-content");
    clearServiceContentCaches();
  } catch {
    // ignore
  }

  return NextResponse.json(item, { status: 201 });
}

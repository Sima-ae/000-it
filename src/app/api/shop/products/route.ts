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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "1";

  // Public catalog (published only) — no auth required.
  if (!all) {
    const rows = await prisma.shopCatalogProduct.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(rows.map(mapDbShopProduct));
  }

  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const rows = await prisma.shopCatalogProduct.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(rows);
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
      image: data.image || null,
      featured: data.featured ?? false,
      published: data.published ?? true,
      sortOrder: data.sortOrder ?? 0,
      planKey: data.planKey || null,
      tags: data.tags ?? [],
      createdById: authResult.session.user.id,
    },
  });

  return NextResponse.json(item, { status: 201 });
}

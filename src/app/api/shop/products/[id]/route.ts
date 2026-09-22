import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import {
  asStringArray,
  eurosToCentsSafe,
  shopProductUpsertSchema,
  slugifyShop,
} from "@/lib/shop/admin";
import { canDelete, canEditResource } from "@/lib/roles";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const item = await prisma.shopCatalogProduct.findFirst({
    where: { OR: [{ id }, { slug: id }, { sku: id }] },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;
  const { id } = await params;

  const existing = await prisma.shopCatalogProduct.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (
    !canEditResource(
      authResult.session.user.role,
      existing.createdById,
      authResult.session.user.id,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = shopProductUpsertSchema.partial().safeParse({
    ...body,
    tags: body.tags !== undefined ? asStringArray(body.tags) : undefined,
    priceIncl:
      body.priceIncl === undefined
        ? undefined
        : typeof body.priceIncl === "number"
          ? body.priceIncl
          : Number(body.priceIncl),
    checkoutMonths:
      body.checkoutMonths === undefined
        ? undefined
        : body.checkoutMonths === "" || body.checkoutMonths == null
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
  const update: Record<string, unknown> = {};

  if (data.nameNl !== undefined) update.nameNl = data.nameNl;
  if (data.nameEn !== undefined) update.nameEn = data.nameEn;
  if (data.shortDescriptionNl !== undefined) {
    update.shortDescriptionNl = data.shortDescriptionNl;
  }
  if (data.shortDescriptionEn !== undefined) {
    update.shortDescriptionEn = data.shortDescriptionEn;
  }
  if (data.descriptionNl !== undefined) update.descriptionNl = data.descriptionNl;
  if (data.descriptionEn !== undefined) update.descriptionEn = data.descriptionEn;
  if (data.type !== undefined) update.type = data.type;
  if (data.billingInterval !== undefined) update.billingInterval = data.billingInterval;
  if (data.billAsYearlyPackage !== undefined) {
    update.billAsYearlyPackage = data.billAsYearlyPackage;
  }
  if (data.checkoutMonths !== undefined) update.checkoutMonths = data.checkoutMonths;
  if (data.category !== undefined) update.category = data.category || null;
  if (data.image !== undefined) update.image = data.image || null;
  if (data.featured !== undefined) update.featured = data.featured;
  if (data.published !== undefined) update.published = data.published;
  if (data.sortOrder !== undefined) update.sortOrder = data.sortOrder;
  if (data.planKey !== undefined) update.planKey = data.planKey || null;
  if (data.tags !== undefined) update.tags = data.tags;
  if (data.priceIncl !== undefined) {
    update.priceInclCents = eurosToCentsSafe(data.priceIncl);
  }

  if (data.billAsYearlyPackage === true && data.checkoutMonths == null) {
    update.checkoutMonths = existing.checkoutMonths && existing.checkoutMonths > 1
      ? existing.checkoutMonths
      : 12;
  }

  if (data.sku !== undefined) {
    const sku = data.sku.trim().toUpperCase();
    const clash = await prisma.shopCatalogProduct.findFirst({
      where: { sku, NOT: { id } },
    });
    if (clash) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
    }
    update.sku = sku;
  }

  if (data.slug !== undefined || data.nameEn !== undefined || data.nameNl !== undefined) {
    let slug = slugifyShop(
      data.slug || data.nameEn || data.nameNl || existing.slug,
    );
    const clash = await prisma.shopCatalogProduct.findFirst({
      where: { slug, NOT: { id } },
    });
    if (clash) slug = `${slug}-${Date.now().toString(36)}`;
    update.slug = slug;
  }

  if (!existing.createdById) {
    update.createdById = authResult.session.user.id;
  }

  const item = await prisma.shopCatalogProduct.update({
    where: { id },
    data: update,
  });
  return NextResponse.json(item);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireRole(["SUPER_ADMIN"]);
  if (authResult.error) return authResult.error;
  if (!canDelete(authResult.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.shopCatalogProduct.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.shopCatalogProduct.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

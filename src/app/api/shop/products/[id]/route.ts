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

export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

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
  if (!item) return json({ error: "Not found" }, 404);
  return json(item);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;
  const { id } = await params;

  const existing = await prisma.shopCatalogProduct.findUnique({ where: { id } });
  if (!existing) return json({ error: "Not found" }, 404);

  if (
    !canEditResource(
      authResult.session.user.role,
      existing.createdById,
      authResult.session.user.id,
    )
  ) {
    return json({ error: "Forbidden" }, 403);
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
    discountPriceIncl:
      body.discountPriceIncl === undefined
        ? undefined
        : body.discountPriceIncl === "" || body.discountPriceIncl == null
          ? null
          : typeof body.discountPriceIncl === "number"
            ? body.discountPriceIncl
            : Number(body.discountPriceIncl),
    checkoutMonths:
      body.checkoutMonths === undefined
        ? undefined
        : body.checkoutMonths === "" || body.checkoutMonths == null
          ? null
          : Number(body.checkoutMonths),
  });
  if (!parsed.success) {
    return json(
      { error: "Invalid input", details: parsed.error.flatten() },
      400,
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
  if (data.lineOfBusiness !== undefined) update.lineOfBusiness = data.lineOfBusiness;
  if (data.image !== undefined) update.image = data.image || null;
  if (data.featured !== undefined) update.featured = data.featured;
  if (data.published !== undefined) update.published = data.published;
  if (data.sortOrder !== undefined) update.sortOrder = data.sortOrder;
  if (data.planKey !== undefined) update.planKey = data.planKey || null;
  if (data.tags !== undefined) update.tags = data.tags;
  if (data.priceIncl !== undefined) {
    update.priceInclCents = eurosToCentsSafe(data.priceIncl);
  }
  if (data.discountPriceIncl !== undefined) {
    update.discountPriceInclCents =
      data.discountPriceIncl == null
        ? null
        : eurosToCentsSafe(data.discountPriceIncl);
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
      return json({ error: "SKU already exists" }, 409);
    }
    update.sku = sku;
  }

  if (data.slug !== undefined) {
    const slug = slugifyShop(data.slug);
    if (slug && slug !== existing.slug) {
      const clash = await prisma.shopCatalogProduct.findFirst({
        where: { slug, NOT: { id } },
      });
      if (clash) {
        return json({ error: "Slug already exists" }, 409);
      }
      update.slug = slug;
    }
  }

  if (!existing.createdById) {
    update.createdById = authResult.session.user.id;
  }

  let item;
  try {
    item = await prisma.shopCatalogProduct.update({
      where: { id },
      data: update,
    });
  } catch (error) {
    console.error("[shop] product update failed", error);
    return json({ error: "Save failed" }, 500);
  }

  if (
    data.shortDescriptionNl !== undefined &&
    item.shortDescriptionNl !== data.shortDescriptionNl
  ) {
    return json({ error: "Save did not store the text" }, 500);
  }
  if (
    data.descriptionNl !== undefined &&
    item.descriptionNl !== data.descriptionNl
  ) {
    return json({ error: "Save did not store the description" }, 500);
  }

  try {
    const { refreshPublicShopSurfaces } = await import(
      "@/lib/shop/refresh-public-catalog"
    );
    await refreshPublicShopSurfaces();
  } catch {
    // ignore
  }
  return json(item);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireRole(["SUPER_ADMIN"]);
  if (authResult.error) return authResult.error;
  if (!canDelete(authResult.session.user.role)) {
    return json({ error: "Forbidden" }, 403);
  }

  const { id } = await params;
  const existing = await prisma.shopCatalogProduct.findUnique({ where: { id } });
  if (!existing) return json({ error: "Not found" }, 404);

  await prisma.shopCatalogProduct.delete({ where: { id } });
  try {
    const { refreshPublicShopSurfaces } = await import(
      "@/lib/shop/refresh-public-catalog"
    );
    await refreshPublicShopSurfaces();
  } catch {
    // ignore
  }
  return json({ ok: true });
}

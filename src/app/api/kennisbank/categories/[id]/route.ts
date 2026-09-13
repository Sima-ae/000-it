import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { canDelete } from "@/lib/roles";
import {
  categoryUpsertSchema,
  deleteCategory,
  slugifyKennisbank,
  updateCategory,
} from "@/lib/kennisbank";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = categoryUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const current = await prisma.kennisbankCategory.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const slug = slugifyKennisbank(parsed.data.slug || parsed.data.name);
  if (slug !== current.slug) {
    const clash = await prisma.kennisbankCategory.findUnique({ where: { slug } });
    if (clash) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
  }

  const item = await updateCategory(id, { ...parsed.data, slug });
  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: Params) {
  const authResult = await requireRole(["SUPER_ADMIN"]);
  if (authResult.error) return authResult.error;
  if (!canDelete(authResult.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const current = await prisma.kennisbankCategory.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await deleteCategory(id);
  return NextResponse.json({ ok: true });
}

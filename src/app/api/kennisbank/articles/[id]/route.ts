import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { canDelete } from "@/lib/roles";
import {
  articleUpsertSchema,
  deleteArticle,
  getArticleById,
  slugifyKennisbank,
  updateArticle,
} from "@/lib/kennisbank";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const item = await getArticleById(id, { locale: "nl" });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(request: Request, { params }: Params) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = articleUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const current = await getArticleById(id);
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const slug = slugifyKennisbank(parsed.data.slug || parsed.data.title);
  if (slug !== current.slug) {
    const clash = await prisma.kennisbankArticle.findUnique({ where: { slug } });
    if (clash) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
  }

  const item = await updateArticle(id, { ...parsed.data, slug });
  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: Params) {
  const authResult = await requireRole(["SUPER_ADMIN"]);
  if (authResult.error) return authResult.error;
  if (!canDelete(authResult.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const current = await getArticleById(id);
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await deleteArticle(id);
  return NextResponse.json({ ok: true });
}

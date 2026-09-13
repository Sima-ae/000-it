import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import {
  articleUpsertSchema,
  createArticle,
  listArticles,
  slugifyKennisbank,
} from "@/lib/kennisbank";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "1";
  const locale = searchParams.get("locale") || "nl";
  const categorySlug = searchParams.get("category") || undefined;
  const search = searchParams.get("q") || undefined;

  if (all) {
    const authResult = await requireRole(["SUPER_ADMIN", "ADMIN"]);
    if (authResult.error) return authResult.error;
    return NextResponse.json(
      await listArticles({ locale, all: true, categorySlug, search }),
    );
  }

  return NextResponse.json(await listArticles({ locale, categorySlug, search }));
}

export async function POST(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = articleUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const slug = slugifyKennisbank(parsed.data.slug || parsed.data.title);
  const existing = await prisma.kennisbankArticle.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const item = await createArticle({
    ...parsed.data,
    slug,
    createdById: authResult.session.user.id,
  });
  return NextResponse.json(item, { status: 201 });
}

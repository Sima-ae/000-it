import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import {
  categoryUpsertSchema,
  createCategory,
  listCategories,
  slugifyKennisbank,
} from "@/lib/kennisbank";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "1";
  const locale = searchParams.get("locale") || "nl";

  if (all) {
    const authResult = await requireRole(["SUPER_ADMIN", "ADMIN"]);
    if (authResult.error) return authResult.error;
    return NextResponse.json(await listCategories({ locale, all: true }));
  }

  return NextResponse.json(await listCategories({ locale }));
}

export async function POST(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = categoryUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const slug = slugifyKennisbank(parsed.data.slug || parsed.data.name);
  const existing = await prisma.kennisbankCategory.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const item = await createCategory({ ...parsed.data, slug });
  return NextResponse.json(item, { status: 201 });
}

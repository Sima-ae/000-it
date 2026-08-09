import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { asStringArray, portfolioUpsertSchema, slugify } from "@/lib/portfolio";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const item = await prisma.portfolioProject.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!item.published) {
    const authResult = await requireRole(["ADMIN", "MANAGER"]);
    if (authResult.error) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }
  return NextResponse.json(item);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;
  const { id } = await params;

  const existing = await prisma.portfolioProject.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = portfolioUpsertSchema.partial().safeParse({
    ...body,
    tags: body.tags !== undefined ? asStringArray(body.tags) : undefined,
    technologies:
      body.technologies !== undefined ? asStringArray(body.technologies) : undefined,
    gallery: body.gallery !== undefined ? asStringArray(body.gallery) : undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  const update: Record<string, unknown> = {};

  if (data.title !== undefined) update.title = data.title;
  if (data.summary !== undefined) update.summary = data.summary;
  if (data.description !== undefined) update.description = data.description;
  if (data.coverImage !== undefined) update.coverImage = data.coverImage;
  if (data.gallery !== undefined) update.gallery = data.gallery;
  if (data.projectUrl !== undefined) {
    update.projectUrl = data.projectUrl === "" ? null : data.projectUrl;
  }
  if (data.repoUrl !== undefined) {
    update.repoUrl = data.repoUrl === "" ? null : data.repoUrl;
  }
  if (data.clientName !== undefined) update.clientName = data.clientName;
  if (data.industry !== undefined) update.industry = data.industry;
  if (data.year !== undefined) update.year = data.year;
  if (data.tags !== undefined) update.tags = data.tags;
  if (data.technologies !== undefined) update.technologies = data.technologies;
  if (data.featured !== undefined) update.featured = data.featured;
  if (data.published !== undefined) update.published = data.published;
  if (data.sortOrder !== undefined) update.sortOrder = data.sortOrder;

  if (data.slug !== undefined || data.title !== undefined) {
    let slug = slugify(data.slug || data.title || existing.title);
    const clash = await prisma.portfolioProject.findFirst({
      where: { slug, NOT: { id } },
    });
    if (clash) slug = `${slug}-${Date.now().toString(36)}`;
    update.slug = slug;
  }

  const item = await prisma.portfolioProject.update({
    where: { id },
    data: update,
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;
  const { id } = await params;

  const existing = await prisma.portfolioProject.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.portfolioProject.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

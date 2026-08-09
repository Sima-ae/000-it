import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { asStringArray, portfolioUpsertSchema, slugify } from "@/lib/portfolio";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "1";

  if (all) {
    const authResult = await requireRole(["ADMIN", "MANAGER"]);
    if (authResult.error) return authResult.error;
    const items = await prisma.portfolioProject.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(items);
  }

  const items = await prisma.portfolioProject.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const authResult = await requireRole(["ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = portfolioUpsertSchema.safeParse({
    ...body,
    tags: asStringArray(body.tags),
    technologies: asStringArray(body.technologies),
    gallery: asStringArray(body.gallery),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  let slug = slugify(data.slug || data.title);
  const existing = await prisma.portfolioProject.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const item = await prisma.portfolioProject.create({
    data: {
      title: data.title,
      slug,
      summary: data.summary,
      description: data.description || null,
      coverImage: data.coverImage || null,
      gallery: data.gallery ?? [],
      projectUrl: data.projectUrl || null,
      repoUrl: data.repoUrl || null,
      clientName: data.clientName || null,
      industry: data.industry || null,
      year: data.year ?? null,
      tags: data.tags ?? [],
      technologies: data.technologies ?? [],
      featured: data.featured ?? false,
      published: data.published ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  });

  return NextResponse.json(item, { status: 201 });
}

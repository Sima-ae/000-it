import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { canDelete, canEditResource, isAdminRole } from "@/lib/roles";
import {
  deleteNewsPost,
  getNewsPost,
  newsUpsertSchema,
  updateNewsPost,
} from "@/lib/news";

type Params = { params: Promise<{ id: string }> };

function parseTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return String(value || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function PATCH(request: Request, { params }: Params) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = newsUpsertSchema.safeParse({
    ...body,
    tags: parseTags(body.tags),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const current = await getNewsPost(id);
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const role = authResult.session.user.role;
  const userId = authResult.session.user.id;
  if (!canEditResource(role, current.createdById, userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = parsed.data;
  const isAdmin = isAdminRole(role);
  const item = await updateNewsPost(id, {
    title: data.title,
    titleNl: data.titleNl ?? current.titleNl,
    excerpt: data.excerpt,
    excerptNl: data.excerptNl ?? current.excerptNl,
    description: data.description,
    descriptionNl: data.descriptionNl ?? current.descriptionNl,
    coverImage: data.coverImage ?? current.coverImage,
    industry: data.industry ?? current.industry ?? "",
    tags: data.tags ?? current.tags,
    createdById: current.createdById ?? userId,
    autoTranslate: true,
    ...(isAdmin
      ? {
          date: data.date,
          author: data.author,
          projectUrl: data.projectUrl || null,
        }
      : {}),
  });

  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: Params) {
  const authResult = await requireRole(["SUPER_ADMIN"]);
  if (authResult.error) return authResult.error;
  if (!canDelete(authResult.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const current = await getNewsPost(id);
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await deleteNewsPost(id);
  return NextResponse.json({ ok: true });
}

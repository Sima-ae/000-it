import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { isAdminRole } from "@/lib/roles";
import {
  createNewsPost,
  getNewsPost,
  listNewsPosts,
  newsUpsertSchema,
  slugifyNewsId,
} from "@/lib/news";

function parseTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return String(value || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trash = searchParams.get("trash") === "1";
  const all = searchParams.get("all") === "1";

  if (trash) {
    const authResult = await requireRole(["SUPER_ADMIN"]);
    if (authResult.error) return authResult.error;
    return NextResponse.json(await listNewsPosts({ trashed: true }));
  }

  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;
  return NextResponse.json(await listNewsPosts({ all }));
}

export async function POST(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

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

  const data = parsed.data;
  const isAdmin = isAdminRole(authResult.session.user.role);
  let id = data.id || slugifyNewsId(data.title);
  if (await getNewsPost(id, undefined, { includeTrashed: true })) {
    id = `${id}-${Date.now().toString(36)}`;
  }

  const item = await createNewsPost({
    id,
    title: data.title,
    titleNl: data.titleNl || null,
    excerpt: data.excerpt,
    excerptNl: data.excerptNl || null,
    date: isAdmin ? data.date : new Date().toISOString().slice(0, 10),
    coverImage: data.coverImage || null,
    description: data.description,
    descriptionNl: data.descriptionNl || null,
    author: isAdmin ? data.author : authResult.session.user.name || "TripleZero iT",
    projectUrl: isAdmin ? data.projectUrl || null : null,
    industry: data.industry || "",
    tags: data.tags ?? [],
    createdById: authResult.session.user.id,
    // English source → Dutch + all other locales
    autoTranslate: true,
  });

  return NextResponse.json(item, { status: 201 });
}

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { canDelete, canEditResource, isAdminRole } from "@/lib/roles";
import {
  caseStudyUpsertSchema,
  deleteCaseStudy,
  getCaseStudy,
  parseCsvList,
  updateCaseStudy,
} from "@/lib/case-studies";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = caseStudyUpsertSchema.safeParse({
    ...body,
    gallery: parseCsvList(body.gallery),
    tags: parseCsvList(body.tags),
    technologies: parseCsvList(body.technologies),
    year: body.year ? Number(body.year) : null,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const current = await getCaseStudy(id);
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
  const item = await updateCaseStudy(id, {
    title: data.title,
    industry: data.industry,
    metric: data.metric,
    summary: data.summary,
    description: data.description,
    coverImage: data.coverImage || current.coverImage,
    gallery: data.gallery ?? current.gallery,
    year: data.year ?? current.year,
    tags: data.tags ?? current.tags,
    technologies: data.technologies ?? current.technologies,
    createdById: current.createdById ?? userId,
    ...(isAdmin
      ? {
          clientName: data.clientName,
          projectUrl: data.projectUrl || "",
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
  const current = await getCaseStudy(id);
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await deleteCaseStudy(id);
  return NextResponse.json({ ok: true });
}

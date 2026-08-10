import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { isAdminRole } from "@/lib/roles";
import {
  caseStudyUpsertSchema,
  createCaseStudy,
  listCaseStudies,
  parseCsvList,
  slugifyCaseId,
} from "@/lib/case-studies";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("all") === "1") {
    const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
    if (authResult.error) return authResult.error;
    return NextResponse.json(await listCaseStudies({ all: true }));
  }
  return NextResponse.json(await listCaseStudies());
}

export async function POST(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

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

  const data = parsed.data;
  const isAdmin = isAdminRole(authResult.session.user.role);
  const existing = await listCaseStudies({ all: true });
  let id = data.id || slugifyCaseId(data.title);
  if (existing.some((c) => c.id === id)) id = `${id}-${Date.now().toString(36)}`;

  const item = await createCaseStudy({
    id,
    title: data.title,
    industry: data.industry,
    metric: data.metric,
    summary: data.summary,
    description: data.description,
    clientName: isAdmin ? data.clientName : data.title,
    projectUrl: isAdmin ? data.projectUrl || "" : "",
    coverImage: data.coverImage || "",
    gallery: data.gallery ?? [],
    year: data.year ?? new Date().getFullYear(),
    tags: data.tags ?? [],
    technologies: data.technologies ?? [],
    createdById: authResult.session.user.id,
  });

  return NextResponse.json(item, { status: 201 });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import type { ProjectType } from "@prisma/client";

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum([
    "WEBSITE",
    "SEO",
    "ADS",
    "AI_INTEGRATION",
    "CONTENT",
    "SOCIAL_MEDIA",
    "BRANDING",
    "FULL_GROWTH",
  ]),
  budget: z.number().optional(),
  progress: z.number().min(0).max(100).optional(),
});

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { tasks: true, clients: true } } },
  });
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      type: parsed.data.type as ProjectType,
      budget: parsed.data.budget,
      progress: parsed.data.progress ?? 0,
      startDate: new Date(),
      status: "ACTIVE",
      userId: session.user.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: "PROJECT_CREATED",
      description: `Project created: ${project.name}`,
      projectId: project.id,
      userId: session.user.id,
    },
  });

  return NextResponse.json(project, { status: 201 });
}

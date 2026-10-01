import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { canOverseeWorkOps, getWorkOpsClock, weekStartMonday } from "@/lib/crm/work-ops";

export async function GET(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const weekStart = new URL(request.url).searchParams.get("weekStart") || weekStartMonday(getWorkOpsClock().isoDate);

  const briefs = await prisma.weeklyBrief.findMany({
    orderBy: { weekStart: "desc" },
    take: 20,
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  });

  const current = briefs.find((b) => b.weekStart === weekStart) || null;
  return NextResponse.json({ briefs, current, weekStart });
}

const bodySchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  body: z.object({
    triplezero: z.string().optional(),
    extrahosting: z.string().optional(),
    doNotTouch: z.string().optional(),
    crmNotes: z.string().optional(),
  }),
  publish: z.boolean().optional(),
});

export async function POST(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (auth.error) return auth.error;

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const weekStart = parsed.data.weekStart || weekStartMonday(getWorkOpsClock().isoDate);
  const brief = await prisma.weeklyBrief.upsert({
    where: { weekStart },
    create: {
      weekStart,
      body: parsed.data.body,
      createdById: auth.session.user.id,
      publishedAt: parsed.data.publish ? new Date() : null,
    },
    update: {
      body: parsed.data.body,
      publishedAt: parsed.data.publish ? new Date() : undefined,
    },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(brief);
}

export async function PATCH(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (auth.error) return auth.error;
  if (!canOverseeWorkOps(auth.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.extend({ id: z.string().min(1) }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const brief = await prisma.weeklyBrief.update({
    where: { id: parsed.data.id },
    data: {
      body: parsed.data.body,
      publishedAt: parsed.data.publish === true ? new Date() : parsed.data.publish === false ? null : undefined,
    },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(brief);
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/api-auth";
import { canDelete } from "@/lib/roles";

const schema = z.object({
  url: z.string().url(),
  company: z.string().optional(),
  country: z.string().optional(),
  audience: z.string().optional(),
  goals: z.string().optional(),
});

function simulateScores(url: string) {
  const seed = [...url].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const score = (offset: number) => 55 + ((seed + offset) % 40);
  return {
    seo: score(1),
    aeo: score(7),
    geo: score(13),
    performance: score(19),
    readiness: score(29),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await new Promise((r) => setTimeout(r, 1200));
    const results = simulateScores(parsed.data.url);
    const session = await auth();

    const scan = await prisma.aIScan.create({
      data: {
        url: parsed.data.url,
        company: parsed.data.company,
        country: parsed.data.country,
        audience: parsed.data.audience,
        goals: parsed.data.goals,
        scanType: "FULL",
        status: "COMPLETED",
        results,
        userId: session?.user?.id,
      },
    });

    if (session?.user?.id) {
      await prisma.activity.create({
        data: {
          type: "SCAN_COMPLETED",
          description: `AI scan completed for ${parsed.data.url}`,
          userId: session.user.id,
          metadata: { scanId: scan.id },
        },
      });
    }

    return NextResponse.json({ id: scan.id, results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scans = await prisma.aIScan.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(scans);
}

/** SUPER_ADMIN only — delete every scan in the system */
export async function DELETE() {
  const authResult = await requireRole(["SUPER_ADMIN"]);
  if (authResult.error) return authResult.error;
  if (!canDelete(authResult.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await prisma.aIScan.deleteMany({});
  return NextResponse.json({ ok: true, deleted: result.count });
}

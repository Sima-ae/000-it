import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { canOverseeWorkOps } from "@/lib/crm/work-ops";
import { ensureDefaultWorkspace } from "@/lib/crm/ops-boards";

export async function GET() {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;
  const role = auth.session.user.role;

  const where = canOverseeWorkOps(role) ? {} : { createdById: userId };
  let workspaces = await prisma.opsWorkspace.findMany({
    where,
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { boards: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!workspaces.length) {
    await ensureDefaultWorkspace(userId);
    workspaces = await prisma.opsWorkspace.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { boards: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  return NextResponse.json({ workspaces });
}

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
});

export async function POST(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const workspace = await prisma.opsWorkspace.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      createdById: auth.session.user.id,
    },
  });
  return NextResponse.json(workspace, { status: 201 });
}

const patchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
});

export async function PATCH(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.opsWorkspace.findUnique({ where: { id: parsed.data.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canOverseeWorkOps(auth.session.user.role) && existing.createdById !== auth.session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const workspace = await prisma.opsWorkspace.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description === undefined ? undefined : parsed.data.description,
    },
  });
  return NextResponse.json(workspace);
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { userCanEditBoard } from "@/lib/crm/ops-boards";

export async function GET(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const boardId = new URL(request.url).searchParams.get("boardId");
  if (!boardId) return NextResponse.json({ error: "Missing boardId" }, { status: 400 });

  const autos = await prisma.opsAutomation.findMany({
    where: { boardId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ automations: autos });
}

const createSchema = z.object({
  boardId: z.string().min(1),
  name: z.string().min(1).max(200),
  enabled: z.boolean().optional(),
  trigger: z.record(z.any()),
  actions: z.array(z.record(z.any())),
});

export async function POST(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  if (!(await userCanEditBoard(parsed.data.boardId, auth.session.user.id, auth.session.user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const auto = await prisma.opsAutomation.create({
    data: {
      boardId: parsed.data.boardId,
      name: parsed.data.name,
      enabled: parsed.data.enabled ?? true,
      trigger: parsed.data.trigger,
      actions: parsed.data.actions,
    },
  });
  return NextResponse.json(auto, { status: 201 });
}

const patchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  enabled: z.boolean().optional(),
  trigger: z.record(z.any()).optional(),
  actions: z.array(z.record(z.any())).optional(),
});

export async function PATCH(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const existing = await prisma.opsAutomation.findUnique({ where: { id: parsed.data.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await userCanEditBoard(existing.boardId, auth.session.user.id, auth.session.user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const auto = await prisma.opsAutomation.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      enabled: parsed.data.enabled,
      trigger: parsed.data.trigger,
      actions: parsed.data.actions,
    },
  });
  return NextResponse.json(auto);
}

export async function DELETE(request: Request) {
  const auth = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (auth.error) return auth.error;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.opsAutomation.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await userCanEditBoard(existing.boardId, auth.session.user.id, auth.session.user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.opsAutomation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

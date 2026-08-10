import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { SUPER_ADMIN_EMAIL, isCanonicalSuperAdminEmail } from "@/lib/roles";

/** Creatable / assignable roles — SUPER_ADMIN is fixed to info@000-it.com only */
const assignableRoles = z.enum(["ADMIN", "MANAGER", "CLIENT"]);

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: assignableRoles,
  companyName: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  role: assignableRoles.optional(),
  companyName: z.string().nullable().optional(),
  password: z.string().min(8).optional(),
});

export async function GET() {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (authResult.error) return authResult.error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyName: true,
      createdAt: true,
    },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input (SUPER_ADMIN cannot be created; only ADMIN / MANAGER / CLIENT)" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  if (isCanonicalSuperAdminEmail(email)) {
    return NextResponse.json(
      { error: `${SUPER_ADMIN_EMAIL} is reserved as the only SUPER_ADMIN` },
      { status: 403 },
    );
  }

  const exists = await prisma.user.findUnique({
    where: { email },
  });
  if (exists) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      password: await bcrypt.hash(parsed.data.password, 12),
      role: parsed.data.role,
      companyName: parsed.data.companyName || null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyName: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}

export async function PATCH(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input (cannot assign SUPER_ADMIN; only one exists)" },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Protect the single canonical SUPER_ADMIN account (cannot demote / reassign)
  if (isCanonicalSuperAdminEmail(target.email)) {
    if (parsed.data.role !== undefined) {
      return NextResponse.json(
        { error: `${SUPER_ADMIN_EMAIL} must remain the only SUPER_ADMIN` },
        { status: 403 },
      );
    }
    if (authResult.session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.role !== undefined) data.role = parsed.data.role;
  if (parsed.data.companyName !== undefined) data.companyName = parsed.data.companyName;
  if (parsed.data.password) {
    data.password = await bcrypt.hash(parsed.data.password, 12);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyName: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN"]);
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  if (id === authResult.session.user.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (target.role === "SUPER_ADMIN" || isCanonicalSuperAdminEmail(target.email)) {
    return NextResponse.json({ error: "Cannot delete the SUPER_ADMIN account" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

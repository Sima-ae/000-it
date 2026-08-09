import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

const schema = z.object({
  name: z.string().min(2).optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  industry: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      companyName: true,
      phone: true,
      industry: true,
      role: true,
    },
  });
  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data: Record<string, unknown> = {
    name: parsed.data.name,
    companyName: parsed.data.companyName,
    phone: parsed.data.phone,
    industry: parsed.data.industry,
  };

  if (parsed.data.newPassword) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.password || !parsed.data.currentPassword) {
      return NextResponse.json({ error: "Current password required" }, { status: 400 });
    }
    const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid current password" }, { status: 400 });
    }
    data.password = await bcrypt.hash(parsed.data.newPassword, 12);
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      companyName: true,
      phone: true,
      industry: true,
    },
  });

  return NextResponse.json(updated);
}

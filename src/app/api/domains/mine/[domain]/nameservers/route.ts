import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDomainAccess } from "@/lib/domains/access";
import {
  getListNameservers,
  setCustomNameservers,
  setDefaultNameservers,
} from "@/lib/domains/namecheap";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ domain: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { domain: raw } = await ctx.params;
  const domain = decodeURIComponent(raw);
  const access = await requireDomainAccess(domain);
  if (access.error) return access.error;

  const result = await getListNameservers(domain);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Failed to load nameservers" },
      { status: 502 },
    );
  }
  return NextResponse.json(result);
}

const putSchema = z.object({
  mode: z.enum(["default", "custom"]),
  nameservers: z.array(z.string().min(3).max(120)).max(8).optional(),
});

export async function PUT(request: Request, ctx: Ctx) {
  const { domain: raw } = await ctx.params;
  const domain = decodeURIComponent(raw);
  const access = await requireDomainAccess(domain);
  if (access.error) return access.error;

  const body = putSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result =
    body.data.mode === "default"
      ? await setDefaultNameservers(domain)
      : await setCustomNameservers(domain, body.data.nameservers || []);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Failed to update nameservers" },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDomainAccess } from "@/lib/domains/access";
import {
  getEmailForwarding,
  setEmailForwarding,
} from "@/lib/domains/namecheap";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ domain: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { domain: raw } = await ctx.params;
  const domain = decodeURIComponent(raw);
  const access = await requireDomainAccess(domain);
  if (access.error) return access.error;

  const result = await getEmailForwarding(domain);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Failed to load forwarding" },
      { status: 502 },
    );
  }
  return NextResponse.json(result);
}

const putSchema = z.object({
  forwards: z
    .array(
      z.object({
        mailbox: z.string().min(1).max(80),
        forwardTo: z.string().email().max(190),
      }),
    )
    .max(50),
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

  const result = await setEmailForwarding(domain, body.data.forwards);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Failed to save forwarding" },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}

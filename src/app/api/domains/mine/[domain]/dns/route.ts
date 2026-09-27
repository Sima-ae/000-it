import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDomainAccess } from "@/lib/domains/access";
import {
  getDnsHosts,
  setDnsHosts,
  type DnsHostRecord,
} from "@/lib/domains/namecheap";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ domain: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { domain: raw } = await ctx.params;
  const domain = decodeURIComponent(raw);
  const access = await requireDomainAccess(domain);
  if (access.error) return access.error;

  const result = await getDnsHosts(domain);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Failed to load DNS" },
      { status: 502 },
    );
  }
  return NextResponse.json(result);
}

const hostSchema = z.object({
  name: z.string().min(1).max(80),
  type: z.string().min(1).max(20),
  address: z.string().min(1).max(500),
  mxPref: z.string().max(10).optional(),
  ttl: z.string().max(20).optional(),
  hostId: z.string().optional(),
});

const putSchema = z.object({
  hosts: z.array(hostSchema).max(100),
  emailType: z.string().max(20).optional(),
});

export async function PUT(request: Request, ctx: Ctx) {
  const { domain: raw } = await ctx.params;
  const domain = decodeURIComponent(raw);
  const access = await requireDomainAccess(domain);
  if (access.error) return access.error;

  const body = putSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid hosts payload" }, { status: 400 });
  }

  const result = await setDnsHosts(
    domain,
    body.data.hosts as DnsHostRecord[],
    body.data.emailType || "FWD",
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Failed to save DNS" },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}

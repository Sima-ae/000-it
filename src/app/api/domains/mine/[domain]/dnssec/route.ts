import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDomainAccess } from "@/lib/domains/access";
import {
  createDnssec,
  deleteDnssec,
  getDnssecList,
} from "@/lib/domains/namecheap";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ domain: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { domain: raw } = await ctx.params;
  const domain = decodeURIComponent(raw);
  const access = await requireDomainAccess(domain);
  if (access.error) return access.error;

  const result = await getDnssecList(domain);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Failed to load DNSSEC" },
      { status: 502 },
    );
  }
  return NextResponse.json(result);
}

const recordSchema = z.object({
  keyTag: z.string().min(1).max(20),
  algorithm: z.string().min(1).max(20),
  digestType: z.string().min(1).max(20),
  digest: z.string().min(8).max(256),
});

const putSchema = z.object({
  action: z.enum(["create", "delete"]),
  record: recordSchema,
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
    body.data.action === "create"
      ? await createDnssec(domain, body.data.record)
      : await deleteDnssec(domain, body.data.record);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "DNSSEC update failed" },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { ensurePaidCheckoutAndInvoice } from "@/lib/shop/order-invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  sessionId: z.string().min(8).max(200),
});

/**
 * Backup for Stripe success redirects: confirm payment + email PDF invoice.
 * Idempotent with the webhook path.
 */
export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const result = await ensurePaidCheckoutAndInvoice(parsed.data.sessionId);
    return NextResponse.json({
      ok: true,
      sent: result.sent,
      reason: result.reason || null,
      orderNumber: result.orderNumber || null,
      email: result.email || null,
    });
  } catch (error) {
    console.error("[shop/confirm-session]", error);
    return NextResponse.json(
      { error: "Confirm session failed" },
      { status: 500 },
    );
  }
}

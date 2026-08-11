import { NextResponse } from "next/server";
import { isStripeConfigured } from "@/lib/shop/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public status for checkout UI — never exposes key values. */
export async function GET() {
  const secretOk = isStripeConfigured();
  const publishableOk = Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_"),
  );
  const webhookOk = Boolean(process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_"));

  return NextResponse.json({
    configured: secretOk,
    publishableKeyPresent: publishableOk,
    webhookSecretPresent: webhookOk,
  });
}

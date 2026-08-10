import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/shop/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function markOrderPaid(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null;

  if (orderId) {
    await prisma.shopOrder.updateMany({
      where: { id: orderId, status: { not: "PAID" } },
      data: {
        status: "PAID",
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
      },
    });
    return;
  }

  if (session.id) {
    await prisma.shopOrder.updateMany({
      where: { stripeSessionId: session.id, status: { not: "PAID" } },
      data: {
        status: "PAID",
        stripePaymentIntentId: paymentIntentId,
      },
    });
  }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET missing" }, { status: 503 });
  }

  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (error) {
    console.error("[shop/webhook] signature", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await markOrderPaid(session);
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.orderId) {
        await prisma.shopOrder.updateMany({
          where: { id: session.metadata.orderId, status: "PENDING" },
          data: { status: "CANCELLED" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[shop/webhook]", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/shop/stripe";
import {
  createDomain,
  type RegistrantContact,
} from "@/lib/domains/namecheap";
import { sendFailedDomainOrderAlert } from "@/lib/domains/alerts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function markShopOrderPaid(session: Stripe.Checkout.Session) {
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

async function fulfillDomainRegistration(session: Stripe.Checkout.Session) {
  const domainOrderId = session.metadata?.domainOrderId;
  const domainName = session.metadata?.domainName;
  const years = parseInt(session.metadata?.years || "1", 10);

  const order = domainOrderId
    ? await prisma.domainOrder.findUnique({ where: { id: domainOrderId } })
    : session.id
      ? await prisma.domainOrder.findFirst({
          where: { stripeSessionId: session.id },
        })
      : null;

  if (!order) {
    console.error("[shop/webhook] domain order missing", session.id);
    return;
  }

  if (order.status === "REGISTERED") return;

  await prisma.domainOrder.update({
    where: { id: order.id },
    data: { status: "PAID" },
  });

  let registrant: RegistrantContact;
  try {
    registrant = JSON.parse(order.registrantJson) as RegistrantContact;
  } catch {
    await prisma.domainOrder.update({
      where: { id: order.id },
      data: {
        status: "FAILED",
        namecheapResponse: "Invalid registrantJson",
      },
    });
    await sendFailedDomainOrderAlert({
      orderId: order.id,
      orderNumber: order.orderNumber,
      domainName: order.domainName,
      userEmail: order.email,
      errorDetails: "Invalid registrantJson on order",
    });
    return;
  }

  try {
    const result = await createDomain({
      domainName: domainName || order.domainName,
      years: Number.isFinite(years) ? years : order.years,
      registrant,
    });

    if (result.ok) {
      await prisma.domainOrder.update({
        where: { id: order.id },
        data: { status: "REGISTERED", namecheapResponse: result.xml },
      });
      return;
    }

    await prisma.domainOrder.update({
      where: { id: order.id },
      data: {
        status: "FAILED",
        namecheapResponse: result.error || result.xml,
      },
    });
    await sendFailedDomainOrderAlert({
      orderId: order.id,
      orderNumber: order.orderNumber,
      domainName: order.domainName,
      userEmail: order.email,
      errorDetails: result.error || result.xml,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.domainOrder.update({
      where: { id: order.id },
      data: { status: "FAILED", namecheapResponse: message },
    });
    await sendFailedDomainOrderAlert({
      orderId: order.id,
      orderNumber: order.orderNumber,
      domainName: order.domainName,
      userEmail: order.email,
      errorDetails: message,
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
      if (session.metadata?.type === "DOMAIN_REGISTRATION") {
        await fulfillDomainRegistration(session);
      } else {
        await markShopOrderPaid(session);
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.type === "DOMAIN_REGISTRATION") {
        if (session.metadata.domainOrderId) {
          await prisma.domainOrder.updateMany({
            where: { id: session.metadata.domainOrderId, status: "PENDING" },
            data: { status: "FAILED" },
          });
        }
      } else if (session.metadata?.orderId) {
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

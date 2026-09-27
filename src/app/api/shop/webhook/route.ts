import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/shop/stripe";
import {
  createDomain,
  createTransfer,
  renewDomain,
  type RegistrantContact,
} from "@/lib/domains/namecheap";
import { sendFailedDomainOrderAlert } from "@/lib/domains/alerts";
import { upsertOwnedDomain } from "@/lib/domains/owned";
import { sendInvoiceForPaidCheckoutSession } from "@/lib/shop/order-invoice";

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

async function loadDomainOrder(session: Stripe.Checkout.Session) {
  const domainOrderId = session.metadata?.domainOrderId;
  if (domainOrderId) {
    return prisma.domainOrder.findUnique({ where: { id: domainOrderId } });
  }
  if (session.id) {
    return prisma.domainOrder.findFirst({
      where: { stripeSessionId: session.id },
    });
  }
  return null;
}

async function failOrder(
  order: {
    id: string;
    orderNumber: string;
    domainName: string;
    email: string;
  },
  details: string,
) {
  await prisma.domainOrder.update({
    where: { id: order.id },
    data: { status: "FAILED", namecheapResponse: details },
  });
  await sendFailedDomainOrderAlert({
    orderId: order.id,
    orderNumber: order.orderNumber,
    domainName: order.domainName,
    userEmail: order.email,
    errorDetails: details,
  });
}

async function fulfillDomainRegistration(session: Stripe.Checkout.Session) {
  const domainName = session.metadata?.domainName;
  const years = parseInt(session.metadata?.years || "1", 10);
  const order = await loadDomainOrder(session);

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
    await failOrder(order, "Invalid registrantJson");
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
      if (order.userId) {
        await upsertOwnedDomain({
          domainName: order.domainName,
          userId: order.userId,
          status: "ACTIVE",
          yearsAdded: order.years,
        });
      }
      return;
    }

    await failOrder(order, result.error || result.xml);
  } catch (error) {
    await failOrder(
      order,
      error instanceof Error ? error.message : String(error),
    );
  }
}

async function fulfillDomainRenewal(session: Stripe.Checkout.Session) {
  const years = parseInt(session.metadata?.years || "1", 10);
  const order = await loadDomainOrder(session);
  if (!order) {
    console.error("[shop/webhook] renew order missing", session.id);
    return;
  }
  if (order.status === "REGISTERED") return;

  await prisma.domainOrder.update({
    where: { id: order.id },
    data: { status: "PAID" },
  });

  try {
    const result = await renewDomain({
      domainName: order.domainName,
      years: Number.isFinite(years) ? years : order.years,
    });
    if (result.ok) {
      await prisma.domainOrder.update({
        where: { id: order.id },
        data: { status: "REGISTERED", namecheapResponse: result.xml },
      });
      if (order.userId) {
        await upsertOwnedDomain({
          domainName: order.domainName,
          userId: order.userId,
          status: "ACTIVE",
          yearsAdded: order.years,
        });
      }
      return;
    }
    await failOrder(order, result.error || result.xml);
  } catch (error) {
    await failOrder(
      order,
      error instanceof Error ? error.message : String(error),
    );
  }
}

async function fulfillDomainTransfer(session: Stripe.Checkout.Session) {
  const years = parseInt(session.metadata?.years || "1", 10);
  const order = await loadDomainOrder(session);
  if (!order) {
    console.error("[shop/webhook] transfer order missing", session.id);
    return;
  }
  if (order.status === "REGISTERED") return;

  await prisma.domainOrder.update({
    where: { id: order.id },
    data: { status: "PAID" },
  });

  if (!order.authCode) {
    await failOrder(order, "Missing authCode on transfer order");
    return;
  }

  try {
    const result = await createTransfer({
      domainName: order.domainName,
      years: Number.isFinite(years) ? years : order.years,
      authCode: order.authCode,
    });
    if (result.ok) {
      await prisma.domainOrder.update({
        where: { id: order.id },
        data: {
          status: "REGISTERED",
          namecheapResponse: result.xml,
        },
      });
      if (order.userId) {
        await upsertOwnedDomain({
          domainName: order.domainName,
          userId: order.userId,
          status: "PENDING_TRANSFER",
          namecheapId: result.transferId || null,
          yearsAdded: order.years,
        });
      }
      return;
    }
    await failOrder(order, result.error || result.xml);
  } catch (error) {
    await failOrder(
      order,
      error instanceof Error ? error.message : String(error),
    );
  }
}

const DOMAIN_META = new Set([
  "DOMAIN_REGISTRATION",
  "DOMAIN_RENEWAL",
  "DOMAIN_TRANSFER",
]);

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET missing" },
      { status: 503 },
    );
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
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status && session.payment_status !== "paid") {
        return NextResponse.json({ received: true, skipped: "unpaid" });
      }

      const type = session.metadata?.type || "";
      if (type === "DOMAIN_REGISTRATION") {
        await fulfillDomainRegistration(session);
      } else if (type === "DOMAIN_RENEWAL") {
        await fulfillDomainRenewal(session);
      } else if (type === "DOMAIN_TRANSFER") {
        await fulfillDomainTransfer(session);
      } else {
        await markShopOrderPaid(session);
      }

      try {
        await sendInvoiceForPaidCheckoutSession(session);
      } catch (invoiceError) {
        console.error("[shop/webhook] invoice email", invoiceError);
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (DOMAIN_META.has(session.metadata?.type || "")) {
        if (session.metadata?.domainOrderId) {
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

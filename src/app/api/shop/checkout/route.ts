import { NextResponse } from "next/server";
import { z } from "zod";
import type Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveCartItems, cartTotalsInEuros } from "@/lib/shop/cart";
import { loadShopCatalogFromDb } from "@/lib/shop/catalog";
import { getStripe, isStripeConfigured } from "@/lib/shop/stripe";
import { makeShopOrderNumber } from "@/lib/shop/line-of-business";
import { VAT_RATE } from "@/lib/shop/vat";
import {
  publicOriginFromRequestHeaders,
  sourceBrandFromRequest,
  sourceHostFromRequest,
} from "@/lib/brand/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  locale: z.string().min(2).max(10).default("nl"),
  name: z.string().min(2).max(120),
  email: z.string().email().max(190),
  company: z.string().max(190).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
});

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe is not configured (STRIPE_SECRET_KEY)." },
        { status: 503 },
      );
    }

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { locale, name, email, company, items } = parsed.data;
    await loadShopCatalogFromDb();
    const totals = resolveCartItems(items);
    if (!totals.lines.length || totals.totalInclCents <= 0) {
      return NextResponse.json({ error: "Cart is empty or invalid" }, { status: 400 });
    }

    if (totals.mixedLineOfBusiness || !totals.lineOfBusiness) {
      return NextResponse.json(
        {
          error:
            locale === "nl"
              ? "Hosting en diensten kunnen niet in één bestelling. Rond ze apart af."
              : "Hosting and services cannot be checked out together. Complete them separately.",
          code: "MIXED_LINE_OF_BUSINESS",
        },
        { status: 400 },
      );
    }

    const lineOfBusiness = totals.lineOfBusiness;

    // ExtraHosting storefront only sells hosting.
    if (
      lineOfBusiness === "SERVICE" &&
      sourceBrandFromRequest(request) === "extrahosting"
    ) {
      return NextResponse.json(
        {
          error:
            locale === "nl"
              ? "Deze webshop verkoopt alleen hosting. Diensten bestel je via 000-it.com."
              : "This shop only sells hosting. Order services at 000-it.com.",
          code: "BRAND_CATALOG_RESTRICTED",
        },
        { status: 400 },
      );
    }

    const euros = cartTotalsInEuros(totals);
    const session = await auth();
    const orderNumber = makeShopOrderNumber(lineOfBusiness);

    const order = await prisma.shopOrder.create({
      data: {
        orderNumber,
        email,
        name,
        company: company || null,
        locale,
        currency: "EUR",
        subtotalExcl: euros.subtotalExcl,
        vatAmount: euros.vat,
        totalIncl: euros.totalIncl,
        vatRate: VAT_RATE,
        status: "PENDING",
        lineOfBusiness,
        sourceBrand: sourceBrandFromRequest(request),
        sourceHost: sourceHostFromRequest(request) || null,
        userId: session?.user?.id || null,
        items: {
          create: totals.lines.map((line) => ({
            productId: line.product.id,
            name: line.product.name[locale === "nl" ? "nl" : "en"],
            quantity: line.quantity,
            unitPriceIncl: line.unitInclCents / 100,
            vatRate: VAT_RATE,
            lineOfBusiness,
          })),
        },
      },
    });

    const origin = publicOriginFromRequestHeaders(request);
    const stripe = getStripe();
    const stripeLocale = locale === "nl" ? "nl" : "en";
    const catalogLocale = locale === "nl" ? "nl" : "en";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      locale: stripeLocale,
      customer_email: email,
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        lineOfBusiness,
        sourceBrand: sourceBrandFromRequest(request),
        sourceHost: sourceHostFromRequest(request),
      },
      payment_method_types: ["card", "ideal", "bancontact", "sepa_debit", "klarna", "paypal"],
      billing_address_collection: "auto",
      submit_type: "pay",
      line_items: totals.lines.map((line) => {
        const months = line.product.checkoutMonths;
        const periodNote =
          months && months > 1
            ? catalogLocale === "nl"
              ? `Jaarlijks pakket (${months} maanden). `
              : `Yearly package (${months} months). `
            : "";
        const baseDesc = line.product.shortDescription[catalogLocale];
        return {
          quantity: line.quantity,
          price_data: {
            currency: "eur",
            unit_amount: line.unitInclCents,
            product_data: {
              name: line.product.name[catalogLocale],
              description: `${periodNote}${baseDesc}`.slice(0, 400),
              metadata: { productId: line.product.id },
            },
          },
        };
      }),
      success_url: `${origin}/${locale}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/shop/checkout?cancelled=1`,
    };

    let checkoutSession: Stripe.Checkout.Session;
    try {
      checkoutSession = await stripe.checkout.sessions.create(sessionParams);
    } catch (firstError) {
      console.warn("[shop/checkout] full payment methods failed, retrying core set", firstError);
      checkoutSession = await stripe.checkout.sessions.create({
        ...sessionParams,
        payment_method_types: ["card", "ideal", "bancontact"],
      });
    }

    await prisma.shopOrder.update({
      where: { id: order.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      url: checkoutSession.url,
      orderNumber: order.orderNumber,
      sessionId: checkoutSession.id,
      lineOfBusiness,
    });
  } catch (error) {
    console.error("[shop/checkout]", error);
    const raw =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error && "message" in error
          ? String((error as { message?: unknown }).message)
          : "Checkout failed";
    const safe = /api key|sk_live|sk_test|pk_live|pk_test|whsec_/i.test(raw)
      ? "Payment provider configuration error. Please try again later."
      : raw;
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}

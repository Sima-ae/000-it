import { NextResponse } from "next/server";
import { z } from "zod";
import type Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkDomains, isNamecheapConfigured } from "@/lib/domains/namecheap";
import { effectiveSellPriceCents } from "@/lib/domains/pricing";
import { makeDomainOrderNumber } from "@/lib/shop/line-of-business";
import { getStripe, isStripeConfigured } from "@/lib/shop/stripe";
import { localizedHref } from "@/i18n/pathnames";
import { siteOrigin } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const registrantSchema = z.object({
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  email: z.string().email().max(190),
  phone: z.string().min(6).max(40),
  address1: z.string().min(2).max(120),
  city: z.string().min(1).max(80),
  stateProvince: z.string().max(80).default("NA"),
  postalCode: z.string().min(2).max(20),
  country: z.string().min(2).max(2),
  organization: z.string().max(120).optional(),
});

const bodySchema = z.object({
  domainName: z
    .string()
    .min(3)
    .max(253)
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,30}$/i),
  years: z.number().int().min(1).max(10).default(1),
  locale: z.string().min(2).max(10).default("nl"),
  registrant: registrantSchema,
});

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }
    if (!isNamecheapConfigured()) {
      return NextResponse.json(
        { error: "Domain registration is temporarily unavailable" },
        { status: 503 },
      );
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { domainName, years, locale, registrant } = parsed.data;
    const domain = domainName.toLowerCase();
    const tld = domain.split(".").pop() || "";

    const product = await prisma.domainProduct.findFirst({
      where: { tld, isActive: true },
    });
    if (!product) {
      return NextResponse.json({ error: "TLD not available" }, { status: 400 });
    }

    const checked = await checkDomains([domain]);
    if (!checked[0]?.available) {
      return NextResponse.json({ error: "Domain is not available" }, { status: 409 });
    }

    const unitCents = effectiveSellPriceCents(product);
    const totalPriceInCents = unitCents * years;
    const session = await auth();
    const orderNumber = makeDomainOrderNumber();

    const order = await prisma.domainOrder.create({
      data: {
        orderNumber,
        domainName: domain,
        years,
        status: "PENDING",
        totalPriceInCents,
        email: registrant.email.toLowerCase(),
        locale,
        registrantJson: JSON.stringify(registrant),
        domainProductId: product.id,
        userId: session?.user?.id || null,
      },
    });

    const origin = siteOrigin();
    const stripe = getStripe();
    const stripeLocale = locale === "nl" ? "nl" : "en";
    const domainsPath = localizedHref(locale, "/domeinen");

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      locale: stripeLocale,
      customer_email: registrant.email,
      client_reference_id: order.id,
      metadata: {
        type: "DOMAIN_REGISTRATION",
        domainOrderId: order.id,
        domainName: domain,
        years: String(years),
      },
      payment_method_types: ["card", "ideal", "bancontact", "sepa_debit", "klarna", "paypal"],
      billing_address_collection: "auto",
      submit_type: "pay",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: totalPriceInCents,
            product_data: {
              name:
                locale === "nl"
                  ? `Domeinregistratie: ${domain}`
                  : `Domain registration: ${domain}`,
              description:
                locale === "nl"
                  ? `${years} jaar · inclusief 21% BTW`
                  : `${years} year(s) · including 21% VAT`,
            },
          },
        },
      ],
      success_url: `${origin}${domainsPath}?success=1&order=${encodeURIComponent(orderNumber)}`,
      cancel_url: `${origin}${domainsPath}?canceled=1`,
    };

    let checkoutSession: Stripe.Checkout.Session;
    try {
      checkoutSession = await stripe.checkout.sessions.create(sessionParams);
    } catch (firstError) {
      console.warn("[domains/checkout] payment methods fallback", firstError);
      checkoutSession = await stripe.checkout.sessions.create({
        ...sessionParams,
        payment_method_types: ["card", "ideal", "bancontact"],
      });
    }

    await prisma.domainOrder.update({
      where: { id: order.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 502 });
    }

    return NextResponse.json({
      url: checkoutSession.url,
      orderNumber,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("[domains/checkout]", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}

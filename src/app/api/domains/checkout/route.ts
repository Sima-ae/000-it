import { NextResponse } from "next/server";
import { z } from "zod";
import type Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkDomains, isNamecheapConfigured, premiumRegisterBuyUsd, premiumTransferBuyUsd } from "@/lib/domains/namecheap";
import {
  effectiveSellPriceCents,
  renewSellPriceCents,
  transferSellPriceCents,
} from "@/lib/domains/pricing";
import { getUsdToEurRate } from "@/lib/domains/fx";
import { sellFromBuyUsd } from "@/lib/domains/premium-price";
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
  orderType: z
    .enum(["REGISTRATION", "RENEWAL", "TRANSFER"])
    .default("REGISTRATION"),
  authCode: z.string().min(4).max(128).optional(),
  registrant: registrantSchema.optional(),
});

function stripeType(orderType: string) {
  if (orderType === "RENEWAL") return "DOMAIN_RENEWAL";
  if (orderType === "TRANSFER") return "DOMAIN_TRANSFER";
  return "DOMAIN_REGISTRATION";
}

function productLabel(
  locale: string,
  orderType: string,
  domain: string,
): { name: string; description: string; years: number } {
  const yearsNote =
    locale === "nl" ? "jaar · inclusief 21% BTW" : "year(s) · including 21% VAT";
  if (orderType === "RENEWAL") {
    return {
      name:
        locale === "nl"
          ? `Domeinverlenging: ${domain}`
          : `Domain renewal: ${domain}`,
      description: yearsNote,
      years: 0,
    };
  }
  if (orderType === "TRANSFER") {
    return {
      name:
        locale === "nl"
          ? `Domeintransfer: ${domain}`
          : `Domain transfer: ${domain}`,
      description: yearsNote,
      years: 0,
    };
  }
  return {
    name:
      locale === "nl"
        ? `Domeinregistratie: ${domain}`
        : `Domain registration: ${domain}`,
    description: yearsNote,
    years: 0,
  };
}

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }
    if (!isNamecheapConfigured()) {
      return NextResponse.json(
        { error: "Domain services are temporarily unavailable" },
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

    const {
      domainName,
      years,
      locale,
      orderType,
      authCode,
      registrant: registrantIn,
    } = parsed.data;
    const domain = domainName.toLowerCase();
    const tld = domain.split(".").pop() || "";
    const session = await auth();

    const product = await prisma.domainProduct.findFirst({
      where: { tld, isActive: true },
    });
    if (!product) {
      return NextResponse.json({ error: "TLD not available" }, { status: 400 });
    }

    let unitCents = 0;
    let registrant = registrantIn;
    let isPremiumOrder = false;

    if (orderType === "REGISTRATION") {
      if (!registrant) {
        return NextResponse.json(
          { error: "Registrant required" },
          { status: 400 },
        );
      }
      const [checked, fxRate] = await Promise.all([
        checkDomains([domain]),
        getUsdToEurRate(),
      ]);
      const row = checked[0];
      if (!row?.available) {
        return NextResponse.json(
          { error: "Domain is not available" },
          { status: 409 },
        );
      }
      if (row.isPremium) {
        isPremiumOrder = true;
        const buyUsd = premiumRegisterBuyUsd(row);
        unitCents = sellFromBuyUsd(buyUsd, fxRate);
        if (unitCents <= 0) {
          return NextResponse.json(
            { error: "Premium domain price unavailable" },
            { status: 400 },
          );
        }
      } else {
        unitCents = effectiveSellPriceCents(product);
      }
    } else if (orderType === "RENEWAL") {
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Login required" }, { status: 401 });
      }
      const owned = await prisma.ownedDomain.findFirst({
        where: { domainName: domain, userId: session.user.id },
      });
      if (!owned) {
        return NextResponse.json(
          { error: "You do not own this domain" },
          { status: 403 },
        );
      }
      unitCents = renewSellPriceCents(product);
      if (unitCents <= 0) {
        return NextResponse.json(
          { error: "Renewal price unavailable" },
          { status: 400 },
        );
      }
      registrant = registrant || {
        firstName: session.user.name?.split(" ")[0] || "Owner",
        lastName: session.user.name?.split(" ").slice(1).join(" ") || "Account",
        email: session.user.email || "",
        phone: "+31000000000",
        address1: "NA",
        city: "NA",
        stateProvince: "NA",
        postalCode: "0000",
        country: "NL",
      };
      if (!registrant.email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 });
      }
    } else {
      // TRANSFER
      if (!authCode) {
        return NextResponse.json(
          { error: "Auth / EPP code required" },
          { status: 400 },
        );
      }
      if (!registrant) {
        return NextResponse.json(
          { error: "Registrant required" },
          { status: 400 },
        );
      }
      // Transfers: use live premium transfer price when the name is premium.
      const [checked, fxRate] = await Promise.all([
        checkDomains([domain]),
        getUsdToEurRate(),
      ]);
      const row = checked[0];
      if (row?.isPremium) {
        isPremiumOrder = true;
        const buyUsd = premiumTransferBuyUsd(row);
        unitCents = sellFromBuyUsd(buyUsd, fxRate);
        if (unitCents <= 0) {
          return NextResponse.json(
            { error: "Premium transfer price unavailable" },
            { status: 400 },
          );
        }
      } else {
        unitCents =
          transferSellPriceCents(product) ||
          renewSellPriceCents(product) ||
          effectiveSellPriceCents(product);
      }
    }

    const totalPriceInCents = unitCents * years;
    const orderNumber = makeDomainOrderNumber();
    const successPath =
      orderType === "RENEWAL"
        ? localizedHref(locale, "/my-domains")
        : localizedHref(locale, "/domeinen");

    const order = await prisma.domainOrder.create({
      data: {
        orderNumber,
        domainName: domain,
        years,
        orderType,
        status: "PENDING",
        totalPriceInCents,
        isPremium: isPremiumOrder,
        email: (registrant?.email || session?.user?.email || "").toLowerCase(),
        locale,
        registrantJson: JSON.stringify(registrant || {}),
        authCode: orderType === "TRANSFER" ? authCode : null,
        domainProductId: product.id,
        userId: session?.user?.id || null,
      },
    });

    const origin = siteOrigin();
    const stripe = getStripe();
    const stripeLocale = locale === "nl" ? "nl" : "en";
    const labels = productLabel(locale, orderType, domain);

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      locale: stripeLocale,
      customer_email: order.email,
      client_reference_id: order.id,
      metadata: {
        type: stripeType(orderType),
        domainOrderId: order.id,
        domainName: domain,
        years: String(years),
        orderType,
        isPremium: isPremiumOrder ? "1" : "0",
      },
      payment_method_types: [
        "card",
        "ideal",
        "bancontact",
        "sepa_debit",
        "klarna",
        "paypal",
      ],
      billing_address_collection: "auto",
      submit_type: "pay",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: totalPriceInCents,
            product_data: {
              name: isPremiumOrder ? `${labels.name} (Premium)` : labels.name,
              description: `${years} ${labels.description}`,
            },
          },
        },
      ],
      success_url: `${origin}${successPath}?success=1&order=${encodeURIComponent(orderNumber)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${successPath}?canceled=1`,
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
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 502 },
      );
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

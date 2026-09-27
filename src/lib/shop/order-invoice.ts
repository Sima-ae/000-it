import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { isMailConfigured, sendMail } from "@/lib/mail";
import { splitInclusiveVat, splitInclusiveVatCents, VAT_RATE } from "@/lib/shop/vat";
import {
  buildOrderInvoicePdf,
  type OrderInvoiceCustomer,
  type OrderInvoiceDocument,
  type OrderInvoiceLine,
} from "@/lib/shop/invoice-pdf";
import { getCompanyProfile } from "@/lib/company";
import { getInvoiceCopy } from "@/content/invoice-i18n";

function categoryLabel(
  locale: string,
  kind: "SERVICE" | "HOSTING" | "DOMAIN_REGISTRATION" | "DOMAIN_RENEWAL" | "DOMAIN_TRANSFER",
) {
  const t = getInvoiceCopy(locale);
  switch (kind) {
    case "HOSTING":
      return t.hosting;
    case "SERVICE":
      return t.services;
    case "DOMAIN_REGISTRATION":
      return t.domainRegistration;
    case "DOMAIN_RENEWAL":
      return t.domainRenewal;
    case "DOMAIN_TRANSFER":
      return t.domainTransfer;
  }
}

function domainProductLabel(
  locale: string,
  orderType: string,
  domainName: string,
  years: number,
) {
  const t = getInvoiceCopy(locale);
  const unit = years === 1 ? t.year : t.years;
  const yr = `${years} ${unit}`;
  if (orderType === "RENEWAL") {
    return `${t.domainRenewal}: ${domainName} (${yr})`;
  }
  if (orderType === "TRANSFER") {
    return `${t.domainTransfer}: ${domainName} (${yr})`;
  }
  return `${t.domainRegistration}: ${domainName} (${yr})`;
}

function customerFromStripe(
  session: Stripe.Checkout.Session | null | undefined,
  fallback: OrderInvoiceCustomer,
): OrderInvoiceCustomer {
  const details = session?.customer_details;
  if (!details) return fallback;
  const addr = details.address;
  const addressLines = addr
    ? [
        [addr.line1, addr.line2].filter(Boolean).join(", "),
        [addr.postal_code, addr.city].filter(Boolean).join(" "),
        [addr.state, addr.country].filter(Boolean).join(", "),
      ].filter(Boolean)
    : fallback.addressLines;
  return {
    name: details.name?.trim() || fallback.name,
    company: fallback.company,
    email: details.email?.trim() || fallback.email,
    phone: details.phone?.trim() || fallback.phone || null,
    addressLines,
    vatNumber: fallback.vatNumber || null,
  };
}

function paymentMethodLabel(session: Stripe.Checkout.Session | null | undefined) {
  const types = session?.payment_method_types;
  if (!types?.length) return "Stripe";
  return `Stripe (${types.join(", ")})`;
}

function emailCopy(locale: string, invoiceNumber: string, orderNumber: string) {
  const company = getCompanyProfile();
  const t = getInvoiceCopy(locale);
  const nl = locale === "nl";
  const subject = t.invoiceEmailSubject.replace("{number}", invoiceNumber);
  const addressBlock = company.addressLines.join(", ");
  const taxLine = company.vatNumber
    ? `${company.vatLabel}: ${company.vatNumber}`
    : t.vatIncluded;
  const text = nl
    ? [
        `Beste klant,`,
        ``,
        `Bedankt voor je bestelling bij ${company.tradeName}.`,
        `Je betaling is succesvol ontvangen en verwerkt.`,
        ``,
        `${t.invoiceNo}: ${invoiceNumber}`,
        `${t.orderNo}: ${orderNumber}`,
        ``,
        `In de bijlage vind je je officiële PDF-factuur met:`,
        `- orderregels en bedragen`,
        `- BTW-specificatie (21%)`,
        `- onze bedrijfsgegevens en adres`,
        ``,
        `${company.legalName}`,
        addressBlock,
        taxLine,
        ``,
        `Vragen? Neem contact op via ${company.supportEmail}.`,
        ``,
        `Met vriendelijke groet,`,
        company.tradeName,
        company.website,
      ].join("\n")
    : [
        `Hello,`,
        ``,
        `Thank you for your order with ${company.tradeName}.`,
        `Your payment was received and processed successfully.`,
        ``,
        `${t.invoiceNo}: ${invoiceNumber}`,
        `${t.orderNo}: ${orderNumber}`,
        ``,
        `Please find your official PDF invoice attached, including:`,
        `- line items and amounts`,
        `- VAT breakdown (21%)`,
        `- our company details and address`,
        ``,
        `${company.legalName}`,
        addressBlock,
        taxLine,
        ``,
        `Questions? Contact us at ${company.supportEmail}.`,
        ``,
        `Kind regards,`,
        company.tradeName,
        company.website,
      ].join("\n");

  const html = nl
    ? `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#14181f">
      <h2 style="color:#5e3b88;margin-bottom:8px">${t.title} ${invoiceNumber}</h2>
      <p>Bedankt voor je bestelling bij <strong>${company.tradeName}</strong>. Je betaling is succesvol ontvangen en verwerkt.</p>
      <table style="width:100%;font-size:14px;margin:16px 0;border-collapse:collapse">
        <tr><td style="padding:4px 0;color:#5b6573">${t.invoiceNo}</td><td style="padding:4px 0;text-align:right"><strong>${invoiceNumber}</strong></td></tr>
        <tr><td style="padding:4px 0;color:#5b6573">${t.orderNo}</td><td style="padding:4px 0;text-align:right"><strong>${orderNumber}</strong></td></tr>
      </table>
      <p>In de bijlage vind je je <strong>officiële PDF-factuur</strong> met orderregels, BTW-specificatie (21%) en onze bedrijfsgegevens.</p>
      <p style="font-size:13px;color:#5b6573;line-height:1.5">${company.legalName}<br/>${addressBlock.replace(/, /g, "<br/>")}<br/>${taxLine}</p>
      <p style="color:#5b6573;font-size:13px">${t.support} <a href="mailto:${company.supportEmail}">${company.supportEmail}</a></p>
      <p style="margin-top:24px">${company.tradeName}<br/><a href="${company.website}">${company.website}</a></p>
    </div>`
    : `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#14181f">
      <h2 style="color:#5e3b88;margin-bottom:8px">${t.title} ${invoiceNumber}</h2>
      <p>Thank you for your order with <strong>${company.tradeName}</strong>. Your payment was received and processed successfully.</p>
      <table style="width:100%;font-size:14px;margin:16px 0;border-collapse:collapse">
        <tr><td style="padding:4px 0;color:#5b6573">${t.invoiceNo}</td><td style="padding:4px 0;text-align:right"><strong>${invoiceNumber}</strong></td></tr>
        <tr><td style="padding:4px 0;color:#5b6573">${t.orderNo}</td><td style="padding:4px 0;text-align:right"><strong>${orderNumber}</strong></td></tr>
      </table>
      <p>Please find your <strong>official PDF invoice</strong> attached, including line items, VAT breakdown (21%), and our company details.</p>
      <p style="font-size:13px;color:#5b6573;line-height:1.5">${company.legalName}<br/>${addressBlock.replace(/, /g, "<br/>")}<br/>${taxLine}</p>
      <p style="color:#5b6573;font-size:13px">${t.support} <a href="mailto:${company.supportEmail}">${company.supportEmail}</a></p>
      <p style="margin-top:24px">${company.tradeName}<br/><a href="${company.website}">${company.website}</a></p>
    </div>`;

  return { subject, text, html };
}

async function deliverInvoice(
  orderKey: { type: "shop" | "domain"; id: string },
  document: OrderInvoiceDocument,
) {
  if (!isMailConfigured()) {
    console.warn("[order-invoice] SMTP not configured; skip invoice email", document.orderNumber);
    return { sent: false, reason: "SMTP_NOT_CONFIGURED" as const };
  }

  const pdf = await buildOrderInvoicePdf(document);
  const { subject, text, html } = emailCopy(
    document.locale,
    document.invoiceNumber,
    document.orderNumber,
  );
  const filename = `invoice-${document.invoiceNumber}.pdf`.replace(/[^\w.-]+/g, "_");

  await sendMail({
    to: document.customer.email,
    subject,
    text,
    html,
    attachments: [
      {
        filename,
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  });

  const now = new Date();
  if (orderKey.type === "shop") {
    await prisma.shopOrder.update({
      where: { id: orderKey.id },
      data: { invoiceEmailedAt: now },
    });
  } else {
    await prisma.domainOrder.update({
      where: { id: orderKey.id },
      data: { invoiceEmailedAt: now },
    });
  }

  return { sent: true as const };
}

export async function buildShopOrderInvoiceDocument(input: {
  orderId: string;
  session?: Stripe.Checkout.Session | null;
}): Promise<
  | { ok: true; document: OrderInvoiceDocument; orderId: string }
  | { ok: false; reason: string }
> {
  const order = await prisma.shopOrder.findUnique({
    where: { id: input.orderId },
    include: { items: true },
  });
  if (!order) return { ok: false, reason: "ORDER_NOT_FOUND" };
  if (order.status !== "PAID") return { ok: false, reason: "NOT_PAID" };

  const taxRate = order.vatRate > 1 ? order.vatRate / 100 : order.vatRate || VAT_RATE;
  const lines: OrderInvoiceLine[] = order.items.map((item) => {
    const lineIncl = item.unitPriceIncl * item.quantity;
    const split = splitInclusiveVat(lineIncl, item.vatRate > 1 ? item.vatRate / 100 : item.vatRate || taxRate);
    const unitSplit = splitInclusiveVat(
      item.unitPriceIncl,
      item.vatRate > 1 ? item.vatRate / 100 : item.vatRate || taxRate,
    );
    return {
      description: item.name,
      quantity: item.quantity,
      unitExcl: unitSplit.excl,
      lineExcl: split.excl,
      lineVat: split.vat,
      lineIncl: split.incl,
    };
  });

  // Prefer summing line amounts so PDF totals always match visible regels.
  const subtotalExcl =
    lines.reduce((s, l) => s + l.lineExcl, 0) || order.subtotalExcl;
  const vatAmount = lines.reduce((s, l) => s + l.lineVat, 0) || order.vatAmount;
  const totalIncl =
    lines.reduce((s, l) => s + l.lineIncl, 0) || order.totalIncl;

  const fallbackCustomer: OrderInvoiceCustomer = {
    name: order.name,
    company: order.company,
    email: order.email,
  };

  const document: OrderInvoiceDocument = {
    invoiceNumber: order.orderNumber,
    orderNumber: order.orderNumber,
    locale: order.locale || "nl",
    currency: order.currency || "EUR",
    taxRate,
    issueDate: order.createdAt,
    paidAt: order.invoiceEmailedAt || order.updatedAt || new Date(),
    paymentMethod: paymentMethodLabel(input.session),
    stripeSessionId: order.stripeSessionId || input.session?.id || null,
    categoryLabel: categoryLabel(
      order.locale,
      order.lineOfBusiness === "HOSTING" ? "HOSTING" : "SERVICE",
    ),
    customer: customerFromStripe(input.session, fallbackCustomer),
    lines,
    subtotalExcl,
    vatAmount,
    totalIncl,
  };

  return { ok: true, document, orderId: order.id };
}

export async function buildDomainOrderInvoiceDocument(input: {
  orderId: string;
  session?: Stripe.Checkout.Session | null;
}): Promise<
  | { ok: true; document: OrderInvoiceDocument; orderId: string }
  | { ok: false; reason: string }
> {
  const order = await prisma.domainOrder.findUnique({ where: { id: input.orderId } });
  if (!order) return { ok: false, reason: "ORDER_NOT_FOUND" };
  // PENDING = unpaid; FAILED still means Stripe was charged (fulfillment failed later)
  if (order.status === "PENDING") {
    return { ok: false, reason: "NOT_PAID" };
  }

  const taxRate = VAT_RATE;
  const { exclCents, vatCents, inclCents } = splitInclusiveVatCents(
    order.totalPriceInCents,
    taxRate,
  );
  const unitExcl = exclCents / 100;
  const lineVat = vatCents / 100;
  const lineIncl = inclCents / 100;

  let registrant: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address1?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    organization?: string;
  } = {};
  try {
    registrant = JSON.parse(order.registrantJson || "{}") as typeof registrant;
  } catch {
    registrant = {};
  }

  const name =
    [registrant.firstName, registrant.lastName].filter(Boolean).join(" ").trim() ||
    order.email;
  const addressLines = [
    registrant.address1 || "",
    [registrant.postalCode, registrant.city].filter(Boolean).join(" "),
    registrant.country || "",
  ].filter(Boolean);

  const kind =
    order.orderType === "RENEWAL"
      ? "DOMAIN_RENEWAL"
      : order.orderType === "TRANSFER"
        ? "DOMAIN_TRANSFER"
        : "DOMAIN_REGISTRATION";

  const fallbackCustomer: OrderInvoiceCustomer = {
    name,
    company: registrant.organization || null,
    email: order.email,
    phone: registrant.phone || null,
    addressLines,
  };

  const document: OrderInvoiceDocument = {
    invoiceNumber: order.orderNumber,
    orderNumber: order.orderNumber,
    locale: order.locale || "nl",
    currency: "EUR",
    taxRate,
    issueDate: order.createdAt,
    paidAt: order.invoiceEmailedAt || order.updatedAt || new Date(),
    paymentMethod: paymentMethodLabel(input.session),
    stripeSessionId: order.stripeSessionId || input.session?.id || null,
    categoryLabel: categoryLabel(order.locale, kind),
    customer: customerFromStripe(input.session, fallbackCustomer),
    lines: [
      {
        description: domainProductLabel(
          order.locale,
          order.orderType,
          order.domainName,
          order.years,
        ),
        quantity: 1,
        unitExcl,
        lineExcl: unitExcl,
        lineVat,
        lineIncl,
      },
    ],
    subtotalExcl: unitExcl,
    vatAmount: lineVat,
    totalIncl: lineIncl,
  };

  return { ok: true, document, orderId: order.id };
}

export async function sendShopOrderInvoice(input: {
  orderId: string;
  session?: Stripe.Checkout.Session | null;
}): Promise<{ sent: boolean; reason?: string }> {
  const order = await prisma.shopOrder.findUnique({
    where: { id: input.orderId },
    select: { invoiceEmailedAt: true },
  });
  if (!order) return { sent: false, reason: "ORDER_NOT_FOUND" };
  if (order.invoiceEmailedAt) return { sent: false, reason: "ALREADY_SENT" };

  const built = await buildShopOrderInvoiceDocument(input);
  if (!built.ok) return { sent: false, reason: built.reason };

  try {
    return await deliverInvoice({ type: "shop", id: built.orderId }, built.document);
  } catch (error) {
    console.error("[order-invoice] shop send failed", built.document.orderNumber, error);
    return { sent: false, reason: "SEND_FAILED" };
  }
}

export async function sendDomainOrderInvoice(input: {
  orderId: string;
  session?: Stripe.Checkout.Session | null;
}): Promise<{ sent: boolean; reason?: string }> {
  const order = await prisma.domainOrder.findUnique({
    where: { id: input.orderId },
    select: { invoiceEmailedAt: true },
  });
  if (!order) return { sent: false, reason: "ORDER_NOT_FOUND" };
  if (order.invoiceEmailedAt) return { sent: false, reason: "ALREADY_SENT" };

  const built = await buildDomainOrderInvoiceDocument(input);
  if (!built.ok) return { sent: false, reason: built.reason };

  try {
    return await deliverInvoice({ type: "domain", id: built.orderId }, built.document);
  } catch (error) {
    console.error("[order-invoice] domain send failed", built.document.orderNumber, error);
    return { sent: false, reason: "SEND_FAILED" };
  }
}

/**
 * After Stripe confirms payment, email a PDF invoice (idempotent).
 * Safe to call from webhook and success-page backup.
 */
export async function sendInvoiceForPaidCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<{ sent: boolean; reason?: string }> {
  if (session.payment_status && session.payment_status !== "paid") {
    return { sent: false, reason: "PAYMENT_NOT_PAID" };
  }

  const type = session.metadata?.type || "";
  if (
    type === "DOMAIN_REGISTRATION" ||
    type === "DOMAIN_RENEWAL" ||
    type === "DOMAIN_TRANSFER"
  ) {
    const domainOrderId = session.metadata?.domainOrderId;
    if (domainOrderId) {
      return sendDomainOrderInvoice({ orderId: domainOrderId, session });
    }
    if (session.id) {
      const order = await prisma.domainOrder.findFirst({
        where: { stripeSessionId: session.id },
        select: { id: true },
      });
      if (order) return sendDomainOrderInvoice({ orderId: order.id, session });
    }
    return { sent: false, reason: "DOMAIN_ORDER_MISSING" };
  }

  const orderId = session.metadata?.orderId;
  if (orderId) {
    return sendShopOrderInvoice({ orderId, session });
  }
  if (session.id) {
    const order = await prisma.shopOrder.findFirst({
      where: { stripeSessionId: session.id },
      select: { id: true },
    });
    if (order) return sendShopOrderInvoice({ orderId: order.id, session });
  }
  return { sent: false, reason: "SHOP_ORDER_MISSING" };
}

/**
 * Success-page / backup path: verify Stripe payment, mark the order paid if
 * needed, then email the PDF invoice. Does not run registrar fulfillment
 * (webhook owns that) but unlocks invoice sending for still-PENDING domains.
 */
export async function ensurePaidCheckoutAndInvoice(
  sessionId: string,
): Promise<{
  sent: boolean;
  reason?: string;
  orderNumber?: string | null;
  email?: string | null;
}> {
  const { getStripe, isStripeConfigured } = await import("@/lib/shop/stripe");
  if (!isStripeConfigured()) {
    return { sent: false, reason: "STRIPE_NOT_CONFIGURED" };
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return { sent: false, reason: "PAYMENT_NOT_PAID" };
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null;

  const type = session.metadata?.type || "";
  const isDomain =
    type === "DOMAIN_REGISTRATION" ||
    type === "DOMAIN_RENEWAL" ||
    type === "DOMAIN_TRANSFER";

  if (isDomain) {
    const domainOrderId = session.metadata?.domainOrderId;
    const order = domainOrderId
      ? await prisma.domainOrder.findUnique({ where: { id: domainOrderId } })
      : await prisma.domainOrder.findFirst({
          where: { stripeSessionId: session.id },
        });

    if (!order) return { sent: false, reason: "DOMAIN_ORDER_MISSING" };

    if (order.status === "PENDING") {
      await prisma.domainOrder.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          stripeSessionId: session.id,
        },
      });
    } else if (!order.stripeSessionId) {
      await prisma.domainOrder.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      });
    }

    const result = await sendDomainOrderInvoice({
      orderId: order.id,
      session,
    });
    return {
      ...result,
      orderNumber: order.orderNumber,
      email: order.email,
    };
  }

  const shopOrderId = session.metadata?.orderId;
  const shopOrder = shopOrderId
    ? await prisma.shopOrder.findUnique({ where: { id: shopOrderId } })
    : await prisma.shopOrder.findFirst({
        where: { stripeSessionId: session.id },
      });

  if (!shopOrder) return { sent: false, reason: "SHOP_ORDER_MISSING" };

  if (shopOrder.status !== "PAID") {
    await prisma.shopOrder.update({
      where: { id: shopOrder.id },
      data: {
        status: "PAID",
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
      },
    });
  }

  const result = await sendShopOrderInvoice({
    orderId: shopOrder.id,
    session,
  });
  return {
    ...result,
    orderNumber: shopOrder.orderNumber,
    email: shopOrder.email,
  };
}

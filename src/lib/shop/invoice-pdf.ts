import { existsSync } from "fs";
import { join } from "path";
import PDFDocument from "pdfkit";
import { getCompanyProfile } from "@/lib/company";

export type OrderInvoiceLine = {
  description: string;
  quantity: number;
  /** Unit price excluding VAT, in euros */
  unitExcl: number;
  /** Line total excluding VAT, in euros */
  lineExcl: number;
  /** Line VAT amount, in euros */
  lineVat: number;
  /** Line total including VAT, in euros */
  lineIncl: number;
};

export type OrderInvoiceCustomer = {
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  addressLines?: string[];
  vatNumber?: string | null;
};

export type OrderInvoiceDocument = {
  invoiceNumber: string;
  orderNumber: string;
  locale: string;
  currency: string;
  /** Tax rate as fraction, e.g. 0.21 */
  taxRate: number;
  issueDate: Date;
  paidAt: Date;
  paymentMethod?: string | null;
  stripeSessionId?: string | null;
  categoryLabel: string;
  customer: OrderInvoiceCustomer;
  lines: OrderInvoiceLine[];
  subtotalExcl: number;
  vatAmount: number;
  totalIncl: number;
  notes?: string | null;
};

function fontFile(name: "NotoSans-Regular.ttf" | "NotoSans-Bold.ttf") {
  const candidates = [
    join(process.cwd(), "public", "fonts", name),
    join(process.cwd(), "fonts", name),
    join(__dirname, "..", "..", "..", "public", "fonts", name),
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }
  return null;
}

function money(amount: number, locale: string, currency: string) {
  try {
    return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-NL", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function dateLabel(value: Date, locale: string) {
  return value.toLocaleDateString(locale === "nl" ? "nl-NL" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function copy(locale: string) {
  const nl = locale === "nl";
  return {
    title: nl ? "Factuur" : "Invoice",
    taxInvoice: nl ? "BTW-factuur" : "VAT invoice",
    paid: nl ? "BETAALD" : "PAID",
    from: nl ? "Leverancier" : "Supplier",
    billTo: nl ? "Factuur aan" : "Bill to",
    invoiceNo: nl ? "Factuurnummer" : "Invoice number",
    orderNo: nl ? "Bestelnummer" : "Order number",
    issueDate: nl ? "Factuurdatum" : "Invoice date",
    paidDate: nl ? "Betaaldatum" : "Payment date",
    payment: nl ? "Betaalmethode" : "Payment method",
    category: nl ? "Categorie" : "Category",
    currency: nl ? "Valuta" : "Currency",
    description: nl ? "Omschrijving" : "Description",
    qty: nl ? "Aantal" : "Qty",
    unitExcl: nl ? "Prijs excl." : "Unit excl.",
    lineVat: nl ? "BTW" : "VAT",
    lineIncl: nl ? "Totaal incl." : "Total incl.",
    subtotal: nl ? "Subtotaal excl. BTW" : "Subtotal excl. VAT",
    vat: nl ? "BTW" : "VAT",
    total: nl ? "Totaal incl. BTW" : "Total incl. VAT",
    thanks: nl
      ? "Bedankt voor je bestelling bij TripleZero iT. Deze factuur bevestigt dat de betaling succesvol is ontvangen."
      : "Thank you for your order with TripleZero iT. This invoice confirms that payment was received successfully.",
    taxNote: nl
      ? "Alle bedragen zijn in EUR. Getoonde verkoopprijzen zijn inclusief 21% Nederlandse BTW, tenzij anders vermeld. BTW is hieronder uitgesplitst."
      : "All amounts are in EUR. Listed sell prices include 21% Dutch VAT (BTW) unless stated otherwise. VAT is broken down below.",
    footer: nl
      ? "Deze factuur is automatisch gegenereerd na succesvolle betaling via Stripe. Bewaar dit document voor je administratie."
      : "This invoice was generated automatically after successful payment via Stripe. Please keep it for your records.",
    support: nl ? "Vragen? Mail" : "Questions? Email",
    stripeRef: nl ? "Stripe-referentie" : "Stripe reference",
    email: nl ? "E-mail" : "Email",
    website: nl ? "Website" : "Website",
  };
}

/** Build a professional A4 PDF invoice buffer. */
export async function buildOrderInvoicePdf(
  doc: OrderInvoiceDocument,
): Promise<Buffer> {
  const company = getCompanyProfile();
  const t = copy(doc.locale);
  const taxPct = Math.round(doc.taxRate * 1000) / 10;
  const regular = fontFile("NotoSans-Regular.ttf");
  const bold = fontFile("NotoSans-Bold.ttf");

  const pdf = new PDFDocument({
    size: "A4",
    margin: 48,
    info: {
      Title: `${t.title} ${doc.invoiceNumber}`,
      Author: company.legalName,
      Subject: `${t.orderNo} ${doc.orderNumber}`,
      Keywords: `invoice,VAT,BTW,${doc.orderNumber}`,
    },
  });

  if (regular) pdf.registerFont("Body", regular);
  if (bold) pdf.registerFont("Heading", bold);
  const bodyFont = regular ? "Body" : "Helvetica";
  const headFont = bold ? "Heading" : "Helvetica-Bold";

  const chunks: Buffer[] = [];
  pdf.on("data", (chunk: Buffer) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve, reject) => {
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    pdf.on("error", reject);
  });

  const left = pdf.page.margins.left;
  const pageWidth =
    pdf.page.width - pdf.page.margins.left - pdf.page.margins.right;
  let y = pdf.page.margins.top;

  // Brand + title
  pdf
    .font(headFont)
    .fontSize(20)
    .fillColor("#5e3b88")
    .text(company.tradeName, left, y, { width: pageWidth * 0.55 });
  pdf
    .font(headFont)
    .fontSize(22)
    .fillColor("#14181f")
    .text(t.title.toUpperCase(), left + pageWidth * 0.42, y, {
      width: pageWidth * 0.58,
      align: "right",
    });
  y += 26;

  pdf
    .font(bodyFont)
    .fontSize(9)
    .fillColor("#5b6573")
    .text(company.tagline, left, y, { width: pageWidth * 0.55 });
  pdf
    .font(bodyFont)
    .fontSize(9)
    .fillColor("#5b6573")
    .text(t.taxInvoice, left + pageWidth * 0.42, y, {
      width: pageWidth * 0.58,
      align: "right",
    });
  y += 16;

  // PAID badge
  const badgeW = 72;
  const badgeX = left + pageWidth - badgeW;
  pdf.roundedRect(badgeX, y, badgeW, 18, 9).fill("#007c8d");
  pdf
    .font(headFont)
    .fontSize(9)
    .fillColor("#ffffff")
    .text(t.paid, badgeX, y + 4, { width: badgeW, align: "center" });
  y += 28;

  pdf
    .moveTo(left, y)
    .lineTo(left + pageWidth, y)
    .strokeColor("#e7e2ef")
    .lineWidth(1)
    .stroke();
  y += 16;

  // Meta grid
  const metaLeft = [
    [t.invoiceNo, doc.invoiceNumber],
    [t.orderNo, doc.orderNumber],
    [t.category, doc.categoryLabel],
    [t.currency, doc.currency],
  ];
  const metaRight = [
    [t.issueDate, dateLabel(doc.issueDate, doc.locale)],
    [t.paidDate, dateLabel(doc.paidAt, doc.locale)],
    [
      t.payment,
      doc.paymentMethod ||
        (doc.locale === "nl" ? "Stripe (online)" : "Stripe (online)"),
    ],
    [
      t.stripeRef,
      doc.stripeSessionId
        ? `${doc.stripeSessionId.slice(0, 18)}…`
        : "—",
    ],
  ];

  const metaTop = y;
  for (let i = 0; i < metaLeft.length; i++) {
    const rowY = metaTop + i * 15;
    pdf.font(bodyFont).fontSize(8.5).fillColor("#5b6573").text(metaLeft[i]![0], left, rowY);
    pdf
      .font(headFont)
      .fontSize(8.5)
      .fillColor("#14181f")
      .text(metaLeft[i]![1], left + 95, rowY, { width: 175 });
    pdf.font(bodyFont).fontSize(8.5).fillColor("#5b6573").text(metaRight[i]![0], 340, rowY);
    pdf
      .font(headFont)
      .fontSize(8.5)
      .fillColor("#14181f")
      .text(metaRight[i]![1], 430, rowY, { width: 130, align: "right" });
  }
  y = metaTop + metaLeft.length * 15 + 16;

  // Supplier / customer boxes
  const boxH = 132;
  const boxW = (pageWidth - 14) / 2;
  const drawBox = (x: number, title: string, lines: string[]) => {
    pdf.roundedRect(x, y, boxW, boxH, 8).fillAndStroke("#faf8fc", "#e7e2ef");
    pdf
      .font(headFont)
      .fontSize(8)
      .fillColor("#5e3b88")
      .text(title.toUpperCase(), x + 12, y + 10, { width: boxW - 24 });
    let ly = y + 26;
    for (const line of lines.filter(Boolean)) {
      pdf
        .font(bodyFont)
        .fontSize(8.5)
        .fillColor("#14181f")
        .text(line, x + 12, ly, { width: boxW - 24, lineBreak: false });
      ly += 11.5;
      if (ly > y + boxH - 12) break;
    }
  };

  const sellerLines = [
    company.legalName,
    ...company.addressLines,
    `${t.email}: ${company.email}`,
    `${t.website}: ${company.website}`,
    company.vatNumber ? `${company.vatLabel}: ${company.vatNumber}` : "",
    company.registrationNumber
      ? `${company.registrationLabel}: ${company.registrationNumber}`
      : "",
  ];

  const customerLines = [
    doc.customer.company || doc.customer.name,
    doc.customer.company ? doc.customer.name : "",
    ...(doc.customer.addressLines || []),
    doc.customer.email,
    doc.customer.phone || "",
    doc.customer.vatNumber
      ? `${company.vatLabel}: ${doc.customer.vatNumber}`
      : "",
  ];

  drawBox(left, t.from, sellerLines);
  drawBox(left + boxW + 14, t.billTo, customerLines);
  y += boxH + 18;

  // Line table
  const colDesc = left;
  const colQty = 268;
  const colUnit = 310;
  const colVat = 390;
  const colTotal = 460;

  pdf.roundedRect(left, y, pageWidth, 18, 4).fill("#5e3b88");
  pdf.font(headFont).fontSize(7.5).fillColor("#ffffff");
  pdf.text(t.description.toUpperCase(), colDesc + 8, y + 5);
  pdf.text(t.qty.toUpperCase(), colQty, y + 5, { width: 36, align: "right" });
  pdf.text(t.unitExcl.toUpperCase(), colUnit, y + 5, {
    width: 72,
    align: "right",
  });
  pdf.text(t.lineVat.toUpperCase(), colVat, y + 5, {
    width: 60,
    align: "right",
  });
  pdf.text(t.lineIncl.toUpperCase(), colTotal, y + 5, {
    width: left + pageWidth - colTotal - 8,
    align: "right",
  });
  y += 26;

  for (const line of doc.lines) {
    const descHeight = pdf.heightOfString(line.description, { width: 210 });
    const rowH = Math.max(20, descHeight + 6);
    if (y + rowH > pdf.page.height - 180) {
      pdf.addPage();
      y = pdf.page.margins.top;
    }
    pdf.font(bodyFont).fontSize(8.5).fillColor("#14181f");
    pdf.text(line.description, colDesc + 2, y, { width: 210 });
    pdf.text(String(line.quantity), colQty, y, { width: 36, align: "right" });
    pdf.text(money(line.unitExcl, doc.locale, doc.currency), colUnit, y, {
      width: 72,
      align: "right",
    });
    pdf.text(money(line.lineVat, doc.locale, doc.currency), colVat, y, {
      width: 60,
      align: "right",
    });
    pdf.text(money(line.lineIncl, doc.locale, doc.currency), colTotal, y, {
      width: left + pageWidth - colTotal - 2,
      align: "right",
    });
    y += rowH;
    pdf
      .moveTo(left, y - 2)
      .lineTo(left + pageWidth, y - 2)
      .strokeColor("#f0ecf6")
      .lineWidth(0.5)
      .stroke();
  }

  y += 10;

  // Totals card
  const totalsW = 230;
  const totalsX = left + pageWidth - totalsW;
  pdf.roundedRect(totalsX, y, totalsW, 78, 8).fillAndStroke("#f7f4fb", "#e7e2ef");
  let ty = y + 12;
  const totalRow = (label: string, value: string, strong = false) => {
    pdf
      .font(strong ? headFont : bodyFont)
      .fontSize(strong ? 11 : 9)
      .fillColor(strong ? "#5e3b88" : "#14181f")
      .text(label, totalsX + 12, ty, { width: 120 });
    pdf
      .font(strong ? headFont : bodyFont)
      .fontSize(strong ? 11 : 9)
      .fillColor(strong ? "#5e3b88" : "#14181f")
      .text(value, totalsX + 120, ty, { width: 98, align: "right" });
    ty += strong ? 18 : 15;
  };
  totalRow(t.subtotal, money(doc.subtotalExcl, doc.locale, doc.currency));
  totalRow(
    `${t.vat} (${taxPct}%)`,
    money(doc.vatAmount, doc.locale, doc.currency),
  );
  totalRow(t.total, money(doc.totalIncl, doc.locale, doc.currency), true);
  y += 90;

  // Notes / legal
  pdf.roundedRect(left, y, pageWidth, 88, 8).fill("#faf8fc");
  pdf
    .font(bodyFont)
    .fontSize(9)
    .fillColor("#14181f")
    .text(t.thanks, left + 12, y + 10, { width: pageWidth - 24 });
  pdf
    .font(bodyFont)
    .fontSize(8)
    .fillColor("#5b6573")
    .text(t.taxNote, left + 12, y + 34, { width: pageWidth - 24 });
  pdf
    .font(bodyFont)
    .fontSize(8)
    .fillColor("#5b6573")
    .text(t.footer, left + 12, y + 58, { width: pageWidth - 24 });
  y += 100;

  if (doc.notes) {
    pdf
      .font(headFont)
      .fontSize(9)
      .fillColor("#14181f")
      .text(doc.locale === "nl" ? "Notities" : "Notes", left, y);
    y += 12;
    pdf
      .font(bodyFont)
      .fontSize(9)
      .fillColor("#5b6573")
      .text(doc.notes, left, y, { width: pageWidth });
    y += 24;
  }

  pdf
    .font(bodyFont)
    .fontSize(8)
    .fillColor("#5b6573")
    .text(
      `${t.support} ${company.supportEmail}${
        doc.stripeSessionId ? ` · ${t.stripeRef}: ${doc.stripeSessionId}` : ""
      }`,
      left,
      Math.min(y, pdf.page.height - 56),
      { width: pageWidth },
    );

  // Persistent footer with full seller identity
  pdf
    .font(bodyFont)
    .fontSize(7)
    .fillColor("#9aa6b8")
    .text(
      [
        company.legalName,
        ...company.addressLines,
        company.vatNumber ? `${company.vatLabel} ${company.vatNumber}` : null,
        company.registrationNumber
          ? `${company.registrationLabel} ${company.registrationNumber}`
          : null,
        company.email,
        company.website,
      ]
        .filter(Boolean)
        .join(" · "),
      left,
      pdf.page.height - 40,
      { width: pageWidth, align: "center" },
    );

  pdf.end();
  return done;
}

import { existsSync } from "fs";
import { join } from "path";
import PDFDocument from "pdfkit";
import { getCompanyProfile } from "@/lib/company";
import { getInvoiceCopy, invoiceBcp47 } from "@/content/invoice-i18n";

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
    return new Intl.NumberFormat(invoiceBcp47(locale), {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function dateLabel(value: Date, locale: string) {
  return value.toLocaleDateString(invoiceBcp47(locale), {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function copy(locale: string) {
  return getInvoiceCopy(locale);
}

function round2(n: number) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

/** Build a professional single-page A4 PDF invoice buffer. */
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
    margins: { top: 40, bottom: 36, left: 40, right: 40 },
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
  const pageBottom = pdf.page.height - pdf.page.margins.bottom;
  const footerY = pageBottom - 2;
  let y = pdf.page.margins.top;

  // Prefer line-derived totals when lines exist so amounts always add up.
  const lines = Array.isArray(doc.lines) ? doc.lines : [];
  const linesSubtotal = round2(lines.reduce((s, l) => s + (l.lineExcl || 0), 0));
  const linesVat = round2(lines.reduce((s, l) => s + (l.lineVat || 0), 0));
  const linesTotal = round2(lines.reduce((s, l) => s + (l.lineIncl || 0), 0));
  const subtotalExcl = lines.length ? linesSubtotal : round2(doc.subtotalExcl);
  const vatAmount = lines.length ? linesVat : round2(doc.vatAmount);
  const totalIncl = lines.length
    ? linesTotal || round2(subtotalExcl + vatAmount)
    : round2(doc.totalIncl || subtotalExcl + vatAmount);

  // Brand + title
  pdf
    .font(headFont)
    .fontSize(18)
    .fillColor("#5e3b88")
    .text(company.tradeName, left, y, { width: pageWidth * 0.55, lineBreak: false });
  pdf
    .font(headFont)
    .fontSize(18)
    .fillColor("#14181f")
    .text(t.title.toUpperCase(), left + pageWidth * 0.42, y, {
      width: pageWidth * 0.58,
      align: "right",
      lineBreak: false,
    });
  y += 22;

  pdf
    .font(bodyFont)
    .fontSize(8)
    .fillColor("#5b6573")
    .text(company.tagline, left, y, { width: pageWidth * 0.58, lineBreak: false });
  pdf
    .font(bodyFont)
    .fontSize(8)
    .fillColor("#5b6573")
    .text(t.taxInvoice, left + pageWidth * 0.42, y, {
      width: pageWidth * 0.58,
      align: "right",
      lineBreak: false,
    });
  y += 14;

  // PAID badge
  const badgeW = 68;
  const badgeX = left + pageWidth - badgeW;
  pdf.roundedRect(badgeX, y, badgeW, 16, 8).fill("#007c8d");
  pdf
    .font(headFont)
    .fontSize(8)
    .fillColor("#ffffff")
    .text(t.paid, badgeX, y + 3.5, {
      width: badgeW,
      align: "center",
      lineBreak: false,
    });
  y += 24;

  pdf
    .moveTo(left, y)
    .lineTo(left + pageWidth, y)
    .strokeColor("#e7e2ef")
    .lineWidth(1)
    .stroke();
  y += 12;

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
    [t.payment, doc.paymentMethod?.trim() || "—"],
    [
      t.stripeRef,
      doc.stripeSessionId ? `${doc.stripeSessionId.slice(0, 18)}…` : "—",
    ],
  ];

  const metaTop = y;
  for (let i = 0; i < metaLeft.length; i++) {
    const rowY = metaTop + i * 13;
    pdf
      .font(bodyFont)
      .fontSize(8)
      .fillColor("#5b6573")
      .text(metaLeft[i]![0], left, rowY, { lineBreak: false });
    pdf
      .font(headFont)
      .fontSize(8)
      .fillColor("#14181f")
      .text(metaLeft[i]![1], left + 95, rowY, { width: 175, lineBreak: false });
    pdf
      .font(bodyFont)
      .fontSize(8)
      .fillColor("#5b6573")
      .text(metaRight[i]![0], 340, rowY, { lineBreak: false });
    pdf
      .font(headFont)
      .fontSize(8)
      .fillColor("#14181f")
      .text(metaRight[i]![1], 430, rowY, {
        width: 130,
        align: "right",
        lineBreak: false,
      });
  }
  y = metaTop + metaLeft.length * 13 + 12;

  // Supplier / customer boxes
  const boxH = 108;
  const boxW = (pageWidth - 12) / 2;
  const drawBox = (x: number, title: string, boxLines: string[]) => {
    pdf.roundedRect(x, y, boxW, boxH, 6).fillAndStroke("#faf8fc", "#e7e2ef");
    pdf
      .font(headFont)
      .fontSize(7.5)
      .fillColor("#5e3b88")
      .text(title.toUpperCase(), x + 10, y + 8, {
        width: boxW - 20,
        lineBreak: false,
      });
    let ly = y + 22;
    for (const line of boxLines.filter(Boolean)) {
      pdf
        .font(bodyFont)
        .fontSize(8)
        .fillColor("#14181f")
        .text(line, x + 10, ly, { width: boxW - 20, lineBreak: false });
      ly += 11;
      if (ly > y + boxH - 10) break;
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
  drawBox(left + boxW + 12, t.billTo, customerLines);
  y += boxH + 14;

  // Line table
  const colDesc = left;
  const colQty = 278;
  const colUnit = 318;
  const colVat = 398;
  const colTotal = 468;
  const descWidth = colQty - colDesc - 12;

  pdf.roundedRect(left, y, pageWidth, 16, 3).fill("#5e3b88");
  pdf.font(headFont).fontSize(7).fillColor("#ffffff");
  pdf.text(t.description.toUpperCase(), colDesc + 6, y + 4, {
    width: descWidth,
    lineBreak: false,
  });
  pdf.text(t.qty.toUpperCase(), colQty, y + 4, {
    width: 34,
    align: "right",
    lineBreak: false,
  });
  pdf.text(t.unitExcl.toUpperCase(), colUnit, y + 4, {
    width: 72,
    align: "right",
    lineBreak: false,
  });
  pdf.text(t.lineVat.toUpperCase(), colVat, y + 4, {
    width: 60,
    align: "right",
    lineBreak: false,
  });
  pdf.text(t.lineIncl.toUpperCase(), colTotal, y + 4, {
    width: left + pageWidth - colTotal - 6,
    align: "right",
    lineBreak: false,
  });
  y += 20;

  const drawRow = (
    description: string,
    quantity: string,
    unit: string,
    vat: string,
    total: string,
    muted = false,
  ) => {
    const color = muted ? "#5b6573" : "#14181f";
    pdf.font(bodyFont).fontSize(8).fillColor(color);
    const descHeight = Math.max(
      10,
      pdf.heightOfString(description, { width: descWidth }),
    );
    const rowH = Math.max(16, descHeight + 4);
    const rowY = y;

    // Description may wrap; numeric columns stay on the first line of the row.
    pdf.text(description, colDesc + 4, rowY, { width: descWidth });
    pdf.font(bodyFont).fontSize(8).fillColor(color);
    pdf.text(quantity, colQty, rowY, {
      width: 34,
      align: "right",
      lineBreak: false,
    });
    pdf.text(unit, colUnit, rowY, {
      width: 72,
      align: "right",
      lineBreak: false,
    });
    pdf.text(vat, colVat, rowY, {
      width: 60,
      align: "right",
      lineBreak: false,
    });
    pdf.text(total, colTotal, rowY, {
      width: left + pageWidth - colTotal - 4,
      align: "right",
      lineBreak: false,
    });

    y = rowY + rowH;
    pdf
      .moveTo(left, y - 1)
      .lineTo(left + pageWidth, y - 1)
      .strokeColor("#f0ecf6")
      .lineWidth(0.5)
      .stroke();
  };

  if (lines.length === 0) {
    drawRow(t.emptyLines, "—", "—", "—", "—", true);
  } else {
    for (const line of lines) {
      drawRow(
        line.description || "—",
        String(line.quantity),
        money(line.unitExcl, doc.locale, doc.currency),
        money(line.lineVat, doc.locale, doc.currency),
        money(line.lineIncl, doc.locale, doc.currency),
      );
    }
  }

  y += 8;

  // Totals card
  const totalsW = 220;
  const totalsX = left + pageWidth - totalsW;
  pdf.roundedRect(totalsX, y, totalsW, 68, 6).fillAndStroke("#f7f4fb", "#e7e2ef");
  let ty = y + 10;
  const totalRow = (label: string, value: string, strong = false) => {
    pdf
      .font(strong ? headFont : bodyFont)
      .fontSize(strong ? 10 : 8.5)
      .fillColor(strong ? "#5e3b88" : "#14181f")
      .text(label, totalsX + 10, ty, { width: 110, lineBreak: false });
    pdf
      .font(strong ? headFont : bodyFont)
      .fontSize(strong ? 10 : 8.5)
      .fillColor(strong ? "#5e3b88" : "#14181f")
      .text(value, totalsX + 110, ty, {
        width: 100,
        align: "right",
        lineBreak: false,
      });
    ty += strong ? 16 : 14;
  };
  totalRow(t.subtotal, money(subtotalExcl, doc.locale, doc.currency));
  totalRow(`${t.vat} (${taxPct}%)`, money(vatAmount, doc.locale, doc.currency));
  totalRow(t.total, money(totalIncl, doc.locale, doc.currency), true);
  y += 78;

  // Notes / legal — keep compact to stay on page 1
  const noteBoxH = doc.notes ? 72 : 56;
  if (y + noteBoxH + 20 > footerY) {
    y = Math.min(y, footerY - noteBoxH - 20);
  }
  pdf.roundedRect(left, y, pageWidth, noteBoxH, 6).fill("#faf8fc");
  pdf
    .font(bodyFont)
    .fontSize(8)
    .fillColor("#14181f")
    .text(t.thanks, left + 10, y + 8, {
      width: pageWidth - 20,
      height: 12,
      ellipsis: true,
      lineBreak: false,
    });
  pdf
    .font(bodyFont)
    .fontSize(7.5)
    .fillColor("#5b6573")
    .text(t.taxNote, left + 10, y + 24, {
      width: pageWidth - 20,
      height: 12,
      ellipsis: true,
      lineBreak: false,
    });
  pdf
    .font(bodyFont)
    .fontSize(7.5)
    .fillColor("#5b6573")
    .text(t.footer, left + 10, y + 38, {
      width: pageWidth - 20,
      height: 12,
      ellipsis: true,
      lineBreak: false,
    });
  if (doc.notes) {
    pdf
      .font(bodyFont)
      .fontSize(7.5)
      .fillColor("#5b6573")
      .text(`${t.notes}: ${doc.notes}`, left + 10, y + 52, {
        width: pageWidth - 20,
        height: 14,
        ellipsis: true,
        lineBreak: false,
      });
  }
  y += noteBoxH + 6;

  pdf
    .font(bodyFont)
    .fontSize(7)
    .fillColor("#5b6573")
    .text(
      `${t.support} ${company.supportEmail}${
        doc.stripeSessionId ? ` · ${t.stripeRef}: ${doc.stripeSessionId}` : ""
      }`,
      left,
      Math.min(y, footerY - 14),
      { width: pageWidth, height: 10, ellipsis: true, lineBreak: false },
    );

  // Persistent footer with full seller identity (same page)
  pdf
    .font(bodyFont)
    .fontSize(6.5)
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
      footerY,
      {
        width: pageWidth,
        align: "center",
        height: 10,
        ellipsis: true,
        lineBreak: false,
      },
    );

  pdf.end();
  return done;
}

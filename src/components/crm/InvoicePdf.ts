"use client";

import {
  formatInvoiceMoney,
  type InvoiceLineItem,
} from "@/lib/crm/invoices";

export type InvoiceDocument = {
  number: string;
  status: string;
  currency: string;
  amount: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  issueDate?: string | Date | null;
  dueDate?: string | Date | null;
  reference?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  items?: InvoiceLineItem[] | null;
  client: {
    name: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    vatNumber?: string | null;
  };
  project?: { name: string } | null;
};

function formatDate(value?: string | Date | null, locale = "nl-NL") {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function openInvoicePdf(invoice: InvoiceDocument, locale = "nl") {
  const loc = locale === "nl" ? "nl-NL" : "en-NL";
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const clientLines = [
    invoice.client.company || invoice.client.name,
    invoice.client.company ? invoice.client.name : null,
    invoice.client.address,
    [invoice.client.city, invoice.client.country].filter(Boolean).join(", ") || null,
    invoice.client.email,
    invoice.client.phone,
    invoice.client.vatNumber ? `BTW: ${invoice.client.vatNumber}` : null,
  ].filter(Boolean) as string[];

  const rows = items
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.description)}</td>
        <td class="num">${Number(item.qty).toLocaleString(loc)}</td>
        <td class="num">${escapeHtml(formatInvoiceMoney(item.unitPrice, invoice.currency, loc))}</td>
        <td class="num">${escapeHtml(
          formatInvoiceMoney(Number(item.qty) * Number(item.unitPrice), invoice.currency, loc),
        )}</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(invoice.number)}</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: Inter, Arial, sans-serif; color: #1f1a2e; margin: 0; padding: 32px; background: #fff; }
    h1 { margin: 0; font-size: 28px; letter-spacing: -0.03em; }
    .muted { color: #6b6478; font-size: 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 28px; }
    .box { border: 1px solid #e7e2ef; border-radius: 16px; padding: 16px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #5e3b88; font-weight: 700; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 28px; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b6478; border-bottom: 1px solid #e7e2ef; padding: 10px 8px; }
    td { padding: 12px 8px; border-bottom: 1px solid #f1edf6; font-size: 13px; vertical-align: top; }
    .num { text-align: right; white-space: nowrap; }
    .totals { margin-top: 18px; margin-left: auto; width: 280px; }
    .totals div { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
    .totals .grand { font-size: 16px; font-weight: 700; border-top: 1px solid #e7e2ef; margin-top: 8px; padding-top: 12px; color: #5e3b88; }
    .notes { margin-top: 28px; padding: 16px; background: #f7f4fb; border-radius: 16px; font-size: 13px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;gap:24px;align-items:flex-start;">
    <div>
      <div class="muted">TripleZero iT</div>
      <h1>Factuur ${escapeHtml(invoice.number)}</h1>
      <div class="muted" style="margin-top:8px;">info@000-it.com · https://000-it.com</div>
    </div>
    <div style="text-align:right;">
      <div><strong>Status:</strong> ${escapeHtml(invoice.status)}</div>
      <div class="muted">Factuurdatum: ${escapeHtml(formatDate(invoice.issueDate, loc))}</div>
      <div class="muted">Vervaldatum: ${escapeHtml(formatDate(invoice.dueDate, loc))}</div>
      ${invoice.reference ? `<div class="muted">Referentie: ${escapeHtml(invoice.reference)}</div>` : ""}
      ${invoice.project?.name ? `<div class="muted">Project: ${escapeHtml(invoice.project.name)}</div>` : ""}
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <div class="label">Van</div>
      <div><strong>TripleZero iT</strong></div>
      <div class="muted">AI, AEO, GEO, SEO, marketing & software</div>
      <div class="muted">info@000-it.com</div>
    </div>
    <div class="box">
      <div class="label">Factuur aan</div>
      ${clientLines.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Omschrijving</th>
        <th class="num">Aantal</th>
        <th class="num">Prijs</th>
        <th class="num">Totaal</th>
      </tr>
    </thead>
    <tbody>${rows || `<tr><td colspan="4" class="muted">Geen regels</td></tr>`}</tbody>
  </table>

  <div class="totals">
    <div><span>Subtotaal</span><span>${escapeHtml(formatInvoiceMoney(invoice.subtotal, invoice.currency, loc))}</span></div>
    <div><span>BTW (${invoice.taxRate}%)</span><span>${escapeHtml(formatInvoiceMoney(invoice.taxAmount, invoice.currency, loc))}</span></div>
    <div class="grand"><span>Totaal</span><span>${escapeHtml(formatInvoiceMoney(invoice.amount, invoice.currency, loc))}</span></div>
  </div>

  ${
    invoice.paymentTerms || invoice.notes
      ? `<div class="notes">
          ${invoice.paymentTerms ? `<div><strong>Betalingsvoorwaarden:</strong> ${escapeHtml(invoice.paymentTerms)}</div>` : ""}
          ${invoice.notes ? `<div style="margin-top:8px;"><strong>Notities:</strong> ${escapeHtml(invoice.notes)}</div>` : ""}
        </div>`
      : ""
  }

  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>`;

  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=1100");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
}

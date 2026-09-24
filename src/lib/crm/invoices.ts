export type InvoiceLineItem = {
  description: string;
  qty: number;
  unitPrice: number;
};

export const INVOICE_STATUSES = [
  "DRAFT",
  "SENT",
  "PAID",
  "OVERDUE",
  "CANCELLED",
] as const;

export type InvoiceStatusCode = (typeof INVOICE_STATUSES)[number];

export function computeInvoiceTotals(
  items: InvoiceLineItem[],
  taxRate: number,
): { subtotal: number; taxAmount: number; amount: number } {
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.unitPrice || 0), 0),
  );
  const rate = Number.isFinite(taxRate) ? taxRate : 0;
  const taxAmount = roundMoney(subtotal * (rate / 100));
  const amount = roundMoney(subtotal + taxAmount);
  return { subtotal, taxAmount, amount };
}

export function roundMoney(value: number) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function formatInvoiceMoney(amount: number, currency = "EUR", locale = "nl-NL") {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function defaultDueDate(issueDate = new Date(), days = 14) {
  const d = new Date(issueDate);
  d.setDate(d.getDate() + days);
  return d;
}

export function toDateInputValue(value?: string | Date | null) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

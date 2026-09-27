/** Shared client-portal scoping helpers (email normalization + order ownership). */

export function normalizedClientEmail(email?: string | null): string {
  return (email ?? "").trim().toLowerCase();
}

/** Match shop/domain orders by logged-in userId or checkout email. */
export function portalOrderWhere(userId: string, email?: string | null) {
  const e = normalizedClientEmail(email);
  const or: Array<{ userId: string } | { email: string }> = [{ userId }];
  if (e) or.push({ email: e });
  return { OR: or };
}

/** CRM invoices attached to a Client row matched by email. */
export function crmInvoiceClientWhere(email?: string | null) {
  const e = normalizedClientEmail(email);
  return e ? { client: { email: e } } : { client: { email: "__none__" } };
}

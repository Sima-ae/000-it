"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Backup trigger on client success pages (e.g. my-domains renewals):
 * if Stripe redirected with session_id, confirm payment and email the invoice.
 */
export function CheckoutInvoiceBackup() {
  const searchParams = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    const sessionId = searchParams.get("session_id");
    const success = searchParams.get("success");
    if (!sessionId) return;
    if (success === "0" || searchParams.get("canceled") === "1") return;
    ran.current = true;

    void fetch("/api/shop/confirm-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).catch((error) => {
      console.error("[CheckoutInvoiceBackup]", error);
    });
  }, [searchParams]);

  return null;
}

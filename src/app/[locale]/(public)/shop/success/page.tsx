import { setRequestLocale } from "next-intl/server";
import { SuccessClient } from "@/components/shop/SuccessClient";
import { ensurePaidCheckoutAndInvoice } from "@/lib/shop/order-invoice";

export const dynamic = "force-dynamic";

export default async function ShopSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { locale } = await params;
  const { session_id: sessionId } = await searchParams;
  setRequestLocale(locale);

  let orderNumber: string | null = null;
  let email: string | null = null;
  let invoiceSent = false;

  if (sessionId) {
    try {
      const result = await ensurePaidCheckoutAndInvoice(sessionId);
      orderNumber = result.orderNumber || null;
      email = result.email || null;
      invoiceSent = result.sent || result.reason === "ALREADY_SENT";
    } catch (error) {
      console.error("[shop/success] invoice", error);
    }
  }

  return (
    <SuccessClient
      orderNumber={orderNumber}
      email={email}
      invoiceSent={invoiceSent || undefined}
    />
  );
}

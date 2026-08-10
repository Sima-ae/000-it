import { setRequestLocale } from "next-intl/server";
import { SuccessClient } from "@/components/shop/SuccessClient";
import { prisma } from "@/lib/prisma";

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

  if (sessionId) {
    const order = await prisma.shopOrder.findFirst({
      where: { stripeSessionId: sessionId },
      select: { orderNumber: true, email: true, status: true },
    });
    if (order) {
      orderNumber = order.orderNumber;
      email = order.email;
    }
  }

  return <SuccessClient orderNumber={orderNumber} email={email} />;
}

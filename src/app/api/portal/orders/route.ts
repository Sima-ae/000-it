import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { isStaffRole } from "@/lib/roles";
import { portalOrderWhere } from "@/lib/portal/scope";

export const dynamic = "force-dynamic";

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  const userId = session.user.id;
  const email = session.user.email;
  const staff = isStaffRole(session.user.role);
  // Clients always scoped to themselves; staff may optionally browse own portal too
  const where = portalOrderWhere(userId, email);

  const [shopOrders, domainOrders] = await Promise.all([
    prisma.shopOrder.findMany({
      where: {
        ...where,
        lineOfBusiness: { in: ["SERVICE", "HOSTING"] },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            unitPriceIncl: true,
            productId: true,
          },
        },
      },
    }),
    prisma.domainOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        orderNumber: true,
        domainName: true,
        years: true,
        orderType: true,
        status: true,
        totalPriceInCents: true,
        email: true,
        locale: true,
        invoiceEmailedAt: true,
        createdAt: true,
        updatedAt: true,
        // intentionally omit authCode / registrantJson / namecheapResponse
      },
    }),
  ]);

  const services = shopOrders.filter((o) => o.lineOfBusiness === "SERVICE").length;
  const hosting = shopOrders.filter((o) => o.lineOfBusiness === "HOSTING").length;
  const domains = domainOrders.length;
  const paid =
    shopOrders.filter((o) => o.status === "PAID").length +
    domainOrders.filter((o) => o.status !== "PENDING").length;

  return NextResponse.json({
    shopOrders,
    domainOrders,
    counts: { services, hosting, domains, paid },
    viewer: staff ? "staff" : "client",
  });
}

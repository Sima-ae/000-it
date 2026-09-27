import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import {
  createDomain,
  createTransfer,
  renewDomain,
  type RegistrantContact,
} from "@/lib/domains/namecheap";
import { sendFailedDomainOrderAlert } from "@/lib/domains/alerts";
import { upsertOwnedDomain } from "@/lib/domains/owned";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const orderType = searchParams.get("orderType");

  const orders = await prisma.domainOrder.findMany({
    where: {
      ...(status &&
      ["PENDING", "PAID", "REGISTERED", "FAILED"].includes(status)
        ? { status: status as "PENDING" | "PAID" | "REGISTERED" | "FAILED" }
        : {}),
      ...(orderType &&
      ["REGISTRATION", "RENEWAL", "TRANSFER"].includes(orderType)
        ? {
            orderType: orderType as
              | "REGISTRATION"
              | "RENEWAL"
              | "TRANSFER",
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      domainProduct: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (authResult.error) return authResult.error;

  const body = (await request.json().catch(() => null)) as {
    orderId?: string;
    action?: string;
  } | null;
  if (!body?.orderId || body.action !== "retry") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const order = await prisma.domainOrder.findUnique({
    where: { id: body.orderId },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status !== "FAILED" && order.status !== "PAID") {
    return NextResponse.json(
      { error: "Only PAID or FAILED orders can be retried" },
      { status: 400 },
    );
  }

  let result: { ok: boolean; xml: string; error?: string; transferId?: string };

  if (order.orderType === "RENEWAL") {
    result = await renewDomain({
      domainName: order.domainName,
      years: order.years,
    });
  } else if (order.orderType === "TRANSFER") {
    if (!order.authCode) {
      return NextResponse.json({ error: "Missing auth code" }, { status: 400 });
    }
    result = await createTransfer({
      domainName: order.domainName,
      years: order.years,
      authCode: order.authCode,
    });
  } else {
    let registrant: RegistrantContact;
    try {
      registrant = JSON.parse(order.registrantJson) as RegistrantContact;
    } catch {
      return NextResponse.json(
        { error: "Invalid registrant data" },
        { status: 500 },
      );
    }
    result = await createDomain({
      domainName: order.domainName,
      years: order.years,
      registrant,
    });
  }

  if (result.ok) {
    const updated = await prisma.domainOrder.update({
      where: { id: order.id },
      data: { status: "REGISTERED", namecheapResponse: result.xml },
    });
    if (order.userId) {
      await upsertOwnedDomain({
        domainName: order.domainName,
        userId: order.userId,
        status:
          order.orderType === "TRANSFER" ? "PENDING_TRANSFER" : "ACTIVE",
        yearsAdded: order.years,
        namecheapId: result.transferId || null,
      });
    }
    return NextResponse.json(updated);
  }

  const updated = await prisma.domainOrder.update({
    where: { id: order.id },
    data: {
      status: "FAILED",
      namecheapResponse: result.error || result.xml,
    },
  });
  await sendFailedDomainOrderAlert({
    orderId: order.id,
    orderNumber: order.orderNumber,
    domainName: order.domainName,
    userEmail: order.email,
    errorDetails: result.error || result.xml,
  });
  return NextResponse.json(updated, { status: 502 });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { canEditAny, isStaffRole, ownScope } from "@/lib/roles";

/** Lightweight counts for sidebar notification badges. */
export async function GET(request: NextRequest) {
  const { session, error } = await requireUser();
  if (error) return error;

  const userId = session.user.id;
  const role = session.user.role;
  const staff = isStaffRole(role);
  const adminView = canEditAny(role);
  const ticketWhere = staff ? {} : { userId };
  const scope = ownScope(role, userId);

  const seoSeenRaw = request.nextUrl.searchParams.get("seoSeenAt");
  const seoSeenAt = seoSeenRaw ? new Date(seoSeenRaw) : null;
  const seoSeenValid =
    seoSeenAt != null && !Number.isNaN(seoSeenAt.getTime()) ? seoSeenAt : null;

  const [leads, tickets, seoAnalysis, orders] = await Promise.all([
    staff
      ? Promise.all([
          prisma.contactLead.count({ where: { status: "NEW" } }),
          prisma.client.count({
            where: {
              ...scope,
              isLead: true,
              OR: [{ leadStatus: "NEW" }, { leadStatus: null }],
            },
          }),
        ]).then(([formLeads, pipelineLeads]) => formLeads + pipelineLeads)
      : Promise.resolve(0),
    prisma.supportTicket.count({
      where: {
        ...ticketWhere,
        status: "OPEN",
      },
    }),
    // Unseen SEO analyses since the user last opened the SEO page.
    // If never opened, count recent analyses from the last 7 days.
    prisma.aIScan.count({
      where: {
        ...(adminView ? {} : { userId }),
        createdAt: {
          gt: seoSeenValid
            ? seoSeenValid
            : (() => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return weekAgo;
              })(),
        },
      },
    }),
    staff
      ? prisma.shopOrder.count({ where: { status: "PENDING" } })
      : Promise.resolve(0),
  ]);

  return NextResponse.json({
    leads,
    tickets,
    seoAnalysis,
    orders,
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { isClientRole, isStaffRole, ownScope } from "@/lib/roles";
import {
  crmInvoiceClientWhere,
  normalizedClientEmail,
  portalOrderWhere,
} from "@/lib/portal/scope";

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  try {
    const role = session.user.role;
    const userId = session.user.id;
    const staff = isStaffRole(role);
    const clientScope = ownScope(role, userId);
    const ticketWhere = staff ? {} : { userId };
    const email = normalizedClientEmail(session.user.email);
    const orderWhere = portalOrderWhere(userId, email);

    const [
      clients,
      leadsPipeline,
      contactLeads,
      projects,
      openTickets,
      tasks,
      invoices,
      unreadMessages,
      recentTickets,
      recentClients,
      domains,
      hostingOrders,
      serviceOrders,
      domainOrders,
    ] = await Promise.all([
      staff
        ? prisma.client.count({ where: { ...clientScope, isLead: false } })
        : prisma.client.count({
            where: email ? { email } : { email: "__none__" },
          }),
      staff
        ? prisma.client.count({ where: { ...clientScope, isLead: true } })
        : Promise.resolve(0),
      staff
        ? prisma.contactLead.count({
            where: { status: { in: ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL"] } },
          })
        : Promise.resolve(0),
      prisma.project.count({ where: ownScope(role, userId) }),
      prisma.supportTicket.count({
        where: {
          ...ticketWhere,
          status: { in: ["OPEN", "IN_PROGRESS", "WAITING"] },
        },
      }),
      prisma.task.count({
        where: { project: ownScope(role, userId) },
      }),
      staff
        ? prisma.invoice.count({
            where: canSeeAllInvoices(role)
              ? { deletedAt: null, status: { in: ["DRAFT", "SENT", "OVERDUE"] } }
              : {
                  createdById: userId,
                  deletedAt: null,
                  status: { in: ["DRAFT", "SENT", "OVERDUE"] },
                },
          })
        : prisma.invoice.count({
            where: {
              deletedAt: null,
              status: { in: ["SENT", "OVERDUE", "PAID"] },
              ...crmInvoiceClientWhere(email),
            },
          }),
      prisma.crmMessage.count({
        where: { toUserId: userId, readAt: null },
      }),
      prisma.supportTicket.findMany({
        where: ticketWhere,
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: {
          client: { select: { id: true, name: true, company: true } },
          project: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
        },
      }),
      staff
        ? prisma.client.findMany({
            where: clientScope,
            orderBy: { updatedAt: "desc" },
            take: 6,
          })
        : Promise.resolve([]),
      staff
        ? Promise.resolve(0)
        : prisma.ownedDomain.count({ where: { userId } }),
      staff
        ? Promise.resolve(0)
        : prisma.shopOrder.count({
            where: { ...orderWhere, lineOfBusiness: "HOSTING" },
          }),
      staff
        ? Promise.resolve(0)
        : prisma.shopOrder.count({
            where: { ...orderWhere, lineOfBusiness: "SERVICE" },
          }),
      staff
        ? Promise.resolve(0)
        : prisma.domainOrder.count({ where: orderWhere }),
    ]);

    return NextResponse.json({
      role,
      view: isClientRole(role) ? "client" : "staff",
      stats: {
        clients,
        leadsPipeline: leadsPipeline + contactLeads,
        projects,
        openTickets,
        tasks,
        invoices,
        unreadMessages,
        domains,
        hostingOrders,
        serviceOrders,
        domainOrders,
      },
      recentTickets,
      recentClients,
    });
  } catch (err) {
    console.error("[crm/overview]", err);
    return NextResponse.json(
      { error: "CRM overview unavailable" },
      { status: 503 },
    );
  }
}

function canSeeAllInvoices(role: string) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

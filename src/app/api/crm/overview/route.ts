import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { isClientRole, isStaffRole, ownScope } from "@/lib/roles";

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  try {
    const role = session.user.role;
    const userId = session.user.id;
    const staff = isStaffRole(role);
    const clientScope = ownScope(role, userId);
    const ticketWhere = staff ? {} : { userId };

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
    ] = await Promise.all([
      staff
        ? prisma.client.count({ where: { ...clientScope, isLead: false } })
        : prisma.client.count({ where: { email: session.user.email || undefined } }),
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
              client: { email: session.user.email || "" },
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

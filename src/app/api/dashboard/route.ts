import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { isClientRole, isManagerRole, isStaffRole, ownScope } from "@/lib/roles";
import {
  crmInvoiceClientWhere,
  normalizedClientEmail,
  portalOrderWhere,
} from "@/lib/portal/scope";

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  try {
    const userId = session.user.id;
    const role = session.user.role;
    const scope = ownScope(role, userId);
    const ticketWhere = isStaffRole(role) ? {} : { userId };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, companyName: true },
    });

    const [projects, agents, tasks, scans, activities, clients, leads, openTickets, todosOpen] =
      await Promise.all([
        prisma.project.count({ where: scope }),
        prisma.aIAgent.count({
          where: { ...scope, status: "RUNNING" },
        }),
        prisma.task.count({
          where: {
            project: scope,
            status: { in: ["PENDING", "IN_PROGRESS", "REVIEW"] },
          },
        }),
        prisma.aIScan.count({ where: { userId } }),
        prisma.activity.findMany({
          where: isStaffRole(role) && !isManagerRole(role) ? {} : { userId },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        isStaffRole(role)
          ? prisma.client.count({ where: scope })
          : Promise.resolve(0),
        isStaffRole(role)
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
            status: { in: ["OPEN", "IN_PROGRESS", "WAITING"] },
          },
        }),
        isStaffRole(role)
          ? prisma.staffTodo.count({ where: { userId, done: false } })
          : Promise.resolve(0),
      ]);

    const recentProjects = await prisma.project.findMany({
      where: scope,
      orderBy: { updatedAt: "desc" },
      take: 6,
    });

    const agentList = await prisma.aIAgent.findMany({
      where: scope,
      take: 8,
      orderBy: { name: "asc" },
    });

    const recentClients = isStaffRole(role)
      ? await prisma.client.findMany({
          where: scope,
          orderBy: { updatedAt: "desc" },
          take: 5,
        })
      : [];

    const recentLeads = isStaffRole(role)
      ? await prisma.contactLead.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : [];

    const recentTickets = await prisma.supportTicket.findMany({
      where: ticketWhere,
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        updatedAt: true,
        source: true,
      },
    });

    const newsOwned = isStaffRole(role)
      ? await prisma.newsPost.count({
          where: isManagerRole(role)
            ? { createdById: userId, deletedAt: null }
            : { deletedAt: null },
        })
      : 0;
    const casesOwned = isStaffRole(role)
      ? await prisma.caseStudy.count({
          where: isManagerRole(role) ? { createdById: userId } : undefined,
        })
      : 0;

    const clientEmail = normalizedClientEmail(
      user?.email ?? session.user.email,
    );
    const portalOwnerWhere = portalOrderWhere(userId, clientEmail);

    const [
      portalDomains,
      hostingOrdersCount,
      serviceOrdersCount,
      portalInvoices,
      hostingPending,
      servicePending,
    ] = isClientRole(role)
      ? await Promise.all([
          prisma.ownedDomain.count({ where: { userId } }),
          prisma.shopOrder.count({
            where: { ...portalOwnerWhere, lineOfBusiness: "HOSTING" },
          }),
          prisma.shopOrder.count({
            where: { ...portalOwnerWhere, lineOfBusiness: "SERVICE" },
          }),
          prisma.invoice.count({
            where: {
              deletedAt: null,
              status: { not: "DRAFT" },
              ...crmInvoiceClientWhere(clientEmail),
            },
          }),
          prisma.shopOrder.count({
            where: {
              ...portalOwnerWhere,
              lineOfBusiness: "HOSTING",
              status: "PENDING",
            },
          }),
          prisma.shopOrder.count({
            where: {
              ...portalOwnerWhere,
              lineOfBusiness: "SERVICE",
              status: "PENDING",
            },
          }),
        ])
      : [0, 0, 0, 0, 0, 0];

    return NextResponse.json({
      role,
      user: {
        name: user?.name ?? session.user.name,
        email: user?.email ?? session.user.email,
        companyName: user?.companyName ?? null,
      },
      stats: {
        projects,
        agents,
        tasks,
        scans,
        clients,
        leads,
        news: isStaffRole(role) ? newsOwned : 0,
        caseStudies: isStaffRole(role) ? casesOwned : 0,
        openTickets,
        todosOpen: isStaffRole(role) ? todosOpen : 0,
        domains: portalDomains,
        hostingOrders: hostingOrdersCount,
        serviceOrders: serviceOrdersCount,
        hostingPending,
        servicePending,
        invoices: portalInvoices,
      },
      activities,
      recentProjects,
      recentClients,
      recentLeads,
      recentTickets,
      agentList,
      view: isClientRole(role)
        ? "client"
        : isManagerRole(role)
          ? "manager"
          : "admin",
    });
  } catch (err) {
    console.error("[api/dashboard]", err);
    return NextResponse.json(
      { error: "Dashboard unavailable (database error)" },
      { status: 503 },
    );
  }
}

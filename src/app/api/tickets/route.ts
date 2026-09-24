import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/roles";
import { newGuestToken } from "@/lib/support";
import { buildAgentReply } from "@/lib/agent-000/ask";
import { parseTicketTags } from "@/lib/crm/tickets";

const createSchema = z.object({
  subject: z.string().min(2).max(160),
  message: z.string().min(1).max(5000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  source: z.enum(["CHAT", "DASHBOARD", "EMAIL"]).optional(),
  ticketType: z.string().max(80).optional(),
  department: z.string().max(80).optional().nullable(),
  category: z.string().max(80).optional().nullable(),
  tags: z.array(z.string().min(1).max(40)).max(12).optional(),
  dueAt: z.string().datetime().optional().nullable(),
  guestName: z.string().min(1).max(120).optional(),
  guestEmail: z.string().email().optional(),
  clientId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  locale: z.string().optional(),
});

function listInclude() {
  return {
    user: { select: { id: true, name: true, email: true } },
    assignedTo: { select: { id: true, name: true, email: true } },
    client: { select: { id: true, name: true, company: true, email: true } },
    project: { select: { id: true, name: true } },
    messages: {
      orderBy: { createdAt: "desc" as const },
      take: 1,
      select: { body: true, createdAt: true, senderKind: true },
    },
    _count: { select: { messages: true } },
  };
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staff = isStaffRole(session.user.role);
  const sp = request.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim();
  const status = (sp.get("status") || "").trim().toUpperCase();
  const priority = (sp.get("priority") || "").trim().toUpperCase();
  const department = (sp.get("department") || "").trim();
  const ticketType = (sp.get("type") || "").trim();
  const clientId = (sp.get("clientId") || "").trim();
  const assignedToId = (sp.get("assignedToId") || "").trim();
  const source = (sp.get("source") || "").trim().toUpperCase();
  const quick = (sp.get("quick") || "").trim().toLowerCase();
  const createdFrom = sp.get("createdFrom");
  const createdTo = sp.get("createdTo");
  const page = Math.max(1, Number(sp.get("page") || "1") || 1);
  const pageSize = Math.min(100, Math.max(1, Number(sp.get("pageSize") || "50") || 50));
  const takeAll = sp.get("all") === "1";

  const where: Prisma.SupportTicketWhereInput = {
    ...(staff ? {} : { userId: session.user.id }),
  };

  if (status) where.status = status as Prisma.EnumTicketStatusFilter["equals"];
  if (priority) where.priority = priority as Prisma.EnumTicketPriorityFilter["equals"];
  if (department) where.department = department;
  if (ticketType) where.ticketType = ticketType;
  if (clientId) where.clientId = clientId;
  if (assignedToId === "me") where.assignedToId = session.user.id;
  else if (assignedToId === "unassigned") where.assignedToId = null;
  else if (assignedToId) where.assignedToId = assignedToId;
  if (source) where.source = source as Prisma.EnumTicketSourceFilter["equals"];

  if (createdFrom || createdTo) {
    where.createdAt = {};
    if (createdFrom) {
      const from = new Date(createdFrom);
      if (!Number.isNaN(from.getTime())) where.createdAt.gte = from;
    }
    if (createdTo) {
      const to = new Date(createdTo);
      if (!Number.isNaN(to.getTime())) {
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }
  }

  if (quick === "open") {
    where.status = { in: ["OPEN", "IN_PROGRESS", "WAITING"] };
  } else if (quick === "high") {
    where.priority = { in: ["HIGH", "URGENT"] };
    where.status = { in: ["OPEN", "IN_PROGRESS", "WAITING"] };
  } else if (quick === "unassigned" && staff) {
    where.assignedToId = null;
    where.status = { in: ["OPEN", "IN_PROGRESS", "WAITING"] };
  } else if (quick === "mine" && staff) {
    where.assignedToId = session.user.id;
  } else if (quick === "recent") {
    where.updatedAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
  } else if (quick === "favorites") {
    where.favorite = true;
  } else if (quick === "chat") {
    where.source = "CHAT";
  } else if (quick === "ticket") {
    where.source = { in: ["DASHBOARD", "EMAIL"] };
  }

  if (q) {
    where.OR = [
      { subject: { contains: q } },
      { description: { contains: q } },
      { guestName: { contains: q } },
      { guestEmail: { contains: q } },
      { ticketType: { contains: q } },
      { department: { contains: q } },
      { client: { name: { contains: q } } },
      { client: { company: { contains: q } } },
      { assignedTo: { name: { contains: q } } },
      { assignedTo: { email: { contains: q } } },
    ];
  }

  const [total, tickets] = await Promise.all([
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: takeAll ? 0 : (page - 1) * pageSize,
      take: takeAll ? 200 : pageSize,
      include: listInclude(),
    }),
  ]);

  // Backward-compatible: array when no pagination params used heavily by chat/old UI
  if (!sp.has("page") && !sp.has("q") && !sp.has("status") && !sp.has("quick") && !sp.has("pageSize")) {
    return NextResponse.json(tickets);
  }

  return NextResponse.json({
    items: tickets,
    total,
    page,
    pageSize: takeAll ? tickets.length : pageSize,
    totalPages: Math.max(1, Math.ceil(total / (takeAll ? Math.max(tickets.length, 1) : pageSize))),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  try {
    const loggedIn = Boolean(session?.user?.id);
    const staff = isStaffRole(session?.user?.role);

    if (!loggedIn && (!data.guestName || !data.guestEmail)) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

    const isClientUser = loggedIn && !staff;
    const guestToken = !loggedIn ? newGuestToken() : null;
    const senderKind = staff ? "STAFF" : isClientUser ? "CLIENT" : "GUEST";
    const email = (data.guestEmail || session?.user?.email || "").toLowerCase();

    let clientId = data.clientId || null;
    if (!clientId && email) {
      const matched = await prisma.client.findFirst({
        where: { email, isLead: false },
        orderBy: { updatedAt: "desc" },
      });
      clientId = matched?.id ?? null;
    }

    const source = data.source ?? (isClientUser ? "DASHBOARD" : "CHAT");
    const locale = data.locale || "en";
    let agent: Awaited<ReturnType<typeof buildAgentReply>> | null = null;
    if (source === "CHAT") {
      try {
        agent = await buildAgentReply(locale, data.message);
      } catch (error) {
        console.error("[tickets] agent reply skipped", error);
      }
    }

    const tags = data.tags ? parseTicketTags(data.tags) : [];

    const ticket = await prisma.supportTicket.create({
      data: {
        subject: data.subject,
        description: data.message,
        priority: data.priority ?? "LOW",
        source,
        ticketType: data.ticketType || "General",
        department: data.department || null,
        category: data.category || data.ticketType || "General",
        tags: tags.length ? tags : undefined,
        dueAt: data.dueAt ? new Date(data.dueAt) : null,
        userId: isClientUser ? session!.user.id : null,
        clientId,
        projectId: data.projectId || null,
        guestName: data.guestName || session?.user?.name || null,
        guestEmail: data.guestEmail || session?.user?.email || null,
        guestToken,
        status: "OPEN",
        messages: {
          create: [
            {
              body: data.message,
              senderId: session?.user?.id ?? null,
              senderKind,
            },
            ...(agent
              ? [
                  {
                    body: agent.answer,
                    senderId: null,
                    senderKind: "SYSTEM" as const,
                  },
                ]
              : []),
          ],
        },
        events: {
          create: {
            actorId: session?.user?.id ?? null,
            kind: "CREATED",
            message: `Ticket created via ${source.toLowerCase()}`,
            payload: { source, priority: data.priority ?? "LOW" },
          },
        },
      },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        client: { select: { id: true, name: true, company: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        ...ticket,
        guestToken,
        agent: agent
          ? {
              faqId: agent.faqId,
              confidence: agent.confidence,
              actions: agent.actions,
            }
          : null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[tickets] POST failed", error);
    return NextResponse.json({ error: "Could not create ticket" }, { status: 503 });
  }
}

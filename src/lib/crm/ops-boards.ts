import { prisma } from "@/lib/prisma";
import { canOverseeWorkOps } from "@/lib/crm/work-ops";
import type {
  OpsBoardMemberRole,
  OpsColumnType,
  Prisma,
  Role,
  WorkWebsite,
} from "@prisma/client";

export const DEFAULT_STATUS_SETTINGS = {
  labels: [
    { id: "todo", label: "To do", color: "#c4c4c4" },
    { id: "working", label: "Working on it", color: "#fdab3d" },
    { id: "stuck", label: "Stuck", color: "#e2445c" },
    { id: "done", label: "Done", color: "#00c875" },
  ],
};

export const OUTREACH_STATUS_SETTINGS = {
  labels: [
    { id: "sent", label: "Sent", color: "#579bfc" },
    { id: "follow_up", label: "Follow-up", color: "#fdab3d" },
    { id: "won", label: "Won", color: "#00c875" },
    { id: "lost", label: "Lost", color: "#e2445c" },
  ],
};

export type BoardTemplateColumn = {
  title: string;
  type: OpsColumnType;
  settings?: Prisma.InputJsonValue;
};

export type BoardTemplateGroup = {
  name: string;
  color?: string;
  items?: string[];
};

export type BoardTemplate = {
  key: string;
  name: string;
  description: string;
  website?: WorkWebsite;
  columns: BoardTemplateColumn[];
  groups: BoardTemplateGroup[];
};

export const BOARD_TEMPLATES: BoardTemplate[] = [
  {
    key: "outreach",
    name: "Outreach & Link Building",
    description: "Prospects, outreach emails, follow-ups and won/lost links.",
    columns: [
      { title: "Status", type: "STATUS", settings: OUTREACH_STATUS_SETTINGS },
      { title: "Person", type: "PEOPLE" },
      { title: "Website", type: "WEBSITE" },
      { title: "Contact", type: "EMAIL" },
      { title: "Activity", type: "ACTIVITY_TYPE" },
      { title: "Next follow-up", type: "DATE" },
      { title: "Notes", type: "LONG_TEXT" },
    ],
    groups: [
      { name: "New prospects", color: "#579bfc", items: [] },
      { name: "Outreach sent", color: "#fdab3d", items: [] },
      { name: "Follow-up", color: "#a25ddc", items: [] },
      { name: "Won", color: "#00c875", items: [] },
    ],
  },
  {
    key: "guest-posts",
    name: "Guest Posts",
    description: "Pitch → draft → published guest posts per brand.",
    columns: [
      {
        title: "Status",
        type: "STATUS",
        settings: {
          labels: [
            { id: "idea", label: "Idea", color: "#c4c4c4" },
            { id: "pitched", label: "Pitched", color: "#579bfc" },
            { id: "draft", label: "Drafting", color: "#fdab3d" },
            { id: "published", label: "Published", color: "#00c875" },
            { id: "lost", label: "Lost", color: "#e2445c" },
          ],
        },
      },
      { title: "Person", type: "PEOPLE" },
      { title: "Website", type: "WEBSITE" },
      { title: "Target blog", type: "TEXT" },
      { title: "Due", type: "DATE" },
      { title: "Notes", type: "LONG_TEXT" },
    ],
    groups: [
      { name: "000-it.com", color: "#579bfc" },
      { name: "extrahosting.eu", color: "#00c875" },
    ],
  },
  {
    key: "directories",
    name: "Directory & Citations",
    description: "Directory and citation submissions with NAP consistency.",
    columns: [
      { title: "Status", type: "STATUS", settings: OUTREACH_STATUS_SETTINGS },
      { title: "Person", type: "PEOPLE" },
      { title: "Website", type: "WEBSITE" },
      { title: "Directory URL", type: "LINK" },
      { title: "Submitted", type: "DATE" },
      { title: "Notes", type: "LONG_TEXT" },
    ],
    groups: [
      { name: "To submit", color: "#c4c4c4" },
      { name: "Submitted", color: "#fdab3d" },
      { name: "Verified", color: "#00c875" },
    ],
  },
  {
    key: "social",
    name: "Social Content Calendar",
    description: "Batch social posts per platform for both brands.",
    columns: [
      { title: "Status", type: "STATUS", settings: DEFAULT_STATUS_SETTINGS },
      { title: "Person", type: "PEOPLE" },
      { title: "Website", type: "WEBSITE" },
      {
        title: "Platform",
        type: "DROPDOWN",
        settings: { options: ["LinkedIn", "Facebook", "X"] },
      },
      { title: "Scheduled", type: "DATE" },
      { title: "Copy", type: "LONG_TEXT" },
    ],
    groups: [
      { name: "This week", color: "#579bfc" },
      { name: "Next week", color: "#a25ddc" },
      { name: "Published", color: "#00c875" },
    ],
  },
  {
    key: "dev-backlog",
    name: "Dev / Maintenance Backlog",
    description: "Bugs, speed, security, backups — no on-page SEO.",
    columns: [
      { title: "Status", type: "STATUS", settings: DEFAULT_STATUS_SETTINGS },
      { title: "Person", type: "PEOPLE" },
      { title: "Website", type: "WEBSITE" },
      {
        title: "Type",
        type: "DROPDOWN",
        settings: { options: ["Bug", "Speed", "Security", "Backup", "Other"] },
      },
      { title: "Priority", type: "DROPDOWN", settings: { options: ["Low", "Medium", "High"] } },
      { title: "Due", type: "DATE" },
    ],
    groups: [
      { name: "Open", color: "#e2445c" },
      { name: "In progress", color: "#fdab3d" },
      { name: "Done", color: "#00c875" },
    ],
  },
  {
    key: "onboarding-week0",
    name: "Onboarding Week 0",
    description: "Day 1–5 access, audit, research, templates, calendar.",
    columns: [
      { title: "Status", type: "STATUS", settings: DEFAULT_STATUS_SETTINGS },
      { title: "Person", type: "PEOPLE" },
      { title: "Block", type: "TEXT" },
      { title: "Done by", type: "DATE" },
    ],
    groups: [
      {
        name: "Day 1 — Access & Orientation",
        color: "#579bfc",
        items: [
          "Get access to websites, CRM, social, design tools",
          "Review both websites",
          "Review brand tone and assets",
          "Set up CRM fields and pipeline",
          "Create Month 1 master task list",
          "Log onboarding notes",
        ],
      },
      {
        name: "Day 2 — Social Audit",
        color: "#a25ddc",
        items: [
          "Audit LinkedIn, Facebook, X for both brands",
          "Update bios, banners, links",
          "Create branded social templates",
          "Draft first week social posts",
          "Log updates in CRM",
        ],
      },
      {
        name: "Day 3 — Prospect Research",
        color: "#fdab3d",
        items: [
          "Research 25 link prospects for 000-it.com",
          "Research 25 link prospects for extrahosting.eu",
          "Add prospects to CRM",
          "Identify 10 directory sites per website",
          "Log in CRM",
        ],
      },
      {
        name: "Day 4 — Outreach Templates",
        color: "#00c875",
        items: [
          "Write 3 guest post pitch templates",
          "Write 3 link-building outreach templates",
          "Write 2 directory submission templates",
          "Write 5 social media post templates",
          "Log templates in CRM",
        ],
      },
      {
        name: "Day 5 — Calendar & Backlog",
        color: "#e2445c",
        items: [
          "Plan Month 1 content",
          "Create design assets list",
          "Create development backlog",
          "Set weekly priorities with owner",
          "Log full week in CRM",
        ],
      },
    ],
  },
  {
    key: "monthly-roadmap",
    name: "Monthly Roadmap",
    description: "Week 1–4 deliverables and 90-day external SEO targets.",
    columns: [
      { title: "Status", type: "STATUS", settings: DEFAULT_STATUS_SETTINGS },
      { title: "Person", type: "PEOPLE" },
      { title: "Website", type: "WEBSITE" },
      { title: "Month", type: "DROPDOWN", settings: { options: ["Month 1", "Month 2", "Month 3"] } },
      { title: "Due", type: "DATE" },
    ],
    groups: [
      {
        name: "Week 1 — Research & Foundation",
        color: "#579bfc",
        items: [
          "20 new prospects in CRM",
          "5 directory submissions",
          "1 guest post draft per site",
          "5 social posts per platform",
          "3–5 bug fixes",
        ],
      },
      {
        name: "Week 2 — Content Production",
        color: "#a25ddc",
        items: [
          "Guest post published 000-it.com",
          "Guest post published extrahosting.eu",
          "10 outreach emails/day",
          "2–3 links acquired",
        ],
      },
      {
        name: "Week 3 — Outreach & Links",
        color: "#fdab3d",
        items: [
          "50+ outreach emails",
          "3–5 directory submissions",
          "2 guest post pitches",
          "1 press release or newsletter",
        ],
      },
      {
        name: "Week 4 — Scale & Review",
        color: "#00c875",
        items: [
          "50+ outreach emails",
          "2–3 guest posts secured",
          "1 partnership discussion",
          "CRM monthly report",
        ],
      },
    ],
  },
];

export async function userCanAccessBoard(
  boardId: string,
  userId: string,
  role: Role | string | null | undefined,
): Promise<{ ok: boolean; memberRole?: OpsBoardMemberRole }> {
  if (canOverseeWorkOps(role)) return { ok: true, memberRole: "OWNER" };
  const member = await prisma.opsBoardMember.findUnique({
    where: { boardId_userId: { boardId, userId } },
  });
  if (member) return { ok: true, memberRole: member.role };
  const board = await prisma.opsBoard.findUnique({
    where: { id: boardId },
    select: { createdById: true },
  });
  if (board?.createdById === userId) return { ok: true, memberRole: "OWNER" };
  return { ok: false };
}

export async function userCanEditBoard(
  boardId: string,
  userId: string,
  role: Role | string | null | undefined,
): Promise<boolean> {
  const access = await userCanAccessBoard(boardId, userId, role);
  if (!access.ok) return false;
  if (canOverseeWorkOps(role)) return true;
  return access.memberRole === "OWNER" || access.memberRole === "EDITOR";
}

export function boardListWhere(userId: string, role: Role | string | null | undefined) {
  if (canOverseeWorkOps(role)) return {};
  return {
    OR: [{ createdById: userId }, { members: { some: { userId } } }],
  };
}

export async function createBoardFromTemplate(opts: {
  workspaceId: string;
  templateKey: string;
  createdById: string;
  name?: string;
  website?: WorkWebsite | null;
}) {
  const template = BOARD_TEMPLATES.find((t) => t.key === opts.templateKey);
  if (!template) throw new Error("Unknown template");

  return prisma.$transaction(async (tx) => {
    const board = await tx.opsBoard.create({
      data: {
        workspaceId: opts.workspaceId,
        name: opts.name || template.name,
        description: template.description,
        website: opts.website ?? template.website ?? null,
        templateKey: template.key,
        createdById: opts.createdById,
        members: {
          create: { userId: opts.createdById, role: "OWNER" },
        },
        views: {
          create: [
            { name: "Table", type: "TABLE", sortOrder: 0 },
            { name: "Kanban", type: "KANBAN", sortOrder: 1, config: { groupBy: "STATUS" } },
            { name: "Calendar", type: "CALENDAR", sortOrder: 2 },
            { name: "Timeline", type: "TIMELINE", sortOrder: 3 },
          ],
        },
      },
    });

    for (let i = 0; i < template.columns.length; i++) {
      const col = template.columns[i];
      await tx.opsColumn.create({
        data: {
          boardId: board.id,
          title: col.title,
          type: col.type,
          settings: col.settings ?? undefined,
          sortOrder: i,
        },
      });
    }

    for (let gi = 0; gi < template.groups.length; gi++) {
      const g = template.groups[gi];
      const group = await tx.opsGroup.create({
        data: {
          boardId: board.id,
          name: g.name,
          color: g.color,
          sortOrder: gi,
        },
      });
      const items = g.items || [];
      for (let ii = 0; ii < items.length; ii++) {
        await tx.opsItem.create({
          data: {
            boardId: board.id,
            groupId: group.id,
            name: items[ii],
            sortOrder: ii,
            createdById: opts.createdById,
          },
        });
      }
    }

    return board;
  });
}

export async function ensureDefaultWorkspace(userId: string) {
  const existing = await prisma.opsWorkspace.findFirst({
    where: { createdById: userId },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;
  return prisma.opsWorkspace.create({
    data: {
      name: "Main workspace",
      description: "Default CRM Work OS workspace",
      createdById: userId,
    },
  });
}

export async function notifyUser(opts: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  href?: string;
  payload?: Prisma.InputJsonValue;
}) {
  return prisma.opsNotification.create({
    data: {
      userId: opts.userId,
      type: opts.type,
      title: opts.title,
      body: opts.body,
      href: opts.href,
      payload: opts.payload,
    },
  });
}

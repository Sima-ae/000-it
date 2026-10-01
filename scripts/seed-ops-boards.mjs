/**
 * Seed CRM Work OS checklists + board templates for the primary admin.
 * Usage: node --env-file=.env scripts/seed-ops-boards.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CHECKLIST = [
  { period: "DAILY", dayKey: "09:00-09:30", title: "CRM & email — urgent issues + today’s priorities", sortOrder: 1 },
  { period: "DAILY", dayKey: "09:30-10:30", title: "Social — replies, DMs, engage 2–3 posts", sortOrder: 2 },
  { period: "DAILY", dayKey: "10:30-12:00", title: "Content & design — write / graphics", sortOrder: 3 },
  { period: "DAILY", dayKey: "12:00-13:00", title: "Lunch break", sortOrder: 4 },
  { period: "DAILY", dayKey: "13:00-14:30", title: "External SEO outreach — 5–10 emails / directories", sortOrder: 5 },
  { period: "DAILY", dayKey: "14:30-15:00", title: "Community — forums / LinkedIn groups / Q&A", sortOrder: 6 },
  { period: "DAILY", dayKey: "15:00-15:15", title: "Short break", sortOrder: 7 },
  { period: "DAILY", dayKey: "15:15-16:30", title: "Development / design — bugs, speed, security, assets", sortOrder: 8 },
  { period: "DAILY", dayKey: "16:30-16:45", title: "Follow-ups — update CRM statuses", sortOrder: 9 },
  { period: "DAILY", dayKey: "16:45-17:00", title: "CRM logging — log all work + top 3 for tomorrow", sortOrder: 10 },
  { period: "WEEKLY", dayKey: "monday", title: "Planning & development focus", sortOrder: 1 },
  { period: "WEEKLY", dayKey: "tuesday", title: "Content creation — 000-it.com", sortOrder: 2 },
  { period: "WEEKLY", dayKey: "wednesday", title: "Outreach & link building — 000-it.com", sortOrder: 3 },
  { period: "WEEKLY", dayKey: "thursday", title: "Content creation — extrahosting.eu", sortOrder: 4 },
  { period: "WEEKLY", dayKey: "friday", title: "Batch social & weekly review / summary", sortOrder: 5 },
  { period: "MONTHLY", dayKey: "week1", title: "Research & foundation deliverables", sortOrder: 1 },
  { period: "MONTHLY", dayKey: "week2", title: "Content production deliverables", sortOrder: 2 },
  { period: "MONTHLY", dayKey: "week3", title: "Outreach & link building deliverables", sortOrder: 3 },
  { period: "MONTHLY", dayKey: "week4", title: "Scale, review & monthly CRM report", sortOrder: 4 },
  { period: "ONBOARDING", dayKey: "day1", title: "Get access to websites, CRM, social, design tools", sortOrder: 1 },
  { period: "ONBOARDING", dayKey: "day1", title: "Review both websites and brand assets", sortOrder: 2 },
  { period: "ONBOARDING", dayKey: "day1", title: "Set up CRM fields / pipeline + Month 1 task list", sortOrder: 3 },
  { period: "ONBOARDING", dayKey: "day2", title: "Social audit + update bios/banners + templates", sortOrder: 4 },
  { period: "ONBOARDING", dayKey: "day3", title: "Research 50 prospects + 20 directories; add to CRM", sortOrder: 5 },
  { period: "ONBOARDING", dayKey: "day4", title: "Write outreach / guest / directory / social templates", sortOrder: 6 },
  { period: "ONBOARDING", dayKey: "day5", title: "Content calendar + dev backlog + weekly priorities", sortOrder: 7 },
];

const OUTREACH_STATUS = {
  labels: [
    { id: "sent", label: "Sent", color: "#579bfc" },
    { id: "follow_up", label: "Follow-up", color: "#fdab3d" },
    { id: "won", label: "Won", color: "#00c875" },
    { id: "lost", label: "Lost", color: "#e2445c" },
  ],
};

const DEFAULT_STATUS = {
  labels: [
    { id: "todo", label: "To do", color: "#c4c4c4" },
    { id: "working", label: "Working on it", color: "#fdab3d" },
    { id: "stuck", label: "Stuck", color: "#e2445c" },
    { id: "done", label: "Done", color: "#00c875" },
  ],
};

const TEMPLATES = [
  {
    key: "outreach",
    name: "Outreach & Link Building",
    description: "Prospects, outreach emails, follow-ups and won/lost links.",
    columns: [
      { title: "Status", type: "STATUS", settings: OUTREACH_STATUS },
      { title: "Person", type: "PEOPLE" },
      { title: "Website", type: "WEBSITE" },
      { title: "Contact", type: "EMAIL" },
      { title: "Activity", type: "ACTIVITY_TYPE" },
      { title: "Next follow-up", type: "DATE" },
      { title: "Notes", type: "LONG_TEXT" },
    ],
    groups: [
      { name: "New prospects", color: "#579bfc" },
      { name: "Outreach sent", color: "#fdab3d" },
      { name: "Follow-up", color: "#a25ddc" },
      { name: "Won", color: "#00c875" },
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
      { title: "Status", type: "STATUS", settings: OUTREACH_STATUS },
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
      { title: "Status", type: "STATUS", settings: DEFAULT_STATUS },
      { title: "Person", type: "PEOPLE" },
      { title: "Website", type: "WEBSITE" },
      { title: "Platform", type: "DROPDOWN", settings: { options: ["LinkedIn", "Facebook", "X"] } },
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
      { title: "Status", type: "STATUS", settings: DEFAULT_STATUS },
      { title: "Person", type: "PEOPLE" },
      { title: "Website", type: "WEBSITE" },
      { title: "Type", type: "DROPDOWN", settings: { options: ["Bug", "Speed", "Security", "Backup", "Other"] } },
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
      { title: "Status", type: "STATUS", settings: DEFAULT_STATUS },
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
      { title: "Status", type: "STATUS", settings: DEFAULT_STATUS },
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

async function createBoardFromTemplate(workspaceId, createdById, template) {
  return prisma.$transaction(async (tx) => {
    const board = await tx.opsBoard.create({
      data: {
        workspaceId,
        name: template.name,
        description: template.description,
        templateKey: template.key,
        createdById,
        members: { create: { userId: createdById, role: "OWNER" } },
        views: {
          create: [
            { name: "Table", type: "TABLE", sortOrder: 0 },
            { name: "Kanban", type: "KANBAN", sortOrder: 1 },
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
          settings: col.settings || undefined,
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
            createdById,
          },
        });
      }
    }
    return board;
  });
}

async function main() {
  for (const row of CHECKLIST) {
    await prisma.opsChecklistItem.upsert({
      where: {
        period_dayKey_title: {
          period: row.period,
          dayKey: row.dayKey,
          title: row.title,
        },
      },
      create: row,
      update: { sortOrder: row.sortOrder },
    });
  }
  console.log(`Seeded ${CHECKLIST.length} checklist items`);

  const admin =
    (await prisma.user.findFirst({ where: { email: "info@000-it.com" } })) ||
    (await prisma.user.findFirst({ where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } } }));

  if (!admin) {
    console.log("No admin user found — skipped board templates");
    return;
  }

  let workspace = await prisma.opsWorkspace.findFirst({
    where: { createdById: admin.id },
    orderBy: { createdAt: "asc" },
  });
  if (!workspace) {
    workspace = await prisma.opsWorkspace.create({
      data: {
        name: "Main workspace",
        description: "Default CRM Work OS workspace",
        createdById: admin.id,
      },
    });
  }

  for (const template of TEMPLATES) {
    const exists = await prisma.opsBoard.findFirst({
      where: { workspaceId: workspace.id, templateKey: template.key },
    });
    if (exists) {
      console.log(`Board ${template.key} already exists`);
      continue;
    }
    await createBoardFromTemplate(workspace.id, admin.id, template);
    console.log(`Created board: ${template.name}`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

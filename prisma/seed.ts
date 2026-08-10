import { PrismaClient, AgentStatus, AgentType, ProjectStatus, ProjectType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Admin123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@000-it.com" },
    update: {},
    create: {
      email: "admin@000-it.com",
      name: "TripleZero Admin",
      password,
      role: "ADMIN",
      companyName: "TripleZero iT",
      companySize: "1-10",
      industry: "Technology",
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "seed-project-growth" },
    update: {},
    create: {
      id: "seed-project-growth",
      name: "Growth Sprint Alpha",
      description: "AI-driven growth program for launch clients.",
      status: ProjectStatus.ACTIVE,
      type: ProjectType.FULL_GROWTH,
      budget: 999,
      startDate: new Date(),
      progress: 42,
      userId: admin.id,
    },
  });

  await prisma.client.upsert({
    where: { id: "seed-client-1" },
    update: {},
    create: {
      id: "seed-client-1",
      name: "Nova Retail",
      email: "hello@novaretail.example",
      company: "Nova Retail BV",
      industry: "E-commerce",
      status: "ACTIVE",
      projectId: project.id,
      userId: admin.id,
      notes: "Seed client for dashboard demos.",
    },
  });

  const agents = [
    { id: "seed-agent-seo", name: "SEOPilot", type: AgentType.SEO_AGENT, status: AgentStatus.RUNNING },
    { id: "seed-agent-content", name: "PixelForge", type: AgentType.CONTENT_AGENT, status: AgentStatus.IDLE },
    { id: "seed-agent-social", name: "SocialPulse", type: AgentType.SOCIAL_AGENT, status: AgentStatus.PAUSED },
    { id: "seed-agent-ads", name: "AdsNinja", type: AgentType.ADS_AGENT, status: AgentStatus.RUNNING },
  ] as const;

  for (const agent of agents) {
    await prisma.aIAgent.upsert({
      where: { id: agent.id },
      update: { status: agent.status },
      create: {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        status: agent.status,
        projectId: project.id,
        userId: admin.id,
        configuration: { mode: "demo" },
        tasksCompleted: Math.floor(Math.random() * 20),
        lastActive: new Date(),
      },
    });
  }

  await prisma.task.createMany({
    data: [
      {
        title: "Technical SEO crawl",
        status: "IN_PROGRESS",
        priority: "HIGH",
        projectId: project.id,
        assignedAgentId: "seed-agent-seo",
      },
      {
        title: "Draft launch nieuws posts",
        status: "PENDING",
        priority: "MEDIUM",
        projectId: project.id,
        assignedAgentId: "seed-agent-content",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.activity.create({
    data: {
      type: "PROJECT_CREATED",
      description: "Growth Sprint Alpha project created",
      projectId: project.id,
      userId: admin.id,
    },
  });

  await prisma.portfolioProject.upsert({
    where: { slug: "nova-retail-growth" },
    update: {},
    create: {
      title: "Nova Retail Growth Platform",
      slug: "nova-retail-growth",
      summary: "Full-funnel AI growth system with SEO, content agents and conversion redesign.",
      description:
        "We rebuilt Nova Retail’s acquisition stack with AI-assisted content, technical SEO and paid media orchestration.\n\nResults included stronger organic visibility and higher lead quality across campaigns.",
      coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
        "https://images.unsplash.com/photo-1553877522-43299b0330d1?w=1200&q=80",
      ],
      projectUrl: "https://000-it.com",
      clientName: "Nova Retail",
      industry: "E-commerce",
      year: 2026,
      tags: ["SEO", "AI", "CRO"],
      technologies: ["Next.js", "MariaDB", "OpenAI"],
      featured: true,
      published: true,
      sortOrder: 1,
    },
  });

  await prisma.portfolioProject.upsert({
    where: { slug: "blueharbor-ads" },
    update: {},
    create: {
      title: "BlueHarbor Ads Engine",
      slug: "blueharbor-ads",
      summary: "AI-optimized Google and Meta campaigns that reduced CAC by a third.",
      description:
        "An always-on ads optimization layer with creative testing, bidding rules and weekly reporting for logistics lead gen.",
      coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80",
      gallery: [],
      projectUrl: "https://000-it.com/nl/diensten",
      clientName: "BlueHarbor Logistics",
      industry: "Logistics",
      year: 2025,
      tags: ["Ads", "Automation"],
      technologies: ["Google Ads", "Meta Ads", "Looker"],
      featured: false,
      published: true,
      sortOrder: 2,
    },
  });

  console.log("Seed complete. Admin: admin@000-it.com / Admin123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

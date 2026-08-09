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
        title: "Draft launch blog posts",
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

import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

function seedPassword(envKey: string, localFallback: string) {
  const fromEnv = process.env[envKey]?.trim();
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "1") {
    throw new Error(
      `Refusing demo seed passwords in production. Set ${envKey} (and other SEED_*_PASSWORD vars) or ALLOW_DEMO_SEED=1 for a controlled demo.`,
    );
  }

  return localFallback;
}

async function main() {
  const password = await bcrypt.hash(
    seedPassword("SEED_ADMIN_PASSWORD", "Admin123!"),
    12,
  );
  const superPassword = await bcrypt.hash(
    seedPassword("SEED_SUPER_PASSWORD", "Super123!"),
    12,
  );
  const managerPassword = await bcrypt.hash(
    seedPassword("SEED_MANAGER_PASSWORD", "Manager123!"),
    12,
  );
  const clientPassword = await bcrypt.hash(
    seedPassword("SEED_CLIENT_PASSWORD", "Client123!"),
    12,
  );

  const SUPER_ADMIN_EMAIL = "info@000-it.com";

  // Canonical SUPER_ADMIN — exactly one; only this account may delete content
  const superAdmin = await prisma.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: { role: "SUPER_ADMIN", password: superPassword, name: "TripleZero Super Admin" },
    create: {
      email: SUPER_ADMIN_EMAIL,
      name: "TripleZero Super Admin",
      password: superPassword,
      role: "SUPER_ADMIN",
      companyName: "TripleZero iT",
      companySize: "1-10",
      industry: "Technology",
    },
  });

  // Enforce single SUPER_ADMIN: demote any other account that still has the role
  await prisma.user.updateMany({
    where: {
      role: "SUPER_ADMIN",
      email: { not: SUPER_ADMIN_EMAIL },
    },
    data: { role: "ADMIN" },
  });

  // Legacy demo email: keep as ADMIN if present
  await prisma.user
    .upsert({
      where: { email: "super@000-it.com" },
      update: { role: "ADMIN", password, name: "Legacy Admin" },
      create: {
        email: "super@000-it.com",
        name: "Legacy Admin",
        password,
        role: "ADMIN",
        companyName: "TripleZero iT",
        companySize: "1-10",
        industry: "Technology",
      },
    })
    .catch(() => null);

  const admin = await prisma.user.upsert({
    where: { email: "admin@000-it.com" },
    update: { role: "ADMIN", password },
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

  const manager = await prisma.user.upsert({
    where: { email: "manager@000-it.com" },
    update: { role: "MANAGER", password: managerPassword },
    create: {
      email: "manager@000-it.com",
      name: "TripleZero Manager",
      password: managerPassword,
      role: "MANAGER",
      companyName: "TripleZero iT",
      companySize: "1-10",
      industry: "Technology",
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { email: "client@000-it.com" },
    update: { role: "CLIENT", password: clientPassword },
    create: {
      email: "client@000-it.com",
      name: "Demo Client",
      password: clientPassword,
      role: "CLIENT",
      companyName: "Nova Retail BV",
      companySize: "11-50",
      industry: "E-commerce",
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "seed-project-growth" },
    update: {},
    create: {
      id: "seed-project-growth",
      name: "Growth Sprint Alpha",
      description: "AI-driven growth program for launch clients.",
      status: "ACTIVE",
      type: "FULL_GROWTH",
      budget: 999,
      startDate: new Date(),
      progress: 42,
      userId: admin.id,
    },
  });

  await prisma.project.upsert({
    where: { id: "seed-project-manager" },
    update: { userId: manager.id },
    create: {
      id: "seed-project-manager",
      name: "Manager Pipeline",
      description: "Manager-owned demo project.",
      status: "ACTIVE",
      type: "CONTENT",
      budget: 399,
      startDate: new Date(),
      progress: 28,
      userId: manager.id,
    },
  });

  await prisma.project.upsert({
    where: { id: "seed-project-client" },
    update: {},
    create: {
      id: "seed-project-client",
      name: "Nova Retail Growth",
      description: "Client portal demo project.",
      status: "ACTIVE",
      type: "SEO",
      budget: 499,
      startDate: new Date(),
      progress: 65,
      userId: clientUser.id,
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

  await prisma.client.upsert({
    where: { id: "seed-client-manager" },
    update: { userId: manager.id },
    create: {
      id: "seed-client-manager",
      name: "Harbor Studio",
      email: "hello@harbor.example",
      company: "Harbor Studio",
      industry: "Creative",
      status: "LEAD",
      userId: manager.id,
      notes: "Manager-owned lead.",
    },
  });

  const agents = [
    { id: "seed-agent-seo", name: "SEOPilot", type: "SEO_AGENT" as const, status: "RUNNING" as const },
    { id: "seed-agent-content", name: "PixelForge", type: "CONTENT_AGENT" as const, status: "IDLE" as const },
    { id: "seed-agent-social", name: "SocialPulse", type: "SOCIAL_AGENT" as const, status: "PAUSED" as const },
    { id: "seed-agent-ads", name: "AdsNinja", type: "ADS_AGENT" as const, status: "RUNNING" as const },
  ];

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

  await prisma.aIAgent.upsert({
    where: { id: "seed-agent-client" },
    update: { userId: clientUser.id },
    create: {
      id: "seed-agent-client",
      name: "Client SEO Watch",
      type: "SEO_AGENT",
      status: "RUNNING",
      projectId: "seed-project-client",
      userId: clientUser.id,
      configuration: { mode: "client" },
      tasksCompleted: 8,
      lastActive: new Date(),
    },
  });

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
    update: {
      title: "Nova Retail Growth Platform",
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
      createdById: superAdmin.id,
    },
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
      createdById: superAdmin.id,
    },
  });

  await prisma.portfolioProject.upsert({
    where: { slug: "blueharbor-ads" },
    update: {
      title: "BlueHarbor Ads Engine",
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
      createdById: admin.id,
    },
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
      createdById: admin.id,
    },
  });

  // --- Marketing content: nieuws (exact migration from former JSON) ---
  const newsItems = [
    {
      id: "aeo-2026",
      title: "What is AEO in 2026?",
      excerpt: "How brands win visibility inside AI answer engines.",
      date: "2026-07-12",
      coverImage: "/uploads/nieuws/aeo-2026.png",
      author: "TripleZero iT",
      projectUrl: "https://000-it.com/nl/diensten/seo-optimization",
      industry: "AEO",
      tags: ["AEO", "SEO", "AI Search"],
      description:
        "Answer Engine Optimization (AEO) is how brands earn visibility inside AI systems that answer questions directly — ChatGPT, Gemini, Perplexity and Google AI Overviews.\n\nIn 2026, rankings alone are not enough. You need clear entities, trustworthy sources, structured content and pages that models can cite with confidence.\n\nThis article covers the practical AEO stack we use for clients: topic authority, FAQ systems, schema, and measurement beyond classic organic traffic.",
    },
    {
      id: "geo",
      title: "GEO: Generative Engine Optimization",
      excerpt: "Practical tactics to show up in ChatGPT and Gemini answers.",
      date: "2026-06-28",
      coverImage: "/uploads/nieuws/geo.png",
      author: "TripleZero iT",
      projectUrl: "https://000-it.com/nl/diensten",
      industry: "GEO",
      tags: ["GEO", "ChatGPT", "Gemini"],
      description:
        "Generative Engine Optimization (GEO) focuses on being selected and quoted by generative models when users ask commercial questions.\n\nWinning tactics include original data, crisp definitions, comparison tables, and content that resolves intent in the first screen.\n\nWe share a field-tested checklist used across Dutch scale-ups to improve mention rate in AI answers without sacrificing classic SEO.",
    },
    {
      id: "ai-agent-stack",
      title: "Building an AI agent stack",
      excerpt: "From SEOPilot to AdsNinja — orchestration patterns that work.",
      date: "2026-05-03",
      coverImage: "/uploads/nieuws/ai-agents.png",
      author: "TripleZero iT",
      projectUrl: "https://000-it.com/nl/ai-scan",
      industry: "AI Agents",
      tags: ["Agents", "Automation", "Ops"],
      description:
        "An AI agent stack is not one chatbot — it is a coordinated set of specialists: research, SEO, content, ads and reporting agents with clear handoffs.\n\nIn this post we unpack orchestration patterns that stay reliable in production: shared memory, human approval gates, and KPI loops.\n\nLearn how teams combine SEOPilot-style agents with AdsNinja workflows without creating chaos or hallucinated campaigns.",
    },
  ] as const;

  for (const item of newsItems) {
    await prisma.newsPost.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        excerpt: item.excerpt,
        date: item.date,
        coverImage: item.coverImage,
        author: item.author,
        projectUrl: item.projectUrl,
        industry: item.industry,
        tags: [...item.tags],
        description: item.description,
        published: true,
        createdById: superAdmin.id,
      },
      create: {
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        date: item.date,
        coverImage: item.coverImage,
        author: item.author,
        projectUrl: item.projectUrl,
        industry: item.industry,
        tags: [...item.tags],
        description: item.description,
        published: true,
        createdById: superAdmin.id,
      },
    });
  }

  // --- Marketing content: case studies (exact migration from former JSON) ---
  const caseItems = [
    {
      id: "nova-retail",
      title: "Nova Retail",
      industry: "E-commerce",
      metric: "+148% organic traffic",
      summary: "SEO + AEO program with AI content agents.",
      description:
        "Nova Retail needed sustainable organic growth without scaling a large content team. We built an AI-assisted SEO and AEO system: technical fixes, topical clusters, content agents for drafts, and conversion-focused landing pages.\n\nWithin months organic traffic more than doubled and AI-search visibility improved for high-intent product queries.",
      clientName: "Nova Retail",
      projectUrl: "https://000-it.com",
      coverImage: "/uploads/case-studies/nova-retail.png",
      gallery: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
        "https://images.unsplash.com/photo-1553877522-43299b0330d1?w=1200&q=80",
      ],
      year: 2026,
      tags: ["SEO", "AEO", "AI"],
      technologies: ["Next.js", "OpenAI", "Search Console", "GA4"],
    },
    {
      id: "blueharbor-logistics",
      title: "BlueHarbor Logistics",
      industry: "Logistics",
      metric: "-32% CAC",
      summary: "AI ads optimization across Google and Meta.",
      description:
        "BlueHarbor struggled with rising CAC on Google and Meta. We introduced an always-on optimization layer: creative testing, bidding rules, audience pruning and weekly insight loops.\n\nCampaign efficiency improved quickly, cutting customer acquisition cost by about a third while protecting lead volume.",
      clientName: "BlueHarbor Logistics",
      projectUrl: "https://000-it.com/nl/diensten",
      coverImage: "/uploads/case-studies/blueharbor.png",
      gallery: ["https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80"],
      year: 2025,
      tags: ["Ads", "Automation"],
      technologies: ["Google Ads", "Meta Ads", "Looker Studio"],
    },
    {
      id: "studio-meridian",
      title: "Studio Meridian",
      industry: "Services",
      metric: "3.1x lead quality",
      summary: "Full-growth stack with chatbot and conversion redesign.",
      description:
        "Studio Meridian had plenty of traffic but weak lead quality. We redesigned key conversion paths, added an AI chatbot for qualification, and aligned content with intent stages.\n\nSales received fewer but far better leads — lead quality improved more than 3x and close rates followed.",
      clientName: "Studio Meridian",
      projectUrl: "https://000-it.com/nl/contact",
      coverImage: "/uploads/case-studies/studio-meridian.png",
      gallery: [
        "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80",
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80",
      ],
      year: 2025,
      tags: ["CRO", "Chatbot", "Growth"],
      technologies: ["Next.js", "OpenAI", "HubSpot"],
    },
  ] as const;

  for (const item of caseItems) {
    await prisma.caseStudy.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        industry: item.industry,
        metric: item.metric,
        summary: item.summary,
        description: item.description,
        clientName: item.clientName,
        projectUrl: item.projectUrl,
        coverImage: item.coverImage,
        gallery: [...item.gallery],
        year: item.year,
        tags: [...item.tags],
        technologies: [...item.technologies],
        published: true,
        createdById: superAdmin.id,
      },
      create: {
        id: item.id,
        title: item.title,
        industry: item.industry,
        metric: item.metric,
        summary: item.summary,
        description: item.description,
        clientName: item.clientName,
        projectUrl: item.projectUrl,
        coverImage: item.coverImage,
        gallery: [...item.gallery],
        year: item.year,
        tags: [...item.tags],
        technologies: [...item.technologies],
        published: true,
        createdById: superAdmin.id,
      },
    });
  }

  console.log("Seed complete. Accounts + real marketing content in DB:");
  console.log("  SUPER_ADMIN  info@000-it.com / Super123!  (only one; local demo password)");
  console.log("  ADMIN        admin@000-it.com / Admin123!");
  console.log("  MANAGER      manager@000-it.com / Manager123!");
  console.log("  CLIENT       client@000-it.com / Client123!");
  console.log("  News posts:", newsItems.length, "| Case studies:", caseItems.length, "| Portfolio: 2");
  if (process.env.NODE_ENV === "production") {
    console.log("  (Production seed: ensure SEED_*_PASSWORD values are strong and rotated.)");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { newsCoverForPost } from "../src/lib/auto-news/cover-image";

const seedDir = dirname(fileURLToPath(import.meta.url));

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
    update: { role: "SUPER_ADMIN", password: superPassword, name: "000" },
    create: {
      email: SUPER_ADMIN_EMAIL,
      name: "000",
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
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
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
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
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
      year: 2026,
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
      year: 2026,
      tags: ["Ads", "Automation"],
      technologies: ["Google Ads", "Meta Ads", "Looker"],
      featured: false,
      published: true,
      sortOrder: 2,
      createdById: admin.id,
    },
  });

  // --- Marketing content: nieuws (real Jun–Aug 2026 industry news, EN + NL) ---
  const newsItems = [
    {
      id: "gpt-56-microsoft-365-copilot",
      title: "GPT-5.6 becomes the preferred model in Microsoft 365 Copilot",
      titleNl: "GPT-5.6 wordt het voorkeursmodel in Microsoft 365 Copilot",
      excerpt:
        "On 9 July 2026 OpenAI’s GPT-5.6 family became the preferred model across Word, Excel, PowerPoint, Chat and Cowork.",
      excerptNl:
        "Op 9 juli 2026 werd OpenAI’s GPT-5.6-familie het voorkeursmodel in Word, Excel, PowerPoint, Chat en Cowork.",
      date: "2026-07-09",
      coverImage:
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80",
      author: "TripleZero iT",
      projectUrl: "https://openai.com/index/gpt-5-6-preferred-model-microsoft-365-copilot/",
      industry: "AI / Productivity",
      tags: ["GPT-5.6", "Microsoft 365", "Copilot", "OpenAI"],
      description:
        "On 9 July 2026, OpenAI announced that GPT-5.6 is the new preferred model in Microsoft 365 Copilot — across Word, Excel, PowerPoint, Copilot Chat and Cowork.\n\nGPT-5.6 is not a single model. It is OpenAI’s flagship series with three tiers: Sol (highest capability), Terra (balanced everyday work) and Luna (fastest and most affordable). The goal is more useful output per token, with stronger performance per dollar and on-demand depth for complex tasks.\n\nMicrosoft’s Nitin Agrawal, President of Copilot & Agents Core, said customers will be able to produce more polished documents, analyses and presentations with OpenAI’s latest models in the tools they already use. OpenAI’s Nikunj Handa similarly framed Microsoft 365 as where millions of people write, analyse and collaborate every day.\n\nFor Dutch and international businesses, the practical takeaway is clear: enterprise AI is consolidating inside the productivity suite. Teams should plan prompts, governance and document workflows around Copilot’s new defaults — and verify which capability tier (quick vs deeper reasoning) their tenant actually exposes.",
      descriptionNl:
        "Op 9 juli 2026 kondigde OpenAI aan dat GPT-5.6 het nieuwe voorkeursmodel is in Microsoft 365 Copilot — in Word, Excel, PowerPoint, Copilot Chat en Cowork.\n\nGPT-5.6 is geen enkel model, maar OpenAI’s vlaggenschipreeks met drie niveaus: Sol (hoogste capaciteit), Terra (gebalanceerd voor dagelijks werk) en Luna (snelst en voordeligst). Het doel is nuttiger output per token, sterkere prestaties per dollar en diepere redenering wanneer complexe taken dat vragen.\n\nNitin Agrawal, President van Copilot & Agents Core bij Microsoft, zei dat klanten meer verzorgde documenten, analyses en presentaties kunnen maken met de nieuwste OpenAI-modellen in tools die ze al gebruiken. Nikunj Handa van OpenAI noemde Microsoft 365 de plek waar miljoenen mensen elke dag schrijven, analyseren en samenwerken.\n\nVoor Nederlandse en internationale organisaties is de boodschap duidelijk: enterprise-AI schuift verder de productiviteitssuite in. Teams moeten prompts, governance en documentworkflows afstemmen op de nieuwe Copilot-standaarden — en controleren welk capaciteitsniveau (snel vs diepere redenering) hun tenant echt beschikbaar stelt.",
    },
    {
      id: "gpt-56-price-performance-july-2026",
      title: "OpenAI cuts GPT-5.6 Terra and Luna prices — Fast mode for Sol",
      titleNl: "OpenAI verlaagt prijzen van GPT-5.6 Terra en Luna — Fast mode voor Sol",
      excerpt:
        "From 30 July 2026 Luna costs 80% less and Terra 20% less; Sol Fast mode reaches up to 2.5× speed in the API.",
      excerptNl:
        "Vanaf 30 juli 2026 is Luna 80% goedkoper en Terra 20%; Sol Fast mode haalt tot 2,5× snelheid in de API.",
      date: "2026-07-30",
      coverImage:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
      author: "TripleZero iT",
      projectUrl: "https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/",
      industry: "AI / Pricing",
      tags: ["GPT-5.6", "API pricing", "Luna", "Terra", "Sol"],
      description:
        "On 30 July 2026 OpenAI published “Advancing the price-performance frontier with GPT-5.6”, passing runtime efficiency gains on to customers.\n\nKey facts from the announcement:\n\n• GPT-5.6 Luna (fastest / most affordable) costs 80% less.\n• GPT-5.6 Terra (balanced everyday work) costs 20% less.\n• New API list prices (per 1M tokens): Terra $2 input / $12 output; Luna $0.20 input / $1.20 output. Sol pricing stayed unchanged.\n• Fast mode for GPT-5.6 Sol in the API replaces Priority Processing and delivers up to 2.5× Standard speed at 2× Standard price, without changing model intelligence.\n• ChatGPT and Codex subscription prices stayed the same, while Terra and Luna usage consumes fewer credits.\n\nOpenAI also noted earlier efficiency work: roughly 20% lower serving costs via GPU kernel improvements and more than 15% better token-generation efficiency through speculative decoding.\n\nFor agencies and product teams, this shifts the build-vs-buy math. High-volume agents, content pipelines and support bots that were marginal on older pricing become practical on Luna — while Sol Fast mode is the lever when latency matters more than unit cost.",
      descriptionNl:
        "Op 30 juli 2026 publiceerde OpenAI “Advancing the price-performance frontier with GPT-5.6” en gaf runtime-efficiëntiewinsten door aan klanten.\n\nBelangrijkste feiten uit de aankondiging:\n\n• GPT-5.6 Luna (snelst / voordeligst) is 80% goedkoper.\n• GPT-5.6 Terra (gebalanceerd voor dagelijks werk) is 20% goedkoper.\n• Nieuwe API-lijstprijzen (per 1M tokens): Terra $2 input / $12 output; Luna $0,20 input / $1,20 output. De Sol-prijs bleef gelijk.\n• Fast mode voor GPT-5.6 Sol in de API vervangt Priority Processing en levert tot 2,5× de Standard-snelheid tegen 2× de Standard-prijs, zonder de intelligentie van het model te wijzigen.\n• Abonnementsprijzen van ChatGPT en Codex bleven gelijk, terwijl Terra- en Luna-gebruik minder credits verbruikt.\n\nOpenAI noemde eerder ook efficiëntiewerk: ongeveer 20% lagere servingkosten via GPU-kernelverbeteringen en meer dan 15% betere token-generatie-efficiëntie via speculative decoding.\n\nVoor agencies en productteams verandert dit de build-vs-buy-rekensom. High-volume agents, contentpipelines en supportbots die eerder net niet uitkwamen, worden haalbaar op Luna — terwijl Sol Fast mode de knop is wanneer latency zwaarder weegt dan stukprijs.",
    },
    {
      id: "chatgpt-gpt56-sol-luna-august-2026",
      title: "ChatGPT updates GPT-5.6 Sol — Luna expands for Free users",
      titleNl: "ChatGPT vernieuwt GPT-5.6 Sol — Luna uitgebreid voor Free-gebruikers",
      excerpt:
        "On 6 August 2026 OpenAI made Sol more factual for paid users and set Luna as the Free default with unlimited text chats.",
      excerptNl:
        "Op 6 augustus 2026 maakte OpenAI Sol feitelijker voor betaalde gebruikers en werd Luna de Free-standaard met onbeperkte tekstchats.",
      date: "2026-08-06",
      coverImage:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
      author: "TripleZero iT",
      projectUrl: "https://openai.com/index/improving-gpt-5-6-sol-in-chatgpt/",
      industry: "AI / ChatGPT",
      tags: ["ChatGPT", "GPT-5.6 Sol", "GPT-5.6 Luna", "OpenAI"],
      description:
        "On 6 August 2026 OpenAI announced ChatGPT updates that improve everyday conversations and expand Free access.\n\nFor Plus and Pro users, GPT-5.6 Sol in Chat was updated to be more reliable with facts and more focused. A new slider lets users choose how much thought ChatGPT puts into each response.\n\nFor Free users, the default model becomes GPT-5.6 Luna, with unlimited text chats rolling out. A new Think button gives Free users higher reasoning for harder questions (still subject to abuse guardrails). Limits remain for file uploads, images and other tools.\n\nOpenAI shared an internal evaluation on financial, medical and legal prompts that need factual detail: responses with at least one factual error were about 62% less common with GPT-5.6 Luna and 68% less common with GPT-5.6 Sol than with GPT-5.5 Instant.\n\nFor Dutch SMEs and marketing teams, this matters for two reasons. First, free-tier research and drafting quality jumps with Luna as default. Second, paid Sol users get clearer control over depth vs speed — useful when publishing customer-facing copy that must stay accurate.",
      descriptionNl:
        "Op 6 augustus 2026 kondigde OpenAI ChatGPT-updates aan die alledaagse gesprekken verbeteren en Free-toegang uitbreiden.\n\nVoor Plus- en Pro-gebruikers is GPT-5.6 Sol in Chat bijgewerkt om betrouwbaarder met feiten om te gaan en gerichter te antwoorden. Een nieuwe schuifregelaar laat gebruikers kiezen hoeveel nadenktijd ChatGPT per antwoord krijgt.\n\nVoor Free-gebruikers wordt GPT-5.6 Luna het standaardmodel, met onbeperkte tekstchats in uitrol. Een nieuwe Think-knop geeft Free-gebruikers diepere redenering voor moeilijkere vragen (nog steeds met anti-misbruiklimieten). Limieten blijven gelden voor bestanduploads, afbeeldingen en andere tools.\n\nOpenAI deelde een interne evaluatie op financiële, medische en juridische prompts die feitelijke details vragen: antwoorden met minstens één feitelijke fout kwamen ongeveer 62% minder vaak voor met GPT-5.6 Luna en 68% minder vaak met GPT-5.6 Sol dan met GPT-5.5 Instant.\n\nVoor Nederlandse mkb’ers en marketingteams telt dit om twee redenen. Ten eerste stijgt de kwaliteit van research en drafts op de gratis laag doordat Luna standaard wordt. Ten tweede krijgen betaalde Sol-gebruikers duidelijkere controle over diepte vs snelheid — handig wanneer klantgerichte teksten feitelijk correct moeten blijven.",
    },
  ] as const;

  // Remove previous demo posts so /nieuws only shows the new set
  await prisma.newsPost.deleteMany({
    where: {
      id: {
        in: ["aeo-2026", "geo", "ai-agent-stack"],
      },
    },
  });

  for (const item of newsItems) {
    const coverImage = newsCoverForPost({
      id: item.id,
      title: item.title,
      industry: item.industry,
      tags: [...item.tags],
      excerpt: item.excerpt,
    });
    await prisma.newsPost.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        titleNl: item.titleNl,
        excerpt: item.excerpt,
        excerptNl: item.excerptNl,
        date: item.date,
        coverImage,
        author: item.author,
        projectUrl: item.projectUrl,
        industry: item.industry,
        tags: [...item.tags],
        description: item.description,
        descriptionNl: item.descriptionNl,
        published: true,
        createdById: superAdmin.id,
      },
      create: {
        id: item.id,
        title: item.title,
        titleNl: item.titleNl,
        excerpt: item.excerpt,
        excerptNl: item.excerptNl,
        date: item.date,
        coverImage,
        author: item.author,
        projectUrl: item.projectUrl,
        industry: item.industry,
        tags: [...item.tags],
        description: item.description,
        descriptionNl: item.descriptionNl,
        published: true,
        createdById: superAdmin.id,
      },
    });
  }

  // Extra bilingual AI news (Jan–Aug 2026) from prisma/data/news-batch-*.json
  const newsDataDir = join(seedDir, "data");
  const batchFiles = readdirSync(newsDataDir)
    .filter((f) => /^news-batch-\d+\.json$/.test(f))
    .sort();
  for (const file of batchFiles) {
    const batch = JSON.parse(readFileSync(join(newsDataDir, file), "utf8")) as Array<{
      id: string;
      title: string;
      titleNl: string;
      excerpt: string;
      excerptNl: string;
      date: string;
      coverImage: string;
      author: string;
      projectUrl: string;
      industry: string;
      tags: string[];
      description: string;
      descriptionNl: string;
    }>;
    for (const item of batch) {
      const coverImage = newsCoverForPost({
        id: item.id,
        title: item.title,
        industry: item.industry,
        tags: item.tags,
        excerpt: item.excerpt,
      });
      await prisma.newsPost.upsert({
        where: { id: item.id },
        update: {
          title: item.title,
          titleNl: item.titleNl,
          excerpt: item.excerpt,
          excerptNl: item.excerptNl,
          date: item.date,
          coverImage,
          author: item.author || "TripleZero iT",
          projectUrl: item.projectUrl,
          industry: item.industry,
          tags: item.tags,
          description: item.description,
          descriptionNl: item.descriptionNl,
          published: true,
          createdById: superAdmin.id,
        },
        create: {
          id: item.id,
          title: item.title,
          titleNl: item.titleNl,
          excerpt: item.excerpt,
          excerptNl: item.excerptNl,
          date: item.date,
          coverImage,
          author: item.author || "TripleZero iT",
          projectUrl: item.projectUrl,
          industry: item.industry,
          tags: item.tags,
          description: item.description,
          descriptionNl: item.descriptionNl,
          published: true,
          createdById: superAdmin.id,
        },
      });
    }
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
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
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
      year: 2026,
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

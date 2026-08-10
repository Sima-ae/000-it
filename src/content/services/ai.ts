type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

type CustomService = {
  title: string;
  titleNl: string;
  subtitle: string;
  subtitleNl: string;
  image?: string | null;
  price?: number | null;
  blocks: ContentBlock[];
  blocksNl: ContentBlock[];
};

function p(text: string): ContentBlock {
  return { type: "paragraph", text };
}
function h(text: string): ContentBlock {
  return { type: "heading", text };
}
function l(items: string[]): ContentBlock {
  return { type: "list", items };
}

/** Full bilingual pages for every AI service in the catalog. */
export const aiCustomServices: Record<string, CustomService> = {
  "ai-scan": {
    title: "AI Scan",
    titleNl: "AI-scan",
    subtitle:
      "A structured readiness scan for classic search and AI answer engines — SEO, AEO, GEO and technical foundations in one clear scorecard.",
    subtitleNl:
      "Een gestructureerde readiness-scan voor klassieke zoekmachines én AI-antwoorden — SEO, AEO, GEO en technische basis in één duidelijke scorekaart.",
    image: "/uploads/fixweb/ai-integratie.png",
    blocks: [
      h("What the AI Scan evaluates"),
      p(
        "Search is no longer only ten blue links. Your brand must also be understandable to answer engines and generative systems. The TripleZero iT AI Scan measures how ready your site is for that shift — and what to fix first.",
      ),
      l([
        "SEO fundamentals: titles, structure, crawlability and on-page clarity",
        "AEO signals: answer-ready content, FAQ patterns and entity clarity",
        "GEO readiness: how well generative engines can cite and summarize you",
        "Technical indicators: performance, mobile UX and structural hygiene",
        "Prioritized actions with business impact, not vanity metrics",
      ]),
      h("What you receive"),
      l([
        "A scored overview across SEO, AEO, GEO and AI readiness",
        "Concrete improvement backlog ordered by impact",
        "Clear language for marketers and developers alike",
        "Optional follow-up proposal to execute the fixes",
      ]),
      h("Ideal for"),
      l([
        "Brands launching or redesigning a website",
        "Teams investing in content or paid acquisition",
        "Agencies that need a fast client baseline",
        "Leadership that wants AI visibility without guesswork",
      ]),
      h("How to start"),
      p(
        "Run the free scan on your URL, then book a review if you want us to turn findings into a sprint plan. Many clients combine the scan with AEO/GEO optimization or an AI content retainer.",
      ),
    ],
    blocksNl: [
      h("Wat de AI-scan beoordeelt"),
      p(
        "Zoeken is niet meer alleen tien blauwe links. Uw merk moet ook begrijpelijk zijn voor antwoordenengines en generatieve systemen. De TripleZero iT AI-scan meet hoe klaar uw site is voor die verschuiving — en wat u eerst moet fixen.",
      ),
      l([
        "SEO-fundamentals: titles, structuur, crawlbaarheid en on-page duidelijkheid",
        "AEO-signalen: antwoordklare content, FAQ-patronen en entity-clarity",
        "GEO-readiness: hoe goed generatieve engines u kunnen citeren en samenvatten",
        "Technische indicatoren: performance, mobile UX en structurele hygiëne",
        "Geprioriteerde acties met business-impact, geen vanity metrics",
      ]),
      h("Wat u krijgt"),
      l([
        "Een score-overzicht over SEO, AEO, GEO en AI-readiness",
        "Concrete verbeterbacklog op impact gesorteerd",
        "Duidelijke taal voor marketeers én developers",
        "Optioneel vervolgvoorstel om fixes uit te voeren",
      ]),
      h("Ideaal voor"),
      l([
        "Merken die een site lanceren of herontwerpen",
        "Teams die investeren in content of paid acquisition",
        "Bureaus die snel een baseline voor klanten nodig hebben",
        "Management dat AI-zichtbaarheid wil zonder giswerk",
      ]),
      h("Aan de slag"),
      p(
        "Start de gratis scan op uw URL en plan desgewenst een review. Veel klanten combineren de scan met AEO/GEO-optimalisatie of een AI-content-retainer.",
      ),
    ],
  },

  "aeo-optimization": {
    title: "AEO Optimization",
    titleNl: "AEO optimalisatie",
    subtitle:
      "Answer Engine Optimization so your brand shows up in AI answers — clear, citable and trusted, aligned with SEO and GEO.",
    subtitleNl:
      "Answer engine optimization zodat uw merk verschijnt in AI-antwoorden — helder, citeerbaar en betrouwbaar, afgestemd op SEO en GEO.",
    image: "/uploads/fixweb/aeo-seo.png",
    blocks: [
      h("Why AEO matters"),
      p(
        "Users increasingly ask AI systems for recommendations, comparisons and how-tos. If your pages are not structured for answers, you lose visibility even when classic rankings look fine.",
      ),
      h("What we optimize"),
      l([
        "Question–answer content architecture and FAQ blocks",
        "Entity clarity: who you are, what you offer, where you operate",
        "Structured data and semantic headings that support extraction",
        "Evidence, sources and E-E-A-T signals AI systems prefer",
        "Internal linking that reinforces topical authority",
      ]),
      h("AEO with SEO and GEO"),
      p(
        "AEO works best when it is not a silo. We align answer-ready content with technical SEO health and GEO signals so classic rankings and AI answers reinforce each other — one backlog, shared priorities and shared measurement.",
      ),
      l([
        "Intent research spanning classic and generative queries",
        "On-page upgrades that serve rankings and answer extraction",
        "Templates for service, product and hub pages",
        "Reporting that links organic + AI-assisted demand to leads",
      ]),
      h("Deliverables"),
      l([
        "AEO audit against your priority topics and competitors",
        "Content and template blueprint for answer-ready pages",
        "Implementation on WordPress, Next.js or your CMS",
        "Measurement framework for citations, branded queries and assisted traffic",
        "Optional 90-day execution plan after an AI Scan baseline",
      ]),
      h("Best paired with"),
      p(
        "GEO optimization, AI content strategy and a periodic AI Scan to track readiness as models and SERPs evolve.",
      ),
    ],
    blocksNl: [
      h("Waarom AEO telt"),
      p(
        "Gebruikers vragen AI-systemen steeds vaker om aanbevelingen, vergelijkingen en how-to’s. Als uw pagina’s niet als antwoorden zijn opgebouwd, verliest u zichtbaarheid — ook als klassieke rankings goed lijken.",
      ),
      h("Wat we optimaliseren"),
      l([
        "Vraag–antwoord contentarchitectuur en FAQ-blokken",
        "Entity-clarity: wie u bent, wat u biedt, waar u actief bent",
        "Structured data en semantische headings die extractie ondersteunen",
        "Bewijs, bronnen en E-E-A-T-signalen die AI-systemen prefereren",
        "Interne linking die topical authority versterkt",
      ]),
      h("AEO met SEO en GEO"),
      p(
        "AEO werkt het best wanneer het geen silo is. Wij stemmen antwoordklare content af op technische SEO-health en GEO-signalen zodat klassieke rankings en AI-antwoorden elkaar versterken — één backlog, gedeelde prioriteiten en gedeelde meting.",
      ),
      l([
        "Intent-onderzoek over klassieke én generatieve queries",
        "On-page upgrades die rankings én antwoordextractie dienen",
        "Templates voor dienst-, product- en hubpagina’s",
        "Rapportage die organische + AI-assisted vraag koppelt aan leads",
      ]),
      h("Opleveringen"),
      l([
        "AEO-audit op uw prioriteitsthema’s en concurrenten",
        "Content- en templateblueprint voor antwoordklare pagina’s",
        "Implementatie op WordPress, Next.js of uw CMS",
        "Meetkader voor citaties, branded queries en assisted traffic",
        "Optioneel 90-dagen uitvoeringsplan na een AI-scan baseline",
      ]),
      h("Sterk in combinatie met"),
      p(
        "GEO-optimalisatie, AI-contentstrategie en een periodieke AI-scan om readiness te volgen naarmate models en SERPs veranderen.",
      ),
    ],
  },

  "geo-optimization": {
    title: "GEO Optimization",
    titleNl: "GEO optimalisatie",
    subtitle:
      "Generative Engine Optimization to strengthen how AI systems summarize, recommend and cite your brand.",
    subtitleNl:
      "Generative engine optimization om te versterken hoe AI-systemen uw merk samenvatten, aanbevelen en citeren.",
    image: "/uploads/fixweb/aeo-seo.png",
    blocks: [
      h("GEO vs classic SEO"),
      p(
        "GEO focuses on generative search experiences: AI overviews, chat answers and multi-source summaries. We make your brand easier to trust, quote and place in those narratives.",
      ),
      h("Our GEO approach"),
      l([
        "Topic maps aligned to generative query patterns",
        "Authoritative pages with clear claims and supporting proof",
        "Consistent NAP / brand facts across the web where relevant",
        "Content formats that models can chunk and attribute",
        "Monitoring of brand mentions and competitive share of voice in AI answers",
      ]),
      h("Outcomes you can expect"),
      l([
        "Stronger presence in generative answers for priority intents",
        "Cleaner brand narrative when AI explains who you are",
        "Fewer incorrect or incomplete AI summaries about your offer",
        "A roadmap that stays useful as engines keep changing",
      ]),
      h("Engagement model"),
      p(
        "Start with audit + quick wins, then a monthly GEO retainer for content, technical tweaks and monitoring — or a fixed project for a launch or redesign.",
      ),
    ],
    blocksNl: [
      h("GEO vs klassieke SEO"),
      p(
        "GEO richt zich op generatieve zoekervaringen: AI-overviews, chatantwoorden en multi-bron samenvattingen. Wij maken uw merk makkelijker te vertrouwen, te citeren en te plaatsen in die verhalen.",
      ),
      h("Onze GEO-aanpak"),
      l([
        "Topic maps afgestemd op generatieve query-patronen",
        "Authoritatieve pagina’s met heldere claims en bewijs",
        "Consistente NAP- / merkfeiten online waar relevant",
        "Contentformats die models kunnen chunkken en attribuëren",
        "Monitoring van brand mentions en concurrentie in AI-antwoorden",
      ]),
      h("Resultaten die u mag verwachten"),
      l([
        "Sterkere aanwezigheid in generatieve antwoorden op prioriteitsintenties",
        "Schonere merkvertelling wanneer AI uitlegt wie u bent",
        "Minder incorrecte of incomplete AI-samenvattingen over uw aanbod",
        "Een roadmap die bruikbaar blijft terwijl engines blijven veranderen",
      ]),
      h("Samenwerkingsvorm"),
      p(
        "Start met audit + quick wins, daarna een maandelijkse GEO-retainer voor content, technische tweaks en monitoring — of een vast project bij launch of redesign.",
      ),
    ],
  },

  "ai-content-strategy": {
    title: "AI Content Strategy",
    titleNl: "AI contentstrategie",
    subtitle:
      "Human-led content systems accelerated by AI — on-brand, SEO/AEO-ready and measurable.",
    subtitleNl:
      "Mensgestuurde contentsystemen versneld met AI — on-brand, SEO/AEO-klaar en meetbaar.",
    image: "/uploads/fixweb/content-social.png",
    blocks: [
      h("AI that strengthens quality"),
      p(
        "We use AI to research, draft and scale — never to publish thin generic text. Every piece is edited for voice, accuracy, differentiation and conversion.",
      ),
      h("What we build"),
      l([
        "Editorial calendars tied to SEO/AEO topic clusters",
        "Brand voice guides and prompt libraries for your team",
        "Landing pages, blogs, FAQs and product copy at scale",
        "Review workflows with fact-check and compliance gates",
        "Performance loops: what ranks, what converts, what to retire",
      ]),
      h("Governance"),
      l([
        "Source requirements and claim standards",
        "Human approval before publish",
        "No duplicate or spun content across locales",
        "Clear ownership between marketing and subject-matter experts",
      ]),
      h("Packages"),
      p(
        "From a one-off content sprint to a monthly production retainer. Combine with Social Media or Ads when you need multi-channel reuse.",
      ),
    ],
    blocksNl: [
      h("AI die kwaliteit versterkt"),
      p(
        "We gebruiken AI om te researchen, te draften en te schalen — nooit om dunne generieke tekst te publiceren. Elk stuk wordt geredigeerd op tone of voice, juistheid, onderscheid en conversie.",
      ),
      h("Wat we bouwen"),
      l([
        "Redactionele kalenders gekoppeld aan SEO/AEO-topicclusters",
        "Merkstem-guides en promptbibliotheken voor uw team",
        "Landingspagina’s, blogs, FAQ’s en productcopy op schaal",
        "Review-workflows met factcheck en compliance-gates",
        "Performance-loops: wat rankt, wat converteert, wat stoppen",
      ]),
      h("Governance"),
      l([
        "Bronvereisten en claimstandaarden",
        "Menselijke goedkeuring vóór publicatie",
        "Geen duplicate of gespinde content over locales",
        "Duidelijk ownership tussen marketing en subject-matter experts",
      ]),
      h("Pakketten"),
      p(
        "Van een eenmalige contentsprint tot een maandelijkse productieretainer. Combineer met Social Media of Ads wanneer u multi-channel hergebruik nodig heeft.",
      ),
    ],
  },

  "ai-chatbots": {
    title: "AI Agents and ChatBots",
    titleNl: "AI agents en chatbots",
    subtitle:
      "Professional AI agents and chatbots that answer, qualify, guide and escalate — grounded in your knowledge, on-brand and built for conversion and support.",
    subtitleNl:
      "Professionele AI-agents en chatbots die antwoorden, kwalificeren, begeleiden en escaleren — grounded in uw knowledge, on-brand en gebouwd voor conversie en support.",
    image: "/uploads/fixweb/ai-integratie.png",
    blocks: [
      h("Agents and chatbots — what’s the difference?"),
      p(
        "A chatbot is the conversational interface visitors use on your site or in messaging channels. An AI agent is the role behind it: goals, tools, knowledge access and rules. We design both together so the experience feels helpful — not like a scripted FAQ widget.",
      ),
      h("What we build"),
      l([
        "Website chat agents trained on your pages, FAQs, policies and product data",
        "Support agents that triage, summarize and draft replies with ticket handoff",
        "Sales agents that qualify leads and book appointments",
        "Service finders (“which package fits me?”) with clear recommendations",
        "Internal agents for staff: knowledge search and first-draft answers",
        "Multilingual NL/EN conversations (more languages on request)",
        "Embedded widgets for WordPress, Next.js, PHP and custom stacks",
      ]),
      h("Agent capabilities"),
      l([
        "Retrieve answers from approved knowledge (RAG) instead of inventing facts",
        "Ask clarifying questions before recommending",
        "Capture lead details and sync to CRM",
        "Trigger workflows (create ticket, notify team, schedule call)",
        "Respect tone of voice and brand guidelines",
        "Escalate to a human with full conversation context",
      ]),
      h("ChatBot experiences that convert"),
      l([
        "Proactive greetings on high-intent pages",
        "Guided flows for pricing, demos and support",
        "After-hours coverage without false promises",
        "Mobile-first chat UX that matches your design system",
        "Analytics: engagement, deflection, leads assisted, handoff rate",
      ]),
      h("Safety, privacy and quality"),
      p(
        "Uncontrolled chatbots damage trust. We ship guardrails so agents stay within your facts and policies.",
      ),
      l([
        "Block inventing prices, legal claims or competitor comparisons",
        "Allow/deny topic lists and sensitive-data handling",
        "Human takeover for billing, complaints and VIP cases",
        "GDPR-aware logging and retention options",
        "Review cycles to improve answers from real conversations",
      ]),
      h("How we implement"),
      l([
        "Discovery: goals, channels, knowledge sources and risk level",
        "Knowledge prep and evaluation set (golden questions)",
        "Prototype → soft launch → iterate on tone and accuracy",
        "Integration with CRM, tickets and calendars where needed",
        "Training for your team plus a runbook to update knowledge",
      ]),
      h("Ideal for"),
      l([
        "Service businesses that get the same questions daily",
        "E-commerce and lead-gen sites needing 24/7 first response",
        "Teams that want AI help without losing human control",
        "Brands expanding NL/EN support capacity",
      ]),
      h("Related services"),
      p(
        "For role-based marketing agents (SEO, content, social, ads), see AI Marketing Agents. For multi-step process automation, see AI workflows and AI automatisering.",
      ),
    ],
    blocksNl: [
      h("Agents en chatbots — wat is het verschil?"),
      p(
        "Een chatbot is de conversationele interface die bezoekers gebruiken op uw site of in messagingkanalen. Een AI-agent is de rol erachter: doelen, tools, knowledge-toegang en regels. Wij ontwerpen beide samen zodat de ervaring behulpzaam voelt — niet als een starre FAQ-widget.",
      ),
      h("Wat we bouwen"),
      l([
        "Website-chatagents getraind op uw pagina’s, FAQ’s, policies en productdata",
        "Support-agents die triëren, samenvatten en antwoorden draften met ticket-handoff",
        "Sales-agents die leads kwalificeren en afspraken boeken",
        "Service finders (“welk pakket past bij mij?”) met heldere aanbevelingen",
        "Interne agents voor medewerkers: knowledge search en first-draft antwoorden",
        "Meertalige NL/EN-gesprekken (meer talen op verzoek)",
        "Embedded widgets voor WordPress, Next.js, PHP en maatwerkstacks",
      ]),
      h("Agent-mogelijkheden"),
      l([
        "Antwoorden ophalen uit goedgekeurde knowledge (RAG) in plaats van feiten verzinnen",
        "Verduidelijkingsvragen stellen vóór een aanbeveling",
        "Leidgegevens vastleggen en syncen naar CRM",
        "Workflows triggeren (ticket maken, team notificeren, call plannen)",
        "Tone of voice en merkrichtlijnen respecteren",
        "Escaleren naar een mens met volledige gesprekscontext",
      ]),
      h("ChatBot-ervaringen die converteren"),
      l([
        "Proactieve begroetingen op high-intent pagina’s",
        "Guided flows voor pricing, demo’s en support",
        "Outside office hours dekking zonder valse beloftes",
        "Mobile-first chat-UX die bij uw design system past",
        "Analytics: engagement, deflection, assisted leads, handoff-rate",
      ]),
      h("Veiligheid, privacy en kwaliteit"),
      p(
        "Ongecontroleerde chatbots schaden vertrouwen. Wij leveren guardrails zodat agents binnen uw feiten en policies blijven.",
      ),
      l([
        "Geen verzonnen prijzen, juridische claims of concurrentievergelijkingen",
        "Allow/deny topiclijsten en gevoelige-dataverwerking",
        "Menselijke overname bij facturatie, klachten en VIP-cases",
        "GDPR-bewuste logging en retentie-opties",
        "Review-cycli om antwoorden te verbeteren uit echte gesprekken",
      ]),
      h("Hoe we implementeren"),
      l([
        "Discovery: doelen, kanalen, knowledge-bronnen en risiconiveau",
        "Knowledge-prep en evaluation set (golden questions)",
        "Prototype → soft launch → itereren op toon en juistheid",
        "Integratie met CRM, tickets en kalenders waar nodig",
        "Training voor uw team plus een runbook om knowledge te updaten",
      ]),
      h("Ideaal voor"),
      l([
        "Dienstverleners die dagelijks dezelfde vragen krijgen",
        "E-commerce en lead-gen sites die 24/7 first response nodig hebben",
        "Teams die AI-hulp willen zonder menselijke controle te verliezen",
        "Merken die NL/EN-supportcapaciteit willen uitbreiden",
      ]),
      h("Gerelateerde diensten"),
      p(
        "Voor rolgebaseerde marketing-agents (SEO, content, social, ads) zie AI Marketing Agents. Voor multi-step procesautomatisering zie AI workflows en AI automatisering.",
      ),
    ],
  },

  "ai-automation": {
    title: "AI Automation",
    titleNl: "AI automatisering",
    subtitle:
      "Use AI to automate repetitive work across marketing, sales, support and operations — with clear ROI, guardrails and human control where it matters.",
    subtitleNl:
      "Gebruik AI om repetitief werk te automatiseren in marketing, sales, support en operations — met duidelijke roi, guardrails en menselijke controle waar het telt.",
    image: "/uploads/fixweb/maatwerk-software.png",
    blocks: [
      h("What AI automation is"),
      p(
        "AI automation is not “chat for everything”. It is targeted automation: AI handles reading, drafting, classifying, enriching and routing — while your systems and people stay in charge of decisions that carry risk or brand impact.",
      ),
      h("Where automation pays off"),
      l([
        "Summarizing tickets, emails and meeting notes",
        "Drafting follow-ups and first-response replies",
        "Enriching leads and tagging CRM records",
        "Classifying inbound requests and routing to the right team",
        "Generating content briefs from research inputs",
        "Extracting structured data from documents and forms",
        "Internal knowledge search across Drive, Notion and docs",
        "Reducing copy-paste work between tools",
      ]),
      h("Business outcomes"),
      l([
        "Hours saved per week on repetitive tasks",
        "Faster response times for leads and support",
        "Fewer missed handoffs between tools and teams",
        "More consistent quality with review checkpoints",
        "Clear KPIs: time saved, volume handled, error rate, CSAT proxies",
      ]),
      h("How we keep it safe"),
      p(
        "Automation without governance creates risk. We design allow/deny rules, human approval gates for sensitive actions, logging for auditability, and evaluation checks so quality does not drift over time.",
      ),
      l([
        "Risk scoring per use case before build",
        "Human checkpoints for pricing, legal and customer-facing send",
        "Secure API connectors and least-privilege access",
        "Monitoring for failures, cost spikes and quality drops",
      ]),
      h("How we deliver"),
      l([
        "Process mapping and ROI estimate before build",
        "Pilot on one high-impact process",
        "Integrations with your stack (CRM, mail, tickets, CMS, sheets)",
        "Documentation and handover for your team",
        "Optional monthly backlog to expand automation safely",
      ]),
      h("Ideal starting points"),
      l([
        "Support deflection and ticket triage",
        "Inbound lead enrichment and routing",
        "Content production assists with human publish control",
        "Ops reporting and data cleanup",
      ]),
      h("Ready to automate with AI?"),
      p(
        "Tell us which repetitive process costs the most time. We propose a feasible automation plan — and can connect it to dedicated AI workflows when you need multi-step orchestration.",
      ),
    ],
    blocksNl: [
      h("Wat AI-automatisering is"),
      p(
        "AI-automatisering is niet “chat voor alles”. Het is gerichte automatisering: AI leest, draft, classificeert, verrijkt en routeert — terwijl uw systemen en mensen baas blijven over beslissingen met risico of merkimpact.",
      ),
      h("Waar automatisering loont"),
      l([
        "Tickets, e-mails en meetingnotes samenvatten",
        "Follow-ups en first-response antwoorden draften",
        "Leads verrijken en CRM-records taggen",
        "Inbound verzoeken classificeren en naar het juiste team routeren",
        "Contentbriefs genereren uit research-input",
        "Gestructureerde data uit documenten en forms halen",
        "Interne knowledge search over Drive, Notion en docs",
        "Copy-paste-werk tussen tools verminderen",
      ]),
      h("Business-resultaten"),
      l([
        "Uren per week bespaard op repetitieve taken",
        "Snellere responstijden voor leads en support",
        "Minder gemiste handoffs tussen tools en teams",
        "Consistentere kwaliteit met review-checkpoints",
        "Heldere KPI’s: tijdwinst, volume, foutrate, CSAT-proxies",
      ]),
      h("Hoe we het veilig houden"),
      p(
        "Automatisering zonder governance creëert risico. Wij ontwerpen allow/deny-regels, menselijke goedkeuringsgates voor gevoelige acties, logging voor auditability, en evaluation-checks zodat kwaliteit niet wegdrijft.",
      ),
      l([
        "Risicoscoring per use-case vóór build",
        "Menselijke checkpoints voor prijzen, juridisch en klantgerichte send",
        "Veilige API-connectors en least-privilege toegang",
        "Monitoring op failures, kostenpieken en kwaliteitsdalingen",
      ]),
      h("Hoe we opleveren"),
      l([
        "Process mapping en ROI-inschatting vóór build",
        "Pilot op één high-impact proces",
        "Integraties met uw stack (CRM, mail, tickets, CMS, sheets)",
        "Documentatie en handover voor uw team",
        "Optioneel maandelijkse backlog om veilig uit te breiden",
      ]),
      h("Ideale startpunten"),
      l([
        "Support-deflection en ticket-triage",
        "Inbound lead-enrichment en routing",
        "Contentproductie-assistentie met menselijke publish-controle",
        "Ops-rapportage en data-cleanup",
      ]),
      h("Klaar om te automatiseren met AI?"),
      p(
        "Vertel welk repetitief proces de meeste tijd kost. Wij stellen een haalbaar automatiseringsplan voor — en koppelen het aan dedicated AI workflows wanneer u multi-step orchestratie nodig heeft.",
      ),
    ],
  },

  "ai-workflows": {
    title: "AI Workflows",
    titleNl: "AI workflows",
    subtitle:
      "End-to-end AI workflows: triggers, steps, branching, approvals and integrations — designed for reliability, not one-off prompts.",
    subtitleNl:
      "End-to-end AI-workflows: triggers, stappen, branching, goedkeuringen en integraties — ontworpen voor betrouwbaarheid, geen eenmalige prompts.",
    image: "/uploads/fixweb/ai-integratie.png",
    blocks: [
      h("What an AI workflow is"),
      p(
        "An AI workflow is a repeatable process with a clear start, AI-assisted steps, optional human approvals, and a defined outcome in your tools. Unlike a single chat prompt, workflows run the same way every time — with logging, retries and measurable results.",
      ),
      h("Building blocks"),
      l([
        "Triggers: form submit, new lead, new ticket, schedule, webhook, email inbound",
        "AI steps: classify, summarize, extract, draft, score, translate, recommend",
        "Logic: conditions, branching, loops and fallbacks",
        "Human gates: review before send, publish or spend",
        "Actions: update CRM, create ticket reply, post draft, notify Slack/Teams",
        "Observability: logs, success/fail rates, cost per run",
      ]),
      h("Workflow possibilities"),
      l([
        "Lead → enrich → score → route → draft outreach → human approve → send",
        "Ticket → summarize → suggest reply → escalate if VIP/complaint",
        "Keyword input → brief → outline → draft → SEO checklist → editor queue",
        "Meeting recording/notes → action items → CRM tasks → follow-up mail draft",
        "Product feed change → update descriptions → QA → publish staging",
        "Inbound PDF/invoice → extract fields → validate → push to finance tool",
        "Social calendar → variants → brand check → schedule queue",
        "Support FAQ gap → draft answer → knowledge base update request",
      ]),
      h("Tools and integrations"),
      p(
        "We connect workflows to the stack you already use: CRM, helpdesk, mail, CMS, e-commerce, spreadsheets, Slack/Teams and custom APIs. The goal is orchestration that fits your operations — not forcing a new platform for everything.",
      ),
      h("Design principles"),
      l([
        "One owner and one success metric per workflow",
        "Idempotent steps so retries do not duplicate actions",
        "Clear failure paths and human escalation",
        "Brand and compliance rules embedded in prompts and checks",
        "Cost controls: caching, model tiering and rate limits",
      ]),
      h("What you get"),
      l([
        "Workflow map (trigger → steps → outcome)",
        "Working automation in staging, then production",
        "Runbook for your team: how to pause, edit and monitor",
        "Dashboard metrics or report of runs, savings and quality",
        "Roadmap to add the next high-ROI workflows",
      ]),
      h("Related service"),
      p(
        "Need broader automation strategy first? Start with AI automatisering. Ready to design specific multi-step flows? AI workflows is the build track.",
      ),
    ],
    blocksNl: [
      h("Wat een AI-workflow is"),
      p(
        "Een AI-workflow is een herhaalbaar proces met een duidelijke start, AI-ondersteunde stappen, optionele menselijke goedkeuringen en een gedefinieerde uitkomst in uw tools. Anders dan één chatprompt draait een workflow elke keer hetzelfde — met logging, retries en meetbare resultaten.",
      ),
      h("Bouwstenen"),
      l([
        "Triggers: form submit, nieuwe lead, nieuw ticket, schedule, webhook, inbound e-mail",
        "AI-stappen: classificeren, samenvatten, extracten, draften, scoren, vertalen, aanbevelen",
        "Logica: conditions, branching, loops en fallbacks",
        "Menselijke gates: review vóór send, publish of spend",
        "Acties: CRM updaten, ticketantwoord maken, draft posten, Slack/Teams notificeren",
        "Observability: logs, success/fail-rates, kosten per run",
      ]),
      h("Workflow-mogelijkheden"),
      l([
        "Lead → verrijken → scoren → routeren → outreach draften → mens goedkeuren → versturen",
        "Ticket → samenvatten → antwoord voorstellen → escaleren bij VIP/klacht",
        "Keyword-input → brief → outline → draft → SEO-checklist → editor-queue",
        "Meetingnotes → action items → CRM-taken → follow-up maildraft",
        "Productfeed-wijziging → teksten updaten → QA → staging publiceren",
        "Inbound PDF/factuur → velden extracten → valideren → naar finance-tool",
        "Social kalender → varianten → brand check → schedule-queue",
        "Support FAQ-gap → antwoord draften → knowledge base update-aanvraag",
      ]),
      h("Tools en integraties"),
      p(
        "Wij koppelen workflows aan de stack die u al gebruikt: CRM, helpdesk, mail, CMS, e-commerce, spreadsheets, Slack/Teams en custom API’s. Het doel is orchestratie die bij uw operations past — niet overal een nieuw platform forceren.",
      ),
      h("Ontwerpprincipes"),
      l([
        "Eén owner en één success metric per workflow",
        "Idempotente stappen zodat retries geen dubbele acties veroorzaken",
        "Duidelijke failure-paden en menselijke escalatie",
        "Merk- en compliance-regels in prompts en checks",
        "Kostencontrole: caching, model-tiering en rate limits",
      ]),
      h("Wat u krijgt"),
      l([
        "Workflow-map (trigger → stappen → uitkomst)",
        "Werkende automatisering op staging, daarna productie",
        "Runbook voor uw team: pauzeren, bewerken en monitoren",
        "Dashboardmetrics of rapport van runs, besparing en kwaliteit",
        "Roadmap voor de volgende high-ROI workflows",
      ]),
      h("Gerelateerde dienst"),
      p(
        "Eerst bredere automatiseringsstrategie? Start met AI automatisering. Klaar om specifieke multi-step flows te bouwen? AI workflows is het build-traject.",
      ),
    ],
  },

  "ai-marketing-agents": {
    title: "AI Marketing Agents",
    titleNl: "AI marketing agents",
    subtitle:
      "Specialized AI agents for SEO, content, social and ads — coordinated with human strategy.",
    subtitleNl:
      "Gespecialiseerde AI-agents voor SEO, content, social en ads — gecoördineerd met menselijke strategie.",
    image: "/uploads/fixweb/ai-advertising.png",
    blocks: [
      h("Agents with a job description"),
      p(
        "Generic chatbots are not a marketing system. We configure role-based agents that research, draft, score and suggest — while your team (or ours) decides what goes live.",
      ),
      h("Agent roles we deploy"),
      l([
        "SEO agent: gaps, briefs and technical flags",
        "Content agent: outlines and drafts against brand rules",
        "Social agent: calendars, variants and engagement drafts",
        "Ads agent: creative angles and performance hypotheses",
        "Orchestration so agents share context instead of conflicting",
      ]),
      h("Inside your TripleZero workspace"),
      p(
        "Where available, agents surface in the client dashboard with status, tasks and outputs — so progress is visible, not buried in chat history.",
      ),
      h("Guardrails"),
      l([
        "Brand and compliance prompt packs",
        "Approval gates before publish or spend",
        "Human strategy ownership for KPI targets",
      ]),
    ],
    blocksNl: [
      h("Agents met een functieomschrijving"),
      p(
        "Generieke chatbots zijn geen marketingssysteem. Wij configureren rolgebaseerde agents die researchen, draften, scoren en voorstellen — terwijl uw team (of het onze) beslist wat live gaat.",
      ),
      h("Agentrollen die we inzetten"),
      l([
        "SEO-agent: gaps, briefs en technische flags",
        "Content-agent: outlines en drafts volgens merkregels",
        "Social-agent: kalenders, varianten en engagement-drafts",
        "Ads-agent: creative angles en performance-hypotheses",
        "Orchestratie zodat agents context delen in plaats van conflicteren",
      ]),
      h("In uw TripleZero-workspace"),
      p(
        "Waar beschikbaar ziet u agents in het klantdashboard met status, taken en outputs — zodat voortgang zichtbaar is, niet begraven in chathistorie.",
      ),
      h("Guardrails"),
      l([
        "Merk- en compliance-promptpacks",
        "Goedkeuringsgates vóór publicatie of spend",
        "Menselijk strategy-ownership voor KPI-targets",
      ]),
    ],
  },

  "ai-integration": {
    title: "Custom AI Integration",
    titleNl: "AI integratie en maatwerk",
    subtitle:
      "Custom AI features in your product or stack — APIs, embeddings, RAG and secure deployment.",
    subtitleNl:
      "Maatwerk AI-features in uw product of stack — API’s, embeddings, rag en veilige deployment.",
    image: "/uploads/fixweb/ai-integratie.png",
    blocks: [
      h("Built for your use case"),
      p(
        "When off-the-shelf tools are not enough, we design and ship AI capabilities into your website, portal or internal tools — with architecture that can evolve.",
      ),
      h("Technical scope"),
      l([
        "Retrieval-augmented generation over your private docs",
        "API wrappers and middleware for model providers",
        "Embeddings, vector search and evaluation pipelines",
        "Auth, rate limits, logging and cost controls",
        "Frontend UX for chat, search and copilots in Next.js or your stack",
      ]),
      h("Delivery process"),
      l([
        "Discovery workshop and success metrics",
        "Architecture decision record and security review",
        "MVP in weeks, then iterate on quality and cost",
        "Handover docs, runbooks and optional retainership",
      ]),
      h("Fit"),
      p(
        "SaaS products, client portals, knowledge-heavy businesses and agencies building AI into their own offerings.",
      ),
    ],
    blocksNl: [
      h("Gebouwd voor uw use-case"),
      p(
        "Wanneer standaardtools tekortschieten, ontwerpen en leveren we AI-capabilities in uw website, portal of interne tools — met architectuur die kan meegroeien.",
      ),
      h("Technische scope"),
      l([
        "Retrieval-augmented generation over uw private docs",
        "API-wrappers en middleware voor modelproviders",
        "Embeddings, vector search en evaluation-pipelines",
        "Auth, rate limits, logging en kostencontrole",
        "Frontend-UX voor chat, search en copilots in Next.js of uw stack",
      ]),
      h("Opleverproces"),
      l([
        "Discovery-workshop en success metrics",
        "Architecture decision record en security review",
        "MVP in weken, daarna itereren op kwaliteit en kosten",
        "Handover-docs, runbooks en optioneel retainership",
      ]),
      h("Passend voor"),
      p(
        "SaaS-producten, klantportalen, knowledge-intensieve bedrijven en bureaus die AI in hun eigen aanbod bouwen.",
      ),
    ],
  },

  "ai-consultancy": {
    title: "AI Strategy & Consultancy",
    titleNl: "AI strategie en advies",
    subtitle:
      "Executive-ready AI strategy: where to invest, what to avoid, and how to measure ROI safely.",
    subtitleNl:
      "Bestuursklare AI-strategie: waar te investeren, wat te vermijden, en hoe roi veilig te meten.",
    image: "/uploads/fixweb/ai-advertising.png",
    blocks: [
      h("Clarity before tooling"),
      p(
        "Most AI projects fail from unclear goals, not weak models. We help you choose use cases, vendors and operating models that match risk appetite and commercial targets.",
      ),
      h("Advisory themes"),
      l([
        "Opportunity mapping across marketing, support, product and ops",
        "Build vs buy decisions and vendor shortlists",
        "Data readiness, privacy and brand-risk policies",
        "KPI frameworks and pilot design",
        "Team enablement: prompts, review rituals and ownership",
      ]),
      h("Formats"),
      l([
        "Half-day strategy workshop",
        "4–6 week discovery with roadmap",
        "Ongoing fractional AI lead for leadership meetings",
      ]),
      h("Next step"),
      p(
        "Book an intake. We leave you with a prioritized backlog — and can execute selected items via our AI delivery services.",
      ),
    ],
    blocksNl: [
      h("Eerst helderheid, dan tooling"),
      p(
        "De meeste AI-projecten falen door onduidelijke doelen, niet door zwakke models. Wij helpen use-cases, vendors en operating models te kiezen die passen bij risicobereidheid en commerciële targets.",
      ),
      h("Advies-thema’s"),
      l([
        "Opportunity mapping over marketing, support, product en ops",
        "Build vs buy-beslissingen en vendor-shortlists",
        "Data-readiness, privacy en merkrisico-policies",
        "KPI-frameworks en pilotontwerp",
        "Team enablement: prompts, review-rituelen en ownership",
      ]),
      h("Formats"),
      l([
        "Halve-dag strategiesessie",
        "4–6 weken discovery met roadmap",
        "Doorlopend fractional AI-lead voor leadership-meetings",
      ]),
      h("Volgende stap"),
      p(
        "Plan een intake. U krijgt een geprioriteerde backlog — en wij kunnen geselecteerde items uitvoeren via onze AI-deliverydiensten.",
      ),
    ],
  },
};

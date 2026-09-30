import { localizedHref } from "@/i18n/pathnames";
import {
  FAQ_CLARIFY_GAP,
  FAQ_CONFIDENCE_HIT,
  FAQ_CONFIDENCE_STRONG,
  getFaqById,
  rankFaq,
  type FaqMatch,
} from "@/lib/agent-000/match-faq";
import {
  KB_CONFIDENCE_HIT,
  KB_CONFIDENCE_STRONG,
  rankKennisbank,
  type KennisbankMatch,
} from "@/lib/agent-000/match-kennisbank";
import {
  isProductBrowseQuery,
  PRODUCT_CONFIDENCE_HIT,
  PRODUCT_CONFIDENCE_STRONG,
  rankProducts,
  type ProductMatch,
} from "@/lib/agent-000/match-products";
import { detectIntents, isDomainTopicQuery, type AgentIntent } from "@/lib/agent-000/intents";
import { normalizeAgentText, tokenizeAgentText } from "@/lib/agent-000/text";
import { EXTRA_HOSTING_PUBLIC_NAME } from "@/lib/brand/public-name";

export type AgentAction =
  | "open_ticket"
  | "book_appointment"
  | "contact"
  | "domain_register"
  | "domain_transfer"
  | "domain_renew";

export type AgentLink = {
  kind: "faq" | "kennisbank" | "product";
  title: string;
  href: string;
  faqId?: string;
  categoryId?: string;
  /** Re-ask this to lock in a single FAQ answer after clarify. */
  askQuestion?: string;
  confidence: number;
  /** Compact product card fields */
  subtitle?: string;
  priceInclCents?: number | null;
  image?: string | null;
  badge?: string | null;
  slug?: string;
};

export type AgentAskResult = {
  answer: string;
  faqId: string | null;
  categoryId: string | null;
  matchedQuestion: string | null;
  confidence: number;
  actions: AgentAction[];
  intents: AgentIntent[];
  mode: "answer" | "clarify";
  links: AgentLink[];
};

export type BuildAgentReplyOptions = {
  /** Force a specific FAQ item (after visitor picks a clarify option). */
  faqId?: string;
  /** ExtraHosting: only domains/hosting FAQ + kennisbank. */
  hostingOnly?: boolean;
};

function lang(locale: string) {
  return locale.toLowerCase().split("-")[0] || "en";
}

type CopyBag = Record<string, string> & { en: string };

function pickCopy(locale: string, map: CopyBag) {
  const code = lang(locale);
  return map[code] || map.en;
}

function greeting(locale: string, hostingOnly?: boolean) {
  const brandName =
    hostingOnly ||
    (process.env.SITE_BRAND || "").toLowerCase().includes("extra") ||
    (process.env.NEXT_PUBLIC_APP_URL || "").includes("extrahosting")
      ? EXTRA_HOSTING_PUBLIC_NAME
      : null;
  const base = pickCopy(locale, {
    en: "Hi, I'm Agent 000.",
    nl: "Hallo, ik ben Agent 000.",
    de: "Hallo, ich bin Agent 000.",
    fr: "Bonjour, je suis Agent 000.",
    es: "Hola, soy Agent 000.",
    pt: "Olá, sou o Agent 000.",
    it: "Ciao, sono Agent 000.",
    pl: "Cześć, jestem Agent 000.",
    tr: "Merhaba, ben Agent 000.",
    ar: "مرحبًا، أنا Agent 000.",
    hi: "नमस्ते, मैं Agent 000 हूँ।",
    bn: "হ্যালো, আমি Agent 000।",
    ur: "ہیلو، میں Agent 000 ہوں۔",
    zh: "你好，我是 Agent 000。",
    ja: "こんにちは、Agent 000 です。",
  });
  if (!brandName) return base;
  return pickCopy(locale, {
    en: `Hi, I'm Agent 000 from ${brandName}.`,
    nl: `Hallo, ik ben Agent 000 van ${brandName}.`,
    de: `Hallo, ich bin Agent 000 von ${brandName}.`,
    fr: `Bonjour, je suis Agent 000 chez ${brandName}.`,
    es: `Hola, soy Agent 000 de ${brandName}.`,
    pt: `Olá, sou o Agent 000 da ${brandName}.`,
    ar: `مرحبًا، أنا Agent 000 من ${brandName}.`,
    hi: `नमस्ते, मैं ${brandName} से Agent 000 हूँ।`,
    zh: `你好，我是 ${brandName} 的 Agent 000。`,
    ja: `こんにちは、${brandName} の Agent 000 です。`,
  });
}

function lowConfidenceCopy(locale: string) {
  return pickCopy(locale, {
    en: "I'm not fully sure from our FAQ or knowledge base yet. You can browse related topics below, open a ticket, book an appointment, or contact us — our team will help.",
    nl: "Ik kan dit nog niet zeker beantwoorden vanuit onze FAQ of kennisbank. Je kunt hieronder gerelateerde onderwerpen bekijken, een ticket openen, een afspraak boeken, of contact opnemen — ons team helpt je verder.",
    de: "Ich bin mir aus FAQ oder Wissensdatenbank noch nicht sicher genug. Du kannst unten verwandte Themen öffnen, ein Ticket erstellen, einen Termin buchen oder uns kontaktieren — unser Team hilft weiter.",
    fr: "Je ne suis pas encore sûr à partir de notre FAQ ou base de connaissances. Tu peux consulter les sujets liés ci-dessous, ouvrir un ticket, prendre rendez-vous ou nous contacter — notre équipe t’aidera.",
    es: "Aún no estoy del todo seguro con nuestra FAQ o base de conocimiento. Puedes ver temas relacionados abajo, abrir un ticket, reservar una cita o contactarnos — nuestro equipo te ayudará.",
    pt: "Ainda não tenho certeza suficiente pela FAQ ou base de conhecimento. Podes ver tópicos relacionados abaixo, abrir um ticket, marcar uma reunião ou contactar-nos — a nossa equipa ajuda.",
    ar: "لست متأكدًا بعد من الأسئلة الشائعة أو قاعدة المعرفة. يمكنك تصفح المواضيع ذات الصلة أدناه أو فتح تذكرة أو حجز موعد أو التواصل معنا — فريقنا سيساعدك.",
    hi: "मैं अभी FAQ या ज्ञानकोष से पूरी तरह आश्वस्त नहीं हूँ। नीचे संबंधित विषय देखें, टिकट खोलें, अपॉइंटमेंट बुक करें या संपर्क करें — हमारी टीम मदद करेगी।",
    zh: "我还不能从常见问题或知识库完全确定。你可以查看下方相关主题、开工单、预约或联系我们——我们的团队会协助你。",
    ja: "FAQ やナレッジベースだけではまだ確信が持てません。下の関連トピックを見るか、チケット作成・予約・お問い合わせでチームが対応します。",
  });
}

function escalateHint(locale: string) {
  return pickCopy(locale, {
    en: "\n\nPrefer a human? Open a ticket or book an appointment.",
    nl: "\n\nWil je liever een mens? Open een ticket of maak een afspraak.",
    de: "\n\nLieber einen Menschen? Öffne ein Ticket oder buche einen Termin.",
    fr: "\n\nTu préfères un humain ? Ouvre un ticket ou prends rendez-vous.",
    es: "\n\n¿Prefieres una persona? Abre un ticket o reserva una cita.",
    pt: "\n\nPreferes uma pessoa? Abre um ticket ou marca uma reunião.",
    ar: "\n\nتفضل التحدث مع شخص؟ افتح تذكرة أو احجز موعدًا.",
    hi: "\n\nक्या आप किसी व्यक्ति से बात करना चाहेंगे? टिकट खोलें या अपॉइंटमेंट बुक करें।",
    zh: "\n\n想找人工？请开工单或预约。",
    ja: "\n\n人と話したい場合は、チケットを開くか予約してください。",
  });
}

function clarifyCopy(locale: string) {
  return pickCopy(locale, {
    en: "I found several relevant topics in our FAQ and knowledge base. Which one matches what you're looking for? Pick an option below and I'll give a focused answer.",
    nl: "Ik vond meerdere relevante onderwerpen in onze FAQ en kennisbank. Welke past het best bij wat je zoekt? Kies een optie hieronder — dan geef ik een gericht antwoord.",
    de: "Ich habe mehrere passende Themen in FAQ und Wissensdatenbank gefunden. Welche passt am besten? Wähle unten eine Option — dann antworte ich gezielter.",
    fr: "J’ai trouvé plusieurs sujets pertinents dans notre FAQ et base de connaissances. Lequel correspond le mieux ? Choisis une option ci-dessous pour une réponse ciblée.",
    es: "Encontré varios temas relevantes en nuestra FAQ y base de conocimiento. ¿Cuál encaja mejor? Elige una opción abajo y te doy una respuesta concreta.",
    pt: "Encontrei vários tópicos relevantes na FAQ e base de conhecimento. Qual combina melhor? Escolhe uma opção abaixo para uma resposta focada.",
    ar: "وجدت عدة مواضيع ذات صلة في الأسئلة الشائعة وقاعدة المعرفة. أيها الأنسب؟ اختر خيارًا أدناه لأعطيك إجابة مركزة.",
    hi: "मैंने FAQ और ज्ञानकोष में कई प्रासंगिक विषय पाए। कौन सा सबसे मेल खाता है? नीचे विकल्प चुनें — मैं केंद्रित उत्तर दूँगा।",
    zh: "我在常见问题和知识库中找到多个相关主题。哪个最符合？请在下方选择，我会给出更针对性的回答。",
    ja: "FAQ とナレッジベースに複数の関連トピックがあります。どれが近いですか？下から選ぶと、より的確にお答えします。",
  });
}

function relatedIntro(locale: string) {
  return pickCopy(locale, {
    en: "\n\nRelated:",
    nl: "\n\nGerelateerd:",
    de: "\n\nVerwandt:",
    fr: "\n\nLiés :",
    es: "\n\nRelacionado:",
    pt: "\n\nRelacionado:",
    it: "\n\nCorrelati:",
    pl: "\n\nPowiązane:",
    tr: "\n\nİlgili:",
    ar: "\n\nذات صلة:",
    hi: "\n\nसंबंधित:",
    bn: "\n\nসম্পর্কিত:",
    ur: "\n\nمتعلقہ:",
    zh: "\n\n相关：",
    ja: "\n\n関連:",
  });
}

function productIntro(locale: string, hostingOnly?: boolean) {
  if (hostingOnly) {
    return pickCopy(locale, {
      en: "I found matching hosting plans and domain options. Open a card below for details (opens in a new tab).",
      nl: "Ik vond passende hostingplannen en domeinopties. Open een kaart hieronder voor details (opent in een nieuw tabblad).",
      de: "Ich habe passende Hosting-Tarife und Domain-Optionen gefunden. Öffne unten eine Karte für Details (neuer Tab).",
      fr: "J’ai trouvé des formules d’hébergement et des options de domaine. Ouvre une carte ci-dessous pour les détails (nouvel onglet).",
      es: "Encontré planes de hosting y opciones de dominio. Abre una tarjeta abajo para ver detalles (nueva pestaña).",
      pt: "Encontrei planos de hosting e opções de domínio. Abre um cartão abaixo para detalhes (novo separador).",
      ar: "وجدت خطط استضافة وخيارات نطاق مطابقة. افتح بطاقة أدناه للتفاصيل (تبويب جديد).",
      hi: "मुझे मिलते-जुलते होस्टिंग प्लान और डोमेन विकल्प मिले। विवरण के लिए नीचे कार्ड खोलें (नया टैब)।",
      zh: "我找到了相关的主机方案和域名选项。点击下方卡片查看详情（新标签页打开）。",
      ja: "関連するホスティングプランとドメインオプションが見つかりました。下のカードから詳細を開けます（新しいタブ）。",
    });
  }
  return pickCopy(locale, {
    en: "I found matching services and products. Open a card below for details (opens in a new tab).",
    nl: "Ik vond passende diensten en producten. Open een kaart hieronder voor details (opent in een nieuw tabblad).",
    de: "Ich habe passende Dienste und Produkte gefunden. Öffne unten eine Karte für Details (neuer Tab).",
    fr: "J’ai trouvé des services et produits correspondants. Ouvre une carte ci-dessous pour les détails (nouvel onglet).",
    es: "Encontré servicios y productos que encajan. Abre una tarjeta abajo para ver detalles (nueva pestaña).",
    pt: "Encontrei serviços e produtos correspondentes. Abre um cartão abaixo para detalhes (novo separador).",
    ar: "وجدت خدمات ومنتجات مطابقة. افتح بطاقة أدناه للتفاصيل (تبويب جديد).",
    hi: "मुझे मिलती-जुलती सेवाएँ और उत्पाद मिले। विवरण के लिए नीचे कार्ड खोलें (नया टैब)।",
    zh: "我找到了相关服务和产品。点击下方卡片查看详情（新标签页打开）。",
    ja: "関連するサービス・商品が見つかりました。下のカードから詳細を開けます（新しいタブ）。",
  });
}

function faqDeepHref(locale: string, faqId: string) {
  return `${localizedHref(locale, "/faq")}#faq-item-${faqId}`;
}

function kbHref(locale: string, categorySlug: string, slug: string) {
  return localizedHref(locale, `/kennisbank/${categorySlug}/${slug}`);
}

function faqLink(locale: string, match: FaqMatch): AgentLink {
  return {
    kind: "faq",
    title: match.question,
    href: faqDeepHref(locale, match.faqId),
    faqId: match.faqId,
    categoryId: match.categoryId,
    askQuestion: match.question,
    confidence: match.confidence,
  };
}

function kbLink(locale: string, match: KennisbankMatch): AgentLink {
  return {
    kind: "kennisbank",
    title: match.title,
    href: kbHref(locale, match.categorySlug, match.slug),
    confidence: match.confidence,
  };
}

function productLink(match: ProductMatch): AgentLink {
  return {
    kind: "product",
    title: match.title,
    href: match.href,
    confidence: match.confidence,
    subtitle: match.subtitle,
    priceInclCents: match.priceInclCents,
    image: match.image,
    badge: match.badge,
    slug: match.slug,
  };
}

function formatLinksInAnswer(locale: string, links: AgentLink[]): string {
  if (!links.length) return "";
  const lines = links.map((link, i) => {
    const label =
      link.kind === "faq"
        ? pickCopy(locale, {
            en: "FAQ",
            nl: "FAQ",
            de: "FAQ",
            fr: "FAQ",
            es: "FAQ",
            ar: "الأسئلة الشائعة",
            hi: "FAQ",
            zh: "常见问题",
            ja: "FAQ",
          })
        : link.kind === "product"
          ? pickCopy(locale, {
              en: "Service",
              nl: "Dienst",
              de: "Dienst",
              fr: "Service",
              es: "Servicio",
              pt: "Serviço",
              ar: "خدمة",
              hi: "सेवा",
              zh: "服务",
              ja: "サービス",
            })
          : pickCopy(locale, {
              en: "Knowledge base",
              nl: "Kennisbank",
              de: "Wissensdatenbank",
              fr: "Base de connaissances",
              es: "Base de conocimiento",
              pt: "Base de conhecimento",
              ar: "قاعدة المعرفة",
              hi: "ज्ञानकोष",
              bn: "জ্ঞানভাণ্ডার",
              ur: "علمی ذخیرہ",
              zh: "知识库",
              ja: "ナレッジベース",
            });
    return `${i + 1}. [${label}] ${link.title}\n   ${link.href}`;
  });
  return `${relatedIntro(locale)}\n${lines.join("\n")}`;
}

function kbAnswerLead(locale: string, match: KennisbankMatch): string {
  const body = match.excerpt?.trim();
  if (body) {
    return pickCopy(locale, {
      en: `From our knowledge base (“${match.title}”): ${body}`,
      nl: `Volgens onze kennisbank (“${match.title}”): ${body}`,
      de: `Aus unserer Wissensdatenbank („${match.title}“): ${body}`,
      fr: `D’après notre base de connaissances (« ${match.title} ») : ${body}`,
      es: `Según nuestra base de conocimiento (“${match.title}”): ${body}`,
      pt: `Segundo a nossa base de conhecimento (“${match.title}”): ${body}`,
      ar: `من قاعدة المعرفة («${match.title}»): ${body}`,
      hi: `हमारे ज्ञानकोष (“${match.title}”) से: ${body}`,
      zh: `来自知识库（“${match.title}”）：${body}`,
      ja: `ナレッジベース（「${match.title}」）より：${body}`,
    });
  }
  return pickCopy(locale, {
    en: `I found this in our knowledge base: “${match.title}”. Open the article for the full guide.`,
    nl: `Ik vond dit in onze kennisbank: “${match.title}”. Open het artikel voor de volledige uitleg.`,
    de: `Ich habe dies in unserer Wissensdatenbank gefunden: „${match.title}“. Öffne den Artikel für die volle Anleitung.`,
    fr: `J’ai trouvé ceci dans notre base de connaissances : « ${match.title} ». Ouvre l’article pour le guide complet.`,
    es: `Encontré esto en nuestra base de conocimiento: “${match.title}”. Abre el artículo para la guía completa.`,
    pt: `Encontrei isto na nossa base de conhecimento: “${match.title}”. Abre o artigo para o guia completo.`,
    ar: `وجدت هذا في قاعدة المعرفة: «${match.title}». افتح المقال للدليل الكامل.`,
    hi: `मैंने ज्ञानकोष में यह पाया: “${match.title}”. पूरी गाइड के लिए लेख खोलें।`,
    zh: `我在知识库中找到了：“${match.title}”。打开文章查看完整说明。`,
    ja: `ナレッジベースで見つかりました：「${match.title}」。記事を開くと詳しい手順があります。`,
  });
}

function collectIntents(question: string, hostingOnly?: boolean) {
  const intents = detectIntents(question);
  const actions = new Set<AgentAction>();
  for (const intent of intents) {
    if (intent === "book_appointment") actions.add("book_appointment");
    if (intent === "open_ticket" || intent === "human") actions.add("open_ticket");
    if (intent === "contact") actions.add("contact");
    if (intent === "domain_register") actions.add("domain_register");
    if (intent === "domain_transfer") actions.add("domain_transfer");
    if (intent === "domain_renew") actions.add("domain_renew");
  }
  // Extra Hosting: surface domain CTAs on domain/hosting topics.
  if (hostingOnly && isDomainTopicQuery(question)) {
    if (!actions.has("domain_transfer") && !actions.has("domain_renew")) {
      actions.add("domain_register");
    }
    if (
      /\b(verhuis|verhuizen|transfer|migrate|migratie|auth.?code|epp)\b/i.test(
        question,
      )
    ) {
      actions.add("domain_transfer");
    }
    if (
      /\b(verleng|verlengen|renew|renewal|mijn.?domeinen|my.?domains)\b/i.test(
        question,
      )
    ) {
      actions.add("domain_renew");
    }
  }
  return { intents, actions };
}

function ensureHostingDomainActions(
  actions: Set<AgentAction>,
  question: string,
  hostingOnly?: boolean,
  productHits?: ProductMatch[],
) {
  if (!hostingOnly) return;
  const domainProducts = (productHits || []).some(
    (p) =>
      p.confidence >= PRODUCT_CONFIDENCE_HIT &&
      (p.slug === "domains" || p.slug.includes("domein")),
  );
  if (isDomainTopicQuery(question) || domainProducts) {
    if (
      !actions.has("domain_register") &&
      !actions.has("domain_transfer") &&
      !actions.has("domain_renew")
    ) {
      actions.add("domain_register");
      actions.add("domain_transfer");
      actions.add("domain_renew");
    }
  }
}

function uniqueLinks(links: AgentLink[], limit = 6): AgentLink[] {
  const seen = new Set<string>();
  const out: AgentLink[] = [];
  for (const link of links) {
    const key = `${link.kind}:${link.href}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(link);
    if (out.length >= limit) break;
  }
  return out;
}

const TOPIC_NOISE = new Set([
  "triplezero",
  "triple",
  "zero",
  "hosting",
  "website",
  "site",
  "web",
  "online",
  "service",
  "services",
  "diensten",
  "help",
  "support",
]);

function sharesTopic(seed: string, other: string): boolean {
  const a = tokenizeAgentText(seed).filter((t) => !TOPIC_NOISE.has(t) && t.length > 2);
  if (!a.length) return false;
  const b = new Set(tokenizeAgentText(other));
  let hits = 0;
  for (const t of a) if (b.has(t)) hits += 1;
  return hits >= 1;
}

function queryCoveredByQuestion(question: string, faqQuestion: string): number {
  const qTok = tokenizeAgentText(question);
  if (!qTok.length) return 0;
  const faqNorm = normalizeAgentText(faqQuestion);
  const faqTok = new Set(tokenizeAgentText(faqQuestion));
  let hits = 0;
  for (const t of qTok) {
    if (faqTok.has(t) || faqNorm.includes(t)) hits += 1;
  }
  return hits / qTok.length;
}

function queryCoveredByAnswer(question: string, faqAnswer: string): number {
  const qTok = tokenizeAgentText(question);
  if (!qTok.length) return 0;
  const aNorm = normalizeAgentText(faqAnswer);
  const aTok = new Set(tokenizeAgentText(faqAnswer));
  let hits = 0;
  for (const t of qTok) {
    if (aTok.has(t) || aNorm.includes(t)) hits += 1;
  }
  return hits / qTok.length;
}

function relatedKbLinks(
  locale: string,
  seedText: string,
  kbHits: KennisbankMatch[],
  limit = 3,
): AgentLink[] {
  return kbHits
    .filter(
      (m) =>
        m.confidence >= KB_CONFIDENCE_HIT &&
        sharesTopic(seedText, `${m.title} ${m.excerpt} ${m.topic} ${m.categorySlug}`),
    )
    .slice(0, limit)
    .map((m) => kbLink(locale, m));
}

function relatedProductLinks(productHits: ProductMatch[], limit = 4): AgentLink[] {
  return productHits
    .filter((m) => m.confidence >= PRODUCT_CONFIDENCE_HIT)
    .slice(0, limit)
    .map((m) => productLink(m));
}

/**
 * Build Agent 000 reply from FAQ + kennisbank + shop/services catalog.
 */
export async function buildAgentReply(
  locale: string,
  question: string,
  opts?: BuildAgentReplyOptions,
): Promise<AgentAskResult> {
  const hostingOnly = Boolean(opts?.hostingOnly);
  const { intents, actions } = collectIntents(question, hostingOnly);
  const browseProducts = isProductBrowseQuery(question);

  if (opts?.faqId) {
    const forced = getFaqById(locale, opts.faqId, {
      hostingOnly,
    });
    if (forced) {
      const [kb, products] = await Promise.all([
        rankKennisbank(locale, `${forced.question} ${question}`, 8, {
          hostingOnly,
        }),
        rankProducts(locale, `${forced.question} ${question}`, 4, {
          hostingOnly,
        }),
      ]);
      const links = uniqueLinks([
        ...relatedProductLinks(products, 3),
        faqLink(locale, forced),
        ...relatedKbLinks(locale, forced.question, kb, 3),
      ]);
      ensureHostingDomainActions(actions, question, hostingOnly, products);
      const answer = `${greeting(locale, hostingOnly)} ${forced.answer}${formatLinksInAnswer(locale, links)}`;
      return {
        answer,
        faqId: forced.faqId,
        categoryId: forced.categoryId,
        matchedQuestion: forced.question,
        confidence: 1,
        actions: [...actions],
        intents,
        mode: "answer",
        links,
      };
    }
  }

  const [faqHits, kbHits, productHits] = await Promise.all([
    Promise.resolve(
      rankFaq(locale, question, 8, { hostingOnly }),
    ),
    rankKennisbank(locale, question, 8, { hostingOnly }),
    rankProducts(locale, question, 6, { hostingOnly }),
  ]);

  // For commercial queries, prefer FAQ items whose answer covers the query
  // (e.g. “wordpress beheer” → support FAQ), not a loosely related top hit.
  const faqHitsOrdered = browseProducts
    ? [...faqHits].sort((a, b) => {
        const joined = tokenizeAgentText(question).join(" ");
        const phraseA =
          joined.length > 4 && normalizeAgentText(a.answer).includes(joined)
            ? 0.15
            : 0;
        const phraseB =
          joined.length > 4 && normalizeAgentText(b.answer).includes(joined)
            ? 0.15
            : 0;
        const coverA = queryCoveredByAnswer(question, a.answer);
        const coverB = queryCoveredByAnswer(question, b.answer);
        const scoreA = a.confidence * (0.55 + coverA * 0.45) + phraseA;
        const scoreB = b.confidence * (0.55 + coverB * 0.45) + phraseB;
        return scoreB - scoreA;
      })
    : faqHits;

  const bestFaq = faqHitsOrdered[0] ?? null;
  const secondFaq = faqHitsOrdered[1] ?? null;
  const bestKb = kbHits[0] ?? null;
  const bestProduct = productHits[0] ?? null;
  const productStrong =
    (bestProduct?.confidence ?? 0) >= PRODUCT_CONFIDENCE_STRONG;
  const productHit =
    (bestProduct?.confidence ?? 0) >= PRODUCT_CONFIDENCE_HIT;
  const topConfidence = Math.max(
    bestFaq?.confidence ?? 0,
    bestKb?.confidence ?? 0,
    bestProduct?.confidence ?? 0,
  );

  const faqStrong = (bestFaq?.confidence ?? 0) >= FAQ_CONFIDENCE_STRONG;
  const faqHit = (bestFaq?.confidence ?? 0) >= FAQ_CONFIDENCE_HIT;
  const kbStrong = (bestKb?.confidence ?? 0) >= KB_CONFIDENCE_STRONG;
  const kbHit = (bestKb?.confidence ?? 0) >= KB_CONFIDENCE_HIT;
  const faqQuestionCover = bestFaq
    ? queryCoveredByQuestion(question, bestFaq.question)
    : 0;
  const faqAnswerCover = bestFaq
    ? queryCoveredByAnswer(question, bestFaq.answer)
    : 0;
  const contentQueryTokens = tokenizeAgentText(question).filter(
    (t) => !TOPIC_NOISE.has(t),
  );
  const minCover =
    contentQueryTokens.length >= 2 ? 0.55 : faqStrong ? 0.25 : 0.4;
  // Allow answer-side FAQ hits for browse/commercial queries (e.g. “wordpress beheer”).
  const faqReliable =
    Boolean(bestFaq) &&
    faqHit &&
    (faqQuestionCover >= minCover ||
      (browseProducts && faqAnswerCover >= 0.7 && (bestFaq?.confidence ?? 0) >= 0.45));

  // Product-first: commercial service queries should show product cards, not panel KB.
  if (browseProducts && productHit && (productStrong || !kbStrong || !faqReliable)) {
    const productLinks = relatedProductLinks(productHits, 4);
    const kbForProducts = hostingOnly
      ? kbHits.filter((m) => sharesTopic(question, `${m.title} ${m.excerpt} ${m.categorySlug}`))
      : kbHits.filter(
          (m) => m.categorySlug === "wordpress" || sharesTopic(question, m.title),
        );
    const links = uniqueLinks([
      ...productLinks,
      ...(faqReliable && bestFaq ? [faqLink(locale, bestFaq)] : []),
      ...relatedKbLinks(locale, question, kbForProducts, 2),
    ]);
    const lead =
      faqReliable && bestFaq
        ? bestFaq.answer
        : productIntro(locale, hostingOnly);
    actions.add("book_appointment");
    actions.add("contact");
    ensureHostingDomainActions(actions, question, hostingOnly, productHits);
    return {
      answer: `${greeting(locale, hostingOnly)} ${lead}${formatLinksInAnswer(locale, links)}`,
      faqId: faqReliable && bestFaq ? bestFaq.faqId : null,
      categoryId: faqReliable && bestFaq ? bestFaq.categoryId : null,
      matchedQuestion:
        faqReliable && bestFaq
          ? bestFaq.question
          : bestProduct?.title || null,
      confidence: Math.max(
        bestProduct?.confidence ?? 0,
        faqReliable && bestFaq ? bestFaq.confidence : 0,
      ),
      actions: [...actions],
      intents,
      mode: "answer",
      links,
    };
  }

  const faqNearTie =
    faqReliable &&
    secondFaq &&
    bestFaq &&
    bestFaq.confidence - secondFaq.confidence < FAQ_CLARIFY_GAP &&
    secondFaq.confidence >= FAQ_CONFIDENCE_HIT;

  const multiKb =
    kbHit &&
    bestKb &&
    kbHits.filter((m) => m.confidence >= KB_CONFIDENCE_HIT).length >= 2 &&
    !faqStrong &&
    (kbHits[1]?.confidence ?? 0) >= bestKb.confidence - 0.04 &&
    Math.abs(
      queryCoveredByQuestion(question, bestKb.title) -
        queryCoveredByQuestion(question, kbHits[1]?.title || ""),
    ) < 0.12;

  const faqVsKbAmbiguous =
    faqHit &&
    kbHit &&
    bestFaq &&
    bestKb &&
    !faqStrong &&
    Math.abs(bestFaq.confidence - bestKb.confidence) < 0.12;

  // Ambiguous: several close FAQ hits, weak FAQ vs KB, or KB-only multi-hits.
  if (faqNearTie || faqVsKbAmbiguous || (multiKb && !faqReliable)) {
    const clarifyFaq = faqHits
      .filter((m) => m.confidence >= FAQ_CONFIDENCE_HIT)
      .slice(0, 4)
      .map((m) => faqLink(locale, m));
    const clarifyKb = kbHits
      .filter((m) => m.confidence >= KB_CONFIDENCE_HIT)
      .slice(0, 4)
      .map((m) => kbLink(locale, m));
    const clarifyProducts = relatedProductLinks(productHits, 3);
    const links = uniqueLinks([...clarifyProducts, ...clarifyFaq, ...clarifyKb], 8);
    actions.add("open_ticket");
    actions.add("book_appointment");
    actions.add("contact");
    ensureHostingDomainActions(actions, question, hostingOnly, productHits);

    return {
      answer: `${greeting(locale, hostingOnly)} ${clarifyCopy(locale)}${formatLinksInAnswer(locale, links)}`,
      faqId: null,
      categoryId: null,
      matchedQuestion: null,
      confidence: topConfidence,
      actions: [...actions],
      intents,
      mode: "clarify",
      links,
    };
  }

  // Strong / solid FAQ answer (question must cover the query)
  if (faqReliable && bestFaq) {
    const links = uniqueLinks(
      [
        ...relatedProductLinks(productHits, 3),
        faqLink(locale, bestFaq),
        ...relatedKbLinks(locale, `${bestFaq.question} ${question}`, kbHits, 3),
      ],
      6,
    );
    let answer = `${greeting(locale, hostingOnly)} ${bestFaq.answer}`;
    answer += formatLinksInAnswer(locale, links);
    if (!faqStrong) {
      answer += escalateHint(locale);
      actions.add("open_ticket");
      actions.add("book_appointment");
    }
    if (intents.includes("book_appointment")) actions.add("book_appointment");
    ensureHostingDomainActions(actions, question, hostingOnly, productHits);

    return {
      answer,
      faqId: bestFaq.faqId,
      categoryId: bestFaq.categoryId,
      matchedQuestion: bestFaq.question,
      confidence: bestFaq.confidence,
      actions: [...actions],
      intents,
      mode: "answer",
      links,
    };
  }

  // Prefer strong KB when FAQ cover is weak but KB is solid
  if (kbHit && bestKb && (kbStrong || !faqReliable)) {
    const links = uniqueLinks(
      [
        ...relatedProductLinks(productHits, 2),
        kbLink(locale, bestKb),
        ...kbHits
          .filter((m) => m.slug !== bestKb.slug && m.confidence >= KB_CONFIDENCE_HIT)
          .slice(0, 3)
          .map((m) => kbLink(locale, m)),
        ...faqHits
          .filter((m) => m.confidence >= FAQ_CONFIDENCE_HIT)
          .slice(0, 2)
          .map((m) => faqLink(locale, m)),
      ],
      6,
    );
    let answer = `${greeting(locale, hostingOnly)} ${kbAnswerLead(locale, bestKb)}${formatLinksInAnswer(locale, links)}`;
    if (!kbStrong) {
      answer += escalateHint(locale);
      actions.add("open_ticket");
      actions.add("book_appointment");
    }
    actions.add("contact");
    ensureHostingDomainActions(actions, question, hostingOnly, productHits);

    return {
      answer,
      faqId: null,
      categoryId: null,
      matchedQuestion: bestKb.title,
      confidence: bestKb.confidence,
      actions: [...actions],
      intents,
      mode: "answer",
      links,
    };
  }

  // Soft suggestions + escalate
  const softLinks = uniqueLinks(
    [
      ...relatedProductLinks(productHits, 4),
      ...faqHits.slice(0, 4).map((m) => faqLink(locale, m)),
      ...kbHits.slice(0, 4).map((m) => kbLink(locale, m)),
    ],
    6,
  );
  actions.add("open_ticket");
  actions.add("book_appointment");
  actions.add("contact");
  ensureHostingDomainActions(actions, question, hostingOnly, productHits);

  return {
    answer: `${greeting(locale, hostingOnly)} ${lowConfidenceCopy(locale)}${formatLinksInAnswer(locale, softLinks)}`,
    faqId: null,
    categoryId: null,
    matchedQuestion: null,
    confidence: topConfidence,
    actions: [...actions],
    intents,
    mode: softLinks.length > 1 ? "clarify" : "answer",
    links: softLinks,
  };
}

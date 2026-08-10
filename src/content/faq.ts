export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqContent = {
  title: string;
  subtitle: string;
  items: FaqItem[];
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
};

const en: FaqContent = {
  title: "Frequently asked questions",
  subtitle: "Clear answers about TripleZero iT services, security, SEO and support.",
  ctaTitle: "Still need help?",
  ctaText: "Can't find your answer? Contact our team and we'll get back to you quickly.",
  ctaButton: "Contact us",
  items: [
    {
      id: "start",
      question: "How do I get started with TripleZero iT?",
      answer:
        "Contact us through the website to schedule a consultation. We assess your needs and provide a customized plan to improve your website, visibility and growth systems.",
    },
    {
      id: "bugs",
      question: "What types of bugs and errors can be fixed?",
      answer:
        "We fix a wide range of website issues, including broken links, form errors, display problems, plugin conflicts and functionality glitches.",
    },
    {
      id: "audit",
      question: "How do you identify issues on my website?",
      answer:
        "We run comprehensive audits covering performance, security, user experience and SEO/AEO/GEO, then prioritize the highest-impact fixes.",
    },
    {
      id: "security",
      question: "How do we enhance website security?",
      answer:
        "Security work can include SSL, firewalls, malware scanning, hardening, regular updates and secure coding practices to protect your site from threats.",
    },
    {
      id: "speed",
      question: "How can you improve my website's speed?",
      answer:
        "We reduce load times with caching, code minification, image optimization, better hosting setup and improved server response times.",
    },
    {
      id: "seo",
      question: "What are the benefits of your SEO services?",
      answer:
        "Our SEO and AEO/GEO work improves rankings and AI-search visibility, drives more organic traffic, and strengthens content structure, keywords and technical foundations.",
    },
    {
      id: "timeline",
      question: "How long does it take to see improvements?",
      answer:
        "Some fixes show immediate results. SEO and conversion improvements usually build over weeks, depending on complexity and competition.",
    },
    {
      id: "downtime",
      question: "Will my website experience downtime during the fixes?",
      answer:
        "We aim for minimal disruption. If downtime is required, we schedule it during off-peak hours whenever possible.",
    },
    {
      id: "platforms",
      question: "Are your services suitable for all types of websites?",
      answer:
        "Yes. We support e-commerce sites, blogs, portfolios, business websites and custom platforms across many industries.",
    },
    {
      id: "maintenance",
      question: "Can you help with ongoing maintenance?",
      answer:
        "Yes. We offer ongoing maintenance including updates, backups, security monitoring and performance optimization.",
    },
    {
      id: "account",
      question: "I have an issue with my account, what can I do?",
      answer:
        "Reach out via the contact page with your account details and issue. Our support team will help resolve it promptly.",
    },
    {
      id: "cancel",
      question: "Can I cancel at any time?",
      answer:
        "Yes, you can cancel services at any time. Contact support and we will help with the cancellation process.",
    },
  ],
};

const nl: FaqContent = {
  title: "Veelgestelde vragen",
  subtitle:
    "Duidelijke antwoorden over TripleZero iT diensten, beveiliging, SEO en support.",
  ctaTitle: "Nog hulp nodig?",
  ctaText:
    "Staat uw vraag er niet tussen? Neem contact op — we reageren zo snel mogelijk.",
  ctaButton: "Neem contact op",
  items: [
    {
      id: "start",
      question: "Hoe begin ik met TripleZero iT?",
      answer:
        "Neem contact op via de website voor een consult. We bekijken uw situatie en maken een plan op maat voor website, vindbaarheid en groei.",
    },
    {
      id: "bugs",
      question: "Welke bugs en fouten kunnen jullie oplossen?",
      answer:
        "We lossen uiteenlopende problemen op: kapotte links, formulierfouten, weergaveproblemen, plugin-conflicten en functionele glitches.",
    },
    {
      id: "audit",
      question: "Hoe vinden jullie problemen op mijn website?",
      answer:
        "We doen een complete audit op performance, security, gebruikerservaring en SEO/AEO/GEO, en prioriteren daarna de belangrijkste verbeteringen.",
    },
    {
      id: "security",
      question: "Hoe verbeteren jullie de websitebeveiliging?",
      answer:
        "Denk aan SSL, firewalls, malware-scans, hardening, updates en veilige codepraktijken om uw site te beschermen.",
    },
    {
      id: "speed",
      question: "Hoe maken jullie mijn website sneller?",
      answer:
        "We verkorten laadtijden met caching, code-minificatie, image-optimalisatie, betere hosting en snellere serverrespons.",
    },
    {
      id: "seo",
      question: "Wat leveren jullie SEO-diensten op?",
      answer:
        "SEO én AEO/GEO verbeteren rankings en AI-vindbaarheid, brengen meer organisch verkeer en versterken content, keywords en technische structuur.",
    },
    {
      id: "timeline",
      question: "Hoe lang duurt het voor ik resultaat zie?",
      answer:
        "Sommige fixes werken meteen. SEO- en conversieresultaten bouwen meestal over weken op, afhankelijk van complexiteit en concurrentie.",
    },
    {
      id: "downtime",
      question: "Gaat mijn website offline tijdens werkzaamheden?",
      answer:
        "We beperken verstoring zoveel mogelijk. Als downtime nodig is, plannen we die bij voorkeur buiten piekuren.",
    },
    {
      id: "platforms",
      question: "Werken jullie diensten voor alle soorten websites?",
      answer:
        "Ja. We helpen webshops, blogs, portfolio’s, bedrijfswebsites en maatwerkplatforms in verschillende branches.",
    },
    {
      id: "maintenance",
      question: "Kunnen jullie ook doorlopend onderhoud doen?",
      answer:
        "Ja. We bieden doorlopend onderhoud met updates, backups, security-monitoring en performance-optimalisatie.",
    },
    {
      id: "account",
      question: "Ik heb een accountprobleem, wat nu?",
      answer:
        "Neem contact op via de contactpagina met uw gegevens en het probleem. Ons supportteam helpt u snel verder.",
    },
    {
      id: "cancel",
      question: "Kan ik op elk moment opzeggen?",
      answer:
        "Ja, u kunt diensten op elk moment stopzetten. Neem contact op met support en we regelen de opzegging.",
    },
  ],
};

export function getFaqContent(locale: string): FaqContent {
  return locale === "nl" ? nl : en;
}

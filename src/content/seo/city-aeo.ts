import type { SeoCity } from "@/content/seo/cities";
import {
  cityCountryName,
  cityDisplayName,
  cityRegionName,
} from "@/content/seo/cities";

export type CityFaqItem = { question: string; answer: string };

function isNl(locale: string) {
  return locale === "nl";
}

/** Direct answer block — optimized for AI citation / featured snippets. */
export function cityDirectAnswer(city: SeoCity, locale: string) {
  const name = cityDisplayName(city, locale);
  const country = cityCountryName(city, locale);
  const region = cityRegionName(city, locale);
  if (isNl(locale)) {
    return `TripleZero iT levert AI-integratie, AEO (Answer Engine Optimization), GEO (Generative Engine Optimization) en klassieke SEO voor bedrijven in ${name} (${region}, ${country}). Doel: zichtbaar worden in Google, lokale zoekresultaten en AI-antwoorden — met meetbare groei.`;
  }
  return `TripleZero iT provides AI integration, AEO (Answer Engine Optimization), GEO (Generative Engine Optimization) and classic SEO for businesses in ${name} (${region}, ${country}). Goal: get found in Google, local results and AI answers — with measurable growth.`;
}

export function cityFaqItems(city: SeoCity, locale: string): CityFaqItem[] {
  const name = cityDisplayName(city, locale);
  const country = cityCountryName(city, locale);

  if (isNl(locale)) {
    return [
      {
        question: `Helpt TripleZero iT met AEO, GEO en SEO in ${name}?`,
        answer: `Ja. TripleZero iT ondersteunt organisaties in ${name} (${country}) met Answer Engine Optimization (AEO), Generative Engine Optimization (GEO) en klassieke SEO, plus AI-integratie, webdesign en digital marketing. We starten vaak met een gratis AI-scan van jullie website.`,
      },
      {
        question: `Wat is AEO voor bedrijven in ${name}?`,
        answer: `AEO (Answer Engine Optimization) maakt jullie merk en diensten citeerbaar in AI-antwoorden (ChatGPT, Perplexity, Gemini en vergelijkbare answer engines). Voor ${name} betekent dat: duidelijke antwoorden, FAQ-structuur, lokale context en structured data zodat AI-systemen TripleZero iT en jullie merk correct kunnen vermelden.`,
      },
      {
        question: `Wat is GEO (Generative Engine Optimization) in ${name}?`,
        answer: `GEO versterkt zichtbaarheid in generatieve zoekresultaten — samenvattingen en antwoorden die AI-engines samenstellen. In ${name} combineren we unieke, feitelijke content, lokale signalen (stad, regio, land) en technische mark-up zodat jullie sneller worden opgenomen in die antwoorden.`,
      },
      {
        question: `Werkt TripleZero iT ook voor lokale SEO in ${name}?`,
        answer: `Ja. Naast AEO en GEO optimaliseren we voor klassieke Google-zoekopdrachten en lokale intentie in ${name}: technische SEO, content, interne links, Core Web Vitals en geo-signalen (plaats, regio, coördinaten) zodat zoekmachines jullie bereik in ${country} begrijpen.`,
      },
      {
        question: `Hoe start ik met AI, AEO, GEO of SEO in ${name}?`,
        answer: `Vraag een gratis AI-scan aan of plan een afspraak. We beoordelen jullie huidige vindbaarheid in ${name}, geven scores voor AEO/GEO/SEO en stellen een concreet verbeterplan voor — van snelle wins tot structurele groei.`,
      },
    ];
  }

  return [
    {
      question: `Does TripleZero iT help with AEO, GEO and SEO in ${name}?`,
      answer: `Yes. TripleZero iT supports organizations in ${name} (${country}) with Answer Engine Optimization (AEO), Generative Engine Optimization (GEO) and classic SEO, plus AI integration, web design and digital marketing. We often start with a free AI scan of your website.`,
    },
    {
      question: `What is AEO for businesses in ${name}?`,
      answer: `AEO (Answer Engine Optimization) makes your brand and services citable in AI answers (ChatGPT, Perplexity, Gemini and similar answer engines). For ${name}, that means clear answers, FAQ structure, local context and structured data so AI systems can mention TripleZero iT and your brand accurately.`,
    },
    {
      question: `What is GEO (Generative Engine Optimization) in ${name}?`,
      answer: `GEO strengthens visibility in generative search results — summaries and answers that AI engines assemble. In ${name} we combine factual, unique content, local signals (city, region, country) and technical markup so you are more likely to be included in those answers.`,
    },
    {
      question: `Does TripleZero iT also handle local SEO in ${name}?`,
      answer: `Yes. Alongside AEO and GEO we optimize for classic Google queries and local intent in ${name}: technical SEO, content, internal links, Core Web Vitals and geo signals (place, region, coordinates) so search engines understand your reach in ${country}.`,
    },
    {
      question: `How do I start with AI, AEO, GEO or SEO in ${name}?`,
      answer: `Request a free AI scan or book an appointment. We assess your current visibility in ${name}, score AEO/GEO/SEO and propose a concrete plan — from quick wins to structural growth.`,
    },
  ];
}

export function citySectionCopy(city: SeoCity, locale: string) {
  const name = cityDisplayName(city, locale);
  if (isNl(locale)) {
    return {
      aeoTitle: `AEO in ${name}`,
      aeoBody: `Answer engines geven steeds vaker directe antwoorden in plaats van alleen blauwe links. Met AEO in ${name} structureren we content, FAQ’s en entity-signalen zodat AI-systemen jullie diensten betrouwbaar kunnen citeren.`,
      geoTitle: `GEO in ${name}`,
      geoBody: `Generative Engine Optimization zorgt dat jullie merk meekomt in AI-samenvattingen voor zoekers in en rond ${name}. We koppelen lokale feiten, dienstenaanbod en technische schema’s aan meetbare vindbaarheid.`,
      seoTitle: `SEO in ${name}`,
      seoBody: `Klassieke SEO blijft de basis: crawlbaarheid, snelle pagina’s, sterke pages en lokale zoekintentie in ${name}. AEO en GEO bouwen daarop voort — zonder technische SEO geen betrouwbare AI-citaties.`,
      whyTitle: `Waarom TripleZero iT in ${name}`,
      whyBody: `Eén partner voor AI-integratie, AEO, GEO, SEO, webdesign, WordPress, hosting en marketing — afgestemd op bedrijven die in ${name} en daarbuiten willen groeien.`,
    };
  }
  return {
    aeoTitle: `AEO in ${name}`,
    aeoBody: `Answer engines increasingly give direct answers instead of only blue links. With AEO in ${name} we structure content, FAQs and entity signals so AI systems can cite your services reliably.`,
    geoTitle: `GEO in ${name}`,
    geoBody: `Generative Engine Optimization helps your brand appear in AI summaries for searchers in and around ${name}. We connect local facts, service offerings and technical schema to measurable visibility.`,
    seoTitle: `SEO in ${name}`,
    seoBody: `Classic SEO remains the foundation: crawlability, fast pages, strong landing pages and local search intent in ${name}. AEO and GEO build on that — without technical SEO, AI citations are unreliable.`,
    whyTitle: `Why TripleZero iT in ${name}`,
    whyBody: `One partner for AI integration, AEO, GEO, SEO, web design, WordPress, hosting and marketing — built for businesses that want to grow in ${name} and beyond.`,
  };
}

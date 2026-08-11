import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { SoftLink } from "@/components/shared/SoftLink";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { ServiceCard } from "@/components/content/ServiceCard";
import { Reveal } from "@/components/marketing/Reveal";
import { ServiceInquiryDialog } from "@/components/marketing/ServiceInquiryDialog";
import {
  getCatalogItem,
  getServiceSlugs,
  serviceCatalog,
  serviceGroups,
  serviceHref,
} from "@/content/fixweb/catalog";
import { formatEuro, getServiceCardMeta, getServiceContent } from "@/lib/fixweb-content";
import { buildServiceMetadata } from "@/lib/seo";

const aiInquiryBySlug: Record<
  string,
  {
    source: string;
    messageHintNl: string;
    messageHintEn: string;
    triggerNl: string;
    triggerEn: string;
    ctaTitleNl: string;
    ctaTitleEn: string;
    ctaTextNl: string;
    ctaTextEn: string;
  }
> = {
  "ai-in-wordpress": {
    source: "AI_IN_WORDPRESS",
    messageHintNl: "WordPress-website",
    messageHintEn: "WordPress website",
    triggerNl: "Vraag AI voor WordPress aan",
    triggerEn: "Request AI for WordPress",
    ctaTitleNl: "AI in uw WordPress laten bouwen?",
    ctaTitleEn: "Want AI built into your WordPress?",
    ctaTextNl:
      "Stuur een korte aanvraag via het formulier — we kijken mee naar chatbots, content-AI, WooCommerce of maatwerk en reageren met concrete stappen.",
    ctaTextEn:
      "Send a short request via the form — we’ll review chatbots, content AI, WooCommerce or custom builds and reply with concrete next steps.",
  },
  "ai-in-ecommerce": {
    source: "AI_IN_ECOMMERCE",
    messageHintNl: "webshop",
    messageHintEn: "webshop",
    triggerNl: "Vraag AI voor E-commerce aan",
    triggerEn: "Request AI for E-commerce",
    ctaTitleNl: "AI in uw webshop laten bouwen?",
    ctaTitleEn: "Want AI built into your webshop?",
    ctaTextNl:
      "Stuur een korte aanvraag — we kijken mee naar productassistenten, search, cart-hulp of support-AI en reageren met concrete stappen.",
    ctaTextEn:
      "Send a short request — we’ll review product assistants, search, cart help or support AI and reply with concrete next steps.",
  },
  "ai-in-website": {
    source: "AI_IN_WEBSITE",
    messageHintNl: "maatwerkwebsite",
    messageHintEn: "custom website",
    triggerNl: "Vraag AI voor website aan",
    triggerEn: "Request AI for website",
    ctaTitleNl: "AI in uw website laten bouwen?",
    ctaTitleEn: "Want AI built into your website?",
    ctaTextNl:
      "Stuur een korte aanvraag — we kijken mee naar chat, leadkwalificatie, knowledge search of maatwerk-AI op uw stack en reageren met concrete stappen.",
    ctaTextEn:
      "Send a short request — we’ll review chat, lead qualification, knowledge search or custom AI on your stack and reply with concrete next steps.",
  },
};

export function generateStaticParams() {
  return getServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const content = getServiceContent(slug, locale);
  if (!content) return { title: "Not found", robots: { index: false } };
  return buildServiceMetadata({
    locale,
    slug,
    title: content.title,
    description: content.subtitle,
    image: content.image,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isNl = locale === "nl";
  const content = getServiceContent(slug, locale);
  if (!content) notFound();

  const meta = getCatalogItem(slug);
  const groupLabel = serviceGroups.find((g) => g.id === meta?.group);
  const inquiry = aiInquiryBySlug[slug];
  const related = serviceCatalog
    .filter(
      (item) =>
        item.group === meta?.group &&
        item.slug !== slug &&
        !item.href,
    )
    .map((item) => ({ item, relatedContent: getServiceCardMeta(item.slug, locale) }))
    .filter(({ relatedContent }) => Boolean(relatedContent?.hasBody))
    .slice(0, 3);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 15% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 55%), radial-gradient(ellipse 60% 45% at 95% 70%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <Reveal>
            <p className="text-sm text-muted-foreground">
              <SoftLink href={`/${locale}/diensten`} className="hover:text-foreground">
                {isNl ? "Diensten" : "Services"}
              </SoftLink>
              <span className="mx-2">/</span>
              <span>{content.title}</span>
            </p>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                {groupLabel ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    {isNl ? groupLabel.titleNl : groupLabel.title}
                  </p>
                ) : null}
                <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                  {content.title}
                </h1>
                {content.subtitle ? (
                  <p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">
                    {content.subtitle}
                  </p>
                ) : null}
                {typeof content.price === "number" ? (
                  <p className="mt-6 font-display text-3xl font-bold text-foreground">
                    {formatEuro(content.price)}
                    {"priceSuffix" in content && content.priceSuffix ? (
                      <span className="ml-2 text-base font-medium text-muted-foreground">
                        {content.priceSuffix}
                      </span>
                    ) : null}
                  </p>
                ) : null}
                {"features" in content && Array.isArray(content.features) && content.features.length ? (
                  <ul className="mt-5 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                    {content.features.slice(0, 8).map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-8 flex flex-wrap gap-3">
                  {inquiry ? (
                    <ServiceInquiryDialog
                      serviceTitle={content.title}
                      source={inquiry.source}
                      messageHint={isNl ? inquiry.messageHintNl : inquiry.messageHintEn}
                      triggerLabel={isNl ? inquiry.triggerNl : inquiry.triggerEn}
                    />
                  ) : slug === "ai-scan" ? (
                    <Button asChild size="lg" className="rounded-2xl">
                      <SoftLink href={`/${locale}/ai-scan`}>
                        {isNl ? "Start gratis AI-scan" : "Start free AI scan"}
                      </SoftLink>
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="rounded-2xl">
                      <SoftLink href={`/${locale}/afspraak`}>
                        {isNl ? "Boek een afspraak" : "Book an appointment"}
                      </SoftLink>
                    </Button>
                  )}
                  <Button asChild size="lg" variant="outline" className="rounded-2xl">
                    <SoftLink href={`/${locale}/contact`}>
                      {isNl ? "Contact" : "Contact"}
                    </SoftLink>
                  </Button>
                </div>
              </div>
              {content.image ? (
                <div className="relative aspect-4/3 overflow-hidden rounded-[1.75rem] border border-border/70 shadow-sm">
                  <Image
                    src={content.image}
                    alt={content.title}
                    fill
                    className="object-cover"
                    unoptimized
                    priority
                  />
                </div>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <Reveal delay={0.05}>
          <div className="glass glow-hover relative overflow-hidden rounded-[1.75rem] p-6 md:p-10">
            {content.blocks.length ? (
              <ContentBlocks blocks={content.blocks} />
            ) : (
              <p className="text-muted-foreground">
                {isNl
                  ? "Neem contact op voor een voorstel op maat."
                  : "Contact us for a tailored proposal."}
              </p>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-10 rounded-[1.75rem] border border-border/70 bg-linear-to-br from-primary/10 via-background to-accent/10 px-6 py-8 md:px-10">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {inquiry
                ? isNl
                  ? inquiry.ctaTitleNl
                  : inquiry.ctaTitleEn
                : isNl
                  ? "Klaar om te starten?"
                  : "Ready to get started?"}
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {inquiry
                ? isNl
                  ? inquiry.ctaTextNl
                  : inquiry.ctaTextEn
                : isNl
                  ? "Plan een intake of stuur een bericht — we reageren snel met een concreet voorstel."
                  : "Book an intake or send a message — we’ll reply quickly with a concrete proposal."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {inquiry ? (
                <ServiceInquiryDialog
                  serviceTitle={content.title}
                  source={inquiry.source}
                  messageHint={isNl ? inquiry.messageHintNl : inquiry.messageHintEn}
                  triggerLabel={isNl ? "Open contactformulier" : "Open contact form"}
                />
              ) : (
                <Button asChild className="rounded-2xl">
                  <SoftLink href={`/${locale}/afspraak`}>
                    {isNl ? "Boek een afspraak" : "Book an appointment"}
                  </SoftLink>
                </Button>
              )}
              <Button asChild variant="outline" className="rounded-2xl">
                <SoftLink href={`/${locale}/ai-scan`}>
                  {isNl ? "Gratis AI-scan" : "Free AI scan"}
                </SoftLink>
              </Button>
            </div>
          </div>
        </Reveal>

        {related.length ? (
          <section className="mt-14">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                {isNl ? "Gerelateerde diensten" : "Related services"}
              </h2>
            </Reveal>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map(({ item, relatedContent }, i) => (
                <Reveal key={item.slug} delay={i * 0.04}>
                  <ServiceCard
                    href={serviceHref(locale, item)}
                    title={isNl ? item.titleNl : item.title}
                    summary={relatedContent?.subtitle || ""}
                    price={relatedContent?.price ?? undefined}
                    image={relatedContent?.image ?? undefined}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

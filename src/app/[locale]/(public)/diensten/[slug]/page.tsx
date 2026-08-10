import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { SoftLink } from "@/components/shared/SoftLink";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { ServiceCard } from "@/components/content/ServiceCard";
import { Reveal } from "@/components/marketing/Reveal";
import {
  getCatalogItem,
  getServiceSlugs,
  serviceCatalog,
  serviceHref,
} from "@/content/fixweb/catalog";
import { formatEuro, getServiceContent } from "@/lib/fixweb-content";

export function generateStaticParams() {
  return getServiceSlugs().map((slug) => ({ slug }));
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
  const related = serviceCatalog
    .filter(
      (item) =>
        item.group === meta?.group &&
        item.slug !== slug &&
        !item.href,
    )
    .map((item) => ({ item, relatedContent: getServiceContent(item.slug, locale) }))
    .filter(
      ({ relatedContent }) =>
        relatedContent &&
        (relatedContent.blocks.length > 0 || typeof relatedContent.price === "number"),
    )
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
                {meta?.group ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    {meta.group === "marketing"
                      ? isNl
                        ? "Marketing & Groei"
                        : "Marketing & Growth"
                      : meta.group === "webdesign"
                        ? "Webdesign & Support"
                        : meta.group === "design"
                          ? "Digital Design"
                          : meta.group === "hosting"
                            ? isNl
                              ? "Hosting & Domeinen"
                              : "Hosting & Domains"
                            : "WordPress & Support"}
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
                  </p>
                ) : null}
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-2xl">
                    <SoftLink href={`/${locale}/afspraak`}>
                      {isNl ? "Afspraak boeken" : "Book appointment"}
                    </SoftLink>
                  </Button>
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
          <div className="glass rounded-[1.75rem] p-6 md:p-10">
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
              {isNl ? "Klaar om te starten?" : "Ready to get started?"}
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {isNl
                ? "Plan een intake of stuur een bericht — we reageren snel met een concreet voorstel."
                : "Book an intake or send a message — we’ll reply quickly with a concrete proposal."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild className="rounded-2xl">
                <SoftLink href={`/${locale}/afspraak`}>
                  {isNl ? "Afspraak boeken" : "Book appointment"}
                </SoftLink>
              </Button>
              <Button asChild variant="outline" className="rounded-2xl">
                <SoftLink href={`/${locale}/ai-scan`}>
                  {isNl ? "Gratis AI-Scan" : "Free AI Scan"}
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

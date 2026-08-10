import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { SoftLink } from "@/components/shared/SoftLink";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { Reveal } from "@/components/marketing/Reveal";
import { getServiceSlugs } from "@/content/fixweb/catalog";
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
  const content = getServiceContent(slug);
  if (!content) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <Reveal>
        <p className="text-sm text-muted-foreground">
          <SoftLink href={`/${locale}/diensten`} className="hover:text-foreground">
            {locale === "nl" ? "Diensten" : "Services"}
          </SoftLink>
          <span className="mx-2">/</span>
          <span>{content.title}</span>
        </p>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
              {content.title}
            </h1>
            {content.subtitle ? (
              <p className="mt-4 whitespace-pre-line text-muted-foreground md:text-lg">
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
                  {locale === "nl" ? "Afspraak boeken" : "Book appointment"}
                </SoftLink>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl">
                <SoftLink href={`/${locale}/contact`}>
                  {locale === "nl" ? "Contact" : "Contact"}
                </SoftLink>
              </Button>
            </div>
          </div>
          {content.image ? (
            <div className="relative aspect-4/3 overflow-hidden rounded-[1.75rem] border border-border/70">
              <Image
                src={content.image}
                alt={content.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : null}
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="glass mt-12 rounded-[1.75rem] p-6 md:p-10">
          <ContentBlocks blocks={content.blocks} />
        </div>
      </Reveal>
    </div>
  );
}

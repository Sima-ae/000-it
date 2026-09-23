import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/Reveal";
import { GlassCard } from "@/components/marketing/GlassCard";
import { ServiceCard } from "@/components/content/ServiceCard";
import { ServicesJumpNav } from "@/components/content/ServicesJumpNav";
import { SoftLink } from "@/components/shared/SoftLink";
import {
  catalogGroupSummary,
  getServiceGroup,
  isServiceGroupId,
  serviceGroups,
  serviceGroupHref,
  serviceGroupPath,
  serviceHref,
  sortedServiceGroups,
} from "@/content/fixweb/catalog";
import { catalogGroupTitle } from "@/content/fixweb/catalog-title";
import { listServiceGroupCards } from "@/lib/service-group-listing";
import { buildPageMetadata } from "@/lib/seo";
import { localizedHref } from "@/i18n/pathnames";

type Params = { params: Promise<{ locale: string; group: string }> };

export function generateStaticParams() {
  return serviceGroups
    .filter((group) => group.id !== "design")
    .map((group) => ({ group: group.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, group: groupId } = await params;
  if (groupId === "design") {
    return { title: "Design", robots: { index: false } };
  }
  if (!isServiceGroupId(groupId)) {
    return { title: "Not found", robots: { index: false } };
  }
  const group = getServiceGroup(groupId);
  if (!group) return { title: "Not found", robots: { index: false } };
  const title = catalogGroupTitle(group.id, locale, group.title);
  const description = catalogGroupSummary(group.id, locale);
  return buildPageMetadata({
    locale,
    path: serviceGroupPath(group.id),
    title,
    description,
    keywords: [title, locale === "nl" ? "diensten" : "services", "TripleZero iT"],
  });
}

export default async function ServiceCategoryPage({ params }: Params) {
  const { locale, group: groupId } = await params;
  setRequestLocale(locale);
  if (groupId === "design") {
    redirect(localizedHref(locale, "/design"));
  }
  if (!isServiceGroupId(groupId)) notFound();

  const group = getServiceGroup(groupId);
  if (!group) notFound();

  const t = await getTranslations("services");
  const tNav = await getTranslations("nav");
  const title = catalogGroupTitle(group.id, locale, group.title);
  const summary = catalogGroupSummary(group.id, locale);
  const cards = await listServiceGroupCards(locale, group.id, {
    includeCustomHref: true,
  });
  if (!cards.length) notFound();

  const otherGroups = sortedServiceGroups(locale).filter((item) => item.id !== group.id);
  const jumpLinks = cards.map((card) => ({
    key: card.item.slug,
    id: card.item.slug,
    label: card.title,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-14 pt-8 md:px-6 md:pb-20 md:pt-10">
      <p className="text-sm text-muted-foreground">
        <SoftLink href={localizedHref(locale, "/diensten")} className="hover:text-foreground">
          {tNav("services")}
        </SoftLink>
        <span className="mx-2">/</span>
        <span>{title}</span>
      </p>

      <Reveal>
        <header className="mt-6 max-w-3xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>
          {summary ? (
            <p className="mt-3 text-muted-foreground md:text-lg">{summary}</p>
          ) : null}
          <p className="mt-2 text-sm text-muted-foreground">
            {cards.length} {t("countLabel")}
          </p>
        </header>
      </Reveal>

      {jumpLinks.length > 2 ? (
        <div className="mt-8">
          <ServicesJumpNav
            locale={locale}
            links={jumpLinks}
            basePath={serviceGroupPath(group.id)}
          />
        </div>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <div
            key={card.item.slug}
            id={card.item.slug}
            className="scroll-mt-(--nav-offset) md:scroll-mt-[calc(var(--nav-offset)+3.25rem)]"
          >
            <Reveal delay={Math.min(i, 8) * 0.03}>
              <ServiceCard
                href={serviceHref(locale, card.item)}
                title={card.title}
                summary={card.summary}
                price={card.price}
                image={card.image}
              />
            </Reveal>
          </div>
        ))}
      </div>

      {otherGroups.length ? (
        <section className="mt-16">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {t("title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
          </Reveal>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherGroups.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.04}>
                <SoftLink href={serviceGroupHref(locale, item.id)} className="block h-full">
                  <GlassCard className="flex h-full flex-col p-5">
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      {catalogGroupTitle(item.id, locale, item.title)}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {catalogGroupSummary(item.id, locale)}
                    </p>
                  </GlassCard>
                </SoftLink>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <Reveal delay={0.08}>
        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" className="rounded-2xl px-7">
            <SoftLink href={localizedHref(locale, "/diensten")}>{t("viewAll")}</SoftLink>
          </Button>
        </div>
      </Reveal>
    </div>
  );
}

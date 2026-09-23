import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/Reveal";
import { GlassCard } from "@/components/marketing/GlassCard";
import { CategoryHero } from "@/components/content/CategoryHero";
import { ServiceCard } from "@/components/content/ServiceCard";
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
import { brandingFallbackForServiceSlug } from "@/lib/branding-images";
import { listServiceGroupCards } from "@/lib/service-group-listing";
import { buildPageMetadata } from "@/lib/seo";
import { localizedHref } from "@/i18n/pathnames";

type Params = { params: Promise<{ locale: string; group: string }> };

/** Shop catalog prices/specs must stay live. */
export const dynamic = "force-dynamic";

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
    <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-5 sm:pb-14 sm:pt-8 md:px-6 md:pb-20 md:pt-10">
      <CategoryHero
        locale={locale}
        groupId={group.id}
        title={title}
        summary={summary || undefined}
        count={cards.length}
        countLabel={t("countLabel")}
        servicesLabel={tNav("services")}
        servicesHref={localizedHref(locale, "/diensten")}
        jumpLinks={jumpLinks.length > 2 ? jumpLinks : undefined}
        jumpBasePath={serviceGroupPath(group.id)}
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:mt-10 lg:grid-cols-3 md:mt-12">
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
                listPrice={card.listPrice}
                image={
                  card.image ||
                  brandingFallbackForServiceSlug(card.item.slug, group.id)
                }
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

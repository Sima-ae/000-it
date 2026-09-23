import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/Reveal";
import { CategoryHero } from "@/components/content/CategoryHero";
import { ServiceCard } from "@/components/content/ServiceCard";
import { SoftLink } from "@/components/shared/SoftLink";
import {
  catalogGroupSummary,
  getServiceGroup,
  serviceGroupPath,
  serviceHref,
} from "@/content/fixweb/catalog";
import { catalogGroupTitle, catalogServiceTitle } from "@/content/fixweb/catalog-title";
import { brandingFallbackForServiceSlug } from "@/lib/branding-images";
import { listServiceGroupCards } from "@/lib/service-group-listing";
import { buildPageMetadata } from "@/lib/seo";
import { localizedHref } from "@/i18n/pathnames";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const group = getServiceGroup("design");
  const title = group
    ? catalogGroupTitle(group.id, locale, group.title)
    : "Design";
  const description = catalogGroupSummary("design", locale);
  return buildPageMetadata({
    locale,
    path: "/design",
    title,
    description,
    keywords: [title, locale === "nl" ? "diensten" : "services", "TripleZero iT"],
  });
}

export default async function DesignCategoryPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);

  const group = getServiceGroup("design");
  if (!group) return null;

  const t = await getTranslations("services");
  const tNav = await getTranslations("nav");
  const title = catalogGroupTitle(group.id, locale, group.title);
  const summary = catalogGroupSummary(group.id, locale);
  const cards = (
    await listServiceGroupCards(locale, "design", {
      includeCustomHref: true,
    })
  ).sort((a, b) =>
    catalogServiceTitle(a.item.slug, locale, a.item.title).localeCompare(
      catalogServiceTitle(b.item.slug, locale, b.item.title),
      locale,
      { sensitivity: "base" },
    ),
  );

  const jumpLinks = cards.map((card) => ({
    key: card.item.slug,
    id: card.item.slug,
    label: card.title,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-5 sm:pb-14 sm:pt-8 md:px-6 md:pb-20 md:pt-10">
      <CategoryHero
        locale={locale}
        groupId="design"
        title={title}
        summary={summary || undefined}
        count={cards.length}
        countLabel={t("countLabel")}
        servicesLabel={tNav("services")}
        servicesHref={localizedHref(locale, "/diensten")}
        jumpLinks={jumpLinks.length > 2 ? jumpLinks : undefined}
        jumpBasePath={serviceGroupPath("design")}
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
                  brandingFallbackForServiceSlug(card.item.slug, "design")
                }
              />
            </Reveal>
          </div>
        ))}
      </div>

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

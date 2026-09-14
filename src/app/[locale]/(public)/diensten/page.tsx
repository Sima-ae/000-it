import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/marketing/Reveal";
import { ServiceCard } from "@/components/content/ServiceCard";
import { ServicesJumpNav } from "@/components/content/ServicesJumpNav";
import { SoftLink } from "@/components/shared/SoftLink";
import {
  serviceCatalog,
  serviceHref,
  sortedServiceGroups,
} from "@/content/fixweb/catalog";
import {
  catalogGroupTitle,
  catalogServiceSummary,
  catalogServiceTitle,
} from "@/content/fixweb/catalog-title";
import { getServiceCardMeta } from "@/lib/fixweb-content";
import { buildStaticPageMetadata } from "@/lib/seo";
import { hashFor, localizedHref } from "@/i18n/pathnames";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "/diensten");
}

const aiServices = [
  { key: "ai", href: "/diensten/ai-integration", image: "/uploads/fixweb/ai-integratie.png" },
  { key: "seo", href: "/diensten/seo-optimization", image: "/uploads/fixweb/aeo-seo.png" },
  {
    key: "web",
    href: "/diensten/custom-webdesign",
    image: "/uploads/fixweb/webdesign-conversie.png",
  },
  { key: "content", href: "/diensten/content-writing", image: "/uploads/fixweb/content-social.png" },
  { key: "ads", href: "/diensten/digital-marketing", image: "/uploads/fixweb/ai-advertising.png" },
  { key: "software", href: "/diensten/nextjs-development", image: "/uploads/fixweb/maatwerk-software.png" },
] as const;

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");

  const groupSections = (
    await Promise.all(
      sortedServiceGroups(locale).map(async (group) => {
        const items = serviceCatalog.filter(
          (item) => item.group === group.id && item.slug !== "digital-design",
        );
        const cards = (
          await Promise.all(
            items.map(async (item) => ({
              item,
              content: await getServiceCardMeta(item.slug, locale),
            })),
          )
        ).filter(({ content }) => Boolean(content?.hasBody));
        return { group, cards };
      }),
    )
  ).filter(({ cards }) => cards.length > 0);

  const marketingJumpButtons = [
    { key: "content", id: "marketing" },
    { key: "data", id: "data-entry" },
    { key: "ecommerce", id: "marketing" },
    { key: "marketing", id: "marketing" },
    { key: "media", id: "media-creation" },
    { key: "audioVideo", id: "media-creation" },
    { key: "social", id: "marketing" },
    { key: "community", id: "community-management" },
  ] as const;

  const hostingJumpButtons = [
    { key: "webhosting" },
    { key: "domains" },
  ] as const;

  const aiJumpButtons = [
    { key: "ai", id: "ai" },
    { key: "aeo", id: "aeo-optimization" },
    { key: "geo", id: "geo-optimization" },
    { key: "seo", id: "seo-optimization" },
    { key: "chatbots", id: "ai-chatbots" },
    { key: "workflows", id: "ai-workflows" },
    { key: "advice", id: "ai-consultancy" },
    { key: "integration", id: "ai-integration" },
    { key: "automation", id: "ai-automation" },
  ] as const;

  const designJumpButtons = [
    { key: "digitalDesign" },
    { key: "printing" },
  ] as const;

  const webdesignJumpButtons = [
    { key: "webdesign", id: "webdesign" },
    { key: "malware", id: "website-malware-removal" },
    { key: "backup", id: "website-backup-migration" },
    { key: "security", id: "website-security" },
    { key: "speed", id: "website-speed-optimization" },
    { key: "custom", id: "custom-webdesign" },
  ] as const;

  const wordpressJumpButtons = [
    { key: "wordpress", id: "wordpress" },
    { key: "maintenance", id: "wordpress-maintenance-updates" },
    { key: "support", id: "premium-support" },
  ] as const;

  function groupLabel(group: { id: string; title: string; titleNl: string }) {
    if (group.id === "marketing") return t("groupMarketing");
    return catalogGroupTitle(group.id, locale, group.title);
  }

  const jumpLinks = [
    {
      key: "meest-populair",
      id: hashFor(locale, "meest-populair"),
      label: t("mostPopular"),
    },
    ...groupSections
      .flatMap(({ group }) => {
        if (group.id === "ai") {
          return aiJumpButtons.map((button) => ({
            key: `ai-${button.key}`,
            id: button.id,
            label: t(`jump.${button.key}`),
          }));
        }
        if (group.id === "marketing") {
          return marketingJumpButtons.map((button) => ({
            key: `marketing-${button.key}`,
            id: button.id,
            label: t(`jump.${button.key}`),
          }));
        }
        if (group.id === "hosting") {
          return hostingJumpButtons.map((button) => ({
            key: `hosting-${button.key}`,
            id: "hosting",
            label: t(`jump.${button.key}`),
          }));
        }
        if (group.id === "design") {
          return designJumpButtons.map((button) => ({
            key: `design-${button.key}`,
            id: "design",
            label: t(`jump.${button.key}`),
          }));
        }
        if (group.id === "webdesign") {
          return webdesignJumpButtons.map((button) => ({
            key: `webdesign-${button.key}`,
            id: button.id,
            label: t(`jump.${button.key}`),
          }));
        }
        if (group.id === "wordpress") {
          return wordpressJumpButtons.map((button) => ({
            key: `wordpress-${button.key}`,
            id: button.id,
            label: t(`jump.${button.key}`),
          }));
        }
        // All known service groups are handled above.
        return [] as Array<{ key: string; id: string; label: string }>;
      })
      .sort((a, b) =>
        a.label.localeCompare(b.label, locale, { sensitivity: "base" }),
      ),
  ];

  const cardScrollClass = "scroll-mt-[calc(var(--nav-offset)+3.25rem)]";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-14 pt-0 md:px-6 md:pb-20">
      <ServicesJumpNav locale={locale} links={jumpLinks} />

      <section
        id={hashFor(locale, "meest-populair")}
        className="mt-6 scroll-mt-[calc(var(--nav-offset)+3.25rem)]"
      >
        <Reveal>
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {t("mostPopular")}
          </h2>
        </Reveal>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {aiServices.map((item, i) => (
            <Reveal key={item.key} delay={i * 0.04}>
              <ServiceCard
                href={localizedHref(locale, item.href)}
                title={t(`items.${item.key}.title`)}
                summary={t(`items.${item.key}.desc`)}
                image={item.image}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {groupSections.map(({ group, cards }) => (
        <section
          key={group.id}
          id={group.id}
          className="mt-16 scroll-mt-[calc(var(--nav-offset)+3.25rem)]"
        >
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                  {groupLabel(group)}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cards.length} {t("countLabel")}
                </p>
              </div>
              {group.id === "design" ? (
                <SoftLink
                  href={localizedHref(locale, "/digital-design")}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t("openDigitalDesign")}
                </SoftLink>
              ) : null}
            </div>
          </Reveal>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(({ item, content }, i) => {
              const title = catalogServiceTitle(item.slug, locale, item.title);
              const summary =
                content?.subtitle ||
                catalogServiceSummary(item.slug, locale, item.summary || "") ||
                "";

              return (
                <div key={item.slug} id={item.slug} className={cardScrollClass}>
                  <Reveal delay={Math.min(i, 8) * 0.03}>
                    <ServiceCard
                      href={serviceHref(locale, item)}
                      title={title}
                      summary={summary}
                      price={content?.price ?? undefined}
                      image={content?.image ?? undefined}
                    />
                  </Reveal>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

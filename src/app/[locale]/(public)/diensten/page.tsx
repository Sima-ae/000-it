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
import { getServiceCardMeta } from "@/lib/fixweb-content";
import { buildStaticPageMetadata } from "@/lib/seo";

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
  const isNl = locale === "nl";

  const groupSections = sortedServiceGroups(locale)
    .map((group) => {
      const cards = serviceCatalog
        .filter((item) => item.group === group.id && item.slug !== "digital-design")
        .map((item) => ({ item, content: getServiceCardMeta(item.slug, locale) }))
        .filter(({ content }) => Boolean(content?.hasBody));
      return { group, cards };
    })
    .filter(({ cards }) => cards.length > 0);

  const groupDisplayTitles: Record<string, { nl: string; en: string }> = {
    webdesign: { nl: "Webdesign", en: "Webdesign" },
    wordpress: { nl: "WordPress", en: "WordPress" },
    marketing: {
      nl: "Content, Data, E-commerce, Marketing, Media Creatie en Social Media",
      en: "Content, Data, E-commerce, Marketing, Media Creation and Social Media",
    },
  };

  const marketingJumpButtons = [
    { key: "content", id: "marketing", nl: "Content genereren", en: "Content generation" },
    { key: "data", id: "data-entry", nl: "Data beheer", en: "Data management" },
    { key: "ecommerce", id: "marketing", nl: "E-commerce", en: "E-commerce" },
    { key: "marketing", id: "marketing", nl: "Marketing", en: "Marketing" },
    { key: "media", id: "media-creation", nl: "Media Creatie", en: "Media Creation" },
    { key: "social", id: "marketing", nl: "Social Media", en: "Social Media" },
    {
      key: "community",
      id: "community-management",
      nl: "Community management",
      en: "Community management",
    },
    {
      key: "products",
      id: "product-listing",
      nl: "Producten",
      en: "Products",
    },
  ] as const;

  const hostingJumpButtons = [
    { key: "webhosting", nl: "Webhosting", en: "Webhosting" },
    { key: "domains", nl: "Domeinnamen", en: "Domains" },
  ] as const;

  const aiJumpButtons = [
    { key: "ai", id: "ai", nl: "AI", en: "AI" },
    { key: "aeo", id: "aeo-optimization", nl: "AEO", en: "AEO" },
    { key: "geo", id: "geo-optimization", nl: "GEO", en: "GEO" },
    { key: "seo", id: "seo-optimization", nl: "SEO", en: "SEO" },
    { key: "chatbots", id: "ai-chatbots", nl: "Chatbots", en: "Chatbots" },
    { key: "workflows", id: "ai-workflows", nl: "Workflows", en: "Workflows" },
    { key: "advice", id: "ai-consultancy", nl: "Advies", en: "Advice" },
    { key: "integration", id: "ai-integration", nl: "Integratie", en: "Integration" },
    { key: "automation", id: "ai-automation", nl: "Automatisering", en: "Automation" },
  ] as const;

  const designJumpButtons = [
    { key: "digital-design", nl: "Digital design", en: "Digital Design" },
    { key: "printing", nl: "Printing", en: "Printing" },
  ] as const;

  const webdesignJumpButtons = [
    { key: "webdesign", id: "webdesign", nl: "Webdesign", en: "Webdesign" },
    {
      key: "malware",
      id: "website-malware-removal",
      nl: "Malware verwijderen",
      en: "Malware removal",
    },
    {
      key: "backup",
      id: "website-backup-migration",
      nl: "Backup en migratie",
      en: "Backup and migration",
    },
    { key: "security", id: "website-security", nl: "Beveiliging", en: "Security" },
    { key: "speed", id: "website-speed-optimization", nl: "Performance en snelheid", en: "Performance and speed" },
    { key: "custom", id: "custom-webdesign", nl: "Maatwerk", en: "Custom" },
  ] as const;

  const wordpressJumpButtons = [
    { key: "wordpress", id: "wordpress", nl: "WordPress", en: "WordPress" },
    {
      key: "maintenance",
      id: "wordpress-maintenance-updates",
      nl: "Onderhoud",
      en: "Maintenance",
    },
    { key: "support", id: "premium-support", nl: "Support", en: "Support" },
  ] as const;

  function groupLabel(group: { id: string; title: string; titleNl: string }) {
    const override = groupDisplayTitles[group.id];
    if (override) return isNl ? override.nl : override.en;
    return isNl ? group.titleNl : group.title;
  }

  const jumpLinks = [
    {
      key: "meest-populair",
      id: "meest-populair",
      label: isNl ? "Meest populaire diensten" : "Most popular services",
    },
    ...groupSections
      .flatMap(({ group }) => {
        if (group.id === "ai") {
          return aiJumpButtons.map((button) => ({
            key: `ai-${button.key}`,
            id: button.id,
            label: isNl ? button.nl : button.en,
          }));
        }
        if (group.id === "marketing") {
          return marketingJumpButtons.map((button) => ({
            key: `marketing-${button.key}`,
            id: button.id,
            label: isNl ? button.nl : button.en,
          }));
        }
        if (group.id === "hosting") {
          return hostingJumpButtons.map((button) => ({
            key: `hosting-${button.key}`,
            id: "hosting",
            label: isNl ? button.nl : button.en,
          }));
        }
        if (group.id === "design") {
          return designJumpButtons.map((button) => ({
            key: `design-${button.key}`,
            id: "design",
            label: isNl ? button.nl : button.en,
          }));
        }
        if (group.id === "webdesign") {
          return webdesignJumpButtons.map((button) => ({
            key: `webdesign-${button.key}`,
            id: button.id,
            label: isNl ? button.nl : button.en,
          }));
        }
        if (group.id === "wordpress") {
          return wordpressJumpButtons.map((button) => ({
            key: `wordpress-${button.key}`,
            id: button.id,
            label: isNl ? button.nl : button.en,
          }));
        }
        // All known service groups are handled above.
        return [] as Array<{ key: string; id: string; label: string }>;
      })
      .sort((a, b) =>
        a.label.localeCompare(b.label, isNl ? "nl" : "en", { sensitivity: "base" }),
      ),
  ];

  const cardScrollClass = "scroll-mt-[calc(var(--nav-offset)+3.25rem)]";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-14 pt-0 md:px-6 md:pb-20">
      <ServicesJumpNav locale={locale} links={jumpLinks} />

      <section
        id="meest-populair"
        className="mt-6 scroll-mt-[calc(var(--nav-offset)+3.25rem)]"
      >
        <Reveal>
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {isNl ? "Meest populaire diensten" : "Most popular services"}
          </h2>
        </Reveal>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {aiServices.map((item, i) => (
            <Reveal key={item.key} delay={i * 0.04}>
              <ServiceCard
                href={`/${locale}${item.href}`}
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
                  {cards.length} {isNl ? "diensten" : "services"}
                </p>
              </div>
              {group.id === "design" ? (
                <SoftLink
                  href={`/${locale}/digital-design`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {isNl ? "Open digital design" : "Open Digital Design"}
                </SoftLink>
              ) : null}
            </div>
          </Reveal>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(({ item, content }, i) => {
              const title = isNl ? item.titleNl : item.title;
              const summary =
                content?.subtitle ||
                (isNl ? item.summaryNl : item.summary) ||
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

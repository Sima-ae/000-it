import { setRequestLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/marketing/Reveal";
import { ServiceCard } from "@/components/content/ServiceCard";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import {
  serviceCatalog,
  serviceHref,
  sortedServiceGroups,
} from "@/content/fixweb/catalog";
import { getServiceCardMeta } from "@/lib/fixweb-content";

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

  const jumpLinks = [
    {
      id: "meest-populair",
      label: isNl ? "Meest populair" : "Most popular",
    },
    ...groupSections.map(({ group }) => ({
      id: group.id,
      label: isNl ? group.titleNl : group.title,
    })),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <Reveal>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">{t("subtitle")}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {jumpLinks.map((link) => (
            <Button key={link.id} asChild variant="outline" className="rounded-2xl">
              <SoftLink href={`/${locale}/diensten#${link.id}`}>{link.label}</SoftLink>
            </Button>
          ))}
        </div>
      </Reveal>

      <section id="meest-populair" className="mt-12 scroll-mt-28">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {isNl ? "Meest populair" : "Most popular"}
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
        <section key={group.id} id={group.id} className="mt-16 scroll-mt-28">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                  {isNl ? group.titleNl : group.title}
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
                <Reveal key={item.slug} delay={Math.min(i, 8) * 0.03}>
                  <ServiceCard
                    href={serviceHref(locale, item)}
                    title={title}
                    summary={summary}
                    price={content?.price ?? undefined}
                    image={content?.image ?? undefined}
                  />
                </Reveal>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

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
  { key: "ai", href: "/ai-scan", image: "/uploads/fixweb/ai-integratie.png" },
  { key: "seo", href: "/diensten/seo-optimization", image: "/uploads/fixweb/aeo-seo.png" },
  {
    key: "web",
    href: "/diensten/webdesign-support",
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <Reveal>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">{t("subtitle")}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-2xl">
            <SoftLink href={`/${locale}/diensten/ai-scan`}>AI</SoftLink>
          </Button>
          <Button asChild variant="outline" className="rounded-2xl">
            <SoftLink href={`/${locale}/diensten/webdesign-support`}>
              {isNl ? "Website support" : "Website Support"}
            </SoftLink>
          </Button>
          <Button asChild variant="outline" className="rounded-2xl">
            <SoftLink href={`/${locale}/digital-design`}>
              {isNl ? "Digital design" : "Digital Design"}
            </SoftLink>
          </Button>
          <Button asChild variant="outline" className="rounded-2xl">
            <SoftLink href={`/${locale}/diensten/digital-marketing`}>
              {isNl ? "Digital marketing" : "Digital Marketing"}
            </SoftLink>
          </Button>
        </div>
      </Reveal>

      <section className="mt-12">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {isNl ? "AI en groei" : "AI & Growth"}
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

      {sortedServiceGroups(locale).map((group) => {
        const cards = serviceCatalog
          .filter((item) => item.group === group.id)
          .map((item) => ({ item, content: getServiceCardMeta(item.slug, locale) }))
          .filter(({ content }) => Boolean(content?.hasBody));

        if (cards.length === 0) return null;

        return (
          <section key={group.id} className="mt-16">
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
        );
      })}
    </div>
  );
}

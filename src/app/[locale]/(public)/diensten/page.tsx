import { setRequestLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/marketing/Reveal";
import { ServiceCard } from "@/components/content/ServiceCard";
import { SoftLink } from "@/components/shared/SoftLink";
import { GlassCard } from "@/components/marketing/GlassCard";
import { serviceCatalog, serviceGroups } from "@/content/fixweb/catalog";
import { getServiceContent } from "@/lib/fixweb-content";

const aiServices = [
  { key: "ai", href: "/ai-scan" },
  { key: "seo", href: "/diensten/seo-optimization" },
  { key: "web", href: "/diensten/wordpress-plugin-theme-installation" },
  { key: "content", href: "/diensten/content-writing" },
  { key: "ads", href: "/diensten/digital-marketing" },
  { key: "software", href: "/contact" },
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
      </Reveal>

      <section className="mt-12">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {isNl ? "AI & Groei" : "AI & Growth"}
          </h2>
        </Reveal>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {aiServices.map((item, i) => (
            <Reveal key={item.key} delay={i * 0.04}>
              <SoftLink href={`/${locale}${item.href}`} className="block h-full">
                <GlassCard className="h-full p-5">
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    {t(`items.${item.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(`items.${item.key}.desc`)}
                  </p>
                </GlassCard>
              </SoftLink>
            </Reveal>
          ))}
        </div>
      </section>

      {serviceGroups.map((group) => {
        const items = serviceCatalog.filter(
          (item) => item.group === group.id && (item.kind === "page" || item.kind === "product"),
        );
        // Prefer overview pages first, then products
        const ordered = [
          ...items.filter((i) => i.kind === "page"),
          ...items.filter((i) => i.kind === "product"),
        ];

        return (
          <section key={group.id} className="mt-16">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                {isNl ? group.titleNl : group.title}
              </h2>
            </Reveal>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ordered.map((item, i) => {
                const content = getServiceContent(item.slug);
                const title = isNl ? item.titleNl : item.title;
                const firstParagraph = content?.blocks.find((b) => b.type === "paragraph");
                const summary =
                  content?.subtitle ||
                  (isNl ? item.summaryNl : item.summary) ||
                  (firstParagraph && firstParagraph.type === "paragraph"
                    ? firstParagraph.text
                    : "") ||
                  "";
                return (
                  <Reveal key={item.slug} delay={Math.min(i, 8) * 0.03}>
                    <ServiceCard
                      href={`/${locale}/diensten/${item.slug}`}
                      title={title}
                      summary={summary}
                      price={content?.price}
                      image={content?.image}
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

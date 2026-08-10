import { setRequestLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/marketing/Reveal";
import { ServiceCard } from "@/components/content/ServiceCard";
import { serviceCatalog, serviceGroups } from "@/content/fixweb/catalog";
import { getServiceContent } from "@/lib/fixweb-content";

const aiServices = [
  { key: "ai", href: "/ai-scan", image: "/uploads/fixweb/ai-integratie.png" },
  { key: "seo", href: "/diensten/seo-optimization", image: "/uploads/fixweb/aeo-seo.png" },
  {
    key: "web",
    href: "/diensten/wordpress-plugin-theme-installation",
    image: "/uploads/fixweb/webdesign-conversie.png",
  },
  { key: "content", href: "/diensten/content-writing", image: "/uploads/fixweb/content-social.png" },
  { key: "ads", href: "/diensten/digital-marketing", image: "/uploads/fixweb/ai-advertising.png" },
  { key: "software", href: "/contact", image: "/uploads/fixweb/maatwerk-software.png" },
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

      {serviceGroups.map((group) => {
        const priced = serviceCatalog
          .filter((item) => item.group === group.id && item.kind === "product")
          .map((item) => {
            const content = getServiceContent(item.slug);
            return { item, content };
          })
          .filter(
            ({ content }) =>
              content &&
              typeof content.price === "number" &&
              content.blocks.length > 0,
          );

        if (priced.length === 0) return null;

        return (
          <section key={group.id} className="mt-16">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                {isNl ? group.titleNl : group.title}
              </h2>
            </Reveal>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {priced.map(({ item, content }, i) => {
                const title = isNl ? item.titleNl : item.title;
                const firstParagraph = content?.blocks.find((b) => b.type === "paragraph");
                const summary =
                  content?.subtitle ||
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

import { setRequestLocale, getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { getImportedPage, textToBlocks } from "@/lib/fixweb-content";

const homeExtra = `Problems with your WordPress website?

We are TripleZero iT and get your WordPress site/shop running smoothly within 12 hours. Our expert team handles bug resolution, error fixes, malware removal, plugin/theme installation, SEO and speed optimization.

What we do

WordPress Bugs / Error Fix
Our WordPress experts can quickly fix any errors on your site. We make sure your site runs smoothly and without problems.

Remove Malware and Secure
We perform deep analysis and remove all malware from your site. Additionally we secure your site to keep it safe from future threats.

Performance & Speed Optimization
We optimize the performance of websites, ensuring the load time is under 2 seconds. This also includes fixing Google Core Web Vitals.

Backup / Migrate WordPress
We handle backups and hosting migrations, ensuring no downtime or data loss. This includes setting up and testing your new web hosting.

Design & Customize
We design and customize your existing or new site to match your requirements, ensuring a unique and responsive design.

Web Hosting
We host websites on fast and reliable servers, for quick load times and excellent performance. Our shared web hosting packages start from € 21,96/year.

Uplift your site
With our services like boosting responsiveness, enhancing load times, error fixing, performance, seo and speed optimization, plus up-to-date security fixes we make sure that your website runs smooth again and will be protected against threats to provide a seamless and secure user experience.

Let us help you optimize every aspect of your site for maximum efficiency and reliability.`;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const support = getImportedPage("wordpress-support");
  const homeBlocks = textToBlocks(homeExtra);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <Reveal>
        <h1 className="font-display max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">
          {locale === "nl"
            ? "TripleZero iT combineert AI-gedreven groei met de volledige Fix-Web dienstverlening: WordPress support, hosting, SEO, marketing en meer."
            : "TripleZero iT combines AI-driven growth with the full Fix-Web service stack: WordPress support, hosting, SEO, marketing and more."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="rounded-2xl">
            <SoftLink href={`/${locale}/diensten`}>
              {locale === "nl" ? "Bekijk alle diensten" : "View all services"}
            </SoftLink>
          </Button>
          <Button asChild variant="outline" className="rounded-2xl">
            <SoftLink href={`/${locale}/afspraak`}>
              {locale === "nl" ? "Afspraak boeken" : "Book appointment"}
            </SoftLink>
          </Button>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {(
          [
            ["mission", "missionText"],
            ["vision", "visionText"],
            ["philosophy", "philosophyText"],
          ] as const
        ).map(([title, body], i) => (
          <Reveal key={title} delay={i * 0.07}>
            <GlassCard className="h-full min-h-45">
              <h2 className="font-display text-xl font-semibold tracking-tight">{t(title)}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                {t(body)}
              </p>
            </GlassCard>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="glass mt-12 rounded-[1.75rem] p-6 md:p-10">
          <ContentBlocks blocks={homeBlocks} />
        </div>
      </Reveal>

      {support?.blocks?.length ? (
        <Reveal delay={0.12}>
          <div className="mt-12">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              {support.title}
            </h2>
            <div className="glass mt-6 rounded-[1.75rem] p-6 md:p-10">
              <ContentBlocks blocks={support.blocks.slice(0, 24)} />
            </div>
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}

import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/marketing/ContactForm";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2 md:px-6 md:py-20">
      <Reveal>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-muted-foreground md:text-lg">{t("subtitle")}</p>
        <div className="glass mt-8 space-y-2 rounded-3xl p-5 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">info@000-it.com</p>
          <p>www.000-it.com</p>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <GlassCard interactive={false}>
          <ContactForm />
        </GlassCard>
      </Reveal>
    </div>
  );
}

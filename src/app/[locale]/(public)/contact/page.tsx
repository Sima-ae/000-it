import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/marketing/ContactForm";
import { GlassCard } from "@/components/marketing/GlassCard";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:px-6">
      <div>
        <h1 className="text-4xl font-semibold">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        <div className="mt-8 space-y-2 text-sm text-muted-foreground">
          <p>info@000-it.com</p>
          <p>www.000-it.com</p>
        </div>
      </div>
      <GlassCard>
        <ContactForm />
      </GlassCard>
    </div>
  );
}

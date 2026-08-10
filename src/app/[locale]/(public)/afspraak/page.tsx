import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/marketing/Reveal";
import { ContactForm } from "@/components/marketing/ContactForm";
import { GlassCard } from "@/components/marketing/GlassCard";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";

export default async function AppointmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isNl = locale === "nl";

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2 md:px-6 md:py-20 md:items-start">
      <Reveal>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {isNl ? "Afspraak boeken" : "Book an appointment"}
        </h1>
        <p className="mt-4 text-muted-foreground md:text-lg">
          {isNl
            ? "Boek een specialist online. We helpen je WordPress-site, hosting, SEO of groeiplan binnen 24 uur op orde te krijgen."
            : "Book a specialist online. We get your WordPress site, hosting, SEO or growth plan running smoothly within 24 hours."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="outline" className="rounded-2xl">
            <SoftLink href={`/${locale}/diensten`}>
              {isNl ? "Bekijk diensten" : "View services"}
            </SoftLink>
          </Button>
          <Button asChild variant="outline" className="rounded-2xl">
            <SoftLink href={`/${locale}/ai-scan`}>AI-Scan</SoftLink>
          </Button>
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

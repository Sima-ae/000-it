import { setRequestLocale } from "next-intl/server";
import { AppointmentBooking } from "@/components/marketing/AppointmentBooking";
import { Reveal } from "@/components/marketing/Reveal";

export default async function AppointmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isNl = locale === "nl";

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-6 md:py-20">
      <Reveal>
        <p className="mb-6 text-center text-sm text-muted-foreground md:text-base">
          {isNl
            ? "Kies een dienst, datum en tijd — we bevestigen uw afspraak per e-mail."
            : "Pick a service, date and time — we’ll confirm your appointment by email."}
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <AppointmentBooking />
      </Reveal>
    </div>
  );
}

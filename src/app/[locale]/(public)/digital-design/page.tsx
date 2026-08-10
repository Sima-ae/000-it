import { setRequestLocale } from "next-intl/server";
import {
  BookOpen,
  CreditCard,
  ImageIcon,
  Layers,
  Palette,
  PenTool,
  Stamp,
  Type,
} from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/button";
import { serviceCatalog, serviceHref } from "@/content/fixweb/catalog";

const tools = [
  { name: "Adobe Photoshop", icon: ImageIcon },
  { name: "Adobe Illustrator", icon: PenTool },
  { name: "Adobe InDesign", icon: BookOpen },
] as const;

const offerings = [
  {
    slug: "logo-brand-identity",
    icon: Palette,
    blurbNl: "Logo’s, kleur, typografie en merkrichtlijnen die schalen.",
    blurbEn: "Logos, color, type and guidelines that scale.",
  },
  {
    slug: "business-cards-stationery",
    icon: CreditCard,
    blurbNl: "Visitekaartjes, briefpapier en enveloppen — drukklaar.",
    blurbEn: "Business cards, letterheads and envelopes — print-ready.",
  },
  {
    slug: "flyers-posters",
    icon: Type,
    blurbNl: "Flyers en posters voor retail, events en outdoor.",
    blurbEn: "Flyers and posters for retail, events and outdoor.",
  },
  {
    slug: "stickers-packaging",
    icon: Stamp,
    blurbNl: "Stickers, labels en eenvoudige packaging artwork.",
    blurbEn: "Stickers, labels and simple packaging artwork.",
  },
  {
    slug: "magazines-brochures",
    icon: Layers,
    blurbNl: "Brochures, lookbooks en magazines in InDesign.",
    blurbEn: "Brochures, lookbooks and magazines in InDesign.",
  },
] as const;

export default async function DigitalDesignPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isNl = locale === "nl";

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 10%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 md:px-6 md:pb-24 md:pt-20">
          <Reveal>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              TripleZero iT
            </p>
            <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              {isNl ? "Digital Design" : "Digital Design"}
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              {isNl
                ? "Professioneel beeldmerk- en printdesign: logo’s, visitekaartjes, flyers, stickers, magazines en posters — gemaakt in Photoshop, Illustrator en InDesign."
                : "Professional brand and print design: logos, business cards, flyers, stickers, magazines and posters — crafted in Photoshop, Illustrator and InDesign."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-2xl">
                <SoftLink href={`/${locale}/afspraak`}>
                  {isNl ? "Afspraak boeken" : "Book a call"}
                </SoftLink>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl">
                <SoftLink href={`/${locale}/portfolio`}>
                  {isNl ? "Bekijk portfolio" : "View portfolio"}
                </SoftLink>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {isNl ? "Wat we ontwerpen" : "What we design"}
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {isNl
              ? "Elk deliverable is drukklaar of screen-ready, met nette bestandsstructuur voor jouw drukker of team."
              : "Every deliverable is print- or screen-ready, with a clean file structure for your printer or team."}
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offerings.map((item, i) => {
            const meta = serviceCatalog.find((s) => s.slug === item.slug);
            if (!meta) return null;
            const Icon = item.icon;
            return (
              <Reveal key={item.slug} delay={i * 0.04}>
                <SoftLink
                  href={serviceHref(locale, meta)}
                  className="group flex h-full flex-col rounded-[1.5rem] border border-border/70 bg-background/50 p-5 transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
                    {isNl ? meta.titleNl : meta.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {isNl ? item.blurbNl : item.blurbEn}
                  </p>
                  <span className="mt-4 text-sm font-medium text-primary group-hover:underline">
                    {isNl ? "Meer info" : "Learn more"}
                  </span>
                </SoftLink>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {isNl ? "Gereedschap dat print overleeft" : "Tools that survive print"}
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {isNl
                ? "Wij werken in de Adobe-stack zodat jouw bestanden openen bij elke professionele drukkerij."
                : "We work in the Adobe stack so your files open cleanly at any professional print shop."}
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {tools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <Reveal key={tool.name} delay={i * 0.05}>
                  <div className="rounded-[1.5rem] border border-border/70 bg-background/70 px-5 py-6">
                    <Icon className="h-6 w-6 text-primary" />
                    <p className="mt-3 font-medium">{tool.name}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <Reveal>
          <div className="rounded-[2rem] border border-border/70 bg-linear-to-br from-primary/12 via-background to-accent/10 px-6 py-10 md:px-10 md:py-12">
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {isNl ? "Klaar voor een strak merkbeeld?" : "Ready for a sharp brand image?"}
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              {isNl
                ? "Plan een intake. We bepalen formaten, oplage en stijlrichting — daarna leveren we drukklare bestanden."
                : "Book an intake. We’ll lock formats, quantity and style direction — then deliver print-ready files."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-2xl">
                <SoftLink href={`/${locale}/afspraak`}>
                  {isNl ? "Start met design" : "Start with design"}
                </SoftLink>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl">
                <SoftLink href={`/${locale}/diensten/webdesign-support`}>
                  {isNl ? "Webdesign & Support" : "Webdesign & Support"}
                </SoftLink>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

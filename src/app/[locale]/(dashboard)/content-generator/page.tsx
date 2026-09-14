"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SoftLink } from "@/components/shared/SoftLink";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { localizedHref } from "@/i18n/pathnames";

type TemplateId = "blog" | "ads" | "social" | "email" | "landing";

function buildDraft(locale: string, id: TemplateId, topic: string, audience: string): string {
  const nl = locale === "nl";
  const t = topic.trim();
  const a = audience.trim() || (nl ? "Europese MKB'ers" : "European SMBs");

  if (id === "blog") {
    return nl
      ? [
          `# Blogconcept: ${t}`,
          ``,
          `## Doelgroep`,
          a,
          ``,
          `## Titelopties`,
          `1. ${t}: wat écht werkt in 2026`,
          `2. Hoe ${t} omzet en zichtbaarheid versterkt`,
          `3. De praktische gids voor ${t}`,
          ``,
          `## Outline`,
          `### H2 — Waarom ${t} nu relevant is`,
          `- Pijnpunt van de lezer`,
          `- Business impact in 2–3 zinnen`,
          ``,
          `### H2 — Wat de meeste bedrijven fout doen`,
          `- 3 veelgemaakte fouten`,
          `- Wat dat kost (tijd/geld/leads)`,
          ``,
          `### H2 — Een werkbaar stappenplan`,
          `1. Audit`,
          `2. Prioriteiten`,
          `3. Uitvoering`,
          `4. Meten & bijsturen`,
          ``,
          `### H2 — Resultaten die u mag verwachten`,
          `- KPI-voorbeelden (verkeer, leads, conversie)`,
          ``,
          `## CTA`,
          `Plan een gratis AI-readiness scan met TripleZero iT en ontdek waar ${t} het meeste oplevert.`,
        ].join("\n")
      : [
          `# Blog concept: ${t}`,
          ``,
          `## Audience`,
          a,
          ``,
          `## Title options`,
          `1. ${t}: what actually works in 2026`,
          `2. How ${t} improves revenue and visibility`,
          `3. A practical playbook for ${t}`,
          ``,
          `## Outline`,
          `### H2 — Why ${t} matters now`,
          `- Reader pain point`,
          `- Business impact in 2–3 lines`,
          ``,
          `### H2 — What most companies get wrong`,
          `- 3 common mistakes`,
          `- Cost in time / budget / leads`,
          ``,
          `### H2 — A workable rollout plan`,
          `1. Audit`,
          `2. Prioritize`,
          `3. Execute`,
          `4. Measure & iterate`,
          ``,
          `### H2 — Results you can expect`,
          `- KPI examples (traffic, leads, conversion)`,
          ``,
          `## CTA`,
          `Book a free AI readiness scan with TripleZero iT and see where ${t} pays off fastest.`,
        ].join("\n");
  }

  if (id === "ads") {
    return nl
      ? [
          `# Google Ads — ${t}`,
          ``,
          `## Headlines (max ~30 tekens)`,
          `1. ${t.slice(0, 28)}`,
          `2. Meer leads met ${t.slice(0, 18)}`,
          `3. Start vandaag met ${t.slice(0, 16)}`,
          `4. TripleZero iT — ${t.slice(0, 14)}`,
          `5. Meetbaar resultaat`,
          ``,
          `## Beschrijvingen`,
          `1. Groei met ${t}. Strategie + uitvoering voor ${a}. Plan een intake.`,
          `2. Van scan naar actieplan. ${t} dat traffic, leads en conversie versterkt.`,
          `3. AI + marketing die samenwerkt. Ontdek wat ${t} oplevert voor uw bedrijf.`,
          ``,
          `## Sitelnks`,
          `- AI scan`,
          `- Case studies`,
          `- Contact / Afspraak`,
        ].join("\n")
      : [
          `# Google Ads — ${t}`,
          ``,
          `## Headlines (~30 chars)`,
          `1. ${t.slice(0, 28)}`,
          `2. More leads with ${t.slice(0, 14)}`,
          `3. Launch ${t.slice(0, 20)} today`,
          `4. TripleZero iT · ${t.slice(0, 12)}`,
          `5. Measurable growth`,
          ``,
          `## Descriptions`,
          `1. Grow with ${t}. Strategy + delivery for ${a}. Book an intake.`,
          `2. From scan to action plan. ${t} that lifts traffic, leads and conversion.`,
          `3. AI + marketing that compounds. See what ${t} unlocks for your business.`,
          ``,
          `## Sitelinks`,
          `- AI scan`,
          `- Case studies`,
          `- Contact / Book a call`,
        ].join("\n");
  }

  if (id === "social") {
    return nl
      ? [
          `# LinkedIn-post — ${t}`,
          ``,
          `Hook:`,
          `${t} faalt niet door gebrek aan tools — het faalt door gebrek aan focus.`,
          ``,
          `Body:`,
          `Voor ${a} zien we steeds hetzelfde patroon:`,
          `1. Te veel kanalen tegelijk`,
          `2. Geen meetbare funnel`,
          `3. Content zonder commercieel doel`,
          ``,
          `Wat wél werkt:`,
          `- Eén scherpe positionering`,
          `- Content die leads voedt`,
          `- Wekelijkse optimalisatie op data`,
          ``,
          `CTA: Wilt u een korte scan op uw setup? Stuur een DM of plan een afspraak.`,
          ``,
          `Hashtags: #${t.replace(/\s+/g, "")} #MKB #Growth #AImarketing`,
        ].join("\n")
      : [
          `# LinkedIn post — ${t}`,
          ``,
          `Hook:`,
          `${t} rarely fails from missing tools — it fails from missing focus.`,
          ``,
          `Body:`,
          `For ${a}, we keep seeing the same pattern:`,
          `1. Too many channels at once`,
          `2. No measurable funnel`,
          `3. Content without a commercial job`,
          ``,
          `What works:`,
          `- One sharp positioning`,
          `- Content that feeds leads`,
          `- Weekly optimization on data`,
          ``,
          `CTA: Want a quick scan of your setup? DM us or book an appointment.`,
          ``,
          `Hashtags: #${t.replace(/\s+/g, "")} #SMB #Growth #AImarketing`,
        ].join("\n");
  }

  if (id === "email") {
    return nl
      ? [
          `# E-mail — ${t}`,
          ``,
          `Onderwerp: ${t} in 15 minuten scherp gesteld`,
          `Preheader: Praktisch actieplan voor ${a}`,
          ``,
          `Hoi {{voornaam}},`,
          ``,
          `Veel bedrijven willen sneller groeien met ${t}, maar blijven steken in losse acties.`,
          ``,
          `In een korte call laten we zien:`,
          `- waar u nu kansen laat liggen`,
          `- welke 3 stappen deze maand het meeste opleveren`,
          `- hoe AI + marketing elkaar versterken`,
          ``,
          `Plan hier uw afspraak: https://000-it.com/nl/afspraak`,
          ``,
          `Groet,`,
          `TripleZero iT`,
        ].join("\n")
      : [
          `# Email — ${t}`,
          ``,
          `Subject: Get ${t} clear in 15 minutes`,
          `Preheader: A practical action plan for ${a}`,
          ``,
          `Hi {{firstName}},`,
          ``,
          `Many teams want faster growth with ${t}, but stay stuck in disconnected tactics.`,
          ``,
          `On a short call we’ll show:`,
          `- where you’re leaving opportunity on the table`,
          `- the 3 moves that matter most this month`,
          `- how AI + marketing reinforce each other`,
          ``,
          `Book here: https://000-it.com/en/afspraak`,
          ``,
          `Best,`,
          `TripleZero iT`,
        ].join("\n");
  }

  // landing
  return nl
    ? [
        `# Landingpage — ${t}`,
        ``,
        `## Hero`,
        `Headline: ${t} dat meetbaar groeit`,
        `Sub: Voor ${a} die sneller resultaat willen zonder chaos.`,
        `Primary CTA: Start gratis AI-scan`,
        `Secondary CTA: Bekijk case studies`,
        ``,
        `## Social proof`,
        `- Resultaatgedreven trajecten`,
        `- Strategie + uitvoering in één team`,
        `- Duidelijke KPI’s per sprint`,
        ``,
        `## Probleem → Oplossing`,
        `Probleem: Versnipperde marketing en onduidelijke ROI.`,
        `Oplossing: ${t} met scan, prioriteiten en wekelijkse uitvoering.`,
        ``,
        `## Aanbodblokken`,
        `1. Scan & diagnose`,
        `2. Groeiplan op maat`,
        `3. Uitvoering + optimalisatie`,
        ``,
        `## FAQ (3)`,
        `1. Hoe snel zie ik resultaat?`,
        `2. Wat gebeurt er na de scan?`,
        `3. Werken jullie ook met bestaande teams?`,
        ``,
        `## Slot-CTA`,
        `Klaar voor ${t}? Plan uw intake.`,
      ].join("\n")
    : [
        `# Landing page — ${t}`,
        ``,
        `## Hero`,
        `Headline: ${t} that compounds`,
        `Sub: For ${a} who want faster results without chaos.`,
        `Primary CTA: Start free AI scan`,
        `Secondary CTA: View case studies`,
        ``,
        `## Social proof`,
        `- Outcome-driven engagements`,
        `- Strategy + delivery in one team`,
        `- Clear KPIs every sprint`,
        ``,
        `## Problem → Solution`,
        `Problem: Fragmented marketing and unclear ROI.`,
        `Solution: ${t} with scan, priorities and weekly execution.`,
        ``,
        `## Offer blocks`,
        `1. Scan & diagnose`,
        `2. Tailored growth plan`,
        `3. Delivery + optimization`,
        ``,
        `## FAQ (3)`,
        `1. How fast will we see results?`,
        `2. What happens after the scan?`,
        `3. Do you work with existing teams?`,
        ``,
        `## Closing CTA`,
        `Ready for ${t}? Book your intake.`,
      ].join("\n");
}

export default function ContentGeneratorPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [output, setOutput] = useState("");
  const [active, setActive] = useState<TemplateId>("blog");

  const templates = useMemo(
    () =>
      [
        { id: "blog" as const, title: "Blog" },
        { id: "ads" as const, title: "Ads" },
        { id: "social" as const, title: "LinkedIn" },
        { id: "email" as const, title: t("email") },
        { id: "landing" as const, title: "Landing" },
      ] as const,
    [t],
  );

  function generate() {
    if (!topic.trim()) {
      toast.error(t("topicRequired"));
      return;
    }
    setOutput(buildDraft(locale, active, topic, audience));
    toast.success(t("draftGenerated"));
  }

  async function copyOutput() {
    if (!output.trim()) return;
    await navigator.clipboard.writeText(output);
    toast.success(t("copied"));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{t("content")}</h1>
          <p className="text-sm text-muted-foreground">{t("contentSubtitle")}</p>
        </div>
        <Button asChild variant="outline">
          <SoftLink href={localizedHref(locale, "/ai-scan")}>{t("runScan")}</SoftLink>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("generator")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {templates.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant={active === item.id ? "default" : "outline"}
                  onClick={() => setActive(item.id)}
                >
                  {item.title}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>{t("topic")}</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t("topicPh")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("audience")}</Label>
              <Input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder={t("audiencePh")}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={generate}>
                {t("generateDraft")}
              </Button>
              <Button type="button" variant="outline" onClick={() => void copyOutput()} disabled={!output}>
                {t("copy")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("output")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-80 font-mono text-sm"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              placeholder={t("outputPh")}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

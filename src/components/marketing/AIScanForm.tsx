"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { GlassCard } from "@/components/marketing/GlassCard";
import { ServiceInquiryDialog } from "@/components/marketing/ServiceInquiryDialog";

const schema = z.object({
  url: z.string().url(),
  company: z.string().optional(),
  goals: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Scores = {
  seo: number;
  aeo: number;
  geo: number;
  performance: number;
  readiness: number;
};

export function AIScanForm() {
  const t = useTranslations("aiScan");
  const locale = useLocale();
  const isNl = locale === "nl";
  const [phase, setPhase] = useState<"form" | "scanning" | "results">("form");
  const [progress, setProgress] = useState(0);
  const [scores, setScores] = useState<Scores | null>(null);
  const [scannedUrl, setScannedUrl] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { url: "https://", company: "", goals: "" },
  });

  async function onSubmit(values: FormValues) {
    setPhase("scanning");
    setProgress(8);
    setScannedUrl(values.url);
    const timer = window.setInterval(() => {
      setProgress((p) => Math.min(p + 7, 92));
    }, 280);

    const res = await fetch("/api/scans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    window.clearInterval(timer);
    setProgress(100);

    if (!res.ok) {
      setPhase("form");
      return;
    }
    const data = await res.json();
    setScores(data.results as Scores);
    setPhase("results");
  }

  if (phase === "scanning") {
    return (
      <GlassCard className="space-y-4">
        <p className="text-sm text-accent">{t("scanning")}</p>
        <Progress value={progress} />
      </GlassCard>
    );
  }

  if (phase === "results" && scores) {
    const rows = [
      { label: t("aeo"), value: scores.aeo },
      { label: t("geo"), value: scores.geo },
      { label: t("seo"), value: scores.seo },
      { label: t("performance"), value: scores.performance },
      { label: t("readiness"), value: scores.readiness },
    ];
    const scoreSummary = rows.map((r) => `${r.label}: ${r.value}`).join("\n");
    const contactMessage = isNl
      ? `Hallo TripleZero iT,\n\nIk heb een AI-scan gedaan en wil graag de resultaten bespreken.\n\nWebsite-URL: ${scannedUrl || "—"}\n\nScores:\n${scoreSummary}\n\nVraag / toelichting:\n`
      : `Hi TripleZero iT,\n\nI’ve run an AI scan and would like to discuss the results.\n\nWebsite URL: ${scannedUrl || "—"}\n\nScores:\n${scoreSummary}\n\nQuestion / notes:\n`;

    return (
      <GlassCard className="space-y-4">
        <h2 className="text-xl font-semibold">{t("results")}</h2>
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{row.label}</span>
              <span className="text-accent">{row.value}</span>
            </div>
            <Progress value={row.value} />
          </div>
        ))}
        <div className="space-y-3 pt-1">
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-bold text-foreground">{t("resultsHintLead")}</span>{" "}
            {t("resultsHint")}
          </p>
          <div className="flex flex-wrap gap-3">
            <ServiceInquiryDialog
              serviceTitle={isNl ? "AI-scan resultaten" : "AI scan results"}
              source="AI_SCAN_RESULTS"
              triggerLabel={t("contact")}
              dialogTitle={isNl ? "Contact over AI-scan" : "Contact about AI scan"}
              dialogDescription={
                isNl
                  ? "Laat uw gegevens achter — we helpen u de scores te interpreteren en een plan op te stellen."
                  : "Leave your details — we’ll help interpret the scores and outline a plan."
              }
              defaultMessage={contactMessage}
              variant="default"
              size="default"
              className="rounded-2xl"
            />
            <Button type="button" variant="outline" className="rounded-2xl" onClick={() => setPhase("form")}>
              {t("startNew")}
            </Button>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">{t("url")}</Label>
          <Input id="url" {...form.register("url")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">{t("company")}</Label>
          <Input id="company" {...form.register("company")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goals">{t("goals")}</Label>
          <Textarea id="goals" {...form.register("goals")} />
        </div>
        <Button type="submit">{t("start")}</Button>
      </form>
    </GlassCard>
  );
}

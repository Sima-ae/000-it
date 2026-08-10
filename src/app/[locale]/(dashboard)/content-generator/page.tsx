"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const templates = [
  {
    id: "blog",
    title: "Blog outline",
    prompt: "Write a clear blog outline about {topic} for Dutch SMBs, with H2s and CTA.",
  },
  {
    id: "ads",
    title: "Ads copy",
    prompt: "Create 3 Google Ads headlines and descriptions for {topic}.",
  },
  {
    id: "social",
    title: "Social post",
    prompt: "Draft a LinkedIn post about {topic} with a strong hook and CTA.",
  },
] as const;

export default function ContentGeneratorPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [active, setActive] = useState<(typeof templates)[number]["id"]>("blog");

  function generate() {
    if (!topic.trim()) {
      toast.error("Enter a topic first");
      return;
    }
    const tpl = templates.find((item) => item.id === active)!;
    const draft = tpl.prompt.replace("{topic}", topic.trim());
    setOutput(
      [
        `# ${tpl.title}`,
        "",
        draft,
        "",
        "## Draft notes",
        `- Audience: Dutch scale-ups / SMBs`,
        `- Tone: professional, clear, conversion-focused`,
        `- Next: refine with your brand voice and proof points`,
        "",
        "(Live OpenAI generation can be connected to this panel later.)",
      ].join("\n"),
    );
    toast.success("Draft generated");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{t("content")}</h1>
          <p className="text-sm text-muted-foreground">
            Quick content scaffolds for blogs, ads and social. Connect OpenAI later for full generation.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/${locale}/ai-scan`}>{t("runScan")}</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generator</CardTitle>
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
              <Label>Topic</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. AEO for e-commerce"
              />
            </div>
            <Button type="button" onClick={generate}>
              Generate draft
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-64 font-mono text-sm"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              placeholder="Your draft appears here…"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, GitBranch } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type DetailDialogItem = {
  title: string;
  summary?: string | null;
  description?: string | null;
  coverImage?: string | null;
  gallery?: string[];
  clientName?: string | null;
  projectUrl?: string | null;
  repoUrl?: string | null;
  industry?: string | null;
  year?: number | null;
  date?: string | null;
  metric?: string | null;
  tags?: string[];
  technologies?: string[];
  featured?: boolean;
};

type Labels = {
  client?: string;
  date?: string;
  industry?: string;
  technologies?: string;
  visit?: string;
  repo?: string;
};

function shouldOptimize(src: string) {
  return (
    src.startsWith("/") ||
    src.includes("images.unsplash.com") ||
    src.includes("000-it.com")
  );
}

export function DetailDialog({
  open,
  onOpenChange,
  item,
  labels,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: DetailDialogItem | null;
  labels: Labels;
}) {
  const [cached, setCached] = useState<DetailDialogItem | null>(item);

  useEffect(() => {
    if (item) setCached(item);
  }, [item]);

  const display = item ?? cached;
  if (!display) return null;

  const gallery = display.gallery ?? [];
  const tags = display.tags ?? [];
  const technologies = display.technologies ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {display.coverImage ? (
            <div className="relative aspect-video w-full bg-muted">
              <Image
                src={display.coverImage}
                alt={display.title}
                fill
                unoptimized={!shouldOptimize(display.coverImage)}
                className="object-cover"
                sizes="(max-width: 1200px) 96vw, 72rem"
                priority
              />
            </div>
          ) : null}

          <div className="space-y-8 p-6 md:p-8 lg:p-10">
            <DialogHeader className="pr-8">
              <div className="mb-3 flex flex-wrap gap-2">
                {display.featured ? <Badge>Featured</Badge> : null}
                {display.industry ? (
                  <Badge variant="secondary">{display.industry}</Badge>
                ) : null}
                {display.year ? <Badge variant="outline">{display.year}</Badge> : null}
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <DialogTitle>{display.title}</DialogTitle>
              <DialogDescription>{display.summary || display.title}</DialogDescription>
              {display.metric ? (
                <p className="pt-2 text-lg font-semibold text-accent md:text-xl">
                  {display.metric}
                </p>
              ) : null}
            </DialogHeader>

            {(display.clientName || display.date) && (
              <div className="grid gap-4 rounded-2xl border border-border bg-muted/25 p-5 sm:grid-cols-2">
                {display.date && labels.date ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {labels.date}
                    </p>
                    <p className="mt-1 text-base font-medium">{display.date}</p>
                  </div>
                ) : null}
                {display.clientName && labels.client ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {labels.client}
                    </p>
                    <p className="mt-1 text-base font-medium">{display.clientName}</p>
                  </div>
                ) : null}
              </div>
            )}

            {(display.projectUrl || display.repoUrl) && (
              <div className="flex flex-wrap gap-3">
                {display.projectUrl ? (
                  <Button asChild>
                    <a href={display.projectUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      {labels.visit || "View project"}
                    </a>
                  </Button>
                ) : null}
                {display.repoUrl ? (
                  <Button asChild variant="outline">
                    <a href={display.repoUrl} target="_blank" rel="noreferrer">
                      <GitBranch className="h-4 w-4" />
                      {labels.repo || "Repository"}
                    </a>
                  </Button>
                ) : null}
              </div>
            )}

            {display.description ? (
              <div className="max-w-none space-y-4">
                {display.description.split("\n\n").map((paragraph, index) => (
                  <p
                    key={`${index}-${paragraph.slice(0, 16)}`}
                    className="text-base leading-relaxed text-foreground/90"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            {!!technologies.length && (
              <div>
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {labels.technologies || "Technologies"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {!!gallery.length && (
              <div className="grid gap-3 sm:grid-cols-2">
                {gallery.map((src) => (
                  <div
                    key={src}
                    className="relative aspect-4/3 overflow-hidden rounded-2xl border border-border bg-muted"
                  >
                    <Image
                      src={src}
                      alt={`${display.title} gallery`}
                      fill
                      unoptimized={!shouldOptimize(src)}
                      className="object-cover"
                      sizes="(max-width: 768px) 90vw, 36rem"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

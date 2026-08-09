import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ExternalLink, GitBranch, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function asList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String);
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portfolio");

  const item = await prisma.portfolioProject.findFirst({
    where: { slug, published: true },
  });
  if (!item) notFound();

  const gallery = asList(item.gallery);
  const tags = asList(item.tags);
  const technologies = asList(item.technologies);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href={`/${locale}/portfolio`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Link>
      </Button>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {item.industry && <Badge variant="secondary">{item.industry}</Badge>}
          {item.year && <Badge variant="outline">{item.year}</Badge>}
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          {item.title}
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground">{item.summary}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          {item.projectUrl && (
            <Button asChild>
              <a href={item.projectUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                {t("visit")}
              </a>
            </Button>
          )}
          {item.repoUrl && (
            <Button asChild variant="outline">
              <a href={item.repoUrl} target="_blank" rel="noreferrer">
                <GitBranch className="mr-2 h-4 w-4" />
                {t("repo")}
              </a>
            </Button>
          )}
        </div>
      </div>

      {item.coverImage && (
        <div className="relative mt-10 aspect-video overflow-hidden rounded-2xl border border-border bg-muted">
          <Image
            src={item.coverImage}
            alt={item.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}

      {item.description && (
        <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert">
          <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
            {item.description}
          </p>
        </div>
      )}

      {!!technologies.length && (
        <div className="mt-10">
          <h2 className="mb-3 text-lg font-medium">{t("technologies")}</h2>
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
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {gallery.map((src) => (
            <div
              key={src}
              className="relative aspect-4/3 overflow-hidden rounded-xl border border-border bg-muted"
            >
              <Image src={src} alt="" fill className="object-cover" sizes="50vw" />
            </div>
          ))}
        </div>
      )}

      {(item.clientName || item.industry) && (
        <div className="mt-12 grid gap-4 rounded-2xl border border-border p-6 sm:grid-cols-2">
          {item.clientName && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("client")}
              </p>
              <p className="mt-1 font-medium">{item.clientName}</p>
            </div>
          )}
          {item.industry && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("industry")}
              </p>
              <p className="mt-1 font-medium">{item.industry}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

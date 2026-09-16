import type { Metadata } from "next";
import { NewsCoverImage } from "@/components/content/NewsCoverImage";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublishedNewsPost, publicNewsTags } from "@/lib/news";
import {
  breadcrumbJsonLd,
  buildNewsArticleMetadata,
  newsArticleJsonLd,
  newsArticlePath,
  organizationJsonLd,
} from "@/lib/seo";
import { localizedHref } from "@/i18n/pathnames";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPublishedNewsPost(slug, locale);
  if (!post) {
    const t = await getTranslations({ locale, namespace: "news" });
    return { title: t("title"), robots: { index: false } };
  }
  return buildNewsArticleMetadata(post, locale);
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");
  const post = await getPublishedNewsPost(slug, locale);
  if (!post) notFound();

  const paragraphs = (post.description || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={newsArticleJsonLd(post, locale)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "TripleZero iT", path: localizedHref(locale, "/") },
          { name: t("title"), path: localizedHref(locale, "/nieuws") },
          { name: post.title, path: newsArticlePath(locale, post.id) },
        ])}
      />

      <Button asChild variant="ghost" size="sm" className="mb-8 -ml-2">
        <SoftLink href={localizedHref(locale, "/nieuws")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </SoftLink>
      </Button>

      <div className="mb-6 flex flex-wrap gap-2">
        {post.industry ? <Badge variant="secondary">{post.industry}</Badge> : null}
        <Badge variant="outline">{post.date}</Badge>
        {publicNewsTags(post.tags)
          .slice(0, 6)
          .map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
      </div>

      <div className="relative mb-10 aspect-video overflow-hidden rounded-2xl border border-border/60 bg-muted">
        <NewsCoverImage
          id={post.id}
          coverImage={post.coverImage}
          alt={post.title}
          priority
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>

      <header className="space-y-4">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {post.title}
        </h1>

        <p className="text-lg text-muted-foreground">{post.excerpt}</p>
      </header>

      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert">
        {paragraphs.map((paragraph, index) => (
          <p
            key={`${index}-${paragraph.slice(0, 24)}`}
            className="mb-5 whitespace-pre-wrap text-base leading-relaxed text-foreground/90"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {post.projectUrl ? (
        <div className="mt-10">
          <Button asChild>
            <a href={post.projectUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              {t("viewSource")}
            </a>
          </Button>
        </div>
      ) : null}

      {/* Hidden but crawlable keyword/geo hints for older crawlers */}
      <div className="sr-only">
        <p>{publicNewsTags(post.tags).join(", ")}</p>
        <p>Nederland, Netherlands, NL, TripleZero iT, AI</p>
        <address>TripleZero iT, Nederland</address>
      </div>
    </article>
  );
}

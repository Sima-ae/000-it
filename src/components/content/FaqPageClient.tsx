"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { FaqCategories } from "@/components/content/FaqAccordion";
import { Agent000ChatPane } from "@/components/agent-000/Agent000ChatPane";
import type { FaqContent } from "@/content/faq";
import { BRANDING_IMAGES } from "@/lib/branding-images";
import { openLiveChat } from "@/components/chat/open-live-chat";
import { localizedHref } from "@/i18n/pathnames";

/** @deprecated Prefer importing from `@/components/chat/open-live-chat`. */
export { OPEN_CHAT_EVENT } from "@/components/chat/open-live-chat";

function parseFaqHash(hash: string): string | null {
  const raw = hash.replace(/^#/, "");
  const match = raw.match(/^faq-item-(.+)$/);
  return match?.[1] || null;
}

export function FaqPageClient({
  locale,
  content,
}: {
  locale: string;
  content: FaqContent;
}) {
  const t = useTranslations("faqPage");
  const [highlightFaqId, setHighlightFaqId] = useState<string | null>(null);
  const [highlightCategoryId, setHighlightCategoryId] = useState<string | null>(
    null,
  );

  const applyFaqId = useCallback(
    (faqId: string | null, categoryId: string | null = null) => {
      if (!faqId) {
        setHighlightFaqId(null);
        setHighlightCategoryId(null);
        return;
      }
      let resolvedCategory = categoryId;
      if (!resolvedCategory) {
        for (const category of content.categories) {
          if (category.items.some((item) => item.id === faqId)) {
            resolvedCategory = category.id;
            break;
          }
        }
      }
      setHighlightFaqId(faqId);
      setHighlightCategoryId(resolvedCategory);
    },
    [content.categories],
  );

  useEffect(() => {
    function syncFromHash() {
      applyFaqId(parseFaqHash(window.location.hash));
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [applyFaqId]);

  const total = content.categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-6 grid items-end gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {t("eyebrow")}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {content.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            {content.subtitle}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {content.categories.length} {t("categoriesLabel")} · {total}{" "}
            {t("questionsLabel")}
          </p>
        </div>
        <div className="relative mx-auto hidden h-28 w-36 overflow-hidden sm:block">
          <Image
            src={BRANDING_IMAGES.duoSuccess}
            alt=""
            fill
            unoptimized
            sizes="144px"
            className="object-contain object-bottom"
          />
        </div>
      </header>

      <Agent000ChatPane
        className="mb-10"
        onMatchFaq={(faqId, categoryId) => {
          applyFaqId(faqId, categoryId);
          if (faqId && typeof window !== "undefined") {
            const next = `#faq-item-${faqId}`;
            if (window.location.hash !== next) {
              window.history.replaceState(null, "", next);
            }
          }
        }}
        onOpenLiveChat={openLiveChat}
      />

      <h2 className="font-display mb-4 text-xl font-semibold tracking-tight">
        {t("browseTitle")}
      </h2>

      <FaqCategories
        categories={content.categories}
        highlightFaqId={highlightFaqId}
        highlightCategoryId={highlightCategoryId}
      />

      <aside className="mt-10 flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {content.ctaTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{content.ctaText}</p>
        </div>
        <Button asChild className="shrink-0 rounded-xl">
          <SoftLink href={localizedHref(locale, "/contact")}>
            {content.ctaButton}
          </SoftLink>
        </Button>
      </aside>
    </div>
  );
}

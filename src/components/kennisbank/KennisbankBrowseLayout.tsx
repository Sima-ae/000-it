import type { ReactNode } from "react";
import { KennisbankSidebar } from "@/components/kennisbank/KennisbankSidebar";
import type { KennisbankCategoryView } from "@/lib/kennisbank";
import {
  kennisbankPopularLinks,
  kennisbankTopicLabels,
} from "@/lib/kennisbank-nav";

export function KennisbankBrowseLayout({
  locale,
  categories,
  activeSlug,
  hostingOnly,
  browseLabel,
  labelsTitle,
  popularTitle,
  showFiltersLabel,
  hideFiltersLabel,
  expandLabel,
  collapseLabel,
  children,
}: {
  locale: string;
  categories: KennisbankCategoryView[];
  activeSlug?: string | null;
  hostingOnly?: boolean;
  browseLabel: string;
  labelsTitle: string;
  popularTitle: string;
  showFiltersLabel: string;
  hideFiltersLabel: string;
  expandLabel: string;
  collapseLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(15rem,17.5rem)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <KennisbankSidebar
        locale={locale}
        categories={categories}
        activeSlug={activeSlug}
        browseLabel={browseLabel}
        labelsTitle={labelsTitle}
        popularTitle={popularTitle}
        popularLinks={kennisbankPopularLinks(locale, { hostingOnly })}
        topicLabels={kennisbankTopicLabels(locale, categories, { hostingOnly })}
        showFiltersLabel={showFiltersLabel}
        hideFiltersLabel={hideFiltersLabel}
        expandLabel={expandLabel}
        collapseLabel={collapseLabel}
      />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

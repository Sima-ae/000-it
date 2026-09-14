import { SoftLink } from "@/components/shared/SoftLink";
import { localizedHref } from "@/i18n/pathnames";

function buildPageList(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current]);
  for (let i = current - 1; i <= current + 1; i += 1) {
    if (i >= 1 && i <= total) pages.add(i);
  }
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const out: Array<number | "ellipsis"> = [];
  for (const n of sorted) {
    const prev = out[out.length - 1];
    if (typeof prev === "number" && n - prev > 1) out.push("ellipsis");
    out.push(n);
  }
  return out;
}

export function NewsPagination({
  locale,
  page,
  totalPages,
  labels,
}: {
  locale: string;
  page: number;
  totalPages: number;
  labels: {
    previous: string;
    next: string;
    pageOf: string;
  };
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (n: number) =>
    n <= 1 ? localizedHref(locale, "/nieuws") : `${localizedHref(locale, "/nieuws")}?page=${n}`;

  const pages = buildPageList(page, totalPages);
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  const btn =
    "inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border/70 bg-background/60 px-3 text-sm transition hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";
  const btnDisabled =
    "inline-flex min-h-10 min-w-10 cursor-not-allowed items-center justify-center rounded-md border border-border/40 bg-muted/20 px-3 text-sm text-muted-foreground opacity-60";
  const btnActive =
    "inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-primary/50 bg-primary/10 px-3 text-sm font-medium text-foreground";

  return (
    <nav
      aria-label={labels.pageOf.replace("{page}", String(page)).replace("{total}", String(totalPages))}
      className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
    >
      <p className="text-sm text-muted-foreground">
        {labels.pageOf.replace("{page}", String(page)).replace("{total}", String(totalPages))}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {prev ? (
          <SoftLink href={hrefFor(prev)} className={btn} aria-label={labels.previous}>
            {labels.previous}
          </SoftLink>
        ) : (
          <span className={btnDisabled} aria-disabled="true">
            {labels.previous}
          </span>
        )}

        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`e-${index}`}
              className="inline-flex min-h-10 min-w-8 items-center justify-center text-muted-foreground"
              aria-hidden
            >
              …
            </span>
          ) : item === page ? (
            <span key={item} className={btnActive} aria-current="page">
              {item}
            </span>
          ) : (
            <SoftLink key={item} href={hrefFor(item)} className={btn}>
              {item}
            </SoftLink>
          ),
        )}

        {next ? (
          <SoftLink href={hrefFor(next)} className={btn} aria-label={labels.next}>
            {labels.next}
          </SoftLink>
        ) : (
          <span className={btnDisabled} aria-disabled="true">
            {labels.next}
          </span>
        )}
      </div>
    </nav>
  );
}

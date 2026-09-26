import Image from "next/image";
import { Reveal } from "@/components/marketing/Reveal";
import { SoftLink } from "@/components/shared/SoftLink";
import { TabletFrame } from "@/components/content/TabletFrame";
import { brandingImageForServiceGroup } from "@/lib/branding-images";
import { localizedHref } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";

const TOP_LEFT_GROUPS = new Set(["wordpress", "optimization"]);

type JumpLink = {
  key: string;
  id: string;
  label: string;
};

function imageClassForGroup(groupId: string) {
  if (TOP_LEFT_GROUPS.has(groupId)) {
    return "object-cover object-top-left";
  }
  return "object-cover object-center";
}

function JumpChips({
  locale,
  title,
  jumpLinks,
  jumpBasePath,
  className,
}: {
  locale: string;
  title: string;
  jumpLinks: JumpLink[];
  jumpBasePath: string;
  className?: string;
}) {
  return (
    <nav aria-label={title} className={cn("flex flex-wrap gap-1.5", className)}>
      {jumpLinks.map((link) => (
        <SoftLink
          key={link.key}
          href={`${localizedHref(locale, jumpBasePath)}#${link.id}`}
          className={cn(
            "inline-flex min-h-8 items-center rounded-md border border-border/40",
            "bg-background/50 px-2.5 py-1 text-[11px] font-medium leading-none text-muted-foreground",
            "transition hover:border-border hover:bg-background hover:text-foreground",
            "active:scale-[0.98] sm:min-h-7 sm:py-0",
          )}
        >
          {link.label}
        </SoftLink>
      ))}
    </nav>
  );
}

export function CategoryHero({
  locale,
  groupId,
  title,
  summary,
  count,
  countLabel,
  servicesLabel,
  servicesHref,
  jumpLinks,
  jumpBasePath,
}: {
  locale: string;
  groupId: string;
  title: string;
  summary?: string;
  count: number;
  countLabel: string;
  servicesLabel: string;
  servicesHref: string;
  jumpLinks?: JumpLink[];
  jumpBasePath?: string;
}) {
  const showJump = Boolean(jumpLinks && jumpLinks.length > 2 && jumpBasePath);

  return (
    <Reveal>
      <header className="space-y-4">
        <p className="text-xs font-medium text-muted-foreground sm:text-sm">
          <SoftLink href={servicesHref} className="hover:text-foreground">
            {servicesLabel}
          </SoftLink>
          <span className="mx-1.5 opacity-50">/</span>
          <span className="text-foreground/80">{title}</span>
        </p>

        <div className="flex flex-col items-start gap-5 lg:flex-row lg:gap-28">
          <div className="min-w-0 w-full max-w-xl">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
              <h1 className="font-display text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                {title}
              </h1>
              <span className="rounded-md bg-muted/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[11px]">
                {count} {countLabel}
              </span>
            </div>

            {summary ? (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                {summary}
              </p>
            ) : null}

            {showJump ? (
              <JumpChips
                locale={locale}
                title={title}
                jumpLinks={jumpLinks!}
                jumpBasePath={jumpBasePath!}
                className="mt-4 hidden lg:flex"
              />
            ) : null}
          </div>

          <div className="mx-auto w-full max-w-60 shrink-0 lg:mx-0">
            <TabletFrame>
              <Image
                src={brandingImageForServiceGroup(groupId)}
                alt=""
                fill
                priority
                sizes="240px"
                unoptimized
                className={cn(imageClassForGroup(groupId))}
              />
            </TabletFrame>
          </div>

          {showJump ? (
            <JumpChips
              locale={locale}
              title={title}
              jumpLinks={jumpLinks!}
              jumpBasePath={jumpBasePath!}
              className="w-full lg:hidden"
            />
          ) : null}
        </div>
      </header>
    </Reveal>
  );
}

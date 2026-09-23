import Image from "next/image";
import { Reveal } from "@/components/marketing/Reveal";
import { SoftLink } from "@/components/shared/SoftLink";
import { brandingImageForServiceGroup } from "@/lib/branding-images";
import { localizedHref } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";

const TOP_LEFT_GROUPS = new Set(["wordpress", "optimization", "hosting"]);

type JumpLink = {
  key: string;
  id: string;
  label: string;
};

function objectPositionForGroup(groupId: string) {
  return TOP_LEFT_GROUPS.has(groupId)
    ? "object-cover object-top-left"
    : "object-cover object-center";
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
      <header className="space-y-3 sm:space-y-4">
        <p className="text-xs font-medium text-muted-foreground">
          <SoftLink href={servicesHref} className="hover:text-foreground">
            {servicesLabel}
          </SoftLink>
          <span className="mx-1.5 opacity-50">/</span>
          <span className="text-foreground/80">{title}</span>
        </p>

        <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-start md:gap-6 lg:gap-16 xl:gap-28">
          <div className="min-w-0 flex-1 md:max-w-xl">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
              <h1 className="font-display text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                {title}
              </h1>
              <span className="rounded-md bg-muted/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[11px]">
                {count} {countLabel}
              </span>
            </div>

            {summary ? (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:mt-2.5 md:text-base">
                {summary}
              </p>
            ) : null}
          </div>

          <div className="mx-auto w-full max-w-52 shrink-0 sm:max-w-56 md:mx-0 md:w-52 lg:w-56 xl:w-60">
            <div className="rounded-2xl bg-neutral-950 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.14)] ring-1 ring-black/30">
              <div className="relative aspect-4/3 overflow-hidden rounded-[0.85rem] bg-white">
                <Image
                  src={brandingImageForServiceGroup(groupId)}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 768px) 208px, 240px"
                  unoptimized
                  className={cn(objectPositionForGroup(groupId))}
                />
              </div>
            </div>
          </div>
        </div>

        {showJump ? (
          <nav
            aria-label={title}
            className="flex flex-wrap gap-1.5 pt-0.5 sm:gap-1.5 md:max-w-3xl"
          >
            {jumpLinks!.map((link) => (
              <SoftLink
                key={link.key}
                href={`${localizedHref(locale, jumpBasePath!)}#${link.id}`}
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
        ) : null}
      </header>
    </Reveal>
  );
}

"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/marketing/Reveal";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import {
  serverLocationsCopy,
  type ServerLocationCopy,
} from "@/content/server-locations";
import { localizedHref } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";

type Region = ServerLocationCopy["regions"][number];

function RegionColumn({ region }: { region: Region }) {
  return (
    <div className="h-full border-t border-border/70 pt-3">
      <h3 className="font-display text-sm font-semibold tracking-tight text-foreground">
        {region.name}
      </h3>
      <div className="mt-3 space-y-3.5">
        {region.subregions.map((sub) => (
          <div key={sub.id}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {sub.name}
            </p>
            <ul className="mt-1.5 space-y-1">
              {sub.locations.map((location) => (
                <li
                  key={location}
                  className="flex items-start gap-2 text-[13px] leading-snug text-foreground/85"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>{location}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ServerLocationsOverview({ className }: { className?: string }) {
  const locale = useLocale();
  const tStatus = useTranslations("statuspage");
  const copy = useMemo(() => serverLocationsCopy(locale), [locale]);

  return (
    <section
      id="server-locaties"
      className={cn("scroll-mt-28 md:scroll-mt-32", className)}
    >
      <Reveal from="up" duration={0.4}>
        <h2 className="text-center font-display text-2xl font-semibold tracking-tight text-accent">
          {copy.title}
        </h2>
      </Reveal>

      <div className="mx-auto mt-6 grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 lg:items-stretch">
        {copy.regions.slice(0, 2).map((region, index) => (
          <Reveal
            key={region.id}
            className="min-w-0"
            delay={index * 0.05}
            duration={0.4}
          >
            <RegionColumn region={region} />
          </Reveal>
        ))}

        <div className="col-span-full flex min-h-0 flex-col gap-4 sm:col-span-2 lg:col-span-2 lg:gap-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
            {copy.regions.slice(2).map((region, index) => (
              <Reveal
                key={region.id}
                className="min-w-0"
                delay={(index + 2) * 0.05}
                duration={0.4}
              >
                <RegionColumn region={region} />
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-auto" delay={0.2} duration={0.4}>
            <div className="flex justify-center sm:justify-start lg:justify-center">
              <Button
                asChild
                variant="accent"
                size="lg"
                className="rounded-2xl px-7"
              >
                <SoftLink href={localizedHref(locale, "/statuspage")}>
                  {tStatus("cta")}
                </SoftLink>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  enabledLanguages,
  flagSrc,
  getLanguage,
  switchLocalePath,
  type SiteLanguage,
} from "@/i18n/languages";
import { cn } from "@/lib/utils";

function Flag({
  lang,
  size = 28,
  className,
}: {
  lang: SiteLanguage;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full border border-black/10 bg-muted shadow-sm",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flagSrc(lang.flag)}
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover"
        draggable={false}
      />
    </span>
  );
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("language");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const current = getLanguage(locale) ?? enabledLanguages()[0];
  const languages = enabledLanguages();
  const cols =
    languages.length <= 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";

  function selectLanguage(next: SiteLanguage) {
    if (next.code === locale) {
      setOpen(false);
      return;
    }
    document.cookie = `NEXT_LOCALE=${next.code};path=/;max-age=31536000;samesite=lax`;
    setOpen(false);
    router.push(switchLocalePath(pathname, next.code));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 py-1 pl-1 pr-2 text-muted-foreground shadow-sm transition hover:border-accent/50 hover:bg-muted/60 hover:text-foreground",
            className,
          )}
          aria-label={t("title")}
        >
          {current ? <Flag lang={current} size={22} /> : null}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </DialogTrigger>

      <DialogContent className="w-[min(96vw,28rem)] max-w-none gap-0 p-0 sm:w-[min(96vw,36rem)]">
        <DialogHeader className="border-b border-border/60 px-6 py-4 text-center">
          <DialogTitle className="text-center text-base font-semibold tracking-tight md:text-lg">
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <div className={cn("grid gap-1.5 p-4 sm:p-5", cols)}>
          {languages.map((lang) => {
            const active = lang.code === locale;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => selectLanguage(lang)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition",
                  active
                    ? "bg-accent/15 text-accent-foreground ring-1 ring-accent/30"
                    : "text-foreground hover:bg-muted/70",
                )}
              >
                <Flag lang={lang} size={32} />
                <span className={cn(active && "font-semibold text-[#0f766e]")}>{lang.nativeName}</span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

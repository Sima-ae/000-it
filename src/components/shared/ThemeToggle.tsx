"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const isNl = locale === "nl";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-9 w-9 shrink-0 rounded-xl"
        aria-label={isNl ? "Thema wisselen" : "Toggle theme"}
      >
        <Sun className="h-[22px] w-[22px]" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="h-9 w-9 shrink-0 rounded-xl"
      aria-label={
        isDark
          ? isNl
            ? "Schakel naar lichte modus"
            : "Switch to light mode"
          : isNl
            ? "Schakel naar donkere modus"
            : "Switch to dark mode"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="h-[22px] w-[22px]" /> : <Moon className="h-[22px] w-[22px]" />}
    </Button>
  );
}

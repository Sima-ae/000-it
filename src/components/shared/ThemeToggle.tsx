"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("common");
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
        className="h-8 w-8 shrink-0 rounded-xl sm:h-9 sm:w-9"
        aria-label={t("toggleTheme")}
      >
        <Sun className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="h-8 w-8 shrink-0 rounded-xl sm:h-9 sm:w-9"
      aria-label={isDark ? t("lightMode") : t("darkMode")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
      ) : (
        <Moon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
      )}
    </Button>
  );
}

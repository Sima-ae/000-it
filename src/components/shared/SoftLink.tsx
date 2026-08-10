"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { forwardRef, type ComponentProps, type MouseEvent } from "react";
import { useNavigationProgress } from "@/hooks/useNavigationProgress";

type SoftLinkProps = ComponentProps<typeof Link>;

function normalizePath(path: string) {
  if (!path) return "/";
  const bare = path.split("?")[0].split("#")[0];
  return bare.length > 1 && bare.endsWith("/") ? bare.slice(0, -1) : bare || "/";
}

export const SoftLink = forwardRef<HTMLAnchorElement, SoftLinkProps>(
  function SoftLink({ href, onClick, onMouseEnter, className, children, prefetch, ...props }, ref) {
    const pathname = usePathname();
    const router = useRouter();
    const start = useNavigationProgress((s) => s.start);
    const target =
      typeof href === "string" ? normalizePath(href) : normalizePath(href.pathname || "");

    function handleMouseEnter(event: MouseEvent<HTMLAnchorElement>) {
      onMouseEnter?.(event);
      if (target.startsWith("/") && normalizePath(pathname) !== target) {
        try {
          router.prefetch(target);
        } catch {
          /* ignore */
        }
      }
    }

    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.button !== 0) return;
      if (!target.startsWith("/")) return;
      if (normalizePath(pathname) === target) return;
      start();
    }

    return (
      <Link
        ref={ref}
        href={href}
        // Force prefetch so soft navigations feel instant (null disables it in Next 15)
        prefetch={prefetch ?? true}
        className={className}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...props}
      >
        {children}
      </Link>
    );
  },
);

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, type ComponentProps, type MouseEvent } from "react";
import { useNavigationProgress } from "@/hooks/useNavigationProgress";

type SoftLinkProps = ComponentProps<typeof Link>;

export const SoftLink = forwardRef<HTMLAnchorElement, SoftLinkProps>(
  function SoftLink({ href, onClick, className, children, prefetch, ...props }, ref) {
    const pathname = usePathname();
    const start = useNavigationProgress((s) => s.start);
    const target = typeof href === "string" ? href.split("?")[0] : href.pathname || "";

    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.button !== 0) return;
      if (!target.startsWith("/")) return;
      if (pathname === target) return;
      start();
    }

    return (
      <Link
        ref={ref}
        href={href}
        prefetch={prefetch ?? null}
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Link>
    );
  },
);

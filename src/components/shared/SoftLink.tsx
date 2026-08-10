"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { forwardRef, type ComponentProps, type MouseEvent, type PointerEvent } from "react";
import { useNavigationProgress } from "@/hooks/useNavigationProgress";

type SoftLinkProps = ComponentProps<typeof Link>;

function normalizePath(path: string) {
  if (!path) return "/";
  const bare = path.split("?")[0].split("#")[0];
  return bare.length > 1 && bare.endsWith("/") ? bare.slice(0, -1) : bare || "/";
}

function hrefToString(href: SoftLinkProps["href"]): string {
  if (typeof href === "string") return href;
  const pathname = href.pathname || "/";
  const search = href.search
    ? href.search.startsWith("?")
      ? href.search
      : `?${href.search}`
    : "";
  const hash = href.hash
    ? href.hash.startsWith("#")
      ? href.hash
      : `#${href.hash}`
    : "";
  return `${pathname}${search}${hash}`;
}

export const SoftLink = forwardRef<HTMLAnchorElement, SoftLinkProps>(
  function SoftLink(
    {
      href,
      onClick,
      onMouseEnter,
      onPointerDown,
      className,
      children,
      prefetch,
      target,
      replace,
      ...props
    },
    ref,
  ) {
    const pathname = usePathname();
    const router = useRouter();
    const start = useNavigationProgress((s) => s.start);
    const hrefString = hrefToString(href);
    const path = normalizePath(hrefString);

    function prefetchTarget() {
      if (path.startsWith("/") && normalizePath(pathname) !== path) {
        try {
          router.prefetch(path);
        } catch {
          /* ignore */
        }
      }
    }

    function handleMouseEnter(event: MouseEvent<HTMLAnchorElement>) {
      onMouseEnter?.(event);
      prefetchTarget();
    }

    function handlePointerDown(event: PointerEvent<HTMLAnchorElement>) {
      onPointerDown?.(event);
      prefetchTarget();
    }

    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (target === "_blank") return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.button !== 0) return;
      if (!path.startsWith("/")) return;
      if (normalizePath(pathname) === path) return;

      // Force App Router navigation — relying only on <Link> soft-nav was a no-op
      // for some dashboard sidebar clicks (progress bar started, URL never changed).
      event.preventDefault();
      start();
      if (replace) {
        router.replace(hrefString);
      } else {
        router.push(hrefString);
      }
    }

    return (
      <Link
        ref={ref}
        {...props}
        href={href}
        target={target}
        replace={replace}
        prefetch={prefetch ?? true}
        className={className}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onPointerDown={handlePointerDown}
      >
        {children}
      </Link>
    );
  },
);

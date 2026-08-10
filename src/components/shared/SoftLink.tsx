"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { forwardRef, type ComponentProps, type MouseEvent, type PointerEvent } from "react";
import { useNavigationProgress } from "@/hooks/useNavigationProgress";

type SoftLinkProps = ComponentProps<typeof Link>;

function normalizePath(path: string) {
  if (!path) return "/";
  const bare = path.split("?")[0].split("#")[0];
  return bare.length > 1 && bare.endsWith("/") ? bare.slice(0, -1) : bare || "/";
}

/** Path + search (no hash), for same-page checks including ?page=. */
function normalizeHref(href: string) {
  const withoutHash = href.split("#")[0] || "/";
  const qIndex = withoutHash.indexOf("?");
  if (qIndex === -1) return normalizePath(withoutHash);
  const path = normalizePath(withoutHash.slice(0, qIndex));
  const search = withoutHash.slice(qIndex + 1);
  return search ? `${path}?${search}` : path;
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
    const searchParams = useSearchParams();
    const router = useRouter();
    const start = useNavigationProgress((s) => s.start);
    const hrefString = hrefToString(href);
    const targetHref = normalizeHref(hrefString);
    const currentSearch = searchParams.toString();
    const currentHref = currentSearch
      ? `${normalizePath(pathname)}?${currentSearch}`
      : normalizePath(pathname);

    function prefetchTarget() {
      if (targetHref.startsWith("/") && currentHref !== targetHref) {
        try {
          router.prefetch(hrefString.split("#")[0]);
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
      if (!targetHref.startsWith("/")) return;
      if (currentHref === targetHref) return;

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

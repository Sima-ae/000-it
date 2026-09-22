"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  coverApiPath,
  featuredCoverUrl,
  isCustomRemoteCover,
} from "@/lib/auto-news/cover-paths";

const BRAND_FALLBACK = "/branding/WEBLOGO-TripleZero-iT.png";

function resolveCoverSrc(id: string, coverImage?: string | null) {
  if (isCustomRemoteCover(coverImage)) return (coverImage || "").trim();
  const stored = (coverImage || "").trim();
  // Prefer the DB path (usually /uploads/nieuws/{slug}.jpg) — files already on disk.
  if (stored.startsWith("/api/uploads/")) return stored.slice(4);
  if (stored.startsWith("/uploads/") || (stored.startsWith("/") && !stored.startsWith("/api/"))) {
    return stored;
  }
  return featuredCoverUrl(id, coverImage);
}

function shouldUnoptimize(src: string) {
  return (
    src.startsWith("/api/") ||
    src.startsWith("/uploads/") ||
    src.startsWith("/branding/") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  );
}

/**
 * News covers: load static `/uploads/nieuws/...` first (fast, allowlisted).
 * Only hit `/api/news/cover/{id}` when the file is missing so it can be generated.
 */
export function NewsCoverImage({
  id,
  coverImage,
  alt = "",
  className = "object-cover",
  sizes,
  priority = false,
}: {
  id: string;
  coverImage?: string | null;
  alt?: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  const primary = resolveCoverSrc(id, coverImage);
  const [src, setSrc] = useState(primary);
  const [stage, setStage] = useState<"primary" | "api" | "fallback">("primary");

  useEffect(() => {
    setSrc(resolveCoverSrc(id, coverImage));
    setStage("primary");
  }, [id, coverImage]);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      className={
        stage === "fallback"
          ? `${className} object-contain p-6 opacity-70`.trim()
          : className
      }
      sizes={sizes}
      unoptimized={shouldUnoptimize(src)}
      onError={() => {
        if (stage === "primary") {
          setStage("api");
          setSrc(coverApiPath(id));
          return;
        }
        if (stage === "api") {
          setStage("fallback");
          setSrc(BRAND_FALLBACK);
        }
      }}
    />
  );
}

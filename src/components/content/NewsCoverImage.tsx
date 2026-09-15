"use client";

import { useState } from "react";
import Image from "next/image";
import { coverApiPath } from "@/lib/auto-news/cover-paths";

function initialCoverSrc(id: string, coverImage?: string | null) {
  const src = (coverImage || "").trim();
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return coverApiPath(id);
}

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
  const [src, setSrc] = useState(() => initialCoverSrc(id, coverImage));
  const [usedApi, setUsedApi] = useState(
    () => initialCoverSrc(id, coverImage).startsWith("/api/"),
  );

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      className={className}
      sizes={sizes}
      unoptimized={src.includes("image.pollinations.ai") || src.startsWith("/api/")}
      onError={() => {
        if (usedApi) return;
        setUsedApi(true);
        setSrc(coverApiPath(id));
      }}
    />
  );
}

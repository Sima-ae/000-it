import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type PortfolioCardProps = {
  locale: string;
  item: {
    slug: string;
    title: string;
    summary: string;
    coverImage: string | null;
    clientName: string | null;
    industry: string | null;
    year: number | null;
    featured: boolean;
    tags?: unknown;
  };
};

function tagsOf(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).slice(0, 3);
}

export function PortfolioCard({ locale, item }: PortfolioCardProps) {
  const tags = tagsOf(item.tags);

  return (
    <Link
      href={`/${locale}/portfolio/${item.slug}`}
      className="group relative flex aspect-[4/5] flex-col overflow-hidden border border-border bg-card transition hover:border-primary/40"
    >
      <div className="relative min-h-0 flex-1 bg-muted">
        {item.coverImage ? (
          <Image
            src={item.coverImage}
            alt={item.title}
            fill
            unoptimized={item.coverImage.startsWith("http")}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
            {item.title}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 transition group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <div className="mb-2 flex flex-wrap gap-1">
            {item.featured && (
              <Badge className="border-0 bg-white/20 text-white">Featured</Badge>
            )}
            {item.industry && (
              <Badge className="border-0 bg-white/15 text-white">{item.industry}</Badge>
            )}
          </div>
          <h2 className="text-lg font-semibold leading-tight">{item.title}</h2>
          <p className="mt-1 line-clamp-2 text-sm text-white/80">{item.summary}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-white/70">
            <span>{item.clientName || "—"}</span>
            <span>{item.year || ""}</span>
          </div>
          {!!tags.length && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span key={tag} className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

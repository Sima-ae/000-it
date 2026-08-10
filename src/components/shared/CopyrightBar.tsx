export function CopyrightBar({
  year,
  rights,
  className = "bg-transparent px-2 py-5 text-center md:py-6",
}: {
  year: number;
  rights: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-sm font-medium tracking-tight text-foreground">
        TripleZero iT © {year}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{rights}</p>
    </div>
  );
}

"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label,
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}) {
  const clamped = Math.min(max, Math.max(min, value));

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {label ? <span className="text-sm text-muted-foreground">{label}</span> : null}
      <div className="inline-flex h-10 items-stretch overflow-hidden rounded-xl border border-border bg-background">
        <button
          type="button"
          aria-label="Decrease quantity"
          className="inline-flex w-10 items-center justify-center text-muted-foreground transition hover:bg-muted/60 hover:text-foreground disabled:opacity-40"
          disabled={clamped <= min}
          onClick={() => onChange(Math.max(min, clamped - 1))}
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={clamped}
          aria-label={label || "Quantity"}
          onChange={(e) => {
            const raw = Number(e.target.value);
            if (!Number.isFinite(raw)) return;
            onChange(Math.min(max, Math.max(min, Math.floor(raw))));
          }}
          className="w-12 border-x border-border bg-transparent text-center text-sm tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label="Increase quantity"
          className="inline-flex w-10 items-center justify-center text-muted-foreground transition hover:bg-muted/60 hover:text-foreground disabled:opacity-40"
          disabled={clamped >= max}
          onClick={() => onChange(Math.min(max, clamped + 1))}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

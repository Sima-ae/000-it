import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/20 text-primary",
        secondary: "border-transparent bg-secondary/20 text-secondary",
        accent: "border-transparent bg-accent/20 text-accent",
        outline: "border-border text-foreground",
        success: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        progress: "border-transparent bg-emerald-800/15 text-emerald-800 dark:text-emerald-300",
        warning: "border-transparent bg-orange-500/15 text-orange-600 dark:text-orange-300",
        danger: "border-transparent bg-red-500/15 text-red-600 dark:text-red-300",
        urgent: "border-transparent bg-red-900/15 text-red-900 dark:bg-red-950/40 dark:text-red-200",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

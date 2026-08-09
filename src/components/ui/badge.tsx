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
        success: "border-transparent bg-accent/15 text-accent",
        warning: "border-transparent bg-amber-500/15 text-amber-300",
        danger: "border-transparent bg-destructive/15 text-red-300",
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

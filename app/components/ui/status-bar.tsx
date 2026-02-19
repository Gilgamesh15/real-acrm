import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "~/lib/utils";

function StatusBar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="status-bar"
      className={cn("h-1 w-full flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

const statusSegmentVariants = cva(
  "h-full flex-1 rounded-sm transition-colors",
  {
    variants: {
      variant: {
        error: "bg-destructive-foreground",
        warning: "bg-warning-foreground",
        info: "bg-info-foreground",
        success: "bg-success-foreground",
        inactive: "bg-muted/30",
      },
    },
  }
);

function StatusSegment({
  className,
  variant = "inactive",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof statusSegmentVariants>) {
  return (
    <div
      data-slot="status-segment"
      className={cn(statusSegmentVariants({ variant }), className)}
      {...props}
    />
  );
}

export { StatusBar, StatusSegment, statusSegmentVariants };

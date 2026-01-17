import { ArrowLeft, ArrowRight } from "lucide-react";
import type React from "react";

import { Button } from "~/components/ui/button";

import { cn } from "~/lib/utils";

function SlideIndicator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-center gap-4", className)}
      {...props}
    />
  );
}

function SlideIndicatorPrev({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn("size-7", className)}
      size="icon-sm"
      aria-label="Previous slide"
      {...props}
    >
      <ArrowLeft />
    </Button>
  );
}

function SlideIndicatorNext({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn("size-7", className)}
      aria-label="Next slide"
      size="icon-sm"
      {...props}
    >
      <ArrowRight />
    </Button>
  );
}

function SlideIndicatorContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className="flex items-center gap-2" {...props} />;
}

function SlideIndicatorItem({
  className,
  isActive,
  ...props
}: React.ComponentProps<typeof Button> & {
  isActive?: boolean;
}) {
  return (
    <Button
      className={cn(
        "size-2 p-0 m-0 aspect-square transition-all",
        isActive ? "bg-primary" : "bg-muted hover:bg-muted/80"
      )}
      {...props}
    />
  );
}

export {
  SlideIndicator,
  SlideIndicatorPrev,
  SlideIndicatorNext,
  SlideIndicatorContent,
  SlideIndicatorItem,
};

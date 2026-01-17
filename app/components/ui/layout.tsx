import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type React from "react";

import { cn } from "~/lib/utils";

const containerVariants = cva("mx-auto w-full", {
  variants: {
    max: {
      none: "w-full px-0 sm:px-0 lg:px-0",
      xs: "max-w-lg",
      sm: "max-w-4xl",
      md: "max-w-7xl",
    },
    padding: {
      true: "px-4 sm:px-6 lg:px-8",
      false: null,
    },
  },
  defaultVariants: {
    max: "md",
    padding: true,
  },
});

function Container({
  asChild = false,
  className,
  max = "md",
  padding = true,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof containerVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="container"
      data-max={max}
      className={cn(containerVariants({ max, padding }), className)}
      {...props}
    />
  );
}

const sectionVariants = cva("w-full flex flex-col ", {
  variants: {
    padding: {
      none: "py-0",
      xs: "py-2",
      sm: "py-4",
      md: "py-8",
      lg: "py-12",
    },
    gap: {
      none: "gap-0",
      xs: "gap-2",
      sm: "gap-4",
      md: "gap-6",
      lg: "gap-8",
      xl: "gap-10",
      "2xl": "gap-12",
    },
    centered: {
      false: null,
      true: "items-center justify-center text-center",
    },
  },
  defaultVariants: {
    padding: "md",
    gap: "md",
    centered: false,
  },
});

function Section({
  asChild = false,
  className,
  padding = "md",
  gap = "md",
  centered = false,
  ...props
}: React.ComponentProps<"section"> &
  VariantProps<typeof sectionVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "section";
  return (
    <Comp
      data-slot="section"
      data-padding={padding}
      data-gap={gap}
      className={cn(sectionVariants({ padding, gap, centered }), className)}
      {...props}
    />
  );
}

export { Container, Section };

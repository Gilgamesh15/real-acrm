import React from "react";

export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl";

const breakpoints: Record<Breakpoint, number> = {
  base: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

function useResponsiveState<T>(values: Partial<Record<Breakpoint, T>>): T {
  const getBreakpoint = (width: number): Breakpoint => {
    if (width >= breakpoints["2xl"]) return "2xl";
    if (width >= breakpoints.xl) return "xl";
    if (width >= breakpoints.lg) return "lg";
    if (width >= breakpoints.md) return "md";
    if (width >= breakpoints.sm) return "sm";
    return "base";
  };

  const getValue = React.useCallback(
    (bp: Breakpoint): T => {
      const orderedBreakpoints: Breakpoint[] = [
        "2xl",
        "xl",
        "lg",
        "md",
        "sm",
        "base",
      ];
      const currentIndex = orderedBreakpoints.indexOf(bp);

      for (let i = currentIndex; i < orderedBreakpoints.length; i++) {
        const value = values[orderedBreakpoints[i]];
        if (value !== undefined) return value;
      }

      return values.base as T;
    },
    [values]
  );

  const [value, setValue] = React.useState<T>(() => {
    const bp = getBreakpoint(
      typeof window !== "undefined" ? window.innerWidth : 0
    );
    return getValue(bp);
  });

  React.useEffect(() => {
    const handleResize = () => {
      const bp = getBreakpoint(
        typeof window !== "undefined" ? window.innerWidth : 0
      );
      setValue(getValue(bp));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getValue, values]);

  return value;
}

export { useResponsiveState };

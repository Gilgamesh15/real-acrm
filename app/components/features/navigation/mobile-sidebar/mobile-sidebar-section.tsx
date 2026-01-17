import type React from "react";

import { cn } from "~/lib/utils";

interface MobileSidebarSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const MobileSidebarSection = ({
  title,
  children,
  className,
}: MobileSidebarSectionProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      <div className={cn(className)}>{children}</div>
    </div>
  );
};
export { MobileSidebarSection };

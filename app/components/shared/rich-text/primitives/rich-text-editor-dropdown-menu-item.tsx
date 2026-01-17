import type { LucideIcon } from "lucide-react";
import React from "react";

import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import { Kbd } from "~/components/ui/kbd";

import { parseShortcutKeys } from "~/components/shared/rich-text/utils";
import { cn } from "~/lib/utils";

const RichTextDropdownMenuItem = ({
  isActive = false,
  isVisible = true,
  className,
  icon: Icon,
  text,
  shortcutKeys,
  showShortcut = false,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem> & {
  isActive?: boolean;
  isVisible?: boolean;
  icon?: LucideIcon;
  text?: string;
  shortcutKeys?: string;
  showShortcut?: boolean;
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <DropdownMenuItem
      className={cn(
        isActive &&
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        className
      )}
      tabIndex={-1}
      {...props}
    >
      {Icon && <Icon />}
      <span>{text}</span>
      {showShortcut && (
        <Kbd className="ml-auto">{parseShortcutKeys({ shortcutKeys })}</Kbd>
      )}
    </DropdownMenuItem>
  );
};

export { RichTextDropdownMenuItem };

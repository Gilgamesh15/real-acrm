import type { LucideIcon } from "lucide-react";
import React from "react";

import { Button } from "~/components/ui/button";
import { Kbd } from "~/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { cn } from "~/lib/utils";

import { parseShortcutKeys } from "../utils";

const RichTextEditorButton = ({
  isActive = false,
  className,
  icon: Icon,
  text,
  tooltip,
  shortcutKeys,
  showShortcut = false,
  ...props
}: React.ComponentProps<typeof Button> & {
  isActive?: boolean;
  icon?: LucideIcon;
  text?: string;
  tooltip?: string;
  shortcutKeys?: string;
  showShortcut?: boolean;
}) => {
  const isIconButton = !!Icon && !text && !showShortcut;

  const content = (
    <Button
      size={isIconButton ? "icon-sm" : "sm"}
      variant={isActive ? "secondary" : "ghost"}
      type="button"
      tabIndex={-1}
      className={cn("", className)}
      {...props}
    >
      {Icon && <Icon />}
      {text && <span>{text}</span>}
      {showShortcut && shortcutKeys !== undefined && (
        <Kbd>{parseShortcutKeys({ shortcutKeys })}</Kbd>
      )}
    </Button>
  );

  if (tooltip === undefined) {
    return content;
  }

  return (
    <Tooltip delayDuration={1200}>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
};

export { RichTextEditorButton };

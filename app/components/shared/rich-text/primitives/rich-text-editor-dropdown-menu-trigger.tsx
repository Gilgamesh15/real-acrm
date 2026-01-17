import type { LucideIcon } from "lucide-react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Kbd } from "~/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { cn } from "~/lib/utils";

import { parseShortcutKeys } from "../utils";

const RichTextEditorDropdownMenuTrigger = ({
  isActive = false,
  className,
  icon: Icon,
  text,
  tooltip,
  shortcutKeys,
  showShortcut = false,
  showChevron = true,
  ...props
}: React.ComponentProps<typeof Button> & {
  isActive?: boolean;
  icon?: LucideIcon;
  text?: string;
  tooltip?: string;
  shortcutKeys?: string;
  showShortcut?: boolean;
  showChevron?: boolean;
}) => {
  const isIconButton =
    Icon !== undefined &&
    text === undefined &&
    (showShortcut === false || shortcutKeys === undefined) &&
    showChevron === false;

  const content = (
    <Button
      size={isIconButton ? "icon-sm" : "sm"}
      variant={isActive ? "secondary" : "ghost"}
      tabIndex={-1}
      type="button"
      className={cn("", className)}
      {...props}
    >
      {Icon && <Icon />}
      {text && <span>{text}</span>}
      {showShortcut && shortcutKeys !== undefined && (
        <Kbd>{parseShortcutKeys({ shortcutKeys })}</Kbd>
      )}
      {showChevron && <ChevronDownIcon />}
    </Button>
  );

  if (tooltip === undefined) {
    return <DropdownMenuTrigger asChild>{content}</DropdownMenuTrigger>;
  }

  return (
    <Tooltip delayDuration={1200}>
      <DropdownMenuTrigger asChild>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
      </DropdownMenuTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
};

export { RichTextEditorDropdownMenuTrigger };

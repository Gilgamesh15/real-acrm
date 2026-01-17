import { CornerDownLeftIcon, LinkIcon } from "lucide-react";
import { ExternalLinkIcon } from "lucide-react";
import { TrashIcon } from "lucide-react";
import React from "react";

import { Button } from "~/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "~/components/ui/button-group";
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent } from "~/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { type UseLinkPopoverConfig, useLink } from "../hooks/use-link";
import { RichTextEditorPopoverTrigger } from "../primitives/rich-text-editor-popover-trigger";

const LinkPopover = ({
  hideWhenUnavailable = false,
  autoOpenOnLinkActive = true,
  ...props
}: UseLinkPopoverConfig &
  React.ComponentProps<typeof Button> & {
    autoOpenOnLinkActive?: boolean;
  }) => {
  const [url, setUrl] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const { isVisible, isActive, canSet, handleSet, handleUnset } = useLink({
    hideWhenUnavailable,
    onSetSuccess: () => {
      setIsOpen(false);
      setUrl("");
    },
    onUnsetSuccess: () => {
      setUrl("");
      setIsOpen(false);
    },
    onEditorUrlChange: (editorUrl) => {
      setUrl(editorUrl);
    },
  });

  React.useEffect(() => {
    if (autoOpenOnLinkActive && isActive) {
      setIsOpen(true);
    }
  }, [autoOpenOnLinkActive, isActive]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSet(url);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <RichTextEditorPopoverTrigger
        isActive={isActive}
        disabled={!canSet}
        tooltip="Link"
        icon={LinkIcon}
        {...props}
      />

      <PopoverContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <ButtonGroup>
          <ButtonGroup>
            <Input
              type="url"
              placeholder="Paste a link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
            <Tooltip delayDuration={1200}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handleSet(url)}
                  disabled={!url && !isActive}
                >
                  <CornerDownLeftIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Apply link</TooltipContent>
            </Tooltip>
          </ButtonGroup>
          <ButtonGroup>
            <Tooltip delayDuration={1200}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => {
                    window.open(url, "_blank");
                  }}
                  disabled={!url && !isActive}
                >
                  <ExternalLinkIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open in new window</TooltipContent>
            </Tooltip>
            <ButtonGroupSeparator />
            <Tooltip delayDuration={1200}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleUnset}
                  disabled={!url && !isActive}
                >
                  <TrashIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove link</TooltipContent>
            </Tooltip>
          </ButtonGroup>
        </ButtonGroup>
      </PopoverContent>
    </Popover>
  );
};

export { LinkPopover };

import { QuoteIcon } from "lucide-react";
import React from "react";

import type { Button } from "~/components/ui/button";

import type { UseBlockquoteConfig } from "../hooks/use-blockquote";
import { useBlockquote } from "../hooks/use-blockquote";
import { RichTextEditorButton } from "../primitives/rich-text-editor-button";

const SHORTCUT_KEY = "mod+shift+b";
const ICON = QuoteIcon;
const TOOLTIP = "Blockquote";
const TEXT = undefined;

export const BlockquoteButton = ({
  hideWhenUnavailable = false,
  onExecute,
  onSuccess,
  onError,
  showShortcut = false,
  ...props
}: UseBlockquoteConfig &
  React.ComponentProps<typeof Button> & {
    showShortcut?: boolean;
  }) => {
  const { isVisible, canToggle, isActive, handleToggle } = useBlockquote({
    hideWhenUnavailable,
    onExecute,
    onSuccess,
    onError,
  });

  if (!isVisible) {
    return null;
  }

  return (
    <RichTextEditorButton
      isActive={isActive}
      disabled={!canToggle}
      onClick={handleToggle}
      icon={ICON}
      tooltip={TOOLTIP}
      text={TEXT}
      shortcutKeys={SHORTCUT_KEY}
      showShortcut={showShortcut}
      {...props}
    />
  );
};

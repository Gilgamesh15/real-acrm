import { Code2Icon } from "lucide-react";
import React from "react";

import { Button } from "~/components/ui/button";

import type { UseCodeBlockConfig } from "../hooks/use-code-block";
import { useCodeBlock } from "../hooks/use-code-block";
import { RichTextEditorButton } from "../primitives/rich-text-editor-button";

const SHORTCUT_KEY = "mod+alt+c";
const ICON = Code2Icon;
const TOOLTIP = "Code Block";
const TEXT = undefined;

export const CodeBlockButton = ({
  hideWhenUnavailable = false,
  onExecute,
  onSuccess,
  onError,
  showShortcut = false,
  ...props
}: UseCodeBlockConfig &
  React.ComponentProps<typeof Button> & {
    showShortcut?: boolean;
  }) => {
  const { isVisible, canToggle, isActive, handleToggle } = useCodeBlock({
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
      shortcutKeys={SHORTCUT_KEY}
      text={TEXT}
      showShortcut={showShortcut}
      {...props}
    />
  );
};

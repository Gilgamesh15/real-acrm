import type { LucideIcon } from "lucide-react";
import { AlignCenterIcon } from "lucide-react";
import { AlignJustifyIcon } from "lucide-react";
import { AlignLeftIcon } from "lucide-react";
import { AlignRightIcon } from "lucide-react";
import React from "react";

import { Button } from "~/components/ui/button";

import type {
  TextAlignVariant,
  UseTextAlignConfig,
} from "../hooks/use-text-align";
import { useTextAlign } from "../hooks/use-text-align";
import { RichTextEditorButton } from "../primitives/rich-text-editor-button";

const SHORTCUT_KEYS: Record<TextAlignVariant, string> = {
  left: "mod+shift+l",
  center: "mod+shift+e",
  right: "mod+shift+r",
  justify: "mod+shift+j",
};

export const ICONS: Record<TextAlignVariant, LucideIcon> = {
  left: AlignLeftIcon,
  center: AlignCenterIcon,
  right: AlignRightIcon,
  justify: AlignJustifyIcon,
};

export const LABELS: Record<TextAlignVariant, string> = {
  left: "Align left",
  center: "Align center",
  right: "Align right",
  justify: "Align justify",
};

export const TextAlignButton = ({
  editor: providedEditor,
  hideWhenUnavailable = false,
  showShortcut = false,
  alignVariant,
  onExecute,
  onSuccess,
  onError,
  ...props
}: UseTextAlignConfig &
  React.ComponentProps<typeof Button> & {
    showShortcut?: boolean;
  }) => {
  const { isVisible, canSet, isActive, handleSet } = useTextAlign({
    editor: providedEditor,
    hideWhenUnavailable,
    alignVariant,
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
      disabled={!canSet}
      onClick={handleSet}
      icon={ICONS[alignVariant]}
      tooltip={LABELS[alignVariant]}
      shortcutKeys={SHORTCUT_KEYS[alignVariant]}
      showShortcut={showShortcut}
      {...props}
    />
  );
};

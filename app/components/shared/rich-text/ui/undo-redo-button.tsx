import { type LucideIcon, Redo2Icon, Undo2Icon } from "lucide-react";
import React from "react";

import { Button } from "~/components/ui/button";

import {
  type UndoRedoAction,
  type UseUndoRedoConfig,
  useUndoRedo,
} from "../hooks/use-undo-redo";
import { RichTextEditorButton } from "../primitives/rich-text-editor-button";

const SHORTCUT_KEYS: Record<UndoRedoAction, string> = {
  undo: "mod+z",
  redo: "mod+shift+z",
};

const LABELS: Record<UndoRedoAction, string> = {
  undo: "Undo",
  redo: "Redo",
};

const ICONS: Record<UndoRedoAction, LucideIcon> = {
  undo: Undo2Icon,
  redo: Redo2Icon,
};

export const UndoRedoButton = ({
  action,
  hideWhenUnavailable = false,
  showShortcut = false,
}: UseUndoRedoConfig &
  React.ComponentProps<typeof Button> & {
    showShortcut?: boolean;
  }) => {
  const { isVisible, handleExecute, canExecute } = useUndoRedo({
    action,
    hideWhenUnavailable,
  });

  if (!isVisible) {
    return null;
  }

  return (
    <RichTextEditorButton
      disabled={!canExecute}
      onClick={handleExecute}
      icon={ICONS[action]}
      tooltip={LABELS[action]}
      shortcutKeys={SHORTCUT_KEYS[action]}
      showShortcut={showShortcut}
    />
  );
};

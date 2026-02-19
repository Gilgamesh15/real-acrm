import { ImagePlusIcon } from "lucide-react";
import React from "react";

import { Button } from "~/components/ui/button";

import type { UseImageUploadConfig } from "../hooks/use-image-upload";
import { useImageUpload } from "../hooks/use-image-upload";
import { RichTextEditorButton } from "../primitives/rich-text-editor-button";

const SHORTCUT_KEY = "mod+shift+i";
const ICON = ImagePlusIcon;
const TOOLTIP = "Insert Image";
const TEXT = "Add";

export const ImageUploadButton = ({
  hideWhenUnavailable = false,
  onExecute,
  onSuccess,
  onError,
  showShortcut = false,
  ...props
}: UseImageUploadConfig &
  React.ComponentProps<typeof Button> & {
    showShortcut?: boolean;
  }) => {
  const { isVisible, canInsert, isActive, handleInsert } = useImageUpload({
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
      disabled={!canInsert}
      onClick={handleInsert}
      icon={ICON}
      tooltip={TOOLTIP}
      shortcutKeys={SHORTCUT_KEY}
      text={TEXT}
      showShortcut={showShortcut}
      {...props}
    />
  );
};

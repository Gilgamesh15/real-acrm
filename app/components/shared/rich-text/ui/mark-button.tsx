import {
  BoldIcon,
  Code2Icon,
  ItalicIcon,
  type LucideIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  UnderlineIcon,
} from "lucide-react";
import React from "react";

import { Button } from "~/components/ui/button";

import {
  type MarkVariant,
  type UseMarkConfig,
  useMark,
} from "../hooks/use-mark";
import { RichTextEditorButton } from "../primitives/rich-text-editor-button";

const ICONS: Record<MarkVariant, LucideIcon> = {
  bold: BoldIcon,
  italic: ItalicIcon,
  underline: UnderlineIcon,
  strike: StrikethroughIcon,
  code: Code2Icon,
  superscript: SuperscriptIcon,
  subscript: SubscriptIcon,
};

export const SHORTCUT_KEYS: Record<MarkVariant, string> = {
  bold: "mod+b",
  italic: "mod+i",
  underline: "mod+u",
  strike: "mod+shift+s",
  code: "mod+e",
  superscript: "mod+.",
  subscript: "mod+,",
};

const getLabel = (markVariant: MarkVariant): string =>
  markVariant.charAt(0).toUpperCase() + markVariant.slice(1);

export const MarkButton = ({
  hideWhenUnavailable = false,
  showShortcut = false,
  markVariant,
  onExecute,
  onSuccess,
  onError,
  ...props
}: UseMarkConfig &
  React.ComponentProps<typeof Button> & {
    showShortcut?: boolean;
  }) => {
  const { isVisible, canToggle, isActive, handleToggle } = useMark({
    hideWhenUnavailable,
    markVariant,
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
      icon={ICONS[markVariant]}
      tooltip={getLabel(markVariant)}
      shortcutKeys={SHORTCUT_KEYS[markVariant]}
      showShortcut={showShortcut}
      {...props}
    />
  );
};

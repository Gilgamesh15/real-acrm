import type { LucideIcon } from "lucide-react";
import { HeadingIcon } from "lucide-react";
import {
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
} from "lucide-react";
import React from "react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";

import type { Level, UseHeadingConfig } from "../hooks/use-heading";
import { LEVELS, useHeading, useHeadingLevel } from "../hooks/use-heading";
import { RichTextDropdownMenuItem } from "../primitives/rich-text-editor-dropdown-menu-item";
import { RichTextEditorDropdownMenuTrigger } from "../primitives/rich-text-editor-dropdown-menu-trigger";

const SHORTCUT_KEY = undefined;
const ICON = HeadingIcon;
const TOOLTIP = "Heading";
const TEXT = undefined;

export const OPTIONS_ICONS: Record<Level, LucideIcon> = {
  1: Heading1Icon,
  2: Heading2Icon,
  3: Heading3Icon,
  4: Heading4Icon,
  5: Heading5Icon,
};

export const OPTIONS_SHORTCUT_KEYS: Record<Level, string> = {
  1: "ctrl+alt+1",
  2: "ctrl+alt+2",
  3: "ctrl+alt+3",
  4: "ctrl+alt+4",
  5: "ctrl+alt+5",
};

const getOptionText = (level: Level): string => `Heading ${level}`;

const HeadingDropdownMenu = ({
  hideWhenUnavailable = false,
  showShortcut = false,
  showChevron = true,
  onExecute,
  onSuccess,
  onError,
  ...props
}: UseHeadingConfig &
  React.ComponentProps<typeof Button> & {
    showShortcut?: boolean;
    showChevron?: boolean;
  }) => {
  const { isVisible, isActive, activeOption, canToggle } = useHeading({
    hideWhenUnavailable,
  });

  if (!isVisible) {
    return null;
  }

  return (
    <DropdownMenu>
      <RichTextEditorDropdownMenuTrigger
        isActive={isActive}
        disabled={!canToggle}
        tooltip={TOOLTIP}
        text={TEXT}
        shortcutKeys={SHORTCUT_KEY}
        showShortcut={showShortcut}
        showChevron={showChevron}
        icon={OPTIONS_ICONS[activeOption as Level] || ICON}
        {...props}
      />

      <DropdownMenuContent
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {LEVELS.map((level) => (
          <HeadingDropdownMenuItem
            key={level}
            level={level}
            onExecute={onExecute}
            onSuccess={onSuccess}
            onError={onError}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const HeadingDropdownMenuItem = ({
  level,
  hideWhenUnavailable = false,
  showShortcut = false,
  onExecute,
  onSuccess,
  onError,
  ...props
}: UseHeadingConfig &
  React.ComponentProps<typeof DropdownMenuItem> & {
    level: Level;
    showShortcut?: boolean;
  }) => {
  const { isVisible, isActive, handleToggle, canToggle } = useHeadingLevel({
    level,
    hideWhenUnavailable,
    onExecute,
    onSuccess,
    onError,
  });

  if (!isVisible) {
    return null;
  }

  return (
    <RichTextDropdownMenuItem
      key={level}
      isVisible={isVisible}
      isActive={isActive}
      icon={OPTIONS_ICONS[level]}
      text={getOptionText(level)}
      disabled={!canToggle}
      shortcutKeys={OPTIONS_SHORTCUT_KEYS[level]}
      showShortcut={showShortcut}
      onClick={handleToggle}
      {...props}
    />
  );
};

export { HeadingDropdownMenu as HeadingButton };

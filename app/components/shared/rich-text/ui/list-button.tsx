import { ListIcon, ListOrderedIcon, ListTodoIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import React from "react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";

import type { ListVariant, UseListConfig } from "../hooks/use-list";
import { LIST_VARIANTS, useList, useListVariant } from "../hooks/use-list";
import { RichTextDropdownMenuItem } from "../primitives/rich-text-editor-dropdown-menu-item";
import { RichTextEditorDropdownMenuTrigger } from "../primitives/rich-text-editor-dropdown-menu-trigger";

const SHORTCUT_KEY = undefined;
const ICON = ListIcon;
const TOOLTIP = "List";
const TEXT = undefined;

export const OPTIONS_ICONS: Record<ListVariant, LucideIcon> = {
  bulletList: ListIcon,
  orderedList: ListOrderedIcon,
  taskList: ListTodoIcon,
};

export const OPTIONS_LABELS: Record<ListVariant, string> = {
  bulletList: "Bullet List",
  orderedList: "Ordered List",
  taskList: "Task List",
};

export const OPTIONS_SHORTCUT_KEYS: Record<ListVariant, string> = {
  bulletList: "mod+shift+8",
  orderedList: "mod+shift+7",
  taskList: "mod+shift+9",
};

export const ListDropdownMenu = ({
  hideWhenUnavailable = false,
  showShortcut = false,
  showChevron = true,
  ...props
}: UseListConfig &
  React.ComponentProps<typeof Button> & {
    showShortcut?: boolean;
    showChevron?: boolean;
  }) => {
  const { isVisible, isActive, activeOption, canToggle } = useList({
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
        icon={OPTIONS_ICONS[activeOption as ListVariant] || ICON}
        shortcutKeys={SHORTCUT_KEY}
        showShortcut={showShortcut}
        showChevron={showChevron}
        {...props}
      />

      <DropdownMenuContent
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {LIST_VARIANTS.map((variant) => (
          <ListDropdownMenuItem
            key={variant}
            listVariant={variant}
            hideWhenUnavailable={hideWhenUnavailable}
            showShortcut={showShortcut}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ListDropdownMenuItem = ({
  listVariant,
  hideWhenUnavailable = false,
  showShortcut = false,
  ...props
}: UseListConfig &
  React.ComponentProps<typeof DropdownMenuItem> & {
    listVariant: ListVariant;
    showShortcut?: boolean;
  }) => {
  const { isVisible, canToggle, isActive, handleToggle } = useListVariant({
    hideWhenUnavailable,
    listVariant,
  });

  if (!isVisible) {
    return null;
  }

  return (
    <RichTextDropdownMenuItem
      isVisible={isVisible}
      isActive={isActive}
      icon={OPTIONS_ICONS[listVariant]}
      text={OPTIONS_LABELS[listVariant]}
      disabled={!canToggle}
      shortcutKeys={OPTIONS_SHORTCUT_KEYS[listVariant]}
      showShortcut={showShortcut}
      onClick={handleToggle}
      {...props}
    />
  );
};

export { ListDropdownMenu as ListButton };

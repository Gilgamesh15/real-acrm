import type { ChainedCommands } from "@tiptap/react";
import { type Editor, useCurrentEditor } from "@tiptap/react";
import React from "react";

import {
  isExtensionAvailable,
  isNodeTypeSelected,
} from "~/components/shared/rich-text/utils";

export const TEXT_ALIGN_VARIANTS = [
  "left",
  "center",
  "right",
  "justify",
] as const;

export type TextAlignVariant = (typeof TEXT_ALIGN_VARIANTS)[number];

export interface UseTextAlignConfig {
  editor?: Editor | null;
  alignVariant: TextAlignVariant;
  hideWhenUnavailable?: boolean;
  onExecute?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

export const checkCanSet = ({
  editor,
  alignVariant,
}: {
  editor: Editor | null;
  alignVariant: TextAlignVariant;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (
    !isExtensionAvailable(editor, "textAlign") ||
    isNodeTypeSelected(editor, ["image", "horizontalRule"])
  )
    return false;

  return editor.can().setTextAlign(alignVariant);
};

const hasSetTextAlign = (
  commands: ChainedCommands
): commands is ChainedCommands & {
  setTextAlign: (align: TextAlignVariant) => ChainedCommands;
} => {
  return "setTextAlign" in commands;
};

export const checkIsActive = ({
  editor,
  alignVariant,
}: {
  editor: Editor | null;
  alignVariant: TextAlignVariant;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive({ textAlign: alignVariant });
};

export const performSet = ({
  editor,
  alignVariant,
}: {
  editor: Editor | null;
  alignVariant: TextAlignVariant;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (!checkCanSet({ editor, alignVariant })) return false;

  const chain = editor.chain().focus();
  if (hasSetTextAlign(chain)) {
    return chain.setTextAlign(alignVariant).run();
  }

  return false;
};

export const checkShouldShow = ({
  editor,
  hideWhenUnavailable,
  alignVariant,
}: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
  alignVariant: TextAlignVariant;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, "textAlign")) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return checkCanSet({ editor, alignVariant });
  }

  return true;
};

export function useTextAlign({
  hideWhenUnavailable = false,
  alignVariant,
  onExecute,
  onSuccess,
  onError,
}: UseTextAlignConfig) {
  const { editor } = useCurrentEditor();
  const [isVisible, setIsVisible] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        checkShouldShow({ editor, hideWhenUnavailable, alignVariant })
      );
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [alignVariant, editor, hideWhenUnavailable, setIsVisible]);

  const isActive = checkIsActive({ editor, alignVariant });

  const canSet = checkCanSet({ editor, alignVariant });

  const handleSet = React.useCallback(() => {
    if (!editor) return false;

    onExecute?.();
    const success = performSet({ editor, alignVariant });
    if (success) {
      onSuccess?.();
    } else {
      onError?.();
    }
    return success;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, alignVariant]);

  return {
    isVisible,
    isActive,
    handleSet,
    canSet,
  };
}

import { type Editor } from "@tiptap/react";
import React from "react";

import {
  isMarkInSchema,
  isNodeTypeSelected,
} from "~/components/shared/rich-text/utils";

import { useRichTextEditor } from "./use-tiptap-editor";

export const MARK_VARIANTS = [
  "bold",
  "italic",
  "strike",
  "code",
  "underline",
  "superscript",
  "subscript",
] as const;

export type MarkVariant = (typeof MARK_VARIANTS)[number];

export interface UseMarkConfig {
  markVariant: MarkVariant;
  hideWhenUnavailable?: boolean;
  onExecute?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

export const checkCanToggle = ({
  editor,
  markVariant,
}: {
  editor: Editor | null;
  markVariant: MarkVariant;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (
    !isMarkInSchema(markVariant, editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false;

  return editor.can().toggleMark(markVariant);
};

export const checkIsActive = ({
  editor,
  markVariant,
}: {
  editor: Editor | null;
  markVariant: MarkVariant;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive(markVariant);
};

export function performToggle({
  editor,
  markVariant,
}: {
  editor: Editor | null;
  markVariant: MarkVariant;
}): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!checkCanToggle({ editor, markVariant })) return false;

  return editor.chain().focus().toggleMark(markVariant).run();
}

export const checkShouldShow = ({
  editor,
  markVariant,
  hideWhenUnavailable,
}: {
  editor: Editor | null;
  markVariant: MarkVariant;
  hideWhenUnavailable: boolean;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema(markVariant, editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return checkCanToggle({ editor, markVariant });
  }

  return true;
};

export function useMark({
  onExecute,
  onSuccess,
  onError,
  hideWhenUnavailable = false,
  markVariant,
}: UseMarkConfig) {
  const editor = useRichTextEditor();

  const [isVisible, setIsVisible] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        checkShouldShow({ editor, markVariant, hideWhenUnavailable })
      );
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, markVariant, setIsVisible]);

  const isActive = checkIsActive({ editor, markVariant });

  const canToggle = checkCanToggle({ editor, markVariant });

  const handleToggle = React.useCallback(() => {
    onExecute?.();
    const success = performToggle({ editor, markVariant });
    if (success) {
      onSuccess?.();
    } else {
      onError?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, markVariant]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
  };
}

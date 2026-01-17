import { type Editor } from "@tiptap/react";
import React from "react";

import { isNodeTypeSelected } from "~/components/shared/rich-text/utils";

import { useRichTextEditor } from "./use-tiptap-editor";

export type UndoRedoAction = "undo" | "redo";

export interface UseUndoRedoConfig {
  action: UndoRedoAction;
  hideWhenUnavailable?: boolean;
  onExecute?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

const checkCanExecute = ({
  editor,
  action,
}: {
  editor: Editor | null;
  action: UndoRedoAction;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (isNodeTypeSelected(editor, ["image"])) return false;

  return action === "undo" ? editor.can().undo() : editor.can().redo();
};

const checkShouldShow = ({
  editor,
  hideWhenUnavailable,
  action,
}: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
  action: UndoRedoAction;
}): boolean => {
  if (!editor || !editor.isEditable) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return checkCanExecute({ editor, action });
  }

  return true;
};

const execute = ({
  editor,
  action,
}: {
  editor: Editor | null;
  action: UndoRedoAction;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (!checkCanExecute({ editor, action })) return false;

  const chain = editor.chain().focus();
  return action === "undo" ? chain.undo().run() : chain.redo().run();
};

export const useUndoRedo = ({
  action,
  hideWhenUnavailable = false,
  onExecute,
  onSuccess,
  onError,
}: UseUndoRedoConfig) => {
  const editor = useRichTextEditor();
  const [isVisible, setIsVisible] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(checkShouldShow({ editor, hideWhenUnavailable, action }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [action, editor, hideWhenUnavailable, setIsVisible]);

  // Undo/redo actions don't have an "active" state
  const isActive = false;

  const canExecute = checkCanExecute({ editor, action });

  const handleExecute = React.useCallback(() => {
    if (!editor) return false;

    onExecute?.();
    const success = execute({ editor, action });
    if (success) {
      onSuccess?.();
    } else {
      onError?.();
    }
    return success;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, action]);

  return {
    isVisible,
    isActive,
    handleExecute,
    canExecute,
  };
};

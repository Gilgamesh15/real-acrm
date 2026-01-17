import { type Editor } from "@tiptap/react";
import React from "react";

import { isExtensionAvailable } from "~/components/shared/rich-text/utils";

import { useRichTextEditor } from "./use-tiptap-editor";

export interface UseImageUploadConfig {
  hideWhenUnavailable?: boolean;
  onExecute?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

export const checkIsActive = ({
  editor,
}: {
  editor: Editor | null;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive("imageUpload");
};

export const checkShouldShow = ({
  editor,
  hideWhenUnavailable,
}: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, "imageUpload")) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return checkCanInsert({ editor });
  }

  return true;
};

export const checkCanInsert = ({
  editor,
}: {
  editor: Editor | null;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, "imageUpload")) return false;

  return editor.can().insertContent({ type: "imageUpload" });
};

export const performInsert = ({
  editor,
}: {
  editor: Editor | null;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (!checkCanInsert({ editor })) return false;

  try {
    return editor
      .chain()
      .focus()
      .insertContent({
        type: "imageUpload",
      })
      .run();
  } catch {
    return false;
  }
};

export const useImageUpload = ({
  hideWhenUnavailable = false,
  onExecute,
  onSuccess,
  onError,
}: UseImageUploadConfig) => {
  const editor = useRichTextEditor();
  const [isVisible, setIsVisible] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(checkShouldShow({ editor, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, setIsVisible]);

  const isActive = checkIsActive({ editor });

  const canInsert = checkCanInsert({ editor });

  const handleInsert = React.useCallback(() => {
    onExecute?.();

    const success = performInsert({ editor });

    if (success) {
      onSuccess?.();
    } else {
      onError?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return {
    isVisible,
    isActive,
    handleInsert,
    canInsert,
  };
};

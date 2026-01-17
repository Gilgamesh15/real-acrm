import { type Editor } from "@tiptap/react";
import React from "react";

import {
  isMarkInSchema,
  isNodeTypeSelected,
} from "~/components/shared/rich-text/utils";

import { useRichTextEditor } from "./use-tiptap-editor";

export interface UseLinkPopoverConfig {
  hideWhenUnavailable?: boolean;
  onSet?: () => void;
  onSetSuccess?: () => void;
  onSetError?: () => void;
  onUnset?: () => void;
  onUnsetSuccess?: () => void;
  onUnsetError?: () => void;
  onEditorUrlChange?: (url: string) => void;
}

export const checkIsActive = ({
  editor,
}: {
  editor: Editor | null;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive("link");
};

export const checkShouldShow = ({
  editor,
  hideWhenUnavailable,
}: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean => {
  const linkInSchema = isMarkInSchema("link", editor);

  if (!linkInSchema || !editor) {
    return false;
  }

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return checkCanSet({ editor });
  }

  return true;
};

export const checkCanSet = ({ editor }: { editor: Editor | null }): boolean => {
  if (!editor || !editor.isEditable) return false;

  // The third argument 'true' checks whether the current selection is inside an image caption, and prevents setting a link there
  // If the selection is inside an image caption, we can't set a link
  if (isNodeTypeSelected(editor, ["image"], true)) return false;
  return editor.can().setMark("link");
};

export const performSet = ({
  editor,
  url,
}: {
  editor: Editor | null;
  url: string;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (!checkCanSet({ editor })) return false;

  const { selection } = editor.state;
  const isEmpty = selection.empty;

  let chain = editor.chain().focus();

  chain = chain.extendMarkRange("link").setLink({ href: url });

  if (isEmpty) {
    chain = chain.insertContent({ type: "text", text: url });
  }

  return chain.run();
};

export const performUnset = ({
  editor,
}: {
  editor: Editor | null;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (!checkIsActive({ editor })) return false;

  return editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .unsetLink()
    .setMeta("preventAutolink", true)
    .run();
};

export function useLink({
  hideWhenUnavailable = false,
  onEditorUrlChange,
  onSet,
  onSetError,
  onSetSuccess,
  onUnset,
  onUnsetError,
  onUnsetSuccess,
}: UseLinkPopoverConfig) {
  const editor = useRichTextEditor();

  React.useEffect(() => {
    if (!editor) return;

    const updateLinkState = () => {
      const { href } = editor.getAttributes("link");
      onEditorUrlChange?.(href || "");
    };

    editor.on("selectionUpdate", updateLinkState);
    return () => {
      editor.off("selectionUpdate", updateLinkState);
    };
  }, [editor, onEditorUrlChange]);

  const handleSet = React.useCallback(
    (url: string) => {
      if (!editor || !editor.isEditable) return;

      onSet?.();
      const success = performSet({ editor, url });
      if (success) {
        onSetSuccess?.();
      } else {
        onSetError?.();
      }
    },
    [editor, onSetError, onSet, onSetSuccess]
  );

  const handleUnset = React.useCallback(() => {
    if (!editor || !editor.isEditable) return;

    onUnset?.();
    const success = performUnset({ editor });
    if (success) {
      onUnsetSuccess?.();
    } else {
      onUnsetError?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

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

  const canSet = checkCanSet({ editor });

  return {
    isVisible,
    isActive,
    canSet,
    handleSet,
    handleUnset,
  };
}

import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import { type Editor } from "@tiptap/react";
import React from "react";

import {
  findNodePosition,
  isNodeInSchema,
  isNodeTypeSelected,
  isValidPosition,
  selectionWithinConvertibleTypes,
} from "~/components/shared/rich-text/utils";

import { useRichTextEditor } from "./use-tiptap-editor";

export interface UseCodeBlockConfig {
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
  return editor?.isActive("codeBlock") || false;
};

export const checkShouldShow = ({
  editor,
  hideWhenUnavailable,
}: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema("codeBlock", editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return checkCanToggle({ editor });
  }

  return true;
};

export const checkCanToggle = ({
  editor,
  turnInto = true,
}: {
  editor: Editor | null;
  turnInto?: boolean;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (
    !isNodeInSchema("codeBlock", editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false;

  if (!turnInto) {
    return editor.can().toggleNode("codeBlock", "paragraph");
  }

  // Ensure selection is in nodes we're allowed to convert
  if (
    !selectionWithinConvertibleTypes(editor, [
      "paragraph",
      "heading",
      "bulletList",
      "orderedList",
      "taskList",
      "blockquote",
      "codeBlock",
    ])
  )
    return false;

  // Either we can toggle code block directly on the selection,
  // or we can clear formatting/nodes to arrive at a code block.
  return (
    editor.can().toggleNode("codeBlock", "paragraph") ||
    editor.can().clearNodes()
  );
};

export const performToggle = ({
  editor,
}: {
  editor: Editor | null;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (!checkCanToggle({ editor })) return false;

  try {
    const view = editor.view;
    let state = view.state;
    let tr = state.tr;

    // No selection, find the the cursor position
    if (state.selection.empty || state.selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos;
      if (!isValidPosition(pos)) return false;

      tr = tr.setSelection(NodeSelection.create(state.doc, pos));
      view.dispatch(tr);
      state = view.state;
    }

    const selection = state.selection;

    let chain = editor.chain().focus();

    // Handle NodeSelection
    if (selection instanceof NodeSelection) {
      const firstChild = selection.node.firstChild?.firstChild;
      const lastChild = selection.node.lastChild?.lastChild;

      const from = firstChild
        ? selection.from + firstChild.nodeSize
        : selection.from + 1;

      const to = lastChild
        ? selection.to - lastChild.nodeSize
        : selection.to - 1;

      const resolvedFrom = state.doc.resolve(from);
      const resolvedTo = state.doc.resolve(to);

      chain = chain
        .setTextSelection(TextSelection.between(resolvedFrom, resolvedTo))
        .clearNodes();
    }

    const toggle = editor.isActive("codeBlock")
      ? chain.setNode("paragraph")
      : chain.toggleNode("codeBlock", "paragraph");

    toggle.run();

    editor.chain().focus().selectTextblockEnd().run();

    return true;
  } catch {
    return false;
  }
};

export const useCodeBlock = ({
  hideWhenUnavailable = false,
  onExecute,
  onSuccess,
  onError,
}: UseCodeBlockConfig) => {
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

  const canToggle = checkCanToggle({ editor });

  const handleToggle = React.useCallback(() => {
    onExecute?.();

    const success = performToggle({ editor });

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
    handleToggle,
    canToggle,
  };
};

import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { useCurrentEditor } from "@tiptap/react";
import React from "react";

import {
  findNodePosition,
  isNodeInSchema,
  isNodeTypeSelected,
  isValidPosition,
  selectionWithinConvertibleTypes,
} from "~/components/shared/rich-text/utils";

import { useRichTextEditor } from "./use-tiptap-editor";

export const LIST_VARIANTS = ["bulletList", "orderedList", "taskList"] as const;

export type ListVariant = (typeof LIST_VARIANTS)[number];

export interface UseListConfig {
  hideWhenUnavailable?: boolean;
  onExecute?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

export const checkIsActive = ({
  editor,
  listVariant,
}: {
  editor: Editor | null;
  listVariant: ListVariant;
}): boolean => {
  if (!editor || !editor.isEditable) return false;

  switch (listVariant) {
    case "bulletList":
      return editor.isActive("bulletList");
    case "orderedList":
      return editor.isActive("orderedList");
    case "taskList":
      return editor.isActive("taskList");
    default:
      return false;
  }
};

export const checkShouldShow = ({
  editor,
  listVariant,
  hideWhenUnavailable = false,
}: {
  editor: Editor | null;
  listVariant: ListVariant;
  hideWhenUnavailable?: boolean;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema(listVariant, editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return checkCanToggle({ editor, listVariant });
  }

  return true;
};

export const checkCanToggle = ({
  editor,
  listVariant,
  turnInto = true,
}: {
  editor: Editor | null;
  listVariant: ListVariant;
  turnInto?: boolean;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (
    !isNodeInSchema(listVariant, editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false;

  if (!turnInto) {
    switch (listVariant) {
      case "bulletList":
        return editor.can().toggleBulletList();
      case "orderedList":
        return editor.can().toggleOrderedList();
      case "taskList":
        return editor.can().toggleList("taskList", "taskItem");
      default:
        return false;
    }
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

  // Either we can set list directly on the selection,
  // or we can clear formatting/nodes to arrive at a list.
  switch (listVariant) {
    case "bulletList":
      return editor.can().toggleBulletList() || editor.can().clearNodes();
    case "orderedList":
      return editor.can().toggleOrderedList() || editor.can().clearNodes();
    case "taskList":
      return (
        editor.can().toggleList("taskList", "taskItem") ||
        editor.can().clearNodes()
      );
    default:
      return false;
  }
};

export const performToggle = ({
  editor,
  listVariant,
}: {
  editor: Editor | null;
  listVariant: ListVariant;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (!checkCanToggle({ editor, listVariant })) return false;

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

    if (editor.isActive(listVariant)) {
      // Unwrap list
      chain
        .liftListItem("listItem")
        .lift("bulletList")
        .lift("orderedList")
        .lift("taskList")
        .run();
    } else {
      // Wrap in specific list type
      const toggleMap: Record<ListVariant, () => typeof chain> = {
        bulletList: () => chain.toggleBulletList(),
        orderedList: () => chain.toggleOrderedList(),
        taskList: () => chain.toggleList("taskList", "taskItem"),
      };

      const toggle = toggleMap[listVariant];
      if (!toggle) return false;

      toggle().run();
    }

    editor.chain().focus().selectTextblockEnd().run();

    return true;
  } catch {
    return false;
  }
};

export const useList = ({ hideWhenUnavailable = false }: UseListConfig) => {
  const { editor } = useCurrentEditor();
  const [isVisible, setIsVisible] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        LIST_VARIANTS.some((listVariant) =>
          checkShouldShow({ editor, hideWhenUnavailable, listVariant })
        )
      );
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, setIsVisible]);

  const isActive = LIST_VARIANTS.some((listVariant) =>
    checkIsActive({ editor, listVariant })
  );

  const activeOption = LIST_VARIANTS.find((listVariant) =>
    checkIsActive({ editor, listVariant })
  );

  const canToggle = LIST_VARIANTS.some((listVariant) =>
    checkCanToggle({ editor, listVariant })
  );

  return {
    isVisible,
    isActive,
    activeOption,
    canToggle,
  };
};

export const useListVariant = ({
  listVariant,
  hideWhenUnavailable = false,
  onExecute,
  onSuccess,
  onError,
}: UseListConfig & {
  listVariant: ListVariant;
}) => {
  const editor = useRichTextEditor();
  const [isVisible, setIsVisible] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        checkShouldShow({ editor, hideWhenUnavailable, listVariant })
      );
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, listVariant, setIsVisible]);

  const isActive = checkIsActive({ editor, listVariant });

  const canToggle = checkCanToggle({ editor, listVariant });

  const handleToggle = React.useCallback(() => {
    onExecute?.();

    const success = performToggle({ editor, listVariant });

    if (success) {
      onSuccess?.();
    } else {
      onError?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, listVariant]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
  };
};

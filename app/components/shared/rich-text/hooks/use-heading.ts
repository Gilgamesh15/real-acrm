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

export const LEVELS = [1, 2, 3, 4, 5] as const;

export type Level = (typeof LEVELS)[number];

export interface UseHeadingConfig {
  hideWhenUnavailable?: boolean;
  onExecute?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

export const checkIsActive = ({
  editor,
  level,
}: {
  editor: Editor | null;
  level: Level;
}): boolean => {
  if (!editor || !editor.isEditable) return false;

  return level
    ? editor.isActive("heading", { level })
    : editor.isActive("heading");
};

export const checkShouldShow = ({
  editor,
  level,
  hideWhenUnavailable = false,
}: {
  editor: Editor | null;
  level: Level;
  hideWhenUnavailable?: boolean;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema("heading", editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return checkCanToggle({ editor, level });
  }

  return true;
};

export const checkCanToggle = ({
  editor,
  level,
  turnInto = true,
}: {
  editor: Editor | null;
  level: Level;
  turnInto?: boolean;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  if (
    !isNodeInSchema("heading", editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false;

  if (!turnInto) {
    return level
      ? editor.can().setNode("heading", { level })
      : editor.can().setNode("heading");
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

  // Either we can set heading directly on the selection,
  // or we can clear formatting/nodes to arrive at a heading.
  return level
    ? editor.can().setNode("heading", { level }) || editor.can().clearNodes()
    : editor.can().setNode("heading") || editor.can().clearNodes();
};

export const performToggle = ({
  editor,
  level,
}: {
  editor: Editor | null;
  level: Level;
}): boolean => {
  if (!editor || !editor.isEditable) return false;
  const levels = Array.isArray(level) ? level : [level];
  const toggleLevel = levels.find((l) => checkCanToggle({ editor, level: l }));

  if (!toggleLevel) return false;

  try {
    const view = editor.view;
    let state = view.state;
    let tr = state.tr;

    // No selection, find the cursor position
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

    const isActive = levels.some((l) =>
      editor.isActive("heading", { level: l })
    );

    const toggle = isActive
      ? chain.setNode("paragraph")
      : chain.setNode("heading", { level: toggleLevel });

    toggle.run();

    editor.chain().focus().selectTextblockEnd().run();

    return true;
  } catch {
    return false;
  }
};

export const useHeading = ({
  hideWhenUnavailable = false,
}: UseHeadingConfig) => {
  const editor = useRichTextEditor();
  const [isVisible, setIsVisible] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        LEVELS.some((level) =>
          checkShouldShow({ editor, hideWhenUnavailable, level })
        )
      );
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, setIsVisible]);

  const isActive = LEVELS.some((level) => checkIsActive({ editor, level }));

  const activeOption = LEVELS.find((level) => checkIsActive({ editor, level }));

  const canToggle = LEVELS.some((level) => checkCanToggle({ editor, level }));

  return {
    isVisible,
    isActive,
    activeOption,
    canToggle,
  };
};

export const useHeadingLevel = ({
  level,
  hideWhenUnavailable = false,
  onExecute,
  onSuccess,
  onError,
}: UseHeadingConfig & {
  level: Level;
}) => {
  const { editor } = useCurrentEditor();
  const [isVisible, setIsVisible] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(checkShouldShow({ editor, hideWhenUnavailable, level }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, level, setIsVisible]);

  const isActive = checkIsActive({ editor, level });

  const canToggle = checkCanToggle({ editor, level });

  const handleToggle = React.useCallback(() => {
    onExecute?.();

    const success = performToggle({ editor, level });

    if (success) {
      onSuccess?.();
    } else {
      onError?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, level]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
  };
};
